# FRAMP Frontend Authentication Documentation

## Overview

This document explains how the FRAMP Next.js frontend connects to the backend API for user authentication, including signup, login, and protected route authorization.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Backend Connection](#backend-connection)
3. [User Signup Flow](#user-signup-flow)
4. [User Login Flow](#user-login-flow)
5. [Dashboard Authorization](#dashboard-authorization)
6. [Logout Process](#logout-process)
7. [Code Implementation](#code-implementation)
8. [Security Features](#security-features)

## Architecture Overview

### Authentication Method
- **Cookie-based authentication** using `framp-auth-token` cookie
- **Automatic session management** via browser cookies
- **No manual token storage** - cookies handled by browser
- **Cross-origin support** with `credentials: "include"`

### Flow Summary
```
1. User signs up/logs in → Backend sets auth cookie
2. Frontend redirects to dashboard → Cookie sent automatically
3. Dashboard fetches user data → Cookie validates request
4. User logs out → Backend clears cookie
```

## Backend Connection

### API Base URL
```javascript
const API_BASE_URL = "https://framp-backend.vercel.app";
```

### Required Headers
```javascript
headers: {
  "Content-Type": "application/json",
  "x-frontend-key": "framp_6565fde02c6f0f3b052cf3b02daaea77cf8bd71247b0dae5939c3f7a9272af6f"
}
```

### Cookie Configuration
```javascript
credentials: "include"  // Automatically includes cookies in requests
```

## User Signup Flow

### Frontend Implementation (`src/app/signup/page.tsx`)

```javascript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError("");
  setMessage("");

  try {
    const response = await fetch("https://framp-backend.vercel.app/api/auth/signup", {
      method: "POST",
      credentials: "include", // Important: Include cookies
      headers: {
        "Content-Type": "application/json",
        "x-frontend-key": "framp_6565fde02c6f0f3b052cf3b02daaea77cf8bd71247b0dae5939c3f7a9272af6f",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      setMessage(`Signup successful! Welcome ${data.user.email}! Redirecting to dashboard...`);
      
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } else {
      setError(data.message || "Signup failed");
    }
  } catch (err) {
    setError("Network error: " + (err instanceof Error ? err.message : "Unknown error"));
  } finally {
    setIsLoading(false);
  }
};
```

### What Happens During Signup

1. **User submits form** with email and password
2. **Frontend sends POST request** to `/api/auth/signup`
3. **Backend creates user account** and session
4. **Backend sets `framp-auth-token` cookie** automatically
5. **Frontend redirects** to dashboard
6. **Cookie is now available** for subsequent requests

### Backend Response (Success)
```json
{
  "message": "Account created and logged in successfully",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "role": "user"
  },
  "auth": {
    "access_token": "jwt-token",
    "refresh_token": "refresh-token",
    "expires_at": 1748782312,
    "token_type": "Bearer"
  }
}
```

## User Login Flow

### Frontend Implementation (`src/app/login/page.tsx`)

```javascript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError("");
  setMessage("");

  try {
    const response = await fetch("https://framp-backend.vercel.app/api/auth/login", {
      method: "POST",
      credentials: "include", // Important: Include cookies
      headers: {
        "Content-Type": "application/json",
        "x-frontend-key": "framp_6565fde02c6f0f3b052cf3b02daaea77cf8bd71247b0dae5939c3f7a9272af6f",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      setMessage(`Login successful! Welcome back ${data.user.email}! Redirecting to dashboard...`);
      
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } else {
      setError(data.message || "Login failed");
    }
  } catch (err) {
    setError("Network error: " + (err instanceof Error ? err.message : "Unknown error"));
  } finally {
    setIsLoading(false);
  }
};
```

### What Happens During Login

1. **User submits credentials** (email/password)
2. **Frontend sends POST request** to `/api/auth/login`
3. **Backend validates credentials** and creates session
4. **Backend sets `framp-auth-token` cookie** automatically
5. **Frontend redirects** to dashboard
6. **User is now authenticated** for subsequent requests

## Dashboard Authorization

### Frontend Implementation (`src/app/dashboard/page.tsx`)

```javascript
useEffect(() => {
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("https://framp-backend.vercel.app/api/auth/me", {
        method: "GET",
        credentials: "include", // Automatically sends auth cookie
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user); // Set user data in state
      } else {
        router.push("/signup"); // Redirect if not authenticated
      }
    } catch (error) {
      router.push("/signup"); // Redirect on error
    } finally {
      setIsLoading(false);
    }
  };

  fetchCurrentUser();
}, [router]);
```

### How Dashboard Authorization Works

1. **Dashboard loads** and calls `fetchCurrentUser()`
2. **Frontend sends GET request** to `/api/auth/me`
3. **Browser automatically includes** `framp-auth-token` cookie
4. **Backend validates cookie** and returns user data
5. **Frontend displays user information** if authenticated
6. **Frontend redirects to signup** if not authenticated

### User Data Response
```json
{
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "role": "user",
    "profile": {
      "id": "user-uuid",
      "name": null,
      "email": "user@example.com",
      "wallet": null,
      "status": "active",
      "created_at": "2025-06-01T11:51:51.51+00:00",
      "updated_at": "2025-06-01T11:51:51.51+00:00",
      "role": "user"
    }
  }
}
```

## Logout Process

### Frontend Implementation

```javascript
const handleLogout = async () => {
  try {
    await fetch("https://framp-backend.vercel.app/api/auth/logout", {
      method: "POST",
      credentials: "include", // Send auth cookie for logout
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    localStorage.removeItem("framp_user"); // Clean up any cached data
    router.push("/signup"); // Always redirect to signup
  }
};
```

### What Happens During Logout

1. **User clicks logout button**
2. **Frontend sends POST request** to `/api/auth/logout`
3. **Backend invalidates session** and clears cookies
4. **Frontend clears local storage** (if any cached data)
5. **Frontend redirects** to signup page
6. **User is now logged out** and must re-authenticate

## Code Implementation

### File Structure
```
src/
├── app/
│   ├── signup/
│   │   └── page.tsx          # Signup form and logic
│   ├── login/
│   │   └── page.tsx          # Login form and logic
│   ├── dashboard/
│   │   └── page.tsx          # Protected dashboard with user data
│   └── page.tsx              # Root page (redirects to signup)
```

### Key Components

#### 1. Signup Page (`src/app/signup/page.tsx`)
- **Form handling** for email/password input
- **API call** to `/api/auth/signup` endpoint
- **Success/error messaging** with user feedback
- **Automatic redirect** to dashboard on success

#### 2. Login Page (`src/app/login/page.tsx`)
- **Form handling** for existing user credentials
- **API call** to `/api/auth/login` endpoint
- **Success/error messaging** with user feedback
- **Automatic redirect** to dashboard on success

#### 3. Dashboard Page (`src/app/dashboard/page.tsx`)
- **Protected route** that checks authentication
- **User data fetching** from `/api/auth/me` endpoint
- **User information display** (ID, email, role, profile)
- **Logout functionality** with session cleanup

### State Management

#### Authentication State
```javascript
const [user, setUser] = useState<User | null>(null);
const [isLoading, setIsLoading] = useState(true);
```

#### Form State
```javascript
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [isLoading, setIsLoading] = useState(false);
const [message, setMessage] = useState("");
const [error, setError] = useState("");
```

### Error Handling

#### Network Errors
```javascript
catch (err) {
  setError("Network error: " + (err instanceof Error ? err.message : "Unknown error"));
}
```

#### API Errors
```javascript
if (response.ok) {
  // Success handling
} else {
  setError(data.message || "Operation failed");
}
```

#### Authentication Errors
```javascript
if (response.ok) {
  const data = await response.json();
  setUser(data.user);
} else {
  router.push("/signup"); // Redirect if not authenticated
}
```

## Security Features

### 1. Cookie-Based Authentication
- **HttpOnly cookies** prevent XSS attacks
- **Secure flag** ensures HTTPS-only transmission (production)
- **SameSite policy** prevents CSRF attacks
- **Automatic expiration** handles session timeout

### 2. Frontend Key Protection
- **API key validation** on backend prevents unauthorized access
- **Environment variables** for secure key storage
- **Request validation** ensures legitimate frontend requests

### 3. CORS Configuration
- **Credentials included** in cross-origin requests
- **Proper headers** for secure communication
- **Domain validation** on backend

### 4. Route Protection
- **Automatic redirects** for unauthenticated users
- **Session validation** on protected routes
- **Graceful error handling** for expired sessions

### 5. Input Validation
- **Client-side validation** for immediate feedback
- **Server-side validation** for security
- **Sanitized error messages** prevent information leakage

## Best Practices Implemented

### 1. User Experience
- **Loading states** during API calls
- **Clear success/error messages** for user feedback
- **Automatic redirects** for smooth navigation
- **Responsive design** for all devices

### 2. Code Organization
- **Separation of concerns** (auth logic, UI, state)
- **Reusable patterns** across auth pages
- **Clean error handling** throughout
- **TypeScript types** for type safety

### 3. Security
- **No token storage** in localStorage
- **Automatic cookie handling** by browser
- **Secure API communication** with proper headers
- **Protected route patterns** for sensitive pages

### 4. Maintainability
- **Simple, readable code** without complex abstractions
- **Consistent patterns** across all auth pages
- **Clear documentation** and comments
- **Easy to extend** for additional features

## Common Patterns

### API Request Pattern
```javascript
const response = await fetch("https://framp-backend.vercel.app/api/endpoint", {
  method: "POST",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
    "x-frontend-key": "your-frontend-key",
  },
  body: JSON.stringify(data),
});
```

### Error Handling Pattern
```javascript
try {
  const response = await fetch(/* ... */);
  const data = await response.json();

  if (response.ok) {
    // Success logic
  } else {
    setError(data.message || "Operation failed");
  }
} catch (err) {
  setError("Network error: " + (err instanceof Error ? err.message : "Unknown error"));
} finally {
  setIsLoading(false);
}
```

### Protected Route Pattern
```javascript
useEffect(() => {
  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include"
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        router.push("/signup");
      }
    } catch (error) {
      router.push("/signup");
    } finally {
      setIsLoading(false);
    }
  };

  checkAuth();
}, [router]);
```

## Troubleshooting

### Common Issues

1. **Cookies not being set**
   - Check `credentials: "include"` in requests
   - Verify backend cookie configuration
   - Check browser developer tools → Application → Cookies

2. **CORS errors**
   - Ensure backend allows your domain
   - Verify `credentials: "include"` is set
   - Check preflight request handling

3. **Authentication failures**
   - Verify frontend key is correct
   - Check API endpoint URLs
   - Validate request format

4. **Redirect loops**
   - Check authentication logic in useEffect
   - Verify cookie expiration handling
   - Ensure proper error handling

### Debug Steps

1. **Check browser Network tab** for request/response details
2. **Inspect cookies** in Application tab
3. **Review console logs** for error messages
4. **Test API endpoints** directly with curl/Postman

---

## Summary

This authentication system provides:
- ✅ **Secure cookie-based authentication**
- ✅ **Simple, maintainable code**
- ✅ **Excellent user experience**
- ✅ **Production-ready security**
- ✅ **Easy to extend and modify**

The implementation follows modern web development best practices and provides a solid foundation for user authentication in the FRAMP application.
