import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../Pages/utils';

import { doc, deleteDoc,getDoc } from "firebase/firestore";
import { getAuth, deleteUser } from "firebase/auth";
import { db } from "../firebase/firebaseConfig"; 

import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Paper, 
  Avatar, 
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  CardContent,
  Chip
} from "@mui/material";
import { 
  PersonOutline, 
  EmailOutlined, 
  WorkOutlined, 
  LocationCityOutlined, 
  PublicOutlined, 
  LogoutOutlined, 
  DeleteOutline 
} from '@mui/icons-material';

function AuthorityProfile({ setIsAuthenticated }) {
  const [loggedInUser, setLoggedInUser] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [department, setDepartment] = useState('');


  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
  
    if (user) {
      const userRef = doc(db, "users", user.uid);
  
      getDoc(userRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setLoggedInUser(userData.name || ""); // Assuming fullName is stored
            setEmail(userData.email || "");
            setRole(userData.role || "");
            setCity(userData.city || "");
            setState(userData.state || "");
            setDepartment(userData.department || "Not specified");
          }
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    }
  }, []);
  

  const handleLogout = () => {
    localStorage.clear();
    handleSuccess('User Logged Out');
    setTimeout(() => {
      setIsAuthenticated(false);
      navigate('/login');
    }, 1000);
  };

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

  // Get initials for avatar
  const getInitials = () => {
    return loggedInUser ? loggedInUser.split(' ').map(name => name[0]).join('').toUpperCase() : 'A';
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
              Authority Profile
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
                p: 3,
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
                  mb: 1.5,
                }}
              >
                {getInitials()}
              </Avatar>
              
              <Typography variant="h6" fontWeight="medium" gutterBottom>
                {loggedInUser}
              </Typography>
              
              <Chip 
                label={role || "Authority"} 
                color="primary" 
                size="small"
                sx={{ mb: 1.5 }}
              />
              
              <Typography variant="body2" color="primary">
                {email}
              </Typography>
            </Grid>

            {/* User Details Section */}
            <Grid item xs={12} md={8}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                  Personal Information
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Grid container spacing={1.5}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                        <PersonOutline color="primary" sx={{ mr: 1 }} />
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            Full Name
                          </Typography>
                          <Typography variant="body2">
                            {loggedInUser || "Not provided"}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                        <EmailOutlined color="primary" sx={{ mr: 1 }} />
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            Email Address
                          </Typography>
                          <Typography variant="body2">
                            {email || "Not provided"}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                        <WorkOutlined color="primary" sx={{ mr: 1 }} />
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            Role
                          </Typography>
                          <Typography variant="body2">
                            {role || "Authority"}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                        <WorkOutlined color="primary" sx={{ mr: 1 }} />
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            Department
                          </Typography>
                          <Typography variant="body2">
                            {department}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                        <PublicOutlined color="primary" sx={{ mr: 1 }} />
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            State
                          </Typography>
                          <Typography variant="body2">
                            {state || "Not specified"}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                        <LocationCityOutlined color="primary" sx={{ mr: 1 }} />
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            City
                          </Typography>
                          <Typography variant="body2">
                            {city || "Not specified"}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                {/* Action Buttons */}
                <Box sx={{ 
                  display: "flex", 
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 1.5
                }}>
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
                </Box>
              </CardContent>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Delete Confirmation Dialog */}
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

export default AuthorityProfile;