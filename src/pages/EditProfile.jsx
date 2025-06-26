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

const PageContainer = styled(Box)({
  maxWidth: '800px',
  margin: '0 auto',
  backgroundColor: '#F5F5F5',
  minHeight: '100vh',
  position: 'relative',
});

const Header = styled(Box)({
  backgroundColor: '#8B7355',
  color: 'white',
  padding: '24px',
  height: '140px',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  position: 'relative',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
});

const BackButton = styled(IconButton)({
  position: 'absolute',
  left: 16,
  top: 24,
  color: 'white',
  padding: '12px',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  }
});

const HeaderTitle = styled(Typography)({
  color: 'white',
  fontSize: '28px',
  fontWeight: 600,
  marginTop: 16,
});

const Content = styled(Box)({
  padding: '24px',
  maxWidth: '800px',
  margin: '0 auto',
});

const ProfileSection = styled(Box)({
  position: 'relative',
  marginTop: -70,
  marginBottom: 40,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

const AvatarCircle = styled(Box)({
  width: 140,
  height: 140,
  backgroundColor: '#F0EAE3',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '6px solid white',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  marginBottom: 16,
});

const ChangePhotoButton = styled(Button)({
  color: '#2C3E50',
  fontSize: '18px',
  padding: '8px 16px',
  backgroundColor: '#A5D6D9',
  borderRadius: '12px',
  textTransform: 'none',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  '&:hover': {
    backgroundColor: '#8FC1C4',
  },
});

const FormSection = styled(Paper)({
  padding: '24px',
  marginBottom: '24px',
  borderRadius: '12px',
  backgroundColor: 'white',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
});

const SectionTitle = styled(Typography)({
  fontSize: '24px',
  fontWeight: 600,
  color: '#2C3E50',
  marginBottom: '24px',
});

const InputLabel = styled(Typography)({
  fontSize: '18px',
  color: '#2C3E50',
  marginBottom: '12px',
  fontWeight: 500,
});

const FormField = styled(Box)({
  marginBottom: '24px',
});

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
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
    padding: '16px',
    fontSize: '18px',
    color: '#2C3E50',
    '&::placeholder': {
      color: '#666',
      opacity: 1,
    },
  },
  '& .MuiInputLabel-root': {
    fontSize: '18px',
    color: '#2C3E50',
  },
});

const StyledSelect = styled(Select)({
  borderRadius: '12px',
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
    padding: '16px !important',
    fontSize: '18px',
    color: '#2C3E50',
  },
  '& .MuiSelect-icon': {
    color: '#2C3E50',
  },
});

const UpdateButton = styled(Button)({
  backgroundColor: '#A5D6D9',
  color: '#2C3E50',
  borderRadius: '12px',
  padding: '16px',
  width: '100%',
  textTransform: 'none',
  fontSize: '20px',
  fontWeight: 600,
  marginTop: '32px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  '&:hover': {
    backgroundColor: '#8FC1C4',
  },
});

const StyledDatePicker = styled(DatePicker)({
  width: '100%',
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
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
    padding: '16px',
    fontSize: '18px',
    color: '#2C3E50',
  },
  '& .MuiInputAdornment-root .MuiIconButton-root': {
    color: '#2C3E50',
    padding: '12px',
  },
});

const LoadingOverlay = styled(Box)({
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
});

const EmergencyContactsSection = styled(Paper)({
  marginTop: '32px',
  padding: '24px',
  backgroundColor: 'white',
  borderRadius: '12px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
});

const ContactField = styled(Box)({
  marginBottom: '24px',
  padding: '20px',
  backgroundColor: '#F8F9FA',
  borderRadius: '12px',
  border: '2px solid #A5D6D9',
});

const AddContactButton = styled(Button)({
  marginTop: '16px',
  color: '#2C3E50',
  backgroundColor: '#A5D6D9',
  borderRadius: '12px',
  textTransform: 'none',
  padding: '12px 24px',
  fontSize: '18px',
  fontWeight: 600,
  '&:hover': {
    backgroundColor: '#8FC1C4',
  }
});

const DeleteContactButton = styled(IconButton)({
  color: '#FF4444',
  padding: '12px',
  backgroundColor: '#FFE4E4',
  '&:hover': {
    backgroundColor: '#FFD1D1'
  }
});

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
    
    // Validate at least one emergency contact
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
          <ArrowBackIcon sx={{ fontSize: 28 }} />
        </BackButton>
        <HeaderTitle>Edit Profile</HeaderTitle>
      </Header>

      <Content>
        <ProfileSection>
          <AvatarCircle>
            <PersonIcon sx={{ fontSize: 80, color: '#8B7355' }} />
          </AvatarCircle>
          <ChangePhotoButton startIcon={<AddCircleOutlineIcon />}>
            Change Photo
          </ChangePhotoButton>
        </ProfileSection>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              fontSize: '18px',
              '& .MuiAlert-message': { padding: '8px 0' }
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
              mb: 3, 
              fontSize: '18px',
              '& .MuiAlert-message': { padding: '8px 0' }
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
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="other">Other</MenuItem>
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <ContactPhoneIcon sx={{ fontSize: 28, color: '#2C3E50' }} />
            <SectionTitle sx={{ mb: 0 }}>Emergency Contacts</SectionTitle>
          </Box>
          
          {userData.emergencyContacts.map((contact, index) => (
            <ContactField key={index}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h6" sx={{ fontSize: '20px', fontWeight: 600, color: '#2C3E50' }}>
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
            startIcon={<AddCircleOutlineIcon sx={{ fontSize: 24 }} />}
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
          <CircularProgress size={60} />
        </LoadingOverlay>
      )}
    </PageContainer>
  );
};

export default EditProfile; 