# 🚀 Quick Setup Guide for Phase 6

## Step 1: Get Judge0 API Key (2 minutes)

### Option A: RapidAPI (Recommended)
1. Go to: https://rapidapi.com/judge0-official/api/judge0-ce
2. Click "Sign Up" or "Log In"
3. Click "Subscribe to Test" 
4. Choose "Basic" plan (FREE - 50 requests/day)
5. Copy your API key from the dashboard

### Option B: Self-Hosted (Advanced)
```bash
git clone https://github.com/judge0/judge0.git
cd judge0
docker-compose up -d
# Judge0 will run on http://localhost:2358
```

## Step 2: Update Backend .env

Open `/backend/.env` and add your Judge0 credentials:

```env
# For RapidAPI:
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your_actual_rapidapi_key_here
JUDGE0_API_HOST=judge0-ce.p.rapidapi.com

# For Self-Hosted:
# JUDGE0_API_URL=http://localhost:2358
# JUDGE0_API_KEY=
# JUDGE0_API_HOST=
```

## Step 3: Install Dependencies

```bash
cd backend
npm install axios  # Already done!
```

## Step 4: Start Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Step 5: Test It!

1. Open http://localhost:5173
2. Log in with two accounts (two browser windows)
3. Both join matchmaking
4. Get matched and join battle
5. Both click "Ready"
6. Write a solution (e.g., for "Two Sum"):

```javascript
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}

// Test with array and target
const input = process.argv[2] || '[2,7,11,15]';
const target = parseInt(process.argv[3] || '9');
const nums = JSON.parse(input);
console.log(JSON.stringify(twoSum(nums, target)));
```

7. Click "▶️ Run Code" - Should see results modal!
8. Click "🚀 Submit" - Should test against all test cases!

## 🎯 What to Expect

### When You Click "Run Code":
- Button shows "⏳ Running..."
- Toast: "Running your code..."
- Modal appears with results
- Shows which test cases passed/failed
- Displays execution time and memory usage

### When You Click "Submit":
- Confirmation dialog appears
- Button shows "⏳ Submitting..."
- Modal shows results for ALL test cases (including hidden)
- Opponent gets notified
- If both submit: Winner is automatically determined!

## 🐛 Troubleshooting

### "Failed to submit code for execution"
- Check your Judge0 API key is correct in .env
- Verify you're subscribed to Judge0 CE on RapidAPI
- Check backend console for error details

### "No test cases available"
- Make sure questions have test cases in database
- Run the question seeder: `npm run seed` in backend folder

### Test cases failing incorrectly
- Check output format matches exactly (including whitespace)
- Test cases are case-sensitive
- Newlines and spaces matter!

## 📝 Example Test Cases Format

For "Two Sum" problem:
```javascript
// Input format (2 lines):
[2,7,11,15]
9

// Expected Output:
[0,1]
```

Your code must:
1. Read the input correctly
2. Process it
3. Output in the exact format expected (including brackets, commas, etc.)

## 🎉 Success Indicators

✅ Backend console shows: "🚀 Submitting code for execution"  
✅ Backend console shows: "✅ Test 1: PASSED"  
✅ Frontend shows results modal  
✅ Opponent sees execution notifications  
✅ Winner determined correctly  

---

**Everything working?** Phase 6 is complete! 🎊

**Having issues?** Check PHASE6_COMPLETE.md for detailed documentation.

**Ready for more?** Phase 7 awaits with leaderboards and stats! 🚀
