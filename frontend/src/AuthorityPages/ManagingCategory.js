import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Container, Typography, Grid, Card, CardContent } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";

// Theme configuration
const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1769aa" },
    secondary: { main: "#f50057" }
  }
});

// const categories = [
//     { name: "Road & Traffic Issues", icon: "🚦" },
//     { name: "Public Transport", icon: "🚌" },
//     { name: "Garbage & Sanitation", icon: "🗑" },
//     { name: "Water & Drainage", icon: "💧" },
//     { name: "Electricity & Power", icon: "⚡" },
//     { name: "Public Safety & Crime", icon: "🚔" },
//     { name: "Noise & Pollution", icon: "📢" },
//     { name: "Parks & Public Spaces", icon: "🌳" },
//     { name: "Animal Control", icon: "🐶" },
//     { name: "Building & Infrastructure", icon: "🏗" },
//     { name: "Healthcare & Medical Issues", icon: "🏥" },
//     { name: "Education & Schools", icon: "🏫" },
//     { name: "Internet & Telecom Issues", icon: "📡" },
//     { name: "Flooding & Natural Disasters", icon: "🌊" },
//     { name: "Other", icon: "🔧" },
// ];

const categories = [
    { name: "Roads & Traffic", icon: "🚦" },
    { name: "Public Transport", icon: "🚌" },
    { name: "Garbage & Waste", icon: "🗑" },
    { name: "Water & Drainage", icon: "💧" },
    { name: "Electricity", icon: "⚡" },
    { name: "Safety & Crime", icon: "🚔" },
    { name: "Noise & Pollution", icon: "📢" },
    { name: "Parks & Spaces", icon: "🌳" },
    { name: "Animal Issues", icon: "🐶" },
    { name: "Construction", icon: "🏗" },
    { name: "Healthcare", icon: "🏥" },
    { name: "Education", icon: "🏫" },
    { name: "Internet & Telecom", icon: "📡" },
    { name: "Flooding & Disasters", icon: "🌊" },
    { name: "Other", icon: "🔧" },
];

const ManagingCategory = () => {
    const navigate = useNavigate();

    const handleCategoryClick = (category) => {
        navigate(`/current-managing?category=${encodeURIComponent(category)}`);
    };

    return (
        <ThemeProvider theme={theme}>
            <Box
                sx={{
                    background: "linear-gradient(180deg, #2c387e, #1769aa)",
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
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
                            fontWeight: "bold",
                            color: "#fff",
                            textAlign: "center",
                            marginBottom: 4,
                            textShadow: "2px 2px 6px rgba(0,0,0,0.4)",
                        }}
                    >
                        Select Category
                    </Typography>

                    <Grid container spacing={4} justifyContent="center">
                        {categories.map((category, index) => (
                            <Grid item xs={12} sm={6} md={3} lg={2.4} key={index}>
                                <Card
                                    sx={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.64)',
                                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                                        borderRadius: "12px",
                                        transition: "0.3s",
                                        cursor: "pointer",
                                        "&:hover": {
                                            transform: "scale(1.05)",
                                            boxShadow: "0 6px 18px rgba(0, 0, 0, 0.15)"
                                        }
                                    }}
                                    onClick={() => handleCategoryClick(category.name)}
                                >
                                    <CardContent
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            height: "180px"
                                        }}
                                    >
                                        <Typography
                                            variant="h1"
                                            sx={{ fontSize: "48px", mb: 2 }}
                                        >
                                            {category.icon}
                                        </Typography>
                                        <Typography
                                            variant="h6"
                                            fontWeight="bold"
                                            color="primary"
                                            sx={{ textAlign: "center", fontSize: "20px" }}
                                        >
                                            {category.name}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>
        </ThemeProvider>
    );
};

export default ManagingCategory;
