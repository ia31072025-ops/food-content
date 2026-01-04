import React, { useState, ChangeEvent } from 'react';

// Описываем, какие данные придут от сервера
interface RecipeData {
  title: string;
  ingredients: string[];
  description: string;
  youtubeSEO: { tags: string; description: string; };
  socialPosts: { tg: string; vk: string; };
}

export default function App() {
  const [recipeName, setRecipeName] = useState<string>('');
  const [data, setData] = useState<RecipeData | null>(null);
  const [activeTab, setActiveTab] = useState<string>('recipe');
  const [loading, setLoading] = useState<boolean>(false);

  const handleGenerate = async () => {
    if (!recipeName.trim()) return alert("Введите название блюда!");

    setLoading(true);
    setData(null);

    try {
      // ВАЖНО: используем локальный адрес, так как сервер запущен у тебя в терминале
      const response = await fetch('http://localhost:10000/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ dishName: recipeName.trim() })
      });

      if (!response.ok) {
        throw new Error('Ошибка сервера');
      }

      const result: RecipeData = await response.json();
      setData(result);
    } catch (error) {
      console.error(error);
      alert("Сервер не отвечает. Убедись, что в терминале запущен 'node server.js'");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f7f6', borderRadius: '15px' }}>
      <h1 style={{ textAlign: 'center', color: '#2c3e50' }}>👨‍🍳 Food Content AI</h1>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Например: Паста Карбонара"
          value={recipeName}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setRecipeName(e.target.value)}
          style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
          disabled={loading}
        />
        <button 
          onClick={handleGenerate} 
          disabled={loading}
          style={{ padding: '12px 20px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {loading ? 'ГОТОВИМ...' : 'ГЕНЕРИРОВАТЬ'}
        </button>
      </div>

      {data && (
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
          {/* Кнопки переключения вкладок */}
          <div style={{ display: 'flex', gap: '5px', marginBottom: '20px' }}>
            <button onClick={() => setActiveTab('recipe')} style={{ padding: '8px 15px', cursor: 'pointer', backgroundColor: activeTab === 'recipe' ? '#2c3e50' : '#eee', color: activeTab === 'recipe' ? 'white' : '#000' }}>Рецепт</button>
            <button onClick={() => setActiveTab('seo')} style={{ padding: '8px 15px', cursor: 'pointer', backgroundColor: activeTab === 'seo' ? '#2c3e50' : '#eee', color: activeTab === 'seo' ? 'white' : '#000' }}>YouTube SEO</button>
            <button onClick={() => setActiveTab('social')} style={{ padding: '8px 15px', cursor: 'pointer', backgroundColor: activeTab === 'social' ? '#2c3e50' : '#eee', color: activeTab === 'social' ? 'white' : '#000' }}>Соцсети</button>
          </div>

          {/* Содержимое вкладок */}
          {activeTab === 'recipe' && (
            <div>
              <h2 style={{ color: '#e74c3c' }}>{data.title}</h2>
              <p><strong>Ингредиенты:</strong></p>
              <ul>
                {data.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
              </ul>
              <p style={{ whiteSpace: 'pre-wrap' }}><strong>Инструкция:</strong><br/>{data.description}</p>
            </div>
          )}

          {activeTab === 'seo' && (
            <div>
              <p><strong>Теги:</strong> {data.youtubeSEO.tags}</p>
              <p style={{ whiteSpace: 'pre-wrap' }}><strong>Описание для YouTube:</strong><br/>{data.youtubeSEO.description}</p>
            </div>
          )}

          {activeTab === 'social' && (
            <div>
              <h3>Telegram:</h3>
              <p style={{ whiteSpace: 'pre-wrap', backgroundColor: '#f9f9f9', padding: '10px' }}>{data.socialPosts.tg}</p>
              <h3>VK:</h3>
              <p style={{ whiteSpace: 'pre-wrap', backgroundColor: '#f9f9f9', padding: '10px' }}>{data.socialPosts.vk}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}