// ReportIssue.js

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../Pages/utils';
import { GoogleMap, useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import './ReportIssue.css';
import { auth, db, googleProvider, storage } from "../firebase/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore"; 
import { State, City } from 'country-state-city';
import { supabase } from "../superbase/superbaseClient";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import { gapi } from "gapi-script";
import { loadAuth2 } from "gapi-script";

import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";


import "react-toastify/dist/ReactToastify.css";



/* global google */


// const libraries = ['places'];
// const containerStyle = {
//   width: '100%',
//   height: '400px',
// };
// const center = {
//   lat: 20.5937, // Center of India
//   lng: 78.9629,
// };


const ReportIssue = () => {
    const [issueTitle, setIssueTitle] = useState('');
    const [description, setDescription] = useState('');
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [updatedState, setUpdatedState] = useState('');
    const [media, setMedia] = useState([]);
    const [accessToken, setAccessToken] = useState(null);

    const [isSubmitting, setIsSubmitting] = useState(false); // Track submission state


    // const [searchQuery, setSearchQuery] = useState('');
    // const [marker, setMarker] = useState(null);
    // const [message, setMessage] = useState('');
    // const [location, setLocation] = useState(null);
    // const autocompleteRef = useRef(null);
    // const geocoder = useRef(null);
    // const [map, setMap] = useState(null);
    
    const loc = useLocation();
    const queryParams = new URLSearchParams(loc.search);
    const selectedCategory = queryParams.get("category") || "";


    // Load states of India on component mount
    useEffect(() => {
        setStates(State.getStatesOfCountry("IN"));
    }, []);

    // Load cities when state is selected
    useEffect(() => {
        if (state) {
            setCities(City.getCitiesOfState("IN", state)); // Get cities based on selected state
        } else {
            setCities([]); // Reset cities if no state is selected
        }
    }, [state]); // Only re-run when state changes


    // const handleFileChange = (e) => {
    //     const validFiles = Array.from(e.target.files).filter(file => {
    //         const isValidType = file.type.startsWith('image/') || file.type === 'video/mp4'; // Ensure .mp4 is accepted
    //         const isValidSize = file.size <= 100 * 1024 * 1024; // 10MB limit
    
    //         if (!isValidType) {
    //             handleError(`Invalid file type: ${file.name} (${file.type}). Only images and .mp4 videos are allowed.`);
    //         }
    //         if (!isValidSize) {
    //             handleError(`File too large: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB). Max size is 100MB.`);
    //         }
    
    //         return isValidType && isValidSize;
    //     });
    
    //     if (validFiles.length === 0) {
    //         return; // Prevent updating state if no valid files
    //     }
    
    //     setMedia((prevMedia) => [...prevMedia, ...validFiles]);
    //     console.log("Updated media state:", validFiles); // Debugging log
    // };
    const onDrop = useCallback((acceptedFiles) => {
        const validFiles = acceptedFiles.filter(file => {
            const isValidType = file.type.startsWith("image/") || file.type === "video/mp4";
            const isValidSize = file.size <= 100 * 1024 * 1024; // 100MB limit
            return isValidType && isValidSize;
        });
    
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
    
    // ✅ State to track Google authentication
 
  
    


    // function initializeGoogleAPI() {
    //     function start() {
    //         gapi.load("auth2", () => {
    //             gapi.auth2.init({
    //                 client_id: "685413249760-j3kd1971kh2dj2kdvsqlkkd3699spe62.apps.googleusercontent.com",
    //                 scope: "https://www.googleapis.com/auth/drive.file",
    //             });
    //         });
    //     }
    //     gapi.load("client:auth2", start);
    // }
    
    // // Call this function where needed, for example, inside `useEffect`
    // useEffect(() => {
    //     initializeGoogleAPI();
    // }, []);
    
    const fileInputRef = useRef(null);

    /*
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: 'AIzaSyCf2dvOxtwdeaKhKv6pIfOt44XcOBifT3A',
        libraries,
    });

    const updateMapWithLocation = (location, title = 'Selected Location') => {
        // If location is a plain object, convert it to google.maps.LatLng
        if (!(location instanceof window.google.maps.LatLng)) {
          location = new window.google.maps.LatLng(location.lat, location.lng);
        }
      
        // Remove the existing marker if present
        if (marker) {
          marker.setMap(null);
        }
      
        // Create a new marker at the given location
        const newMarker = new window.google.maps.Marker({
          position: location,
          map: map,
          title,
          draggable: true,
        });
      
        // Update the marker and location state
        setMarker(newMarker);
        setLocation({ lat: location.lat(), lng: location.lng() });
      
        // Pan the map to the new location and adjust the zoom
        map.panTo(location);
        map.setZoom(15);
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
      
        if (state && city) {
          checkLocationWithinBounds(location, state, city);
        }
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
    

    const checkLocationWithinBounds = (location, selectedState, selectedCity) => {
        if (!geocoder.current) {
          console.error('Geocoder is not initialized.');
          return false;
        }
      
        return new Promise((resolve) => {
            geocoder.current.geocode({ location }, (results, status) => {
                if (status === 'OK' && results.length > 0) {
                    const addressComponents = results[0].address_components;
        
                    const foundState = addressComponents.find((comp) =>
                        comp.types.includes('administrative_area_level_1')
                    )?.long_name;
        
                    const foundCity = addressComponents.find((comp) =>
                        comp.types.includes('locality')
                    )?.long_name;
        
                    if (foundState === selectedState && foundCity === selectedCity) {
                        resolve(true); // Valid location
                    } else {
                        handleError('The selected location is not within the selected city and state.');
                        resolve(false); // Invalid location
                    }
                } else {
                    console.error('Geocoder failed due to:', status);
                    handleError('Failed to verify the selected location.');
                    resolve(false);
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
    */

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
    
            const issueData = {
                userId,
                email,
                issueTitle,
                description,
                city,
                state,
                name,
                category: selectedCategory,
                media: uploadedMedia, 
                timestamp: new Date(),
                dateOfComplaint: new Date(),
                status: "Pending",
                managingAuthorities: [],
                announcements: [],
                comments: [],
                feedback: [],
                upvotes: 0,
                downvotes: 0,
                userVotes: {}, 
            };
    
            const issueRef = await addDoc(collection(db, "issues"), issueData);
            const issueId = issueRef.id; // ✅ Get issue ID from Firestore

            // 🔹 Store issueId in local storage
            localStorage.setItem("issueId", issueId);
            console.log("Stored issueId in local storage:", issueId);

    
            handleSuccess('Issue reported successfully!');
    
            setIssueTitle('');
            setDescription('');
            setState('');
            setCity('');
            setUpdatedState('');
            setMedia([]);
    
        } catch (error) {
            handleError(error.message || 'An error occurred while reporting the issue.');
        }finally {
            setIsSubmitting(false); // Re-enable submission after completion
        }
    };
    

    
    /*const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
            // 🔹 Ensure user is authenticated
            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !sessionData.session) {
                handleError('You need to log in to upload an image.');
                return;
            }
    
            const user = sessionData.session.user;
            const userId = user.id;
            const email = user.email;
            const name = localStorage.getItem('loggedInUser');
            const role = localStorage.getItem('role');
    
            if (!name) {
                handleError('You need to log in to report an issue.');
                return;
            }
    
            if (media.length === 0) {
                handleError('Please upload at least one image.');
                return;
            }
    
            let uploadedImages = [];
    
            for (let file of media) {
                const fileName = `${userId}-${Date.now()}-${file.name}`;
    
                // 🔹 Upload image to Supabase Storage (authenticated users only)
                const { data, error } = await supabase
                    .storage
                    .from('fixmycity2')
                    .upload(fileName, file, {
                        contentType: file.type,
                        cacheControl: "3600",
                        upsert: false
                    });
    
                if (error) {
                    console.error("Error uploading image:", error.message);
                    handleError(`Failed to upload ${file.name}: ${error.message}`);
                    continue;
                }
    
                // 🔹 Generate a **signed URL** instead of a public URL
                const { data: signedUrlData, error: signedUrlError } = await supabase
                    .storage
                    .from('fixmycity2')
                    .createSignedUrl(fileName, 60 * 60 * 24); // Valid for 24 hours
    
                if (signedUrlError) {
                    console.error("Failed to generate signed URL:", signedUrlError.message);
                    handleError(`Failed to generate signed URL for ${fileName}`);
                    continue;
                }
    
                console.log(`Final Signed URL: ${signedUrlData.signedUrl}`);
                uploadedImages.push(signedUrlData.signedUrl);
            }
    
            // 🔹 Save issue details in Firestore along with signed URLs
            const issueData = {
                userId,
                email,
                issueTitle,
                description,
                city,
                state,
                name,
                category: selectedCategory,
                images: uploadedImages, // Store signed URLs
                timestamp: new Date(),
            };
    
            const issueRef = await addDoc(collection(db, "issues"), issueData);
    
            handleSuccess('Issue reported successfully!');
    
            // Reset form fields
            setIssueTitle('');
            setDescription('');
            setState('');
            setCity('');
            setUpdatedState('');
            setMedia([]);
    
        } catch (error) {
            handleError(error.message || 'An error occurred while reporting the issue.');
        }
    };*/
    
    
    return (
        <div className="report-issue">
            <h2 className="report-issue__title">Report an Issue</h2>
            <ToastContainer />
            <form className="report-issue__form" onSubmit={handleSubmit}>
                <div className="form-group">

                {/* Category */}
                <label className="form-group__label">{selectedCategory}</label>
                

                {/* Title */}
                <label className="form-group__label">Issue Title</label>
                <input
                    className="form-group__input"
                    type="text"
                    value={issueTitle}
                    onChange={(e) => setIssueTitle(e.target.value)}
                    required
                />
                </div>

                {/* Description */}
                <div className="form-group">
                <label className="form-group__label">Description</label>
                <textarea
                    className="form-group__textarea"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                ></textarea>
                </div>

                
                {/* State Dropdown */}
                <div className="form-group">
                    <label className="form-group__label">State</label>
                    <select
                        className="form-group__select"
                        onChange={(e) => setState(e.target.value)}
                        value={state}
                    >
                        <option value="">Select State</option>
                        {states.map((stateObj, index) => (
                            <option key={index} value={stateObj.isoCode}>
                                {stateObj.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* City Dropdown */}
                <div className="form-group">
                    <label className="form-group__label">City</label>
                    <select
                        className="form-group__select"
                        onChange={(e) => setCity(e.target.value)}
                        value={city}
                        disabled={!state} // Disable city dropdown if no state is selected
                    >
                        <option value="">Select City</option>
                        {cities.map((cityObj, index) => (
                            <option key={index} value={cityObj.name}>
                                {cityObj.name}
                            </option>
                        ))}
                    </select>
                </div>

                
                {/* Map */}
                {/* <div className="form-group form-group--autocomplete" style={{ marginBottom: '10px' }}>
                <Autocomplete
                    onLoad={(autocomplete) => {
                    console.log('Autocomplete loaded:', autocomplete);
                    autocompleteRef.current = autocomplete;
                    }}
                    onPlaceChanged={handlePlaceSelect}
                >
                    <input
                    className="form-group__input"
                    type="text"
                    placeholder="Search for a place"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        width: '300px',
                        padding: '10px',
                        borderRadius: '5px',
                        border: '1px solid #ccc',
                    }}
                    />
                </Autocomplete>
                </div>

                <button
                className="report-issue_button report-issue_button--current-location"
                type="button"
                onClick={handleCurrentLocation}
                >
                Pan to Current Location
                </button>

                <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={10}
                onLoad={onLoad}
                onUnmount={onUnmount}
                />

                <p className="report-issue__message">{message}</p> */}

                {/* Drag & Drop Upload */}
                <div {...getRootProps()} className="dropzone">
                    <input {...getInputProps()} />
                    <p>Drag & drop files here or click to upload</p>
                </div>


                {/* Upload Media */}
                <button className="report-issue__submit" type="submit"  disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit"}
            
                </button>
            </form>

            <ul>
                {media.map((file, index) => (
                    <li key={index}>
                        {file.url ? <a href={file.url}>{file.name}</a> : file.name}
                    </li>
                ))}
            </ul>

        </div>

    );
};

export default ReportIssue;