// viewIssuesStyles.js
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  topSection: {
    position: 'fixed',
    top: 64,
    left: 200,
    right: 0,
    zIndex: 10,
    backgroundColor: '#fff',
    padding: '16px 24px',
    boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
    borderBottom: '1px solid #e0e0e0',
    transition: 'height 0.3s ease',
  }, 
  searchBar: {
    padding: '6px 12px',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[1],
    marginBottom: theme.spacing(2),
  },
  input: {
    flex: 1,
    paddingLeft: theme.spacing(1),
  },
  actionButtons: {
    display: 'flex',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
    flexWrap: 'wrap',
  },
  sectionBox: {
    backgroundColor: '#f5f5f5',
    border: '1px solid #ccc',
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  selectControl: {
    minWidth: 200,
    backgroundColor: '#fff',
    borderRadius: 4,
    '& .MuiInputBase-root': {
      padding: '4px 8px',
    },
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    fontSize: 14,
  },
  mapContainer: {
    height: '300px',
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
    boxShadow: theme.shadows[1],
    margin: theme.spacing(2, 0),
  },
  checkboxLabel: {
    fontSize: '0.95rem',
    color: '#333',
    marginLeft: 4,
    display: 'flex',
    alignItems: 'center',
    fontWeight: 500,
  },
  
  checkbox: {
    color: '#1976d2', // MUI primary by default
    '&.Mui-checked': {
      color: '#1565c0', // Darker blue when checked
    },
    padding: '4px',
    marginRight: 8,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: 'rgba(25, 118, 210, 0.08)',
      borderRadius: 4,
    },
  },
  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  issueCard: {
    marginBottom: theme.spacing(3),
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: '#fff',
    boxShadow: theme.shadows[2],
    width: 800,
    marginLeft: 'auto',
    marginRight: 'auto', // OR just margin: '0 auto'
  },
  titleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(1.5),
  },
  dateBox: {
    color: theme.palette.text.secondary,
    fontSize: '0.95rem',
  },
  issueDate: {
    fontSize: '0.95rem',
    fontWeight: 500,
  },

  statusBox: {
    marginBottom: theme.spacing(2),
  },

  addressRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'nowrap', // ⛔ prevent wrapping
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(2),
  },
  
  address: {
    fontSize: '0.8rem',
    fontWeight: 500,
    color: '#444',
    wordBreak: 'break-word', // ✅ allow wrapping
    maxWidth: '100%', // ensure text doesn't overflow
  },
  
  viewOnMapButton: {
    fontWeight: 600,
    textTransform: 'none',
    borderRadius: theme.shape.borderRadius,
    // No need to change other styles here since we already handled the padding and color in sx
  },
  
  ////////////////////////////////////////////////////////////////////////////////////////////////
  descriptionSection: {
    marginTop: theme.spacing(2),
  },
  
  descriptionTitle: {
    fontWeight: 600,
    marginBottom: theme.spacing(1),
    color: theme.palette.primary.main,
  },
  
  descriptionItem: {
    display: 'flex',
    alignItems: 'flex-start',
    padding: theme.spacing(1, 0),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  
  fadedComment: {
    opacity: 0.5,
    pointerEvents: 'none',
    transition: 'opacity 0.3s ease',
  },
  
  commentContent: {
    marginLeft: theme.spacing(1.5),
    flex: 1,
  },
  
  commentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(0.5),
  },
  
  commentName: {
    fontWeight: 500,
  },
  
  commentDate: {
    color: theme.palette.text.secondary,
  },
  
  commentText: {
    backgroundColor: theme.palette.grey[100],
    padding: theme.spacing(1),
    borderRadius: 6,
  },
  
  viewMoreBtn: {
    marginTop: theme.spacing(1),
    textTransform: 'none',
    fontWeight: 500,
    color: theme.palette.primary.main,
    '&:hover': {
      textDecoration: 'underline',
    },
  },  
  avatar: {
    backgroundColor: '#1976d2', // Replace with your preferred theme color
    color: '#fff',
    fontWeight: 600,
    marginRight: 12,
    width: 40,
    height: 40,
    fontSize: '1rem',
    textTransform: 'uppercase',
  },
  
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(0.5),
  },
  commentName: {
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
  commentDate: {
    fontSize: '0.8rem',
    color: theme.palette.text.secondary,
  },
  commentText: {
    backgroundColor: theme.palette.grey[100],
    padding: theme.spacing(1.2),
    borderRadius: theme.shape.borderRadius,
    color: theme.palette.text.primary,
    fontSize: '0.95rem',
    lineHeight: 1.5,
  },

  // ===== Media Section =====
  mediaSection: {
    marginTop: theme.spacing(3),
  },
  mediaTitle: {
    fontWeight: 600,
    fontSize: '1.1rem',
    marginBottom: theme.spacing(1.5),
    color: theme.palette.primary.main,
  },
  mediaGallery: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1.5),
  },
  mediaThumbnail: {
    width: 120,
    height: 90,
    objectFit: 'cover',
    borderRadius: theme.shape.borderRadius,
    cursor: 'pointer',
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
      transform: 'scale(1.05)',
      boxShadow: theme.shadows[3],
    },
  },

  // ===== Media Modal =====
  mediaModal: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  mediaModalContent: {
    position: 'relative',
    maxWidth: '90%',
    maxHeight: '90%',
    backgroundColor: '#fff',
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
    padding: theme.spacing(2),
    boxShadow: theme.shadows[5],
  },
  mediaModalImage: {
    maxWidth: '100%',
    maxHeight: '80vh',
    borderRadius: theme.shape.borderRadius,
  },
  mediaModalVideo: {
    maxWidth: '100%',
    maxHeight: '80vh',
    borderRadius: theme.shape.borderRadius,
  },
  mediaModalCloseButton: {
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
    color: theme.palette.grey[700],
    backgroundColor: '#fff',
    zIndex: 10,
    boxShadow: theme.shadows[2],
    '&:hover': {
      backgroundColor: theme.palette.grey[200],
    },
  },
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
  voteSection: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    flexWrap: 'wrap',
    marginTop: theme.spacing(1.5),
  },
  voteInfo: {
    fontWeight: 500,
    color: '#555',
    marginRight: theme.spacing(2),
  },
  voteCount: {
    fontSize: '1rem',
    fontWeight: 500,
    color: '#333',
    margin: `0 ${theme.spacing(1)}px`,
  },
  upvoteActive: {
    backgroundColor: '#1976d2 !important',
    color: '#fff !important',
    '&:hover': {
      backgroundColor: '#1565c0 !important',
    },
  },
  upvoteInactive: {
    backgroundColor: '#bbdefb !important',
    color: '#fff !important',
    '&:hover': {
      backgroundColor: '#90caf9 !important',
    },
  },
  downvoteActive: {
    backgroundColor: '#f44336 !important',
    color: '#fff !important',
    '&:hover': {
      backgroundColor: '#d32f2f !important',
    },
  },
  downvoteInactive: {
    backgroundColor: '#ffcdd2 !important',
    color: '#fff !important',
    '&:hover': {
      backgroundColor: '#ef9a9a !important',
    },
  },
  ///////////////////////////////////////////////////////////////////////////////////////
  sectionTitle: {
    fontWeight: 600,
    fontSize: '1.05rem',
    marginBottom: '0.75rem',
    color: '#1976d2', // Blue color for Managing Authorities
    marginTop: '2rem', // Increased space above the title
    // Adding a higher priority to margin
    paddingTop: '1rem', // Add some internal padding if needed
  },
  
  authorityList: {
    marginBottom: '1.5rem', // Space below the list
  },
  
  authorityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    paddingLeft: 0,
    paddingRight: 0,
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: '#f9f9f9',
    },
    '&:not(:last-child)': {
      borderBottom: '1px solid #f0f0f0',
    },
  },
  
  authorityIcon: {
    color: '#1976d2', // Lighter theme blue
    minWidth: '32px',
  },
  
  authorityText: {
    fontSize: '0.95rem',
    color: '#333',
    wordBreak: 'break-word', // Allow wrapping for text
    maxWidth: '100%', // Ensure the text doesn't overflow
  },
  /////////////////////////////////////////////////////////////////////////
  openBtn: {
    marginTop: theme.spacing(1),
  },
  dialogTitle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: theme.spacing(2),
  },
  closeBtn: {
    color: theme.palette.grey[500],
  },
  dialogContent: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(2),
  },
  commentItem: {
    alignItems: 'flex-start',
    marginBottom: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  inputSection: {
    marginTop: theme.spacing(2),
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'center',
  },
  submitBtn: {
    whiteSpace: 'nowrap',
    paddingInline: theme.spacing(2),
    height: '40px',
  },
  ///////////////////////////////////////////////////////////////////
  openBtn: {
    marginTop: theme.spacing(1),
  },
  dialogTitle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: theme.spacing(2),
  },
  closeBtn: {
    color: theme.palette.grey[500],
  },
  dialogContent: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(2),
  },
  commentItem: {
    alignItems: 'flex-start',
    marginBottom: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  //////////////////////////////////////////////////////////////////////////////
  openBtn: {
    textTransform: 'none',
    fontWeight: 500,
  },
  
  closeBtn: {
    position: 'absolute',
    right: 8,
    top: 8,
    color: '#777',
  },
  
  dialogContent: {
    paddingTop: 8,
  },
  
  commentItem: {
    padding: '6px 0',
  },
  
  inputSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: 16,
  },
  
  submitBtn: {
    whiteSpace: 'nowrap',
    height: '40px',
  },
    
  
}));

export default useStyles;
