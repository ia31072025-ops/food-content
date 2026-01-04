import React, { useState } from 'react';
import './App.css';

// ТВОЙ АКТУАЛЬНЫЙ АДРЕС БЭКЕНДА
const BACKEND_URL = 'https://food-backend-ai.onrender.com/generate';

function App() {
  const [dish, setDish] = useState('');
  const [recipe, setRecipe] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateRecipe = async () => {
    if (!dish.trim()) return;
    
    setLoading(true);
    setError('');
    setRecipe('');

    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dish }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Ошибка сервера');
      }

      setRecipe(data.recipe);
    } catch (err: any) {
      console.error('Network error:', err);
      setError(err.message === 'Failed to fetch' 
        ? 'Не удалось связаться с сервером. Убедитесь, что бэкенд запущен.' 
        : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App" style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>👨‍🍳 AI Шеф-повар</h1>
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={dish}
          onChange={(e) => setDish(e.target.value)}
          placeholder="Что приготовим? (например: Плов)"
          style={{ padding: '10px', width: '250px' }}
        />
        <button 
          onClick={generateRecipe} 
          disabled={loading}
          style={{ padding: '10px 20px', marginLeft: '10px', cursor: 'pointer' }}
        >
          {loading ? 'Думаю...' : 'Получить рецепт'}
        </button>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '20px' }}>⚠️ {error}</div>}

      {recipe && (
        <div style={{ 
          textAlign: 'left', 
          backgroundColor: '#f9f9f9', 
          padding: '20px', 
          borderRadius: '8px',
          whiteSpace: 'pre-wrap' 
        }}>
          <h2>Рецепт:</h2>
          {recipe}
        </div>
      )}
    </div>
  );
}

export default App;