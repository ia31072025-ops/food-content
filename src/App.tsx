import React, { useState, ChangeEvent } from 'react';

// Тип для хранения всех данных рецепта (теперь они приходят из OpenAI)
interface RecipeData {
  title: string;
  ingredients: string[];
  description: string;
  youtubeSEO: {
    tags: string;
    description: string;
  };
  socialPosts: {
    tg: string;
    vk: string;
  };
}

export default function App() {
  const [recipeName, setRecipeName] = useState<string>('');
  const [data, setData] = useState<RecipeData | null>(null);
  const [activeTab, setActiveTab] = useState<string>('recipe');
  const [loading, setLoading] = useState<boolean>(false); // Состояние загрузки

  const handleGenerate = async () => {
    if (!recipeName.trim()) return alert("Введите название блюда!");

    setLoading(true); // Включаем режим ожидания
    setData(null);    // Сбрасываем старые данные

    try {
      // Отправляем запрос на твой сервер Node.js (порт 5000)
      const response = await fetch('http://localhost:5000/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dishName: recipeName })
      });

      if (!response.ok) {
        throw new Error('Ошибка сервера или проблемы с API ключом');
      }

      const result: RecipeData = await response.json();
      setData(result); // Записываем реальные данные от ИИ в память
    } catch (error) {
      console.error("Ошибка связи с сервером:", error);
      alert("Сервер не отвечает. Убедись, что в терминале запущен 'node server.js'");
    } finally {
      setLoading(false); // Выключаем режим ожидания
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Скопировано в буфер обмена!");
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#f4f7f6', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
      <h1 style={{ textAlign: 'center', color: '#2c3e50' }}>🎬 Food Content Creator Hub</h1>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        <input
          type="text"
          placeholder="Например: Плов в казане"
          value={recipeName}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setRecipeName(e.target.value)}
          style={{ flex: 1, padding: '15px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '16px' }}
          disabled={loading}
        />
        <button 
          onClick={handleGenerate} 
          disabled={loading}
          style={{ 
            padding: '0 25px', 
            backgroundColor: loading ? '#95a5a6' : '#e74c3c', 
            color: 'white', 
            border: 'none', 
            borderRadius: '10px', 
            cursor: loading ? 'not-allowed' : 'pointer', 
            fontWeight: 'bold' 
          }}
        >
          {loading ? 'ГЕНЕРИРУЮ...' : 'ГЕНЕРИРОВАТЬ'}
        </button>
      </div>

      {/* Показываем результат, только если данные получены */}
      {data && (
        <div>
          {/* Переключатель вкладок */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
            {['recipe', 'seo', 'social'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{ 
                  padding: '10px 20px', 
                  borderRadius: '20px', 
                  border: 'none', 
                  backgroundColor: activeTab === tab ? '#2c3e50' : '#ddd',
                  color: activeTab === tab ? 'white' : '#333',
                  cursor: 'pointer'
                }}
              >
                {tab === 'recipe' ? '📜 Рецепт' : tab === 'seo' ? '📺 YouTube SEO' : '📱 Соцсети'}
              </button>
            ))}
          </div>

          {/* Содержимое вкладок */}
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #eee' }}>
            
            {activeTab === 'recipe' && (
              <div>
                <h2 style={{ color: '#e74c3c' }}>{data.title}</h2>
                <h4>🛒 Ингредиенты:</h4>
                <ul>{data.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}</ul>
                <h4>👨‍🍳 Описание:</h4>
                <p style={{ lineHeight: '1.6' }}>{data.description}</p>
              </div>
            )}

            {activeTab === 'seo' && (
              <div>
                <h3>🏷️ Теги для YouTube:</h3>
                <div style={{ backgroundColor: '#f0f0f0', padding: '15px', borderRadius: '8px', marginBottom: '10px', wordBreak: 'break-all' }}>
                   {data.youtubeSEO.tags}
                </div>
                <button onClick={() => copyToClipboard(data.youtubeSEO.tags)}>Копировать теги</button>
                
                <h3>📝 SEO Описание:</h3>
                <textarea 
                  readOnly 
                  value={data.youtubeSEO.description} 
                  style={{ width: '100%', height: '150px', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} 
                />
                <button onClick={() => copyToClipboard(data.youtubeSEO.description)} style={{ marginTop: '10px' }}>Копировать описание</button>
              </div>
            )}

            {activeTab === 'social' && (
              <div>
                <h3>✈️ Пост для Telegram:</h3>
                <div style={{ whiteSpace: 'pre-wrap', backgroundColor: '#eef2f5', padding: '15px', borderRadius: '8px' }}>{data.socialPosts.tg}</div>
                <button onClick={() => copyToClipboard(data.socialPosts.tg)} style={{ marginTop: '10px' }}>Копировать для TG</button>
                
                <hr style={{ margin: '20px 0' }} />
                
                <h3>💙 Пост для VK:</h3>
                <div style={{ whiteSpace: 'pre-wrap', backgroundColor: '#eef2f5', padding: '15px', borderRadius: '8px' }}>{data.socialPosts.vk}</div>
                <button onClick={() => copyToClipboard(data.socialPosts.vk)} style={{ marginTop: '10px' }}>Копировать для VK</button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Если идет загрузка, можно показать сообщение */}
      {loading && <p style={{ textAlign: 'center', color: '#7f8c8d' }}>Нейросеть готовит контент, подождите немного...</p>}
    </div>
  );
}