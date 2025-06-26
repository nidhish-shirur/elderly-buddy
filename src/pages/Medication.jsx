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
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
  Alert,
  Paper,
  MenuItem,
  Divider,
  InputAdornment
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InventoryIcon from '@mui/icons-material/Inventory';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AddIcon from '@mui/icons-material/Add';
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
  orderBy,
  updateDoc
} from 'firebase/firestore';
import { db } from '../utils/firebase';
import SpeechButton from '../components/SpeechButton';
import BarcodeScanner from '../components/BarcodeScanner';
import WarningIcon from '@mui/icons-material/Warning';
import NotificationsIcon from '@mui/icons-material/Notifications';

const Container = styled(Box)(({ theme }) => ({
  maxWidth: '100%',
  minHeight: '100vh',
  backgroundColor: '#F5F5F5',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
}));

const Header = styled(Box)(({ theme }) => ({
  backgroundColor: '#A0E3E2',
  color: '#2C3E50',
  padding: '20px',
  display: 'flex',
  alignItems: 'center',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
}));

const Content = styled(Box)(({ theme }) => ({
  padding: '24px',
  maxWidth: '800px',
  margin: '0 auto'
}));

const ActionButton = styled(Button)(({ theme }) => ({
  padding: '16px',
  fontSize: '18px',
  borderRadius: '12px',
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  '&.MuiButton-contained': {
    backgroundColor: '#A0E3E2',
    color: '#2C3E50',
    '&:hover': {
      backgroundColor: '#8FCFCE'
    }
  },
  '&.MuiButton-outlined': {
    borderColor: '#A0E3E2',
    color: '#2C3E50',
    borderWidth: '2px',
    '&:hover': {
      borderColor: '#8FCFCE',
      borderWidth: '2px'
    }
  }
}));

const BackButton = styled(IconButton)(({ theme }) => ({
  color: '#2C3E50',
  padding: '12px',
  marginRight: '8px',
  '&:hover': {
    backgroundColor: 'rgba(44, 62, 80, 0.1)'
  }
}));

const MedicineList = styled(List)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: '12px',
  padding: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
}));

const MedicineItem = styled(Paper)(({ theme }) => ({
  padding: '16px',
  marginBottom: '12px',
  borderRadius: '12px',
  backgroundColor: 'white',
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  '&:hover': {
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
  },
  '& .medicine-header': {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  '& .medicine-content': {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  }
}));

const TimeText = styled(Typography)(({ theme }) => ({
  color: '#2C3E50',
  fontSize: '18px',
  fontWeight: 500,
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
}));

const EmptyState = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '32px',
  backgroundColor: 'white',
  borderRadius: '12px',
  marginBottom: '16px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  fontSize: '24px',
  padding: '24px'
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: '20px',
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    '& fieldset': {
      borderColor: '#E0E0E0',
      borderWidth: '2px'
    },
    '&:hover fieldset': {
      borderColor: '#4A6FA5'
    },
    '&.Mui-focused fieldset': {
      borderColor: '#4A6FA5'
    }
  },
  '& .MuiInputLabel-root': {
    color: '#666',
    '&.Mui-focused': {
      color: '#4A6FA5'
    }
  }
}));

const WarningCard = styled(Paper)({
  backgroundColor: '#FFF3E0',
  padding: '16px',
  marginBottom: '16px',
  borderRadius: '12px',
  border: '1px solid #FFB74D'
});

const RemindersCard = styled(Paper)({
  backgroundColor: '#E8F5E9',
  padding: '16px',
  marginBottom: '16px',
  borderRadius: '12px',
  border: '1px solid #81C784'
});

const AddButton = styled(Button)({
  backgroundColor: '#A0E3E2',
  color: '#2C3E50',
  padding: '8px 20px',
  borderRadius: '25px',
  textTransform: 'none',
  fontSize: '16px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  '&:hover': {
    backgroundColor: '#8FCFCE',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  }
});

const StyledDialog = styled(Dialog)({
  '& .MuiDialog-paper': {
    borderRadius: '20px',
    padding: '16px'
  }
});

const DialogHeader = styled(DialogTitle)({
  backgroundColor: '#A0E3E2',
  color: '#2C3E50',
  padding: '16px 24px',
  marginTop: '-16px',
  marginLeft: '-16px',
  marginRight: '-16px',
  marginBottom: '24px',
  borderRadius: '20px 20px 0 0',
  fontSize: '24px',
  fontWeight: 600
});

const FormSection = styled(Box)({
  marginBottom: '24px'
});

const FormDivider = styled(Divider)({
  margin: '24px 0',
  backgroundColor: '#E0E0E0'
});

const Medication = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [view, setView] = useState('routine');
  const [openAddDialog, setOpenAddDialog] = useState(false);
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
    note: ''
  });
  const [interactions, setInteractions] = useState([]);
  const [lowStockMeds, setLowStockMeds] = useState([]);

  // Fetch medicines on component mount
  useEffect(() => {
    if (!currentUser) return;

    // Subscribe to routine medicines
    const routineQuery = query(
      collection(db, 'medicineRoutines'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribeRoutine = onSnapshot(routineQuery, (snapshot) => {
      const medicines = [];
      snapshot.forEach((doc) => {
        medicines.push({ id: doc.id, ...doc.data() });
      });
      // Sort medicines by time
      medicines.sort((a, b) => {
        // Convert time strings to comparable values (minutes since midnight)
        const getMinutes = (timeStr) => {
          const [hours, minutes] = timeStr.split(':').map(Number);
          return hours * 60 + minutes;
        };
        return getMinutes(a.time) - getMinutes(b.time);
      });
      setTodaysMedicines(medicines);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching routines:', err);
      setError('Failed to load medicine routines');
      setLoading(false);
    });

    // Subscribe to medicine stock
    const stockQuery = query(
      collection(db, 'medicineStock'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribeStock = onSnapshot(stockQuery, (snapshot) => {
      const stock = [];
      snapshot.forEach((doc) => {
        stock.push({ id: doc.id, ...doc.data() });
      });
      // Sort the stock array by name
      stock.sort((a, b) => a.name.localeCompare(b.name));
      setMedicineStock(stock);
    }, (err) => {
      console.error('Error fetching stock:', err);
      setError('Failed to load medicine stock');
    });

    // Cleanup subscriptions
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
      return time; // Return original time if formatting fails
    }
  };

  const handleAddMedicine = async () => {
    if (!newMedication.name.trim()) {
      setError('Please enter a medicine name');
      return;
    }

    // Validate that at least one of time or quantity is provided
    if (!newMedication.time && !newMedication.quantity) {
      setError('Please provide either a time for routine or quantity for stock');
      return;
    }

    try {
      setError('');
      setSuccess('');
      const timestamp = serverTimestamp();
      const medicineData = {
        userId: currentUser.uid,
        name: newMedication.name.trim(),
        note: newMedication.note,
        timestamp: timestamp
      };

      // Add to routine if time is specified
      if (newMedication.time) {
        await addDoc(collection(db, 'medicineRoutines'), {
          ...medicineData,
          time: newMedication.time // Store in 24-hour format
        });
      }

      // Add to stock if quantity is specified
      if (newMedication.quantity) {
        // Check if medicine already exists in stock
        const stockQuery = query(
          collection(db, 'medicineStock'),
          where('userId', '==', currentUser.uid),
          where('name', '==', newMedication.name.trim())
        );
        
        const stockSnapshot = await getDocs(stockQuery);
        
        if (!stockSnapshot.empty) {
          // Update existing stock
          const existingStock = stockSnapshot.docs[0];
          const currentQuantity = parseInt(existingStock.data().quantity) || 0;
          const addedQuantity = parseInt(newMedication.quantity) || 0;
          
          await updateDoc(doc(db, 'medicineStock', existingStock.id), {
            quantity: (currentQuantity + addedQuantity).toString(),
            price: newMedication.price || existingStock.data().price,
            note: newMedication.note || existingStock.data().note,
            lastUpdated: timestamp
          });
        } else {
          // Add new stock entry
          await addDoc(collection(db, 'medicineStock'), {
            ...medicineData,
            quantity: newMedication.quantity,
            price: newMedication.price
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
        note: ''
      });
    } catch (err) {
      console.error('Error adding medicine:', err);
      setError('Failed to add medicine');
    }
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
    // Simple example interactions - in a real app, this would be more comprehensive
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
      med.stock && med.stock < 3 // Alert when less than 3 units remaining
    );
    setLowStockMeds(lowStock);
  };

  const handleBarcodeScan = (barcodeData) => {
    // In a real app, you would look up the medication in a database
    // For now, we'll just open the add medication dialog with the barcode
    setNewMedication(prev => ({
      ...prev,
      barcode: barcodeData
    }));
    setOpenAddDialog(true);
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <BackButton 
            onClick={handleBackClick}
          >
            <ArrowBackIcon sx={{ fontSize: 28 }} />
          </BackButton>
          <Typography variant="h5" sx={{ width: '100%', textAlign: 'center', fontSize: '24px', fontWeight: 600 }}>
            Medicine Routine
          </Typography>
        </Header>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <BackButton 
          onClick={handleBackClick}
        >
          <ArrowBackIcon sx={{ fontSize: 28 }} />
        </BackButton>
        <Typography variant="h5" sx={{ width: '100%', textAlign: 'center', fontSize: '24px', fontWeight: 600 }}>
          {view === 'stock' ? 'Medicine Stock' : 'Medicine Routine'}
        </Typography>
      </Header>

      <Content>
        {error && error !== 'Failed to load medicine stock' && error !== 'Failed to load medicine routines' && (
          <Alert 
            severity="error" 
            sx={{ mb: 3, fontSize: '18px', '& .MuiAlert-message': { padding: '8px 0' } }} 
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}
        {success && (
          <Alert 
            severity="success" 
            sx={{ mb: 3, fontSize: '18px', '& .MuiAlert-message': { padding: '8px 0' } }} 
            onClose={() => setSuccess('')}
          >
            {success}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
          <ActionButton 
            fullWidth
            onClick={() => setView('routine')}
            variant={view === 'routine' ? 'contained' : 'outlined'}
            startIcon={<AccessTimeIcon sx={{ fontSize: 24 }} />}
          >
            Medicine Routine
          </ActionButton>
          <ActionButton 
            fullWidth 
            onClick={() => setView('stock')}
            variant={view === 'stock' ? 'contained' : 'outlined'}
            startIcon={<InventoryIcon sx={{ fontSize: 24 }} />}
          >
            Medicine Stock
          </ActionButton>
        </Box>

        {view === 'routine' ? (
          <>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              mb: 3 
            }}>
              <AddButton 
                onClick={() => setOpenAddDialog(true)}
                startIcon={<AddIcon sx={{ fontSize: 20 }} />}
              >
                Add New Medicine
              </AddButton>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
              <Typography variant="h6">Today's Medicines</Typography>
              <SpeechButton 
                text={`You have ${todaysMedicines.length} medicines scheduled for today.`}
                tooltipText="Listen to medicine count"
                size="small"
              />
            </Box>
            {todaysMedicines.length === 0 ? (
              <EmptyState>
                <Typography variant="h6" color="textSecondary">No medicines scheduled</Typography>
                <Typography color="textSecondary">Add medicines to your daily routine</Typography>
              </EmptyState>
            ) : (
              todaysMedicines.map((medicine) => (
                <MedicineItem key={medicine.id}>
                  <Box className="medicine-header">
                    <Typography variant="h6">{medicine.name}</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <SpeechButton 
                        text={getMedicineDescription(medicine)}
                        tooltipText="Listen to medicine details"
                        size="small"
                      />
                      <IconButton
                        onClick={() => handleDelete(medicine.id, 'routine')}
                        size="small"
                        color="error"
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
                      <Typography color="textSecondary">{medicine.note}</Typography>
                    )}
                  </Box>
                </MedicineItem>
              ))
            )}
          </>
        ) : (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
              <Typography variant="h6">Medicine Stock</Typography>
              <SpeechButton 
                text={`You have ${medicineStock.length} medicines in your stock.`}
                tooltipText="Listen to stock count"
                size="small"
              />
            </Box>
            {medicineStock.length === 0 ? (
              <EmptyState>
                <Typography variant="h6" color="textSecondary">No medicines in stock</Typography>
                <Typography color="textSecondary">Add medicines to track your inventory</Typography>
              </EmptyState>
            ) : (
              medicineStock.map((medicine) => (
                <MedicineItem key={medicine.id}>
                  <Box className="medicine-header">
                    <Typography variant="h6">{medicine.name}</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <SpeechButton 
                        text={`${medicine.name}: ${medicine.quantity} units available. Price: ${medicine.price || 'not specified'}`}
                        tooltipText="Listen to stock details"
                        size="small"
                      />
                      <IconButton
                        onClick={() => handleDelete(medicine.id, 'stock')}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  <Box className="medicine-content">
                    <Typography>Quantity: {medicine.quantity}</Typography>
                    {medicine.price && (
                      <Typography>Price: {medicine.price}</Typography>
                    )}
                  </Box>
                </MedicineItem>
              ))
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
              Add New Medicine
              <IconButton 
                onClick={() => {
                  setOpenAddDialog(false);
                  setError('');
                }}
                sx={{ 
                  color: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.2)'
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogHeader>

          <DialogContent sx={{ px: 3, pb: 3 }}>
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: '12px',
                  '& .MuiAlert-message': { fontSize: '16px' }
                }}
              >
                {error}
              </Alert>
            )}
            {success && (
              <Alert 
                severity="success"
                sx={{ 
                  mb: 3,
                  borderRadius: '12px',
                  '& .MuiAlert-message': { fontSize: '16px' }
                }}
              >
                {success}
              </Alert>
            )}

            <FormSection>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                <BarcodeScanner onScan={handleBarcodeScan} />
              </Box>

              <FormDivider />

              <Typography variant="h6" sx={{ mb: 2, color: '#2C3E50' }}>
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

              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <StyledTextField
                  label="Time"
                  value={newMedication.time}
                  onChange={(e) => setNewMedication({ ...newMedication, time: e.target.value })}
                  fullWidth
                  type="time"
                  InputLabelProps={{ shrink: true }}
                />
                <StyledTextField
                  label="Quantity"
                  placeholder="Enter quantity"
                  value={newMedication.quantity}
                  onChange={(e) => setNewMedication({ ...newMedication, quantity: e.target.value })}
                  fullWidth
                  type="number"
                />
              </Box>

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

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button 
              onClick={() => setOpenAddDialog(false)}
              sx={{ 
                color: '#666',
                fontSize: '16px',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#F5F5F5'
                }
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
                px: 3,
                '&:hover': {
                  backgroundColor: '#8FCFCE'
                }
              }}
            >
              Add Medicine
            </Button>
          </DialogActions>
        </StyledDialog>
      </Content>
    </Container>
  );
};

export default Medication; 