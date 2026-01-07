import React, { useState, useEffect } from 'react';

function App() {
  const [input, setInput] = useState(''); // Сюда пишем блюдо ИЛИ ссылку
  const [extra, setExtra] = useState('');
  const [type, setType] = useState('видео + shorts');
  const [loading, setLoading] = useState(false);
  const [activeData, setActiveData] = useState<any>(null);
  const [notebook, setNotebook] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('food_blogger_vault_v3.6');
    if (saved) setNotebook(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('food_blogger_vault_v3.6', JSON.stringify(notebook));
  }, [notebook]);

  const generate = async () => {
    if (!input) return;
    setLoading(true); setActiveData(null);
    try {
      const res = await fetch('https://food-backend-ai.onrender.com/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dish: input, type, additional: extra })
      });
      const result = await res.json();
      setActiveData(result);
    } catch (e) { alert('Ошибка! Проверь интернет или API'); } 
    finally { setLoading(false); }
  };

  const saveNote = () => {
    if (!activeData) return;
    const newNote = { id: Date.now(), title: activeData.recipe.title, fullData: activeData, date: new Date().toLocaleDateString() };
    setNotebook([newNote, ...notebook]);
    alert('Контент-пакет сохранен в блокнот!');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f9fa' }}>
      
      {/* ЛЕВАЯ ПАНЕЛЬ: АРХИВ (Notebook) */}
      <div style={{ width: '350px', background: '#fff', borderRight: '1px solid #ddd', padding: '20px', overflowY: 'auto' }}>
        <h2 style={{ color: '#FF0000' }}>📒 Блокнот 3.6</h2>
        <p style={{ fontSize: '12px', color: '#666' }}>Нажми на рецепт, чтобы открыть полный пакет продвижения</p>
        {notebook.map(n => (
          <div key={n.id} onClick={() => setActiveData(n.fullData)} style={noteStyle(activeData?.recipe.title === n.title)}>
            <strong>{n.title}</strong><br/>
            <small>{n.date}</small>
            <button onClick={(e) => { e.stopPropagation(); setNotebook(notebook.filter(x => x.id !== n.id)); }} style={delBtn}>×</button>
          </div>
        ))}
      </div>

      {/* ПРАВАЯ ПАНЕЛЬ: РАБОЧЕЕ ПРОСТРАНСТВО */}
      <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
        <div style={cardStyle}>
          <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>🍎 Помощник фуд-блогера PRO</h1>
          
          <input 
            placeholder="Введите название блюда ИЛИ ссылку на YouTube..." 
            value={input} onChange={e => setInput(e.target.value)} 
            style={inputStyle} 
          />
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <select value={type} onChange={e => setType(e.target.value)} style={selectStyle}>
              <option>видео + shorts</option><option>только видео</option><option>только shorts</option>
            </select>
            <input 
              placeholder="ПП, без сахара, веган, добавить чеснок..." 
              value={extra} onChange={e => setExtra(e.target.value)} 
              style={inputStyle} 
            />
          </div>

          <button onClick={generate} disabled={loading} style={mainBtn}>
            {loading ? 'Идет анализ и SEO-генерация...' : 'СФОРМИРОВАТЬ КОНТЕНТ-ПАКЕТ'}
          </button>
        </div>

        {activeData && (
          <div style={{ marginTop: '30px' }}>
            <button onClick={saveNote} style={saveBtn}>💾 СОХРАНИТЬ ВЕСЬ ПАКЕТ В БЛОКНОТ</button>

            <div style={cardStyle}>
              <h2 style={{ color: '#d32f2f' }}>{activeData.recipe.title}</h2>
              
              <div style={tabGrid}>
                <section>
                  <h3>📖 Рецепт & КБЖУ</h3>
                  <ul>{activeData.recipe.ingredients.map((ing: any, i: number) => <li key={i}>{ing}</li>)}</ul>
                  {activeData.recipe.steps.map((s: any, i: number) => <p key={i}><b>{i+1}.</b> {s}</p>)}
                </section>

                <section>
                  <h3>📈 YouTube SEO</h3>
                  <p><strong>Тайм-коды:</strong></p>
                  <pre style={preStyle}>{activeData.youtube.description}</pre>
                  <p><strong>Теги:</strong> {activeData.youtube.tags}</p>
                </section>
              </div>

              <div style={tabGrid}>
                <section style={socialStyle}>
                  <h3>✈️ Telegram & VK</h3>
                  <p><b>TG:</b> {activeData.social.telegram}</p>
                  <hr/>
                  <p><b>VK:</b> {activeData.social.vk}</p>
                </section>
                <section style={{ ...socialStyle, background: '#fff8e1' }}>
                  <h3>🎬 Сценарий Shorts</h3>
                  <pre style={preStyle}>{activeData.youtube.shorts_script || "Динамичный сценарий готов!"}</pre>
                </section>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Стили
const cardStyle = { background: '#fff', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' as any };
const selectStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', background: '#fff' };
const mainBtn = { width: '100%', padding: '15px', background: '#d32f2f', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', marginTop: '15px', cursor: 'pointer' };
const saveBtn = { width: '100%', padding: '12px', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: '8px', marginBottom: '15px', cursor: 'pointer' };
const noteStyle = (act: boolean) => ({ padding: '15px', borderRadius: '10px', border: '1px solid #eee', marginBottom: '10px', cursor: 'pointer', background: act ? '#fff5f5' : '#fff', position: 'relative' as any });
const tabGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' };
const preStyle = { whiteSpace: 'pre-wrap' as any, background: '#f9f9f9', padding: '15px', borderRadius: '8px', fontSize: '13px' };
const socialStyle = { background: '#e3f2fd', padding: '20px', borderRadius: '12px' };
const delBtn = { position: 'absolute' as any, right: '10px', top: '10px', background: 'none', border: 'none', color: '#ccc', cursor: 'pointer' };

export default App;