// mapsApi.js

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import { fetchAuthToken, fetchStates, fetchCities } from './locationApi';

const libraries = ['places'];

const containerStyle = {
  width: '100%',
  height: '400px',
};

const center = {
  lat: 20.5937, // Center of India
  lng: 78.9629,
};

function Maps() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyCf2dvOxtwdeaKhKv6pIfOt44XcOBifT3A',
    libraries,
  });

  const [authToken, setAuthToken] = useState(null);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [updatedState, setUpdatedState] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [marker, setMarker] = useState(null);
  const [message, setMessage] = useState('');
  const autocompleteRef = useRef(null);
  const [map, setMap] = useState(null);
  const geocoder = useRef(null);

  // Fetch auth token
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await fetchAuthToken();
        setAuthToken(token);
      } catch (error) {
        console.error('Error fetching auth token:', error);
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
          console.error('Error fetching states:', error);
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
          console.error('Error fetching cities:', error);
        }
      };
      fetchCityData();
    }
  }, [updatedState, authToken]);

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

  const handlePlaceSelect = () => {
    const place = autocompleteRef.current.getPlace();
    if (place.geometry && place.geometry.location) {
        const location = place.geometry.location;
        setSearchQuery(place.formatted_address);

        // Check if the map is available
        if (!map) {
            console.error('Map is not loaded or available.');
            return;
        }

        // Remove the previous marker if it exists
        if (marker) {
            marker.setMap(null);
        }

        const newMarker = new window.google.maps.Marker({
            position: location,
            map: map,
            title: place.name,
            draggable: true,
        });

        setMarker(newMarker);
        map.panTo(location); // Center the map to the selected location
        map.setZoom(15); // Zoom in on the selected location

        // Check if the location is within the selected city and state
        if (state && city) {
            checkLocationWithinBounds(location, state, city);
        }
    } else {
        console.error('No geometry or location available for the selected place.');
    }
};


  const checkLocationWithinBounds = (location, selectedState, selectedCity) => {
    if (!geocoder.current) {
      console.error('Geocoder is not initialized.');
      return;
    }

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
          setMessage('The selected location is within the selected city and state.');
        } else {
          setMessage('The selected location is not within the selected city and state.');
        }
      } else {
        console.error('Geocoder failed due to: ', status);
      }
    });
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          map.setCenter(pos);
          map.setZoom(15);

          if (marker) {
            marker.setMap(null);
          }

          const newMarker = new window.google.maps.Marker({
            position: pos,
            map: map,
            title: 'Current Location',
            draggable: true,
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

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
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
      <button onClick={handleCurrentLocation}>Pan to Current Location</button>
      <div>
        <label>Select State: </label>
        <select
          onChange={(e) => {
            setState(e.target.value);
            setUpdatedState(e.target.value);
          }}
          value={state || ''}
        >
          <option value="">Select State</option>
          {states.map((state, index) => (
            <option key={index} value={state}>
              {state}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Select City: </label>
        <select
          onChange={(e) => setCity(e.target.value)}
          value={city || ''}
        >
          <option value="">Select City</option>
          {cities.map((city, index) => (
            <option key={index} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      <p>{message}</p>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
        onLoad={onLoad}
        onUnmount={onUnmount}
      />
    </div>
  );
}

export default Maps;




// import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';

/*const [searchQuery, setSearchQuery] = useState('');
    const [marker, setMarker] = useState(null);
    const [message, setMessage] = useState('');
    const [location, setLocation] = useState(null);
    const autocompleteRef = useRef(null);
    const geocoder = useRef(null);
    const [map, setMap] = useState(null);*/

/*
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: 'AIzaSyCf2dvOxtwdeaKhKv6pIfOt44XcOBifT3A',
        libraries: libraries,
    });*/


/*
    // Handle map load and set initial position
    const onMapLoad = useCallback((mapInstance) => {
        console.log("Map loaded:", mapInstance);
        setMap(mapInstance);
    }, []);

    // Handle map unmount
    const onMapUnmount = useCallback(() => {
        setMap(null);
    }, []);

    // Update the map with location
    const updateMapWithLocation = (location) => {
        if (!map) return;

        const latLng = new window.google.maps.LatLng(location.coordinates[1], location.coordinates[0]);

        if (marker) {
            marker.setMap(null);
        }

        const newMarker = new window.google.maps.Marker({
            position: latLng,
            map,
            title: 'Issue Location',
            draggable: true,
        });

        setMarker(newMarker);

        map.panTo(latLng);
        map.setZoom(16);
    };

    // Handle view location on map button click
    const handleViewOnMap = (location) => {
        setSelectedLocation(location);
        updateMapWithLocation(location);
    };
    
    const defaultCenter = { lat: 28.6139, lng: 77.2090 }; // New Delhi*/

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

    {/* <button
                            onClick={() => handleViewOnMap(issue.location)}
                            className="view-on-map-button"
                        >
                            View on Map
                        </button> */}