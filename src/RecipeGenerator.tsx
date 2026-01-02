import React, { useState } from 'react';

export default function RecipeGenerator() {
  const [recipeName, setRecipeName] = useState('');
  const [generatedRecipe, setGeneratedRecipe] = useState('');

  const handleGenerate = () => {
    if (!recipeName) return alert("Введите название!");
    setGeneratedRecipe(`Рецепт для "${recipeName}": Возьмите свежие ингредиенты, смешайте их в глубокой миске и готовьте с любовью 30 минут.`);
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Arial', color: '#333' }}>
      <h1>👨‍🍳 Генератор рецептов</h1>
      <input
        type="text"
        placeholder="Например: Плов или Цезарь"
        value={recipeName}
        onChange={(e) => setRecipeName(e.target.value)}
        style={{ padding: 10, width: 250, borderRadius: 5, border: '1px solid #ccc' }}
      />
      <button 
        onClick={handleGenerate} 
        style={{ marginLeft: 10, padding: 10, cursor: 'pointer', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: 5 }}
      >
        Сгенерировать
      </button>

      {generatedRecipe && (
        <div style={{ marginTop: 20, padding: 15, borderLeft: '5px solid #4CAF50', backgroundColor: '#f9f9f9', maxWidth: 400 }}>
          <h3>Ваш рецепт:</h3>
          <p>{generatedRecipe}</p>
        </div>
      )}
    </div>
  );
}