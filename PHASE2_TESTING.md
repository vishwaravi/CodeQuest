# 🔐 Phase 2 - Authentication System Testing Guide

## ✅ What We Built

### Backend
- ✅ User Model with Mongoose schemas
- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ JWT token generation & verification
- ✅ Auth middleware for protected routes
- ✅ 5 Auth API endpoints (register, login, getMe, updateProfile, changePassword)

### Frontend
- ✅ Auth Context for global state management
- ✅ Login page with validation
- ✅ Register page with validation
- ✅ Dashboard page (protected)
- ✅ Protected Route component
- ✅ Updated Navbar with auth UI
- ✅ Auto-login on refresh

---

## 🧪 Testing Steps

### Test 1: User Registration

1. **Open the app**: http://localhost:5173
2. **Click "Sign Up"** button in navbar
3. **Fill out registration form**:
   - Username: `testwarrior`
   - Email: `test@codequest.com`
   - Password: `password123`
   - Confirm Password: `password123`
4. **Click "Create Account"**
5. **Expected Results**:
   - ✅ Success toast: "Account created successfully! 🎉"
   - ✅ Redirected to `/dashboard`
   - ✅ Navbar shows username and green dot indicator
   - ✅ Dashboard shows user stats (Rating: 1000, XP: 0, Wins: 0)

**Browser Console Check**:
```
POST /api/auth/register 201
User registered successfully
```

---

### Test 2: User Login

1. **Click "Logout"** in navbar
2. **Click "Login"** in navbar
3. **Fill out login form**:
   - Email: `test@codequest.com`
   - Password: `password123`
4. **Click "Login"**
5. **Expected Results**:
   - ✅ Success toast: "Login successful! 🎉"
   - ✅ Redirected to `/dashboard`
   - ✅ User data restored
   - ✅ Token stored in localStorage

**Browser DevTools Check** (F12 → Application → Local Storage):
```
token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Test 3: Protected Routes

1. **Logout from dashboard**
2. **Manually try to access**: http://localhost:5173/dashboard
3. **Expected Results**:
   - ✅ Immediately redirected to `/login`
   - ✅ Cannot access dashboard without authentication

---

### Test 4: Auto-Login (Token Persistence)

1. **Login successfully**
2. **Refresh the page** (F5)
3. **Expected Results**:
   - ✅ Still logged in
   - ✅ Dashboard loads with user data
   - ✅ No redirect to login
   - ✅ Navbar shows authenticated state

---

### Test 5: Validation Testing

#### Registration Validation
Try these invalid inputs (one at a time):

**Short Username**:
- Username: `ab` (too short)
- Expected: ❌ "Username must be at least 3 characters"

**Short Password**:
- Password: `12345` (5 chars)
- Expected: ❌ "Password must be at least 6 characters"

**Password Mismatch**:
- Password: `password123`
- Confirm: `password456`
- Expected: ❌ "Passwords do not match"

**Duplicate Email**:
- Try registering with `test@codequest.com` again
- Expected: ❌ "Email already exists"

**Duplicate Username**:
- Try registering with `testwarrior` again
- Expected: ❌ "Username already exists"

#### Login Validation
**Invalid Credentials**:
- Email: `test@codequest.com`
- Password: `wrongpassword`
- Expected: ❌ "Invalid credentials"

**Non-existent User**:
- Email: `notexist@example.com`
- Password: `anything`
- Expected: ❌ "Invalid credentials"

---

### Test 6: API Endpoint Testing (Using curl or Postman)

#### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "curluser",
    "email": "curl@test.com",
    "password": "password123"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": "...",
      "username": "curluser",
      "email": "curl@test.com",
      "rating": 1000,
      "xp": 0,
      "stats": { ... }
    }
  }
}
```

#### Login User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "curl@test.com",
    "password": "password123"
  }'
```

#### Get Current User (Protected)
```bash
# Replace YOUR_TOKEN with actual token from login response
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "id": "...",
    "username": "curluser",
    "email": "curl@test.com",
    "rating": 1000,
    ...
  }
}
```

---

### Test 7: MongoDB Verification

Check if users are actually stored in database:

```bash
# Connect to MongoDB
mongosh

# Switch to codequest database
use codequest

# View all users
db.users.find().pretty()

# Check password is hashed
db.users.findOne({ email: "test@codequest.com" }, { password: 1 })
# Should see hashed password like: "$2a$10$..."

# Check indexes
db.users.getIndexes()
# Should have unique indexes on email and username
```

---

## 🎯 Feature Checklist

### Backend ✅
- [x] User model with validation
- [x] Password hashing (bcrypt)
- [x] JWT generation
- [x] JWT verification
- [x] Register endpoint
- [x] Login endpoint
- [x] Get profile endpoint (protected)
- [x] Update profile endpoint (protected)
- [x] Change password endpoint (protected)
- [x] Auth middleware
- [x] Error handling
- [x] Unique email constraint
- [x] Unique username constraint

### Frontend ✅
- [x] Auth context with state management
- [x] Login page
- [x] Register page
- [x] Dashboard page
- [x] Protected routes
- [x] Auto-login persistence
- [x] Token storage (localStorage)
- [x] Navbar auth UI
- [x] Form validation
- [x] Toast notifications
- [x] Loading states
- [x] Error handling

---

## 🔧 Architecture Highlights

### Password Security
- **Bcrypt hashing** with 10 salt rounds
- **Passwords never stored in plain text**
- **Password field excluded** from queries by default (`select: false`)
- **Pre-save hook** automatically hashes password on create/update

### JWT Strategy
- **Token expires in 7 days** (configurable)
- **Payload contains only user ID** (minimal data)
- **Verified on every protected route**
- **Stored in localStorage** (consider httpOnly cookies for production)

### Validation Layers
1. **Frontend validation** - Immediate user feedback
2. **Mongoose schema validation** - Database level
3. **Custom controller validation** - Business logic

### API Design
- **Consistent response format**: `{ success, message?, data?, error? }`
- **Proper HTTP status codes**: 200, 201, 400, 401, 500
- **RESTful routes**: `/api/auth/*`
- **Bearer token authentication**: `Authorization: Bearer <token>`

---

## 🐛 Common Issues & Solutions

### Issue 1: "Invalid or expired token"
**Solution**: Token expired or invalid. Logout and login again.

### Issue 2: Redirected to login after refresh
**Solution**: Token not in localStorage. Check browser storage.

### Issue 3: "Email already exists"
**Solution**: Use different email or drop database:
```bash
mongosh
use codequest
db.users.drop()
```

### Issue 4: CORS errors
**Solution**: Check `.env` FRONTEND_URL matches frontend port.

---

## 📊 Database Schema

```javascript
User Schema:
{
  username: String (unique, 3-20 chars),
  email: String (unique, validated),
  password: String (hashed, min 6 chars),
  rating: Number (default: 1000),
  xp: Number (default: 0),
  stats: {
    totalMatches: Number (default: 0),
    wins: Number (default: 0),
    losses: Number (default: 0),
    winRate: Number (default: 0)
  },
  avatar: String (default: null),
  isActive: Boolean (default: true),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

---

## 🎓 Next: Phase 3 Preview

**Question Management System**
- CRUD operations for coding questions
- Admin-only routes
- Question model with test cases
- Difficulty levels
- Tags/categories
- Admin dashboard UI

---

## ✅ Phase 2 Sign-Off

**Status**: 🎉 Authentication System Complete!

Ready to move to Phase 3 when you are!

Say **"Start Phase 3"** to continue.
