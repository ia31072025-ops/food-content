import React, { useState, useEffect } from 'react';

function App() {
  const [dish, setDish] = useState('');
  const [activeData, setActiveData] = useState<any>(null);
  const [notebook, setNotebook] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Загрузка из памяти
  useEffect(() => {
    const saved = localStorage.getItem('chef_storage_v4');
    if (saved) setNotebook(JSON.parse(saved));
  }, []);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://food-backend-ai.onrender.com/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dish })
      });
      const result = await res.json();
      setActiveData(result); // Устанавливаем полученные данные
    } catch (e) {
      alert("Ошибка при генерации");
    } finally {
      setLoading(false);
    }
  };

  const saveToNotebook = () => {
    if (!activeData) return;
    const newNote = { id: Date.now(), content: activeData };
    const updated = [newNote, ...notebook];
    setNotebook(updated);
    localStorage.setItem('chef_storage_v4', JSON.stringify(updated));
    alert("Сохранено!");
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* ЛЕВАЯ ПАНЕЛЬ */}
      <div style={{ width: '300px', borderRight: '1px solid #ccc', padding: '20px' }}>
        <h3>📒 Блокнот</h3>
        {notebook.map(n => (
          <div 
            key={n.id} 
            onClick={() => setActiveData(n.content)} // ВОССТАНОВЛЕНИЕ ДАННЫХ
            style={{ padding: '10px', border: '1px solid #eee', cursor: 'pointer', marginBottom: '5px' }}
          >
            {n.content.title || "Без названия"}
          </div>
        ))}
      </div>

      {/* ПРАВАЯ ПАНЕЛЬ */}
      <div style={{ flex: 1, padding: '20px' }}>
        <input value={dish} onChange={e => setDish(e.target.value)} placeholder="Блюдо..." />
        <button onClick={generate} disabled={loading}>{loading ? 'Загрузка...' : 'Генерировать'}</button>

        {activeData && (
          <div style={{ marginTop: '20px' }}>
            <button onClick={saveToNotebook} style={{ background: 'green', color: 'white' }}>СОХРАНИТЬ В БЛОКНОТ</button>
            
            <h2>{activeData.title}</h2>
            
            <h3>📖 Рецепт:</h3>
            <ul>{activeData.recipe?.ingredients?.map((ing: any, i: number) => <li key={i}>{ing}</li>)}</ul>
            
            <h3>📺 Описание (с таймкодами):</h3>
            <pre style={{ whiteSpace: 'pre-wrap', background: '#f0f0f0', padding: '10px' }}>
              {activeData.youtube?.description || "Описание отсутствует"}
            </pre>

            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ background: '#e3f2fd', padding: '10px' }}>
                <h4>Telegram</h4>
                {activeData.social?.telegram}
              </div>
              <div style={{ background: '#f5f5f5', padding: '10px' }}>
                <h4>VK</h4>
                {activeData.social?.vk}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;