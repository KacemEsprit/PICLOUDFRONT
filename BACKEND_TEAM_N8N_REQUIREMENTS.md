# MESSAGE FOR BACKEND TEAM: N8N Email Webhook Integration

## Objective
Add webhook functionality to send document approval events to n8n for email notifications.

---

## REQUIREMENTS

### What We Need
When a document is approved (status changes from PENDING to VALID), the backend must:
1. Make an HTTP POST request to an n8n webhook
2. Include user information in the payload (especially email)
3. Execute this asynchronously so approvals don't get delayed

### Acceptance Criteria
- ✓ Webhook is called when `POST /api/admin/documents/{id}/approve` succeeds
- ✓ Payload includes: documentId, userId, userEmail, userName, documentTypeName, status, approvalDate
- ✓ Webhook call is async (non-blocking)
- ✓ Errors in webhook don't break the approval process
- ✓ Webhook URL is configurable via `application.properties`

---

## IMPLEMENTATION GUIDE

### Step 1: Add Dependencies (if not already present)
```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

### Step 2: Configure RestTemplate Bean
```java
// In your Spring Boot configuration class
@Configuration
public class AppConfig {
    
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
```

### Step 3: Create Webhook Service
```java
@Service
public class DocumentWebhookService {
    
    private static final Logger logger = LoggerFactory.getLogger(DocumentWebhookService.class);
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Value("${n8n.webhook.document-approved}")
    private String webhookUrl;
    
    /**
     * Send document approval event to n8n webhook
     * Executed asynchronously to avoid blocking the approval process
     */
    @Async
    public void sendDocumentApprovedEvent(LegalDocument document, UserInfo user) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("documentId", document.getId());
            payload.put("documentTypeId", document.getDocumentType().getId());
            payload.put("documentTypeName", document.getDocumentType().getName());
            payload.put("userId", document.getUserId());
            payload.put("userEmail", user.getEmail()); // CRITICAL
            payload.put("userName", user.getFullName() != null ? user.getFullName() : user.getUsername());
            payload.put("status", "VALID");
            payload.put("approvalDate", Instant.now().toString());
            payload.put("documentUrl", document.getDocumentUrl());
            
            logger.info("Sending document approval webhook for document: {}", document.getId());
            
            restTemplate.postForObject(webhookUrl, payload, String.class);
            
            logger.info("Document approval webhook sent successfully for document: {}", document.getId());
            
        } catch (Exception e) {
            // Log error but don't throw - webhook failures shouldn't break approval
            logger.error("Failed to send document approval webhook for document {}: {}", 
                document.getId(), e.getMessage(), e);
        }
    }
}
```

### Step 4: Modify DocumentService/Controller
```java
@Service
public class DocumentService {
    
    @Autowired
    private DocumentWebhookService webhookService;
    
    @Autowired
    private UserRepository userRepository;
    
    public LegalDocument approveDocument(Long documentId) throws DocumentNotFoundException {
        // Find document
        LegalDocument document = documentRepository.findById(documentId)
            .orElseThrow(() -> new DocumentNotFoundException("Document not found"));
        
        // Get user info
        UserInfo user = userRepository.findById(document.getUserId())
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        
        // Update document status
        document.setStatus(DocumentStatusEnum.VALID);
        document.setApprovedDate(Instant.now()); // If you have this field
        LegalDocument savedDocument = documentRepository.save(document);
        
        // Send webhook asynchronously
        webhookService.sendDocumentApprovedEvent(savedDocument, user);
        
        // Return immediately without waiting for webhook
        return savedDocument;
    }
}
```

### Step 5: Add Configuration
```properties
# application.properties
# N8N Configuration
n8n.webhook.document-approved=https://your-n8n-instance.com/webhook/document-approved-workflow
n8n.webhook.timeout=5000

# Enable async processing
spring.task.execution.pool.core-size=2
spring.task.execution.pool.max-size=5
spring.task.execution.pool.queue-capacity=100
```

Or if using YAML:
```yaml
# application.yml
n8n:
  webhook:
    document-approved: https://your-n8n-instance.com/webhook/document-approved-workflow
    timeout: 5000

spring:
  task:
    execution:
      pool:
        core-size: 2
        max-size: 5
        queue-capacity: 100
```

### Step 6: Enable Async Support
```java
@SpringBootApplication
@EnableAsync  // ADD THIS ANNOTATION
public class PidevApplication {
    public static void main(String[] args) {
        SpringApplication.run(PidevApplication.class, args);
    }
}
```

### Step 7: Exception Handling (Optional but Recommended)
```java
@Service
public class DocumentWebhookService {
    
    // ... existing code ...
    
    private void handleWebhookException(LegalDocument document, Exception e) {
        // Option 1: Log with context
        logger.error("Webhook failed for document {}. Manual notification may be needed. Error: {}", 
            document.getId(), e.getMessage());
        
        // Option 2: Store failed webhook attempt for retry
        // webhookRetryRepository.save(new WebhookRetry(document.getId(), WebhookType.APPROVAL, e));
        
        // Option 3: Send to dead-letter queue/topic
        // webhookDeadLetterService.sendToQueue(document.getId());
    }
}
```

---

## TESTING

### Test 1: Unit Test
```java
@Test
public void testDocumentApprovalWebhook() {
    // Create test data
    LegalDocument doc = new LegalDocument();
    doc.setId(123L);
    
    UserInfo user = new UserInfo();
    user.setEmail("user@example.com");
    
    // Mock RestTemplate
    when(restTemplate.postForObject(any(), any(), any())).thenReturn("success");
    
    // Call method
    webhookService.sendDocumentApprovedEvent(doc, user);
    
    // Verify REST call was made
    verify(restTemplate).postForObject(contains("n8n"), any(), any());
}
```

### Test 2: Manual Testing
1. Make approval request: `POST /api/admin/documents/123/approve`
2. Monitor application logs for webhook messages
3. Check n8n webhook logs for incoming request
4. Verify email is received

---

## IN-FLIGHT PAYLOAD EXAMPLE

This is what will be sent to n8n:
```json
{
  "documentId": 42,
  "documentTypeId": 5,
  "documentTypeName": "Passport",
  "userId": 100,
  "userEmail": "john.doe@example.com",
  "userName": "John Doe",
  "status": "VALID",
  "approvalDate": "2024-04-16T14:30:00Z",
  "documentUrl": "uploads/2024/passport_john_doe.pdf"
}
```

---

## IMPORTANT NOTES

1. **User Email is Critical**: Ensure the user email field is always populated
2. **Async Execution**: The `@Async` annotation makes this non-blocking
3. **Error Tolerance**: Failed webhooks won't break the approval flow
4. **Performance**: Async means approvals return immediately
5. **Configuration**: Update the webhook URL after n8n workflow is created

---

## QUESTIONS FOR YOUR TEAM

- [ ] Do you have a UserInfo/User entity with email field?
- [ ] Can you confirm the current document approval endpoint location?
- [ ] Do you need retry logic for failed webhooks?
- [ ] Should webhook failures be logged to a separate audit table?
- [ ] Is RestTemplate already configured in your project?

---

## TIMELINE

- Implementation: ~2-3 hours (including testing)
- Deployment: After n8n workflow is ready
- Testing: Coordinate with frontend team

