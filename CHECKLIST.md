# Pre-Launch Checklist ✅

## Backend Verification (Spring Boot)
- [ ] Backend application is running on port 8081
- [ ] MySQL database is accessible at `localhost:3306`
- [ ] Database name is `PIDEV`
- [ ] Test login endpoint with Postman:
  ```
  POST http://localhost:8081/api/auth/login
  Body: {"username": "test", "password": "password"}
  Expected Response: 200 with JWT token
  ```
- [ ] Test register endpoint works

## Angular Dependencies
- [ ] Run `npm install` in project root (if not already done)
- [ ] All dependencies installed successfully
  ```bash
  npm install
  ```

## Frontend Files Verification
- [ ] AuthService exists at: `src/app/services/auth.service.ts`
- [ ] JwtInterceptor exists at: `src/app/services/jwt.interceptor.ts`
- [ ] AuthGuard exists at: `src/app/guards/auth.guard.ts`
- [ ] LoginComponent exists at: `src/app/components/login/`
- [ ] RegisterComponent exists at: `src/app/components/register/`
- [ ] AppModule imports all required modules and registers services
- [ ] AppRoutingModule includes login/register routes

## Testing the Application

### Step 1: Start the Application
```bash
npm start
```
Expected: Angular app loads on `http://localhost:4200`

### Step 2: Test Login Page
- [ ] Navigate to `http://localhost:4200/login`
- [ ] Login form displays correctly
- [ ] Form validation works (try submitting empty form)
- [ ] Enter valid credentials and submit
- [ ] If login succeeds:
  - [ ] Token is stored in localStorage
  - [ ] User info is stored in localStorage
  - [ ] Redirected to dashboard/home page
  - [ ] Navigation bar shows "Welcome [Name]" and "Logout" button

### Step 3: Test Protected API Calls
- [ ] After login, navigate to a page that calls backend API
- [ ] Open browser DevTools → Network tab
- [ ] Check that requests include `Authorization: Bearer {token}` header
- [ ] Backend returns 200 and data

### Step 4: Test Logout
- [ ] Click "Logout" button
- [ ] [ ] localStorage is cleared (`jwt_token` and `current_user` removed)
- [ ] Redirected to login page
- [ ] Navigation bar shows "Login" and "Register" links

### Step 5: Test Route Guards
- [ ] Try accessing protected route while not logged in
- [ ] Should redirect to login page
- [ ] After login, protected route is accessible

### Step 6: Test Token Expiry (Optional)
- [ ] Wait 24 hours, or modify token expiry for testing
- [ ] Expired token should cause 401 error
- [ ] User should be logged out automatically (future feature)

## Browser DevTools Verification

### LocalStorage Check
1. Open DevTools (F12)
2. Go to Application → Local Storage
3. Should see two keys:
   - `jwt_token`: Contains long JWT string
   - `current_user`: Contains JSON like: `{"id":1,"username":"test","email":"test@test.com","name":"Test User","role":"USER"}`

### Network Check
1. Open DevTools → Network tab
2. Make an API request
3. Click the request
4. Go to Request Headers
5. Should see: `Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...`

### Console Check
1. Open DevTools → Console
2. Run: `localStorage.getItem('jwt_token')`
3. Should return the JWT token (or null if not logged in)

## Troubleshooting

### Issue: "Cannot GET /login"
- **Cause**: Route not configured
- **Solution**: Check app-routing.module.ts has `{ path: 'login', component: LoginComponent }`

### Issue: "AuthService is not provided"
- **Cause**: Not registered in AppModule
- **Solution**: Check AppModule imports AuthService in providers

### Issue: 401 Unauthorized on API calls
- **Cause**: Token not being sent or is invalid
- **Solution**: 
  - Check JwtInterceptor is registered in AppModule
  - Check token exists in localStorage
  - Check token hasn't expired

### Issue: CORS Errors
- **Cause**: Backend CORS not configured
- **Solution**: Verify Spring Boot SecurityConfig has `@CrossOrigin(origins = "*")`

### Issue: Login button doesn't work
- **Cause**: Backend not running or wrong URL
- **Solutions**:
  - Verify backend running on port 8081
  - Check auth.service.ts has correct API URL
  - Check browser console for error message
  - Check Network tab for API response

## Default Test Credentials

Use these credentials to test login (create a user in backend first):

```
Username: test_user
Password: password123
Email: test@example.com
Name: Test User
Role: USER
CIN: 12345678
```

To create user via Postman:
```
POST http://localhost:8081/api/auth/register
Content-Type: application/json

{
  "username": "test_user",
  "password": "password123",
  "email": "test@example.com",
  "name": "Test User",
  "role": "USER",
  "CIN": 12345678,
  "photo": ""
}
```

## Performance Checks

- [ ] Login page loads in < 2 seconds
- [ ] API requests complete in < 5 seconds
- [ ] No console errors on initial load
- [ ] No memory leaks in DevTools
- [ ] Browser storage under 1MB

## Security Checks

- [ ] Token is only sent over HTTPS (in production)
- [ ] Sensitive data (passwords) not logged to console
- [ ] Backend validates token on every request
- [ ] CORS only allows expected origins (restrict from `*` in production)
- [ ] Routes properly protected with AuthGuard

## Documentation Checks

- [ ] AUTH_SETUP_GUIDE.md explains how to use
- [ ] IMPLEMENTATION_SUMMARY.md lists what was created
- [ ] Example components show usage patterns
- [ ] Code comments explain key parts

## Next Steps After Verification

1. **Create Dashboard Component**
   ```bash
   ng generate component dashboard
   ```
   Add to routing with `canActivate: [AuthGuard]`

2. **Create Profile Component**
   ```bash
   ng generate component profile
   ```

3. **Add More Protected Routes**
   Update app-routing.module.ts with your routes

4. **Call Your Backend APIs**
   ```typescript
   this.http.get('http://localhost:8081/api/your-endpoint')
   ```

5. **Customize Styling**
   Update component CSS files to match your design

## Production Deployment

Before deploying to production:

1. [ ] Change API URL to production backend
2. [ ] Enable HTTPS
3. [ ] Restrict CORS origins (not `*`)
4. [ ] Update token expiry if needed
5. [ ] Add refresh token logic
6. [ ] Set secure cookie flags (HttpOnly)
7. [ ] Test with multiple users
8. [ ] Load test the authentication flow

---

# Quick Terminal Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Visit in browser
http://localhost:4200

# Build for production
npm run build

# Run tests
npm test
```

---

# Success Indicators ✨

When everything is working correctly:
1. ✅ Start app → shows login page
2. ✅ Login with valid credentials → shows dashboard with user name
3. ✅ Click logout → redirects to login
4. ✅ Try accessing protected route while logged out → redirects to login
5. ✅ API calls include Authorization header
6. ✅ No errors in browser console

---

**Ready to test? Start with: `npm start`**

If you encounter any issues, check:
1. Backend is running (port 8081)
2. MySQL database exists
3. Browser console for errors
4. Network tab for failed requests
5. This checklist for solutions
