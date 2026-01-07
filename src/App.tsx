import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface GeneratedContent {
    SEO_DESCRIPTION: string;
    TIMECODES: string;
    YOUTUBE_TITLES: string[];
    TAGS: string[];
    VIDEO_SCRIPT: string;
    SHORTS_SCRIPT: string;
    SOCIAL_POSTS: { Telegram: string; VK: string; };
    title?: string; // Добавим для заголовка в блокноте
}

const API_URL = 'https://food-backend-ai.onrender.com/api/generate'; // Замени на свой URL на Render

const RecipeGenerator: React.FC = () => {
  const [recipeName, setRecipeName] = useState('');
  const [format, setFormat] = useState('видео');
  const [wishes, setWishes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Главные состояния
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const [notebook, setNotebook] = useState<GeneratedContent[]>([]);

  // 1. Загрузка блокнота при старте
  useEffect(() => {
    const saved = localStorage.getItem('food_blogger_notes');
    if (saved) setNotebook(JSON.parse(saved));
  }, []);

  const handleGenerate = async () => {
    if (!recipeName.trim()) return alert('Введите название!');
    setIsLoading(true);
    try {
      const response = await axios.post(API_URL, { recipeName, format, wishes });
      const newContent = { ...response.data, title: recipeName };
      setResult(newContent);
    } catch (err) {
      alert("Ошибка сервера. Проверьте Backend.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Функция сохранения в Блокнот
  const saveToNotebook = () => {
    if (!result) return;
    const updatedNotebook = [result, ...notebook];
    setNotebook(updatedNotebook);
    localStorage.setItem('food_blogger_notes', JSON.stringify(updatedNotebook));
    alert('Сохранено в блокнот!');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      
      {/* --- ЛЕВАЯ ПАНЕЛЬ: БЛОКНОТ --- */}
      <div style={{ width: '300px', borderRight: '1px solid #ddd', padding: '20px', backgroundColor: '#f9f9f9' }}>
        <h2>📒 Блокнот</h2>
        {notebook.length === 0 && <p style={{color: '#999'}}>Пусто</p>}
        {notebook.map((note, index) => (
          <div 
            key={index} 
            onClick={() => setResult(note)} // ПРИ КЛИКЕ ДАННЫЕ ОТКРЫВАЮТСЯ СПРАВА
            style={{ 
              padding: '10px', 
              backgroundColor: result?.title === note.title ? '#ffe4e1' : '#fff',
              border: '1px solid #ddd', 
              borderRadius: '5px', 
              marginBottom: '10px', 
              cursor: 'pointer' 
            }}
          >
            <strong>{note.title}</strong>
          </div>
        ))}
      </div>

      {/* --- ПРАВАЯ ПАНЕЛЬ: ГЕНЕРАТОР --- */}
      <div style={{ flex: 1, padding: '20px' }}>
        <h1>🚀 Помощник Фуд-Блогера</h1>
        
        <div style={{ marginBottom: 20, padding: 15, border: '1px solid #eee', borderRadius: 8 }}>
          <input
            type="text"
            placeholder="Название блюда..."
            value={recipeName}
            onChange={(e) => setRecipeName(e.target.value)}
            style={{ padding: 10, marginBottom: 10, width: '100%', boxSizing: 'border-box' }}
          />
          <button 
            onClick={handleGenerate} 
            disabled={isLoading}
            style={{ padding: '10px 20px', backgroundColor: '#FF6347', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer' }}
          >
            {isLoading ? 'Генерация...' : 'Сгенерировать'}
          </button>
        </div>

        {result && (
          <div style={{ animation: 'fadeIn 0.5s' }}>
            <button 
              onClick={saveToNotebook}
              style={{ padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: 5, marginBottom: 20, cursor: 'pointer' }}
            >
              💾 Сохранить этот пакет в блокнот
            </button>

            <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '10px' }}>
              <h2 style={{ color: '#FF6347' }}>{result.title}</h2>
              <h3>📺 SEO Описание & Таймкоды:</h3>
              <pre style={{ whiteSpace: 'pre-wrap', background: '#f4f4f4', padding: '15px' }}>{result.SEO_DESCRIPTION}</pre>
              <p><strong>Таймкоды:</strong> {result.TIMECODES}</p>
              
              <h3>📱 Соцсети:</h3>
              <p><strong>Telegram:</strong> {result.SOCIAL_POSTS.Telegram}</p>
              
              <h3>🎬 Сценарий Shorts:</h3>
              <p style={{ background: '#e0f7fa', padding: '10px' }}>{result.SHORTS_SCRIPT}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeGenerator;