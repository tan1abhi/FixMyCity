import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../Pages/utils';
import '../UserPages/Profile.css';

import { doc, deleteDoc } from "firebase/firestore";
import { getAuth, deleteUser } from "firebase/auth";
import { db } from "../firebase/firebaseConfig"; 

import { Box, Typography, Button, Container, Paper } from "@mui/material";



function Profile({ setIsAuthenticated }) {
  const [loggedInUser, setLoggedInUser] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    setLoggedInUser(localStorage.getItem('loggedInUser'));
    setEmail(localStorage.getItem('email'));
    setRole(localStorage.getItem('role'));
    setCity(localStorage.getItem('city'));
    setState(localStorage.getItem('state'));
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

        const email = user.email;
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

  return (
    <Box
      sx={{
        background: "linear-gradient(180deg, #2c387e, #1769aa)", // Background Gradient
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 0,
        margin: 0,
      }}
    >
    <Container maxWidth="sm">
      <Paper
        elevation={3}
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          boxShadow: "0px 3px 10px rgba(0, 0, 0, 0.2)",
          borderRadius: "8px",
          padding: "32px",
          textAlign: "center",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2 }}>
          Profile Information
        </Typography>

        <Box sx={{ textAlign: "left", mb: 3 }}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Name:</strong> {loggedInUser}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Email:</strong> {email}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Role:</strong> {role}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>State:</strong> {state}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>City:</strong> {city}
          </Typography>
        </Box>

        {/* Action Buttons: Delete & Logout (In Single Line & Spaced Equally) */}
        <Box container spacing={2} sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          <Button variant="contained" color="secondary" onClick={handleDeleteUser}>
            Delete Account
          </Button>
          <Button variant="contained" color="primary" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </Paper>
      <ToastContainer />
    </Container>
  </Box>
  );
}

export default Profile;
