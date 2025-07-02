# 👵 Elderly Buddy

**Elderly Buddy** is a user-friendly React-based web application designed to assist elderly users in managing their daily routines, medication, health information, and family gallery.  
The app integrates an AI chatbot, health reminders, real-time weather/news updates, and emergency contact access to promote safety and independence.

---

## 🧰 Technology Stack

### 🔹 Frontend
- **React.js (v19.1.0)** – Dynamic and responsive UI framework  
- **Material-UI (MUI v7)** – Modern component library  
- **React Router (v6.21.1)** – Efficient navigation and routing  
- **Emotion** – CSS-in-JS styling for components  
- **React Icons** – Scalable vector icons

### 🔹 Backend & Database
- **Firebase (v10.7.1)** – Authentication, Firestore (database), and Storage

### 🔹 Additional Libraries
- **Axios** – HTTP client for API requests  
- **date-fns** – Lightweight date utility library  
- **React Firebase Hooks** – Simplified Firebase integration

---

## 🌐 External APIs Used

- **TheNewsAPI** – For showing live news headlines on the dashboard  
- **WeatherAPI.com** – To fetch real-time weather updates  
- **OpenRouter (DeepSeek R1 Model)** – Chatbot responses using a free LLM  
- **Web Speech API** – Native browser API for speech synthesis (text-to-voice)

---

## ✨ Features

- 🔐 **Login/Registration** – Secure sign-up/login via Firebase  
- 👤 **Profile Page** – View and edit personal and health information  
- 🏠 **Home Dashboard** – Centralized access to reminders and tools  
- 💬 **Greeting & Tip** – Daily greeting with wellness advice  
- 🌦️ **Weather Widget** – Real-time local weather  
- 💧 **Water Tracker** – Log daily water intake  
- 📅 **Today's Reminders** – Daily meds and schedule overview  
- 🎉 **Birthday/Anniversary Reminder** – Alerts for special occasions  
- 📰 **Latest News** – Daily news with images and timestamps  
- 🤖 **Chat Assistant** – Ask questions to an AI-powered assistant  
- 📆 **Upcoming Schedule** – View your day's planned tasks  
- 💊 **Medication Tracker** – View meds by time, stock, and routine  
- 📸 **Family Gallery** – Photos of loved ones with dates and relation  
- 🚨 **Emergency SOS** – One-tap access to emergency contacts  
- ♿ **Accessibility Friendly** – Large fonts and high-contrast UI

---

## 🛠️ Setup and Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/nidhish-shirur/elderly-buddy.git
   cd elderly-buddy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Create a `.env` file in the root directory
   - Add the following configurations:
     ```
     REACT_APP_FIREBASE_API_KEY=AIzaSyCAnifgRO9VnKHGxiQXBo1VWZT1v_27oUg
     REACT_APP_FIREBASE_AUTH_DOMAIN=elderlyassistant-31e55.firebaseapp.com
     REACT_APP_FIREBASE_PROJECT_ID=elderlyassistant-31e55
     REACT_APP_FIREBASE_STORAGE_BUCKET=elderlyassistant-31e55.appspot.com
     REACT_APP_FIREBASE_MESSAGING_SENDER_ID=568035993669
     REACT_APP_FIREBASE_APP_ID=1:568035993669:web:08d64f93807de09ab65b2c
     ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

---

## 🚀 Deployment Link
https://elderly-buddy.vercel.app/

Demo Credentials:
    - Email: user1@gmail.com
    - Password: user1234

---

## 📊 System Architecture
![image alt](https://github.com/nidhish-shirur/elderly-buddy/blob/2ffdfda4788b6068489b3300ef97e099677ab60c/ElderlyBuddy%20(1).png)

---

## 📱 User Interface
![image alt](https://github.com/nidhish-shirur/elderly-buddy/blob/7ebc789a61fd61fd59fb06150ccda65b2c02012c/WhatsApp%20Image%202025-07-01%20at%2019.47.47_3610bff6.jpg)
![image alt]()
![image alt]()
![image alt]()
![image alt]()
---

## 👥 Team Members and Contributions

- **Nidhish Shirur**
  - Figma prototype
  - Firebase integration
  - Chatbot and voice integration
  - UI/UX design
  - Testing
  - Deployment

- **Neha Bhatia**
  - Figma prototype
  - UI/UX design
  - Weather and News API integration
  - Testing
  - Project Presentation

---

## 🔮 Future Roadmap

- **Nearby Facilities** – Show nearest hospitals and pharmacies
- **Document Uploads** – Upload and organize reports & prescriptions
- **Multilingual Support** – Interface in regional languages
- **Barcode Scanner** – Scan medicines for quick info
- **Video Chat** – Connect with family or doctors
- **Expense Tracker** – Log medical and home expenses
- **Voice Assistant** – Hands-free voice-based navigation
- **Diet Planner** – Suggest meals based on health data

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check [issues page](issues-link).

## 📧 Contact

For any queries or support, please contact:
- Nidhish Shirur: shirurnidhish2005@gmail.com
- Neha Bhatia: discovernehabhatia@gmail.com
