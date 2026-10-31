# Elderly Buddy

Elderly Buddy is an accessible React web application designed to help older adults manage everyday health, routine, communication, and emergency information. It combines Firebase authentication and cloud storage with an AI chat assistant, medication tracking, daily routines, water tracking, document storage, family information, weather, and news.

The interface uses large controls, clear labels, high-contrast colors, and browser text-to-speech support to make common tasks easier to discover and complete.

<div align="center">
  <img src="./ElderlyBuddy%20(1).png" alt="Elderly Buddy system architecture" width="800">
</div>

## Table of Contents

- [Key Features](#key-features)
- [Screenshots](#screenshots)
- [Technology Stack](#technology-stack)
- [Application Routes](#application-routes)
- [Architecture and Data Flow](#architecture-and-data-flow)
- [Detailed Project Implementation](#detailed-project-implementation)
- [Firebase Data Structure](#firebase-data-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Firebase Configuration](#firebase-configuration)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Accessibility and Browser Support](#accessibility-and-browser-support)
- [Deployment](#deployment)
- [Security and Privacy](#security-and-privacy)
- [Troubleshooting](#troubleshooting)
- [Future Roadmap](#future-roadmap)
- [Team](#team)
- [License](#license)
- [Contributing](#contributing)

## Key Features

### Authentication and Profile

- Register and sign in with Firebase Authentication.
- Protected application routes that redirect unauthenticated users to `/login`.
- Store and edit personal details, health information, and emergency contacts.
- Create a new user profile automatically after account registration.

### Home Dashboard

- Personalized greeting and health tip.
- Current weather based on the user's approximate IP location.
- Weather refresh and weather text-to-speech.
- Latest local news with article titles, summaries, and refresh support.
- Today's medication and routine overview.
- Water intake tracking.
- Quick navigation to important features.

### Medication Management

- Add, edit, complete, and delete medicine routines.
- Schedule medicines by date and time.
- Record dosage, instructions, and medicine categories.
- Track medicine stock and quantities.
- Review upcoming and completed medication entries.
- Use text-to-speech for medication details.

### Daily Routines

- Create daily or scheduled activities.
- Edit or delete routine entries.
- View routines in time order.
- Mark reminders as completed.
- Read the full routine aloud from the browser.

### AI Chat Assistant

- Ask questions through a conversation-style interface.
- Connect chat responses to personal medication, routine, water, and emergency data.
- Provide weather information when a question asks about the weather.
- Retrieve news headlines for news-related questions.
- Save conversations in Firestore.
- Read assistant responses aloud using the Web Speech API.
- Suggested topics help users begin a conversation quickly.

### Family Gallery and Emergency Support

- Maintain a list of family members with relationships and important dates.
- View family member details and birthdays.
- Read family information aloud.
- Store emergency contacts in the user's Firestore profile.
- Access contact details and emergency actions quickly.

### Document Management

- Upload documents to Firebase Storage.
- Store document metadata in Firestore.
- List uploaded documents for the signed-in user.
- Download or delete documents.
- Track resumable upload progress.

### Water Intake

- Log glasses of water throughout the day.
- Save daily progress in Firestore.
- Reset or update progress for the current day.
- Listen to daily intake information through text-to-speech.

## Screenshots

<p align="center">
  <img src="./UI%20screenshot%201" alt="Elderly Buddy screenshot 1" width="220">
  <img src="./UI%20screenshot%202" alt="Elderly Buddy screenshot 2" width="220">
  <img src="./UI%20screenshot%203" alt="Elderly Buddy screenshot 3" width="220">
</p>

<p align="center">
  <img src="./UI%20screenshot%204" alt="Elderly Buddy screenshot 4" width="220">
  <img src="./UI%20screenshot%205" alt="Elderly Buddy screenshot 5" width="220">
</p>

### Demonstration Video

- Family member picture uploading: https://youtu.be/Qi08Dhf3Tig

## Technology Stack

| Area | Technology |
|---|---|
| UI framework | React 19 |
| Component library | Material UI 7 |
| Routing | React Router 6 |
| Styling | Emotion and Material UI `styled` APIs |
| Authentication | Firebase Authentication |
| Database | Cloud Firestore |
| File storage | Firebase Storage |
| AI chat | OpenRouter API |
| Weather | WeatherAPI |
| News | TheNewsAPI |
| Speech | Web Speech API (`speechSynthesis`) |
| Barcode scanning | ZXing and `react-zxing` |
| HTTP requests | Axios and the browser Fetch API |
| Date utilities | `date-fns` |

## Application Routes

All routes except `/login` require authentication.

| Route | Page | Purpose |
|---|---|---|
| `/login` | Login | Sign in or create an account |
| `/` | Home | Dashboard, weather, news, routines, and water |
| `/profile` | Profile | View personal and health information |
| `/edit-profile` | Edit Profile | Update user details, health data, and contacts |
| `/routine` | Routine | Manage scheduled daily activities |
| `/medication` | Medication | Manage medicines and stock |
| `/chat` | Chat | AI assistant and conversation history |
| `/documents` | Documents | Upload and manage important files |
| `/family-gallery` | Family Gallery | View and manage family information |
| `/emergency` | Emergency | Access emergency details and contacts |

Unknown paths redirect to the dashboard when the user is authenticated and follow the protected-route login flow otherwise.

## Architecture and Data Flow

```text
Browser
  |
  | React Router
  v
React Application
  |-- AuthContext -> Firebase Authentication
  |-- Firestore     -> Profiles, routines, medicines, water, conversations
  |-- Storage       -> Uploaded documents
  |-- OpenRouter    -> AI-generated chat responses
  |-- WeatherAPI    -> Current local weather
  |-- TheNewsAPI    -> Latest headlines
  `-- Web Speech    -> Read-aloud functionality
```

Firebase authentication controls route access through `ProtectedRoute`. After a user signs in, the application loads user-specific records using the Firebase user ID (`uid`) as the key where applicable.

## Implementation Status

| Area | Status | Implementation detail |
|---|---|---|
| Document uploads | Implemented | Files are uploaded to Firebase Storage, metadata is stored in Firestore, upload progress is displayed, and the 10 MB limit is validated |
| Document viewing and deletion | Implemented | Existing documents can be opened, downloaded, or deleted from Storage and Firestore |
| Profile, medication, routines, and water tracking | Implemented | Account data is loaded and saved through Firebase Authentication and Cloud Firestore |
| AI chat | Implemented | OpenRouter responses use selected user context from Firestore |
| Weather and news | Implemented | External weather and news providers are used through API keys |
| Security hardening | Planned | Firebase Rules, API-key protection, data validation, audit logs, and privacy controls still require production hardening |
| Automated testing | Planned | The project currently has no discovered VS Code test suite; add focused unit and integration tests |
| Caregiver sharing | Planned | Family sharing, caregiver roles, and permissions are not yet implemented |
| Reminder notifications | Planned | Browser or push notifications and background delivery are not yet implemented |

## Detailed Project Implementation

The following section explains what is implemented in each part of the application and how the major features work.

### Application Entry Point

The application starts in `src/App.js`.

It configures:

- The Material UI theme, colors, buttons, cards, breakpoints, and typography
- `CssBaseline` for consistent browser default styles
- The Firebase authentication provider
- Date localization through the Material UI date picker adapter
- React Router navigation
- Protected routes

The application uses a warm brown primary theme and red colors for emergency actions. Rounded buttons and cards are configured globally so that the interface remains visually consistent across pages.

### Authentication and Session Management

Authentication is implemented in:

- `src/components/Login.jsx`
- `src/contexts/AuthContext.js`
- `src/components/ProtectedRoute.jsx`
- `src/utils/firebase.js`

#### Sign in

Existing users enter an email address and password. Firebase Authentication validates the credentials and creates an authenticated browser session.

#### Registration

The registration flow:

1. Checks that both password fields match.
2. Requires a password of at least six characters.
3. Creates a Firebase Authentication account.
4. Creates an initial Firestore user record at `users/{uid}`.
5. Initializes empty profile fields such as name, age, health information, and emergency-contact data.
6. Redirects the new user to the profile page.

#### Route protection

`AuthContext` listens to Firebase authentication-state changes through `onAuthStateChanged`.

`ProtectedRoute` checks the current session before rendering an application page. Unauthenticated users are redirected to `/login`, and the system stores the originally requested route so they can be returned there after signing in.

### Firebase Backend

Firebase provides three backend capabilities:

- **Firebase Authentication** manages users and login sessions.
- **Cloud Firestore** stores profiles, routines, medications, water intake, documents metadata, and chat-related data.
- **Firebase Storage** stores uploaded document files.

Records are associated with an account primarily through the Firebase `uid`. This means that medication routines, daily routines, water records, profile information, and documents can be loaded for only the signed-in user.

Typical data relationships are:

```text
Firebase user UID
  -> users/{uid}
  -> waterIntake/{uid}
  -> documents where userId == uid
  -> routines where userId == uid
  -> medicineRoutines where userId == uid
  -> medicineStock where userId == uid
```

Firestore queries use the `userId` field or the `uid` document key to separate account data. Production deployment should add Security Rules that enforce these ownership boundaries and validate stored fields.

### Home Dashboard

`src/pages/Home.jsx` is the primary dashboard.

It displays:

- A personalized greeting
- A wellness or motivational tip
- Current water intake
- Today's medication reminders
- Today's scheduled routines
- Current weather
- Latest Indian news
- Navigation shortcuts
- Text-to-speech controls

#### Weather information

The dashboard requests current weather from WeatherAPI. It normally resolves the location from the approximate public IP location and displays:

- Location
- Temperature in Celsius
- Feels-like temperature
- Weather condition
- Humidity
- Weather-based wellness advice

The weather request is refreshed periodically. A speech button reads the current temperature and conditions aloud.

#### News information

The dashboard retrieves recent headlines through TheNewsAPI. Headlines may include:

- Article title
- Publication information
- Description
- Image
- External article link

The list has loading, error, and refresh states so the dashboard can remain usable when the news provider is unavailable.

#### Today's medicine and routine summary

The dashboard loads records for the current Firebase user, queries the medicine and routine collections, sorts entries by time, and displays today's scheduled items.

Medication entries include:

- Medicine name
- Scheduled time
- Dosage or instructions
- Completion state, where available

Routine entries include:

- Activity or task name
- Scheduled time
- Date
- Completion state

### User Profile

`src/pages/Profile.jsx` loads the user's profile document from `users/{uid}` and displays personal and health information.

The profile can contain:

- First and last name
- Age
- Date of birth
- Height
- Weight
- Gender
- Blood group
- Blood pressure
- Allergies
- Family members
- Emergency contacts

The page also checks for incomplete health details and alerts the user when important fields have not been filled.

### Editing the Profile

`src/pages/EditProfile.jsx` allows a signed-in user to update profile and health data.

The edit page:

- Reads the current profile document
- Loads existing values into the form
- Updates only the requested profile fields through `updateDoc`
- Updates emergency contacts stored in the user document
- Returns the user to the profile display after saving

Profile changes become available immediately to emergency, family-gallery, chat, and dashboard features that read from `users/{uid}`.

### Medication Management

`src/pages/Medication.jsx` implements medicine schedules and medicine stock.

#### Medicine routines

A medicine routine can contain:

- Medicine name
- Time
- Date or everyday schedule
- Dosage
- Instructions
- Medicine category or notes

Users can:

- Add medicine reminders
- Edit existing reminders
- Delete existing reminders
- Mark medicines as taken
- View medicines ordered by schedule time
- Read medication details aloud

Records are stored in the `medicineRoutines` collection. Queries filter by `userId` so each user's schedules remain separate.

#### Medicine stock

Medicine stock records are stored separately in `medicineStock`.

Stock tracking includes:

- Medicine name
- Quantity
- Dosage or packaging information
- Category
- Notes

When adding stock, the page searches for an existing matching stock record. If one exists, it updates the record; otherwise, it creates a new Firestore document.

#### Barcode support

`src/components/BarcodeScanner.jsx` integrates the ZXing barcode library through `react-zxing`.

The scanner component provides barcode input support for the medication workflow. A complete external product lookup would require an additional medicine or barcode database API.

#### Current implementation limitation

Medication tracking is intended to help users organize personal schedules. It does not replace professional medication management software, verified drug databases, pharmacist guidance, or clinical interaction checks.

### Daily Routine Management

`src/pages/Routine.jsx` manages daily activities and non-medication reminders.

Each routine can contain:

- Activity name
- Scheduled date
- Scheduled time
- Completion state

Users can:

- Create routines
- Edit routines
- Complete routines
- Delete routines
- Sort activities by time
- Read the complete daily routine aloud

Routine records use:

```text
routines/{routineId}
```

The current user's UID is stored as the `userId`, and routine queries filter on that value. Routines created by the chat page also use this collection unless chat recognizes the entry as medication-related.

### Water Intake Tracking

The reusable implementation is in `src/components/WaterIntake.jsx`.

Water progress is stored in:

```text
waterIntake/{uid}
```

The stored record includes:

- Number of glasses
- The current date as a string

When the page loads, it:

1. Finds the user's water document.
2. Checks whether the document belongs to the current day.
3. Loads the existing glass count.
4. Creates a new zero-count record if there is no record for today.

The increase action updates the record in Firestore. Text-to-speech can read the current progress aloud.

### AI Chat Assistant

The chat interface is implemented in `src/pages/Chat.jsx`, while API and Firebase context logic is primarily in `src/utils/chatService.js`.

#### Context-aware chat

Before answering, the chat service can retrieve:

- The user's profile
- Medication routines
- Medicine stock
- Daily routines
- Water intake
- Emergency contacts
- Current time
- Current weather, for weather-related questions

The service detects query categories and adds relevant Firebase information to the prompt before calling OpenRouter.

This lets users ask questions such as:

- “What medicine is scheduled today?”
- “When is my next routine?”
- “Show my water intake.”
- “What are my emergency contacts?”
- “What is the weather?”

#### Reminder creation through chat

The chat recognizes simple commands such as:

```text
remind me to walk at 7 pm
remind me to take medicine at 9 am tomorrow
```

The process is:

1. Detect the `remind me to` command.
2. Extract the activity text.
3. Parse the time.
4. Detect `today` or `tomorrow` where specified.
5. Convert 12-hour formats such as `7 pm` to `19:00`.
6. Open a confirmation dialog.
7. Create a routine document or a medicine-routine document.

Medication commands are identified through words such as medicine, tablet, pill, dose, capsule, syrup, or injection.

#### News answers

Chat handles news questions separately. It requests top headlines and returns a numbered list of headline titles.

It first requests India-based headlines, and it attempts a global English-headline fallback if Indian news is unavailable.

#### Speech output

Assistant responses can be:

- Read individually with a speech button
- Spoken automatically when auto-speak is enabled

The speech action uses the browser Web Speech API. Availability and voice quality depend on the installed browser and operating system voices.

### Family Gallery

`src/pages/FamilyGallery.jsx` stores family information inside:

```text
users/{uid}.familyMembers
```

Each family entry can contain:

- Name
- Relationship
- Birth date
- Image URL

The page supports:

- Adding family members
- Editing family members
- Deleting family members
- Viewing profile cards
- Estimating age from birth date
- Reading a family member's information aloud
- Updating family information in real time through a Firestore listener

The application converts Google Drive sharing links into direct image links where possible. Optimistic UI updates are used while Firestore writes are in progress, and failed writes restore the previous family list.

### Emergency Support

`src/pages/Emergency.jsx` provides emergency instructions and quick calling controls.

#### Emergency services

The emergency-services button opens:

```text
tel:112
```

The browser or operating system opens the device's telephone interface. The application itself does not place the call or monitor the emergency.

#### Personal contacts

The page loads `emergencyContacts` from the signed-in user's profile document. Each contact can contain:

- Name
- Relationship
- Phone number

Tapping a contact opens the appropriate `tel:` link. A separate speech button reads the contact count and individual contact details aloud.

The emergency page also provides basic instructions for staying calm, assessing immediate danger, and calling emergency services when required.

### Document Management

`src/pages/Documents.jsx` manages document uploads, file metadata, and Firebase Storage files.

Supported functionality includes:

- Selecting local files
- Assigning a document name
- Selecting a category
- Listing uploaded-document metadata
- Searching document names
- Sorting documents by upload date
- Viewing a document URL in a new browser tab
- Downloading a document URL
- Deleting an existing Storage file and its Firestore metadata

Available categories include:

- Medical Records
- Insurance Papers
- Prescriptions
- Other

Documents are expected to be stored under:

```text
documents/{uid}/{filename}
```

Firestore document metadata is stored in the `documents` collection and filtered by the user's `userId`.

The upload flow supports resumable Firebase Storage uploads and reports upload progress. Before uploading, the page validates the selected file, document name, and the 10 MB file-size limit. Each file receives a unique Storage filename to prevent users from overwriting documents that share the same original name. The document URL, metadata, category, original filename, size, MIME type, and timestamp are then saved to Firestore.

### Text-to-Speech Module

Reusable speech controls are implemented in:

- `src/components/SpeechButton.jsx`
- `src/utils/speechService.js`

They use the Web Speech API through `window.speechSynthesis` and `SpeechSynthesisUtterance`.

The controls read:

- Weather summaries
- Medication details
- Daily routines
- Emergency instructions
- Emergency contacts
- Family member details
- Chat responses
- Water intake totals

Speech synthesis requires a browser with Web Speech support and an available language voice on the user's system.

### Application Routing

The route structure is:

| Route | Page | Access |
|---|---|---|
| `/login` | Sign in and registration | Public |
| `/` | Dashboard | Protected |
| `/profile` | View profile | Protected |
| `/edit-profile` | Edit profile | Protected |
| `/routine` | Routine manager | Protected |
| `/medication` | Medication manager | Protected |
| `/chat` | AI chat | Protected |
| `/documents` | Document management | Protected |
| `/family-gallery` | Family gallery | Protected |
| `/emergency` | Emergency support | Protected |

Unknown paths redirect to the dashboard, which then applies authentication checks if necessary.

### Technology and Build Flow

The application runtime is:

```text
Browser
  -> React components
  -> React Router
  -> Authentication context
  -> Protected route guards
  -> Firebase Authentication
  -> Firestore and Firebase Storage
  -> Weather, news, and OpenRouter APIs
  -> Material UI interface
  -> Browser text-to-speech
```

The main technologies are:

- React 19
- Create React App
- Material UI 7
- React Router 6
- Firebase Authentication, Firestore, and Storage
- Axios
- `date-fns`
- ZXing and `react-zxing`
- OpenRouter
- WeatherAPI
- TheNewsAPI
- Web Speech API

The optimized production build is generated with:

```bash
npm run build
```

## Firebase Data Structure

The application currently uses the following Firestore collections and records:

| Collection or document | Main purpose |
|---|---|
| `users/{uid}` | Profile, health details, family members, and emergency contacts |
| `routines/{routineId}` | Daily activities and reminders |
| `medicineRoutines/{medicineId}` | Medicine schedules |
| `medicineStock/{stockId}` | Medicine quantities and stock information |
| `waterIntake/{uid}` | Current water-intake record |
| `documents/{documentId}` | Document metadata |
| Chat collections used by the chat page | Conversation history |

Uploaded documents are stored under a user-specific Firebase Storage path:

```text
documents/{uid}/{filename}
```

Configure Firestore rules and Storage rules before production use so users can read and change only records that belong to them.

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm 9 or newer
- A Firebase project with Authentication, Firestore, and Storage enabled
- API keys for the optional weather, news, and AI integrations

### Install and Run

1. Clone the repository:

   ```bash
   git clone https://github.com/nidhish-shirur/elderly-buddy.git
   cd elderly-buddy/elderly-assistant
   ```

   If you already have the project locally, open its `elderly-assistant` directory instead.

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create an environment file:

   ```bash
   # Windows PowerShell
   Copy-Item .env.example .env
   ```

   If `.env.example` is not included in your local checkout, create `.env` manually in the `elderly-assistant` directory.

4. Add your API keys as described below.

5. Start the development server:

   ```bash
   npm start
   ```

6. Open [http://localhost:3000](http://localhost:3000).

The development server reloads after source changes.

## Environment Variables

Create `.env` in the React project root and add:

```dotenv
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id

REACT_APP_WEATHER_API_KEY=your_weatherapi_key
REACT_APP_NEWS_API_KEY=your_thenewsapi_key
REACT_APP_OPENROUTER_API_KEY=your_openrouter_key
```

For Create React App, variables must begin with `REACT_APP_`. Restart `npm start` after changing `.env`.

### Environment Variable Notes

- Firebase browser configuration is public application configuration, but its associated Firebase Security Rules are responsible for access control.
- The current code contains a Firebase configuration fallback in `src/utils/firebase.js`. Using `.env` consistently is recommended.
- `REACT_APP_OPENROUTER_API_KEY` enables AI chat. Without it, the chat service reports that the API key is not configured.
- `REACT_APP_WEATHER_API_KEY` is used by the home weather widget.
- `REACT_APP_NEWS_API_KEY` is used by the home news section and news chat responses.
- Never commit real API keys or `.env` files. `.env` is already excluded by `.gitignore`.

## Firebase Configuration

1. Create or select a project in the [Firebase Console](https://console.firebase.google.com/).
2. Register a Web App and copy its configuration values.
3. Enable Email/Password authentication under **Authentication > Sign-in method**.
4. Create a Firestore database.
5. Enable Firebase Storage.
6. Apply restrictive Firestore and Storage rules.
7. Add the Firebase configuration to `.env`.

A minimum example of user-specific Firestore rules should require that the authenticated user's UID matches the requested user or record owner. Server-enforced validation should also cover document shapes and field types before production launch.

## Available Scripts

Run these commands from the `elderly-assistant` directory:

```bash
npm start       # Start the React development server
npm run build   # Create an optimized production build
npm test        # Run the configured React test runner
npm run eject   # Eject CRA configuration (one-way operation)
```

To verify a production build:

```bash
npm run build
npx serve -s build
```

## Project Structure

```text
elderly-assistant/
|-- public/
|   |-- index.html
|   `-- assets and PWA metadata
|-- src/
|   |-- App.js                    # Theme, routing, and providers
|   |-- index.js                  # React entry point
|   |-- index.css                 # Global styles
|   |-- components/
|   |   |-- Login.jsx             # Sign-in and registration
|   |   |-- ProtectedRoute.jsx    # Authentication guard
|   |   |-- BarcodeScanner.jsx    # Barcode input support
|   |   |-- SpeechButton.jsx      # Reusable text-to-speech control
|   |   `-- WaterIntake.jsx       # Daily water tracking
|   |-- contexts/
|   |   `-- AuthContext.js        # Current Firebase user state
|   |-- pages/
|   |   |-- Home.jsx
|   |   |-- Profile.jsx
|   |   |-- EditProfile.jsx
|   |   |-- Routine.jsx
|   |   |-- Medication.jsx
|   |   |-- Chat.jsx
|   |   |-- Documents.jsx
|   |   |-- FamilyGallery.jsx
|   |   `-- Emergency.jsx
|   `-- utils/
|       |-- firebase.js           # Firebase initialization
|       |-- chatService.js        # AI and contextual chat logic
|       `-- speechService.js      # Browser speech synthesis
|-- package.json
`-- README.md
```

## Accessibility and Browser Support

- Material UI controls provide keyboard navigation and form semantics.
- Large labels, generous spacing, and concise action text improve readability.
- Text-to-speech controls can read weather, schedules, medication details, emergency information, family data, and chat responses aloud.
- Speech synthesis requires a supported browser and may use voices installed on the operating system.
- Use a modern version of Chrome, Edge, or another current browser for the best experience.
- Microphone permissions are not required by the current text-based chat implementation.

## Deployment

### Firebase Hosting

1. Build the application:

   ```bash
   npm run build
   ```

2. Install and authenticate the Firebase CLI:

   ```bash
   npm install -g firebase-tools
   firebase login
   ```

3. Initialize hosting in the React project root and select the existing Firebase project:

   ```bash
   firebase init hosting
   ```

4. Choose `build` as the public directory and configure it as a single-page app.

5. Deploy:

   ```bash
   firebase deploy --only hosting
   ```

### Other Static Hosts

The `build` directory can also be deployed to Vercel, Netlify, or another static hosting provider. Configure the host to rewrite application routes to `index.html` for React Router.

Set all required `REACT_APP_*` variables in the hosting provider's environment settings before building.

## Security and Privacy

Elderly Buddy can store personal, family, medication, emergency, and document data. Before production or clinical use:

- Configure restrictive Firebase Authentication, Firestore, and Storage rules.
- Rotate any API keys that have been exposed in source control.
- Do not store real API secrets in client-side environment variables.
- Use server-side endpoints or trusted secret storage for sensitive third-party API calls.
- Add validation for all form and Firestore data.
- Use HTTPS and review provider retention and deletion policies.
- Add explicit consent and privacy notices for health, family, and emergency information.
- Review AI-generated responses before treating them as medical guidance.
- Ensure users can export or delete their personal data.

The assistant does not replace a doctor, emergency service, pharmacist, or professional caregiver.

## Troubleshooting

### Firebase authentication fails

- Confirm Email/Password authentication is enabled.
- Verify the Firebase configuration values.
- Confirm the user exists and the password meets Firebase requirements.
- Check browser console errors and Firebase Security Rules.

### Weather or news does not load

- Verify the matching API key.
- Restart the React development server after changing `.env`.
- Confirm the API provider account still has available quota.
- Check for browser network or CORS errors.

### AI chat reports that the API key is missing

- Add `REACT_APP_OPENROUTER_API_KEY` to `.env`.
- Restart the development server.
- Confirm the key has permission to access the selected model.

### A document cannot be uploaded

- Confirm Firebase Storage is enabled.
- Review Storage rules and user authentication.
- Confirm browser network connectivity and file size limits.

### Text-to-speech does not work

- Check whether the browser supports `speechSynthesis`.
- Confirm the operating system has an installed voice.
- Increase browser/system volume.
- Try a current browser version.

## Future Roadmap

- Nearby hospital, pharmacy, and public facility search
- Enhanced multilingual interface
- Calendar and reminder notifications
- Video calling with family members or caregivers
- Expense and medical bill tracking
- Diet and activity planning
- Improved document categorization and scanning
- Medication barcode lookup
- Voice-based navigation
- Caregiver and family account roles
- Audit logs and stronger data-export controls
- Backend service for protected API credentials

## Team

### Nidhish Shirur

- Figma prototype
- Firebase integration
- Chatbot and voice integration
- UI and UX design
- Testing
- Deployment
- Project documentation

### Neha Bhatia

- Figma prototype
- UI and UX design
- Weather and news integration
- Testing
- Project presentation

## License

This project does not currently include a license file in the repository.

## Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch:

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. Make focused changes and add tests where practical.
4. Run the build before submitting:

   ```bash
   npm run build
   ```

5. Open a pull request describing the problem, implementation, and verification performed.
