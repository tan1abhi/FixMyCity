import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../Pages/utils';
import { GoogleMap, useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import { auth, db, googleProvider, storage } from "../firebase/firebaseConfig";
import { doc, updateDoc, getDoc , collection, getDocs , onSnapshot, arrayUnion, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { State, City } from 'country-state-city';
import { supabase } from "../superbase/superbaseClient";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Tooltip from '@mui/material/Tooltip';

import { Box, Button, Paper, Typography, Grid, Card, CardMedia, CardContent, TextField, CircularProgress, Alert, Container } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const libraries = ['places'];
const containerStyle = {
  width: '100%',
  height: '400px',
};
const center = {
  lat: 20.5937, // Center of India
  lng: 78.9629,
};

const theme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#1769aa',
      },
      secondary: {
        main: '#f50057'
      },
      background: {
        default: '#f4f6f8',
        paper: '#ffffff',
      },
      text: {
        primary: '#2c387e',
        secondary: '#6c757d'
      }
    },
    typography: {
      fontFamily: 'Roboto, sans-serif',
      h1: {
        fontSize: '2.5rem',
        fontWeight: 700,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 500,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 500,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 400,
      },
      body1: {
        fontSize: '1rem',
      },
      body2: {
        fontSize: '0.875rem',
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: '5px',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiFilledInput-root': {
              backgroundColor: '#f5f5f5',
              '&:hover': {
                backgroundColor: '#e0e0e0',
              },
              '&.Mui-focused': {
                backgroundColor: '#ffffff',
              }
            }
          }
        }
      }
    }
  });

const ReportIssue = () => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [showHelperText, setShowHelperText] = useState(false);
    const [showDescTooltip, setShowDescTooltip] = useState(false);


    const [issueTitle, setIssueTitle] = useState('');
    const [description, setDescription] = useState('');
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [updatedState, setUpdatedState] = useState('');
    const [media, setMedia] = useState([]);
    const [accessToken, setAccessToken] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [marker, setMarker] = useState(null);
    const [message, setMessage] = useState('');
    const [location, setLocation] = useState(null);
    const autocompleteRef = useRef(null);
    const geocoder = useRef(null);
    const [map, setMap] = useState(null);

    const [fullAddress, setFullAddress] = useState('');
    const [extractedState, setExtractedState] = useState('');
    const [extractedCity, setExtractedCity] = useState('');

    const navigate = useNavigate();
    const [showOptions, setShowOptions] = useState(false);
    
    const loc = useLocation();
    const queryParams = new URLSearchParams(loc.search);
    const selectedCategory = queryParams.get("category") || "";
    
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        libraries,
    });

    useEffect(() => {
        setStates(State.getStatesOfCountry("IN"));
    }, []);
    
    useEffect(() => {
        if (state) {
            setCities(City.getCitiesOfState("IN", state));
        } else {
            setCities([]);
        }
    }, [state]);

    const onDrop = useCallback((acceptedFiles) => {
        const filesWithUrls = acceptedFiles.map(file => {
            // Use Object.assign to preserve original File properties
            const fileWithUrl = Object.assign(file, { url: URL.createObjectURL(file) });
            return fileWithUrl;
        });
    
        console.log("media state for filesWithUrls:", filesWithUrls);
        console.log("media state for acceptedFiles:", acceptedFiles);
    
        const validFiles = filesWithUrls.filter(file => {
            const isValidType = file.type.startsWith("image/") || file.type === "video/mp4";
            const isValidSize = file.size <= 100 * 1024 * 1024; // 100MB limit
            return isValidType && isValidSize;
        });

        console.log("Updated media state:", validFiles);
        
    
        if (validFiles.length === 0) {
            toast.error("Invalid file format or file too large.");
            return;
        }
    
        setMedia((prevMedia) => [...prevMedia, ...validFiles]);
        console.log("Updated media state:", validFiles);
    }, []);
    
    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: "image/*,video/mp4",
        multiple: true
    });

    const fileInputRef = useRef(null);

    // Google Maps
    const updateMapWithLocation = async (location, title = 'Selected Location') => {
        if (!(location instanceof window.google.maps.LatLng)) {
            location = new window.google.maps.LatLng(location.lat, location.lng);
        }
    
        if (!map) {
            console.warn("Map is not initialized yet.");
            return;
        }
    
        if (marker) {
            marker.setMap(null);
        }
    
        const newMarker = new window.google.maps.Marker({
            position: location,
            map: map,
            title,
            draggable: true,
        });
    
        setMarker(newMarker);
        const lat = location.lat();
        const lng = location.lng();
        setLocation({ lat, lng });
    
        map.panTo(location);
        map.setZoom(15);
    
        try {
            const { fullAddress, state, city } = await extractAddressDetails(lat, lng);
            setFullAddress(fullAddress);
            setExtractedState(state);
            setExtractedCity(city);
            setMessage(`Location selected: ${fullAddress}`);
        } catch (error) {
            console.error(error);
            setMessage("Failed to fetch address for the selected location.");
        }
    
        newMarker.addListener('dragend', async (event) => {
            const draggedLat = event.latLng.lat();
            const draggedLng = event.latLng.lng();
            setLocation({ lat: draggedLat, lng: draggedLng });
    
            try {
                const { fullAddress, state, city } = await extractAddressDetails(draggedLat, draggedLng);
                setFullAddress(fullAddress);
                setExtractedState(state);
                setExtractedCity(city);
                setMessage(`Location updated: ${fullAddress}`);
            } catch (err) {
                console.error(err);
                setMessage("Failed to update address after dragging.");
            }
        });
    };    

    const handlePlaceSelect = () => {
        const place = autocompleteRef.current?.getPlace();
        if (!place || !place.geometry || !place.geometry.location) {
            console.error('Invalid place selected:', place);
            handleError('Please select a valid location.');
            return;
        }
      
        const location = place.geometry.location;
        setSearchQuery(place.formatted_address || '');
      
        updateMapWithLocation(location, place.name || 'Selected Place');
    };
      
    const handleCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = new window.google.maps.LatLng(
                        position.coords.latitude,
                        position.coords.longitude
                    );
    
                    updateMapWithLocation(pos, 'Current Location');
                    setLocation({ lat: position.coords.latitude, lng: position.coords.longitude }); // Update the location state
                },
                () => {
                    console.error('Error: The Geolocation service failed.');
                    handleError('Unable to fetch your current location.');
                }
            );
        } else {
            console.error('Error: Your browser does not support geolocation.');
            handleError('Geolocation is not supported by your browser.');
        }
    };
    
    const extractAddressDetails = async (lat, lng) => {
        const geocoder = new window.google.maps.Geocoder();
        const latlng = { lat, lng };
    
        return new Promise((resolve, reject) => {
            geocoder.geocode({ location: latlng }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    const addressComponents = results[0].address_components;
                    const fullAddress = results[0].formatted_address;
    
                    const state = addressComponents.find(comp =>
                        comp.types.includes('administrative_area_level_1')
                    )?.long_name || '';
    
                    const city = addressComponents.find(comp =>
                        comp.types.includes('locality')
                    )?.long_name || '';
    
                    resolve({ fullAddress, state, city });
                } else {
                    reject('Geocoder failed due to: ' + status);
                }
            });
        });
    };
    
    const onLoad = useCallback((mapInstance) => {
        const bounds = new window.google.maps.LatLngBounds(center);
        mapInstance.fitBounds(bounds);
        setMap(mapInstance);
        geocoder.current = new window.google.maps.Geocoder();
    }, []);
    
    const onUnmount = useCallback(() => {
        setMap(null);
        geocoder.current = null;
    }, []);

    if (!isLoaded) {
        return <div>Loading...</div>;
    }
    // Google Maps End

    const fetchSimilarIssues = async () => {
        try {
            const response = await fetch("http://localhost:5000/find_similar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                issueTitle,
                description: [{
                    text: description,
                    name: localStorage.getItem("loggedInUser") || "Anonymous",
                    date: new Date(),
                  }],
                category: selectedCategory,
                address: fullAddress,
            }),
            });
        
            if (!response.ok) throw new Error("Failed to fetch similar issues");
        
            const data = await response.json();
            console.log("✅ Similar issues from Flask:", data.similar_issues);
            return data.similar_issues || [];
        } catch (error) {
            console.error("Error fetching similar issues:", error);
            return [];
        }
    };

    const handleProceed = async () => {
        if (media.length === 0) {
            handleError("Please upload at least one image or video.");
            return;
        }
    
        const userId = localStorage.getItem("userId");
        let uploadedMedia = [];
    
        for (let file of media) {
            const fileName = `${userId}-${Date.now()}-${file.name}`;
            const fileType = file.type.startsWith("video/") ? "video" : "image";
    
            const { data, error } = await supabase.storage.from('fixmycity2').upload(fileName, file, {
                contentType: file.type,
                cacheControl: "3600",
                upsert: false
            });
    
            if (error) {
                console.error(`Error uploading ${fileType}:`, error.message);
                handleError(`Failed to upload ${file.name}: ${error.message}`);
                continue;
            }
    
            const { data: publicUrlData } = supabase.storage.from('fixmycity2').getPublicUrl(fileName);
            const publicUrl = publicUrlData?.publicUrl;
    
            if (!publicUrl) {
                console.error(`Failed to generate public URL for: ${fileName}`);
                handleError(`Failed to generate public URL for ${fileName}`);
                continue;
            }
    
            uploadedMedia.push({ url: publicUrl, type: fileType });
        }
    
        // ✅ Store uploadedMedia BEFORE calling fetchSimilarIssues
        localStorage.setItem("userMedia", JSON.stringify(uploadedMedia));
    
        const similarIssues = await fetchSimilarIssues();
    
        if (similarIssues.length > 0) {
            localStorage.setItem("similarIssues", JSON.stringify(similarIssues));
            localStorage.setItem("userIssueDetails", JSON.stringify({
                title: issueTitle,
                description,
                name: localStorage.getItem("loggedInUser"),
                fullAddress,
                extractedCity,
                extractedState,
            }));
            setShowOptions(true);
        } else {
            toast.info("No similar issues found. You can directly report.");
            handleSubmit({ preventDefault: () => {} });
        }
    };
    
    const handleSimilar = () => {
        setShowOptions(false);
        navigate("/similar-issues");
    };
    
    const handleReportAnyway = () => {
        setShowOptions(false);
        handleSubmit({ preventDefault: () => {} });
    };
    
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSubmitting) {
            console.warn("Submission already in progress...");
            return;
        }
    
        setIsSubmitting(true);
    
        try {
            const token = localStorage.getItem('token');
            const name = localStorage.getItem('loggedInUser');
            const userId = localStorage.getItem('userId');
            const email = localStorage.getItem('email');
            const role = localStorage.getItem('role');


            if (!token || !name) {
                handleError('You need to log in to report an issue.');
                return;
            }

            console.log("Media state at submission:", media);
    
            if (media.length === 0) {
                handleError('Please upload at least one image or video.');
                return;
            }
    
            let uploadedMedia = [];
    
            for (let file of media) {
                const fileName = `${userId}-${Date.now()}-${file.name}`;
                const fileType = file.type.startsWith("video/") ? "video" : "image";
    
                console.log(`Uploading ${fileType}: ${file.name}`);
    
                const { data, error } = await supabase.storage.from('fixmycity2').upload(fileName, file, {
                    contentType: file.type,
                    cacheControl: "3600",
                    upsert: false
                });
    
                if (error) {
                    console.error(`Error uploading ${fileType}:`, error.message);
                    handleError(`Failed to upload ${file.name}: ${error.message}`);
                    continue;
                }
    
                const { data: publicUrlData } = supabase.storage.from('fixmycity2').getPublicUrl(fileName);
                const publicUrl = publicUrlData?.publicUrl;
    
                if (!publicUrl) {
                    console.error(`Failed to generate public URL for: ${fileName}`);
                    handleError(`Failed to generate public URL for ${fileName}`);
                    continue;
                }
    
                console.log(`Final Public URL: ${publicUrl}`);
                uploadedMedia.push({ url: publicUrl, type: fileType });
            }
            localStorage.setItem("userMedia", JSON.stringify(uploadedMedia));


            // Reverse geocoding
            const getAddressFromLatLng = (lat, lng) => {
                return new Promise((resolve, reject) => {
                    const geocoder = new window.google.maps.Geocoder();
                    const latlng = { lat, lng };

                    geocoder.geocode({ location: latlng }, (results, status) => {
                        if (status === "OK" && results[0]) {
                            resolve(results[0].formatted_address);
                        } else {
                            reject("Unable to fetch address");
                        }
                    });
                });
            };

            let humanReadableAddress = "";

            try {
                humanReadableAddress = await getAddressFromLatLng(location.lat, location.lng);
                setMessage(`Selected Location: ${humanReadableAddress}`);
                console.log("Reverse Geocoded Address:", humanReadableAddress);
            } catch (err) {
                console.error("Reverse Geocoding Failed:", err);
                setMessage("Failed to get address from location.");
            }
    
            const issueData = {
                userId,
                email,
                issueTitle,
                description: [{
                    text: description,
                    name,
                    date: new Date(),
                }],
                name,
                category: selectedCategory,
                media: uploadedMedia,
                dateOfComplaint: new Date(),
                status: "Pending",
                managingAuthorities: [],
                announcements: [],
                comments: [],
                feedback: [],
                upvotes: 0,
                downvotes: 0,
                userVotes: {}, 
                lat: location.lat,
                lng: location.lng,
                address: humanReadableAddress,
                city: extractedCity,
                state: extractedState,
            };
    
            const issueRef = await addDoc(collection(db, "issues"), issueData);
            const issueId = issueRef.id

            // 🔹 Store issueId in local storage
            localStorage.setItem("issueId", issueId);
            console.log("Stored issueId in local storage:", issueId);
            localStorage.removeItem("issueId");
    
            handleSuccess('Issue reported successfully!');
    
            setIssueTitle('');
            setDescription('');
            setState('');
            setCity('');
            setUpdatedState('');
            setMedia([]);
            setLocation(null);
    
        } catch (error) {
            handleError(error.message || 'An error occurred while reporting the issue.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveMedia = (index) => {
        setMedia(prevMedia => prevMedia.filter((_, i) => i !== index));
    };
    
    
    return (
        <ThemeProvider theme={theme}>
            <Box
                sx={{
                    background: "linear-gradient(180deg, #2c387e, #1769aa)",
                    minHeight: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 4
                }}
            >
                <Container maxWidth="lg">
                    <Typography
                        variant="h3"
                        align="center"
                        gutterBottom
                        sx={{
                            fontSize: '2.7rem',
                            fontWeight: "bold",
                            color: "#fff",
                            textAlign: "center",
                            marginBottom: 4,
                            textShadow: "2px 2px 6px rgba(0,0,0,0.4)",
                        }}
                    >
                        Report an Issue
                    </Typography>

                    <ToastContainer />
                    
                    <Box sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.5)', // light transparent white
                            backdropFilter: 'blur(4px)', // subtle glass effect
                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                            borderRadius: '12px',
                            padding: '16px',
                            transition: '0.3s ease-in-out',
                        }}>
                    <form onSubmit={(e) => e.preventDefault()}>
                        <Grid container spacing={3}>
                            {/* Category */}
                            <Grid item xs={12} sm={6}>
                                <Typography variant="h5" fontWeight="bold" color="black" sx={{ color: "#2b3980" }}>
                                    {selectedCategory}
                                </Typography>
                            </Grid>
                            
                            {/* Title */}
                            <Grid item xs={12}>
                                <Tooltip title="Keep it short: 3-4 words explaining the issue" arrow open={showTooltip}>
                                    <TextField
                                        label="Issue Title"
                                        variant="outlined"
                                        fullWidth
                                        value={issueTitle}
                                        onChange={(e) => setIssueTitle(e.target.value)}
                                        required
                                        onFocus={() => setShowTooltip(true)}
                                        onBlur={() => setShowTooltip(false)}
                                        sx={{ 
                                            backgroundColor: "rgba(255, 255, 255)",
                                            borderRadius: "5px",
                                        }}
                                    />
                                </Tooltip>
                            </Grid>

                            {/* Description */}
                            <Grid item xs={12}>
                                <Tooltip title="Provide more details about the issue in 2-3 sentences." arrow open={showDescTooltip}>
                                    <TextField
                                        label="Description"
                                        variant="outlined"
                                        fullWidth
                                        multiline
                                        rows={4}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        required
                                        onFocus={() => setShowDescTooltip(true)}
                                        onBlur={() => setShowDescTooltip(false)}
                                        sx={{ 
                                            backgroundColor: "rgba(255, 255, 255)",
                                            borderRadius: "5px"
                                        }}
                                    />
                                </Tooltip>
                            </Grid>

                            {/* Map */}
                            <Grid item xs={12}>
                                <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                                    <Typography variant="h6" gutterBottom color='grey'>
                                    Choose Location *
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                    You can search for a place, use your current location, or manually adjust the map.
                                    </Typography>

                                    {/* Location Search + Current Location Button in a row */}
                                    <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" }, mb: 2 }}>
                                    <Autocomplete
                                        onLoad={(autocomplete) => {
                                        autocompleteRef.current = autocomplete;
                                        }}
                                        onPlaceChanged={handlePlaceSelect}
                                    >
                                        <TextField
                                        label="Search for a place"
                                        variant="outlined"
                                        fullWidth
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Enter location"
                                        sx={{
                                            minWidth: "855px",  // ✅ Sets a wider minimum width
                                            width: "100%",  // ✅ Ensures it takes available space
                                            backgroundColor: "rgba(255, 255, 255)",
                                            borderRadius: "5px",
                                        }}
                                        />
                                    </Autocomplete>

                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleCurrentLocation}
                                        sx={{ 
                                        whiteSpace: "nowrap",
                                        minWidth: "200px",
                                        bgcolor: "#1e4c74",
                                        "&:hover": {
                                            bgcolor: "#0d2d4a"
                                        }
                                        }}
                                    >
                                        Use My Location
                                    </Button>
                                    </Box>

                                    {/* Map Area */}
                                    <Box sx={{ borderRadius: "8px", overflow: "hidden", boxShadow: "0 8px 16px rgba(0,0,0,0.2)" }}>
                                    <GoogleMap
                                        mapContainerStyle={containerStyle}
                                        center={center}
                                        zoom={10}
                                        onLoad={onLoad}
                                        onUnmount={onUnmount}
                                    />
                                    </Box>

                                    {/* Optional message */}
                                    {message && (
                                    <Alert severity="info" sx={{ borderRadius: "5px", mt: 2 }}>
                                        {message}
                                    </Alert>
                                    )}
                                </Paper>
                            </Grid>


                            {/* Media */}
                            <Grid item xs={12}>
                                <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                                    <Typography variant="h6" gutterBottom color='grey'>
                                        Upload Images/Videos *
                                    </Typography>
                                        
                                    <Box
                                        {...getRootProps()}
                                        sx={{
                                            border: "2px dashed grey",
                                            borderRadius: "8px",
                                            backgroundColor: "rgba(0, 0, 0, 0.05)",
                                            color: "text.primary",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            minHeight: "200px",
                                            padding: "20px",
                                            transition: "0.3s",
                                            "&:hover": {
                                                backgroundColor: "rgba(0, 0, 0, 0.1)",
                                                boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
                                                transform: "scale(1.02)"
                                            },
                                            cursor: "pointer"
                                        }}
                                    >
                                        <input {...getInputProps()} />
                                        <CloudUploadIcon sx={{ 
                                            fontSize: 60, 
                                            color: "primary.main", 
                                            mb: 2 
                                        }} />
                                        <Typography variant="h6" fontWeight="bold" color="text.primary">
                                            Drag & Drop files here
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                            or click to upload
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Grid>

                            {/* Uploaded Media */}
                            <Grid item xs={12}>
                                <Grid container spacing={2}>
                                    {media.length > 0 ? (
                                        media.map((file, index) => (
                                            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                                                <Card sx={{ 
                                                    width: '100%', 
                                                    boxShadow: 3, 
                                                    borderRadius: "8px", 
                                                    backgroundColor: "rgba(255, 255, 255)" 
                                                }}>
                                                    {file.type.startsWith('image/') ? (
                                                        <CardMedia
                                                            component="img"
                                                            height="140"
                                                            image={file.url}
                                                            alt={file.name}
                                                            sx={{ objectFit: "cover" }}
                                                        />
                                                    ) : file.type.startsWith('video/') ? (
                                                        <video 
                                                            src={file.url} 
                                                            height="140" 
                                                            style={{ width: '100%', objectFit: 'cover' }}
                                                            controls 
                                                        />
                                                    ) : (
                                                        <CardMedia
                                                            component="img"
                                                            height="140"
                                                            image="/placeholder.png"
                                                            alt="Unsupported File"
                                                            sx={{ objectFit: "cover" }}
                                                        />
                                                    )}
                                                    
                                                    <CardContent>
                                                        <Typography variant="body1" fontWeight="bold" noWrap>
                                                            {file.name}
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                                            <Button
                                                                variant="outlined"
                                                                color="primary"
                                                                size="small"
                                                                href={file.url}
                                                                target="_blank"
                                                            >
                                                                View
                                                            </Button>
                                                            <Button
                                                                variant="outlined"
                                                                color="error"
                                                                size="small"
                                                                onClick={() => handleRemoveMedia(index)}
                                                            >
                                                                Remove
                                                            </Button>
                                                        </Box>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        ))
                                    ) : (
                                        <Grid item xs={12}>
                                            <Typography variant="body1" sx={{ m: 2, textAlign: "center", color: "text.secondary" }}>
                                                No media uploaded.
                                            </Typography>
                                        </Grid>
                                    )}
                                </Grid>
                            </Grid>


                            {/* Proceed */}
                            <Grid item xs={12} sx={{ textAlign: "center", mt: 4 }}>
                                {!showOptions ? (
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        onClick={handleProceed}
                                        disabled={isSubmitting}
                                        sx={{
                                            width: '100%',
                                            height: '50px',
                                            fontWeight: 'bold',
                                            fontSize: '16px',
                                            transition: '0.3s',
                                            "&:hover": { transform: "scale(1.05)" },
                                            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)"
                                        }}
                                    >
                                        {isSubmitting ? "Processing..." : "Proceed"}
                                    </Button>
                                ) : (
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="h6" color="#fff" gutterBottom>
                                            Similar issues found. What would you like to do?
                                        </Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                                            <Button
                                                variant="contained"
                                                color="secondary"
                                                onClick={handleSimilar}
                                                sx={{ width: '200px', height: '50px', fontWeight: 'bold' }}
                                            >
                                                View Similar Issues
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={handleReportAnyway}
                                                sx={{ 
                                                    width: '200px', 
                                                    height: '50px', 
                                                    fontWeight: 'bold',
                                                    bgcolor: "#1e4c74",
                                                    "&:hover": {
                                                        bgcolor: "#0d2d4a"
                                                    }
                                                }}
                                            >
                                                🆕 Report Anyway
                                            </Button>
                                        </Box>
                                    </Box>
                                )}
                            </Grid>


                        </Grid>
                    </form>
                    </Box>
                </Container>
            </Box>
        </ThemeProvider>
    );
};

export default ReportIssue;