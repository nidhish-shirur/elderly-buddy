import React, { useState, useRef, useEffect } from 'react';
import { Box, Paper, TextField, IconButton, Typography, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import { chatService } from '../utils/chatService';
import SpeechButton from '../components/SpeechButton';

const ChatContainer = styled(Box)(({ theme }) => ({
  height: 'calc(100vh - 100px)',
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(2),
  gap: theme.spacing(2),
  maxWidth: '800px',
  margin: '0 auto'
}));

const MessageList = styled(Paper)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(2),
  overflowY: 'auto',
  backgroundColor: '#F8FAFC',
  borderRadius: '20px',
  '& .message': {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
    borderRadius: '15px',
    maxWidth: '80%',
    fontSize: '16px',
    lineHeight: 1.5
  },
  '& .user-message': {
    backgroundColor: '#E3F2FD',
    marginLeft: 'auto',
    color: '#1E3A8A'
  },
  '& .assistant-message': {
    backgroundColor: '#FFFFFF',
    marginRight: 'auto',
    color: '#1F2937',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  }
}));

const InputContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  alignItems: 'center',
  '& .MuiTextField-root': {
    flex: 1,
    '& .MuiInputBase-root': {
      borderRadius: '25px',
      fontSize: '16px',
      backgroundColor: '#FFFFFF'
    }
  },
  '& .MuiIconButton-root': {
    backgroundColor: '#2563EB',
    color: '#FFFFFF',
    width: '50px',
    height: '50px',
    '&:hover': {
      backgroundColor: '#1D4ED8'
    },
    '&.Mui-disabled': {
      backgroundColor: '#94A3B8',
      color: '#FFFFFF'
    }
  }
}));

const WelcomeMessage = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  color: '#64748B',
  marginBottom: theme.spacing(2),
  fontSize: '18px'
}));

const MessageBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '8px',
  '&.assistant-message': {
    justifyContent: 'flex-start',
    '& .message-content': {
      backgroundColor: '#E3F2FD',
      borderRadius: '15px 15px 15px 0',
    }
  },
  '&.user-message': {
    justifyContent: 'flex-end',
    '& .message-content': {
      backgroundColor: '#E8F5E9',
      borderRadius: '15px 15px 0 15px',
    }
  }
}));

const MessageContent = styled(Box)(({ theme }) => ({
  padding: '12px 16px',
  maxWidth: '80%',
  wordBreak: 'break-word',
  fontSize: '16px',
  lineHeight: 1.5,
}));

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message
    const newMessages = [
      ...messages,
      { role: 'user', content: userMessage }
    ];
    setMessages(newMessages);

    try {
      // Convert messages to format expected by chatService
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await chatService.sendMessage(userMessage, conversationHistory);

      if (response.success) {
        setMessages([
          ...newMessages,
          { role: 'assistant', content: response.message }
        ]);
      } else {
        setMessages([
          ...newMessages,
          { role: 'assistant', content: response.error }
        ]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'I apologize, but I had trouble responding. Could you please try again?' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <ChatContainer>
      <WelcomeMessage>
        Hello! I'm your friendly assistant. How can I help you today?
      </WelcomeMessage>
      
      <MessageList elevation={0}>
        {messages.map((message, index) => (
          <MessageBox
            key={index}
            className={message.role === 'user' ? 'user-message' : 'assistant-message'}
          >
            <MessageContent className="message-content">
              {message.content}
              {message.role === 'assistant' && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <SpeechButton 
                    text={message.content}
                    tooltipText="Listen to response"
                    size="small"
                  />
                </Box>
              )}
            </MessageContent>
          </MessageBox>
        ))}
        {isLoading && (
          <Box className="message assistant-message" sx={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={24} sx={{ color: '#2563EB' }} />
          </Box>
        )}
        <div ref={messagesEndRef} />
      </MessageList>

      <InputContainer>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your message here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          multiline
          maxRows={4}
          InputProps={{
            sx: { py: 1, px: 2 }
          }}
        />
        <IconButton
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          size="large"
        >
          <SendIcon />
        </IconButton>
      </InputContainer>
    </ChatContainer>
  );
};

export default Chat; 