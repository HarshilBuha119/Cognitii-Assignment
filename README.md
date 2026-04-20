# CognitiiGame

A React Native fruit-tapping game built for the Cognitii assignment. Children are shown multiple fruits on screen and instructed to tap only the target fruit. The app tracks every interaction and saves session data to Firebase Firestore.

---

## Prerequisites

- Node.js >= 18
- React Native CLI environment (not Expo)
- Android Studio with an emulator or physical Android device
- JDK 17


---

## Setup

**1. Clone and install dependencies**

```bash
git clone <repo-url>
cd Metvy-Assignment-main
yarn install
```

**2. Firebase**

The project is already connected to a Firebase project (`metvy-6ec37`). The `google-services.json` is included in `android/app/`. If you want to use your own Firebase project:

- Replace `android/app/google-services.json` with your own
- Enable **Firestore** in your Firebase console
- 
---

## Running the App

**Android**
```bash
yarn android
```

**Metro bundler (if not started automatically)**
```bash
yarn start
```

---

## How It Works

### Screens

| Screen | Description |
|---|---|
| **Home** | Select target fruit, view accuracy trends and recent sessions, tap Start Game |
| **Game** | The main tapping game — runs for 2 minutes in landscape |
| **Summary** | Shows accuracy, correct/incorrect/background taps after a session |
| **History** | Full list of past sessions with per-session stats |

### Game Mechanics

- The game runs for **2 minutes** in landscape orientation.
- Four fruits (Apple, Banana, Grape, Carrot) appear at fixed positions each second.
- Each round shuffles which fruit appears in which slot, with no fruit repeating the same slot consecutively.
- One fruit is the designated **target fruit** (selected on Home screen).
- A **3-2-1-GO!** countdown plays before the game starts.

### Tap Tracking

Every tap is categorised and recorded:

- **Correct** — tapped the target fruit
- **Incorrect** — tapped the wrong fruit
- **Background** — tapped empty space

### Camera (Bonus — Option A)

When the target fruit is visible on screen, the front camera captures a photo every **500ms** using `react-native-vision-camera`. Photos are saved to the device cache during the session. Once the session ends, the local file paths are stored in Firestore under `cameraCaptures`, and the cached files are then deleted from the device. Camera permission is requested on first launch. The camera preview is hidden (1×1px off-screen).

---

## Firestore Schema

Each session is stored as a document in the `sessions` collection:

```
sessions/{auto-id}
├── sessionId        string     — unique ID for the session (session_<timestamp>)
├── createdAt        timestamp  — server timestamp
├── targetFruit      string     — e.g. "Carrot"
├── level            number     — 1 (Level 1 only for now)
├── completed        boolean    — true if timer ran out, false if closed early
├── endedReason      string     — "completed" | "closed"
├── durationMs       number     — 120000 (2 minutes)
├── stats
│   ├── totalTaps      number
│   ├── correctTaps    number
│   ├── incorrectTaps  number
│   ├── backgroundTaps number
│   └── accuracy       number   — 0.0–1.0
├── taps             array
│   └── { timestamp, x, y, tapX, tapY, pageX, pageY, type, fruitId, fruitType, isTarget }
├── fruitSpawns      array
│   └── { id, type, isTarget, x, y, visibleAt, disappearedAt }
└── cameraCaptures   array      — local file paths of front-camera photos
```

---

## Project Structure

```
src/
├── screens/
│   ├── HomeScreen.js
│   ├── GameScreen.js
│   ├── SummaryScreen.js
│   └── HistoryScreen.js
├── components/
│   ├── game/         FruitPlayArea, GameSidebar
│   ├── home/         AccuracyTrendsCard, FruitSelector, HomeTopBar, RecentSessionCard
│   ├── history/      SessionHistoryCard, MetricPill
│   └── summary/      SummaryStatCard
├── hooks/
│   └── useTargetFruitCamera.js
├── services/
│   └── firestore.js
└── utils/
    ├── gameEngine.js   — fruit generation, game constants, accuracy calc
    ├── sessionData.js  — Firestore data mapping, chart data helpers
    └── clearCameraCache.js
assets/
├── images/   Apple.png, Banana.png, Carrot.png, Grape.png
└── fonts/    Fredoka, PlusJakartaSans, AnticDidone, Tapestry
```

---

## Assumptions

- Level 1 only — fruits stay on screen for 1 second before the next batch spawns.
- Four fruits always appear simultaneously (one per fixed position slot).
- Camera captures are taken during gameplay, stored temporarily in device cache, and their local paths are saved to Firestore. The cache is cleared after each session. No upload to Firebase Storage occurs — `@react-native-firebase/storage` is installed but not used.
- The app does not require authentication; all sessions are saved anonymously.

---

## Tech Decisions

- **react-native-vision-camera** for front-camera captures — chosen for its reliable `takePhoto` API and active maintenance.
- **@react-native-firebase/firestore** for real-time data — direct SDK, no backend needed.
- **react-native-reanimated** for smooth fruit bounce.
- **react-native-orientation-locker** to enforce portrait on Home/History and landscape during gameplay.
- **react-native-gifted-charts** for the accuracy trend bar chart on the Home screen.
- Fruit positions use fixed proportional slots rather than fully random coordinates so fruits never overlap and are comfortably tappable for children.
