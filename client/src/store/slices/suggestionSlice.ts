import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api, { USE_MOCK_SERVICES } from '../../services/api';

// API endpoint'i
const API_URL = '/suggestions';

// Suggestion interface
export interface Suggestion {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'implemented' | 'dismissed';
  priority: 'high' | 'medium' | 'low';
  estimated_savings: number;
  impact_level: number;
  difficulty: 'easy' | 'medium' | 'hard';
  time_to_implement: string;
  cost_to_implement?: string;
  implementation_date?: string;
  dismissal_date?: string;
  actual_savings?: number;
  efficiency_gain?: number;
  additional_info?: string;
  source?: 'system' | 'ai'; // Kaynak bilgisi
  purchase_link?: string; // Cihaz satın alma linki
  detected_device_type?: string; // Algılanan cihaz türü
}

// Backend'deki suggestion yapısı
interface BackendSuggestion {
  id: string;
  user_id: string;
  device_id?: string;
  title: string;
  description: string;
  potential_savings_kwh?: number;
  potential_savings_cost?: number;
  status: 'pending' | 'applied' | 'rejected';
  created_at: string;
  updated_at: string;
  source?: 'system' | 'ai'; // Kaynak bilgisi eklendi
  difficulty?: string;
  purchase_link?: string; // Cihaz satın alma linki
  detected_device_type?: string; // Algılanan cihaz türü
}

// Suggestion state interface
interface SuggestionState {
  suggestions: Suggestion[];
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: SuggestionState = {
  suggestions: [],
  isLoading: false,
  error: null
};

// Mock suggestions data
const mockSuggestions: Suggestion[] = [
  {
    id: '1',
    title: 'Buzdolabı sıcaklık ayarı',
    description: 'Buzdolabı sıcaklığını 1-2 derece arttırarak enerji tasarrufu sağlayabilirsiniz.',
    status: 'active',
    priority: 'high',
    estimated_savings: 120,
    impact_level: 4,
    difficulty: 'easy',
    time_to_implement: '5 dakika'
  },
  {
    id: '2',
    title: 'LED aydınlatmaya geçiş',
    description: 'Evinizde hala akkor veya floresan ampul kullanıyorsanız, LED ampullerle değiştirerek %70\'e varan tasarruf sağlayabilirsiniz.',
    status: 'active',
    priority: 'medium',
    estimated_savings: 350,
    impact_level: 5,
    difficulty: 'medium',
    time_to_implement: '1 saat',
    cost_to_implement: '₺150-300'
  },
  {
    id: '3',
    title: 'Çamaşır ve bulaşık makinelerini tam doluyken çalıştırma',
    description: 'Çamaşır ve bulaşık makinelerini her zaman tam dolu olarak çalıştırarak su ve elektrik tasarrufu sağlayabilirsiniz.',
    status: 'implemented',
    priority: 'medium',
    estimated_savings: 150,
    impact_level: 3,
    difficulty: 'easy',
    time_to_implement: 'Hemen',
    implementation_date: '2023-12-10',
    actual_savings: 170,
    efficiency_gain: 12
  },
  {
    id: '4',
    title: 'Stand-by modundaki cihazları tamamen kapatma',
    description: 'Kullanmadığınız elektronik cihazlarınızı bekleme modunda bırakmak yerine tamamen kapatarak yıllık 200-300 TL tasarruf sağlayabilirsiniz.',
    status: 'active',
    priority: 'low',
    estimated_savings: 240,
    impact_level: 2,
    difficulty: 'easy',
    time_to_implement: '5 dakika'
  },
  {
    id: '5',
    title: 'Akıllı termostat kullanımı',
    description: 'Akıllı termostat kurarak ısıtma ve soğutma sistemlerini optimize edebilir, %15\'e varan enerji tasarrufu sağlayabilirsiniz.',
    status: 'dismissed',
    priority: 'high',
    estimated_savings: 500,
    impact_level: 5,
    difficulty: 'hard',
    time_to_implement: '2 saat',
    cost_to_implement: '₺1000-1500',
    dismissal_date: '2023-11-05'
  }
];

// Backend suggestion'larını frontend formatına dönüştürme
const mapBackendSuggestionToFrontend = (backendSuggestion: BackendSuggestion): Suggestion => {
  // Status değerlerini dönüştürme
  let status: 'active' | 'implemented' | 'dismissed';
  switch(backendSuggestion.status) {
    case 'pending':
      status = 'active';
      break;
    case 'applied':
      status = 'implemented';
      break;
    case 'rejected':
      status = 'dismissed';
      break;
    default:
      status = 'active'; // Varsayılan değer
  }

  // Öneri düzeyi ve zorluğunu belirle
  let impact_level = Math.floor(Math.random() * 5) + 1; // 1-5 arası rastgele
  let priority: 'high' | 'medium' | 'low' = 'medium';
  let difficulty: 'easy' | 'medium' | 'hard' = 'medium';
  
  // Backend'den gelen değerleri kullan (varsa)
  if (backendSuggestion.difficulty) {
    // Backend'den gelen difficulty değerini kullan
    const diffLower = backendSuggestion.difficulty.toLowerCase();
    if (['easy', 'medium', 'hard'].includes(diffLower)) {
      difficulty = diffLower as 'easy' | 'medium' | 'hard';
    }
  } else {
    // Rastgele difficulty değeri ata
    const difficultyValues: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard'];
    difficulty = difficultyValues[Math.floor(Math.random() * 3)] as 'easy' | 'medium' | 'hard';
  }
  
  // Difficulty bazında priority belirle
  if (difficulty === 'easy') priority = 'low';
  else if (difficulty === 'medium') priority = 'medium';
  else priority = 'high';

  // Kesin olarak doğru tip döndürülmesini sağla
  const suggestion: Suggestion = {
    id: backendSuggestion.id,
    title: backendSuggestion.title,
    description: backendSuggestion.description,
    status,
    priority,
    estimated_savings: backendSuggestion.potential_savings_kwh || 0,
    impact_level,
    difficulty,
    time_to_implement: '10 dakika', // Sabit değer
    source: backendSuggestion.source, // Kaynak bilgisi aktarılıyor
    purchase_link: backendSuggestion.purchase_link, // Satın alma linki aktarılıyor
    detected_device_type: backendSuggestion.detected_device_type // Cihaz türü aktarılıyor
  };
  
  // Ek alanlar duruma göre eklenir
  if (status === 'implemented') {
    suggestion.implementation_date = backendSuggestion.updated_at.split('T')[0];
  }
  if (status === 'dismissed') {
    suggestion.dismissal_date = backendSuggestion.updated_at.split('T')[0];
  }
  
  return suggestion;
};

// Async thunks
export const fetchSuggestions = createAsyncThunk(
  'suggestions/fetchSuggestions',
  async (_, { rejectWithValue }) => {
    try {
      if (USE_MOCK_SERVICES) {
        // Return mock data
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        return mockSuggestions;
      }
      
      const response = await api.get(API_URL);
      // API yanıtını işle
      const backendSuggestions = response.data.data || [];
      
      // Debug: API'den gelen veriyi logla
      console.log('🔍 API Response Data:', {
        rawData: response.data,
        suggestions: backendSuggestions,
        firstSuggestion: backendSuggestions[0],
        purchaseLinks: backendSuggestions.map((s: any) => ({ id: s.id, title: s.title, purchase_link: s.purchase_link }))
      });
      
      // Backend'den gelen verileri frontend formatına dönüştür
      const frontendSuggestions: Suggestion[] = backendSuggestions.map(mapBackendSuggestionToFrontend);
      
      // Debug: Dönüştürülmüş veriyi logla
      console.log('🔍 Mapped Frontend Suggestions:', {
        suggestions: frontendSuggestions,
        purchaseLinks: frontendSuggestions.map(s => ({ id: s.id, title: s.title, purchase_link: s.purchase_link }))
      });
      
      return frontendSuggestions;
    } catch (error: any) {
      console.error('Suggestion fetch error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch suggestions');
    }
  }
);

export const implementSuggestion = createAsyncThunk(
  'suggestions/implementSuggestion',
  async (id: string, { rejectWithValue }) => {
    try {
      if (USE_MOCK_SERVICES) {
        // Implement suggestion in mock data
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
        const suggestion = mockSuggestions.find(s => s.id === id);
        if (!suggestion) {
          throw new Error('Suggestion not found');
        }
        
        return {
          ...suggestion,
          status: 'implemented',
          implementation_date: new Date().toISOString().split('T')[0],
          actual_savings: suggestion.estimated_savings * (0.9 + Math.random() * 0.3), // Random actual savings around estimated
          efficiency_gain: Math.floor(Math.random() * 20)
        } as Suggestion;
      }
      
      // Backend'de status değerini 'applied' olarak güncelle
      const response = await api.put(`${API_URL}/${id}/apply`);
      
      // Dönen backend verilerini frontend formatına dönüştür
      const updatedSuggestion = mapBackendSuggestionToFrontend(response.data.data);
      return {
        ...updatedSuggestion,
        status: 'implemented' as 'implemented', // Type assertion ekle
        implementation_date: new Date().toISOString().split('T')[0],
        actual_savings: updatedSuggestion.estimated_savings * (0.9 + Math.random() * 0.3),
        efficiency_gain: Math.floor(Math.random() * 20)
      } as Suggestion;
    } catch (error: any) {
      console.error('Implement suggestion error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to implement suggestion');
    }
  }
);

export const dismissSuggestion = createAsyncThunk(
  'suggestions/dismissSuggestion',
  async (id: string, { rejectWithValue }) => {
    try {
      if (USE_MOCK_SERVICES) {
        // Dismiss suggestion in mock data
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
        const suggestion = mockSuggestions.find(s => s.id === id);
        if (!suggestion) {
          throw new Error('Suggestion not found');
        }
        
        return {
          ...suggestion,
          status: 'dismissed',
          dismissal_date: new Date().toISOString().split('T')[0]
        } as Suggestion;
      }
      
      // Backend'de status değerini 'rejected' olarak güncelle
      const response = await api.put(`${API_URL}/${id}/reject`);
      
      // Dönen backend verilerini frontend formatına dönüştür
      const updatedSuggestion = mapBackendSuggestionToFrontend(response.data.data);
      return {
        ...updatedSuggestion,
        status: 'dismissed' as 'dismissed', // Type assertion ekle
        dismissal_date: new Date().toISOString().split('T')[0]
      } as Suggestion;
    } catch (error: any) {
      console.error('Dismiss suggestion error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to dismiss suggestion');
    }
  }
);

export const updateSuggestionResults = createAsyncThunk(
  'suggestions/updateResults',
  async ({ id, data }: { id: string; data: { actual_savings: number; efficiency_gain: number } }, { rejectWithValue }) => {
    try {
      if (USE_MOCK_SERVICES) {
        // Update suggestion results in mock data
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
        const suggestion = mockSuggestions.find(s => s.id === id);
        if (!suggestion) {
          throw new Error('Suggestion not found');
        }
        
        return {
          ...suggestion,
          actual_savings: data.actual_savings,
          efficiency_gain: data.efficiency_gain
        };
      }
      
      const response = await api.put(`${API_URL}/${id}/results`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update suggestion results');
    }
  }
);

// Devices sayfasında eklenen cihazlara göre öneri oluşturma
export const generateSuggestionsFromDevices = createAsyncThunk(
  'suggestions/generateSuggestionsFromDevices',
  async (_, { rejectWithValue }) => {
    try {
      if (USE_MOCK_SERVICES) {
        // Mock veri için yapay bir gecikme
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockSuggestions;
      }
      
      // API'ye POST isteği gönder
      const response = await api.post(`${API_URL}/generate`);
      
      // API yanıtını işle ve frontend formatına dönüştür
      const backendSuggestions = response.data.data || [];
      const frontendSuggestions: Suggestion[] = backendSuggestions.map(mapBackendSuggestionToFrontend);
      return frontendSuggestions;
    } catch (error: any) {
      console.error('Generate suggestions error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to generate suggestions');
    }
  }
);

// Önerileri temizlemek için yeni thunk
export const clearSuggestions = createAsyncThunk(
  'suggestions/clearSuggestions',
  async (status: string | null, { rejectWithValue }) => {
    try {
      if (USE_MOCK_SERVICES) {
        // Mock veri için yapay bir gecikme
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Mock durumunda doğrudan şu anki state'deki değişiklikleri yap
        console.log('Mock: Temizleme işlemi başarılı sayıldı, status:', status);
        return { deletedCount: 5, originalStatus: status };
      }
      
      // API'ye DELETE isteği gönder
      console.log('API URL:', API_URL);
      console.log('Temizlenecek status:', status);
      
      // Status parametresini doğru şekilde dönüştür
      let backendStatus = null;
      let sourceParam = null;
      
      // AI önerileri için özel işleme
      if (status && status.startsWith('ai_')) {
        sourceParam = 'ai';
        
        if (status === 'ai_active') {
          backendStatus = 'pending'; // Backend'de active yerine pending kullanılıyor olabilir
        } else if (status === 'ai_implemented') {
          backendStatus = 'applied'; // Backend'de implemented yerine applied kullanılıyor olabilir
        } else if (status === 'ai_dismissed') {
          backendStatus = 'rejected'; // Backend'de dismissed yerine rejected kullanılıyor olabilir
        }
        // ai_all için backendStatus null kalacak (tüm AI önerileri)
      } else if (status === 'active') {
        // Backend'de 'active' yerine 'pending' kullanılıyor olabilir
        backendStatus = 'pending';
      } else if (status === 'implemented') {
        backendStatus = 'applied';
      } else if (status === 'dismissed') {
        backendStatus = 'rejected';
      }
      
      // URL'yi oluştur
      let endpoint = `${API_URL}/clear`;
      let params = [];
      
      if (backendStatus) {
        params.push(`status=${backendStatus}`);
      }
      
      if (sourceParam) {
        params.push(`source=${sourceParam}`);
      }
      
      if (params.length > 0) {
        endpoint += `?${params.join('&')}`;
      }
      
      console.log('Clear endpoint:', endpoint);
      
      try {
        const response = await api.delete(endpoint);
        console.log('Clear response:', response.data);
        
        // Başarılı yanıt kontrolü yapalım
        if (response.data.status !== 'success') {
          return rejectWithValue(response.data.message || 'Failed to clear suggestions');
        }
        
        // Başarılı yanıt
        return {
          deletedCount: response.data.data?.deletedCount || 0,
          originalStatus: status // Orijinal status değerini de dönelim
        };
      } catch (apiError: any) {
        console.error('API error during clearing suggestions:', apiError);
        
        // API hatası olsa bile frontend'de silme işlemini gerçekleştirmek için
        // başarılı gibi dönelim (bu sayede UI güncellenecek)
        console.log('API hatası oldu, ama frontend güncellemesi yapılacak');
        return {
          deletedCount: 0,
          originalStatus: status,
          forceClear: true // Frontend'de zorla temizleme yapılması için flag
        };
      }
    } catch (error: any) {
      console.error('Clear suggestions error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to clear suggestions');
    }
  }
);

// Generate AI Suggestions
export const generateAiSuggestions = createAsyncThunk(
  'suggestions/generateAiSuggestions',
  async (_, { rejectWithValue }) => {
    try {
      // AI önerileri oluşturmak için API çağrısı
      const response = await api.post(`${API_URL}/generate-ai`);
      
      // API yanıtını işle
      const generatedSuggestions = response.data.data || [];
      
      // Backend'den gelen verileri frontend formatına dönüştür
      const frontendSuggestions: Suggestion[] = generatedSuggestions.map(mapBackendSuggestionToFrontend);
      
      return frontendSuggestions;
    } catch (error: any) {
      console.error('AI suggestion generation error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to generate AI suggestions');
    }
  }
);

// Slice oluşturma
const suggestionSlice = createSlice({
  name: 'suggestions',
  initialState,
  reducers: {
    // Yerel durum güncellemeleri için reducerlar
    resetSuggestions: (state) => {
      state.suggestions = [];
      state.isLoading = false;
      state.error = null;
    },
    // Öneriler durumunu manuel olarak güncelleme
    manualUpdate: (state, action) => {
      console.log('Manuel güncelleme yapılıyor:', action.payload.length);
      state.suggestions = action.payload;
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchSuggestions
      .addCase(fetchSuggestions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSuggestions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.suggestions = action.payload;
      })
      .addCase(fetchSuggestions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to fetch suggestions';
      })
      
      // implementSuggestion
      .addCase(implementSuggestion.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(implementSuggestion.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedSuggestion = action.payload as Suggestion;
        state.suggestions = state.suggestions.map(suggestion => 
          suggestion.id === updatedSuggestion.id ? updatedSuggestion : suggestion
        );
      })
      .addCase(implementSuggestion.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to implement suggestion';
      })
      
      // dismissSuggestion
      .addCase(dismissSuggestion.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(dismissSuggestion.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedSuggestion = action.payload as Suggestion;
        state.suggestions = state.suggestions.map(suggestion => 
          suggestion.id === updatedSuggestion.id ? updatedSuggestion : suggestion
        );
      })
      .addCase(dismissSuggestion.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to dismiss suggestion';
      })
      
      // generateSuggestionsFromDevices
      .addCase(generateSuggestionsFromDevices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateSuggestionsFromDevices.fulfilled, (state, action) => {
        state.isLoading = false;
        // Yeni önerileri ekle, aynı ID'li önerileri güncelle
        const newSuggestions = action.payload as Suggestion[];
        const existingIds = state.suggestions.map(s => s.id);
        
        newSuggestions.forEach(suggestion => {
          if (existingIds.includes(suggestion.id)) {
            // Mevcut öneriyi güncelle
            state.suggestions = state.suggestions.map(s => 
              s.id === suggestion.id ? suggestion : s
            );
          } else {
            // Yeni öneri ekle
            state.suggestions.push(suggestion);
          }
        });
      })
      .addCase(generateSuggestionsFromDevices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to generate suggestions';
      })
      
      // clearSuggestions
      .addCase(clearSuggestions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(clearSuggestions.fulfilled, (state, action) => {
        state.isLoading = false;
        console.log('Reducer - clearSuggestions fulfilled:', action.payload);
        
        // Temizlenecek durumdaki önerileri kaldır
        // Payload'dan gelen originalStatus'u kullan
        const originalStatus = action.payload.originalStatus;
        const forceClear = action.payload.forceClear;
        
        if (originalStatus) {
          console.log('Temizlenecek status:', originalStatus);
          // AI önerileri temizleme
          if (originalStatus.startsWith('ai_')) {
            if (originalStatus === 'ai_active') {
              console.log('AI aktif öneriler temizleniyor');
              const beforeCount = state.suggestions.length;
              state.suggestions = state.suggestions.filter(suggestion => 
                !(suggestion.source === 'ai' && suggestion.status === 'active')
              );
              console.log(`Filtreleme sonrası: ${beforeCount} -> ${state.suggestions.length}`);
              
              // Zorla temizleme yapılacaksa (API hatası durumunda)
              if (forceClear) {
                console.log('Zorla AI aktif öneriler temizleniyor');
                state.suggestions = state.suggestions.filter(suggestion => 
                  !(suggestion.source === 'ai' && suggestion.status === 'active')
                );
              }
            } else if (originalStatus === 'ai_implemented') {
              console.log('AI uygulanmış öneriler temizleniyor');
              const beforeCount = state.suggestions.length;
              state.suggestions = state.suggestions.filter(suggestion => 
                !(suggestion.source === 'ai' && suggestion.status === 'implemented')
              );
              console.log(`Filtreleme sonrası: ${beforeCount} -> ${state.suggestions.length}`);
              
              // Zorla temizleme yapılacaksa
              if (forceClear) {
                console.log('Zorla AI implemented öneriler temizleniyor');
                state.suggestions = state.suggestions.filter(suggestion => 
                  !(suggestion.source === 'ai' && suggestion.status === 'implemented')
                );
              }
            } else if (originalStatus === 'ai_dismissed') {
              console.log('AI reddedilmiş öneriler temizleniyor');
              const beforeCount = state.suggestions.length;
              state.suggestions = state.suggestions.filter(suggestion => 
                !(suggestion.source === 'ai' && suggestion.status === 'dismissed')
              );
              console.log(`Filtreleme sonrası: ${beforeCount} -> ${state.suggestions.length}`);
              
              // Zorla temizleme yapılacaksa
              if (forceClear) {
                console.log('Zorla AI dismissed öneriler temizleniyor');
                state.suggestions = state.suggestions.filter(suggestion => 
                  !(suggestion.source === 'ai' && suggestion.status === 'dismissed')
                );
              }
            } else if (originalStatus === 'ai_all') {
              console.log('Tüm AI öneriler temizleniyor');
              const beforeCount = state.suggestions.length;
              state.suggestions = state.suggestions.filter(suggestion => 
                suggestion.source !== 'ai'
              );
              console.log(`Filtreleme sonrası: ${beforeCount} -> ${state.suggestions.length}`);
              
              // Zorla temizleme yapılacaksa
              if (forceClear) {
                console.log('Zorla tüm AI öneriler temizleniyor');
                state.suggestions = state.suggestions.filter(suggestion => 
                  suggestion.source !== 'ai'
                );
              }
            }
          } else if (originalStatus === 'active') {
            console.log('Aktif öneriler temizleniyor');
            const beforeCount = state.suggestions.length;
            // Normal aktif öneriler için source !== 'ai' kontrolü ekleyelim
            state.suggestions = state.suggestions.filter(suggestion => 
              !(suggestion.status === 'active' && suggestion.source !== 'ai')
            );
            console.log(`Filtreleme sonrası: ${beforeCount} -> ${state.suggestions.length}`);
            
            // Zorla temizleme yapılacaksa
            if (forceClear) {
              console.log('Zorla aktif öneriler temizleniyor');
              state.suggestions = state.suggestions.filter(suggestion => 
                !(suggestion.status === 'active' && suggestion.source !== 'ai')
              );
            }
          } else if (originalStatus.includes(',')) {
            // Virgülle ayrılmış birden fazla status varsa
            const statusList = originalStatus.split(',');
            console.log('Birden fazla status temizleniyor:', statusList);
            state.suggestions = state.suggestions.filter(suggestion => 
              !statusList.includes(suggestion.status)
            );
          } else {
            console.log('Tek status temizleniyor:', originalStatus);
            // Tek bir status değeri varsa
            state.suggestions = state.suggestions.filter(suggestion => 
              suggestion.status !== originalStatus
            );
          }
        } else {
          console.log('Tüm öneriler temizleniyor');
          // Tüm önerileri temizle
          state.suggestions = [];
        }
      })
      .addCase(clearSuggestions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to clear suggestions';
      })
      
      // Generate AI Suggestions
      .addCase(generateAiSuggestions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateAiSuggestions.fulfilled, (state, action: PayloadAction<Suggestion[]>) => {
        state.isLoading = false;
        // Yeni AI önerilerini ekle, diğerlerini tut
        const existingIds = new Set(state.suggestions.map(s => s.id));
        
        // Gelen önerilerin doğru formatta olduğundan emin ol
        const newSuggestions = action.payload.filter(s => !existingIds.has(s.id));
        
        console.log('Eklenen yeni AI önerileri:', newSuggestions.length);
        console.log('Örnek öneri:', newSuggestions[0]);
        
        // Önerileri state'e ekle
        state.suggestions = [...state.suggestions, ...newSuggestions];
      })
      .addCase(generateAiSuggestions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetSuggestions, manualUpdate } = suggestionSlice.actions;
export default suggestionSlice.reducer; 