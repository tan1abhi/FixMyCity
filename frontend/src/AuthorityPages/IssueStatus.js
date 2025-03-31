import React, { useState } from 'react';
import { Box, Chip, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const IssueStatus = ({ issue, handleStatusChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempStatus, setTempStatus] = useState(issue.status);

  const handleToggleEdit = () => {
    setIsEditing((prev) => !prev);
    if (isEditing) {
      setTempStatus(issue.status); // Reset to original status if canceling edit
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setTempStatus(issue.status); // Reset to original status when canceled
  };

  const handleSave = () => {
    handleStatusChange(issue.id, tempStatus); // Apply the status change
    setIsEditing(false);
  };

  return (
    <Box sx={{ marginBottom: 2, display: 'flex', alignItems: 'center' }}>
      {/* Status View (Chip) */}
      {!isEditing ? (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {issue.status === 'Pending' && (
            <Chip
              icon={<PendingActionsIcon />}
              label="Pending"
              color="warning"
              onClick={handleToggleEdit} // Allow editing when clicked
              sx={{ cursor: 'pointer', marginRight: 1 }}
            />
          )}
          {issue.status === 'In-Progress' && (
            <Chip
              icon={<BuildCircleIcon />}
              label="In-Progress"
              color="info"
              onClick={handleToggleEdit} // Allow editing when clicked
              sx={{ cursor: 'pointer', marginRight: 1 }}
            />
          )}
          {issue.status === 'Resolved' && (
            <Chip
              icon={<CheckCircleIcon />}
              label="Resolved"
              color="success"
              onClick={handleToggleEdit} // Allow editing when clicked
              sx={{ cursor: 'pointer', marginRight: 1 }}
            />
          )}

          {/* Edit Button (next to the status) */}
          <Button
            variant="outlined"
            color="primary"
            onClick={handleToggleEdit}
            sx={{
              fontSize: '0.7rem',
              backgroundColor: '#bf571b',
              color: 'white',
              borderColor: '#bf571b',
              padding: '4px 8px',
              marginLeft: 1,
              '&:hover': {
                backgroundColor: '#d97e4a',
                color: '#fff',
              },
              '&:focus': {
                outline: 'none',
                boxShadow: '0 0 5px rgba(235, 149, 57, 0.6)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {isEditing ? 'Cancel' : 'Edit Status'}
          </Button>
        </Box>
      ) : (
        // Status Edit (Dropdown)
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl fullWidth>
            <InputLabel id={`status-label-${issue.id}`}>Update Status</InputLabel>
            <Select
              labelId={`status-label-${issue.id}`}
              value={tempStatus}
              onChange={(e) => setTempStatus(e.target.value)} // Change status in edit mode
              label="Update Status"
            >
              <MenuItem value="Pending" disabled={issue.status !== 'Pending'}>
                Pending
              </MenuItem>
              <MenuItem value="In-Progress" disabled={issue.status !== 'Pending' && issue.status !== 'In-Progress'}>
                In-Progress
              </MenuItem>
              <MenuItem value="Resolved" disabled={issue.status !== 'In-Progress'}>
                Resolved
              </MenuItem>
            </Select>
          </FormControl>
          {/* Cancel and Save Buttons */}
          <Button
            variant="outlined"
            onClick={handleCancelEdit} // Cancel edit
            sx={{ fontSize: '0.7rem', backgroundColor: '#ff5733', color: 'white', padding: '4px 8px' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave} // Save the edited status
            sx={{ fontSize: '0.7rem', backgroundColor: '#1976d2', color: 'white', padding: '4px 8px' }}
          >
            Save
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default IssueStatus;
