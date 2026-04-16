# N8N Email Notification Integration Guide
## Send Emails When Documents Are Approved

---

## OVERVIEW
When an admin approves a document (status changes from PENDING to VALID), an automated email will be sent to the user.

**Flow:** Admin Approves Document → Backend Webhook Trigger → N8N Workflow → Email Sent to User

---

## PART 1: BACKEND CHANGES (REQUIRED)

Your backend team needs to implement webhook functionality. Here's what needs to be done:

### Step 1.1: Create a Webhook Event Handler
The `approveDocument()` endpoint needs to trigger an HTTP POST to n8n webhook.

**Backend Team: Add to Document Approval Logic**

When a document is approved (status changes to VALID), make an HTTP POST request to n8n:

```java
// In DocumentController or DocumentService when approving document
private RestTemplate restTemplate; // Inject RestTemplate

private String n8nWebhookUrl = "${n8n.webhook.document-approved}"; // Add to application.properties

public void triggerDocumentApprovalWebhook(LegalDocument document, UserInfo user) {
    try {
        Map<String, Object> payload = new HashMap<>();
        payload.put("documentId", document.getId());
        payload.put("documentTypeId", document.getDocumentType().getId());
        payload.put("documentTypeName", document.getDocumentType().getName());
        payload.put("userId", document.getUserId());
        payload.put("userEmail", user.getEmail()); // CRITICAL: Must add user email
        payload.put("userName", user.getName());
        payload.put("status", "VALID");
        payload.put("approvalDate", Instant.now().toString());
        payload.put("documentUrl", document.getDocumentUrl());
        
        restTemplate.postForObject(n8nWebhookUrl, payload, String.class);
    } catch (Exception e) {
        // Log error but don't fail the approval - webhook is async
        logger.error("Failed to trigger n8n webhook", e);
    }
}

// Call this method in approveDocument() after successful approval
```

### Step 1.2: Add Configuration
```properties
# application.properties or application.yml
n8n.webhook.document-approved=https://your-n8n-instance.com/webhook/document-approved
n8n.webhook.timeout=5000
```

### Step 1.3: Make the REST Call Async (Recommended)
Wrap webhook call in a separate thread so approval isn't delayed:

```java
@Async
public void triggerDocumentApprovalWebhookAsync(LegalDocument document, UserInfo user) {
    triggerDocumentApprovalWebhook(document, user);
}

// In approveDocument() method:
// ... approve the document ...
documentApprovalService.triggerDocumentApprovalWebhookAsync(document, currentUser);
```

### Step 1.4: Ensure User Email is Accessible
**CRITICAL:** The webhook payload MUST include the user's email address. Make sure:
- User entity has `email` field
- Email is included in the webhook payload (see payload above)

### Step 1.5: Add Error Logging
Implement proper logging for webhook failures to help debug issues:

```java
private static final Logger logger = LoggerFactory.getLogger(DocumentService.class);

// In catch block:
logger.error("Failed to trigger n8n webhook for document {}: {}", 
    document.getId(), e.getMessage());
```

---

## PART 2: N8N WORKFLOW SETUP (EXTERNAL - YOU DO THIS)

### Step 2.1: Set Up N8N with Docker
```bash
docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n
```

Access at: `http://localhost:5678`

Keep this terminal running while you use n8n.
```

### Step 2.2: Create a New Workflow

1. **Click "New" in n8n dashboard**
2. **Add Webhook Node:**
   - Node: "Webhook"
   - Method: POST
   - Authentication: None
   - Copy the Webhook URL

3. **Add Email Node (Gmail):**
   - **Node:** Gmail
   - **To:** `{{ $json.userEmail }}`
   - **Subject:** `Document Approved: {{ $json.documentTypeName }}`
   - **Body (HTML):**

```html
<p>Dear {{ $json.userName }},</p>

<p>Your <strong>{{ $json.documentTypeName }}</strong> document has been approved!</p>

<p><strong>Details:</strong></p>
<ul>
  <li>Document ID: {{ $json.documentId }}</li>
  <li>Status: APPROVED (VALID)</li>
  <li>Approval Date: {{ $json.approvalDate }}</li>
</ul>

<p>You can now access your approved document in your account.</p>

<p>Best regards,<br>
The Admin Team</p>
```

4. **Add Response Node (after Email):**
   - Response: `{ "success": true, "message": "Email sent" }`

### Step 2.3: Configure Gmail

1. Click on Gmail node
2. Click "Connect a Gmail account"
3. Authenticate with your Gmail
4. Go to https://myaccount.google.com/apppasswords
5. Create app password (select Mail + your device)
6. Use this password if prompted

### Step 2.4: Test the Workflow
1. Click "Test Workflow"
2. Send sample data:
```json
{
  "documentId": 123,
  "documentTypeId": 5,
  "documentTypeName": "Passport",
  "userId": 456,
  "userEmail": "user@example.com",
  "userName": "John Doe",
  "status": "VALID",
  "approvalDate": "2024-04-16T10:30:00Z"
}
```
3. Verify email is sent

### Step 2.5: Activate the Workflow
1. Click "Activate" to turn on the workflow
2. The webhook is now live and ready to receive requests

### Step 2.6: Get Webhook URL for Backend
In n8n workflow, the Webhook node shows the full URL:
- Format: `http://localhost:5678/webhook/[id]`
- Add this to backend `application.properties` as: `n8n.webhook.document-approved=YOUR_WEBHOOK_URL`

---

## PART 3: FRONTEND INTEGRATION (VERIFY/ENHANCE)

### Step 3.1: Current Status
Your frontend approval flow already works:
- ✓ Admin clicks "Approve" button
- ✓ Calls `documentService.approveDocument(documentId)`
- ✓ API: `POST /api/admin/documents/{id}/approve`
- ✓ Shows success toast

### Step 3.2: (Optional) Add Confirmation with Webhook Status
If you want real-time confirmation that email was sent:

```typescript
// In admin-document-list.component.ts approveDocument() method
approveDocument(documentId: number): void {
  const document = this.selectedDocument;

  if (!document) {
    this.toastService.error('Error', 'Document not found');
    return;
  }

  const approvalRequest = document.status === 'REJECTED'
    ? this.documentService.toggleDocumentStatus(documentId)
    : this.documentService.approveDocument(documentId);

  approvalRequest
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (updatedDoc) => {
        const statusMsg = updatedDoc.status === 'VALID' ? 'approved' : 'toggled to approved';
        // ✓ CURRENT: Success message
        this.toastService.success('Success', `Document ${statusMsg} successfully`);
        
        // + NEW (OPTIONAL): Show that email is being sent
        this.toastService.info('Info', 'Email notification is being sent to user...');
        
        // Update the document in the list
        const index = this.documents.findIndex(d => d.id === documentId);
        if (index !== -1) {
          this.documents[index] = updatedDoc;
        }
        // Update selected document if it's opened in modal
        if (this.selectedDocument?.id === documentId) {
          this.selectedDocument = updatedDoc;
        }
      },
      error: (err) => {
        this.toastService.error('Error', err.message || 'Failed to approve document');
      }
    });
}
```

---

## COMPLETE END-TO-END FLOW

```
1. Admin Dashboard (Angular Frontend)
   ↓
2. Admin clicks "Approve" button on document
   ↓
3. approveDocument() method called
   ↓
4. HTTP POST → Backend /api/admin/documents/{id}/approve
   ↓
5. Backend:
   - Updates document status: PENDING → VALID
   - Retrieves user information (email, name)
   - Makes async HTTP POST to n8n webhook
   - Returns success response to frontend
   ↓
6. Frontend receives response
   - Shows success toast
   - Updates document list
   ↓
7. N8N Webhook receives payload
   ↓
8. N8N Workflow:
   - Receives webhook data
   - (Optional) Fetches additional user info from backend
   - Prepares email content
   - Sends email via Gmail/SendGrid/SMTP
   ↓
9. User receives email notification
   ✓ "Your document has been approved!"
```

---

## TESTING CHECKLIST

- [ ] Backend team implements webhook trigger
- [ ] N8N instance is running and accessible
- [ ] N8N webhook URL is configured in backend
- [ ] Test approve a document in admin panel
- [ ] Verify webhook logs in n8n show incoming request
- [ ] Verify email is received by user
- [ ] Test with multiple documents
- [ ] Test with multiple users
- [ ] Verify email contains correct user details
- [ ] Add error handling in backend for failed webhooks

---

## TROUBLESHOOTING

### Backend to N8N Connection Issues
- Check firewall: Is backend able to reach n8n URL?
- Check logs: Does webhook trigger show errors?
- Test webhook manually: Use Postman to POST to n8n webhook URL
- Verify n8n workflow is activated (toggle on)

### Emails Not Sending
- Check n8n logs: Are requests being received?
- Verify email service credentials (Gmail app password, SendGrid key, SMTP settings)
- Check email node configuration in n8n
- Test email node separately in n8n

### User Email Missing
- Verify user record has email field in database
- Ensure email is included in webhook payload from backend
- Check API endpoint that retrieves user info works

### Webhook Not Triggered
- Verify REST call is being made (check backend logs)
- Confirm n8n webhook URL is correct in application.properties
- Check for SSL certificate issues if using HTTPS
- Verify firewall rules allow outbound HTTP/HTTPS

---

## SECURITY NOTES

1. **Validate Webhook Signature (Optional but Recommended):**
   - Add HMAC signature validation to webhook
   - Only accept requests from verified sources

2. **Rate Limiting:**
   - Implement rate limiting on webhook if receiving many requests

3. **Email Service Security:**
   - Use App Passwords (not main password) for Gmail
   - Use API keys for SendGrid, not credentials
   - Store secrets in environment variables

4. **User Data Protection:**
   - Ensure user email is not logged unnecessarily
   - Use encrypted connections (HTTPS/TLS)

---

## NEXT STEPS

1. **Pass this to backend team** - They implement webhook trigger
2. **Prepare n8n instance** - Set up n8n if not already running
3. **Create webhook workflow** - Follow steps in PART 2
4. **Configure email service** - Set up Gmail/SendGrid
5. **Test end-to-end** - Use testing checklist above
6. **Deploy to production** - Activate workflow and test again

