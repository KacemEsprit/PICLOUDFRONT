# N8N SETUP INSTRUCTIONS - Docker Setup (Free & Simple)

Easy setup using Docker - completely FREE, no time limits!

---

## PART A: SET UP N8N WITH DOCKER

### Prerequisites
- Docker installed on your computer: https://docs.docker.com/get-docker/

### Step 1: Run N8N in Docker

Open Terminal/PowerShell and run:

```bash
docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n
```

**What this does:**
- Downloads n8n image
- Starts n8n in a container
- Makes it accessible at `http://localhost:5678`
- Automatically cleans up when you stop it

### Step 2: Wait for Startup

You'll see messages like:
```
Starting n8n...
Listening on port 5678
```

This usually takes 30-60 seconds on first run.

### Step 3: Open N8N

1. Open your browser
2. Go to: `http://localhost:5678`
3. Complete the setup wizard (first-time only, takes 1 minute)
4. You're ready to create workflows!

### Keep the Terminal Running

Don't close the terminal window while using n8n. Keep it open in the background.

---

## 🎓 IMPORTANT: Keep Running During Your Project

- While working on the project: **Keep terminal/container running**
- When done for the day: Press `Ctrl+C` in terminal to stop
- When you need it again: Run the same docker command again

---

## PART B: CREATE EMAIL NOTIFICATION WORKFLOW

### Step 1: Create New Workflow
1. Click "New" button in top-left
2. Name it: "Document Approval Email"
3. Click "Create"

### Step 2: Add Webhook Node (Trigger)

1. Click the "+" icon in the canvas
2. Search for "Webhook"
3. Select "Webhook" node
4. Configure:
   - **Method:** POST
   - **Authentication:** None (keep default)
   - Click "Save"
5. **IMPORTANT:** Copy and save the Webhook URL - you'll give this to backend team

The URL will look like:
```
http://localhost:5678/webhook/abc123def456
```

**Important:** Copy this URL - you'll give it to the backend team!

### Step 3: Add Email Node (Gmail)

1. Click "+" to add new node after Webhook
2. Search for "Gmail"
3. Select "Gmail" node
4. Click "Connect a Gmail account"
5. Authenticate with your Gmail (your@gmail.com)
6. Configure email template:
   - **To:** `{{ $json.userEmail }}`
   - **Subject:** `Your Document Has Been Approved! 📄`
   - **Body (HTML selected):**

```html
<p>Dear {{ $json.userName }},</p>

<p>Great news! Your <strong>{{ $json.documentTypeName }}</strong> has been approved! ✅</p>

<p>
  <strong>Document Details:</strong><br>
  Document ID: {{ $json.documentId }}<br>
  Type: {{ $json.documentTypeName }}<br>
  Status: APPROVED<br>
  Approval Date: {{ $json.approvalDate }}
</p>

<p>You can now access your approved document in your account.</p>

<p>
  If you have any questions, please contact support.<br>
  <br>
  Best regards,<br>
  Admin Team
</p>
```

### Step 4: Gmail Setup

1. Go to https://myaccount.google.com/security
2. Turn ON "2-Step Verification" (if not already on)
3. Go to https://myaccount.google.com/apppasswords
4. Select "Mail" and "Windows Computer" (or your device)
5. Click "Generate"
6. Copy the 16-character password - you're done!

(N8N will automatically use this when you authenticated in Step 3)

### Step 5: Add Response Node

1. Click "+" to add new node after Email
2. Search for "HTTP Response"
3. Configure:
   - **Status Code:** 200
   - **Response Body:** `{ "success": true, "message": "Email sent successfully" }`

### Step 6: Test the Workflow

1. In the bottom panel, click "Test" or "Execute"
2. On the Webhook node, click the blue button "Execute"
3. Send this test data:

```json
{
  "documentId": 123,
  "documentTypeId": 5,
  "documentTypeName": "Passport",
  "userId": 456,
  "userEmail": "your-test-email@gmail.com",
  "userName": "John Doe",
  "status": "VALID",
  "approvalDate": "2024-04-16T10:30:00Z",
  "documentUrl": "uploads/test.pdf"
}
```

4. Check the Email node - you should see a success message
5. Check your email inbox - you should receive the test email!

### Step 7: Activate the Workflow

1. Click the "Activate" toggle in the top-right (turns it ON/green)
2. You should see: "Workflow is active"
3. Your webhook is now LIVE and ready to receive requests

---

## PART C: Get Webhook URL to Share with Backend Team

### Copy Your Webhook URL
1. Click on the Webhook node in n8n
2. The URL is shown at the top of the node config panel
3. It will look like: `http://localhost:5678/webhook/abc123def456`

### Share Webhook URL with Backend Team
Give them this URL to add to their `application.properties`:

```
n8n.webhook.document-approved=http://localhost:5678/webhook/YOUR_WEBHOOK_ID
```

Replace `YOUR_WEBHOOK_ID` with the actual ID from your webhook URL.

---

## PART D: VERIFY EVERYTHING WORKS

### Check Webhook Logs
1. Click on the Webhook node in n8n
2. In the node details panel (right side), look for a "Logs" section
3. After backend makes a request, you should see incoming requests here

### Manual Test (Before Backend Integration)
1. Use curl to test your webhook (or use Postman):

```bash
curl -X POST http://localhost:5678/webhook/YOUR_WEBHOOK_ID \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": 999,
    "userEmail": "your-email@gmail.com",
    "userName": "Test User",
    "documentTypeName": "Test Doc",
    "status": "VALID",
    "approvalDate": "2024-04-16T12:00:00Z"
  }'
```

2. Replace `YOUR_WEBHOOK_ID` with your actual ID
3. Replace `your-email@gmail.com` with your test email
4. Check n8n Executions tab to verify request was received
5. Check your email for the test email

---

## PART E: MONITOR & TROUBLESHOOT

### Monitor Workflow Execution
1. Click "Executions" tab in n8n
2. See all webhook triggers and their status
3. Green checkmark = success
4. Red X = failed

### If Emails Not Sending

**Check 1: Gmail Setup**
- Verify you completed the Gmail app password setup in Step 4
- Verify you authenticated the Gmail node with your account

**Check 2: Email Node Configuration**
- Click Email node
- Verify "To" field has: `{{ $json.userEmail }}`
- Verify credentials are correct

**Check 3: Test Email Separately**
- In n8n, add a new simple Gmail node
- Hardcode test recipient: your-email@gmail.com
- Click "Test" to verify email sending works

**Check 4: Check Webhook Logs**
- Click "Executions" tab to see all webhook requests
- Verify webhook is receiving data
- Look for errors in execution details

### If Backend Not Connecting to Webhook

**Check 1: Webhook is Active**
- Verify the "Activate" toggle in n8n is ON (green)
- If not active, click to activate the workflow

**Check 2: Docker is Still Running**
- Verify your terminal with Docker n8n is still open and running
- If closed, run: `docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n`

**Check 3: Backend URL Configuration**
- Verify backend has the correct webhook URL in `application.properties`
- Check backend logs to confirm webhook is being called
- Verify backend can reach localhost:5678 from where it's running

**Check 4: Test Locally First**
- Use curl command (see Part D) to test webhook works
- Fix any issues before testing from backend

---

## QUICK REFERENCE

### Workflow Structure
```
Webhook (incoming request)
    ↓
Email (send email)
    ↓
HTTP Response (return success)
```

### Test Data Format
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

### Webhook URL Format
`https://your-n8n-instance.com/webhook/[unique-id]`

---

## COMMON ISSUES & SOLUTIONS

| Issue | Solution |
|-------|----------|
| N8N won't start | Verify Docker is installed: `docker --version` |
| Can't access localhost:5678 | Verify docker command terminal is still running |
| Email not sending | Check Gmail app password is correct (Step 4) |
| Webhook getting 404 error | Copy exact URL from Webhook node in n8n |
| No workflow executions showing up | Click "Activate" toggle to turn on workflow |
| Variables show as undefined in email | Check JSON field names match test data exactly |
| Backend webhook call failing | Use curl test first to verify webhook works |

---

## NEXT STEPS

1. ✓ Run Docker with n8n
2. ✓ Create workflow with Webhook + Gmail + Response nodes
3. ✓ Test locally with curl
4. ✓ Share webhook URL with backend team
5. Wait for backend team to implement webhook in their code
6. ✓ Test end-to-end: Approve document → Email arrives
7. ✓ Done!

