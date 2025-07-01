import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import EmergencyShareIcon from '@mui/icons-material/EmergencyShare';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useAuth } from '../contexts/AuthContext';
import SpeechButton from '../components/SpeechButton';

const PageContainer = styled(Box)(({ theme }) => ({
  maxWidth: '480px',
  margin: '0 auto',
  minHeight: '100vh',
  backgroundColor: '#FFF3F0',
  position: 'relative',
  [theme.breakpoints.up('md')]: {
    maxWidth: '900px',
    padding: theme.spacing(4, 0),
    background: 'linear-gradient(135deg, #fff3f0 0%, #f8fafc 100%)',
  },
}));

const Header = styled(Box)(({ theme }) => ({
  backgroundColor: '#E74C3C',
  color: 'white',
  padding: '20px',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 0,
  [theme.breakpoints.up('md')]: {
    borderRadius: '18px 18px 0 0',
    padding: '32px 40px 28px 40px',
    fontSize: 28,
    boxShadow: '0 4px 24px rgba(231,76,60,0.13)',
  },
}));

const BackButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  left: 16,
  color: 'white',
  [theme.breakpoints.up('md')]: {
    left: 32,
    top: 32,
    background: 'rgba(255,255,255,0.10)',
    '&:hover': {
      background: 'rgba(255,255,255,0.18)',
    },
  },
}));

const EmergencyTitle = styled(Typography)(({ theme }) => ({
  fontSize: '24px',
  fontWeight: 600,
  textAlign: 'center',
  marginLeft: 48,
  marginRight: 48,
  [theme.breakpoints.up('md')]: {
    fontSize: '32px',
    marginLeft: 0,
    marginRight: 0,
    letterSpacing: 1,
  },
}));

const ContentSection = styled(Box)(({ theme }) => ({
  padding: '24px',
  [theme.breakpoints.up('md')]: {
    padding: '40px 60px 32px 60px',
    background: '#fff',
    borderRadius: '0 0 18px 18px',
    boxShadow: '0 4px 32px rgba(74,111,165,0.10)',
    marginBottom: theme.spacing(4),
  },
}));

const EmergencyInstructions = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '12px',
  marginBottom: '24px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  [theme.breakpoints.up('md')]: {
    padding: '32px',
    fontSize: 18,
    marginBottom: '32px',
  },
}));

const ContactCard = styled(Button)(({ theme }) => ({
  backgroundColor: 'white',
  width: '100%',
  padding: '20px',
  marginBottom: '16px',
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  textAlign: 'left',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: '#FFF9F8',
  },
  [theme.breakpoints.up('md')]: {
    padding: '28px 32px',
    marginBottom: '24px',
    fontSize: 18,
    borderRadius: '16px',
    boxShadow: '0 4px 16px rgba(74,111,165,0.10)',
  },
}));

const EmergencyServiceButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#E74C3C',
  color: 'white',
  width: '100%',
  padding: '20px',
  marginBottom: '16px',
  borderRadius: '12px',
  fontSize: '18px',
  fontWeight: 600,
  textTransform: 'none',
  '&:hover': {
    backgroundColor: '#D44333',
  },
  [theme.breakpoints.up('md')]: {
    padding: '28px 0',
    fontSize: 22,
    borderRadius: '16px',
    marginBottom: '28px',
    boxShadow: '0 4px 16px rgba(231,76,60,0.10)',
  },
}));

const LoadingOverlay = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
});

const Emergency = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser?.uid) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setError('Failed to load emergency contacts. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [currentUser]);

  const handleEmergencyCall = (phoneNumber) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleEmergencyServices = () => {
    window.location.href = 'tel:112';
  };

  const getEmergencyInstructions = () => {
    return `Emergency Instructions: 
    1. Stay calm and assess the situation. 
    2. If immediate medical attention is needed, call Emergency Services at 112. 
    3. For non-life-threatening situations, contact your emergency contacts listed below.`;
  };

  const getContactDescription = (contact) => {
    return `${contact.name}, ${contact.relationship}. Phone number: ${contact.phoneNumber}`;
  };

  if (loading) {
    return (
      <LoadingOverlay>
        <CircularProgress />
      </LoadingOverlay>
    );
  }

  return (
    <PageContainer>
      <Header>
        <BackButton onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </BackButton>
        <EmergencyTitle>
          Emergency SOS
        </EmergencyTitle>
      </Header>

      <ContentSection>
        <EmergencyInstructions>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <EmergencyShareIcon color="error" />
            <Typography variant="h6" color="error">
              Emergency Instructions
            </Typography>
            <SpeechButton 
              text={getEmergencyInstructions()}
              tooltipText="Listen to emergency instructions"
              size="small"
            />
          </Box>
          <Typography variant="body1" sx={{ mb: 2 }}>
            1. Stay calm and assess the situation
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            2. If immediate medical attention is needed, call Emergency Services (112)
          </Typography>
          <Typography variant="body1">
            3. For non-life-threatening situations, contact your emergency contacts below
          </Typography>
        </EmergencyInstructions>

        <EmergencyServiceButton
          startIcon={<LocalHospitalIcon />}
          onClick={handleEmergencyServices}
        >
          Call Emergency Services (112)
        </EmergencyServiceButton>

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Typography variant="h6">
              Your Emergency Contacts
            </Typography>
            <SpeechButton 
              text={`You have ${userData?.emergencyContacts?.length || 0} emergency contacts.`}
              tooltipText="Listen to contact count"
              size="small"
            />
          </Box>
          
          {userData?.emergencyContacts?.length > 0 ? (
            userData.emergencyContacts.map((contact, index) => (
              contact && (
                <Box key={index} sx={{ position: 'relative' }}>
                  <ContactCard
                    onClick={() => handleEmergencyCall(contact.phoneNumber)}
                  >
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {contact.name}
                    </Typography>
                    <Typography color="textSecondary" sx={{ mb: 1 }}>
                      {contact.relationship}
                    </Typography>
                    <Typography>
                      <ContactPhoneIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      {contact.phoneNumber}
                    </Typography>
                  </ContactCard>
                  <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                    <SpeechButton 
                      text={getContactDescription(contact)}
                      tooltipText="Listen to contact details"
                      size="small"
                    />
                  </Box>
                </Box>
              )
            ))
          ) : (
            <Alert severity="info">
              No emergency contacts found. Please add emergency contacts in your profile.
            </Alert>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </ContentSection>
    </PageContainer>
  );
};

export default Emergency;