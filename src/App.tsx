import React, { useState } from 'react';

const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:10000/api/generate' 
  : 'https://food-backend-ai.onrender.com/api/generate';

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
    if (!dish) {
      alert("Введите название блюда!");
      return;
    }
    
    setData(null);
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          dish, 
          type, 
          level, 
          channelFormat: format, 
          additional: extra 
        })
      });
      
      if (!res.ok) throw new Error(`Ошибка сервера: ${res.status}`);
      const result = await res.json();
      if (result.error) {
        alert(`Ошибка ИИ: ${result.error}`);
        return;
      }
      setData(result);
    } catch (e: any) {
      alert(`Ошибка: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    alert('Скопировано!');
  };

  return (
    <div style={{ maxWidth: '950px', margin: '40px auto', padding: '30px', backgroundColor: '#fdfdfd', borderRadius: '25px', boxShadow: '0 15px 40px rgba(0,0,0,0.1)', fontFamily: 'sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#FF0000', fontSize: '3rem', marginBottom: '10px' }}>🎥 YT Chef PRO 3.0</h1>
        <p style={{ color: '#666', fontSize: '1.1rem' }}>SEO-генератор контента (Groq)</p>
      </header>
      
      <div style={{ display: 'grid', gap: '20px', marginBottom: '30px', padding: '20px', border: '1px solid #eee', borderRadius: '15px', backgroundColor: '#fff' }}>
        <input placeholder="Название блюда..." value={dish} onChange={e => setDish(e.target.value)} style={inputStyle} />
        
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

        <input placeholder="Доп. уточнения..." value={extra} onChange={e => setExtra(e.target.value)} style={inputStyle} />
        
        <button onClick={generate} disabled={loading} style={{...btnPrimaryStyle, opacity: loading ? 0.6 : 1}}>
          {loading ? 'Шеф готовит ответ...' : 'СГЕНЕРИРОВАТЬ КОНТЕНТ-ПАКЕТ'}
        </button>
      </div>

      {data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {/* YOUTUBE */}
          <section style={cardStyle}>
            <h2 style={{ color: '#1976d2' }}>🎥 YouTube SEO & Описание</h2>
            <div style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: '20px', borderRadius: '12px', border: '1px solid #ddd' }}>
              {data.youtube?.description}
            </div>
          </section>

          {/* СОЦСЕТИ */}
          <section style={cardStyle}>
            <h2 style={{ color: '#388e3c' }}>📱 Посты для соцсетей</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
              <div>
                <h4>Telegram (нажмите, чтобы скопировать)</h4>
                <div onClick={() => copy(data.social?.telegram)} style={{ ...copyBox, whiteSpace: 'pre-wrap' }}>
                  {data.social?.telegram}
                </div>
              </div>
              <div>
                <h4>ВКонтакте (нажмите, чтобы скопировать)</h4>
                <div onClick={() => copy(data.social?.vk)} style={{ ...copyBox, whiteSpace: 'pre-wrap' }}>
                  {data.social?.vk}
                </div>
              </div>
            </div>
          </section>

          {/* РЕЦЕПТ */}
          <section style={cardStyle}>
            <h2 style={{ color: '#d32f2f' }}>👨‍🍳 Пошаговый план</h2>
            <ul>
              {data.recipe?.ingredients?.map((ing: string, i: number) => <li key={i}>{ing}</li>)}
            </ul>
            {data.recipe?.steps?.map((s: string, i: number) => <p key={i}><b>{i+1}.</b> {s}</p>)}
          </section>
        </div>
      )}
    </div>
  );
}

// Стили
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px' };
const selectStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', flex: 1, minWidth: '150px' };
const btnPrimaryStyle = { padding: '18px', background: '#FF0000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold' as const, cursor: 'pointer' };
const cardStyle = { padding: '25px', borderRadius: '15px', backgroundColor: '#fff', border: '1px solid #eee' };
const copyBox = { padding: '15px', background: '#f0f7ff', border: '1px dashed #1976d2', borderRadius: '8px', cursor: 'pointer' };

export default App;
