# JWT Authentication Setup Guide

## Overview
This document provides a complete setup guide for integrating JWT authentication between your Angular frontend and Spring Boot backend.

## Backend Configuration (Already Implemented)
- **Server URL**: `http://localhost:8081`
- **Authentication Type**: JWT
- **Token Expiration**: 24 hours (86400000 ms)
- **CORS**: Enabled for all origins

## Backend Endpoints

### 1. Register Endpoint
- **URL**: `POST http://localhost:8081/api/auth/register`
- **Request Body**:
```json
{
  "username": "string",
  "password": "string",
  "email": "string",
  "name": "string",
  "role": "ADMIN|USER|MODERATOR",
  "CIN": "number",
  "photo": "string (optional)"
}
```
- **Response**: Success message or error

### 2. Login Endpoint
- **URL**: `POST http://localhost:8081/api/auth/login`
- **Request Body**:
```json
{
  "username": "string",
  "password": "string"
}
```
- **Response**:
```json
{
  "token": "jwt_token_string",
  "id": "number",
  "username": "string",
  "email": "string",
  "name": "string",
  "role": "string"
}
```

### Token Usage
- Include in request headers as: `Authorization: Bearer {token}`
- Automatically handled by JwtInterceptor

## Frontend Implementation (Done)

### Created Files:
1. **AuthService** (`src/app/services/auth.service.ts`)
   - Handles login/register
   - Stores JWT token in localStorage
   - Manages user state with RxJS Observables
   - Provides authentication status checks

2. **JwtInterceptor** (`src/app/services/jwt.interceptor.ts`)
   - Automatically adds Authorization header to all HTTP requests
   - Reads token from localStorage

3. **AuthGuard** (`src/app/guards/auth.guard.ts`)
   - Protects routes from unauthorized access
   - Redirects to login if not authenticated

4. **LoginComponent** (`src/app/components/login/`)
   - User login form
   - Form validation
   - Error handling

5. **RegisterComponent** (`src/app/components/register/`)
   - User registration form
   - All fields validation

6. **Updated AppModule** (`src/app/app.module.ts`)
   - Registered all services, guards, and components
   - Added HTTP interceptor provider

7. **Updated Routing** (`src/app/app-routing.module.ts`)
   - Login route
   - Register route
   - Template for protected routes

8. **Updated AppComponent** (`src/app/app.component.ts` & `.html`)
   - Navigation bar with auth state
   - Logout button
   - User greeting

## How to Use in Components

### Example 1: Get Current User
```typescript
import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({...})
export class MyComponent implements OnInit {
  currentUser$ = this.authService.currentUser$;
  
  constructor(private authService: AuthService) {}
  
  ngOnInit() {
    this.currentUser$.subscribe(user => {
      console.log('Current user:', user);
    });
  }
}
```

### Example 2: Check Authentication Status
```typescript
@Component({...})
export class MyComponent {
  isAuthenticated$ = this.authService.isAuthenticated$;
  
  constructor(private authService: AuthService) {}
}
```

### Example 3: Call Protected API Endpoint
```typescript
@Component({...})
export class MyComponent {
  constructor(private http: HttpClient, private authService: AuthService) {}
  
  getData() {
    // Token is automatically added by JwtInterceptor
    this.http.get('http://localhost:8081/api/your-endpoint').subscribe(
      data => console.log('Data:', data)
    );
  }
}
```

### Example 4: Protect Routes with Guards
```typescript
// In app-routing.module.ts
const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
];
```

## Authentication Flow

1. **Login**:
   - User enters credentials in login form
   - AuthService sends POST request to `/api/auth/login`
   - Backend returns JWT token and user info
   - AuthService stores token in localStorage
   - User is redirected to dashboard (or returnUrl)

2. **Protected Requests**:
   - JwtInterceptor intercepts all HTTP requests
   - Adds `Authorization: Bearer {token}` header
   - Request is sent to backend
   - Backend validates token using JwtAuthFilter
   - If valid, request proceeds; if invalid, returns 401

3. **Logout**:
   - User clicks logout button
   - AuthService removes token and user from localStorage
   - User is redirected to login page

## Storage Details

### LocalStorage Keys:
- `jwt_token`: The JWT token string
- `current_user`: JSON string of user object

## Going Forward

### Adding New Protected Routes:
```typescript
// 1. Create your component
ng generate component path/to/my-component

// 2. Add to routing module
{ 
  path: 'my-route', 
  component: MyComponent,
  canActivate: [AuthGuard]  // This protects the route
}

// 3. Use auth service in component
constructor(private authService: AuthService) { }
```

### Calling Backend APIs:
```typescript
constructor(private http: HttpClient) {}

// The JWT token is automatically included in headers
getData() {
  this.http.get('http://localhost:8081/api/your-endpoint')
    .subscribe(data => console.log(data));
}
```

## Troubleshooting

### Issue: 401 Unauthorized errors
- Check if token is stored: `localStorage.getItem('jwt_token')`
- Check if token is valid on backend
- Ensure JwtInterceptor is registered in AppModule

### Issue: CORS errors
- Backend CORS is already enabled
- Ensure API calls use `http://localhost:8081`

### Issue: Login fails
- Verify credentials are correct
- Check backend is running on port 8081
- Check network tab in browser dev tools for response

## OAuth2 / Refresh Token Implementation (Future)

If you need to add refresh token support later:
1. Modify backend to return refresh token
2. Add refresh token storage
3. Create interceptor to handle token refresh on 401
4. Update AuthService with refresh method

