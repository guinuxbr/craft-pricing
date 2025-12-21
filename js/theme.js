(function(){
  const THEME_KEY = 'theme';
  const root = document.documentElement;

  function applyTheme(t){
    root.setAttribute('data-theme', t);
  }

  function currentTheme(){
    return root.getAttribute('data-theme') || 'light';
  }

  function setToggleLabel(btn, theme){
    if(!btn) return;
    btn.textContent = theme === 'dark' ? '🌙' : '☀️';
  }

  function init(){
    const saved = localStorage.getItem(THEME_KEY);
    if(saved){
      applyTheme(saved);
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(prefersDark ? 'dark' : 'light');
    }

    const btn = document.getElementById('themeToggle');
    setToggleLabel(btn, currentTheme());
    if(btn){
      btn.addEventListener('click', function(){
        const newTheme = currentTheme() === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
        localStorage.setItem(THEME_KEY, newTheme);
        setToggleLabel(btn, newTheme);
      });
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
