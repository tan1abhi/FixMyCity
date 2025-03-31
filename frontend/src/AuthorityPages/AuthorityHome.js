import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Box, Button, Container, Typography, Grid } from "@mui/material";
import { styled } from "@mui/system";
import "react-toastify/dist/ReactToastify.css";
import authorityViewImg from "../images/view_issues.jpg";
import authorityManageImg from "../images/manage_issues.jpg";

// More sophisticated animations using framer-motion
import { motion } from "framer-motion";

// Feature Card with improved styling
const FeatureCard = styled(motion.div)(({ theme }) => ({
  position: "relative",
  overflow: "hidden",
  borderRadius: "16px",
  cursor: "pointer",
  height: "320px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  transition: "all 0.4s ease",
  "&:hover": {
    boxShadow: "0 15px 40px rgba(0,0,0,0.2)",
    transform: "translateY(-10px)",
  },
  "& img": {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.6s ease",
  },
  "&:hover img": {
    transform: "scale(1.05)",
  },
  "& .overlay": {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 60%)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    padding: "25px",
    opacity: 0.9,
    transition: "all 0.4s ease",
  },
  "&:hover .overlay": {
    background: "linear-gradient(to top, rgba(0, 65, 105, 0.9) 0%, rgba(6, 80, 130, 0.7) 100%)",
  },
  "& .overlayText": {
    color: "white",
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "10px",
    transform: "translateY(20px)",
    opacity: 0.8,
    transition: "all 0.4s ease",
  },
  "& .overlayDesc": {
    color: "white",
    fontSize: "16px",
    maxHeight: "0",
    overflow: "hidden",
    opacity: 0,
    transition: "all 0.4s ease",
  },
  "&:hover .overlayText": {
    transform: "translateY(0)",
    opacity: 1,
  },
  "&:hover .overlayDesc": {
    maxHeight: "100px",
    opacity: 1,
    marginTop: "10px",
  },
}));

// Parallax background effect for hero section
const ParallaxBackground = styled(Box)({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='rgba(255,255,255,.05)' fill-rule='evenodd'/%3E%3C/svg%3E")`,
  backgroundSize: "cover",
  opacity: 0.7,
});

// Custom button with better styling
const CustomButton = styled(Button)({
  background: "linear-gradient(45deg, #FF5252 30%, #FF8A80 90%)",
  border: 0,
  borderRadius: "30px",
  boxShadow: "0 3px 15px 2px rgba(255, 105, 135, .3)",
  color: "white",
  padding: "12px 30px",
  fontWeight: "bold",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-3px)",
    boxShadow: "0 6px 20px 2px rgba(255, 105, 135, .4)",
  },
});

// Floating chat button with pulse animation
const FloatingButton = styled(Button)({
  position: "fixed",
  bottom: "20px",
  right: "20px",
  borderRadius: "50%",
  width: "60px",
  height: "60px",
  fontSize: "24px",
  zIndex: 1500,
  boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
  background: "linear-gradient(45deg, #ffb300 30%, #ffd54f 90%)",
  color: "white",
  "&:hover": {
    background: "linear-gradient(45deg, #ffa000 30%, #ffca28 90%)",
  },
  "@keyframes pulse": {
    "0%": {
      boxShadow: "0 0 0 0 rgba(255, 179, 0, 0.7)",
    },
    "70%": {
      boxShadow: "0 0 0 15px rgba(255, 179, 0, 0)",
    },
    "100%": {
      boxShadow: "0 0 0 0 rgba(255, 179, 0, 0)",
    },
  },
  animation: "pulse 2s infinite",
});

function AuthorityHome() {
  const [showChatbot, setShowChatbot] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const featureSectionRef = useRef(null);


  // Toast based on location state
  useEffect(() => {
    const toastData = location.state?.toast;
    if (toastData) {
      if (toastData.type === "success") toast.success(toastData.message);
      else if (toastData.type === "error") toast.error(toastData.message);
      else toast.info(toastData.message);
    }
  }, [location.state]);

  const handleScroll = () => {
    featureSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const features = [
    {
      title: "Browse Issues",
      description:
        "Browse all public issues reported in your registered locality.",
      img: authorityViewImg,
      link: "/report-issue",
    },
    {
      title: "My Issues",
      description:
        "Access and manage the issues currently under you control.",
      img: authorityManageImg,
      link: "/view-issues",
    },
  ];

  // Animation variants for framer-motion
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.6,
        ease: "easeOut",
      },
    }),
  };

  return (
    <div>
      {/* Hero Section with Parallax */}
      <Box
        sx={{
          height: "100vh",
          background: "linear-gradient(135deg,rgb(127, 45, 168), #2196F3)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          textAlign: "center",
          px: 2,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <ParallaxBackground />

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: false, amount: 0.5 }} // 👈 enables re-animation when re-entering
        >
          <Typography
            variant="h2"
            fontWeight="bold"
            sx={{
              textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
              background: "linear-gradient(45deg, #fff, #fff)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Welcome, Authority
          </Typography>

          <Typography
            variant="h6"
            sx={{
              mt: 2,
              maxWidth: "700px",
              margin: "20px auto",
              opacity: 0.9,
            }}
          >
            Manage and monitor civic issues in your locality efficiently.
          </Typography>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            viewport={{ once: false, amount: 0.5 }} // 👈 same here
          >
            <CustomButton onClick={handleScroll}>
              Go To Dashboard
            </CustomButton>
          </motion.div>
        </motion.div>
      </Box>


      {/* Features Section with Improved Cards */}
      <Container sx={{ my: 8 }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          variants={fadeInUp}
          custom={0}
        >
          <Typography
            variant="h4"
            fontWeight="bold"
            textAlign="center"
            mb={6}
            sx={{
              background: "linear-gradient(45deg, #512DA8, #2196F3)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Your Dashboard
          </Typography>
          
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 4,
            }}
          >
            {features.map((item, index) => (
              <motion.div
                key={index}
                custom={index}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.2 }}
                style={{ flex: 1 }}
              >
                <FeatureCard onClick={() => navigate(item.link)}>
                  <img src={item.img} alt={item.title} />
                  <Box className="overlay">
                    <Typography className="overlayText">
                      {item.icon} {item.title}
                    </Typography>
                    <Typography className="overlayDesc">
                      {item.description}
                    </Typography>
                  </Box>
                </FeatureCard>
              </motion.div>
            ))}
          </Box>
        </motion.div>
      </Container>

      {/* Chatbot Button with Animation */}
      <FloatingButton
        onClick={() => setShowChatbot((prev) => !prev)}
      >
        💬
      </FloatingButton>

      {/* Chatbot Panel with Animation */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.8 }}
        animate={showChatbot ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 20, scale: 0.8 }}
        transition={{ duration: 0.3 }}
        style={{
          position: "fixed",
          bottom: "90px",
          right: "20px",
          width: "350px",
          height: "495px",
          display: showChatbot ? "block" : "none",
          zIndex: 1400,
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
            backgroundColor: "white",
            boxShadow: "0px 5px 25px rgba(0, 0, 0, 0.2)",
            borderRadius: "16px",
            overflow: "hidden",
          }}
        >
          <iframe
            src="http://127.0.0.1:8000/gradio/"
            title="Gemini Chatbot"
            frameBorder="0"
            style={{ width: "100%", height: "100%" }}
          />
        </Box>
      </motion.div>
    </div>
  );
}

export default AuthorityHome;