const { Suggestion, User, Device, EnergyConsumption, HouseholdInfo } = require('../models');
const { Op } = require('sequelize');
const { generateEnergySavingSuggestions } = require('../services/ai.service');
const { getUserContextData } = require('../services/data-integration.service');
const { addPurchaseLinkToSuggestion } = require('../utils/device-links');
const { v4: uuidv4 } = require('uuid');
const { sequelize } = require('../config/database');

// Cihaz tipine göre öneri üretme fonksiyonu
const generateSuggestionsByDeviceType = (device) => {
  const suggestions = [];
  
  switch (device.device_type) {
    case 'refrigerator':
      suggestions.push({
        title: 'Buzdolabı sıcaklık ayarı',
        description: 'Buzdolabınızın sıcaklığını 1-2 derece arttırarak enerji tasarrufu sağlayabilirsiniz.',
        potential_savings_kwh: 120,
        potential_savings_cost: 150
      });
      if (device.energy_efficiency_class && ['D', 'E', 'F', 'G'].includes(device.energy_efficiency_class)) {
        suggestions.push({
          title: 'Enerji verimli buzdolabına geçiş',
          description: `${device.energy_efficiency_class} enerji sınıfındaki buzdolabınızı A++ veya A+++ sınıfı ile değiştirerek yılda 300kWh'den fazla enerji tasarrufu yapabilirsiniz.`,
          potential_savings_kwh: 300,
          potential_savings_cost: 400
        });
      }
      break;
      
    case 'washing_machine':
      suggestions.push({
        title: 'Çamaşır makinesini tam dolu çalıştırma',
        description: 'Çamaşır makinenizi her zaman tam dolu olarak çalıştırarak su ve elektrik tasarrufu sağlayabilirsiniz.',
        potential_savings_kwh: 150,
        potential_savings_cost: 200
      });
      suggestions.push({
        title: 'Düşük sıcaklıkta yıkama',
        description: 'Çamaşırlarınızı 30-40°C gibi düşük sıcaklıklarda yıkayarak enerji tasarrufu sağlayabilirsiniz.',
        potential_savings_kwh: 100,
        potential_savings_cost: 130
      });
      break;
      
    case 'air_conditioner':
      suggestions.push({
        title: 'Klima sıcaklık ayarı',
        description: 'Klimanızı yaz aylarında 24-26°C, kış aylarında 20-22°C arasında ayarlayarak enerji tasarrufu sağlayabilirsiniz.',
        potential_savings_kwh: 250,
        potential_savings_cost: 300
      });
      break;
      
    case 'dishwasher':
      suggestions.push({
        title: 'Bulaşık makinesini tam dolu çalıştırma',
        description: 'Bulaşık makinenizi her zaman tam dolu olarak çalıştırarak su ve elektrik tasarrufu sağlayabilirsiniz.',
        potential_savings_kwh: 130,
        potential_savings_cost: 160
      });
      suggestions.push({
        title: 'Eko program kullanımı',
        description: 'Bulaşık makinenizde eko programını kullanarak enerji tüketimini azaltabilirsiniz.',
        potential_savings_kwh: 90,
        potential_savings_cost: 110
      });
      break;
      
    case 'lighting':
      suggestions.push({
        title: 'LED aydınlatmaya geçiş',
        description: 'Evinizde hala akkor veya floresan ampul kullanıyorsanız, LED ampullerle değiştirerek %70\'e varan tasarruf sağlayabilirsiniz.',
        potential_savings_kwh: 350,
        potential_savings_cost: 450
      });
      break;
      
    case 'computer':
      suggestions.push({
        title: 'Bilgisayar enerji tasarrufu modu',
        description: 'Bilgisayarınızın enerji tasarrufu ayarlarını optimize ederek, kullanmadığınız zamanlarda uyku moduna geçmesini sağlayabilirsiniz.',
        potential_savings_kwh: 180,
        potential_savings_cost: 220
      });
      break;
      
    case 'television':
      suggestions.push({
        title: 'Televizyon parlaklık ayarı',
        description: 'Televizyonunuzun parlaklık ayarını azaltarak enerji tüketimini düşürebilirsiniz.',
        potential_savings_kwh: 80,
        potential_savings_cost: 100
      });
      suggestions.push({
        title: 'Kullanmadığınızda tamamen kapatma',
        description: 'Televizyonunuzu kullanmadığınız zamanlarda bekleme modunda bırakmak yerine tamamen kapatarak enerji tasarrufu sağlayabilirsiniz.',
        potential_savings_kwh: 120,
        potential_savings_cost: 150
      });
      break;
      
    default:
      suggestions.push({
        title: 'Kullanmadığınız cihazları fişten çekme',
        description: `${device.name} cihazınızı kullanmadığınızda fişten çekerek yıllık 50-100kWh tasarruf sağlayabilirsiniz.`,
        potential_savings_kwh: 75,
        potential_savings_cost: 100
      });
  }
  
  return suggestions;
};

// Suggestion controller implementation
const suggestionController = {
  getAllSuggestions: async (req, res) => {
    try {
      const userId = req.user.id;
      const isAdmin = req.user.role === 'admin';
      
      let suggestions;
      if (isAdmin && req.query.userId) {
        // Admin can get suggestions for any user
        suggestions = await Suggestion.findAll({
          where: { user_id: req.query.userId },
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'email', 'first_name', 'last_name']
            },
            {
              model: Device,
              as: 'device',
              attributes: ['id', 'name', 'device_type']
            }
          ]
        });
      } else {
        // Regular users can only get their own suggestions
        suggestions = await Suggestion.findAll({
          where: { user_id: userId },
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'email', 'first_name', 'last_name']
            },
            {
              model: Device,
              as: 'device',
              attributes: ['id', 'name', 'device_type']
            }
          ]
        });
      }

      return res.status(200).json({
        status: 'success',
        data: suggestions
      });
    } catch (error) {
      console.error('Get all suggestions error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error getting suggestions',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },
  
  getSuggestionById: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const isAdmin = req.user.role === 'admin';
      
      const suggestion = await Suggestion.findByPk(id);
      
      if (!suggestion) {
        return res.status(404).json({
          status: 'error',
          message: 'Suggestion not found'
        });
      }
      
      // Check if user is authorized to access this suggestion
      if (!isAdmin && suggestion.user_id !== userId) {
        return res.status(403).json({
          status: 'error',
          message: 'Unauthorized access to this suggestion'
        });
      }
      
      return res.status(200).json({
        status: 'success',
        data: suggestion
      });
    } catch (error) {
      console.error('Get suggestion by ID error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error getting suggestion',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },
  
  createSuggestion: async (req, res) => {
    try {
      const userId = req.user.id;
      const { title, description, device_id, potential_savings_kwh, potential_savings_cost } = req.body;
      
      // Create new suggestion
      const suggestion = await Suggestion.create({
        user_id: userId,
        device_id,
        title,
        description,
        potential_savings_kwh,
        potential_savings_cost,
        status: 'pending' // Default status
      });
      
      return res.status(201).json({
        status: 'success',
        message: 'Suggestion created successfully',
        data: suggestion
      });
    } catch (error) {
      console.error('Create suggestion error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error creating suggestion',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },
  
  updateSuggestion: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const isAdmin = req.user.role === 'admin';
      const { title, description, status, potential_savings_kwh, potential_savings_cost } = req.body;
      
      // Find suggestion
      const suggestion = await Suggestion.findByPk(id);
      
      if (!suggestion) {
        return res.status(404).json({
          status: 'error',
          message: 'Suggestion not found'
        });
      }
      
      // Check if user is authorized to update this suggestion
      if (!isAdmin && suggestion.user_id !== userId) {
        return res.status(403).json({
          status: 'error',
          message: 'Unauthorized access to this suggestion'
        });
      }
      
      // Update suggestion
      await suggestion.update({
        title,
        description,
        status,
        potential_savings_kwh,
        potential_savings_cost
      });
      
      return res.status(200).json({
        status: 'success',
        message: 'Suggestion updated successfully',
        data: suggestion
      });
    } catch (error) {
      console.error('Update suggestion error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error updating suggestion',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },
  
  applySuggestion: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const isAdmin = req.user.role === 'admin';
      
      // Find suggestion
      const suggestion = await Suggestion.findByPk(id);
      
      if (!suggestion) {
        return res.status(404).json({
          status: 'error',
          message: 'Suggestion not found'
        });
      }
      
      // Check if user is authorized to apply this suggestion
      if (!isAdmin && suggestion.user_id !== userId) {
        return res.status(403).json({
          status: 'error',
          message: 'Unauthorized access to this suggestion'
        });
      }
      
      // Update suggestion status to 'applied'
      await suggestion.update({
        status: 'applied'
      });
      
      return res.status(200).json({
        status: 'success',
        message: 'Suggestion applied successfully',
        data: suggestion
      });
    } catch (error) {
      console.error('Apply suggestion error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error applying suggestion',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },
  
  rejectSuggestion: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const isAdmin = req.user.role === 'admin';
      
      // Find suggestion
      const suggestion = await Suggestion.findByPk(id);
      
      if (!suggestion) {
        return res.status(404).json({
          status: 'error',
          message: 'Suggestion not found'
        });
      }
      
      // Check if user is authorized to reject this suggestion
      if (!isAdmin && suggestion.user_id !== userId) {
        return res.status(403).json({
          status: 'error',
          message: 'Unauthorized access to this suggestion'
        });
      }
      
      // Update suggestion status to 'rejected'
      await suggestion.update({
        status: 'rejected'
      });
      
      return res.status(200).json({
        status: 'success',
        message: 'Suggestion rejected successfully',
        data: suggestion
      });
    } catch (error) {
      console.error('Reject suggestion error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error rejecting suggestion',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },
  
  deleteSuggestion: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const isAdmin = req.user.role === 'admin';
      
      // Find suggestion
      const suggestion = await Suggestion.findByPk(id);
      
      if (!suggestion) {
        return res.status(404).json({
          status: 'error',
          message: 'Suggestion not found'
        });
      }
      
      // Check if user is authorized to delete this suggestion
      if (!isAdmin && suggestion.user_id !== userId) {
        return res.status(403).json({
          status: 'error',
          message: 'Unauthorized access to this suggestion'
        });
      }
      
      // Delete suggestion
      await suggestion.destroy();
      
      return res.status(200).json({
        status: 'success',
        message: 'Suggestion deleted successfully'
      });
    } catch (error) {
      console.error('Delete suggestion error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error deleting suggestion',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },
  
  // Kullanıcı cihazlarına göre öneri oluşturma
  generateSuggestionsForUser: async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Kullanıcının tüm cihazlarını getir
      const devices = await Device.findAll({
        where: { user_id: userId }
      });
      
      // Cihaz yoksa uyarı döndür
      if (devices.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Öneri oluşturmak için önce cihaz eklemelisiniz.'
        });
      }
      
      // Mevcut önerileri getir (aktif olmayanlar dahil)
      const existingSuggestions = await Suggestion.findAll({
        where: { user_id: userId }
      });
      
      const existingTitles = existingSuggestions.map(s => s.title.toLowerCase());
      
      // Her cihaz için öneri oluştur
      let newSuggestions = [];
      
      for (const device of devices) {
        const deviceSuggestions = generateSuggestionsByDeviceType(device);
        
        // Her bir öneriyi kontrol et ve yeni ise ekle
        for (const suggestion of deviceSuggestions) {
          if (!existingTitles.includes(suggestion.title.toLowerCase())) {
            newSuggestions.push({
              ...suggestion,
              user_id: userId,
              device_id: device.id,
              status: 'pending'
            });
          }
        }
      }
      
      // Yeni öneri yoksa bildir
      if (newSuggestions.length === 0) {
        return res.status(200).json({
          status: 'success',
          message: 'Tüm uygun öneriler zaten oluşturulmuş.',
          data: []
        });
      }
      
      // Yeni önerileri veritabanına ekle
      const createdSuggestions = await Suggestion.bulkCreate(newSuggestions);
      
      return res.status(201).json({
        status: 'success',
        message: `${createdSuggestions.length} yeni öneri oluşturuldu.`,
        data: createdSuggestions
      });
    } catch (error) {
      console.error('Generate suggestions error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Öneriler oluşturulurken bir hata oluştu',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },
  
  // Kullanıcının önerilerini temizleme
  clearAllSuggestions: async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Kullanıcının tüm önerilerini bul (seçime bağlı olarak filtreleme yapılabilir)
      const filter = {};
      
      // Eğer query parametresi olarak status belirtilmişse, sadece o statusleri temizle
      if (req.query.status) {
        const statusList = req.query.status.split(',');
        filter.status = { [Op.in]: statusList };
      }
      
      // Kullanıcı kimliğini ekle
      filter.user_id = userId;
      
      // Önerileri sil
      const deletedCount = await Suggestion.destroy({
        where: filter
      });
      
      return res.status(200).json({
        status: 'success',
        message: `${deletedCount} öneri başarıyla temizlendi.`,
        data: { deletedCount }
      });
    } catch (error) {
      console.error('Clear suggestions error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Öneriler temizlenirken bir hata oluştu',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },
  
  // Generate AI suggestions using Gemini API
  generateAiSuggestions: async (req, res) => {
    try {
      const userId = req.user.id;
      
      try {
        // Use data integration service to collect user context data
        // and generate AI suggestions
        const aiSuggestions = await generateEnergySavingSuggestions(userId);
        
        console.log('AI suggestions generated successfully:', aiSuggestions.length);
        
        // AI önerisi oluşturulmamışsa, varsayılan öneriler ekle
        if (!aiSuggestions || aiSuggestions.length === 0) {
          console.log('No AI suggestions returned, using default suggestions');
          
          // Get user devices to create default suggestions
          const devices = await Device.findAll({
            where: { user_id: userId }
          });
          
          // Cihaz tipine göre bazı varsayılan öneriler
          const deviceTypes = [...new Set(devices.map(d => d.device_type))];
          
          const defaultSuggestions = [];
          
          if (deviceTypes.includes('oven')) {
            defaultSuggestions.push({
              title: "Fırın Kullanımını Optimize Et",
              description: "Fırınınızı daha verimli kullanarak elektrik tüketimini azaltabilirsiniz. Mümkün olduğunca birden fazla yemeği aynı anda pişirin.",
              estimated_savings: "15%",
              difficulty: "easy",
              source: 'ai'
            });
          }
          
          if (deviceTypes.includes('dishwasher')) {
            defaultSuggestions.push({
              title: "Bulaşık Makinesi Doluyken Çalıştır",
              description: "Bulaşık makinenizi tam doluyken çalıştırarak su ve elektrikten tasarruf edin. Ekonomik programları tercih edin.",
              estimated_savings: "10%",
              difficulty: "easy",
              source: 'ai'
            });
          }
          
          // Daha genel birkaç öneri ekle
          defaultSuggestions.push({
            title: "Enerji Vampirlerini Fişten Çekin",
            description: "Kullanılmadığında fişte bırakılan cihazlar enerji tüketmeye devam eder. Kullanmadığınız cihazları fişten çekin.",
            estimated_savings: "5-10%",
            difficulty: "easy",
            source: 'ai'
          });
          
          defaultSuggestions.push({
            title: "LED Aydınlatmaya Geçin",
            description: "Geleneksel ampullerinizi LED ampullerle değiştirin. %80'e varan enerji tasarrufu sağlayabilirsiniz.",
            estimated_savings: "10-15%",
            difficulty: "medium",
            source: 'ai'
          });
          
          return await saveAiSuggestions(defaultSuggestions, userId, res);
        }
        
        // Save the AI suggestions to the database
        return await saveAiSuggestions(aiSuggestions, userId, res);
        
      } catch (aiError) {
        console.error('AI suggestion generation error:', aiError);
        
        // AI servisinde hata oluşursa, kullanıcıya bildir ve boş dizi döndür
        return res.status(500).json({
          status: 'error',
          message: 'AI önerileri oluşturulurken bir hata oluştu',
          error: process.env.NODE_ENV === 'development' ? aiError.message : undefined
        });
      }
    } catch (error) {
      console.error('Generate AI suggestions error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Öneriler oluşturulurken bir hata oluştu',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

/**
 * Helper function to save AI suggestions to the database
 * @param {Array} suggestions - Array of AI suggestions to save
 * @param {number} userId - User ID to associate suggestions with
 * @param {Object} res - Express response object for sending response
 * @returns {Object} - Response with saved suggestions
 */
const saveAiSuggestions = async (suggestions, userId, res) => {
  try {
    // Get energy consumption data to calculate potential savings
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const consumptionData = await EnergyConsumption.findAll({
      where: {
        user_id: userId,
        reading_date: {
          [Op.between]: [thirtyDaysAgo, today]
        }
      },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('consumption_kwh')), 'total_consumption'],
        [sequelize.fn('AVG', sequelize.col('consumption_kwh')), 'avg_consumption']
      ],
      raw: true
    });
    
    // Calculate average monthly consumption
    const totalMonthly = consumptionData[0]?.total_consumption || 0;
    
    // Process and save each suggestion
    const savedSuggestions = [];
    
    for (const suggestion of suggestions) {
      // Extract potential savings percentages
      let potentialSavingsKwh = 0;
      let potentialSavingsCost = 0;
      
      // Try to extract percentage from estimated_savings field
      const savingsMatch = suggestion.estimated_savings?.match(/(\d+(?:\.\d+)?)%/);
      if (savingsMatch && savingsMatch[1]) {
        const savingsPercentage = parseFloat(savingsMatch[1]);
        // Convert percentage to kWh based on monthly consumption
        potentialSavingsKwh = Math.round((savingsPercentage / 100) * totalMonthly * 12); // Annual savings
        potentialSavingsCost = Math.round(potentialSavingsKwh * 1.5); // Rough estimate
      } else if (suggestion.estimated_savings?.includes('-')) {
        // Handle ranges like "5-10%"
        const rangeMatch = suggestion.estimated_savings.match(/(\d+)(?:\.\d+)?-(\d+)(?:\.\d+)?%/);
        if (rangeMatch && rangeMatch[2]) {
          // Use the middle of the range
          const minPercentage = parseFloat(rangeMatch[1]);
          const maxPercentage = parseFloat(rangeMatch[2]);
          const avgPercentage = (minPercentage + maxPercentage) / 2;
          
          potentialSavingsKwh = Math.round((avgPercentage / 100) * totalMonthly * 12);
          potentialSavingsCost = Math.round(potentialSavingsKwh * 1.5);
        }
      }
      
      // Convert difficulty level to standard format
      let difficultyLevel = suggestion.difficulty?.toLowerCase() || 'medium';
      if (!['easy', 'medium', 'hard'].includes(difficultyLevel)) {
        // Map non-standard difficulty levels
        difficultyLevel = difficultyLevel.includes('easy') ? 'easy' : 
                         difficultyLevel.includes('hard') ? 'hard' : 'medium';
      }
      
      // Purchase link bilgisini ekle (AI'dan gelmişse zaten eklendi, değilse kontrol et)
      let suggestionWithLink = suggestion;
      if (!suggestion.purchase_link) {
        suggestionWithLink = addPurchaseLinkToSuggestion(suggestion);
      }
      
      // Create suggestion in the database
      const savedSuggestion = await Suggestion.create({
        id: uuidv4(),
        user_id: userId,
        device_id: null, // AI suggestions are not usually device-specific
        title: suggestionWithLink.title || 'Enerji Tasarrufu Önerisi',
        description: suggestionWithLink.description || 'AI tarafından oluşturulan enerji tasarrufu önerisi',
        potential_savings_kwh: potentialSavingsKwh,
        potential_savings_cost: potentialSavingsCost,
        status: 'pending',
        source: 'ai',
        difficulty: difficultyLevel,
        purchase_link: suggestionWithLink.purchase_link || null,
        detected_device_type: suggestionWithLink.detected_device_type || null,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      savedSuggestions.push(savedSuggestion);
    }
    
    console.log('Saved suggestions:', savedSuggestions.length);
    
    // Return the generated and saved suggestions
    return res.status(200).json({
      status: 'success',
      message: 'AI suggestions generated successfully',
      data: savedSuggestions
    });
  } catch (error) {
    console.error('Error saving AI suggestions:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error saving AI suggestions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = suggestionController; 