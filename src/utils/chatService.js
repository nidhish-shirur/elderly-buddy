import axios from 'axios';
import { db } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth } from './firebase';

// Add debugging logs
console.log('Environment variables check:', {
  OPENROUTER_API_KEY: process.env.REACT_APP_OPENROUTER_API_KEY ? 'Present' : 'Missing',
  API_URL: process.env.REACT_APP_OPENROUTER_API_URL ? 'Present' : 'Missing'
});

const OPENROUTER_API_KEY = process.env.REACT_APP_OPENROUTER_API_KEY;
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

Example medication response:
"Time for your Livomyn now at 10:00 AM, just before breakfast."

Example general response:
"It's a lovely 72°F outside today."

Never provide generic examples when actual data is available.`;

export const chatService = {
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

  async sendMessage(message, conversationHistory = []) {
    if (!OPENROUTER_API_KEY) {
      return {
        success: false,
        message: null,
        error: 'OpenRouter API key is not configured. Please check your environment variables.'
      };
    }

    try {
      // Check if the message is asking about medications
      const medicationKeywords = ['medicine', 'medication', 'medicines', 'medications', 'pills', 'tablet', 'tablets', 'drug', 'drugs'];
      const isAskingAboutMedication = medicationKeywords.some(keyword => 
        message.toLowerCase().includes(keyword)
      );

      let contextInfo = '';
      if (isAskingAboutMedication) {
        const medicationData = await this.getMedicationInfo();
        if (medicationData) {
          const { routines, stock } = medicationData;
          
          if (routines.length > 0) {
            contextInfo = `[System: User's medication schedule:\n` +
              routines.map(med => 
                `- ${med.name} at ${med.time}${med.note ? ` (${med.note})` : ''}`
              ).join('\n');

            if (stock.length > 0) {
              contextInfo += `\n\nMedicine stock:\n` +
                stock.map(med =>
                  `- ${med.name}: ${med.quantity} units remaining${med.note ? ` (${med.note})` : ''}`
                ).join('\n');
            }
            
            contextInfo += ']\n\nPlease provide a personalized response based on this data.';
          } else {
            contextInfo = '[System: User has no medications scheduled. Suggest adding medications to their routine.]';
          }
        }
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