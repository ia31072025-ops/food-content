import React, { useState } from 'react';

function App() {
  const [dish, setDish] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!dish) return;
    
    // 1. Очищаем старые данные и включаем загрузку
    setData(null);
    setLoading(true);

    try {
      const res = await fetch('https://food-backend-ai.onrender.com/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dish })
      });
      const result = await res.json();
      setData(result);
    } catch (e) {
      alert('Ошибка связи с сервером');
    } finally {
      setLoading(false);
    }
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Скопировано!');
  };

  return (
    <div style={{ maxWidth: '850px', margin: '40px auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#FF0000' }}>🎬 YT Chef AI Pro</h1>
        <p>Создавай контент для миллионов просмотров</p>
      </header>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        <input 
          type="text" 
          placeholder="Название блюда..." 
          value={dish} 
          onChange={e => setDish(e.target.value)} 
          style={{ flex: 1, padding: '15px', borderRadius: '10px', border: '1px solid #ddd' }} 
        />
        <button 
          onClick={generate} 
          disabled={loading} 
          style={{ padding: '0 30px', borderRadius: '10px', background: '#FF0000', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {loading ? 'Генерируем...' : 'ПОЕХАЛИ!'}
        </button>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '50px', fontSize: '20px' }}>⏳ Готовим контент-план...</div>}

      {data && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          <section style={cardStyle}>
            <h2 style={{ color: '#d32f2f' }}>👨‍🍳 Рецепт: {data.recipe.title}</h2>
            <p><b>⏱ Время:</b> {data.recipe.time} | <b>🔥 Сложность:</b> {data.recipe.difficulty}</p>
            <h4>🛒 Ингредиенты:</h4>
            <ul>{data.recipe.ingredients.map((ing: any, i: number) => <li key={i}>{ing}</li>)}</ul>
            <h4>📝 Шаги:</h4>
            {data.recipe.steps.map((s: string, i: number) => <p key={i}><b>{i+1}.</b> {s}</p>)}
          </section>

          <section style={cardStyle}>
            <h2 style={{ color: '#1976d2' }}>🎥 YouTube Оптимизация</h2>
            <h4>📌 Заголовки (клик для копирования):</h4>
            {data.youtube.titles.map((t: string, i: number) => (
              <div key={i} onClick={() => copy(t)} style={copyBox}>{t}</div>
            ))}
            <h4>🕒 Тайм-коды:</h4>
            <div style={preStyle}>{data.youtube.timestamps.join('\n')}</div>
            <h4>📝 Полное описание:</h4>
            <pre style={preStyle}>{data.youtube.description}</pre>
            <button onClick={() => copy(data.youtube.description)} style={btnCopy}>Копировать всё описание</button>
            <h4>🏷 Теги:</h4>
            <p style={{ color: '#666', fontSize: '13px' }}>{data.youtube.tags}</p>
          </section>

          <section style={cardStyle}>
            <h2 style={{ color: '#388e3c' }}>📱 Соцсети</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <h5>Telegram</h5>
                <div onClick={() => copy(data.social.telegram)} style={copyBox}>{data.social.telegram}</div>
              </div>
              <div>
                <h5>ВКонтакте</h5>
                <div onClick={() => copy(data.social.vk)} style={copyBox}>{data.social.vk}</div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

const cardStyle = { padding: '25px', borderRadius: '15px', background: '#fff', border: '1px solid #eee', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' };
const copyBox = { padding: '12px', background: '#f9f9f9', border: '1px dashed #ccc', borderRadius: '8px', cursor: 'pointer', marginBottom: '10px', fontSize: '14px' };
const preStyle = { whiteSpace: 'pre-wrap' as const, background: '#f5f5f5', padding: '15px', borderRadius: '8px', fontSize: '14px', marginBottom: '10px' };
const btnCopy = { padding: '10px 15px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' };

export default App;