import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, IconButton, Select, MenuItem, Alert, CircularProgress, Divider, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useAuth } from '../contexts/AuthContext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useNavigate } from 'react-router-dom';

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

const Header = styled(Box)(({ theme }) => ({
  backgroundColor: '#8B7355',
  color: 'white',
  padding: '16px',
  height: '120px',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  position: 'relative',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
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
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  [theme.breakpoints.up('sm')]: {
    left: '16px',
    top: '16px',
    padding: '12px',
  },
}));

const HeaderTitle = styled(Typography)(({ theme }) => ({
  color: 'white',
  fontSize: '1.5rem',
  fontWeight: 600,
  marginTop: '8px',
  [theme.breakpoints.up('sm')]: {
    fontSize: '1.75rem',
    marginTop: '16px',
  },
}));

const Content = styled(Box)(({ theme }) => ({
  padding: '16px 0',
  [theme.breakpoints.up('sm')]: {
    padding: '24px 0',
  },
}));

const ProfileSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  marginTop: '-40px',
  marginBottom: '20px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  [theme.breakpoints.up('sm')]: {
    marginTop: '-70px',
    marginBottom: '40px',
  },
}));

const AvatarCircle = styled(Box)(({ theme }) => ({
  width: '100px',
  height: '100px',
  backgroundColor: '#F0EAE3',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '4px solid white',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  marginBottom: '12px',
  [theme.breakpoints.up('sm')]: {
    width: '140px',
    height: '140px',
    border: '6px solid white',
    marginBottom: '16px',
  },
}));

const ChangePhotoButton = styled(Button)(({ theme }) => ({
  color: '#2C3E50',
  fontSize: '0.875rem',
  padding: '6px 12px',
  backgroundColor: '#A5D6D9',
  borderRadius: '8px',
  textTransform: 'none',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  '&:hover': {
    backgroundColor: '#8FC1C4',
  },
  [theme.breakpoints.up('sm')]: {
    fontSize: '1rem',
    padding: '8px 16px',
    borderRadius: '12px',
  },
}));

const FormSection = styled(Paper)(({ theme }) => ({
  padding: '16px',
  marginBottom: '16px',
  borderRadius: '8px',
  backgroundColor: 'white',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  [theme.breakpoints.up('sm')]: {
    padding: '24px',
    marginBottom: '24px',
    borderRadius: '12px',
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.25rem',
  fontWeight: 600,
  color: '#2C3E50',
  marginBottom: '16px',
  [theme.breakpoints.up('sm')]: {
    fontSize: '1.5rem',
    marginBottom: '24px',
  },
}));

const InputLabel = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  color: '#2C3E50',
  marginBottom: '8px',
  fontWeight: 500,
  [theme.breakpoints.up('sm')]: {
    fontSize: '1.125rem',
    marginBottom: '12px',
  },
}));

const FormField = styled(Box)(({ theme }) => ({
  marginBottom: '16px',
  [theme.breakpoints.up('sm')]: {
    marginBottom: '24px',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: '#fff',
    '& fieldset': {
      borderColor: '#A5D6D9',
      borderWidth: '2px',
    },
    '&:hover fieldset': {
      borderColor: '#8FC1C4',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#8FC1C4',
    },
  },
  '& .MuiOutlinedInput-input': {
    padding: '12px',
    fontSize: '1rem',
    color: '#2C3E50',
    '&::placeholder': {
      color: '#666',
      opacity: 1,
    },
  },
  '& .MuiInputLabel-root': {
    fontSize: '1rem',
    color: '#2C3E50',
  },
  [theme.breakpoints.up('sm')]: {
    '& .MuiOutlinedInput-input': {
      padding: '16px',
      fontSize: '1.125rem',
    },
    '& .MuiInputLabel-root': {
      fontSize: '1.125rem',
    },
  },
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  borderRadius: '8px',
  backgroundColor: '#fff',
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#A5D6D9',
    borderWidth: '2px',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#8FC1C4',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#8FC1C4',
  },
  '& .MuiSelect-select': {
    padding: '12px !important',
    fontSize: '1rem',
    color: '#2C3E50',
  },
  '& .MuiSelect-icon': {
    color: '#2C3E50',
  },
  [theme.breakpoints.up('sm')]: {
    '& .MuiSelect-select': {
      padding: '16px !important',
      fontSize: '1.125rem',
    },
  },
}));

const UpdateButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#A5D6D9',
  color: '#2C3E50',
  borderRadius: '8px',
  padding: '12px',
  width: '100%',
  textTransform: 'none',
  fontSize: '1.125rem',
  fontWeight: 600,
  marginTop: '24px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  '&:hover': {
    backgroundColor: '#8FC1C4',
  },
  [theme.breakpoints.up('sm')]: {
    padding: '16px',
    fontSize: '1.25rem',
    marginTop: '32px',
  },
}));

const StyledDatePicker = styled(DatePicker)(({ theme }) => ({
  width: '100%',
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: '#fff',
    '& fieldset': {
      borderColor: '#A5D6D9',
      borderWidth: '2px',
    },
    '&:hover fieldset': {
      borderColor: '#8FC1C4',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#8FC1C4',
    },
  },
  '& .MuiOutlinedInput-input': {
    padding: '12px',
    fontSize: '1rem',
    color: '#2C3E50',
  },
  '& .MuiInputAdornment-root .MuiIconButton-root': {
    color: '#2C3E50',
    padding: '8px',
  },
  [theme.breakpoints.up('sm')]: {
    '& .MuiOutlinedInput-input': {
      padding: '16px',
      fontSize: '1.125rem',
    },
    '& .MuiInputAdornment-root .MuiIconButton-root': {
      padding: '12px',
    },
  },
}));

const LoadingOverlay = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
}));

const EmergencyContactsSection = styled(Paper)(({ theme }) => ({
  marginTop: '24px',
  padding: '16px',
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  [theme.breakpoints.up('sm')]: {
    marginTop: '32px',
    padding: '24px',
    borderRadius: '12px',
  },
}));

const ContactField = styled(Box)(({ theme }) => ({
  marginBottom: '16px',
  padding: '12px',
  backgroundColor: '#F8F9FA',
  borderRadius: '8px',
  border: '2px solid #A5D6D9',
  [theme.breakpoints.up('sm')]: {
    marginBottom: '24px',
    padding: '20px',
    borderRadius: '12px',
  },
}));

const AddContactButton = styled(Button)(({ theme }) => ({
  marginTop: '12px',
  color: '#2C3E50',
  backgroundColor: '#A5D6D9',
  borderRadius: '8px',
  textTransform: 'none',
  padding: '8px 16px',
  fontSize: '1rem',
  fontWeight: 600,
  '&:hover': {
    backgroundColor: '#8FC1C4',
  },
  [theme.breakpoints.up('sm')]: {
    marginTop: '16px',
    padding: '12px 24px',
    fontSize: '1.125rem',
  },
}));

const DeleteContactButton = styled(IconButton)(({ theme }) => ({
  color: '#FF4444',
  padding: '8px',
  backgroundColor: '#FFE4E4',
  '&:hover': {
    backgroundColor: '#FFD1D1',
  },
  [theme.breakpoints.up('sm')]: {
    padding: '12px',
  },
}));

const EditProfile = () => {
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
    emergencyContacts: [{ name: '', relationship: '', phoneNumber: '' }]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser?.uid) {
        setLoading(true);
        setError('');
        try {
          const userDoc = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(userDoc);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData({
              ...data,
              dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
              emergencyContacts: data.emergencyContacts?.length > 0 
                ? data.emergencyContacts 
                : [{ name: '', relationship: '', phoneNumber: '' }]
            });
          }
        } catch (error) {
          setError('Failed to load profile data. Please try again.');
          console.error('Error fetching user data:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchUserData();
  }, [currentUser]);

  const validateForm = () => {
    if (!userData.firstName.trim()) return 'First name is required';
    if (!userData.lastName.trim()) return 'Last name is required';
    if (userData.age && (isNaN(userData.age) || Number(userData.age) < 0)) return 'Please enter a valid age';
    if (userData.height && (isNaN(userData.height) || Number(userData.height) < 0)) return 'Please enter a valid height';
    if (userData.weight && (isNaN(userData.weight) || Number(userData.weight) < 0)) return 'Please enter a valid weight';
    
    const hasValidContact = userData.emergencyContacts.some(contact => 
      contact.name.trim() && contact.phoneNumber.trim() && contact.relationship.trim()
    );
    if (!hasValidContact) return 'Please add at least one emergency contact';
    
    return null;
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess(false);
  };

  const handleEmergencyContactChange = (index, field, value) => {
    const newContacts = [...userData.emergencyContacts];
    newContacts[index] = {
      ...newContacts[index],
      [field]: value
    };
    setUserData(prev => ({
      ...prev,
      emergencyContacts: newContacts
    }));
    setError('');
    setSuccess(false);
  };

  const handleDateChange = (date) => {
    setUserData(prev => ({
      ...prev,
      dateOfBirth: date
    }));
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const userDoc = doc(db, 'users', currentUser.uid);
      await updateDoc(userDoc, {
        ...userData,
        dateOfBirth: userData.dateOfBirth ? userData.dateOfBirth.toISOString() : null,
        emergencyContacts: userData.emergencyContacts.filter(contact => 
          contact.name.trim() && contact.phoneNumber.trim() && contact.relationship.trim()
        )
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (error) {
      setError('Failed to update profile. Please try again.');
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = () => {
    setUserData(prev => ({
      ...prev,
      emergencyContacts: [
        ...prev.emergencyContacts,
        { name: '', relationship: '', phoneNumber: '' }
      ]
    }));
  };

  const handleDeleteContact = (indexToDelete) => {
    if (userData.emergencyContacts.length > 1) {
      setUserData(prev => ({
        ...prev,
        emergencyContacts: prev.emergencyContacts.filter((_, index) => index !== indexToDelete)
      }));
    }
  };

  const genderOptions = ['Male', 'Female', 'Other'];
  const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  return (
    <PageContainer>
      <Header>
        <BackButton onClick={() => navigate('/profile')}>
          <ArrowBackIcon sx={{ fontSize: '1.5rem' }} />
        </BackButton>
        <HeaderTitle>Edit Profile</HeaderTitle>
      </Header>

      <Content>
        <ProfileSection>
          <AvatarCircle>
            <PersonIcon sx={{ fontSize: '2rem', color: '#8B7355' }} />
          </AvatarCircle>
          <ChangePhotoButton startIcon={<AddCircleOutlineIcon />}>
            Change Photo
          </ChangePhotoButton>
        </ProfileSection>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2, 
              fontSize: '1rem',
              '& .MuiAlert-message': { padding: '4px 0' }
            }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}
        {success && (
          <Alert 
            severity="success"
            sx={{ 
              mb: 2, 
              fontSize: '1rem',
              '& .MuiAlert-message': { padding: '4px 0' }
            }}
            onClose={() => setSuccess(false)}
          >
            Profile updated successfully!
          </Alert>
        )}

        <FormSection>
          <SectionTitle>Personal Information</SectionTitle>
          <FormField>
            <InputLabel>First Name</InputLabel>
            <StyledTextField
              fullWidth
              placeholder="Enter your first name"
              name="firstName"
              value={userData.firstName}
              onChange={handleInputChange}
            />
          </FormField>
          <FormField>
            <InputLabel>Last Name</InputLabel>
            <StyledTextField
              fullWidth
              placeholder="Enter your last name"
              name="lastName"
              value={userData.lastName}
              onChange={handleInputChange}
            />
          </FormField>
          <FormField>
            <InputLabel>Age</InputLabel>
            <StyledTextField
              fullWidth
              placeholder="Enter your age"
              name="age"
              type="number"
              value={userData.age}
              onChange={handleInputChange}
            />
          </FormField>
          <FormField>
            <InputLabel>Gender</InputLabel>
            <StyledSelect
              fullWidth
              name="gender"
              value={userData.gender}
              onChange={handleInputChange}
            >
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </StyledSelect>
          </FormField>
          <FormField>
            <InputLabel>Date of Birth</InputLabel>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <StyledDatePicker
                value={userData.dateOfBirth}
                onChange={handleDateChange}
                renderInput={(params) => <StyledTextField {...params} />}
              />
            </LocalizationProvider>
          </FormField>
        </FormSection>

        <FormSection>
          <SectionTitle>Health Information</SectionTitle>
          <FormField>
            <InputLabel>Height (cm)</InputLabel>
            <StyledTextField
              fullWidth
              placeholder="Enter your height"
              name="height"
              type="number"
              value={userData.height}
              onChange={handleInputChange}
            />
          </FormField>
          <FormField>
            <InputLabel>Weight (kg)</InputLabel>
            <StyledTextField
              fullWidth
              placeholder="Enter your weight"
              name="weight"
              type="number"
              value={userData.weight}
              onChange={handleInputChange}
            />
          </FormField>
          <FormField>
            <InputLabel>Blood Group</InputLabel>
            <StyledSelect
              fullWidth
              name="bloodGroup"
              value={userData.bloodGroup}
              onChange={handleInputChange}
            >
              <MenuItem value="A+">A+</MenuItem>
              <MenuItem value="A-">A-</MenuItem>
              <MenuItem value="B+">B+</MenuItem>
              <MenuItem value="B-">B-</MenuItem>
              <MenuItem value="AB+">AB+</MenuItem>
              <MenuItem value="AB-">AB-</MenuItem>
              <MenuItem value="O+">O+</MenuItem>
              <MenuItem value="O-">O-</MenuItem>
            </StyledSelect>
          </FormField>
          <FormField>
            <InputLabel>Blood Pressure</InputLabel>
            <StyledTextField
              fullWidth
              placeholder="Enter your blood pressure"
              name="bloodPressure"
              value={userData.bloodPressure}
              onChange={handleInputChange}
            />
          </FormField>
          <FormField>
            <InputLabel>Allergies</InputLabel>
            <StyledTextField
              fullWidth
              placeholder="List any allergies"
              name="allergy"
              value={userData.allergy}
              onChange={handleInputChange}
              multiline
              rows={3}
            />
          </FormField>
        </FormSection>

        <EmergencyContactsSection>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mb: '12px' }}>
            <ContactPhoneIcon sx={{ fontSize: '1.5rem', color: '#2C3E50' }} />
            <SectionTitle sx={{ mb: 0, fontSize: '1.25rem' }}>Emergency Contacts</SectionTitle>
          </Box>
          
          {userData.emergencyContacts.map((contact, index) => (
            <ContactField key={index}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: '8px' }}>
                <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, color: '#2C3E50' }}>
                  Contact {index + 1}
                </Typography>
                {index > 0 && (
                  <DeleteContactButton onClick={() => handleDeleteContact(index)}>
                    <DeleteOutlineIcon />
                  </DeleteContactButton>
                )}
              </Box>
              <FormField>
                <InputLabel>Name</InputLabel>
                <StyledTextField
                  fullWidth
                  placeholder="Enter contact name"
                  value={contact.name}
                  onChange={(e) => handleEmergencyContactChange(index, 'name', e.target.value)}
                />
              </FormField>
              <FormField>
                <InputLabel>Relationship</InputLabel>
                <StyledTextField
                  fullWidth
                  placeholder="Enter relationship"
                  value={contact.relationship}
                  onChange={(e) => handleEmergencyContactChange(index, 'relationship', e.target.value)}
                />
              </FormField>
              <FormField sx={{ mb: 0 }}>
                <InputLabel>Phone Number</InputLabel>
                <StyledTextField
                  fullWidth
                  placeholder="Enter phone number"
                  value={contact.phoneNumber}
                  onChange={(e) => handleEmergencyContactChange(index, 'phoneNumber', e.target.value)}
                />
              </FormField>
            </ContactField>
          ))}
          
          <AddContactButton
            startIcon={<AddCircleOutlineIcon sx={{ fontSize: '1.25rem' }} />}
            onClick={handleAddContact}
            fullWidth
          >
            Add Another Contact
          </AddContactButton>
        </EmergencyContactsSection>

        <UpdateButton onClick={handleSubmit}>
          Save Changes
        </UpdateButton>
      </Content>

      {loading && (
        <LoadingOverlay>
          <CircularProgress size={40} />
        </LoadingOverlay>
      )}
    </PageContainer>
  );
};

export default EditProfile;