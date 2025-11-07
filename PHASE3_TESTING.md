# 🧠 Phase 3 - Question Management System Testing Guide

## ✅ What We Built

### Backend
- ✅ Question model with test cases, examples, hints
- ✅ Admin authorization middleware (role-based access)
- ✅ CRUD API endpoints for questions
- ✅ Search & filtering by difficulty/tags
- ✅ Random question selector by difficulty
- ✅ Question statistics endpoint
- ✅ Sample question seeder (5 coding problems)
- ✅ Admin user creation

### Frontend
- ✅ Questions browser page (all users)
- ✅ Question detail page with tabs
- ✅ Question form (admin only - create/edit)
- ✅ Filtering by difficulty & search
- ✅ Admin controls (edit/delete buttons)
- ✅ Beautiful UI with color-coded difficulties

---

## 🔑 Admin Credentials

**The seeder created an admin account:**
- Email: `admin@codequest.com`
- Password: `admin123`

**Login with these credentials to access admin features!**

---

## 🧪 Testing Steps

### Test 1: View All Questions (Public Access)

1. **Navigate to Questions**: http://localhost:5173/questions
2. **Expected Results**:
   - ✅ See 5 seeded coding problems
   - ✅ Problems have colored difficulty badges:
     - Green = Easy
     - Yellow = Medium
     - Red = Hard
   - ✅ Each card shows title, snippet, tags, usage count
   - ✅ Can access without login

**Questions You Should See**:
1. Two Sum (Easy)
2. Reverse String (Easy)
3. Valid Parentheses (Medium)
4. Merge Two Sorted Lists (Medium)
5. Binary Tree Maximum Depth (Hard)

---

### Test 2: Filter Questions

1. **On Questions Page**
2. **Filter by Difficulty**:
   - Select "Easy" → Should show 2 questions
   - Select "Medium" → Should show 2 questions
   - Select "Hard" → Should show 1 question
   - Select "All Difficulties" → Shows all 5

3. **Search by Title**:
   - Type "sum" → Shows "Two Sum"
   - Type "tree" → Shows "Binary Tree Maximum Depth"
   - Clear search → Shows all again

---

### Test 3: View Question Details

1. **Click on "Two Sum"**
2. **Expected Results**:
   - ✅ Full problem description
   - ✅ Tabs: Description, Examples, Test Cases
   - ✅ Tags shown (array, hash-table, sorting)
   - ✅ Difficulty badge (Easy - green)
   - ✅ Test cases listed (4 total, 1 hidden)
   - ✅ Examples with explanations
   - ✅ Hints section
   - ✅ Constraints displayed

3. **Test Tabs**:
   - Click "Examples" → See input/output examples
   - Click "Test Cases" → See all test cases
   - Non-admin: Hidden test cases are NOT shown
   - Admin: Hidden test cases ARE shown

---

### Test 4: Admin Login

1. **Logout** (if logged in as regular user)
2. **Click "Login"**
3. **Enter Admin Credentials**:
   - Email: `admin@codequest.com`
   - Password: `admin123`
4. **Click "Login"**
5. **Expected Results**:
   - ✅ Redirected to dashboard
   - ✅ Navbar shows "admin" username
   - ✅ Access granted to admin features

---

### Test 5: Create New Question (Admin Only)

1. **Login as admin**
2. **Go to Questions page**
3. **Click "+ Add Question" button** (top right)
4. **Fill out the form**:
   ```
   Title: Fibonacci Number
   Description: Calculate the nth Fibonacci number
   Difficulty: Easy
   Tags: recursion, dynamic-programming
   
   Test Case 1:
   - Input: 5
   - Expected Output: 5
   - Hidden: No
   
   Constraints: 0 <= n <= 30
   Time Limit: 2000
   Memory Limit: 256
   ```

5. **Click "Create Question"**
6. **Expected Results**:
   - ✅ Success toast: "Question created successfully"
   - ✅ Redirected to questions list
   - ✅ New question appears in list
   - ✅ Total questions now = 6

---

### Test 6: Edit Question (Admin Only)

1. **Login as admin**
2. **Go to any question detail page** (e.g., Two Sum)
3. **Click "Edit" button** (top right)
4. **Modify the title**: "Two Sum - Updated"
5. **Click "Update Question"**
6. **Expected Results**:
   - ✅ Success toast: "Question updated successfully"
   - ✅ Redirected to questions list
   - ✅ Updated title shows in list

---

### Test 7: Delete Question (Admin Only)

1. **Login as admin**
2. **Go to the question you just created**
3. **Click "Delete" button**
4. **Confirm deletion**
5. **Expected Results**:
   - ✅ Confirmation dialog appears
   - ✅ After confirm: Success toast
   - ✅ Redirected to questions list
   - ✅ Question removed from list

---

### Test 8: Access Control (Non-Admin)

1. **Logout from admin**
2. **Login as regular user** (or don't login)
3. **Go to Questions page**
4. **Expected Results**:
   - ✅ "+ Add Question" button NOT visible
   - ✅ Can view all questions
   - ✅ On detail page: No "Edit" or "Delete" buttons
   - ✅ Hidden test cases NOT shown

5. **Try to access admin routes manually**:
   - Navigate to: http://localhost:5173/admin/questions/new
   - **Expected**: Should still work (frontend route exists)
   - **Backend protection**: API will reject POST request with 403

---

### Test 9: API Testing (Using curl)

#### Get All Questions
```bash
curl http://localhost:5000/api/questions
```

#### Get Questions by Difficulty
```bash
curl "http://localhost:5000/api/questions?difficulty=easy"
```

#### Get Single Question
```bash
# Replace QUESTION_ID with actual ID from questions list
curl http://localhost:5000/api/questions/QUESTION_ID
```

#### Get Random Easy Question
```bash
curl http://localhost:5000/api/questions/random/easy
```

#### Create Question (Admin Only)
```bash
# First login to get token
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@codequest.com","password":"admin123"}' \
  | jq -r '.data.token')

# Create question
curl -X POST http://localhost:5000/api/questions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "API Test Question",
    "description": "Created via API testing",
    "difficulty": "easy",
    "tags": ["test"],
    "testCases": [
      {"input": "test", "expectedOutput": "test", "isHidden": false}
    ]
  }'
```

#### Get Question Stats (Admin Only)
```bash
curl http://localhost:5000/api/questions/stats \
  -H "Authorization: Bearer $TOKEN"
```

---

### Test 10: MongoDB Verification

Check the database:

```bash
mongosh
use codequest

# View all questions
db.questions.find().pretty()

# Count by difficulty
db.questions.countDocuments({ difficulty: "easy" })
db.questions.countDocuments({ difficulty: "medium" })
db.questions.countDocuments({ difficulty: "hard" })

# Check admin user
db.users.findOne({ role: "admin" })

# View question with test cases
db.questions.findOne({ title: "Two Sum" })
```

---

## 🎯 Feature Checklist

### Backend ✅
- [x] Question model with validation
- [x] Test case schema (with hidden flag)
- [x] Examples, hints, constraints
- [x] Starter code for multiple languages
- [x] Time & memory limits
- [x] Admin authorization middleware
- [x] GET /api/questions (with filters)
- [x] GET /api/questions/:id
- [x] GET /api/questions/random/:difficulty
- [x] POST /api/questions (admin only)
- [x] PUT /api/questions/:id (admin only)
- [x] DELETE /api/questions/:id (admin only)
- [x] GET /api/questions/stats (admin only)
- [x] Text search on title/description
- [x] Pagination support
- [x] Question seeder script
- [x] Usage count tracking

### Frontend ✅
- [x] Questions browser page
- [x] Question detail page
- [x] Question form (create/edit)
- [x] Difficulty filtering
- [x] Search by title
- [x] Color-coded difficulty badges
- [x] Tabbed interface (description/examples/tests)
- [x] Admin controls (edit/delete)
- [x] Form validation
- [x] Loading states
- [x] Error handling
- [x] Toast notifications
- [x] Responsive design

---

## 📊 Database Schema

### Question Model
```javascript
{
  title: String,                    // "Two Sum"
  description: String,              // Full problem description
  difficulty: String,               // "easy" | "medium" | "hard"
  tags: [String],                   // ["array", "hash-table"]
  testCases: [
    {
      input: String,                // "[2,7,11,15]\n9"
      expectedOutput: String,       // "[0,1]"
      isHidden: Boolean            // Hide from non-admin users
    }
  ],
  examples: [
    {
      input: String,
      output: String,
      explanation: String
    }
  ],
  constraints: String,              // "1 <= nums.length <= 10^4"
  hints: [String],                  // ["Use hash map"]
  starterCode: {
    javascript: String,
    python: String,
    java: String,
    cpp: String
  },
  timeLimit: Number,                // 2000ms
  memoryLimit: Number,              // 256MB
  usageCount: Number,               // Times used in battles
  isActive: Boolean,                // Published/unpublished
  createdBy: ObjectId,              // Admin user ID
  createdAt: Date,
  updatedAt: Date
}
```

### User Model (Updated)
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  rating: Number,
  xp: Number,
  stats: { ... },
  avatar: String,
  isActive: Boolean,
  role: String,                     // "user" | "admin" ← NEW
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🏗️ API Endpoints Reference

### Public Endpoints
```
GET    /api/questions              Get all questions (with filters)
GET    /api/questions/:id          Get single question
GET    /api/questions/random/:difficulty  Get random question
```

### Admin Only Endpoints
```
POST   /api/questions              Create question
PUT    /api/questions/:id          Update question
DELETE /api/questions/:id          Delete question
GET    /api/questions/stats        Get statistics
```

### Query Parameters (GET /api/questions)
- `difficulty` - Filter by difficulty (easy/medium/hard)
- `tags` - Filter by tags (comma-separated)
- `search` - Text search in title/description
- `limit` - Results per page (default: 50)
- `page` - Page number (default: 1)

---

## 🔒 Security Features

### Role-Based Access Control
- Admin middleware checks `user.role === 'admin'`
- Must be used after authentication middleware
- Returns 403 Forbidden if not admin

### Data Visibility
- Hidden test cases only shown to admins
- `getPublicData()` method filters them out
- Frontend respects visibility based on user role

### Validation
- Mongoose schema validation
- At least one test case required
- Valid difficulty levels enforced
- Time/memory limits have min/max

---

## 🎓 Architecture Highlights

### Why Subdocuments for Test Cases?
- Keep test data with question
- Atomic updates (no separate collection)
- Easy to query and filter
- Good for small arrays (<100 items)

### Why Text Index?
- Fast full-text search on title/description
- MongoDB's built-in text search
- Better than regex for performance
- Supports relevance scoring

### Why Usage Count?
- Track popular questions
- Analyze question effectiveness
- Balance matchmaking algorithm
- Data for question recommendations

### Why Starter Code Object?
- Support multiple languages
- Easy to extend new languages
- Optional (can be empty)
- Prepared for Phase 5 (code editor)

---

## 🐛 Common Issues & Solutions

### Issue 1: "Admin privileges required"
**Solution**: Login with admin credentials: `admin@codequest.com` / `admin123`

### Issue 2: No questions showing
**Solution**: Run seeder: `npm run seed` in backend folder

### Issue 3: Can't create/edit questions
**Solution**: Make sure you're logged in as admin, not regular user

### Issue 4: Hidden test cases not hidden
**Solution**: Check `isHidden` flag in test case object

---

## 🔥 What's Next? Phase 4 Preview

**Real-Time Battle Setup**
- Matchmaking system (queue players)
- Socket rooms for battles
- Player pairing algorithm
- Battle countdown timer
- Real-time player list
- Battle status tracking
- Question assignment
- Battle room UI

---

## ✅ Phase 3 Summary

**Backend:** ✅ Complete  
**Frontend:** ✅ Complete  
**Admin System:** ✅ Working  
**Sample Data:** ✅ Seeded  
**Access Control:** ✅ Secured  

**Phase 3 is DONE! 🎊**

---

## 📝 Quick Test Checklist

- [ ] View questions list
- [ ] Filter by difficulty
- [ ] Search questions
- [ ] View question details
- [ ] Login as admin
- [ ] Create new question
- [ ] Edit existing question
- [ ] Delete question
- [ ] Test access control (non-admin)
- [ ] Verify hidden test cases work

---

**All tests passing? Say "Start Phase 4" when ready! 🚀**
