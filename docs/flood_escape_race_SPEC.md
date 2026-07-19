# FLOOD ESCAPE RACE - Complete Specification
**Project:** Mekong Pathfinder Exhibition Game (EXE402)  
**Status:** MVP Development  
**Timeline:** 2-4 days (1 developer)  
**Target:** Interactive flood navigation game for Can Tho City

---

## 📋 PART 1: GENERAL REQUIREMENTS

### 1.1 Game Concept
**Name:** Flood Escape Race  
**Tagline:** "Bạn có thể đến đích trước AI không?" (Can you reach the destination before AI?)  
**Core Message:** "Không phải đường gần nhất là đường tốt nhất" (The nearest path isn't always the best)

### 1.2 Core Requirements
- **Number of Rounds:** 2 (simplified from 3)
- **Duration per Round:** 45 seconds total
- **Selection Time:** 8 seconds per choice
- **Players Capacity:** 10-50 concurrent
- **Starting Point:** Fixed (FPT Cần Thơ)
- **Exhibition Format:** Live demo at exhibition
- **Team:** 1 developer

### 1.3 Game Objectives
- Educate players about smart route selection in flood scenarios
- Demonstrate Mekong Pathfinder AI recommendations
- Create engaging, competitive experience
- Showcase flood navigation intelligence through interactive game

---

## 🎮 PART 2: GAME RULES & MECHANICS

### 2.1 Player Flow (End-to-End)

```
┌─────────────────────────────────────────────────────┐
│ 1. JOINING PHASE (Mobile)                           │
│ - Scan QR code displayed on big screen              │
│ - Enter player name                                 │
│ - Wait for host to start game                       │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 2. ROUND 1 GAMEPLAY (45 seconds total)              │
│ - Big screen shows: Starting location → Destination │
│ - Countdown timer: 45s                              │
│ - Mobile shows: 4 route options (A, B, C, D)       │
│ - Player selects 1 route within 8 seconds          │
│ - Choice is LOCKED (cannot change)                 │
│ - Countdown continues (37s remaining)              │
│ - Round ends at 0s                                 │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 3. ROUND 1 RESULT REVEAL (3-5 seconds)             │
│ - Show which route was AI recommended              │
│ - Show % of players who chose each route           │
│ - Award points to correct choices                  │
│ - Show personal score & rank                       │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 4. ROUND 2 GAMEPLAY (same as Round 1)              │
│ - New starting location (different destination)    │
│ - Same 4-route selection mechanic                 │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 5. FINAL RESULTS (5-10 seconds)                    │
│ - Show overall winner                              │
│ - Show top 3 players with scores                   │
│ - Display Mekong Pathfinder message                │
└─────────────────────────────────────────────────────┘
```

### 2.2 Selection Mechanics

**Per Round:**
- Players see **4 route options** (A, B, C, D)
- **Selection window:** 8 seconds (out of 45s total)
- After selection: **CANNOT change** (choice locked)
- Timer continues to show countdown
- Player waits for round to end

**Selection Behavior:**
```
T=0-8s:   Players can select (button active)
T=8s:     Last selection recorded (button disabled)
T=8-45s:  Wait for round end (show countdown)
T=45s:    Round ends, results revealed
```

### 2.3 Scoring System

**Base Scoring:**
| Action | Points |
|--------|--------|
| Select AI recommended route (correct) | +100 |
| Select wrong route | 0 |
| No selection (time out) | 0 |

**Speed Bonus (if correct):**
| Response Time | Bonus |
|---------------|-------|
| 0-2 seconds | +30 |
| 2-5 seconds | +20 |
| 5-8 seconds | +10 |

**Example:**
- Player selects correct route in 3 seconds: 100 + 20 = **120 points**
- Player selects wrong route: **0 points**
- Player doesn't select: **0 points**

**Final Score:** Sum of all round scores (Round 1 + Round 2)

### 2.4 Route Characteristics

**Each Route Has:**
- **Route Letter:** A, B, C, or D
- **Route Name:** Vietnamese street name (e.g., "Đường Hùng Vương")
- **Destination:** Location name (e.g., "Bến Ninh Kiều")
- **Flood Risk:** High / Medium / Low
- **Traffic Level:** Heavy / Moderate / Light
- **Estimated Time:** Minutes (e.g., "12 phút")
- **AI Recommendation:** Yes/No (only 1 route = Yes per round)
- **Description:** Short explanation (e.g., "Đường thoáng, không ngập")

### 2.5 Round Structure

**ROUND 1:**
- Starting Point: FPT Cần Thơ
- Destination: One of 4 possible locations
- Routes: 4 options (A, B, C, D)
- AI Recommended: Route B (always, for MVP)
- Duration: 45s

**ROUND 2:**
- Starting Point: Fixed (same for all players in MVP)
- Destination: Different from Round 1
- Routes: 4 options (A, B, C, D)
- AI Recommended: Route B (always, for MVP)
- Duration: 45s

---

## 💻 PART 3: TECHNICAL FEATURES & REQUIREMENTS

### 3.1 Backend (NestJS)

**Socket.IO Gateway Events:**

#### Player Events (Mobile → Backend)
```javascript
// Player joins room
'join-room': { roomCode: string, playerName: string }
→ Response: 'joined' { roomCode, players: [...] }

// Player selects route
'select-route': { roomCode: string, choice: 'A'|'B'|'C'|'D' }
→ Response: 'choice-locked' { isCorrect: boolean }
```

#### Host Events (Big Screen → Backend)
```javascript
// Host starts game
'host:start-game': { roomCode: string }
→ Broadcast: 'game-started' { round: 1, duration: 45 }

// Host moves to next round
'host:next-round': { roomCode: string }
→ Broadcast: 'round-started' { round: 2, currentLocation, destination }

// Host ends game
'host:end-game': { roomCode: string }
→ Broadcast: 'game-finished' { winner, finalLeaderboard: [...] }
```

#### Server Broadcasts (Backend → All Clients)
```javascript
// Room-wide events
'player-joined': { playerName: string, totalPlayers: number }
'round-started': { round: 1|2, duration: 45, currentLocation, destination }
'round-timer': { countdown: number }  // Every second
'choices-submitted': { playerId, choice, timestamp }
'round-revealed': { 
  results: [{ playerId, playerName, choice, isCorrect, points, rank }],
  aiRecommendation: 'B',
  explanation: 'Đường B tránh được vùng ngập'
}
'leaderboard-updated': { players: [{ rank, name, score }] }
'game-finished': { winner: { name, score }, finalLeaderboard: [...] }
```

**Game Engine Logic:**
```
1. Initialize game with 2 pre-defined rounds
2. Round start: broadcast current location + destination
3. Selection window: 8 seconds (record all choices)
4. Wait until 45s: continue countdown
5. Score calculation: check if choice == 'B'
6. Update leaderboard: re-rank all players
7. Move to next round or end game
```

**Data Storage:**
- **In-memory only** (no database for MVP)
- Rooms map: `Map<roomCode, RoomData>`
- Players map: `Map<playerId, PlayerData>`
- Game results: stored in Socket.IO room namespace

### 3.2 Mobile Frontend (React)

**Page: JOIN SCREEN**
```
Layout:
┌────────────────────────────┐
│   FLOOD ESCAPE RACE        │
├────────────────────────────┤
│  [QR Code Scanner Area]    │
│   (or manual room code)    │
├────────────────────────────┤
│  Input: Player Name        │
│  [__________________]      │
│  [JOIN BUTTON]             │
├────────────────────────────┤
│  Status: Waiting...        │
└────────────────────────────┘
```

**Functionality:**
- [ ] QR code scanner (html5-qrcode library)
- [ ] Manual room code input (fallback)
- [ ] Player name input field
- [ ] Join button → emit 'join-room' event
- [ ] Show "Waiting for host..." message

**Page: WAIT SCREEN**
```
Layout:
┌────────────────────────────┐
│   FLOOD ESCAPE RACE        │
├────────────────────────────┤
│   Players joined: 5/50    │
│   ├─ Player 1            │
│   ├─ Player 2            │
│   └─ ...                 │
├────────────────────────────┤
│   Waiting for host to     │
│   start the game...       │
└────────────────────────────┘
```

**Functionality:**
- [ ] Listen to 'player-joined' event
- [ ] Show player list (updated real-time)
- [ ] Show player count

**Page: GAME SCREEN (Main Gameplay)**
```
Layout:
┌────────────────────────────┐
│   FLOOD ESCAPE RACE        │
│   Round: 1/2               │
├────────────────────────────┤
│   From: FPT Cần Thơ       │
│   To: Bến Ninh Kiều       │
├────────────────────────────┤
│   ⏱️ COUNTDOWN: 45 seconds │
│   (Large, bold, red when  │
│    < 10 seconds)           │
├────────────────────────────┤
│   [A] Đường Hùng Vương    │
│   [B] Đường Mậu Thân ★    │
│   [C] Đường Trần Hưng Đạo │
│   [D] Tuyến Ủy Sông Hậu   │
│                            │
│   (Buttons clickable only  │
│    for 8 seconds)         │
└────────────────────────────┘
```

**Functionality:**
- [ ] Display round number (1 or 2)
- [ ] Show starting location & destination
- [ ] Display countdown timer (45 → 44 → ... → 0)
- [ ] Show 4 route buttons (A, B, C, D)
- [ ] Each button contains:
  - Route letter
  - Route name (Vietnamese)
  - (Optional) Flood risk / traffic icon
- [ ] Buttons are clickable for 8 seconds only
- [ ] After selection: button turns green (locked), others disabled
- [ ] After countdown ends: freeze all buttons

**Page: RESULT SCREEN**
```
Layout:
┌────────────────────────────┐
│   Round 1 Results          │
├────────────────────────────┤
│   Your Choice: B           │
│   ✓ CORRECT!               │
│   + 120 Points             │
├────────────────────────────┤
│   Your Score: 120          │
│   Your Rank: #3            │
├────────────────────────────┤
│   Leaderboard:             │
│   1. Player A - 200 pts    │
│   2. Player B - 150 pts    │
│   3. You - 120 pts         │
│   ...                      │
├────────────────────────────┤
│   Next round in 3s...      │
└────────────────────────────┘
```

**Functionality:**
- [ ] Show player's choice (A/B/C/D)
- [ ] Show if correct/incorrect
- [ ] Show points awarded this round
- [ ] Show cumulative score
- [ ] Show current rank
- [ ] Show top 10 leaderboard
- [ ] Auto-advance to next round after 3-5 seconds

**Page: FINAL LEADERBOARD**
```
Layout:
┌────────────────────────────┐
│   GAME OVER                │
│   🏆 WINNER: Player A      │
│   Total Score: 250 pts     │
├────────────────────────────┤
│   Final Ranking:           │
│   1. Player A - 250 pts    │
│   2. Player B - 220 pts    │
│   3. You - 180 pts         │
│   4. Player C - 150 pts    │
│   ...                      │
├────────────────────────────┤
│   [Scan QR to Play Again]  │
└────────────────────────────┘
```

**Functionality:**
- [ ] Display overall winner (highest score)
- [ ] Show complete final leaderboard (all players)
- [ ] Show player's final position & score
- [ ] Option to play again (scan QR)

### 3.3 Big Screen Display (React)

**Display: WAITING SCREEN**
```
Layout (Large, 1920x1080):
┌──────────────────────────────────┐
│   FLOOD ESCAPE RACE              │
│   Ready to Start                 │
├──────────────────────────────────┤
│   QR Code (large)                │
│   [Display actual QR image]       │
├──────────────────────────────────┤
│   Room Code: ABC123              │
│   Players Joined: 0              │
│   [START GAME] Button (host only)│
└──────────────────────────────────┘
```

**Display: GAME SCREEN (Active Round)**
```
Layout (50/50 split):
┌────────────────────┬────────────────────┐
│ LEFT: MAP/INFO     │ RIGHT: LEADERBOARD │
├────────────────────┼────────────────────┤
│ Round: 1/2         │ 🏆 TOP 10          │
│                    │ 1. Player A - 150  │
│ From: FPT Cần Thơ │ 2. Player B - 130  │
│ To: Bến Ninh Kiều │ 3. Player C - 120  │
│                    │ 4. You - 100       │
│ ⏱️ 45 SECONDS      │ 5. Player D - 80   │
│ (Large countdown)  │ ...                │
│                    │                    │
│ Route choices:     │                    │
│ A: Đường Hùng     │                    │
│ B: Đường Mậu Thân │                    │
│ C: Đường Trần     │                    │
│ D: Tuyến Ủy      │                    │
│                    │                    │
│ % Distribution:    │                    │
│ A: 20% (●●)       │                    │
│ B: 50% (●●●●●)    │                    │
│ C: 15% (●●)       │                    │
│ D: 15% (●●)       │                    │
└────────────────────┴────────────────────┘
```

**Functionality:**
- [ ] Display current round (1/2)
- [ ] Show starting location & destination
- [ ] Large countdown timer (big red numbers when < 10s)
- [ ] List all 4 routes with names
- [ ] Show % of players who chose each route
- [ ] Update in real-time as choices come in
- [ ] Right side: Live leaderboard (top 10)
- [ ] Update scores as rounds end

**Display: RESULT REVEAL**
```
Layout:
┌──────────────────────────────────┐
│ ROUND 1 RESULTS                  │
├──────────────────────────────────┤
│ 🤖 AI Recommended: B              │
│ "Đường B tránh được vùng ngập"   │
│                                  │
│ Player Choices:                  │
│ A: 20% ❌ (flood risk high)      │
│ B: 50% ✓ (best choice!)         │
│ C: 15% ❌ (traffic heavy)        │
│ D: 15% ❌ (unsafe route)         │
│                                  │
│ Updated Leaderboard:             │
│ 1. Player B - 220 pts            │
│ 2. Player A - 150 pts            │
│ 3. You - 120 pts                 │
└──────────────────────────────────┘
```

**Functionality:**
- [ ] Show AI recommendation (route letter + explanation)
- [ ] Display choice distribution (%)
- [ ] Show why route was recommended
- [ ] Highlight correct route (green)
- [ ] Show updated leaderboard
- [ ] Auto-advance to next round or end

**Display: FINAL RESULTS**
```
Layout:
┌──────────────────────────────────┐
│ 🎉 GAME OVER 🎉                  │
├──────────────────────────────────┤
│ 🏆 WINNER: Player A               │
│    Total Score: 250 pts           │
│                                  │
│ FINAL LEADERBOARD:                │
│ 1. 🥇 Player A - 250 pts         │
│ 2. 🥈 Player B - 220 pts         │
│ 3. 🥉 Player C - 200 pts         │
│ 4. Player D - 180 pts            │
│ 5. Player E - 150 pts            │
│ ... (all players)                │
│                                  │
│ [Scan QR to Play Again]          │
└──────────────────────────────────┘
```

**Functionality:**
- [ ] Display overall winner (name + score)
- [ ] Show complete final leaderboard
- [ ] Display medals (🥇🥈🥉) for top 3
- [ ] Auto-reset after 30 seconds (back to waiting)

### 3.4 Host Controls (Big Screen)

**Control Panel (on Big Screen):**
```
┌─────────────────────┐
│ HOST CONTROLS       │
├─────────────────────┤
│ [START GAME] →      │
│ Begin Round 1       │
│                     │
│ [NEXT ROUND] →      │
│ Move to Round 2     │
│                     │
│ [END GAME] →        │
│ Show final results  │
│                     │
│ [RESET] →           │
│ Clear all data      │
└─────────────────────┘
```

**Host Actions:**
- [ ] Click "START GAME" → broadcast 'game-started' event
- [ ] Click "NEXT ROUND" → move to Round 2 → broadcast 'round-started'
- [ ] Click "END GAME" → end game → show results → broadcast 'game-finished'
- [ ] Click "RESET" → clear room data → return to waiting screen

---

## 📊 PART 4: DATA SPECIFICATION

### 4.1 Pre-defined Routes (Hardcoded)

#### ROUND 1: FPT Cần Thơ → Multiple Destinations

```json
{
  "round": 1,
  "starting_point": "FPT Cần Thơ",
  "duration_seconds": 45,
  "routes": [
    {
      "letter": "A",
      "name": "Đường Hùng Vương",
      "destination": "Bến Ninh Kiều",
      "flood_risk": "high",
      "traffic_level": "heavy",
      "estimated_time": "12 phút",
      "ai_recommended": false,
      "description": "Khu vực này dễ ngập, đừng chọn"
    },
    {
      "letter": "B",
      "name": "Đường Mậu Thân",
      "destination": "Ninh Kiều Park",
      "flood_risk": "low",
      "traffic_level": "light",
      "estimated_time": "8 phút",
      "ai_recommended": true,
      "description": "Đường thoáng, không ngập, tuyến tốt nhất"
    },
    {
      "letter": "C",
      "name": "Đường Trần Hưng Đạo",
      "destination": "Cái Bè",
      "flood_risk": "medium",
      "traffic_level": "moderate",
      "estimated_time": "15 phút",
      "ai_recommended": false,
      "description": "Kéo dài, tuy an toàn nhưng lâu hơn"
    },
    {
      "letter": "D",
      "name": "Tuyến Ủy Sông Hậu",
      "destination": "Châu Đốc",
      "flood_risk": "high",
      "traffic_level": "heavy",
      "estimated_time": "25 phút",
      "ai_recommended": false,
      "description": "Nguy hiểm, tránh xa"
    }
  ]
}
```

#### ROUND 2: Fixed Starting Point → Goal

```json
{
  "round": 2,
  "starting_point": "Ninh Kiều Park (hoặc điểm gặp nhau khác)",
  "duration_seconds": 45,
  "routes": [
    {
      "letter": "A",
      "name": "Đường Sư Vạn Hạnh",
      "destination": "Chợ Lớn Cần Thơ",
      "flood_risk": "high",
      "traffic_level": "heavy",
      "estimated_time": "10 phút",
      "ai_recommended": false,
      "description": "Vùng ngập nước thường xuyên"
    },
    {
      "letter": "B",
      "name": "Đường Nguyễn Văn Cừ",
      "destination": "Cần Thơ Museum",
      "flood_risk": "low",
      "traffic_level": "light",
      "estimated_time": "7 phút",
      "ai_recommended": true,
      "description": "An toàn, nhanh, không ngập"
    },
    {
      "letter": "C",
      "name": "Đường Lê Hồng Phong",
      "destination": "Phong Điền",
      "flood_risk": "medium",
      "traffic_level": "moderate",
      "estimated_time": "18 phút",
      "ai_recommended": false,
      "description": "Dài hơn, đi vòng"
    },
    {
      "letter": "D",
      "name": "Tuyến Vĩnh Thạnh",
      "destination": "Long Xuyên",
      "flood_risk": "high",
      "traffic_level": "heavy",
      "estimated_time": "30 phút",
      "ai_recommended": false,
      "description": "Quá xa, quá lâu"
    }
  ]
}
```

### 4.2 Room Data Structure (In-Memory)

```typescript
interface RoomData {
  code: string;                    // "ABC123"
  status: 'waiting' | 'in_progress' | 'finished';
  current_round: 1 | 2;
  players: PlayerData[];
  start_time?: number;             // timestamp
  round_start_time?: number;       // when current round started
}

interface PlayerData {
  id: string;                      // socket.id
  name: string;                    // "John"
  total_score: number;             // sum of all rounds
  current_round_choice?: string;   // "A", "B", "C", "D"
  current_round_score?: number;
  selection_timestamp?: number;    // when they selected
  rank?: number;                   // 1, 2, 3, ...
}

interface GameResult {
  player_id: string;
  round: 1 | 2;
  choice: string;                  // "A" | "B" | "C" | "D"
  is_correct: boolean;
  points_awarded: number;
  speed_bonus: number;
  response_time: number;           // milliseconds
  ai_recommendation: string;
}
```

### 4.3 Data Flow (Example)

```
Player joins:
{
  "event": "join-room",
  "data": { "roomCode": "ABC123", "playerName": "Tôi" }
}
→ Backend: rooms['ABC123'].players.push({
    id: "socket_123",
    name: "Tôi",
    total_score: 0
  })
→ Broadcast: {
    "event": "player-joined",
    "data": { "playerName": "Tôi", "totalPlayers": 3 }
  }

Player selects route:
{
  "event": "select-route",
  "data": { "roomCode": "ABC123", "choice": "B" }
}
→ Backend: 
   - Record choice + timestamp
   - Check if "B" == ai_recommended ("B" → TRUE)
   - Calculate points: 100 + speed_bonus
   - Update player.total_score
   - Re-calculate leaderboard
→ Broadcast: {
    "event": "leaderboard-updated",
    "data": { "players": [{rank, name, score}, ...] }
  }
```

---

## 🎨 PART 5: UI/UX SPECIFICATIONS

### 5.1 Design Principles
- **Simple & Clear:** No unnecessary elements
- **Large Text:** Readable from distance (exhibition)
- **High Contrast:** Colors for accessibility
- **Mobile-First:** Optimize for small screens first
- **Fast Feedback:** Immediate response to clicks

### 5.2 Mobile UI (Portrait 375×812)
- Font sizes: 16px (body), 24px (headers), 32px (countdown)
- Button size: 60px height minimum (thumb-friendly)
- Padding: 20px between sections
- Colors: Blue (primary), Green (correct), Red (wrong/danger)

### 5.3 Big Screen UI (1920×1080)
- Font sizes: 32px (body), 48px (headers), 96px (countdown)
- Readable from 3-5 meters away
- Split layout: 50% info (left) + 50% leaderboard (right)
- Live update every 0.5 seconds

### 5.4 Color Scheme
```
Primary: #2196F3 (Blue)
Success: #4CAF50 (Green)
Danger: #F44336 (Red)
Warning: #FF9800 (Orange)
Background: #F5F5F5 (Light Gray)
Text: #212121 (Dark Gray)
```

### 5.5 Typography
- Font Family: System font (SF Pro / Segoe UI / Ubuntu)
- Round numbers: Bold, 32px
- Route names: Regular, 18px
- Countdown: Bold, 96px (big screen), 32px (mobile)

---

## 🔌 PART 6: TECHNICAL CONSTRAINTS & ASSUMPTIONS

### 6.1 Technology Stack
- **Backend:** NestJS + Socket.IO
- **Mobile:** React + Socket.IO Client
- **Display:** React + Socket.IO Client
- **Data:** JSON (hardcoded, in-memory)
- **No Database:** PostgreSQL not needed for MVP

### 6.2 Network
- **Mode:** Local WiFi or LAN
- **No Internet Required:** Works offline
- **Latency:** < 1 second ideal
- **Bandwidth:** Low (just text events)

### 6.3 Hardware
- **Mobile:** Any modern smartphone (iOS/Android)
- **Big Screen:** Laptop/desktop + projector
- **QR Scanner:** Phone camera
- **Server:** Any Linux VM (local or cloud)

### 6.4 Browser Support
- **Mobile:** Chrome, Safari (latest)
- **Desktop:** Chrome, Firefox, Safari
- **WebSocket:** Required

### 6.5 Performance Targets
- **Concurrent Players:** 10-50 without lag
- **Message Latency:** < 500ms
- **UI Render:** 60fps (smooth)
- **Memory:** < 100MB (backend)

---

## ✅ PART 7: MVP SUCCESS CRITERIA

### Minimum Viable Features (Must Have)
- [x] Players can join via QR code
- [x] Players can select route (A/B/C/D)
- [x] Game runs 2 complete rounds
- [x] Scoring works (correct = 100 pts)
- [x] Leaderboard updates live
- [x] Mobile UI is functional
- [x] Big screen displays leaderboard
- [x] Timer counts down accurately
- [x] Final winner announced
- [x] No crashes with 5+ concurrent players

### Nice-to-Have (Not MVP)
- Fancy animations on big screen
- Complex branching (branching paths)
- Beautiful UI design
- Sound effects
- Database persistence
- User authentication
- Analytics dashboard

### Success Metrics (Exhibition)
- ✅ Game playable end-to-end
- ✅ Can handle 20+ concurrent players
- ✅ Scores calculated correctly
- ✅ Runs for 2.5-3 minutes per game
- ✅ Visitors understand the message

---

## 🚀 PART 8: DEPLOYMENT & LAUNCH

### 8.1 Pre-Launch Checklist
- [ ] Backend server running locally
- [ ] Mobile app loads on real phone
- [ ] QR code scanner works
- [ ] All 4 routes display correctly
- [ ] Scoring matches expected values
- [ ] Leaderboard updates in real-time
- [ ] Big screen shows countdown
- [ ] Can play 2 full rounds
- [ ] Tested with 5+ concurrent players
- [ ] No crashes observed

### 8.2 Day-of Setup
```
1. Power on backend server
2. Open big screen React app on projector (fullscreen)
3. Have mobile phone ready for QR scanning
4. Test: 1 player joins, plays 2 rounds
5. Check: scoring, timer, leaderboard all working
6. Ready for exhibition!
```

### 8.3 Exhibition Execution
```
Host (Big Screen Operator):
- Click [START GAME] to begin
- Watch for players joining
- Click [NEXT ROUND] after Round 1 ends
- Click [END GAME] to show final results
- Click [RESET] to start new game
```

---

## 📞 PART 9: CLARIFICATIONS NEEDED

**Before coding, confirm these:**

1. **Route Data**
   - Do you have specific lat/lng coordinates for Can Tho locations?
   - Or use generic sample data (as provided above)?
   - Should all players use same routes both rounds?

2. **AI Recommendation**
   - Should route B ALWAYS be correct? (simplest)
   - Or should it vary between rounds?
   - What makes a route "AI recommended"? (lowest risk? fastest?)

3. **Scoring**
   - Is 100pts for correct + speed bonus sufficient?
   - Or do you want "beat the crowd" bonus (fewer people chose it)?
   - Max possible score per round: 130 pts (100 + 30 speed)?

4. **Branching**
   - Should Round 2 starting point depend on Round 1 choice?
   - For MVP: NO (all same starting point)
   - For future: YES (different paths open)

5. **Exhibition Setup**
   - Will you have WiFi? (or local LAN)
   - Projector/TV size? (affects text sizing)
   - Expected player count? (10 or 50?)
   - Demo duration? (2:30-3:00 per game)

6. **Message/Branding**
   - Should game include Mekong Pathfinder logo?
   - Final screen: should show partnership message?
   - QR code: links to Mekong Pathfinder website?

---

## 📝 SUMMARY TABLE

| Requirement | Specification |
|------------|---------------|
| **Game Duration** | 2:30 - 3:00 minutes |
| **Number of Rounds** | 2 |
| **Per Round Duration** | 45 seconds |
| **Selection Time** | 8 seconds (out of 45) |
| **Routes per Round** | 4 (A, B, C, D) |
| **Max Players** | 50 concurrent |
| **Starting Point** | FPT Cần Thơ |
| **AI Recommended Route** | Route B (always, MVP) |
| **Base Points (Correct)** | 100 |
| **Speed Bonus (Max)** | +30 |
| **Max Points per Round** | 130 |
| **Max Total Score** | 260 (2 rounds × 130) |
| **Scoring Wrong** | 0 points |
| **Tech Stack** | NestJS + React + Socket.IO |
| **Database** | None (in-memory JSON) |
| **Deployment** | Local server + LAN |
| **Dev Time** | 2-4 days (1 developer) |

---

## 🎯 FINAL CHECKLIST

### Before Starting Dev
- [ ] Understand all 2 rounds + 4 routes each
- [ ] Know scoring rules by heart
- [ ] Confirm with team: Route B always correct?
- [ ] Have list of 8 Vietnamese route names
- [ ] Know exhibition date & location
- [ ] Setup git repository

### During Dev
- [ ] Test every feature as you build
- [ ] Use console.log for debugging
- [ ] Commit code every 2 hours
- [ ] Test on real mobile phone daily
- [ ] Keep MVP scope (no extras)

### Before Exhibition
- [ ] Run full 2-round game 5 times (no crashes)
- [ ] Test with 5-10 concurrent players
- [ ] Verify scoring 100% accurate
- [ ] Check timer precision (45s ± 1s)
- [ ] Print QR code large
- [ ] Have backup phone ready

---

**GOOD LUCK! 🚀 You've got this!**
