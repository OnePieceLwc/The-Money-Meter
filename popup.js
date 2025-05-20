// 工具函数
function formatMoney(val) {
  return (+val).toFixed(2);
}
function getCurrencySymbol(currency) {
  switch (currency) {
    case 'USD': return '$';
    case 'EUR': return '€';
    default: return '元';
  }
}

// 状态管理
const defaultSettings = {
  salaryMode: 'month',
  salary: 8000,
  workHour: 8,
  currency: 'CNY'
};
let settings = {...defaultSettings};
let todayEarned = 0;
let running = false;
let timer = null;
let startTime = null;
let pausedTime = 0;

// 读取本地存储
function loadState() {
  const s = localStorage.getItem('niuma_settings');
  if (s) settings = {...settings, ...JSON.parse(s)};
  const e = localStorage.getItem('niuma_today_earned');
  if (e) todayEarned = parseFloat(e);
  const t = localStorage.getItem('niuma_paused_time');
  if (t) pausedTime = parseInt(t);
}
function saveState() {
  localStorage.setItem('niuma_settings', JSON.stringify(settings));
  localStorage.setItem('niuma_today_earned', todayEarned);
  localStorage.setItem('niuma_paused_time', pausedTime);
}

// 计算每秒收入
function calcPerSec() {
  let total = 0;
  if (settings.salaryMode === 'month') {
    total = settings.salary / 22; // 22个工作日
  } else if (settings.salaryMode === 'day') {
    total = settings.salary;
  } else {
    total = settings.salary * settings.workHour;
  }
  return total / (settings.workHour * 3600);
}

// 动画数字
function animateNumber(el, to, duration = 400) {
  const from = parseFloat(el.textContent) || 0;
  const diff = to - from;
  if (Math.abs(diff) < 0.01) {
    el.textContent = formatMoney(to);
    return;
  }
  let start = null;
  function step(ts) {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    el.textContent = formatMoney(from + diff * progress);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = formatMoney(to);
  }
  requestAnimationFrame(step);
}

// 刷新页面
function updateView() {
  const perSec = calcPerSec();
  document.getElementById('per-sec').textContent = formatMoney(perSec);
  document.getElementById('today-earned').textContent = formatMoney(todayEarned);
  document.getElementById('currency-symbol').textContent = getCurrencySymbol(settings.currency) + '/秒';
  document.getElementById('currency-symbol2').textContent = getCurrencySymbol(settings.currency);
  // 设置面板
  document.getElementById('salary-mode').value = settings.salaryMode;
  document.getElementById('salary-input').value = settings.salary;
  document.getElementById('workhour-input').value = settings.workHour;
  document.getElementById('currency').value = settings.currency;
  document.getElementById('salary-unit').textContent = getCurrencySymbol(settings.currency);
}

// 实时累加
function startTimer() {
  if (timer) clearInterval(timer);
  running = true;
  document.getElementById('start-pause').textContent = '暂停';
  startTime = Date.now();
  timer = setInterval(() => {
    const perSec = calcPerSec();
    todayEarned += perSec;
    animateNumber(document.getElementById('today-earned'), todayEarned);
    saveState();
  }, 1000);
}
function pauseTimer() {
  running = false;
  document.getElementById('start-pause').textContent = '开始';
  if (timer) clearInterval(timer);
  pausedTime = Date.now();
  saveState();
}
function resetToday() {
  todayEarned = 0;
  saveState();
  animateNumber(document.getElementById('today-earned'), todayEarned);
}

// 事件绑定
function bindEvents() {
  document.getElementById('salary-mode').onchange = e => {
    settings.salaryMode = e.target.value;
    saveState();
    updateView();
  };
  document.getElementById('salary-input').oninput = e => {
    settings.salary = parseFloat(e.target.value) || 0;
    saveState();
    updateView();
  };
  document.getElementById('workhour-input').oninput = e => {
    settings.workHour = parseFloat(e.target.value) || 0;
    saveState();
    updateView();
  };
  document.getElementById('currency').onchange = e => {
    settings.currency = e.target.value;
    saveState();
    updateView();
  };
  document.getElementById('start-pause').onclick = () => {
    if (running) pauseTimer();
    else startTimer();
  };
  document.getElementById('reset').onclick = () => {
    resetToday();
  };
  document.getElementById('toggle-settings').onclick = () => {
    document.getElementById('settings-panel').classList.toggle('hidden');
  };
}

// 粒子背景
function goldParticles() {
  const canvas = document.getElementById('bg-effect');
  const ctx = canvas.getContext('2d');
  let w = canvas.width = canvas.offsetWidth;
  let h = canvas.height = canvas.offsetHeight;
  let particles = [];
  function resize() {
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
  }
  window.addEventListener('resize', resize);
  for (let i = 0; i < 30; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 2 + 1,
      s: Math.random() * 1.5 + 0.5,
      o: Math.random() * 0.5 + 0.5
    });
  }
  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (let p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(255,215,0,${p.o})`;
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 8;
      ctx.fill();
      p.y += p.s;
      if (p.y > h) {
        p.y = -p.r;
        p.x = Math.random() * w;
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
}

// 初始化
window.onload = function() {
  loadState();
  updateView();
  bindEvents();
  goldParticles();
  if (running) startTimer();
}; 