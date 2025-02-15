// Profile.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../Pages/utils';
import { auth, db } from '../firebase/firebaseConfig';
import { signOut, deleteUser } from "firebase/auth";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { State, City } from 'country-state-city';
import './Profile.css';
import {
  Box,
  Container,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Card,
  Grid2,
  CardContent,
  CardActions,
} from "@mui/material";

function Profile({ setIsAuthenticated }) {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    role: '',
    state: '',
    city: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserData(userData);
          setSelectedState(userData.state || '');
          setSelectedCity(userData.city || '');
        } else {
          handleError("User data not found.");
        }
      } else {
        handleError("No user is logged in.");
      }
    };

    fetchUserProfile();
    setStates(State.getStatesOfCountry('IN'));
  }, []);

  useEffect(() => {
    if (selectedState) {
      const stateCode = states.find(state => state.name === selectedState)?.isoCode;
      if (stateCode) {
        setCities(City.getCitiesOfState('IN', stateCode));
      }
    }
  }, [selectedState, states]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setSelectedState(userData.state); // Restore previous state
    setSelectedCity(userData.city); // Restore previous city
    setIsEditing(false);
  };
  

  const handleSave = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        handleError("User is not logged in.");
        return;
      }

      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        state: selectedState,
        city: selectedCity,
      });

      handleSuccess("Profile updated successfully!");

      setUserData((prevData) => ({
        ...prevData,
        state: selectedState,
        city: selectedCity,
      }));

      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      handleError("Failed to update profile.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      handleSuccess("User Logged Out");
      setIsAuthenticated(false);
      navigate('/login');
    } catch (error) {
      handleError("Logout failed. Try again.");
    }
  };

  const handleDeleteUser = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        handleError("User is not logged in.");
        return;
      }

      const userDocRef = doc(db, "users", user.uid);
      await deleteDoc(userDocRef);
      await deleteUser(user);

      localStorage.clear();
      setIsAuthenticated(false);
      handleSuccess("Account deleted successfully!");

      navigate('/login');
    } catch (error) {
      console.error("Error deleting account:", error);
      handleError("Failed to delete account.");
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
        padding: 3,
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            boxShadow: "0px 3px 10px rgba(0, 0, 0, 0.2)",
            borderRadius: "8px",
            padding: 3,
          }}
        >
          <CardContent >
            <Typography variant="h5" align="center" fontWeight="bold" gutterBottom>
              Profile
            </Typography>

            <Typography variant="body1" paddingLeft={20}>
              <strong>Name:</strong> {userData.name}
            </Typography>
            <Typography variant="body1" paddingLeft={20} >
              <strong>Email:</strong> {userData.email}
            </Typography>
            <Typography variant="body1" paddingLeft={20} >
              <strong>Role:</strong> {userData.role}
            </Typography>

            <Typography variant="body1" sx={{ paddingLeft: isEditing ? 0 : 20 }}>
              <strong>State:</strong>{" "}
              {isEditing ? (
                <FormControl fullWidth variant="filled" sx={{ mt: 1 }}>
                  <InputLabel>Select State</InputLabel>
                  <Select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    sx={{ backgroundColor: "#a9b8c2", borderRadius: 1 }}
                  >
                    {states.map((state) => (
                      <MenuItem key={state.isoCode} value={state.name}>
                        {state.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                userData.state
              )}
            </Typography>

            <Typography variant="body1" sx={{ paddingLeft: isEditing ? 0 : 20 }}>
              <strong>City:</strong>{" "}
              {isEditing ? (
                <FormControl fullWidth variant="filled" sx={{ mt: 1 }}>
                  <InputLabel>Select City</InputLabel>
                  <Select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    sx={{ backgroundColor: "#a9b8c2", borderRadius: 1 }}
                  >
                    {cities.map((city) => (
                      <MenuItem key={city.name} value={city.name}>
                        {city.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                userData.city
              )}
            </Typography>
          </CardContent>

          <CardActions sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {isEditing ? (
              <Grid2 container spacing={2}>
                <Grid2 item xs={6}>
                  <Button fullWidth variant="contained" color="primary" onClick={handleSave}>
                    Save
                  </Button>
                </Grid2>
                <Grid2 item xs={6}>
                  <Button fullWidth variant="contained" color="secondary" onClick={handleCancel}>
                    Cancel
                  </Button>
                </Grid2>
              </Grid2>
            ) : (
              <Grid2 container spacing={6} sx={{ mt: 1 }}>
                <Grid2 item xs={4}>
                  <Button fullWidth variant="contained" color="primary" onClick={handleEdit}>
                    Edit
                  </Button>
                </Grid2>
                <Grid2 item xs={4}>
                  <Button fullWidth variant="contained" color="secondary" onClick={handleLogout}>
                    Logout
                  </Button>
                </Grid2>
                <Grid2 item xs={4}>
                  <Button fullWidth variant="contained" color="error" onClick={handleDeleteUser}>
                    Delete
                  </Button>
                </Grid2>
              </Grid2>
            )}
          </CardActions>
        </Card>
        <ToastContainer />
      </Container>
    </Box>


  );
}

export default Profile;