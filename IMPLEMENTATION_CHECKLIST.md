# ✅ N8N EMAIL INTEGRATION - IMPLEMENTATION CHECKLIST

Use this checklist to track your progress through the entire integration.

---

## PHASE 1: N8N SETUP (Your Responsibility)

### 1.1: Install and Run Docker
- [ ] Install Docker: https://docs.docker.com/get-docker/
- [ ] Open terminal/PowerShell
- [ ] Run: `docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n`
- [ ] Wait for startup (takes 30-60 seconds)
- [ ] Open browser: http://localhost:5678
- [ ] Complete setup wizard (takes 1-2 minutes)
- [ ] **Status:** N8N running locally ✅

### 1.2: Create Webhook Workflow
- [ ] Click "New" workflow
- [ ] Name it: "Document Approval Email"
- [ ] Add Webhook node
  - [ ] Method: POST
  - [ ] Authentication: None
  - [ ] **Copy webhook URL** ⭐ (SAVE THIS!)
  - [ ] Webhook URL: `_________________________________`
- [ ] **Status:** Webhook node created

### 1.3: Configure Gmail
- [ ] Go to https://myaccount.google.com/security
- [ ] Enable 2-Step Verification (if not on)
- [ ] Go to https://myaccount.google.com/apppasswords
- [ ] Generate app password (Mail + your device)
- [ ] Copy the 16-char password
- [ ] Add Gmail node in n8n
- [ ] Authenticate with your Gmail account
- [ ] **Status:** Gmail configured

### 1.4: Add Email Template
- [ ] Configure Gmail node:
  - [ ] **To:** `{{ $json.userEmail }}`
  - [ ] **Subject:** `Document Approved: {{ $json.documentTypeName }}`
  - [ ] **Body:** Use provided HTML template
- [ ] **Status:** Email template set

### 1.5: Add Response Node
- [ ] Add HTTP Response node after Email
- [ ] Set status: 200
- [ ] Set body: `{ "success": true, "message": "Email sent" }`
- [ ] **Status:** Response node ready

### 1.6: Test N8N Workflow
- [ ] Send test webhook payload using curl:
```bash
curl -X POST http://localhost:5678/webhook/YOUR_ID \
  -H "Content-Type: application/json" \
  -d '{"documentId": 123, "userEmail": "test@gmail.com", ...}'
```
- [ ] Check n8n Executions tab
- [ ] **Verify:** Test email received in inbox ✓
- [ ] **Status:** N8N workflow working

### 1.7: Activate Workflow
- [ ] Click "Activate" toggle (turns green)
- [ ] Confirm: "Workflow is active"
- [ ] **Status:** Webhook is live ✅

### 1.8: Prepare for Backend
- [ ] Copy webhook URL: `_________________________________`
- [ ] Keep Docker terminal running
- [ ] Share webhook URL with backend team
- [ ] **Status:** Ready to hand off to backend ✅

---

## PHASE 2: BACKEND IMPLEMENTATION (Backend Team)

**You don't do this, but track their progress:**

### 2.1: Backend Setup
- [ ] Backend team has received requirement document
- [ ] Team has reviewed `BACKEND_TEAM_N8N_REQUIREMENTS.md`
- [ ] Team confirms they have RestTemplate configured
- [ ] **Status:** Backend team ready

### 2.2: Implementation
- [ ] Team creates `DocumentWebhookService` class
- [ ] Team adds webhook trigger to `approveDocument()` method
- [ ] Team adds `@Async` support to main class
- [ ] Team configures `application.properties` with webhook URL
- [ ] **Status:** Code changes complete

### 2.3: Testing by Backend Team
- [ ] Team tests webhook locally
- [ ] Team verifies async execution (approval doesn't block)
- [ ] Team checks logs for webhook trigger
- [ ] Team verifies error handling
- [ ] **Status:** Backend testing complete

### 2.4: Deployment
- [ ] Backend deployed to test environment
- [ ] Backend deployed to production
- [ ] **Status:** Backend live

---

## PHASE 3: END-TO-END TESTING

### 3.1: Prepare Testing
- [ ] Create test user account with email
- [ ] Have admin account ready
- [ ] Have test document ready for approval
- [ ] Check n8n dashboard is accessible
- [ ] Check backend logs are accessible
- [ ] **Status:** Test environment ready

### 3.2: First Test
- [ ] Admin logs into dashboard
- [ ] Admin views pending documents
- [ ] Admin selects a test document
- [ ] Admin clicks "Approve" button
- [ ] Frontend shows success toast ✓
- [ ] Document status changes to VALID ✓
- [ ] **Status:** Frontend part working

### 3.3: Backend Verification
- [ ] Check backend logs for webhook trigger ✓
- [ ] Verify webhook was called successfully
- [ ] Check for any errors in logs
- [ ] **Status:** Backend webhook triggered

### 3.4: N8N Verification
- [ ] Check n8n Executions tab
- [ ] Verify webhook received the request ✓
- [ ] Check execution details for any errors
- [ ] Verify email node was executed
- [ ] **Status:** N8N received and processed request

### 3.5: Email Verification
- [ ] Check user's email inbox
- [ ] **Verify email received:** ✓
- [ ] Check email subject is correct
- [ ] Check email content/template is correct
- [ ] Check for all expected variables (name, doc type, ID, date)
- [ ] Verify email is readable and formatted properly
- [ ] Check it's not in spam folder
- [ ] **Status:** Email received and formatted correctly

### 3.6: Repeat Tests
- [ ] Approve 3 more test documents
- [ ] Each time:
  - [ ] Check frontend success
  - [ ] Check backend logs
  - [ ] Check n8n logs
  - [ ] Check user inbox
- [ ] All tests pass ✓
- [ ] **Status:** Multiple approvals working

### 3.7: Edge Case Testing
- [ ] Approve document with special characters in name
- [ ] Approve document with long names
- [ ] Test with different user accounts
- [ ] Test approval on different days/times
- [ ] **Status:** Edge cases handled

### 3.8: Error Handling Testing
- [ ] Temporarily stop n8n
- [ ] Try to approve document
- [ ] Verify approval still works (webhook is async)
- [ ] Turn n8n back on
- [ ] Test email sending resumes
- [ ] **Status:** Error handling verified

---

## PHASE 4: OPTIONAL FRONTEND ENHANCEMENTS

### 4.1: Add Email Status Toast (Optional)
- [ ] Review `FRONTEND_ENHANCEMENT_OPTIONAL.md`
- [ ] Update `admin-document-list.component.ts`
- [ ] Add info toast after approval
- [ ] Test in browser
- [ ] Verify both toasts show
- [ ] **Status:** Enhancement implemented (optional)

### 4.2: Test Enhancement
- [ ] Approve document
- [ ] Verify 2 toasts show (Success + Info)
- [ ] Verify toasts show in correct order
- [ ] **Status:** Enhancement working (optional)

---

## PHASE 5: PRODUCTION DEPLOYMENT

### 5.1: Pre-Production Checklist
- [ ] All tests passing in test environment
- [ ] Documentation reviewed
- [ ] Backend team confirms code ready
- [ ] N8N workflow is stable
- [ ] Email service credentials are correct
- [ ] Error handling is in place
- [ ] Logging is comprehensive

### 5.2: Production Deployment Plan
- [ ] Schedule deployment window (off-hours)
- [ ] Notify team of changes
- [ ] Deploy backend code
- [ ] Verify webhook URL updated in backend config
- [ ] Verify n8n webhook is live
- [ ] Deploy frontend changes (if any)
- [ ] Verify all systems are up

### 5.3: Production Testing
- [ ] Conduct smoke test
- [ ] Approve test document in production
- [ ] Verify email received
- [ ] Monitor logs for errors
- [ ] **Status:** Production live ✓

### 5.4: Monitoring
- [ ] Set up alerting for webhook failures
- [ ] Monitor n8n execution logs regularly
- [ ] Check email delivery rates
- [ ] Document any issues

---

## PHASE 6: ROLLOUT & COMMS

### 6.1: Communication
- [ ] Notify admins of new email feature
- [ ] Provide documentation to users
- [ ] Set up help desk guidance
- [ ] Monitor user feedback

### 6.2: Success Criteria
- [ ] ✅ Admin approves document
- [ ] ✅ User receives email within 5-10 seconds
- [ ] ✅ No errors in logs
- [ ] ✅ Email content is correct
- [ ] ✅ Works consistently
- [ ] ✅ No performance impact

### 6.3: Go Live Confirmation
- [ ] All tests passing
- [ ] Stakeholders notified
- [ ] Users notified
- [ ] **Status:** LIVE ✅

---

## TROUBLESHOOTING ISSUES ENCOUNTERED

Track any issues and resolutions:

| Issue | Date Found | Root Cause | Resolution | Status |
|-------|----------|-----------|-----------|--------|
| Example: Emails not sending | --- | --- | --- | --- |
| | | | | |
| | | | | |
| | | | | |

---

## TIMELINE TRACKING

| Task | Planned Date | Actual Start | Actual Completion | Status |
|------|-------------|--------------|-------------------|--------|
| N8N Setup | | | | |
| Backend Implementation | | | | |
| Testing | | | | |
| Production Deployment | | | | |
| Production Verification | | | | |
| **🎉 LAUNCH** | | | | |

---

## CONTACT INFO

### Key Contacts
- **Backend Team Lead:** Name: _____________ Email: _____________ Phone: _____________
- **N8N Admin:** Name: _____________ Email: _____________ Phone: _____________
- **Frontend Lead:** Name: _____________ Email: _____________ Phone: _____________
- **DevOps/Infrastructure:** Name: _____________ Email: _____________ Phone: _____________

---

## IMPORTANT NOTES

1. **Webhook URL (from N8N):** `_________________________________________________`
   - Save this! You'll need it multiple times

2. **Backend Webhook Configuration:** `n8n.webhook.document-approved=<URL>`

3. **Email Service Credentials:** Store securely (app passwords, API keys)

4. **Key People:** Identify backend team member for integration

5. **Testing Window:** Schedule dedicated time for Phase 3 testing

---

## ✅ FINAL SIGN-OFF

When everything is complete, sign off:

- [ ] Frontend Developer: _________________ Date: _________
- [ ] Backend Team Lead: _________________ Date: _________
- [ ] DevOps/Infrastructure: _________________ Date: _________
- [ ] Project Manager: _________________ Date: _________

**🎉 INTEGRATION COMPLETE!**

Users now receive emails when their documents are approved!

---

