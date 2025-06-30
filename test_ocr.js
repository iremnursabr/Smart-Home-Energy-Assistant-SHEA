/**
 * OCR servisini test etmek için basit script
 */
const { extractInvoiceData } = require('./src/services/ocr.service');
const path = require('path');
const fs = require('fs');

// Test görüntüsünün var olup olmadığını kontrol et
const testImagePath = path.join(__dirname, 'fatura.png');

// OCR fonksiyonunu test et
async function testOCR() {
  console.log('OCR test başlatılıyor...');
  
  // Görüntü var mı kontrol et
  if (!fs.existsSync(testImagePath)) {
    console.error('Test görüntüsü bulunamadı:', testImagePath);
    console.error('Lütfen "fatura.png" adında bir görüntü dosyasını proje kök dizinine koyun.');
    return { success: false, error: 'Test görüntüsü bulunamadı' };
  }
  
  console.log('Test görüntüsü:', testImagePath);
  
  try {
    // OCR işlemini başlat
    console.log('OCR işlemi başlatılıyor...');
    const result = await extractInvoiceData(testImagePath);
    console.log('OCR sonucu:', result);
    console.log('Test başarılı!');
    
    return {
      success: true,
      result
    };
  } catch (error) {
    console.error('OCR test hatası:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Testi çalıştır
testOCR()
  .then(result => {
    console.log('Test tamamlandı:', result.success ? 'BAŞARILI' : 'BAŞARISIZ');
    if (result.success) {
      console.log('OCR işlemi başarıyla çalıştı! Çıkarılan fatura bilgileri:', result.result);
    }
    process.exit(result.success ? 0 : 1);
  })
  .catch(err => {
    console.error('Test çalıştırma hatası:', err);
    process.exit(1);
  }); 