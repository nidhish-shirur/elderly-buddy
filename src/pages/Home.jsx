import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { styled } from '@mui/material/styles';
import { Box, Typography, Button, IconButton, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, Paper, CircularProgress } from '@mui/material';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CloudIcon from '@mui/icons-material/Cloud';
import ThunderstormIcon from '@mui/icons-material/Thunderstorm';
import GrainIcon from '@mui/icons-material/Grain';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import WbCloudyIcon from '@mui/icons-material/WbCloudy';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import ChatIcon from '@mui/icons-material/Chat';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import EmergencyShareIcon from '@mui/icons-material/EmergencyShare';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import LogoutIcon from '@mui/icons-material/Logout';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DateRangeIcon from '@mui/icons-material/DateRange';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import InfoIcon from '@mui/icons-material/Info';
import SpeechButton from '../components/SpeechButton';
import { auth, db } from '../utils/firebase';
import { doc, getDoc, collection, query, getDocs, where } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import WaterIntake from '../components/WaterIntake';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';

const Container = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  backgroundColor: '#F5F7FA'
}));

const Navbar = styled(Box)(({ theme }) => ({
  backgroundColor: '#4A6FA5',
  color: 'white',
  padding: '16px 24px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  '@media (min-width: 1024px)': {
    padding: '20px 32px'
  }
}));

const ProfileSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  '& .MuiAvatar-root': {
    width: { xs: 48, sm: 56 },
    height: { xs: 48, sm: 56 },
    fontSize: { xs: 24, sm: 28 }
  },
  '& .MuiTypography-root': {
    fontSize: { xs: '20px', sm: '24px' },
    fontWeight: 600
  }
}));

const getWeatherTip = (condition, temp_c) => {
  if (temp_c > 30) {
    return "Stay cool and hydrated. Consider staying indoors during peak heat.";
  } else if (temp_c < 10) {
    return "Bundle up warmly if going outside. Keep your home heated.";
  }

  const conditionLower = condition.toLowerCase();
  if (conditionLower.includes('rain')) {
    return "Don't forget your umbrella and wear non-slip shoes.";
  } else if (conditionLower.includes('snow')) {
    return "Be careful of slippery paths. Wear warm, waterproof clothing.";
  } else if (conditionLower.includes('wind')) {
    return "Hold onto handrails when walking outside. Wind can affect balance.";
  } else if (conditionLower.includes('sunny') || conditionLower.includes('clear')) {
    return "Great day for a short walk! Don't forget sunscreen and a hat.";
  } else if (conditionLower.includes('cloud')) {
    return "Good conditions for outdoor activities. Carry a light jacket just in case.";
  } else if (conditionLower.includes('mist')) {
    return "Watch your step in mist - it can hide hazards. Use a cane if needed.";
  } else if (conditionLower.includes('fog')) {
    return "Stay indoors if fog is thick. Use lights if you must go out.";
  } else if (conditionLower.includes('thunderstorm')) {
    return "Stay inside during thunderstorms. Avoid water and electronics.";
  } else if (conditionLower.includes('haze')) {
    return "Limit outdoor time in haze. Wear a mask if air quality is poor.";
  }

  return "Take care and dress appropriately for the weather.";
};

const WeatherBox = styled(Paper)(({ theme }) => ({
  backgroundColor: 'white',
  color: '#2C3E50',
  padding: '16px',
  borderRadius: '16px',
  marginBottom: '24px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  overflow: 'hidden',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, #64B5F6 0%, #1976D2 100%)'
  },
  '& .weather-content': {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  '& .weather-main': {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 12px',
    background: 'rgba(25, 118, 210, 0.04)',
    borderRadius: '12px',
    flex: 1
  },
  '& .weather-icon': {
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #64B5F6 0%, #1976D2 100%)',
    '& .MuiSvgIcon-root': {
      fontSize: '28px',
      color: 'white'
    }
  },
  '& .weather-info': {
    flex: 1
  },
  '& .weather-temp': {
    fontSize: '28px',
    fontWeight: 600,
    color: '#2C3E50',
    lineHeight: 1.2,
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px'
  },
  '& .weather-unit': {
    fontSize: '16px',
    fontWeight: 500,
    color: '#1976D2'
  },
  '& .weather-condition': {
    fontSize: '16px',
    fontWeight: 500,
    color: '#1976D2',
    marginTop: '4px'
  },
  '& .weather-location': {
    fontSize: '14px',
    color: '#666',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginTop: '4px',
    '& .MuiSvgIcon-root': {
      fontSize: '14px',
      color: '#666'
    }
  },
  '& .weather-tip': {
    marginTop: '12px',
    padding: '8px 12px',
    background: 'rgba(25, 118, 210, 0.04)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    '& .MuiSvgIcon-root': {
      fontSize: '16px',
      color: '#1976D2',
      marginTop: '2px'
    }
  },
  '& .tip-text': {
    fontSize: '14px',
    color: '#2C3E50',
    fontWeight: 500,
    lineHeight: 1.4
  },
  '& .last-updated': {
    fontSize: '12px',
    color: '#666',
    marginTop: '8px',
    textAlign: 'right',
    fontStyle: 'italic'
  }
}));

const GreetingSection = styled(Paper)(({ theme }) => ({
  background: '#F5F7FA',
  padding: '32px',
  borderRadius: '24px',
  marginBottom: '32px',
  color: '#2C3E50',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  '& h1': {
    fontSize: '32px',
    marginBottom: '16px',
    fontWeight: '600',
    color: '#2C3E50'
  },
  '& p': {
    fontSize: '18px',
    color: '#5D7285',
    fontWeight: '400'
  },
  '@media (max-width: 600px)': {
    padding: '24px',
    '& h1': {
      fontSize: '28px'
    }
  }
}));

const MOTIVATIONAL_QUOTES = [
  {
    text: "Every day is a new opportunity to stay healthy and active!",
    category: "health"
  },
  {
    text: "Remember to take your medications on time - your health matters!",
    category: "medication"
  },
  {
    text: "A positive mindset leads to positive outcomes. You're doing great!",
    category: "motivation"
  },
  {
    text: "Stay connected with loved ones - they care about you!",
    category: "social"
  },
  {
    text: "Take a moment to breathe and enjoy the simple pleasures of life.",
    category: "wellness"
  },
  {
    text: "Your daily routine helps keep you strong and independent!",
    category: "routine"
  },
  {
    text: "Don't forget to drink water and stay hydrated today.",
    category: "health"
  },
  {
    text: "A gentle walk can brighten your day and boost your energy!",
    category: "activity"
  },
  {
    text: "You've got this! Every small step counts towards better health.",
    category: "motivation"
  },
  {
    text: "Remember to smile - it's the best medicine for the soul!",
    category: "wellness"
  },
  {
    text: "Eating well today keeps you strong for tomorrow!",
    category: "health"
  },
  {
    text: "Set a reminder for your pills - you're worth the care!",
    category: "medication"
  },
  {
    text: "Keep going - your strength inspires those around you!",
    category: "motivation"
  },
  {
    text: "Call a friend today - a chat can lift your spirits!",
    category: "social"
  },
  {
    text: "Rest when you need to - it’s okay to take it slow.",
    category: "wellness"
  },
  {
    text: "Stick to your routine - it’s the key to feeling good!",
    category: "routine"
  },
  {
    text: "A short stretch can work wonders for your body!",
    category: "activity"
  },
  {
    text: "Your family loves seeing you healthy and happy!",
    category: "family"
  },
  {
    text: "Fresh air today will refresh your mind and soul!",
    category: "wellness"
  },
  {
    text: "Believe in yourself - you’re stronger than you know!",
    category: "motivation"
  }
];

const GreetingContent = styled(Box)({
  position: 'relative',
  zIndex: 1,
  '& .MuiTypography-h4': {
    fontSize: '36px',
    fontWeight: 700,
    marginBottom: '20px',
    color: '#2C3E50',
    '@media (max-width: 480px)': {
      fontSize: '28px',
      marginBottom: '16px'
    }
  },
  '& .MuiTypography-h6': {
    fontSize: '24px',
    lineHeight: '1.4',
    fontWeight: 500,
    color: '#4A6FA5',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '24px',
    '@media (max-width: 480px)': {
      fontSize: '20px',
      gap: '8px',
      marginBottom: '20px'
    }
  },
  '& .quote-icon': {
    fontSize: '28px',
    color: '#4A6FA5',
    opacity: 0.7,
    marginTop: '4px',
    '@media (max-width: 480px)': {
      fontSize: '24px'
    }
  }
});

const GreetingPattern = styled(Box)({
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  background: 'linear-gradient(45deg, rgba(74, 111, 165, 0.05) 25%, transparent 25%, transparent 50%, rgba(74, 111, 165, 0.05) 50%, rgba(74, 111, 165, 0.05) 75%, transparent 75%, transparent)',
  backgroundSize: '100px 100px',
  opacity: 0.3
});

const TimeInfoBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  marginTop: '24px',
  color: '#4A6FA5',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  padding: '20px 24px',
  borderRadius: '16px',
  flexWrap: 'wrap',
  '& .MuiSvgIcon-root': {
    fontSize: '28px',
    color: '#4A6FA5',
    '@media (max-width: 480px)': {
      fontSize: '24px'
    }
  },
  '& .MuiTypography-root': {
    fontSize: '22px',
    fontWeight: 500,
    '@media (max-width: 480px)': {
      fontSize: '18px'
    }
  },
  '& .time-group, & .date-group': {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  '@media (max-width: 480px)': {
    padding: '16px 20px',
    gap: '12px'
  }
}));

const ButtonContainer = styled(Box)(({ theme }) => ({
  marginBottom: '32px'
}));

const ButtonGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '16px',
  marginBottom: '24px',
  '@media (max-width: 600px)': {
    gridTemplateColumns: '1fr',
    gap: '12px'
  }
}));

const NavButton = styled(Button)(({ theme }) => ({
  padding: '24px',
  borderRadius: '16px',
  textTransform: 'none',
  fontSize: '18px',
  fontWeight: '500',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)'
  },
  '& .MuiSvgIcon-root': {
    fontSize: '28px',
    marginRight: '12px'
  },
  '& .button-text': {
    textAlign: 'left',
    flex: 1
  }
}));

const EmergencyButton = styled(Button)(({ theme }) => ({
  width: '100%',
  padding: '20px',
  backgroundColor: '#FF5252',
  color: 'white',
  borderRadius: '16px',
  fontSize: '20px',
  fontWeight: '600',
  textTransform: 'none',
  boxShadow: '0 4px 12px rgba(255, 82, 82, 0.2)',
  '&:hover': {
    backgroundColor: '#FF1744',
    boxShadow: '0 6px 16px rgba(255, 82, 82, 0.3)'
  },
  '& .MuiSvgIcon-root': {
    fontSize: '28px',
    marginRight: '12px'
  }
}));

const ReminderSection = styled(Box)(({ theme }) => ({
  backgroundColor: '#FFFFFF',
  padding: '28px',
  borderRadius: '20px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  '& .section-header': {
    marginBottom: '24px',
    '& h6': {
      fontSize: '24px',
      fontWeight: '600',
      color: '#2C3E50'
    }
  },
  '& .reminder-group': {
    marginBottom: '24px',
    '&:last-child': {
      marginBottom: 0
    }
  }
}));

const MedicationReminderCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '16px 20px',
  backgroundColor: '#FFF3E0',
  borderRadius: '12px',
  marginBottom: '12px',
  transition: 'transform 0.2s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-2px)'
  },
  '& .MuiSvgIcon-root': {
    fontSize: '24px',
    marginRight: '16px',
    color: '#ED6C02'
  },
  '& .MuiTypography-root': {
    fontSize: '16px',
    color: '#2C3E50'
  }
}));

const RoutineReminderCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '16px 20px',
  backgroundColor: '#E8F5E9',
  borderRadius: '12px',
  marginBottom: '12px',
  transition: 'transform 0.2s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-2px)'
  },
  '& .MuiSvgIcon-root': {
    fontSize: '24px',
    marginRight: '16px',
    color: '#2E7D32'
  },
  '& .MuiTypography-root': {
    fontSize: '16px',
    color: '#2C3E50'
  }
}));

const EmergencyDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '24px',
    padding: '24px',
    maxWidth: '480px',
    width: '90%'
  },
  '& .MuiDialogTitle-root': {
    fontSize: '28px',
    fontWeight: 700,
    color: '#2C3E50',
    textAlign: 'center',
    paddingBottom: '16px'
  }
}));

const EmergencyContact = styled(Box)(({ theme }) => ({
  backgroundColor: '#FFF3F0',
  padding: '24px',
  borderRadius: '16px',
  marginBottom: '20px',
  border: '2px solid #FFE0DB',
  '& .MuiTypography-root': {
    fontSize: '20px',
    marginBottom: '12px',
    color: '#2C3E50'
  },
  '&:last-child': {
    marginBottom: 0
  }
}));

const CallButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#E74C3C',
  color: 'white',
  padding: '12px 24px',
  borderRadius: '12px',
  fontSize: '18px',
  fontWeight: 600,
  '& .MuiSvgIcon-root': {
    fontSize: '24px',
    marginRight: '8px'
  },
  '&:hover': {
    backgroundColor: '#C0392B'
  }
}));

const LogoutButton = styled(IconButton)({
  color: 'white',
  padding: '12px',
  '& .MuiSvgIcon-root': {
    fontSize: '32px'
  }
});

const getWeatherIcon = (condition) => {
  const code = parseInt(condition);
  if (code === 1000) return <WbSunnyIcon />;
  if (code >= 1003 && code <= 1009) return <CloudIcon />;
  if (code >= 1087 && code <= 1282) return <ThunderstormIcon />;
  if (code >= 1063 && code <= 1072) return <GrainIcon />;
  if (code >= 1114 && code <= 1117) return <AcUnitIcon />;
  return <CloudIcon />;
};

const ContentWrapper = styled(Box)(({ theme }) => ({
  padding: '24px',
  maxWidth: '1200px',
  width: '100%',
  margin: '0 auto',
  flex: 1,
  '@media (max-width: 600px)': {
    padding: '16px'
  }
}));

const NewsSection = styled(Box)(({ theme }) => ({
  backgroundColor: '#FFFFFF',
  padding: '32px 28px',
  borderRadius: '24px',
  boxShadow: '0 6px 24px rgba(25, 118, 210, 0.08)',
  marginTop: '36px',
  marginBottom: '24px',
  transition: 'box-shadow 0.2s',
  '&:hover': {
    boxShadow: '0 10px 32px rgba(25, 118, 210, 0.13)'
  },
  '& .section-header': {
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    '& h6': {
      fontSize: '26px',
      fontWeight: '700',
      color: '#1976D2'
    }
  },
  '& .news-list': {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  '& .news-item': {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '18px',
    padding: '18px 0',
    borderBottom: '1px solid #E3F2FD',
    '&:last-child': {
      borderBottom: 'none'
    },
    background: 'linear-gradient(90deg, #E3F2FD 0%, #FFF 100%)',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.04)'
  },
  '& .news-thumb': {
    width: 70,
    height: 70,
    borderRadius: '10px',
    objectFit: 'cover',
    background: '#F5F7FA',
    border: '1px solid #E3F2FD',
    flexShrink: 0
  },
  '& .news-title': {
    fontWeight: 700,
    fontSize: '17px',
    color: '#1976D2',
    textDecoration: 'none',
    lineHeight: 1.3,
    display: 'block',
    marginBottom: '6px',
    '&:hover': {
      textDecoration: 'underline',
      color: '#125ea2'
    }
  },
  '& .news-source': {
    fontSize: '13px',
    color: '#888',
    marginTop: '2px'
  },
  '& .news-desc': {
    fontSize: '15px',
    color: '#444',
    margin: '4px 0 0 0'
  }
}));

const Home = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState({});
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuote, setCurrentQuote] = useState('');
  const [medicationReminders, setMedicationReminders] = useState([]);
  const [routineReminders, setRoutineReminders] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser?.uid) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            emergencyContacts: data.emergencyContacts || []
          });
        }
      }
    };

    fetchUserData();
  }, [currentUser]);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=${process.env.REACT_APP_WEATHER_API_KEY}&q=auto:ip&aqi=no`
        );
        
        if (!response.ok) {
          throw new Error('Weather data fetch failed');
        }

        const data = await response.json();
        setWeather(data);
        setLastUpdated(new Date());
        setError(null);
      } catch (err) {
        console.error('Error fetching weather:', err);
        setError('Unable to fetch weather data');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 300000);

    return () => clearInterval(interval);
  }, []);

  const fetchNews = async () => {
    setNewsLoading(true);
    setNewsError(null);
    try {
      // Use thenewsapi.com instead of newsapi.org
      const response = await fetch(
        `https://api.thenewsapi.com/v1/news/top?locale=in&limit=5&api_token=${process.env.REACT_APP_NEWS_API_KEY}`
      );
      const data = await response.json();
      // thenewsapi.com returns articles in data.data
      if (Array.isArray(data.data) && data.data.length > 0) {
        setNews(data.data);
        setNewsError(null);
      } else {
        setNews([]);
        setNewsError('No news articles found.');
      }
    } catch (err) {
      setNewsError('Unable to fetch news at this time.');
      setNews([]);
    } finally {
      setNewsLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getCurrentTime = () => {
    return format(new Date(), 'h:mm a');
  };

  const getCurrentDate = () => {
    return format(new Date(), 'EEEE, MMMM d');
  };

  const getQuoteForTimeOfDay = () => {
    const hour = new Date().getHours();
    let category;
    
    if (hour >= 5 && hour < 10) {
      category = ['routine', 'motivation'];
    } else if (hour >= 10 && hour < 14) {
      category = ['health', 'activity'];
    } else if (hour >= 14 && hour < 18) {
      category = ['wellness', 'social'];
    } else {
      category = ['wellness', 'motivation'];
    }
    
    const relevantQuotes = MOTIVATIONAL_QUOTES.filter(quote => 
      category.includes(quote.category)
    );
    
    const randomQuote = relevantQuotes[Math.floor(Math.random() * relevantQuotes.length)];
    return randomQuote.text;
  };

  useEffect(() => {
    const updateQuote = () => {
      setCurrentQuote(getQuoteForTimeOfDay());
    };

    updateQuote();
    const interval = setInterval(updateQuote, 3600000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const fetchMedicationReminders = async () => {
    if (!currentUser?.uid) return;

    try {
      const routinesRef = collection(db, 'medicineRoutines');
      const routinesQuery = query(
        routinesRef,
        where('userId', '==', currentUser.uid)
      );
      const routinesSnapshot = await getDocs(routinesQuery);
      
      const reminders = routinesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort by time: AM first, then PM, and chronologically within each
      reminders.sort((a, b) => {
        const timeA = a.time || '00:00';
        const timeB = b.time || '00:00';
        const [hoursA, minutesA] = timeA.split(':');
        const [hoursB, minutesB] = timeB.split(':');
        const periodA = timeA.match(/am|pm/i) ? timeA.match(/am|pm/i)[0].toLowerCase() : 'am';
        const periodB = timeB.match(/am|pm/i) ? timeB.match(/am|pm/i)[0].toLowerCase() : 'am';
        const hourA = periodA === 'pm' && parseInt(hoursA) !== 12 ? parseInt(hoursA) + 12 : parseInt(hoursA);
        const hourB = periodB === 'pm' && parseInt(hoursB) !== 12 ? parseInt(hoursB) + 12 : parseInt(hoursB);

        // Compare periods first (AM < PM), then hours, then minutes
        if (periodA !== periodB) return periodA === 'am' ? -1 : 1;
        if (hourA !== hourB) return hourA - hourB;
        return parseInt(minutesA) - parseInt(minutesB);
      });

      setMedicationReminders(reminders);
    } catch (error) {
      console.error('Error fetching medication reminders:', error);
    }
  };

  const fetchRoutineReminders = async () => {
    if (!currentUser?.uid) return;

    try {
      const routinesRef = collection(db, 'routines');
      const routinesQuery = query(
        routinesRef,
        where('userId', '==', currentUser.uid),
        where('completed', '==', false)
      );
      const routinesSnapshot = await getDocs(routinesQuery);
      
      const reminders = routinesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort by time: AM first, then PM, and chronologically within each
      reminders.sort((a, b) => {
        const timeA = a.time || '00:00';
        const timeB = b.time || '00:00';
        const [hoursA, minutesA] = timeA.split(':');
        const [hoursB, minutesB] = timeB.split(':');
        const periodA = timeA.match(/am|pm/i) ? timeA.match(/am|pm/i)[0].toLowerCase() : 'am';
        const periodB = timeB.match(/am|pm/i) ? timeB.match(/am|pm/i)[0].toLowerCase() : 'am';
        const hourA = periodA === 'pm' && parseInt(hoursA) !== 12 ? parseInt(hoursA) + 12 : parseInt(hoursA);
        const hourB = periodB === 'pm' && parseInt(hoursB) !== 12 ? parseInt(hoursB) + 12 : parseInt(hoursB);

        // Compare periods first (AM < PM), then hours, then minutes
        if (periodA !== periodB) return periodA === 'am' ? -1 : 1;
        if (hourA !== hourB) return hourA - hourB;
        return parseInt(minutesA) - parseInt(minutesB);
      });

      setRoutineReminders(reminders);
    } catch (error) {
      console.error('Error fetching routine reminders:', error);
    }
  };

  useEffect(() => {
    const refreshReminders = async () => {
      await fetchMedicationReminders();
      await fetchRoutineReminders();
    };

    refreshReminders();
    const interval = setInterval(refreshReminders, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [currentUser]);

  const formatTime = (time) => {
    try {
      // Handle 12-hour format with AM/PM (e.g., "2:00 pm" or "2:00 PM")
      if (typeof time === 'string' && time.match(/(\d{1,2}:\d{2})\s*(am|pm)/i)) {
        const [timePart, period] = time.split(/\s+/);
        const [hours, minutes] = timePart.split(':');
        const date = new Date();
        date.setHours(period.toLowerCase() === 'pm' && parseInt(hours) !== 12 ? parseInt(hours) + 12 : parseInt(hours));
        date.setMinutes(parseInt(minutes));
        return date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      }
      // Fallback for 24-hour format or invalid input
      const [hours, minutes] = time.split(':');
      const date = new Date();
      date.setHours(parseInt(hours));
      date.setMinutes(parseInt(minutes));
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return time || 'Invalid Time';
    }
  };

  const getAllRemindersText = () => {
    let text = '';
    
    if (medicationReminders.length > 0) {
      text += `You have ${medicationReminders.length} medication reminder${medicationReminders.length === 1 ? '' : 's'}. `;
      medicationReminders.forEach(med => {
        text += `Take ${med.name} at ${formatTime(med.time)}. `;
      });
    }
    
    if (routineReminders.length > 0) {
      text += `You have ${routineReminders.length} routine task${routineReminders.length === 1 ? '' : 's'}. `;
      routineReminders.forEach(routine => {
        text += `${routine.task} at ${formatTime(routine.time)}. `;
      });
    }
    
    if (!text) {
      text = 'You have no reminders scheduled for today.';
    }
    
    return text;
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <Container>
      <Navbar>
        <ProfileSection onClick={() => navigate('/profile')} sx={{ cursor: 'pointer' }}>
          <Avatar sx={{ 
            bgcolor: '#E8EFF9', 
            color: '#4A6FA5',
            width: { xs: 48, sm: 56 },
            height: { xs: 48, sm: 56 },
            fontSize: { xs: 24, sm: 28 }
          }}>
            {userData.firstName?.[0]?.toUpperCase() || 'U'}
          </Avatar>
          <Typography sx={{ 
            fontSize: { xs: '20px', sm: '24px' },
            fontWeight: 600
          }}>
            {userData.firstName} {userData.lastName}
          </Typography>
        </ProfileSection>
        <LogoutButton onClick={handleLogout} aria-label="Logout">
          <LogoutIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
        </LogoutButton>
      </Navbar>
      <ContentWrapper>
        <Box sx={{ py: 3 }}>
          <GreetingSection>
            <GreetingPattern />
            <GreetingContent>
              <Typography variant="h4">{getGreeting()}, {userData.firstName}!</Typography>
              <Typography variant="h6">
                <FormatQuoteIcon className="quote-icon" />
                {currentQuote}
              </Typography>
              <TimeInfoBox>
                <Box className="time-group">
                  <AccessTimeIcon />
                  <Typography>{getCurrentTime()}</Typography>
                </Box>
                <Box className="date-group">
                  <DateRangeIcon />
                  <Typography>{getCurrentDate()}</Typography>
                </Box>
              </TimeInfoBox>
            </GreetingContent>
          </GreetingSection>

          <WeatherBox>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
                <CircularProgress size={24} sx={{ color: '#4A6FA5' }} />
              </Box>
            ) : error ? (
              <Typography sx={{ textAlign: 'center', color: '#E74C3C', fontSize: '14px' }}>
                {error}
              </Typography>
            ) : weather && (
              <>
                <Box className="weather-content">
                  <Box className="weather-main">
                    <Box className="weather-icon">
                      {getWeatherIcon(weather.current.condition.code)}
                    </Box>
                    <Box className="weather-info">
                      <Typography className="weather-temp">
                        {Math.round(weather.current.temp_c)}
                        <span className="weather-unit">°C</span>
                      </Typography>
                      <Typography className="weather-condition">
                        {weather.current.condition.text}
                      </Typography>
                      <Typography className="weather-location">
                        <LocationOnIcon /> {weather.location.name}
                      </Typography>
                    </Box>
                    <Box sx={{ ml: 'auto', alignSelf: 'flex-start' }}>
                      <SpeechButton 
                        text={`The current temperature in ${weather.location.name} is ${Math.round(weather.current.temp_c)} degrees Celsius with ${weather.current.condition.text}. ${getWeatherTip(weather.current.condition.text, weather.current.temp_c)}`}
                        tooltipText="Listen to weather details and tip"
                        size="small"
                      />
                    </Box>
                  </Box>
                </Box>
                
                <Box className="weather-tip">
                  <InfoIcon />
                  <Typography className="tip-text">
                    {getWeatherTip(weather.current.condition.text, weather.current.temp_c)}
                  </Typography>
                </Box>

                <Typography className="last-updated">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </Typography>
              </>
            )}
          </WeatherBox>

          <WaterIntake />

          <ButtonContainer>
            <ButtonGrid>
              <NavButton 
                onClick={() => navigate('/chat')} 
                startIcon={<ChatIcon />}
                sx={{ 
                  backgroundColor: '#E3F2FD',
                  '& .MuiSvgIcon-root': { color: '#1976D2' },
                  '&:hover': { backgroundColor: '#E3F2FD' }
                }}
              >
                <span className="button-text">Chat Assistant</span>
              </NavButton>
              <NavButton 
                onClick={() => navigate('/routine')} 
                startIcon={<CalendarMonthIcon />}
                sx={{ 
                  backgroundColor: '#E8F5E9',
                  '& .MuiSvgIcon-root': { color: '#2E7D32' },
                  '&:hover': { backgroundColor: '#E8F5E9' }
                }}
              >
                <span className="button-text">Daily Routine</span>
              </NavButton>
              <NavButton 
                onClick={() => navigate('/medication')} 
                startIcon={<LocalHospitalIcon />}
                sx={{ 
                  backgroundColor: '#FFF3E0',
                  '& .MuiSvgIcon-root': { color: '#ED6C02' },
                  '&:hover': { backgroundColor: '#FFF3E0' }
                }}
              >
                <span className="button-text">Medication</span>
              </NavButton>
              <NavButton 
                onClick={() => navigate('/documents')} 
                startIcon={<UploadFileIcon />}
                sx={{ 
                  backgroundColor: '#F3E5F5',
                  '& .MuiSvgIcon-root': { color: '#9C27B0' },
                  '&:hover': { backgroundColor: '#F3E5F5' }
                }}
              >
                <span className="button-text">Documents</span>
              </NavButton>
              <NavButton 
                onClick={() => navigate('/family-gallery')}
                startIcon={<FamilyRestroomIcon />}
                sx={{
                  backgroundColor: '#FFE4EC', // baby pink
                  '& .MuiSvgIcon-root': { color: '#F06292' },
                  '&:hover': { backgroundColor: '#FFE4EC' }
                }}
              >
                <span className="button-text">Family Gallery</span>
              </NavButton>
            </ButtonGrid>

            <EmergencyButton
              startIcon={<EmergencyShareIcon />}
              onClick={() => navigate('/emergency')}
            >
              Emergency Call
            </EmergencyButton>
          </ButtonContainer>

          <ReminderSection>
            <Box className="section-header" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6">Today's Reminders</Typography>
              <SpeechButton 
                text={getAllRemindersText()}
                tooltipText="Listen to all reminders"
                size="small"
              />
            </Box>

            {medicationReminders.length > 0 && (
              <Box className="reminder-group">
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    mb: 2,
                    color: '#ED6C02',
                    fontWeight: 600,
                    fontSize: '18px'
                  }}
                >
                  Medications
                </Typography>
                {medicationReminders.map((med) => (
                  <MedicationReminderCard 
                    key={med.id}
                    onClick={() => navigate('/medication')}
                  >
                    <LocalHospitalIcon />
                    <Typography>
                      Take {med.name} at {formatTime(med.time)}
                      {med.note && ` - ${med.note}`}
                    </Typography>
                  </MedicationReminderCard>
                ))}
              </Box>
            )}

            {routineReminders.length > 0 && (
              <Box className="reminder-group">
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    mb: 2,
                    color: '#2E7D32',
                    fontWeight: 600,
                    fontSize: '18px'
                  }}
                >
                  Daily Routines
                </Typography>
                {routineReminders.map((routine) => (
                  <RoutineReminderCard 
                    key={routine.id}
                    onClick={() => navigate('/routine')}
                  >
                    <CalendarMonthIcon />
                    <Typography>
                      {routine.task} at {formatTime(routine.time)}
                    </Typography>
                  </RoutineReminderCard>
                ))}
              </Box>
            )}

            {medicationReminders.length === 0 && routineReminders.length === 0 && (
              <Typography 
                sx={{ 
                  color: '#666',
                  fontStyle: 'italic',
                  textAlign: 'center',
                  padding: '32px 0'
                }}
              >
                No reminders scheduled for today
              </Typography>
            )}
          </ReminderSection>

          {/* News Section */}
          <NewsSection>
            <Box className="section-header">
              <NewspaperIcon sx={{ color: '#1976D2', fontSize: 32 }} />
              <Typography variant="h6">Latest News</Typography>
            </Box>
            {newsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={24} sx={{ color: '#1976D2' }} />
              </Box>
            ) : newsError ? (
              <Typography sx={{ color: '#E74C3C', fontSize: '15px', textAlign: 'center', py: 2 }}>
                {newsError}
              </Typography>
            ) : (
              <Box className="news-list">
                {news.length === 0 ? (
                  <Typography sx={{ color: '#888', fontStyle: 'italic', textAlign: 'center', py: 2 }}>
                    No news available.
                  </Typography>
                ) : (
                  news.map((article, idx) => (
                    <Box key={idx} className="news-item">
                      {article.image_url ? (
                        <img
                          src={article.image_url}
                          alt="news"
                          className="news-thumb"
                          loading="lazy"
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <NewspaperIcon sx={{ color: '#1976D2', fontSize: 44, mt: '4px', mr: 1 }} />
                      )}
                      <Box sx={{ flex: 1 }}>
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="news-title"
                        >
                          {article.title}
                        </a>
                        {article.description && (
                          <Typography className="news-desc">
                            {article.description}
                          </Typography>
                        )}
                        <Typography className="news-source">
                          {article.source}
                          {article.published_at && (
                            <> &middot; {new Date(article.published_at).toLocaleDateString()}</>
                          )}
                        </Typography>
                      </Box>
                    </Box>
                  ))
                )}
              </Box>
            )}
          </NewsSection>
        </Box>
      </ContentWrapper>
    </Container>
  );
};

export default Home;