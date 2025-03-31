import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { handleError, handleSuccess } from './utils'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Grid2, 
  IconButton, 
  Link,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import GoogleIcon from '@mui/icons-material/Google';

import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from '../firebase/firebaseConfig'; // Import Firebase config

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1769aa',
    },
    secondary: {
      main: '#f50057'
    }
  },
});

const Login = () => {
  const [loginInfo, setLoginInfo] = useState({
    email: '',
    password: ''
  });

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const {name, value} = e.target;
    setLoginInfo(prev => ({...prev, [name]: value}));
  };

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = loginInfo;
    
    if (!email || !password) {
      return handleError('Email and password are required.');
    }

    setIsSigningIn(true);
    try {
      // Firebase Authentication - Sign In User
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch User Data from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.exists() ? userDoc.data() : null;

      if (userData) {
        localStorage.setItem('token', await user.getIdToken());
        localStorage.setItem('loggedInUser', userData.name);
        localStorage.setItem('email', userData.email);
        localStorage.setItem('role', userData.role);
        localStorage.setItem('city', userData.city);
        localStorage.setItem('state', userData.state);
        localStorage.setItem('userId', user.uid);
        localStorage.setItem('profilePic', userData.profilePic || 'default.png');
        localStorage.setItem('phone', userData.phone);
        localStorage.setItem('department', userData.department);
        
        handleSuccess("Login Successful!");
        setTimeout(() => navigate('/home'), 1000);
      } else {
        handleError("User data not found.");
      }
    } catch (error) {
      handleError(error.message);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    const provider = new GoogleAuthProvider();
  
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
  
      // Check if the user exists in Firestore
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // Redirect to signup page if user doesn't exist
        handleError("User not found. Redirecting to Signup...");
        setTimeout(() => navigate('/signup'), 1500);
        return;
      }

      const userData = userDoc.data();
  
      // Store user data in localStorage
      localStorage.setItem("token", await user.getIdToken());
      localStorage.setItem("loggedInUser", userData.name);
      localStorage.setItem("email", userData.email);
      localStorage.setItem("role", userData.role);
      localStorage.setItem("city", userData.city);
      localStorage.setItem("state", userData.state);
      localStorage.setItem("userId", user.uid);
      localStorage.setItem('profilePic', userData.profilePic || 'default.png');
      localStorage.setItem('phone', userData.phone);
      localStorage.setItem('department', userData.department);
  
      handleSuccess("Google Sign-In Successful!");
      setTimeout(() => navigate('/home'), 1000);
  
    } catch (error) {
      handleError(error.message);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          background: 'linear-gradient(180deg, #2c387e, #1769aa)',
          minHeight: '100vh',
          display: 'flex',
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 0,
          margin: 0,
        }}
      >
        <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center' }}>
          <Box
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.2)',
              borderRadius: '8px',
              padding: '32px',
              width: '100%',
              maxWidth: '450px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography 
              variant="h5" 
              component="h1" 
              align="center" 
              fontWeight="bold" 
              sx={{ fontWeight: 'bold', mb: 4, color: '#333' }}
            >
              LOGIN
            </Typography>
            
            <Box component="form" onSubmit={handleLogin} sx={{ width: '100%' }}>
              <TextField
                name="email"
                color="primary"
                fullWidth
                label="Email"
                variant="outlined"
                value={loginInfo.email}
                onChange={handleChange}
                required
                sx={{ 
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#e1e7ed',
                  }
                }}
              />

              <TextField
                name="password"
                color="primary"
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                value={loginInfo.password}
                onChange={handleChange}
                required
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#e1e7ed',
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        color='primary'
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                color="primary"
                sx={{ 
                  py: 1.5,
                  borderRadius: 1,
                  textTransform: 'uppercase',
                  fontWeight: 'bold',
                  mb: 2
                }}
                disabled={isSigningIn}
              >
                Login
              </Button>

              <Grid2 container justifyContent="center" sx={{ mt: 2, marginBottom: "1.5rem" }}>
                <Grid2 item>
                  <Link href="/signup" variant="body2">
                    {"Don't have an account? Sign Up"}
                  </Link>
                </Grid2>
              </Grid2>

              <Button
                fullWidth
                type="button"
                variant="contained"
                color="secondary"
                sx={{ 
                  py: 1.5,
                  borderRadius: 1,
                  textTransform: 'uppercase',
                  fontWeight: 'bold',
                  mt: 1
                }}
                startIcon={<GoogleIcon />}
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
              >
                Login With Google
              </Button>
            </Box>
          </Box>
          <ToastContainer />
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default Login;