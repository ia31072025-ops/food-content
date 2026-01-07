import React, { useState, useEffect } from 'react';

function App() {
  const [dish, setDish] = useState('');
  const [type, setType] = useState('Длинное видео');
  const [level, setLevel] = useState('Средний');
  const [extra, setExtra] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [notebook, setNotebook] = useState<any[]>([]);

  // Загружаем сохраненное из памяти при открытии сайта
  useEffect(() => {
    const saved = localStorage.getItem('my_chef_notebook');
    if (saved) setNotebook(JSON.parse(saved));
  }, []);

  // Сохраняем в память при каждом изменении блокнота
  useEffect(() => {
    localStorage.setItem('my_chef_notebook', JSON.stringify(notebook));
  }, [notebook]);

  const generate = async () => {
    if (!dish) return;
    setData(null); // Очищаем старый рецепт
    setLoading(true);
    try {
      const res = await fetch('https://food-backend-ai.onrender.com/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dish, type, level, additional: extra })
      });
      const result = await res.json();
      setData(result);
    } catch (e) {
      alert('Ошибка');
    } finally {
      setLoading(false);
    }
  };

  const saveToNotebook = () => {
    const linkInput = document.getElementById('note_link') as HTMLInputElement;
    const newEntry = {
      id: Date.now(),
      title: data.recipe.title,
      link: linkInput.value || 'Нет ссылки',
      date: new Date().toLocaleDateString()
    };
    setNotebook([newEntry, ...notebook]);
    linkInput.value = '';
    alert('Сохранено в блокнот!');
  };

  return (
    <div style={{ maxWidth: '900px', margin: 'auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: 'red' }}>🎬 SEO Chef & Notebook Pro</h1>

      {/* КАРТОЧКИ БЛОКНОТА */}
      {notebook.length > 0 && (
        <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '15px', marginBottom: '20px', border: '1px solid #ddd' }}>
          <h3>📒 Сохраненное ({notebook.length})</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {notebook.map(n => (
              <div key={n.id} style={{ background: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid #eee' }}>
                <strong>{n.title}</strong><br/>
                <small>{n.date}</small><br/>
                {n.link !== 'Нет ссылки' && <a href={n.link} target="_blank" style={{ fontSize: '12px' }}>🔗 Ссылка</a>}
                <button onClick={() => setNotebook(notebook.filter(x => x.id !== n.id))} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', float: 'right' }}>Удалить</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ОСНОВНОЙ ГЕНЕРАТОР */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '15px', border: '2px solid #ff000033' }}>
        <input placeholder="Название блюда..." value={dish} onChange={e => setDish(e.target.value)} style={inputStyle} />
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <select value={type} onChange={e => setType(e.target.value)} style={selectStyle}>
                <option>Длинное видео</option>
                <option>Shorts / Reels</option>
            </select>
            <input placeholder="Доп. детали..." value={extra} onChange={e => setExtra(e.target.value)} style={inputStyle} />
        </div>
        <button onClick={generate} disabled={loading} style={btnStyle}>{loading ? 'Генерируем пакет...' : 'ПОЛУЧИТЬ РЕЦЕПТ И SEO'}</button>
      </div>

      {/* ВЫВОД РЕЗУЛЬТАТА */}
      {data && (
        <div style={{ marginTop: '30px', padding: '25px', background: '#fff', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}>
          <h2>{data.recipe.title}</h2>
          
          <div style={{ background: '#e6f7ff', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
            <input id="note_link" placeholder="Вставь любую ссылку для сохранения" style={inputStyle} />
            <button onClick={saveToNotebook} style={{ ...btnStyle, background: '#1890ff', marginTop: '10px' }}>💾 СОХРАНИТЬ В БЛОКНОТ</button>
          </div>

          <p><strong>Ингредиенты:</strong> {data.recipe.ingredients.join(', ')}</p>
          <p><strong>Описание:</strong> {data.youtube.description}</p>
        </div>
      )}
    </div>
  );
}

const inputStyle = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' };
const selectStyle = { padding: '10px', borderRadius: '8px', border: '1px solid #ddd' };
const btnStyle = { width: '100%', padding: '15px', background: 'red', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };

export default App;