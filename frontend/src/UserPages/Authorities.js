import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { State, City } from "country-state-city";

import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Avatar,
  Divider,
  TextField,
  MenuItem,
  InputAdornment,
  Paper,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import SearchIcon from "@mui/icons-material/Search";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1769aa" },
    secondary: { main: "#f50057" },
  },
});

const departmentList = [
  "Road & Traffic Issues",
  "Public Transport",
  "Garbage & Sanitation",
  "Water & Drainage",
  "Electricity & Power",
  "Public Safety & Crime",
  "Noise & Pollution",
  "Parks & Public Spaces",
  "Animal Control",
  "Building & Infrastructure",
  "Healthcare & Medical Issues",
  "Education & Schools",
  "Internet & Telecom Issues",
  "Flooding & Natural Disasters",
];

const Authorities = () => {
  const [authorities, setAuthorities] = useState([]);
  const [filteredAuthorities, setFilteredAuthorities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [selectedState, setSelectedState] = useState("All States");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const stateList = State.getStatesOfCountry("IN").map((s) => ({
      name: s.name,
      isoCode: s.isoCode,
    }));
    setStates([{ name: "All States", isoCode: "" }, ...stateList]);
  }, []);

  useEffect(() => {
    if (selectedState !== "All States") {
      const selected = states.find((s) => s.name === selectedState);
      if (selected) {
        const cityList = City.getCitiesOfState("IN", selected.isoCode).map((c) => ({
          name: c.name,
        }));
        setCities([{ name: "All Cities" }, ...cityList]);
      }
    } else {
      setCities([{ name: "All Cities" }]);
    }
    setSelectedCity("All Cities");
  }, [selectedState, states]);

  useEffect(() => {
    const fetchAuthorities = async () => {
      try {
        const q = query(collection(db, "users"), where("role", "==", "Authority"));
        const querySnapshot = await getDocs(q);
        const authorityList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAuthorities(authorityList);
        setFilteredAuthorities(authorityList);
      } catch (error) {
        console.error("Error fetching authorities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthorities();
  }, []);

  useEffect(() => {
    let filtered = [...authorities];

    if (searchQuery.trim()) {
      filtered = filtered.filter((a) =>
        a.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedState !== "All States") {
      filtered = filtered.filter((a) => a.state === selectedState);
    }

    if (selectedCity !== "All Cities") {
      filtered = filtered.filter((a) => a.city === selectedCity);
    }

    if (selectedDepartment !== "All Departments") {
      filtered = filtered.filter((a) => a.department === selectedDepartment);
    }

    setFilteredAuthorities(filtered);
  }, [authorities, searchQuery, selectedState, selectedCity, selectedDepartment]);

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          background: "linear-gradient(180deg, #2c387e, #1769aa)",
          minHeight: "100vh",
          paddingY: 6,
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            sx={{
              fontWeight: "bold",
              color: "#fff",
              textAlign: "center",
              marginBottom: 4,
              textShadow: "2px 2px 6px rgba(0,0,0,0.4)",
            }}
          >
            Authorities Directory
          </Typography>

          {/* Filters */}
          <Paper
            elevation={4}
            sx={{
              padding: 3,
              borderRadius: 1,
              backgroundColor: "#ffffffcc",
              marginBottom: 5,
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Search by name"
                  variant="outlined"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Filter by State"
                  variant="outlined"
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                >
                  {states.map((state) => (
                    <MenuItem key={state.name} value={state.name}>
                      {state.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Filter by City"
                  variant="outlined"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                >
                  {cities.map((city) => (
                    <MenuItem key={city.name} value={city.name}>
                      {city.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Filter by Department"
                  variant="outlined"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                >
                  <MenuItem value="All Departments">All Departments</MenuItem>
                  {departmentList.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Paper>

          {/* Authority Cards */}
          {loading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress color="primary" />
            </Box>
          ) : filteredAuthorities.length === 0 ? (
            <Typography align="center" color="white">
              No matching authorities found.
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {filteredAuthorities.map((authority) => (
                <Grid item xs={12} sm={6} md={4} key={authority.id}>
                  <Card
                    sx={{
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.08)",
                      transition: "0.3s",
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
                      },
                    }}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight="bold">
                            {authority.name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {authority.department || "No department"}
                          </Typography>
                        </Box>
                      </Box>

                      <Divider sx={{ my: 1 }} />

                      <Box mt={2}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <EmailIcon fontSize="small" sx={{ mr: 1, color: "primary.main" }} />
                          <Typography variant="body2">{authority.email}</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" mb={1}>
                          <PhoneIcon fontSize="small" sx={{ mr: 1, color: "primary.main" }} />
                          <Typography variant="body2">{authority.phone || "N/A"}</Typography>
                        </Box>
                        {authority.state && (
                          <Typography variant="body2" color="textSecondary">
                            <strong>State:</strong> {authority.state}
                          </Typography>
                        )}
                        {authority.city && (
                          <Typography variant="body2" color="textSecondary">
                            <strong>City:</strong> {authority.city}
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Authorities;
