import React, { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import { handleError, handleSuccess } from "./utils";
import "./Signup.css";
import { fetchAuthToken, fetchStates, fetchCities } from "./locationApi";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { Box, Button, TextField, MenuItem, Select, InputLabel, FormControl, CircularProgress } from "@mui/material"; // Import Material-UI components
import { State, City } from 'country-state-city';


function Signup() {
  const navigate = useNavigate(); // Initialize navigation

  const [signupInfo, setSignupInfo] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [userId, setUserId] = useState(null); // Stores the UID of the signed-up user
  const [step, setStep] = useState(1); // Step 1 = Signup, Step 2 = Additional Info

  const [role, setRole] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [authToken, setAuthToken] = useState("");


  useEffect(() => {
    setStates(State.getStatesOfCountry("IN"));
  }, []);

  // Load cities when state is selected
  useEffect(() => {
    if (state) {
      setCities(City.getCitiesOfState("IN", state));
    } else {
      setCities([]);
    }
  }, [state]);


  // Fetch Auth Token
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await fetchAuthToken();
        setAuthToken(token);
      } catch (error) {
        console.error("Error fetching auth token:", error);
      }
    };
    fetchData();
  }, []);

  // Fetch States
  useEffect(() => {
    if (authToken) {
      const fetchStateData = async () => {
        try {
          const stateList = await fetchStates(authToken);
          setStates(stateList);
        } catch (error) {
          console.error("Error fetching states:", error);
        }
      };
      fetchStateData();
    }
  }, [authToken]);

  // Fetch Cities for the selected state
  useEffect(() => {
    if (state) {
      const fetchCityData = async () => {
        try {
          const cityList = await fetchCities(authToken, state);
          setCities(cityList);
        } catch (error) {
          console.error("Error fetching cities:", error);
        }
      };
      fetchCityData();
    } else {
      setCities([]);
    }
  }, [state, authToken]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignupInfo((prev) => ({ ...prev, [name]: value }));
  };

  // Handle manual signup
  const handleSignup = async (e) => {
    e.preventDefault();
    const { name, email, password } = signupInfo;
    if (!name || !email || !password) {
      return handleError("All fields are required.");
    }

    try {
      // Firebase Authentication - Create User
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      setUserId(user.uid); // Store user ID
      setStep(2); // Move to Step 2 (Additional Info)

      // Firestore - Store Initial User Data
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        userId: user.uid,
      });

      handleSuccess("Signup Successful! Please complete your profile.");
    } catch (error) {
      handleError(error.message);
    }
  };

  // Handle Google Signup
  const handleGoogleSignup = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      setUserId(user.uid); // Store user ID
      setStep(2); // Move to Step 2 (Additional Info)

      // Check if user already exists in Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          name: user.displayName,
          email: user.email,
          userId: user.uid,
        });
      }

      handleSuccess("Google Sign-in Successful! Please complete your profile.");
    } catch (error) {
      handleError(error.message);
    }
  };

  // Handle additional details submission
  const handleCompleteProfile = async (e) => {
    e.preventDefault();
    if (!role || !state || !city) {
      return handleError("All fields are required.");
    }
  
    try {
      // Update Firestore with additional details
      await updateDoc(doc(db, "users", userId), {
        role,
        state,
        city,
      });
  
      // Fetch user details
      const user = auth.currentUser;
  
      // Save user details in localStorage
      localStorage.setItem("token", await user.getIdToken());
      localStorage.setItem("loggedInUser", user.displayName || signupInfo.name);
      localStorage.setItem("email", user.email);
      localStorage.setItem("role", role);
      localStorage.setItem("city", city);
      localStorage.setItem("state", state);
      localStorage.setItem("userId", user.uid);
  
      handleSuccess("Profile Completed Successfully!");
  
      // Redirect to home after 1 second
      setTimeout(() => navigate("/home"), 1000);
    } catch (error) {
      handleError(error.message);
    }
  };

  return (
    <Box
      sx={{
        background: "linear-gradient(180deg, #2c387e, #1769aa)",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 4,
      }}
    >
      <Box
        sx={{
          backgroundColor: "white",
          borderRadius: 2,
          padding: 4,
          width: 400,
        }}
      >
        <h1 className="signup-title">Signup</h1>

        {step === 1 ? (
          <>
            {/* Google Signup Button */}
            <Button
              onClick={handleGoogleSignup}
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mb: 2 }}
            >
              Sign Up with Google
            </Button>

            <div className="divider">or</div>

            {/* Manual Signup Form */}
            <form onSubmit={handleSignup}>
              <TextField
                label="Name"
                name="name"
                value={signupInfo.name}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                label="Email"
                name="email"
                value={signupInfo.email}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                label="Password"
                name="password"
                value={signupInfo.password}
                onChange={handleChange}
                type="password"
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mb: 2 }}
              >
                Signup
              </Button>
            </form>
          </>
        ) : (
          <form onSubmit={handleCompleteProfile}>
            <h2>Complete Your Profile</h2>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Role</InputLabel>
              <Select
                label="Role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <MenuItem value="">Select a role</MenuItem>
                <MenuItem value="Authority">Authority</MenuItem>
                <MenuItem value="Resident">Resident</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>State</InputLabel>
              <Select
                label="State"
                name="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
              >
                <MenuItem value="">Select a state</MenuItem>
                {states.map((s) => (
                <MenuItem key={s.isoCode} value={s.isoCode}>
                  {s.name}
                </MenuItem>
              ))}

              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>City</InputLabel>
              <Select
                label="City"
                name="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={!state}
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
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
            >
              Save & Continue
            </Button>
          </form>
        )}
      </Box>
      <ToastContainer />
    </Box>
  );
}

export default Signup;