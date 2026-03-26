# JWT Auth Quick Reference Card

## 🚀 Start Here
```bash
npm start
# Then visit: http://localhost:4200
```

---

## 📋 Core Components

| Component | Purpose | Location |
|-----------|---------|----------|
| **AuthService** | Login, register, logout, token management | `src/app/services/auth.service.ts` |
| **JwtInterceptor** | Auto-adds auth header to requests | `src/app/services/jwt.interceptor.ts` |
| **AuthGuard** | Protects routes from unauthorized access | `src/app/guards/auth.guard.ts` |
| **LoginComponent** | User login form | `src/app/components/login/` |
| **RegisterComponent** | User registration form | `src/app/components/register/` |

---

## 🔌 Backend Info

| Setting | Value |
|---------|-------|
| **Server URL** | `http://localhost:8081` |
| **Login Endpoint** | `POST /api/auth/login` |
| **Register Endpoint** | `POST /api/auth/register` |
| **Token Format** | `Authorization: Bearer {token}` |
| **Expiry Time** | 24 hours |

---

## 📝 Login Payload
```json
{
  "username": "string",
  "password": "string"
}
```

## 📥 Login Response
```json
{
  "token": "eyJhbGc...",
  "id": 1,
  "username": "john",
  "email": "john@example.com",
  "name": "John Doe",
  "role": "USER"
}
```

---

## 💾 LocalStorage Keys
```javascript
localStorage.getItem('jwt_token')      // JWT token
localStorage.getItem('current_user')   // User object as JSON
```

---

## 🔐 Basic Usage Examples

### Get Current User
```typescript
import { AuthService } from './services/auth.service';

export class MyComponent {
  currentUser$ = this.authService.currentUser$;
  
  constructor(private authService: AuthService) {}
}

// In template: {{ (currentUser$ | async)?.name }}
```

### Check If Authenticated
```typescript
isAuthenticated$ = this.authService.isAuthenticated$;

// In template: <div *ngIf="isAuthenticated$ | async">...</div>
```

### Protect Routes
```typescript
// app-routing.module.ts
{ 
  path: 'dashboard', 
  component: DashboardComponent,
  canActivate: [AuthGuard]  // ← This protects it!
}
```

### Call Protected API
```typescript
// Token automatically added by JwtInterceptor
this.http.get('http://localhost:8081/api/data')
  .subscribe(data => console.log(data));
```

### Manual Logout
```typescript
this.authService.logout();
this.router.navigate(['/login']);
```

---

## 🧪 Testing Endpoints

### Test Login with Postman
```
POST http://localhost:8081/api/auth/login
Content-Type: application/json

{
  "username": "your_username",
  "password": "your_password"
}
```

### Test Protected Endpoint
```
GET http://localhost:8081/api/protected-endpoint
Authorization: Bearer {token_from_login}
```

---

## 🚦 Authentication Flow Diagram

```
User Login Form
      ↓
 AuthService.login()
      ↓
Backend validates credentials
      ↓
Backend returns JWT token + user info
      ↓
AuthService stores token in localStorage
      ↓
User redirected to dashboard
      ↓
Navigation shows "Welcome {Name}" + Logout button
```

---

## 🔄 Protected API Call Flow

```
Component calls HTTP API
      ↓
JwtInterceptor intercepts request
      ↓
Adds Authorization: Bearer {token} header
      ↓
Request sent to backend
      ↓
Backend JwtAuthFilter validates token
      ↓
If valid → process request
If invalid → return 401 Unauthorized
```

---

## 🛠️ Common Tasks

### Create New Protected Route
```typescript
// 1. Generate component
ng generate component my-page

// 2. Add to routing with guard
{ path: 'my-page', component: MyPageComponent, canActivate: [AuthGuard] }

// 3. Use auth in component
constructor(private authService: AuthService) {}
```

### Get User ID
```typescript
const userId = this.authService.currentUserValue?.id;
```

### Check User Role
```typescript
const role = this.authService.currentUserValue?.role;
if (role === 'ADMIN') { /* do admin stuff */ }
```

### Clear Auth on Error
```typescript
error: (err) => {
  if (err.status === 401) {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
```

---

## ⚠️ Common Issues & Fixes

| Problem | Solution |
|---------|----------|
| 401 Unauthorized | Token expired or invalid. Logout & login again |
| CORS Error | Ensure backend running on port 8081 |
| "Auth service undefined" | Check AppModule provides AuthService |
| Token not sent in headers | Check JwtInterceptor registered in AppModule |
| Can access protected page when logged out | Check AuthGuard applied to route |
| Login doesn't work | Verify credentials correct, backend running |

---

## 📦 Files Created

```
src/app/
├── services/
│   ├── auth.service.ts
│   └── jwt.interceptor.ts
├── guards/
│   └── auth.guard.ts
├── components/
│   ├── login/
│   │   ├── login.component.ts
│   │   ├── login.component.html
│   │   └── login.component.css
│   ├── register/
│   │   ├── register.component.ts
│   │   ├── register.component.html
│   │   └── register.component.css
│   └── dashboard-example/
│       └── dashboard-example.component.ts
├── app.module.ts (UPDATED)
└── app-routing.module.ts (UPDATED)

Root/
├── AUTH_SETUP_GUIDE.md
├── IMPLEMENTATION_SUMMARY.md
├── CHECKLIST.md
└── QUICK_REFERENCE.md (this file)
```

---

## 🎯 Next Steps (In Order)

1. **Test Login**
   - Start app: `npm start`
   - Go to: http://localhost:4200/login
   - Login with valid credentials

2. **Test Logout**
   - Click Logout button
   - Should redirect to login

3. **Create Dashboard**
   - `ng generate component dashboard`
   - Add to routing with AuthGuard

4. **Call Backend APIs**
   - Component calls: `this.http.get(...)`
   - Token auto-added by interceptor

5. **Add More Routes**
   - Create components
   - Add to routing with AuthGuard

---

## 💡 Pro Tips

- Use `async` pipe in templates to automatically unsubscribe
- Keep JwtInterceptor registered globally (one-time setup)
- AuthGuard handles redirect logic (don't duplicate it)
- Token stored in localStorage survives page refresh
- Use observables (`$`) to follow RxJS conventions

---

## 🔐 Security Reminders

- ✅ Token stored in localStorage (accessible to JS)
- ✅ Don't store sensitive data in token (it's just Base64)
- ✅ Backend validates token on every request
- ⚠️ In production, use HTTPS only
- ⚠️ In production, restrict CORS origins

---

## 📞 Quick Commands

```bash
# Start dev server
npm start

# Build for prod
npm run build

# Run tests
npm test

# Generate new component
ng generate component path/to/component

# Generate new service
ng generate service path/to/service
```

---

## 🎓 Learn More

- See `AUTH_SETUP_GUIDE.md` for detailed usage
- See `IMPLEMENTATION_SUMMARY.md` for feature list
- See `CHECKLIST.md` for testing guide
- See example component in `dashboard-example.component.ts`

---

**Last Updated:** {{ date }}  
**Version:** 1.0  
**Status:** ✅ Ready for testing
