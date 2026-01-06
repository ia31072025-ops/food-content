import React, { useState } from 'react';

function App() {
  const [dish, setDish] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!dish) return;
    
    // Очищаем экран от старого рецепта
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
      alert('Ошибка связи с сервером. Проверьте логи на Render.');
    } finally {
      setLoading(false);
    }
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Скопировано в буфер!');
  };

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '20px', fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#f9f9f9', borderRadius: '20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#FF0000', fontSize: '3rem', marginBottom: '10px' }}>📺 YT Chef PRO</h1>
        <p style={{ color: '#555' }}>Генератор профессионального контента по стандартам 2026 года</p>
      </header>
      
      <div style={{ display: 'flex', gap: '15px', marginBottom: '40px' }}>
        <input 
          type="text" 
          placeholder="Какое блюдо готовим? (например: Лазанья Болоньезе)" 
          value={dish} 
          onChange={e => setDish(e.target.value)} 
          style={{ flex: 1, padding: '18px', borderRadius: '12px', border: '2px solid #ddd', fontSize: '18px' }} 
        />
        <button 
          onClick={generate} 
          disabled={loading} 
          style={{ padding: '0 35px', borderRadius: '12px', background: '#FF0000', color: '#fff', fontSize: '18px', fontWeight: 'bold', border: 'none', cursor: 'pointer', transition: '0.3s' }}
        >
          {loading ? 'Создаем шедевр...' : 'ПОЕХАЛИ!'}
        </button>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
          <p>Шеф-повар прорабатывает рецепт и SEO-стратегию...</p>
        </div>
      )}

      {data && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          <section style={cardStyle}>
            <h2 style={{ color: '#d32f2f' }}>👨‍🍳 Рецепт: {data.recipe.title}</h2>
            <p><b>⏱ Время:</b> {data.recipe.time} | <b>📊 Сложность:</b> {data.recipe.difficulty}</p>
            <h3>🛒 Ингредиенты:</h3>
            <ul>{data.recipe.ingredients.map((ing: string, i: number) => <li key={i}>{ing}</li>)}</ul>
            <h3>📝 Пошаговое приготовление:</h3>
            {data.recipe.steps.map((s: string, i: number) => <p key={i} style={{ marginBottom: '10px' }}><b>{i+1}.</b> {s}</p>)}
          </section>

          <section style={cardStyle}>
            <h2 style={{ color: '#1976d2' }}>🎥 YouTube Оптимизация</h2>
            <h4>📌 Лучшие заголовки (кликните, чтобы скопировать):</h4>
            {data.youtube.titles.map((t: string, i: number) => (
              <div key={i} onClick={() => copy(t)} style={copyBox}>{t}</div>
            ))}
            <h4>🕒 Тайм-коды:</h4>
            <div style={preBox}>{data.youtube.timestamps.join('\n')}</div>
            <h4>📝 SEO Описание:</h4>
            <pre style={preBox}>{data.youtube.description}</pre>
            <button onClick={() => copy(data.youtube.description)} style={btnPrimary}>Скопировать описание целиком</button>
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

const cardStyle = { padding: '30px', borderRadius: '15px', background: '#fff', border: '1px solid #eee', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' };
const copyBox = { padding: '15px', background: '#f8f9fa', border: '1px dashed #007bff', borderRadius: '8px', cursor: 'pointer', marginBottom: '10px', fontSize: '15px' };
const preBox = { whiteSpace: 'pre-wrap' as const, background: '#f1f3f5', padding: '20px', borderRadius: '10px', fontSize: '14px', lineHeight: '1.6', color: '#333' };
const btnPrimary = { padding: '12px 20px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };

export default App;