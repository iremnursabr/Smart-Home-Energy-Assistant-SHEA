const { Device, User, EnergyConsumption } = require('../models');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

/**
 * Get all devices for a user
 * @route GET /api/devices
 */
const getAllDevices = async (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    let devices;
    if (isAdmin && req.query.userId) {
      // Admin can get devices for any user
      devices = await Device.findAll({
        where: { user_id: req.query.userId },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'email', 'first_name', 'last_name']
          }
        ]
      });
    } else {
      // Regular users can only get their own devices
      devices = await Device.findAll({
        where: { user_id: userId }
      });
    }

    // Frontend için gerekli özel alanları düzenliyoruz
    const formattedDevices = devices.map(device => {
      const plainDevice = device.get({ plain: true });
      
      // usage_hours_per_day alanını ekleyelim - sanal alanı kullanmıyoruz çünkü serialize edilmiyor
      plainDevice.usage_hours_per_day = device.usage_frequency_hours_per_day;
      
      // usage_days_per_week artık veritabanında saklanıyor, eklemeye gerek yok
      
      return plainDevice;
    });

    return res.status(200).json({
      status: 'success',
      data: {
        devices: formattedDevices
      }
    });
  } catch (error) {
    console.error('Get all devices error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error getting devices',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get device by ID
 * @route GET /api/devices/:id
 */
const getDeviceById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const device = await Device.findByPk(id);

    if (!device) {
      return res.status(404).json({
        status: 'error',
        message: 'Device not found'
      });
    }

    // Check if user is authorized to access this device
    if (!isAdmin && device.user_id !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized access to this device'
      });
    }

    // Frontend için gerekli özel alanları düzenliyoruz
    const formattedDevice = device.get({ plain: true });
    
    // usage_hours_per_day alanını ekleyelim
    formattedDevice.usage_hours_per_day = device.usage_frequency_hours_per_day;
    
    // usage_days_per_week artık veritabanında saklanıyor, eklemeye gerek yok

    return res.status(200).json({
      status: 'success',
      data: {
        device: formattedDevice
      }
    });
  } catch (error) {
    console.error('Get device by ID error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error getting device',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create a new device
 * @route POST /api/devices
 */
const createDevice = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      device_type,
      brand,
      model,
      location,
      energy_efficiency_class,
      power_consumption_watts,
      usage_hours_per_day,
      usage_days_per_week,
      purchase_date,
      usage_start_date,
      usage_end_date,
      usage_start_time,
      usage_end_time
    } = req.body;

    // Validate required fields
    if (!name || !device_type) {
      return res.status(400).json({
        status: 'error',
        message: 'Name and device type are required'
      });
    }

    // Create device
    const device = await Device.create({
      user_id: userId,
      name,
      device_type,
      brand,
      model,
      location,
      energy_efficiency_class,
      power_consumption_watts,
      usage_frequency_hours_per_day: usage_hours_per_day,
      usage_days_per_week,
      purchase_date,
      usage_start_date,
      usage_end_date,
      usage_start_time,
      usage_end_time
    });

    // Eğer cihaz kullanım zamanları ve güç tüketim verileri varsa,
    // energy_consumption tablosuna tüketim verilerini ekle
    if (
      power_consumption_watts && 
      usage_hours_per_day &&
      usage_start_date
    ) {
      try {
        // Bitiş tarihi yoksa şu anki tarihi kullan
        const endDate = usage_end_date || new Date().toISOString().split('T')[0];
        
        // Tarihleri Date nesnesine dönüştür
        const startDateObj = new Date(usage_start_date);
        const endDateObj = new Date(endDate);
        
        // Tarih aralığının her günü için veri oluştur
        const consumptionEntries = [];
        
        // Başlangıç tarihinden bitiş tarihine kadar dön
        const currentDate = new Date(startDateObj);
        while (currentDate <= endDateObj) {
          // Günlük tüketim miktarını hesapla: kWh = (Watt / 1000) * saat
          const dailyConsumptionKwh = (power_consumption_watts / 1000) * usage_hours_per_day;
          
          consumptionEntries.push({
            id: uuidv4(),
            user_id: userId,
            device_id: device.id,
            consumption_kwh: dailyConsumptionKwh,
            cost: null, // Maliyet bilgisi isteğe bağlı olarak daha sonra eklenebilir
            reading_date: new Date(currentDate).toISOString().split('T')[0],
            reading_time: usage_start_time || '00:00:00',
            is_manual_entry: false,
            created_at: new Date()
          });
          
          // Sonraki güne geç
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        // Tüketim verilerini toplu olarak ekle
        if (consumptionEntries.length > 0) {
          await EnergyConsumption.bulkCreate(consumptionEntries);
        }
      } catch (consumptionError) {
        console.error('Error creating energy consumption records:', consumptionError);
        // Ana işlemi etkilememesi için hata fırlatma, sadece loglama
      }
    }

    return res.status(201).json({
      status: 'success',
      message: 'Device created successfully',
      data: {
        device
      }
    });
  } catch (error) {
    console.error('Create device error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error creating device',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update an existing device
 * @route PUT /api/devices/:id
 */
const updateDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const {
      name,
      device_type,
      brand,
      model,
      location,
      energy_efficiency_class,
      power_consumption_watts,
      usage_hours_per_day,
      usage_days_per_week,
      purchase_date,
      usage_start_date,
      usage_end_date,
      usage_start_time,
      usage_end_time,
      status
    } = req.body;

    // Check if device exists and belongs to the user
    const device = await Device.findOne({
      where: {
        id,
        user_id: userId
      }
    });

    if (!device) {
      return res.status(404).json({
        status: 'error',
        message: 'Device not found or not authorized'
      });
    }

    // Update device
    await device.update({
      name,
      device_type,
      brand,
      model,
      location,
      energy_efficiency_class,
      power_consumption_watts,
      usage_frequency_hours_per_day: usage_hours_per_day,
      usage_days_per_week,
      purchase_date,
      usage_start_date,
      usage_end_date,
      usage_start_time,
      usage_end_time,
      status
    });

    // Tüketim verilerini güncelle
    if (
      power_consumption_watts && 
      usage_hours_per_day &&
      usage_start_date
    ) {
      try {
        // Önce bu cihaza ait tüm tüketim verilerini sil
        await EnergyConsumption.destroy({
          where: { device_id: id }
        });
        
        // Bitiş tarihi yoksa şu anki tarihi kullan
        const endDate = usage_end_date || new Date().toISOString().split('T')[0];
        
        // Tarihleri Date nesnesine dönüştür
        const startDateObj = new Date(usage_start_date);
        const endDateObj = new Date(endDate);
        
        // Tarih aralığının her günü için veri oluştur
        const consumptionEntries = [];
        
        // Başlangıç tarihinden bitiş tarihine kadar dön
        const currentDate = new Date(startDateObj);
        while (currentDate <= endDateObj) {
          // Günlük tüketim miktarını hesapla: kWh = (Watt / 1000) * saat
          const dailyConsumptionKwh = (power_consumption_watts / 1000) * usage_hours_per_day;
          
          consumptionEntries.push({
            id: uuidv4(),
            user_id: userId,
            device_id: device.id,
            consumption_kwh: dailyConsumptionKwh,
            cost: null, // Maliyet bilgisi isteğe bağlı olarak daha sonra eklenebilir
            reading_date: new Date(currentDate).toISOString().split('T')[0],
            reading_time: usage_start_time || '00:00:00',
            is_manual_entry: false,
            created_at: new Date()
          });
          
          // Sonraki güne geç
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        // Tüketim verilerini toplu olarak ekle
        if (consumptionEntries.length > 0) {
          await EnergyConsumption.bulkCreate(consumptionEntries);
        }
      } catch (consumptionError) {
        console.error('Error updating energy consumption records:', consumptionError);
        // Ana işlemi etkilememesi için hata fırlatma, sadece loglama
      }
    }

    return res.status(200).json({
      status: 'success',
      message: 'Device updated successfully',
      data: {
        device: await device.reload()
      }
    });
  } catch (error) {
    console.error('Update device error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error updating device',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete a device
 * @route DELETE /api/devices/:id
 */
const deleteDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    // Find device
    const device = await Device.findByPk(id);

    if (!device) {
      return res.status(404).json({
        status: 'error',
        message: 'Device not found'
      });
    }

    // Check if user is authorized to delete this device
    if (!isAdmin && device.user_id !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized access to this device'
      });
    }

    // Delete device
    await device.destroy();

    return res.status(200).json({
      status: 'success',
      message: 'Device deleted successfully'
    });
  } catch (error) {
    console.error('Delete device error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error deleting device',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get devices by type
 * @route GET /api/devices/type/:type
 */
const getDevicesByType = async (req, res) => {
  try {
    const { type } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    let whereClause = { device_type: type };
    
    // Regular users can only get their own devices
    if (!isAdmin) {
      whereClause.user_id = userId;
    } else if (req.query.userId) {
      // Admin can get devices for any user
      whereClause.user_id = req.query.userId;
    }

    const devices = await Device.findAll({
      where: whereClause
    });

    return res.status(200).json({
      status: 'success',
      data: {
        devices
      }
    });
  } catch (error) {
    console.error('Get devices by type error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error getting devices by type',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update device usage hours and days
 * @route PATCH /api/devices/:id/usage
 */
const updateDeviceUsageHours = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { usage_hours_per_day, usage_days_per_week } = req.body;

    // Cihazın kullanıcıya ait olup olmadığını kontrol et
    const device = await Device.findOne({
      where: {
        id,
        user_id: userId
      }
    });

    if (!device) {
      return res.status(404).json({
        status: 'error',
        message: 'Cihaz bulunamadı veya cihaza erişim yetkiniz yok'
      });
    }

    // Güncelleme verilerini hazırla
    const updateData = {};
    
    if (usage_hours_per_day !== undefined) {
      updateData.usage_frequency_hours_per_day = usage_hours_per_day;
    }
    
    if (usage_days_per_week !== undefined) {
      updateData.usage_days_per_week = usage_days_per_week;
    }

    // Cihazı güncelle
    await device.update(updateData);

    // Frontend için formatlanmış veriyi döndür
    const formattedDevice = device.get({ plain: true });
    formattedDevice.usage_hours_per_day = device.usage_frequency_hours_per_day;
    // usage_days_per_week artık veritabanında saklanıyor, direkt dön

    return res.status(200).json({
      status: 'success',
      message: 'Cihaz kullanım bilgileri güncellendi',
      data: {
        device: formattedDevice
      }
    });
  } catch (error) {
    console.error('Update device usage hours error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Cihaz kullanım bilgileri güncellenirken hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllDevices,
  getDeviceById,
  createDevice,
  updateDevice,
  deleteDevice,
  getDevicesByType,
  updateDeviceUsageHours
}; 