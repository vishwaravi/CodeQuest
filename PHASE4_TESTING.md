# Phase 4 - Real-Time Battle Setup - Testing Guide

## ✅ Phase 4 Completed!

### What Was Built

#### Backend Components:
1. **Battle Model** (`backend/src/models/Battle.js`)
   - Complete battle history tracking
   - Player data management
   - Winner determination logic
   - Rating changes tracking

2. **Matchmaking Queue** (`backend/src/utils/matchmakingQueue.js`)
   - In-memory queue manager
   - Rating-based matching algorithm
   - Dynamic rating threshold (increases with wait time)
   - Active battle tracking

3. **Battle Socket Events** (`backend/src/sockets/battleSocket.js`)
   - `queue:join` - Join matchmaking queue
   - `queue:leave` - Leave matchmaking queue
   - `battle:matched` - Match found notification
   - `battle:join` - Join battle room
   - `battle:ready` - Player ready to start
   - `battle:countdown` - 3-2-1 countdown
   - `battle:start` - Battle begins
   - `battle:code-change` - Real-time code sync
   - `battle:submit` - Submit solution
   - `battle:completed` - Battle ends with results

4. **Battle Controller & Routes** (`backend/src/controllers/battleController.js`)
   - GET `/api/battles/history` - Get battle history
   - GET `/api/battles/stats` - Get user stats
   - GET `/api/battles/active` - Check for active battle
   - GET `/api/battles/:battleId` - Get battle details
   - GET `/api/battles/queue/status` - Get queue status
   - GET `/api/battles/leaderboard/top` - Get leaderboard

#### Frontend Components:
1. **Matchmaking Page** (`frontend/src/pages/Matchmaking.jsx`)
   - Difficulty selector (Easy/Medium/Hard)
   - Find Match button with searching animation
   - User stats display
   - Cancel search functionality
   - Real-time queue status updates
   - Auto-redirect to battle room when matched

2. **Battle Room Page** (`frontend/src/pages/BattleRoom.jsx`)
   - Split-screen layout
   - Question panel (left 1/3)
   - Code editor + player status (right 2/3)
   - Real-time opponent status
   - Ready check system
   - 3-second countdown animation
   - Live timer
   - Submit solution button
   - Victory/Defeat overlay

3. **Socket Service Updates** (`frontend/src/services/socket.js`)
   - All battle event emitters
   - All battle event listeners
   - Cleanup methods

4. **Battle API Methods** (`frontend/src/services/api.js`)
   - Battle history, stats, leaderboard endpoints

---

## 🧪 Testing Instructions

### Prerequisites
- ✅ Backend server running on `http://localhost:5000`
- ✅ Frontend server running on `http://localhost:5173`
- ✅ MongoDB connected with seeded questions
- ✅ At least one user account (or create two test accounts)

### Test 1: Single User Flow
1. **Navigate to Matchmaking**
   - Go to `http://localhost:5173/matchmaking`
   - Should see difficulty selector and stats
   - Should see "Find Match" button

2. **Join Queue**
   - Select a difficulty (e.g., Medium)
   - Click "Find Match"
   - Should see searching animation
   - Should see "Cancel Search" button
   - Check console for "✅ Joined queue" message

3. **Leave Queue**
   - Click "Cancel Search"
   - Should return to difficulty selector
   - Check console for "❌ Left queue" message

---

### Test 2: Two Player Battle (REQUIRES 2 BROWSERS)

#### Setup:
1. Open TWO browser windows/tabs (or use incognito)
2. Login as TWO DIFFERENT users in each window
   - Window 1: Login as User A
   - Window 2: Login as User B

#### Matchmaking Flow:

**Window 1 (User A):**
1. Navigate to `/matchmaking`
2. Select difficulty: **Medium**
3. Click "Find Match"
4. See "Finding Opponent..." animation

**Window 2 (User B):**
1. Navigate to `/matchmaking`
2. Select difficulty: **Medium** (same as User A)
3. Click "Find Match"
4. See "Finding Opponent..." animation

**Both Windows:**
- Within 3 seconds, BOTH should see "Match found!" toast
- Both should auto-redirect to `/battle/{battleId}`
- Both should see the same battle room

#### Battle Room Flow:

**Initial State:**
- ✅ Question panel visible on left
- ✅ Players status bar showing both usernames
- ✅ Code editor visible
- ✅ Code editor is DISABLED (not started yet)
- ✅ "Ready to Battle" button visible

**Ready Check:**

**Window 1:**
1. Click "👍 Ready to Battle"
2. Button should change to "✅ Ready - Waiting for opponent..."
3. Your status should show "👍 Ready"

**Window 2:**
1. Click "👍 Ready to Battle"
2. Button should change to "✅ Ready - Waiting for opponent..."

**Both Windows:**
- Both should see "Both players ready! Starting battle..." toast
- 3-second countdown overlay: **3... 2... 1... GO!**
- Countdown disappears
- Timer starts at top (30:00 for 30 minutes)
- Code editor becomes ENABLED
- Button changes to "🚀 Submit Solution"

#### During Battle:

**Window 1 (User A):**
1. Type some code in the editor
2. Observe opponent status updates with character count

**Window 2 (User B):**
1. Type some code in the editor
2. Observe opponent status updates with character count

**Both Windows:**
- Timer should count down in real-time
- Opponent status should update: "X chars"
- Code editor should be fully functional

#### Submit Solution:

**Window 1:**
1. Click "🚀 Submit Solution"
2. Should see "Solution submitted!" toast
3. Button changes to "✅ Submitted - Waiting for results..."
4. Your status shows "✅ Submitted"

**Window 2:**
1. Should see "Opponent submitted their solution!" toast
2. Opponent status shows "✅ Submitted"
3. Click "🚀 Submit Solution"

**Both Windows:**
- Victory/Defeat overlay appears
- Shows winner (🏆 Victory! or 💔 Defeat! or 🤝 Draw!)
- "Back to Matchmaking" button appears
- Timer stops

---

### Test 3: Edge Cases

#### Test 3.1: Active Battle Resume
1. Start a battle (don't complete it)
2. Close the browser tab
3. Reopen and login
4. Navigate to `/matchmaking`
5. **Expected:** Should auto-redirect to active battle

#### Test 3.2: Queue While in Battle
1. While in an active battle
2. Try to open `/matchmaking` in a new tab
3. Click "Find Match"
4. **Expected:** Error: "Already in an active battle"

#### Test 3.3: Different Difficulties
1. User A: Select "Easy", click "Find Match"
2. User B: Select "Hard", click "Find Match"
3. **Expected:** NO match (different difficulties)
4. Both should keep searching

#### Test 3.4: Disconnect Handling
1. Start matchmaking search
2. Close browser
3. **Expected:** Server removes user from queue (check console)

---

## 🔍 Console Debugging

### Backend Console Messages:
```
✅ User {userId} joined {difficulty} queue. Queue size: X
🎮 Match found! {user1} vs {user2}
🔌 Socket connected: {socketId}
🎮 User {userId} joined battle {battleId}
🏆 Battle {battleId} completed. Winner: {winnerId}
✅ Battle {battleId} completed and removed from active battles
```

### Frontend Console Messages:
```
✅ Socket connected: {socketId}
✅ Joined queue: {data}
🎮 Battle matched! {data}
🎮 Joined battle: {data}
👍 Player ready: {data}
🚀 Battle started! {data}
📝 Player submitted: {data}
🏆 Battle completed: {data}
```

---

## 📊 Database Verification

Check MongoDB after a battle:

```bash
# Connect to MongoDB
mongosh codequest

# Check battles collection
db.battles.find().pretty()

# Check if battle was saved
db.battles.findOne({ status: "completed" })

# Check user stats updated
db.users.findOne({ username: "testuser" }, { stats: 1, rating: 1 })
```

---

## 🐛 Known Limitations (Phase 4)

1. **Code Execution:** 
   - Submissions are SIMULATED (random test results)
   - Real code execution comes in **Phase 6** with Judge0 integration

2. **Code Editor:**
   - Basic `<textarea>` used
   - No syntax highlighting yet
   - Monaco Editor comes in **Phase 5**

3. **Real-time Code Preview:**
   - Only character count is shared
   - Full code preview comes in **Phase 5**

4. **Rating System:**
   - Simple ±25/±15 rating changes
   - Advanced ELO rating comes later

5. **Queue Persistence:**
   - In-memory queue (resets on server restart)
   - Redis persistence can be added later

---

## ✅ Success Criteria

Phase 4 is successful if:

- ✅ Two users can find each other in matchmaking
- ✅ Both users are redirected to the same battle room
- ✅ Ready check system works for both players
- ✅ Countdown appears for both players simultaneously
- ✅ Battle timer starts and counts down correctly
- ✅ Both players can type code in their editors
- ✅ Opponent status updates in real-time (character count)
- ✅ Submit button works for both players
- ✅ Winner is determined when both submit
- ✅ Victory/Defeat overlay appears correctly
- ✅ Battle is saved to MongoDB
- ✅ User stats and ratings are updated

---

## 🚀 Next Phase Preview

### Phase 5: Real-Time Code Synchronization
- Monaco Editor integration (VS Code-like editor)
- Syntax highlighting for multiple languages
- Live code preview between players
- Code formatting and autocomplete
- Split-screen code comparison

**Expected Timeline:** 1-2 days

---

## 📝 Notes

- Matchmaking checks for matches every **3 seconds**
- Rating threshold increases with wait time (max 60 seconds)
- Battle time limit is **30 minutes** (1800 seconds)
- Socket.io handles all real-time events
- Auto-reconnection enabled for socket disconnections

---

## 🎉 Congratulations!

You've completed **Phase 4 - Real-Time Battle Setup**! 

The core multiplayer functionality is now working. Players can:
1. ✅ Find opponents based on skill and difficulty
2. ✅ Join synchronized battle rooms
3. ✅ Start battles together with countdown
4. ✅ Code simultaneously with live opponent status
5. ✅ Submit solutions and determine winners

**Ready for Phase 5?** Type: `start phase 5` to begin building the advanced code editor with Monaco!
