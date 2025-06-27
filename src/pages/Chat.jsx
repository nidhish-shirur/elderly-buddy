import React, { useState, useRef, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  CircularProgress,
  Button,
  Chip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { chatService } from '../utils/chatService';
import SpeechButton from '../components/SpeechButton';

const Container = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  height: 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
  backgroundColor: '#F5F7FA',
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  overflowY: 'hidden',
  WebkitTapHighlightColor: 'transparent',
  '@supports (-webkit-touch-callout: none)': {
    height: '-webkit-fill-available'
  }
}));

const Navbar = styled(Box)(({ theme }) => ({
  backgroundColor: '#4A6FA5',
  color: 'white',
  padding: '16px',
  paddingTop: 'max(16px, env(safe-area-inset-top))',
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  position: 'sticky',
  top: 0,
  zIndex: 10,
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  minHeight: '60px',
  WebkitBackfaceVisibility: 'hidden',
  '@media (max-width: 600px)': {
    padding: '12px',
    paddingTop: 'max(12px, env(safe-area-inset-top))'
  }
}));

const ChatContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: '16px',
  overflowY: 'auto',
  overflowX: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  WebkitOverflowScrolling: 'touch',
  scrollBehavior: 'smooth',
  '-webkit-transform': 'translateZ(0)',
  transform: 'translateZ(0)',
  backfaceVisibility: 'hidden',
  perspective: 1000,
  '&::-webkit-scrollbar': {
    width: '8px',
    display: 'none'
  },
  '@media (min-width: 601px)': {
    '&::-webkit-scrollbar': {
      display: 'block'
    },
    '&::-webkit-scrollbar-track': {
      background: '#f1f1f1',
      borderRadius: '4px'
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#888',
      borderRadius: '4px',
      '&:hover': {
        background: '#555'
      }
    }
  },
  '@media (max-width: 600px)': {
    padding: '12px',
    gap: '12px',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none'
  }
}));

const QuickQuestionsContainer = styled(Box)(({ theme }) => ({
  padding: '16px',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  justifyContent: 'center',
  backgroundColor: '#fff',
  borderRadius: '12px',
  marginBottom: '16px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  overflowX: 'auto',
  WebkitOverflowScrolling: 'touch',
  '-webkit-transform': 'translateZ(0)',
  transform: 'translateZ(0)',
  '@media (max-width: 600px)': {
    padding: '12px 8px',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
    borderRadius: '8px',
    '&::-webkit-scrollbar': {
      display: 'none'
    },
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    WebkitMomentumScrolling: 'touch'
  }
}));

const QuickQuestionButton = styled(Chip)(({ theme }) => ({
  padding: '8px 16px',
  fontSize: '16px',
  fontWeight: 500,
  cursor: 'pointer',
  backgroundColor: '#E3F2FD',
  color: '#1976D2',
  height: 'auto',
  whiteSpace: 'normal',
  textAlign: 'center',
  WebkitTapHighlightColor: 'transparent',
  touchAction: 'manipulation',
  '&:hover': {
    backgroundColor: '#BBDEFB'
  },
  '&:active': {
    backgroundColor: '#90CAF9',
    transform: 'scale(0.98)'
  },
  '@media (max-width: 600px)': {
    fontSize: '14px',
    padding: '6px 12px',
    flexShrink: 0,
    minHeight: '32px'
  }
}));

const Message = styled(Paper)(({ isUser }) => ({
  padding: '12px 16px',
  maxWidth: '80%',
  alignSelf: isUser ? 'flex-end' : 'flex-start',
  backgroundColor: isUser ? '#4A6FA5' : 'white',
  color: isUser ? 'white' : '#2C3E50',
  borderRadius: '12px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  position: 'relative',
  wordBreak: 'break-word',
  WebkitHyphens: 'auto',
  hyphens: 'auto',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    [isUser ? 'right' : 'left']: -8,
    borderStyle: 'solid',
    borderWidth: '8px 8px 0 8px',
    borderColor: `${isUser ? '#4A6FA5' : 'white'} transparent transparent transparent`
  },
  '@media (max-width: 600px)': {
    maxWidth: '85%',
    padding: '10px 14px',
    fontSize: '15px'
  }
}));

const InputContainer = styled(Box)(({ theme }) => ({
  padding: '16px',
  backgroundColor: 'white',
  borderTop: '1px solid #E0E0E0',
  display: 'flex',
  gap: '8px',
  alignItems: 'flex-end',
  position: 'sticky',
  bottom: 0,
  zIndex: 10,
  boxShadow: '0 -2px 4px rgba(0,0,0,0.05)',
  paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
  '@media (max-width: 600px)': {
    padding: '12px 8px',
    paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
    gap: '6px'
  }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '24px',
    backgroundColor: '#F5F7FA',
    fontSize: '16px',
    '@media (max-width: 600px)': {
      fontSize: '16px',
      padding: '8px 14px',
      lineHeight: '1.3'
    }
  },
  '& .MuiOutlinedInput-input': {
    '@media (max-width: 600px)': {
      padding: '8px',
      caretColor: '#4A6FA5'
    }
  },
  '@media screen and (max-width: 600px)': {
    '& input, & textarea': {
      fontSize: '16px !important'
    }
  }
}));

const SendButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: '#4A6FA5',
  color: 'white',
  width: '40px',
  height: '40px',
  WebkitTapHighlightColor: 'transparent',
  touchAction: 'manipulation',
  '&:hover': {
    backgroundColor: '#3d5a84'
  },
  '&:active': {
    backgroundColor: '#2d4a74',
    transform: 'scale(0.95)'
  },
  '&.Mui-disabled': {
    backgroundColor: '#E0E0E0',
    color: '#9E9E9E'
  },
  '@media (max-width: 600px)': {
    width: '36px',
    height: '36px',
    minWidth: '36px',
    minHeight: '36px'
  }
}));

const commonQuestions = [
  { text: "What's my next medicine?", category: "medication" },
  { text: "How's the weather today?", category: "weather" },
  { text: "What's my schedule today?", category: "routine" },
  { text: "Show my water intake", category: "health" },
  { text: "Emergency contacts", category: "emergency" },
  { text: "What time is it?", category: "time" },
  { text: "Today's date", category: "date" },
  { text: "How are you feeling?", category: "general" }
];

const Chat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleQuickQuestion = (question) => {
    handleSendMessage(question);
  };

  const handleSendMessage = async (messageText = newMessage) => {
    if (!messageText.trim()) return;

    const userMessage = messageText;
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    setNewMessage('');
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage(userMessage, 
        messages.map(m => ({ role: m.isUser ? 'user' : 'assistant', content: m.text }))
      );

      if (response.success) {
        setMessages(prev => [...prev, { text: response.message, isUser: false }]);
      } else {
        setMessages(prev => [...prev, { 
          text: response.error || "I'm sorry, I couldn't process that request. Please try again.", 
          isUser: false 
        }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        text: "I'm sorry, something went wrong. Please try again later.", 
        isUser: false 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleTouchStart = (event) => {
    if (event.touches.length > 1) {
      event.preventDefault();
    }
  };

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    
    const fixViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    window.addEventListener('resize', fixViewportHeight);
    fixViewportHeight();

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('resize', fixViewportHeight);
    };
  }, []);

  return (
    <Container>
      <Navbar>
        <IconButton 
          color="inherit" 
          onClick={() => navigate(-1)}
          sx={{ 
            padding: { xs: '6px', sm: '8px' },
            WebkitTapHighlightColor: 'transparent',
            '& .MuiSvgIcon-root': {
              fontSize: { xs: '24px', sm: '28px' }
            }
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography 
          variant="h6"
          sx={{
            fontSize: { xs: '18px', sm: '20px' },
            fontWeight: 600,
            userSelect: 'none'
          }}
        >
          Chat Assistant
        </Typography>
      </Navbar>

      <ChatContainer 
        ref={chatContainerRef}
        sx={{ height: 'calc(100% - env(safe-area-inset-bottom))' }}
      >
        <QuickQuestionsContainer>
          {commonQuestions.map((question, index) => (
            <QuickQuestionButton
              key={index}
              label={question.text}
              onClick={() => handleQuickQuestion(question.text)}
              clickable
            />
          ))}
        </QuickQuestionsContainer>

        {messages.map((message, index) => (
          <Box 
            key={index} 
            sx={{ 
              display: 'flex', 
              justifyContent: message.isUser ? 'flex-end' : 'flex-start', 
              gap: 1,
              marginBottom: '4px'
            }}
          >
            <Message isUser={message.isUser}>
              <Typography sx={{ fontSize: { xs: '15px', sm: '16px' } }}>
                {message.text}
              </Typography>
            </Message>
            {!message.isUser && (
              <SpeechButton
                text={message.text}
                size="small"
                sx={{ 
                  alignSelf: 'flex-start',
                  '& .MuiSvgIcon-root': {
                    fontSize: { xs: '20px', sm: '24px' }
                  }
                }}
              />
            )}
          </Box>
        ))}
        
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} sx={{ color: '#4A6FA5' }} />
          </Box>
        )}
      </ChatContainer>

      <InputContainer>
        <StyledTextField
          fullWidth
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          multiline
          maxRows={4}
          inputProps={{
            enterKeyHint: 'send',
            'aria-label': 'Message input'
          }}
        />
        <SendButton 
          onClick={() => handleSendMessage()}
          disabled={!newMessage.trim() || isLoading}
          aria-label="Send message"
        >
          <SendIcon sx={{ fontSize: { xs: '20px', sm: '24px' } }} />
        </SendButton>
      </InputContainer>
    </Container>
  );
};

export default Chat; 