# 🚀 N8N EMAIL INTEGRATION - QUICK REFERENCE CARD

Print this page and keep it handy!

---

## � University Project - Perfect Fit!
**Setup:** 1-2 hours | **Cost:** FREE (Forever with Docker) | **Duration Support:** Unlimited

Docker is FREE forever - perfect for your 1-month university project!
(n8n.cloud only offers 2-week free trial)

---

## �🎯 THE GOAL IN ONE SENTENCE
**When an admin approves a document, automatically send the user an email notification.**

---

## 3 SIMPLE STEPS

### STEP 1: Create N8N Workflow (You - 30 min)
**✅ FOR UNIVERSITY PROJECT: Use Docker (completely FREE, forever)**

```
1. Install Docker (if not already)
2. Run: docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n
3. Open: http://localhost:5678
4. Complete setup wizard
5. Create new workflow
6. Add Webhook node (copy URL) ⭐
7. Add Email node (Gmail)
8. Add Response node
9. Test with sample data
✓ Done! You have a webhook URL
```

**Get Webhook URL from:** Webhook node in n8n
**Share with:** Backend team
**Valid for:** Unlimited (no trial expiration)

---

### STEP 2: Backend Implementation (Backend Team - 3 hours)
```
What they need to do:
1. Create DocumentWebhookService class
2. Add webhook trigger to approveDocument()
3. Make it async (@Async annotation)
4. Configure webhook URL in application.properties
5. Deploy and test

What you provide:
- N8N webhook URL (from Step 1)
- `BACKEND_TEAM_N8N_REQUIREMENTS.md` file
```

---

### STEP 3: Test End-to-End (You & Backend Team - 1 hour)
```
1. Admin approves a test document
2. ✓ Document status changes to VALID
3. ✓ Email received in user inbox
4. ✓ All details correct in email

If email not received:
→ Check n8n logs (did webhook trigger?)
→ Check backend logs (was webhook called?)
→ Check Gmail app password is correct
```

---

## 📊 WHAT HAPPENS BEHIND THE SCENES

```
Admin clicks "Approve"
         ↓
Backend updates status: PENDING → VALID
         ↓
Backend calls n8n webhook (async)
         ↓
Admin sees success immediately ✓
         ↓
N8N receives the request
         ↓
N8N sends email to user
         ↓
User receives email notification ✓
```

**Total time from approve to email: 5-10 seconds**

---

## 📁 DOCUMENTATION FILES

| File | Purpose | Read First |
|------|---------|-----------|
| **QUICKSTART_SUMMARY.md** | Overview | ✓ START HERE |
| **N8N_EXTERNAL_SETUP.md** | N8N setup details | ✓ Then read this |
| **BACKEND_TEAM_N8N_REQUIREMENTS.md** | Backend requirements | Give to backend team |
| **N8N_EMAIL_INTEGRATION_GUIDE.md** | Complete guide | Reference |
| **FRONTEND_ENHANCEMENT_OPTIONAL.md** | Optional UX improvements | Optional |
| **IMPLEMENTATION_CHECKLIST.md** | Progress tracking | Track as you go |

---

## 🔧 TECHNICAL SUMMARY

### Frontend (Angular)
- ✓ Already has approval UI
- ✓ Already calls approve endpoint
- Optional: Add email status toast

### Backend (Spring Boot)
- 🆕 Add `DocumentWebhookService`
- 🆕 Call webhook in `approveDocument()`
- 🆕 Add config for webhook URL

### N8N (External)
- 🆕 Webhook receiver
- 🆕 Email sender
- 🆕 Response node

### Email Service
- 🆕 Gmail (easiest, free with app password)

---

## ✅ CHECKLIST - WHAT YOU DO

**Your Tasks:**
- [ ] Read `QUICKSTART_SUMMARY.md`
- [ ] Read `N8N_EXTERNAL_SETUP.md`
- [ ] Create N8N account
- [ ] Create webhook workflow
- [ ] Get webhook URL
- [ ] Share webhook URL with backend team
- [ ] Share `BACKEND_TEAM_N8N_REQUIREMENTS.md` with backend team
- [ ] Wait for backend implementation
- [ ] Test end-to-end
- [ ] Celebrate! 🎉

---

## 🎁 EMAIL TEMPLATE YOUR USERS WILL RECEIVE

```
Subject: Your Document Has Been Approved! 📄

Dear John Doe,

Great news! Your Passport has been approved! ✅

Details:
- Document ID: 42
- Type: Passport
- Status: APPROVED
- Approval Date: April 16, 2024

You can now access your approved document in your account.

Best regards,
Admin Team
```

---

## 🆘 QUICK TROUBLESHOOTING

**Email not received?**
1. Check n8n logs (did webhook arrive?)
2. Check email credentials (correct password/key?)
3. Check user email in payload (user@correct.com?)
4. Check spam folder

**Webhook not triggered?**
1. Check backend logs (was webhook called?)
2. Check n8n URL in application.properties
3. Test manually with Postman/curl
4. Verify n8n instance is up

**Document approval failing?**
- Check backend error logs
- This SHOULDN'T happen (webhook is async)

---

## 📞 KEY CONTACTS

**Backend Team Lead:** _________________________ Phone: _________________

**N8N Admin:** _________________________ Phone: _________________

---

## ⏱️ ESTIMATED TIMELINE

- **Today:** Read docs, start N8N setup (30 min)
- **Tomorrow:** N8N workflow ready, share webhook URL
- **Days 2-3:** Backend team implements (3 hours work)
- **Day 4:** Testing and fixes
- **Day 5:** Production deployment
- **Day 6:** Live - users get emails! 🎉

---

## 🔐 SECURITY REMINDERS

1. **Don't share passwords:** Use Gmail app passwords only (not main account password)
2. **Secure webhook:** Only backend can call your n8n webhook
3. **Validate data:** Backend should validate email before sending
4. **Log appropriately:** Don't log sensitive data like passwords

---

## 📈 NEXT STEPS

1. **Read:** `QUICKSTART_SUMMARY.md` (15 min)
2. **Setup:** Follow `N8N_EXTERNAL_SETUP.md` (30 min)
3. **Test:** Send test webhook with Postman
4. **Share:** Give backend team webhook URL + requirements doc
5. **Wait:** Backend implements (3 hours)
6. **Verify:** Test end-to-end
7. **Deploy:** Go live! 🚀

---

## 💡 BONUS FEATURES (FUTURE)

Once this works, you can add:
- Rejection email notifications
- Update request emails
- Document expiry warning emails
- Multiple email templates
- Email history/logging

---

**You've got this! 💪**

Questions? Review the detailed documentation files.

