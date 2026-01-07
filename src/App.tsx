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
    const saved = localStorage.getItem('chef_notebook_pro');
    if (saved) setNotebook(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('chef_notebook_pro', JSON.stringify(notebook));
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
      alert('Ошибка генерации');
    } finally {
      setLoading(false);
    }
  };

  const saveToNotebook = () => {
    const linkInput = document.getElementById('note_url') as HTMLInputElement;
    const url = linkInput.value;
    
    // Если есть сгенерированные данные, берем их название, если нет - пытаемся понять из ссылки
    const noteTitle = data ? data.recipe.title : (url ? `Заметка: ${url.substring(0, 20)}...` : "Новый рецепт");

    const newNote = {
      id: Date.now(),
      title: noteTitle,
      link: url || 'Без ссылки',
      date: new Date().toLocaleDateString()
    };
    
    setNotebook([newNote, ...notebook]);
    linkInput.value = '';
    alert('Сохранено в Блокнот!');
  };

  const copy = (t: string) => { navigator.clipboard.writeText(t); alert('Скопировано!'); };

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '20px', fontFamily: 'system-ui', backgroundColor: '#fdfdfd' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#FF0000', fontSize: '3.5rem', marginBottom: '10px' }}>🎥 YT Chef PRO 3.5</h1>
        <p style={{ color: '#666' }}>SEO, Рецепты и Личный Блокнот NotebookLM</p>
      </header>

      {/* ПАНЕЛЬ УПРАВЛЕНИЯ */}
      <div style={sectionCard}>
        <input placeholder="Название блюда..." value={dish} onChange={e => setDish(e.target.value)} style={inputStyle} />
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <select value={type} onChange={e => setType(e.target.value)} style={selectStyle}>
            <option>Длинное видео</option>
            <option>Shorts / Reels</option>
          </select>
          <select value={level} onChange={e => setLevel(e.target.value)} style={selectStyle}>
            <option>Простой</option><option>Средний</option><option>Сложный</option>
          </select>
          <select value={format} onChange={e => setFormat(e.target.value)} style={selectStyle}>
            <option>Домашняя кухня</option><option>Кондитер</option><option>ASMR</option>
          </select>
        </div>
        <input placeholder="Дополнительно (например: без сахара, только печенье)" value={extra} onChange={e => setExtra(e.target.value)} style={{ ...inputStyle, marginTop: '15px' }} />
        <button onClick={generate} disabled={loading} style={mainBtnStyle}>{loading ? 'Шеф работает...' : 'СГЕНЕРИРОВАТЬ ВСЁ'}</button>
      </div>

      {/* БЛОКНОТ */}
      {notebook.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h3>📒 Мой Блокнот ({notebook.length})</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
            {notebook.map(n => (
              <div key={n.id} style={noteCard}>
                <button onClick={() => setNotebook(notebook.filter(x => x.id !== n.id))} style={delBtn}>×</button>
                <small>{n.date}</small>
                <h4 style={{ margin: '5px 0' }}>{n.title}</h4>
                {n.link !== 'Без ссылки' && <a href={n.link} target="_blank" style={{ fontSize: '12px', color: '#007bff' }}>🔗 Ссылка / Источник</a>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* РЕЗУЛЬТАТЫ */}
      {data && (
        <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* СОХРАНЕНИЕ */}
          <div style={{ ...sectionCard, backgroundColor: '#e6f7ff', border: '1px solid #91d5ff' }}>
            <h4>📥 Сохранить этот результат в блокнот</h4>
            <input id="note_url" placeholder="Вставьте ссылку на YouTube или оставьте пустым" style={inputStyle} />
            <button onClick={saveToNotebook} style={{ ...mainBtnStyle, background: '#52c41a', marginTop: '10px' }}>СОХРАНИТЬ</button>
          </div>

          {/* РЕЦЕПТ */}
          <section style={{ ...sectionCard, borderLeft: '8px solid #d32f2f' }}>
            <h2 style={{ color: '#d32f2f' }}>👨‍🍳 Рецепт: {data.recipe.title}</h2>
            <p><b>Сложность:</b> {data.recipe.difficulty} | <b>Время:</b> {data.recipe.time}</p>
            <h3>Ингредиенты:</h3>
            <ul>{data.recipe.ingredients.map((ing: any, i: number) => <li key={i}>{ing}</li>)}</ul>
            <h3>Инструкция:</h3>
            {data.recipe.steps.map((s: string, i: number) => <p key={i}><b>{i+1}.</b> {s}</p>)}
          </section>

          {/* YOUTUBE SEO */}
          <section style={{ ...sectionCard, borderLeft: '8px solid #1976d2' }}>
            <h2 style={{ color: '#1976d2' }}>🎥 YouTube SEO</h2>
            <h4>Заголовки (клик для копирования):</h4>
            {data.youtube.titles.map((t: string, i: number) => <div key={i} onClick={() => copy(t)} style={copyBox}>{t}</div>)}
            <h4>Описание:</h4>
            <pre style={preStyle}>{data.youtube.description}</pre>
            <h4>Тэги:</h4>
            <p style={preStyle}>{data.youtube.tags}</p>
            <h4>Хэштеги:</h4>
            <p style={preStyle}>{data.youtube.hashtags}</p>
          </section>

          {/* СОЦСЕТИ */}
          <section style={{ ...sectionCard, borderLeft: '8px solid #388e3c' }}>
            <h2 style={{ color: '#388e3c' }}>📱 Соцсети</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div><h5>Telegram</h5><div onClick={() => copy(data.social.telegram)} style={copyBox}>{data.social.telegram}</div></div>
              <div><h5>ВКонтакте</h5><div onClick={() => copy(data.social.vk)} style={copyBox}>{data.social.vk}</div></div>
            </div>
          </section>

        </div>
      )}
    </div>
  );
}

// Стилизация
const sectionCard = { background: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #eee' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' as any };
const selectStyle = { flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd' };
const mainBtnStyle = { width: '100%', padding: '15px', background: '#FF0000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', marginTop: '15px', cursor: 'pointer' };
const noteCard = { background: '#fff', padding: '15px', borderRadius: '12px', border: '1px solid #eee', position: 'relative' as any, boxShadow: '0 2px 5px rgba(0,0,0,0.05)' };
const delBtn = { position: 'absolute' as any, top: '5px', right: '5px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px', color: '#ccc' };
const copyBox = { padding: '12px', background: '#f0f7ff', border: '1px dashed #1976d2', borderRadius: '8px', cursor: 'pointer', marginBottom: '10px', fontSize: '14px' };
const preStyle = { whiteSpace: 'pre-wrap' as any, background: '#f9f9f9', padding: '15px', borderRadius: '10px', fontSize: '13px', border: '1px solid #eee' };

export default App;