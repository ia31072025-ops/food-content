import React, { useState } from 'react';

const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:10000/generate' 
  : 'https://food-backend-ai.onrender.com/generate';

function App() {
  const [dish, setDish] = useState('');
  const [type, setType] = useState('Длинное видео');
  const [level, setLevel] = useState('Средний');
  const [extra, setExtra] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!dish) return alert("Введите название блюда!");
    setData(null);
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dish, type, level, additional: extra })
      });
      const result = await res.json();
      setData(result);
    } catch (e: any) {
      alert(`Ошибка связи: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Скопировано!');
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '30px', backgroundColor: '#fdfdfd', borderRadius: '25px', boxShadow: '0 15px 40px rgba(0,0,0,0.1)', fontFamily: 'sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#FF0000', fontSize: '3rem', marginBottom: '10px' }}>🎥 YT Chef PRO 3.0</h1>
        <p style={{ color: '#666', fontSize: '1.1rem' }}>Превращаем идеи в контент за секунды</p>
      </header>
      
      <div style={{ display: 'grid', gap: '20px', marginBottom: '30px', padding: '20px', border: '1px solid #eee', borderRadius: '15px', backgroundColor: '#fff' }}>
        <input placeholder="Что готовим сегодня?..." value={dish} onChange={e => setDish(e.target.value)} style={inputStyle} />
        
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <select value={type} onChange={e => setType(e.target.value)} style={selectStyle}>
            <option>Длинное видео</option>
            <option>Shorts / Reels</option>
          </select>
          <select value={level} onChange={e => setLevel(e.target.value)} style={selectStyle}>
            <option>Простой</option>
            <option>Средний</option>
            <option>Сложный</option>
          </select>
        </div>

        <input placeholder="Доп. особенности (например: веганское, без сахара)..." value={extra} onChange={e => setExtra(e.target.value)} style={inputStyle} />
        
        <button onClick={generate} disabled={loading} style={{...btnPrimaryStyle, opacity: loading ? 0.6 : 1}}>
          {loading ? 'Шеф-повар пишет сценарий...' : 'СГЕНЕРИРОВАТЬ КОНТЕНТ-ПАКЕТ'}
        </button>
      </div>

      {data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* YOUTUBE SECTION */}
          <section style={cardStyle}>
            <h2 style={{ color: '#1976d2', borderBottom: '2px solid #1976d2', paddingBottom: '10px' }}>📺 YouTube Оформление</h2>
            <div style={{ marginTop: '15px' }}>
              <p><b>Описание:</b></p>
              <div style={{ ...preBox, whiteSpace: 'pre-wrap' }}>
                {data.youtube?.description}
              </div>
            </div>
          </section>

          {/* SOCIAL MEDIA SECTION */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <section style={cardStyle}>
              <h3 style={{ color: '#0088cc' }}>🔹 Telegram Пост</h3>
              <div onClick={() => copy(data.social?.telegram)} style={{ ...copyBox, whiteSpace: 'pre-wrap' }}>
                {data.social?.telegram || 'Текст не сгенерирован'}
              </div>
            </section>

            <section style={cardStyle}>
              <h3 style={{ color: '#4c75a3' }}>🔹 VK Пост</h3>
              <div onClick={() => copy(data.social?.vk)} style={{ ...copyBox, whiteSpace: 'pre-wrap' }}>
                {data.social?.vk || 'Текст не сгенерирован'}
              </div>
            </section>
          </div>

          {/* RECIPE SECTION */}
          <section style={cardStyle}>
            <h2 style={{ color: '#d32f2f' }}>👨‍🍳 План приготовления</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
              <div>
                <h4>🛒 Ингредиенты:</h4>
                <ul style={{ paddingLeft: '20px' }}>
                  {data.recipe?.ingredients?.map((ing: string, i: number) => <li key={i}>{ing}</li>)}
                </ul>
              </div>
              <div>
                <h4>📝 Шаги:</h4>
                {data.recipe?.steps?.map((s: string, i: number) => <p key={i}><b>{i+1}.</b> {s}</p>)}
              </div>
            </div>
          </section>
          
        </div>
      )}
    </div>
  );
}

// Стили, которые делают "красиво"
const inputStyle = { padding: '15px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '16px', outline: 'none' };
const selectStyle = { padding: '12px', borderRadius: '10px', border: '1px solid #ddd', flex: 1, minWidth: '150px' };
const btnPrimaryStyle = { padding: '20px', background: '#FF0000', color: '#fff', border: 'none', borderRadius: '15px', fontWeight: 'bold' as const, cursor: 'pointer', fontSize: '1.1rem', transition: '0.3s' };
const cardStyle = { padding: '25px', borderRadius: '20px', backgroundColor: '#fff', border: '1px solid #eee', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' };
const copyBox = { padding: '15px', background: '#f0f7ff', border: '1px dashed #1976d2', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', lineHeight: '1.5' };
const preBox = { background: '#f9f9f9', padding: '20px', borderRadius: '12px', border: '1px solid #eee', fontSize: '15px', lineHeight: '1.6' };

export default App;
