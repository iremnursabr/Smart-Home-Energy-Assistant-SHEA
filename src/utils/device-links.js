/**
 * Cihaz türlerine göre satın alma linklerini mapping eden utility
 */

// Cihaz türü - Cimri link eşleşmeleri
const DEVICE_PURCHASE_LINKS = {
  'refrigerator': 'https://www.cimri.com/buzdolaplari/en-ucuz-enerji-sinifi:a--;a----buzdolaplari-fiyatlari',
  'washing_machine': 'https://www.cimri.com/camasir-makineleri/en-ucuz-enerji-sinifi:a--;a----camasir-makineleri-fiyatlari',
  'dishwasher': 'https://www.cimri.com/bulasik-makineleri/en-ucuz-enerji-sinifi:a--;a----bulasik-makineleri-fiyatlari',
  'oven': 'https://www.cimri.com/firinlar/en-ucuz-enerji-sinifi:a--firinlar-fiyatlari',
  'air_conditioner': 'https://www.cimri.com/klimalar/en-ucuz-isitma-verimliligi-(-enerji-sinifi-):a--;a----klimalar-fiyatlari',
  'television': 'https://www.cimri.com/televizyonlar/en-ucuz-enerji-sinifi:a-;a---televizyonlar-fiyatlari?q=televizyon'
};

// Cihaz türü algılama için anahtar kelimeler
const DEVICE_KEYWORDS = {
  'refrigerator': ['buzdolabı', 'buzdolabi', 'refrigerator', 'buzdolap'],
  'washing_machine': ['çamaşır makinesi', 'camasir makinesi', 'washing machine', 'çamaşır', 'camasir'],
  'dishwasher': ['bulaşık makinesi', 'bulasik makinesi', 'dishwasher', 'bulaşık', 'bulasik'],
  'oven': ['fırın', 'firin', 'oven'],
  'air_conditioner': ['klima', 'klimalar', 'air conditioner', 'klimanız', 'klimanizi'],
  'television': ['televizyon', 'tv', 'television', 'televizyonunuz', 'televizyonunuzu']
};

/**
 * Öneri metninden ve cihaz türünden uygun satın alma linkini bulur
 * @param {string} suggestionText - Öneri metni
 * @param {string} deviceType - Cihaz türü (opsiyonel)
 * @returns {string|null} - Bulunan link veya null
 */
const detectDeviceTypeFromSuggestion = (suggestionText, deviceType = null) => {
  console.log('Cihaz türü algılama - Giriş:', { suggestionText: suggestionText?.substring(0, 100), deviceType });
  
  // Önce direkt cihaz türünü kontrol et
  if (deviceType && DEVICE_PURCHASE_LINKS[deviceType]) {
    console.log('Direkt cihaz türü bulundu:', deviceType);
    return deviceType;
  }
  
  if (!suggestionText) {
    console.log('Öneri metni boş');
    return null;
  }
  
  const lowerText = suggestionText.toLowerCase();
  
  // Metinde geçen cihaz türlerini ara
  for (const [type, keywords] of Object.entries(DEVICE_KEYWORDS)) {
    const found = keywords.some(keyword => 
      lowerText.includes(keyword.toLowerCase())
    );
    
    if (found) {
      console.log('Metinde cihaz türü bulundu:', type, 'Anahtar kelime eşleşmesi var');
      return type;
    }
  }
  
  console.log('Hiçbir cihaz türü algılanamadı');
  return null;
};

/**
 * Cihaz türüne göre satın alma linkini döndürür
 * @param {string} deviceType - Cihaz türü
 * @returns {string|null} - Satın alma linki veya null
 */
const getPurchaseLinkForDevice = (deviceType) => {
  return DEVICE_PURCHASE_LINKS[deviceType] || null;
};

/**
 * Öneri objesine uygun satın alma linkini ekler
 * @param {Object} suggestion - Öneri objesi
 * @param {string} deviceType - İlişkili cihaz türü (opsiyonel)
 * @returns {Object} - Link eklenmiş öneri objesi
 */
const addPurchaseLinkToSuggestion = (suggestion, deviceType = null) => {
  try {
    // Öneri metnini birleştir (title + description)
    const fullText = `${suggestion.title || ''} ${suggestion.description || ''}`;
    
    // Cihaz türünü algıla
    const detectedDeviceType = detectDeviceTypeFromSuggestion(fullText, deviceType);
    
    if (detectedDeviceType) {
      const purchaseLink = getPurchaseLinkForDevice(detectedDeviceType);
      if (purchaseLink) {
        console.log('Satın alma linki eklendi:', detectedDeviceType, purchaseLink);
        return {
          ...suggestion,
          purchase_link: purchaseLink,
          detected_device_type: detectedDeviceType
        };
      }
    }
    
    return suggestion;
  } catch (error) {
    console.error('Satın alma linki ekleme hatası:', error);
    return suggestion;
  }
};

/**
 * Birden fazla öneriye link ekleme
 * @param {Array} suggestions - Öneri listesi
 * @param {string} deviceType - İlişkili cihaz türü (opsiyonel)
 * @returns {Array} - Link eklenmiş öneri listesi
 */
const addPurchaseLinksToSuggestions = (suggestions, deviceType = null) => {
  if (!Array.isArray(suggestions)) {
    return suggestions;
  }
  
  return suggestions.map(suggestion => 
    addPurchaseLinkToSuggestion(suggestion, deviceType)
  );
};

module.exports = {
  DEVICE_PURCHASE_LINKS,
  DEVICE_KEYWORDS,
  detectDeviceTypeFromSuggestion,
  getPurchaseLinkForDevice,
  addPurchaseLinkToSuggestion,
  addPurchaseLinksToSuggestions
}; 