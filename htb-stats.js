(function () {
  'use strict';

  /* ============================================================
   *  HTB STATS — Embedded data & rendering
   *  Data pre-fetched from HTB public API on 2026-07-06
   * ============================================================ */

  const HTB_DATA = {
    user: { id: 2589442, name: 'thesungod07' },

    /* Rank / Level (from what's publicly known) */
    rank: { id: 3, title: 'Hacker', level: 7 },

    /* Current Season (Season 11 — "Season of the Punk") */
    season: {
      id: 15,
      name: 'Season 11',
      league: 'Ruby',
      rank: 2097,
      totalParticipants: 11093,
      points: 350,
      flagsObtained: 12,
      flagsTotal: 26,
      userOwns: 6,
      rootOwns: 6,
      bloods: 0,
      active: true,
    },

    /* All-time stats from activity feed */
    stats: {
      machines: 11,
      machinesRooted: 10,
      challenges: 17,
      sherlocks: 2,
    },

    /* Recent activity (last 10 items) */
    activity: [
      { type: 'root',     name: 'MakeSense',     date: '2026-07-05T08:37:04.000Z', points: 30 },
      { type: 'user',     name: 'MakeSense',     date: '2026-07-05T08:29:49.000Z', points: 15 },
      { type: 'challenge',name: 'Baby Frame',     date: '2026-07-04T16:41:33.000Z', points: 0 },
      { type: 'root',     name: 'Kobold',         date: '2026-07-04T10:07:59.000Z', points: 20 },
      { type: 'user',     name: 'Kobold',         date: '2026-07-04T09:57:50.000Z', points: 10 },
      { type: 'challenge',name: 'Forklifts R Us', date: '2026-06-28T15:40:07.000Z', points: 2 },
      { type: 'root',     name: 'Silentium',      date: '2026-06-28T14:24:36.000Z', points: 20 },
      { type: 'user',     name: 'Silentium',      date: '2026-06-28T10:40:59.000Z', points: 10 },
      { type: 'user',     name: 'Nexus',          date: '2026-06-27T20:39:54.000Z', points: 0 },
      { type: 'user',     name: 'Enigma',         date: '2026-06-27T19:47:21.000Z', points: 10 },
    ],
  };

  /* ============================================================
   *  BADGES — fetched live from HTB CDN
   * ============================================================ */

  const IMG = 'https://app.hackthebox.com/images';
  const XP_IMG = 'https://htb-experience-prod-public-storage.s3.amazonaws.com/assets/ranks/svg';
  const AVATAR = 'https://htb-sso-prod-public-storage.s3.eu-central-1.amazonaws.com/users/94f0081d-fe02-4fab-a6ba-491a84660a0a-avatar.png';

  const RANK_MAP = { 1: 'beginner', 2: 'apprentice', 3: 'professional', 4: 'master', 5: 'grandmaster', 6: 'grandmaster', 7: 'grandmaster' };

  function rankBadge(rankId) {
    const slug = RANK_MAP[rankId] || 'professional';
    return `<img src="${XP_IMG}/rank_${slug}.svg" alt="Rank" style="width:52px;height:52px;object-fit:contain" referrerpolicy="no-referrer">`;
  }

  function seasonBadge(league) {
    const slug = (league || 'ruby').toLowerCase();
    return `<div class="htb-tier-badge"><img class="htb-tier-avatar" src="${AVATAR}" alt="" referrerpolicy="no-referrer"><div class="htb-tier-frame"><img src="${IMG}/competitive/tier-frames/tier-${slug}.svg" alt="${league} League" referrerpolicy="no-referrer"></div></div>`;
  }

  const INLINE = {
    machine: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="18" height="14" rx="2" stroke="#4ade80" stroke-width="1.5" fill="rgba(74,222,128,0.08)"/>
      <path d="M9 18l-2 3h10l-2-3" stroke="#4ade80" stroke-width="1.2" fill="none"/>
      <line x1="8" y1="9" x2="16" y2="9" stroke="#4ade80" stroke-width="1.2" opacity="0.6"/>
      <line x1="8" y1="12" x2="14" y2="12" stroke="#4ade80" stroke-width="1.2" opacity="0.6"/>
    </svg>`,
    challenge: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" stroke="#facc15" stroke-width="1.5" fill="rgba(250,204,21,0.08)"/>
      <circle cx="12" cy="12" r="3" fill="#facc15" opacity="0.4"/>
      <circle cx="12" cy="12" r="1.2" fill="#facc15"/>
    </svg>`,
    sherlock: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="8" stroke="#60a5fa" stroke-width="1.5" fill="rgba(96,165,250,0.08)"/>
      <path d="M12 8v4l3 3" stroke="#60a5fa" stroke-width="1.5" fill="none"/>
      <circle cx="12" cy="12" r="2" fill="#60a5fa" opacity="0.6"/>
    </svg>`,
  };

  /* ============================================================
   *  HELPERS
   * ============================================================ */

  function formatDate(iso) {
    const d = new Date(iso);
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function activityIcon(type) {
    switch (type) {
      case 'root': case 'user': return '<svg viewBox="0 0 24 24" fill="none" width="14" height="14"><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.5"/></svg>';
      case 'challenge': return '<svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M12 3l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>';
      case 'sherlock': return '<svg viewBox="0 0 24 24" fill="none" width="14" height="14"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M12 8v4l3 3" stroke="currentColor" stroke-width="1.5"/></svg>';
      default: return '';
    }
  }


  /* ============================================================
   *  RENDER SECTION
   * ============================================================ */

  function render(data) {
    const d = data || HTB_DATA;
    const s = d.season;
    const st = d.stats;
    const rid = d.rank && d.rank.id ? d.rank.id : 3;

    const section = document.getElementById('htb-stats');
    if (section) {
      updateRankCards(d, rid);
      updateStats(st, s);
      return;
    }

    const el = document.createElement('section');
    el.id = 'htb-stats';
    el.innerHTML = `
      <div class="htb-header-row">
        <div>
          <div class="section-label">hack the box</div>
          <h2 class="section-title">stats & activity</h2>
        </div>
        <span class="htb-live-badge">live data</span>
      </div>
      <div class="htb-rank-row">
        <div class="htb-rank-card reveal">
          <div class="htb-rank-icon">${rankBadge(rid)}</div>
          <div class="htb-rank-info">
            <span class="htb-rank-label">Rank</span>
            <span class="htb-rank-title">${d.rank.title}</span>
            <span class="htb-rank-detail">${st.machines} machines owned</span>
          </div>
        </div>
        <div class="htb-rank-card reveal reveal-delay-1">
          <div class="htb-rank-icon">${seasonBadge(s.league)}</div>
          <div class="htb-rank-info">
            <span class="htb-rank-label">${s.name} &middot; ${s.league} League</span>
            <span class="htb-rank-title">#${s.rank.toLocaleString()}</span>
            <span class="htb-rank-detail">of <strong>${s.totalParticipants.toLocaleString()}</strong> players &middot; <strong>${s.points}</strong> pts</span>
          </div>
        </div>
      </div>
      <div class="htb-stats-grid reveal">
        <div class="htb-stat-cell">
          <div class="htb-stat-number" data-count="${st.machines}">0</div>
          <div class="htb-stat-label">Machines</div>
        </div>
        <div class="htb-stat-cell">
          <div class="htb-stat-number" data-count="${st.challenges}">0</div>
          <div class="htb-stat-label">Challenges</div>
        </div>
        <div class="htb-stat-cell">
          <div class="htb-stat-number" data-count="${st.sherlocks}">0</div>
          <div class="htb-stat-label">Sherlocks</div>
        </div>
        <div class="htb-stat-cell">
          <div class="htb-stat-number" data-count="${s.points}">0</div>
          <div class="htb-stat-label">Season Pts</div>
        </div>
      </div>
      <div class="htb-activity-header reveal">recent activity</div>
      <div class="htb-activity-list reveal">
        ${d.activity.slice(0, 8).map(a => `
          <div class="htb-activity-item">
            <div class="htb-activity-icon ${a.type === 'root' || a.type === 'user' ? 'machine' : a.type}">${activityIcon(a.type)}</div>
            <span class="htb-activity-name">${a.name}</span>
            <span class="htb-activity-type ${a.type}">${a.type}</span>
            <span class="htb-activity-date">${formatDate(a.date)}</span>
          </div>
        `).join('')}
      </div>
      <a href="https://app.hackthebox.com/users/${d.user.id}" target="_blank" class="htb-profile-link reveal">
        <svg viewBox="0 0 24 24"><path d="M12 1l9 5v10l-9 5-9-5V6zm0 2.18L5 7.5v7l7 3.82 7-3.82v-7z"/></svg>
        view full profile on hackthebox &rarr;
      </a>
    `;

    const contact = document.getElementById('contact');
    if (contact) {
      contact.parentNode.insertBefore(el, contact);
    } else {
      const footer = document.querySelector('footer');
      footer && footer.parentNode.insertBefore(el, footer);
    }

    requestAnimationFrame(() => {
      el.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    });

    const navLinks = document.querySelectorAll('.nav-links a');
    if (window.__navObserver) {
      window.__navObserver.observe(el);
    } else {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            navLinks.forEach(a => {
              a.style.color = a.getAttribute('href') === '#' + e.target.id ? 'var(--green)' : '';
            });
          }
        });
      }, { threshold: 0.4 });
      document.querySelectorAll('section[id]').forEach(s => obs.observe(s));
    }

    animateCounters(el);
  }

  function updateRankCards(d, rid) {
    const cards = document.querySelectorAll('.htb-rank-card');
    if (!cards.length) return;
    /* XP rank card */
    const icon0 = cards[0].querySelector('.htb-rank-icon');
    if (icon0) icon0.innerHTML = rankBadge(rid);
    const title0 = cards[0].querySelector('.htb-rank-title');
    if (title0) title0.textContent = d.rank.title;
    const detail0 = cards[0].querySelector('.htb-rank-detail');
    if (detail0) detail0.textContent = d.stats.machines + ' machines owned';
    /* Season card */
    const icon1 = cards[1].querySelector('.htb-rank-icon');
    if (icon1) icon1.innerHTML = seasonBadge(d.season.league);
    const label1 = cards[1].querySelector('.htb-rank-label');
    if (label1) label1.textContent = d.season.name + ' \u00b7 ' + d.season.league + ' League';
    const title1 = cards[1].querySelector('.htb-rank-title');
    if (title1) title1.textContent = '#' + d.season.rank.toLocaleString();
    const detail1 = cards[1].querySelector('.htb-rank-detail');
    if (detail1) detail1.innerHTML = 'of <strong>' + d.season.totalParticipants.toLocaleString() + '</strong> players \u00b7 <strong>' + d.season.points + '</strong> pts';
  }

  function updateStats(st, s) {
    const cells = document.querySelectorAll('.htb-stat-cell .htb-stat-number');
    if (cells.length >= 4) {
      cells[0].textContent = st.machines;
      cells[0].setAttribute('data-count', st.machines);
      cells[1].textContent = st.challenges;
      cells[1].setAttribute('data-count', st.challenges);
      cells[2].textContent = st.sherlocks;
      cells[2].setAttribute('data-count', st.sherlocks);
      cells[3].textContent = s.points;
      cells[3].setAttribute('data-count', s.points);
    }
  }

  /* ============================================================
   *  COUNTER ANIMATION
   * ============================================================ */

  function animateCounters(root) {
    const counters = root.querySelectorAll('.htb-stat-number[data-count]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-count'), 10);
          let current = 0;
          const step = Math.max(1, Math.ceil(target / 30));
          const interval = setInterval(() => {
            current += step;
            if (current >= target) {
              current = target;
              clearInterval(interval);
            }
            el.textContent = current;
          }, 40);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));
  }

  /* ============================================================
   *  AUTO-REFRESH — fetch fresh activity every hour
   * ============================================================ */

  const PROXY = 'https://api.allorigins.win/raw?url=';

  async function fetchJSON(url) {
    try {
      const res = await fetch(PROXY + encodeURIComponent(url), { signal: AbortSignal.timeout(8000) });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  function parseProfile(raw) {
    const p = (raw && raw.profile) || raw;
    if (!p || !p.id) return null;
    return {
      id: p.id,
      name: p.name,
      rank: { id: p.rank_id || 3, title: p.rank || 'Hacker' },
      points: p.points || 0,
      machines: p.user_owns || 0,
      systemOwns: p.system_owns || 0,
      userOwns: p.user_owns || 0,
    };
  }

  function updateActivity(data) {
    if (!data || !data.data) return;
    const items = data.data.slice(0, 8);
    if (!items.length) return;
    const list = document.querySelector('.htb-activity-list');
    if (!list) return;

    list.innerHTML = items.map(a => `
      <div class="htb-activity-item">
        <div class="htb-activity-icon ${a.type === 'root' || a.type === 'user' ? 'machine' : a.type}">${activityIcon(a.type)}</div>
        <span class="htb-activity-name">${a.name}</span>
        <span class="htb-activity-type ${a.type}">${a.type}</span>
        <span class="htb-activity-date">${formatDate(a.ownDate || a.date)}</span>
      </div>
    `).join('');

    const badge = document.querySelector('.htb-live-badge');
    if (badge) badge.textContent = 'updated ' + formatDate(new Date().toISOString());
  }

  async function refresh() {
    const [profileData, activityData] = await Promise.all([
      fetchJSON('https://labs.hackthebox.com/api/v4/profile/' + HTB_DATA.user.id),
      fetchJSON('https://labs.hackthebox.com/api/v5/user/profile/activity/' + HTB_DATA.user.id + '?per_page=10'),
    ]);

    if (profileData) {
      const p = parseProfile(profileData);
      if (p) {
        HTB_DATA.rank.id = p.rank.id;
        HTB_DATA.rank.title = p.rank.title;
        HTB_DATA.stats.machines = p.machines;
        render(HTB_DATA);
      }
    }
    if (activityData) updateActivity(activityData);
  }

  function start() {
    render(HTB_DATA);
    /* Fetch fresh data on load, then every hour */
    setTimeout(refresh, 1000);
    setInterval(refresh, 3600000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

})();
