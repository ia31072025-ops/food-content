import React, { useState } from 'react';

function App() {
  const [dish, setDish] = useState('');
  const [type, setType] = useState('Длинное видео');
  const [level, setLevel] = useState('Средний');
  const [format, setFormat] = useState('Домашняя кухня');
  const [extra, setExtra] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTagClick = (tag: string) => {
    setExtra(prev => prev.includes(tag) ? prev : (prev ? `${prev}, ${tag}` : tag));
  };

  const generate = async () => {
    if (!dish) return;
    setData(null);
    setLoading(true);

    try {
      const res = await fetch('https://food-backend-ai.onrender.com/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dish, type, level, channelFormat: format, additional: extra })
      });
      const result = await res.json();
      setData(result);
    } catch (e) {
      alert('Ошибка при генерации контента. Проверьте подключение или логи сервера.');
    } finally {
      setLoading(false);
    }
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Текст скопирован!');
  };

  return (
    <div style={{ maxWidth: '950px', margin: '40px auto', padding: '30px', backgroundColor: '#fdfdfd', borderRadius: '25px', boxShadow: '0 15px 40px rgba(0,0,0,0.1)' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#FF0000', fontSize: '3.5rem', marginBottom: '10px' }}>🎥 YT Chef PRO 3.0</h1>
        <p style={{ color: '#666', fontSize: '1.1rem' }}>Создавайте контент, который покорит YouTube</p>
      </header>
      
      <div style={{ display: 'grid', gap: '20px', marginBottom: '30px', padding: '20px', border: '1px solid #eee', borderRadius: '15px', backgroundColor: '#fff' }}>
        <input 
          placeholder="Название блюда (например: Итальянская лазанья Болоньезе)" 
          value={dish} 
          onChange={e => setDish(e.target.value)} 
          style={inputStyle} 
        />
        
        <div style={{ display: 'flex', gap: '15px' }}>
          <select value={type} onChange={e => setType(e.target.value)} style={selectStyle}>
            <option>Длинное видео</option>
            <option>Shorts / Reels</option>
          </select>
          <select value={level} onChange={e => setLevel(e.target.value)} style={selectStyle}>
            <option>Простой</option>
            <option>Средний</option>
            <option>Сложный</option>
            <option>Для профи</option>
          </select>
          <select value={format} onChange={e => setFormat(e.target.value)} style={selectStyle}>
            <option>Домашняя кухня</option>
            <option>Кондитерская</option>
            <option>Фуд-блог</option>
            <option>ASMR</option>
            <option>Авторская кухня</option>
          </select>
        </div>

        <input 
          placeholder="Дополнительные уточнения (например: без сахара, веганский, для детей)" 
          value={extra} 
          onChange={e => setExtra(e.target.value)} 
          style={inputStyle} 
        />
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
          <TagButton onClick={() => handleTagClick('без выпечки')}>Без выпечки</TagButton>
          <TagButton onClick={() => handleTagClick('праздничный')}>Праздничный</TagButton>
          <TagButton onClick={() => handleTagClick('бюджетный')}>Бюджетный</TagButton>
          <TagButton onClick={() => handleTagClick('быстрый')}>Быстрый рецепт</TagButton>
          <TagButton onClick={() => handleTagClick('для похудения')}>Для похудения</TagButton>
        </div>

        <button 
          onClick={generate} 
          disabled={loading} 
          style={btnPrimaryStyle}
        >
          {loading ? 'Создаем SEO-шедевр...' : 'СГЕНЕРИРОВАТЬ КОНТЕНТ-ПАКЕТ'}
        </button>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '50px', color: '#555' }}>
          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>👨‍🍳</div>
          <p style={{ fontSize: '1.2rem' }}>Наш AI-шеф готовит вам нечто особенное...</p>
        </div>
      )}

      {data && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', animation: 'fadeIn 0.6s ease-out' }}>
          
          <section style={cardStyle}>
            <h2 style={{ color: '#d32f2f', marginBottom: '20px' }}>👨‍🍳 Рецепт: {data.recipe.title}</h2>
            <p style={{ marginBottom: '15px' }}><b>⏱ Время:</b> {data.recipe.time} | <b>📊 Сложность:</b> {data.recipe.difficulty}</p>
            <h3 style={{ color: '#444', marginBottom: '10px' }}>🛒 Ингредиенты:</h3>
            <ul style={{ listStyleType: 'disc', marginLeft: '20px', marginBottom: '20px' }}>
              {data.recipe.ingredients.map((ing: string, i: number) => <li key={i} style={{ marginBottom: '5px' }}>{ing}</li>)}
            </ul>
            <h3 style={{ color: '#444', marginBottom: '10px' }}>📝 Пошаговое приготовление:</h3>
            {data.recipe.steps.map((s: string, i: number) => <p key={i} style={{ marginBottom: '10px', lineHeight: '1.6' }}><b>{i+1}.</b> {s}</p>)}
          </section>

          <section style={cardStyle}>
            <h2 style={{ color: '#1976d2', marginBottom: '20px' }}>🎥 YouTube Оптимизация</h2>
            <h3 style={{ color: '#444', marginBottom: '10px' }}>📌 Лучшие заголовки (кликните, чтобы скопировать):</h3>
            {data.youtube.titles.map((t: string, i: number) => (
              <div key={i} onClick={() => copy(t)} style={copyBox}>{t}</div>
            ))}
            {data.youtube.timestamps && data.youtube.timestamps.length > 0 && type === 'Длинное видео' && (
              <>
                <h3 style={{ color: '#444', marginTop: '20px', marginBottom: '10px' }}>🕒 Тайм-коды:</h3>
                <pre style={preBox}>{data.youtube.timestamps.join('\n')}</pre>
              </>
            )}
            <h3 style={{ color: '#444', marginTop: '20px', marginBottom: '10px' }}>📝 SEO Описание:</h3>
            <pre style={preBox}>{data.youtube.description}</pre>
            <button onClick={() => copy(data.youtube.description)} style={btnPrimaryStyle}>Скопировать описание целиком</button>
            <h3 style={{ color: '#444', marginTop: '20px', marginBottom: '10px' }}>🏷 SEO Теги:</h3>
            <p style={preBox}>{data.youtube.tags}</p>
            <h3 style={{ color: '#444', marginTop: '20px', marginBottom: '10px' }}>#️⃣ Хэштеги:</h3>
            <p style={preBox}>{data.youtube.hashtags}</p>
          </section>

          <section style={cardStyle}>
            <h2 style={{ color: '#388e3c', marginBottom: '20px' }}>📱 Соцсети</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <h3 style={{ color: '#444', marginBottom: '10px' }}>Telegram</h3>
                <div onClick={() => copy(data.social.telegram)} style={copyBox}>{data.social.telegram}</div>
              </div>
              <div>
                <h3 style={{ color: '#444', marginBottom: '10px' }}>ВКонтакте</h3>
                <div onClick={() => copy(data.social.vk)} style={copyBox}>{data.social.vk}</div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

const inputStyle = { padding: '15px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '16px', width: '100%' };
const selectStyle = { flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '15px' };
const btnPrimaryStyle = { padding: '15px', background: '#FF0000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', transition: 'background-color 0.3s ease' };
const TagButton = ({ children, onClick }: { children: React.ReactNode, onClick: () => void }) => (
  <button onClick={onClick} style={{ padding: '8px 15px', background: '#e0f7fa', color: '#007bff', border: '1px solid #a7d9ef', borderRadius: '20px', cursor: 'pointer', fontSize: '0.9rem', whiteSpace: 'nowrap', transition: 'background-color 0.2s' }}>
    {children}
  </button>
);

const cardStyle = { padding: '30px', border: '1px solid #eee', borderRadius: '18px', marginBottom: '30px', backgroundColor: '#fff', boxShadow: '0 8px 25px rgba(0,0,0,0.08)' };
const copyBox = { padding: '15px', background: '#f8f9fa', border: '1px dashed #007bff', borderRadius: '10px', cursor: 'pointer', marginBottom: '10px', fontSize: '15px', lineHeight: '1.5' };
const preBox = { whiteSpace: 'pre-wrap' as const, background: '#f1f3f5', padding: '20px', borderRadius: '12px', fontSize: '14px', lineHeight: '1.7', color: '#333' };

export default App;