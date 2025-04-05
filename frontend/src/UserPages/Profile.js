import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../Pages/utils';
import { auth, db } from '../firebase/firebaseConfig';
import { signOut, deleteUser, getAuth } from "firebase/auth";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { State, City } from 'country-state-city';
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
  CardContent,
  CardActions,
  Grid,
  Avatar,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  IconButton,
  Tooltip,
  Chip
} from "@mui/material";
import { 
  PersonOutline, 
  EditOutlined, 
  LogoutOutlined, 
  DeleteOutline, 
  SaveOutlined, 
  CancelOutlined, 
  EmailOutlined, 
  WorkOutlined, 
  LocationCityOutlined, 
  PublicOutlined 
} from '@mui/icons-material';

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
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

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
    setSelectedState(userData.state);
    setSelectedCity(userData.city);
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

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
  
    if (user) {
      const userRef = doc(db, "users", user.uid);
  
      getDoc(userRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
          }
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    }
  }, []);
  
  const handleDeleteUser = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser; // Get currently logged-in user

      if (!user) {
        handleError("You are not logged in. Please log in again.");
        return;
      }

      const userId = user.uid; // Firebase Auth User ID

      // Step 1: Delete user from Firestore users collection
      await deleteDoc(doc(db, "users", userId)); 

      // Step 2: Delete user from Firebase Authentication
      await deleteUser(user); 

      handleSuccess("Account deleted successfully");

      setTimeout(() => {
        localStorage.clear();
        setIsAuthenticated(false);
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Error during delete request:", error);
      handleError(error.message || "An error occurred while deleting the account");
    }
  };

  // Get initials for avatar (matching AdminProfile)
  const getInitials = () => {
    return userData.name ? userData.name.split(' ').map(name => name[0]).join('').toUpperCase() : 'U';
  };

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #2c387e 0%, #1769aa 100%)",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 2,
      }}
    >
      <Container maxWidth="md">
        <Paper 
          elevation={12}
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.75)",
            borderRadius: "5px",
            overflow: "hidden",
          }}
        >
          {/* Header Section */}
          <Box
            sx={{
              backgroundColor: "primary.main",
              py: 2,
              textAlign: "center",
              color: "white",
            }}
          >
            <Typography variant="h5" fontWeight="bold">
              My Profile
            </Typography>
          </Box>

          <Grid container>
            {/* Avatar Section */}
            <Grid item xs={12} md={4} 
              sx={{ 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center", 
                justifyContent: "center",
                p: 2,
                borderRight: { md: "1px solid #eee" },
                borderBottom: { xs: "1px solid #eee", md: "none" }
              }}
            >
              <Avatar 
                sx={{ 
                  width: 90, 
                  height: 90, 
                  bgcolor: "secondary.main",
                  fontSize: "2.2rem",
                  mb: 1
                }}
              >
                {getInitials()}
              </Avatar>
              
              <Typography variant="h6" fontWeight="medium" gutterBottom>
                {userData.name}
              </Typography>
              
              <Chip 
                label={userData.role || "User"} 
                color="primary" 
                size="small"
                sx={{ mb: 1 }}
              />
              
              <Typography variant="body2" color="primary">
                {userData.email}
              </Typography>
            </Grid>

            {/* User Details Section */}
            <Grid item xs={12} md={8}>
              <CardContent sx={{ p: 2 }}>
                {isEditing ? (
                  <>
                    <Typography variant="subtitle1" gutterBottom sx={{ mb: 2 }}>
                      Edit Location
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth variant="outlined" size="small">
                          <InputLabel>State</InputLabel>
                          <Select
                            value={selectedState}
                            onChange={(e) => setSelectedState(e.target.value)}
                            label="State"
                          >
                            {states.map((state) => (
                              <MenuItem key={state.isoCode} value={state.name}>
                                {state.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth variant="outlined" size="small">
                          <InputLabel>City</InputLabel>
                          <Select
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            label="City"
                            disabled={!selectedState}
                          >
                            {cities.map((city) => (
                              <MenuItem key={city.name} value={city.name}>
                                {city.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </>
                ) : (
                  <>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                      Personal Information
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Grid container spacing={1}>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                            <PersonOutline color="primary" sx={{ mr: 1, fontSize: "1.2rem" }} />
                            <Box>
                              <Typography variant="subtitle2" color="text.secondary">
                                Full Name
                              </Typography>
                              <Typography variant="body2">
                                {userData.name || "Not provided"}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                            <EmailOutlined color="primary" sx={{ mr: 1, fontSize: "1.2rem" }} />
                            <Box>
                              <Typography variant="subtitle2" color="text.secondary">
                                Email Address
                              </Typography>
                              <Typography variant="body2">
                                {userData.email || "Not provided"}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                            <WorkOutlined color="primary" sx={{ mr: 1, fontSize: "1.2rem" }} />
                            <Box>
                              <Typography variant="subtitle2" color="text.secondary">
                                Role
                              </Typography>
                              <Typography variant="body2">
                                {userData.role || "User"}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                            <PublicOutlined color="primary" sx={{ mr: 1, fontSize: "1.2rem" }} />
                            <Box>
                              <Typography variant="subtitle2" color="text.secondary">
                                State
                              </Typography>
                              <Typography variant="body2">
                                {userData.state || "Not specified"}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                            <LocationCityOutlined color="primary" sx={{ mr: 1, fontSize: "1.2rem" }} />
                            <Box>
                              <Typography variant="subtitle2" color="text.secondary">
                                City
                              </Typography>
                              <Typography variant="body2">
                                {userData.city || "Not specified"}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  </>
                )}

                <Divider sx={{ my: 2 }} />
                
                {/* Action Buttons */}
                <Box sx={{ 
                  display: "flex", 
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 1
                }}>
                  {isEditing ? (
                    <>
                      <Button 
                        variant="outlined" 
                        color="primary" 
                        onClick={handleSave}
                        startIcon={<SaveOutlined />}
                        size="small"
                      >
                        Save Changes
                      </Button>
                      <Button 
                        variant="outlined" 
                        onClick={handleCancel}
                        startIcon={<CancelOutlined />}
                        size="small"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="outlined" 
                        color="primary" 
                        onClick={handleEdit}
                        startIcon={<EditOutlined />}
                        size="small"
                      >
                        Edit Profile
                      </Button>
                      <Button 
                        variant="outlined" 
                        color="secondary" 
                        onClick={handleLogout}
                        startIcon={<LogoutOutlined />}
                        size="small"
                      >
                        Logout
                      </Button>
                      <Button 
                        variant="outlined" 
                        color="error" 
                        onClick={() => setOpenDeleteDialog(true)}
                        startIcon={<DeleteOutline />}
                        size="small"
                      >
                        Delete Account
                      </Button>
                    </>
                  )}
                </Box>
              </CardContent>
            </Grid>
          </Grid>
        </Paper>

        {/* Delete Account Confirmation Dialog */}
        <Dialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
        >
          <DialogTitle>
            {"Are you sure you want to delete your account?"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              This action cannot be undone. All of your personal data will be permanently removed from our servers. Are you sure you want to proceed?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={handleDeleteUser} color="error" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <ToastContainer />
      </Container>
    </Box>
  );
}

export default Profile;
