import React, { useState, useEffect } from 'react';

function App() {
  const [dish, setDish] = useState('');
  const [type, setType] = useState('Длинное видео');
  const [extra, setExtra] = useState('');
  const [data, setData] = useState<any>(null); // Текущие активные данные
  const [loading, setLoading] = useState(false);
  const [notebook, setNotebook] = useState<any[]>([]); // Архив

  useEffect(() => {
    const saved = localStorage.getItem('yt_chef_vault_35');
    if (saved) setNotebook(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('yt_chef_vault_35', JSON.stringify(notebook));
  }, [notebook]);

  const generate = async () => {
    if (!dish) return;
    setData(null); setLoading(true);
    try {
      const res = await fetch('https://food-backend-ai.onrender.com/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dish, type, additional: extra })
      });
      const result = await res.json();
      setData(result);
    } catch (e) { alert('Ошибка связи с сервером'); } finally { setLoading(false); }
  };

  const saveToNotebook = () => {
    if (!data) return;
    const link = (document.getElementById('yt_url') as HTMLInputElement).value;
    const newEntry = {
      id: Date.now(),
      title: data.recipe.title,
      content: data, // Сохраняем ВЕСЬ объект
      link: link,
      date: new Date().toLocaleDateString()
    };
    setNotebook([newEntry, ...notebook]);
    alert('Сохранено в Блокнот!');
  };

  const copy = (text: string) => { navigator.clipboard.writeText(text); alert('Скопировано!'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fcfcfc', fontFamily: 'Segoe UI, sans-serif' }}>
      
      {/* ЛЕВАЯ ПАНЕЛЬ: БЛОКНОТ */}
      <div style={{ width: '320px', background: '#fff', borderRight: '1px solid #eee', padding: '20px', overflowY: 'auto' }}>
        <h2 style={{ color: '#FF0000', borderBottom: '2px solid #FF0000', paddingBottom: '10px' }}>📒 Архив Рецептов</h2>
        {notebook.map(item => (
          <div 
            key={item.id} 
            onClick={() => setData(item.content)} 
            style={{ padding: '15px', borderRadius: '12px', border: '1px solid #eee', marginBottom: '10px', cursor: 'pointer', background: data?.recipe.title === item.title ? '#fff5f5' : '#fff' }}
          >
            <strong style={{ display: 'block' }}>{item.title}</strong>
            <small style={{ color: '#888' }}>{item.date} {item.link && '🔗'}</small>
            <button onClick={(e) => { e.stopPropagation(); setNotebook(notebook.filter(x => x.id !== item.id)); }} style={{ float: 'right', border: 'none', background: 'none', color: '#ccc', cursor: 'pointer' }}>×</button>
          </div>
        ))}
      </div>

      {/* ПРАВАЯ ПАНЕЛЬ: РАБОЧАЯ ЗОНА */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '900px', margin: 'auto' }}>
          <header style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ fontSize: '2.5rem', color: '#333' }}>🎥 YT Chef <span style={{ color: 'red' }}>PRO 3.5</span></h1>
          </header>

          <div style={cardStyle}>
            <input placeholder="Название блюда..." value={dish} onChange={e => setDish(e.target.value)} style={inputStyle} />
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <select value={type} onChange={e => setType(e.target.value)} style={selectStyle}>
                <option>Длинное видео</option><option>Shorts / Reels</option>
              </select>
              <input placeholder="Доп. условия (без сахара, веган...)" value={extra} onChange={e => setExtra(e.target.value)} style={inputStyle} />
            </div>
            <button onClick={generate} disabled={loading} style={mainBtn}>{loading ? 'Генерация...' : 'СОЗДАТЬ КОНТЕНТ-ПАКЕТ'}</button>
          </div>

          {data && (
            <div style={{ marginTop: '30px' }}>
              <div style={{ ...cardStyle, backgroundColor: '#f0f7ff', border: '1px solid #007bff' }}>
                <h4 style={{ marginTop: 0 }}>📥 Сохранить этот результат?</h4>
                <input id="yt_url" placeholder="Ссылка на готовое видео YouTube (необязательно)" style={inputStyle} />
                <button onClick={saveToNotebook} style={{ ...mainBtn, background: '#28a745', marginTop: '10px' }}>ДОБАВИТЬ В БЛОКНОТ</button>
              </div>

              <div style={cardStyle}>
                <h2 style={{ color: '#d32f2f' }}>{data.recipe.title}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <section>
                    <h3>🛒 Ингредиенты:</h3>
                    <ul>{data.recipe.ingredients.map((ing: any, i: number) => <li key={i}>{ing}</li>)}</ul>
                  </section>
                  <section>
                    <h3>📝 Инструкция:</h3>
                    {data.recipe.steps.map((s: any, i: number) => <p key={i}><b>{i+1}.</b> {s}</p>)}
                  </section>
                </div>

                <hr style={{ margin: '30px 0', opacity: 0.2 }} />

                <h3 style={{ color: '#1976d2' }}>📺 YouTube SEO Описание:</h3>
                <pre style={preBox}>{data.youtube.description}</pre>
                <button onClick={() => copy(data.youtube.description)} style={copyBtn}>Копировать всё описание</button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                  <div style={socialBox}><h4>✈️ Telegram Post</h4>{data.social.telegram}</div>
                  <div style={socialBox}><h4>💙 VK Post</h4>{data.social.vk}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const cardStyle = { background: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0 8px 30px rgba(0,0,0,0.05)', marginBottom: '20px' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', boxSizing: 'border-box' as any };
const selectStyle = { padding: '12px', borderRadius: '10px', border: '1px solid #ddd', background: '#fff' };
const mainBtn = { width: '100%', padding: '15px', background: 'red', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };
const preBox = { whiteSpace: 'pre-wrap' as any, background: '#f8f9fa', padding: '20px', borderRadius: '12px', fontSize: '14px', border: '1px solid #eee' };
const copyBtn = { padding: '10px 20px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '10px' };
const socialBox = { background: '#f1f3f5', padding: '15px', borderRadius: '12px', fontSize: '13px' };

export default App;