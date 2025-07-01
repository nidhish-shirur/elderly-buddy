import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../utils/firebase';
import { collection, query, where, getDocs, addDoc, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { IoArrowBack } from 'react-icons/io5';
import { IoVolumeHighOutline } from 'react-icons/io5';
import { IoCheckmarkCircle, IoEllipseOutline } from 'react-icons/io5';
import { IoPencil } from 'react-icons/io5';
import speechService from '../utils/speechService';

const Routine = ({ voiceIntent }) => {
  const navigate = useNavigate();
  const [routines, setRoutines] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [newRoutine, setNewRoutine] = useState({
    task: '',
    time: '',
    date: 'everyday', // Default to 'everyday' for recurring tasks
  });
  const [editRoutine, setEditRoutine] = useState({
    task: '',
    time: '',
    date: '',
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate('/login');
      } else {
        await loadRoutines(user.uid);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Handler for voice intent (from Chat)
  useEffect(() => {
    if (!voiceIntent) return;
    if (voiceIntent.type === 'addDailyRoutine') {
      setShowAddModal(true);
      setNewRoutine(prev => ({
        ...prev,
        task: voiceIntent.task || '',
        time: voiceIntent.time || '',
        date: 'everyday'
      }));
    }
    // You can add more intent types here if needed
    // eslint-disable-next-line
  }, [voiceIntent]);

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
        completed: doc.data().completed || false
      })).sort((a, b) => {
        // Sort by date first (everyday comes last), then by time
        const dateA = a.date === 'everyday' ? Infinity : new Date(a.date);
        const dateB = b.date === 'everyday' ? Infinity : new Date(b.date);
        const timeA = new Date(`1970/01/01 ${a.time}`);
        const timeB = new Date(`1970/01/01 ${b.time}`);
        return dateA - dateB || timeA - timeB;
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
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error('No user found');
        return;
      }

      const [hours, minutes] = newRoutine.time.split(':');
      const timeStr = new Date(0, 0, 0, hours, minutes).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).toLowerCase();

      const routineData = {
        userId: user.uid,
        task: newRoutine.task,
        time: timeStr,
        date: newRoutine.date,
        completed: false,
        createdAt: Timestamp.now()
      };
      console.log('Adding routine with data:', routineData);

      const docRef = await addDoc(collection(db, 'routines'), routineData);
      console.log('Document written with ID:', docRef.id);

      setNewRoutine({ task: '', time: '', date: 'everyday' });
      setShowAddModal(false);
      await loadRoutines(user.uid);
    } catch (error) {
      console.error('Error adding routine:', error);
      alert('Error adding routine: ' + error.message);
    }
  };

  const handleEditRoutine = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user || !selectedRoutine) {
        console.error('No user or routine found');
        return;
      }

      const [hours, minutes] = editRoutine.time.split(':');
      const timeStr = new Date(0, 0, 0, hours, minutes).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).toLowerCase();

      const routineData = {
        task: editRoutine.task,
        time: timeStr,
        date: editRoutine.date,
      };
      console.log('Updating routine with data:', routineData);

      const routineRef = doc(db, 'routines', selectedRoutine.id);
      await updateDoc(routineRef, routineData);
      console.log('Document updated with ID:', selectedRoutine.id);

      setEditRoutine({ task: '', time: '', date: '' });
      setShowEditModal(false);
      setSelectedRoutine(null);
      await loadRoutines(user.uid);
    } catch (error) {
      console.error('Error updating routine:', error);
      alert('Error updating routine: ' + error.message);
    }
  };

  const handleToggleComplete = async (routineId, currentStatus) => {
    try {
      const routineRef = doc(db, 'routines', routineId);
      await updateDoc(routineRef, {
        completed: !currentStatus
      });
      
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

  // Compose a full routine summary for speech
  const getFullRoutineSpeech = () => {
    if (routines.length === 0) {
      return 'You have no routines scheduled for today.';
    }
    const activeText = activeRoutines.length > 0
      ? `Your active tasks are: ${activeRoutines.map(r =>
          `${r.task} at ${r.time} on ${r.date === 'everyday'
            ? 'everyday'
            : new Date(r.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`
        ).join(', ')}.`
      : 'You have no active tasks.';
    const completedText = completedRoutines.length > 0
      ? `Your completed tasks are: ${completedRoutines.map(r =>
          `${r.task} at ${r.time} on ${r.date === 'everyday'
            ? 'everyday'
            : new Date(r.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`
        ).join(', ')}.`
      : 'You have no completed tasks.';
    return `Here is your schedule for today. ${activeText} ${completedText}`;
  };

  const speakReminder = (routine) => {
    if (routine.task === 'all tasks') {
      const activeText = activeRoutines.length > 0
        ? `Your active tasks are: ${activeRoutines.map(r => `${r.task} at ${r.time} on ${r.date === 'everyday' ? 'everyday' : new Date(r.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`).join(', ')}.`
        : 'You have no active tasks.';
      const completedText = completedRoutines.length > 0
        ? `Your completed tasks are: ${completedRoutines.map(r => `${r.task} at ${r.time} on ${r.date === 'everyday' ? 'everyday' : new Date(r.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`).join(', ')}.`
        : 'You have no completed tasks.';
      const fullText = `Here is your schedule for today. ${activeText} ${completedText}`;
      speechService.speak(fullText, 1.1, 1.2);
    } else {
      speechService.speak(`Time for ${routine.task} at ${routine.time} on ${routine.date === 'everyday' ? 'everyday' : new Date(routine.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`, 1, 1);
    }
  };

  const handleEditClick = (routine) => {
    setSelectedRoutine(routine);
    setEditRoutine({
      task: routine.task,
      time: routine.time.replace(/(\d+:\d+) (am|pm)/i, '$1').replace(' ', ''),
      date: routine.date,
    });
    setShowEditModal(true);
  };

  const setQuickDate = (option) => {
    const today = new Date();
    const newDate = option === 'today' 
      ? today.toISOString().split('T')[0] 
      : option === 'tomorrow'
      ? new Date(today.setDate(today.getDate() + 1)).toISOString().split('T')[0]
      : 'everyday';
    if (showAddModal) {
      setNewRoutine(prev => ({ ...prev, date: newDate }));
    } else if (showEditModal) {
      setEditRoutine(prev => ({ ...prev, date: newDate }));
    }
  };

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
        <div style={styles.routineTextContainer}>
          <div
            style={{
              ...styles.routineText,
              textDecoration: routine.completed ? 'line-through' : 'none',
              color: routine.completed ? '#999' : '#000'
            }}
          >
            {routine.task}
          </div>
          <div style={styles.routineTime}>
            {routine.time} - {routine.date === 'everyday'
              ? 'Everyday'
              : new Date(routine.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
        </div>
      </div>
      <div style={styles.routineRight}>
        <button
          onClick={() => handleEditClick(routine)}
          style={styles.editButton}
        >
          <IoPencil size={20} color="#00BFA5" />
        </button>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Link to="/home" style={styles.backButton}>
          <IoArrowBack size={24} />
        </Link>
        <h1 style={styles.title}>Upcoming Schedule</h1>
        <button
          onClick={() => speechService.speak(getFullRoutineSpeech(), 1.1, 1.2)}
          style={styles.speakerButton}
        >
          <IoVolumeHighOutline size={24} />
        </button>
      </div>

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

      {completedRoutines.length > 0 && (
        <div style={{ ...styles.section, marginTop: '32px' }}>
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
                  onChange={(e) => setNewRoutine({ ...newRoutine, task: e.target.value })}
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
                  onChange={(e) => setNewRoutine({ ...newRoutine, time: e.target.value })}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Date:</label>
                <div style={styles.dateContainer}>
                  <input
                    type="date"
                    value={newRoutine.date === 'everyday' ? '' : newRoutine.date}
                    onChange={(e) => setNewRoutine({ ...newRoutine, date: e.target.value || 'everyday' })}
                    style={styles.input}
                  />
                  <div style={styles.quickDateButtons}>
                    <button
                      type="button"
                      onClick={() => setQuickDate('today')}
                      style={styles.quickDateButton}
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDate('tomorrow')}
                      style={styles.quickDateButton}
                    >
                      Tomorrow
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDate('everyday')}
                      style={styles.quickDateButton}
                    >
                      Everyday
                    </button>
                  </div>
                </div>
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

      {showEditModal && selectedRoutine && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Edit Routine</h2>
            <form onSubmit={handleEditRoutine}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Task:</label>
                <input
                  type="text"
                  value={editRoutine.task}
                  onChange={(e) => setEditRoutine({ ...editRoutine, task: e.target.value })}
                  style={styles.input}
                  placeholder="Enter task name"
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Time:</label>
                <input
                  type="time"
                  value={editRoutine.time}
                  onChange={(e) => setEditRoutine({ ...editRoutine, time: e.target.value })}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Date:</label>
                <div style={styles.dateContainer}>
                  <input
                    type="date"
                    value={editRoutine.date === 'everyday' ? '' : editRoutine.date}
                    onChange={(e) => setEditRoutine({ ...editRoutine, date: e.target.value || 'everyday' })}
                    style={styles.input}
                  />
                  <div style={styles.quickDateButtons}>
                    <button
                      type="button"
                      onClick={() => setQuickDate('today')}
                      style={styles.quickDateButton}
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDate('tomorrow')}
                      style={styles.quickDateButton}
                    >
                      Tomorrow
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDate('everyday')}
                      style={styles.quickDateButton}
                    >
                      Everyday
                    </button>
                  </div>
                </div>
              </div>
              <div style={styles.modalButtons}>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedRoutine(null);
                    setEditRoutine({ task: '', time: '', date: '' });
                  }} 
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={styles.submitButton}
                >
                  Save
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
    padding: '16px',
    maxWidth: '100%',
    margin: '0 auto',
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    '@media (min-width: 768px)': {
      padding: '24px',
      maxWidth: '700px',
    },
    '@media (min-width: 1024px)': {
      padding: '32px',
      maxWidth: '900px',
    },
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
    paddingBottom: '12px',
    borderBottom: '1px solid #e5e7eb',
    '@media (min-width: 768px)': {
      marginBottom: '32px',
    },
  },
  backButton: {
    color: '#374151',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    padding: '8px',
    borderRadius: '50%',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: '#e5e7eb',
    },
    '& svg': {
      fontSize: '24px',
    },
    '@media (min-width: 768px)': {
      '& svg': {
        fontSize: '28px',
      },
    },
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '700',
    color: '#1f2937',
    '@media (min-width: 600px)': {
      fontSize: '28px',
    },
    '@media (min-width: 1024px)': {
      fontSize: '32px',
    },
  },
  speakerButton: {
    background: 'none',
    border: 'none',
    padding: '8px',
    borderRadius: '50%',
    cursor: 'pointer',
    color: '#374151',
    transition: 'background-color 0.2s, color 0.2s',
    '&:hover': {
      backgroundColor: '#e5e7eb',
      color: '#00BFA5',
    },
    '& svg': {
      fontSize: '24px',
    },
    '@media (min-width: 768px)': {
      '& svg': {
        fontSize: '28px',
      },
    },
  },
  section: {
    marginBottom: '24px',
    '@media (min-width: 768px)': {
      marginBottom: '32px',
    },
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '16px',
    paddingBottom: '8px',
    borderBottom: '2px solid #e5e7eb',
    '@media (min-width: 600px)': {
      fontSize: '22px',
      marginBottom: '20px',
    },
    '@media (min-width: 1024px)': {
      fontSize: '24px',
      marginBottom: '24px',
    },
  },
  emptyState: {
    textAlign: 'center',
    padding: '24px',
    backgroundColor: '#f3f4f6',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  },
  emptyStateText: {
    fontSize: '16px',
    color: '#4b5563',
    margin: '0 0 8px 0',
    fontWeight: '500',
  },
  emptyStateSubtext: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
  },
  routineList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    '@media (min-width: 768px)': {
      gap: '16px',
    },
  },
  routineItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    },
    '@media (min-width: 768px)': {
      padding: '16px 20px',
      borderRadius: '12px',
    },
  },
  routineLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  routineTextContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    minWidth: 0,
  },
  routineText: {
    fontSize: '16px',
    fontWeight: '400',
    transition: 'all 0.2s ease',
    wordBreak: 'break-word',
    '@media (min-width: 600px)': {
      fontSize: '18px',
    },
    '@media (min-width: 1024px)': {
      fontSize: '20px',
    },
  },
  routineTime: {
    fontSize: '14px',
    color: '#00BFA5',
    fontWeight: '500',
    marginTop: '2px',
    wordBreak: 'break-word',
    '@media (min-width: 600px)': {
      fontSize: '15px',
    },
    '@media (min-width: 1024px)': {
      fontSize: '16px',
    },
  },
  routineRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  checkButton: {
    background: 'none',
    border: 'none',
    padding: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    '& svg': {
      fontSize: '22px',
    },
    '@media (min-width: 768px)': {
      '& svg': {
        fontSize: '24px',
      },
    },
  },
  editButton: {
    background: 'none',
    border: 'none',
    padding: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    '& svg': {
      fontSize: '18px',
    },
    '@media (min-width: 768px)': {
      '& svg': {
        fontSize: '20px',
      },
    },
  },
  addButton: {
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '90vw', // Make button longer horizontally
    maxWidth: '480px', // Limit max width for large screens
    padding: '16px 0', // More vertical padding, no horizontal padding needed
    backgroundColor: '#00BFA5',
    color: 'white',
    border: 'none',
    borderRadius: '32px',
    fontSize: '20px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(0, 191, 165, 0.25)',
    zIndex: 1000,
    transition: 'transform 0.2s ease, box-shadow 0.2s ease, background 0.2s',
    textAlign: 'center',
    letterSpacing: '0.5px',
    '&:hover': {
      backgroundColor: '#00A896',
      transform: 'translateX(-50%) translateY(-4px)',
      boxShadow: '0 8px 24px rgba(0, 191, 165, 0.35)',
    },
    '@media (min-width: 768px)': {
      width: '420px',
      fontSize: '22px',
      padding: '18px 0',
    },
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  modal: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '400px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
    animation: 'slideUp 0.3s ease-out',
    '@media (min-width: 768px)': {
      padding: '24px',
      maxWidth: '500px',
      borderRadius: '16px',
    },
  },
  modalTitle: {
    margin: '0 0 20px 0',
    fontSize: '22px',
    fontWeight: '700',
    color: '#1f2937',
    '@media (min-width: 768px)': {
      fontSize: '24px',
      marginBottom: '24px',
    },
  },
  formGroup: {
    marginBottom: '16px',
    '@media (min-width: 768px)': {
      marginBottom: '20px',
    },
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '16px',
    color: '#374151',
    fontWeight: '500',
    '@media (min-width: 768px)': {
      fontSize: '18px',
    },
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '2px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '16px',
    backgroundColor: '#fff',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    '&:focus': {
      borderColor: '#00BFA5',
      boxShadow: '0 0 0 3px rgba(0, 191, 165, 0.2)',
      outline: 'none',
    },
    '@media (min-width: 768px)': {
      padding: '14px',
    },
  },
  dateContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    '@media (min-width: 768px)': {
      flexDirection: 'row',
      alignItems: 'center',
      gap: '12px',
    },
  },
  quickDateButtons: {
    display: 'flex',
    gap: '8px',
    '@media (min-width: 768px)': {
      gap: '12px',
    },
  },
  quickDateButton: {
    padding: '8px 16px',
    border: '2px solid #d1d5db',
    borderRadius: '8px',
    backgroundColor: 'white',
    color: '#374151',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
    '&:hover': {
      backgroundColor: '#e5e7eb',
      borderColor: '#00BFA5',
      transform: 'translateY(-2px)',
    },
    '@media (min-width: 768px)': {
      padding: '10px 20px',
      fontSize: '16px',
    },
  },
  modalButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '20px',
    '@media (min-width: 768px)': {
      gap: '16px',
      marginTop: '24px',
    },
  },
  cancelButton: {
    padding: '12px 24px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    transition: 'background-color 0.2s ease, transform 0.2s ease',
    '&:hover': {
      backgroundColor: '#e5e7eb',
      transform: 'translateY(-2px)',
    },
    '@media (min-width: 768px)': {
      padding: '14px 28px',
    },
  },
  submitButton: {
    padding: '12px 24px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#00BFA5',
    color: 'white',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      backgroundColor: '#00A896',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0, 191, 165, 0.3)',
    },
    '@media (min-width: 768px)': {
      padding: '14px 28px',
    },
  },
};

export default Routine;