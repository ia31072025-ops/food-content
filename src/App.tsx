import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- ИНТЕРФЕЙСЫ (Структура данных из вашего бэкенда) ---
interface GeneratedData {
  recipe: {
    title: string;
    time: string;
    difficulty: string;
    ingredients: string[];
    steps: string[];
  };
  youtube: {
    titles: string[];
    description: string;
    timestamps: string[];
    tags: string;
    hashtags: string;
  };
  social: {
    telegram: string;
    vk: string;
  };
}

interface NotebookItem {
  id: string;
  date: string;
  data: GeneratedData;
}

// --- ЦВЕТОВАЯ ПАЛИТРА (Cozy Kitchen Style) ---
const theme = {
  bg: '#FAF7F2',
  card: '#FFFFFF',
  text: '#5D4037',
  accent: '#D4A373',
  secondary: '#BC8F8F',
  lightAccent: '#F5EBE0'
};

export default function App() {
  const [dish, setDish] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedData | null>(null);
  const [notebook, setNotebook] = useState<NotebookItem[]>([]);

  // Загрузка истории из локального хранилища при старте
  useEffect(() => {
    const saved = localStorage.getItem('chef-history');
    if (saved) setNotebook(JSON.parse(saved));
  }, []);

  const handleGenerate = async () => {
    if (!dish.trim()) return toast.error("Напишите название блюда");
    setLoading(true);
    
    try {
      const response = await fetch('https://food-backend-ai.onrender.com/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          dish, 
          type: "Длинное видео", 
          level: "Средний", 
          channelFormat: "Кулинарный блог", 
          additional: "Максимально детально" 
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Ошибка сервера");
      
      setResult(data);
      
      // Автоматическое сохранение в историю
      const newEntry = { id: Date.now().toString(), date: new Date().toLocaleString(), data };
      const updatedHistory = [newEntry, ...notebook].slice(0, 10);
      setNotebook(updatedHistory);
      localStorage.setItem('chef-history', JSON.stringify(updatedHistory));

      toast.success("Контент сгенерирован! 🥐");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.info("Скопировано в буфер");
  };

  return (
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', padding: '20px', fontFamily: '"Segoe UI", sans-serif', color: theme.text }}>
      <ToastContainer position="bottom-right" />
      
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* HEADER */}
        <header style={{ textAlign: 'center', marginBottom: '40px', paddingTop: '20px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0, color: theme.text }}>Помощник фуд-блогеру</h1>
          <p style={{ color: theme.secondary }}>Создание контента • Полный план публикации</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '30px' }}>
          
          {/* ЛЕВАЯ ПАНЕЛЬ (Ввод и История) */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: theme.card, padding: '25px', borderRadius: '24px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Блюдо дня:</label>
              <input 
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: `1px solid ${theme.lightAccent}`, marginBottom: '15px', outline: 'none' }}
                placeholder="Напр: Итальянская паста..."
                value={dish}
                onChange={(e) => setDish(e.target.value)}
              />
              <button 
                onClick={handleGenerate}
                disabled={loading}
                style={{ width: '100%', padding: '15px', borderRadius: '12px', border: 'none', backgroundColor: theme.accent, color: 'white', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' }}
              >
                {loading ? 'Шеф готовит...' : 'Создать контент'}
              </button>
            </div>

            <div style={{ background: theme.card, padding: '25px', borderRadius: '24px', flex: 1 }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '15px' }}>📒 История</h3>
              {notebook.map(item => (
                <div key={item.id} onClick={() => setResult(item.data)} style={{ padding: '10px', borderBottom: `1px solid ${theme.bg}`, cursor: 'pointer', fontSize: '0.9rem' }}>
                  <strong>{item.data.recipe.title}</strong>
                  <div style={{ fontSize: '0.75rem', color: '#999' }}>{item.date}</div>
                </div>
              ))}
            </div>
          </aside>

          {/* ПРАВАЯ ПАНЕЛЬ (Результаты) */}
          <main style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            {!result ? (
              <div style={{ background: theme.card, borderRadius: '24px', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', border: '2px dashed #eee' }}>
                Здесь появится ваш рецепт и SEO-план
              </div>
            ) : (
              <>
                {/* Карточка Рецепта */}
                <section style={{ background: theme.card, padding: '30px', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
                  <h2 style={{ color: theme.accent, marginTop: 0 }}>{result.recipe.title}</h2>
                  <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                    <span style={{ padding: '4px 12px', background: theme.lightAccent, borderRadius: '20px', fontSize: '0.8rem' }}>⏱ {result.recipe.time}</span>
                    <span style={{ padding: '4px 12px', background: theme.lightAccent, borderRadius: '20px', fontSize: '0.8rem' }}>📊 {result.recipe.difficulty}</span>
                  </div>
                  
                  <h4>🛒 Ингредиенты</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {result.recipe.ingredients.map((ing, i) => <div key={i} style={{ fontSize: '0.9rem' }}>• {ing}</div>)}
                  </div>
                </section>

                {/* Соцсети */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ background: '#E3F2FD', padding: '20px', borderRadius: '24px' }}>
                    <h4 style={{ margin: '0 0 10px 0', display: 'flex', justifyContent: 'space-between' }}>
                      Telegram <button onClick={() => copy(result.social.telegram)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>📋</button>
                    </h4>
                    <p style={{ fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>{result.social.telegram}</p>
                  </div>
                  <div style={{ background: '#FFF3E0', padding: '20px', borderRadius: '24px' }}>
                    <h4 style={{ margin: '0 0 10px 0' }}>YouTube Tags</h4>
                    <p style={{ fontSize: '0.8rem', color: theme.text }}>{result.youtube.tags}</p>
                  </div>
                </div>

                {/* Шаги */}
                <section style={{ background: theme.card, padding: '30px', borderRadius: '24px' }}>
                  <h4>👨‍🍳 Пошаговое приготовление</h4>
                  {result.recipe.steps.map((step, i) => (
                    <div key={i} style={{ marginBottom: '15px', display: 'flex', gap: '15px' }}>
                      <span style={{ color: theme.accent, fontWeight: 'bold' }}>{i + 1}</span>
                      <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.5' }}>{step}</p>
                    </div>
                  ))}
                </section>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}