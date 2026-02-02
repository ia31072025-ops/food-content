import React, { useState } from 'react';

const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:10000/api/generate' 
  : 'https://food-backend-ai.onrender.com/api/generate';

function App() {
  const [dish, setDish] = useState('');
  const [type, setType] = useState('Длинное видео');
  const [level, setLevel] = useState('Средний');
  const [extra, setExtra] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'youtube' | 'social' | 'recipe'>('youtube');

  const generate = async () => {
    if (!dish.trim()) {
      return;
    }
    setData(null);
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dish, type, level, additional: extra })
      });
      if (!res.ok) throw new Error('Ошибка сервера');
      const result = await res.json();
      setData(result);
      setActiveTab('youtube');
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div style={styles.container}>
      {/* Animated Background */}
      <div style={styles.bgGradient} />
      
      <div style={styles.mainCard}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.logoContainer}>
            <span style={styles.logoIcon}>🍳</span>
            <div>
              <h1 style={styles.title}>YT Chef PRO</h1>
              <span style={styles.version}>v3.0</span>
            </div>
          </div>
          <p style={styles.subtitle}>
            ✨ AI-генератор контента для кулинарных блогеров
          </p>
        </header>

        {/* Input Section */}
        <div style={styles.inputSection}>
          <div style={styles.mainInputWrapper}>
            <span style={styles.inputIcon}>🔍</span>
            <input 
              placeholder="Введите название блюда..." 
              value={dish} 
              onChange={e => setDish(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && generate()}
              style={styles.mainInput}
            />
          </div>
          
          <div style={styles.optionsRow}>
            <div style={styles.selectWrapper}>
              <span style={styles.selectIcon}>🎬</span>
              <select value={type} onChange={e => setType(e.target.value)} style={styles.select}>
                <option>Длинное видео</option>
                <option>Shorts / Reels</option>
              </select>
            </div>
            
            <div style={styles.selectWrapper}>
              <span style={styles.selectIcon}>📊</span>
              <select value={level} onChange={e => setLevel(e.target.value)} style={styles.select}>
                <option>Простой</option>
                <option>Средний</option>
                <option>Сложный</option>
              </select>
            </div>
          </div>

          <div style={styles.extraInputWrapper}>
            <span style={styles.inputIcon}>💡</span>
            <input 
              placeholder="Дополнительно: веганское, без глютена, быстрое..." 
              value={extra} 
              onChange={e => setExtra(e.target.value)}
              style={styles.extraInput}
            />
          </div>
          
          <button 
            onClick={generate} 
            disabled={loading || !dish.trim()} 
            style={{
              ...styles.generateBtn,
              opacity: loading || !dish.trim() ? 0.7 : 1,
              transform: loading ? 'scale(0.98)' : 'scale(1)'
            }}
          >
            {loading ? (
              <span style={styles.loadingContent}>
                <span style={styles.spinner} />
                Генерируем магию...
              </span>
            ) : (
              <span>🚀 Сгенерировать контент</span>
            )}
          </button>
        </div>

        {/* Results Section */}
        {data && (
          <div style={styles.resultsSection}>
            {/* Tabs */}
            <div style={styles.tabsContainer}>
              {[
                { id: 'youtube', icon: '📺', label: 'YouTube' },
                { id: 'social', icon: '💬', label: 'Соцсети' },
                { id: 'recipe', icon: '👨‍🍳', label: 'Рецепт' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    ...styles.tab,
                    ...(activeTab === tab.id ? styles.tabActive : {})
                  }}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div style={styles.tabContent}>
              {/* YouTube Tab */}
              {activeTab === 'youtube' && (
                <div style={styles.fadeIn}>
                  {/* Titles */}
                  {data.youtube?.titles && (
                    <div style={styles.titlesSection}>
                      <h3 style={styles.sectionTitle}>
                        <span>🎯</span> Варианты названий
                      </h3>
                      <div style={styles.titlesGrid}>
                        {data.youtube.titles.map((title: string, i: number) => (
                          <div 
                            key={i} 
                            onClick={() => copy(title, `title-${i}`)}
                            style={{
                              ...styles.titleCard,
                              borderColor: copied === `title-${i}` ? '#10b981' : '#e5e7eb'
                            }}
                          >
                            <span style={styles.titleNumber}>{i + 1}</span>
                            <span style={styles.titleText}>{title}</span>
                            <span style={styles.copyHint}>
                              {copied === `title-${i}` ? '✓' : '📋'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div style={styles.descriptionSection}>
                    <div style={styles.sectionHeader}>
                      <h3 style={styles.sectionTitle}>
                        <span>📝</span> Описание для YouTube
                      </h3>
                      <button 
                        onClick={() => copy(data.youtube?.description || '', 'description')}
                        style={{
                          ...styles.copyBtn,
                          background: copied === 'description' ? '#10b981' : '#6366f1'
                        }}
                      >
                        {copied === 'description' ? '✓ Скопировано' : '📋 Копировать'}
                      </button>
                    </div>
                    <div style={styles.descriptionBox}>
                      {data.youtube?.description}
                    </div>
                  </div>
                </div>
              )}

              {/* Social Tab */}
              {activeTab === 'social' && (
                <div style={styles.fadeIn}>
                  <div style={styles.socialGrid}>
                    {/* Telegram */}
                    <div style={styles.socialCard}>
                      <div style={styles.socialHeader}>
                        <div style={styles.socialIcon}>
                          <span style={{ fontSize: '24px' }}>✈️</span>
                        </div>
                        <h3 style={styles.socialTitle}>Telegram</h3>
                        <button 
                          onClick={() => copy(data.social?.telegram || '', 'telegram')}
                          style={{
                            ...styles.copyBtnSmall,
                            background: copied === 'telegram' ? '#10b981' : '#0088cc'
                          }}
                        >
                          {copied === 'telegram' ? '✓' : '📋'}
                        </button>
                      </div>
                      <div style={styles.socialContent}>
                        {data.social?.telegram || 'Не сгенерировано'}
                      </div>
                    </div>

                    {/* VK */}
                    <div style={styles.socialCard}>
                      <div style={styles.socialHeader}>
                        <div style={{...styles.socialIcon, background: 'linear-gradient(135deg, #4c75a3, #5181b8)'}}>
                          <span style={{ fontSize: '24px' }}>💙</span>
                        </div>
                        <h3 style={styles.socialTitle}>ВКонтакте</h3>
                        <button 
                          onClick={() => copy(data.social?.vk || '', 'vk')}
                          style={{
                            ...styles.copyBtnSmall,
                            background: copied === 'vk' ? '#10b981' : '#4c75a3'
                          }}
                        >
                          {copied === 'vk' ? '✓' : '📋'}
                        </button>
                      </div>
                      <div style={styles.socialContent}>
                        {data.social?.vk || 'Не сгенерировано'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recipe Tab */}
              {activeTab === 'recipe' && (
                <div style={styles.fadeIn}>
                  <div style={styles.recipeGrid}>
                    {/* Ingredients */}
                    <div style={styles.ingredientsCard}>
                      <h3 style={styles.recipeTitle}>
                        <span>🛒</span> Ингредиенты
                      </h3>
                      <ul style={styles.ingredientsList}>
                        {data.recipe?.ingredients?.map((ing: string, i: number) => (
                          <li key={i} style={styles.ingredientItem}>
                            <span style={styles.ingredientDot} />
                            {ing}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Steps */}
                    <div style={styles.stepsCard}>
                      <h3 style={styles.recipeTitle}>
                        <span>📋</span> Пошаговый рецепт
                      </h3>
                      <div style={styles.stepsList}>
                        {data.recipe?.steps?.map((step: string, i: number) => (
                          <div key={i} style={styles.stepItem}>
                            <div style={styles.stepNumber}>{i + 1}</div>
                            <p style={styles.stepText}>{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer style={styles.footer}>
          <p>Создано с ❤️ для кулинарных блогеров</p>
        </footer>
      </div>

      {/* CSS Keyframes */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}

// 🎨 Стили
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    background: '#0f172a',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden'
  },
  bgGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.2) 0%, transparent 40%), radial-gradient(circle at 40% 80%, rgba(74, 222, 128, 0.2) 0%, transparent 40%)',
    pointerEvents: 'none'
  },
  mainCard: {
    maxWidth: '1100px',
    margin: '0 auto',
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '32px',
    boxShadow: '0 25px 80px rgba(0, 0, 0, 0.4)',
    overflow: 'hidden',
    position: 'relative',
    backdropFilter: 'blur(20px)'
  },
  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    padding: '40px',
    textAlign: 'center',
    position: 'relative'
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '15px',
    marginBottom: '10px'
  },
  logoIcon: {
    fontSize: '50px',
    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
  },
  title: {
    color: '#fff',
    fontSize: '2.8rem',
    fontWeight: 800,
    margin: 0,
    textShadow: '0 4px 20px rgba(0,0,0,0.3)',
    letterSpacing: '-1px'
  },
  version: {
    background: 'rgba(255,255,255,0.2)',
    color: '#fff',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 600
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: '1.1rem',
    margin: 0,
    fontWeight: 400
  },
  inputSection: {
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    background: '#fafbfc'
  },
  mainInputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute',
    left: '20px',
    fontSize: '20px',
    opacity: 0.5
  },
  mainInput: {
    width: '100%',
    padding: '20px 20px 20px 55px',
    fontSize: '18px',
    border: '2px solid #e5e7eb',
    borderRadius: '16px',
    outline: 'none',
    transition: 'all 0.3s ease',
    background: '#fff',
    boxSizing: 'border-box'
  },
  optionsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px'
  },
  selectWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  selectIcon: {
    position: 'absolute',
    left: '15px',
    fontSize: '16px',
    pointerEvents: 'none',
    zIndex: 1
  },
  select: {
    width: '100%',
    padding: '16px 16px 16px 45px',
    fontSize: '16px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    outline: 'none',
    background: '#fff',
    cursor: 'pointer',
    appearance: 'none' as const
  },
  extraInputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  extraInput: {
    width: '100%',
    padding: '16px 16px 16px 50px',
    fontSize: '16px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    outline: 'none',
    background: '#fff',
    boxSizing: 'border-box'
  },
  generateBtn: {
    padding: '22px 40px',
    fontSize: '18px',
    fontWeight: 700,
    color: '#fff',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 10px 40px rgba(102, 126, 234, 0.4)'
  },
  loadingContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px'
  },
  spinner: {
    width: '24px',
    height: '24px',
    border: '3px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  },
  resultsSection: {
    padding: '0 40px 40px'
  },
  tabsContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '25px',
    background: '#f1f5f9',
    padding: '8px',
    borderRadius: '16px'
  },
  tab: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px 20px',
    fontSize: '15px',
    fontWeight: 600,
    color: '#64748b',
    background: 'transparent',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  tabActive: {
    background: '#fff',
    color: '#6366f1',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  tabContent: {
    animation: 'fadeIn 0.3s ease'
  },
  fadeIn: {
    animation: 'fadeIn 0.4s ease'
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '18px',
    fontWeight: 700,
    color: '#1e293b',
    margin: '0 0 15px 0'
  },
  titlesSection: {
    marginBottom: '30px'
  },
  titlesGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  titleCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '18px 20px',
    background: '#fff',
    border: '2px solid #e5e7eb',
    borderRadius: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  titleNumber: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    borderRadius: '10px',
    fontWeight: 700,
    fontSize: '14px'
  },
  titleText: {
    flex: 1,
    fontSize: '15px',
    fontWeight: 500,
    color: '#334155'
  },
  copyHint: {
    fontSize: '18px',
    opacity: 0.5
  },
  descriptionSection: {
    background: '#fff',
    borderRadius: '20px',
    padding: '25px',
    border: '1px solid #e5e7eb'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  },
  copyBtn: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  descriptionBox: {
    padding: '20px',
    background: '#f8fafc',
    borderRadius: '12px',
    fontSize: '14px',
    lineHeight: 1.8,
    color: '#475569',
    whiteSpace: 'pre-wrap' as const,
    maxHeight: '400px',
    overflow: 'auto'
  },
  socialGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px'
  },
  socialCard: {
    background: '#fff',
    borderRadius: '20px',
    padding: '25px',
    border: '1px solid #e5e7eb'
  },
  socialHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px'
  },
  socialIcon: {
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0088cc, #00a8e8)',
    borderRadius: '14px'
  },
  socialTitle: {
    flex: 1,
    fontSize: '18px',
    fontWeight: 700,
    color: '#1e293b',
    margin: 0
  },
  copyBtnSmall: {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  socialContent: {
    padding: '20px',
    background: '#f8fafc',
    borderRadius: '12px',
    fontSize: '14px',
    lineHeight: 1.7,
    color: '#475569',
    whiteSpace: 'pre-wrap' as const,
    maxHeight: '300px',
    overflow: 'auto'
  },
  recipeGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '20px'
  },
  ingredientsCard: {
    background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
    borderRadius: '20px',
    padding: '25px'
  },
  recipeTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '18px',
    fontWeight: 700,
    color: '#1e293b',
    margin: '0 0 20px 0'
  },
  ingredientsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  ingredientItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '15px',
    color: '#44403c'
  },
  ingredientDot: {
    width: '8px',
    height: '8px',
    background: '#f59e0b',
    borderRadius: '50%',
    flexShrink: 0
  },
  stepsCard: {
    background: '#fff',
    borderRadius: '20px',
    padding: '25px',
    border: '1px solid #e5e7eb'
  },
  stepsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  stepItem: {
    display: 'flex',
    gap: '15px',
    alignItems: 'flex-start'
  },
  stepNumber: {
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #10b981, #34d399)',
    color: '#fff',
    borderRadius: '12px',
    fontWeight: 700,
    fontSize: '16px',
    flexShrink: 0
  },
  stepText: {
    margin: 0,
    fontSize: '15px',
    lineHeight: 1.6,
    color: '#475569',
    paddingTop: '6px'
  },
  footer: {
    textAlign: 'center',
    padding: '25px',
    borderTop: '1px solid #e5e7eb',
    color: '#94a3b8',
    fontSize: '14px'
  }
};

export default App;
