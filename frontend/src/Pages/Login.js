import React, { useState } from 'react'
import {   useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { handleError, handleSuccess } from './utils'
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Grid2, 
  IconButton, 
  Link,
  FormControl,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import GoogleIcon from '@mui/icons-material/Google';




import { signInWithEmailAndPassword , signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc , setDoc } from "firebase/firestore";
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

 
const Login =  () => {
  
  const [openDialog, setOpenDialog] = useState(false);
  const [userInfo, setUserInfo] = useState({ role: '', city: '', state: '' });
  const [userUid, setUserUid] = useState(null);
   

  const [loginInfo, setLoginInfo] = useState({
    email: '',
    password: ''
  })

  const [isSigningIn, setIsSigningIn] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const {name, value} = e.target;
    const copyLoginInfo = {...loginInfo};
    copyLoginInfo[name] = value;
    setLoginInfo(copyLoginInfo);
  }

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };
  
  const navigate = useNavigate();

  const loginWithGoogle = () => {
    console.log("Button clicked");
    window.open("http://localhost:6005/auth/google/callback", "_blank");
  };

    const handleLogin = async (e) => {
      e.preventDefault();
      const { email, password } = loginInfo;
      if (!email || !password) {
        return handleError('Email and password are required.');
      }
  
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
          
          handleSuccess("Login Successful!");
          setTimeout(() => navigate('/home'), 1000);
        } else {
          handleError("User data not found.");
        }
  
      } catch (error) {
        handleError(error.message);
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
    
        handleSuccess("Google Sign-In Successful!");
        setTimeout(() => navigate('/home'), 1000);
    
      } catch (error) {
        handleError(error.message);
      }
    
      setIsSigningIn(false);
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
      <Container maxWidth="xs">
        <Box
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.2)',
              borderRadius: '8px',
              padding: '32px',
            }}
          ><Typography variant="h5" component="h1" align="center" height={80} fontWeight="bold" sx={{ fontWeight: 'bold', mt:2}}>LOGIN</Typography>
          <form>
            <Grid2 container spacing={2}  >
            <FormControl fullWidth variant="filled" >

               <Grid2 item xs={12}>
                  <TextField
                    name="email"
                    color="primary" 
                    fullWidth
                    label="Username"
                    variant="filled"                    
                    value={loginInfo.email}
                    onChange={handleChange}
                    required
                    className='textfield'
                    slotProps={{
                      input: { style: { backgroundColor: '#a9b8c2' } }
                    }}
                  />
               </Grid2>

              <Grid2 item xs={12} sx={{ mt: 2 }} >
                  <TextField
                    name="password"
                    color="primary"
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    variant="filled"
                    value={loginInfo.password}
                    onChange={handleChange}
                    required
                    slotProps={{
                      input: {
                        style: { backgroundColor: '#a9b8c2' },
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowPassword}
                              onMouseDown={handleMouseDownPassword}
                              edge="end"
                              color='primary'
                            >
                              {showPassword ? (<VisibilityOff /> ) : (<Visibility /> )}

                            </IconButton>
                          </InputAdornment>
                        ),
                      }
                    }}
                  />
              </Grid2>

            </FormControl>

            </Grid2> 
             
            <Button
              fullWidth
              type="button"
              variant="contained"
              color="primary"
              fontWeight="bold"
              sx={{ mt: 2 }}
              onClick={handleLogin}
            >
              Login
            </Button>

            <Grid2 container justifyContent="center" sx={{ mt: 2 }}>
              <Grid2 item>
                <Link href="#" variant="body2">
                  Forgot password?
                </Link>
              </Grid2>
            </Grid2>

            <Grid2 container justifyContent="center" sx={{ mt: 2 }}>
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
              sx={{ mt: 3, mr: 2 }}
              startIcon={<GoogleIcon />}
              onClick={handleGoogleSignIn} 
              disabled={isSigningIn}
            >
              SIGN IN WITH GOOGLE
            </Button>
          </form>  
        </Box>
        <ToastContainer />
      </Container>
    </Box>
  </ThemeProvider>

  );
}

export default Login
