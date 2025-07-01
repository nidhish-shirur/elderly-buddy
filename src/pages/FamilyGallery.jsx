import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Avatar, Paper, CircularProgress, Button, Grid, IconButton
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Fab from '@mui/material/Fab';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../utils/firebase';
import { doc, getDoc, updateDoc, setDoc, onSnapshot } from 'firebase/firestore';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const Container = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: `linear-gradient(135deg, #f8fafc 0%, #e3eafc 100%)`,
  padding: theme.spacing(0),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(2, 0),
  },
}));

const GalleryHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  padding: theme.spacing(0, 2),
  background: '#f5f7fb',
  borderBottom: `1.5px solid #e3eafc`,
  minHeight: 70,
  position: 'relative',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(0, 4),
    minHeight: 88,
  },
}));

const TopPhotoBox = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: 520,
  margin: '0 auto',
  borderRadius: 24,
  overflow: 'hidden',
  boxShadow: '0 8px 32px rgba(74,111,165,0.13)',
  background: theme.palette.background.paper,
  marginBottom: theme.spacing(4),
  border: `2px solid ${theme.palette.divider}`,
  [theme.breakpoints.up('md')]: {
    marginBottom: theme.spacing(5),
  },
}));

const TopPhoto = styled('img')(({ theme }) => ({
  width: '100%',
  height: 220,
  objectFit: 'cover',
  display: 'block',
  [theme.breakpoints.up('sm')]: {
    height: 320,
  },
}));

const PhotoCaption = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  color: theme.palette.text.secondary,
  fontSize: 17,
  padding: theme.spacing(1.5, 0),
  background: 'rgba(245, 245, 245, 0.95)',
  fontWeight: 500,
  letterSpacing: 0.2,
}));

const MemberGrid = styled(Grid)(({ theme }) => ({
  marginTop: theme.spacing(2),
  width: '100%',
  maxWidth: 1100,
  marginLeft: 'auto',
  marginRight: 'auto',
  padding: theme.spacing(0, 1),
  justifyContent: 'center',
  rowGap: theme.spacing(2),
  columnGap: theme.spacing(2), // add horizontal gap
  [theme.breakpoints.down('sm')]: {
    maxWidth: 400,
    padding: theme.spacing(0, 0.5),
    rowGap: theme.spacing(2),
    columnGap: theme.spacing(2), // add horizontal gap for mobile
  },
}));

const MemberCard = styled(Paper)(({ theme }) => ({
  borderRadius: 20,
  padding: theme.spacing(2, 1, 1.5, 1),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  boxShadow: '0 4px 16px rgba(74,111,165,0.10)',
  background: 'linear-gradient(135deg, #f8fafc 0%, #e3eafc 100%)',
  position: 'relative',
  minHeight: 180,
  maxWidth: 170,
  margin: '0 auto',
  transition: 'transform 0.22s, box-shadow 0.22s, background 0.22s',
  border: '1.5px solid #e3eafc',
  '&:hover': {
    transform: 'translateY(-6px) scale(1.04)',
    boxShadow: '0 10px 28px rgba(74,111,165,0.16)',
    background: 'linear-gradient(135deg, #e3eafc 0%, #f8fafc 100%)',
    borderColor: '#b3c6f7',
  },
  [theme.breakpoints.up('sm')]: {
    minHeight: 240,
    maxWidth: 220,
    padding: theme.spacing(3, 2, 2, 2),
  },
}));

const MemberAvatar = styled(Avatar)(({ theme }) => ({
  width: 60,
  height: 60,
  background: 'linear-gradient(135deg, #b39ddb 0%, #90caf9 100%)',
  color: '#512da8',
  fontSize: 34,
  marginBottom: theme.spacing(1),
  boxShadow: '0 2px 8px rgba(74,111,165,0.10)',
  border: '2px solid #fff',
  cursor: 'pointer',
  transition: 'transform 0.22s, box-shadow 0.22s',
  objectFit: 'cover',
  '& img': {
    objectFit: 'cover',
    width: '100%',
    height: '100%',
  },
  '&:hover': {
    transform: 'scale(1.09)',
    boxShadow: '0 4px 16px rgba(74,111,165,0.18)',
  },
  [theme.breakpoints.up('sm')]: {
    width: 84,
    height: 84,
    fontSize: 42,
    marginBottom: theme.spacing(1.5),
  },
}));

const SpeakerIconButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: 12,
  right: 12,
  background: theme.palette.background.paper,
  boxShadow: '0 2px 6px rgba(74,111,165,0.10)',
  '&:hover': {
    background: theme.palette.action.hover,
  },
}));

const EditFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(4),
  right: theme.spacing(4),
  zIndex: 10,
  background: '#1976d2',
  color: '#fff',
  '&:hover': {
    background: '#1565c0',
  },
}));

const EditButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: 12,
  left: 12,
  background: theme.palette.background.paper,
  boxShadow: '0 2px 6px rgba(74,111,165,0.10)',
  '&:hover': {
    background: theme.palette.action.hover,
  },
}));

const RoleChip = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(90deg, #1976d2 0%, #7b1fa2 100%)',
  color: '#fff',
  borderRadius: 15,
  padding: theme.spacing(0.5, 2),
  fontSize: 14,
  fontWeight: 600,
  margin: theme.spacing(0.5, 0, 1, 0),
  textTransform: 'capitalize',
  letterSpacing: 0.5,
  boxShadow: '0 1px 4px rgba(74,111,165,0.07)',
  textAlign: 'center',
  minWidth: 80,
}));

const BirthdateBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  color: '#7b1fa2',
  fontWeight: 500,
  fontSize: 14,
  marginTop: theme.spacing(0.5),
  background: 'rgba(225, 225, 247, 0.18)',
  padding: theme.spacing(0.5, 1.2),
  borderRadius: 10,
  minHeight: 28,
}));

const BirthdayEmoji = () => <span role="img" aria-label="birthday">🎂</span>;

// Helper to check if a URL is a valid image link
function isValidImageUrl(url) {
  // Accept common image extensions and Google Drive direct links
  return (
    /\.(jpeg|jpg|gif|png|webp|bmp)$/i.test(url) ||
    /^https:\/\/drive\.google\.com\/uc\?export=view&id=/.test(url)
  );
}

// Helper to convert Google Drive share link to direct image link
function getDirectImageUrl(url) {
  // Google Drive share link: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // Direct link: https://drive.google.com/uc?export=view&id=FILE_ID
  const match = url.match(/https:\/\/drive\.google\.com\/file\/d\/([^/]+)\//);
  if (match) {
    return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  }
  // If already a direct link, return as is
  if (/^https:\/\/drive\.google\.com\/uc\?export=view&id=/.test(url)) {
    return url;
  }
  return url;
}

const FamilyGallery = () => {
  const { currentUser } = useAuth();
  const [family, setFamily] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [form, setForm] = useState({ name: '', role: '', birthdate  : '', imageUrl: '' });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();

  // Real-time listener for family data
  useEffect(() => {
    if (!currentUser?.uid) {
      setFamily([]);
      setLoading(false);
      return;
    }

    const userRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        setFamily(data.familyMembers || []);
      } else {
        setFamily([]);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error listening to family data:', error);
      setFamily([]);
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup subscription
  }, [currentUser]);

  const topPhotoUrl = 'https://images.unsplash.com/photo-1682405206422-fff43c8d687f?q=80&w=1198&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'; // Dummy family photo
  const topPhotoCaption = 'A cherished family moment from last year.';

  const getRole = (member) => member.role || 'Family Member';
  const getName = (member) => member.name || 'Unnamed';
  const getBirthdate = (member) => member.birthdate || 'Date Unavailable';

  const speakMemberInfo = (name, role, birthdate) => {
    const utterance = new SpeechSynthesisUtterance(`This is ${name}, ${role}, born on ${birthdate}.`);
    window.speechSynthesis.speak(utterance);
  };

  const handleOpenDialog = (member = {}, idx = null) => {
    setForm({
      name: member.name || '',
      role: member.role || '',
      birthdate: member.birthdate || '',
      imageUrl: member.imageUrl || '',
    });
    setEditIdx(idx);
    setDialogOpen(true);
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Save (add or edit) family member and sync with backend
  const handleSaveMember = async () => {
    if (!form.name.trim()) {
      setSnackbarMessage('Name is required.');
      setSnackbarOpen(true);
      return;
    }

    // Convert Google Drive share link to direct image link if needed
    const processedForm = {
      ...form,
      imageUrl: form.imageUrl ? getDirectImageUrl(form.imageUrl.trim()) : '',
    };

    let updatedFamily;
    if (editIdx === null) {
      updatedFamily = [...family, processedForm];
    } else {
      updatedFamily = family.map((m, i) => (i === editIdx ? processedForm : m));
    }

    // Optimistic update
    setFamily(updatedFamily);

    if (currentUser?.uid) {
      const userRef = doc(db, 'users', currentUser.uid);
      try {
        await updateDoc(userRef, { familyMembers: updatedFamily });
        setSnackbarMessage(`${editIdx === null ? 'Added' : 'Updated'} successfully!`);
      } catch (e) {
        setFamily(family);
        setSnackbarMessage(`Failed to ${editIdx === null ? 'add' : 'update'}: ${e.message}`);
        console.error('Error updating family data:', e);
      } finally {
        setSnackbarOpen(true);
        setDialogOpen(false);
        setForm({ name: '', role: '', birthdate: '', imageUrl: '' });
        setEditIdx(null);
      }
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container>
      <GalleryHeader>
        <IconButton
          onClick={() => navigate(-1)}
          sx={{
            position: 'absolute',
            left: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#1976d2',
            background: '#fff',
            boxShadow: '0 2px 8px rgba(74,111,165,0.07)',
            p: 1.2,
            borderRadius: '50%',
            zIndex: 2,
            '&:hover': {
              background: '#f0f4f8',
            },
            [theme.breakpoints.up('sm')]: {
              left: 24,
              p: 1.5,
            },
          }}
          aria-label="Go back"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 900,
            color: '#222e3a',
            letterSpacing: 1,
            fontFamily: 'Montserrat, Arial, sans-serif',
            textAlign: 'center',
            flex: 1,
            fontSize: { xs: 22, sm: 28, md: 32 },
            ml: { xs: 0, sm: 2 },
          }}
        >
          Family Gallery
        </Typography>
      </GalleryHeader>
      <TopPhotoBox>
        <TopPhoto src={topPhotoUrl} alt="Family group photo" />
        <PhotoCaption>{topPhotoCaption}</PhotoCaption>
      </TopPhotoBox>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: theme.spacing(6) }}>
          <CircularProgress size={44} sx={{ color: theme.palette.primary.main }} />
        </Box>
      ) : (
        <MemberGrid container spacing={2}>
          {(family.length === 0 ? Array(4).fill({}) : family).map((member, idx) => (
            <Grid
              item
              xs={6}
              sm={4}
              md={4}
              lg={3}
              key={idx}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mb: { xs: 2, sm: 3 }, // add bottom margin for extra vertical space
              }}
            >
              <MemberCard>
                <EditButton
                  size="small"
                  onClick={() => handleOpenDialog(member, idx)}
                  aria-label={`Edit ${getName(member)}`}
                >
                  <EditIcon fontSize="small" />
                </EditButton>
                <SpeakerIconButton
                  size="small"
                  onClick={() => speakMemberInfo(getName(member), getRole(member), getBirthdate(member))}
                  aria-label={`Speak info for ${getName(member)}`}
                >
                  <VolumeUpIcon fontSize="small" />
                </SpeakerIconButton>
                <MemberAvatar
                  src={
                    member.imageUrl
                      ? getDirectImageUrl(member.imageUrl)
                      : undefined
                  }
                  onClick={() =>
                    member.imageUrl &&
                    window.open(getDirectImageUrl(member.imageUrl), '_blank')
                  }
                  aria-label={`View photo of ${getName(member)}`}
                  imgProps={{
                    referrerPolicy: "no-referrer"
                  }}
                >
                  {!member.imageUrl && getName(member)[0]?.toUpperCase()}
                </MemberAvatar>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: theme.palette.text.primary,
                    textAlign: 'center',
                    fontSize: 16,
                    mt: 0.5,
                    fontFamily: 'Montserrat, Arial, sans-serif',
                    lineHeight: 1.2,
                  }}
                >
                  {getName(member)}
                </Typography>
                <RoleChip>{getRole(member)}</RoleChip>
                <BirthdateBox>
                  <BirthdayEmoji />
                  {getBirthdate(member)}
                </BirthdateBox>
              </MemberCard>
            </Grid>
          ))}
        </MemberGrid>
      )}
      <EditFab
        color="primary"
        aria-label="add"
        onClick={() => handleOpenDialog()}
        title="Add Family Member"
      >
        <AddIcon />
      </EditFab>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700, textAlign: 'center', fontSize: 22 }}>
          {editIdx === null ? 'Add Family Member' : 'Edit Family Member'}
        </DialogTitle>
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            mt: 1,
            pb: 0,
          }}
        >
          <TextField
            margin="dense"
            label="Name"
            name="name"
            value={form.name}
            onChange={handleFormChange}
            fullWidth
            required
            variant="outlined"
            InputProps={{
              sx: {
                borderRadius: 2,
                background: '#f8fafc',
                fontWeight: 600,
                fontSize: 17,
              },
            }}
            InputLabelProps={{
              sx: { fontWeight: 500, fontSize: 15 },
            }}
            autoFocus
          />
          <TextField
            margin="dense"
            label="Role"
            name="role"
            value={form.role}
            onChange={handleFormChange}
            fullWidth
            variant="outlined"
            InputProps={{
              sx: {
                borderRadius: 2,
                background: '#f8fafc',
                fontWeight: 500,
                fontSize: 16,
              },
            }}
            InputLabelProps={{
              sx: { fontWeight: 500, fontSize: 15 },
            }}
            placeholder="e.g. Father, Mother, Sister"
          />
          <TextField
            margin="dense"
            label="Birthdate/Anniversary"
            name="birthdate"
            value={form.birthdate}
            onChange={handleFormChange}
            fullWidth
            variant="outlined"
            InputProps={{
              sx: {
                borderRadius: 2,
                background: '#f8fafc',
                fontWeight: 500,
                fontSize: 16,
              },
            }}
            InputLabelProps={{
              sx: { fontWeight: 500, fontSize: 15 },
            }}
            placeholder="e.g. 01 Jan 1970"
          />
          <TextField
            margin="dense"
            label="Image URL"
            name="imageUrl"
            value={form.imageUrl}
            onChange={handleFormChange}
            fullWidth
            variant="outlined"
            InputProps={{
              sx: {
                borderRadius: 2,
                background: '#f8fafc',
                fontWeight: 500,
                fontSize: 16,
              },
            }}
            InputLabelProps={{
              sx: { fontWeight: 500, fontSize: 15 },
            }}
            placeholder="Paste image URL (optional)"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ fontWeight: 600 }}>
            Cancel
          </Button>
          <Button onClick={handleSaveMember} variant="contained" sx={{ fontWeight: 700 }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarMessage.includes('Failed') ? 'error' : 'success'} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default FamilyGallery;