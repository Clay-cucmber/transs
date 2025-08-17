import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('ru');
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  
  useEffect(() => {
    // Load saved messages
    const saved = localStorage.getItem('translator-messages');
    if (saved) {
      setMessages(JSON.parse(saved));
    }
    
    // Check speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSpeechSupported(true);
    }
  }, []);
  
  const saveMessages = (newMessages) => {
    localStorage.setItem('translator-messages', JSON.stringify(newMessages));
  };
  
  const translateText = async (text, fromLang, toLang) => {
    try {
      // Try MyMemory API first (free translation service)
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
        'мир': '世界',
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
        '世界': 'мир',
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
    
    const words = text.toLowerCase().split(' ');
    const translatedWords = words.map(word => 
      translationMap[word] || `[${word}]`
    );
    
    return translatedWords.join(' ');
  };
  
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    
    const targetLanguage = selectedLanguage === 'ru' ? 'zh' : 'ru';
    const translatedText = await translateText(inputText, selectedLanguage, targetLanguage);
    
    const message = {
      id: Date.now().toString(),
      text: translatedText,
      original_text: inputText,
      language: targetLanguage,
      timestamp: new Date().toISOString(),
    };
    
    const newMessages = [...messages, message];
    setMessages(newMessages);
    saveMessages(newMessages);
    setInputText('');
  };
  
  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('translator-messages');
  };
  
  const startVoiceRecording = () => {
    if (!speechSupported) {
      alert('Голосовой ввод не поддерживается в вашем браузере');
      return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = selectedLanguage === 'ru' ? 'ru-RU' : 'zh-CN';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      setTimeout(async () => await handleSendMessage(), 500);
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };
    
    recognition.start();
  };
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        {/* Header */}
        <div style={{
          background: 'rgba(0,0,0,0.3)',
          padding: '20px',
          borderRadius: '15px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ margin: '0 0 5px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              🗣️ Переводчик Чат
            </h1>
            <p style={{ margin: 0, opacity: 0.8, fontSize: '14px' }}>
              Русский ⇄ 中文
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #4b5563',
                background: '#374151',
                color: 'white'
              }}
            >
              <option value="ru">Русский → 中文</option>
              <option value="zh">中文 → Русский</option>
            </select>
            
            <button
              onClick={clearChat}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: '#dc2626',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              Очистить
            </button>
          </div>
        </div>
        
        {/* Messages */}
        <div style={{
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '15px',
          padding: '20px',
          minHeight: '400px',
          marginBottom: '20px',
          overflowY: 'auto'
        }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', paddingTop: '100px', opacity: 0.6 }}>
              <div style={{ fontSize: '60px', marginBottom: '20px' }}>🌍</div>
              <h3>Добро пожаловать в переводчик!</h3>
              <p>Начните печатать или используйте голосовой ввод</p>
            </div>
          )}
          
          {messages.map((message) => (
            <div key={message.id} style={{
              background: 'rgba(59, 130, 246, 0.1)',
              borderLeft: '4px solid #3b82f6',
              borderRadius: '10px',
              padding: '15px',
              marginBottom: '15px'
            }}>
              <div style={{ 
                fontSize: '12px', 
                opacity: 0.7, 
                marginBottom: '8px',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span>
                  {message.language === 'ru' ? '🇷🇺 Русский' : '🇨🇳 中文'}
                </span>
                <span>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
              
              {message.original_text && (
                <div style={{
                  background: 'rgba(0,0,0,0.2)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  marginBottom: '10px',
                  fontSize: '14px',
                  opacity: 0.8
                }}>
                  <strong>Оригинал:</strong> {message.original_text}
                </div>
              )}
              
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                {message.text}
              </div>
            </div>
          ))}
        </div>
        
        {/* Input */}
        <div style={{
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '15px',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={selectedLanguage === 'ru' ? "Напишите на русском..." : "用中文写..."}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #4b5563',
                background: '#374151',
                color: 'white',
                resize: 'none',
                minHeight: '50px',
                fontSize: '16px'
              }}
              rows="2"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            
            {speechSupported && (
              <button
                onClick={startVoiceRecording}
                disabled={isRecording}
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: isRecording ? '#dc2626' : '#16a34a',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '16px',
                  animation: isRecording ? 'pulse 1s infinite' : 'none'
                }}
              >
                {isRecording ? '⏹️' : '🎤'}
              </button>
            )}
            
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim()}
              style={{
                padding: '12px 20px',
                borderRadius: '10px',
                border: 'none',
                background: inputText.trim() ? '#2563eb' : '#6b7280',
                color: 'white',
                cursor: inputText.trim() ? 'pointer' : 'not-allowed',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              Отправить
            </button>
          </div>
          
          <div style={{ 
            textAlign: 'center', 
            marginTop: '10px', 
            fontSize: '12px', 
            opacity: 0.6 
          }}>
            {selectedLanguage === 'ru' 
              ? '🌐 Переводим с русского на китайский'
              : '🌐 Переводим с китайского на русский'
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;