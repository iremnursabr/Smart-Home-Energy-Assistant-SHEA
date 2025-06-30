import React from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material';

interface BreadcrumbItem {
  text: string;
  link?: string;
}

interface DashboardHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  description,
  icon,
  breadcrumbs = [],
  actions
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        mb: 3,
        p: 2,
        backgroundColor: 'background.paper',
        borderRadius: 1,
        boxShadow: 1
      }}
    >
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: description ? 1 : 0 }}>
          {icon && <Box sx={{ color: 'primary.main' }}>{icon}</Box>}
          <Typography variant="h5" component="h1" fontWeight="bold">
            {t(title)}
          </Typography>
        </Box>
        {description && (
          <Typography variant="body2" color="text.secondary">
            {t(description)}
          </Typography>
        )}
      </Box>
      
      <Box sx={{ display: 'flex', gap: 1, mt: isMobile ? 2 : 0 }}>
        {actions}
      </Box>
    </Box>
  );
};

export default DashboardHeader; 