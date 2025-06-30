import axios from 'axios';
import { db } from './firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth } from './firebase';
import { format } from 'date-fns';

// Add debugging logs
console.log('Environment variables check:', {
  OPENROUTER_API_KEY: process.env.REACT_APP_OPENROUTER_API_KEY ? 'Present' : 'Missing',
  API_URL: process.env.REACT_APP_OPENROUTER_API_URL ? 'Present' : 'Missing'
});

const OPENROUTER_API_KEY = process.env.REACT_APP_OPENROUTER_API_KEY;
const WEATHER_API_KEY = '4c2b6a2ce113429da6234648252506';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Add debugging for API key
console.log('API Key check:', {
  exists: !!OPENROUTER_API_KEY,
  length: OPENROUTER_API_KEY?.length,
  prefix: OPENROUTER_API_KEY?.substring(0, 8)
});

const systemPrompt = `You are a warm and concise AI assistant for elderly users. Your key rules:

1. Keep responses to one short, friendly sentence
2. Use gentle, positive language
3. No greetings or pleasantries
4. No emoji unless user uses them first
5. No suggestions or follow-up questions
6. Focus only on the immediate question asked

When providing information:
- Use exact data from the user's schedule
- Format times in 12-hour format (e.g., "8:00 AM")
- Include any notes or special instructions
- If no data is found, kindly suggest adding it to the schedule

Never provide generic examples when actual data is available.`;

export const chatService = {
  async getUserData() {
    try {
      const user = auth.currentUser;
      if (!user) return null;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) return null;

      return userDoc.data();
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  },

  async getMedicationInfo() {
    try {
      const user = auth.currentUser;
      if (!user) return null;

      // Get medicine routines
      const routinesRef = collection(db, 'medicineRoutines');
      const routinesQuery = query(
        routinesRef,
        where('userId', '==', user.uid)
      );
      const routinesSnapshot = await getDocs(routinesQuery);
      
      const medications = routinesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort medications by time
      medications.sort((a, b) => {
        const timeA = a.time || '00:00';
        const timeB = b.time || '00:00';
        return timeA.localeCompare(timeB);
      });

      // Get medicine stock
      const stockRef = collection(db, 'medicineStock');
      const stockQuery = query(
        stockRef,
        where('userId', '==', user.uid)
      );
      const stockSnapshot = await getDocs(stockQuery);
      
      const medicineStock = stockSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return {
        routines: medications,
        stock: medicineStock
      };
    } catch (error) {
      console.error('Error fetching medications:', error);
      return null;
    }
  },

  async getDailyRoutine() {
    try {
      const user = auth.currentUser;
      if (!user) return null;

      const routineRef = collection(db, 'routines');
      const routineQuery = query(
        routineRef,
        where('userId', '==', user.uid)
      );
      const routineSnapshot = await getDocs(routineQuery);
      
      const routines = routineSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort routines by time
      routines.sort((a, b) => {
        const timeA = a.time || '00:00';
        const timeB = b.time || '00:00';
        return timeA.localeCompare(timeB);
      });

      return routines;
    } catch (error) {
      console.error('Error fetching daily routine:', error);
      return null;
    }
  },

  async getWaterIntake() {
    try {
      const user = auth.currentUser;
      if (!user) return null;

      const waterRef = doc(db, 'waterIntake', user.uid);
      const waterDoc = await getDoc(waterRef);
      
      if (waterDoc.exists() && waterDoc.data().date === new Date().toDateString()) {
        return waterDoc.data();
      }
      return { glasses: 0, date: new Date().toDateString() };
    } catch (error) {
      console.error('Error fetching water intake:', error);
      return null;
    }
  },

  async getEmergencyContacts() {
    try {
      const userData = await this.getUserData();
      return userData?.emergencyContacts || [];
    } catch (error) {
      console.error('Error fetching emergency contacts:', error);
      return null;
    }
  },

  async getWeatherInfo() {
    try {
      // For now using a default location - in a real app, you'd get this from user's profile
      const response = await axios.get(
        `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=auto:ip&aqi=no`
      );
      
      if (response.data && response.data.current) {
        const current = response.data.current;
        const location = response.data.location;
        return {
          temp_c: current.temp_c,
          temp_f: current.temp_f,
          condition: current.condition.text,
          humidity: current.humidity,
          feelslike_c: current.feelslike_c,
          feelslike_f: current.feelslike_f,
          location: `${location.name}, ${location.region}`
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching weather:', error);
      return null;
    }
  },

  async sendMessage(message, conversationHistory = []) {
    if (!OPENROUTER_API_KEY) {
      return {
        success: false,
        message: null,
        error: 'OpenRouter API key is not configured. Please check your environment variables.'
      };
    }

    try {
      // Determine what kind of information is being requested
      const medicationKeywords = ['medicine', 'medication', 'medicines', 'medications', 'pills', 'tablet', 'tablets', 'drug', 'drugs'];
      const routineKeywords = ['schedule', 'routine', 'activity', 'activities', 'plan', 'today', 'tomorrow'];
      const waterKeywords = ['water', 'drink', 'hydration', 'thirsty'];
      const emergencyKeywords = ['emergency', 'contact', 'help', 'doctor', 'hospital'];
      const timeKeywords = ['time', 'now', 'current time'];
      const weatherKeywords = ['weather', 'temperature', 'forecast', 'outside', 'hot', 'cold', 'rain', 'sunny'];

      let contextInfo = '';
      
      // Always fetch weather info for relevant context
      if (weatherKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
        const weatherData = await this.getWeatherInfo();
        if (weatherData) {
          contextInfo += `\n\n[System: Current weather in ${weatherData.location}:
- Temperature: ${weatherData.temp_c}°C (${weatherData.temp_f}°F)
- Feels like: ${weatherData.feelslike_c}°C (${weatherData.feelslike_f}°F)
- Condition: ${weatherData.condition}
- Humidity: ${weatherData.humidity}%]`;
        }
      }

      // Check for medication info
      if (medicationKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
        const medicationData = await this.getMedicationInfo();
        if (medicationData) {
          const { routines, stock } = medicationData;
          
          if (routines.length > 0) {
            contextInfo += `[System: User's medication schedule:\n` +
              routines.map(med => 
                `- ${med.name} at ${med.time}${med.note ? ` (${med.note})` : ''}`
              ).join('\n');

            if (stock.length > 0) {
              contextInfo += `\n\nMedicine stock:\n` +
                stock.map(med =>
                  `- ${med.name}: ${med.quantity} units remaining${med.note ? ` (${med.note})` : ''}`
                ).join('\n');
            }
          } else {
            contextInfo += '[System: User has no medications scheduled.]';
          }
        }
      }

      // Check for daily routine
      if (routineKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
        const routineData = await this.getDailyRoutine();
        if (routineData && routineData.length > 0) {
          const activeRoutines = routineData.filter(routine => !routine.completed);
          const completedRoutines = routineData.filter(routine => routine.completed);
          
          contextInfo += '\n\n[System: User\'s daily schedule:';
          
          if (activeRoutines.length > 0) {
            contextInfo += '\nPending tasks:\n' +
              activeRoutines.map(routine => 
                `- ${routine.time}: ${routine.task}${routine.note ? ` (${routine.note})` : ''}`
              ).join('\n');
          }
          
          if (completedRoutines.length > 0) {
            contextInfo += '\n\nCompleted tasks:\n' +
              completedRoutines.map(routine => 
                `- ${routine.time}: ${routine.task}${routine.note ? ` (${routine.note})` : ''}`
              ).join('\n');
          }
          
          contextInfo += ']';
        } else {
          contextInfo += '\n\n[System: No tasks scheduled for today.]';
        }
      }

      // Check for water intake
      if (waterKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
        const waterData = await this.getWaterIntake();
        if (waterData) {
          contextInfo += `\n\n[System: Water intake today: ${waterData.glasses} glasses out of 8 recommended.]`;
        }
      }

      // Check for emergency contacts
      if (emergencyKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
        const contacts = await this.getEmergencyContacts();
        if (contacts && contacts.length > 0) {
          contextInfo += `\n\n[System: Emergency contacts:\n` +
            contacts.map(contact => 
              `- ${contact.name} (${contact.relationship}): ${contact.phoneNumber}`
            ).join('\n');
        } else {
          contextInfo += '\n\n[System: No emergency contacts found.]';
        }
      }

      // Check for time-related queries
      if (timeKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
        contextInfo += `\n\n[System: Current time: ${format(new Date(), 'h:mm a')}]`;
      }

      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: contextInfo ? `${message}\n\n${contextInfo}` : message }
      ];

      const requestData = {
        model: 'deepseek/deepseek-r1:free',
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000,
        stream: false
      };

      const response = await axios({
        method: 'post',
        url: API_URL,
        data: requestData,
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Elderly Assistant App'
        }
      });

      if (response.data?.choices?.[0]?.message?.content) {
        return {
          success: true,
          message: response.data.choices[0].message.content,
          error: null
        };
      } else {
        console.error('Invalid API response format:', response.data);
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      console.error('Chat API Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = 'Sorry, I had trouble understanding that. Could you please try again?';
      
      if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      }
      
      return {
        success: false,
        message: null,
        error: errorMessage
      };
    }
  }
}; 