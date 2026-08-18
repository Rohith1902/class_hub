/* ============================== ICONS ============================== */
const ICON = {
  search: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  pin: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5 12 3l9 6.5"/><path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10"/></svg>',
  grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4.5 5-6 8-6s6.5 1.5 8 6"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  menu: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>',
  close: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  badge: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 12 2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>',
  arrowLeft: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
  arrowRight: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
  star: (filled) => `<svg viewBox="0 0 24 24" fill="currentColor" class="${filled ? '' : 'off'}"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg>`,
};

function esc(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function rupees(n){ return '₹' + Number(n).toLocaleString('en-IN'); }
function stars(rating, small){ let h=''; for(let i=1;i<=5;i++) h += ICON.star(i <= Math.round(rating)); return `<span class="stars" style="${small?'gap:2px':''}">${h}</span>`; }

const AVATAR_COLORS = [
  ['#0F5652','#FBF6EC'], ['#E8963C','#052723'], ['#C4562B','#FBF6EC'], ['#0A3F3B','#FBF6EC'], ['#CC7A22','#FBF6EC'],
];
function avatar(name, idx, size){
  const initials = name.split(' ').filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase();
  const [bg,fg] = AVATAR_COLORS[idx % AVATAR_COLORS.length];
  return `<div class="avatar ${size||'md'}" style="background:${bg};color:${fg}">${esc(initials)}</div>`;
}

/* ============================== DATA STORE ============================== */
const SUBJECTS = ["Mathematics","Physics","Chemistry","Biology","Computer Science","English","Tamil","Social Science","Vedic Maths / Abacus","Spoken English / IELTS","Carnatic Vocal Music"];
const LOCATIONS = ["Adyar","T. Nagar","Anna Nagar","Velachery","Mylapore","Tambaram","Porur","OMR / Sholinganallur"];
const FORMATS = ["Home visit","At center","Online"];
const TIME_SLOTS = ["7:00 AM","8:00 AM","4:00 PM","5:00 PM","6:00 PM","7:00 PM"];

let TUTORS = [];
let MOCK_BOOKINGS = [];

async function loadData() {
  try {
    const [tutorsRes, bookingsRes] = await Promise.all([
      fetch('/api/tutors'),
      fetch('/api/bookings')
    ]);
    TUTORS = await tutorsRes.json();
    MOCK_BOOKINGS = await bookingsRes.json();
  } catch (error) {
    console.error("Failed to load data from API:", error);
  }
}

function nextNDays(n){
  const days=[]; const today=new Date();
  for(let i=1;i<=n;i++){ const d=new Date(today); d.setDate(today.getDate()+i); days.push(d); }
  return days;
}
function formatDate(d){ return d.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'}); }

/* ============================== APP STATE ============================== */
const App = {
  state: {
    page: 'home',
    selectedTutorId: null,
    searchFilters: { subject:'', location:'', maxPrice:1500, formats:[] },
    sort: 'rating',
    mobileNavOpen: false,
    mobileFiltersOpen: false,
    auth: { loggedIn:false, role:null, name:'' },
    authRole: 'student',
    authMode: 'login',
    booking: { step:0, dayIdx:0, time:null, format:null, days: nextNDays(7) },
    dashTab: 'bookings',
    loading: true
  },

  set(patch){ Object.assign(this.state, patch); this.render(); },

  go(page, payload){
    if(page==='auth-student'){ this.state.authRole='student'; page='auth'; }
    if(page==='auth-tutor'){ this.state.authRole='tutor'; page='auth'; }
    if(page==='search' && payload) this.state.searchFilters = Object.assign({subject:'',location:'',maxPrice:1500,formats:[]}, payload);
    if(page==='profile' && payload) this.state.selectedTutorId = payload;
    this.state.page = page;
    this.state.mobileNavOpen = false;
    window.scrollTo(0,0);
    this.render();
  },
  viewTutor(id){ this.state.selectedTutorId = id; this.go('profile'); },
  startBooking(id){
    this.state.selectedTutorId = id;
    this.state.booking = { step:0, dayIdx:0, time:null, format:(TUTORS.find(t=>t.id===id)||TUTORS[0]).formats[0], days: nextNDays(7) };
    this.go('booking');
  },
  toggleMobileNav(){ this.state.mobileNavOpen = !this.state.mobileNavOpen; this.render(); },
  logout(){ this.state.auth = { loggedIn:false, role:null, name:'' }; this.go('home'); },

  render(){ document.getElementById('app').innerHTML = renderApp(this.state); afterRender(this.state); },
};

/* ============================== RENDER: SHELL ============================== */

function renderTopNav(state){
  const { page, auth, mobileNavOpen } = state;
  const navLink = (label, target) => `<button class="nav-link fring ${page===target?'active':''}" onclick="App.go('${target}')">${label}</button>`;
  return `
  <header class="topnav">
    <div class="container topnav-inner">
      <button class="logo fring" onclick="App.go('home')">Class<span>hub</span></button>
      <nav class="nav-links">
        ${navLink('Find a tutor','search')}
        ${navLink('Become a tutor','auth-tutor')}
        ${auth.loggedIn && auth.role==='tutor' ? navLink('Dashboard','dashboard') : ''}
      </nav>
      <div class="nav-actions">
        ${auth.loggedIn ? `
          <span style="font-size:14px;color:var(--ink-60)">Hi, ${esc(auth.name.split(' ')[0])}</span>
          <button class="nav-link fring" onclick="App.logout()">Log out</button>
        ` : `
          <button class="nav-link fring" onclick="App.go('auth-student')">Log in</button>
          <button class="btn btn-primary fring" style="padding:10px 18px" onclick="App.go('auth-student')">Sign up</button>
        `}
      </div>
      <button class="hamburger fring" onclick="App.toggleMobileNav()" aria-label="Menu">${mobileNavOpen ? ICON.close : ICON.menu}</button>
    </div>
    <div class="mobile-menu ${mobileNavOpen?'open':''}">
      <button class="mobile-menu-item fring" onclick="App.go('search')">Find a tutor</button>
      <button class="mobile-menu-item fring" onclick="App.go('auth-tutor')">Become a tutor</button>
      ${auth.loggedIn && auth.role==='tutor' ? `<button class="mobile-menu-item fring" onclick="App.go('dashboard')">Dashboard</button>` : ''}
      <div class="mobile-menu-row">
        ${auth.loggedIn
          ? `<button class="btn btn-outline btn-block fring" onclick="App.logout()">Log out</button>`
          : `<button class="btn btn-outline btn-block fring" onclick="App.go('auth-student')">Log in</button>
             <button class="btn btn-primary btn-block fring" onclick="App.go('auth-student')">Sign up</button>`}
      </div>
    </div>
  </header>`;
}

function renderTabBar(state){
  const { page, auth } = state;
  const dashTarget = auth.loggedIn && auth.role==='tutor' ? 'dashboard' : 'auth-tutor';
  const isActive = (k) => page===k || (k==='auth-student' && page==='auth');
  const items = [
    ['home','Home',ICON.home], ['search','Search',ICON.search],
    [dashTarget,'Dashboard',ICON.grid], ['auth-student','Account',ICON.user],
  ];
  return `<nav class="tabbar">
    ${items.map(([key,label,icon]) => `<button class="fring ${isActive(key)?'active':''}" onclick="App.go('${key}')">${icon}${label}</button>`).join('')}
  </nav>`;
}

function renderFooter(){
  return `<footer>
    <div class="container footer-grid">
      <div>
        <span class="logo" style="padding:0">Class<span>hub</span></span>
        <p class="footer-desc">Chennai's marketplace for verified tutors and tuition centers — clear pricing, real reviews, reliable payouts.</p>
      </div>
      <div><h4>For students &amp; parents</h4><ul><li>How Classhub works</li><li>Popular subjects near you</li><li>Safety &amp; verification</li></ul></div>
      <div><h4>For tutors &amp; centers</h4><ul><li>List your classes</li><li>Getting paid on time</li><li>Tutor success stories</li></ul></div>
    </div>
    <div class="footer-bottom">© 2026 Classhub. Made for students, tutors and tuition centers in Chennai.</div>
  </footer>`;
}

function renderApp(state){
  if (state.loading) {
    return `<div style="padding:100px;text-align:center;">Loading...</div>`;
  }
  
  let page;
  if(state.page==='home') page = renderHome(state);
  else if(state.page==='search') page = renderSearch(state);
  else if(state.page==='profile') page = renderProfile(state);
  else if(state.page==='booking') page = renderBooking(state);
  else if(state.page==='auth') page = renderAuth(state);
  else if(state.page==='dashboard') page = renderDashboard(state);
  else page = renderHome(state);

  return `
    ${renderTopNav(state)}
    <main>${page}</main>
    ${state.page!=='booking' ? renderFooter() : ''}
    ${renderTabBar(state)}
    <div class="tabbar-spacer"></div>
  `;
}

/* ============================== HOME ============================== */

function renderHome(state){
  const featured = TUTORS.slice(0,6);
  return `
  <section class="hero">
    <div class="container">
      <span class="eyebrow">Chennai's tutor marketplace</span>
      <h1>Find the right tutor.<br>Book them like an appointment.</h1>
      <p>Classhub connects students and parents across Chennai with verified tutors and tuition centers — with upfront fees, real reviews, and secure online payments. Tutors get reliable bookings and get paid on time, every time.</p>

      <div class="search-box">
        <div class="search-grid">
          <label class="field">
            <span class="field-icon">${ICON.search}</span>
            <select id="home-subject">
              <option value="">Any subject</option>
              ${SUBJECTS.map(s=>`<option value="${esc(s)}">${esc(s)}</option>`).join('')}
            </select>
          </label>
          <label class="field">
            <span class="field-icon">${ICON.pin}</span>
            <select id="home-location">
              <option value="">Anywhere in Chennai</option>
              ${LOCATIONS.map(l=>`<option value="${esc(l)}">${esc(l)}</option>`).join('')}
            </select>
          </label>
          <label class="field">
            <div class="field-label-row"><span>Max fee / hr</span><span class="mono" id="home-price-out">₹1200</span></div>
            <input type="range" id="home-price" min="300" max="1500" step="50" value="1200" oninput="document.getElementById('home-price-out').textContent='₹'+this.value">
          </label>
          <button class="btn btn-primary fring" onclick="App.go('search',{subject:document.getElementById('home-subject').value, location:document.getElementById('home-location').value, maxPrice:Number(document.getElementById('home-price').value)})">
            ${ICON.search} Search
          </button>
        </div>
      </div>

      <div class="chips">
        ${["Mathematics","Physics","NEET Biology","Spoken English","Vedic Maths"].map(s=>`<button class="chip fring" onclick="App.go('search',{subject:'${esc(s)}'})">${esc(s)}</button>`).join('')}
      </div>
    </div>
  </section>

  <section class="container" style="padding:40px 0">
    <div class="steps-grid">
      ${[
        ['1','Search & compare','Filter by subject, location, price and format to shortlist tutors near you.'],
        ['2','Book a slot','Pick a date and time that works, and confirm the details in a minute.'],
        ['3','Pay securely','Pay online through Razorpay — the tutor is only marked paid once you confirm.'],
      ].map(([n,t,d])=>`<div class="step-card"><span class="num">${n}</span><h3>${t}</h3><p>${d}</p></div>`).join('')}
    </div>

    <div class="section-head">
      <div><h2>Tutors near you</h2><p>A few well-reviewed picks across Chennai this week</p></div>
      <button class="see-all fring" onclick="App.go('search')">See all ${ICON.arrowRight}</button>
    </div>
    <div class="tutor-grid">${featured.map((t,i)=>tutorCard(t,i)).join('')}</div>
    <button class="btn btn-outline btn-block fring" style="margin-top:24px;display:block" onclick="App.go('search')">See all tutors</button>
  </section>`;
}

function tutorCard(t, idx, compact){
  return `
  <div class="tutor-card">
    <div class="perf-notch top"></div><div class="perf-notch bottom"></div>
    <div class="tutor-card-body">
      <div>${avatar(t.name, idx, 'md')}</div>
      <div style="flex:1;min-width:0">
        <div class="tc-top">
          <div><p class="tc-name">${esc(t.name)}</p><p class="tc-sub">${esc(t.kind)} · ${esc(t.location)}</p></div>
          ${t.verified ? `<span class="verified-badge">${ICON.badge} Verified</span>` : ''}
        </div>
        <p class="tc-subjects">${esc(t.subjects.join(' · '))}</p>
        ${!compact ? `<p class="tc-bio">${esc(t.bio)}</p>` : ''}
        <div class="tc-meta">
          <div class="rating-row">${stars(t.rating,true)}<span class="rating-text">${t.rating} (${t.reviewsCount})</span></div>
          <div class="fee mono">${rupees(t.fee)}/hr</div>
        </div>
        <button class="btn btn-ghost tc-cta fring" onclick="App.viewTutor('${t.id}')">View profile</button>
      </div>
    </div>
  </div>`;
}

/* ============================== SEARCH ============================== */

function filterTutors(filters, sort){
  let list = TUTORS.filter(t=>{
    if(filters.subject && !t.subjects.includes(filters.subject)) return false;
    if(filters.location && t.location !== filters.location) return false;
    if(t.fee > filters.maxPrice) return false;
    if(filters.formats.length && !filters.formats.some(f=>t.formats.includes(f))) return false;
    return true;
  });
  if(sort==='rating') list = list.slice().sort((a,b)=>b.rating-a.rating);
  if(sort==='price-asc') list = list.slice().sort((a,b)=>a.fee-b.fee);
  if(sort==='price-desc') list = list.slice().sort((a,b)=>b.fee-a.fee);
  return list;
}

function filtersPanel(state, idPrefix){
  const f = state.searchFilters;
  return `
  <div class="${idPrefix==='desk'?'filters-panel':''}">
    <div class="filters-head"><h3>Filters</h3><button class="fring" onclick="App.resetFilters()">Reset</button></div>
    <div class="filter-block">
      <label class="field-title">Subject</label>
      <select onchange="App.setFilter('subject', this.value)">
        <option value="" ${!f.subject?'selected':''}>Any subject</option>
        ${SUBJECTS.map(s=>`<option value="${esc(s)}" ${f.subject===s?'selected':''}>${esc(s)}</option>`).join('')}
      </select>
    </div>
    <div class="filter-block">
      <label class="field-title">Location</label>
      <select onchange="App.setFilter('location', this.value)">
        <option value="" ${!f.location?'selected':''}>Anywhere in Chennai</option>
        ${LOCATIONS.map(l=>`<option value="${esc(l)}" ${f.location===l?'selected':''}>${esc(l)}</option>`).join('')}
      </select>
    </div>
    <div class="filter-block">
      <div class="range-row"><label class="field-title" style="margin:0">Max fee</label><span class="mono" id="${idPrefix}-price-out">₹${f.maxPrice}/hr</span></div>
      <input type="range" min="300" max="1500" step="50" value="${f.maxPrice}"
        oninput="document.getElementById('${idPrefix}-price-out').textContent='₹'+this.value+'/hr'"
        onchange="App.setFilter('maxPrice', Number(this.value))">
    </div>
    <div class="filter-block">
      <label class="field-title">Format</label>
      ${FORMATS.map(fo=>`
        <label class="checkbox-row">
          <input type="checkbox" ${f.formats.includes(fo)?'checked':''} onchange="App.toggleFormat('${esc(fo)}')">
          ${esc(fo)}
        </label>`).join('')}
    </div>
    <div class="filters-footer">${filterTutors(f, state.sort).length} tutors match these filters</div>
  </div>`;
}

function renderSearch(state){
  const results = filterTutors(state.searchFilters, state.sort);
  const f = state.searchFilters;
  return `
  <div class="container" style="padding:24px 0">
    <div class="crumbs">
      <button class="fring" onclick="App.go('home')">${ICON.arrowLeft} Home</button><span>/</span><span style="color:var(--ink-70)">Search</span>
    </div>
    <div class="results-head">
      <div>
        <h1>${esc(f.subject || 'All')} tutors ${f.location ? 'in '+esc(f.location) : 'in Chennai'}</h1>
        <p class="count">${results.length} result${results.length===1?'':'s'}</p>
      </div>
      <div class="results-controls">
        <select class="sort fring" onchange="App.setSort(this.value)">
          <option value="rating" ${state.sort==='rating'?'selected':''}>Sort: Top rated</option>
          <option value="price-asc" ${state.sort==='price-asc'?'selected':''}>Sort: Price, low to high</option>
          <option value="price-desc" ${state.sort==='price-desc'?'selected':''}>Sort: Price, high to low</option>
        </select>
        <button class="btn btn-outline filters-toggle fring" onclick="App.set({mobileFiltersOpen:true})">Filters</button>
      </div>
    </div>

    <div class="results-layout">
      ${filtersPanel(state,'desk')}
      <div class="results-list">
        ${results.length===0 ? `<div class="empty-state"><p>No tutors match yet</p><p>Try widening the price range or clearing a filter.</p></div>` : ''}
        ${results.map((t,i)=>tutorCard(t,i)).join('')}
      </div>
    </div>
  </div>

  <div class="sheet-overlay ${state.mobileFiltersOpen?'open':''}">
    <div class="sheet-backdrop" onclick="App.set({mobileFiltersOpen:false})"></div>
    <div class="sheet">
      <div class="sheet-head"><span class="logo" style="padding:0;font-size:16px">Filters</span><button class="fring" onclick="App.set({mobileFiltersOpen:false})">${ICON.close}</button></div>
      ${filtersPanel(state,'mob')}
      <button class="btn btn-primary btn-block fring" style="margin-top:16px" onclick="App.set({mobileFiltersOpen:false})">Show ${results.length} result${results.length===1?'':'s'}</button>
    </div>
  </div>`;
}

Object.assign(App, {
  setFilter(key, value, skipRender){
    this.state.searchFilters[key] = value;
    if(skipRender){
      return;
    }
    this.render();
  },
  toggleFormat(f){
    const arr = this.state.searchFilters.formats;
    const i = arr.indexOf(f);
    if(i>-1) arr.splice(i,1); else arr.push(f);
    this.render();
  },
  resetFilters(){ this.state.searchFilters = { subject:'', location:'', maxPrice:1500, formats:[] }; this.render(); },
  setSort(v){ this.state.sort = v; this.render(); },
});

/* ============================== PROFILE ============================== */

function renderProfile(state){
  const idx = TUTORS.findIndex(t=>t.id===state.selectedTutorId);
  const t = TUTORS[idx] || TUTORS[0];
  return `
  <div class="container" style="max-width:820px;padding-top:24px;padding-bottom:100px">
    <button class="back-link fring" onclick="App.go('search')">${ICON.arrowLeft} Back to results</button>

    <div class="profile-card">
      <div class="profile-top">
        ${avatar(t.name, idx, 'lg')}
        <div style="flex:1">
          <div class="profile-name-row">
            <h1>${esc(t.name)}</h1>
            ${t.verified ? `<span class="verified-badge" style="transform:none">${ICON.badge} Verified</span>` : ''}
          </div>
          <p class="profile-sub">${esc(t.kind)} · ${esc(t.grades)}</p>
          <div class="profile-meta-row">
            <div class="rating-row">${stars(t.rating)}<span class="rating-text">${t.rating} (${t.reviewsCount} reviews)</span></div>
            <span class="pin">${ICON.pin} ${esc(t.location)}</span>
          </div>
        </div>
        <div class="profile-price">
          <div><span class="amt mono">${rupees(t.fee)}</span><span class="per">/hr</span></div>
          <button class="btn btn-accent btn-block fring" style="margin-top:8px" onclick="App.startBooking('${t.id}')">Book now</button>
        </div>
      </div>

      <div class="info-grid">
        <div class="info-box"><div class="lbl">Experience</div><div class="val">${esc(t.experience)}</div></div>
        <div class="info-box"><div class="lbl">Subjects</div><div class="val">${esc(t.subjects.join(', '))}</div></div>
        <div class="info-box"><div class="lbl">Formats offered</div><div class="val">${esc(t.formats.join(', '))}</div></div>
      </div>
    </div>

    <div class="profile-section">
      <h2>About</h2>
      <p class="about-box">${esc(t.bio)}</p>
    </div>

    <div class="profile-section">
      <h2>Achievements &amp; results</h2>
      <div class="achieve-grid">
        ${t.achievements.map(a=>`<div class="achieve-item"><span class="tick">${ICON.check}</span><p>${esc(a)}</p></div>`).join('')}
      </div>
    </div>

    <div class="profile-section">
      <div class="review-head">
        <h2 style="margin:0">Reviews</h2>
        <div class="rating-summary">${stars(t.rating,true)} ${t.rating} · ${t.reviewsCount} reviews</div>
      </div>
      ${t.reviews.map(r=>`
        <div class="review-item">
          <div class="row"><span class="name">${esc(r.name)}</span>${stars(r.rating,true)}</div>
          <p class="text">${esc(r.text)}</p>
        </div>`).join('')}
    </div>
  </div>

  <div class="sticky-book">
    <div class="fee mono">${rupees(t.fee)} <span style="font-family:'Inter',sans-serif;color:var(--ink-40);font-weight:400">/hr</span></div>
    <button class="btn btn-accent fring" onclick="App.startBooking('${t.id}')">Book now</button>
  </div>`;
}

/* ============================== BOOKING ============================== */

function stepDots(step){
  const labels = ['Slot','Confirm','Pay','Done'];
  return `<div class="step-dots">
    ${labels.map((l,i)=>`
      ${i>0 ? `<div class="step-line ${i<=step?'done':''}"></div>` : ''}
      <div class="step-dot ${i<step?'done':i===step?'active':''}">
        <span class="circle">${i<step?ICON.check:i+1}</span><span>${l}</span>
      </div>
    `).join('')}
  </div>`;
}

function renderBooking(state){
  const idx = TUTORS.findIndex(t=>t.id===state.selectedTutorId);
  const t = TUTORS[idx] || TUTORS[0];
  const b = state.booking;
  const days = b.days;

  let stepHtml = '';

  if(b.step===0){
    stepHtml = `
    <div class="booking-panel">
      <h2>Pick a date</h2>
      <div class="day-scroller">
        ${days.map((d,i)=>`
          <button class="day-chip fring ${b.dayIdx===i?'active':''}" onclick="App.setBooking({dayIdx:${i}})">
            <div class="dow">${d.toLocaleDateString('en-IN',{weekday:'short'})}</div>
            <div class="dom">${d.getDate()}</div>
          </button>`).join('')}
      </div>

      <h2 style="margin-top:24px">Pick a time</h2>
      <div class="time-grid">
        ${TIME_SLOTS.map(ts=>`<button class="time-chip fring ${b.time===ts?'active':''}" onclick="App.setBooking({time:'${ts}'})">${ts}</button>`).join('')}
      </div>

      <h2 style="margin-top:24px">Format</h2>
      <div class="format-row">
        ${t.formats.map(f=>`<button class="format-chip fring ${b.format===f?'active':''}" onclick="App.setBooking({format:'${esc(f)}'})">${esc(f)}</button>`).join('')}
      </div>

      <button class="btn btn-primary btn-block fring" style="margin-top:28px" ${!b.time?'disabled':''} onclick="App.set({}); App.state.booking.step=1; App.render();">Continue</button>
    </div>`;
  }

  if(b.step===1){
    stepHtml = `
    <div class="booking-panel">
      <h2>Confirm details</h2>
      <div class="summary-box">
        <div class="summary-row"><span style="color:var(--ink-50)">Date</span><span>${formatDate(days[b.dayIdx])}</span></div>
        <div class="summary-row"><span style="color:var(--ink-50)">Time</span><span>${b.time}</span></div>
        <div class="summary-row"><span style="color:var(--ink-50)">Format</span><span>${esc(b.format)}</span></div>
        <div class="summary-row total"><span>Fee</span><span class="mono fee">${rupees(t.fee)}</span></div>
      </div>
      <div class="form-field"><label>Student name</label><input id="bk-name" placeholder="e.g. Sanjana Ramesh, Grade 10"></div>
      <div class="form-field"><label>Parent / your phone number</label><input id="bk-phone" placeholder="10-digit mobile number" inputmode="numeric" maxlength="10"></div>
      <div class="form-field"><label>Notes for the tutor (optional)</label><textarea id="bk-notes" rows="3" placeholder="Topics to focus on, syllabus, anything the tutor should know"></textarea></div>
      <div class="btn-row">
        <button class="btn btn-outline fring" onclick="App.state.booking.step=0; App.render();">Back</button>
        <button class="btn btn-primary fring" style="flex:1" onclick="App.confirmDetails()">Continue to payment</button>
      </div>
    </div>`;
  }

  if(b.step===2){
    stepHtml = `
    <div class="booking-panel">
      <h2 style="margin-bottom:2px">Payment</h2>
      <p style="font-size:12px;color:var(--ink-50);margin-bottom:16px">Secured by Razorpay · test mode</p>
      <div class="summary-box">
        <div class="summary-row"><span style="color:var(--ink-50)">Session with</span><span>${esc(t.name)}</span></div>
        <div class="summary-row"><span style="color:var(--ink-50)">${formatDate(days[b.dayIdx])}</span><span>${b.time}</span></div>
        <div class="summary-row total"><span>Total due</span><span class="mono" style="font-weight:700;color:var(--teal-700);font-size:16px">${rupees(t.fee)}</span></div>
      </div>
      <button class="btn btn-razorpay fring" id="pay-btn" onclick="App.pay()">Pay ${rupees(t.fee)} with Razorpay</button>
      <p style="font-size:11px;color:var(--ink-40);text-align:center;margin-top:8px">Test mode — use card 4111 1111 1111 1111, any future date &amp; CVV, or any UPI test ID.</p>
      <button class="btn btn-block fring" style="background:none;color:var(--ink-50);margin-top:12px" onclick="App.state.booking.step=1; App.render();">Back</button>
    </div>`;
  }

  if(b.step===3){
    stepHtml = `
    <div class="booking-panel confirm-hero">
      <div class="confirm-icon">${ICON.check}</div>
      <h2>Booking confirmed</h2>
      <p>A confirmation has been sent for your records. Booking ID <span class="mono">${b.bookingId}</span></p>
      <div class="summary-box" style="text-align:left;margin-top:20px">
        <div class="summary-row"><span style="color:var(--ink-50)">Tutor</span><span>${esc(t.name)}</span></div>
        <div class="summary-row"><span style="color:var(--ink-50)">Subject</span><span>${esc(t.subjects[0])}</span></div>
        <div class="summary-row"><span style="color:var(--ink-50)">Date &amp; time</span><span>${formatDate(days[b.dayIdx])}, ${b.time}</span></div>
        <div class="summary-row"><span style="color:var(--ink-50)">Format</span><span>${esc(b.format)}</span></div>
        <div class="summary-row total"><span>Amount paid</span><span class="mono fee">${rupees(t.fee)}</span></div>
      </div>
      <div class="btn-row" style="justify-content:center">
        <button class="btn btn-outline fring" style="flex:1" onclick="App.go('home')">Back to home</button>
        <button class="btn btn-primary fring" style="flex:1" onclick="App.go('search')">Book another tutor</button>
      </div>
    </div>`;
  }

  return `
  <div class="container" style="max-width:640px;padding-top:24px">
    <button class="back-link fring" onclick="App.go('profile','${t.id}')">${ICON.arrowLeft} Back to profile</button>
    <div class="tutor-strip">
      ${avatar(t.name, idx, 'sm')}
      <div><p class="name" style="font-family:'Fraunces',serif">${esc(t.name)}</p><p class="sub">${esc(t.subjects.join(', '))} · <span class="mono">${rupees(t.fee)}</span>/hr</p></div>
    </div>
    ${stepDots(b.step)}
    ${stepHtml}
  </div>`;
}

Object.assign(App, {
  setBooking(patch){ Object.assign(this.state.booking, patch); this.render(); },
  confirmDetails(){
    const name = document.getElementById('bk-name').value.trim();
    const phone = document.getElementById('bk-phone').value.trim();
    if(name.length < 2 || phone.length < 10){
      alert('Please enter the student name and a 10-digit phone number.');
      return;
    }
    this.state.booking.studentName = name;
    this.state.booking.phone = phone;
    this.state.booking.notes = document.getElementById('bk-notes').value.trim();
    this.state.booking.step = 2;
    this.render();
  },
  pay(){
    const t = TUTORS.find(x=>x.id===this.state.selectedTutorId) || TUTORS[0];
    const btn = document.getElementById('pay-btn');
    if(btn){ btn.disabled = true; btn.textContent = 'Opening Razorpay…'; }
    const amountPaise = t.fee * 100;

    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: amountPaise,
      currency: 'INR',
      name: 'Classhub',
      description: t.subjects[0] + ' session with ' + t.name,
      handler: () => { this.finishPayment(); },
      modal: { ondismiss: () => { if(btn){ btn.disabled=false; btn.textContent = 'Pay ' + rupees(t.fee) + ' with Razorpay'; } } },
      prefill: { name: this.state.booking.studentName || '', contact: this.state.booking.phone || '' },
      theme: { color: '#0F5652' },
    };

    try{
      if(window.Razorpay){
        const rzp = new window.Razorpay(options);
        if(rzp.on) rzp.on('payment.failed', () => { if(btn){ btn.disabled=false; btn.textContent = 'Pay ' + rupees(t.fee) + ' with Razorpay'; } });
        rzp.open();
      } else {
        setTimeout(() => this.finishPayment(), 900);
      }
    } catch(e){
      setTimeout(() => this.finishPayment(), 900);
    }
  },
  async finishPayment(){
    const t = TUTORS.find(x=>x.id===this.state.selectedTutorId) || TUTORS[0];
    const b = this.state.booking;
    const bookingId = 'CH' + Math.floor(100000 + Math.random()*900000);
    
    const bookingData = {
      id: bookingId,
      studentName: b.studentName,
      subject: t.subjects[0],
      date: formatDate(b.days[b.dayIdx]),
      time: b.time,
      status: "Confirmed",
      amount: t.fee
    };

    try {
      await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      });
      MOCK_BOOKINGS.push(bookingData);
    } catch(e) {
      console.error("Failed to save booking", e);
    }

    this.state.booking.bookingId = bookingId;
    this.state.booking.step = 3;
    this.render();
  },
});

/* ============================== AUTH ============================== */

function renderAuth(state){
  const role = state.authRole, mode = state.authMode;
  return `
  <div class="auth-wrap">
    <div class="auth-head">
      <span class="logo" style="padding:0;font-size:24px">Class<span>hub</span></span>
      <p>${mode==='login' ? 'Log in to your account' : 'Create your Classhub account'}</p>
    </div>
    <div class="role-toggle">
      <button class="fring ${role==='student'?'active':''}" onclick="App.setAuthRole('student')">Student / Parent</button>
      <button class="fring ${role==='tutor'?'active':''}" onclick="App.setAuthRole('tutor')">Tutor / Center</button>
    </div>
    <form class="auth-form" onsubmit="App.submitAuth(event)">
      ${mode==='signup' ? `
        <div class="form-field">
          <label>${role==='tutor' ? 'Full name / center name' : 'Your name'}</label>
          <input id="auth-name" required placeholder="${role==='tutor' ? 'e.g. Vidya Achievers Academy' : 'e.g. Ramesh Iyer'}">
        </div>` : ''}
      <div class="form-field"><label>Mobile number or email</label><input id="auth-email" required placeholder="98765 43210 or you@example.com"></div>
      <div class="form-field"><label>Password</label><input type="password" required placeholder="••••••••"></div>
      ${role==='tutor' && mode==='signup' ? `<div class="auth-note">Tutor and center accounts go through a quick verification step (ID + one reference) before your profile goes live on search.</div>` : ''}
      <button type="submit" class="btn btn-primary btn-block fring">${mode==='login' ? 'Log in' : 'Create ' + (role==='tutor'?'tutor':'student') + ' account'}</button>
    </form>
    <p class="switch-line">
      ${mode==='login' ? 'New to Classhub?' : 'Already have an account?'}
      <button class="fring" onclick="App.toggleAuthMode()">${mode==='login' ? 'Sign up' : 'Log in'}</button>
    </p>
  </div>`;
}

Object.assign(App, {
  setAuthRole(r){ this.state.authRole = r; this.render(); },
  toggleAuthMode(){ this.state.authMode = this.state.authMode==='login' ? 'signup' : 'login'; this.render(); },
  submitAuth(e){
    e.preventDefault();
    const role = this.state.authRole;
    const nameField = document.getElementById('auth-name');
    const name = (nameField && nameField.value.trim()) || (role==='tutor' ? 'Lakshmi Narayanan' : 'Ramesh Iyer');
    this.state.auth = { loggedIn:true, role, name };
    this.go(role==='tutor' ? 'dashboard' : 'home');
  },
});

/* ============================== DASHBOARD ============================== */

function renderDashboard(state){
  if(!state.auth.loggedIn || state.auth.role!=='tutor'){
    return `<div class="gated">
      <p>Tutor dashboard is for tutors &amp; centers</p>
      <p>Log in with a tutor or center account to manage bookings and earnings.</p>
      <button class="btn btn-primary fring" style="margin-top:20px" onclick="App.go('auth-tutor')">Log in as tutor / center</button>
    </div>`;
  }

  const tabs = [['bookings','Bookings'],['earnings','Earnings'],['profile','Edit profile']];
  const t = TUTORS[0] || {};

  let body = '';
  if(state.dashTab==='bookings'){
    body = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <h2 style="font-size:18px">Incoming bookings</h2><span style="font-size:12px;color:var(--ink-50)">${MOCK_BOOKINGS.length} total</span>
    </div>
    ${MOCK_BOOKINGS.map(b=>`
      <div class="booking-row">
        <div><div class="who">${esc(b.studentName)}</div><div class="what">${esc(b.subject)} · ${b.date}, ${b.time}</div></div>
        <div style="text-align:right"><span class="status-pill status-${b.status}">${b.status}</span><div class="mono fee" style="margin-top:4px">${rupees(b.amount)}</div></div>
      </div>`).join('')}`;
  } else if(state.dashTab==='earnings'){
    const received = MOCK_BOOKINGS.filter(b=>b.status==='Completed').reduce((s,b)=>s+b.amount,0);
    const pending = MOCK_BOOKINGS.filter(b=>b.status!=='Completed').reduce((s,b)=>s+b.amount,0);
    const pendingCount = MOCK_BOOKINGS.filter(b=>b.status!=='Completed').length;
    body = `
    <h2 style="font-size:18px;margin-bottom:12px">Earnings summary</h2>
    <div class="earnings-grid">
      <div class="earn-card received"><div class="lbl">Total received</div><div class="amt mono">${rupees(received)}</div><div class="sub">this month</div></div>
      <div class="earn-card pending"><div class="lbl">Pending payout</div><div class="amt mono">${rupees(pending)}</div><div class="sub">across ${pendingCount} bookings</div></div>
    </div>
    <p style="font-size:12px;color:var(--ink-40);margin-top:16px;line-height:1.5">Payouts settle to your linked bank account 2 business days after a completed, confirmed session.</p>`;
  } else {
    body = `
    <h2 style="font-size:18px;margin-bottom:12px">Edit your public profile</h2>
    <form class="booking-panel" onsubmit="App.saveProfile(event)">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
        ${avatar(t.name||'',0,'md')}
        <div><p style="font-weight:600;font-family:'Fraunces',serif">${esc(t.name||'')}</p><p style="font-size:12px;color:var(--ink-50)">${esc(t.location||'')} · ${esc(t.kind||'')}</p></div>
      </div>
      <div class="form-field"><label>Bio</label><textarea rows="4">${esc(t.bio||'')}</textarea></div>
      <div class="form-field"><label>Subjects (comma separated)</label><input value="${esc((t.subjects||[]).join(', '))}"></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="form-field"><label>Fee (₹/hr)</label><input class="mono" value="${t.fee||0}"></div>
        <div class="form-field"><label>Format</label>
          <select>${FORMATS.map(f=>`<option ${(t.formats||[])[0]===f?'selected':''}>${esc(f)}</option>`).join('')}</select>
        </div>
      </div>
      <div class="form-field"><label>Availability</label><input value="Weekdays 4–8 PM, Saturdays 9 AM–1 PM"></div>
      <div style="display:flex;align-items:center;gap:12px">
        <button type="submit" class="btn btn-primary fring">Save changes</button>
        <span id="save-confirm" style="font-size:14px;color:var(--teal-700);font-weight:500;display:none">✓ Saved</span>
      </div>
    </form>`;
  }

  return `
  <div class="container" style="max-width:720px;padding-top:24px;padding-bottom:80px">
    <h1 style="font-size:26px;font-weight:600">Your dashboard</h1>
    <p style="font-size:14px;color:var(--ink-50);margin-top:4px">Manage bookings, payouts and your public profile.</p>
    <div class="dash-tabs">
      ${tabs.map(([k,l])=>`<button class="fring ${state.dashTab===k?'active':''}" onclick="App.setDashTab('${k}')">${l}</button>`).join('')}
    </div>
    ${body}
  </div>`;
}

Object.assign(App, {
  setDashTab(k){ this.state.dashTab = k; this.render(); },
  saveProfile(e){
    e.preventDefault();
    const el = document.getElementById('save-confirm');
    if(el){ el.style.display='inline'; setTimeout(()=>{ el.style.display='none'; }, 2500); }
  },
});

/* ============================== INIT ============================== */
function afterRender(state){ /* reserved for post-render focus/scroll handling if needed */ }

// Initialize Data before rendering
loadData().then(() => {
  App.state.loading = false;
  if(TUTORS.length > 0) {
    App.state.selectedTutorId = TUTORS[0].id;
  }
  App.render();
});
