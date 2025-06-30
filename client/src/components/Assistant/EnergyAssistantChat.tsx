import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Box, 
  TextField, 
  IconButton, 
  Paper, 
  Typography, 
  Divider,
  Button,
  CircularProgress,
  Menu,
  MenuItem,
  useTheme,
  Tooltip
} from '@mui/material';
import { 
  Send as SendIcon,
  Translate as TranslateIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import api from '../../services/api';
import assistantConfig from '../../config/assistantConfig';
import UserMessage from './UserMessage';
import AssistantMessage from './AssistantMessage';

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface EnergyAssistantChatProps {
  selectedLanguage: string;
  setSelectedLanguage: (language: string) => void;
}

const EnergyAssistantChat: React.FC<EnergyAssistantChatProps> = ({ 
  selectedLanguage,
  setSelectedLanguage
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [languageMenu, setLanguageMenu] = useState<null | HTMLElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Get language-specific configurations
  const langConfig = assistantConfig.langs.find(lang => lang['lang-code'] === selectedLanguage) || assistantConfig.langs[0];
  
  // Add initial assistant message on first load
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome-message',
          content: langConfig.message,
          role: 'assistant',
          timestamp: new Date()
        }
      ]);
    }
  }, []);
  
  // Update initial message when language changes
  useEffect(() => {
    if (messages.length > 0 && messages[0].id === 'welcome-message') {
      setMessages(prev => [
        {
          ...prev[0],
          content: langConfig.message
        },
        ...prev.slice(1)
      ]);
    }
  }, [selectedLanguage]);
  
  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Function to send message to assistant
  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      role: 'user',
      timestamp: new Date()
    };
    
    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);
    
    try {
      // Call the API to detect language and get assistant response
      const response = await api.post('/assistant/chat', {
        message: userMessage.content,
        language: selectedLanguage
      });
      
      // Add assistant response to chat
      if (response.data.status === 'success') {
        const assistantResponse: ChatMessage = {
          id: `response-${Date.now()}`,
          content: response.data.data.text,
          role: 'assistant',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantResponse]);
        
        // If language was detected, update the selected language
        if (response.data.data.detectedLanguage && 
            response.data.data.detectedLanguage !== selectedLanguage) {
          setSelectedLanguage(response.data.data.detectedLanguage);
        }
      } else {
        throw new Error(response.data.message || 'Failed to get response from assistant');
      }
    } catch (err: any) {
      console.error('Error sending message to assistant:', err);
      let errorMessage = 'Failed to communicate with the assistant. Please try again.';
      
      // Authentication error
      if (err.response && err.response.status === 401) {
        errorMessage = selectedLanguage === 'tr-TR' 
          ? 'Lütfen önce giriş yapın. Asistan ile konuşmak için hesabınıza giriş yapmanız gerekiyor.'
          : 'Please log in first. You need to be logged in to chat with the assistant.';
      }
      // 404 error
      else if (err.response && err.response.status === 404) {
        errorMessage = selectedLanguage === 'tr-TR'
          ? 'Asistan şu anda kullanılamıyor. Lütfen tekrar deneyin. Hata: API endpoint bulunamadı.'
          : 'The assistant is currently unavailable. Please try again. Error: API endpoint not found.';
      }
      // 500 or other errors
      else {
        errorMessage = selectedLanguage === 'tr-TR'
          ? 'Asistan ile iletişim kurulamadı. Lütfen tekrar deneyin.'
          : 'Failed to communicate with the assistant. Please try again.';
      }
      
      setError(errorMessage);
      
      // Add error message as assistant response
      const errorResponse: ChatMessage = {
        id: `error-${Date.now()}`,
        content: errorMessage,
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  
  // Handle key press (Enter to send)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  // Handle language menu
  const handleOpenLanguageMenu = (event: React.MouseEvent<HTMLElement>) => {
    setLanguageMenu(event.currentTarget);
  };
  
  const handleCloseLanguageMenu = () => {
    setLanguageMenu(null);
  };
  
  const handleLanguageChange = (langCode: string) => {
    setSelectedLanguage(langCode);
    handleCloseLanguageMenu();
  };
  
  // Handle predefined question click
  const handleQuestionClick = (question: string) => {
    setInputValue(question);
  };
  
  // Scroll predefined questions container
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };
  
  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        border: 1,
        borderColor: 'divider',
        borderRadius: '12px',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.02)'
        }}
      >
        <Typography variant="h6">
          {t('navigation.assistant')}
        </Typography>
        
        {/* Language selector */}
        <Tooltip title={t('settings.language')}>
          <IconButton color="primary" onClick={handleOpenLanguageMenu}>
            <TranslateIcon />
          </IconButton>
        </Tooltip>
        <Menu
          id="language-menu"
          anchorEl={languageMenu}
          open={Boolean(languageMenu)}
          onClose={handleCloseLanguageMenu}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          {assistantConfig.langs.map((lang) => (
            <MenuItem 
              key={lang['lang-code']} 
              onClick={() => handleLanguageChange(lang['lang-code'])}
              selected={selectedLanguage === lang['lang-code']}
            >
              {lang['lang-name']}
            </MenuItem>
          ))}
        </Menu>
      </Box>
      
      {/* Messages Container */}
      <Box
        sx={{
          p: 2,
          flexGrow: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {messages.map((message) => (
          message.role === 'user' ? (
            <UserMessage key={message.id} message={message.content} />
          ) : (
            <AssistantMessage 
              key={message.id} 
              message={message.content} 
              isError={message.id.startsWith('error-')}
            />
          )
        ))}
        
        {isLoading && (
          <AssistantMessage message="" isLoading={true} />
        )}
        
        <div ref={messagesEndRef} />
      </Box>
      
      {/* Predefined Questions Scroll Container */}
      <Box sx={{ px: 2, py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <IconButton
            size="small"
            onClick={scrollLeft}
            sx={{ flexShrink: 0 }}
          >
            <ChevronLeftIcon />
          </IconButton>
          
          <Box
            ref={scrollContainerRef}
            sx={{
              display: 'flex',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': {
                display: 'none'
              },
              gap: 1,
              mx: 1,
              pb: 0.5
            }}
          >
            {langConfig.questions.map((q, index) => (
              <Button
                key={index}
                variant="outlined"
                size="small"
                onClick={() => handleQuestionClick(q.question)}
                sx={{
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  fontSize: '0.8rem',
                  py: 0.5
                }}
              >
                {q.buttonName}
              </Button>
            ))}
          </Box>
          
          <IconButton
            size="small"
            onClick={scrollRight}
            sx={{ flexShrink: 0 }}
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>
        
        <Divider />
      </Box>
      
      {/* Input Container */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          borderTop: 1,
          borderColor: 'divider'
        }}
      >
        <TextField
          fullWidth
          placeholder={langConfig.placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          variant="outlined"
          size="small"
          disabled={isLoading}
          multiline
          maxRows={4}
          sx={{
            mr: 1,
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px'
            }
          }}
        />
        <IconButton
          color="primary"
          onClick={sendMessage}
          disabled={!inputValue.trim() || isLoading}
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark
            },
            '&.Mui-disabled': {
              backgroundColor: theme.palette.action.disabledBackground,
              color: theme.palette.action.disabled
            }
          }}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
        </IconButton>
      </Box>
    </Paper>
  );
};

export default EnergyAssistantChat; 