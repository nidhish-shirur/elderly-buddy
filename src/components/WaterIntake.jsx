import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import {
  Box,
  Typography,
  IconButton,
  LinearProgress,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../utils/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import SpeechButton from './SpeechButton';

const WaterCard = styled(Paper)(({ theme }) => ({
  padding: '20px',
  borderRadius: '16px',
  backgroundColor: '#E3F2FD',
  marginBottom: '24px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  position: 'relative',
  overflow: 'hidden'
}));

const WaterProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  backgroundColor: '#BBDEFB',
  '& .MuiLinearProgress-bar': {
    backgroundColor: '#2196F3'
  }
}));

const GlassButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: '#2196F3',
  color: 'white',
  padding: '8px',
  '&:hover': {
    backgroundColor: '#1976D2'
  },
  '&.Mui-disabled': {
    backgroundColor: '#BBDEFB',
    color: '#90CAF9'
  }
}));

const DAILY_GOAL = 8; // 8 glasses per day (default)
const GLASS_SIZE = 250; // 250ml per glass

const WaterIntake = () => {
  const { currentUser } = useAuth();
  const [glasses, setGlasses] = useState(0);
  const [showReminder, setShowReminder] = useState(false);
  const [lastReminder, setLastReminder] = useState(null);

  // Load water intake data
  useEffect(() => {
    const loadWaterData = async () => {
      if (!currentUser) return;
      
      const waterRef = doc(db, 'waterIntake', currentUser.uid);
      const waterDoc = await getDoc(waterRef);
      
      if (waterDoc.exists()) {
        const data = waterDoc.data();
        // Only load today's data
        if (data.date === new Date().toDateString()) {
          setGlasses(data.glasses);
          setLastReminder(data.lastReminder);
        } else {
          // Reset for new day
          setGlasses(0);
          setLastReminder(null);
        }
      }
    };

    loadWaterData();
  }, [currentUser]);

  // Save water intake data
  const saveWaterData = async (newGlasses) => {
    if (!currentUser) return;
    
    const waterRef = doc(db, 'waterIntake', currentUser.uid);
    await setDoc(waterRef, {
      glasses: newGlasses,
      date: new Date().toDateString(),
      lastReminder: lastReminder
    });
  };

  // Check for reminders every 30 minutes
  useEffect(() => {
    const checkReminder = () => {
      const now = new Date();
      const hour = now.getHours();

      // Only remind between 8 AM and 8 PM
      if (hour >= 8 && hour <= 20) {
        const lastTime = lastReminder ? new Date(lastReminder) : null;
        
        // Show reminder if:
        // 1. No drinks today, or
        // 2. Last reminder was more than 2 hours ago and haven't reached goal
        if (!lastTime || 
            (now - lastTime > 2 * 60 * 60 * 1000 && glasses < DAILY_GOAL)) {
          setShowReminder(true);
          setLastReminder(now.toISOString());
        }
      }
    };

    const interval = setInterval(checkReminder, 30 * 60 * 1000); // Check every 30 minutes
    return () => clearInterval(interval);
  }, [glasses, lastReminder]);

  const handleAddGlass = () => {
    const newGlasses = Math.min(glasses + 1, DAILY_GOAL);
    setGlasses(newGlasses);
    saveWaterData(newGlasses);
  };

  const handleRemoveGlass = () => {
    const newGlasses = Math.max(glasses - 1, 0);
    setGlasses(newGlasses);
    saveWaterData(newGlasses);
  };

  const getWaterMessage = () => {
    const remaining = DAILY_GOAL - glasses;
    if (remaining === 0) {
      return "Great job! You've reached your water intake goal for today!";
    }
    return `You need to drink ${remaining} more glass${remaining === 1 ? '' : 'es'} of water today.`;
  };

  return (
    <>
      <WaterCard>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <WaterDropIcon sx={{ color: '#2196F3', mr: 1 }} />
          <Typography variant="h6" sx={{ flex: 1 }}>Water Intake</Typography>
          <SpeechButton
            text={getWaterMessage()}
            tooltipText="Listen to water intake status"
            size="small"
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <WaterProgress 
            variant="determinate" 
            value={(glasses / DAILY_GOAL) * 100} 
          />
        </Box>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <Typography>
            {glasses} of {DAILY_GOAL} glasses
            <Typography component="span" sx={{ color: 'text.secondary', ml: 1 }}>
              ({GLASS_SIZE}ml each)
            </Typography>
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <GlassButton 
              onClick={handleRemoveGlass}
              disabled={glasses === 0}
              size="small"
            >
              <RemoveIcon />
            </GlassButton>
            <GlassButton 
              onClick={handleAddGlass}
              disabled={glasses === DAILY_GOAL}
              size="small"
            >
              <AddIcon />
            </GlassButton>
          </Box>
        </Box>
      </WaterCard>

      <Dialog
        open={showReminder}
        onClose={() => setShowReminder(false)}
      >
        <DialogTitle sx={{ 
          bgcolor: '#E3F2FD',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <NotificationsIcon sx={{ color: '#2196F3' }} />
          Water Reminder
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography>
            It's time to drink a glass of water! Staying hydrated is important for your health.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowReminder(false)}>
            Dismiss
          </Button>
          <Button 
            onClick={() => {
              handleAddGlass();
              setShowReminder(false);
            }}
            variant="contained"
            sx={{ bgcolor: '#2196F3' }}
          >
            I'll drink now
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default WaterIntake; 