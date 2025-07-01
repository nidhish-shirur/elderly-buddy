import React, { useState, useRef, useLayoutEffect } from 'react';
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
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
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
  },
  [theme.breakpoints.up('sm')]: {
    padding: '8px'
  }
}));

const Navbar = styled(Box)(({ theme }) => ({
  backgroundColor: '#4A6FA5',
  color: 'white',
  padding: '12px 8px',
  paddingTop: 'max(12px, env(safe-area-inset-top))',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  position: 'sticky',
  top: 0,
  zIndex: 10,
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  minHeight: '56px',
  [theme.breakpoints.up('sm')]: {
    padding: '16px',
    minHeight: '64px',
    gap: '16px'
  }
}));

const ChatContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: '12px 8px',
  overflowY: 'auto',
  overflowX: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  WebkitOverflowScrolling: 'touch',
  scrollBehavior: 'smooth',
  '-webkit-transform': 'translateZ(0)',
  transform: 'translateZ(0)',
  backfaceVisibility: 'hidden',
  perspective: 1000,
  '&::-webkit-scrollbar': {
    width: '6px',
    display: 'none'
  },
  [theme.breakpoints.up('sm')]: {
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
    },
    padding: '16px',
    gap: '16px'
  }
}));

const QuickQuestionsContainer = styled(Box)(({ theme }) => ({
  padding: '8px',
  display: 'flex',
  flexWrap: 'nowrap',
  gap: '8px',
  justifyContent: 'flex-start',
  backgroundColor: '#fff',
  borderRadius: '8px',
  marginBottom: '12px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  overflowX: 'auto',
  WebkitOverflowScrolling: 'touch',
  '-webkit-transform': 'translateZ(0)',
  transform: 'translateZ(0)',
  '&::-webkit-scrollbar': {
    display: 'none'
  },
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
  [theme.breakpoints.up('sm')]: {
    padding: '16px',
    flexWrap: 'wrap',
    justifyContent: 'center',
    borderRadius: '12px',
    marginBottom: '16px'
  }
}));

const QuickQuestionButton = styled(Chip)(({ theme }) => ({
  padding: '6px 12px',
  fontSize: '14px',
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
  [theme.breakpoints.up('sm')]: {
    fontSize: '16px',
    padding: '8px 16px',
    minHeight: '40px'
  }
}));

const Message = styled(Paper)(({ isUser, theme }) => ({
  padding: '10px 14px',
  maxWidth: '85%',
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
  [theme.breakpoints.up('sm')]: {
    maxWidth: '80%',
    padding: '12px 16px',
    fontSize: '16px'
  }
}));

const InputContainer = styled(Box)(({ theme }) => ({
  padding: '12px 8px',
  backgroundColor: 'white',
  borderTop: '1px solid #E0E0E0',
  display: 'flex',
  gap: '6px',
  alignItems: 'flex-end',
  position: 'sticky',
  bottom: 0,
  zIndex: 11,
  boxShadow: '0 -2px 4px rgba(0,0,0,0.05)',
  paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
  [theme.breakpoints.up('sm')]: {
    padding: '16px',
    gap: '8px',
    paddingBottom: 'max(16px, env(safe-area-inset-bottom))'
  }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '24px',
    backgroundColor: '#F5F7FA',
    fontSize: '16px',
    padding: '6px 12px',
    [theme.breakpoints.up('sm')]: {
      padding: '8px 14px'
    }
  },
  '& .MuiOutlinedInput-input': {
    padding: '8px',
    caretColor: '#4A6FA5'
  },
  [theme.breakpoints.up('sm')]: {
    '& input, & textarea': {
      fontSize: '16px'
    }
  }
}));

const SendButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: '#4A6FA5',
  color: 'white',
  width: '36px',
  height: '36px',
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
  [theme.breakpoints.up('sm')]: {
    width: '40px',
    height: '40px'
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
  { text: "What's today's headlines?", category: "news" }
];

// News API integration function
const fetchNewsHeadlines = async () => {
  try {
    // Try India first
    let response = await fetch(
      `https://newsapi.org/v2/top-headlines?country=in&pageSize=5&apiKey=${process.env.REACT_APP_NEWS_API_KEY}`
    );
    let data = await response.json();
    if (data.status === "ok" && Array.isArray(data.articles) && data.articles.length > 0) {
      return data.articles.map((a, i) => `${i + 1}. ${a.title}`).join('\n');
    } else {
      // Fallback to global
      response = await fetch(
        `https://newsapi.org/v2/top-headlines?language=en&pageSize=5&apiKey=${process.env.REACT_APP_NEWS_API_KEY}`
      );
      data = await response.json();
      if (data.status === "ok" && Array.isArray(data.articles) && data.articles.length > 0) {
        return data.articles.map((a, i) => `${i + 1}. ${a.title}`).join('\n');
      }
    }
    return "Sorry, I couldn't fetch the news headlines right now.";
  } catch {
    return "Sorry, I couldn't fetch the news headlines right now.";
  }
};

const Chat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const chatContainerRef = useRef(null);
  const containerRef = useRef(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useLayoutEffect(() => {
    scrollToBottom();
  }, [messages]);

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utter = new window.SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utter);
    }
  };

  useLayoutEffect(() => {
    if (!autoSpeak) return;
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg.isUser) {
      speak(lastMsg.text);
    }
    // eslint-disable-next-line
  }, [messages, autoSpeak]);

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
      // News API integration for news-related queries
      if (
        /headline|news/i.test(userMessage) ||
        userMessage.trim().toLowerCase() === "what's today's headlines?" ||
        userMessage.trim().toLowerCase() === "what are today's headlines?"
      ) {
        const newsReply = await fetchNewsHeadlines();
        setMessages(prev => [...prev, { text: newsReply, isUser: false }]);
        setIsLoading(false);
        return;
      }

      const response = await chatService.sendMessage(
        userMessage,
        messages.map(m => ({ role: m.isUser ? 'user' : 'assistant', content: m.text })),
        { noMarkdown: true } // Add this option if your backend supports it
      );

      let replyText = response.message;
      // Remove asterisks used for markdown bold/italic
      if (typeof replyText === 'string') {
        replyText = replyText.replace(/\*+/g, '');
      }

      if (response.success) {
        setMessages(prev => [...prev, { text: replyText, isUser: false }]);
      } else {
        // Fallback: Try to get a general answer from a public API
        try {
          const fallback = await chatService.generalAnswer(userMessage);
          let fallbackText = fallback && fallback.message ? fallback.message : '';
          if (typeof fallbackText === 'string') {
            fallbackText = fallbackText.replace(/\*+/g, '');
          }
          if (fallback && fallback.success) {
            setMessages(prev => [...prev, { text: fallbackText, isUser: false }]);
          } else {
            setMessages(prev => [
              ...prev,
              {
                text:
                  fallback?.error
                    ? fallback.error.replace(/\*+/g, '')
                    : "I'm sorry, I couldn't process that request. Please try again.",
                isUser: false
              }
            ]);
          }
        } catch (fallbackError) {
          setMessages(prev => [
            ...prev,
            {
              text: "I'm sorry, I couldn't process that request. Please try again.",
              isUser: false
            }
          ]);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [
        ...prev,
        {
          text: "I'm sorry, something went wrong. Please try again later.",
          isUser: false
        }
      ]);
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

  // Remove dynamic height adjustment causing the issue
  useLayoutEffect(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
    };
  }, []);

  return (
    <Container ref={containerRef}>
      <Navbar role="navigation">
        <IconButton 
          color="inherit" 
          onClick={() => navigate(-1)}
          sx={{ 
            padding: '6px',
            WebkitTapHighlightColor: 'transparent',
            '& .MuiSvgIcon-root': { fontSize: '24px' }
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography 
          variant="h6"
          sx={{
            fontSize: '18px',
            fontWeight: 600,
            userSelect: 'none'
          }}
        >
          Chat Assistant
        </Typography>
      </Navbar>

      {/* Speaker toggle button */}
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, pt: 1, pb: 0 }}>
        <Button
          variant={autoSpeak ? 'contained' : 'outlined'}
          color="primary"
          startIcon={autoSpeak ? <VolumeUpIcon /> : <VolumeOffIcon />}
          onClick={() => setAutoSpeak(v => !v)}
          sx={{ borderRadius: 4, minWidth: 0, px: 2, fontWeight: 500 }}
        >
          {autoSpeak ? 'Speaker On' : 'Speaker Off'}
        </Button>
      </Box>

      <ChatContainer 
        ref={chatContainerRef}
        id="chat-container"
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
              <Typography sx={{ fontSize: '15px' }}>
                {message.text}
              </Typography>
            </Message>
            {!message.isUser && (
              <SpeechButton
                text={message.text}
                size="small"
                sx={{ 
                  alignSelf: 'flex-start',
                  '& .MuiSvgIcon-root': { fontSize: '20px' }
                }}
              />
            )}
          </Box>
        ))}
        
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
            <CircularProgress size={20} sx={{ color: '#4A6FA5' }} />
          </Box>
        )}
      </ChatContainer>

      <InputContainer role="contentinfo">
        <StyledTextField
          fullWidth
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          multiline
          maxRows={3}
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
          <SendIcon sx={{ fontSize: '20px' }} />
        </SendButton>
      </InputContainer>
    </Container>
  );
};

export default Chat;