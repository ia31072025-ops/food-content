import React, { useState } from 'react';

export default function RecipeGenerator() {
  const [recipeName, setRecipeName] = useState('');
  const [generatedRecipe, setGeneratedRecipe] = useState('');
  const [loading, setLoading] = useState(false); // Состояние загрузки

  const handleGenerate = async () => {
    if (!recipeName) return alert("Введите название!");
    
    setLoading(true);
    setGeneratedRecipe('');

    try {
      // ЗАПРОС К ТВОЕМУ СЕРВЕРУ НА RENDER
      const response = await fetch('https://food-content.onrender.com/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: recipeName }), // Отправляем название блюда
      });

      const data = await response.json();

      if (data.recipe) {
        setGeneratedRecipe(data.recipe);
      } else {
        setGeneratedRecipe('Ошибка: Сервер не прислал рецепт.');
      }
    } catch (error) {
      console.error("Ошибка:", error);
      setGeneratedRecipe('Не удалось связаться с сервером. Проверьте соединение.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Arial', color: '#333' }}>
      <h1>👨‍🍳 Генератор рецептов AI</h1>
      <input
        type="text"
        placeholder="Например: Плов или Цезарь"
        value={recipeName}
        onChange={(e) => setRecipeName(e.target.value)}
        style={{ padding: 10, width: 250, borderRadius: 5, border: '1px solid #ccc' }}
        disabled={loading}
      />
      <button 
        onClick={handleGenerate} 
        disabled={loading}
        style={{ 
          marginLeft: 10, 
          padding: 10, 
          cursor: loading ? 'not-allowed' : 'pointer', 
          backgroundColor: loading ? '#ccc' : '#4CAF50', 
          color: 'white', 
          border: 'none', 
          borderRadius: 5 
        }}
      >
        {loading ? 'Думаю...' : 'Сгенерировать'}
      </button>

      {generatedRecipe && (
        <div style={{ marginTop: 20, padding: 15, borderLeft: '5px solid #4CAF50', backgroundColor: '#f9f9f9', maxWidth: 600, whiteSpace: 'pre-wrap' }}>
          <h3>Ваш рецепт от ИИ:</h3>
          <p>{generatedRecipe}</p>
        </div>
      )}
    </div>
  );
}