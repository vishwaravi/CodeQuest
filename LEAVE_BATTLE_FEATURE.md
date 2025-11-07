# 🚪 Leave Battle Feature

## Overview
Players can now exit from an ongoing battle at any time with a confirmation modal. The feature handles different scenarios based on the battle status and applies appropriate consequences.

---

## ✨ Features Implemented

### 1. Leave Battle Button
- 🔴 **Red button** in the top-right header
- Only visible during active battles (hidden after battle ends)
- Icon: 🚪 "Leave Battle"

### 2. Confirmation Modal
- ⚠️ **Warning dialog** before leaving
- Different messages based on battle status:
  - **Before battle starts**: "Match will be cancelled"
  - **During battle**: "Will count as loss, -30 rating, opponent wins by forfeit"
- Two options: "Stay" or "Leave"

### 3. Battle Status Handling

#### Scenario A: Leave Before Battle Starts
**Status**: `waiting` or `ready` (before countdown completes)
- ❌ Battle is cancelled
- 🚫 No rating changes
- 📢 Both players notified: "Player X left the battle"
- 🔙 Both players returned to matchmaking

#### Scenario B: Leave During Battle
**Status**: `in-progress` (after battle starts)
- 🏆 Opponent wins by forfeit
- 📉 Leaving player: **-30 rating points** (harsh penalty)
- 📈 Opponent: **+20 rating points** (bonus for win)
- 📊 Stats updated:
  - Leaving player: +1 loss
  - Opponent: +1 win
- 🏅 Result marked as `forfeit` and `won_by_forfeit`
- 📢 Both players notified with winner announcement

---

## 🔧 Technical Implementation

### Backend Changes

#### 1. Socket Event: `battle:leave`
**File**: `backend/src/sockets/battleSocket.js`

```javascript
socket.on('battle:leave', async ({ battleId, userId }) => {
  // Find battle and players
  // Check battle status
  // Handle cancellation or forfeit
  // Update ratings and stats
  // Notify all players
});
```

**Emits**:
- `battle:cancelled` - When battle cancelled before start
- `battle:player-left` - When player leaves during battle
- `battle:completed` - Final battle result with forfeit reason

#### 2. Battle Model Update
**File**: `backend/src/models/Battle.js`

Added new result statuses:
- `forfeit` - Player left the battle
- `won_by_forfeit` - Won because opponent left

```javascript
result: {
  type: String,
  enum: ['pending', 'passed', 'failed', 'error', 'timeout', 'forfeit', 'won_by_forfeit'],
  default: 'pending'
}
```

### Frontend Changes

#### 1. Socket Service Methods
**File**: `frontend/src/services/socket.js`

**New Methods**:
```javascript
leaveBattle(battleId, userId)        // Emit leave event
onBattleCancelled(callback)          // Listen for cancellation
onPlayerLeft(callback)               // Listen for player leaving
```

#### 2. BattleRoom Component
**File**: `frontend/src/pages/BattleRoom.jsx`

**New State**:
```javascript
const [showLeaveModal, setShowLeaveModal] = useState(false);
```

**New Handlers**:
```javascript
handleLeaveBattle()      // Open confirmation modal
confirmLeaveBattle()     // Execute leave action
cancelLeaveBattle()      // Close modal without leaving
```

**New Event Listeners**:
```javascript
socketService.onBattleCancelled((data) => {
  toast.error(data.message);
  navigate('/matchmaking');
});

socketService.onPlayerLeft((data) => {
  toast.success(data.message);
  setBattleEnded(true);
  setWinner(data.winner);
});
```

---

## 🎮 User Flow

### Leaving Before Battle Starts

```
1. Player clicks "🚪 Leave Battle"
   ↓
2. Modal appears: "Match will be cancelled"
   ↓
3. Player clicks "Leave"
   ↓
4. Socket emits: battle:leave
   ↓
5. Backend marks battle as 'cancelled'
   ↓
6. Backend emits: battle:cancelled to both players
   ↓
7. Both players see toast: "Player X left the battle"
   ↓
8. Both redirected to matchmaking after 2 seconds
```

### Leaving During Battle

```
1. Player clicks "🚪 Leave Battle"
   ↓
2. Modal appears: "Will count as loss, -30 rating"
   ↓
3. Player clicks "Leave" (confirms)
   ↓
4. Socket emits: battle:leave
   ↓
5. Backend:
   - Marks battle as 'completed'
   - Sets opponent as winner
   - Updates leaving player: -30 rating, +1 loss
   - Updates opponent: +20 rating, +1 win
   ↓
6. Backend emits: battle:player-left
   ↓
7. Leaving player:
   - Sees toast: "Leaving battle..."
   - Redirected to matchmaking
   ↓
8. Opponent:
   - Sees toast: "Player X left the battle. You win by forfeit!"
   - Battle end screen shows victory
   - Gets +20 rating bonus
```

---

## 📊 Rating System

### Penalties & Rewards

| Action | Leaving Player | Opponent |
|--------|---------------|----------|
| Leave before start | No change | No change |
| Leave during battle | **-30 points** | **+20 points** |
| Normal win | +25 points | -15 points |
| Normal loss | -15 points | +25 points |

**Why -30 for leaving?**
- Harsh penalty to discourage rage-quitting
- 2x worse than a normal loss (-15)
- Opponent gets bonus (+20 vs normal +25)

---

## 🎨 UI Components

### Leave Battle Button
```jsx
<button
  onClick={handleLeaveBattle}
  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg"
>
  🚪 Leave Battle
</button>
```

- **Color**: Red (danger action)
- **Position**: Top-right header
- **Visibility**: Hidden when `battleEnded === true`

### Confirmation Modal
```jsx
<div className="fixed inset-0 bg-black/80 z-50">
  <div className="bg-gray-800 rounded-lg p-8 border-2 border-red-500">
    <div className="text-6xl mb-4">⚠️</div>
    <h2 className="text-2xl font-bold">Leave Battle?</h2>
    <p className="text-gray-300">
      {battleStarted 
        ? "Will count as loss, -30 rating, opponent wins by forfeit"
        : "Match will be cancelled"}
    </p>
    <button onClick={cancelLeaveBattle}>Stay</button>
    <button onClick={confirmLeaveBattle}>Leave</button>
  </div>
</div>
```

- **Overlay**: 80% black background
- **Border**: Red to indicate danger
- **Icon**: ⚠️ Warning emoji
- **Buttons**: Gray "Stay" (safe) vs Red "Leave" (danger)

---

## 🧪 Testing Guide

### Test 1: Leave Before Battle Starts
1. **Setup**: 2 browsers, both users matched in battle
2. **Action**: User 1 clicks "Leave Battle" → Click "Leave"
3. **Expected**:
   - ✅ User 1 sees "Leaving battle..." toast
   - ✅ User 2 sees "Player X left the battle" toast
   - ✅ Both redirected to matchmaking after 2 seconds
   - ✅ No rating changes for either player
   - ✅ Battle status in DB: `cancelled`

### Test 2: Leave During Battle
1. **Setup**: 2 browsers, battle started (after countdown)
2. **Action**: User 1 clicks "Leave Battle" → Click "Leave"
3. **Expected**:
   - ✅ User 1 sees "Leaving battle..." toast
   - ✅ User 1 redirected to matchmaking
   - ✅ User 1 rating: -30 points
   - ✅ User 2 sees "Player X left the battle. You win by forfeit!" toast
   - ✅ User 2 sees victory screen (🏆)
   - ✅ User 2 rating: +20 points
   - ✅ User 1 stats: +1 loss
   - ✅ User 2 stats: +1 win
   - ✅ Battle status in DB: `completed`
   - ✅ Winner in DB: User 2
   - ✅ User 1 result: `forfeit`
   - ✅ User 2 result: `won_by_forfeit`

### Test 3: Modal Cancellation
1. **Setup**: In battle room
2. **Action**: Click "Leave Battle" → Click "Stay"
3. **Expected**:
   - ✅ Modal closes
   - ✅ Battle continues normally
   - ✅ No socket events emitted
   - ✅ No rating changes

### Test 4: Button Visibility
1. **Setup**: Complete a battle
2. **Expected**:
   - ✅ "Leave Battle" button hidden on battle end screen
   - ✅ Only "Back to Matchmaking" button visible

---

## 🐛 Edge Cases Handled

### 1. Double-Click Prevention
- Modal confirmation prevents accidental leaves
- Socket emits only once even if clicked multiple times

### 2. Both Players Leave Simultaneously
- First player's leave event processed
- Second player sees "Battle cancelled" message
- No race conditions

### 3. Leave After Submitting
- Player can still leave after submitting
- Forfeit overrides submission result
- Opponent wins regardless

### 4. Network Disconnection vs Leave
- Intentional leave: Handled by `battle:leave` event
- Network disconnect: Handled by `disconnect` event (existing)
- Different behaviors (leave is intentional penalty)

---

## 📝 Console Logs

### Backend Console:
```
🚪 Player 123abc leaving battle BATTLE_XYZ
❌ Battle BATTLE_XYZ cancelled - player left before start

OR

🚪 Player 123abc leaving battle BATTLE_XYZ
🏆 Battle BATTLE_XYZ completed by forfeit. Winner: opponent_username
```

### Frontend Console:
```
❌ Battle cancelled: { message: "Player X left the battle", reason: "player_left" }

OR

🚪 Player left: { 
  leftPlayer: { userId: "123abc", username: "Player1" },
  winner: { _id: "456def", username: "Player2" },
  message: "Player1 left the battle. Player2 wins by forfeit!"
}
```

---

## 🔮 Future Enhancements

### Potential Improvements:
1. **Abandonment Rate Tracking**
   - Track how often players leave
   - Stricter penalties for serial quitters
   - Temporary matchmaking bans for repeat offenders

2. **Reconnect Feature**
   - Allow players to rejoin if accidentally disconnected
   - 30-second grace period to reconnect
   - Battle pauses while waiting

3. **Vote to End**
   - Both players can vote to end early
   - If both agree, battle ends as draw
   - No penalties if mutual

4. **Pause Feature**
   - Emergency pause button (1 per player)
   - Max 60 seconds pause time
   - Opponent sees "Player paused" notification

---

## ✅ Files Modified

### Backend (2 files):
1. ✅ `backend/src/sockets/battleSocket.js`
   - Added `battle:leave` event handler
   - Added forfeit logic and rating updates
   - Emit `battle:cancelled` and `battle:player-left`

2. ✅ `backend/src/models/Battle.js`
   - Extended result enum with `forfeit` and `won_by_forfeit`

### Frontend (2 files):
1. ✅ `frontend/src/services/socket.js`
   - Added `leaveBattle()` method
   - Added `onBattleCancelled()` listener
   - Added `onPlayerLeft()` listener
   - Updated `offBattleEvents()` cleanup

2. ✅ `frontend/src/pages/BattleRoom.jsx`
   - Added `showLeaveModal` state
   - Added leave button in header
   - Added confirmation modal UI
   - Added `handleLeaveBattle()`, `confirmLeaveBattle()`, `cancelLeaveBattle()` handlers
   - Added event listeners for cancellation and forfeit
   - Updated battle completion handler for forfeit reason

---

## 🎉 Summary

**Feature Complete!** Players can now:
- ✅ Leave battles at any time
- ✅ See clear warnings before leaving
- ✅ Face appropriate penalties (-30 rating during battle)
- ✅ Give opponents automatic wins (forfeit)
- ✅ Cancel matches before they start (no penalty)

The feature includes:
- 🎨 Professional UI with confirmation modal
- ⚡ Real-time notifications to both players
- 📊 Proper rating and stats updates
- 🛡️ Edge case handling
- 🧪 Comprehensive testing scenarios

---

## 🚀 Ready to Test!

**Try it out:**
1. Open 2 browser windows
2. Start a battle
3. Click "🚪 Leave Battle" in one window
4. Observe the forfeit flow and rating changes!
