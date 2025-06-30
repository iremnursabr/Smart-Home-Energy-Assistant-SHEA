import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchUserProfile } from '../store/slices/authSlice';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  
  useEffect(() => {
    // If not authenticated, try to get user profile (session check)
    if (!isAuthenticated && !isLoading) {
      dispatch(fetchUserProfile());
    }
  }, [isAuthenticated, isLoading, dispatch]);
  
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!isAuthenticated) {
    // Redirect to login page
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If authenticated, render the child routes
  return <Outlet />;
};

export default ProtectedRoute; 