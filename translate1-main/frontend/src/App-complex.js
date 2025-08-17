import React, { useState, useEffect, useRef } from "react";
import "./App.css";

const App = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('ru');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const selectedLanguageRef = useRef(selectedLanguage);
  
  useEffect(() => {
    // Load messages from localStorage
    const savedMessages = localStorage.getItem('translator-messages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
    
    // Check if speech recognition is supported
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSpeechSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const currentLanguage = selectedLanguageRef.current;
        console.log(`🎤 Voice recognized: "${transcript}" for language: "${currentLanguage}"`);
        setInputText(transcript);
        handleSendMessage(transcript, currentLanguage);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    selectedLanguageRef.current = selectedLanguage;
  }, [selectedLanguage]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const saveMessages = (newMessages) => {
    localStorage.setItem('translator-messages', JSON.stringify(newMessages));
  };
  
  // Enhanced translation function with MyMemory API as fallback
  const translateText = async (text, fromLang, toLang) => {
    setIsLoading(true);
    
    try {
      // First try MyMemory API (free translation service)
      const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.responseData && data.responseData.translatedText) {
          return data.responseData.translatedText;
        }
      }
    } catch (error) {
      console.log('API translation failed, using fallback:', error);
    }
    
    // Fallback to local translations
    const translations = {
      'ru-zh': {
        'привет': '你好',
        'спасибо': '谢谢', 
        'до свидания': '再见',
        'как дела': '你好吗',
        'хорошо': '好的',
        'плохо': '不好',
        'да': '是',
        'нет': '不',
        'пожалуйста': '请',
        'извините': '对不起',
        'я люблю тебя': '我爱你',
        'сколько это стоит': '这要多少钱',
        'где туалет': '厕所在哪里',
        'помогите': '帮帮我',
        'я не понимаю': '我不明白'
      },
      'zh-ru': {
        '你好': 'привет',
        '谢谢': 'спасибо',
        '再见': 'до свидания', 
        '你好吗': 'как дела',
        '好的': 'хорошо',
        '不好': 'плохо',
        '是': 'да',
        '不': 'нет',
        '请': 'пожалуйста',
        '对不起': 'извините',
        '我爱你': 'я люблю тебя',
        '这要多少钱': 'сколько это стоит',
        '厕所在哪里': 'где туалет',
        '帮帮我': 'помогите',
        '我不明白': 'я не понимаю'
      }
    };
    
    const key = `${fromLang}-${toLang}`;
    const translationMap = translations[key] || {};
    
    // Simple word-by-word translation for demo
    const words = text.toLowerCase().split(' ');
    const translatedWords = words.map(word => {
      return translationMap[word] || `[${word}]`;
    });
    
    return translatedWords.join(' ');
  };
  
  const handleSendMessage = async (text = inputText, language = selectedLanguage) => {
    if (!text.trim()) return;
    
    console.log(`📤 Sending message: "${text}" with language: "${language}"`);
    
    setIsLoading(true);
    try {
      // Determine target language for translation
      const targetLanguage = language === 'ru' ? 'zh' : 'ru';
      
      // Translate the message
      const translatedText = await translateText(text, language, targetLanguage);
      
      // Create message with translation
      const message = {
        id: Date.now().toString(),
        text: translatedText,
        original_text: text,
        language: targetLanguage,
        timestamp: new Date().toISOString(),
        is_translated: true
      };
      
      const newMessages = [...messages, message];
      setMessages(newMessages);
      saveMessages(newMessages);
      setInputText('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Ошибка отправки сообщения');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const startRecording = () => {
    if (!speechSupported || !recognitionRef.current) {
      alert('Ваш браузер не поддерживает распознавание речи');
      return;
    }
    
    const currentLanguage = selectedLanguageRef.current;
    console.log(`🎤 Starting recording for language: ${currentLanguage}`);
    
    setIsRecording(true);
    recognitionRef.current.lang = currentLanguage === 'ru' ? 'ru-RU' : 'zh-CN';
    recognitionRef.current.start();
  };
  
  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
  };
  
  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('translator-messages');
  };
  
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto max-w-4xl h-screen flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">🗣️</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                Переводчик Чат
              </h1>
              <p className="text-gray-400 text-sm">Русский ⇄ 中文</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ru">Русский → 中文</option>
              <option value="zh">中文 → Русский</option>
            </select>
            <button
              onClick={clearChat}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Очистить
            </button>
          </div>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🌍</div>
              <h2 className="text-xl text-gray-300 mb-2">Добро пожаловать в переводчик!</h2>
              <p className="text-gray-500">Начните печатать или используйте голосовой ввод для перевода между русским и китайским языками.</p>
            </div>
          )}
          
          {messages.map((message) => (
            <div key={message.id} className="bg-gray-800 rounded-lg shadow-lg p-4 border-l-4 border-blue-500">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">
                    {message.language === 'ru' ? '🇷🇺' : '🇨🇳'}
                  </span>
                  <span className="text-sm text-gray-400">
                    {message.language === 'ru' ? 'Русский' : '中文'}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {formatTime(message.timestamp)}
                </span>
              </div>
              
              {message.original_text && (
                <div className="mb-3 p-3 bg-gray-700 rounded text-sm text-gray-300 border-l-2 border-gray-600">
                  <strong className="text-gray-200">Оригинал:</strong> {message.original_text}
                </div>
              )}
              
              <div className="text-lg text-white">
                {message.text}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-center">
              <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                  <span className="text-gray-300">Перевожу...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input Area */}
        <div className="bg-gray-800 border-t border-gray-700 p-4">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={selectedLanguage === 'ru' ? "Напишите сообщение на русском..." : "用中文写信息..."}
                className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder-gray-400"
                rows="2"
                disabled={isLoading}
              />
            </div>
            
            {speechSupported && (
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isLoading}
                className={`px-4 py-3 rounded-lg font-medium transition-all transform hover:scale-105 ${
                  isRecording
                    ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse shadow-lg shadow-red-600/30'
                    : 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/30'
                } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
              >
                {isRecording ? '⏹️' : '🎤'}
              </button>
            )}
            
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputText.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all transform hover:scale-105 shadow-lg shadow-blue-600/30"
            >
              {isLoading ? '...' : 'Отправить'}
            </button>
          </div>
          
          <div className="mt-3 text-xs text-gray-500 text-center">
            {selectedLanguage === 'ru' 
              ? '🌐 Сообщения переводятся с русского на китайский'
              : '🌐 Сообщения переводятся с китайского на русский'
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;