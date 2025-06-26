import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import { Box, Typography, TextField, Button, Alert, Link } from '@mui/material';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../utils/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Container = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  backgroundColor: '#F5F5F5'
}));

const LoginCard = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  padding: '30px',
  borderRadius: '15px',
  width: '100%',
  maxWidth: '400px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
}));

const Form = styled('form')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px'
}));

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();

  // If user is already logged in, redirect to home
  React.useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        const from = location.state?.from?.pathname || '/';
        navigate(from);
      } else {
        // Registration mode
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (password.length < 6) {
          throw new Error('Password should be at least 6 characters');
        }

        // Create user account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Initialize user data in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email: email,
          firstName: '',
          lastName: '',
          age: '',
          gender: '',
          dateOfBirth: '',
          height: '',
          weight: '',
          bloodGroup: '',
          bloodPressure: '',
          allergy: '',
          createdAt: new Date().toISOString()
        });

        navigate('/profile'); // Redirect to profile page to fill in details
      }
    } catch (error) {
      setError(error.message || (isLogin ? 'Failed to sign in' : 'Failed to register'));
      console.error('Auth error:', error);
    }

    setLoading(false);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  return (
    <Container>
      <LoginCard>
        <Typography variant="h4" component="h1" align="center" gutterBottom sx={{ color: '#8B7355' }}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </Typography>
        <Typography variant="body1" align="center" sx={{ mb: 4, color: '#666' }}>
          {isLogin ? 'Please sign in to continue' : 'Please fill in your details'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
          />
          {!isLogin && (
            <TextField
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              fullWidth
            />
          )}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              mt: 2,
              backgroundColor: '#8B7355',
              '&:hover': {
                backgroundColor: '#7A6548'
              }
            }}
          >
            {loading ? (isLogin ? 'Signing in...' : 'Registering...') : (isLogin ? 'Sign In' : 'Register')}
          </Button>
        </Form>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Link
            component="button"
            variant="body2"
            onClick={toggleMode}
            sx={{
              color: '#8B7355',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
          >
            {isLogin ? "Don't have an account? Register" : 'Already have an account? Sign In'}
          </Link>
        </Box>
      </LoginCard>
    </Container>
  );
};

export default Login; 