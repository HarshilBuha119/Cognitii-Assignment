# Cognitii React Native Assignment

Interactive fruit tapping game built with React Native and Firebase.

## Objective Implemented

- Multiple fruits render together at predefined layout slots every 1 second.
- Child taps only the selected target fruit.
- All taps are tracked with coordinates and classification.
- Session metrics and detailed interaction events are stored in Firestore.
- Bonus Option A implemented: front camera image capture every 500ms while target fruit is visible.

## Tech Stack

- React Native 0.85.1
- React 19
- React Navigation (stack + bottom tabs)
- Firebase Firestore and Firebase Storage
- react-native-vision-camera (bonus capture)
- react-native-orientation-locker

## Setup Instructions

### 1) Install dependencies

- npm install

### 2) Android setup

- Ensure Firebase Android config file exists at android/app/google-services.json
- Start Metro: npm start
- Run app: npm run android

### 3) iOS setup

- Ensure Firebase iOS plist is configured in Xcode project
- Install pods:
	- bundle install
	- bundle exec pod install
- Start Metro: npm start
- Run app: npm run ios

## Firebase Notes

- Firestore collection used: sessions
- Storage path for camera captures:
	- sessions/{sessionId}/camera_{timestamp}.jpg

## Firestore Session Schema

Each game saves one document in sessions with fields:

- createdAt: server timestamp
- sessionId: stable session identifier per game round
- targetFruit: selected target fruit
- level: 1
- durationMs: 120000
- stats:
	- totalTaps
	- correctTaps
	- incorrectTaps
	- backgroundTaps
	- accuracy
- taps: array of tap events with coordinates and tap type
- fruitSpawns: array of spawned fruit records with
	- id, type, isTarget, x, y, visibleAt, disappearedAt
- cameraCaptures: array of Firebase Storage download URLs

## Assumptions

- Level implementation in this assignment is Level 1 only.
- Fruits remain visible for one interval window, then a fresh batch appears.
- Four fruit slots are used to match consistent child-friendly spacing from design.
- If camera permission is denied, gameplay and tap tracking continue; only camera capture is skipped.

## Key Architecture Decisions

- Core game timing constants and fruit generation utilities are isolated in src/utils/gameEngine.js.
- Camera capture logic is isolated in src/hooks/useTargetFruitCamera.js.
- Firestore writes are centralized in src/services/firestore.js.
- Game screen focuses on orchestration: timing, interactions, state updates, and persistence.
- History uses paginated loading to avoid unbounded reads as data grows.

## Performance Decisions

- FruitPlayArea and GameSidebar are memoized to reduce unnecessary rerenders.
- Spawn interval and timer interval are managed via refs with robust cleanup.
- Tap animation timeout is tracked and cleared on unmount to avoid stale updates.

## Assignment Deliverables Checklist

- GitHub repository: Included
- README with setup, assumptions, and decisions: Included
- Screen recording: To be attached separately during submission
- Submission email: To be sent to souvik@cognitii.com and hello@cognitii.com

## Troubleshooting

- If Android build fails after native dependency changes:
	- cd android
	- gradlew clean
	- cd ..
	- npm run android
- If Metro cache causes stale bundle:
	- npm start -- --reset-cache
