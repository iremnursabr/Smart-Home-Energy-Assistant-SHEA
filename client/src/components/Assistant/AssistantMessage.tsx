import React from 'react';
import { Box, Typography, Skeleton, useTheme } from '@mui/material';
import { BoltOutlined as EnergyIcon } from '@mui/icons-material';

interface AssistantMessageProps {
  message: string;
  isLoading?: boolean;
  isError?: boolean;
}

const AssistantMessage: React.FC<AssistantMessageProps> = ({ 
  message, 
  isLoading = false,
  isError = false 
}) => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        mb: 2
      }}
    >
      {/* Assistant Avatar */}
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.palette.primary.light,
          mr: 1.5,
          color: theme.palette.primary.contrastText
        }}
      >
        <EnergyIcon />
      </Box>
      
      {/* Message Box */}
      <Box
        sx={{
          maxWidth: 'calc(80% - 50px)',
          backgroundColor: theme.palette.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.05)' 
            : 'rgba(0, 0, 0, 0.03)',
          borderRadius: '14px 14px 14px 0',
          py: 1.5,
          px: 2,
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          border: '1px solid',
          borderColor: theme.palette.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(0, 0, 0, 0.05)'
        }}
      >
        {isLoading ? (
          <Box sx={{ width: '100%' }}>
            <Skeleton animation="wave" height={20} width="80%" />
            <Skeleton animation="wave" height={20} width="90%" />
            <Skeleton animation="wave" height={20} width="60%" />
          </Box>
        ) : (
          <Typography 
            variant="body1"
            color={isError ? 'error' : 'inherit'}
            sx={{
              whiteSpace: 'pre-wrap'
            }}
          >
            {message}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default AssistantMessage; 