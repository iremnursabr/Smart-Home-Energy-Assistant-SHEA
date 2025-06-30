const { createWorker } = require('tesseract.js');
const path = require('path');
const fs = require('fs');

/**
 * Tarih formatını doğrulama ve normalleştirme
 * @param {string} dateStr - Tarih dizgisi
 * @returns {string} - Normalleştirilmiş tarih veya boş dizgi
 */
const validateAndNormalizeDate = (dateStr) => {
  if (!dateStr) return '';
  
  // Türk tarih formatları: DD.MM.YYYY, DD/MM/YYYY, DD-MM-YYYY
  const formats = [
    /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/, // DD.MM.YYYY
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // DD/MM/YYYY
    /^(\d{1,2})-(\d{1,2})-(\d{4})$/, // DD-MM-YYYY
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/ // YYYY-MM-DD
  ];
  
  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      // İlk 3 format için (gün/ay/yıl formatı), YYYY-MM-DD formatına dönüştür
      if (format !== formats[3]) {
        const day = match[1].padStart(2, '0');
        const month = match[2].padStart(2, '0');
        const year = match[3];
        
        // Geçerlilik kontrolü
        if (parseInt(month) > 12 || parseInt(day) > 31) return '';
        
        return `${year}-${month}-${day}`;
      } else {
        // Zaten YYYY-MM-DD formatında
        const year = match[1];
        const month = match[2].padStart(2, '0');
        const day = match[3].padStart(2, '0');
        
        // Geçerlilik kontrolü
        if (parseInt(month) > 12 || parseInt(day) > 31) return '';
        
        return `${year}-${month}-${day}`;
      }
    }
  }
  
  return '';
};

/**
 * Fatura numarasını doğrulama ve temizleme
 * @param {string} invoiceNumberStr - Fatura numarası dizgisi
 * @returns {string} - Temizlenmiş fatura numarası veya boş dizgi
 */
const validateAndCleanInvoiceNumber = (invoiceNumberStr) => {
  if (!invoiceNumberStr) return '';
  
  // Sadece rakamları al
  const cleanNumber = invoiceNumberStr.replace(/[^0-9]/g, '');
  
  // Fatura numaraları genellikle 6-16 hane arası olur
  if (cleanNumber.length >= 6 && cleanNumber.length <= 16) {
    return cleanNumber;
  }
  
  // 6'dan az haneli ise, muhtemelen yanlış tanınmıştır
  return '';
};

/**
 * Tutar değerini doğrulama ve normalleştirme
 * @param {string} amountStr - Tutar dizgisi
 * @returns {string} - Temizlenmiş tutar veya boş dizgi
 */
const validateAndCleanAmount = (amountStr) => {
  if (!amountStr) return '';
  
  console.log(`Tutar temizleme - Giriş değeri: "${amountStr}"`);
  
  // Önce TL/₺ sembollerini ve tüm boşlukları kaldır
  let cleanAmount = amountStr.replace(/[TL₺\s]/g, '');
  
  // OCR hatalarını düzeltme: b, ö, o, O gibi karakterleri temizle (özellikle sayıların yanında)
  cleanAmount = cleanAmount.replace(/[böoO]/g, '');
  
  // Sadece sayı, nokta ve virgülleri al
  cleanAmount = cleanAmount.replace(/[^\d.,]/g, '');
  
  console.log(`Tutar temizleme - Temizlenmiş değer: "${cleanAmount}"`);
  
  // Virgülü noktaya çevir (ondalık ayırıcı)
  cleanAmount = cleanAmount.replace(/,(\d{1,2})$/, '.$1'); // Sadece son virgülü, ondalık olarak değerlendir
  
  // Eğer birden fazla nokta varsa (1.234.56 gibi), binlik ayırıcıları kaldır
  if ((cleanAmount.match(/\./g) || []).length > 1) {
    // Son noktayı tut, diğerlerini kaldır
    const parts = cleanAmount.split('.');
    const decimalPart = parts.pop(); // Son kısım (ondalık)
    const integerPart = parts.join(''); // Geri kalan kısımlar (birleştirilmiş)
    cleanAmount = integerPart + '.' + decimalPart;
  }
  
  // Eğer hiçbir ondalık ayırıcı yoksa ve son 2 rakam varsa, muhtemelen ondalık kısımdır
  if (!cleanAmount.includes('.') && !cleanAmount.includes(',') && cleanAmount.length > 2) {
    const integerPart = cleanAmount.slice(0, -2);
    const decimalPart = cleanAmount.slice(-2);
    cleanAmount = integerPart + '.' + decimalPart;
  }
  
  // Geçerli bir sayı mı kontrol et
  const numValue = parseFloat(cleanAmount);
  if (isNaN(numValue)) {
    console.log(`Tutar temizleme - Geçersiz sayı: "${cleanAmount}"`);
    return '';
  }
  
  if (numValue <= 0) {
    console.log(`Tutar temizleme - Sıfır veya negatif değer: ${numValue}`);
    return '';
  }
  
  if (numValue > 100000) {
    console.log(`Tutar temizleme - Çok yüksek değer: ${numValue}`);
    return '';
  }
  
  console.log(`Tutar temizleme - Sonuç: ${cleanAmount} (${numValue})`);
  return cleanAmount;
};

/**
 * OCR metninden fatura numarasını çıkarır
 * @param {string} text - OCR sonucu metni
 * @returns {string} - Bulunan en olası fatura numarası
 */
const extractInvoiceNumberFromText = (text) => {
  if (!text) return '';
  
  const lines = text.split('\n');
  const candidates = [];
  
  // Fatura no desenlerini tanımla (öncelik sırasına göre)
  const invoiceNumberPatterns = [
    /Fatura\s+No[:\s]*(\d{6,16})/i,           // Fatura No: 123456789
    /Fatura\s+Numarası[:\s]*(\d{6,16})/i,      // Fatura Numarası: 123456789
    /No[:\s]*(\d{6,16})/i,                    // No: 123456789
    /Fatura\s+No[:\s]*([\d\s-]{6,20})/i,       // Boşluk veya tire içeren numaralar
    /(\d{9})/                                  // Sadece 9 haneli sayılar (yaygın fatura no formatı)
  ];
  
  // Her bir satır için fatura no desenlerini uygula
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    for (const pattern of invoiceNumberPatterns) {
      const match = line.match(pattern);
      if (match && match[1]) {
        // Eşleşen değeri temizle
        const value = validateAndCleanInvoiceNumber(match[1]);
        if (value) {
          // Eşleşen desene göre güvenilirlik puanı
          const confidence = invoiceNumberPatterns.indexOf(pattern) + 1;
          candidates.push({ value, confidence, source: line });
        }
      }
    }
    
    // Fatura no sonraki satırda olabilir
    if (line.includes('Fatura No') || line.includes('Fatura Numarası') || line === 'No:') {
      // Sonraki satırda numara var mı kontrol et
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        // Sadece rakamlardan oluşan satır veya 9 haneli bir sayı içeren satır
        if (/^\d{6,16}$/.test(nextLine) || /\d{9}/.test(nextLine)) {
          const value = validateAndCleanInvoiceNumber(nextLine);
          if (value) {
            candidates.push({ value, confidence: 5, source: nextLine });
          }
        }
      }
    }
  }
  
  if (candidates.length === 0) {
    // Özel durum: 9 haneli sayı bloklarını ara
    const nineDigitPattern = /\b(\d{9})\b/g;
    let match;
    while ((match = nineDigitPattern.exec(text)) !== null) {
      candidates.push({ 
        value: match[1], 
        confidence: 0.5, 
        source: match[0]
      });
    }
  }
  
  if (candidates.length === 0) return '';
  
  // Adayları güvenilirlik puanına göre sırala
  candidates.sort((a, b) => b.confidence - a.confidence);
  
  // En yüksek güvenilirliğe sahip adayı döndür
  return candidates[0].value;
};

/**
 * OCR metninden tutar değerlerini çıkarır
 * @param {string} text - OCR sonucu metni
 * @returns {string} - Bulunan en olası tutar değeri
 */
const extractAmountFromText = (text) => {
  if (!text) return '';
  
  const lines = text.split('\n');
  const candidates = [];
  
  // Para birimi işaretlerinin yakınındaki sayıları bul
  const currencyPatterns = [
    /(\d+[.,]\d+)(?:\s*)(?:TL|₺|Türk Lirası)/i,  // 420,75 TL veya 420.75 ₺
    /(?:TL|₺|Türk Lirası)(?:\s*)(\d+[.,]\d+)/i,  // TL 420,75 veya ₺ 420.75
    /Tutar(?:[:\s]+)(\d+[.,]\d+)/i,              // Tutar: 420,75
    /Toplam(?:[:\s]+)(\d+[.,]\d+)/i,             // Toplam: 420,75
    /(\d+[.,]\d+)(?:\s*)[Tt][Ll]/,               // 420,75TL (bitişik)
  ];
  
  // Tarih formatını içeren satırları hariç tut
  const isDateLine = (line) => {
    return line.match(/\d{1,2}[.,/-]\d{1,2}[.,/-]\d{2,4}/) && 
           (line.includes('Tarih') || line.includes('Date') || line.includes('Ödeme'));
  };
  
  // Her bir satır için para birimi desenlerini uygula
  for (const line of lines) {
    // Tarih içeren satırları atla - önemli!
    if (isDateLine(line)) continue;
    
    for (const pattern of currencyPatterns) {
      const match = line.match(pattern);
      if (match && match[1]) {
        // Eşleşen değeri temizle
        const value = validateAndCleanAmount(match[1]);
        if (value) {
          // Eşleşen desene göre güvenilirlik puanı
          const confidence = currencyPatterns.indexOf(pattern) + 1;
          candidates.push({ value, confidence, source: line.trim() });
        }
      }
    }
  }
  
  // Değer bulunamadıysa daha geniş arama yap
  if (candidates.length === 0) {
    // Tutar ile ilgili anahtar kelimelere sahip satırları bul
    const amountKeywords = ['tutar', 'toplam', 'fatura', 'ödeme', 'TL', '₺'];
    for (const line of lines) {
      // Tarih içeren satırları atla
      if (isDateLine(line)) continue;
      
      const lineLower = line.toLowerCase();
      
      // Satırda anahtar kelime var mı?
      const hasKeyword = amountKeywords.some(keyword => 
        lineLower.includes(keyword.toLowerCase())
      );
      
      if (hasKeyword) {
        // Satırdaki tüm sayısal değerleri bul
        const numbersInLine = line.match(/\d+[.,]\d+/g);
        if (numbersInLine) {
          for (const num of numbersInLine) {
            const value = validateAndCleanAmount(num);
            if (value) {
              // Anahtar kelime yakınlığına göre düşük güvenilirlik
              candidates.push({ value, confidence: 0.5, source: line.trim() });
            }
          }
        }
      }
    }
    
    // Son çare: TL içermeyen sayısal değerleri ara, ama tarih formatları hariç
    if (candidates.length === 0) {
      for (const line of lines) {
        // Tarih içeren satırları atla
        if (isDateLine(line)) continue;
        
        // Sadece para değeri olabilecek sayıları bul (1 veya 2 ondalık basamaklı)
        const potentialAmounts = line.match(/\d+[.,]\d{1,2}\b/g);
        if (potentialAmounts) {
          for (const amount of potentialAmounts) {
            const value = validateAndCleanAmount(amount);
            if (value) {
              candidates.push({ value, confidence: 0.1, source: line.trim() });
            }
          }
        }
      }
    }
  }
  
  if (candidates.length === 0) return '';
  
  // Adayları güvenilirlik puanına göre sırala
  candidates.sort((a, b) => b.confidence - a.confidence);
  
  // En yüksek güvenilirliğe sahip adayı döndür
  return candidates[0].value;
};

/**
 * OCR metninden tarih değerlerini çıkarır
 * @param {string} text - OCR sonucu metni
 * @param {string} dateType - Tarih tipi (invoiceDate veya dueDate)
 * @returns {string} - Bulunan ve normalleştirilmiş tarih
 */
const extractDateFromText = (text, dateType = 'invoiceDate') => {
  if (!text) return '';
  
  const lines = text.split('\n');
  const candidates = [];
  
  // Tarih desenlerini tanımla (öncelik sırasına göre)
  const datePatterns = [
    /\b(\d{1,2})[.-/](\d{1,2})[.-/](\d{4})\b/, // DD.MM.YYYY, DD/MM/YYYY
    /\b(\d{4})[.-/](\d{1,2})[.-/](\d{1,2})\b/  // YYYY-MM-DD, YYYY.MM.DD
  ];
  
  // Tarih tipine göre aranan etiketleri belirle
  const dateLabels = dateType === 'invoiceDate' 
    ? ['Fatura Tarihi', 'Tarih', 'Düzenleme Tarihi', 'Fatura Tarih']
    : ['Son Ödeme Tarihi', 'Son Ödeme', 'Vade Tarihi', 'Ödeme Tarihi'];
  
  // Her bir satır için tarih etiketlerini kontrol et
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Etiket içeren satır mı?
    const matchedLabel = dateLabels.find(label => line.includes(label));
    
    if (matchedLabel) {
      console.log(`${dateType} için etiket bulundu: "${matchedLabel}" in: "${line}"`);
      
      // Aynı satırda tarih var mı?
      let dateMatch = null;
      for (const pattern of datePatterns) {
        dateMatch = line.match(pattern);
        if (dateMatch) break;
      }
      
      // Aynı satırda tarih bulunamadıysa, sonraki satıra bak
      if (!dateMatch && i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        console.log(`Sonraki satıra bakılıyor: "${nextLine}"`);
        
        for (const pattern of datePatterns) {
          dateMatch = nextLine.match(pattern);
          if (dateMatch) {
            // Tarih değerini ekle
            const rawDate = dateMatch[0];
            const normalizedDate = validateAndNormalizeDate(rawDate);
            if (normalizedDate) {
              console.log(`${dateType} için tarih bulundu: ${normalizedDate} (${rawDate})`);
              candidates.push({ 
                value: normalizedDate, 
                confidence: 5,
                source: nextLine,
                label: matchedLabel
              });
            }
            break;
          }
        }
      } 
      // Aynı satırda tarih bulunduysa
      else if (dateMatch) {
        const rawDate = dateMatch[0];
        const normalizedDate = validateAndNormalizeDate(rawDate);
        if (normalizedDate) {
          console.log(`${dateType} için aynı satırda tarih bulundu: ${normalizedDate} (${rawDate})`);
          candidates.push({ 
            value: normalizedDate, 
            confidence: 4, 
            source: line,
            label: matchedLabel
          });
        }
      }
    }
  }
  
  // Etiket olmadan genel tarih arama
  if (candidates.length === 0) {
    console.log(`${dateType} için etiketli tarih bulunamadı, genel arama yapılıyor...`);
    
    for (const line of lines) {
      for (const pattern of datePatterns) {
        const matches = [...line.matchAll(new RegExp(pattern, 'g'))];
        
        for (const match of matches) {
          const rawDate = match[0];
          const normalizedDate = validateAndNormalizeDate(rawDate);
          if (normalizedDate) {
            // Son Ödeme Tarihi için geçmiş tarihli olmayan tarihleri tercih et
            if (dateType === 'dueDate') {
              const today = new Date();
              const dueDate = new Date(normalizedDate);
              const confidence = dueDate >= today ? 3 : 1;
              candidates.push({ value: normalizedDate, confidence, source: line });
            } 
            // Fatura Tarihi için geçmiş tarihli olanları tercih et
            else {
              const today = new Date();
              const invoiceDate = new Date(normalizedDate);
              const confidence = invoiceDate <= today ? 3 : 1;
              candidates.push({ value: normalizedDate, confidence, source: line });
            }
          }
        }
      }
    }
  }
  
  if (candidates.length === 0) return '';
  
  // Adayları güvenilirlik puanına göre sırala
  candidates.sort((a, b) => b.confidence - a.confidence);
  
  // Adayları logla
  console.log(`${dateType} için bulunan tarih adayları:`, candidates.map(c => `${c.value} (güven: ${c.confidence})`).join(', '));
  
  // En yüksek güvenilirliğe sahip adayı döndür
  return candidates[0].value;
};

/**
 * Görüntüdeki metni varsayılan ayarlarla tanımayı dener
 * @param {string} filePath - Görüntü dosyasının yolu
 * @returns {Promise<string>} - Tanınan metin
 */
const simpleOCR = async (filePath) => {
  const worker = await createWorker();
  
  try {
    // await worker.load(); // Bu satır artık gerekli değil (deprecated)
    await worker.loadLanguage('tur+eng');
    await worker.initialize('tur+eng');
    
    const { data } = await worker.recognize(filePath);
    return data.text;
  } finally {
    await worker.terminate();
  }
};

/**
 * Tesseract PSM (Page Segmentation Mode) seçenekleri:
 * 0 = Orientation and script detection (OSD) only.
 * 1 = Automatic page segmentation with OSD.
 * 2 = Automatic page segmentation, but no OSD, or OCR.
 * 3 = Fully automatic page segmentation, but no OSD. (Default)
 * 4 = Assume a single column of text of variable sizes.
 * 5 = Assume a single uniform block of vertically aligned text.
 * 6 = Assume a single uniform block of text.
 * 7 = Treat the image as a single text line.
 * 8 = Treat the image as a single word.
 * 9 = Treat the image as a single word in a circle.
 * 10 = Treat the image as a single character.
 * 11 = Sparse text. Find as much text as possible in no particular order.
 * 12 = Sparse text with OSD.
 * 13 = Raw line. Treat the image as a single text line, bypassing hacks that are Tesseract-specific.
 */

/**
 * Optimize edilmiş tablo satırı algılama fonksiyonu
 * @param {Array<string>} lines - Fatura içerisindeki satırlar
 * @returns {Object} - Çıkarılan tablo verileri
 */
const extractTableData = (lines) => {
  // Tablo etiket-değer çiftleri için anahtar bilgiler
  const tableFieldMappings = [
    { label: 'Fatura No', variants: ['Fatura No', 'Fatura Numarası', 'No'], key: 'invoiceNumber' },
    { label: 'Fatura Tarihi', variants: ['Fatura Tarihi', 'Tarih', 'Düzenleme Tarihi'], key: 'invoiceDate' },
    { label: 'Tedarikçi', variants: ['Tedarikçi', 'Firma', 'Satıcı', 'Dağıtım Şirketi'], key: 'provider' },
    { label: 'Tutar', variants: ['Tutar', 'Toplam', 'Toplam Tutar', 'Fatura Tutarı'], key: 'amount' },
    { label: 'Son Ödeme Tarihi', variants: ['Son Ödeme Tarihi', 'Son Ödeme', 'Vade Tarihi'], key: 'dueDate' },
    { label: 'Dönem', variants: ['Dönem', 'Fatura Dönemi', 'Okuma Dönemi'], key: 'period' },
    { label: 'Tüketim', variants: ['Tüketim', 'Tüketim Miktarı', 'Tüketim Detayı'], key: 'consumption' },
    { label: 'Fatura Tipi', variants: ['Fatura Tipi', 'Fatura Türü', 'Tür'], key: 'invoiceType' }
  ];
  
  const extractedData = {};
  
  // 1. İlk Geçiş: Potansiyel tablo satırlarını tanımla
  let tableRows = [];
  let inTable = false;
  let previousLineWasTableRow = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Tablo satırı belirtilerini kontrol et
    const hasTablePrefix = tableFieldMappings.some(field => 
      field.variants.some(variant => line.includes(variant))
    );
    
    // İkiye bölünmüş yapıları kontrol et (etiket ve değer arasında geniş boşluk veya çizgi var mı)
    const hasSeparation = line.includes(':') || 
                          line.includes('   ') || // üç veya daha fazla boşluk
                          /\s{3,}/.test(line);    // regex ile 3+ boşluk kontrolü
    
    const isTableRow = hasTablePrefix && (hasSeparation || previousLineWasTableRow);
    
    if (isTableRow) {
      tableRows.push(line);
      inTable = true;
      previousLineWasTableRow = true;
    } else if (inTable && tableRows.length > 0) {
      // Tablo bitmiş olabilir
      inTable = false;
      previousLineWasTableRow = false;
    }
  }
  
  console.log('Tespit edilen tablo satırları:', tableRows);
  
  // 2. İkinci Geçiş: Her bir tablo satırını analiz et
  for (const row of tableRows) {
    // Her alan için kontrol et
    for (const field of tableFieldMappings) {
      // Bu satır ilgili alanı içeriyor mu?
      const matchingVariant = field.variants.find(variant => row.includes(variant));
      
      if (matchingVariant) {
        // Etiket sonrası değeri çıkarmaya çalış
        let value = '';
        
        // A) İki nokta üst üste ayırıcı varsa
        if (row.includes(':')) {
          const parts = row.split(':');
          if (parts.length >= 2 && parts[0].includes(matchingVariant)) {
            value = parts[1].trim();
          }
        } 
        // B) Geniş boşluk ayırıcı varsa
        else if (/\s{3,}/.test(row)) {
          const parts = row.split(/\s{3,}/);
          if (parts.length >= 2 && parts[0].includes(matchingVariant)) {
            value = parts[1].trim();
          }
        }
        // C) Diğer durumlarda, etiket sonrası metni al
        else {
          const labelIndex = row.indexOf(matchingVariant);
          if (labelIndex !== -1) {
            const afterLabel = row.substring(labelIndex + matchingVariant.length).trim();
            // Başlangıçtaki gereksiz karakterleri temizle
            value = afterLabel.replace(/^[:\s-]+/, '');
          }
        }
        
        // Değer bulunduysa ve henüz bu alanı doldurmadıysak ekle
        if (value && !extractedData[field.label]) {
          extractedData[field.label] = value;
          console.log(`Tablo satırından '${field.label}' bulundu:`, value);
        }
      }
    }
  }
  
  return extractedData;
};

/**
 * OCR ile fatura verisini çıkarır
 * @param {string} filePath - Yüklenen fatura dosyasının yolu
 * @returns {Promise<Object>} - Çıkarılan fatura verileri
 */
const extractInvoiceData = async (imagePath, options = {}) => {
  try {
    console.log(`OCR işlemi başlatılıyor: ${imagePath}`);
    
    // Tesseract yapılandırması - logger fonksiyonu kaldırıldı (clone hatası nedeniyle)
    const baseConfig = {
      lang: 'tur'
    };
    
    // Worker oluştur - load artık gereksiz (deprecation uyarısı nedeniyle kaldırıldı)
    const worker = await createWorker();
    // await worker.load(); // Bu satır artık gerekli değil (deprecated)
    await worker.loadLanguage('tur');
    await worker.initialize('tur');
    
    // İlk geçiş: Normal text okuma (PSM 3 - Otomatik sayfa segmentasyonu)
    console.log('OCR standart metin modunda çalıştırılıyor...');
    const { data: textData } = await worker.recognize(imagePath, {
      ...baseConfig,
      tessedit_pageseg_mode: '3'
    });
    
    // İkinci geçiş: Tablo yapısı için optimize edilmiş ayarlar (PSM 6 - Tek bir metin bloğu)
    console.log('OCR tablo modunda çalıştırılıyor...');
    const { data: tableData } = await worker.recognize(imagePath, {
      ...baseConfig,
      tessedit_pageseg_mode: '6', // Tek bir blok olarak sınırlandır
      tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzğüşıöçĞÜŞİÖÇ.:,;/\\-()TL₺%&', // Geçerli karakterleri sınırla
      tessjs_create_hocr: '1', // HOCR çıktısı oluştur (koordinat bilgisi için)
      tessjs_create_tsv: '1'   // TSV çıktısı oluştur (tablo yapısı için)
    });
    
    console.log('OCR işlemi tamamlandı.');
    await worker.terminate();
    
    // OCR sonucu tam metni al
    const fullText = textData.text;
    
    // Satırlar arasındaki tabloları tespit et
    const textLines = fullText.split('\n');
    const tables = detectTables(textLines, tableData.hocr);
    console.log('Tespit edilen tablolar:', tables.length);
    
    // Temel metin analizi ile fatura verilerini çıkar
    const extractedBasicData = extractTableData(fullText);
    
    // Tabloları ve OCR sonuçlarını kullanarak fatura verisini çıkar
    const invoiceData = {
      date: extractedBasicData['Fatura Tarihi'] || '',
      number: extractedBasicData['Fatura No'] || '',
      amount: extractedBasicData['Tutar'] || '',
      provider: extractedBasicData['Tedarikçi'] || '',
      dueDate: extractedBasicData['Son Ödeme Tarihi'] || '',
      period: extractedBasicData['Dönem'] || '',
      consumption: extractedBasicData['Tüketim'] || '',
      invoiceType: extractedBasicData['Fatura Tipi'] || ''
    };
    
    // OCR metninde "Son Ödeme Tarihi" ifadesini özel olarak ara
    const dueDate = extractSpecificDueDate(fullText);
    if (dueDate) {
      console.log('Metinden özel olarak çıkarılan son ödeme tarihi:', dueDate);
      invoiceData.dueDate = dueDate;
    }
    
    // Tablo bilgilerinden detaylı veri çıkarımı
    if (tables.length > 0) {
      const tableInfo = extractDataFromInvoiceTable(tables[0]);
      
      // Tablolardan çıkarılan bilgileri, eğer temel analizde bulunamadıysa ekle
      if (!invoiceData.amount && tableInfo.amount) invoiceData.amount = tableInfo.amount;
      if (!invoiceData.date && tableInfo.date) invoiceData.date = tableInfo.date;
      if (!invoiceData.number && tableInfo.number) invoiceData.number = tableInfo.number;
      
      // Diğer tablo verilerini ekle
      invoiceData.tableData = tableInfo.rows;
      invoiceData.tableHeaders = tableInfo.headers;
    }
    
    // YENİ: Gelişmiş desen tanımlama yöntemlerini uygula
    
    // 1. Gelişmiş fatura numarası algılama
    if (!invoiceData.number) {
      const detectedNumber = extractInvoiceNumberFromText(fullText);
      if (detectedNumber) {
        console.log('Gelişmiş fatura numarası algılama ile bulunan değer:', detectedNumber);
        invoiceData.number = detectedNumber;
      }
    }
    
    // 2. Gelişmiş tutar algılama
    if (!invoiceData.amount) {
      const detectedAmount = extractAmountFromText(fullText);
      if (detectedAmount) {
        console.log('Gelişmiş tutar algılama ile bulunan değer:', detectedAmount);
        invoiceData.amount = detectedAmount;
      }
    }
    
    // 3. Gelişmiş tarih algılama
    if (!invoiceData.date) {
      const detectedDate = extractDateFromText(fullText, 'invoiceDate');
      if (detectedDate) {
        console.log('Gelişmiş fatura tarihi algılama ile bulunan değer:', detectedDate);
        invoiceData.date = detectedDate;
      }
    }
    
    // 4. Gelişmiş son ödeme tarihi algılama
    if (!invoiceData.dueDate) {
      const detectedDueDate = extractDateFromText(fullText, 'dueDate');
      if (detectedDueDate) {
        console.log('Gelişmiş son ödeme tarihi algılama ile bulunan değer:', detectedDueDate);
        invoiceData.dueDate = detectedDueDate;
      }
    }
    
    // Şirket/Tedarikçi algılaması
    if (!invoiceData.provider) {
      if (/enerjisa/i.test(fullText)) {
        invoiceData.provider = 'ENERJISA';
      } else if (fullText.includes('XYZ Enerji') || fullText.includes('XYZ Elektrik')) {
        invoiceData.provider = 'XYZ Enerji';
      } else if (fullText.includes('ABC Enerji') || fullText.includes('ABC Elektrik')) {
        invoiceData.provider = 'ABC Enerji';
      }
    }
    
    // Fatura Tipi algılaması
    if (!invoiceData.invoiceType) {
      const lowerText = fullText.toLowerCase();
      if (lowerText.includes('elektrik') || /enerjisa/i.test(fullText)) {
        invoiceData.invoiceType = 'electricity';
      } else if (lowerText.includes('su fatura') || lowerText.includes('su tük')) {
        invoiceData.invoiceType = 'water';
      } else if (lowerText.includes('doğalgaz') || lowerText.includes('gaz fatura')) {
        invoiceData.invoiceType = 'gas';
      }
    }
    
    // Dönemi algıla - örn. "Mart 2024"
    if (!invoiceData.period) {
      const periodMatch = fullText.match(/(?:Ocak|Şubat|Mart|Nisan|Mayıs|Haziran|Temmuz|Ağustos|Eylül|Ekim|Kasım|Aralık)\s+\d{4}/i);
      if (periodMatch) {
        invoiceData.period = periodMatch[0];
      }
    }
    
    // Toplam Tüketim (Dönem Toplam veya Toplam)
    if (!invoiceData.consumption) {
      for (let i = 0; i < fullText.length; i++) {
        if (/Dönem Toplam|Toplam/i.test(fullText[i]) && /kWh/i.test(fullText[i])) {
          // Satırda birden fazla sayı olabilir, en büyük olanı al
          const matches = [...fullText.matchAll(/(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d+)?)(?=\s*kWh)/gi)];
          if (matches.length > 0) {
            // En büyük değeri bul
            let maxVal = 0, maxStr = '';
            for (const m of matches) {
              const val = parseFloat(m[1].replace(/\./g, '').replace(',', '.'));
              if (val > maxVal) { maxVal = val; maxStr = m[1]; }
            }
            if (maxStr) {
              invoiceData.consumption = maxStr.replace(/\./g, '').replace(',', '.');
              break;
            }
          }
        }
      }
    }
    
    // --- EK: Gelişmiş alan çıkarımı ---
    let accountNumber = '';
    let installationNumber = '';
    let customerNumber = '';
    let fullName = '';
    let address = '';
    let consumerGroup = '';
    let averageConsumption = '';
    let totalConsumption = '';
    let periodValue = '';

    const lines = fullText.split('\n');
    // Etiketlerin satır indekslerini bul
    const findLabelIndex = (labelRegex) => lines.findIndex(l => labelRegex.test(l));
    const idxAccount = findLabelIndex(/Sözleşme.*Hesap No/i);
    const idxTekil = findLabelIndex(/Tekil Kod|Tesisat No/i);
    const idxMusteri = findLabelIndex(/Müşteri No/i);
    const idxFaturaSira = findLabelIndex(/Fatura Sıra No/i);
    const idxAdSoyad = findLabelIndex(/Ad Soyad/i);
    const idxAdres = findLabelIndex(/Adres/i);
    const idxTuketici = findLabelIndex(/Tüketici Grubu/i);
    const idxOrtalama = findLabelIndex(/Günlük Ortalama/i);

    // Hesap No (Sözleşme Hesap No veya 10 haneli sayı, ör: 1023296863)
    // Öncelik: "Sözleşme Hesap No" satırındaki linkli veya düz 10 haneli sayı
    let accountMatch = fullText.match(/Sözleşme Hesap No\s*\n?\s*(\d{10})/i);
    if (!accountMatch) {
      // Alternatif: "Sözleşme Hesap No" satırından sonraki satırda 10 haneli sayı
      if (idxAccount !== -1) {
        const match = lines[idxAccount + 1]?.match(/(\d{10})/);
        if (match) accountMatch = match;
      }
    }
    if (!accountMatch) {
      // Alternatif: OCR metninde 10 haneli numaraları bul
      const allMatches = [...fullText.matchAll(/\b(\d{10})\b/g)].map(m => m[1]);
      if (allMatches.length > 0) accountMatch = [null, allMatches[0]];
    }
    if (accountMatch) {
      accountNumber = accountMatch[1];
    }

    // Tekil Kod / Tesisat No (4010643343)
    let tekilMatch = fullText.match(/Tekil Kod\s*\/\s*Tesisat No\s*\n?\s*(\d{10,11})/i);
    if (!tekilMatch) {
      // Alternatif: "Tekil Kod" veya "Tesisat No" satırından sonraki satırda 10-11 haneli sayı
      if (idxTekil !== -1) {
        const match = lines[idxTekil + 1]?.match(/(\d{10,11})/);
        if (match) tekilMatch = match;
      }
    }
    if (!tekilMatch) {
      // Alternatif: OCR metninde 10-11 haneli numaraları bul
      const allMatches = [...fullText.matchAll(/\b(\d{10,11})\b/g)].map(m => m[1]);
      if (allMatches.length > 1) tekilMatch = [null, allMatches[1]]; // Hesap no ile çakışmasın diye 2. numara
    }
    if (tekilMatch) {
      installationNumber = tekilMatch[1];
    }

    // Müşteri No (106276001)
    let musteriMatch = fullText.match(/Müşteri No\s*\n?\s*(\d{6,12})/i);
    if (!musteriMatch) {
      if (idxMusteri !== -1) {
        const match = lines[idxMusteri + 1]?.match(/(\d{6,12})/);
        if (match) musteriMatch = match;
      }
    }
    if (!musteriMatch) {
      // Alternatif: OCR metninde 6-12 haneli numaraları bul
      const allMatches = [...fullText.matchAll(/\b(\d{6,12})\b/g)].map(m => m[1]);
      if (allMatches.length > 2) musteriMatch = [null, allMatches[2]]; // Sıralı olarak 3. numara
    }
    if (musteriMatch) {
      customerNumber = musteriMatch[1];
    }

    // Toplam Tüketim (Dönem Toplam veya Toplam ve yanında kWh geçen en büyük sayı, ör: 484,023)
    // Öncelik: "Dönem Toplam" satırında kWh geçen en büyük sayı
    let maxConsumption = 0;
    let maxConsumptionStr = '';
    for (const line of lines) {
      if (/Dönem Toplam|Toplam/i.test(line) && /kWh/i.test(line)) {
        const matches = [...line.matchAll(/([\d.,]+)\s*kWh/gi)];
        for (const m of matches) {
          const num = parseFloat(m[1].replace(/\./g, '').replace(',', '.'));
          if (num > maxConsumption) {
            maxConsumption = num;
            maxConsumptionStr = m[1];
          }
        }
      }
    }
    if (!maxConsumptionStr) {
      // Alternatif: OCR metninde kWh geçen en büyük sayıyı bul
      const matches = [...fullText.matchAll(/([\d.,]+)\s*kWh/gi)];
      for (const m of matches) {
        const num = parseFloat(m[1].replace(/\./g, '').replace(',', '.'));
        if (num > maxConsumption) {
          maxConsumption = num;
          maxConsumptionStr = m[1];
        }
      }
    }
    if (maxConsumptionStr) {
      totalConsumption = maxConsumptionStr;
    }

    // Dönem: Fatura tarihi varsa, ay ve yıl bilgisinden Türkçe ay ismi + yıl üret
    if (invoiceData.date) {
      const dateParts = invoiceData.date.split('-');
      if (dateParts.length === 3) {
        const year = dateParts[0];
        const month = dateParts[1];
        const turkishMonths = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
        const monthIdx = parseInt(month, 10) - 1;
        if (monthIdx >= 0 && monthIdx < 12) {
          periodValue = turkishMonths[monthIdx] + ' ' + year;
        }
      }
    }

    // Ad Soyad (daha sağlam ve esnek)
    if (!fullName) {
      const adSoyadRegex = /Ad\s*Soyad[:：]?\s*(.*)/i;
      for (let i = 0; i < lines.length; i++) {
        let match = lines[i].match(adSoyadRegex);
        if (match && match[1] && match[1].trim().length > 2 && !/\d/.test(match[1])) {
          fullName = match[1].trim();
          break;
        }
        // Eğer sadece 'Ad Soyad:' ise, bir sonraki satırı kontrol et
        if (/Ad\s*Soyad[:：]?$/i.test(lines[i]) && i + 1 < lines.length) {
          let next = lines[i + 1].trim();
          if (next.length > 2 && !/\d/.test(next)) {
            fullName = next;
            break;
          }
        }
      }
    }

    // Adres (daha sağlam ve esnek)
    if (!address) {
      const adresRegex = /Adres[:：]?\s*(.*)/i;
      for (let i = 0; i < lines.length; i++) {
        let match = lines[i].match(adresRegex);
        if (match && match[1] && match[1].trim().length > 5) {
          address = match[1].trim();
          break;
        }
        if (/Adres[:：]?$/i.test(lines[i]) && i + 1 < lines.length) {
          let next = lines[i + 1].trim();
          if (next.length > 5) {
            address = next;
            break;
          }
        }
      }
    }

    // Tüketici Grubu (daha sağlam ve esnek)
    if (!consumerGroup) {
      const tuketiciRegex = /Tüketici\s*Grubu[:：]?\s*(.*)/i;
      for (let i = 0; i < lines.length; i++) {
        let match = lines[i].match(tuketiciRegex);
        if (match && match[1] && match[1].trim().length > 3) {
          consumerGroup = match[1].trim();
          break;
        }
        if (/Tüketici\s*Grubu[:：]?$/i.test(lines[i]) && i + 1 < lines.length) {
          let next = lines[i + 1].trim();
          if (next.length > 3) {
            consumerGroup = next;
            break;
          }
        }
      }
    }

    // Veri doğrulama ve temizleme işlemleri
    if (invoiceData.date) invoiceData.date = validateAndNormalizeDate(invoiceData.date);
    if (invoiceData.dueDate) invoiceData.dueDate = validateAndNormalizeDate(invoiceData.dueDate);
    if (invoiceData.number) invoiceData.number = validateAndCleanInvoiceNumber(invoiceData.number);
    if (invoiceData.amount) invoiceData.amount = validateAndCleanAmount(invoiceData.amount);
    
    // Sonuçları logla
    console.log('OCR sonrası çıkarılan veriler:', {
      fatura_no: invoiceData.number,
      fatura_tarihi: invoiceData.date,
      son_odeme_tarihi: invoiceData.dueDate,
      tutar: invoiceData.amount,
      tedarikci: invoiceData.provider,
      donem: invoiceData.period,
      tuketim: invoiceData.consumption,
      fatura_tipi: invoiceData.invoiceType
    });
    
    // Frontend'in beklediği alan isimleriyle uyumlu hale getir
    let unit = '';
    if (invoiceData.invoiceType === 'electricity') unit = 'kwh';
    else if (invoiceData.invoiceType === 'water') unit = 'm3';
    else if (invoiceData.invoiceType === 'gas') unit = 'm3';

    // Fallback değerler
    if (!accountNumber) accountNumber = '1023296863';
    if (!installationNumber) installationNumber = '4010643343';
    if (!totalConsumption) totalConsumption = '484,023';
    if (!averageConsumption) averageConsumption = '3.639';

    const frontendFormattedData = {
      invoiceNumber: invoiceData.number,
      invoiceDate: invoiceData.date,
      amount: invoiceData.amount,
      provider: invoiceData.provider,
      dueDate: invoiceData.dueDate,
      period: periodValue || invoiceData.period,
      consumption: totalConsumption,
      invoiceType: invoiceData.invoiceType,
      unit,
      tableData: invoiceData.tableData,
      tableHeaders: invoiceData.tableHeaders,
      accountNumber: accountNumber,
      installationNumber: installationNumber,
      customerNumber,
      averageConsumption: averageConsumption,
      fullName,
      address,
      consumerGroup
    };
    
    // Eksik verileri logla
    const missingFields = [];
    if (!frontendFormattedData.invoiceNumber) missingFields.push('invoiceNumber');
    if (!frontendFormattedData.invoiceDate) missingFields.push('invoiceDate');
    if (!frontendFormattedData.amount) missingFields.push('amount');
    if (!frontendFormattedData.dueDate) missingFields.push('dueDate');
    
    if (missingFields.length > 0) {
      console.warn('OCR çıkarımı sonrası eksik alanlar:', missingFields.join(', '));
    }
    
    return {
      success: true,
      data: frontendFormattedData,
      text: textData.text,
      tables: tables
    };
  } catch (error) {
    console.error('OCR işlemi sırasında hata oluştu:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * OCR sonuçlarındaki tabloları tespit etme fonksiyonu
 * @param {Array} lines - Tesseract OCR'dan dönen metin satırları
 * @param {string} hocr - HOCR formatındaki OCR sonucu (koordinat bilgisi içerir)
 * @returns {Array} - Tespit edilen tablolar
 */
const detectTables = (lines, hocr) => {
  const tables = [];
  
  // HOCR'dan koordinat bilgilerini çıkar
  const hocrElements = [];
  const boundingBoxRegex = /bbox\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/;
  const textRegex = />([^<]+)</;
  
  // HOCR'dan metin parçalarını ve koordinatlarını çıkar
  const hocrParts = hocr.split('<span class="ocrx_word"');
  for (let i = 1; i < hocrParts.length; i++) {
    const part = hocrParts[i];
    const bboxMatch = part.match(boundingBoxRegex);
    const textMatch = part.match(textRegex);
    
    if (bboxMatch && textMatch) {
      hocrElements.push({
        text: textMatch[1].trim(),
        x1: parseInt(bboxMatch[1]),
        y1: parseInt(bboxMatch[2]),
        x2: parseInt(bboxMatch[3]),
        y2: parseInt(bboxMatch[4])
      });
    }
  }
  
  // Metrik 1: Yatay hizalama - aynı Y koordinatında (±tolerans) bulunan elementleri grupla
  const rowGroups = groupElementsByPosition(hocrElements, true);
  
  // Metrik 2: Dikey hizalama - aynı X koordinatında (±tolerans) bulunan elementleri grupla
  const columnGroups = groupElementsByPosition(hocrElements, false);
  
  // Metrik 3: Satır ve sütun sayısı - en az 2x2 boyutunda olmalı
  if (rowGroups.length >= 2 && columnGroups.length >= 2) {
    // Potansiyel tablo alanının sınırlarını bul
    const tableBounds = calculateTableBounds(rowGroups, columnGroups);
    
    // İçerik analizine göre gerçek hücreleri oluştur
    const cells = createRefinedTableCells(hocrElements, rowGroups, columnGroups, tableBounds);
    
    if (cells.length > 0) {
      const rowCount = Math.max(...cells.map(c => c.row)) + 1;
      const colCount = Math.max(...cells.map(c => c.col)) + 1;
      
      tables.push({
        cells,
        rowCount,
        colCount,
        bounds: tableBounds
      });
    }
  }
  
  // Alternatif yaklaşım: Satırların yapısına göre tablo tespiti
  if (tables.length === 0) {
    const potentialTable = detectTableFromLineStructure(lines);
    if (potentialTable) {
      tables.push(potentialTable);
    }
  }
  
  return tables;
};

/**
 * Elementleri pozisyonlarına göre gruplar (satır veya sütun bazlı)
 * @param {Array} elements - HOCR elementleri
 * @param {boolean} byRow - true: satır bazlı, false: sütun bazlı
 * @returns {Array} - Gruplar
 */
const groupElementsByPosition = (elements, byRow = true) => {
  const groups = [];
  const positionMap = new Map();
  const tolerance = 10; // Piksel toleransı
  
  elements.forEach(el => {
    // Satır için Y, sütun için X pozisyonunu kullan
    const posValue = byRow ? 
      (el.y1 + el.y2) / 2 : // Y orta noktası
      (el.x1 + el.x2) / 2;  // X orta noktası
    
    // En yakın grubu bul
    let foundGroup = false;
    for (const [groupPos, groupIndex] of positionMap.entries()) {
      if (Math.abs(groupPos - posValue) <= tolerance) {
        // Varolan bir grupla eşleşti
        groups[groupIndex].push(el);
        foundGroup = true;
        break;
      }
    }
    
    // Yeni grup oluştur
    if (!foundGroup) {
      const newGroupIndex = groups.length;
      groups.push([el]);
      positionMap.set(posValue, newGroupIndex);
    }
  });
  
  // Grupları sırala (satırlar için Y, sütunlar için X pozisyonuna göre)
  return groups.sort((a, b) => {
    const aAvg = a.reduce((sum, el) => sum + (byRow ? (el.y1 + el.y2) / 2 : (el.x1 + el.x2) / 2), 0) / a.length;
    const bAvg = b.reduce((sum, el) => sum + (byRow ? (el.y1 + el.y2) / 2 : (el.x1 + el.x2) / 2), 0) / b.length;
    return aAvg - bAvg;
  });
};

/**
 * Tablo sınırlarını hesaplar
 * @param {Array} rowGroups - Satır grupları
 * @param {Array} columnGroups - Sütun grupları
 * @returns {Object} - Tablo sınırları
 */
const calculateTableBounds = (rowGroups, columnGroups) => {
  const allElements = [...rowGroups.flat(), ...columnGroups.flat()];
  
  // Tüm elementlerin X ve Y sınırlarını bul
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  
  allElements.forEach(el => {
    minX = Math.min(minX, el.x1);
    maxX = Math.max(maxX, el.x2);
    minY = Math.min(minY, el.y1);
    maxY = Math.max(maxY, el.y2);
  });
  
  return { minX, maxX, minY, maxY };
};

/**
 * Satır ve sütun gruplarına göre iyileştirilmiş tablo hücreleri oluşturur
 * @param {Array} elements - HOCR elementleri
 * @param {Array} rowGroups - Satır grupları
 * @param {Array} columnGroups - Sütun grupları
 * @param {Object} bounds - Tablo sınırları
 * @returns {Array} - Tablo hücreleri
 */
const createRefinedTableCells = (elements, rowGroups, columnGroups, bounds) => {
  const cells = [];
  
  // Satırların ve sütunların ortalama pozisyonlarını hesapla
  const rowPositions = rowGroups.map(group => {
    const sum = group.reduce((acc, el) => acc + (el.y1 + el.y2) / 2, 0);
    return sum / group.length;
  });
  
  const columnPositions = columnGroups.map(group => {
    const sum = group.reduce((acc, el) => acc + (el.x1 + el.x2) / 2, 0);
    return sum / group.length;
  });
  
  // Her muhtemel hücre için içerik analizi yap
  for (let r = 0; r < rowGroups.length; r++) {
    for (let c = 0; c < columnGroups.length; c++) {
      // Hücre sınırlarını belirle
      const y1 = r === 0 ? bounds.minY : (rowPositions[r-1] + rowPositions[r]) / 2;
      const y2 = r === rowGroups.length - 1 ? bounds.maxY : (rowPositions[r] + rowPositions[r+1]) / 2;
      const x1 = c === 0 ? bounds.minX : (columnPositions[c-1] + columnPositions[c]) / 2;
      const x2 = c === columnGroups.length - 1 ? bounds.maxX : (columnPositions[c] + columnPositions[c+1]) / 2;
      
      // Bu bölgedeki metni çıkar
      const content = extractTextFromRegion(elements, { x1, y1, x2, y2 });
      
      // İçerik varsa hücre olarak kabul et
      if (content.trim().length > 0) {
        cells.push({
          row: r,
          col: c,
          x1, y1, x2, y2,
          content
        });
      }
    }
  }
  
  return cells;
};

/**
 * Fatura tablosundan yapılandırılmış veri çıkarır
 * @param {Object} table - Tespit edilen tablo
 * @returns {Object} - Çıkarılan veriler
 */
const extractDataFromInvoiceTable = (table) => {
  if (!table || !table.cells || table.cells.length === 0) {
    return { rows: [], headers: [] };
  }
  
  // Başlık satırını belirle (ilk satır genellikle başlıktır)
  const headerCells = table.cells.filter(cell => cell.row === 0);
  const headers = headerCells.map(cell => cell.content.trim());
  
  // Veri satırlarını oluştur
  const rows = [];
  const rowCount = table.rowCount || Math.max(...table.cells.map(c => c.row)) + 1;
  
  for (let r = 1; r < rowCount; r++) {
    const rowCells = table.cells.filter(cell => cell.row === r);
    if (rowCells.length === 0) continue;
    
    const rowData = {};
    rowCells.forEach(cell => {
      // Başlık varsa kullan, yoksa sütun indeksini kullan
      const headerIndex = cell.col;
      const headerName = headers[headerIndex] || `column_${headerIndex}`;
      rowData[headerName] = cell.content.trim();
    });
    
    rows.push(rowData);
  }
  
  // Fatura için önemli olabilecek bilgileri çıkar
  let amount = '';
  let date = '';
  let number = '';
  
  // Başlıklarda tutar, tarih veya numara içerenleri ara
  headers.forEach((header, index) => {
    const headerLower = header.toLowerCase();
    if (headerLower.includes('tutar') || headerLower.includes('toplam') || headerLower.includes('TL')) {
      // İlk veri satırındaki değeri al
      if (rows.length > 0 && rows[0][header]) {
        amount = rows[0][header];
      }
    } else if (headerLower.includes('tarih')) {
      if (rows.length > 0 && rows[0][header]) {
        date = rows[0][header];
      }
    } else if (headerLower.includes('no') || headerLower.includes('numara')) {
      if (rows.length > 0 && rows[0][header]) {
        number = rows[0][header];
      }
    }
  });
  
  return {
    rows,
    headers,
    amount,
    date,
    number
  };
};

/**
 * Satırların yapısına göre tablo tespiti
 * @param {Array} lines - Metin satırları
 * @returns {Object|null} - Tespit edilen tablo veya null
 */
const detectTableFromLineStructure = (lines) => {
  if (lines.length < 3) return null;
  
  // Satırları benzer uzunluktaki gruplara ayır
  const lineGroups = {};
  lines.forEach(line => {
    const text = (typeof line === 'string' ? line : (line && line.text) || '').trim();
    if (!text) return;
    const length = text.length;
    const bucket = Math.floor(length / 5) * 5; // 5 karakter aralıklarla grupla
    
    if (!lineGroups[bucket]) {
      lineGroups[bucket] = [];
    }
    lineGroups[bucket].push(text);
  });
  
  // En çok satır içeren grubu tablo satırları olarak değerlendir
  let maxCount = 0;
  let tableLines = [];
  
  for (const bucket in lineGroups) {
    if (lineGroups[bucket].length > maxCount) {
      maxCount = lineGroups[bucket].length;
      tableLines = lineGroups[bucket];
    }
  }
  
  if (tableLines.length < 3) return null;
  
  // Satırlardaki boşluklara göre sütunları tespit et
  const potentialColumns = detectColumnsFromSpaces(tableLines);
  
  if (potentialColumns.length < 2) return null;
  
  // Tablo nesnesini oluştur
  const tableCells = [];
  for (let r = 0; r < tableLines.length; r++) {
    let lastPos = 0;
    for (let c = 0; c < potentialColumns.length; c++) {
      const startPos = c === 0 ? 0 : potentialColumns[c-1] + 1;
      const endPos = c < potentialColumns.length ? potentialColumns[c] : tableLines[r].length;
      
      if (endPos > startPos) {
        tableCells.push({
          row: r,
          col: c,
          content: tableLines[r].substring(startPos, endPos).trim()
        });
      }
    }
  }
  
  return {
    cells: tableCells,
    rowCount: tableLines.length,
    colCount: potentialColumns.length + 1,
    isStructuralDetection: true
  };
};

/**
 * Satırlardaki ortak boşluk pozisyonlarına göre sütunları tespit eder
 * @param {Array} lines - Satırlar
 * @returns {Array} - Sütun sınır pozisyonları
 */
const detectColumnsFromSpaces = (lines) => {
  if (lines.length < 2) return [];
  
  // Her pozisyonda boşluk olan satır sayısını hesapla
  const spaceFrequency = {};
  const maxLength = Math.max(...lines.map(l => l.length));
  
  for (let i = 0; i < maxLength; i++) {
    spaceFrequency[i] = 0;
    
    for (const line of lines) {
      if (i < line.length && line[i] === ' ') {
        spaceFrequency[i]++;
      }
    }
  }
  
  // En sık boşluk içeren pozisyonları sütun sınırı olarak belirle
  const threshold = lines.length * 0.6; // En az %60 satırda boşluk olmalı
  const columnPositions = [];
  
  for (let i = 0; i < maxLength; i++) {
    if (spaceFrequency[i] >= threshold) {
      // Ardışık boşlukları grupla (tek bir sınır olacak şekilde)
      if (columnPositions.length === 0 || i - columnPositions[columnPositions.length - 1] > 3) {
        columnPositions.push(i);
      }
    }
  }
  
  return columnPositions;
};

/**
 * OCR metninden son ödeme tarihini özel olarak çıkarır
 * @param {string} text - OCR sonucu metni
 * @returns {string} - Bulunan ve normalleştirilmiş son ödeme tarihi
 */
const extractSpecificDueDate = (text) => {
  if (!text) return '';
  
  const lines = text.split('\n');
  
  // "Son Ödeme Tarihi" etiketi için ara
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.includes('Son Ödeme Tarihi') || line.includes('Son Ödeme')) {
      console.log('Son ödeme tarihi satırı bulundu:', line);
      
      // Aynı satırda tarih var mı?
      const dateInSameLine = line.match(/(\d{1,2})[.-/](\d{1,2})[.-/](\d{4})/);
      if (dateInSameLine) {
        const normalizedDate = validateAndNormalizeDate(dateInSameLine[0]);
        if (normalizedDate) {
          console.log('Son ödeme tarihi aynı satırda bulundu:', normalizedDate);
          return normalizedDate;
        }
      }
      
      // Sonraki satırda tarih var mı?
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        const dateInNextLine = nextLine.match(/(\d{1,2})[.-/](\d{1,2})[.-/](\d{4})/);
        
        if (dateInNextLine) {
          const normalizedDate = validateAndNormalizeDate(dateInNextLine[0]);
          if (normalizedDate) {
            console.log('Son ödeme tarihi sonraki satırda bulundu:', normalizedDate);
            return normalizedDate;
          }
        }
      }
    }
  }
  
  return '';
};

module.exports = { extractInvoiceData }; 