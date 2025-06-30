import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton
} from '@mui/material';
import {
  DevicesOther as DeviceIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

interface DeviceCardProps {
  device: {
    id: string;
    name: string;
    device_type: string;
    status?: string;
    power_consumption_watts?: number;
    brand?: string;
    model?: string;
  };
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

// Status chip colors
const statusColors: { [key: string]: 'success' | 'error' | 'warning' } = {
  active: 'success',
  inactive: 'error',
  maintenance: 'warning'
};

const DeviceCard: React.FC<DeviceCardProps> = ({ device, onEdit, onDelete }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/devices/${device.id}`);
  };

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        cursor: 'pointer',
        '&:hover': {
          boxShadow: 6
        }
      }}
      onClick={handleClick}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" component="div">
            {device.name}
          </Typography>
          <Chip 
            label={t(`devices.${device.status || 'active'}`)} 
            color={(statusColors[device.status || 'active'] as 'success' | 'error' | 'warning')} 
            size="small" 
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <DeviceIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="body2" color="text.secondary">
            {t(`deviceTypes.${device.device_type}`)}
          </Typography>
        </Box>
        {device.brand && (
          <Typography variant="body2" color="text.secondary">
            <strong>{t('devices.brand')}:</strong> {device.brand}
          </Typography>
        )}
        {device.model && (
          <Typography variant="body2" color="text.secondary">
            <strong>{t('devices.model')}:</strong> {device.model}
          </Typography>
        )}
        {device.power_consumption_watts && (
          <Typography variant="body2" color="text.secondary">
            <strong>{t('devices.powerConsumption')}:</strong> {device.power_consumption_watts} W
          </Typography>
        )}
      </CardContent>
      {(onEdit || onDelete) && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }} onClick={e => e.stopPropagation()}>
          {onEdit && (
            <IconButton size="small" onClick={() => onEdit(device.id)}>
              <EditIcon fontSize="small" />
            </IconButton>
          )}
          {onDelete && (
            <IconButton size="small" onClick={() => onDelete(device.id)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      )}
    </Card>
  );
};

export default DeviceCard; 