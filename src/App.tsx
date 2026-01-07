import React, { useState, useEffect } from 'react';

function App() {
  const [dish, setDish] = useState('');
  const [type, setType] = useState('Длинное видео');
  const [level, setLevel] = useState('Средний');
  const [format, setFormat] = useState('Фуд-блог');
  const [extra, setExtra] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [notebook, setNotebook] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('chef_notebook_v4');
    if (saved) setNotebook(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('chef_notebook_v4', JSON.stringify(notebook));
  }, [notebook]);

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
      alert('Ошибка API');
    } finally {
      setLoading(false);
    }
  };

  const saveToNotebook = () => {
    const linkInput = document.getElementById('note_url') as HTMLInputElement;
    const newNote = {
      id: Date.now(),
      title: data.recipe.title,
      content: data.recipe.ingredients.join(', '),
      link: linkInput.value || 'Нет ссылки',
      date: new Date().toLocaleDateString()
    };
    setNotebook([newNote, ...notebook]);
    linkInput.value = '';
    alert('Сохранено в Блокнот!');
  };

  const copy = (t: string) => { navigator.clipboard.writeText(t); alert('Скопировано!'); };

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '20px', fontFamily: 'system-ui' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#FF0000', fontSize: '3rem' }}>📺 YT Chef PRO & Notebook</h1>
        <p>Профессиональный контент и база знаний рецептов</p>
      </header>

      {/* БЛОК УПРАВЛЕНИЯ */}
      <div style={cardStyle}>
        <input placeholder="Название блюда..." value={dish} onChange={e => setDish(e.target.value)} style={inputStyle} />
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
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
        <input placeholder="Дополнительно (без сахара, из печенья и т.д.)" value={extra} onChange={e => setExtra(e.target.value)} style={{ ...inputStyle, marginTop: '15px' }} />
        <div style={{ marginTop: '10px', display: 'flex', gap: '5px' }}>
            <button onClick={() => setExtra('без выпечки')} style={tagBtn}>Без выпечки</button>
            <button onClick={() => setExtra('праздничный')} style={tagBtn}>Праздничный</button>
            <button onClick={() => setExtra('бюджетный')} style={tagBtn}>Бюджетный</button>
        </div>
        <button onClick={generate} disabled={loading} style={mainBtnStyle}>{loading ? 'Шеф готовит...' : 'СГЕНЕРИРОВАТЬ ПАКЕТ'}</button>
      </div>

      {/* БЛОКНОТ (NotebookLM Style) */}
      {notebook.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h3>📒 Мои материалы ({notebook.length})</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {notebook.map(n => (
              <div key={n.id} style={noteStyle}>
                <button onClick={() => setNotebook(notebook.filter(x => x.id !== n.id))} style={delBtn}>×</button>
                <small>{n.date}</small>
                <h4>{n.title}</h4>
                <p style={{ fontSize: '13px', color: '#666' }}>{n.content.substring(0, 100)}...</p>
                {n.link !== 'Нет ссылки' && <a href={n.link} target="_blank" style={{ color: '#007bff' }}>🔗 Ссылка на источник</a>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* РЕЗУЛЬТАТ С ГРАФИКОЙ */}
      {data && (
        <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '25px' }}>
          
          <section style={{ ...cardStyle, borderLeft: '8px solid #d32f2f' }}>
            <h2 style={{ color: '#d32f2f' }}>👨‍🍳 Рецепт: {data.recipe.title}</h2>
            <div style={{ background: '#fffbe6', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
                <input id="note_url" placeholder="Ссылка (на YouTube или др. источник)" style={inputStyle} />
                <button onClick={saveToNotebook} style={{ ...tagBtn, background: '#52c41a', color: '#fff', width: '100%', marginTop: '10px' }}>💾 СОХРАНИТЬ В БЛОКНОТ</button>
            </div>
            <h3>🛒 Ингредиенты:</h3>
            <ul>{data.recipe.ingredients.map((ing: any, i: number) => <li key={i}>{ing}</li>)}</ul>
            <h3>📝 Шаги:</h3>
            {data.recipe.steps.map((s: string, i: number) => <p key={i}><b>{i+1}.</b> {s}</p>)}
          </section>

          <section style={{ ...cardStyle, borderLeft: '8px solid #1976d2' }}>
            <h2 style={{ color: '#1976d2' }}>🎥 YouTube SEO</h2>
            <h4>Заголовки:</h4>
            {data.youtube.titles.map((t: string, i: number) => <div key={i} onClick={() => copy(t)} style={copyBox}>{t}</div>)}
            <h4>Описание:</h4>
            <pre style={preStyle}>{data.youtube.description}</pre>
          </section>

        </div>
      )}
    </div>
  );
}

// Стили
const cardStyle = { background: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)', border: '1px solid #eee' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' as any };
const selectStyle = { flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd' };
const tagBtn = { padding: '5px 12px', borderRadius: '15px', border: '1px solid #ddd', background: '#f8f9fa', cursor: 'pointer', fontSize: '12px' };
const mainBtnStyle = { width: '100%', padding: '15px', background: '#FF0000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', marginTop: '20px', cursor: 'pointer' };
const noteStyle = { background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #eee', position: 'relative' as any, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' };
const delBtn = { position: 'absolute' as any, top: '10px', right: '10px', border: 'none', background: 'none', color: '#ccc', cursor: 'pointer', fontSize: '20px' };
const copyBox = { padding: '10px', background: '#f0f7ff', border: '1px dashed #1976d2', borderRadius: '8px', cursor: 'pointer', marginBottom: '8px' };
const preStyle = { whiteSpace: 'pre-wrap' as any, background: '#f9f9f9', padding: '15px', borderRadius: '10px', fontSize: '14px', border: '1px solid #eee' };

export default App;