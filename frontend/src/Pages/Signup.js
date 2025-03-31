import React, { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import { handleError, handleSuccess } from "./utils";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { 
  Box, 
  Button, 
  TextField, 
  MenuItem, 
  Select, 
  InputLabel, 
  FormControl, 
  Container,
  Typography,
  Link,
  IconButton,
  InputAdornment,
  Grid2
} from "@mui/material";
import { Visibility, VisibilityOff } from '@mui/icons-material';
import GoogleIcon from '@mui/icons-material/Google';
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
import { State, City } from 'country-state-city';

// Match the theme from Login page
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

function Signup() {
  const navigate = useNavigate();

  const [signupInfo, setSignupInfo] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [userId, setUserId] = useState(null);
  const [step, setStep] = useState(1);

  const [role, setRole] = useState("");
  const [department, setDepartment] = useState("");
  const [phone, setPhone] = useState("");
  const [profilePic, setProfilePic] = useState("");

  const [state, setState] = useState("");
  const [city, setCity] = useState("");

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [authToken, setAuthToken] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);

  // Toggle password visibility
  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  // Load all states on mount
  useEffect(() => {
    const allStates = State.getStatesOfCountry("IN");
    if (role === "Authority") {
      setStates([{ isoCode: "ALL", name: "All States" }, ...allStates]);
    } else {
      setStates(allStates);
    }
  }, [role]);

  // Load cities when state changes
  useEffect(() => {
    if (state && state !== "All States") {
      // Find the isoCode of the selected state
      const selectedState = states.find((s) => s.name === state);
      if (selectedState) {
        const allCities = City.getCitiesOfState("IN", selectedState.isoCode);
        setCities(role === "Authority" ? [{ name: "All Cities" }, ...allCities] : allCities);
      }
    } else {
      setCities([]);
    }
  }, [state, role, states]); // Add `states` as a dependency
  

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignupInfo((prev) => ({ ...prev, [name]: value }));
  };

  // Handle manual signup
  const handleSignup = (e) => {
    e.preventDefault();
    const { name, email, password } = signupInfo;
  
    if (!name || !email || !password) {
      return handleError("All fields are required.");
    }
  
    // Save user details in local state but do NOT create an account yet
    setStep(2); // Move to the profile completion step
  };
  

  // Handle Google Signup
  const handleGoogleSignup = async () => {
    setIsSigningUp(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
  
      // Save Google user details in local state (but do NOT store in Firebase)
      setSignupInfo({
        name: user.displayName,
        email: user.email,
        password: "", // Not required for Google users
      });
  
      setStep(2); // Move to profile completion step
    } catch (error) {
      handleError(error.message);
    } finally {
      setIsSigningUp(false);
    }
  };
  

  const handleCompleteProfile = async (e) => {
    e.preventDefault();
  
    if (!role || !state || !city || !phone || (role === "Authority" && !department)) {
      return handleError("All fields are required.");
    }
  
    setIsSigningUp(true);
  
    try {
      let user;
      
      // If the user signed up with email/password, create the account now
      if (!auth.currentUser) {
        const userCredential = await createUserWithEmailAndPassword(auth, signupInfo.email, signupInfo.password);
        user = userCredential.user;
      } else {
        user = auth.currentUser; // If using Google signup, user already exists
      }
  
      setUserId(user.uid);
  
      // Store user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: signupInfo.name,
        email: signupInfo.email,
        userId: user.uid,
        role,
        state,
        city,
        phone,
        department: role === "Authority" ? department : "",
        profileCompleted: true,
      });
  
      // Save user details in localStorage
      localStorage.setItem("token", await user.getIdToken());
      localStorage.setItem("loggedInUser", signupInfo.name);
      localStorage.setItem("email", signupInfo.email);
      localStorage.setItem("role", role);
      localStorage.setItem("city", city);
      localStorage.setItem("state", state);
      localStorage.setItem("userId", user.uid);
  
      if (role === "Authority") {
        localStorage.setItem("department", department);
      } else {
        localStorage.removeItem("department");
      }
  
      handleSuccess("Profile Completed Successfully!");
      setTimeout(() => navigate("/home"), 1000);
    } catch (error) {
      handleError("An error occurred while completing the profile. Please try again.");
      console.error("Profile completion error:", error);
    } finally {
      setIsSigningUp(false);
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
              {step === 1 ? "SIGN UP" : "COMPLETE PROFILE"}
            </Typography>

            {step === 1 ? (
              <Box component="form" onSubmit={handleSignup} sx={{ width: '100%' }}>
                <TextField
                  name="name"
                  color="primary"
                  fullWidth
                  label="Full Name"
                  variant="outlined"
                  value={signupInfo.name}
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
                  name="email"
                  color="primary"
                  fullWidth
                  label="Email"
                  variant="outlined"
                  value={signupInfo.email}
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
                  value={signupInfo.password}
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
                  disabled={isSigningUp}
                >
                  Sign Up
                </Button>

                <Grid2 container justifyContent="center" sx={{ mt: 2, marginBottom: "1.5rem" }}>
                  <Grid2 item>
                    <Link href="/login" variant="body2">
                      {"Already have an account? Login"}
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
                  onClick={handleGoogleSignup}
                  disabled={isSigningUp}
                >
                  Sign Up With Google
                </Button>
              </Box>
            ) : (
              <Box component="form" onSubmit={handleCompleteProfile} sx={{ width: '100%' }}>
                <FormControl 
                  fullWidth 
                  variant="outlined" 
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#e1e7ed',
                    }
                  }}
                >
                  <InputLabel>Role</InputLabel>
                  <Select
                    label="Role"
                    name="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <MenuItem value="">Select a role</MenuItem>
                    <MenuItem value="Authority">Authority</MenuItem>
                    <MenuItem value="Citizen">Citizen</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Mobile Number"
                  name="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  variant="outlined"
                  fullWidth
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#e1e7ed',
                    }
                  }}
                />

                {role === "Authority" && (
                <FormControl 
                  fullWidth 
                  variant="outlined" 
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#e1e7ed',
                    }
                  }}
                >
                  <InputLabel>Department</InputLabel>
                  <Select
                    label="Department"
                    name="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                    <MenuItem value="Department of Roads & Transport">Department of Roads & Transport</MenuItem>
                    <MenuItem value="Public Transport Authority">Public Transport Authority</MenuItem>
                    <MenuItem value="Municipal Waste & Sanitation">Municipal Waste & Sanitation</MenuItem>
                    <MenuItem value="Water & Drainage Department">Water & Drainage Department</MenuItem>
                    <MenuItem value="Electricity & Power Board">Electricity & Power Board</MenuItem>
                    <MenuItem value="Police & Public Safety">Police & Public Safety</MenuItem>
                    <MenuItem value="Environmental Protection Agency">Environmental Protection Agency</MenuItem>
                    <MenuItem value="Parks & Recreation Department">Parks & Recreation Department</MenuItem>
                    <MenuItem value="Animal Control Board">Animal Control Board</MenuItem>
                    <MenuItem value="Urban Development Authority">Urban Development Authority</MenuItem>
                    <MenuItem value="Department of Health & Medical Services">Department of Health & Medical Services</MenuItem>
                    <MenuItem value="Ministry of Education">Ministry of Education</MenuItem>
                    <MenuItem value="Telecom Regulatory Authority">Telecom Regulatory Authority</MenuItem>
                    <MenuItem value="Disaster Management Authority">Disaster Management Authority</MenuItem>
                  </Select>
                </FormControl>
                )}
                
                <FormControl 
                  fullWidth 
                  variant="outlined" 
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#e1e7ed',
                    }
                  }}
                >
                  <InputLabel>State</InputLabel>
                  <Select
                    label="State"
                    name="state"
                    value={state} // Ensure it holds the full state name
                    onChange={(e) => {
                      const selectedState = states.find((s) => s.name === e.target.value); // Find state by name
                      setState(selectedState?.name || ""); // Store full state name
                      setCity(""); // Reset city when state changes
                    }}
                  >
                    <MenuItem value="">Select a state</MenuItem>
                    {states.map((s) => (
                      <MenuItem key={s.isoCode} value={s.name}> {/* Store full name instead of isoCode */}
                        {s.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl 
                  fullWidth 
                  variant="outlined" 
                  sx={{ 
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#e1e7ed',
                    }
                  }}
                >
                  <InputLabel>City</InputLabel>
                  <Select
                    label="City"
                    name="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={!state || state === "ALL"}
                  >
                    <MenuItem value="">Select a city</MenuItem>
                    {cities.map((c) => (
                      <MenuItem key={c.name} value={c.name}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>


                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ 
                    py: 1.5,
                    borderRadius: 1,
                    textTransform: 'uppercase',
                    fontWeight: 'bold'
                  }}
                >
                  Save & Continue
                </Button>
              </Box>
            )}
          </Box>
          <ToastContainer />
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default Signup;