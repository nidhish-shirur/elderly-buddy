import axios from 'axios';

const OPENROUTER_API_KEY = '4356e6d9c9aaf0efab806524c38da0e976f46f988b6d5e7fcd910f8a51914f9d';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const systemPrompt = `You are a friendly and patient AI assistant designed specifically to help elderly users. Your role is to:
1. Use simple, clear language and avoid technical terms
2. Be patient and understanding
3. Provide step-by-step instructions when needed
4. Focus on safety and well-being
5. Offer reminders about medication, exercise, and healthy habits
6. Be empathetic and supportive
7. Speak in a warm, respectful tone
8. Break down complex information into digestible parts
9. Encourage social interaction and mental activity
10. Always prioritize user safety and recommend professional medical help when appropriate

Remember to:
- Speak clearly and concisely
- Be extra patient with repetitive questions
- Show empathy and understanding
- Encourage healthy habits
- Maintain a positive and supportive tone`;

export const chatService = {
  async sendMessage(message, conversationHistory = []) {
    try {
      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: message }
      ];

      const response = await axios.post(API_URL, {
        model: 'deepseek/deepseek-r1-distill-llama-70b:free',
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000,
        stream: false
      }, {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Elderly Assistant App',
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.choices && response.data.choices.length > 0) {
        return {
          success: true,
          message: response.data.choices[0].message.content,
          error: null
        };
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      console.error('Chat API Error:', error.response?.data || error.message);
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