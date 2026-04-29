// ══════════════════════════════════════
// GLOBAL API CONFIG
// ══════════════════════════════════════
const API = 'http://localhost:3000/api';

const apiGet = async (url) => {
  const token = localStorage.getItem('token');
  const res   = await fetch(`${API}${url}`, { headers: { 'Authorization': `Bearer ${token}` } });
  return res.json();
};

const apiPost = async (url, body) => {
  const token = localStorage.getItem('token');
  console.log('Token:', token); // ← debug ke liye
  const res = await fetch(`${API}${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });
  return res.json();
};

const apiPut = async (url, body) => {
  const token = localStorage.getItem('token');
  const res   = await fetch(`${API}${url}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(body)
  });
  return res.json();
};

const getUser = () => JSON.parse(localStorage.getItem('userData') || '{}');

// ── State ──
let currentUser = null;
let currentRole = 'student';
let currentPage = 'dashboard';
let chatOpen    = false;

// ── Demo Data (fallback only) ──
const demoData = {
  student: { name:'Student', initials:'ST', role:'Student · KD Campus', id:'STU0000001', cgpa:0, attendance:0, fees:{pending:0,paid:0}, courses:[], marks:[], attendance_detail:[], assignments:[], paymentHistory:[], exams:[] },
  faculty: { name:'Faculty', initials:'FC', role:'Faculty · KD Campus', id:'FAC0000001', department:'N/A', designation:'Faculty', courses:[], students:[] },
  admin:   { name:'Admin',   initials:'AD', role:'System Administrator', stats:{students:0,faculty:0,courses:0,departments:0}, pendingRegistrations:[], recentActivity:[] }
};

// ── Nav Config ──
const navConfig = {
  student: [
    { section:'Main', items:[
      { icon:'<i class="fa-solid fa-house"></i>',            label:'Dashboard',       page:'dashboard' },
      { icon:'<i class="fa-solid fa-book"></i>',             label:'My Courses',      page:'courses' },
      { icon:'<i class="fa-solid fa-calendar-days"></i>',    label:'Timetable',       page:'timetable' },
    ]},
    { section:'Academics', items:[
      { icon:'<i class="fa-solid fa-file-pen"></i>',         label:'Assignments',     page:'assignments', badge:null },
      { icon:'<i class="fa-solid fa-chart-bar"></i>',        label:'Results & Marks', page:'results' },
      { icon:'<i class="fa-solid fa-clipboard-check"></i>',  label:'Attendance',      page:'attendance' },
      { icon:'<i class="fa-solid fa-building-columns"></i>', label:'Digital Library', page:'library' },
      { icon:'<i class="fa-solid fa-pencil"></i>',           label:'Online Exams',    page:'exams' },
    ]},
    { section:'Campus', items:[
      { icon:'<i class="fa-solid fa-indian-rupee-sign"></i>',label:'Fee Payment',      page:'fees' },
      { icon:'<i class="fa-solid fa-comments"></i>',          label:'Chat',             page:'chat', badge:null },
      { icon:'<i class="fa-solid fa-bell"></i>',              label:'Notifications',    page:'notifications', badge:null },
      { icon:'<i class="fa-solid fa-bus"></i>',               label:'Bus Tracker',      page:'bus' },
      { icon:'<i class="fa-solid fa-map-location-dot"></i>',  label:'Campus Map',       page:'campus' },
      { icon:'<i class="fa-solid fa-briefcase"></i>',         label:'Placement Portal', page:'placement' },
      { icon:'<i class="fa-solid fa-award"></i>',             label:'Certificates',     page:'certificates' },
    ]},
  ],
  faculty: [
    { section:'Main', items:[
      { icon:'<i class="fa-solid fa-house"></i>',            label:'Dashboard',       page:'dashboard' },
      { icon:'<i class="fa-solid fa-book"></i>',             label:'My Courses',      page:'courses' },
      { icon:'<i class="fa-solid fa-users"></i>',            label:'Students',        page:'students' },
    ]},
    { section:'Academic Tools', items:[
      { icon:'<i class="fa-solid fa-clipboard-check"></i>',  label:'Mark Attendance', page:'mark-attendance' },
      { icon:'<i class="fa-solid fa-file-pen"></i>',         label:'Assignments',     page:'assignments' },
      { icon:'<i class="fa-solid fa-upload"></i>',           label:'Upload Marks',    page:'upload-marks' },
      { icon:'<i class="fa-solid fa-folder-open"></i>',      label:'Upload Notes',    page:'upload-notes' },
      { icon:'<i class="fa-solid fa-chart-line"></i>',       label:'Performance',     page:'performance' },
    ]},
    { section:'Communication', items:[
      { icon:'<i class="fa-solid fa-comments"></i>',         label:'Chat',            page:'chat', badge:null },
      { icon:'<i class="fa-solid fa-bullhorn"></i>',         label:'Announcements',   page:'announcements' },
    ]},
  ],
  admin: [
    { section:'Overview', items:[
      { icon:'<i class="fa-solid fa-house"></i>',             label:'Dashboard',       page:'dashboard' },
      { icon:'<i class="fa-solid fa-chart-line"></i>',        label:'Analytics',       page:'analytics' },
    ]},
    { section:'Management', items:[
      { icon:'<i class="fa-solid fa-user-graduate"></i>',     label:'Students',        page:'manage-students', badge:null },
      { icon:'<i class="fa-solid fa-chalkboard-user"></i>',   label:'Faculty',         page:'manage-faculty',  badge:null },
      { icon:'<i class="fa-solid fa-book-open"></i>',         label:'Courses',         page:'manage-courses' },
      { icon:'<i class="fa-solid fa-building"></i>',          label:'Departments',     page:'departments' },
    ]},
    { section:'System', items:[
      { icon:'<i class="fa-solid fa-circle-check"></i>',      label:'Approvals',       page:'approvals', badge:null },
      { icon:'<i class="fa-solid fa-coins"></i>',             label:'Fees & Finance',  page:'finance' },
      { icon:'<i class="fa-solid fa-file-chart-column"></i>', label:'Reports',         page:'reports' },
      { icon:'<i class="fa-solid fa-gear"></i>',              label:'System Settings', page:'settings' },
    ]},
  ]
};

// ── Auth ──
document.querySelectorAll('.auth-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab + '-form').classList.add('active');
  });
});

document.querySelectorAll('#login-form .role-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#login-form .role-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentRole = btn.dataset.role;
  });
});

document.querySelectorAll('#signup-form .role-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#signup-form .role-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

function sendOTP() {
  const phone = document.getElementById('login-phone').value;
  if (!phone) { showToast('Phone number daalo','warning'); return; }
  showToast('OTP sent!','success');
  document.getElementById('otp-input').style.display = 'block';
}

async function handleLogin() {
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value.trim();
  if (!email || !password) { showToast('Email aur password bharo','warning'); return; }

  const btn = document.querySelector('#login-form .btn-primary');
  btn.textContent = 'Logging in...'; btn.disabled = true;

  try {
    const res  = await fetch(`${API}/auth/login`, {
      method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email,password})
    });
    const data = await res.json();
    if (!data.success) { showToast(data.message||'Login failed','danger'); btn.textContent='Sign In →'; btn.disabled=false; return; }

    localStorage.setItem('token', data.token);
    localStorage.setItem('userData', JSON.stringify(data.user));
    currentRole = data.user.role;
    currentUser = {
      name:     data.user.name,
      initials: data.user.name.split(' ').map(n=>n[0]).join('').toUpperCase(),
      role:     `${data.user.role.charAt(0).toUpperCase()+data.user.role.slice(1)} · ${data.user.department||'KD Campus'}`,
      id:       data.user.id,
    };
    showToast(`Welcome ${data.user.name}! 🎉`,'success');
    initApp(currentRole);
  } catch(err) {
    showToast('Server se connect nahi ho pa raha!','danger');
    btn.textContent='Sign In →'; btn.disabled=false;
  }
}

async function handleSignup() {
  const name       = document.querySelector('#signup-form input[placeholder="John"]')?.value?.trim();
  const lastName   = document.querySelector('#signup-form input[placeholder="Doe"]')?.value?.trim();
  const email      = document.querySelector('#signup-form input[type="email"]')?.value?.trim();
  const phone      = document.querySelector('#signup-form input[type="tel"]')?.value?.trim();
  const password   = document.querySelector('#signup-form input[type="password"]')?.value?.trim();
  const department = document.querySelector('#signup-form select')?.value;
  const role       = document.querySelector('#signup-form .role-btn.active')?.dataset?.role||'student';

  if (!name||!email||!password) { showToast('Saari fields bharo','warning'); return; }

  try {
    const res  = await fetch(`${API}/auth/register`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({name:`${name} ${lastName||''}`.trim(),email,phone,password,role,department})
    });
    const data = await res.json();
    if (!data.success) { showToast(data.message||'Registration failed','danger'); return; }
    showToast('Registration ho gayi! Admin approval ka wait karo.','success');
    document.querySelector('[data-tab="login"]').click();
  } catch(err) { showToast('Server error!','danger'); }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userData');
  currentUser = null;
  currentPage = 'dashboard';
  currentRole = 'student';

  // Button reset karo
  const btn = document.querySelector('#login-form .btn-primary');
  if (btn) { btn.textContent = 'Sign In →'; btn.disabled = false; }

  // Email/password clear karo
  const emailInput = document.getElementById('login-email');
  const passInput  = document.getElementById('login-password');
  if (emailInput) emailInput.value = '';
  if (passInput)  passInput.value  = '';

  // App hide karo, auth show karo
  document.getElementById('app').classList.remove('active');
  document.getElementById('auth-screen').classList.add('active');

  showToast('Logout ho gaye!', 'accent');
}

// ── App Init ──
function initApp(role) {
  currentRole = role;
  const savedUser = JSON.parse(localStorage.getItem('userData')||'{}');
  if (savedUser && savedUser.name) {
    currentUser = {
      name:     savedUser.name,
      initials: savedUser.name.split(' ').map(n=>n[0]).join('').toUpperCase(),
      role:     `${savedUser.role.charAt(0).toUpperCase()+savedUser.role.slice(1)} · ${savedUser.department||'KD Campus'}`,
      id:       savedUser.id,
    };
  } else { currentUser = demoData[role]; }

  document.getElementById('auth-screen').classList.remove('active');
  document.getElementById('app').classList.add('active');
  document.getElementById('sidebar-name').textContent    = currentUser.name;
  document.getElementById('sidebar-role').textContent    = currentUser.role;
  document.getElementById('sidebar-avatar').textContent  = currentUser.initials;
  document.getElementById('top-avatar').textContent      = currentUser.initials;

  renderNav(role);
  navigateTo('dashboard');
  startAutoNotifications();
  if (role === 'admin') updateApprovalBadge();

  renderNav(role);
  navigateTo('dashboard');
  startAutoNotifications();
  if (role === 'admin') updateApprovalBadge();
  initSocket();
}


async function updateApprovalBadge() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;
    const res  = await fetch(`${API}/faculty/pending`, { headers:{'Authorization':`Bearer ${token}`} });
    const data = await res.json();
    const count = data.pending?.length||0;

    const appNav = document.querySelector('[data-page="approvals"]');
    if (appNav) {
      let badge = appNav.querySelector('.nav-badge');
      if (!badge&&count>0) { badge=document.createElement('span'); badge.className='nav-badge'; appNav.appendChild(badge); }
      if (badge) { badge.textContent=count; badge.style.display=count>0?'inline-flex':'none'; }
    }

    const stuCount = data.pending?.filter(u=>u.role==='student').length||0;
    const stuNav   = document.querySelector('[data-page="manage-students"]');
    if (stuNav&&stuCount>0) {
      let b=stuNav.querySelector('.nav-badge');
      if(!b){b=document.createElement('span');b.className='nav-badge';stuNav.appendChild(b);}
      b.textContent=stuCount;
    }

    const facCount = data.pending?.filter(u=>u.role==='faculty').length||0;
    const facNav   = document.querySelector('[data-page="manage-faculty"]');
    if (facNav&&facCount>0) {
      let b=facNav.querySelector('.nav-badge');
      if(!b){b=document.createElement('span');b.className='nav-badge';facNav.appendChild(b);}
      b.textContent=facCount;
    }
  } catch(err) { console.log('Badge error:',err); }
}

function renderNav(role) {
  const nav = document.getElementById('sidebar-nav');
  nav.innerHTML = navConfig[role].map(section => `
    <div class="nav-section">
      <div class="nav-section-title">${section.section}</div>
      ${section.items.map(item => `
        <div class="nav-item" data-page="${item.page}" onclick="navigateTo('${item.page}')">
          <span class="nav-icon">${item.icon}</span>
          <span>${item.label}</span>
          ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ''}
        </div>
      `).join('')}
    </div>`).join('');
}

function navigateTo(page) {
  currentPage = page;
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.querySelector(`[data-page="${page}"]`)?.classList.add('active');

  const titles = {
    dashboard:'Dashboard',courses:'My Courses',timetable:'Timetable',
    assignments:'Assignments',results:'Results & Marks',attendance:'Attendance',
    library:'Digital Library',exams:'Online Exams',fees:'Fee Payment',
    chat:'Chat',bus:'Bus Tracker',campus:'Campus Map',
    placement:'Placement Portal',certificates:'Certificates',notifications:'Notifications',
    students:'Students','mark-attendance':'Mark Attendance',
    'upload-marks':'Upload Marks','upload-notes':'Upload Notes',
    performance:'Student Performance',announcements:'Announcements',
    analytics:'Analytics','manage-students':'Manage Students',
    'manage-faculty':'Manage Faculty','manage-courses':'Manage Courses',
    departments:'Departments',approvals:'Approvals',
    finance:'Finance',reports:'Reports',settings:'Settings'
  };
  document.getElementById('page-title').textContent = titles[page]||page;

  const renderer = {
    student:{ dashboard:renderStudentDashboard, courses:renderCourses, timetable:renderTimetable,
      assignments:renderAssignments, results:renderResults, attendance:renderAttendancePage,
      library:renderLibrary, exams:renderExams, fees:renderFees, chat:renderChat,
      bus:renderBusTracker, campus:renderCampusMap, placement:renderPlacement,
      certificates:renderCertificates, notifications:renderNotificationCenter },
    faculty:{ dashboard:renderFacultyDashboard, courses:renderFacultyCourses, students:renderStudentList,
      'mark-attendance':renderMarkAttendance, assignments:renderFacultyAssignments,
      'upload-marks':renderUploadMarks, 'upload-notes':renderUploadNotes,
      performance:renderPerformance, chat:renderChat, announcements:renderAnnouncements },
    admin:{ dashboard:renderAdminDashboard, analytics:renderAnalytics,
      'manage-students':renderManageStudents, 'manage-faculty':renderManageFaculty,
      'manage-courses':renderManageCourses, approvals:renderApprovals,
      finance:renderFinance, reports:renderReports, settings:renderSettings }
  };

  const fn   = renderer[currentRole]?.[page];
  const area = document.getElementById('content-area');
  if (fn) { area.innerHTML=''; fn(area); }
  else { area.innerHTML=`<div class="page-header"><h1>🚧 Coming Soon</h1><p>Under development.</p></div>`; }
  if (window.innerWidth<769) document.getElementById('sidebar').classList.remove('open');
}

// ═══════════ STUDENT PAGES ═══════════

async function renderStudentDashboard(area) {
  const user = getUser();
  area.innerHTML = `
    <div class="page-header">
      <h1>Good Morning, ${user.name?.split(' ')[0]||'Student'}! 👋</h1>
      <p>${new Date().toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
    </div>
    <div id="dash-stats" class="grid grid-4" style="margin-bottom:20px">
      <div class="stat-card" style="--stat-color:var(--accent)"><div class="stat-icon"><i class="fa-solid fa-chart-bar"></i></div><div class="stat-label">CGPA</div><div class="stat-value">--</div></div>
      <div class="stat-card" style="--stat-color:var(--success)"><div class="stat-icon"><i class="fa-solid fa-clipboard-check"></i></div><div class="stat-label">ATTENDANCE</div><div class="stat-value">--</div></div>
      <div class="stat-card" style="--stat-color:var(--warning)"><div class="stat-icon"><i class="fa-solid fa-file-pen"></i></div><div class="stat-label">ASSIGNMENTS</div><div class="stat-value">--</div></div>
      <div class="stat-card" style="--stat-color:var(--danger)"><div class="stat-icon"><i class="fa-solid fa-indian-rupee-sign"></i></div><div class="stat-label">FEE DUE</div><div class="stat-value">--</div></div>
    </div>
    <div class="grid grid-2" style="margin-bottom:20px">
      <div class="card" id="dash-attendance"><div class="card-header"><div class="card-title">Attendance</div></div><div style="text-align:center;padding:20px;color:var(--text-muted)">Loading...</div></div>
      <div class="card" id="dash-marks"><div class="card-header"><div class="card-title">Performance</div></div><div style="text-align:center;padding:20px;color:var(--text-muted)">Loading...</div></div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">Quick Actions</div></div>
      <div class="grid grid-4">
        ${[
          {icon:'<i class="fa-solid fa-file-pen"></i>',    label:'Assignments', action:'assignments'},
          {icon:'<i class="fa-solid fa-rupee-sign"></i>',  label:'Pay Fees',    action:'fees'},
          {icon:'<i class="fa-solid fa-book"></i>',        label:'Library',     action:'library'},
          {icon:'<i class="fa-solid fa-comments"></i>',    label:'Chat',        action:'chat'},
          {icon:'<i class="fa-solid fa-chart-bar"></i>',   label:'Results',     action:'results'},
          {icon:'<i class="fa-solid fa-bus"></i>',         label:'Bus Tracker', action:'bus'},
          {icon:'<i class="fa-solid fa-briefcase"></i>',   label:'Placement',   action:'placement'},
          {icon:'<i class="fa-solid fa-award"></i>',       label:'Certificates',action:'certificates'},
        ].map(q=>`
          <div onclick="navigateTo('${q.action}')" style="padding:16px;border:1px solid var(--border);border-radius:10px;text-align:center;cursor:pointer;transition:all var(--transition)"
            onmouseover="this.style.borderColor='var(--accent)';this.style.background='var(--accent-soft)'"
            onmouseout="this.style.borderColor='var(--border)';this.style.background='transparent'">
            <div style="font-size:20px;margin-bottom:8px;color:var(--accent)">${q.icon}</div>
            <div style="font-size:12px;font-weight:600;color:var(--text-secondary)">${q.label}</div>
          </div>`).join('')}
      </div>
    </div>`;

  try {
    const userId = user.id;

    const attData = await apiGet(`/attendance/student/${userId}`);
    const attDiv  = document.getElementById('dash-attendance');
    if (attData.attendance?.length>0) {
      const overall = Math.round(attData.attendance.reduce((s,a)=>s+a.pct,0)/attData.attendance.length);
      document.querySelector('#dash-stats .stat-card:nth-child(2) .stat-value').textContent = overall+'%';
      attDiv.innerHTML = `<div class="card-header"><div class="card-title">Attendance</div><button class="btn btn-ghost btn-sm" onclick="navigateTo('attendance')">View All</button></div>
        ${attData.attendance.map(a=>`
          <div class="marks-bar-row">
            <div class="marks-subject">${a.subject.split(' ')[0]}</div>
            <div class="marks-bar-wrap"><div class="marks-bar-fill" style="width:${a.pct}%;background:${a.pct>=75?'var(--success)':a.pct>=65?'var(--warning)':'var(--danger)'}"></div></div>
            <div class="marks-val">${a.pct}%</div>
          </div>`).join('')}`;
    } else {
      attDiv.innerHTML = `<div class="card-header"><div class="card-title">Attendance</div></div><div style="text-align:center;padding:20px;color:var(--text-muted)">Koi record nahi</div>`;
    }

    const marksData = await apiGet(`/marks/student/${userId}`);
    const marksDiv  = document.getElementById('dash-marks');
    if (marksData.marks?.length>0) {
      marksDiv.innerHTML = `<div class="card-header"><div class="card-title">Performance</div><button class="btn btn-ghost btn-sm" onclick="navigateTo('results')">Details</button></div>
        ${marksData.marks.map(m=>`
          <div class="marks-bar-row">
            <div class="marks-subject">${m.courseId?.name?.split(' ')[0]||'Subject'}</div>
            <div class="marks-bar-wrap"><div class="marks-bar-fill" style="width:${(m.marks/m.maxMarks)*100}%;background:var(--accent)"></div></div>
            <div class="marks-val">${m.marks}/${m.maxMarks}</div>
          </div>`).join('')}`;
    } else {
      marksDiv.innerHTML = `<div class="card-header"><div class="card-title">Performance</div></div><div style="text-align:center;padding:20px;color:var(--text-muted)">Koi marks nahi</div>`;
    }

    const feeData = await apiGet(`/fees/student/${userId}`);
    const pending = feeData.summary?.pending||0;
    document.querySelector('#dash-stats .stat-card:nth-child(4) .stat-value').textContent = pending>0?'₹'+(pending/1000).toFixed(0)+'K':'₹0';

    const asgData  = await apiGet('/assignments');
    const pendingA = asgData.assignments?.filter(a=>new Date(a.dueDate)>new Date()).length||0;
    document.querySelector('#dash-stats .stat-card:nth-child(3) .stat-value').textContent = pendingA;

  } catch(err) { console.log('Dashboard error:',err); }
}

async function renderResults(area) {
  const user = getUser();
  area.innerHTML = `
    <div class="page-header"><h1>Results & Marks</h1><p>Your academic performance</p></div>
    <div class="card" id="marks-container">
      <div style="text-align:center;padding:32px;color:var(--text-muted)"><div style="font-size:36px;margin-bottom:8px">⏳</div>Loading...</div>
    </div>`;

  try {
    const data = await apiGet(`/marks/student/${user.id}`);
    const container = document.getElementById('marks-container');
    if (!data.marks||data.marks.length===0) {
      container.innerHTML = `<div style="text-align:center;padding:32px;color:var(--text-muted)"><div style="font-size:36px;margin-bottom:8px">📊</div>Abhi koi marks nahi hain</div>`;
      return;
    }
    container.innerHTML = `
      <div class="card-header"><div class="card-title">Subject-wise Marks</div><button class="btn btn-accent btn-sm" onclick="downloadMarksheet()">⬇ Download</button></div>
      <div class="table-wrap"><table>
        <thead><tr><th>Subject</th><th>Type</th><th>Marks</th><th>Max</th><th>%</th><th>Grade</th></tr></thead>
        <tbody>
          ${data.marks.map(m=>{
            const pct=Math.round((m.marks/m.maxMarks)*100);
            const grade=pct>=90?'A+':pct>=80?'A':pct>=70?'B+':pct>=60?'B':'C';
            return `<tr>
              <td style="font-weight:600;color:var(--text-primary)">${m.courseId?.name||'N/A'}</td>
              <td>${m.examType}</td>
              <td style="font-weight:700;color:var(--accent)">${m.marks}</td>
              <td>${m.maxMarks}</td>
              <td><div style="display:flex;align-items:center;gap:8px">
                <div class="progress-bar" style="width:80px"><div class="progress-fill" style="width:${pct}%;background:${pct>=75?'var(--success)':'var(--danger)'}"></div></div>${pct}%
              </div></td>
              <td><span class="badge badge-${pct>=80?'success':pct>=60?'accent':'danger'}">${grade}</span></td>
            </tr>`;
          }).join('')}
        </tbody>
      </table></div>`;
  } catch(err) {
    document.getElementById('marks-container').innerHTML = `<div style="color:var(--danger);padding:20px">Error loading marks</div>`;
  }
}

async function renderAttendancePage(area) {
  const user = getUser();
  area.innerHTML = `
    <div class="page-header"><h1>Attendance</h1></div>
    <div id="att-rings" class="grid grid-4" style="margin-bottom:20px">
      <div style="text-align:center;padding:20px;color:var(--text-muted);grid-column:1/-1">Loading...</div>
    </div>`;

  try {
    const data  = await apiGet(`/attendance/student/${user.id}`);
    const rings = document.getElementById('att-rings');
    if (!data.attendance||data.attendance.length===0) {
      rings.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-muted);grid-column:1/-1">Koi attendance record nahi hai</div>`;
      return;
    }
    rings.innerHTML = data.attendance.map(a=>`
      <div class="card" style="text-align:center">
        <div class="attendance-ring" style="margin:0 auto 10px">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle class="ring-circle" cx="40" cy="40" r="32"/>
            <circle class="ring-progress" cx="40" cy="40" r="32"
              stroke="${a.pct>=75?'var(--success)':a.pct>=65?'var(--warning)':'var(--danger)'}"
              stroke-dasharray="${2*Math.PI*32}"
              stroke-dashoffset="${2*Math.PI*32*(1-a.pct/100)}"/>
          </svg>
          <div class="ring-text" style="color:${a.pct>=75?'var(--success)':a.pct>=65?'var(--warning)':'var(--danger)'}">${a.pct}%</div>
        </div>
        <div style="font-weight:600;font-size:13px">${a.subject.split(' ')[0]}</div>
        <div style="font-size:12px;color:var(--text-muted);margin-top:4px">${a.present}/${a.total} classes</div>
        <span class="badge badge-${a.pct>=75?'success':a.pct>=65?'warning':'danger'}" style="margin-top:8px">${a.pct>=75?'Good':'Low'}</span>
      </div>`).join('');
  } catch(err) {
    document.getElementById('att-rings').innerHTML = `<div style="color:var(--danger);padding:20px">Error</div>`;
  }
}

async function renderManageStudents(area) {
  area.innerHTML = `
    <div class="page-header"><h1>Manage Students</h1></div>
    <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap">
      <div class="search-bar" style="flex:1;min-width:200px"><span>🔍</span><input placeholder="Search..." id="student-search" oninput="filterStudents()"></div>
      <button class="btn btn-accent">+ Add Student</button>
      <button class="btn btn-ghost" onclick="showToast('Exported!','success')">⬇ Export</button>
    </div>
    <div class="card" id="students-container">
      <div style="text-align:center;padding:32px;color:var(--text-muted)">Loading...</div>
    </div>`;

  try {
    const data = await apiGet('/students');
    window._allStudents = data.students||[];
    renderStudentsTable(data.students||[]);
  } catch(err) {
    document.getElementById('students-container').innerHTML = `<div style="color:var(--danger);padding:20px">Error</div>`;
  }
}

function renderStudentsTable(students) {
  const container = document.getElementById('students-container');
  if (!students.length) {
    container.innerHTML = `<div style="text-align:center;padding:32px;color:var(--text-muted)"><div style="font-size:36px;margin-bottom:8px">👥</div>Koi student nahi mila</div>`;
    return;
  }
  container.innerHTML = `
    <div class="table-wrap"><table>
      <thead><tr><th>Student</th><th>Email</th><th>Department</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>
        ${students.map(s=>`
          <tr>
            <td><div style="display:flex;align-items:center;gap:8px">
              <div class="user-avatar" style="width:32px;height:32px;font-size:11px">${s.name.split(' ').map(n=>n[0]).join('').toUpperCase()}</div>
              <span style="font-weight:600;color:var(--text-primary)">${s.name}</span>
            </div></td>
            <td>${s.email}</td>
            <td>${s.department||'N/A'}</td>
            <td><span class="badge badge-${s.isApproved?'success':'warning'}">${s.isApproved?'Active':'Pending'}</span></td>
            <td><div style="display:flex;gap:4px">
              <button class="btn btn-ghost btn-sm">✏️</button>
              <button class="btn btn-danger btn-sm" onclick="deleteStudent('${s._id}','${s.name}')">🗑️</button>
            </div></td>
          </tr>`).join('')}
      </tbody>
    </table></div>`;
}

function filterStudents() {
  const q = document.getElementById('student-search')?.value?.toLowerCase();
  const filtered = (window._allStudents||[]).filter(s=>s.name.toLowerCase().includes(q)||s.email.toLowerCase().includes(q));
  renderStudentsTable(filtered);
}

async function deleteStudent(id, name) {
  if (!confirm(`${name} ko delete karna hai?`)) return;
  try {
    await apiPut(`/students/${id}`,{isActive:false});
    showToast(`${name} delete ho gaya`,'danger');
    renderManageStudents(document.getElementById('content-area'));
  } catch(err) { showToast('Error','danger'); }
}

// ── Other Student Pages ──
function renderCourses(area) {
  area.innerHTML = `<div class="page-header"><h1>My Courses</h1></div>
    <div style="text-align:center;padding:40px;color:var(--text-muted)">
      <div style="font-size:48px;margin-bottom:12px">📚</div>
      <div style="font-weight:600">Admin se courses assign hone ke baad yahan dikhenge</div>
    </div>`;
}

function renderTimetable(area) {
  const days  = ['Mon','Tue','Wed','Thu','Fri'];
  const times = ['8-9 AM','9-10 AM','10-11 AM','11-12 PM','12-1 PM','2-3 PM','3-4 PM','4-5 PM'];
  const schedule = [
    [null,'ML\nA-204',null,'CN\nB-102',null],
    ['DBMS\nC-301',null,'SE\nA-101',null,'ML Lab\nLab-1'],
    [null,'CN Lab\nLab-2',null,'DBMS\nC-301',null],
    ['SE\nA-101',null,'ML\nA-204',null,'DBMS\nC-301'],
    [null,'ML Lab\nLab-1',null,null,'SE Lab\nLab-3'],
    ['CN\nB-102',null,'DBMS\nC-301','ML\nA-204',null],
    [null,'SE\nA-101',null,'CN Lab\nLab-2',null],
    ['DBMS\nC-301',null,'ML\nA-204',null,'SE\nA-101'],
  ];
  const getColor = (txt) => {
    if(!txt) return '';
    if(txt.includes('ML')) return 'has-class';
    if(txt.includes('DBMS')) return 'has-class green';
    if(txt.includes('CN')) return 'has-class purple';
    return 'has-class orange';
  };
  area.innerHTML = `
    <div class="page-header"><h1>Timetable</h1></div>
    <div class="card">
      <div class="timetable">
        <div class="tt-head">Time</div>
        ${days.map(d=>`<div class="tt-head">${d}</div>`).join('')}
        ${times.map((t,ti)=>`
          <div class="tt-time">${t}</div>
          ${days.map((_,di)=>{
            const cell=schedule[ti]?.[di]||'';
            const parts=cell.split('\n');
            return `<div class="tt-cell ${getColor(cell)}">${cell?`<div class="tt-subject" style="font-size:10px">${parts[0]}</div><div class="tt-room">${parts[1]||''}</div>`:''}</div>`;
          }).join('')}
        `).join('')}
      </div>
    </div>`;
}

async function renderAssignments(area) {
  area.innerHTML = `
    <div class="page-header"><h1>Assignments</h1></div>
    <div class="card" id="asgn-container"><div style="text-align:center;padding:32px;color:var(--text-muted)">Loading...</div></div>
    <div class="card" style="margin-top:16px">
      <div class="card-title" style="margin-bottom:16px">Submit Assignment</div>
      <div class="form-group"><label>Select Assignment</label><select id="asgn-select"><option>Loading...</option></select></div>
      <div class="form-group"><label>Notes</label><textarea rows="3" placeholder="Add notes..."></textarea></div>
      <div class="upload-zone" onclick="showToast('File picker','accent')">
        <div class="upload-icon">📎</div>
        <div style="font-weight:600;margin-bottom:4px">Click to upload</div>
        <div style="font-size:12px">PDF, DOCX, ZIP up to 50MB</div>
      </div>
      <button class="btn btn-accent" style="margin-top:16px;width:100%" onclick="showToast('Assignment submitted!','success')">Submit</button>
    </div>`;

  try {
    const data = await apiGet('/assignments');
    const container = document.getElementById('asgn-container');
    if (!data.assignments||data.assignments.length===0) {
      container.innerHTML = `<div style="text-align:center;padding:32px;color:var(--text-muted)"><div style="font-size:36px">📝</div>Koi assignment nahi hai</div>`;
      return;
    }
    container.innerHTML = `
      <div class="card-header"><div class="card-title">All Assignments</div></div>
      ${data.assignments.map(a=>{
        const isOverdue=new Date(a.dueDate)<new Date();
        const due=new Date(a.dueDate).toLocaleDateString('en-IN');
        return `<div class="assignment-card">
          <div class="asgn-icon" style="background:var(--accent-soft)"><i class="fa-solid fa-file-pen" style="color:var(--accent)"></i></div>
          <div class="asgn-info">
            <div class="asgn-title">${a.title}</div>
            <div class="asgn-meta">${a.courseId?.name||'N/A'} · Due: ${due}</div>
          </div>
          <span class="badge badge-${isOverdue?'danger':'warning'}">${isOverdue?'Overdue':'Pending'}</span>
        </div>`;
      }).join('')}`;
    const sel=document.getElementById('asgn-select');
    sel.innerHTML=data.assignments.map(a=>`<option value="${a._id}">${a.title}</option>`).join('');
  } catch(err) {
    document.getElementById('asgn-container').innerHTML=`<div style="color:var(--danger);padding:20px">Error</div>`;
  }
}

function renderLibrary(area) {
  const books=[
    {title:'Introduction to Machine Learning',author:'Ethem Alpaydin',icon:'🤖',color:'#4f6ef7',available:true},
    {title:'Database System Concepts',author:'Silberschatz',icon:'🗄️',color:'#22d3a0',available:false},
    {title:'Computer Networks',author:'Andrew Tanenbaum',icon:'🌐',color:'#a78bfa',available:true},
    {title:'Software Engineering',author:'Roger Pressman',icon:'⚙️',color:'#f7b955',available:true},
  ];
  area.innerHTML = `
    <div class="page-header"><h1>Digital Library</h1></div>
    <div class="card">
      <div class="card-header"><div class="card-title">📖 Textbooks</div></div>
      ${books.map(b=>`
        <div class="book-card">
          <div class="book-cover" style="background:${b.color}18">${b.icon}</div>
          <div style="flex:1">
            <div style="font-weight:600;font-size:13.5px">${b.title}</div>
            <div style="font-size:12px;color:var(--text-muted)">${b.author}</div>
            <span class="badge badge-${b.available?'success':'danger'}" style="margin-top:6px">${b.available?'Available':'Checked Out'}</span>
          </div>
          ${b.available?`<button class="btn btn-accent btn-sm" onclick="showToast('PDF downloaded!','success')">⬇ PDF</button>`:''}
        </div>`).join('')}
    </div>`;
}

function renderExams(area) {
  area.innerHTML = `
    <div class="page-header"><h1>Online Exams</h1></div>
    <div class="card" style="margin-bottom:20px">
      <div style="text-align:center;padding:32px;color:var(--text-muted)">
        <div style="font-size:48px;margin-bottom:12px">📝</div>
        <div>Exam schedule admin dwara publish hone ke baad yahan dikhega</div>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">🧪 Practice Tests</div></div>
      ${[{title:'ML Mock Test',qs:30,time:'60 min'},{title:'DBMS Practice Quiz',qs:20,time:'30 min'}].map(t=>`
        <div style="display:flex;align-items:center;gap:14px;padding:14px;background:var(--bg-input);border-radius:10px;margin-bottom:8px">
          <span style="font-size:24px">📝</span>
          <div style="flex:1"><div style="font-weight:600">${t.title}</div><div style="font-size:12px;color:var(--text-muted)">${t.qs} Questions · ${t.time}</div></div>
          <button class="btn btn-accent btn-sm" onclick="showToast('Starting...','accent')">Start Test</button>
        </div>`).join('')}
    </div>`;
}

// ── Socket.io connection ──
let socket = null;
let currentChatUser = null;
let chatMessages = {};

function initSocket() {
  if (socket) return;
  socket = io('http://localhost:3000');
  const user = getUser();

  socket.on('connect', () => {
    console.log('✅ Socket connected!');
    socket.emit('user_online', user.id);
  });

  // Private message aaya
  socket.on('private_message', (data) => {
    const key = data.senderId;
    if (!chatMessages[key]) chatMessages[key] = [];
    chatMessages[key].push({ ...data, isMe: false });
    if (currentChatUser?.id === data.senderId) {
      appendMessage(data.message, false, data.senderName);
    }
    // Notification badge
    updateChatBadge(data.senderId);
    sendBrowserNotification(`💬 ${data.senderName}`, data.message, '💬');
  });

  // Message sent confirm
  socket.on('message_sent', (data) => {
    const key = data.receiverId;
    if (!chatMessages[key]) chatMessages[key] = [];
  });

  // Group message aaya
  socket.on('group_message', (data) => {
    const user = getUser();
    const key  = `group_${data.courseId}`;
    if (!chatMessages[key]) chatMessages[key] = [];
    const isMe = data.senderId === user.id;
    chatMessages[key].push({ ...data, isMe });
    if (currentChatUser?.id === key) {
      appendMessage(data.message, isMe, data.senderName);
    }
  });

  // Online users update
  socket.on('online_users', (users) => {
    window._onlineUsers = users;
    updateOnlineStatus();
  });
}

function updateChatBadge(senderId) {
  const chatNav = document.querySelector('[data-page="chat"] .nav-badge');
  if (chatNav) {
    const count = parseInt(chatNav.textContent || '0') + 1;
    chatNav.textContent = count;
    chatNav.style.display = 'inline-flex';
  }
}

function updateOnlineStatus() {
  const onlineUsers = window._onlineUsers || [];
  document.querySelectorAll('[data-online-id]').forEach(el => {
    const id = el.dataset.onlineId;
    el.style.color = onlineUsers.includes(id) ? 'var(--success)' : 'var(--text-muted)';
    el.textContent = onlineUsers.includes(id) ? '● Online' : '○ Offline';
  });
}

function appendMessage(text, isMe, senderName) {
  const msgs = document.getElementById('chat-messages-area');
  if (!msgs) return;
  const div = document.createElement('div');
  div.style.cssText = `display:flex;flex-direction:${isMe?'row-reverse':'row'};gap:8px;margin-bottom:12px;`;
  div.innerHTML = `
    <div>
      ${!isMe ? `<div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;${isMe?'text-align:right':''}">${senderName}</div>` : ''}
      <div style="background:${isMe?'var(--accent)':'var(--bg-input)'};color:${isMe?'white':'var(--text-primary)'};padding:10px 14px;border-radius:14px;border-${isMe?'bottom-right':'bottom-left'}-radius:4px;font-size:13px;max-width:280px;word-wrap:break-word">${text}</div>
      <div style="font-size:10px;color:var(--text-muted);margin-top:3px;text-align:${isMe?'right':'left'}">${new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</div>
    </div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

async function renderChat(area) {
  initSocket();
  const user = getUser();

  area.innerHTML = `
    <div class="page-header"><h1>Chat</h1><p>Real-time messaging</p></div>
    <div class="tabs" style="margin-bottom:16px">
      <button class="tab-btn active" onclick="switchChatTab(this,'private-chat')">
        <i class="fa-solid fa-user"></i> Direct Messages
      </button>
      <button class="tab-btn" onclick="switchChatTab(this,'group-chat')">
        <i class="fa-solid fa-users"></i> Group Chat
      </button>
    </div>

    <!-- Private Chat -->
    <div id="private-chat" class="tab-pane active">
      <div style="display:grid;grid-template-columns:280px 1fr;gap:16px;height:550px">

        <!-- Users List -->
        <div class="card" style="overflow-y:auto;padding:12px">
          <div style="font-weight:600;font-size:13px;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid var(--border)">
            <i class="fa-solid fa-message"></i> Conversations
          </div>
          <div id="users-list">
            <div style="text-align:center;padding:20px;color:var(--text-muted)">Loading...</div>
          </div>
        </div>

        <!-- Chat Window -->
        <div class="card" style="display:flex;flex-direction:column;padding:0;overflow:hidden" id="chat-window">
          <div style="flex:1;display:flex;align-items:center;justify-content:center;color:var(--text-muted);flex-direction:column;gap:12px">
            <i class="fa-solid fa-comments" style="font-size:40px;opacity:.3"></i>
            <div>Kisi user ko select karo chat karne ke liye</div>
          </div>
        </div>

      </div>
    </div>

    <!-- Group Chat -->
    <div id="group-chat" class="tab-pane">
      <div style="display:grid;grid-template-columns:280px 1fr;gap:16px;height:550px">

        <!-- Groups List -->
        <div class="card" style="overflow-y:auto;padding:12px">
          <div style="font-weight:600;font-size:13px;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid var(--border)">
            <i class="fa-solid fa-layer-group"></i> Course Groups
          </div>
          <div id="groups-list">
            <div style="text-align:center;padding:20px;color:var(--text-muted)">Loading...</div>
          </div>
        </div>

        <!-- Group Chat Window -->
        <div class="card" style="display:flex;flex-direction:column;padding:0;overflow:hidden" id="group-chat-window">
          <div style="flex:1;display:flex;align-items:center;justify-content:center;color:var(--text-muted);flex-direction:column;gap:12px">
            <i class="fa-solid fa-users" style="font-size:40px;opacity:.3"></i>
            <div>Koi group select karo</div>
          </div>
        </div>

      </div>
    </div>`;

  // Users load karo
  loadChatUsers();
  loadChatGroups();
}

async function loadChatUsers() {
  try {
    const data = await apiGet('/chat/users');
    const list = document.getElementById('users-list');
    if (!list) return;

    if (!data.users?.length) {
      list.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:13px">Koi user nahi hai</div>`;
      return;
    }

    list.innerHTML = data.users.map(u => {
      const initials = u.name.split(' ').map(n=>n[0]).join('').toUpperCase();
      const onlineUsers = window._onlineUsers || [];
      const isOnline = onlineUsers.includes(u._id);
      return `
        <div onclick="openPrivateChat('${u._id}','${u.name}','${u.role}')"
          style="display:flex;gap:10px;padding:10px;border-radius:10px;cursor:pointer;margin-bottom:4px;transition:all var(--transition)"
          id="user-item-${u._id}"
          onmouseover="this.style.background='var(--accent-soft)'"
          onmouseout="this.style.background='transparent'">
          <div style="position:relative">
            <div class="user-avatar" style="width:38px;height:38px;font-size:13px">${initials}</div>
            <div style="position:absolute;bottom:0;right:0;width:10px;height:10px;border-radius:50%;background:${isOnline?'var(--success)':'var(--border)'};border:2px solid var(--bg-card)"></div>
          </div>
          <div style="flex:1;min-width:0">
            <div style="font-weight:600;font-size:13px">${u.name}</div>
            <div style="font-size:11px;color:var(--text-muted)">${u.role} · ${u.department||'N/A'}</div>
          </div>
        </div>`;
    }).join('');
  } catch(err) {
    const list = document.getElementById('users-list');
    if (list) list.innerHTML = `<div style="color:var(--danger);padding:12px;font-size:13px">Error loading users</div>`;
  }
}

async function loadChatGroups() {
  try {
    const data = await apiGet('/chat/groups');
    const list = document.getElementById('groups-list');
    if (!list) return;

    if (!data.courses?.length) {
      list.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:13px">Koi group nahi hai</div>`;
      return;
    }

    list.innerHTML = data.courses.map(c => `
      <div onclick="openGroupChat('${c._id}','${c.name}')"
        style="display:flex;gap:10px;padding:10px;border-radius:10px;cursor:pointer;margin-bottom:4px;transition:all var(--transition)"
        onmouseover="this.style.background='var(--accent-soft)'"
        onmouseout="this.style.background='transparent'">
        <div style="width:38px;height:38px;border-radius:10px;background:var(--accent-soft);display:flex;align-items:center;justify-content:center;color:var(--accent)">
          <i class="fa-solid fa-users" style="font-size:14px"></i>
        </div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:600;font-size:13px">${c.name}</div>
          <div style="font-size:11px;color:var(--text-muted)">${c.code} · Group</div>
        </div>
      </div>`).join('');
  } catch(err) {}
}

function openPrivateChat(userId, userName, userRole) {
  currentChatUser = { id: userId, name: userName, type: 'private' };

  // Active highlight
  document.querySelectorAll('[id^="user-item-"]').forEach(el => el.style.background = 'transparent');
  const item = document.getElementById(`user-item-${userId}`);
  if (item) item.style.background = 'var(--accent-soft)';

  const onlineUsers = window._onlineUsers || [];
  const isOnline    = onlineUsers.includes(userId);
  const initials    = userName.split(' ').map(n=>n[0]).join('').toUpperCase();
  const msgs        = chatMessages[userId] || [];

  const chatWindow = document.getElementById('chat-window');
  if (!chatWindow) return;

  chatWindow.innerHTML = `
    <div style="padding:14px 16px;border-bottom:1px solid var(--border);display:flex;gap:10px;align-items:center">
      <div style="position:relative">
        <div class="user-avatar" style="width:38px;height:38px;font-size:13px">${initials}</div>
        <div style="position:absolute;bottom:0;right:0;width:10px;height:10px;border-radius:50%;background:${isOnline?'var(--success)':'var(--border)'};border:2px solid var(--bg-card)"></div>
      </div>
      <div>
        <div style="font-weight:700;font-size:14px">${userName}</div>
        <div style="font-size:11px" data-online-id="${userId}">${isOnline?'● Online':'○ Offline'}</div>
      </div>
    </div>
    <div id="chat-messages-area" style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column">
      ${msgs.length === 0
        ? `<div style="text-align:center;color:var(--text-muted);font-size:13px;margin:auto">Conversation shuru karo!</div>`
        : msgs.map(m => `
          <div style="display:flex;flex-direction:${m.isMe?'row-reverse':'row'};gap:8px;margin-bottom:12px">
            <div>
              ${!m.isMe?`<div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">${m.senderName}</div>`:''}
              <div style="background:${m.isMe?'var(--accent)':'var(--bg-input)'};color:${m.isMe?'white':'var(--text-primary)'};padding:10px 14px;border-radius:14px;font-size:13px;max-width:280px;word-wrap:break-word">${m.message}</div>
            </div>
          </div>`).join('')}
    </div>
    <div style="padding:12px;border-top:1px solid var(--border);display:flex;gap:8px">
      <input id="private-msg-input" placeholder="Message likho..." style="border-radius:10px;flex:1"
        onkeydown="if(event.key==='Enter')sendPrivateMessage('${userId}','${userName}')">
      <button class="btn btn-accent" onclick="sendPrivateMessage('${userId}','${userName}')" style="border-radius:10px;padding:10px 16px">
        <i class="fa-solid fa-paper-plane"></i>
      </button>
    </div>`;

  const area = document.getElementById('chat-messages-area');
  if (area) area.scrollTop = area.scrollHeight;
}

function openGroupChat(courseId, courseName) {
  const groupKey    = `group_${courseId}`;
  currentChatUser   = { id: groupKey, name: courseName, type: 'group', courseId };

  // Socket room join karo
  if (socket) socket.emit('join_group', courseId);

  const msgs = chatMessages[groupKey] || [];
  const user = getUser();

  const chatWindow = document.getElementById('group-chat-window');
  if (!chatWindow) return;

  chatWindow.innerHTML = `
    <div style="padding:14px 16px;border-bottom:1px solid var(--border);display:flex;gap:10px;align-items:center">
      <div style="width:38px;height:38px;border-radius:10px;background:var(--accent-soft);display:flex;align-items:center;justify-content:center;color:var(--accent)">
        <i class="fa-solid fa-users" style="font-size:16px"></i>
      </div>
      <div>
        <div style="font-weight:700;font-size:14px">${courseName}</div>
        <div style="font-size:11px;color:var(--success)">● Group Chat</div>
      </div>
    </div>
    <div id="chat-messages-area" style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column">
      ${msgs.length === 0
        ? `<div style="text-align:center;color:var(--text-muted);font-size:13px;margin:auto">Group chat shuru karo!</div>`
        : msgs.map(m => `
          <div style="display:flex;flex-direction:${m.isMe?'row-reverse':'row'};gap:8px;margin-bottom:12px">
            <div>
              ${!m.isMe?`<div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">${m.senderName}</div>`:''}
              <div style="background:${m.isMe?'var(--accent)':'var(--bg-input)'};color:${m.isMe?'white':'var(--text-primary)'};padding:10px 14px;border-radius:14px;font-size:13px;max-width:280px">${m.message}</div>
            </div>
          </div>`).join('')}
    </div>
    <div style="padding:12px;border-top:1px solid var(--border);display:flex;gap:8px">
      <input id="group-msg-input" placeholder="Group message..." style="border-radius:10px;flex:1"
        onkeydown="if(event.key==='Enter')sendGroupMessage('${courseId}','${courseName}')">
      <button class="btn btn-accent" onclick="sendGroupMessage('${courseId}','${courseName}')" style="border-radius:10px;padding:10px 16px">
        <i class="fa-solid fa-paper-plane"></i>
      </button>
    </div>`;

  const area = document.getElementById('chat-messages-area');
  if (area) area.scrollTop = area.scrollHeight;
}

function sendPrivateMessage(receiverId, receiverName) {
  const input = document.getElementById('private-msg-input');
  const msg   = input?.value?.trim();
  if (!msg) return;

  const user = getUser();
  if (!socket) { showToast('Socket connected nahi hai!', 'danger'); return; }

  const data = {
    senderId:     user.id,
    senderName:   user.name,
    receiverId,
    receiverName,
    message:      msg,
    timestamp:    new Date().toISOString()
  };

  socket.emit('private_message', data);

  // Apna message turant dikhao
  appendMessage(msg, true, user.name);

  // History mein save karo
  if (!chatMessages[receiverId]) chatMessages[receiverId] = [];
  chatMessages[receiverId].push({ ...data, isMe: true });

  input.value = '';
}

function sendGroupMessage(courseId, courseName) {
  const input = document.getElementById('group-msg-input');
  const msg   = input?.value?.trim();
  if (!msg) return;

  const user = getUser();
  if (!socket) { showToast('Socket connected nahi hai!', 'danger'); return; }

  const data = {
    courseId,
    senderId:   user.id,
    senderName: user.name,
    message:    msg,
    timestamp:  new Date().toISOString()
  };

  socket.emit('group_message', data);

  // Apna message turant dikhao
  appendMessage(msg, true, user.name);

  const key = `group_${courseId}`;
  if (!chatMessages[key]) chatMessages[key] = [];
  chatMessages[key].push({ ...data, isMe: true });

  input.value = '';
}

function switchChatTab(btn, tabId) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  document.getElementById(tabId)?.classList.add('active');
}

function renderCampusMap(area) {
  area.innerHTML = `
    <div class="page-header"><h1>Campus Map</h1></div>
    <div class="card">
      <div class="map-placeholder" style="height:360px">
        <div style="font-size:64px">🏛️</div>
        <div style="font-weight:600;font-size:16px">Interactive Campus Map</div>
        <div style="font-size:13px;max-width:280px;line-height:1.6;color:var(--text-secondary)">Google Maps API integration for building locations and navigation</div>
        <button class="btn btn-accent" onclick="showToast('Maps API key required','warning')">Enable Navigation</button>
      </div>
    </div>`;
}

function renderPlacement(area) {
  const jobs=[
    {company:'Google',role:'Software Engineer Intern',type:'Internship',salary:'₹80K/mo',skills:['Python','ML'],logo:'🟦'},
    {company:'Microsoft',role:'Cloud Engineer',type:'Full-time',salary:'₹12 LPA',skills:['Azure','DevOps'],logo:'🟩'},
    {company:'Infosys',role:'Systems Engineer',type:'Full-time',salary:'₹6.5 LPA',skills:['Java','SQL'],logo:'🟧'},
  ];
  area.innerHTML = `
    <div class="page-header"><h1>Placement Portal</h1></div>
    <div class="grid grid-3" style="margin-bottom:20px">
      <div class="stat-card" style="--stat-color:var(--success)"><div class="stat-label">Active Listings</div><div class="stat-value">47</div></div>
      <div class="stat-card" style="--stat-color:var(--accent)"><div class="stat-label">Applied</div><div class="stat-value">3</div></div>
      <div class="stat-card" style="--stat-color:var(--purple)"><div class="stat-label">Interviews</div><div class="stat-value">1</div></div>
    </div>
    ${jobs.map(j=>`
      <div class="job-card">
        <div class="job-header">
          <div class="company-logo">${j.logo}</div>
          <div style="flex:1"><div class="job-title">${j.role}</div><div class="job-company">${j.company} · ${j.salary}</div></div>
          <div style="text-align:right">
            <span class="badge badge-${j.type==='Internship'?'purple':'accent'}">${j.type}</span>
            <div style="margin-top:8px"><button class="btn btn-accent btn-sm" onclick="showToast('Applied!','success')">Apply</button></div>
          </div>
        </div>
        <div class="job-tags">${j.skills.map(s=>`<span class="badge badge-accent">${s}</span>`).join('')}</div>
      </div>`).join('')}`;
}

// ═══════════ FACULTY PAGES ═══════════

async function renderFacultyDashboard(area) {
  const user = getUser();
  area.innerHTML = `
    <div class="page-header"><h1>Welcome, ${user.name}!</h1><p>${user.department||'KD Campus'} · Faculty</p></div>
    <div class="grid grid-4" style="margin-bottom:20px">
      <div class="stat-card" style="--stat-color:var(--accent)"><div class="stat-label">MY STUDENTS</div><div class="stat-value" id="fac-students">--</div></div>
      <div class="stat-card" style="--stat-color:var(--success)"><div class="stat-label">ASSIGNMENTS</div><div class="stat-value" id="fac-asgn">--</div></div>
      <div class="stat-card" style="--stat-color:var(--warning)"><div class="stat-label">PENDING REVIEWS</div><div class="stat-value">0</div></div>
      <div class="stat-card" style="--stat-color:var(--purple)"><div class="stat-label">COURSES</div><div class="stat-value">0</div></div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">Quick Actions</div></div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
        ${[
          {icon:'<i class="fa-solid fa-clipboard-check"></i>',label:'Mark Attendance',action:'mark-attendance'},
          {icon:'<i class="fa-solid fa-upload"></i>',label:'Upload Marks',action:'upload-marks'},
          {icon:'<i class="fa-solid fa-folder-open"></i>',label:'Upload Notes',action:'upload-notes'},
          {icon:'<i class="fa-solid fa-file-pen"></i>',label:'New Assignment',action:'assignments'},
          {icon:'<i class="fa-solid fa-comments"></i>',label:'Chat',action:'chat'},
          {icon:'<i class="fa-solid fa-bullhorn"></i>',label:'Announcement',action:'announcements'},
        ].map(q=>`
          <div onclick="navigateTo('${q.action}')" style="padding:14px;border:1px solid var(--border);border-radius:10px;cursor:pointer;text-align:center;transition:all var(--transition)"
            onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border)'">
            <div style="font-size:20px;margin-bottom:4px;color:var(--accent)">${q.icon}</div>
            <div style="font-size:12px;font-weight:600;color:var(--text-secondary)">${q.label}</div>
          </div>`).join('')}
      </div>
    </div>`;

  try {
    const students = await apiGet('/students');
    const el = document.getElementById('fac-students');
    if(el) el.textContent = students.students?.length||0;
    const asgns = await apiGet('/assignments');
    const el2 = document.getElementById('fac-asgn');
    if(el2) el2.textContent = asgns.assignments?.length||0;
  } catch(e){}
}

async function renderStudentList(area) {
  area.innerHTML = `
    <div class="page-header"><h1>Students</h1></div>
    <div class="card" id="fac-students-container"><div style="text-align:center;padding:32px;color:var(--text-muted)">Loading...</div></div>`;

  try {
    const data = await apiGet('/students');
    const container = document.getElementById('fac-students-container');
    if (!data.students?.length) { container.innerHTML=`<div style="text-align:center;padding:32px;color:var(--text-muted)">Koi student nahi</div>`; return; }
    container.innerHTML = `
      <div class="table-wrap"><table>
        <thead><tr><th>Student</th><th>Email</th><th>Department</th><th>Actions</th></tr></thead>
        <tbody>
          ${data.students.map(s=>`
            <tr>
              <td><div style="display:flex;align-items:center;gap:8px">
                <div class="user-avatar" style="width:32px;height:32px;font-size:11px">${s.name.split(' ').map(n=>n[0]).join('').toUpperCase()}</div>  
              <span style="font-weight:600;color:var(--text-primary)">${s.name}</span>
              </div></td>
              <td>${s.email}</td>
              <td>${s.department||'N/A'}</td>
              <td><button class="btn btn-ghost btn-sm" onclick="showStudentProfile('${s._id}','${s.name}','${s.email}','${s.department||'N/A'}')">Profile</button>
            </tr>`).join('')}
        </tbody>
      </table></div>`;
  } catch(err) { document.getElementById('fac-students-container').innerHTML=`<div style="color:var(--danger);padding:20px">Error</div>`; }
}

async function renderMarkAttendance(area) {
  area.innerHTML = `
    <div class="page-header"><h1>Mark Attendance</h1><p>Today, ${new Date().toLocaleDateString('en-IN')}</p></div>
    <div class="card" style="margin-bottom:16px">
      <div style="display:flex;gap:12px;flex-wrap:wrap">
        <select style="width:auto" id="att-course-select" onchange="loadStudentsForAttendance()">
          <option value="">Select Course</option>
        </select>
        <input type="date" style="width:auto" id="att-date" value="${new Date().toISOString().split('T')[0]}">
        <div style="display:flex;gap:8px;margin-left:auto">
          <button class="btn btn-success btn-sm" onclick="markAllAttendance('present')">✅ All Present</button>
          <button class="btn btn-danger btn-sm" onclick="markAllAttendance('absent')">❌ All Absent</button>
        </div>
      </div>
    </div>
    <div class="card" id="att-students-list">
      <div style="text-align:center;padding:32px;color:var(--text-muted)">
        <i class="fa-solid fa-clipboard-check" style="font-size:40px;margin-bottom:12px;color:var(--accent)"></i>
        <div>Pehle course select karo</div>
      </div>
    </div>
    <button class="btn btn-accent" style="width:100%;margin-top:16px" onclick="saveAttendance()">
      <i class="fa-solid fa-floppy-disk"></i> Save Attendance
    </button>`;

  // Courses load karo dropdown mein
  try {
    const data = await apiGet('/courses');
    const select = document.getElementById('att-course-select');
    if (data.courses?.length > 0) {
      data.courses.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c._id;
        opt.textContent = `${c.name} (${c.code})`;
        select.appendChild(opt);
      });
    } else {
      showToast('Pehle Admin se courses add karwao', 'warning');
    }
  } catch(e) { showToast('Courses load error', 'danger'); }
}

async function loadStudentsForAttendance() {
  const courseId = document.getElementById('att-course-select')?.value;
  if (!courseId) return;

  const list = document.getElementById('att-students-list');
  list.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-muted)">Loading students...</div>`;

  try {
    const data = await apiGet('/students');
    const students = data.students || [];

    if (!students.length) {
      list.innerHTML = `<div style="text-align:center;padding:32px;color:var(--text-muted)">Koi student nahi hai</div>`;
      return;
    }

    window._attStudents = students;
    window._attStatus   = {};

    list.innerHTML = students.map((s, i) => `
      <div style="display:flex;align-items:center;gap:14px;padding:12px 0;border-bottom:1px solid var(--border)" id="att-row-${s._id}">
        <div class="user-avatar" style="width:36px;height:36px;font-size:12px">
          ${s.name.split(' ').map(n=>n[0]).join('').toUpperCase()}
        </div>
        <div style="flex:1">
          <div style="font-weight:600;font-size:13.5px">${s.name}</div>
          <div style="font-size:12px;color:var(--text-muted)">${s.email}</div>
        </div>
        <div style="display:flex;gap:8px">
          <button id="btn-present-${s._id}" class="btn btn-ghost btn-sm"
            onclick="setStudentAttendance('${s._id}','present')">
            <i class="fa-solid fa-check"></i> Present
          </button>
          <button id="btn-absent-${s._id}" class="btn btn-ghost btn-sm"
            onclick="setStudentAttendance('${s._id}','absent')">
            <i class="fa-solid fa-xmark"></i> Absent
          </button>
          <button id="btn-late-${s._id}" class="btn btn-ghost btn-sm"
            onclick="setStudentAttendance('${s._id}','late')">
            <i class="fa-solid fa-clock"></i> Late
          </button>
        </div>
      </div>`).join('');

  } catch(e) { list.innerHTML = `<div style="color:var(--danger);padding:20px">Error loading students</div>`; }
}

function setStudentAttendance(studentId, status) {
  window._attStatus = window._attStatus || {};
  window._attStatus[studentId] = status;

  const btns = ['present','absent','late'];
  btns.forEach(s => {
    const btn = document.getElementById(`btn-${s}-${studentId}`);
    if (btn) btn.className = 'btn btn-ghost btn-sm';
  });

  const activeBtn = document.getElementById(`btn-${status}-${studentId}`);
  if (activeBtn) {
    activeBtn.className = `btn btn-sm ${status==='present'?'btn-success':status==='absent'?'btn-danger':'btn-ghost'}`;
    if (status==='late') { activeBtn.style.borderColor='var(--warning)'; activeBtn.style.color='var(--warning)'; }
  }
}

function markAllAttendance(status) {
  const students = window._attStudents || [];
  students.forEach(s => setStudentAttendance(s._id, status));
  showToast(`All students ${status} mark ho gaye!`, 'success');
}

async function saveAttendance() {
  const courseId = document.getElementById('att-course-select')?.value;
  const date     = document.getElementById('att-date')?.value;
  const students = window._attStudents || [];
  const user     = getUser(); // ← yeh add karo

  if (!courseId) { showToast('Course select karo pehle', 'warning'); return; }
  if (!students.length) { showToast('Students nahi hain', 'warning'); return; }

  const records = students.map(s => ({
    studentId: s._id,
    status: window._attStatus?.[s._id] || 'absent'
  }));

  try {
    const data = await apiPost('/attendance', {
      courseId,
      date,
      records,
      facultyId: user.id  // ← yeh add karo
    });
    if (data.success) {
      showToast('Attendance save ho gayi!', 'success');
    } else {
      showToast(data.message || 'Error', 'danger');
    }
  } catch(e) { showToast('Server error', 'danger'); }
}

async function renderFacultyAssignments(area) {
  area.innerHTML = `
    <div class="page-header"><h1>Assignments</h1></div>
    <div class="card" style="margin-bottom:20px">
      <div class="card-title" style="margin-bottom:16px">Create New Assignment</div>
      <div class="form-group"><label>Title</label><input id="new-asgn-title" placeholder="Assignment title..."></div>
      <div class="form-group"><label>Description</label><textarea id="new-asgn-desc" rows="3" placeholder="Describe..."></textarea></div>
      <div style="display:flex;gap:12px">
        <div class="form-group" style="flex:1"><label>Due Date</label><input type="date" id="new-asgn-due"></div>
        <div class="form-group" style="flex:1"><label>Max Marks</label><input type="number" id="new-asgn-marks" placeholder="50"></div>
      </div>
      <button class="btn btn-accent" style="width:100%;margin-top:8px" onclick="createAssignment()">Publish Assignment</button>
    </div>
    <div class="card" id="fac-asgn-list"><div style="text-align:center;padding:20px;color:var(--text-muted)">Loading...</div></div>`;

  try {
    const data = await apiGet('/assignments');
    const list = document.getElementById('fac-asgn-list');
    if (!data.assignments?.length) { list.innerHTML=`<div style="text-align:center;padding:20px;color:var(--text-muted)">Koi assignment nahi</div>`; return; }
    list.innerHTML = data.assignments.map(a=>{
      const due=new Date(a.dueDate).toLocaleDateString('en-IN');
      return `<div style="padding:14px;background:var(--bg-input);border-radius:10px;margin-bottom:8px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div>
            <div style="font-weight:600;font-size:13.5px">${a.title}</div>
            <div style="font-size:12px;color:var(--text-muted)">Due: ${due} · Max: ${a.maxMarks} marks</div>
          </div>
          <span class="badge badge-${new Date(a.dueDate)>new Date()?'warning':'success'}">${new Date(a.dueDate)>new Date()?'Active':'Closed'}</span>
        </div>
        <div style="font-size:12px;color:var(--text-muted);margin-top:6px">${a.submissions?.length||0} submissions</div>
      </div>`;
    }).join('');
  } catch(e){}
}

async function createAssignment() {
  const title   = document.getElementById('new-asgn-title')?.value?.trim();
  const dueDate = document.getElementById('new-asgn-due')?.value;
  const maxMarks= document.getElementById('new-asgn-marks')?.value||50;
  const desc    = document.getElementById('new-asgn-desc')?.value?.trim();
  if (!title||!dueDate) { showToast('Title aur due date bharo','warning'); return; }
  try {
    const data = await apiPost('/assignments',{title,description:desc,dueDate,maxMarks:Number(maxMarks)});
    if(data.success) { showToast('Assignment published!','success'); renderFacultyAssignments(document.getElementById('content-area')); }
    else showToast(data.message||'Error','danger');
  } catch(e) { showToast('Server error','danger'); }
}

function renderUploadNotes(area) {
  area.innerHTML = `
    <div class="page-header"><h1>Upload Notes</h1></div>
    <div class="card">
      <div class="form-group"><label>Title</label><input placeholder="e.g., Unit 5 - Neural Networks"></div>
      <div class="form-group"><label>Description</label><textarea rows="3" placeholder="Brief description..."></textarea></div>
      <div class="upload-zone" onclick="showToast('File picker','accent')">
        <div class="upload-icon">📁</div>
        <div style="font-weight:600;margin-bottom:4px">Upload Files</div>
        <div style="font-size:12px">PDF, PPT, DOCX up to 500MB</div>
      </div>
      <button class="btn btn-accent" style="margin-top:16px;width:100%" onclick="showToast('Notes uploaded!','success')">Upload Material</button>
    </div>`;
}

async function renderUploadMarks(area) {
  area.innerHTML = `
    <div class="page-header"><h1>Upload Marks</h1><p>Student marks enter karo aur publish karo</p></div>

    <!-- Filters -->
    <div class="card" style="margin-bottom:16px">
      <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
        <select id="marks-course-select" style="width:auto;min-width:200px" onchange="loadStudentsForMarks()">
          <option value="">Select Course</option>
        </select>
        <select id="marks-exam-type" style="width:auto">
          <option value="internal">Internal (50)</option>
          <option value="midterm">Mid-Term (50)</option>
          <option value="external">External (100)</option>
          <option value="assignment">Assignment (25)</option>
        </select>
        <button class="btn btn-accent" onclick="publishAllMarks()">
          <i class="fa-solid fa-bullhorn"></i> Publish All Marks
        </button>
        <button class="btn btn-ghost" onclick="showToast('Draft saved','success')">
          <i class="fa-solid fa-floppy-disk"></i> Save Draft
        </button>
      </div>
    </div>

    <!-- Students Marks Table -->
    <div class="card" id="marks-students-container">
      <div style="text-align:center;padding:40px;color:var(--text-muted)">
        <i class="fa-solid fa-chart-bar" style="font-size:40px;margin-bottom:12px;opacity:.3"></i>
        <div>Pehle course select karo</div>
      </div>
    </div>`;

  // Courses load karo
  try {
    const data   = await apiGet('/courses');
    const select = document.getElementById('marks-course-select');
    if (data.courses?.length > 0) {
      data.courses.forEach(c => {
        const opt = document.createElement('option');
        opt.value       = c._id;
        opt.textContent = `${c.name} (${c.code})`;
        select.appendChild(opt);
      });
    } else {
      showToast('Pehle Admin se courses add karwao', 'warning');
    }
  } catch(e) { showToast('Courses load error', 'danger'); }
}

async function loadStudentsForMarks() {
  const courseId = document.getElementById('marks-course-select')?.value;
  if (!courseId) return;

  const container = document.getElementById('marks-students-container');
  container.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-muted)">Loading students...</div>`;

  try {
    const data     = await apiGet('/students');
    const students = data.students || [];

    if (!students.length) {
      container.innerHTML = `<div style="text-align:center;padding:32px;color:var(--text-muted)">Koi student nahi hai</div>`;
      return;
    }

    window._marksStudents = students;

    container.innerHTML = `
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Email</th>
              <th>Marks</th>
              <th>Max Marks</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody id="marks-tbody">
            ${students.map(s => `
              <tr id="marks-row-${s._id}">
                <td>
                  <div style="display:flex;align-items:center;gap:8px">
                    <div class="user-avatar" style="width:32px;height:32px;font-size:11px">
                      ${s.name.split(' ').map(n=>n[0]).join('').toUpperCase()}
                    </div>
                    <span style="font-weight:600;color:var(--text-primary)">${s.name}</span>
                  </div>
                </td>
                <td style="font-size:12px;color:var(--text-muted)">${s.email}</td>
                <td>
                  <input type="number" id="marks-${s._id}"
                    min="0" max="100" placeholder="0"
                    style="width:80px;padding:6px;text-align:center"
                    oninput="updateGrade('${s._id}')">
                </td>
                <td>
                  <select id="max-${s._id}" style="width:80px;padding:6px" onchange="updateGrade('${s._id}')">
                    <option value="25">25</option>
                    <option value="50" selected>50</option>
                    <option value="100">100</option>
                  </select>
                </td>
                <td>
                  <div style="display:flex;align-items:center;gap:8px">
                    <span id="grade-${s._id}" class="badge badge-accent">--</span>
                    <button class="btn btn-accent btn-sm" onclick="saveSingleMark('${s._id}','${s.name}')">
                      <i class="fa-solid fa-check"></i> Save
                    </button>
                  </div>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;

  } catch(e) {
    container.innerHTML = `<div style="color:var(--danger);padding:20px">Error loading students</div>`;
  }
}

function updateGrade(studentId) {
  const marks    = parseInt(document.getElementById(`marks-${studentId}`)?.value) || 0;
  const maxMarks = parseInt(document.getElementById(`max-${studentId}`)?.value)   || 50;
  const pct      = maxMarks > 0 ? (marks / maxMarks) * 100 : 0;
  const grade    = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : pct >= 40 ? 'C' : 'F';
  const color    = pct >= 60 ? 'success' : pct >= 40 ? 'warning' : 'danger';

  const gradeEl = document.getElementById(`grade-${studentId}`);
  if (gradeEl) {
    gradeEl.textContent = grade;
    gradeEl.className   = `badge badge-${color}`;
  }
}

async function saveSingleMark(studentId, studentName) {
  const courseId  = document.getElementById('marks-course-select')?.value;
  const examType  = document.getElementById('marks-exam-type')?.value || 'internal';
  const marks     = parseInt(document.getElementById(`marks-${studentId}`)?.value);
  const maxMarks  = parseInt(document.getElementById(`max-${studentId}`)?.value) || 50;

  if (!courseId) { showToast('Course select karo', 'warning'); return; }
  if (isNaN(marks) || marks < 0) { showToast('Valid marks daalo', 'warning'); return; }
  if (marks > maxMarks) { showToast(`Marks ${maxMarks} se zyada nahi ho sakte`, 'warning'); return; }

  try {
    const data = await apiPost('/marks', {
      studentId,
      courseId,
      examType,
      marks,
      maxMarks,
      semester: 6
    });

    if (data.success) {
      showToast(`${studentName} ke marks save ho gaye!`, 'success');
      // Row highlight karo
      const row = document.getElementById(`marks-row-${studentId}`);
      if (row) {
        row.style.background = 'var(--success-soft)';
        setTimeout(() => row.style.background = '', 2000);
      }
    } else {
      showToast(data.message || 'Error', 'danger');
    }
  } catch(e) { showToast('Server error', 'danger'); }
}

async function publishAllMarks() {
  const courseId  = document.getElementById('marks-course-select')?.value;
  const examType  = document.getElementById('marks-exam-type')?.value || 'internal';
  const students  = window._marksStudents || [];

  if (!courseId) { showToast('Course select karo pehle', 'warning'); return; }
  if (!students.length) { showToast('Students load karo pehle', 'warning'); return; }

  let saved = 0, errors = 0;

  for (const s of students) {
    const marks    = parseInt(document.getElementById(`marks-${s._id}`)?.value);
    const maxMarks = parseInt(document.getElementById(`max-${s._id}`)?.value) || 50;

    if (isNaN(marks) || marks < 0) continue;

    try {
      const data = await apiPost('/marks', {
        studentId: s._id,
        courseId,
        examType,
        marks,
        maxMarks,
        semester: 6
      });
      if (data.success) saved++;
      else errors++;
    } catch(e) { errors++; }
  }

  if (saved > 0) showToast(`${saved} students ke marks publish ho gaye!`, 'success');
  if (errors > 0) showToast(`${errors} errors aaye`, 'danger');
}

function renderPerformance(area) {
  area.innerHTML = `
    <div class="page-header"><h1>Student Performance</h1></div>
    <div class="grid grid-3" style="margin-bottom:20px">
      <div class="stat-card" style="--stat-color:var(--success)"><div class="stat-label">CLASS AVG</div><div class="stat-value">74%</div></div>
      <div class="stat-card" style="--stat-color:var(--accent)"><div class="stat-label">PASS RATE</div><div class="stat-value">92%</div></div>
      <div class="stat-card" style="--stat-color:var(--danger)"><div class="stat-label">AT RISK</div><div class="stat-value">2</div></div>
    </div>
    <div class="card">
      <div class="card-title" style="margin-bottom:16px">Grade Distribution</div>
      ${[{grade:'A+ (90-100)',count:8,pct:13,color:'var(--success)'},{grade:'A (80-89)',count:18,pct:30,color:'var(--accent)'},{grade:'B+ (70-79)',count:20,pct:33,color:'var(--purple)'},{grade:'B (60-69)',count:10,pct:17,color:'var(--warning)'},{grade:'C & Below',count:4,pct:7,color:'var(--danger)'}].map(g=>`
        <div class="marks-bar-row">
          <div class="marks-subject">${g.grade}</div>
          <div class="marks-bar-wrap"><div class="marks-bar-fill" style="width:${g.pct}%;background:${g.color}"></div></div>
          <div class="marks-val" style="width:50px;color:${g.color}">${g.count}</div>
        </div>`).join('')}
    </div>`;
}

async function renderFacultyCourses(area) {
  area.innerHTML = `
    <div class="page-header"><h1>My Courses</h1></div>
    <div id="fac-courses-grid" class="grid grid-2">
      <div style="text-align:center;padding:40px;color:var(--text-muted);grid-column:1/-1">Loading...</div>
    </div>`;

  try {
    const data = await apiGet('/courses');
    const grid = document.getElementById('fac-courses-grid');
    if (!data.courses?.length) {
      grid.innerHTML = `
        <div style="text-align:center;padding:40px;color:var(--text-muted);grid-column:1/-1">
          <i class="fa-solid fa-book" style="font-size:40px;margin-bottom:12px;color:var(--text-muted)"></i>
          <div style="font-weight:600">Koi course assign nahi hai</div>
          <div style="font-size:13px;margin-top:8px">Admin se course assign karwao</div>
        </div>`;
      return;
    }
    const colors = ['#4f6ef7','#22d3a0','#a78bfa','#f7b955','#f75f6e'];
    grid.innerHTML = data.courses.map((c, i) => `
      <div class="course-card">
        <div class="course-thumb" style="background:${colors[i%colors.length]}18;font-size:40px">
          <i class="fa-solid fa-book" style="color:${colors[i%colors.length]}"></i>
        </div>
        <div class="course-body">
          <div class="course-name" style="font-size:16px">${c.name}</div>
          <div class="course-meta">${c.code} · ${c.department || 'N/A'} · ${c.students?.length || 0} Students</div>
          <div style="margin-top:12px">
            <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px">
              <span style="color:var(--text-muted)">Credits</span>
              <span style="font-weight:600">${c.credits || 4}</span>
            </div>
          </div>
          <div class="course-footer">
            <button class="btn btn-ghost btn-sm" onclick="navigateTo('students')">View Students</button>
            <button class="btn btn-accent btn-sm" onclick="navigateTo('upload-notes')">Upload Notes</button>
          </div>
        </div>
      </div>`).join('');
  } catch(e) {
    document.getElementById('fac-courses-grid').innerHTML =
      `<div style="color:var(--danger);padding:20px">Error loading courses</div>`;
  }
}

function renderAnnouncements(area) {
  area.innerHTML = `
    <div class="page-header"><h1>Announcements</h1></div>
    <div class="card">
      <div class="form-group"><label>Title</label><input placeholder="Announcement title..."></div>
      <div class="form-group"><label>Message</label><textarea rows="5" placeholder="Type your announcement..."></textarea></div>
      <div style="display:flex;gap:12px">
        <button class="btn btn-accent" onclick="showToast('Announcement posted!','success')">📢 Post</button>
        <button class="btn btn-ghost" onclick="showToast('Email sent!','success')">📧 Email</button>
      </div>
    </div>`;
}

// ═══════════ ADMIN PAGES ═══════════

async function renderAdminDashboard(area) {
  area.innerHTML = `
    <div class="page-header"><h1>Admin Dashboard</h1></div>
    <div class="grid grid-4" style="margin-bottom:20px">
      <div class="stat-card" style="--stat-color:var(--accent)"><div class="stat-label">TOTAL STUDENTS</div><div class="stat-value" id="stat-students">--</div></div>
      <div class="stat-card" style="--stat-color:var(--success)"><div class="stat-label">FACULTY</div><div class="stat-value" id="stat-faculty">--</div></div>
      <div class="stat-card" style="--stat-color:var(--purple)"><div class="stat-label">ASSIGNMENTS</div><div class="stat-value" id="stat-asgn">--</div></div>
      <div class="stat-card" style="--stat-color:var(--warning)"><div class="stat-label">PENDING APPROVALS</div><div class="stat-value" id="stat-approvals">--</div></div>
    </div>
    <div class="grid grid-2">
      <div class="card">
        <div class="card-header"><div class="card-title">Pending Approvals</div><button class="btn btn-accent btn-sm" onclick="navigateTo('approvals')">Review All</button></div>
        <div id="admin-pending">Loading...</div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">Quick Actions</div></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          ${[{icon:'<i class="fa-solid fa-user-graduate"></i>', label:'Students',  action:'manage-students'},
{icon:'<i class="fa-solid fa-chalkboard-user"></i>',label:'Faculty',  action:'manage-faculty'},
{icon:'<i class="fa-solid fa-circle-check"></i>',   label:'Approvals',action:'approvals'},
{icon:'<i class="fa-solid fa-chart-line"></i>',     label:'Analytics',action:'analytics'}].map(q=>`
            <div onclick="navigateTo('${q.action}')" style="padding:14px;border:1px solid var(--border);border-radius:10px;cursor:pointer;text-align:center;transition:all var(--transition)" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border)'">
              <div style="font-size:22px;margin-bottom:4px">${q.icon}</div>
              <div style="font-size:12px;font-weight:600;color:var(--text-secondary)">${q.label}</div>
            </div>`).join('')}
        </div>
      </div>
    </div>`;

  try {
    const [students,faculty,asgns,pending] = await Promise.all([apiGet('/students'),apiGet('/faculty'),apiGet('/assignments'),apiGet('/faculty/pending')]);
    document.getElementById('stat-students').textContent  = students.students?.length||0;
    document.getElementById('stat-faculty').textContent   = faculty.faculty?.length||0;
    document.getElementById('stat-asgn').textContent      = asgns.assignments?.length||0;
    document.getElementById('stat-approvals').textContent = pending.pending?.length||0;
    const pendingDiv = document.getElementById('admin-pending');
    if (!pending.pending?.length) {
      pendingDiv.innerHTML=`<div style="text-align:center;padding:20px;color:var(--text-muted)">✅ Koi pending approval nahi</div>`;
    } else {
      pendingDiv.innerHTML = pending.pending.slice(0,5).map(u=>`
        <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
          <div class="user-avatar" style="width:36px;height:36px;font-size:12px">${u.name.split(' ').map(n=>n[0]).join('').toUpperCase()}</div>
          <div style="flex:1"><div style="font-weight:600;font-size:13px">${u.name}</div><div style="font-size:12px;color:var(--text-muted)">${u.role} · ${u.department||'N/A'}</div></div>
          <div style="display:flex;gap:6px">
            <button class="btn btn-success btn-sm" onclick="approveUser('${u._id}','${u.name}',true)">✓</button>
            <button class="btn btn-danger btn-sm" onclick="approveUser('${u._id}','${u.name}',false)">✗</button>
          </div>
        </div>`).join('');
    }
  } catch(e){ console.log('Admin dashboard error:',e); }
}

async function renderApprovals(area) {
  area.innerHTML = `
    <div class="page-header"><h1>Approvals</h1></div>
    <div class="card" id="approvals-list">
      <div style="text-align:center;padding:32px;color:var(--text-muted)"><div style="font-size:36px;margin-bottom:8px">⏳</div>Loading...</div>
    </div>`;

  try {
    const data = await apiGet('/faculty/pending');
    const list = document.getElementById('approvals-list');
    if (!data.pending?.length) {
      list.innerHTML=`<div style="text-align:center;padding:32px;color:var(--text-muted)"><div style="font-size:36px;margin-bottom:8px">✅</div>Koi pending approval nahi hai!</div>`;
      return;
    }
    list.innerHTML = data.pending.map(u=>`
      <div style="display:flex;align-items:center;gap:14px;padding:16px 0;border-bottom:1px solid var(--border)" id="approval-${u._id}">
        <div class="user-avatar">${u.name.split(' ').map(n=>n[0]).join('').toUpperCase()}</div>
        <div style="flex:1">
          <div style="font-weight:700;font-size:14px">${u.name}</div>
          <div style="font-size:12px;color:var(--text-muted)">${u.role} · ${u.department||'N/A'} · ${u.email}</div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-success" onclick="approveUser('${u._id}','${u.name}',true)">✓ Approve</button>
          <button class="btn btn-danger" onclick="approveUser('${u._id}','${u.name}',false)">✗ Reject</button>
        </div>
      </div>`).join('');
  } catch(err) {
    document.getElementById('approvals-list').innerHTML=`<div style="text-align:center;padding:32px;color:var(--danger)">❌ Server se connect nahi ho pa raha</div>`;
  }
}

async function approveUser(id, name, approve) {
  try {
    const token = localStorage.getItem('token');
    const res   = await fetch(`${API}/faculty/${id}/approve`,{method:'PUT',headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},body:JSON.stringify({isApproved:approve})});
    const data  = await res.json();
    if (data.success) {
      document.getElementById(`approval-${id}`)?.remove();
      showToast(`${name} ${approve?'approve':'reject'} kar diya!`,approve?'success':'danger');
      updateApprovalBadge();
      const list=document.getElementById('approvals-list');
      if(list&&!list.querySelector('[id^="approval-"]')) list.innerHTML=`<div style="text-align:center;padding:32px;color:var(--text-muted)"><div style="font-size:36px;margin-bottom:8px">✅</div>Sab approve ho gaye!</div>`;
    } else showToast(data.message||'Error','danger');
  } catch(err) { showToast('Server error!','danger'); }
}

async function renderManageFaculty(area) {
  area.innerHTML = `
    <div class="page-header"><h1>Manage Faculty</h1></div>
    <div class="card" id="faculty-container"><div style="text-align:center;padding:32px;color:var(--text-muted)">Loading...</div></div>`;

  try {
    const data = await apiGet('/faculty');
    const container = document.getElementById('faculty-container');
    if (!data.faculty?.length) { container.innerHTML=`<div style="text-align:center;padding:32px;color:var(--text-muted)">Koi faculty nahi</div>`; return; }
    container.innerHTML = `
      <div class="table-wrap"><table>
        <thead><tr><th>Faculty</th><th>Email</th><th>Department</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          ${data.faculty.map(f=>`
            <tr>
              <td><div style="display:flex;align-items:center;gap:8px">
                <div class="user-avatar" style="width:30px;height:30px;font-size:10px">${f.name.split(' ').map(n=>n[0]).join('').toUpperCase()}</div>
                <span style="font-weight:600;color:var(--text-primary)">${f.name}</span>
              </div></td>
              <td>${f.email}</td>
              <td>${f.department||'N/A'}</td>
              <td><span class="badge badge-success">Active</span></td>
              <td><button class="btn btn-danger btn-sm" onclick="showToast('Deactivated','danger')">🗑️</button></td>
            </tr>`).join('')}
        </tbody>
      </table></div>`;
  } catch(e){ document.getElementById('faculty-container').innerHTML=`<div style="color:var(--danger);padding:20px">Error</div>`; }
}

async function renderManageCourses(area) {
  area.innerHTML = `
    <div class="page-header"><h1>Manage Courses</h1></div>
    <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap">
      <div class="search-bar" style="flex:1"><span>🔍</span><input placeholder="Search courses..." id="course-search" oninput="filterCourses()"></div>
      <button class="btn btn-accent" onclick="showAddCourseForm()">+ Add Course</button>
    </div>

    <!-- Add Course Form (hidden by default) -->
    <div id="add-course-form" style="display:none;margin-bottom:20px">
      <div class="card">
        <div class="card-title" style="margin-bottom:16px">New Course Add Karo</div>
        <div class="grid grid-2">
          <div class="form-group"><label>Course Name</label><input id="c-name" placeholder="e.g. Machine Learning"></div>
          <div class="form-group"><label>Course Code</label><input id="c-code" placeholder="e.g. CS601"></div>
          <div class="form-group"><label>Department</label>
            <select id="c-dept">
              <option>Computer Science</option>
              <option>Electronics</option>
              <option>Mechanical</option>
              <option>Civil</option>
              <option>Management</option>
            </select>
          </div>
          <div class="form-group"><label>Credits</label>
            <select id="c-credits">
              <option value="1">1 Credit</option>
              <option value="2">2 Credits</option>
              <option value="3">3 Credits</option>
              <option value="4" selected>4 Credits</option>
            </select>
          </div>
          <div class="form-group"><label>Semester</label>
            <select id="c-sem">
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
              <option value="3">Semester 3</option>
              <option value="4">Semester 4</option>
              <option value="5">Semester 5</option>
              <option value="6" selected>Semester 6</option>
            </select>
          </div>
        </div>
        <div style="display:flex;gap:12px;margin-top:8px">
          <button class="btn btn-accent" onclick="addCourse()">+ Add Course</button>
          <button class="btn btn-ghost" onclick="document.getElementById('add-course-form').style.display='none'">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Courses Table -->
    <div class="card" id="courses-container">
      <div style="text-align:center;padding:32px;color:var(--text-muted)">Loading...</div>
    </div>`;

  loadCourses();
}

async function loadCourses() {
  try {
    const data = await apiGet('/courses');
    window._allCourses = data.courses || [];
    renderCoursesTable(data.courses || []);
  } catch(e) {
    document.getElementById('courses-container').innerHTML =
      `<div style="color:var(--danger);padding:20px">Error loading courses</div>`;
  }
}

function renderCoursesTable(courses) {
  const container = document.getElementById('courses-container');
  if (!courses.length) {
    container.innerHTML = `
      <div style="text-align:center;padding:40px;color:var(--text-muted)">
        <div style="font-size:48px;margin-bottom:12px">📚</div>
        <div style="font-weight:600">Koi course nahi hai</div>
        <div style="font-size:13px;margin-top:8px">+ Add Course button se naya course add karo</div>
      </div>`;
    return;
  }
  container.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Course Name</th>
            <th>Code</th>
            <th>Department</th>
            <th>Credits</th>
            <th>Semester</th>
            <th>Students</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${courses.map(c => `
            <tr>
              <td style="font-weight:600;color:var(--text-primary)">${c.name}</td>
              <td><span class="badge badge-accent" style="font-family:monospace">${c.code}</span></td>
              <td>${c.department || 'N/A'}</td>
              <td>${c.credits || 4}</td>
              <td>Sem ${c.semester || 'N/A'}</td>
              <td>${c.students?.length || 0}</td>
              <td>
                <div style="display:flex;gap:6px">
                  <button class="btn btn-ghost btn-sm" onclick="showToast('Edit coming soon','accent')">✏️</button>
                  <button class="btn btn-danger btn-sm" onclick="deleteCourse('${c._id}','${c.name}')">🗑️</button>
                </div>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

function filterCourses() {
  const q = document.getElementById('course-search')?.value?.toLowerCase();
  const filtered = (window._allCourses || []).filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.code.toLowerCase().includes(q) ||
    (c.department || '').toLowerCase().includes(q)
  );
  renderCoursesTable(filtered);
}

function showAddCourseForm() {
  const form = document.getElementById('add-course-form');
  if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

async function addCourse() {
  const name    = document.getElementById('c-name')?.value?.trim();
  const code    = document.getElementById('c-code')?.value?.trim();
  const dept    = document.getElementById('c-dept')?.value;
  const credits = document.getElementById('c-credits')?.value;
  const sem     = document.getElementById('c-sem')?.value;

  if (!name || !code) { showToast('Course name aur code bharo','warning'); return; }

  try {
    const data = await apiPost('/courses', {
      name, code,
      department: dept,
      credits: Number(credits),
      semester: Number(sem)
    });

    if (data.success) {
      showToast(`${name} course add ho gaya!`, 'success');
      document.getElementById('add-course-form').style.display = 'none';
      loadCourses();
    } else {
      showToast(data.message || 'Error aaya', 'danger');
    }
  } catch(e) { showToast('Server error', 'danger'); }
}

async function deleteCourse(id, name) {
  if (!confirm(`"${name}" course delete karna hai?`)) return;
  try {
    const token = localStorage.getItem('token');
    await fetch(`${API}/courses/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    showToast(`${name} delete ho gaya`, 'danger');
    loadCourses();
  } catch(e) { showToast('Error', 'danger'); }
}

function renderAnalytics(area) {
  area.innerHTML = `
    <div class="page-header"><h1>Analytics</h1></div>
    <div class="grid grid-4" style="margin-bottom:20px">
      <div class="stat-card" style="--stat-color:var(--success)"><div class="stat-label">AVG ATTENDANCE</div><div class="stat-value">79%</div></div>
      <div class="stat-card" style="--stat-color:var(--accent)"><div class="stat-label">AVG CGPA</div><div class="stat-value">7.8</div></div>
      <div class="stat-card" style="--stat-color:var(--purple)"><div class="stat-label">PLACEMENT RATE</div><div class="stat-value">84%</div></div>
      <div class="stat-card" style="--stat-color:var(--warning)"><div class="stat-label">FEE COLLECTION</div><div class="stat-value">91%</div></div>
    </div>`;
}

function renderFinance(area) {
  area.innerHTML = `
    <div class="page-header"><h1>Finance & Fees</h1></div>
    <div class="grid grid-4" style="margin-bottom:20px">
      <div class="stat-card" style="--stat-color:var(--success)"><div class="stat-label">COLLECTED</div><div class="stat-value">₹2.9Cr</div></div>
      <div class="stat-card" style="--stat-color:var(--danger)"><div class="stat-label">PENDING</div><div class="stat-value">₹28L</div></div>
      <div class="stat-card" style="--stat-color:var(--accent)"><div class="stat-label">STUDENTS</div><div class="stat-value">2847</div></div>
      <div class="stat-card" style="--stat-color:var(--warning)"><div class="stat-label">DEFAULTERS</div><div class="stat-value">47</div></div>
    </div>`;
}

function renderReports(area) {
  area.innerHTML = `
    <div class="page-header"><h1>Reports</h1></div>
    <div class="grid grid-2">
      ${[{icon:'📊',title:'Academic Performance',desc:'CGPA, marks, grade distribution'},{icon:'✅',title:'Attendance Report',desc:'Subject-wise summary'},{icon:'💰',title:'Fee Collection',desc:'Monthly collection data'},{icon:'👥',title:'Enrollment Report',desc:'Department-wise data'}].map(r=>`
        <div class="card" style="display:flex;gap:14px;align-items:center">
          <div style="font-size:32px">${r.icon}</div>
          <div style="flex:1"><div style="font-weight:700;font-size:14px">${r.title}</div><div style="font-size:12px;color:var(--text-muted);margin-top:4px">${r.desc}</div></div>
          <button class="btn btn-accent btn-sm" onclick="showToast('Generating...','success')">Generate</button>
        </div>`).join('')}
    </div>`;
}

function renderSettings(area) {
  area.innerHTML = `
    <div class="page-header"><h1>System Settings</h1></div>
    <div class="grid grid-2">
      <div class="card">
        <div class="card-title" style="margin-bottom:16px">University Information</div>
        <div class="form-group"><label>University Name</label><input value="KD Campus"></div>
        <div class="form-group"><label>Contact Email</label><input value="admin@kdcampus.edu" type="email"></div>
        <div class="form-group"><label>Phone</label><input value="+91 12345 67890" type="tel"></div>
        <button class="btn btn-accent" onclick="showToast('Settings saved!','success')">Save Changes</button>
      </div>
      <div class="card">
        <div class="card-title" style="margin-bottom:16px">API Configuration</div>
        <div class="form-group"><label>Razorpay Key</label><input type="password" placeholder="rzp_..."></div>
        <div class="form-group"><label>Google Maps API</label><input type="password" placeholder="AIza..."></div>
        <div class="form-group"><label>SMTP Server</label><input placeholder="smtp.gmail.com"></div>
        <button class="btn btn-accent" onclick="showToast('API keys saved!','success')">Save Keys</button>
      </div>
    </div>`;
}

// ═══════════ FEE PAYMENT ═══════════

function loadRazorpay(callback) {
  if(window.Razorpay){callback();return;}
  const script=document.createElement('script');
  script.src='https://checkout.razorpay.com/v1/checkout.js';
  script.onload=callback;document.head.appendChild(script);
}

function initiatePayment(amount, description) {
  const user=getUser();
  loadRazorpay(()=>{
    const options={
      key:'rzp_test_SdLvAaupiuyW9n',
      amount:amount*100,currency:'INR',name:'KD Campus',description:description,
      handler:function(response){handlePaymentSuccess(response,amount,description);},
      prefill:{name:user.name||'Student',email:user.email||''},
      theme:{color:'#4f6ef7'},
      modal:{ondismiss:()=>showToast('Payment cancelled','warning')}
    };
    const rzp=new window.Razorpay(options);
    rzp.on('payment.failed',(r)=>showToast('Payment failed: '+r.error.description,'danger'));
    rzp.open();
  });
}

function handlePaymentSuccess(response, amount, description) {
  const newPayment={id:response.razorpay_payment_id,desc:description,amount:amount,date:new Date().toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}),status:'paid'};
  const history=JSON.parse(localStorage.getItem('paymentHistory')||'[]');
  history.unshift(newPayment);localStorage.setItem('paymentHistory',JSON.stringify(history));
  showToast('✅ Payment successful! ID: '+response.razorpay_payment_id,'success');
  setTimeout(()=>navigateTo('fees'),1000);
}

async function renderFees(area) {
  const user=getUser();
  let feeData={fees:[],summary:{pending:0,paid:0}};
  try{feeData=await apiGet(`/fees/student/${user.id}`);}catch(e){}
  const savedPayments=JSON.parse(localStorage.getItem('paymentHistory')||'[]');
  const allPayments=[...savedPayments,...(feeData.fees||[])];
  const pendingAmount=feeData.summary?.pending||0;

  area.innerHTML=`
    <div class="page-header"><h1>Fee Payment</h1><p>UPI, Cards, Net Banking</p></div>
    <div class="fee-card" style="margin-bottom:20px">
      <div style="position:relative;z-index:1">
        <div style="font-size:13px;opacity:.8;margin-bottom:4px">Total Fee Due</div>
        <div style="font-size:36px;font-weight:800;font-family:'Syne',sans-serif;margin-bottom:8px">₹${pendingAmount>0?pendingAmount.toLocaleString('en-IN'):'0'}</div>
        <div style="font-size:13px;opacity:.7;margin-bottom:20px">${pendingAmount>0?'Fee pending hai':'Koi pending fee nahi hai'}</div>
        <div style="display:flex;gap:12px;flex-wrap:wrap">
          ${pendingAmount>0?`<button class="btn" style="background:white;color:var(--accent);font-weight:700;padding:12px 24px" onclick="initiatePayment(${pendingAmount},'Pending Fee')">💳 Pay Now</button>`:''}
          <button class="btn" style="background:rgba(255,255,255,.15);color:white;border:1px solid rgba(255,255,255,.3)" onclick="showEMIOptions()">📅 Pay in EMI</button>
        </div>
      </div>
    </div>
    <div class="card" style="margin-bottom:20px">
      <div class="card-title" style="margin-bottom:14px">Quick Pay Options</div>
      <div class="grid grid-3">
        ${[{label:'Tuition Fee',amount:45000,icon:'🎓'},{label:'Hostel Fee',amount:30000,icon:'🏠'},{label:'Exam Fee',amount:3000,icon:'📝'}].map(f=>`
          <div style="padding:16px;border:1px solid var(--border);border-radius:10px;text-align:center;transition:all var(--transition)" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border)'">
            <div style="font-size:24px;margin-bottom:8px">${f.icon}</div>
            <div style="font-weight:600;font-size:13px;margin-bottom:4px">${f.label}</div>
            <div style="font-size:15px;font-weight:800;color:var(--accent);margin-bottom:10px">₹${f.amount.toLocaleString('en-IN')}</div>
            <button class="btn btn-accent btn-sm" style="width:100%" onclick="initiatePayment(${f.amount},'${f.label}')">Pay Now</button>
          </div>`).join('')}
      </div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">Payment History</div></div>
      ${allPayments.length===0
        ?`<div style="text-align:center;padding:32px;color:var(--text-muted)">Koi payment history nahi hai</div>`
        :`<div class="table-wrap"><table>
            <thead><tr><th>Transaction ID</th><th>Description</th><th>Amount</th><th>Date</th><th>Status</th><th>Receipt</th></tr></thead>
            <tbody>
              ${allPayments.map(p=>`<tr>
                <td style="font-family:monospace;font-size:12px">${p.id||p._id||'N/A'}</td>
                <td style="color:var(--text-primary)">${p.desc||p.description}</td>
                <td style="font-weight:700">₹${Number(p.amount).toLocaleString('en-IN')}</td>
                <td>${p.date||(p.paidAt?new Date(p.paidAt).toLocaleDateString('en-IN'):'Pending')}</td>
                <td><span class="badge badge-${p.status==='paid'?'success':'warning'}">${p.status}</span></td>
                <td>${p.status==='paid'?`<button class="btn btn-ghost btn-sm" onclick='downloadFeeReceipt(${JSON.stringify({id:p.id||p._id,desc:p.desc||p.description,amount:p.amount,date:p.date||"N/A"})})'>⬇ PDF</button>`:'-'}</td>
              </tr>`).join('')}
            </tbody>
          </table></div>`}
    </div>
    <div id="emi-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:500;align-items:center;justify-content:center">
      <div style="background:var(--bg-card);border-radius:16px;padding:28px;max-width:420px;width:90%;border:1px solid var(--border)">
        <div style="font-family:'Syne',sans-serif;font-size:18px;font-weight:700;margin-bottom:16px">📅 EMI Options</div>
        ${[{months:2,emi:22500,interest:'0%'},{months:3,emi:15500,interest:'2%'},{months:6,emi:8000,interest:'4%'}].map(e=>`
          <div style="padding:14px;border:1px solid var(--border);border-radius:10px;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between">
            <div><div style="font-weight:700">${e.months} Months EMI</div><div style="font-size:12px;color:var(--text-muted)">Interest: ${e.interest}</div></div>
            <div style="text-align:right">
              <div style="font-weight:800;color:var(--accent)">₹${e.emi.toLocaleString('en-IN')}/mo</div>
              <button class="btn btn-accent btn-sm" style="margin-top:6px" onclick="initiatePayment(${e.emi},'EMI Payment');closeEMI()">Select</button>
            </div>
          </div>`).join('')}
        <button class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="closeEMI()">Cancel</button>
      </div>
    </div>`;
}

function showEMIOptions(){const m=document.getElementById('emi-modal');if(m)m.style.display='flex';}
function closeEMI(){const m=document.getElementById('emi-modal');if(m)m.style.display='none';}

// ═══════════ BUS TRACKER ═══════════

function renderBusTracker(area) {
  area.innerHTML=`
    <div class="page-header"><h1>Bus Tracker</h1><p>Leaflet.js — Free Map</p></div>
    <div class="grid grid-3" style="margin-bottom:20px">
      <div class="stat-card" style="--stat-color:var(--success)"><div class="stat-label">ROUTE 1</div><div class="stat-value">8 min</div><span class="badge badge-success">En Route</span></div>
      <div class="stat-card" style="--stat-color:var(--accent)"><div class="stat-label">ROUTE 3</div><div class="stat-value">22 min</div><span class="badge badge-accent">En Route</span></div>
      <div class="stat-card" style="--stat-color:var(--warning)"><div class="stat-label">ROUTE 7</div><div class="stat-value">Arrived</div><span class="badge badge-success">At Stop</span></div>
    </div>
    <div class="card" style="padding:0;overflow:hidden">
      <div style="padding:14px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between">
        <div><div class="card-title">🗺 Campus & Bus Stops Map</div><div style="font-size:12px;color:var(--text-muted)">Leaflet.js + OpenStreetMap</div></div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-ghost btn-sm" onclick="mapShowAll()">Show All</button>
          <button class="btn btn-accent btn-sm" onclick="mapGoToCollege()">📍 Campus</button>
        </div>
      </div>
      <div id="bus-map" style="height:400px;width:100%;z-index:1"></div>
    </div>`;
  loadLeaflet(()=>initBusMap());
}

function loadLeaflet(callback){
  if(window.L){callback();return;}
  const css=document.createElement('link');css.rel='stylesheet';css.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';document.head.appendChild(css);
  const script=document.createElement('script');script.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';script.onload=callback;document.head.appendChild(script);
}

function initBusMap(){
  const mapDiv=document.getElementById('bus-map');
  if(!mapDiv||mapDiv._leaflet_id)return;
  const COLLEGE_LAT=28.4089,COLLEGE_LNG=77.3178;
  const map=L.map('bus-map').setView([COLLEGE_LAT,COLLEGE_LNG],13);
  window._busMap=map;window._collegeLatLng=[COLLEGE_LAT,COLLEGE_LNG];
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap',maxZoom:19}).addTo(map);
  const busIcon=L.divIcon({html:'<div style="background:#4f6ef7;color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:16px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.3)">🚌</div>',className:'',iconSize:[32,32],iconAnchor:[16,16]});
  const collegeIcon=L.divIcon({html:'<div style="background:#22d3a0;color:white;border-radius:10px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:18px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.3)">🏫</div>',className:'',iconSize:[36,36],iconAnchor:[18,18]});
  const stopIcon=L.divIcon({html:'<div style="background:#f7b955;color:white;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:12px;border:2px solid white">🛑</div>',className:'',iconSize:[24,24],iconAnchor:[12,12]});
  L.marker([COLLEGE_LAT,COLLEGE_LNG],{icon:collegeIcon}).addTo(map).bindPopup('<b>🏫 KD Campus</b>').openPopup();
  [{name:'Faridabad City',lat:28.4301,lng:77.3150,route:'Route 1',eta:'8 min'},{name:'Sector 28',lat:28.3950,lng:77.3300,route:'Route 3',eta:'22 min'},{name:'NIT Gate',lat:28.3870,lng:77.3080,route:'Route 7',eta:'Arrived'}].forEach(s=>L.marker([s.lat,s.lng],{icon:stopIcon}).addTo(map).bindPopup(`<b>${s.name}</b><br>${s.route} · ${s.eta}`));
  L.polyline([[28.4301,77.3150],[28.4200,77.3050],[COLLEGE_LAT,COLLEGE_LNG]],{color:'#22d3a0',weight:4,opacity:.8,dashArray:'8,4'}).addTo(map);
  L.polyline([[28.3950,77.3300],[COLLEGE_LAT,COLLEGE_LNG]],{color:'#4f6ef7',weight:4,opacity:.8,dashArray:'8,4'}).addTo(map);
  L.polyline([[28.3870,77.3080],[COLLEGE_LAT,COLLEGE_LNG]],{color:'#f7b955',weight:4,opacity:.8,dashArray:'8,4'}).addTo(map);
  const bus1=L.marker([28.4180,77.3100],{icon:busIcon}).addTo(map).bindPopup('<b>🚌 Route 1</b><br>8 min away');
  animateBus(map,bus1,[28.4180,77.3100],[COLLEGE_LAT,COLLEGE_LNG],8000);
}

function animateBus(map,marker,from,to,duration){
  const startTime=Date.now();
  const tick=()=>{
    const elapsed=Date.now()-startTime,progress=Math.min(elapsed/duration,1);
    const ease=progress<.5?2*progress*progress:-1+(4-2*progress)*progress;
    marker.setLatLng([from[0]+(to[0]-from[0])*ease,from[1]+(to[1]-from[1])*ease]);
    if(progress<1)requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function mapGoToCollege(){if(window._busMap){window._busMap.setView(window._collegeLatLng,15);showToast('Campus pe zoom!','success');}}
function mapShowAll(){if(window._busMap){window._busMap.setView([28.4089,77.3178],13);showToast('All stops','accent');}}

// ═══════════ PDF GENERATION ═══════════

function loadJsPDF(callback){
  if(window.jspdf){callback();return;}
  const script=document.createElement('script');script.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';script.onload=callback;document.head.appendChild(script);
}

function downloadMarksheet(){
  const user=getUser();
  loadJsPDF(async()=>{
    const{jsPDF}=window.jspdf;const doc=new jsPDF();
    doc.setFillColor(79,110,247);doc.rect(0,0,210,40,'F');
    doc.setTextColor(255,255,255);doc.setFontSize(22);doc.setFont('helvetica','bold');doc.text('KD Campus',105,15,{align:'center'});
    doc.setFontSize(13);doc.setFont('helvetica','normal');doc.text('Official Grade Report',105,25,{align:'center'});
    doc.setFillColor(240,244,255);doc.rect(14,48,182,28,'F');
    doc.setTextColor(50,50,50);doc.setFontSize(11);doc.setFont('helvetica','bold');
    doc.text('Student Name:',20,58);doc.text('Department:',20,68);
    doc.setFont('helvetica','normal');doc.text(user.name||'N/A',70,58);doc.text(user.department||'N/A',70,68);
    try{
      const marksData=await apiGet(`/marks/student/${user.id}`);
      if(marksData.marks?.length>0){
        doc.setFillColor(79,110,247);doc.rect(14,85,182,10,'F');
        doc.setTextColor(255,255,255);doc.setFontSize(10);doc.setFont('helvetica','bold');
        doc.text('Subject',20,92);doc.text('Marks',110,92);doc.text('Max',140,92);doc.text('Grade',170,92);
        marksData.marks.forEach((m,i)=>{
          const y=104+i*12,pct=(m.marks/m.maxMarks)*100,grade=pct>=90?'A+':pct>=80?'A':pct>=70?'B+':pct>=60?'B':'C';
          if(i%2===0){doc.setFillColor(248,250,255);doc.rect(14,y-6,182,12,'F');}
          doc.setTextColor(30,30,30);doc.setFont('helvetica','normal');
          doc.text(m.courseId?.name||'N/A',20,y);doc.text(String(m.marks),115,y);doc.text(String(m.maxMarks),143,y);
          doc.setTextColor(15,110,86);doc.setFont('helvetica','bold');doc.text(grade,173,y);
        });
      }
    }catch(e){}
    doc.save(`Marksheet_${(user.name||'Student').replace(' ','_')}.pdf`);
    showToast('Marksheet PDF download ho rahi hai!','success');
  });
}

function downloadBonafide(){
  const user=getUser();
  loadJsPDF(()=>{
    const{jsPDF}=window.jspdf;const doc=new jsPDF();
    doc.setDrawColor(212,175,55);doc.setLineWidth(3);doc.rect(8,8,194,281,'S');
    doc.setTextColor(79,110,247);doc.setFontSize(18);doc.setFont('helvetica','bold');doc.text('KD CAMPUS',105,35,{align:'center'});
    doc.setTextColor(100,100,100);doc.setFontSize(10);doc.setFont('helvetica','normal');doc.text('Faridabad, Haryana',105,43,{align:'center'});
    doc.setDrawColor(212,175,55);doc.line(30,55,180,55);
    doc.setTextColor(50,50,50);doc.setFontSize(20);doc.setFont('helvetica','bold');doc.text('BONAFIDE CERTIFICATE',105,72,{align:'center'});
    doc.setTextColor(40,40,40);doc.setFontSize(12);doc.setFont('helvetica','normal');doc.text('This is to certify that',105,105,{align:'center'});
    doc.setFontSize(18);doc.setFont('helvetica','bold');doc.setTextColor(79,110,247);doc.text(user.name||'Student',105,120,{align:'center'});
    doc.setFontSize(12);doc.setFont('helvetica','normal');doc.setTextColor(40,40,40);
    doc.text('is a bonafide student of KD Campus',105,133,{align:'center'});
    doc.text(`Department: ${user.department||'N/A'}`,105,146,{align:'center'});
    doc.text('Academic Year: 2025-2026',105,159,{align:'center'});
    doc.setDrawColor(150,150,150);doc.setLineWidth(0.3);doc.line(25,255,90,255);doc.line(125,255,190,255);
    doc.setFontSize(10);doc.text('Class Teacher',57,261,{align:'center'});doc.text('Dean of Academics',157,261,{align:'center'});
    doc.save(`Bonafide_${(user.name||'Student').replace(' ','_')}.pdf`);
    showToast('Bonafide certificate ready!','success');
  });
}

function downloadFeeReceipt(payment){
  loadJsPDF(()=>{
    const{jsPDF}=window.jspdf;const user=getUser();const doc=new jsPDF();
    doc.setFillColor(79,110,247);doc.rect(0,0,210,45,'F');
    doc.setTextColor(255,255,255);doc.setFontSize(20);doc.setFont('helvetica','bold');doc.text('KD Campus',105,15,{align:'center'});
    doc.setFontSize(13);doc.setFont('helvetica','normal');doc.text('Fee Payment Receipt',105,25,{align:'center'});
    const rows=[['Student',user.name||'N/A'],['Description',payment.desc],['Date',payment.date],['Method','Online — Razorpay']];
    doc.setTextColor(50,50,50);
    rows.forEach(([label,value],i)=>{
      const y=60+i*14;
      if(i%2===0){doc.setFillColor(247,249,255);doc.rect(14,y-5,182,14,'F');}
      doc.setFont('helvetica','bold');doc.setFontSize(10);doc.text(label+':',20,y+3);
      doc.setFont('helvetica','normal');doc.text(String(value),90,y+3);
    });
    const amtY=60+rows.length*14+10;
    doc.setFillColor(34,211,160);doc.rect(14,amtY,182,20,'F');
    doc.setTextColor(4,52,44);doc.setFontSize(16);doc.setFont('helvetica','bold');
    doc.text(`Amount Paid: Rs. ${Number(payment.amount).toLocaleString('en-IN')}`,105,amtY+13,{align:'center'});
    doc.setDrawColor(15,110,86);doc.setLineWidth(2);doc.roundedRect(75,amtY+28,60,18,4,4,'S');
    doc.setTextColor(15,110,86);doc.setFontSize(14);doc.text('PAID',105,amtY+40,{align:'center'});
    doc.save(`FeeReceipt_${payment.id}.pdf`);
    showToast('Fee receipt downloaded!','success');
  });
}

function downloadAttendanceReport(){
  showToast('Attendance report downloading...','success');
  loadJsPDF(async()=>{
    const{jsPDF}=window.jspdf;const user=getUser();const doc=new jsPDF();
    doc.setFillColor(79,110,247);doc.rect(0,0,210,38,'F');
    doc.setTextColor(255,255,255);doc.setFontSize(18);doc.setFont('helvetica','bold');doc.text('Attendance Report',105,16,{align:'center'});
    doc.setFontSize(10);doc.setFont('helvetica','normal');doc.text(`${user.name||'Student'} | KD Campus`,105,28,{align:'center'});
    try{
      const data=await apiGet(`/attendance/student/${user.id}`);
      if(data.attendance?.length>0){
        data.attendance.forEach((a,i)=>{
          const y=55+i*14;
          if(i%2===0){doc.setFillColor(248,250,255);doc.rect(14,y-5,182,14,'F');}
          doc.setTextColor(30,30,30);doc.setFont('helvetica','normal');doc.setFontSize(10);
          doc.text(a.subject,20,y);doc.text(`${a.pct}%`,170,y);
          doc.setTextColor(...(a.pct>=75?[15,110,86]:[161,45,45]));doc.setFont('helvetica','bold');doc.text(a.pct>=75?'OK':'LOW',193,y);
        });
      }
    }catch(e){}
    doc.save(`Attendance_${(user.name||'Student').replace(' ','_')}.pdf`);
  });
}

function renderCertificates(area){
  const user=getUser();
  area.innerHTML=`
    <div class="page-header"><h1>Certificates & Reports</h1></div>
    <div class="grid grid-2" style="margin-bottom:20px">
      <div class="card" style="text-align:center;padding:28px"><div style="font-size:48px;margin-bottom:12px">📋</div><div style="font-weight:700;font-size:16px;margin-bottom:6px">Marksheet</div><div style="font-size:13px;color:var(--text-muted);margin-bottom:16px">Subject-wise marks report</div><button class="btn btn-accent" style="width:100%" onclick="downloadMarksheet()">⬇ Download PDF</button></div>
      <div class="card" style="text-align:center;padding:28px"><div style="font-size:48px;margin-bottom:12px">🎓</div><div style="font-weight:700;font-size:16px;margin-bottom:6px">Bonafide Certificate</div><div style="font-size:13px;color:var(--text-muted);margin-bottom:16px">Official enrollment proof</div><button class="btn btn-accent" style="width:100%" onclick="downloadBonafide()">⬇ Download PDF</button></div>
      <div class="card" style="text-align:center;padding:28px"><div style="font-size:48px;margin-bottom:12px">✅</div><div style="font-weight:700;font-size:16px;margin-bottom:6px">Attendance Report</div><div style="font-size:13px;color:var(--text-muted);margin-bottom:16px">Subject-wise attendance</div><button class="btn btn-accent" style="width:100%" onclick="downloadAttendanceReport()">⬇ Download PDF</button></div>
      <div class="card" style="text-align:center;padding:28px"><div style="font-size:48px;margin-bottom:12px">💰</div><div style="font-weight:700;font-size:16px;margin-bottom:6px">Fee Receipt</div><div style="font-size:13px;color:var(--text-muted);margin-bottom:16px">Last payment receipt</div><button class="btn btn-accent" style="width:100%" onclick="downloadFeeReceipt({id:'PAY-001',desc:'Fee',amount:45000,date:'2024'})">⬇ Download PDF</button></div>
    </div>
    <div class="card">
      <div class="card-title" style="margin-bottom:16px">Certificate Preview</div>
      <div class="certificate">
        <div style="font-size:12px;letter-spacing:3px;color:#8b6914;margin-bottom:6px">KD CAMPUS</div>
        <div class="cert-title">BONAFIDE CERTIFICATE</div>
        <div style="height:2px;background:linear-gradient(90deg,transparent,#d4af37,transparent);margin:10px auto;width:80%"></div>
        <div class="cert-body">This is to certify that<br><span class="cert-name">${user.name||'Student Name'}</span><br>is a bonafide student of <strong>KD Campus</strong><br>Department: <strong>${user.department||'N/A'}</strong><br>Academic Year <strong>2025–26</strong>.</div>
      </div>
      <button class="btn btn-accent" style="margin-top:16px;width:100%" onclick="downloadBonafide()">⬇ Download as PDF</button>
    </div>`;
}

// ═══════════ AI CHATBOT ═══════════

const chatResponses={
  'fee':'Fee payment ke liye Fee Payment section mein jaao — UPI, Cards, Net Banking se pay kar sakte ho.',
  'attendance':'Attendance check karne ke liye Attendance section mein jaao.',
  'assignment':'Assignments section mein jaao apne assignments dekhne ke liye.',
  'result':'Results & Marks section mein jaao apne marks dekhne ke liye.',
  'hello':'Hello! 👋 Main UniBot hoon. Fees, attendance, assignments, results — kuch bhi poocho!',
  'hi':'Hi! 😊 Kaise help kar sakta hoon?',
  'help':'Main in topics pe help kar sakta hoon:\n• 💰 Fee payment\n• ✅ Attendance\n• 📝 Assignments\n• 📊 Results\n• 🚌 Bus tracking\n• 🏆 Placement',
};

function toggleChat(){
  chatOpen=!chatOpen;
  document.getElementById('chatbot-window').classList.toggle('open',chatOpen);
  document.getElementById('chat-fab-icon').textContent=chatOpen?'×':'🤖';
}

async function sendChat(){
  const input=document.getElementById('chat-input');
  const msg=input.value.trim();if(!msg)return;input.value='';
  const messages=document.getElementById('chat-messages');
  messages.innerHTML+=`<div class="chat-msg user"><div class="msg-bubble">${msg}</div></div>`;
  const typingId='typing-'+Date.now();
  messages.innerHTML+=`<div class="chat-msg bot" id="${typingId}"><div class="msg-bubble typing"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div></div>`;
  messages.scrollTop=messages.scrollHeight;
  const key=Object.keys(chatResponses).find(k=>msg.toLowerCase().includes(k));
  setTimeout(async()=>{
    document.getElementById(typingId)?.remove();
    let reply='';
    if(key){reply=chatResponses[key];}
    else{
      try{
        const response=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,system:'You are UniBot, a helpful AI assistant for KD Campus University. Help students with courses, fees, attendance, assignments, results, placements. Be concise and friendly.',messages:[{role:'user',content:msg}]})});
        const data=await response.json();reply=data.content?.[0]?.text||"Fees, attendance, assignments ke baare mein poocho!";
      }catch(e){reply="Server busy hai. Thodi der baad try karo!";}
    }
    messages.innerHTML+=`<div class="chat-msg bot"><div class="msg-bubble">${reply.replace(/\n/g,'<br>')}</div></div>`;
    messages.scrollTop=messages.scrollHeight;
  },1200);
}

// ═══════════ NOTIFICATIONS ═══════════

let notifHistory=JSON.parse(localStorage.getItem('notifHistory')||'[]');
let notifSettings=JSON.parse(localStorage.getItem('notifSettings')||JSON.stringify({assignments:true,results:true,fees:true,announcements:true,library:true}));

async function requestNotificationPermission(){
  if(!('Notification'in window)){showToast('Browser notifications support nahi karta','danger');return false;}
  if(Notification.permission==='granted'){showToast('Already enabled!','success');return true;}
  if(Notification.permission==='denied'){showToast('Browser settings se allow karo','warning');return false;}
  const permission=await Notification.requestPermission();
  if(permission==='granted'){showToast('Notifications enable ho gayi!','success');sendBrowserNotification('KD Campus Notifications ON!','Ab aapko reminders milenge.','🔔');return true;}
  return false;
}

function sendBrowserNotification(title,body,icon='🏫',onClick=null){
  if(Notification.permission!=='granted')return;
  const notif=new Notification(title,{body,tag:'kdcampus-'+Date.now()});
  notif.onclick=()=>{window.focus();notif.close();if(onClick)onClick();};
  setTimeout(()=>notif.close(),5000);
}

function renderNotificationCenter(area){
  const perm=Notification.permission;
  const statusColor={granted:'var(--success)',denied:'var(--danger)',default:'var(--warning)'}[perm];
  const statusText={granted:'✅ Enabled',denied:'❌ Blocked',default:'⚠️ Not Set'}[perm];
  area.innerHTML=`
    <div class="page-header"><h1>Push Notifications</h1></div>
    <div class="card" style="margin-bottom:20px;border-left:4px solid ${statusColor};border-radius:0 14px 14px 0">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
        <div><div style="font-weight:700;font-size:15px">Status: <span style="color:${statusColor}">${statusText}</span></div></div>
        <div style="display:flex;gap:10px">
          ${perm!=='granted'?`<button class="btn btn-accent" onclick="requestNotificationPermission()">🔔 Enable</button>`:`<button class="btn btn-success" onclick="testAllNotifications()">🧪 Test</button>`}
        </div>
      </div>
    </div>
    <div class="card" style="margin-bottom:20px">
      <div class="card-title" style="margin-bottom:16px">Settings</div>
      ${[{key:'assignments',icon:'📝',label:'Assignments',desc:'Due date reminders'},{key:'results',icon:'📊',label:'Results',desc:'Jab result aaye'},{key:'fees',icon:'💰',label:'Fee Reminders',desc:'Payment due alerts'},{key:'announcements',icon:'📢',label:'Announcements',desc:'College notices'}].map(s=>`
        <div style="display:flex;align-items:center;gap:14px;padding:12px 0;border-bottom:1px solid var(--border)">
          <span style="font-size:22px">${s.icon}</span>
          <div style="flex:1"><div style="font-weight:600;font-size:14px">${s.label}</div><div style="font-size:12px;color:var(--text-muted)">${s.desc}</div></div>
          <label style="position:relative;display:inline-block;width:44px;height:24px;cursor:pointer">
            <input type="checkbox" ${notifSettings[s.key]?'checked':''} onchange="toggleNotifSetting('${s.key}',this.checked)" style="opacity:0;width:0;height:0;position:absolute">
            <span id="toggle-${s.key}" style="position:absolute;inset:0;background:${notifSettings[s.key]?'var(--accent)':'var(--border)'};border-radius:12px;transition:background 0.2s">
              <span style="position:absolute;top:3px;left:${notifSettings[s.key]?'23px':'3px'};width:18px;height:18px;background:white;border-radius:50%;transition:left 0.2s" id="thumb-${s.key}"></span>
            </span>
          </label>
        </div>`).join('')}
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">Notification History</div><button class="btn btn-ghost btn-sm" onclick="clearNotifHistory()">Clear</button></div>
      <div id="notif-history-list">${renderNotifHistory()}</div>
    </div>`;
}

function renderNotifHistory(){
  if(!notifHistory.length)return`<div style="text-align:center;padding:32px;color:var(--text-muted)"><div style="font-size:36px;margin-bottom:8px">🔔</div>Koi notification nahi</div>`;
  return notifHistory.slice(0,20).map(n=>`<div class="notif-item ${n.read?'':'unread'}"><div class="notif-icon">${n.icon}</div><div style="flex:1"><div class="notif-title">${n.title}</div><div style="font-size:12px;color:var(--text-muted)">${n.body}</div><div class="notif-time">${n.time}</div></div>${!n.read?`<span class="badge badge-accent">New</span>`:''}</div>`).join('');
}

function toggleNotifSetting(key,value){
  notifSettings[key]=value;localStorage.setItem('notifSettings',JSON.stringify(notifSettings));
  const toggle=document.getElementById(`toggle-${key}`);const thumb=document.getElementById(`thumb-${key}`);
  if(toggle)toggle.style.background=value?'var(--accent)':'var(--border)';
  if(thumb)thumb.style.left=value?'23px':'3px';
  showToast(`${key} notifications ${value?'on':'off'}`,value?'success':'warning');
}

function addToNotifHistory(title,body,icon){
  notifHistory.unshift({title,body,icon,read:false,time:new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})+' — Today'});
  localStorage.setItem('notifHistory',JSON.stringify(notifHistory));
  const list=document.getElementById('notif-history-list');if(list)list.innerHTML=renderNotifHistory();
}

function clearNotifHistory(){
  notifHistory=[];localStorage.setItem('notifHistory','[]');
  const list=document.getElementById('notif-history-list');if(list)list.innerHTML=renderNotifHistory();
  showToast('History clear!','accent');
}

function testAllNotifications(){
  ['📝 Assignment Due!','📊 Result Published!','💰 Fee Reminder!'].forEach((t,i)=>{
    setTimeout(()=>{sendBrowserNotification(t,'Test notification from KD Campus','📢');addToNotifHistory(t,'Test','📢');},i*2000);
  });
  showToast('3 test notifications bhej rahe hain!','success');
}

function startAutoNotifications(){
  if(Notification.permission!=='granted')return;
  setTimeout(()=>{sendBrowserNotification('👋 Welcome to KD Campus!','Dashboard check karo.','🏫');addToNotifHistory('Welcome!','Dashboard check karo','🏫');},5000);
}

// ═══════════ UTILITY ═══════════

function toggleSidebar(){document.getElementById('sidebar').classList.toggle('open');}

function toggleTheme(){
  const html=document.documentElement,isDark=html.dataset.theme==='dark';
  html.dataset.theme=isDark?'light':'dark';
  document.getElementById('theme-icon').textContent=isDark?'🌙':'☀️';
  document.getElementById('theme-label').textContent=isDark?'Dark Mode':'Light Mode';
}

function showPanel(type){
  document.getElementById('overlay').classList.add('active');
  if(type==='notifications')document.getElementById('notifications-panel').classList.add('open');
}

function closePanel(){
  document.getElementById('overlay').classList.remove('active');
  document.getElementById('notifications-panel').classList.remove('open');
}

function closeAllPanels(){closePanel();}

function showToast(msg,type='accent'){
  const colors={success:'var(--success)',danger:'var(--danger)',warning:'var(--warning)',accent:'var(--accent)'};
  const toast=document.createElement('div');
  toast.style.cssText=`position:fixed;bottom:90px;right:24px;background:var(--bg-card);border:1px solid ${colors[type]};border-left:4px solid ${colors[type]};color:var(--text-primary);padding:12px 18px;border-radius:10px;font-size:13.5px;font-weight:500;box-shadow:var(--shadow-lg);z-index:999;animation:slideUp .3s ease;max-width:300px;`;
  toast.textContent=msg;document.body.appendChild(toast);setTimeout(()=>toast.remove(),3200);
}

function switchTab(btn,tabId){
  const parent=btn.closest('.tabs');
  parent.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');
  parent.parentElement.querySelectorAll('.tab-pane').forEach(p=>p.classList.remove('active'));
  document.getElementById(tabId)?.classList.add('active');
}

function setAttendance(index,status){
  const presBtn=document.getElementById(`pres-${index}`),absBtn=document.getElementById(`abs-${index}`),lateBtn=document.getElementById(`late-${index}`);
  if(!presBtn)return;
  [presBtn,absBtn,lateBtn].forEach(b=>b.className='btn btn-ghost btn-sm');
  if(status==='present')presBtn.className='btn btn-success btn-sm';
  else if(status==='absent')absBtn.className='btn btn-danger btn-sm';
  else{lateBtn.style.borderColor='var(--warning)';lateBtn.style.color='var(--warning)';}
}

function sendChatRoom(){
  const input=document.getElementById('chat-room-input');
  const msg=input?.value?.trim();if(!msg)return;
  showToast('Message sent!','success');if(input)input.value='';
}

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('otp-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleLogin();
  });
  document.getElementById('chat-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') sendChat();
  });
  console.log('%c KD Campus University Management System', 'font-size:16px;font-weight:bold;color:#4f6ef7');

  // ← YEH ADD KARO
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('✅ Service Worker registered!'))
      .catch(err => console.log('SW Error:', err));
  }
});
function showStudentProfile(id, name, email, dept) {
  const initials = name.split(' ').map(n=>n[0]).join('').toUpperCase();
  const modal = document.createElement('div');
  modal.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:500;display:flex;align-items:center;justify-content:center`;
  modal.innerHTML = `
    <div style="background:var(--bg-card);border-radius:16px;padding:28px;max-width:400px;width:90%;border:1px solid var(--border)">
      <div style="text-align:center;margin-bottom:20px">
        <div class="user-avatar" style="width:64px;height:64px;font-size:22px;margin:0 auto 12px">${initials}</div>
        <div style="font-weight:700;font-size:18px">${name}</div>
        <div style="font-size:13px;color:var(--text-muted)">${dept}</div>
      </div>
      <div style="background:var(--bg-input);border-radius:10px;padding:16px;margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">
          <span style="color:var(--text-muted);font-size:13px">Email</span>
          <span style="font-size:13px;font-weight:500">${email}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">
          <span style="color:var(--text-muted);font-size:13px">Department</span>
          <span style="font-size:13px;font-weight:500">${dept}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:8px 0">
          <span style="color:var(--text-muted);font-size:13px">Status</span>
          <span class="badge badge-success">Active</span>
        </div>
      </div>
      <div style="display:flex;gap:10px">
        <button class="btn btn-accent" style="flex:1" onclick="showToast('Message sent!','success')">
          <i class="fa-solid fa-comment"></i> Message
        </button>
        <button class="btn btn-ghost" style="flex:1" onclick="this.closest('[style*=fixed]').remove()">Close</button>
      </div>
    </div>`;
  modal.onclick = e => { if(e.target===modal) modal.remove(); };
  document.body.appendChild(modal);
}

