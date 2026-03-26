# Backend to Frontend Mapping Guide

## Overview
This document shows how your Spring Boot backend classes map to the Angular frontend implementation.

---

## 🔗 Architecture Mapping

### Backend HTTP Layer → Frontend Service Layer

```
Spring Boot Backend                    Angular Frontend
═══════════════════════════════════════════════════════

AuthController                    →    AuthService
  /api/auth/login                →    login(request)
  /api/auth/register             →    register(request)
                                 →    logout()
                                 →    getToken()

HttpRequest/Response             →    HttpClient
                                 →    (RxJS Observables)

SecurityConfig & JwtAuthFilter   →    JwtInterceptor
CORS enabled                     →    HTTP Interceptor
```

---

## 📊 Data Flow Comparison

### Backend: Login Process
```
AuthController.login()
    ↓
authService.authenticateUser()    (validates username/password)
authService.getUserByUsername()   (fetches user details)
jwtUtil.generateJwtToken()        (creates JWT)
    ↓
Return AuthResponse with token + user details
```

### Frontend: Login Process
```
LoginComponent.onSubmit()
    ↓
AuthService.login()               (sends HTTP request)
    ↓
JwtInterceptor (intercepts response)
    ↓
AuthResponse received
    ↓
localStorage stores token + user
AuthService subjects updated
Component navigates to app
```

---

## 🏗️ Class/Entity Mapping

| Backend (Java) | Frontend (TypeScript) | Purpose |
|---|---|---|
| `User` (Entity) | `User` (Interface) | User data structure |
| `LoginRequest` (DTO) | `LoginRequest` (Interface) | Login form data |
| `RegisterRequest` (DTO) | `RegisterRequest` (Interface) | Register form data |
| `AuthResponse` (DTO) | `AuthResponse` (Interface) | Login response |
| `AuthService` | `AuthService` | Business logic |
| `SecurityConfig` | `JwtInterceptor` | Request interception |
| `JwtAuthFilter` | `AuthGuard` | Access control |

---

## 📨 Request & Response Mapping

### Login Request
```
BACKEND (Java)                  FRONTEND (TypeScript)
─────────────────────────────────────────────────────
class LoginRequest              interface LoginRequest {
  String username;    ────→       username: string;
  String password;    ────→       password: string;
}                                 }

// Usage:
LoginRequest req = new LoginRequest();
req.setUsername("john");

// Usage:
const req: LoginRequest = {
  username: "john",
  password: "pass123"
};
```

### Login Response
```
BACKEND (Java)                  FRONTEND (TypeScript)
─────────────────────────────────────────────────────
class AuthResponse              interface AuthResponse {
  String token;       ────→       token: string;
  Long id;            ────→       id: number;
  String username;    ────→       username: string;
  String email;       ────→       email: string;
  String name;        ────→       name: string;
  String role;        ────→       role: string;
}                                 }

// Usage:
response.getToken()             response.token
response.getId()                response.id
response.getUsername()          response.username
```

---

## 🔐 Security Implementation Comparison

### Backend: JwtAuthFilter
```java
// Backend intercepts requests
public class JwtAuthFilter extends OncePerRequestFilter {
  protected void doFilterInternal(
    HttpServletRequest request,
    HttpServletResponse response,
    FilterChain filterChain
  ) {
    String authHeader = request.getHeader("Authorization");
    String token = authHeader.substring(7);  // Remove "Bearer "
    String username = jwtUtil.getUserNameFromJwtToken(token);
    
    // Validate token
    if (jwtUtil.validateJwtToken(token)) {
      // Set authentication in Spring Security context
      SecurityContextHolder.getContext().setAuthentication(auth);
    }
  }
}
```

### Frontend: JwtInterceptor + AuthGuard
```typescript
// Frontend: Interceptor adds token to requests
export class JwtInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler) {
    const token = this.authService.getToken();
    
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    return next.handle(request);
  }
}

// Frontend: Guard protects routes
export class AuthGuard implements CanActivate {
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const isLoggedIn = this.authService.isLoggedIn();
    if (isLoggedIn) return true;
    
    this.router.navigate(['/login']);
    return false;
  }
}
```

---

## 🔗 Configuration Mapping

### Backend: application.properties
```properties
spring.application.name=PIDEV
spring.datasource.url=jdbc:mysql://localhost:3306/PIDEV
spring.datasource.username=root
spring.datasource.password=

# JWT Configuration
app.jwtSecret=mySecretKeyForJWTGenerationShouldBeLongEnoughForHS512
app.jwtExpirationMs=86400000

server.port=8081
```

### Frontend: Hardcoded Configuration
```typescript
// auth.service.ts
private apiUrl = 'http://localhost:8081/api/auth';

// Could be moved to environment files for better practice:
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8081'
};

// Usage:
private apiUrl = environment.apiUrl + '/api/auth';
```

---

## 🔄 State Management Comparison

### Backend: Session-Based State
```java
// Spring Security maintains principal in SecurityContext
Authentication auth = SecurityContextHolder.getContext().getAuthentication();
User user = (User) auth.getPrincipal();
```

### Frontend: Observable-Based State
```typescript
// RxJS maintains state in BehaviorSubjects
private currentUserSubject = new BehaviorSubject<User | null>(null);
public currentUser$ = this.currentUserSubject.asObservable();

// Subscription example:
this.currentUser$.subscribe(user => {
  console.log('User updated:', user);
});
```

---

## 📝 Validation Layer Mapping

### Backend Validation
```java
@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginRequest request) {
    // Spring validates @RequestBody automatically
    // If validation fails, returns 400 Bad Request
    
    Authentication authentication = authService.authenticateUser(request);
    // authService checks username/password
    
    String token = jwtUtil.generateJwtToken(authentication);
}
```

### Frontend Validation
```typescript
ngOnInit(): void {
  this.loginForm = this.formBuilder.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });
}

onSubmit(): void {
  if (this.loginForm.invalid) {
    return;  // Form validation failed
  }
  
  this.authService.login(request).subscribe({
    next: (response) => { /* handle success */ },
    error: (error) => { /* handle validation/auth errors */ }
  });
}
```

---

## 🌐 API Endpoint Mapping

### Backend Endpoints
```
POST   /api/auth/login              → Authenticate user
POST   /api/auth/register           → Create new user
GET    /api/auth/validate           → Validate token (optional)
POST   /api/auth/refresh            → Refresh token (optional)
```

### Frontend Service Methods Calling Endpoints
```typescript
AuthService {
  login(request): Observable<AuthResponse>
    // Calls: POST /api/auth/login
    
  register(request): Observable<any>
    // Calls: POST /api/auth/register
    
  logout(): void
    // Client-side only (clears localStorage)
    
  getToken(): string | null
    // Client-side only (reads localStorage)
}
```

---

## 🔐 Token Lifecycle Comparison

### Backend: Token Generation
```java
public String generateJwtToken(Authentication authentication) {
    UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();
    Date now = new Date();
    Date expiryDate = new Date(now.getTime() + jwtExpirationMs);
    
    return Jwts.builder()
        .subject(userPrincipal.getUsername())
        .issuedAt(now)
        .expiration(expiryDate)
        .signWith(key())
        .compact();
}
```

### Frontend: Token Storage & Usage
```typescript
login(request: LoginRequest): Observable<AuthResponse> {
  return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request)
    .pipe(
      map(response => {
        // Store token received from backend
        localStorage.setItem('jwt_token', response.token);
        
        // Update observable subjects
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
        
        return response;
      })
    );
}
```

---

## 🔄 Authentication Check Flow

### Backend: Each Request
```java
// JwtAuthFilter runs on every request
for each request:
  1. Extract Authorization header
  2. Get token from "Bearer {token}"
  3. Validate token signature & expiry
  4. Extract username from token
  5. Load user from database
  6. Set authentication in Spring Security
  7. Allow request to proceed (if valid)
```

### Frontend: First Load + Each Request
```typescript
// On app initialization:
1. Check localStorage for saved token
2. If token exists, create User from saved data
3. Set currentUserSubject & isAuthenticatedSubject

// For each API call:
1. JwtInterceptor intercepts
2. If token exists in localStorage, add to headers
3. Send request with Authorization header
4. Backend validates token
```

---

## 🚀 Deployment Mapping

| Aspect | Backend | Frontend |
|---|---|---|
| **Server** | Tomcat (embedded in Spring Boot) | Node.js dev server / Nginx (production) |
| **Port** | 8081 | 4200 (dev) / 80 (production) |
| **Build** | `mvn build` or `gradle build` | `ng build` |
| **Runtime Env** | JVM (Java 11+) | Node.js + Browser |
| **Database** | MySQL 5.7+ | N/A (uses backend) |
| **Config** | application.properties | environment.ts / environment.prod.ts |

---

## 📋 Full Request/Response Cycle

### User Login Scenario

**Step 1: Frontend - User submits login form**
```typescript
LoginComponent {
  onSubmit() {
    authService.login({
      username: "john",
      password: "pass123"
    })
  }
}
```

**Step 2: Frontend - AuthService makes HTTP request**
```typescript
AuthService {
  login(request) {
    return this.http.post('/api/auth/login', request)
  }
}
```

**Step 3: Frontend - JwtInterceptor (doesn't add token for /auth/ endpoints)**
```typescript
JwtInterceptor {
  intercept(request, next) {
    // Skip for /api/auth/* endpoints
    if (request.url.includes('/api/auth/')) {
      return next.handle(request);
    }
    
    // Would add token here for other endpoints
    request = request.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next.handle(request);
  }
}
```

**Step 4: Backend - AuthController receives request**
```java
AuthController {
  @PostMapping("/login")
  public ResponseEntity<?> login(@RequestBody LoginRequest request) {
    Authentication auth = authService.authenticateUser(request);
    // ...
    return ResponseEntity.ok(new AuthResponse(...));
  }
}
```

**Step 5: Backend - AuthService authenticates**
```java
AuthService {
  authenticateUser(request) {
    // Check username in database
    // Verify password with BCryptPasswordEncoder
    // Return Authentication object
  }
}
```

**Step 6: Backend - JwtUtil generates token**
```java
JwtUtil {
  generateJwtToken(authentication) {
    return Jwts.builder()
      .subject(username)
      .issuedAt(now)
      .expiration(expiry)
      .signWith(secretKey)
      .compact();
  }
}
```

**Step 7: Backend - Response sent to frontend**
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "id": 1,
  "username": "john",
  "email": "john@example.com",
  "name": "John Doe",
  "role": "USER"
}
```

**Step 8: Frontend - AuthService stores token**
```typescript
AuthService {
  map(response => {
    localStorage.setItem('jwt_token', response.token);
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
    return response;
  })
}
```

**Step 9: Frontend - Component handles response**
```typescript
LoginComponent {
  onSubmit() {
    authService.login(request).subscribe({
      next: (response) => {
        // Token stored, redirect to dashboard
        this.router.navigate(['/dashboard']);
      }
    })
  }
}
```

---

## 🎓 Summary

| Layer | Backend | Frontend |
|---|---|---|
| **User Entry** | HTTP POST /api/auth/login | LoginComponent form |
| **Input Validation** | Spring validation | Angular form validation |
| **Authentication** | AuthService.authenticateUser() | AuthService.login() |
| **Token Generation** | JwtUtil.generateJwtToken() | (Received from backend) |
| **Token Storage** | Session/Memory | localStorage |
| **Token Usage** | JwtAuthFilter (interceptor) | JwtInterceptor (interceptor) |
| **Route Protection** | Spring Security | AuthGuard |
| **Session State** | SecurityContext | BehaviorSubject (Observable) |

---

This mapping helps you understand how the frontend and backend work together!
