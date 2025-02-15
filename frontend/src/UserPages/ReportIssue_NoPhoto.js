/*import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from './utils';
import { fetchAuthToken, fetchStates, fetchCities } from './locationApi'; 
import './ReportIssue.css'


const ReportIssue = () => {
    const [issueTitle, setIssueTitle] = useState('');
    const [description, setDescription] = useState('');
    const [authToken, setAuthToken] = useState('');
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [updatedState, setUpdatedState] = useState('');
    const [photos, setPhotos] = useState(null); // State to store selected photos

    const navigate = useNavigate();

     // Fetch auth token
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

    // Fetch states when auth token is available
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

    // Fetch cities when state is updated
    useEffect(() => {
        if (updatedState) {
            const fetchCityData = async () => {
                try {
                    const cityList = await fetchCities(authToken, updatedState);
                    setCities(cityList);
                } catch (error) {
                    console.error("Error fetching cities:", error);
                }
            };

            fetchCityData();
        }
    }, [updatedState, authToken]);

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    
    //     try {
    //         const token = localStorage.getItem('token');
    //         const name = localStorage.getItem('loggedInUser'); // Retrieve the name from localStorage
    
    //         if (!token || !name) {
    //             handleError('You need to log in to report an issue.');
    //             return;
    //         }
    
    //         const requestData = {
    //             issueTitle,
    //             description,
    //             city,
    //             state,
    //             name, // Add name to the request body
    //         };
    
    //         const response = await fetch('http://localhost:8080/issues/report', {
    //             method: 'POST',
    //             headers: {
    //                 'Authorization': token,
    //                 'Content-Type': 'application/json', // Set Content-Type to application/json
    //             },
    //             body: JSON.stringify(requestData), // Send the request data as JSON
    //         });
    
    //         const result = await response.json();
    
    //         if (response.ok) {
    //             handleSuccess(result.message);
    //         } else {
    //             handleError(result.message || 'An error occurred while reporting the issue.');
    //         }
    //     } catch (error) {
    //         handleError(error.message || 'An error occurred while reporting the issue.');
    //     }
    // };

    const handleFileChange = (e) => {
        setPhotos(e.target.files); // Stores the selected files in state
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();
   
        try {
            const token = localStorage.getItem('token');
            const name = localStorage.getItem('loggedInUser');
   
            if (!token || !name) {
                handleError('You need to log in to report an issue.');
                return;
            }
   
            const formData = new FormData();
            formData.append('issueTitle', issueTitle);
            formData.append('description', description);
            formData.append('city', city);
            formData.append('state', state);
            formData.append('name', name);
   
            // Append files if there are any
            if (photos) {
                Array.from(photos).forEach((file) => {
                    formData.append('photos', file); // Append each file to FormData
                });
            }
   
            // Log the form data to inspect
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }
   
            const response = await fetch('http://localhost:8080/issues/report', {
                method: 'POST',
                headers: {
                    'Authorization': token,
                },
                body: formData,
            });
   
            const result = await response.json();
   
            if (response.ok) {
                handleSuccess(result.message);
                // Optionally, navigate to another page after success
                // navigate('/somewhere');
            } else {
                handleError(result.message || 'An error occurred while reporting the issue.');
            }
        } catch (error) {
            handleError(error.message || 'An error occurred while reporting the issue.');
        }
    };
   

    return (
        <div className="report-issue">
            <h2 className="report-issue__title">Report an Issue</h2>
            <ToastContainer />
            <form className="report-issue__form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="issueTitle" className="form-group__label">Issue Title</label>
                    <input
                        type="text"
                        id="issueTitle"
                        className="form-group__input"
                        value={issueTitle}
                        onChange={(e) => setIssueTitle(e.target.value)}
                        required
                        minLength={3}
                        maxLength={200}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description" className="form-group__label">Description</label>
                    <textarea
                        id="description"
                        className="form-group__textarea"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        minLength={10}
                    ></textarea>
                </div>

                <div className="form-group">
                    <label htmlFor="state" className="form-group__label">State</label>
                    <select
                        id="state"
                        className="form-group__select"
                        value={state}
                        onChange={(e) => {
                            setState(e.target.value);
                            setUpdatedState(e.target.value); 
                        }}
                        required
                    >
                        <option value="">Select State</option>
                        {states.map((state, index) => (
                            <option key={index} value={state}>{state}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="city" className="form-group__label">City</label>
                    <select
                        id="city"
                        className="form-group__select"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                    >
                        <option value="">Select City</option>
                        {cities.map((city, index) => (
                            <option key={index} value={city}>{city}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="photos" className="form-group__label">Upload Photos</label>
                    <input
                        type="file"
                        id="photos"
                        name="photos" // This must match the backend's multer configuration
                        className="form-group__input"
                        accept="image/*" // Optional: Restrict to image files
                        multiple
                        onChange={handleFileChange}
                    />
                </div>




                <button type="submit" className="report-issue__submit">Submit</button>
            </form>
        </div>
    );
};

export default ReportIssue;*/




/*import React from 'react'
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api'

const containerStyle = {
  width: '400px',
  height: '400px',
}

const center = {
  lat: -3.745,
  lng: -38.523,
}

function Maps() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyCf2dvOxtwdeaKhKv6pIfOt44XcOBifT3A',
  })

  const [map, setMap] = React.useState(null)

  const onLoad = React.useCallback(function callback(map) {
    // This is just an example of getting and using the map instance!!! don't just blindly copy!
    const bounds = new window.google.maps.LatLngBounds(center)
    map.fitBounds(bounds)

    setMap(map)
  }, [])

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null)
  }, [])

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={10}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      
      <></>
    </GoogleMap>
  ) : (
    <></>
  )
}

export default Maps;*/



/*import React, { useState, useRef, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Autocomplete } from '@react-google-maps/api';

// Move the libraries definition outside the component
const libraries = ['places'];

const containerStyle = {
  width: '100%',
  height: '400px',
};

const center = {
  lat: -3.745,
  lng: -38.523,
};

function Maps() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyCf2dvOxtwdeaKhKv6pIfOt44XcOBifT3A',
    libraries, // Use the static `libraries` variable
  });

  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const autocompleteRef = useRef(null);

  const onLoad = useCallback(function callback(map) {
    const bounds = new window.google.maps.LatLngBounds(center);
    map.fitBounds(bounds);
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  const handlePlaceSelect = () => {
    const place = autocompleteRef.current.getPlace();
    
    // Check if the place has a valid geometry
    if (place.geometry && place.geometry.location) {
      const location = place.geometry.location;
      setSearchQuery(place.formatted_address); // Set the search query to the selected place
      
      // Remove the previous marker if it exists
      if (marker) {
        marker.setMap(null); // Remove the previous marker
      }

      // Create a new marker at the selected location
      const newMarker = new window.google.maps.Marker({
        position: location,
        map: map,
        title: place.name,
        draggable: true, // Make the marker draggable
      });

      // Add a listener to update the marker's position when it's dragged
      newMarker.addListener('dragend', (event) => {
        const newLocation = event.latLng;
        console.log('New marker position:', newLocation.lat(), newLocation.lng());
        // You can update your state or perform any other action with the new position
      });

      setMarker(newMarker);
      map.panTo(location); // Center the map to the selected location
      map.setZoom(15); // Zoom in on the selected location
    } else {
      // Handle the case where the selected place doesn't have geometry
      console.error('Selected place does not have geometry.');
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          // Center the map on the current location
          map.setCenter(pos);
          map.setZoom(15);

          // Remove the previous marker if it exists
          if (marker) {
            marker.setMap(null); // Remove the previous marker
          }

          // Add a marker at the current location
          const newMarker = new window.google.maps.Marker({
            position: pos,
            map: map,
            title: 'Current Location',
            draggable: true, // Make the marker draggable
          });

          setMarker(newMarker);
        },
        () => {
          console.error('Error: The Geolocation service failed.');
        }
      );
    } else {
      console.error('Error: Your browser does not support geolocation.');
    }
  };

  return isLoaded ? (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <Autocomplete
          onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
          onPlaceChanged={handlePlaceSelect}
        >
          <input
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
        onClick={handleCurrentLocation}
        style={{
          marginTop: '10px',
          padding: '10px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Pan to Current Location
      </button>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        
        {marker && <></>}
      </GoogleMap>
    </div>
  ) : (
    <></>
  );
}

export default Maps;*/




<div className="view-issues">
            <h2 className="view-issues__title">View Issues</h2>

            <div className="view-issues__search">
                <input
                    type="text"
                    placeholder="Search by title or description..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="search-input"
                />
            </div>

            {/* Embedded Map */}
            {/* <div className="view-issues__map">
                {isLoaded ? (
                    <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '300px' }}
                        center={selectedLocation ? { lat: selectedLocation.coordinates[1], lng: selectedLocation.coordinates[0] } : defaultCenter}
                        zoom={selectedLocation ? 16 : 10}
                        onLoad={onMapLoad}
                        onUnmount={onMapUnmount}
                    />
                ) : (
                    <p>Loading map...</p>
                )}
            </div> */}

            {/* Filters Section */}
            <div className="view-issues__filters">
                <label className="filter-checkbox">
                    <input
                        type="checkbox"
                        checked={myReportsOnly}
                        onChange={() => setMyReportsOnly(!myReportsOnly)}
                    />
                    View My Reports
                </label>

                <div className="filter-group">
                    <label htmlFor="state" className="filter-label">State:</label>
                    <select
                        id="state"
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">All States</option>
                        {states.map((state, index) => (
                            <option key={index} value={state}>{state}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label htmlFor="city" className="filter-label">City:</label>
                    <select
                        id="city"
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        disabled={selectedState === ''}
                        className="filter-select"
                    >
                        <option value="">All Cities</option>
                        {cities.map((city, index) => (
                            <option key={index} value={city}>{city}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label htmlFor="status" className="filter-label">Status:</label>
                    <select
                        id="status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="In-Progress">In-Progress</option>
                        <option value="Resolved">Resolved</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label htmlFor="sortBy" className="filter-label">Sort By:</label>
                    <select
                        id="sortBy"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="filter-select"
                    >
                        <option value="mostRelevant">Most Relevant</option>
                        <option value="mostRecent">Most Recent</option>
                    </select>
                </div>
            </div>

            {/* Issues List */}
            <div className="view-issues__list">
                {Array.isArray(filteredIssues) && filteredIssues.map((issue) => (
                    <div key={issue._id} className="issue-card">
                        <h3 className="issue-card__title">{issue.issueTitle}</h3>
                        <p className="issue-card__description">{issue.description}</p>
                        <p className="issue-card__location"><strong>State:</strong> {issue.state}</p>
                        <p className="issue-card__location"><strong>City:</strong> {issue.city}</p>
                        <p className="issue-card__status"><strong>Status:</strong> {issue.status}</p>

                        {/* <button
                            onClick={() => handleViewOnMap(issue.location)}
                            className="view-on-map-button"
                        >
                            View on Map
                        </button> */}


                        <div className="issue-card__votes">
                            <button
                                onClick={() => handleVote(issue._id, 'upvote')}
                                className="vote-button"
                            >
                                Upvote
                            </button>
                            <span className="vote-count">{issue.upvotes} Upvotes</span>
                            <button
                                onClick={() => handleVote(issue._id, 'downvote')}
                                className="vote-button"
                            >
                                Downvote
                            </button>
                            <span className="vote-count">{issue.downvotes} Downvotes</span>
                        </div>
                        <p className="issue-card__date"><strong>Date:</strong> {new Date(issue.dateOfComplaint).toLocaleDateString()}</p>


                        {issue.managingAuthorities && issue.managingAuthorities.length > 0 && (
                            <div className="issue-card__authorities">
                                <h4>Managing Authorities:</h4>
                                <ul>
                                    {issue.managingAuthorities.map((authority, index) => (
                                        <li key={index}>
                                            {authority.Authority} {/* Displaying the name of the authority */}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}



                        {/* Media Section */}
                        {issue.media && issue.media.length > 0 && (
                            <div className="issue-card__media">
                                <h4>Media:</h4>
                                <div className="media-gallery">
                                    {issue.media.map((mediaUrl, index) => (
                                        <img
                                            key={index}
                                            src={`http://localhost:8080/${mediaUrl}`}
                                            alt={`Media ${index + 1}`}
                                            className="media-thumbnail"
                                            onClick={() => handleMediaClick(`http://localhost:8080/${mediaUrl}`)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedMedia && (
                            <div className="media-modal" onClick={closeMediaModal}>
                                <div className="media-modal__content" onClick={(e) => e.stopPropagation()}>
                                    <button className="media-modal__close-button" onClick={closeMediaModal}>
                                        &times;
                                    </button>
                                    <img src={selectedMedia} alt="Enlarged Media" className="media-modal__image" />
                                </div>
                            </div>
                        )}

                        {/* Comments Section */}
                        <div className="comments-section">
                            <button onClick={() => toggleComments(issue._id)} className="comments-toggle-button">
                                {showComments[issue._id] ? 'Hide Comments' : 'View Comments'}
                            </button>

                            {showComments[issue._id] && (
                                <div className="comments-list">
                                    <h4 className="comments-title">Comments:</h4>
                                    <ul className="comments-ul">
                                        {issue.comments.map((c, idx) => (
                                            <li key={idx} className="comment-item">
                                                <strong>{c.userName}:</strong> {c.comment}
                                                <br />
                                                <em className="comment-time">({new Date(c.time).toLocaleString()})</em>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <input
                                type="text"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Add a comment"
                                className="comment-input"
                            />
                            <button onClick={() => handleComment(issue._id)} className="comment-button">Comment</button>
                        </div>

                        
                        {/* Announcements Section */}
                        <div className="announcements-section">
                            <button onClick={() => toggleAnnouncements(issue._id)} className="announcements-toggle-button">
                                {showAnnouncements[issue._id] ? 'Hide Announcements' : 'View Announcements'}
                            </button>

                            {showAnnouncements[issue._id] && (
                                <div className="announcements-list">
                                    <h4 className="announcements-title">Announcements:</h4>
                                    <ul className="announcements-ul">
                                        {issue.announcements.map((announcement, idx) => (
                                            <li key={idx} className="announcement-item">
                                                <strong>{announcement.userName}:</strong> {announcement.comment}
                                                <br />
                                                <em className="announcement-time">({new Date(announcement.time).toLocaleString()})</em>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>


                    </div>
                ))}
            </div>
        </div>


/*const createIssue = async (req, res) => {
    try {
        const { issueTitle, description, city, state, name, email, lat, lng } = req.body;

        if (!lat || !lng) {
            return res.status(400).json({ message: 'Latitude and longitude are required.' });
        }

        const newIssue = new Issue({
            issueTitle,
            description,
            name,
            email,
            city,
            state,
            location: {
                type: 'Point',
                coordinates: [parseFloat(lng), parseFloat(lat)], // GeoJSON format
            },
            media: req.files.map(file => file.path),
        });

        await newIssue.save();

        res.status(201).json({ message: 'Issue reported successfully.', issue: newIssue });
    } catch (error) {
        console.error('Error reporting the issue.', error);
        res.status(500).json({ message: 'Error reporting the issue.' });
    }
};*/





/*router.delete('/delete', async (req, res) => {
  try {
    const { email } = req.body;  // Get email from request body
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find and delete the user by email
    const user = await User.findOneAndDelete({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);  // Log the full error
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/update', async (req, res) => {
  try {
    const { email, city, state } = req.body;
    const user = await User.findOneAndUpdate(
      { email }, // Find user by email
      { city, state }, // Update fields
      { new: true } // Return updated document
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});*/




// ProductRouter.js
// const ensureAuthenticated = require('../Middlewares/Auth');
// const router = require('express').Router();

// router.get('/', ensureAuthenticated, (req, res) => {
//     console.log('---- logged in user detail ----', req.user);
//     res.status(200).json([
//         {
//             name: "Smartphone",
//             price: 10000
//         },
//         {
//             name: "TV",
//             price: 20000
//         }
//     ])
// });

// module.exports = router;






// NO USE, RoleRoutes.js

const express = require("express");
const ensureAuthenticated = require("../Middlewares/Auth");
const authorizeRoles = require("../Middlewares/RoleMiddleware");

const router = express.Router();

// Only Authority can access the router
router.get("/authority", ensureAuthenticated, authorizeRoles("Authority"), (req, res) => {
    res.json({message: "Authority"})
})

// Both Authority and Resident can access this router
router.get("/all", ensureAuthenticated, authorizeRoles("Authority", "Resident"), (req, res) => {
    res.json({message: "Resident + Authority"})
})

// Only Residents can access this router
router.get("/resident", ensureAuthenticated, authorizeRoles("Resident"), (req, res) => {
    res.json({message: "Resident"})
})

module.exports = router;




// Middleware to parse incoming JSON requests
// app.use(express.json()); // Add this middleware to parse JSON bodies



// Routes
/*const corsOptions = {
    origin: 'http://localhost:3000',  // Allow requests only from your frontend
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}; 
app.use(cors(corsOptions));  // Use the updated CORS options*/




// Signup.js
// import React, { useState, useEffect } from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import { ToastContainer } from 'react-toastify'
// import { handleError, handleSuccess } from './utils'
// import './Signup.css'
// import { fetchAuthToken, fetchStates, fetchCities } from './locationApi'; 

// function Signup() {
//   const [signupInfo, setSignupInfo] = useState({
//     name:'',
//     email: '',
//     password: '',
//     role: '',
//     city: '',
//     state: ''
//   })
  
//   const [states, setStates] = useState([]);
//   const [cities, setCities] = useState([]);
//   const [authToken, setAuthToken] = useState('');
//   const navigate = useNavigate();


//    // Fetch Auth Token on Component Mount
//    useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const token = await fetchAuthToken();
//         setAuthToken(token);
//       } catch (error) {
//         console.error("Error fetching auth token:", error);
//       }
//     };

//     fetchData();
//   }, []);

//   // Fetch States for India
//   useEffect(() => {
//     if (authToken) {
//       const fetchStateData = async () => {
//         try {
//           const stateList = await fetchStates(authToken);
//           setStates(stateList);
//         } catch (error) {
//           console.error("Error fetching states:", error);
//         }
//       };

//       fetchStateData();
//     }
//   }, [authToken]);

//   // Fetch Cities for the Selected State
//   useEffect(() => {
//     if (signupInfo.state) {
//       const fetchCityData = async () => {
//         try {
//           const cityList = await fetchCities(authToken, signupInfo.state);
//           setCities(cityList);
//         } catch (error) {
//           console.error("Error fetching cities:", error);
//         }
//       };

//       fetchCityData();
//     }
//   }, [signupInfo.state, authToken]);


//   // const handleChange = (e) => {
//   //   const {name, value} = e.target;
//   //   console.log(name, value);
//   //   const copySignupInfo = {...signupInfo};
//   //   copySignupInfo[name] = value;
//   //   setSignupInfo(copySignupInfo);
//   // }

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setSignupInfo((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSignup = async (e) => {
//     e.preventDefault(); // prevent page refresh on submit
//     const {name, email, password, role, city, state} = signupInfo;
//     if(!name || !email || !password || !role || !city || !state) {
//       return handleError('All fields are required.')
//     }

//     try{
//       const url = "http://localhost:8080/auth/signup";
//       const response = await fetch(url, {
//         method: "POST",
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(signupInfo)
//       });
//       const result = await response.json();
//       const { success, message, jwtToken, name, email, role, city, state, userId, error } = result;
      
//       if(success) {   // everything correctly entered
//         handleSuccess(message);
//         localStorage.setItem('token', jwtToken);
//         localStorage.setItem('loggedInUser', name);
//         localStorage.setItem('email', email);
//         localStorage.setItem('role', role);
//         localStorage.setItem('city', city);
//         localStorage.setItem('state', state);
//         localStorage.setItem('userId', userId);
//         setTimeout(() => {
//           navigate('/home')
//         }, 1000)
//       }
//       else if(error) {   // not valid email, password
//         const details = error?.details[0].message;
//         handleError(details);
//       }
//       else if(!success) {   // user already exists
//         handleError(message);
//       }
//       console.log(result);
//     }
    
//     catch (err) {
//       handleError(err);
//     }
//   }
  
  

//   return (
//     <div className='signup-container'>
//       <h1 className='signup-title'>Signup</h1>
//       <form onSubmit={handleSignup} className="signup-form">

//         <div className="signup-field">
//           <label htmlFor='name' className='signup-label'>Name</label>
//           <input 
//             onChange={handleChange}
//             type='text'
//             name='name'
//             autoFocus
//             placeholder='Enter your name...'
//             value={signupInfo.name}
//             className='signup-input'
//           />
//         </div>

//         <div className="signup-field">
//           <label htmlFor='email' className='signup-label'>Email</label>
//           <input 
//             onChange={handleChange}
//             type='email'
//             name='email'
//             placeholder='Enter your email...'
//             value={signupInfo.email}
//             className='signup-input'
//           />
//         </div>

//         <div className="signup-field">
//           <label htmlFor='password' className='signup-label'>Password</label>
//           <input 
//             onChange={handleChange}
//             type='password'
//             name='password'
//             placeholder='Enter your password...'
//             value={signupInfo.password}
//             className='signup-input'
//           />
//         </div>

//         <div className="signup-field">
//           <label htmlFor="role" className='signup-label'>Role:</label>
//           <select
//             id="role"
//             name="role"
//             value={signupInfo.role}
//             onChange={handleChange}
//             className='signup-select'
//           >
//             <option value="">Select a role</option>
//             <option value="Authority">Authority</option>
//             <option value="Resident">Resident</option>
//           </select>
//         </div>


//         <div className="signup-field">
//           <label htmlFor="state" className='signup-label'>State:</label>
//           <select
//             id="state"
//             name="state"
//             value={signupInfo.state}
//             onChange={handleChange}
//             className='signup-select'
//           >
//             <option value="">Select a state</option>
//             {states.map((state, index) => (
//               <option key={index} value={state}>
//                 {state}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div className="signup-field">
//           <label htmlFor="city" className='signup-label'>City:</label>
//           <select
//             id="city"
//             name="city"
//             value={signupInfo.city}
//             onChange={handleChange}
//             className='signup-select'
//           >
//             <option value="">Select a city</option>
//             {cities.map((city, index) => (
//               <option key={index} value={city}>
//                 {city}
//               </option>
//             ))}
//           </select>
//         </div>

//         <button type='submit' className='signup-button'>Signup</button>

//         <span className='signup-link'>Already have an account ?
//           <Link to="/login">Login</Link>
//         </span>

//       </form>
//       <ToastContainer />
//     </div>

//   )
// }

// export default Signup









/*const PrivateRoute = ({ element }) => {
    if (isAuthenticated === null) {
      return <div>Loading...</div>;
    }
    return isAuthenticated ? element : <Navigate to="/login" state={{ from: location }} />;
  };*/