import React, { useState, useEffect } from 'react';

function App() {
  const [dish, setDish] = useState('');
  const [extra, setExtra] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Главное состояние данных (то, что мы видим на экране)
  const [activeData, setActiveData] = useState<any>(null);
  
  // Список всех сохранений
  const [notebook, setNotebook] = useState<any[]>([]);

  // Загрузка
  useEffect(() => {
    const saved = localStorage.getItem('chef_vault_v5');
    if (saved) setNotebook(JSON.parse(saved));
  }, []);

  // Сохранение списка
  useEffect(() => {
    localStorage.setItem('chef_vault_v5', JSON.stringify(notebook));
  }, [notebook]);

  const generate = async () => {
    if (!dish) return;
    setLoading(true);
    setActiveData(null); 
    try {
      const res = await fetch('https://food-backend-ai.onrender.com/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dish, additional: extra })
      });
      const result = await res.json();
      setActiveData(result);
    } catch (e) { alert('Ошибка сети'); } 
    finally { setLoading(false); }
  };

  const saveToNotebook = () => {
    if (!activeData) return;
    const urlInput = document.getElementById('note_url') as HTMLInputElement;
    const titleInput = document.getElementById('note_title') as HTMLInputElement;

    const newEntry = {
      id: Date.now(),
      displayTitle: titleInput.value || activeData.recipe.title,
      fullContent: activeData, // Сохраняем ВЕСЬ объект со всеми полями
      link: urlInput.value || '',
      date: new Date().toLocaleString()
    };

    setNotebook([newEntry, ...notebook]);
    alert('Рецепт успешно добавлен в ваш личный архив!');
  };

  const copy = (t: string) => { navigator.clipboard.writeText(t); alert('Скопировано!'); };

  return (
    <div style={{ maxWidth: '1200px', margin: 'auto', padding: '20px', fontFamily: 'sans-serif', display: 'flex', gap: '20px' }}>
      
      {/* ЛЕВАЯ КОЛОНКА: БЛОКНОТ */}
      <div style={{ width: '350px', background: '#fff', padding: '20px', borderRadius: '15px', border: '1px solid #ddd', height: 'fit-content' }}>
        <h2 style={{ color: '#FF0000' }}>📒 Блокнот</h2>
        <p style={{ fontSize: '12px', color: '#666' }}>Нажми на рецепт, чтобы открыть</p>
        <div style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          {notebook.map(item => (
            <div 
              key={item.id} 
              onClick={() => setActiveData(item.fullContent)} // ВОТ ТУТ МАГИЯ: Загружаем данные из памяти на экран
              style={miniNoteStyle}
            >
              <strong>{item.displayTitle}</strong><br/>
              <small>{item.date}</small>
              <button 
                onClick={(e) => { e.stopPropagation(); setNotebook(notebook.filter(x => x.id !== item.id)); }} 
                style={delBtnStyle}
              >Удалить</button>
            </div>
          ))}
        </div>
      </div>

      {/* ПРАВАЯ КОЛОНКА: ГЕНЕРАТОР И ПРОСМОТР */}
      <div style={{ flex: 1 }}>
        <div style={cardStyle}>
          <h1>🎥 YT Chef Studio</h1>
          <input placeholder="Название блюда..." value={dish} onChange={e => setDish(e.target.value)} style={inputStyle} />
          <textarea placeholder="Пожелания (например: без глютена)..." value={extra} onChange={e => setExtra(e.target.value)} style={{ ...inputStyle, marginTop: '10px', height: '60px' }} />
          <button onClick={generate} disabled={loading} style={mainBtnStyle}>{loading ? 'Готовим рецепт...' : 'СГЕНЕРИРОВАТЬ НОВЫЙ'}</button>
        </div>

        {activeData && (
          <div style={{ marginTop: '20px', animation: 'fadeIn 0.5s' }}>
            {/* Блок сохранения появляется только для новых рецептов */}
            <div style={saveBoxStyle}>
              <h3>📥 Сохранить этот результат в архив?</h3>
              <input id="note_title" placeholder="Имя в блокноте" defaultValue={activeData.recipe.title} style={inputStyle} />
              <input id="note_url" placeholder="Ссылка на YouTube (необязательно)" style={{ ...inputStyle, marginTop: '10px' }} />
              <button onClick={saveToNotebook} style={saveBtnStyle}>СОХРАНИТЬ В БЛОКНОТ</button>
            </div>

            <div style={resultCardStyle}>
              <h2 style={{ color: '#d32f2f' }}>{activeData.recipe.title}</h2>
              
              <section>
                <h3>🛒 Ингредиенты:</h3>
                <ul>{activeData.recipe.ingredients.map((ing: any, i: number) => <li key={i}>{ing}</li>)}</ul>
                <h3>📝 Инструкция:</h3>
                {activeData.recipe.steps.map((s: string, i: number) => <p key={i}><b>{i+1}.</b> {s}</p>)}
              </section>

              <section style={{ marginTop: '30px', borderTop: '2px solid #eee', paddingTop: '20px' }}>
                <h3 style={{ color: '#1976d2' }}>📺 YouTube SEO (с таймкодами):</h3>
                <pre style={preBoxStyle}>{activeData.youtube.description}</pre>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <div onClick={() => copy(activeData.youtube.tags)} style={tagStyle}>🏷 Теги</div>
                    <div onClick={() => copy(activeData.youtube.hashtags)} style={tagStyle}>#️⃣ Хэштеги</div>
                    <div onClick={() => copy(activeData.social.telegram)} style={tagStyle}>✈️ Telegram</div>
                    <div onClick={() => copy(activeData.social.vk)} style={tagStyle}>💙 VK</div>
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// СТИЛИ
const cardStyle = { background: '#fff', padding: '25px', borderRadius: '15px', border: '1px solid #eee', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' as any };
const mainBtnStyle = { width: '100%', padding: '15px', background: 'red', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', marginTop: '15px', cursor: 'pointer' };
const miniNoteStyle = { background: '#f8f9fa', padding: '15px', borderRadius: '10px', marginBottom: '10px', cursor: 'pointer', border: '1px solid #eee', position: 'relative' as any };
const delBtnStyle = { position: 'absolute' as any, right: '10px', bottom: '10px', color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontSize: '11px' };
const saveBoxStyle = { background: '#e6f7ff', padding: '20px', borderRadius: '15px', border: '1px solid #91d5ff', marginBottom: '20px' };
const saveBtnStyle = { width: '100%', padding: '12px', background: '#52c41a', color: '#fff', border: 'none', borderRadius: '8px', marginTop: '10px', cursor: 'pointer', fontWeight: 'bold' };
const resultCardStyle = { background: '#fff', padding: '30px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' };
const preBoxStyle = { whiteSpace: 'pre-wrap' as any, background: '#f4f4f4', padding: '20px', borderRadius: '10px', fontSize: '14px', lineHeight: '1.6' };
const tagStyle = { padding: '8px 15px', background: '#eef2f7', border: '1px solid #d1d9e6', borderRadius: '20px', fontSize: '12px', cursor: 'pointer' };

export default App;