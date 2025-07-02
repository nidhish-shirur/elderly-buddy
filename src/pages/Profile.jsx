import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, List, ListItem, ListItemText, IconButton, Avatar, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useAuth } from '../contexts/AuthContext';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import ImageIcon from '@mui/icons-material/Image';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';

const PageContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  minHeight: '100vh',
  backgroundColor: '#F5F5F5',
  padding: '16px',
  boxSizing: 'border-box',
  [theme.breakpoints.up('sm')]: {
    padding: '24px',
    maxWidth: '800px',
    margin: '0 auto',
  },
}));

const ProfileHeader = styled(Box)(({ theme }) => ({
  backgroundColor: '#8B7355',
  color: 'white',
  padding: '16px',
  position: 'relative',
  height: '120px',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  '& .MuiTypography-root': {
    position: 'absolute',
    top: '16px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    textAlign: 'center',
  },
  [theme.breakpoints.up('sm')]: {
    padding: '24px',
    height: '140px',
    borderRadius: '12px',
  },
}));

const BackButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  left: '8px',
  top: '8px',
  color: 'white',
  padding: '8px',
  zIndex: 1,
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  [theme.breakpoints.up('sm')]: {
    left: '16px',
    top: '24px',
    padding: '12px',
    width: '48px',
    height: '48px',
  },
}));

const ProfileTitle = styled(Typography)(({ theme }) => ({
  color: 'white',
  fontSize: '1.5rem',
  fontWeight: 600,
  margin: 0,
  [theme.breakpoints.up('sm')]: {
    fontSize: '1.75rem',
  },
}));

const ProfileAvatar = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginTop: '-40px',
  marginBottom: '16px',
  [theme.breakpoints.up('sm')]: {
    marginTop: '-70px',
    marginBottom: '24px',
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: '100px',
  height: '100px',
  backgroundColor: '#F0EAE3',
  border: '4px solid white',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  [theme.breakpoints.up('sm')]: {
    width: '140px',
    height: '140px',
    border: '6px solid white',
  },
}));

const EditButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#A5D6D9',
  color: '#2C3E50',
  borderRadius: '8px',
  padding: '6px 16px',
  marginTop: '12px',
  textTransform: 'none',
  fontSize: '0.875rem',
  fontWeight: 600,
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  '&:hover': {
    backgroundColor: '#8FC1C4',
  },
  [theme.breakpoints.up('sm')]: {
    padding: '12px 32px',
    marginTop: '16px',
    fontSize: '1rem',
    borderRadius: '12px',
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.25rem',
  fontWeight: 600,
  padding: '12px',
  backgroundColor: '#A5D6D9',
  color: '#2C3E50',
  borderRadius: '8px 8px 0 0',
  [theme.breakpoints.up('sm')]: {
    fontSize: '1.5rem',
    padding: '20px',
    borderRadius: '12px 12px 0 0',
  },
}));

const InfoList = styled(Paper)(({ theme }) => ({
  padding: '8px',
  marginBottom: '16px',
  borderRadius: '0 0 8px 8px',
  backgroundColor: 'white',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  [theme.breakpoints.up('sm')]: {
    padding: '8px',
    marginBottom: '24px',
    borderRadius: '0 0 12px 12px',
  },
}));

const InfoListItem = styled(ListItem)(({ theme }) => ({
  padding: '12px',
  borderBottom: '1px solid #E0E0E0',
  '&:last-child': {
    borderBottom: 'none',
  },
  '&:hover': {
    backgroundColor: '#F8F8F8',
  },
  [theme.breakpoints.up('sm')]: {
    padding: '20px',
  },
}));

const InfoLabel = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  color: '#2C3E50',
  fontWeight: 500,
  [theme.breakpoints.up('sm')]: {
    fontSize: '1.125rem',
  },
}));

const InfoValue = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  color: '#666',
  textAlign: 'right',
  flex: 1,
  fontWeight: 500,
  [theme.breakpoints.up('sm')]: {
    fontSize: '1.125rem',
  },
}));

const Content = styled(Box)(({ theme }) => ({
  padding: '16px 0',
  [theme.breakpoints.up('sm')]: {
    padding: '24px 0',
  },
}));

const DocumentListItem = styled(ListItem)(({ theme }) => ({
  padding: '12px',
  borderBottom: '1px solid #E0E0E0',
  '&:last-child': {
    borderBottom: 'none',
  },
  '&:hover': {
    backgroundColor: '#F8F8F8',
  },
  [theme.breakpoints.up('sm')]: {
    padding: '16px',
  },
}));

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
    dateOfBirth: null,
    height: '',
    weight: '',
    bloodGroup: '',
    bloodPressure: '',
    allergy: '',
    emergencyContacts: [],
  });
  const [profileIncomplete, setProfileIncomplete] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser?.uid) {
        const userDoc = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(userDoc);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData({
            ...data,
            dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
            emergencyContacts: data.emergencyContacts || [],
          });

          // Check if profile is incomplete (all fields except documents are empty)
          const hasPersonal =
            !!data.firstName ||
            !!data.lastName ||
            !!data.age ||
            !!data.gender ||
            !!data.dateOfBirth;
          const hasHealth =
            !!data.height ||
            !!data.weight ||
            !!data.bloodGroup ||
            !!data.bloodPressure ||
            !!data.allergy;
          const hasEmergency = Array.isArray(data.emergencyContacts) && data.emergencyContacts.length > 0;

          if (!hasPersonal && !hasHealth && !hasEmergency) {
            setProfileIncomplete(true);
          } else {
            setProfileIncomplete(false);
          }
        } else {
          setProfileIncomplete(true);
        }
      }
    };
    fetchUserData();
  }, [currentUser]);

  useEffect(() => {
    // If profile is incomplete and user is not on /edit-profile, /documents, or /profile, redirect to /edit-profile or /profile
    if (
      profileIncomplete &&
      location.pathname !== '/edit-profile' &&
      location.pathname !== '/documents' &&
      location.pathname !== '/profile'
    ) {
      // Prefer redirecting to /edit-profile for editing, but if not, fallback to /profile
      navigate('/profile', { replace: true });
    }
  }, [profileIncomplete, location.pathname, navigate]);

  const formatDate = (date) => {
    if (!date) return '-';
    try {
      return format(new Date(date), 'dd/MM/yyyy');
    } catch (error) {
      return '-';
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const documents = [
    { title: 'Aadhar Card', category: 'Identity Documents' },
    { title: 'PAN Card', category: 'Identity Documents' },
    { title: 'Prescription', category: 'Medical Records' },
    { title: 'Diabetes Report', category: 'Medical Records' },
  ];

  return (
    <PageContainer>
      <ProfileHeader>
        <BackButton onClick={() => handleNavigation('/')} aria-label="Back to home">
          <ArrowBackIcon sx={{ fontSize: '1.5rem' }} />
        </BackButton>
        <ProfileTitle>My Profile</ProfileTitle>
      </ProfileHeader>

      <Content>
        <ProfileAvatar>
          <StyledAvatar>
            <PersonIcon sx={{ fontSize: '2rem', color: '#8B7355' }} />
          </StyledAvatar>
          <EditButton 
            onClick={() => handleNavigation('/edit-profile')}
            startIcon={<EditIcon sx={{ fontSize: '1.25rem' }} />}
          >
            Edit Profile
          </EditButton>
        </ProfileAvatar>

        <Box sx={{ mb: 3 }}>
          <SectionTitle>Personal Information</SectionTitle>
          <InfoList>
            <InfoListItem>
              <InfoLabel>First Name</InfoLabel>
              <InfoValue>{userData.firstName || '-'}</InfoValue>
            </InfoListItem>
            <InfoListItem>
              <InfoLabel>Last Name</InfoLabel>
              <InfoValue>{userData.lastName || '-'}</InfoValue>
            </InfoListItem>
            <InfoListItem>
              <InfoLabel>Age</InfoLabel>
              <InfoValue>{userData.age || '-'}</InfoValue>
            </InfoListItem>
            <InfoListItem>
              <InfoLabel>Gender</InfoLabel>
              <InfoValue>{userData.gender || '-'}</InfoValue>
            </InfoListItem>
            <InfoListItem>
              <InfoLabel>Date of Birth</InfoLabel>
              <InfoValue>{formatDate(userData.dateOfBirth)}</InfoValue>
            </InfoListItem>
          </InfoList>
        </Box>

        <Box sx={{ mb: 3 }}>
          <SectionTitle>Health Information</SectionTitle>
          <InfoList>
            <InfoListItem>
              <InfoLabel>Height</InfoLabel>
              <InfoValue>{userData.height ? `${userData.height} cm` : '-'}</InfoValue>
            </InfoListItem>
            <InfoListItem>
              <InfoLabel>Weight</InfoLabel>
              <InfoValue>{userData.weight ? `${userData.weight} kg` : '-'}</InfoValue>
            </InfoListItem>
            <InfoListItem>
              <InfoLabel>Blood Group</InfoLabel>
              <InfoValue>{userData.bloodGroup || '-'}</InfoValue>
            </InfoListItem>
            <InfoListItem>
              <InfoLabel>Blood Pressure</InfoLabel>
              <InfoValue>{userData.bloodPressure || '-'}</InfoValue>
            </InfoListItem>
            <InfoListItem>
              <InfoLabel>Allergies</InfoLabel>
              <InfoValue>{userData.allergy || '-'}</InfoValue>
            </InfoListItem>
          </InfoList>
        </Box>

        <Box sx={{ mb: 3 }}>
          <SectionTitle>Emergency Contacts</SectionTitle>
          <InfoList>
            {userData.emergencyContacts.length > 0 ? (
              userData.emergencyContacts.map((contact, index) => (
                <InfoListItem key={index}>
                  <InfoLabel>{contact.name || 'Contact'}</InfoLabel>
                  <InfoValue>{contact.phoneNumber || '-'}</InfoValue>
                </InfoListItem>
              ))
            ) : (
              <InfoListItem>
                <InfoValue>No contacts added</InfoValue>
              </InfoListItem>
            )}
          </InfoList>
        </Box>

        <Box>
          <SectionTitle>Uploaded Documents</SectionTitle>
          <List>
            {documents.map((doc, index) => (
              <DocumentListItem
                key={index}
                button
                onClick={() => handleNavigation('/documents')}
              >
                <ListItemText
                  primary={doc.title}
                  secondary={doc.category}
                  primaryTypographyProps={{ fontSize: '1rem', fontWeight: 500 }}
                  secondaryTypographyProps={{ fontSize: '0.875rem', color: '#666' }}
                />
                <ChevronRightIcon color="action" />
              </DocumentListItem>
            ))}
          </List>
        </Box>
      </Content>
    </PageContainer>
  );
};

export default Profile;