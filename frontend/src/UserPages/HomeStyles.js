const HeroContainer = styled(Box)({
    position: 'relative',
    height: '100vh',
    backgroundImage: 'url("https://source.unsplash.com/1600x900/?city,urban")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  });
  
  const Overlay = styled(Box)({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1,
  });
  
  const HeroContent = styled(Box)({
    zIndex: 2,
    textAlign: 'center',
  });
  
  const FeatureCard = styled(Box)(({ image }) => ({
    position: 'relative',
    height: 300,
    backgroundImage: `url(${image})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    borderRadius: 8,
    overflow: 'hidden',
    cursor: 'pointer',
    '&:hover .overlay': {
      transform: 'translateY(0%)',
    },
  }));
  
  const FeatureOverlay = styled(Box)({
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 105, 92, 0.9)',
    color: '#fff',
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    transform: 'translateY(100%)',
    transition: 'transform 0.4s ease-in-out',
  });
  