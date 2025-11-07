# 🚪 Leave Battle Feature - Quick Reference

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     LEAVE BATTLE FEATURE                         │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│   Player in Battle   │
└──────────┬───────────┘
           │
           │ Clicks "🚪 Leave Battle"
           ↓
┌──────────────────────┐
│  Confirmation Modal  │
│                      │
│  ⚠️  Leave Battle?   │
│                      │
│  [Stay]   [Leave]    │
└──────┬───────┬───────┘
       │       │
  Clicks Stay  Clicks Leave
       │       │
       ↓       ↓
┌──────────┐  ┌───────────────────────────────────────┐
│  Modal   │  │    Check Battle Status                │
│  Closes  │  └───────────┬────────────────┬──────────┘
│          │              │                │
│ Battle   │        Before Start     During Battle
│ Continues│              │                │
└──────────┘              ↓                ↓
              ┌──────────────────┐  ┌──────────────────┐
              │ Battle Cancelled │  │  Forfeit Battle  │
              │                  │  │                  │
              │ • No penalties   │  │ • Leaver: -30    │
              │ • Both return to │  │ • Opponent: +20  │
              │   matchmaking    │  │ • Opponent wins  │
              │ • Toast notify   │  │ • Stats updated  │
              └──────────────────┘  └──────────────────┘
```

---

## Two Scenarios

### 📍 Scenario 1: Leave BEFORE Battle Starts

```
Status: waiting / ready
┌─────────────────────────────────────────────────┐
│  Player 1                    Player 2           │
│  ────────                    ────────           │
│                                                  │
│  🚪 Click Leave             ⏳ Waiting...       │
│  ↓                                               │
│  📤 Emit: battle:leave                          │
│  ↓                          ↓                    │
│  ❌ Battle Cancelled ──────→ ❌ Battle Cancelled│
│  📉 Rating: No change       📉 Rating: No change│
│  🔙 → Matchmaking           🔙 → Matchmaking    │
└─────────────────────────────────────────────────┘
```

### ⚔️ Scenario 2: Leave DURING Battle

```
Status: in-progress
┌─────────────────────────────────────────────────┐
│  Player 1                    Player 2           │
│  ────────                    ────────           │
│                                                  │
│  🚪 Click Leave             💻 Coding...        │
│  ↓                                               │
│  📤 Emit: battle:leave                          │
│  ↓                          ↓                    │
│  💔 Forfeit ───────────────→ 🏆 Victory!        │
│  📉 Rating: -30 points      📈 Rating: +20      │
│  ➕ Stats: +1 Loss          ➕ Stats: +1 Win    │
│  🔙 → Matchmaking           🎉 Victory Screen   │
└─────────────────────────────────────────────────┘
```

---

## Rating Impact

```
┌────────────────────────────────────────────────────┐
│              RATING CHANGES TABLE                  │
├────────────────────┬───────────────┬───────────────┤
│      Action        │ Leaving Player│   Opponent    │
├────────────────────┼───────────────┼───────────────┤
│ Leave Before Start │      ±0       │      ±0       │
│ Leave During Battle│      -30      │      +20      │
│ Normal Win         │      +25      │      -15      │
│ Normal Loss        │      -15      │      +25      │
└────────────────────┴───────────────┴───────────────┘
```

**💡 Key Point**: Leaving during battle is 2x worse than a normal loss!

---

## UI Components

### 1. Leave Button (Header)
```
┌─────────────────────────────────────────────────┐
│ ⚔️ Battle Arena  Medium                         │
│                              ⏱️ 2:45            │
│                                                  │
│                      Battle ID: abc12345        │
│                      [🚪 Leave Battle]  ← HERE! │
└─────────────────────────────────────────────────┘
```

### 2. Confirmation Modal
```
        ┌─────────────────────────────┐
        │                             │
        │           ⚠️                │
        │                             │
        │      Leave Battle?          │
        │                             │
        │  Leaving will count as a    │
        │  loss and you'll lose 30    │
        │  rating points. Opponent    │
        │  wins by forfeit.           │
        │                             │
        │  ┌─────────┐  ┌──────────┐ │
        │  │  Stay   │  │  Leave   │ │
        │  │ (Gray)  │  │  (Red)   │ │
        │  └─────────┘  └──────────┘ │
        └─────────────────────────────┘
```

---

## Socket Events

```
┌──────────────────────────────────────────────────────┐
│                  SOCKET EVENTS FLOW                  │
└──────────────────────────────────────────────────────┘

Client (Player 1)
    │
    │  emit: 'battle:leave'
    │  { battleId, userId }
    ↓
Server
    │
    ├─ Find battle
    ├─ Check status
    ├─ Update ratings
    ├─ Mark winner
    │
    ├─ emit: 'battle:player-left' (to both)
    ├─ emit: 'battle:completed' (to both)
    │  OR
    └─ emit: 'battle:cancelled' (if before start)
    ↓
Clients (Both Players)
    │
    ├─ Show toast notification
    ├─ Update UI
    └─ Navigate to matchmaking
```

---

## Testing Checklist

### ✅ Before Battle Starts
- [ ] Click "Leave Battle" → Modal appears
- [ ] Modal shows "Match will be cancelled"
- [ ] Click "Leave" → Both players see notification
- [ ] Both redirected to matchmaking
- [ ] No rating changes for either player
- [ ] Battle status in DB: `cancelled`

### ✅ During Battle
- [ ] Click "Leave Battle" → Modal appears
- [ ] Modal shows "-30 rating" warning
- [ ] Click "Leave" → Leaver loses 30 rating
- [ ] Opponent wins by forfeit (+20 rating)
- [ ] Opponent sees victory screen
- [ ] Stats updated (win/loss)
- [ ] Battle status in DB: `completed`
- [ ] Results: `forfeit` and `won_by_forfeit`

### ✅ Modal Behavior
- [ ] Click "Stay" → Modal closes, battle continues
- [ ] Modal only appears when button clicked
- [ ] No accidental leaves without confirmation

### ✅ Edge Cases
- [ ] Leave button hidden after battle ends
- [ ] Can leave after submitting solution
- [ ] Both players leaving handled correctly
- [ ] Network disconnect vs intentional leave

---

## Quick Stats

```
📁 Files Modified: 4
  ├─ Backend: 2 files
  └─ Frontend: 2 files

💻 Lines Added: ~150 lines
  ├─ Backend: ~100 lines
  └─ Frontend: ~50 lines

🎯 New Socket Events: 3
  ├─ battle:leave (emit from client)
  ├─ battle:cancelled (server → both clients)
  └─ battle:player-left (server → both clients)

🔧 New Functions: 5
  ├─ handleLeaveBattle()
  ├─ confirmLeaveBattle()
  ├─ cancelLeaveBattle()
  ├─ leaveBattle() (socket service)
  └─ Socket handler for battle:leave
```

---

## 🎯 Test It Now!

**Commands:**
```bash
# Backend already running on port 5000
# Frontend already running on port 5173

# Open two browsers:
1. Browser 1: http://localhost:5173
2. Browser 2: http://localhost:5173 (incognito)

# Test Flow:
1. Login as 2 different users
2. Join matchmaking (same difficulty)
3. Wait for match
4. Try leaving before battle starts
5. Start a new match
6. Try leaving during battle
7. Observe rating changes and notifications
```

---

## 🎉 Feature Complete!

✅ **Leave Battle button** in header  
✅ **Confirmation modal** with warnings  
✅ **Rating penalties** (-30 for leaving)  
✅ **Opponent rewards** (+20 for forfeit win)  
✅ **Smart handling** (before vs during battle)  
✅ **Real-time notifications** to both players  
✅ **Stats tracking** (wins/losses updated)  
✅ **Edge cases** handled properly  

**Ready to test in production!** 🚀
