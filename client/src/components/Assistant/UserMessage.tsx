import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

interface UserMessageProps {
  message: string;
}

const UserMessage: React.FC<UserMessageProps> = ({ message }) => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        mb: 2
      }}
    >
      <Box
        sx={{
          maxWidth: '80%',
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          borderRadius: '14px 14px 0 14px',
          py: 1.5,
          px: 2,
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
        }}
      >
        <Typography variant="body1">
          {message}
        </Typography>
      </Box>
    </Box>
  );
};

export default UserMessage; 