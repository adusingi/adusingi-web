// Import Styles and Fonts
import './style.css';
import '@fontsource/inconsolata/400.css';
import '@fontsource/inconsolata/500.css';
import '@fontsource/inconsolata/600.css';
import '@fontsource/inconsolata/700.css';
import '@fontsource/noto-serif-jp/400.css';

// Live clock for Okayama (Asia/Tokyo) shown in the intro
document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById('japan-time');
  if (!el) return;

  const update = () => {
    el.textContent = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Tokyo',
    }).format(new Date());
  };

  update();
  setInterval(update, 30_000);
});
