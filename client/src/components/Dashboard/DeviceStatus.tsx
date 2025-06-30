import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  Typography,
  Divider
} from '@mui/material';
import {
  DevicesOther as DeviceIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';

// Backend'den gelen cihaz verileriyle uyumlu interface
interface DeviceStatusProps {
  devices: Array<{
    id: string;
    name?: string;
    device_type?: string;
    brand?: string;
    model?: string;
    power_consumption_watts?: number;
    usage_frequency_hours_per_day?: number;
    energy_efficiency_class?: string;
    purchase_date?: string;
    // Eski interface alanları için geriye dönük uyumluluk
    status?: string;
    consumption?: number;
    location?: string;
  }>;
}

const DeviceStatus: React.FC<DeviceStatusProps> = ({ devices }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // Cihaz durumunu kontrol et (backend'den gelmiyorsa varsayılan olarak active kullan)
  const getDeviceStatus = (device: any) => {
    if (device.status) return device.status;
    return 'active'; // Varsayılan olarak aktif kabul et
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      default:
        return 'warning';
    }
  };
  
  // Günlük tüketimi hesapla (kWh)
  const calculateConsumption = (device: any) => {
    // Eğer doğrudan consumption değeri varsa onu kullan
    if (device.consumption !== undefined) return device.consumption;
    
    // Yoksa, güç tüketimi ve günlük kullanım saati varsa hesapla
    if (device.power_consumption_watts && device.usage_frequency_hours_per_day) {
      // Günlük kWh = (Watt / 1000) * saat
      return ((device.power_consumption_watts / 1000) * device.usage_frequency_hours_per_day).toFixed(2);
    }
    
    return 0; // Tüketim verisi yoksa 0 göster
  };
  
  // Cihaz konumunu belirle (varsa location kullan, yoksa cihaz tipini kullan)
  const getDeviceLocation = (device: any) => {
    if (device.location) return device.location;
    if (device.device_type) return t(`deviceTypes.${device.device_type}`);
    return t('deviceTypes.other');
  };
  
  const handleViewAllDevices = () => {
    navigate('/devices');
  };
  
  const handleViewDevice = (id: string) => {
    navigate(`/devices/${id}`);
  };
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {devices.length === 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Typography variant="body1" color="text.secondary" align="center">
            {t('dashboard.noDevices')}
          </Typography>
          <Button 
            variant="outlined" 
            onClick={handleViewAllDevices}
            sx={{ mt: 2 }}
          >
            {t('dashboard.addDevice')}
          </Button>
        </Box>
      ) : (
        <>
          <List sx={{ flexGrow: 1, overflow: 'auto' }}>
            {devices.map((device) => (
              <React.Fragment key={device.id}>
                <ListItem 
                  onClick={() => handleViewDevice(device.id)}
                  sx={{ py: 1.5, cursor: 'pointer' }}
                >
                  <ListItemIcon>
                    <DeviceIcon color={getDeviceStatus(device) === 'active' ? 'success' : 'action'} />
                  </ListItemIcon>
                  <ListItemText
                    primary={device.name}
                    secondary={
                      <Box component="div" sx={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                          {getDeviceLocation(device)}
                        </span>
                        {getDeviceStatus(device) === 'active' && (
                          <span style={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                            {calculateConsumption(device)} kWh
                          </span>
                        )}
                      </Box>
                    }
                  />
                  <Chip 
                    label={t(`dashboard.${getDeviceStatus(device)}`)} 
                    color={getStatusColor(getDeviceStatus(device)) as 'success' | 'error' | 'warning'} 
                    size="small" 
                    variant="outlined"
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
            <Button
              endIcon={<ArrowForwardIcon />}
              onClick={handleViewAllDevices}
              size="small"
            >
              {t('dashboard.viewAllDevices')}
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default DeviceStatus; 