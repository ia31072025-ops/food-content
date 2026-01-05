import React, { useState } from 'react';

function App() {
  const [dish, setDish] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!dish) return;
    setLoading(true);
    try {
      const res = await fetch('https://food-backend-ai.onrender.com/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dish })
      });
      
      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.error || 'Ошибка сервера');
      }

      setData(result);
    } catch (e: any) {
      console.error(e);
      alert('Ошибка: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Скопировано в буфер!');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#FF0000', fontSize: '2.5rem' }}>📺 YT Chef AI</h1>
        <p style={{ color: '#666' }}>Генератор контента для кулинарных каналов</p>
      </header>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        <input 
          type="text" 
          placeholder="Название блюда (напр. Лазанья)" 
          value={dish} 
          onChange={e => setDish(e.target.value)} 
          style={{ flex: 1, padding: '15px', borderRadius: '10px', border: '2px solid #ddd', fontSize: '16px' }} 
        />
        <button 
          onClick={generate} 
          disabled={loading} 
          style={{ padding: '0 30px', borderRadius: '10px', border: 'none', background: '#FF0000', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
        >
          {loading ? 'Считаем...' : 'ПОЕХАЛИ!'}
        </button>
      </div>

      {data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          
          <section style={cardStyle}>
            <h2 style={{ color: '#2c3e50', borderBottom: '2px solid #FF0000', paddingBottom: '10px' }}>🍳 Рецепт: {data.recipe?.title}</h2>
            <p><strong>⏱ Время:</strong> {data.recipe?.time} | <strong>📊 Сложность:</strong> {data.recipe?.difficulty}</p>
            <p><strong>🛒 Ингредиенты:</strong> {data.recipe?.ingredients?.join(', ')}</p>
            <div style={{ background: '#fff', padding: '15px', borderRadius: '8px' }}>
              {data.recipe?.steps?.map((s: string, i: number) => <p key={i}><strong>{i+1}.</strong> {s}</p>)}
            </div>
          </section>

          <section style={cardStyle}>
            <h2 style={{ color: '#2c3e50' }}>🎥 YouTube Optimization</h2>
            <p><strong>💡 Заголовки (нажми, чтобы скопировать):</strong></p>
            {data.youtube?.titles?.map((t: string, i: number) => (
              <div key={i} onClick={() => copy(t)} style={copyBoxStyle}>{t}</div>
            ))}
            <p><strong>📝 Описание:</strong></p>
            <pre style={preStyle}>{data.youtube?.description}</pre>
            <button onClick={() => copy(data.youtube?.description)} style={btnSmall}>Скопировать всё описание</button>
          </section>

          <section style={cardStyle}>
            <h2 style={{ color: '#2c3e50' }}>📱 Соцсети</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <h4 style={{ color: '#0088cc' }}>Telegram</h4>
                <div onClick={() => copy(data.social?.telegram)} style={copyBoxStyle}>{data.social?.telegram}</div>
              </div>
              <div>
                <h4 style={{ color: '#45668e' }}>ВКонтакте</h4>
                <div onClick={() => copy(data.social?.vk)} style={copyBoxStyle}>{data.social?.vk}</div>
              </div>
            </div>
          </section>

        </div>
      )}
    </div>
  );
}

const cardStyle = { padding: '25px', borderRadius: '15px', background: '#fcfcfc', border: '1px solid #eaeaea', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' };
const copyBoxStyle = { padding: '12px', background: '#fff', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', marginBottom: '8px', fontSize: '14px' };
const preStyle = { whiteSpace: 'pre-wrap' as const, background: '#f1f1f1', padding: '15px', borderRadius: '8px', fontSize: '13px', maxHeight: '200px', overflowY: 'auto' as const };
const btnSmall = { padding: '8px 15px', background: '#eee', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' };

export default App;