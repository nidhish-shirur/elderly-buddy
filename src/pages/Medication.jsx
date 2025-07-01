import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { 
  Box, 
  Typography, 
  Button, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  List,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  InputAdornment,
  useMediaQuery,
  useTheme
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InventoryIcon from '@mui/icons-material/Inventory';
import AddIcon from '@mui/icons-material/Add';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
  onSnapshot,
  updateDoc
} from 'firebase/firestore';
import { db } from '../utils/firebase';
import SpeechButton from '../components/SpeechButton';
import BarcodeScanner from '../components/BarcodeScanner';
import CheckBox from '@mui/material/Checkbox';

const Container = styled(Box)(({ theme }) => ({
  maxWidth: '100%',
  minHeight: '100vh',
  backgroundColor: '#F5F5F5',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  padding: '12px',
  [theme.breakpoints.up('sm')]: {
    padding: '20px',
  },
}));

const Header = styled(Box)(({ theme }) => ({
  backgroundColor: '#A0E3E2',
  color: '#2C3E50',
  padding: '16px',
  display: 'flex',
  alignItems: 'center',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  borderRadius: 0, // Remove rounded corners
  transition: 'box-shadow 0.3s ease',
  marginBottom: '16px',
  marginLeft: '-12px',
  marginRight: '-12px',
  marginTop: '-12px',
  width: 'calc(100% + 24px)',
  [theme.breakpoints.up('sm')]: {
    padding: '24px',
    marginBottom: '20px',
    marginLeft: '-20px',
    marginRight: '-20px',
    marginTop: '-20px',
    width: 'calc(100% + 40px)',
    borderRadius: 0, // Remove rounded corners for larger screens
  },
}));

const Content = styled(Box)(({ theme }) => ({
  padding: '0 12px',
  maxWidth: '850px',
  margin: '0 auto',
  [theme.breakpoints.up('sm')]: {
    padding: '0 20px',
  },
}));

const ActionBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px',
  marginBottom: '20px',
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: '20px',
    marginBottom: '24px',
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  padding: '14px',
  fontSize: '20px',
  borderRadius: '12px',
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
  width: '100%',
  minWidth: 0,
  maxWidth: 'none',
  height: '80px', // Ensure all buttons have the same height
  [theme.breakpoints.up('sm')]: {
    width: '220px',
    minWidth: '220px',
    maxWidth: '220px',
    flex: 'none',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '80px', // Match height for all buttons
  },
  '& .MuiButton-startIcon': {
    marginRight: 8,
    alignItems: 'flex-start', // Align icon to top if needed
  },
  '&.MuiButton-contained': {
    backgroundColor: '#A0E3E2',
    color: '#2C3E50',
    '&:hover': {
      backgroundColor: '#8FCFCE',
      boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
    },
  },
  '&.MuiButton-outlined': {
    borderColor: '#A0E3E2',
    color: '#2C3E50',
    borderWidth: '2px',
    '&:hover': {
      borderColor: '#8FCFCE',
      boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
    },
  },
}));

const BackButton = styled(IconButton)(({ theme }) => ({
  color: '#2C3E50',
  padding: '10px',
  marginRight: '10px',
  '&:hover': {
    backgroundColor: 'rgba(44, 62, 80, 0.1)',
  },
  '& svg': {
    fontSize: '24px',
  },
  [theme.breakpoints.up('sm')]: {
    padding: '12px',
    marginRight: '14px',
    '& svg': {
      fontSize: '28px',
    },
  },
}));

const MedicineList = styled(List)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: '12px',
  padding: '12px',
  boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
  transition: 'box-shadow 0.3s ease',
  [theme.breakpoints.up('sm')]: {
    padding: '16px',
  },
}));

const MedicineItem = styled(Paper)(({ theme }) => ({
  padding: '16px',
  marginBottom: '12px',
  borderRadius: '12px',
  backgroundColor: 'white',
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  transition: 'box-shadow 0.3s ease, transform 0.2s ease',
  '&:hover': {
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    transform: 'translateY(-2px)',
  },
  '& .medicine-header': {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  '& .medicine-content': {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  [theme.breakpoints.up('sm')]: {
    padding: '20px',
    marginBottom: '16px',
    '& .medicine-header': {
      marginBottom: '10px',
    },
    '& .medicine-content': {
      gap: '10px',
    },
  },
}));

const TimeText = styled(Typography)(({ theme }) => ({
  color: '#2C3E50',
  fontSize: '18px',
  fontWeight: 500,
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  '& svg': {
    fontSize: '22px',
  },
  [theme.breakpoints.up('sm')]: {
    fontSize: '20px',
    gap: '10px',
    '& svg': {
      fontSize: '26px',
    },
  },
}));

const EmptyState = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  backgroundColor: 'white',
  borderRadius: '12px',
  marginBottom: '16px',
  boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
  textAlign: 'center',
  [theme.breakpoints.up('sm')]: {
    padding: '32px',
    marginBottom: '20px',
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  fontSize: '22px',
  padding: '16px',
  fontWeight: 600,
  [theme.breakpoints.up('sm')]: {
    fontSize: '24px',
    padding: '20px',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: '20px',
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    '& fieldset': {
      borderColor: '#E0E0E0',
      borderWidth: '2px',
    },
    '&:hover fieldset': {
      borderColor: '#4A6FA5',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#4A6FA5',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#666',
    fontSize: '16px',
    '&.Mui-focused': {
      color: '#4A6FA5',
    },
  },
  '& .MuiInputBase-input': {
    fontSize: '16px',
    padding: '12px',
  },
  [theme.breakpoints.up('sm')]: {
    marginBottom: '24px',
    '& .MuiInputLabel-root': {
      fontSize: '18px',
    },
    '& .MuiInputBase-input': {
      fontSize: '18px',
      padding: '14px',
    },
  },
}));

const WarningCard = styled(Paper)(({ theme }) => ({
  backgroundColor: '#FFF3E0',
  padding: '16px',
  marginBottom: '16px',
  borderRadius: '12px',
  border: '1px solid #FFB74D',
  '& .MuiTypography-root': {
    fontSize: '18px',
  },
  [theme.breakpoints.up('sm')]: {
    padding: '20px',
    marginBottom: '20px',
    '& .MuiTypography-root': {
      fontSize: '20px',
    },
  },
}));

const RemindersCard = styled(Paper)(({ theme }) => ({
  backgroundColor: '#E8F5E9',
  padding: '16px',
  marginBottom: '16px',
  borderRadius: '12px',
  border: '1px solid #81C784',
  '& .MuiTypography-root': {
    fontSize: '18px',
  },
  [theme.breakpoints.up('sm')]: {
    padding: '20px',
    marginBottom: '20px',
    '& .MuiTypography-root': {
      fontSize: '20px',
    },
  },
}));

const AddButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#A0E3E2',
  color: '#2C3E50',
  padding: '12px',
  borderRadius: '12px',
  textTransform: 'none',
  fontSize: '18px',
  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
  transition: 'box-shadow 0.3s ease, transform 0.2s ease',
  width: '100%',
  '&:hover': {
    backgroundColor: '#8FCFCE',
    boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
    transform: 'translateY(-2px)',
  },
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '12px',
    padding: '12px',
  },
  [theme.breakpoints.up('sm')]: {
    '& .MuiDialog-paper': {
      borderRadius: '16px',
      padding: '16px',
    },
  },
}));

const DialogHeader = styled(DialogTitle)(({ theme }) => ({
  backgroundColor: '#A0E3E2',
  color: '#2C3E50',
  padding: '16px 20px',
  margin: '-12px -12px 20px -12px',
  borderRadius: '12px 12px 0 0',
  fontSize: '22px',
  fontWeight: 600,
  [theme.breakpoints.up('sm')]: {
    padding: '20px 24px',
    margin: '-16px -16px 24px -16px',
    borderRadius: '16px 16px 0 0',
    fontSize: '24px',
  },
}));

const FormSection = styled(Box)(({ theme }) => ({
  marginBottom: '20px',
  [theme.breakpoints.up('sm')]: {
    marginBottom: '24px',
  },
}));

const FormDivider = styled(Divider)(({ theme }) => ({
  margin: '20px 0',
  backgroundColor: '#E0E0E0',
  borderWidth: '1px',
  [theme.breakpoints.up('sm')]: {
    margin: '24px 0',
  },
}));

const SummaryDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    maxWidth: '400px',
    width: '90%',
    borderRadius: '12px',
    padding: '12px',
  },
  [theme.breakpoints.up('sm')]: {
    '& .MuiDialog-paper': {
      maxWidth: '500px',
      padding: '16px',
    },
  },
}));

const ConfirmationDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    maxWidth: '400px',
    width: '90%',
    borderRadius: '12px',
    padding: '12px',
  },
  [theme.breakpoints.up('sm')]: {
    '& .MuiDialog-paper': {
      maxWidth: '500px',
      padding: '16px',
    },
  },
}));

const Medication = ({ voiceIntent }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [view, setView] = useState('routine');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [todaysMedicines, setTodaysMedicines] = useState([]);
  const [medicineStock, setMedicineStock] = useState([]);
  const [newMedication, setNewMedication] = useState({
    name: '',
    time: '',
    quantity: '',
    price: '',
    note: '',
    id: ''
  });
  const [editMedication, setEditMedication] = useState({
    name: '',
    time: '',
    quantity: '',
    price: '',
    note: '',
    id: '',
    type: ''
  });
  const [interactions, setInteractions] = useState([]);
  const [lowStockMeds, setLowStockMeds] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [medicineToAdd, setMedicineToAdd] = useState('');
  const [takenMap, setTakenMap] = useState({});

  useEffect(() => {
    if (!currentUser) return;

    const routineQuery = query(
      collection(db, 'medicineRoutines'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribeRoutine = onSnapshot(routineQuery, (snapshot) => {
      const medicines = [];
      const takenObj = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        medicines.push({ id: doc.id, ...data });
        takenObj[doc.id] = !!data.taken;
      });
      medicines.sort((a, b) => {
        const getMinutes = (timeStr) => {
          const [hours, minutes] = timeStr.split(':').map(Number);
          return hours * 60 + minutes;
        };
        return getMinutes(a.time) - getMinutes(b.time);
      });
      setTodaysMedicines(medicines);
      setTakenMap(takenObj);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching routines:', err);
      setError('Failed to load medicine routines');
      setLoading(false);
    });

    const stockQuery = query(
      collection(db, 'medicineStock'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribeStock = onSnapshot(stockQuery, (snapshot) => {
      const stock = [];
      snapshot.forEach((doc) => {
        stock.push({ id: doc.id, ...doc.data() });
      });
      stock.sort((a, b) => a.name.localeCompare(b.name));
      setMedicineStock(stock);
    }, (err) => {
      console.error('Error fetching stock:', err);
      setError('Failed to load medicine stock');
    });

    return () => {
      unsubscribeRoutine();
      unsubscribeStock();
    };
  }, [currentUser]);

  const formatTimeForDisplay = (time) => {
    try {
      const [hours, minutes] = time.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (err) {
      return time;
    }
  };

  const checkMedicineInStock = async (medicineName) => {
    const stockQuery = query(
      collection(db, 'medicineStock'),
      where('userId', '==', currentUser.uid),
      where('name', '==', medicineName.trim())
    );
    const stockSnapshot = await getDocs(stockQuery);
    return !stockSnapshot.empty;
  };

  const handleAddMedicine = async () => {
    if (!newMedication.name.trim()) {
      setError('Please enter a medicine name');
      return;
    }

    const timeValid = view === 'routine' && newMedication.time && newMedication.time.trim() !== '';
    const quantityValid = view === 'stock' && newMedication.quantity && !isNaN(parseInt(newMedication.quantity)) && parseInt(newMedication.quantity) > 0;
    if ((view === 'routine' && !timeValid) || (view === 'stock' && !quantityValid)) {
      setError(`Please provide a valid ${view === 'routine' ? 'time' : 'quantity'} for ${view}`);
      return;
    }

    try {
      setError('');
      setSuccess('');
      const timestamp = serverTimestamp();
      const medicineData = {
        userId: currentUser.uid,
        name: newMedication.name.trim(),
        note: newMedication.note || '',
        timestamp,
      };

      if (view === 'routine' && timeValid) {
        const inStock = await checkMedicineInStock(newMedication.name);
        if (!inStock) {
          setMedicineToAdd(newMedication.name);
          setOpenConfirmDialog(true);
          return;
        }
        await addDoc(collection(db, 'medicineRoutines'), {
          ...medicineData,
          time: newMedication.time,
        });
      }

      if (view === 'stock' && quantityValid) {
        const stockQuery = query(
          collection(db, 'medicineStock'),
          where('userId', '==', currentUser.uid),
          where('name', '==', newMedication.name.trim())
        );
        
        const stockSnapshot = await getDocs(stockQuery);
        
        if (!stockSnapshot.empty) {
          const existingStock = stockSnapshot.docs[0];
          const currentQuantity = parseInt(existingStock.data().quantity) || 0;
          const addedQuantity = parseInt(newMedication.quantity) || 0;
          await updateDoc(doc(db, 'medicineStock', existingStock.id), {
            quantity: (currentQuantity + addedQuantity).toString(),
            price: newMedication.price || existingStock.data().price || '',
            note: newMedication.note || existingStock.data().note || '',
            lastUpdated: timestamp,
          });
        } else {
          await addDoc(collection(db, 'medicineStock'), {
            ...medicineData,
            quantity: newMedication.quantity,
            price: newMedication.price || '',
          });
        }
      }

      setSuccess('Medicine added successfully');
      setOpenAddDialog(false);
      setNewMedication({
        name: '',
        time: '',
        quantity: '',
        price: '',
        note: '',
        id: ''
      });
    } catch (err) {
      console.error('Error adding medicine:', err.message);
      setError(`Failed to add medicine: ${err.message}`);
    }
  };

  const handleEditMedicine = async () => {
    if (!editMedication.name.trim()) {
      setError('Please enter a medicine name');
      return;
    }

    const timeValid = editMedication.type === 'routine' && editMedication.time && editMedication.time.trim() !== '';
    const quantityValid = editMedication.type === 'stock' && editMedication.quantity && !isNaN(parseInt(editMedication.quantity)) && parseInt(editMedication.quantity) > 0;
    if ((editMedication.type === 'routine' && !timeValid) || (editMedication.type === 'stock' && !quantityValid)) {
      setError(`Please provide a valid ${editMedication.type === 'routine' ? 'time' : 'quantity'} for ${editMedication.type}`);
      return;
    }

    try {
      setError('');
      setSuccess('');
      const timestamp = serverTimestamp();
      const medicineData = {
        userId: currentUser.uid,
        name: editMedication.name.trim(),
        note: editMedication.note || '',
        timestamp,
      };

      if (editMedication.type === 'routine') {
        await updateDoc(doc(db, 'medicineRoutines', editMedication.id), {
          ...medicineData,
          time: editMedication.time,
        });
      } else if (editMedication.type === 'stock') {
        await updateDoc(doc(db, 'medicineStock', editMedication.id), {
          ...medicineData,
          quantity: editMedication.quantity,
          price: editMedication.price || '',
          lastUpdated: timestamp,
        });
      }

      setSuccess('Medicine updated successfully');
      setOpenEditDialog(false);
      setEditMedication({
        name: '',
        time: '',
        quantity: '',
        price: '',
        note: '',
        id: '',
        type: ''
      });
    } catch (err) {
      console.error('Error editing medicine:', err.message);
      setError(`Failed to edit medicine: ${err.message}`);
    }
  };

  const handleConfirmAddToStock = () => {
    setView('stock');
    setOpenConfirmDialog(false);
    setOpenAddDialog(true);
    setNewMedication(prev => ({
      ...prev,
      name: medicineToAdd,
      quantity: '',
      price: '',
      note: '',
    }));
  };

  const handleDelete = async (medicineId, type) => {
    if (!window.confirm('Are you sure you want to delete this medicine?')) return;

    try {
      setError('');
      const collectionName = type === 'routine' ? 'medicineRoutines' : 'medicineStock';
      await deleteDoc(doc(db, collectionName, medicineId));
      setSuccess('Medicine deleted successfully');
    } catch (err) {
      console.error('Error deleting medicine:', err);
      setError('Failed to delete medicine');
    }
  };

  const handleEditClick = (medicine, type) => {
    setEditMedication({
      ...medicine,
      type,
      id: medicine.id
    });
    setOpenEditDialog(true);
  };

  const handleBackClick = () => {
    if (view === 'stock') {
      setView('routine');
    } else {
      navigate('/');
    }
  };

  const getMedicineDescription = (medicine) => {
    let description = `${medicine.name} scheduled for ${medicine.time}.`;
    if (medicine.note) {
      description += ` Note: ${medicine.note}`;
    }
    if (medicine.quantity) {
      description += ` Quantity: ${medicine.quantity}`;
    }
    return description;
  };

  const checkInteractions = (medications) => {
    const commonInteractions = {
      'aspirin': ['warfarin', 'ibuprofen'],
      'ibuprofen': ['aspirin', 'warfarin'],
      'warfarin': ['aspirin', 'ibuprofen'],
    };

    const newInteractions = [];
    medications.forEach(med1 => {
      medications.forEach(med2 => {
        if (med1.name !== med2.name) {
          const med1Lower = med1.name.toLowerCase();
          const med2Lower = med2.name.toLowerCase();
          if (commonInteractions[med1Lower]?.includes(med2Lower)) {
            newInteractions.push(`${med1.name} may interact with ${med2.name}`);
          }
        }
      });
    });
    setInteractions([...new Set(newInteractions)]);
  };

  const checkLowStock = (medications) => {
    const lowStock = medications.filter(med => 
      med.stock && med.stock < 3
    );
    setLowStockMeds(lowStock);
  };

  const handleBarcodeScan = (barcodeData) => {
    setNewMedication(prev => ({
      ...prev,
      barcode: barcodeData,
    }));
    setOpenAddDialog(true);
  };

  const handleToggleTaken = async (medicineId, checked) => {
    try {
      await updateDoc(doc(db, 'medicineRoutines', medicineId), {
        taken: checked,
      });
      setTakenMap((prev) => ({
        ...prev,
        [medicineId]: checked,
      }));
    } catch (err) {
      setError('Failed to update taken status');
    }
  };

  // Handler for voice intent (from Chat)
  useEffect(() => {
    if (!voiceIntent) return;
    if (voiceIntent.type === 'addMedicineRoutine') {
      setView('routine');
      setOpenAddDialog(true);
      setNewMedication(prev => ({
        ...prev,
        name: voiceIntent.name || '',
        time: voiceIntent.time || '',
        note: '',
        quantity: '',
        price: '',
        id: ''
      }));
    }
    // You can add more intent types here if needed
    // eslint-disable-next-line
  }, [voiceIntent]);

  if (loading) {
    return (
      <Container>
        <Header>
          <BackButton onClick={handleBackClick}>
            <ArrowBackIcon sx={{ fontSize: 24 }} />
          </BackButton>
          <Typography variant="h5" sx={{ width: '100%', textAlign: 'center', fontSize: '22px', fontWeight: 600 }}>
            Medicine Routine
          </Typography>
        </Header>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress size={40} thickness={4} />
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={handleBackClick}>
          <ArrowBackIcon sx={{ fontSize: 24 }} />
        </BackButton>
        <Typography variant="h5" sx={{ width: '100%', textAlign: 'center', fontSize: '22px', fontWeight: 600 }}>
          {view === 'stock' ? 'Medication' : 'Medication'}
        </Typography>
      </Header>

      <Content>
        {error && error !== 'Failed to load medicine stock' && error !== 'Failed to load medicine routines' && (
          <Alert 
            severity="error" 
            sx={{ mb: 2, fontSize: '16px', '& .MuiAlert-message': { padding: '8px 0' } }} 
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}
        {success && (
          <Alert 
            severity="success" 
            sx={{ mb: 2, fontSize: '16px', '& .MuiAlert-message': { padding: '8px 0' } }} 
            onClose={() => setSuccess('')}
          >
            {success}
          </Alert>
        )}

        <ActionBar>
          <ActionButton 
            onClick={() => setView('routine')}
            variant={view === 'routine' ? 'contained' : 'outlined'}
            startIcon={<AccessTimeIcon sx={{ fontSize: 22 }} />}
          >
            Medicine Routine
          </ActionButton>
          <ActionButton 
            onClick={() => setView('stock')}
            variant={view === 'stock' ? 'contained' : 'outlined'}
            startIcon={<InventoryIcon sx={{ fontSize: 22 }} />}
          >
            Medicine Stock
          </ActionButton>
          <ActionButton 
            onClick={() => setShowSummary(true)} 
            startIcon={<NotificationsIcon sx={{ fontSize: 22 }} />}
          >
            Show Summary
          </ActionButton>
        </ActionBar>

        {view === 'routine' && (
          <Box sx={{ mb: 2 }}>
            <AddButton 
              onClick={() => setOpenAddDialog(true)}
              startIcon={<AddIcon sx={{ fontSize: 20 }} />}
            >
              Add Medicine Routine
            </AddButton>
          </Box>
        )}

        {view === 'stock' && (
          <Box sx={{ mb: 2 }}>
            <AddButton 
              onClick={() => setOpenAddDialog(true)}
              startIcon={<AddIcon sx={{ fontSize: 20 }} />}
            >
              Add New Medicine
            </AddButton>
          </Box>
        )}

        {view === 'routine' ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
              <Typography variant="h6" sx={{ fontSize: '20px' }}>Today's Medicines</Typography>
              <SpeechButton 
                text={`You have ${todaysMedicines.length} medicines scheduled for today.`}
                tooltipText="Listen to medicine count"
                size="small"
              />
            </Box>

            {todaysMedicines.length === 0 ? (
              <EmptyState>
                <Typography variant="h6" color="textSecondary" sx={{ fontSize: '18px' }}>No medicines scheduled</Typography>
                <Typography color="textSecondary" sx={{ fontSize: '16px' }}>Add medicines to your daily routine</Typography>
              </EmptyState>
            ) : (
              <>
                {/* Upcoming Medicines */}
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, mt: 2, color: '#388e3c' }}>
                  Upcoming Medicines
                </Typography>
                <MedicineList>
                  {todaysMedicines.filter(med => !takenMap[med.id]).length === 0 && (
                    <Typography sx={{ color: '#888', fontSize: '16px', px: 2, py: 1 }}>
                      No upcoming medicines.
                    </Typography>
                  )}
                  {todaysMedicines.filter(med => !takenMap[med.id]).map((medicine) => (
                    <MedicineItem key={medicine.id}>
                      <Box className="medicine-header">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckBox
                            checked={!!takenMap[medicine.id]}
                            onChange={e => handleToggleTaken(medicine.id, e.target.checked)}
                            color="success"
                            inputProps={{ 'aria-label': 'Mark as taken' }}
                            sx={{ p: 0, mr: 1 }}
                          />
                          <Typography variant="h6" sx={{ fontSize: '18px' }}>
                            {medicine.name}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <SpeechButton 
                            text={getMedicineDescription(medicine)}
                            tooltipText="Listen to medicine details"
                            size="small"
                          />
                          <IconButton
                            onClick={() => handleEditClick(medicine, 'routine')}
                            size="small"
                            color="primary"
                            sx={{ '& svg': { fontSize: '20px' } }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDelete(medicine.id, 'routine')}
                            size="small"
                            color="error"
                            sx={{ '& svg': { fontSize: '20px' } }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                      <Box className="medicine-content">
                        <TimeText>
                          <AccessTimeIcon /> {formatTimeForDisplay(medicine.time)}
                        </TimeText>
                        {medicine.note && (
                          <Typography color="textSecondary" sx={{ fontSize: '16px' }}>{medicine.note}</Typography>
                        )}
                      </Box>
                    </MedicineItem>
                  ))}
                </MedicineList>

                {/* Completed Medicines */}
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, mt: 3, color: '#1976d2' }}>
                  Completed Medicines
                </Typography>
                <MedicineList>
                  {todaysMedicines.filter(med => !!takenMap[med.id]).length === 0 && (
                    <Typography sx={{ color: '#888', fontSize: '16px', px: 2, py: 1 }}>
                      No completed medicines yet.
                    </Typography>
                  )}
                  {todaysMedicines.filter(med => !!takenMap[med.id]).map((medicine) => (
                    <MedicineItem key={medicine.id} sx={{ opacity: 0.7 }}>
                      <Box className="medicine-header">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckBox
                            checked={!!takenMap[medicine.id]}
                            onChange={e => handleToggleTaken(medicine.id, e.target.checked)}
                            color="success"
                            inputProps={{ 'aria-label': 'Mark as taken' }}
                            sx={{ p: 0, mr: 1 }}
                          />
                          <Typography variant="h6" sx={{ fontSize: '18px', textDecoration: 'line-through' }}>
                            {medicine.name}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <SpeechButton 
                            text={getMedicineDescription(medicine)}
                            tooltipText="Listen to medicine details"
                            size="small"
                          />
                          <IconButton
                            onClick={() => handleEditClick(medicine, 'routine')}
                            size="small"
                            color="primary"
                            sx={{ '& svg': { fontSize: '20px' } }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDelete(medicine.id, 'routine')}
                            size="small"
                            color="error"
                            sx={{ '& svg': { fontSize: '20px' } }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                      <Box className="medicine-content">
                        <TimeText>
                          <AccessTimeIcon /> {formatTimeForDisplay(medicine.time)}
                        </TimeText>
                        {medicine.note && (
                          <Typography color="textSecondary" sx={{ fontSize: '16px' }}>{medicine.note}</Typography>
                        )}
                      </Box>
                    </MedicineItem>
                  ))}
                </MedicineList>
              </>
            )}
          </>
        ) : (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
              <Typography variant="h6" sx={{ fontSize: '20px' }}>Medicine Stock</Typography>
              <SpeechButton 
                text={`You have ${medicineStock.length} medicines in your stock.`}
                tooltipText="Listen to stock count"
                size="small"
              />
            </Box>
            {medicineStock.length === 0 ? (
              <EmptyState>
                <Typography variant="h6" color="textSecondary" sx={{ fontSize: '18px' }}>No medicines in stock</Typography>
                <Typography color="textSecondary" sx={{ fontSize: '16px' }}>Add medicines to track your inventory</Typography>
              </EmptyState>
            ) : (
              <MedicineList>
                {medicineStock.map((medicine) => (
                  <MedicineItem key={medicine.id}>
                    <Box className="medicine-header">
                      <Typography variant="h6" sx={{ fontSize: '18px' }}>{medicine.name}</Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <SpeechButton 
                          text={`${medicine.name}: ${medicine.quantity} units available. Price: ${medicine.price || 'not specified'}`}
                          tooltipText="Listen to stock details"
                          size="small"
                        />
                        <IconButton
                          onClick={() => handleEditClick(medicine, 'stock')}
                          size="small"
                          color="primary"
                          sx={{ '& svg': { fontSize: '20px' } }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(medicine.id, 'stock')}
                          size="small"
                          color="error"
                          sx={{ '& svg': { fontSize: '20px' } }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                    <Box className="medicine-content">
                      <Typography sx={{ fontSize: '16px' }}>Quantity: {medicine.quantity}</Typography>
                      {medicine.price && (
                        <Typography sx={{ fontSize: '16px' }}>Price: {medicine.price}</Typography>
                      )}
                    </Box>
                  </MedicineItem>
                ))}
              </MedicineList>
            )}
          </>
        )}

        <StyledDialog
          open={openAddDialog}
          onClose={() => {
            setOpenAddDialog(false);
            setError('');
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogHeader>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Add New {view === 'routine' ? 'Medicine to Routine' : 'Medicine to Stock'}
              <IconButton 
                onClick={() => {
                  setOpenAddDialog(false);
                  setError('');
                }}
                sx={{ 
                  color: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.2)',
                  },
                  '& svg': { fontSize: '22px' },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogHeader>

          <DialogContent sx={{ px: 2, pb: 2 }}>
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 2,
                  borderRadius: '12px',
                  '& .MuiAlert-message': { fontSize: '16px' },
                }}
              >
                {error}
              </Alert>
            )}
            {success && (
              <Alert 
                severity="success"
                sx={{ 
                  mb: 2,
                  borderRadius: '12px',
                  '& .MuiAlert-message': { fontSize: '16px' },
                }}
              >
                {success}
              </Alert>
            )}

            <FormSection>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <BarcodeScanner onScan={handleBarcodeScan} />
              </Box>

              <FormDivider />

              <Typography variant="h6" sx={{ mb: 2, color: '#2C3E50', fontSize: '20px' }}>
                Medicine Details
              </Typography>

              <StyledTextField
                label="Medicine Name"
                placeholder="Enter medicine name"
                value={newMedication.name}
                onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                fullWidth
                required
              />

              {view === 'routine' && (
                <StyledTextField
                  label="Time"
                  value={newMedication.time}
                  onChange={(e) => setNewMedication({ ...newMedication, time: e.target.value })}
                  fullWidth
                  type="time"
                  InputLabelProps={{ shrink: true }}
                />
              )}

              {view === 'stock' && (
                <>
                  <StyledTextField
                    label="Quantity"
                    placeholder="Enter quantity"
                    value={newMedication.quantity}
                    onChange={(e) => setNewMedication({ ...newMedication, quantity: e.target.value })}
                    fullWidth
                    type="number"
                  />
                  <StyledTextField
                    label="Price"
                    placeholder="Enter price"
                    value={newMedication.price}
                    onChange={(e) => setNewMedication({ ...newMedication, price: e.target.value })}
                    fullWidth
                    type="number"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                  />
                </>
              )}

              <StyledTextField
                label="Note"
                placeholder="Add any special instructions or notes"
                value={newMedication.note}
                onChange={(e) => setNewMedication({ ...newMedication, note: e.target.value })}
                fullWidth
                multiline
                rows={3}
              />
            </FormSection>
          </DialogContent>

          <DialogActions sx={{ px: 2, pb: 2 }}>
            <Button 
              onClick={() => setOpenAddDialog(false)}
              sx={{ 
                color: '#666',
                fontSize: '16px',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#F5F5F5',
                },
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddMedicine}
              variant="contained"
              sx={{ 
                backgroundColor: '#A0E3E2',
                color: '#2C3E50',
                fontSize: '16px',
                textTransform: 'none',
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: '#8FCFCE',
                },
              }}
            >
              Add Medicine
            </Button>
          </DialogActions>
        </StyledDialog>

        <StyledDialog
          open={openEditDialog}
          onClose={() => {
            setOpenEditDialog(false);
            setError('');
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogHeader>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Edit {editMedication.type === 'routine' ? 'Medicine Routine' : 'Medicine Stock'}
              <IconButton 
                onClick={() => {
                  setOpenEditDialog(false);
                  setError('');
                }}
                sx={{ 
                  color: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.2)',
                  },
                  '& svg': { fontSize: '22px' },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogHeader>

          <DialogContent sx={{ px: 2, pb: 2 }}>
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 2,
                  borderRadius: '12px',
                  '& .MuiAlert-message': { fontSize: '16px' },
                }}
              >
                {error}
              </Alert>
            )}
            {success && (
              <Alert 
                severity="success"
                sx={{ 
                  mb: 2,
                  borderRadius: '12px',
                  '& .MuiAlert-message': { fontSize: '16px' },
                }}
              >
                {success}
              </Alert>
            )}

            <FormSection>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <BarcodeScanner onScan={() => {}} />
              </Box>

              <FormDivider />

              <Typography variant="h6" sx={{ mb: 2, color: '#2C3E50', fontSize: '20px' }}>
                Medicine Details
              </Typography>

              <StyledTextField
                label="Medicine Name"
                placeholder="Enter medicine name"
                value={editMedication.name}
                onChange={(e) => setEditMedication({ ...editMedication, name: e.target.value })}
                fullWidth
                required
              />

              {editMedication.type === 'routine' && (
                <StyledTextField
                  label="Time"
                  value={editMedication.time}
                  onChange={(e) => setEditMedication({ ...editMedication, time: e.target.value })}
                  fullWidth
                  type="time"
                  InputLabelProps={{ shrink: true }}
                />
              )}

              {editMedication.type === 'stock' && (
                <>
                  <StyledTextField
                    label="Quantity"
                    placeholder="Enter quantity"
                    value={editMedication.quantity}
                    onChange={(e) => setEditMedication({ ...editMedication, quantity: e.target.value })}
                    fullWidth
                    type="number"
                  />
                  <StyledTextField
                    label="Price"
                    placeholder="Enter price"
                    value={editMedication.price}
                    onChange={(e) => setEditMedication({ ...editMedication, price: e.target.value })}
                    fullWidth
                    type="number"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                  />
                </>
              )}

              <StyledTextField
                label="Note"
                placeholder="Add any special instructions or notes"
                value={editMedication.note}
                onChange={(e) => setEditMedication({ ...editMedication, note: e.target.value })}
                fullWidth
                multiline
                rows={3}
              />
            </FormSection>
          </DialogContent>

          <DialogActions sx={{ px: 2, pb: 2 }}>
            <Button 
              onClick={() => setOpenEditDialog(false)}
              sx={{ 
                color: '#666',
                fontSize: '16px',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#F5F5F5',
                },
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEditMedicine}
              variant="contained"
              sx={{ 
                backgroundColor: '#A0E3E2',
                color: '#2C3E50',
                fontSize: '16px',
                textTransform: 'none',
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: '#8FCFCE',
                },
              }}
            >
              Save Changes
            </Button>
          </DialogActions>
        </StyledDialog>

        <ConfirmationDialog
          open={openConfirmDialog}
          onClose={() => setOpenConfirmDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogHeader>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Confirm Addition
              <IconButton 
                onClick={() => setOpenConfirmDialog(false)}
                sx={{ 
                  color: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.2)',
                  },
                  '& svg': { fontSize: '22px' },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogHeader>
          <DialogContent sx={{ px: 2, pb: 2 }}>
            <Typography sx={{ fontSize: '18px', mb: 2 }}>
              The medicine "{medicineToAdd}" is not in stock. Would you like to add it to stock?
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 2, pb: 2 }}>
            <Button 
              onClick={() => setOpenConfirmDialog(false)}
              sx={{ 
                color: '#666',
                fontSize: '16px',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#F5F5F5',
                },
              }}
            >
              No
            </Button>
            <Button 
              onClick={handleConfirmAddToStock}
              variant="contained"
              sx={{ 
                backgroundColor: '#A0E3E2',
                color: '#2C3E50',
                fontSize: '16px',
                textTransform: 'none',
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: '#8FCFCE',
                },
              }}
            >
              Yes
            </Button>
          </DialogActions>
        </ConfirmationDialog>

        <SummaryDialog
          open={showSummary}
          onClose={() => setShowSummary(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogHeader>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Daily Summary
              <IconButton 
                onClick={() => setShowSummary(false)}
                sx={{ 
                  color: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.2)',
                  },
                  '& svg': { fontSize: '22px' },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogHeader>
          <DialogContent sx={{ px: 2, pb: 2 }}>
            <Typography sx={{ fontSize: '18px', mb: 1 }}>
              Medicines Taken: {Object.values(takenMap).filter(Boolean).length}
            </Typography>
            <Typography sx={{ fontSize: '18px', mb: 1 }}>
              Total Scheduled: {todaysMedicines.length}
            </Typography>
            <Typography sx={{ fontSize: '18px' }}>
              Stock Items: {medicineStock.length}
            </Typography>
          </DialogContent>
        </SummaryDialog>
      </Content>
    </Container>
  );
};

export default Medication;