// ============ Nexserver 官网 多页面交互脚本 ============
/* 功能：主题切换 / 四季背景 / 封面幻灯片 / 主机监测 / 在线状态 / 线路列表 / 赞助验证 / FAQ / 复制 / 动画 */

// ============ 通用：配置注入 ============
function initializeConfig() {
  if (typeof serverConfig === 'undefined') return;
  try {
  if (serverConfig.qqGroup && serverConfig.qqGroup.url) {
    var qq = document.getElementById('qq-group-link');
    if (qq) qq.href = serverConfig.qqGroup.url;
    var fqq = document.getElementById('footer-qq-link');
    if (fqq) fqq.href = serverConfig.qqGroup.url;
  }
    if (serverConfig.bilibili && serverConfig.bilibili.url) {
      var bi = document.getElementById('bilibili-link');
      if (bi) bi.href = serverConfig.bilibili.url;
      var fbi = document.getElementById('footer-bilibili-link');
      if (fbi) fbi.href = serverConfig.bilibili.url;
    }
    if (serverConfig.email && serverConfig.email.address) {
      var em = document.getElementById('email-link');
      if (em) em.href = 'mailto:' + serverConfig.email.address;
    }
    var name = serverConfig.serverName || 'Nexserver';
    ['server-title', 'server-name-nav', 'server-name-footer'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = name;
    });
    if (serverConfig.serverIP && serverConfig.serverPort) {
      var ipEl = document.getElementById('server-ip');
      if (ipEl) ipEl.textContent = serverConfig.serverIP + ':' + serverConfig.serverPort;
    }
  } catch (e) {}
}

// ============ 深色/浅色主题 ============
function syncThemeIcons() {
  var dark = document.documentElement.classList.contains('theme-dark');
  var btn = document.getElementById('theme-toggle');
  if (btn) {
    var thumb = btn.querySelector('.ts-thumb');
    if (thumb) thumb.innerHTML = dark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    btn.setAttribute('aria-checked', dark ? 'true' : 'false');
  }
  var btnM = document.getElementById('theme-toggle-mobile');
  if (btnM) {
    var thumbM = btnM.querySelector('.ts-thumb');
    if (thumbM) thumbM.innerHTML = dark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  }
  var label = document.querySelector('.ts-mobile-label');
  if (label) label.textContent = dark ? '浅色模式' : '深色模式';
}

function initTheme() {
  var saved = null;
  try { saved = localStorage.getItem('nex-theme'); } catch (e) {}
  var apply = function (dark) {
    var d = document.documentElement;
    if (dark) d.classList.add('theme-dark'); else d.classList.remove('theme-dark');
    syncThemeIcons();
  };
  if (saved === 'dark') apply(true);
  else if (saved === 'light') apply(false);
  else {
    var dark = false;
    try { dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches; } catch (e) {}
    apply(dark);
  }
  var bind = function (btn) {
    if (!btn) return;
    btn.addEventListener('click', function () {
      var dark = document.documentElement.classList.toggle('theme-dark');
      try { localStorage.setItem('nex-theme', dark ? 'dark' : 'light'); } catch (e) {}
      syncThemeIcons();
    });
  };
  bind(document.getElementById('theme-toggle'));
  bind(document.getElementById('theme-toggle-mobile'));
}

// ============ 四季系统 ============
var SEASON_DECOR = {
  autumn: { icon: '<svg viewBox="0 0 64 64" fill="none"><path d="M32 6 L38 21 L55 14 L48 29 L62 33 L48 37 L55 52 L38 45 L32 60 L26 45 L9 52 L16 37 L2 33 L16 29 L9 14 L26 21 Z" fill="currentColor" opacity="0.9"/></svg>' },
  winter: { icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M32 4 V60 M4 32 H60 M12 12 L52 52 M52 12 L12 52"/></svg>' },
  spring: { icon: '<svg viewBox="0 0 64 64" fill="none"><g fill="currentColor"><ellipse cx="32" cy="18" rx="8.5" ry="12.5"/><ellipse cx="32" cy="18" rx="8.5" ry="12.5" transform="rotate(72 32 18)"/><ellipse cx="32" cy="18" rx="8.5" ry="12.5" transform="rotate(144 32 18)"/><ellipse cx="32" cy="18" rx="8.5" ry="12.5" transform="rotate(216 32 18)"/><ellipse cx="32" cy="18" rx="8.5" ry="12.5" transform="rotate(288 32 18)"/></g><circle cx="32" cy="32" r="4" fill="rgba(255,255,255,0.7)"/></svg>' },
  summer: { icon: '<svg viewBox="0 0 64 64" fill="none"><path d="M56 8 C44 10 26 16 16 34 C6 52 45 60 55 56 C56 45 63 12 56 8 Z" fill="currentColor"/></svg>' }
};

function getCurrentSeason() {
  var now = new Date();
  var md = (now.getMonth() + 1) * 100 + now.getDate();
  if (md >= 204 && md < 505) return 'spring';
  if (md >= 505 && md < 807) return 'summer';
  if (md >= 807 && md < 1107) return 'autumn';
  return 'winter';
}

function initSeasonAndTime() {
  try { document.body.classList.add('season-' + getCurrentSeason()); } catch (e) {}
  var season = getCurrentSeason();
  var decor = document.getElementById('season-decor');
  if (decor && SEASON_DECOR[season]) {
    var ic = SEASON_DECOR[season].icon;
    decor.innerHTML =
      '<span class="sd sd-tl">' + ic + '</span>' +
      '<span class="sd sd-tr">' + ic + '</span>' +
      '<span class="sd sd-bl">' + ic + '</span>' +
      '<span class="sd sd-br">' + ic + '</span>';
  }
  var iconEl = document.getElementById('cover-time-icon');
  if (iconEl && SEASON_DECOR[season]) iconEl.innerHTML = SEASON_DECOR[season].icon;
  var timeEl = document.getElementById('cover-time-text');
  if (!timeEl) return;
  var update = function () {
    try {
      var fmt = new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', hour12: false });
      timeEl.textContent = fmt.format(new Date());
    } catch (e) {}
  };
  update();
  setInterval(update, 1000);
}

// ============ 鼠标动态光感 ============
function initSpotlight() {
  document.addEventListener('mousemove', function (e) {
    var card = e.target && e.target.closest ? e.target.closest('.spotlight-card') : null;
    if (!card) return;
    var r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
}

// ============ 语录（刷新随机一条） ============
var HERO_QUOTES = [
  '如果你帮助别人，别人也会帮助你', '支持你认为值得的社区', '成功的团队往往不会忘记初心',
  '如果你心情不好，那就忘掉过去的事', '窝咬池弥反', 'NONONO你无疑是兴奋的。',
  '传说米饭和船经常因为双人合作设计而产生极大的排异', '"1"+"1"=11你知道为什么吗？',
  '今天世界上有很多好事正在发生', '花哨高贵的事物会让人觉得贵且复杂的总是更好，你知道为什么吗？',
  '用废话提问得到的一定是废话——刘文华', '背后夸奖人人敬仰；背后吐槽人人唾弃',
  '寓鼓励于赞美之中——刘文华', '人类的语言只能表达内心的15%', '身体是一张不会说谎的嘴——刘文华',
  '人没有高低贵贱之分，只有能力范围不同', '工人是伟大的！！！劳动创造世界！！！',
  '看人不顺眼，是因自己情商不够——刘文华', '服务器开放海外玩家进入，欢迎加入tg的Nexserver',
  '夸张渲染往往能起到坑蒙拐骗的效果', '如果每个人都和平共处抱着友善的心态生活会有所改善吗？',
  '满分10分你对服务器打几分？11分！', '高冷是远离阳光群体的最佳技巧！',
  '有一则公益广告写过抽烟的四大好处：一省布料，二防盗贼，三可防蚊，四永葆青春',
  '富强民主文明和谐，自由平等公正法制', '新中国1949年举行开国大典，成为共产主义而非社会主义国家',
  '新中国于1978年改革开放，是新中国成立以来具有深远意义的伟大转折',
  '马克思其实是德国人，恩格斯以前是英国普通工人', '和不同的人交往要用不同的方式，例如不要在乞丐面前炫耀自己',
  '体谅他人内心的想法，你会赢得尊重', '炸服？你完蛋了！', '如果你理解别人身上的某种品质，说明你也具有这种品质',
  '水煮船是很全能的人，但是做事情极没效率', '听说茗汐姐姐是男的（）',
  '你知道吗，俄罗斯人很喜欢吃甜的饺子，他们会把草莓等东西当馅料，而这只不过是日常',
  '常常为他人着想，你是个温柔的人', '赞美别人的细微之处总是会让他们特别高兴',
  '善于成事的人总是先观察再行动', '如果你愿意做好事，那起码要付诸行动',
  '爱因斯坦的大脑是在长期的科学活动中不断积累经验才在科学方面如此聪明',
  '别人对你三言两语有可能是在让你和朋友产生分歧', '这是计划的一部分【doge】',
  '温柔优雅的谈吐会让人觉得你十分亲近', '服务器开支爆表，主要浪费在宣传上',
  '===++天动万象++===', '帝君这么做一定有他的深意', 'xdxc惧怕蝙蝠', 'NEXserver——Join us now!',
  '不要因为猜疑链绷断你们的友谊，勇敢的去面对他', '勇气是人类的赞歌——',
  '服务器正在加载源宇宙模型，正在生成超级罗希，请稍后......',
  '未来人工智能有可能实现人类不劳而获？', '小田暑假都要上课，而且比船和米饭考试的时候都忙',
  '为什么米饭总是那么擅长早睡早起？', '晚枫是当前服务器最受欢迎的玩家之一',
  'dorcer喜欢玩光影和材质，然后卡的起飞经常对着墙跳跃', '荣誉值+5',
  '好累，如果你认可且喜欢我们的社区不妨支持我们，我们会把NEX做的更大更好',
  'Leading......      -404'
];

function initHeroQuote() {
  var wrap = document.getElementById('hero-quote-wrap');
  if (!wrap || !HERO_QUOTES.length) return;
  if (wrap.childElementCount > 0) return;
  var idx = Math.floor(Math.random() * HERO_QUOTES.length);
  var span = document.createElement('span');
  span.className = 'hero-quote-text';
  span.textContent = HERO_QUOTES[idx];
  wrap.appendChild(span);
}

// ============ 封面幻灯片（上下无缝循环） ============
function initCoverSlider() {
  var viewport = document.getElementById('cover-slider-viewport');
  if (!viewport) return;
  var track = viewport.querySelector('.slide-track');
  var originals = Array.prototype.slice.call(viewport.querySelectorAll('.slide-img'));
  if (originals.length < 2 || !track) return;
  if (track.dataset.initialized) return;
  track.dataset.initialized = '1';

  track.innerHTML = '';
  track.appendChild(originals[originals.length - 1].cloneNode(true));
  originals.forEach(function (o) { track.appendChild(o); });
  track.appendChild(originals[0].cloneNode(true));

  var imgs = track.querySelectorAll('.slide-img');
  var total = imgs.length;
  var cur = 1;
  var timer = null;

  var dotsBox = document.getElementById('cover-dots');
  if (dotsBox) dotsBox.innerHTML = '';

  function update(animated) {
    track.style.transition = animated ? '' : 'none';
    track.style.transform = 'translateY(-' + (cur * 100) + '%)';
    if (!animated) { void track.offsetWidth; }
  }
  function next() { cur++; if (cur >= total) cur = 1; update(true); restart(); }
  function prev() { cur--; if (cur < 0) cur = total - 2; update(true); restart(); }
  function go(i) { cur = i + 1; update(true); restart(); }
  function restart() { if (timer) clearInterval(timer); timer = setInterval(next, 10000); }

  // 点击下一张
  var swiped = false;
  viewport.addEventListener('click', function () {
    if (swiped) { swiped = false; return; }
    next();
  });

  // 触摸滑动（上下）
  var touchStart = null;
  viewport.addEventListener('touchstart', function (e) {
    touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });
  viewport.addEventListener('touchend', function (e) {
    if (!touchStart) return;
    var dy = e.changedTouches[0].clientY - touchStart.y;
    var dx = e.changedTouches[0].clientX - touchStart.x;
    touchStart = null;
    var TH = 40;
    if (Math.abs(dy) > TH && Math.abs(dy) > Math.abs(dx)) { swiped = true; dy < 0 ? next() : prev(); }
    else if (Math.abs(dx) > TH) { swiped = true; dx < 0 ? next() : prev(); }
  }, { passive: true });

  // 鼠标拖拽（纵向）
  var dragStart = null, dragDy = 0, dragging = false;
  viewport.addEventListener('mousedown', function (e) {
    dragging = true;
    dragStart = { x: e.clientX, y: e.clientY };
    track.style.transition = 'none';
    e.preventDefault();
  });
  window.addEventListener('mousemove', function (e) {
    if (!dragging || !dragStart) return;
    dragDy = e.clientY - dragStart.y;
    var vh = viewport.clientHeight || 300;
    track.style.transform = 'translateY(' + (-cur * vh + dragDy) + 'px)';
  });
  window.addEventListener('mouseup', function () {
    if (!dragging) return;
    dragging = false;
    track.style.transition = '';
    if (dragDy < -50) { swiped = true; next(); }
    else if (dragDy > 50) { swiped = true; prev(); }
    else { track.style.transform = 'translateY(-' + (cur * 100) + '%)'; }
    dragStart = null; dragDy = 0;
  });

  update(false);
  restart();
}

// ============ 工具函数 ============
function setEl(id, v) { var el = document.getElementById(id); if (el) el.textContent = v; }
function fmtSize(mb) {
  if (mb === null || mb === undefined || isNaN(mb)) return '--';
  if (mb >= 1024) return (mb / 1024).toFixed(1) + 'GB';
  return mb.toFixed(0) + 'MB';
}



// ============ GridMotion 鼠标互动图片模块 ============
function initGridMotion() {
  var grid = document.getElementById('gm-grid');
  if (!grid) return;
  var imgs = [];
  for (var i = 1; i <= 18; i++) {
    imgs.push('picture/gridmotion/g' + (i < 10 ? '0' + i : i) + '.jpg');
  }
  grid.innerHTML = '';
  var rows = [];
  for (var r = 0; r < 4; r++) {
    var row = document.createElement('div');
    row.className = 'gm-row';
    for (var c = 0; c < 7; c++) {
      var cell = document.createElement('div');
      cell.className = 'gm-cell';
      var src = imgs[(r * 7 + c) % imgs.length];
      cell.innerHTML = '<img src="' + src + '" alt="" loading="lazy">';
      row.appendChild(cell);
    }
    grid.appendChild(row);
    rows.push(row);
  }
  var mouseX = window.innerWidth / 2;
  var cur = window.innerWidth / 2;
  window.addEventListener('mousemove', function (e) { mouseX = e.clientX; }, { passive: true });
  var inertias = [0.6, 0.4, 0.3, 0.2];
  (function tick() {
    cur += (mouseX - cur) * 0.2;
    for (var i = 0; i < rows.length; i++) {
      var dir = i % 2 === 0 ? 1 : -1;
      var base = (cur / window.innerWidth - 0.5) * 550;
      rows[i].style.transform = 'translateX(' + (base * dir * inertias[i % 4]).toFixed(1) + 'px)';
    }
    requestAnimationFrame(tick);
  })();
}

// ============ 主机实时监测（fetch 版，由本地 host-api 提供） ============
function setPerfValue(key, percent, text) {
  var valEl = document.getElementById('perf-' + key);
  var barEl = document.getElementById('bar-' + key);
  if (valEl) {
    if (text) valEl.innerHTML = text;
    else if (percent !== null && percent !== undefined) valEl.innerHTML = percent + '%';
  }
  if (barEl && percent !== null && percent !== undefined) {
    var p = Math.max(0, Math.min(100, percent));
    barEl.style.width = p + '%';
    barEl.style.background = p > 90 ? 'linear-gradient(90deg,#ef4444,#f87171)' : p > 70 ? 'linear-gradient(90deg,#f59e0b,#fbbf24)' : '';
  }
}

function setHostDataUnavailable(reason) {
  ['cpu', 'mem', 'instances', 'uptime'].forEach(function (k) { setPerfValue(k, null, '--'); });
  if (reason) {
    var diag = document.getElementById('host-diag');
    if (!diag) {
      var panel = document.querySelector('.status-panel');
      if (!panel) return;
      diag = document.createElement('p');
      diag.id = 'host-diag';
      diag.style.cssText = 'margin-top:12px;font-size:0.72rem;color:#f87171;text-align:center;';
      panel.appendChild(diag);
    }
    diag.textContent = '监测连接失败: ' + reason;
  }
}

function updateHostData(info) {
  if (!info || !info.system) return;
  var sys = info.system;
  var inst = info.instance || {};
  var cpu = typeof sys.cpuUsage === 'number' ? Math.round(sys.cpuUsage * 100) : null;
  setPerfValue('cpu', cpu, null);
  var memPercent = typeof sys.memUsage === 'number' ? Math.round(sys.memUsage * 100) : null;
  var usedMB = null, totalGB = null;
  if (typeof sys.totalmem === 'number' && typeof sys.freemem === 'number') {
    usedMB = Math.round((sys.totalmem - sys.freemem) / 1024 / 1024);
    totalGB = (sys.totalmem / 1024 / 1024 / 1024).toFixed(1);
  }
  setPerfValue('mem', memPercent, (fmtSize(usedMB)) + ' / ' + (totalGB ? totalGB + 'GB' : '--'));
  setPerfValue('instances', null, (inst.running || 0) + ' / ' + (inst.total || 0));
  if (typeof sys.uptime === 'number') {
    var h = sys.uptime;
    var text = h >= 24 ? (h / 24).toFixed(1) + '天' : h.toFixed(1) + '小时';
    setPerfValue('uptime', null, text);
  }
  setEl('panel-hostname', sys.hostname || '--');
}

function initHostMonitor() {
  var fetchData = function () {
    fetch('/api/host', { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d && d.ok) {
          updateHostData({
            system: {
              cpuUsage: typeof d.cpu === 'number' ? d.cpu / 100 : 0,
              memUsage: typeof d.memPercent === 'number' ? d.memPercent / 100 : 0,
              totalmem: d.memTotalGB ? d.memTotalGB * 1024 * 1024 * 1024 : 0,
              freemem: (d.memTotalGB && d.memUsedMB) ? (d.memTotalGB * 1024 - d.memUsedMB) * 1024 * 1024 : 0,
              uptime: typeof d.uptime === 'number' ? d.uptime : 0,
              hostname: d.hostname || ''
            },
            instance: { running: d.running || 0, total: d.total || 0 }
          });
        } else {
          setHostDataUnavailable('数据接口未就绪');
        }
      })
      .catch(function () { setHostDataUnavailable('监测接口不可用'); });
  };
  fetchData();
  setInterval(fetchData, 5000);
}

// ============ 服务器在线状态（motd API） ============
function updateServerStatus() {
  var ip = 'nexserver.top', port = '25565';
  if (typeof serverConfig !== 'undefined' && serverConfig.serverIP && serverConfig.serverPort) {
    ip = serverConfig.serverIP; port = serverConfig.serverPort;
  }
  var api = 'https://motd.minebbs.com/api/status?ip=' + encodeURIComponent(ip) + '&port=' + encodeURIComponent(port);
  fetch(api, { cache: 'no-store' })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      var online = d && d.status === 'online';
      var playerCountEl = document.getElementById('player-count-chip');
      if (playerCountEl && d && d.players) playerCountEl.textContent = (d.players.online || 0) + ' / ' + (d.players.max || 0);
      var listEl = document.getElementById('player-list');
      if (listEl) listEl.textContent = online ? (d.players && d.players.online ? d.players.online + ' 名玩家在线' : '在线') : '服务器离线';
      var verEl = document.getElementById('server-version');
      if (verEl) verEl.textContent = (d && d.version) ? d.version : '--';
      setStatusUI(online);
    })
    .catch(function () { setStatusUI(false); });
}

function setStatusUI(online) {
  var chip = document.getElementById('panel-status-chip');
  if (chip) {
    chip.textContent = online ? '在线' : '离线';
    chip.className = 'sp-chip ' + (online ? 'ok' : 'down');
  }
  var heroText = document.getElementById('hero-server-status');
  if (heroText) {
    heroText.textContent = online ? '在线' : '离线';
    heroText.className = 'font-bold ' + (online ? 'text-green-600' : 'text-red-500');
  }
  var heroDot = document.getElementById('hero-status-dot');
  if (heroDot) heroDot.style.background = online ? '#22c55e' : '#ef4444';
}

// ============ 首页初始化 ============
function initIndexPage() {
  try { initHostMonitor(); } catch (e) {}
  try { updateServerStatus(); } catch (e) {}
  try { setInterval(updateServerStatus, 15000); } catch (e) {}
  try { initHeroQuote(); } catch (e) {}
}

// ============ 加入页：服务器线路列表 ============
function initServerLines() {
  initCopyButtons();
  checkServerLines();
}

function checkServerLines() {
  var items = document.querySelectorAll('#server-line-list .sl-item');
  items.forEach(function (item) {
    var ip = item.getAttribute('data-ip') || '';
    if (!ip) return;
    var textEl = item.querySelector('.sl-text');
    fetch('https://motd.minebbs.com/api/status?ip=' + encodeURIComponent(ip) + '&port=25565', { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var online = d && d.status === 'online';
        item.classList.toggle('offline', !online);
        if (textEl) textEl.textContent = online ? '在线' : '离线';
      })
      .catch(function () {
        item.classList.add('offline');
        if (textEl) textEl.textContent = '离线';
      });
  });
}

function initJoinPage() {
  try { initSquaresBackground(); } catch (e) {}
  try { initDecryptedText(); } catch (e) {}
  try { initRotatingWords(); } catch (e) {}
  
  try { initSquaresBackground(); } catch (e) {}
  try { initRotatingWords(); } catch (e) {}
  try { initDecryptedTexts(); } catch (e) {}
  try { updateServerStatus(); } catch (e) {}
  try { initCopyButtons(); } catch (e) {}
}

// ============ 复制地址 + 通知 ============
var __notifWrap = null;
function showNotification(message, type) {
  if (__notifWrap && __notifWrap.parentNode) { __notifWrap.parentNode.removeChild(__notifWrap); }
  var wrap = document.createElement('div');
  wrap.style.cssText = 'position:fixed;top:30px;left:50%;transform:translateX(-50%);z-index:99999;pointer-events:none;';
  var note = document.createElement('div');
  var isS = type === 'success', isE = type === 'error';
  var bg = isS ? 'rgba(34,197,94,0.78)' : isE ? 'rgba(239,68,68,0.78)' : 'rgba(59,130,246,0.78)';
  var bd = isS ? 'rgba(134,239,172,0.9)' : isE ? 'rgba(252,165,165,0.9)' : 'rgba(147,197,253,0.9)';
  // 液态玻璃（Liquid Glass）：半透明彩色渐变 + 顶部高光反射带 + 内高光 + 饱和模糊
  var tint = isS ? '34,197,94' : isE ? '239,68,68' : '59,130,246';
  note.style.cssText =
    'position:relative;padding:13px 24px;border-radius:16px;display:flex;align-items:center;gap:10px;' +
    'color:#fff;font-weight:600;font-size:.875rem;white-space:nowrap;' +
    'background:rgba(' + tint + ',0.78);' +
    'border:1px solid rgba(' + tint + ',0.95);' +
    'backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);' +
    'box-shadow:0 8px 30px rgba(0,0,0,0.22);' +
    'animation:nexToastIn .72s cubic-bezier(.25,.9,.3,1.05);opacity:0;';
  note.innerHTML = '<i class="' + (isS ? 'fas fa-check-circle' : isE ? 'fas fa-exclamation-circle' : 'fas fa-info-circle') + '" style="font-size:.98rem;opacity:.95"></i>' + message;
  wrap.appendChild(note);
  document.body.appendChild(wrap);
  __notifWrap = wrap;
  setTimeout(function () {
    note.style.backdropFilter = 'none'; note.style.webkitBackdropFilter = 'none';
    note.style.animation = 'nexToastOut .95s cubic-bezier(.4,0,.2,1) forwards';
    setTimeout(function () { if (wrap.parentNode) wrap.parentNode.removeChild(wrap); }, 980);
  }, 2600);
}

function copyTextToClipboard(text, onSuccess, onFail) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(onSuccess, function () { legacyCopy(text, onSuccess, onFail); });
  } else {
    legacyCopy(text, onSuccess, onFail);
  }
}

function legacyCopy(text, onSuccess, onFail) {
  try {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-9999px';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    var ok = document.execCommand('copy');
    document.body.removeChild(ta);
    ok ? onSuccess() : onFail();
  } catch (e) { onFail(); }
}

function initCopyButtons() {
  document.querySelectorAll('.btn-copy-ip').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var address = this.dataset.ip || 'nexserver.top';
      var original = this.innerHTML;
      copyTextToClipboard(address,
        function () {
          showNotification('已复制：' + address, 'success');
          btn.innerHTML = '<i class="fas fa-check mr-1"></i>已复制';
          setTimeout(function () { btn.innerHTML = original; }, 1500);
        },
        function () {
          showNotification('复制失败，请手动复制：' + address, 'error');
        }
      );
    });
  });
}

// ============ FAQ 手风琴（整卡点击 + 精确高度动画） ============
function initFaq() {
  document.querySelectorAll('.faq-question').forEach(function (q) {
    var card = q.closest('.glass-card') || q.parentElement;
    if (!card || card.dataset.faqBound === '1') return;
    card.dataset.faqBound = '1';
    card.style.cursor = 'pointer';
    card.addEventListener('click', function () {
      var a = q.nextElementSibling;
      if (!a) return;
      var icon = q.querySelector('i');
      if (a.classList.contains('show')) {
        a.style.maxHeight = a.scrollHeight + 'px';
        void a.offsetHeight;
        a.style.maxHeight = '0px';
        a.classList.remove('show');
      } else {
        a.classList.add('show');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
      if (icon) icon.classList.toggle('rotate-180');
    });
  });
}

// ============ 赞助：Turnstile 验证 + 支付方式 ============
function renderTurnstile() {
  var el = document.getElementById('hcaptcha-container');
  if (!el) return;
  el.innerHTML = '';
  if (typeof turnstile === 'undefined') {
    var st = document.getElementById('hcaptcha-status');
    if (st) st.innerHTML = '<span class="text-red-500">验证组件加载失败，请刷新页面重试</span>';
    return;
  }
  try {
    turnstile.render(el, {
      sitekey: '0x4AAAAAAEQuKMYlZlIyDl-l',
      theme: document.documentElement.classList.contains('theme-dark') ? 'dark' : 'light',
      callback: function (token) {
        var st = document.getElementById('hcaptcha-status');
        if (st) st.textContent = '正在校验…';
        fetch('/api/pay-turnstile-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: token })
        }).then(function (r) { return r.json(); }).then(function (d) {
          if (d && d.success) {
            var area = document.getElementById('hcaptcha-area');
            var container = document.getElementById('pay-methods-container');
            if (area) area.style.display = 'none';
            if (container) container.style.display = '';
          } else {
            if (st) st.innerHTML = '<span class="text-red-500">验证未通过，请重试</span>';
            if (typeof turnstile !== 'undefined') turnstile.reset();
          }
        }).catch(function () {
          if (st) st.innerHTML = '<span class="text-red-500">校验失败，请重试</span>';
          if (typeof turnstile !== 'undefined') turnstile.reset();
        });
      },
      'expired-callback': function () {
        var st = document.getElementById('hcaptcha-status');
        if (st) st.innerHTML = '<span class="text-amber-500">验证已过期，请重新验证</span>';
        if (typeof turnstile !== 'undefined') turnstile.reset();
      },
      'error-callback': function () {
        var st = document.getElementById('hcaptcha-status');
        if (st) st.innerHTML = '<span class="text-red-500">验证出错，请重试</span>';
      }
    });
    window.__hcRetry = function () { renderTurnstile(); };
  } catch (e) {
    var st2 = document.getElementById('hcaptcha-status');
    if (st2) st2.innerHTML = '<span class="text-red-500">验证组件异常</span> <button class="hc-retry" onclick="window.__hcRetry&&window.__hcRetry()">重新验证</button>';
  }
}

function initDonate() {
  var payMethods = {
    wechat: { label: '微信支付', icon: 'fab fa-weixin', qr: 'picture/pay-wechat.jpg', cls: 'wechat' },
    alipay: { label: '支付宝', icon: 'fab fa-alipay', qr: 'picture/pay-alipay.jpg', cls: 'alipay' },
    afdian: { label: '爱发电', icon: 'fas fa-heart', qr: 'picture/pay-aifadian.jpg', cls: 'afdian' }
  };

  function renderPayMethods(plan, methods) {
    var container = document.getElementById('pay-methods-container');
    if (!container) return;
    container.innerHTML = '';
    methods.forEach(function (m) {
      var info = payMethods[m];
      if (!info) return;
      var div = document.createElement('div');
      div.className = 'pay-method ' + info.cls;
      div.innerHTML = '<i class="' + info.icon + '"></i>' + info.label;
      div.addEventListener('click', function () {
        closeModal('pay-method-modal');
        openQR(plan, m);
      });
      container.appendChild(div);
    });
  }

  document.querySelectorAll('.donate-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var plan = this.dataset.plan;
      var methods = (this.dataset.methods || '').split(',').filter(function (m) { return payMethods[m]; });
      var planNameEl = document.getElementById('pay-plan-name');
      var hcArea = document.getElementById('hcaptcha-area');
      var container = document.getElementById('pay-methods-container');
      var st = document.getElementById('hcaptcha-status');
      if (planNameEl) planNameEl.textContent = '支持项目：' + plan;
      if (hcArea) hcArea.style.display = '';
      if (container) container.style.display = 'none';
      if (st) st.innerHTML = '';
      renderPayMethods(plan, methods);
      openModal('pay-method-modal');
      setTimeout(renderTurnstile, 150);
    });
  });

  bindBackPay();
}

function bindBackPay() {
  var btn = document.getElementById('btn-back-pay');
  if (!btn) return;
  btn.addEventListener('click', function () {
    closeModal('pay-qr-modal');
    openModal('pay-method-modal');
  });
}

function openModal(id) { var el = document.getElementById(id); if (el) el.classList.add('show'); }
function closeModal(id) { var el = document.getElementById(id); if (el) el.classList.remove('show'); }

function openQR(plan, method) {
  var infoMap = {
    wechat: { title: '微信支付', qr: 'picture/pay-wechat.jpg' },
    alipay: { title: '支付宝', qr: 'picture/pay-alipay.jpg' },
    afdian: { title: '爱发电', qr: 'picture/pay-aifadian.jpg' }
  };
  var info = infoMap[method] || infoMap.wechat;
  var titleEl = document.getElementById('qr-title');
  var imgEl = document.getElementById('qr-img');
  if (titleEl) titleEl.textContent = plan + ' · ' + info.title;
  if (imgEl) imgEl.src = info.qr;
  openModal('pay-qr-modal');
}

// ============ 当前页导航高亮 ============
function highlightNav() {
  var page = document.body.dataset.page || 'index';
  document.querySelectorAll('.navbar a[data-page]').forEach(function (a) {
    var target = a.getAttribute('data-page').replace('.html', '');
    a.classList.toggle('active', target === page);
  });
}

// ============ 滚动入场动画 ============
function animateOnScroll() {
  if (typeof IntersectionObserver === 'undefined') return;
  var targets = document.querySelectorAll('.animate-target');
  if (!targets.length) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add('visible');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.08 });
  targets.forEach(function (t) { io.observe(t); });
}

// ============ 初始化调度 ============
document.addEventListener('DOMContentLoaded', function () {
  var page = document.body.dataset.page || 'index';

  initializeConfig();
  initTheme();
  initSeasonAndTime();
  initSpotlight();

  if (page === 'join') initServerLines();
  if (page === 'index') initCoverSlider();

  if (page === 'index') initIndexPage();

 if (page === 'index') initGridMotion();

 //首页：主机监测+寄语+北京时间 if (page === 'index') initIndexPage();
  if (page === 'join') initJoinPage();
  if (page === 'faq') initFaq();
  if (page === 'donate') initDonate();

  highlightNav();

  // 移动端下拉菜单
  (function () {
    var menuButton = document.querySelector('.mobile-menu-button');
    var mobileMenu = document.getElementById('mobile-menu');
    if (menuButton && mobileMenu) {
      menuButton.addEventListener('click', function () {
        var isOpen = mobileMenu.classList.toggle('open');
        menuButton.classList.toggle('active', isOpen);
        menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
      mobileMenu.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          mobileMenu.classList.remove('open');
          menuButton.classList.remove('active');
          menuButton.setAttribute('aria-expanded', 'false');
        });
      });
    }
  })();

  // 返回顶部按钮
  var backTop = document.getElementById('back-top');
  if (backTop) {
    window.addEventListener('scroll', function () { backTop.classList.toggle('show', window.scrollY > 500); });
    backTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  var yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  initCopyButtons();
  animateOnScroll();
});

// ============ 弹窗关闭按钮（顶层绑定，所有页面生效） ============
(function () {
  var btns = document.querySelectorAll('.modal-close');
  for (var i = 0; i < btns.length; i++) {
    (function (btn) {
      btn.addEventListener('click', function () {
        var target = btn.getAttribute('data-close');
        if (target && typeof closeModal === 'function') closeModal(target);
      });
    })(btns[i]);
  }
})();


// ============ Squares 方格背景（复刻 CSFront_Refreshed） ============
function initSquaresBackground() {
  var canvas = document.getElementById('squares-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  if (!ctx) return;
  var squareSize = 120;
  var w, h, numX, numY;
  var gridOffset = { x: 0, y: 0 };
  var hovered = null;
  var raf = null;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    numX = Math.ceil(w / squareSize) + 1;
    numY = Math.ceil(h / squareSize) + 1;
  }
  resize();
  window.addEventListener('resize', resize);

  function drawGrid() {
    ctx.clearRect(0, 0, w, h);
    var dark = document.documentElement.classList.contains('theme-dark');
    var borderColor = dark ? 'rgba(255,255,255,0.30)' : 'rgba(15,15,15,0.22)';
    var startX = Math.floor(gridOffset.x / squareSize) * squareSize;
    var startY = Math.floor(gridOffset.y / squareSize) * squareSize;
    for (var x = startX; x < w + squareSize; x += squareSize) {
      for (var y = startY; y < h + squareSize; y += squareSize) {
        var sx = x - (gridOffset.x % squareSize);
        var sy = y - (gridOffset.y % squareSize);
        if (hovered && Math.floor((x - startX) / squareSize) === hovered.x && Math.floor((y - startY) / squareSize) === hovered.y) {
          ctx.fillStyle = '#ffb300';
          ctx.fillRect(sx, sy, squareSize, squareSize);
        }
        ctx.strokeStyle = borderColor;
        ctx.strokeRect(sx, sy, squareSize, squareSize);
      }
    }
  }

  function update() {
    gridOffset.x = (gridOffset.x - 0.05 + squareSize) % squareSize;
    gridOffset.y = (gridOffset.y - 0.05 + squareSize) % squareSize;
    drawGrid();
    raf = requestAnimationFrame(update);
  }

  window.addEventListener('mousemove', function (e) {
    var mx = e.clientX;
    var my = e.clientY;
    var startX = Math.floor(gridOffset.x / squareSize) * squareSize;
    var startY = Math.floor(gridOffset.y / squareSize) * squareSize;
    hovered = {
      x: Math.floor((mx + gridOffset.x - startX) / squareSize),
      y: Math.floor((my + gridOffset.y - startY) / squareSize)
    };
  }, { passive: true });
  window.addEventListener('mouseout', function () { hovered = null; });

  update();
}
function initDecryptedText() {
  var els = document.querySelectorAll('.decrypted-text');
  if (!els.length) return;
  Array.prototype.forEach.call(els, function (el) {
    var text = el.getAttribute('data-text') || el.textContent;
    var useOriginal = el.getAttribute('data-original') === '1';
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+';
    var revealed = new Set();
    var iteration = 0;
    var interval = setInterval(function () {
      if (revealed.size < text.length) revealed.add(revealed.size); // sequential start
      iteration++;
      var out = '';
      for (var i = 0; i < text.length; i++) {
        if (text[i] === ' ' || revealed.has(i)) out += text[i];
        else if (useOriginal) out += text[Math.floor(Math.random() * text.length)];
        else out += chars[Math.floor(Math.random() * chars.length)];
      }
      el.textContent = out;
      if (revealed.size >= text.length && iteration > text.length + 8) {
        clearInterval(interval);
        el.textContent = text;
      }
    }, 50);
  });
}

function initRotatingWords() {
  var el = document.getElementById('rotating-word');
  if (!el) return;
  var capsule = document.querySelector('.jb-capsule');
  var words = ['原版生存', '无限地城', '螺旋跑酷', '随机空岛', '起床战争', '竞技场', '猎人游戏', '化石收藏家'];
  var idx = 0;

  function render() {
    var oldW = capsule ? capsule.offsetWidth : 0;
    // 首次渲染：先固定一个像素宽度（px→px 才能平滑过渡）
    if (capsule && !capsule.style.width) {
      capsule.style.width = oldW + 'px';
    }
    el.innerHTML = '';
    var chars = Array.from(words[idx]);
    chars.forEach(function (ch) {
      var s = document.createElement('span');
      s.textContent = ch === ' ' ? '\u00A0' : ch;
      s.style.display = 'inline-block';
      s.style.transform = 'translateY(100%)';
      s.style.opacity = '0';
      s.style.transition = 'transform .6s cubic-bezier(.33,1,.68,1), opacity .45s ease';
      el.appendChild(s);
    });
    // 胶囊宽度平滑过渡：先测量新词宽度（隐藏元素，不引起跳变），再平滑过渡
    var newW = 0;
    if (capsule) {
      var meas = document.createElement('span');
      meas.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;top:-9999px;left:0;';
      meas.style.fontSize = getComputedStyle(el).fontSize;
      meas.style.fontWeight = getComputedStyle(el).fontWeight;
      meas.textContent = words[idx];
      document.body.appendChild(meas);
      newW = meas.offsetWidth;
      document.body.removeChild(meas);
      var cs = getComputedStyle(capsule);
      newW += parseFloat(cs.paddingLeft || 0) + parseFloat(cs.paddingRight || 0);
    }
    if (capsule) {
      capsule.style.transition = 'width .5s cubic-bezier(.4,0,.2,1)';
      capsule.style.width = (newW > 0 ? newW : oldW) + 'px';

    }
    var spans = Array.prototype.slice.call(el.children);
    var order = [];
    for (var i = spans.length - 1; i >= 0; i--) order.push(i);
    order.forEach(function (charIdx, k) {
      setTimeout(function () {
        spans[charIdx].style.transform = 'translateY(0)';
        spans[charIdx].style.opacity = '1';
      }, k * 30);
    });
  }

  function next() {
    var spans = Array.prototype.slice.call(el.children);
    var order = [];
    for (var i = spans.length - 1; i >= 0; i--) order.push(i);
    order.forEach(function (charIdx, k) {
      setTimeout(function () {
        spans[charIdx].style.transition = 'transform .45s cubic-bezier(.4,0,.2,1), opacity .3s ease';
        spans[charIdx].style.transform = 'translateY(-120%)';
        spans[charIdx].style.opacity = '0';
      }, k * 25);
    });
    setTimeout(function () {
      idx = (idx + 1) % words.length;
      render();
    }, spans.length * 25 + 320);
  }

  render();
  setInterval(next, 2200);
}

// ============ DecryptedText 解密动画（复刻仓库） ============
function initDecryptedTexts() {
  var targets = [
    { id: 'dt-title1', text: 'NEXSERVER' },
    { id: 'dt-title2', text: 'NEX服务器' }
  ];
  var randChars = '!<>-_\\/[]{}—=+*^?#________ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  targets.forEach(function (t) {
    var el = document.getElementById(t.id);
    if (!el) return;
    var chars = Array.from(t.text);
    el.textContent = '';
    var spans = chars.map(function (c) {
      var s = document.createElement('span');
      s.textContent = c;
      s.style.display = 'inline-block';
      el.appendChild(s);
      return s;
    });
    var resolved = 0;
    var timer = setInterval(function () {
      spans.forEach(function (s, i) {
        if (i < resolved) {
          s.textContent = chars[i];
        } else {
          s.textContent = randChars[Math.floor(Math.random() * randChars.length)];
        }
      });
      resolved++;
      if (resolved > chars.length + 6) {
        clearInterval(timer);
        spans.forEach(function (s, i) { s.textContent = chars[i]; });
      }
    }, 70);
  });
}
