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
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const PageContainer = styled(Box)({
  maxWidth: '800px',
  margin: '0 auto',
  backgroundColor: '#F5F5F5',
  minHeight: '100vh',
  position: 'relative',
});

const ProfileHeader = styled(Box)({
  backgroundColor: '#8B7355',
  color: 'white',
  padding: '24px',
  position: 'relative',
  height: '140px',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  '& .MuiTypography-root': {
    position: 'absolute',
    top: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    textAlign: 'center',
  }
});

const BackButton = styled(IconButton)({
  position: 'absolute',
  left: 16,
  top: 24,
  color: 'white',
  padding: '12px',
  zIndex: 1,
  width: '48px',
  height: '48px',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  }
});

const ProfileTitle = styled(Typography)({
  color: 'white',
  fontSize: '28px',
  fontWeight: 600,
  margin: 0,
});

const ProfileAvatar = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginTop: '-70px',
  marginBottom: '24px',
});

const StyledAvatar = styled(Avatar)({
  width: 140,
  height: 140,
  backgroundColor: '#F0EAE3',
  border: '6px solid white',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
});

const EditButton = styled(Button)({
  backgroundColor: '#A5D6D9',
  color: '#2C3E50',
  borderRadius: '12px',
  padding: '12px 32px',
  marginTop: '16px',
  textTransform: 'none',
  fontSize: '18px',
  fontWeight: 600,
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  '&:hover': {
    backgroundColor: '#8FC1C4',
  },
});

const SectionTitle = styled(Typography)({
  fontSize: '24px',
  fontWeight: 600,
  padding: '20px',
  backgroundColor: '#A5D6D9',
  color: '#2C3E50',
  borderRadius: '12px 12px 0 0',
});

const InfoList = styled(Paper)({
  padding: '8px',
  marginBottom: '24px',
  borderRadius: '0 0 12px 12px',
  backgroundColor: 'white',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
});

const InfoListItem = styled(ListItem)({
  padding: '20px',
  borderBottom: '1px solid #E0E0E0',
  '&:last-child': {
    borderBottom: 'none',
  },
  '&:hover': {
    backgroundColor: '#F8F8F8',
  },
});

const InfoLabel = styled(Typography)({
  fontSize: '18px',
  color: '#2C3E50',
  fontWeight: 500,
});

const InfoValue = styled(Typography)({
  fontSize: '18px',
  color: '#666',
  textAlign: 'right',
  flex: 1,
  fontWeight: 500,
});

const Content = styled(Box)({
  padding: '24px',
  maxWidth: '800px',
  margin: '0 auto',
});

const Profile = () => {
  const navigate = useNavigate();
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
  });

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
          });
        }
      }
    };
    fetchUserData();
  }, [currentUser]);

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
    { title: 'Aadhar Card' },
    { title: 'PAN Card' },
    { title: 'Prescription' },
    { title: 'Diabetes Report' },
  ];

  return (
    <PageContainer>
      <ProfileHeader>
        <BackButton onClick={() => handleNavigation('/')} aria-label="Back to home">
          <ArrowBackIcon sx={{ fontSize: 28 }} />
        </BackButton>
        <ProfileTitle>My Profile</ProfileTitle>
      </ProfileHeader>

      <Content>
        <ProfileAvatar>
          <StyledAvatar>
            <PersonIcon sx={{ fontSize: 80, color: '#8B7355' }} />
          </StyledAvatar>
          <EditButton 
            onClick={() => handleNavigation('/edit-profile')}
            startIcon={<EditIcon sx={{ fontSize: 24 }} />}
          >
            Edit Profile
          </EditButton>
        </ProfileAvatar>

        <Box sx={{ mb: 4 }}>
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

        <Box>
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

        <SectionTitle>Uploaded Documents</SectionTitle>
        <List>
          {documents.map((doc, index) => (
            <ListItem key={index} button>
              <ListItemText primary={doc.title} />
              <ChevronRightIcon color="action" />
            </ListItem>
          ))}
        </List>
      </Content>
    </PageContainer>
  );
};

export default Profile; 