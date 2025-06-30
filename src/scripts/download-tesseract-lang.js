/**
 * Tesseract.js için Türkçe ve İngilizce dil dosyalarını indirir
 * Bu dosya çalıştırıldığında dil dosyaları otomatik olarak indirilecektir
 */

const { createWorker } = require('tesseract.js');
const path = require('path');
const fs = require('fs');

// Tesseract dil dosyaları için önbellekleme dizini
const tessDataDir = path.join(__dirname, '../../uploads/tesseract-cache');

// Eğer dizin yoksa oluştur
if (!fs.existsSync(tessDataDir)) {
  fs.mkdirSync(tessDataDir, { recursive: true });
}

// Basit bir logger
const simpleLogger = (m) => {
  if (m.status === 'downloading language traineddata') {
    console.log(`İndiriliyor: ${m.langId} (${Math.floor(m.progress * 100)}%)`);
  } else if (m.status === 'loaded language traineddata') {
    console.log(`Dil yüklendi: ${m.langId}`);
  } else {
    console.log(JSON.stringify(m));
  }
};

async function downloadLanguages() {
  console.log('Tesseract.js dil dosyaları indiriliyor...');
  console.log('Dizin:', tessDataDir);
  
  const worker = await createWorker({
    langPath: tessDataDir,
    logger: simpleLogger
  });
  
  try {
    console.log('Türkçe ve İngilizce dil dosyaları indiriliyor...');
    await worker.loadLanguage('tur+eng');
    console.log('Dil dosyaları başarıyla indirildi!');
    
    await worker.terminate();
    console.log('İşlem tamamlandı.');
  } catch (error) {
    console.error('Dil dosyalarını indirirken hata oluştu:', error);
    await worker.terminate();
  }
}

downloadLanguages(); 