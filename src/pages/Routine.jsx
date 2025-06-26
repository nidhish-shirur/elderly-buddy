import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../utils/firebase';
import { collection, query, where, getDocs, addDoc, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { IoArrowBack } from 'react-icons/io5';
import { IoVolumeHighOutline } from 'react-icons/io5';
import { IoCheckmarkCircle, IoEllipseOutline } from 'react-icons/io5';

const Routine = () => {
  const navigate = useNavigate();
  const [routines, setRoutines] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRoutine, setNewRoutine] = useState({
    task: '',
    time: '',
  });

  useEffect(() => {
    // Check authentication and load routines
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate('/login');
      } else {
        await loadRoutines(user.uid);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const loadRoutines = async (userId) => {
    try {
      console.log('Loading routines for user:', userId);
      const routinesRef = collection(db, 'routines');
      const q = query(routinesRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      console.log('Query snapshot:', querySnapshot.docs.length, 'documents found');
      
      const routinesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        completed: doc.data().completed || false // Ensure completed property exists
      })).sort((a, b) => {
        const timeA = new Date('1970/01/01 ' + a.time);
        const timeB = new Date('1970/01/01 ' + b.time);
        return timeA - timeB;
      });
      console.log('Processed routines:', routinesList);

      setRoutines(routinesList);
    } catch (error) {
      console.error('Error loading routines:', error);
      alert('Error loading routines: ' + error.message);
    }
  };

  const handleAddRoutine = async (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', newRoutine);
    try {
      const user = auth.currentUser;
      console.log('Current user:', user);
      if (!user) {
        console.error('No user found');
        return;
      }

      // Convert 24-hour time format to 12-hour format
      const [hours, minutes] = newRoutine.time.split(':');
      const timeStr = new Date(0, 0, 0, hours, minutes).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).toLowerCase();
      console.log('Formatted time:', timeStr);

      const routineData = {
        userId: user.uid,
        task: newRoutine.task,
        time: timeStr,
        completed: false,
        createdAt: Timestamp.now()
      };
      console.log('Adding routine with data:', routineData);

      const docRef = await addDoc(collection(db, 'routines'), routineData);
      console.log('Document written with ID:', docRef.id);

      setNewRoutine({ task: '', time: '' });
      setShowAddModal(false);
      await loadRoutines(user.uid);
    } catch (error) {
      console.error('Error adding routine:', error);
      alert('Error adding routine: ' + error.message);
    }
  };

  const handleToggleComplete = async (routineId, currentStatus) => {
    try {
      const routineRef = doc(db, 'routines', routineId);
      await updateDoc(routineRef, {
        completed: !currentStatus
      });
      
      // Update local state
      setRoutines(routines.map(routine => 
        routine.id === routineId 
          ? { ...routine, completed: !routine.completed }
          : routine
      ));
    } catch (error) {
      console.error('Error updating routine status:', error);
      alert('Error updating routine status: ' + error.message);
    }
  };

  const speakReminder = (routine) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(
        `Time for ${routine.task} at ${routine.time}`
      );
      window.speechSynthesis.speak(utterance);
    }
  };

  // Separate routines into active and completed
  const activeRoutines = routines.filter(routine => !routine.completed);
  const completedRoutines = routines.filter(routine => routine.completed);

  const RoutineItem = ({ routine }) => (
    <div style={styles.routineItem}>
      <div style={styles.routineLeft}>
        <button
          onClick={() => handleToggleComplete(routine.id, routine.completed)}
          style={styles.checkButton}
        >
          {routine.completed ? (
            <IoCheckmarkCircle size={24} color="#00BFA5" />
          ) : (
            <IoEllipseOutline size={24} color="#00BFA5" />
          )}
        </button>
        <div style={{
          ...styles.routineText,
          textDecoration: routine.completed ? 'line-through' : 'none',
          color: routine.completed ? '#999' : '#000'
        }}>
          {routine.task}
        </div>
      </div>
      <div style={styles.routineTime}>{routine.time}</div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Link to="/home" style={styles.backButton}>
          <IoArrowBack size={24} />
        </Link>
        <h1 style={styles.title}>Schedule Today</h1>
        <button onClick={() => speakReminder({ task: 'all tasks', time: 'scheduled times' })} style={styles.speakerButton}>
          <IoVolumeHighOutline size={24} />
        </button>
      </div>

      {/* Active Tasks Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Tasks</h2>
        <div style={styles.routineList}>
          {activeRoutines.length > 0 ? (
            activeRoutines.map((routine) => (
              <RoutineItem key={routine.id} routine={routine} />
            ))
          ) : (
            <div style={styles.emptyState}>
              <p style={styles.emptyStateText}>No tasks scheduled yet</p>
              <p style={styles.emptyStateSubtext}>Click the + button to add a new task</p>
            </div>
          )}
        </div>
      </div>

      {/* Completed Tasks Section */}
      {completedRoutines.length > 0 && (
        <div style={{...styles.section, marginTop: '32px'}}>
          <h2 style={styles.sectionTitle}>Completed</h2>
          <div style={styles.routineList}>
            {completedRoutines.map((routine) => (
              <RoutineItem key={routine.id} routine={routine} />
            ))}
          </div>
        </div>
      )}

      <button 
        onClick={() => setShowAddModal(true)} 
        style={styles.addButton}
      >
        + Add Routine
      </button>

      {showAddModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Add New Routine</h2>
            <form onSubmit={handleAddRoutine}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Task:</label>
                <input
                  type="text"
                  value={newRoutine.task}
                  onChange={(e) => setNewRoutine({...newRoutine, task: e.target.value})}
                  style={styles.input}
                  placeholder="Enter task name"
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Time:</label>
                <input
                  type="time"
                  value={newRoutine.time}
                  onChange={(e) => setNewRoutine({...newRoutine, time: e.target.value})}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.modalButtons}>
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)} 
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={styles.submitButton}
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '700px',
    margin: '0 auto',
    minHeight: '100vh',
    backgroundColor: '#fff',
    '@media (min-width: 1024px)': {
      maxWidth: '900px',
      padding: '32px',
    },
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '32px',
  },
  backButton: {
    color: '#000',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    padding: '10px',
    '& svg': {
      fontSize: '28px',
    },
  },
  title: {
    margin: 0,
    fontSize: '28px',
    fontWeight: '600',
    '@media (max-width: 600px)': {
      fontSize: '24px',
    },
    '@media (min-width: 1024px)': {
      fontSize: '32px',
    },
  },
  speakerButton: {
    background: 'none',
    border: 'none',
    padding: '10px',
    cursor: 'pointer',
    color: '#000',
  },
  section: {
    marginBottom: '28px',
  },
  sectionTitle: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '20px',
    paddingBottom: '10px',
    borderBottom: '2px solid #f0f0f0',
    '@media (max-width: 600px)': {
      fontSize: '20px',
    },
    '@media (min-width: 1024px)': {
      fontSize: '24px',
      marginBottom: '24px',
      paddingBottom: '12px',
    },
  },
  emptyState: {
    textAlign: 'center',
    padding: '32px 20px',
    backgroundColor: '#f8f8f8',
    borderRadius: '14px',
  },
  emptyStateText: {
    fontSize: '18px',
    color: '#666',
    margin: '0 0 10px 0',
  },
  emptyStateSubtext: {
    fontSize: '16px',
    color: '#999',
    margin: 0,
  },
  routineList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  routineItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    backgroundColor: 'white',
    borderRadius: '14px',
    boxShadow: '0 3px 6px rgba(0, 0, 0, 0.08)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 5px 10px rgba(0, 0, 0, 0.12)',
    },
    '@media (min-width: 1024px)': {
      padding: '20px 24px',
      borderRadius: '16px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.08)',
      '&:hover': {
        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  routineLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  checkButton: {
    background: 'none',
    border: 'none',
    padding: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    '& svg': {
      fontSize: '24px',
    },
  },
  routineText: {
    fontSize: '18px',
    fontWeight: '400',
    transition: 'all 0.2s ease',
    '@media (max-width: 600px)': {
      fontSize: '16px',
    },
    '@media (min-width: 1024px)': {
      fontSize: '20px',
    },
  },
  routineTime: {
    fontSize: '18px',
    color: '#00BFA5',
    fontWeight: '500',
    '@media (max-width: 600px)': {
      fontSize: '16px',
    },
    '@media (min-width: 1024px)': {
      fontSize: '20px',
    },
  },
  addButton: {
    position: 'fixed',
    bottom: '32px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '14px 28px',
    backgroundColor: '#00BFA5',
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    fontSize: '18px',
    cursor: 'pointer',
    boxShadow: '0 3px 10px rgba(0, 0, 0, 0.15)',
    zIndex: 100,
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      transform: 'translateX(-50%) translateY(-2px)',
      boxShadow: '0 5px 14px rgba(0, 0, 0, 0.2)',
    },
    '@media (max-width: 600px)': {
      fontSize: '16px',
      padding: '12px 24px',
    },
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    padding: '28px',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '450px',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
    '@media (min-width: 1024px)': {
      padding: '32px',
      maxWidth: '550px',
      borderRadius: '20px',
    },
  },
  modalTitle: {
    margin: '0 0 28px 0',
    fontSize: '24px',
    fontWeight: '600',
    color: '#333',
    '@media (max-width: 600px)': {
      fontSize: '22px',
      margin: '0 0 24px 0',
    },
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '10px',
    fontSize: '18px',
    color: '#333',
    fontWeight: '500',
    '@media (max-width: 600px)': {
      fontSize: '16px',
    },
  },
  input: {
    width: '100%',
    padding: '14px',
    border: '2px solid #E0E0E0',
    borderRadius: '10px',
    fontSize: '16px',
    backgroundColor: '#fff',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease',
    '&:focus': {
      borderColor: '#00BFA5',
      outline: 'none',
    },
  },
  modalButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '14px',
    marginTop: '28px',
  },
  cancelButton: {
    padding: '14px 28px',
    border: 'none',
    borderRadius: '10px',
    backgroundColor: '#f5f5f5',
    color: '#333',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#e0e0e0',
    },
    '@media (max-width: 600px)': {
      padding: '12px 24px',
    },
  },
  submitButton: {
    padding: '14px 28px',
    border: 'none',
    borderRadius: '10px',
    backgroundColor: '#00BFA5',
    color: 'white',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#00A896',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0, 191, 165, 0.2)',
    },
    '@media (max-width: 600px)': {
      padding: '12px 24px',
    },
  },
};

export default Routine; 