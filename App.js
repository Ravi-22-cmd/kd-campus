// ══════════════════════════════════════
// GLOBAL API CONFIG
// ══════════════════════════════════════
const API = 'http://localhost:3000/api';

const apiGet = async (url) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API}${url}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
};


const apiPost = async (url, body) => {
  const token = localStorage.getItem('token');

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
      { icon:'<i class="fa-solid fa-face-smile"></i>',       label:'Register Face',   page:'register-face' },
      { icon:'<i class="fa-solid fa-building-columns"></i>', label:'Digital Library', page:'library' },
      { icon:'<i class="fa-solid fa-pencil"></i>',           label:'Online Exams',    page:'exams' },
    ]},
    { section:'Campus', items:[
      { icon:'<i class="fa-solid fa-indian-rupee-sign"></i>',label:'Fee Payment',      page:'fees' },
      { icon:'<i class="fa-solid fa-comments"></i>',          label:'Chat',             page:'chat', badge:null },
      { icon:'<i class="fa-solid fa-bell"></i>',              label:'Notifications',    page:'notifications', badge:null },
      { icon:'<i class="fa-solid fa-bullhorn"></i>',          label:'Announcements',    page:'announcements' },
      { icon:'<i class="fa-solid fa-bus"></i>',               label:'Bus Tracker',      page:'bus' },
      { icon:'<i class="fa-solid fa-map-location-dot"></i>',  label:'Campus Map',       page:'campus' },
      { icon:'<i class="fa-solid fa-briefcase"></i>',         label:'Placement Portal', page:'placement' },
      { icon:'<i class="fa-solid fa-award"></i>',             label:'Certificates',     page:'certificates' },
    ]},
  ],
  faculty: [
    { section:'Main', items:[
      { icon:'<i class="fa-solid fa-house"></i>',            label:'Dashboard',       page:'dashboard' },
      { icon:'<i class="fa-solid fa-book"></i>',            label:'My Courses',      page:'courses' },
      { icon:'<i class="fa-solid fa-users"></i>',            label:'Students',        page:'students' },
      { icon:'<i class="fa-solid fa-face-viewfinder"></i>',            label:'Face Attendance', page:'face-attendance' },
    ]},
    { section:'Academic Tools', items:[
      { icon:'<i class="fa-solid fa-clipboard-check"></i>',            label:'Mark Attendance', page:'mark-attendance' },
      { icon:'<i class="fa-solid fa-file-pen"></i>',            label:'Assignments',     page:'assignments' },
      { icon:'<i class="fa-solid fa-upload"></i>',            label:'Upload Marks',    page:'upload-marks' },
      { icon:'<i class="fa-solid fa-folder-open"></i>',            label:'Upload Notes',    page:'upload-notes' },
      { icon:'<i class="fa-solid fa-chart-line"></i>',            label:'Performance',     page:'performance' },
    ]},
    { section:'Communication', items:[
      { icon:'<i class="fa-solid fa-comments"></i>',            label:'Chat',            page:'chat', badge:null },
      { icon:'<i class="fa-solid fa-bullhorn"></i>',            label:'Announcements',   page:'announcements' },
    ]},
  ],
  admin: [
    { section:'Overview', items:[
      { icon:'<i class="fa-solid fa-house"></i>',             label:'Dashboard',       page:'dashboard' },
      { icon:'<i class="fa-solid fa-chart-line"></i>',             label:'Analytics',       page:'analytics' },
    ]},
    { section:'Management', items:[
      { icon:'<i class="fa-solid fa-user-graduate"></i>',             label:'Students',        page:'manage-students', badge:null },
      { icon:'<i class="fa-solid fa-chalkboard-user"></i>',             label:'Faculty',         page:'manage-faculty',  badge:null },
      { icon:'<i class="fa-solid fa-book-open"></i>',             label:'Courses',         page:'manage-courses' },
      { icon:'<i class="fa-solid fa-building"></i>',             label:'Departments',     page:'departments' },
    ]},
    { section:'System', items:[
      { icon:'<i class="fa-solid fa-circle-check"></i>',             label:'Approvals',       page:'approvals', badge:null },
      { icon:'<i class="fa-solid fa-coins"></i>',             label:'Fees & Finance',  page:'finance' },
      { icon:'<i class="fa-solid fa-file-chart-column"></i>',             label:'Reports',         page:'reports' },
      { icon:'<i class="fa-solid fa-gear"></i>',             label:'System Settings', page:'settings' },
    ]},
  ]
};
// Top bar mein profile click pe
document.getElementById('top-avatar')?.addEventListener('click', showProfile);

function showProfile() {
  const user = getUser();
  const initials = user.name?.split(' ').map(n=>n[0]).join('').toUpperCase() || 'U';

  const modal = document.createElement('div');
  modal.id = 'profile-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:500;display:flex;align-items:center;justify-content:center';
  modal.innerHTML = `
    <div style="background:var(--bg-card);border-radius:16px;padding:28px;max-width:440px;width:90%;border:1px solid var(--border);max-height:90vh;overflow-y:auto">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
        <h3 style="font-family:'Plus Jakarta Sans',sans-serif;font-weight:700">My Profile</h3>
        <button onclick="document.getElementById('profile-modal').remove()" style="background:none;font-size:20px;color:var(--text-muted)">×</button>
      </div>

      <!-- Avatar -->
      <div style="text-align:center;margin-bottom:20px">
        <div class="user-avatar" style="width:72px;height:72px;font-size:24px;margin:0 auto 12px">${initials}</div>
        <div style="font-weight:700;font-size:16px">${user.name}</div>
        <div style="font-size:13px;color:var(--text-muted)">${user.email}</div>
        <span class="badge badge-accent" style="margin-top:6px">${user.role}</span>
      </div>

      <!-- Edit Form -->
      <div class="tabs" style="margin-bottom:16px">
        <button class="tab-btn active" onclick="switchProfileTab(this,'info-tab')">Info</button>
        <button class="tab-btn" onclick="switchProfileTab(this,'password-tab')">Password</button>
      </div>

      <div id="info-tab">
        <div class="form-group"><label>Full Name</label><input id="p-name" value="${user.name||''}"></div>
        <div class="form-group"><label>Phone</label><input id="p-phone" value="${user.phone||''}" placeholder="+91 98765 43210"></div>
        <div class="form-group"><label>Department</label>
          <select id="p-dept">
            ${['Computer Science','Electronics','Mechanical','Civil','Management','Physics','Mathematics'].map(d=>`<option ${user.department===d?'selected':''}>${d}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label>Email</label><input value="${user.email||''}" disabled style="opacity:.6"></div>
        <button class="btn btn-accent" style="width:100%" onclick="updateProfile('${user.id}')">
          <i class="fa-solid fa-floppy-disk"></i> Save Changes
        </button>
      </div>

      <div id="password-tab" style="display:none">
        <div class="form-group"><label>Current Password</label><input type="password" id="p-curr-pass" placeholder="Current password"></div>
        <div class="form-group"><label>New Password</label><input type="password" id="p-new-pass" placeholder="New password"></div>
        <div class="form-group"><label>Confirm Password</label><input type="password" id="p-conf-pass" placeholder="Confirm new password"></div>
        <button class="btn btn-accent" style="width:100%" onclick="changePassword('${user.id}')">
          <i class="fa-solid fa-lock"></i> Change Password
        </button>
      </div>
    </div>`;

  modal.onclick = e => { if(e.target===modal) modal.remove(); };
  document.body.appendChild(modal);
}

function switchProfileTab(btn, tabId) {
  document.querySelectorAll('#profile-modal .tab-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('info-tab').style.display    = tabId==='info-tab'    ? 'block' : 'none';
  document.getElementById('password-tab').style.display = tabId==='password-tab' ? 'block' : 'none';
}

async function updateProfile(userId) {
  const name  = document.getElementById('p-name')?.value?.trim();
  const phone = document.getElementById('p-phone')?.value?.trim();
  const dept  = document.getElementById('p-dept')?.value;

  if (!name) { showToast('Name bharo','warning'); return; }

  try {
    const data = await apiPut(`/profile/${userId}`, { name, phone, department: dept });
    if (data.success) {
      // Update LocalStorage
      const userData = JSON.parse(localStorage.getItem('userData')||'{}');
      userData.name       = name;
      userData.phone      = phone;
      userData.department = dept;
      localStorage.setItem('userData', JSON.stringify(userData));

      // Update sidebar
      const initials = name.split(' ').map(n=>n[0]).join('').toUpperCase();
      document.getElementById('sidebar-name').textContent   = name;
      document.getElementById('sidebar-avatar').textContent = initials;
      document.getElementById('top-avatar').textContent     = initials;

      showToast('Profile updated successfully!','success');
      document.getElementById('profile-modal')?.remove();
    } else showToast(data.message||'Error','danger');
  } catch(e) { showToast('Server error','danger'); }
}

async function changePassword(userId) {
  const curr = document.getElementById('p-curr-pass')?.value;
  const newP = document.getElementById('p-new-pass')?.value;
  const conf = document.getElementById('p-conf-pass')?.value;

  if (!curr||!newP) { showToast('Sab fields bharo','warning'); return; }
  if (newP !== conf) { showToast('New password does not match','danger'); return; }
  if (newP.length < 6) { showToast('Password must be at least 6 characters','warning'); return; }

  try {
    const data = await apiPut(`/profile/${userId}`, { currentPassword: curr, newPassword: newP });
    if (data.success) {
      showToast('Password changed successfully! Please login again.','success');
      setTimeout(() => logout(), 2000);
    } else showToast(data.message||'Error','danger');
  } catch(e) { showToast('Server error','danger'); }
}

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
  // For OTP login we use email-based OTP (free via nodemailer)
  const emailInput = document.getElementById('login-email');
  const email = emailInput?.value?.trim();
  if (!email) { showToast('Email daalo','warning'); return; }
  const role = currentRole || document.querySelector('#login-form .role-btn.active')?.dataset?.role || 'student';

  // call backend to send OTP
  apiPost('/auth/otp/send', { email, role })
    .then(data => {
      if (data.success) {
        showToast(data.message || 'OTP sent!','success');
        document.getElementById('otp-input').style.display = 'block';
        document.getElementById('otp-input')?.focus?.();
      } else {
        showToast(data.message || 'OTP send failed','danger');
      }
    })
    .catch(() => showToast('Server error while sending OTP','danger'));
}


async function handleOTPLogin() {
  const email = document.getElementById('login-email')?.value?.trim();
  const otp   = document.getElementById('otp-input')?.value?.trim();
  if (!email) { showToast('Email daalo','warning'); return; }
  if (!otp)   { showToast('OTP daalo','warning'); return; }

  const btn = document.querySelector('#login-form .btn-primary');
  if (btn) { btn.textContent='Verifying OTP...'; btn.disabled=true; }

  const role = currentRole || document.querySelector('#login-form .role-btn.active')?.dataset?.role || 'student';

  try {
    const data = await apiPost('/auth/otp/verify', { email, otp, role });
    if (!data.success) {
      showToast(data.message || 'OTP verify failed','danger');
      if (btn) { btn.textContent='Sign In →'; btn.disabled=false; }
      return;
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('userData', JSON.stringify(data.user));

    currentRole = data.user.role;
    currentUser = {
      name: data.user.name,
      initials: data.user.name.split(' ').map(n=>n[0]).join('').toUpperCase(),
      role: `${data.user.role.charAt(0).toUpperCase()+data.user.role.slice(1)} · ${getUser().department||'KD Campus'}`,
      id: data.user.id,
    };

    showToast(`Welcome ${data.user.name}! 🎉`,'success');
    initApp(currentRole);
  } catch (err) {
    console.log('OTP verify error:', err);
    showToast('Server error while verifying OTP','danger');
  } finally {
    if (btn) { btn.textContent='Sign In →'; btn.disabled=false; }
  }
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
    if (!data.success) {
      showToast(data.message || 'Login failed','error');
      btn.textContent='Sign In →'; btn.disabled=false;
      return;
    }

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
    console.log('Network error:', err);
    showToast('Server/network error. Please try again.', 'danger');
    btn.textContent='Sign In →'; btn.disabled=false;
  }

}

function openForgotPassword(event) {
  event.preventDefault();
  const existing = document.getElementById('forgot-password-modal');
  if (existing) return;

  const modal = document.createElement('div');
  modal.id = 'forgot-password-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:900;display:flex;align-items:center;justify-content:center;padding:20px;';
  modal.innerHTML = `
    <div style="background:var(--bg-card);border-radius:18px;padding:28px;width:100%;max-width:420px;border:1px solid var(--border);box-shadow:var(--shadow)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
        <div>
          <div style="font-size:18px;font-weight:700">Forgot Password</div>
          <div style="font-size:13px;color:var(--text-secondary);margin-top:4px">Enter your account email and we will send a reset token.</div>
        </div>
        <button style="background:none;border:none;color:var(--text-secondary);font-size:22px;cursor:pointer" onclick="closeForgotPassword()">×</button>
      </div>
      <div class="form-group"><label>Email Address</label><input id="forgot-email" type="email" placeholder="you@university.edu"></div>
      <button class="btn btn-accent" style="width:100%;margin-top:10px" onclick="submitForgotPassword()">Send Reset Token</button>
      <div style="margin-top:14px;font-size:12px;color:var(--text-muted)">A code will be delivered to your email if the account exists.</div>
    </div>`;
  modal.addEventListener('click', e => { if (e.target === modal) closeForgotPassword(); });
  document.body.appendChild(modal);
}

function closeForgotPassword() {
  document.getElementById('forgot-password-modal')?.remove();
}

function openResetPassword(token = '') {
  const existing = document.getElementById('reset-password-modal');
  if (existing) return;

  const modal = document.createElement('div');
  modal.id = 'reset-password-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:900;display:flex;align-items:center;justify-content:center;padding:20px;';
  modal.innerHTML = `
    <div style="background:var(--bg-card);border-radius:18px;padding:28px;width:100%;max-width:420px;border:1px solid var(--border);box-shadow:var(--shadow)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
        <div>
          <div style="font-size:18px;font-weight:700">Reset Password</div>
          <div style="font-size:13px;color:var(--text-secondary);margin-top:4px">Enter your email, reset token, and new password.</div>
        </div>
        <button style="background:none;border:none;color:var(--text-secondary);font-size:22px;cursor:pointer" onclick="closeResetPassword()">×</button>
      </div>
      <div class="form-group"><label>Email Address</label><input id="reset-email" type="email" placeholder="you@university.edu"></div>
      <div class="form-group"><label>Reset Token</label><input id="reset-token" value="${token}" placeholder="Enter reset token"></div>
      <div class="form-group"><label>New Password</label><input id="reset-password" type="password" placeholder="New password"></div>
      <div class="form-group"><label>Confirm Password</label><input id="reset-password-confirm" type="password" placeholder="Confirm new password"></div>
      <button class="btn btn-accent" style="width:100%;margin-top:10px" onclick="submitResetPassword()">Reset Password</button>
      <div style="margin-top:14px;font-size:12px;color:var(--text-muted)">Token valid for one hour. Use the code from your email.</div>
    </div>`;
  modal.addEventListener('click', e => { if (e.target === modal) closeResetPassword(); });
  document.body.appendChild(modal);
}

function closeResetPassword() {
  document.getElementById('reset-password-modal')?.remove();
}

async function submitForgotPassword() {
  const email = document.getElementById('forgot-email')?.value.trim();
  if (!email) { showToast('Email daalo','warning'); return; }

  try {
    const data = await apiPost('/auth/forgot', { email });
    if (data.success) {
      showToast(data.message || 'Password reset token bhej diya gaya','success');
      closeForgotPassword();
      if (data.token) {
        openResetPassword(data.token);
      }
    } else {
      showToast(data.message || 'Reset failed','danger');
    }
  } catch (err) {
    showToast('Cannot connect to server','danger');
  }
}

async function submitResetPassword() {
  const email = document.getElementById('reset-email')?.value.trim();
  const token = document.getElementById('reset-token')?.value.trim();
  const password = document.getElementById('reset-password')?.value;
  const confirmPassword = document.getElementById('reset-password-confirm')?.value;

  if (!email || !token || !password || !confirmPassword) { showToast('Saare fields bharo','warning'); return; }
  if (password !== confirmPassword) { showToast('Password does not match','danger'); return; }
  if (password.length < 6) { showToast('Password must be at least 6 characters','warning'); return; }

  try {
    const data = await apiPost('/auth/reset', { email, token, newPassword: password });
    if (data.success) {
      showToast(data.message || 'Password reset successful','success');
      closeResetPassword();
    } else {
      showToast(data.message || 'Reset failed','danger');
    }
  } catch (err) {
    showToast('Cannot connect to server','danger');
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
    showToast('Registration successful! Waiting for admin approval.','success');
    document.querySelector('[data-tab="login"]').click();
  } catch(err) { showToast('Server error!','danger'); }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userData');
  currentUser = null;
  currentPage = 'dashboard';
  currentRole = 'student';

  // Reset button
  const btn = document.querySelector('#login-form .btn-primary');
  if (btn) { btn.textContent = 'Sign In →'; btn.disabled = false; }

  // Clear email/password
  const emailInput = document.getElementById('login-email');
  const passInput  = document.getElementById('login-password');
  if (emailInput) emailInput.value = '';
  if (passInput)  passInput.value  = '';

  // Hide app, show auth
  document.getElementById('app').classList.remove('active');
  document.getElementById('auth-screen').classList.add('active');

  showToast('Logged out!', 'accent');
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
  updateNotificationBadgeOnLoad();
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
    'register-face':'Register Face',library:'Digital Library',exams:'Online Exams',fees:'Fee Payment',
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
      'register-face':renderRegisterFace, library:renderLibrary, exams:renderExams, fees:renderFees, chat:renderChat,
      bus:renderBusTracker, campus:renderCampusMap, placement:renderPlacement,
      certificates:renderCertificates, notifications:renderNotificationCenter, announcements:renderStudentAnnouncements },
    faculty:{ dashboard:renderFacultyDashboard, courses:renderFacultyCourses, students:renderStudentList,
      'mark-attendance':renderMarkAttendance, assignments:renderFacultyAssignments,
      'upload-marks':renderUploadMarks, 'upload-notes':renderUploadNotes,'face-attendance': renderFaceAttendance,
      performance:renderPerformance, chat:renderChat, announcements:renderAnnouncements },
    admin:{ dashboard:renderAdminDashboard, analytics:renderAnalytics,
      'manage-students':renderManageStudents, 'manage-faculty':renderManageFaculty,
      'manage-courses':renderManageCourses, approvals:renderApprovals,
      departments:renderDepartments,
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
      <div class="stat-card" style="--stat-color:var(--accent)">
        <div class="stat-icon"><i class="fa-solid fa-chart-bar"></i></div>
        <div class="stat-label">CGPA</div>
        <div class="stat-value">--</div>
      </div>

      <div class="stat-card" style="--stat-color:var(--success)">
        <div class="stat-icon"><i class="fa-solid fa-clipboard-check"></i></div>
        <div class="stat-label">ATTENDANCE</div>
        <div class="stat-value">--</div>
      </div>

      <div class="stat-card" style="--stat-color:var(--warning)">
        <div class="stat-icon"><i class="fa-solid fa-file-pen"></i></div>
        <div class="stat-label">ASSIGNMENTS</div>
        <div class="stat-value">--</div>
      </div>

      <div class="stat-card" style="--stat-color:var(--danger)">
        <div class="stat-icon"><i class="fa-solid fa-indian-rupee-sign"></i></div>
        <div class="stat-label">FEE DUE</div>
        <div class="stat-value">--</div>
      </div>
    </div>

    <div class="grid grid-2" style="margin-bottom:20px">
      <div class="card" id="dash-attendance">
        <div class="card-header">
          <div class="card-title">Attendance</div>
        </div>
        <div style="text-align:center;padding:20px;color:var(--text-muted)">Loading...</div>
      </div>

      <div class="card" id="dash-marks">
        <div class="card-header">
          <div class="card-title">Performance</div>
        </div>
        <div style="text-align:center;padding:20px;color:var(--text-muted)">Loading...</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">Quick Actions</div>
      </div>
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
          <div onclick="navigateTo('${q.action}')"
            style="padding:16px;border:1px solid var(--border);border-radius:10px;text-align:center;cursor:pointer;transition:all var(--transition)"
            onmouseover="this.style.borderColor='var(--accent)';this.style.background='var(--accent-soft)'"
            onmouseout="this.style.borderColor='var(--border)';this.style.background='transparent'">
            <div style="font-size:20px;margin-bottom:8px;color:var(--accent)">${q.icon}</div>
            <div style="font-size:12px;font-weight:600;color:var(--text-secondary)">${q.label}</div>
          </div>`).join('')}
      </div>
    </div>
  `;

  try {
    const userId = user.id;

    // ✅ Attendance
    const attData = await apiGet(`/attendance/student/${userId}`);
    const attDiv  = document.getElementById('dash-attendance');

    if (attData.attendance?.length > 0) {
      const overall = Math.round(
        attData.attendance.reduce((s,a)=>s+a.pct,0) / attData.attendance.length
      );

      document.querySelector('#dash-stats .stat-card:nth-child(2) .stat-value')
        .textContent = overall + '%';

      attDiv.innerHTML = `
        <div class="card-header">
          <div class="card-title">Attendance</div>
          <button class="btn btn-ghost btn-sm" onclick="navigateTo('attendance')">View All</button>
        </div>
        ${attData.attendance.map(a=>`
          <div class="marks-bar-row">
            <div class="marks-subject">${a.subject.split(' ')[0]}</div>
            <div class="marks-bar-wrap">
              <div class="marks-bar-fill"
                style="width:${a.pct}%;
                background:${a.pct>=75?'var(--success)':a.pct>=65?'var(--warning)':'var(--danger)'}">
              </div>
            </div>
            <div class="marks-val">${a.pct}%</div>
          </div>`).join('')}
      `;
    } else {
      attDiv.innerHTML = `<div style="text-align:center;padding:20px">No records</div>`;
    }

    // ✅ Marks + CGPA
    const marksData = await apiGet(`/marks/student/${userId}`);
    const marksDiv  = document.getElementById('dash-marks');

    if (marksData.marks?.length > 0) {

      // 🔥 CGPA Calculation
      const totalPct = marksData.marks.reduce(
        (sum, m) => sum + (m.marks / m.maxMarks) * 100, 0
      );

      const avgPct = totalPct / marksData.marks.length;
      const cgpa   = ((avgPct / 100) * 10).toFixed(1);

      document.querySelector('#dash-stats .stat-card:nth-child(1) .stat-value')
        .textContent = cgpa;

      // UI
      marksDiv.innerHTML = `
        <div class="card-header">
          <div class="card-title">Performance</div>
          <button class="btn btn-ghost btn-sm" onclick="navigateTo('results')">Details</button>
        </div>
        ${marksData.marks.map(m=>`
          <div class="marks-bar-row">
            <div class="marks-subject">${m.courseId?.name?.split(' ')[0]||'Subject'}</div>
            <div class="marks-bar-wrap">
              <div class="marks-bar-fill"
                style="width:${(m.marks/m.maxMarks)*100}%;background:var(--accent)">
              </div>
            </div>
            <div class="marks-val">${m.marks}/${m.maxMarks}</div>
          </div>`).join('')}
      `;
    } else {
      marksDiv.innerHTML = `<div style="text-align:center;padding:20px">No marks</div>`;
    }

    // ✅ Fees
    const feeData = await apiGet(`/fees/student/${userId}`);
    const pending = feeData.summary?.pending || 0;

    document.querySelector('#dash-stats .stat-card:nth-child(4) .stat-value')
      .textContent = pending > 0 ? '₹' + (pending/1000).toFixed(0) + 'K' : '₹0';

    // ✅ Assignments
    const asgData  = await apiGet('/assignments');
    const pendingA = asgData.assignments?.filter(a =>
      new Date(a.dueDate) > new Date()
    ).length || 0;

    document.querySelector('#dash-stats .stat-card:nth-child(3) .stat-value')
      .textContent = pendingA;

  } catch(err) {
    console.log('Dashboard error:', err);
  }
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
      container.innerHTML = `<div style="text-align:center;padding:32px;color:var(--text-muted)"><i class="fa-solid fa-chart-bar" style="font-size:36px;margin-bottom:8px"></i>No marks available yet</div>`;
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
      rings.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-muted);grid-column:1/-1">No attendance records</div>`;
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

async function renderRegisterFace(area) {
  const user = getUser();
  area.innerHTML = `
    <div class="page-header"><h1>Register Face</h1><p>Register your face for biometric attendance</p></div>
    
    <div class="grid grid-2" style="margin-bottom:20px">
      <div class="card">
        <div class="card-header"><div class="card-title">📹 Camera Feed</div></div>
        <div style="padding:16px">
          <video id="register-video" autoplay muted style="width:100%;border-radius:8px;border:1px solid var(--border)"></video>
          <div style="margin-top:12px;display:flex;gap:8px">
            <button class="btn btn-accent" onclick="startRegisterCamera()">🎥 Start Camera</button>
            <button class="btn btn-success" onclick="captureRegisterFace()">📸 Capture Face</button>
            <button class="btn btn-danger" onclick="stopRegisterCamera()">⏹️ Stop</button>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header"><div class="card-title">✅ Registration Status</div></div>
        <div id="register-status" style="padding:16px;text-align:center;color:var(--text-muted)">
          <i class="fa-solid fa-face-smile" style="font-size:40px;margin-bottom:12px"></i>
          <div>Start camera and capture your face</div>
          <div style="font-size:12px;margin-top:8px;color:var(--text-muted)">Multiple captures improve accuracy</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">📝 Face Registration</div>
        <button class="btn btn-accent" onclick="saveFaceRegistration()">💾 Save Registration</button>
      </div>
      <div id="face-captures" style="padding:16px">
        <div style="text-align:center;color:var(--text-muted)">
          <i class="fa-solid fa-camera" style="font-size:36px;margin-bottom:8px"></i>
          <div>No face captures yet</div>
          <div style="font-size:12px;margin-top:4px">Capture multiple angles for better recognition</div>
        </div>
      </div>
    </div>`;

  // Load face-api models
  await loadFaceAPIModels();
}

let registerStream = null;
let registerCanvas = null;
let capturedDescriptors = [];

async function startRegisterCamera() {
  try {
    const video = document.getElementById('register-video');
    registerStream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = registerStream;
    
    // Create canvas for drawing
    registerCanvas = faceapi.createCanvasFromMedia(video);
    registerCanvas.style.position = 'absolute';
    registerCanvas.style.top = video.offsetTop + 'px';
    registerCanvas.style.left = video.offsetLeft + 'px';
    video.parentNode.appendChild(registerCanvas);
    
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(registerCanvas, displaySize);
    
    showToast('Camera started! Capture your face from different angles.', 'success');
  } catch(e) {
    console.log('Camera error:', e);
    showToast('Camera access denied', 'danger');
  }
}

async function captureRegisterFace() {
  const video = document.getElementById('register-video');
  
  if (!video.srcObject) {
    showToast('Start camera first', 'warning');
    return;
  }

  try {
    const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();
    
    if (!detections) {
      showToast('No face detected. Try again.', 'warning');
      return;
    }

    // Draw detection box
    if (registerCanvas) {
      const displaySize = { width: video.width, height: video.height };
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      registerCanvas.getContext('2d').clearRect(0, 0, registerCanvas.width, registerCanvas.height);
      faceapi.draw.drawDetections(registerCanvas, resizedDetections);
    }

    // Store descriptor
    capturedDescriptors.push(detections.descriptor);
    
    // Update UI
    updateFaceCaptures();
    showToast(`Face captured! (${capturedDescriptors.length} total)`, 'success');
    
    const statusDiv = document.getElementById('register-status');
    statusDiv.innerHTML = `
      <div style="color:var(--success)">
        <i class="fa-solid fa-check-circle" style="font-size:40px;margin-bottom:12px"></i>
        <div style="font-weight:700">Face Captured!</div>
        <div style="font-size:13px;margin-top:4px">${capturedDescriptors.length} capture(s) saved</div>
        <div style="font-size:12px;margin-top:8px;color:var(--text-muted)">Capture from different angles for better accuracy</div>
      </div>`;
  } catch(e) {
    console.log('Face capture error:', e);
    showToast('Error capturing face', 'danger');
  }
}

function updateFaceCaptures() {
  const container = document.getElementById('face-captures');
  if (capturedDescriptors.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;color:var(--text-muted)">
        <i class="fa-solid fa-camera" style="font-size:36px;margin-bottom:8px"></i>
        <div>No face captures yet</div>
        <div style="font-size:12px;margin-top:4px">Capture multiple angles for better recognition</div>
      </div>`;
    return;
  }

  container.innerHTML = `
    <div style="margin-bottom:16px;font-weight:600">Captured Faces (${capturedDescriptors.length})</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:12px">
      ${capturedDescriptors.map((_, i) => `
        <div style="border:1px solid var(--border);border-radius:8px;padding:8px;text-align:center;background:var(--bg-input)">
          <i class="fa-solid fa-face-smile" style="font-size:24px;margin-bottom:4px;color:var(--accent)"></i>
          <div style="font-size:12px;font-weight:600">Capture ${i+1}</div>
          <button class="btn btn-ghost btn-sm" style="margin-top:4px" onclick="removeFaceCapture(${i})">❌</button>
        </div>`).join('')}
    </div>
    <div style="margin-top:16px;padding:12px;background:var(--accent-soft);border-radius:8px">
      <div style="font-weight:600;color:var(--accent)">Ready to Register!</div>
      <div style="font-size:12px;margin-top:4px;color:var(--text-secondary)">Click "Save Registration" to complete face registration</div>
    </div>`;
}

function removeFaceCapture(index) {
  capturedDescriptors.splice(index, 1);
  updateFaceCaptures();
  showToast('Capture removed', 'warning');
}

async function saveFaceRegistration() {
  if (capturedDescriptors.length === 0) {
    showToast('Capture at least one face first', 'warning');
    return;
  }

  const user = getUser();
  try {
    const result = await apiPost('/attendance/register-face', {
      studentId: user.id,
      faceDescriptors: capturedDescriptors
    });

    if (result.success) {
      showToast('Face registered successfully! You can now use face attendance.', 'success');
      capturedDescriptors = [];
      updateFaceCaptures();
      stopRegisterCamera();
    } else {
      showToast('Registration failed', 'danger');
    }
  } catch(e) {
    showToast('Error registering face', 'danger');
  }
}

function stopRegisterCamera() {
  if (registerStream) {
    registerStream.getTracks().forEach(track => track.stop());
    registerStream = null;
  }
  const video = document.getElementById('register-video');
  if (video) video.srcObject = null;
  if (registerCanvas) {
    registerCanvas.remove();
    registerCanvas = null;
  }
  showToast('Camera stopped', 'accent');
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
    container.innerHTML = `<div style="text-align:center;padding:32px;color:var(--text-muted)"><div style="font-size:36px;margin-bottom:8px">👥</div>No student found</div>`;
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
  if (!confirm(`Delete ${name}?`)) return;
  try {
    await apiPut(`/students/${id}`,{isActive:false});
    showToast(`${name} deleted`,'danger');
    renderManageStudents(document.getElementById('content-area'));
  } catch(err) { showToast('Error','danger'); }
}

// ── Other Student Pages ──
async function renderCourses(area) {
  area.innerHTML = `
    <div class="page-header"><h1>My Courses</h1><p>Available courses</p></div>
    <div class="tabs" style="margin-bottom:16px">
      <button class="tab-btn active" onclick="switchTab(this,'all-courses-tab')">All Courses</button>
      <button class="tab-btn" onclick="switchTab(this,'enrolled-tab')">Enrolled</button>
    </div>
    <div id="all-courses-tab" class="tab-pane active">
      <div id="courses-grid" class="grid grid-3">
        <div style="text-align:center;padding:32px;color:var(--text-muted);grid-column:1/-1">Loading...</div>
      </div>
    </div>
    <div id="enrolled-tab" class="tab-pane">
      <div id="enrolled-grid" class="grid grid-3">
        <div style="text-align:center;padding:32px;color:var(--text-muted);grid-column:1/-1">Loading...</div>
      </div>
    </div>`;

  try {
    const data    = await apiGet('/courses');
    const courses = data.courses || [];
    const user    = getUser();

    // Load enrolled courses from LocalStorage
    const enrolledIds = JSON.parse(localStorage.getItem(`enrolled_${user.id}`) || '[]');

    const colors = ['#4f6ef7','#22d3a0','#a78bfa','#f7b955','#f75f6e'];
    const icons  = ['fa-robot','fa-database','fa-network-wired','fa-gear','fa-cloud','fa-shield-halved','fa-code','fa-brain'];

    const grid = document.getElementById('courses-grid');
    if (!courses.length) {
      grid.innerHTML = `
        <div style="text-align:center;padding:40px;color:var(--text-muted);grid-column:1/-1">
          <i class="fa-solid fa-book" style="font-size:40px;margin-bottom:12px;opacity:.3"></i>
          <div style="font-weight:600">No courses available</div>
          <div style="font-size:13px;margin-top:8px">Contact admin to add courses</div>
        </div>`;
      return;
    }

    grid.innerHTML = courses.map((c,i) => {
      const color      = colors[i % colors.length];
      const icon       = icons[i % icons.length];
      const isEnrolled = enrolledIds.includes(c._id);

      return `
        <div class="course-card" id="course-card-${c._id}">
          <div class="course-thumb" style="background:${color}18;display:flex;align-items:center;justify-content:center;height:100px">
            <i class="fa-solid ${icon}" style="font-size:40px;color:${color}"></i>
          </div>
          <div class="course-body">
            <div class="course-name">${c.name}</div>
            <div class="course-meta">${c.code} · ${c.department||'N/A'} · ${c.credits||4} Credits</div>
            <div style="margin-top:8px">
              <span class="badge badge-${isEnrolled?'success':'accent'}">${isEnrolled?'✓ Enrolled':'Available'}</span>
              <span class="badge badge-accent" style="margin-left:4px">Sem ${c.semester||'N/A'}</span>
            </div>
            <div class="course-footer" style="margin-top:12px">
              ${isEnrolled
                ? `<button class="btn btn-ghost btn-sm" onclick="unenrollCourse('${c._id}','${c.name}')">Unenroll</button>
                   <button class="btn btn-accent btn-sm" onclick="navigateTo('library')">📖 Materials</button>`
                : `<button class="btn btn-success btn-sm" style="width:100%" onclick="enrollCourse('${c._id}','${c.name}')">+ Enroll</button>`
              }
            </div>
          </div>
        </div>`;
    }).join('');

    // Enrolled tab
    renderEnrolledCourses(courses, enrolledIds, colors, icons);

  } catch(e) {
    document.getElementById('courses-grid').innerHTML = `<div style="color:var(--danger);padding:20px">Error loading courses</div>`;
  }
}

function renderEnrolledCourses(courses, enrolledIds, colors, icons) {
  const grid     = document.getElementById('enrolled-grid');
  if (!grid) return;
  const enrolled = courses.filter(c => enrolledIds.includes(c._id));

  if (!enrolled.length) {
    grid.innerHTML = `
      <div style="text-align:center;padding:40px;color:var(--text-muted);grid-column:1/-1">
        <i class="fa-solid fa-bookmark" style="font-size:40px;margin-bottom:12px;opacity:.3"></i>
        <div style="font-weight:600">No course enrolled</div>
        <div style="font-size:13px;margin-top:8px">Enroll from All Courses tab</div>
      </div>`;
    return;
  }

  grid.innerHTML = enrolled.map((c,i) => {
    const color = colors[i % colors.length];
    const icon  = icons[i % icons.length];
    return `
      <div class="course-card">
        <div class="course-thumb" style="background:${color}18;display:flex;align-items:center;justify-content:center;height:100px">
          <i class="fa-solid ${icon}" style="font-size:40px;color:${color}"></i>
        </div>
        <div class="course-body">
          <div class="course-name">${c.name}</div>
          <div class="course-meta">${c.code} · ${c.credits||4} Credits</div>
          <div style="margin-top:8px">
            <div class="progress-bar" style="margin-bottom:6px">
              <div class="progress-fill" style="width:${Math.floor(Math.random()*60)+30}%;background:${color}"></div>
            </div>
            <div style="font-size:11px;color:var(--text-muted)">In Progress</div>
          </div>
          <div class="course-footer" style="margin-top:12px">
            <button class="btn btn-ghost btn-sm" onclick="navigateTo('library')">📖 Notes</button>
            <button class="btn btn-accent btn-sm" onclick="navigateTo('assignments')">Assignments</button>
          </div>
        </div>
      </div>`;
  }).join('');
}

function enrollCourse(courseId, courseName) {
  const user       = getUser();
  const enrolledIds = JSON.parse(localStorage.getItem(`enrolled_${user.id}`) || '[]');

  if (!enrolledIds.includes(courseId)) {
    enrolledIds.push(courseId);
    localStorage.setItem(`enrolled_${user.id}`, JSON.stringify(enrolledIds));
  }

  showToast(`Enrolled in ${courseName}!`, 'success');

  // Update card
  const card = document.getElementById(`course-card-${courseId}`);
  if (card) {
    const footer = card.querySelector('.course-footer');
    const badge  = card.querySelector('.badge');
    if (badge)  { badge.textContent = '✓ Enrolled'; badge.className = 'badge badge-success'; }
    if (footer) footer.innerHTML = `
      <button class="btn btn-ghost btn-sm" onclick="unenrollCourse('${courseId}','${courseName}')">Unenroll</button>
      <button class="btn btn-accent btn-sm" onclick="navigateTo('library')">📖 Materials</button>`;
  }
}

function unenrollCourse(courseId, courseName) {
  if (!confirm(`Unenroll from ${courseName}?`)) return;
  const user        = getUser();
  const enrolledIds = JSON.parse(localStorage.getItem(`enrolled_${user.id}`) || '[]');
  const updated     = enrolledIds.filter(id => id !== courseId);
  localStorage.setItem(`enrolled_${user.id}`, JSON.stringify(updated));
  showToast(`Unenrolled from ${courseName}`, 'warning');
  renderCourses(document.getElementById('content-area'));
}

async function renderTimetable(area) {
  area.innerHTML = `
    <div class="page-header"><h1>Timetable</h1><p>Weekly class schedule</p></div>
    <div class="card" id="tt-container">
      <div style="text-align:center;padding:32px;color:var(--text-muted)">Loading...</div>
    </div>`;

  try {
    const data    = await apiGet('/courses');
    const courses = data.courses || [];

    if (!courses.length) {
      document.getElementById('tt-container').innerHTML = `
        <div style="text-align:center;padding:40px;color:var(--text-muted)">
          <i class="fa-solid fa-calendar" style="font-size:40px;margin-bottom:12px;opacity:.3"></i>
          <div>Ask admin to add courses — timetable will be generated automatically</div>
        </div>`;
      return;
    }

    const days  = ['Mon','Tue','Wed','Thu','Fri'];
    const times = ['8-9 AM','9-10 AM','10-11 AM','11-12 PM','12-1 PM','2-3 PM','3-4 PM','4-5 PM'];

    // Time-table refresh (bug fix): only these timetables should be touchable,
    // keep timetable grid rendering consistent.


    const rooms   = ['A-101','A-204','B-102','B-201','C-301','C-205','Lab-1','Lab-2','Lab-3'];
    const colors  = ['has-class','has-class green','has-class purple','has-class orange'];

    // Assign a color to each course
    const courseColors = {};
    courses.forEach((c, i) => { courseColors[c._id] = colors[i % colors.length]; });

    // Auto-rotate seed — aaj ki date se
    const today    = new Date();
    const weekSeed = Math.floor(today.getTime() / (7 * 24 * 60 * 60 * 1000));

    // Deterministic shuffle function
    function seededRandom(seed) {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    }

    // Generate timetable — different each week
    // Rules: ek din mein ek course ek baar, ek slot mein ek hi course
    const schedule = {};
    days.forEach(day => { schedule[day] = {}; });

    // Assign each course 2-3 times per week
    courses.forEach((course, ci) => {
      let assigned = 0;
      const targetSlots = Math.min(3, Math.ceil(8 / courses.length) + 1);

      days.forEach((day, di) => {
        if (assigned >= targetSlots) return;

        // Seed: course index + day index + week number
        const slotSeed = (ci * 100) + (di * 10) + weekSeed + assigned;
        const timeIdx  = Math.floor(seededRandom(slotSeed) * times.length);
        const roomIdx  = Math.floor(seededRandom(slotSeed + 1) * rooms.length);
        const time     = times[timeIdx];

        // Check: is slot already taken AND same course not already in this day
        const dayAlreadyHasCourse = Object.values(schedule[day]).some(s => s.courseId === course._id);
        if (!schedule[day][time] && !dayAlreadyHasCourse) {
          schedule[day][time] = {
            name:     course.name.split(' ').map(w=>w[0]).join('').slice(0,4) || course.code,
            fullName: course.name,
            room:     rooms[roomIdx],
            courseId: course._id,
            color:    courseColors[course._id]
          };
          assigned++;
        }
      });
    });

    // Today highlight
    const todayIdx  = today.getDay(); // 0=Sun, 1=Mon...
    const todayName = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][todayIdx];

    document.getElementById('tt-container').innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <div>
          <div style="font-weight:600">Week of ${today.toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</div>
          <div style="font-size:12px;color:var(--text-muted)">Timetable rotates automatically every week</div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${courses.map(c=>`
            <span style="display:flex;align-items:center;gap:6px;font-size:12px">
              <span style="width:10px;height:10px;border-radius:3px;background:${
                courseColors[c._id]==='has-class'?'var(--accent-soft)':
                courseColors[c._id]==='has-class green'?'var(--success-soft)':
                courseColors[c._id]==='has-class purple'?'var(--purple-soft)':'var(--warning-soft)'
              };border:1px solid ${
                courseColors[c._id]==='has-class'?'rgba(79,110,247,.3)':
                courseColors[c._id]==='has-class green'?'rgba(34,211,160,.3)':
                courseColors[c._id]==='has-class purple'?'rgba(167,139,250,.3)':'rgba(247,185,85,.3)'
              };display:inline-block"></span>
              ${c.name}
            </span>`).join('')}
        </div>
      </div>
      <div class="timetable">
        <div class="tt-head">Time</div>
        ${days.map(d=>`
          <div class="tt-head" style="${d===todayName?'color:var(--accent);font-weight:700':''}">${d}${d===todayName?' ●':''}</div>
        `).join('')}
        ${times.map(t=>`
          <div class="tt-time">${t}</div>
          ${days.map(d=>{
            const cell = schedule[d]?.[t];
            return `<div class="tt-cell ${cell?cell.color:''}" ${cell?`title="${cell.fullName} — Room ${cell.room}"`:''}">
              ${cell?`<div class="tt-subject">${cell.name}</div><div class="tt-room">${cell.room}</div>`:''}
            </div>`;
          }).join('')}
        `).join('')}
      </div>`;

  } catch(e) {
    document.getElementById('tt-container').innerHTML = `<div style="color:var(--danger);padding:20px">Error loading timetable</div>`;
  }
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
      container.innerHTML = `<div style="text-align:center;padding:32px;color:var(--text-muted)"><i class="fa-solid fa-file-pen" style="font-size:36px"></i>No assignments available</div>`;
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

const examSessionFallback = {
  publishedExams: [],
  practiceTests: []
};

const examCache = {};
let activeExamSession = null;
let examTimerInterval = null;

async function fetchExamList() {
  try {
    const response = await apiGet('/exams');
    if (response.success && Array.isArray(response.exams)) {
      return response.exams;
    }
  } catch (err) {
    console.error('Exam list fetch failed:', err);
  }
  return examSessionFallback.publishedExams;
}

async function fetchExamById(examId) {
  try {
    const response = await apiGet(`/exams/${examId}`);
    if (response.success && response.exam) {
      return response.exam;
    }
  } catch (err) {
    console.error('Exam load failed:', err);
  }
  return null;
}

async function submitExamResult(resultPayload) {
  try {
    const response = await apiPost('/exams/submit', resultPayload);
    return response;
  } catch (err) {
    console.error('Exam submit failed:', err);
    return { success: false, message: err.message || 'Submit failed' };
  }
}

function formatExamTime(seconds) {
  const min = Math.floor(seconds / 60).toString().padStart(2, '0');
  const sec = (seconds % 60).toString().padStart(2, '0');
  return `${min}:${sec}`;
}

async function startExam(examId) {
  const exam = await fetchExamById(examId);
  if (!exam) { showToast('Exam data not found','danger'); return; }

  activeExamSession = {
    exam,
    currentQuestion: 0,
    answers: Array(exam.questions.length).fill(null),
    remainingSeconds: exam.duration * 60,
    completed: false,
    score: null
  };

  if (examTimerInterval) clearInterval(examTimerInterval);
  examTimerInterval = setInterval(() => {
    if (!activeExamSession) return;
    activeExamSession.remainingSeconds -= 1;
    if (activeExamSession.remainingSeconds <= 0) {
      clearInterval(examTimerInterval);
      activeExamSession.remainingSeconds = 0;
      completeExam();
    }
    const timerEl = document.getElementById('exam-timer');
    if (timerEl) timerEl.textContent = formatExamTime(activeExamSession.remainingSeconds);
  }, 1000);
  renderExamQuestionView();
}

function renderExamQuestionView() {
  const area = document.getElementById('content-area');
  if (!area || !activeExamSession) return;
  const { exam, currentQuestion, answers, remainingSeconds } = activeExamSession;
  const questionData = exam.questions[currentQuestion];
  const selectedAnswer = answers[currentQuestion];
  const answeredCount = answers.filter(a => a !== null).length;

  area.innerHTML = `
    <div class="page-header"><h1>${exam.title}</h1></div>
    <div class="card" style="margin-bottom:20px">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
        <div>
          <div style="font-weight:700">${exam.title}</div>
          <div style="color:var(--text-muted);font-size:13px">${exam.questions.length} questions · ${exam.duration} min · ${exam.type === 'practice' ? 'Practice Test' : 'Scheduled Exam'}</div>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
          <span class="badge badge-accent">Time left: <strong id="exam-timer">${formatExamTime(remainingSeconds)}</strong></span>
          <span class="badge badge-${answeredCount === exam.questions.length ? 'success' : 'warning'}">Answered ${answeredCount}/${exam.questions.length}</span>
        </div>
      </div>
    </div>
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
        <div>
          <div style="font-weight:700">Q${currentQuestion+1}. ${questionData.question}</div>
          <div style="margin-top:8px;color:var(--text-muted);font-size:13px">Select the correct answer and click Next.</div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-ghost btn-sm" onclick="changeExamQuestion(-1)">Previous</button>
          <button class="btn btn-accent btn-sm" onclick="changeExamQuestion(1)">Next</button>
        </div>
      </div>
      <div style="margin-top:18px">
        ${questionData.options.map((option, index) => `
          <div class="radio-item ${selectedAnswer === index ? 'selected' : ''}" onclick="chooseExamOption(${index})">
            <span>${option}</span>
          </div>
        `).join('')}
      </div>
      <div style="margin-top:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
        <button class="btn btn-danger btn-sm" onclick="completeExam()">Submit Exam</button>
        <div style="color:var(--text-muted);font-size:13px">You can review all questions before submitting.</div>
      </div>
    </div>`;
}

function chooseExamOption(index) {
  if (!activeExamSession) return;
  activeExamSession.answers[activeExamSession.currentQuestion] = index;
  renderExamQuestionView();
}

function changeExamQuestion(direction) {
  if (!activeExamSession) return;
  const nextIndex = activeExamSession.currentQuestion + direction;
  if (nextIndex < 0 || nextIndex >= activeExamSession.exam.questions.length) return;
  activeExamSession.currentQuestion = nextIndex;
  renderExamQuestionView();
}

async function completeExam() {
  if (!activeExamSession) return;
  if (examTimerInterval) clearInterval(examTimerInterval);
  const { exam, answers } = activeExamSession;
  const total = exam.questions.length;
  const payload = {
    examId: exam._id || exam.id,
    answers,
    timeTaken: exam.duration * 60 - activeExamSession.remainingSeconds
  };

  const response = await submitExamResult(payload);
  const correct = answers.reduce((sum, answer, idx) => sum + (answer === exam.questions[idx].answer ? 1 : 0), 0);
  const score = response.success && typeof response.score === 'number' ? response.score : Math.round((correct / total) * 100);

  activeExamSession.completed = true;
  activeExamSession.score = score;

  const area = document.getElementById('content-area');
  if (!area) return;
  area.innerHTML = `
    <div class="page-header"><h1>${exam.title} - Result</h1></div>
    <div class="card" style="text-align:center;padding:40px">
      <div style="font-size:44px;margin-bottom:16px">🎉</div>
      <div style="font-weight:700;font-size:22px">Exam Submitted</div>
      <div style="margin-top:12px;color:var(--text-muted)">Score: <strong>${score}%</strong></div>
      <div style="margin-top:8px;color:var(--text-muted)">Correct: ${correct} / ${total}</div>
      <div style="margin-top:24px;display:flex;justify-content:center;gap:12px;flex-wrap:wrap">
        <button class="btn btn-accent btn-sm" onclick="activeExamSession=null;renderExams(document.getElementById('content-area'))">Back to Exams</button>
        <button class="btn btn-ghost btn-sm" onclick="reviewExamAnswers()">Review Answers</button>
      </div>
    </div>`;

  if (!response.success) {
    showToast(response.message || 'Could not save exam result to backend','warning');
  } else {
    showToast('Exam result saved!','success');
  }
}

function reviewExamAnswers() {
  if (!activeExamSession) return;
  const area = document.getElementById('content-area');
  const { exam, answers } = activeExamSession;
  area.innerHTML = `
    <div class="page-header"><h1>${exam.title} - Review</h1></div>
    <div class="card">
      ${exam.questions.map((question, idx) => {
        const chosen = answers[idx];
        const correct = question.answer;
        return `<div style="margin-bottom:18px;padding:16px;border:1px solid var(--bg-input);border-radius:12px">
          <div style="font-weight:600">Q${idx+1}. ${question.question}</div>
          ${question.options.map((option, optionIndex) => `
            <div style="margin-top:8px;padding:10px;border-radius:10px;background:${optionIndex===correct ? 'rgba(34,197,94,0.12)' : optionIndex===chosen ? 'rgba(59,130,246,0.12)' : 'transparent'};border:1px solid ${optionIndex===correct ? '#22c55e33' : optionIndex===chosen ? '#60a5fa33' : 'transparent'}">
              ${optionIndex===correct ? '✅ ' : optionIndex===chosen ? '🔹 ' : ''}${option}
            </div>`).join('')}
          <div style="margin-top:10px;color:var(--text-muted);font-size:13px">Your answer: ${chosen === null ? 'Not answered' : question.options[chosen]}</div>
        </div>`;
      }).join('')}
      <div style="display:flex;justify-content:center;gap:10px;margin-top:20px">
        <button class="btn btn-accent btn-sm" onclick="activeExamSession=null;renderExams(document.getElementById('content-area'))">Back to Exams</button>
      </div>
    </div>`;
}

async function renderExams(area) {
  if (!area) return;
  const exams = await fetchExamList();
  const practiceTests = exams.filter(exam => exam.type === 'practice');
  const scheduledExams = exams.filter(exam => exam.type !== 'practice');

  area.innerHTML = `
    <div class="page-header"><h1>Online Exams</h1></div>
    <div class="card" style="margin-bottom:20px">
      <div class="card-header"><div class="card-title">🗓️ Published Exams</div></div>
      ${scheduledExams.length ? scheduledExams.map(exam => `
        <div class="exam-card">
          <div class="exam-date">
            <div class="date-num">${new Date(exam.date).getDate()}</div>
            <div class="date-month">${new Date(exam.date).toLocaleString('default',{month:'short'})}</div>
          </div>
          <div style="flex:1">
            <div style="font-weight:700">${exam.title}</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:4px">${exam.course} · ${exam.duration} min</div>
            <div style="margin-top:6px;color:var(--text-muted);font-size:13px">${exam.description}</div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
            <button class="btn btn-ghost btn-sm" onclick="showToast('Exam details are available to students when the exam opens.','accent')">View</button>
          </div>
        </div>
      `).join('') : '<div style="padding:20px;color:var(--text-muted)">No published exams available yet.</div>'}
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">🧪 Practice Tests</div></div>
      ${practiceTests.length ? practiceTests.map(exam => `
        <div style="display:flex;align-items:center;gap:14px;padding:14px;background:var(--bg-input);border-radius:10px;margin-bottom:8px">
          <span style="font-size:24px">📝</span>
          <div style="flex:1">
            <div style="font-weight:600">${exam.title}</div>
            <div style="font-size:12px;color:var(--text-muted)">${exam.questions?.length || 0} Questions · ${exam.duration} min</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:6px">${exam.description || ''}</div>
          </div>
          <button class="btn btn-accent btn-sm" onclick="startExam('${exam._id || exam.id}')">Start Test</button>
        </div>
      `).join('') : '<div style="padding:20px;color:var(--text-muted)">No practice tests are available yet.</div>'}
    </div>`;
}

// ── Socket.io connection ──
let socket = null;
let currentChatUser = null;
let chatMessages = {};

function initSocket() {
  if (socket) return;
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn('Socket auth token missing');
    return;
  }
  if (token.startsWith('demo-token-')) {
    console.warn('Demo mode active: socket.io connection skipped');
    return;
  }

  socket = io('http://localhost:3000', {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    timeout: 10000
  });
  const user = getUser();

  socket.on('connect', () => {
    console.log('✅ Socket connected!');
    socket.emit('user_online', user.id);
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connect error:', err.message || err);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('reconnect_attempt', (count) => {
    console.log(`Socket reconnect attempt ${count}`);
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
            <div>Select a user to start chatting</div>
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
            <div>Select a group</div>
          </div>
        </div>

      </div>
    </div>`;

  // Load users
  loadChatUsers();
  loadChatGroups();
}

async function loadChatUsers() {
  try {
    const data = await apiGet('/chat/users');
    const list = document.getElementById('users-list');
    if (!list) return;

    if (!data.users?.length) {
      list.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:13px">No users available</div>`;
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
      list.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:13px">No groups available</div>`;
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

async function openPrivateChat(userId, userName, userRole) {
  currentChatUser = { id: userId, name: userName, type: 'private' };

  const onlineUsers = window._onlineUsers || [];
  const isOnline    = onlineUsers.includes(userId);
  const initials    = userName.split(' ').map(n=>n[0]).join('').toUpperCase();

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
      <div style="text-align:center;color:var(--text-muted);font-size:12px;margin-bottom:12px">Loading messages...</div>
    </div>
    <div style="padding:12px;border-top:1px solid var(--border);display:flex;gap:8px">
      <input id="private-msg-input" placeholder="Message likho..." style="border-radius:10px;flex:1"
        onkeydown="if(event.key==='Enter')sendPrivateMessage('${userId}','${userName}')">
      <button class="btn btn-accent" onclick="sendPrivateMessage('${userId}','${userName}')" style="border-radius:10px;padding:10px 16px">
        <i class="fa-solid fa-paper-plane"></i>
      </button>
    </div>`;

  // Load history from DB
  try {
    const me   = getUser();
    const data = await apiGet(`/messages/private/${me.id}/${userId}`);
    const area = document.getElementById('chat-messages-area');
    if (!area) return;

    if (!data.messages?.length) {
      area.innerHTML = `<div style="text-align:center;color:var(--text-muted);font-size:13px;margin:auto">Start a conversation!</div>`;
    } else {
      area.innerHTML = '';
      data.messages.forEach(m => {
        const isMe = m.senderId.toString() === me.id;
        appendMessage(m.message, isMe, isMe ? me.name : userName);
      });
    }
    area.scrollTop = area.scrollHeight;
  } catch(e) {
    const area = document.getElementById('chat-messages-area');
    if (area) area.innerHTML = `<div style="text-align:center;color:var(--text-muted);font-size:13px;margin:auto">Start a conversation!</div>`;
  }
}

function openGroupChat(courseId, courseName) {
  const groupKey    = `group_${courseId}`;
  currentChatUser   = { id: groupKey, name: courseName, type: 'group', courseId };

  // Join socket room
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
        ? `<div style="text-align:center;color:var(--text-muted);font-size:13px;margin:auto">Start group chat!</div>`
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

async function sendPrivateMessage(receiverId, receiverName) {
  const input = document.getElementById('private-msg-input');
  const msg   = input?.value?.trim();
  if (!msg) return;

  const user = getUser();
  if (!socket) { showToast('Socket not connected!','danger'); return; }

  const data = {
    senderId: user.id, senderName: user.name,
    receiverId, receiverName, message: msg,
    timestamp: new Date().toISOString()
  };

  socket.emit('private_message', data);
  appendMessage(msg, true, user.name);

  if (!chatMessages[receiverId]) chatMessages[receiverId] = [];
  chatMessages[receiverId].push({ ...data, isMe: true });

  // Save to DB
  try {
    await apiPost('/messages', {
      senderId: user.id, receiverId,
      message: msg, type: 'private'
    });
  } catch(e) { console.log('Message save error:', e); }

  input.value = '';
}
function sendGroupMessage(courseId, courseName) {
  const input = document.getElementById('group-msg-input');
  const msg   = input?.value?.trim();
  if (!msg) return;

  const user = getUser();
  if (!socket) { showToast('Socket not connected!', 'danger'); return; }

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
    <div class="card" style="padding:0;overflow:hidden">
      <div style="padding:14px 20px;border-bottom:1px solid var(--border);display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px">
        <div>
          <div class="card-title">🗺 Campus Map</div>
          <div style="font-size:12px;color:var(--text-muted)">Interactive campus map with route, building, and bus stop info.</div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-ghost btn-sm" onclick="mapShowCampus()">Campus Center</button>
          <button class="btn btn-accent btn-sm" onclick="mapShowBuildings()">Buildings</button>
          <button class="btn btn-accent btn-sm" onclick="mapShowBusStops()">Bus Stops</button>
        </div>
      </div>
      <div id="campus-map" style="height:500px;width:100%"></div>
    </div>`;
  loadLeaflet(initCampusMap);
}

function initCampusMap() {
  const mapDiv = document.getElementById('campus-map');
  if (!mapDiv || mapDiv._leaflet_id) return;

  const COLLEGE_LAT = 28.4089;
  const COLLEGE_LNG = 77.3178;
  const map = L.map('campus-map').setView([COLLEGE_LAT, COLLEGE_LNG], 15);
  window._campusMap = map;
  window._campusCenter = [COLLEGE_LAT, COLLEGE_LNG];

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map);

  const campusIcon = L.divIcon({
    html: '<div style="background:#22d3a0;color:white;border-radius:12px;width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-size:18px;border:3px solid white;box-shadow:0 2px 10px rgba(0,0,0,.25)">🏫</div>',
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 40]
  });

  const buildingIcon = L.divIcon({
    html: '<div style="background:#4f6ef7;color:white;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;font-size:14px;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,.2)">🏛</div>',
    className: '',
    iconSize: [30, 30],
    iconAnchor: [15, 30]
  });

  const stopIcon = L.divIcon({
    html: '<div style="background:#f7b955;color:white;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-size:12px;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,.2)">🛑</div>',
    className: '',
    iconSize: [26, 26],
    iconAnchor: [13, 26]
  });

  const buildings = [
    { name: 'Main Academic Block', lat: 28.4095, lng: 77.3180 },
    { name: 'Library & Learning Center', lat: 28.4082, lng: 77.3168 },
    { name: 'Science Labs', lat: 28.4088, lng: 77.3191 },
    { name: 'Sports Complex', lat: 28.4075, lng: 77.3170 },
    { name: 'Hostel Block', lat: 28.4070, lng: 77.3185 }
  ];

  const busStops = [
    { name: 'Faridabad City Stop', lat: 28.4301, lng: 77.3150, eta: '8 min' },
    { name: 'Sector 28 Stop', lat: 28.3950, lng: 77.3300, eta: '22 min' },
    { name: 'NIT Gate Stop', lat: 28.3870, lng: 77.3080, eta: 'Arrived' }
  ];

  const campusMarker = L.marker([COLLEGE_LAT, COLLEGE_LNG], { icon: campusIcon })
    .addTo(map)
    .bindPopup('<strong>🏫 KD Campus</strong><br>Main campus location');

  const buildingMarkers = buildings.map(b => L.marker([b.lat, b.lng], { icon: buildingIcon })
    .bindPopup(`<strong>${b.name}</strong>`));
  const busStopMarkers = busStops.map(s => L.marker([s.lat, s.lng], { icon: stopIcon })
    .bindPopup(`<strong>${s.name}</strong><br>ETA: ${s.eta}`));

  window._campusBuildingsLayer = L.layerGroup(buildingMarkers).addTo(map);
  window._campusBusStopsLayer = L.layerGroup(busStopMarkers).addTo(map);

  L.polyline(
    [[28.4301, 77.3150], [28.4200, 77.3050], [COLLEGE_LAT, COLLEGE_LNG]],
    { color: '#22d3a0', weight: 4, opacity: 0.8, dashArray: '8,4' }
  ).addTo(map);
  L.polyline(
    [[28.3950, 77.3300], [COLLEGE_LAT, COLLEGE_LNG]],
    { color: '#4f6ef7', weight: 4, opacity: 0.8, dashArray: '8,4' }
  ).addTo(map);
  L.polyline(
    [[28.3870, 77.3080], [COLLEGE_LAT, COLLEGE_LNG]],
    { color: '#f7b955', weight: 4, opacity: 0.8, dashArray: '8,4' }
  ).addTo(map);
}

function mapShowCampus() {
  if (window._campusMap && window._campusCenter) {
    window._campusMap.setView(window._campusCenter, 15);
    showToast('Campus center par aa gaye!','success');
  }
}

function mapShowBuildings() {
  if (window._campusMap && window._campusBuildingsLayer) {
    window._campusBuildingsLayer.addTo(window._campusMap);
    const bounds = window._campusBuildingsLayer.getBounds();
    if (bounds.isValid()) window._campusMap.fitBounds(bounds.pad(0.5));
    showToast('Campus buildings are visible.','accent');
  }
}

function mapShowBusStops() {
  if (window._campusMap && window._campusBusStopsLayer) {
    window._campusBusStopsLayer.addTo(window._campusMap);
    const bounds = window._campusBusStopsLayer.getBounds();
    if (bounds.isValid()) window._campusMap.fitBounds(bounds.pad(0.5));
    showToast('Bus stops are being shown.','accent');
  }
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
    if (!data.students?.length) { container.innerHTML=`<div style="text-align:center;padding:32px;color:var(--text-muted)">No students</div>`; return; }
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
        <div>Select course first</div>
      </div>
    </div>
    <button class="btn btn-accent" style="width:100%;margin-top:16px" onclick="saveAttendance()">
      <i class="fa-solid fa-floppy-disk"></i> Save Attendance
    </button>`;

  // Load courses in dropdown
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
      showToast('Ask admin to add courses first', 'warning');
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
      list.innerHTML = `<div style="text-align:center;padding:32px;color:var(--text-muted)">No students available</div>`;
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
  showToast(`All students marked ${status}!`, 'success');
}

async function renderFaceAttendance(area) {
  area.innerHTML = `
    <div class="page-header"><h1>Face Attendance</h1><p>Biometric attendance using face recognition</p></div>
    
    <div class="grid grid-2" style="margin-bottom:20px">
      <div class="card">
        <div class="card-header"><div class="card-title">📹 Camera Feed</div></div>
        <div style="padding:16px">
          <video id="face-video" autoplay muted style="width:100%;border-radius:8px;border:1px solid var(--border)"></video>
          <div style="margin-top:12px;display:flex;gap:8px">
            <button class="btn btn-accent" onclick="startFaceAttendance()">🎥 Start Camera</button>
            <button class="btn btn-success" onclick="captureFace()">📸 Capture Face</button>
            <button class="btn btn-danger" onclick="stopFaceAttendance()">⏹️ Stop</button>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header"><div class="card-title">✅ Recognition Result</div></div>
        <div id="face-result" style="padding:16px;text-align:center;color:var(--text-muted)">
          <i class="fa-solid fa-face-viewfinder" style="font-size:40px;margin-bottom:12px"></i>
          <div>Start camera and capture face</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">📝 Attendance Session</div>
        <div style="display:flex;gap:8px">
          <select id="face-course-select" style="width:auto">
            <option value="">Select Course</option>
          </select>
          <input type="date" id="face-date" value="${new Date().toISOString().split('T')[0]}" style="width:auto">
        </div>
      </div>
      <div id="face-attendance-list" style="padding:16px">
        <div style="text-align:center;color:var(--text-muted)">
          <i class="fa-solid fa-users" style="font-size:36px;margin-bottom:8px"></i>
          <div>Select course to start attendance session</div>
        </div>
      </div>
    </div>`;

  // Load courses
  try {
    const data = await apiGet('/courses');
    const select = document.getElementById('face-course-select');
    if (data.courses?.length > 0) {
      data.courses.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c._id;
        opt.textContent = `${c.name} (${c.code})`;
        select.appendChild(opt);
      });
    } else {
      // Demo courses
      const demoCourses = [
        { _id: 'demo-course-1', name: 'Computer Science 101', code: 'CS101' },
        { _id: 'demo-course-2', name: 'Mathematics 201', code: 'MATH201' },
        { _id: 'demo-course-3', name: 'Physics 301', code: 'PHY301' }
      ];
      demoCourses.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c._id;
        opt.textContent = `${c.name} (${c.code})`;
        select.appendChild(opt);
      });
    }
  } catch(e) {
    // Demo courses fallback
    const select = document.getElementById('face-course-select');
    const demoCourses = [
      { _id: 'demo-course-1', name: 'Computer Science 101', code: 'CS101' },
      { _id: 'demo-course-2', name: 'Mathematics 201', code: 'MATH201' },
      { _id: 'demo-course-3', name: 'Physics 301', code: 'PHY301' }
    ];
    demoCourses.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c._id;
      opt.textContent = `${c.name} (${c.code})`;
      select.appendChild(opt);
    });
  }

  // Load face-api models
  await loadFaceAPIModels();
}

async function loadFaceAPIModels() {
  try {
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    console.log('Face API models loaded');
  } catch(e) {
    console.log('Error loading face models:', e);
    showToast('Face recognition models failed to load', 'danger');
  }
}

async function startFaceAttendance() {
  try {
    const video = document.getElementById('face-video');
    faceStream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = faceStream;
    
    // Create canvas for drawing
    faceCanvas = faceapi.createCanvasFromMedia(video);
    faceCanvas.style.position = 'absolute';
    faceCanvas.style.top = video.offsetTop + 'px';
    faceCanvas.style.left = video.offsetLeft + 'px';
    video.parentNode.appendChild(faceCanvas);
    
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(faceCanvas, displaySize);
    
    showToast('Camera started! Click capture to recognize face.', 'success');
  } catch(e) {
    console.log('Camera error:', e);
    showToast('Camera access denied or unavailable', 'danger');
  }
}

async function captureFace() {
  const video = document.getElementById('face-video');
  const courseId = document.getElementById('face-course-select')?.value;
  
  if (!video.srcObject) {
    showToast('Start camera first', 'warning');
    return;
  }
  
  if (!courseId) {
    showToast('Select course first', 'warning');
    return;
  }

  try {
    const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();
    
    if (!detections) {
      showToast('No face detected. Try again.', 'warning');
      return;
    }

    // Draw detection box
    if (faceCanvas) {
      const displaySize = { width: video.width, height: video.height };
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      faceCanvas.getContext('2d').clearRect(0, 0, faceCanvas.width, faceCanvas.height);
      faceapi.draw.drawDetections(faceCanvas, resizedDetections);
    }

    // Send to backend for verification
    const result = await apiPost('/attendance/face-verify', {
      courseId: courseId,
      faceDescriptor: Array.from(detections.descriptor)
    });

    const resultDiv = document.getElementById('face-result');
    if (result.success) {
      resultDiv.innerHTML = `
        <div style="color:var(--success)">
          <i class="fa-solid fa-check-circle" style="font-size:40px;margin-bottom:12px"></i>
          <div style="font-weight:700;font-size:16px">${result.student.name}</div>
          <div style="font-size:13px;margin-bottom:8px">${result.student.email}</div>
          <div style="font-size:12px;color:var(--text-muted)">Confidence: ${Math.round(result.confidence * 100)}%</div>
          <button class="btn btn-success btn-sm" style="margin-top:12px" onclick="markFaceAttendance('${result.student.id}')">
            ✅ Mark Present
          </button>
        </div>`;
      showToast(`Face recognized: ${result.student.name}`, 'success');
    } else {
      resultDiv.innerHTML = `
        <div style="color:var(--danger)">
          <i class="fa-solid fa-times-circle" style="font-size:40px;margin-bottom:12px"></i>
          <div style="font-weight:700">Face Not Recognized</div>
          <div style="font-size:13px;margin-top:4px">${result.message}</div>
        </div>`;
      showToast('Face not recognized', 'danger');
    }

  } catch(e) {
    console.log('Face capture error:', e);
    showToast('Error processing face', 'danger');
  }
}

async function markFaceAttendance(studentId) {
  const courseId = document.getElementById('face-course-select')?.value;
  const date = document.getElementById('face-date')?.value;
  
  if (!courseId || !date) {
    showToast('Course or date missing', 'warning');
    return;
  }

  try {
    const result = await apiPost('/attendance', {
      courseId: courseId,
      date: date,
      records: [{ studentId: studentId, status: 'present' }],
      facultyId: getUser().id
    });
    
    if (result.success) {
      showToast('Attendance marked successfully!', 'success');
      loadFaceAttendanceList();
    } else {
      showToast('Failed to mark attendance', 'danger');
    }
  } catch(e) {
    showToast('Error marking attendance', 'danger');
  }
}

async function loadFaceAttendanceList() {
  const courseId = document.getElementById('face-course-select')?.value;
  const date = document.getElementById('face-date')?.value;
  
  if (!courseId) return;

  const listDiv = document.getElementById('face-attendance-list');
  listDiv.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-muted)">Loading...</div>`;

  try {
    // Get course students
    const courseData = await apiGet(`/courses/${courseId}`);
    const students = courseData.course?.students || [];
    
    // Get today's attendance
    const attData = await apiGet(`/attendance?courseId=${courseId}&date=${date}`);
    const attendance = attData.attendance || [];
    
    const presentIds = attendance.flatMap(a => a.records.filter(r => r.status === 'present').map(r => r.studentId.toString()));
    
    listDiv.innerHTML = `
      <div style="margin-bottom:16px;font-weight:600">Today's Attendance (${new Date(date).toLocaleDateString('en-IN')})</div>
      ${students.map(s => {
        const isPresent = presentIds.includes(s._id.toString());
        return `
          <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
            <div class="user-avatar" style="width:32px;height:32px;font-size:11px">${s.name.split(' ').map(n=>n[0]).join('').toUpperCase()}</div>
            <div style="flex:1">
              <div style="font-weight:600">${s.name}</div>
              <div style="font-size:12px;color:var(--text-muted)">${s.email}</div>
            </div>
            <span class="badge badge-${isPresent?'success':'danger'}">${isPresent?'Present':'Absent'}</span>
          </div>`;
      }).join('')}`;
  } catch(e) {
    listDiv.innerHTML = `<div style="color:var(--danger);padding:20px">Error loading attendance</div>`;
  }
}

function stopFaceAttendance() {
  if (faceStream) {
    faceStream.getTracks().forEach(track => track.stop());
    faceStream = null;
  }
  const video = document.getElementById('face-video');
  if (video) video.srcObject = null;
  if (faceCanvas) {
    faceCanvas.remove();
    faceCanvas = null;
  }
  showToast('Camera stopped', 'accent');
}

// Event listener for course change
document.addEventListener('change', function(e) {
  if (e.target.id === 'face-course-select') {
    loadFaceAttendanceList();
  }
});

async function saveAttendance() {
  const courseId = document.getElementById('att-course-select')?.value;
  const date     = document.getElementById('att-date')?.value;
  const students = window._attStudents || [];
  const user     = getUser(); // ← add this

  if (!courseId) { showToast('Select a course first', 'warning'); return; }
  if (!students.length) { showToast('No students', 'warning'); return; }

  const records = students.map(s => ({
    studentId: s._id,
    status: window._attStatus?.[s._id] || 'absent'
  }));

  try {
    const data = await apiPost('/attendance', {
      courseId,
      date,
      records,
      facultyId: user.id  // ← add this
    });
    if (data.success) {
      showToast('Attendance saved!', 'success');
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
    if (!data.assignments?.length) { list.innerHTML=`<div style="text-align:center;padding:20px;color:var(--text-muted)">No assignments</div>`; return; }
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
    <div class="page-header"><h1>Upload Marks</h1><p>Enter student marks and publish</p></div>

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
        <div>Select course first</div>
      </div>
    </div>`;

  // Load courses
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
      showToast('Ask admin to add courses first', 'warning');
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
      container.innerHTML = `<div style="text-align:center;padding:32px;color:var(--text-muted)">No students available</div>`;
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

  if (!courseId) { showToast('Select course', 'warning'); return; }
  if (isNaN(marks) || marks < 0) { showToast('Valid marks daalo', 'warning'); return; }
  if (marks > maxMarks) { showToast(`Marks cannot exceed ${maxMarks}`, 'warning'); return; }

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
      showToast(`${studentName}'s marks saved!`, 'success');
      // Highlight row
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

  if (!courseId) { showToast('Select course first', 'warning'); return; }
  if (!students.length) { showToast('Load students first', 'warning'); return; }

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

  if (saved > 0) showToast(`${saved} students' marks published!`, 'success');
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
          <div style="font-weight:600">No courses assigned</div>
          <div style="font-size:13px;margin-top:8px">Contact admin to assign courses</div>
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

async function renderAnnouncements(area) {
  const user = getUser();
  area.innerHTML = `
    <div class="page-header"><h1>Announcements</h1></div>

    <!-- Create -->
    <div class="card" style="margin-bottom:20px">
      <div class="card-title" style="margin-bottom:16px">New Announcement</div>
      <div class="form-group"><label>Title</label><input id="ann-title" placeholder="Announcement title..."></div>
      <div class="form-group"><label>Message</label><textarea id="ann-content" rows="4" placeholder="Type your announcement..."></textarea></div>
      <div class="form-group"><label>Type</label>
        <select id="ann-type">
          <option value="general">General</option>
          <option value="exam">Exam</option>
          <option value="holiday">Holiday</option>
          <option value="event">Event</option>
          <option value="fee">Fee</option>
        </select>
      </div>
      <div style="display:flex;gap:12px;margin-top:8px">
        <button class="btn btn-accent" onclick="postAnnouncement('${user.id}')">
          <i class="fa-solid fa-bullhorn"></i> Post Announcement
        </button>
      </div>
    </div>

    <!-- List -->
    <div id="ann-list">
      <div style="text-align:center;padding:20px;color:var(--text-muted)">Loading...</div>
    </div>`;

  loadAnnouncements();
}

async function postAnnouncement(postedBy) {
  const title   = document.getElementById('ann-title')?.value?.trim();
  const content = document.getElementById('ann-content')?.value?.trim();
  const type    = document.getElementById('ann-type')?.value;

  if (!title||!content) { showToast('Please fill title and message','warning'); return; }

  try {
    const data = await apiPost('/announcements', { title, content, type, postedBy });
    if (data.success) {
      showToast('Announcement posted!','success');
      document.getElementById('ann-title').value   = '';
      document.getElementById('ann-content').value = '';
      loadAnnouncements();
      updateNotificationBadgeOnLoad(); // Update badge after posting
    } else showToast(data.message||'Error','danger');
  } catch(e) { showToast('Server error','danger'); }
}

async function loadAnnouncements() {
  try {
    const data = await apiGet('/announcements');
    const list = document.getElementById('ann-list');
    if (!list) return;
    if (!data.notices?.length) {
      list.innerHTML = `<div style="text-align:center;padding:32px;color:var(--text-muted)">No announcements available</div>`;
      return;
    }
    const typeColors = { general:'accent', exam:'danger', holiday:'success', event:'purple', fee:'warning' };
    list.innerHTML = data.notices.map(n => `
      <div class="card" style="margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div>
            <div style="font-weight:700;font-size:15px">${n.title}</div>
            <div style="font-size:13px;color:var(--text-secondary);margin-top:6px">${n.content}</div>
            <div style="margin-top:8px;display:flex;gap:8px;align-items:center">
              <span class="badge badge-${typeColors[n.type]||'accent'}">${n.type}</span>
              <span style="font-size:11px;color:var(--text-muted)">
                ${n.postedBy?.name||'Admin'} · ${new Date(n.createdAt).toLocaleDateString('en-IN')}
              </span>
            </div>
          </div>
          ${currentRole==='faculty'||currentRole==='admin'?`
            <button class="btn btn-danger btn-sm" onclick="deleteAnnouncement('${n._id}')">
              <i class="fa-solid fa-trash"></i>
            </button>`:''}
        </div>
      </div>`).join('');
  } catch(e) {}
}

async function deleteAnnouncement(id) {
  if (!confirm('Delete this announcement?')) return;
  try {
    const token = localStorage.getItem('token');
    await fetch(`${API}/announcements/${id}`, { method:'DELETE', headers:{'Authorization':`Bearer ${token}`} });
    showToast('Deleted!','danger');
    loadAnnouncements();
    updateNotificationBadgeOnLoad(); // Update badge after deleting
  } catch(e) { showToast('Error','danger'); }
}

async function renderStudentAnnouncements(area) {
  area.innerHTML = `
    <div class="page-header">
      <h1>Announcements</h1>
    </div>
    <div class="card">
      <div id="student-announcements-list">
        <div style="text-align:center;padding:32px;color:var(--text-muted)">Loading announcements...</div>
      </div>
    </div>
  `;
  
  try {
    const data = await apiGet('/announcements');
    const list = document.getElementById('student-announcements-list');
    if (!data.notices?.length) {
      list.innerHTML = `<div style="text-align:center;padding:32px;color:var(--text-muted)">No announcements available</div>`;
      return;
    }
    
    const typeColors = { general:'accent', exam:'danger', holiday:'success', event:'purple', fee:'warning' };
    list.innerHTML = data.notices.map(n => `
      <div class="card" style="margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div>
            <div style="font-weight:700;font-size:15px">${n.title}</div>
            <div style="font-size:13px;color:var(--text-secondary);margin-top:6px">${n.content}</div>
            <div style="margin-top:8px;display:flex;gap:8px;align-items:center">
              <span class="badge badge-${typeColors[n.type]||'accent'}">${n.type}</span>
              <span style="font-size:11px;color:var(--text-muted)">
                ${n.postedBy?.name||'Admin'} · ${new Date(n.createdAt).toLocaleDateString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    const list = document.getElementById('student-announcements-list');
    list.innerHTML = `<div style="text-align:center;padding:32px;color:var(--text-muted)">Failed to load announcements</div>`;
  }
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
      pendingDiv.innerHTML=`<div style="text-align:center;padding:20px;color:var(--text-muted)">✅ No pending approvals</div>`;
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
      list.innerHTML=`<div style="text-align:center;padding:32px;color:var(--text-muted)"><i class="fa-solid fa-check-circle" style="font-size:36px;margin-bottom:8px"></i>No pending approvals!</div>`;
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
    document.getElementById('approvals-list').innerHTML=`<div style="text-align:center;padding:32px;color:var(--danger)">❌ Cannot connect to server</div>`;
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
      if(list&&!list.querySelector('[id^="approval-"]')) list.innerHTML=`<div style="text-align:center;padding:32px;color:var(--text-muted)"><div style="font-size:36px;margin-bottom:8px">✅</div>All approved!</div>`;
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
    if (!data.faculty?.length) { container.innerHTML=`<div style="text-align:center;padding:32px;color:var(--text-muted)">No faculty</div>`; return; }
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

function renderManageCourses(area) {
  area.innerHTML = `
    <div class="page-header"><h1>Manage Courses</h1></div>
    <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap">
      <div class="search-bar" style="flex:1"><span>🔍</span><input placeholder="Search courses..." id="course-search" oninput="filterCourses()"></div>
      <button class="btn btn-accent" onclick="showAddCourseForm()">+ Add Course</button>
    </div>

    <!-- Add Course Form (hidden by default) -->
    <div id="add-course-form" style="display:none;margin-bottom:20px">
      <div class="card">
        <div class="card-title" style="margin-bottom:16px">Add New Course</div>
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

// ═══════════ ADMIN: DEPARTMENTS ═══════════

async function renderDepartments(area) {
  area.innerHTML = `
    <div class="page-header"><h1>Departments</h1><p>Manage department records</p></div>

    <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;align-items:center">
      <div class="search-bar" style="flex:1;min-width:220px"><span>🔍</span>
        <input placeholder="Search departments..." id="dept-search" oninput="filterDepartments()">
      </div>
      <button class="btn btn-accent" onclick="showAddDepartmentForm()">+ Add Department</button>
    </div>

    <div id="add-department-form" style="display:none;margin-bottom:20px">
      <div class="card">
        <div class="card-title" style="margin-bottom:16px">Add New Department</div>
        <div class="grid grid-2">
          <div class="form-group"><label>Department Name</label><input id="d-name" placeholder="e.g. Computer Science"></div>
          <div class="form-group"><label>Department Code</label><input id="d-code" placeholder="e.g. CS"></div>
          <div class="form-group"><label>Description</label><input id="d-desc" placeholder="Short description"/></div>
          <div class="form-group"><label>Head Faculty (Email optional)</label><input id="d-head" placeholder="Faculty name/email/id (optional)"/></div>
        </div>
        <div style="display:flex;gap:12px;margin-top:8px">
          <button class="btn btn-accent" onclick="addDepartment()">+ Create</button>
          <button class="btn btn-ghost" onclick="document.getElementById('add-department-form').style.display='none'">Cancel</button>
        </div>
      </div>
    </div>

    <div class="card" id="departments-container">
      <div style="text-align:center;padding:32px;color:var(--text-muted)">Loading...</div>
    </div>`;

  try {
    const data = await apiGet('/departments');
    const list = document.getElementById('departments-container');
    const departments = data.departments || [];
    window._allDepartments = departments;

    if (!departments.length) {
      list.innerHTML = `<div style="text-align:center;padding:32px;color:var(--text-muted)">No departments found</div>`;
      return;
    }

    list.innerHTML = `
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Department</th>
              <th>Code</th>
              <th>Head</th>
              <th>Courses</th>
              <th>Students</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${departments.map(d => `
              <tr>
                <td style="font-weight:700;color:var(--text-primary)">${d.name}</td>
                <td><span class="badge badge-accent" style="font-family:monospace">${d.code || 'N/A'}</span></td>
                <td>${d.headFaculty?.name || 'N/A'}</td>
                <td>${d.courses?.length || 0}</td>
                <td>${d.students?.length || 0}</td>
                <td>
                  <div style="display:flex;gap:6px">
                    <button class="btn btn-ghost btn-sm" onclick="showToast('Edit coming soon','accent')">✏️</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteDepartment('${d._id}', '${d.name}')">🗑️</button>
                  </div>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  } catch (e) {
    const list = document.getElementById('departments-container');
    list.innerHTML = `<div style="text-align:center;padding:32px;color:var(--danger)">Error loading departments</div>`;
  }
}

function showAddDepartmentForm() {
  const form = document.getElementById('add-department-form');
  if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function filterDepartments() {
  const q = document.getElementById('dept-search')?.value?.toLowerCase();
  const all = window._allDepartments || [];
  const filtered = all.filter(d =>
    (d.name || '').toLowerCase().includes(q) ||
    (d.code || '').toLowerCase().includes(q)
  );

  const container = document.getElementById('departments-container');
  if (!container) return;

  if (!filtered.length) {
    container.innerHTML = `<div style="text-align:center;padding:32px;color:var(--text-muted)">No department found</div>`;
    return;
  }

  container.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Department</th>
            <th>Code</th>
            <th>Head</th>
            <th>Courses</th>
            <th>Students</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map(d => `
            <tr>
              <td style="font-weight:700;color:var(--text-primary)">${d.name}</td>
              <td><span class="badge badge-accent" style="font-family:monospace">${d.code || 'N/A'}</span></td>
              <td>${d.headFaculty?.name || 'N/A'}</td>
              <td>${d.courses?.length || 0}</td>
              <td>${d.students?.length || 0}</td>
              <td>
                <div style="display:flex;gap:6px">
                  <button class="btn btn-ghost btn-sm" onclick="showToast('Edit coming soon','accent')">✏️</button>
                  <button class="btn btn-danger btn-sm" onclick="deleteDepartment('${d._id}', '${d.name}')">🗑️</button>
                </div>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

async function addDepartment() {
  const name = document.getElementById('d-name')?.value?.trim();
  const code = document.getElementById('d-code')?.value?.trim();
  const description = document.getElementById('d-desc')?.value?.trim();
  const headFaculty = document.getElementById('d-head')?.value?.trim();

  if (!name || !code) {
    showToast('Department name aur code bharo','warning');
    return;
  }

  const payload = {
    name,
    code,
    description,
  };

  // Optional: send head faculty identifier if provided (backend supports headFacultyId)
  if (headFaculty) payload.headFacultyId = headFaculty;

  try {
    const data = await apiPost('/departments', payload);
    if (data.success) {
      showToast('Department created!','success');
      document.getElementById('add-department-form').style.display = 'none';
      renderDepartments(document.getElementById('content-area'));
      // Reset form
      document.getElementById('d-name').value = '';
      document.getElementById('d-code').value = '';
      document.getElementById('d-desc').value = '';
      document.getElementById('d-head').value = '';
    } else {
      showToast(data.message || 'Create failed','danger');
    }
  } catch(e) {
    showToast('Server error','danger');
  }
}

async function deleteDepartment(id, name) {
  if (!confirm(`Delete ${name}?`)) return;
  try {
    const data = await apiPut(`/departments/${id}`, { _method: 'DELETE' });
    // If backend uses DELETE route, prefer direct fetch fallback:
  } catch (e) {
    // ignore
  }

  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API}/departments/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) {
      showToast('Department deleted','danger');
      renderDepartments(document.getElementById('content-area'));
    } else {
      showToast(data.message || 'Delete failed','danger');
    }
  } catch(e) {
    showToast('Server error','danger');
  }
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
        <i class="fa-solid fa-book" style="font-size:48px;margin-bottom:12px"></i>
        <div style="font-weight:600">No courses available</div>
        <div style="font-size:13px;margin-top:8px">Use the Add Course button to create a new course</div>
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
      showToast(`${name} course added!`, 'success');
      document.getElementById('add-course-form').style.display = 'none';
      loadCourses();
    } else {
      showToast(data.message || 'Error aaya', 'danger');
    }
  } catch(e) { showToast('Server error', 'danger'); }
}

async function deleteCourse(id, name) {
  if (!confirm(`Delete "${name}" course?`)) return;
  try {
    const token = localStorage.getItem('token');
    await fetch(`${API}/courses/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    showToast(`${name} deleted`, 'danger');
    loadCourses();
  } catch(e) { showToast('Error', 'danger'); }
}

async function renderAnalytics(area) {
  area.innerHTML = `
    <div class="page-header"><h1>Analytics</h1><p>Real-time system insights</p></div>
    <div class="grid grid-4" style="margin-bottom:20px">
      <div class="stat-card" style="--stat-color:var(--success)"><div class="stat-label">TOTAL STUDENTS</div><div class="stat-value" id="an-students">--</div></div>
      <div class="stat-card" style="--stat-color:var(--accent)"><div class="stat-label">TOTAL FACULTY</div><div class="stat-value" id="an-faculty">--</div></div>
      <div class="stat-card" style="--stat-color:var(--purple)"><div class="stat-label">COURSES</div><div class="stat-value" id="an-courses">--</div></div>
      <div class="stat-card" style="--stat-color:var(--warning)"><div class="stat-label">ASSIGNMENTS</div><div class="stat-value" id="an-asgn">--</div></div>
    </div>
    <div class="grid grid-2" style="margin-bottom:20px">
      <div class="card">
        <div class="card-title" style="margin-bottom:16px">Department-wise Students</div>
        <canvas id="dept-chart" height="200"></canvas>
      </div>
      <div class="card">
        <div class="card-title" style="margin-bottom:16px">Role Distribution</div>
        <canvas id="role-chart" height="200"></canvas>
      </div>
    </div>
    <div class="grid grid-2">
      <div class="card">
        <div class="card-title" style="margin-bottom:16px">Fee Collection Status</div>
        <canvas id="fee-chart" height="200"></canvas>
      </div>
      <div class="card">
        <div class="card-title" style="margin-bottom:16px">Monthly Registrations</div>
        <canvas id="reg-chart" height="200"></canvas>
      </div>
    </div>`;

  try {
    const [students, faculty, courses, asgns] = await Promise.all([
      apiGet('/students'), apiGet('/faculty'),
      apiGet('/courses'), apiGet('/assignments')
    ]);

    const stuList  = students.students || [];
    const facList  = faculty.faculty   || [];
    const corList  = courses.courses   || [];
    const asgnList = asgns.assignments || [];

    // Stats
    document.getElementById('an-students').textContent = stuList.length;
    document.getElementById('an-faculty').textContent  = facList.length;
    document.getElementById('an-courses').textContent  = corList.length;
    document.getElementById('an-asgn').textContent     = asgnList.length;

    const isDark  = document.documentElement.dataset.theme === 'dark';
    const textColor = isDark ? '#8892b0' : '#5a6285';
    const gridColor = isDark ? '#232840' : '#e0e4f0';

    Chart.defaults.color = textColor;

    // 1. Department-wise chart
    const deptCount = {};
    stuList.forEach(s => {
      const dept = s.department || 'Unknown';
      deptCount[dept] = (deptCount[dept] || 0) + 1;
    });

    new Chart(document.getElementById('dept-chart'), {
      type: 'bar',
      data: {
        labels: Object.keys(deptCount),
        datasets: [{
          label: 'Students',
          data: Object.values(deptCount),
          backgroundColor: ['#4f6ef7','#22d3a0','#a78bfa','#f7b955','#f75f6e','#22d3a0'],
          borderRadius: 6,
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: gridColor } },
          y: { grid: { color: gridColor }, beginAtZero: true }
        }
      }
    });

    // 2. Role distribution donut
    new Chart(document.getElementById('role-chart'), {
      type: 'doughnut',
      data: {
        labels: ['Students', 'Faculty'],
        datasets: [{
          data: [stuList.length, facList.length],
          backgroundColor: ['#4f6ef7', '#22d3a0'],
          borderWidth: 0,
        }]
      },
      options: {
        responsive: true,
        cutout: '65%',
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });

    // 3. Fee collection chart
    let feePaid = 0, feePending = 0;
    for (const s of stuList.slice(0, 10)) {
      try {
        const feeData = await apiGet(`/fees/student/${s._id}`);
        feePaid    += feeData.summary?.paid    || 0;
        feePending += feeData.summary?.pending || 0;
      } catch(e) {}
    }

    new Chart(document.getElementById('fee-chart'), {
      type: 'doughnut',
      data: {
        labels: ['Collected', 'Pending'],
        datasets: [{
          data: [feePaid || 1, feePending || 0],
          backgroundColor: ['#22d3a0', '#f75f6e'],
          borderWidth: 0,
        }]
      },
      options: {
        responsive: true,
        cutout: '65%',
        plugins: { legend: { position: 'bottom' } }
      }
    });

    // 4. Monthly registrations
    const monthCount = {};
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    [...stuList, ...facList].forEach(u => {
      const m = new Date(u.createdAt || Date.now()).getMonth();
      monthCount[months[m]] = (monthCount[months[m]] || 0) + 1;
    });

    new Chart(document.getElementById('reg-chart'), {
      type: 'line',
      data: {
        labels: months,
        datasets: [{
          label: 'Registrations',
          data: months.map(m => monthCount[m] || 0),
          borderColor: '#4f6ef7',
          backgroundColor: 'rgba(79,110,247,0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#4f6ef7',
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: gridColor } },
          y: { grid: { color: gridColor }, beginAtZero: true }
        }
      }
    });

  } catch(e) { console.log('Analytics error:', e); }
}

async function renderFinance(area) {
  area.innerHTML = `
    <div class="page-header"><h1>Finance & Fees</h1></div>

    <!-- Add Fee Form -->
    <div class="card" style="margin-bottom:20px">
      <div class="card-title" style="margin-bottom:16px">Add Fee to Student</div>
      <div class="grid grid-2">
        <div class="form-group">
          <label>Select Student</label>
          <select id="fee-student-select" style="width:100%">
            <option value="">Loading students...</option>
          </select>
        </div>
        <div class="form-group">
          <label>Fee Type</label>
          <select id="fee-type">
            <option value="tuition">Tuition Fee</option>
            <option value="hostel">Hostel Fee</option>
            <option value="exam">Exam Fee</option>
            <option value="lab">Lab Fee</option>
            <option value="library">Library Fee</option>
            <option value="sports">Sports Fee</option>
          </select>
        </div>
        <div class="form-group">
          <label>Amount (₹)</label>
          <input type="number" id="fee-amount" placeholder="e.g. 45000">
        </div>
        <div class="form-group">
          <label>Due Date</label>
          <input type="date" id="fee-due-date">
        </div>
        <div class="form-group">
          <label>Description</label>
          <input id="fee-desc" placeholder="e.g. Tuition Fee - Semester 6">
        </div>
        <div class="form-group">
          <label>Semester</label>
          <select id="fee-semester">
            ${[1,2,3,4,5,6,7,8].map(s=>`<option value="${s}" ${s===6?'selected':''}>Semester ${s}</option>`).join('')}
          </select>
        </div>
      </div>
      <button class="btn btn-accent" style="margin-top:8px" onclick="addFeeForStudent()">
        <i class="fa-solid fa-plus"></i> Add Fee
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-4" style="margin-bottom:20px">
      <div class="stat-card" style="--stat-color:var(--success)"><div class="stat-label">COLLECTED</div><div class="stat-value" id="total-collected">--</div></div>
      <div class="stat-card" style="--stat-color:var(--danger)"><div class="stat-label">PENDING</div><div class="stat-value" id="total-pending">--</div></div>
      <div class="stat-card" style="--stat-color:var(--accent)"><div class="stat-label">STUDENTS</div><div class="stat-value" id="total-students">--</div></div>
      <div class="stat-card" style="--stat-color:var(--warning)"><div class="stat-label">DEFAULTERS</div><div class="stat-value" id="total-defaulters">--</div></div>
    </div>

    <!-- All Transactions -->
    <div class="card" id="finance-transactions">
      <div style="text-align:center;padding:20px;color:var(--text-muted)">Loading...</div>
    </div>`;

  // Load students in dropdown
  try {
    const data = await apiGet('/students');
    const select = document.getElementById('fee-student-select');
    if (!select) return;

    if (!data.success) {
      select.innerHTML = '<option value="">Unable to load students</option>';
      showToast(data.message || 'Unable to load student list', 'danger');
    } else {
      select.innerHTML = '<option value="">Select student</option>';
      if (Array.isArray(data.students) && data.students.length) {
        data.students.forEach(s => {
          const opt = document.createElement('option');
          opt.value = s._id;
          opt.textContent = `${s.name} (${s.email})`;
          select.appendChild(opt);
        });
      } else {
        select.innerHTML = '<option value="">No approved students found</option>';
      }
      document.getElementById('total-students').textContent = (data.students || []).length;
    }
  } catch(e) {
    const select = document.getElementById('fee-student-select');
    if (select) select.innerHTML = '<option value="">Error loading students</option>';
    showToast('Unable to load students. Check your backend connection.', 'danger');
    console.error('Finance student load error:', e);
  }

  loadAllTransactions();
}

async function addFeeForStudent() {
  const studentId  = document.getElementById('fee-student-select')?.value;
  const type       = document.getElementById('fee-type')?.value;
  const amount     = document.getElementById('fee-amount')?.value;
  const dueDate    = document.getElementById('fee-due-date')?.value;
  const desc       = document.getElementById('fee-desc')?.value?.trim();
  const semester   = document.getElementById('fee-semester')?.value;

  if (!studentId) { showToast('Select student', 'warning'); return; }
  if (!amount)    { showToast('Amount daalo', 'warning'); return; }
  if (!desc)      { showToast('Description daalo', 'warning'); return; }

  try {
    const data = await apiPost('/fees', {
      studentId,
      description: desc,
      amount: Number(amount),
      type,
      dueDate: dueDate ? new Date(dueDate).toISOString() : new Date().toISOString(),
      semester: Number(semester),
      status: 'pending'
    });

    if (data.success) {
      showToast('Fee added!', 'success');
      document.getElementById('fee-amount').value = '';
      document.getElementById('fee-desc').value   = '';
      document.getElementById('fee-student-select').selectedIndex = 0;
      loadAllTransactions();
    } else {
      console.error('Add fee failed:', data);
      showToast(data.message || 'Something went wrong while adding the fee', 'danger');
    }
  } catch(e) {
    console.error('Add fee error:', e);
    showToast('Server error while adding fee', 'danger');
  }
}

async function loadAllTransactions() {
  const container = document.getElementById('finance-transactions');
  if (!container) return;

  try {
    const studentsData = await apiGet('/students');
    if (!studentsData.success) {
      throw new Error(studentsData.message || 'Failed to load students');
    }

    const students = Array.isArray(studentsData.students) ? studentsData.students : [];
    if (!students.length) {
      container.innerHTML = `<div style="text-align:center;padding:32px;color:var(--text-muted)">
        <i class="fa-solid fa-user-graduate" style="font-size:40px;margin-bottom:12px;opacity:.3"></i>
        <div>No approved students found</div>
      </div>`;
      document.getElementById('total-collected').textContent = '₹0';
      document.getElementById('total-pending').textContent = '₹0';
      document.getElementById('total-defaulters').textContent = '0';
      return;
    }

    let allFees = [];
    let totalCollected = 0, totalPending = 0, defaulters = new Set();

    for (const s of students) {
      try {
        const feeData = await apiGet(`/fees/student/${s._id}`);
        if (!feeData.success) {
          console.warn('Failed to load fee data for', s._id, feeData.message);
          continue;
        }
        if (Array.isArray(feeData.fees) && feeData.fees.length > 0) {
          feeData.fees.forEach(f => {
            allFees.push({ ...f, studentName: s.name });
            if (f.status === 'paid') totalCollected += f.amount;
            if (f.status === 'pending') { totalPending += f.amount; defaulters.add(s._id); }
          });
        }
      } catch(e) {
        console.warn('Fee load error for student', s._id, e);
      }
    }

    // Update stats
    const collEl = document.getElementById('total-collected');
    const pendEl = document.getElementById('total-pending');
    const defEl  = document.getElementById('total-defaulters');
    if (collEl) collEl.textContent = '₹' + (totalCollected/1000).toFixed(0) + 'K';
    if (pendEl) pendEl.textContent  = '₹' + (totalPending/1000).toFixed(0)  + 'K';
    if (defEl)  defEl.textContent   = defaulters.size;

    if (!allFees.length) {
      container.innerHTML = `<div style="text-align:center;padding:32px;color:var(--text-muted)">
        <i class="fa-solid fa-coins" style="font-size:40px;margin-bottom:12px;opacity:.3"></i>
        <div>No transactions — Ask admin to add fees</div>
      </div>`;
      return;
    }

    container.innerHTML = `
      <div class="card-header"><div class="card-title">All Transactions</div></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Student</th><th>Description</th><th>Amount</th><th>Type</th><th>Due Date</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            ${allFees.map(f => `
              <tr>
                <td style="font-weight:600;color:var(--text-primary)">${f.studentName}</td>
                <td>${f.description}</td>
                <td style="font-weight:700">₹${Number(f.amount).toLocaleString('en-IN')}</td>
                <td><span class="badge badge-accent">${f.type}</span></td>
                <td>${f.dueDate ? new Date(f.dueDate).toLocaleDateString('en-IN') : 'N/A'}</td>
                <td><span class="badge badge-${f.status==='paid'?'success':'warning'}">${f.status}</span></td>
                <td>
                  ${f.status !== 'paid' ? `<button class="btn btn-success btn-sm" onclick="markFeePaid('${f._id}')">Mark Paid</button>` : '✅'}
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  } catch(e) { console.log('Finance error:', e); }
}

async function markFeePaid(feeId) {
  try {
    const data = await apiPut(`/fees/${feeId}/pay`, {
      transactionId: 'MANUAL-' + Date.now(),
      paymentMethod: 'Manual (Admin)'
    });
    if (data.success) {
      showToast('Fee marked as paid!', 'success');
      loadAllTransactions();
    }
  } catch(e) { showToast('Error', 'danger'); }
}

async function renderReports(area) {
  area.innerHTML = `
    <div class="page-header"><h1>Reports</h1><p>Generate and download</p></div>
    <div class="grid grid-2">
      ${[
        {icon:'fa-chart-bar', title:'Academic Performance', desc:'CGPA, marks, grade distribution', fn:'generateAcademicReport'},
        {icon:'fa-clipboard-check', title:'Attendance Report', desc:'Subject-wise attendance summary', fn:'generateAttendanceReport'},
        {icon:'fa-coins', title:'Fee Collection', desc:'Monthly collection aur defaulters', fn:'generateFeeReport'},
        {icon:'fa-users', title:'Student Enrollment', desc:'Department-wise enrollment data', fn:'generateEnrollmentReport'},
      ].map(r=>`
        <div class="card" style="display:flex;gap:14px;align-items:center">
          <div style="width:50px;height:50px;border-radius:12px;background:var(--accent-soft);display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <i class="fa-solid ${r.icon}" style="font-size:20px;color:var(--accent)"></i>
          </div>
          <div style="flex:1">
            <div style="font-weight:700;font-size:14px">${r.title}</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:4px">${r.desc}</div>
          </div>
          <button class="btn btn-accent btn-sm" onclick="${r.fn}()">
            <i class="fa-solid fa-download"></i> Generate
          </button>
        </div>`).join('')}
    </div>`;
}

async function generateAcademicReport() {
  showToast('Generating Academic Report...','accent');
  try {
    const students = await apiGet('/students');
    let reportHTML = `
      <html><head><title>Academic Report</title>
      <style>body{font-family:Arial;max-width:800px;margin:40px auto;color:#333}
      table{width:100%;border-collapse:collapse;margin:20px 0}
      th,td{padding:10px;border:1px solid #ddd;text-align:left}
      th{background:#4f6ef7;color:white}h1{color:#4f6ef7}</style></head><body>
      <h1>KD Campus — Academic Report</h1>
      <p>Generated: ${new Date().toLocaleDateString('en-IN')}</p>
      <h2>Students (${students.students?.length||0})</h2>
      <table><thead><tr><th>Name</th><th>Email</th><th>Department</th><th>Status</th></tr></thead><tbody>
      ${students.students?.map(s=>`<tr><td>${s.name}</td><td>${s.email}</td><td>${s.department||'N/A'}</td><td>${s.isApproved?'Active':'Pending'}</td></tr>`).join('')||''}
      </tbody></table></body></html>`;

    const blob = new Blob([reportHTML], {type:'text/html'});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `Academic_Report_${Date.now()}.html`;
    a.click(); URL.revokeObjectURL(url);
    showToast('Report downloaded!','success');
  } catch(e) { showToast('Error generating report','danger'); }
}

async function generateEnrollmentReport() {
  showToast('Generating Enrollment Report...','accent');
  try {
    const [students, courses] = await Promise.all([apiGet('/students'), apiGet('/courses')]);
    const deptCount = {};
    students.students?.forEach(s => { deptCount[s.department||'Unknown'] = (deptCount[s.department||'Unknown']||0)+1; });

    let reportHTML = `
      <html><head><title>Enrollment Report</title>
      <style>body{font-family:Arial;max-width:800px;margin:40px auto;color:#333}
      table{width:100%;border-collapse:collapse;margin:20px 0}
      th,td{padding:10px;border:1px solid #ddd;text-align:left}
      th{background:#4f6ef7;color:white}h1{color:#4f6ef7}</style></head><body>
      <h1>KD Campus — Enrollment Report</h1>
      <p>Generated: ${new Date().toLocaleDateString('en-IN')}</p>
      <h2>Department-wise Enrollment</h2>
      <table><thead><tr><th>Department</th><th>Students</th></tr></thead><tbody>
      ${Object.entries(deptCount).map(([d,c])=>`<tr><td>${d}</td><td>${c}</td></tr>`).join('')}
      </tbody></table>
      <h2>Available Courses (${courses.courses?.length||0})</h2>
      <table><thead><tr><th>Course</th><th>Code</th><th>Department</th><th>Credits</th></tr></thead><tbody>
      ${courses.courses?.map(c=>`<tr><td>${c.name}</td><td>${c.code}</td><td>${c.department||'N/A'}</td><td>${c.credits||4}</td></tr>`).join('')||''}
      </tbody></table></body></html>`;

    const blob=new Blob([reportHTML],{type:'text/html'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;a.download=`Enrollment_Report_${Date.now()}.html`;
    a.click();URL.revokeObjectURL(url);
    showToast('Report downloaded!','success');
  } catch(e) { showToast('Error generating report','danger'); }
}

async function generateAttendanceReport() {
  showToast('Generating Attendance Report...','accent');
  try {
    const students = await apiGet('/students');
    let rows = '';
    for (const s of (students.students||[]).slice(0,20)) {
      try {
        const att = await apiGet(`/attendance/student/${s._id}`);
        const avg = att.attendance?.length > 0
          ? Math.round(att.attendance.reduce((sum,a)=>sum+a.pct,0)/att.attendance.length)
          : 'N/A';
        rows += `<tr><td>${s.name}</td><td>${s.department||'N/A'}</td><td>${avg}%</td><td>${avg>=75?'✅ Eligible':'❌ Short'}</td></tr>`;
      } catch(e) { rows += `<tr><td>${s.name}</td><td>${s.department||'N/A'}</td><td>N/A</td><td>N/A</td></tr>`; }
    }

    const reportHTML = `
      <html><head><title>Attendance Report</title>
      <style>body{font-family:Arial;max-width:800px;margin:40px auto;color:#333}
      table{width:100%;border-collapse:collapse;margin:20px 0}
      th,td{padding:10px;border:1px solid #ddd;text-align:left}
      th{background:#4f6ef7;color:white}h1{color:#4f6ef7}</style></head><body>
      <h1>KD Campus — Attendance Report</h1>
      <p>Generated: ${new Date().toLocaleDateString('en-IN')} | Min Required: 75%</p>
      <table><thead><tr><th>Student</th><th>Department</th><th>Avg Attendance</th><th>Status</th></tr></thead>
      <tbody>${rows}</tbody></table></body></html>`;

    const blob=new Blob([reportHTML],{type:'text/html'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;a.download=`Attendance_Report_${Date.now()}.html`;
    a.click();URL.revokeObjectURL(url);
    showToast('Report downloaded!','success');
  } catch(e) { showToast('Error','danger'); }
}

async function generateFeeReport() {
  showToast('Generating Fee Report...','accent');
  try {
    const students = await apiGet('/students');
    let rows='', totalCollected=0, totalPending=0;

    for (const s of (students.students||[]).slice(0,20)) {
      try {
        const feeData = await apiGet(`/fees/student/${s._id}`);
        const paid    = feeData.summary?.paid    || 0;
        const pending = feeData.summary?.pending || 0;
        totalCollected += paid; totalPending += pending;
        rows += `<tr><td>${s.name}</td><td>₹${paid.toLocaleString('en-IN')}</td><td>₹${pending.toLocaleString('en-IN')}</td><td>${pending>0?'⚠️ Pending':'✅ Clear'}</td></tr>`;
      } catch(e) { rows += `<tr><td>${s.name}</td><td>N/A</td><td>N/A</td><td>N/A</td></tr>`; }
    }

    const reportHTML = `
      <html><head><title>Fee Report</title>
      <style>body{font-family:Arial;max-width:800px;margin:40px auto;color:#333}
      table{width:100%;border-collapse:collapse;margin:20px 0}
      th,td{padding:10px;border:1px solid #ddd;text-align:left}
      th{background:#4f6ef7;color:white}h1{color:#4f6ef7}
      .summary{background:#f0f4ff;padding:16px;border-radius:8px;margin:20px 0}</style></head><body>
      <h1>KD Campus — Fee Collection Report</h1>
      <p>Generated: ${new Date().toLocaleDateString('en-IN')}</p>
      <div class="summary">
        <strong>Total Collected: ₹${totalCollected.toLocaleString('en-IN')}</strong> &nbsp;|&nbsp;
        <strong>Total Pending: ₹${totalPending.toLocaleString('en-IN')}</strong>
      </div>
      <table><thead><tr><th>Student</th><th>Paid</th><th>Pending</th><th>Status</th></tr></thead>
      <tbody>${rows}</tbody></table></body></html>`;

    const blob=new Blob([reportHTML],{type:'text/html'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;a.download=`Fee_Report_${Date.now()}.html`;
    a.click();URL.revokeObjectURL(url);
    showToast('Report downloaded!','success');
  } catch(e) { showToast('Error','danger'); }
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
        <div style="font-size:13px;opacity:.7;margin-bottom:20px">${pendingAmount>0?'Fee pending':'No pending fee'}</div>
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
        ?`<div style="text-align:center;padding:32px;color:var(--text-muted)">No payment history</div>`
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
    showToast('Marksheet PDF is downloading!','success');
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

// ═══════════ AI CHATBOT ═════════════════

const chatIntents = [
  {pattern:/\b(hi|hello|hey|namaste|good morning|good afternoon|good evening)\b/i, replies:['Hello! I am UniBot — your university assistant. How can I help you today?','Hi there! Ask me about fees, attendance, assignments, results, timetable, or campus services.']},
  {pattern:/\b(help|support|assist|sahayata|madad)\b/i, replies:['I can help you with fees, attendance, assignments, results, timetable, bus service, placements, announcements and more. Just ask!','Ask me about fee payment, attendance records, assignments, results, timetable, bus tracking, or announcements.']},
  {pattern:/\b(fee|payment|pay|tuition|due)\b/i, replies:['For fee payment, open the Fee Payment section in the app. You can pay with UPI, cards or net banking. If you need a receipt, the payment history is available there.','Check the Fee Payment page to view pending payments and pay using UPI, card, or net banking.']},
  {pattern:/\b(attendance|present|absent|attendance record|attendance status)\b/i, replies:['You can view your attendance in the Attendance section. It shows your present, absent, and overall percentage.','Attendance information is available under the Attendance page. Open it to see your daily and monthly records.']},
  {pattern:/\b(assignments|homework|task|submit|assignment)\b/i, replies:['For assignments, go to the Assignments page. There you can view all active tasks and due dates.','Open the Assignments section to see your pending assignments, deadlines, and submission details.']},
  {pattern:/\b(result|marks|grades|score|percentage)\b/i, replies:['See your Results & Marks page to check subject-wise scores and grades.','Open Results & Marks to review your latest exam performance and grades.']},
  {pattern:/\b(timetable|schedule|period|class schedule|class time)\b/i, replies:['Your timetable is available under the Timetable section. It shows the weekly class schedule and timings.','Visit the Timetable page to view your current week schedule.']},
  {pattern:/\b(library|books|digital library|resources)\b/i, replies:['The Digital Library section has study materials and course resources. Check it for notes and e-books.','Open the Digital Library to access notes, resources, and uploaded study material.']},
  {pattern:/\b(placement|internship|job|career)\b/i, replies:['The Placement Portal has company drives, eligibility, and application details. See it for placement announcements.','Check the Placement Portal for placement updates, internship drives, and company information.']},
  {pattern:/\b(notification|notice|announcement|alert)\b/i, replies:['Announcements are shown in the Notifications panel and the Announcements page. Use the bell icon to open them.','Open the Notifications or Announcements section to see the latest college notices.']},
  {pattern:/\b(course|subject|enroll|register|class)\b/i, replies:['Your courses appear in My Courses. You can enroll or view course details there.','Visit My Courses to see enrolled subjects, course details, and schedules.']},
  {pattern:/\b(bus|transport|bus tracker|shuttle)\b/i, replies:['The Bus Tracker page shows live bus status and campus route details.','Open Bus Tracker to see campus transport timings and bus locations.']},
  {pattern:/\b(campus map|map|location|campus)\b/i, replies:['Campus Map shows the campus layout and important locations. Check it for directions.','Use the Campus Map page to find buildings, labs, and campus facilities.']},
  {pattern:/\b(profile|my profile|account|details)\b/i, replies:['Your profile is accessible from the top-right avatar menu. It shows your name, role, and department.','Open the profile panel using the avatar icon to view your account details.']},
  {pattern:/\b(log ?in|sign ?in|register|sign ?up|password)\b/i, replies:['Use the Sign In / Register form to access your account. Enter your email, phone and password to continue.','If you do not have an account, use the Register tab. Otherwise sign in with your existing credentials.']},
  {pattern:/\b(holiday|vacation|break|exam schedule|exam)\b/i, replies:['Exam schedules and holiday notices appear in Announcements. Check the Announcements page for the latest updates.','See Announcements for exam dates, holidays, and important academic notices.']},
];

function toggleChat(){
  chatOpen=!chatOpen;
  document.getElementById('chatbot-window').classList.toggle('open',chatOpen);
  document.getElementById('chat-fab-icon').innerHTML = chatOpen ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-robot"></i>';
  if(chatOpen){
    const messages=document.getElementById('chat-messages');
    if(messages && messages.children.length===1 && messages.textContent.includes('Hi!')) return;
    if(messages && messages.children.length===0){
      messages.innerHTML = `<div class="chat-msg bot"><div class="msg-bubble">Hello! I’m UniBot — your university assistant. Ask me about fees, attendance, assignments, results, timetable, or campus services.</div></div>`;
      messages.scrollTop = messages.scrollHeight;
    }
  }
}

function formatReply(reply){
  return reply.replace(/\n/g,'<br>');
}

function findChatReply(message){
  const text = message.trim().toLowerCase();
  for(const intent of chatIntents){
    if(intent.pattern.test(text)){
      const reply = intent.replies[Math.floor(Math.random()*intent.replies.length)];
      return reply;
    }
  }
  return null;
}

async function getRemoteChatReply(message){
  try {
    const user = getUser();
    const response = await fetch(`${API}/chatbot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        userRole: user.role || 'guest',
        userName: user.name || '',
        userEmail: user.email || ''
      })
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      console.warn('Chatbot backend error:', data.message || response.statusText);
      return null;
    }

    const data = await response.json();
    return data.success ? data.reply : null;
  } catch (err) {
    console.warn('Remote chatbot unavailable:', err);
    return null;
  }
}

async function sendChat(){
  const input=document.getElementById('chat-input');
  const msg=input.value.trim();
  if(!msg) return;
  input.value='';
  const messages=document.getElementById('chat-messages');
  messages.innerHTML += `<div class="chat-msg user"><div class="msg-bubble">${msg}</div></div>`;
  const typingId = 'typing-'+Date.now();
  messages.innerHTML += `<div class="chat-msg bot" id="${typingId}"><div class="msg-bubble typing"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div></div>`;
  messages.scrollTop = messages.scrollHeight;

  const remoteReply = await getRemoteChatReply(msg);
  const fallbackReply = findChatReply(msg) || 'Sorry, I did not understand that. I can help with fees, attendance, assignments, results, timetable, notifications, announcements, courses, and campus services.';
  const reply = remoteReply || fallbackReply;

  setTimeout(() => {
    document.getElementById(typingId)?.remove();
    messages.innerHTML += `<div class="chat-msg bot"><div class="msg-bubble">${formatReply(reply)}</div></div>`;
    messages.scrollTop = messages.scrollHeight;
  }, 900);
}

// ═══════════ NOTIFICATIONS ═══════════

let notifHistory=JSON.parse(localStorage.getItem('notifHistory')||'[]');
let notifSettings=JSON.parse(localStorage.getItem('notifSettings')||JSON.stringify({assignments:true,results:true,fees:true,announcements:true,library:true}));

async function requestNotificationPermission(){
  if(!('Notification'in window)){showToast('Browser does not support notifications','danger');return false;}
  if(Notification.permission==='granted'){showToast('Already enabled!','success');return true;}
  if(Notification.permission==='denied'){showToast('Allow in browser settings','warning');return false;}
  const permission=await Notification.requestPermission();
  if(permission==='granted'){showToast('Notifications enabled!','success');sendBrowserNotification('KD Campus Notifications ON!','You will now receive reminders.','🔔');return true;}
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
  if(!notifHistory.length)return`<div style="text-align:center;padding:32px;color:var(--text-muted)"><div style="font-size:36px;margin-bottom:8px">🔔</div>No notifications</div>`;
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
  showToast('Sending 3 test notifications!','success');
}

function startAutoNotifications(){
  if(Notification.permission!=='granted')return;
  setTimeout(()=>{sendBrowserNotification('👋 Welcome to KD Campus!','Check dashboard.','🏫');addToNotifHistory('Welcome!','Check dashboard','🏫');},5000);
}

// ═══════════ UTILITY ═══════════

function toggleSidebar(){document.getElementById('sidebar').classList.toggle('open');}

function toggleTheme(){
  const html=document.documentElement,isDark=html.dataset.theme==='dark';
  html.classList.add('theme-transition');
  html.dataset.theme=isDark?'light':'dark';
  document.getElementById('theme-icon').textContent=isDark?'🌙':'☀️';
  document.getElementById('theme-label').textContent=isDark?'Dark Mode':'Light Mode';
  window.setTimeout(() => html.classList.remove('theme-transition'), 420);
}

function showPanel(type){
  document.getElementById('overlay').classList.add('active');
  if(type==='notifications'){
    document.getElementById('notifications-panel').classList.add('open');
    loadNotificationsPanel().then(() => updateNotificationBadge(0));
  }
}

function closePanel(){
  document.getElementById('overlay').classList.remove('active');
  document.getElementById('notifications-panel').classList.remove('open');
}

function closeAllPanels(){closePanel();}

function updateNotificationBadge(count) {
  const badge = document.getElementById('notif-badge');
  if (!badge) return;
  
  if (count > 0) {
    badge.textContent = count > 99 ? '99+' : count;
    badge.style.display = 'inline';
  } else {
    badge.style.display = 'none';
  }
}

async function updateNotificationBadgeOnLoad() {
  try {
    const data = await apiGet('/announcements');
    const count = data.notices?.length || 0;
    updateNotificationBadge(count);
  } catch (err) {
    updateNotificationBadge(0);
  }
}

async function loadNotificationsPanel() {
  const content = document.getElementById('notifications-content');
  if (!content) return;
  
  content.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-muted)">Loading...</div>';
  
  try {
    const data = await apiGet('/announcements');
    const count = data.notices?.length || 0;
    updateNotificationBadge(count);
    
    if (!data.notices?.length) {
      content.innerHTML = '<div style="text-align:center;padding:32px;color:var(--text-muted)">No notifications</div>';
      return;
    }
    
    const typeIcons = { 
      general: '<i class="fa-solid fa-bullhorn"></i>', 
      exam: '<i class="fa-solid fa-file-pen"></i>', 
      holiday: '<i class="fa-solid fa-calendar-days"></i>', 
      event: '<i class="fa-solid fa-calendar-check"></i>', 
      fee: '<i class="fa-solid fa-indian-rupee-sign"></i>' 
    };
    
    content.innerHTML = data.notices.slice(0, 10).map(n => `
      <div class="notif-item">
        <div class="notif-icon">${typeIcons[n.type] || '<i class="fa-solid fa-bell"></i>'}</div>
        <div>
          <div class="notif-title">${n.title}</div>
          <div class="notif-time">${n.postedBy?.name || 'Admin'} · ${new Date(n.createdAt).toLocaleDateString('en-IN')}</div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    content.innerHTML = '<div style="text-align:center;padding:32px;color:var(--text-muted)">Failed to load notifications</div>';
    updateNotificationBadge(0);
  }
}

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
    if (e.key === 'Enter') handleOTPLogin();

  });
  document.getElementById('chat-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') sendChat();
  });
  console.log('%c KD Campus University Management System', 'font-size:16px;font-weight:bold;color:#4f6ef7');

  // ← ADD THIS
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
// ═══════════ FACE RECOGNITION ATTENDANCE ═══════════

async function renderFaceAttendance(area) {
  area.innerHTML = `
    <div class="page-header"><h1>Face Recognition Attendance</h1><p>Automatic attendance via camera</p></div>

    <div class="grid grid-2">
      <div class="card">
        <div class="card-title" style="margin-bottom:16px">
          <i class="fa-solid fa-camera"></i> Live Camera
        </div>
        <div style="position:relative;border-radius:10px;overflow:hidden;background:#000">
          <video id="face-video" autoplay muted style="width:100%;border-radius:10px;display:block"></video>
          <canvas id="face-canvas" style="position:absolute;top:0;left:0;width:100%;height:100%"></canvas>
        </div>
        <div style="margin-top:12px;display:flex;gap:10px">
          <button class="btn btn-accent" style="flex:1" onclick="startFaceCamera()">
            <i class="fa-solid fa-play"></i> Start Camera
          </button>
          <button class="btn btn-ghost" style="flex:1" onclick="stopFaceCamera()">
            <i class="fa-solid fa-stop"></i> Stop
          </button>
        </div>
        <div id="face-status" style="margin-top:12px;padding:10px;border-radius:8px;background:var(--bg-input);font-size:13px;color:var(--text-muted);text-align:center">
          Select course and start the camera
        </div>
      </div>

      <div class="card">
        <div class="card-title" style="margin-bottom:16px">
          <i class="fa-solid fa-clipboard-check"></i> Attendance Log
        </div>
        <div class="form-group">
          <label>Select Course</label>
          <select id="face-course-select" style="width:100%" onchange="loadFaceAttendanceData(this.value)">
            <option value="">Loading...</option>
          </select>
        </div>
        <div class="form-group">
          <label>Register Student Face</label>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <select id="face-student-select" style="flex:1;min-width:180px">
              <option value="">Select student</option>
            </select>
            <button class="btn btn-ghost" style="white-space:nowrap" onclick="registerStudentFace()">
              <i class="fa-solid fa-user-plus"></i> Register
            </button>
          </div>
          <div id="face-register-status" style="margin-top:10px;font-size:12px;color:var(--text-muted)">Register one student face template before saving attendance.</div>
        </div>
        <div id="face-attendance-log" style="max-height:300px;overflow-y:auto">
          <div style="text-align:center;padding:20px;color:var(--text-muted)">
            <i class="fa-solid fa-users" style="font-size:32px;margin-bottom:8px;opacity:.3"></i>
            <div>Start the camera and select the course to enable recognition.</div>
          </div>
        </div>
        <button class="btn btn-success" style="width:100%;margin-top:12px" onclick="saveFaceAttendance()">
          <i class="fa-solid fa-floppy-disk"></i> Save Attendance
        </button>
      </div>
    </div>

    <div class="card" style="margin-top:16px">
      <div class="card-title" style="margin-bottom:12px">How Face Recognition Works</div>
      <div class="grid grid-3">
        ${[
          {icon:'fa-camera',title:'Start Camera',desc:'Allow browser camera access.'},
          {icon:'fa-user-check',title:'Register Faces',desc:'Capture face templates for students.'},
          {icon:'fa-check-circle',title:'Auto Attendance',desc:'Recognize matched faces and save attendance.'},
        ].map(s=>`
          <div style="text-align:center;padding:16px;background:var(--bg-input);border-radius:10px">
            <i class="fa-solid ${s.icon}" style="font-size:24px;color:var(--accent);margin-bottom:8px"></i>
            <div style="font-weight:600;font-size:13px;margin-bottom:4px">${s.title}</div>
            <div style="font-size:12px;color:var(--text-muted)">${s.desc}</div>
          </div>`).join('')}
      </div>
    </div>`;

  // Load courses
  try {
    const data   = await apiGet('/courses');
    const select = document.getElementById('face-course-select');
    select.innerHTML = '<option value="">Select course</option>';
    data.courses?.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c._id; opt.textContent = `${c.name} (${c.code})`;
      select.appendChild(opt);
    });
  } catch(e) {}

  // Load face-api models
  loadFaceModels();
}

let faceStream        = null;
let faceDetectionLoop = null;
let detectedStudents  = new Set();
let knownStudents     = [];
let faceMatcher       = null;
let currentFaceCourseId = null;

async function loadFaceModels() {
  try {
    const status = document.getElementById('face-status');
    if (status) status.textContent = 'Loading AI models...';

    const MODEL_URL = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights';
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);

    if (status) {
      status.textContent = '✅ AI models ready. Start the camera.';
      status.style.color = 'var(--success)';
    }
  } catch(e) {
    const status = document.getElementById('face-status');
    if (status) {
      status.textContent = 'Models failed to load. Check internet or refresh.';
      status.style.color = 'var(--warning)';
    }
  }
}

async function loadFaceAttendanceData(courseId) {
  currentFaceCourseId = courseId;
  const status = document.getElementById('face-status');
  if (status) {
    status.textContent = courseId ? 'Loading student face templates...' : 'Select a course to load registered students.';
    status.style.color = courseId ? 'var(--accent)' : 'var(--text-muted)';
  }

  if (!courseId) {
    knownStudents = [];
    faceMatcher   = null;
    populateFaceStudentSelect([]);
    updateFaceLog([]);
    return;
  }

  try {
    const data = await apiGet(`/students/faces?courseId=${courseId}`);
    knownStudents = data.students || [];
    window._faceCourseStudents = knownStudents;
    populateFaceStudentSelect(knownStudents);

    const labeledDescriptors = knownStudents
      .filter(s => s.faceDescriptors?.length)
      .map(s => new faceapi.LabeledFaceDescriptors(
        s._id,
        s.faceDescriptors.map(desc => new Float32Array(desc))
      ));

    faceMatcher = labeledDescriptors.length ? new faceapi.FaceMatcher(labeledDescriptors, 0.5) : null;

    if (status) {
      status.textContent = labeledDescriptors.length
        ? `Loaded ${labeledDescriptors.length} registered face template(s)`
        : 'No registered face templates for this course yet. Register student faces to enable recognition.';
      status.style.color = labeledDescriptors.length ? 'var(--success)' : 'var(--warning)';
    }
  } catch (err) {
    if (status) {
      status.textContent = 'Failed to load student faces. Try again.';
      status.style.color = 'var(--danger)';
    }
  }
}

function populateFaceStudentSelect(students) {
  const select = document.getElementById('face-student-select');
  if (!select) return;
  select.innerHTML = '<option value="">Select student</option>';
  students.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s._id;
    opt.textContent = s.name;
    select.appendChild(opt);
  });
}

async function registerStudentFace() {
  const studentId = document.getElementById('face-student-select')?.value;
  const status    = document.getElementById('face-register-status');
  if (!studentId) {
    showToast('Select a student to register face.', 'warning');
    return;
  }

  const video = document.getElementById('face-video');
  if (!video || !video.videoWidth) {
    showToast('Start the camera before registering a face.', 'warning');
    return;
  }

  if (status) {
    status.textContent = 'Capturing face template...';
    status.style.color = 'var(--accent)';
  }

  try {
    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 256, scoreThreshold: 0.3 }))
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      if (status) status.textContent = 'No face detected. Move closer to the camera.';
      showToast('No face found in the frame.', 'warning');
      return;
    }

    const descriptor = Array.from(detection.descriptor);
    const response = await apiPut(`/students/${studentId}/face-descriptor`, { descriptor });

    if (response.success) {
      showToast('Face template registered successfully.', 'success');
      if (status) status.textContent = 'Face captured. Recognition ready.';
      loadFaceAttendanceData(currentFaceCourseId);
    } else {
      showToast(response.message || 'Face registration failed.', 'danger');
      if (status) status.textContent = 'Registration failed. Try again.';
    }
  } catch (err) {
    showToast('Error capturing face. Try again.', 'danger');
    if (status) status.textContent = 'Face capture error. Check console.';
    console.error(err);
  }
}

async function startFaceCamera() {
  try {
    faceStream = await navigator.mediaDevices.getUserMedia({ video: true });
    const video = document.getElementById('face-video');
    if (!video) return;

    video.srcObject = faceStream;
    await video.play();

    const status = document.getElementById('face-status');
    if (status) {
      status.textContent = '🟢 Camera is running — detecting faces...';
      status.style.color = 'var(--success)';
    }

    startFaceDetection();
  } catch(e) {
    showToast('Camera access denied! Allow in browser settings.', 'danger');
  }
}

function startFaceDetection() {
  const video  = document.getElementById('face-video');
  const canvas = document.getElementById('face-canvas');
  if (!video || !canvas) return;

  let previousCount = 0;

  faceDetectionLoop = setInterval(async () => {
    if (!video.videoWidth) return;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;

    try {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 256, scoreThreshold: 0.3 }))
        .withFaceLandmarks()
        .withFaceDescriptors();

      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const currentDetected = new Set();
      const results = detections.map((det, i) => {
        const box = det.detection.box;
        const match = faceMatcher ? faceMatcher.findBestMatch(det.descriptor) : { label: 'unknown', distance: 1 };
        const student = knownStudents.find(s => s._id === match.label);
        const label   = student ? student.name : (match.label === 'unknown' ? 'Unknown' : match.label);
        const isKnown = Boolean(student);
        if (isKnown) currentDetected.add(student._id);

        ctx.strokeStyle = isKnown ? '#22d3a0' : '#f97316';
        ctx.lineWidth = 2;
        ctx.strokeRect(box.x, box.y, box.width, box.height);

        ctx.fillStyle = isKnown ? 'rgba(34,211,160,0.85)' : 'rgba(249,115,22,0.85)';
        ctx.fillRect(box.x, box.y - 24, Math.min(200, box.width), 22);
        ctx.fillStyle = 'white';
        ctx.font = '13px Arial';
        ctx.fillText(label, box.x + 6, box.y - 6);

        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(box.x, box.y + box.height, 110, 20);
        ctx.fillStyle = 'white';
        ctx.font = '11px Arial';
        ctx.fillText(`${isKnown ? 'Matched' : 'Unknown'} ${match.distance ? match.distance.toFixed(2) : ''}`, box.x + 6, box.y + box.height + 14);

        return { label, score: match.distance, isKnown, studentId: student?._id };
      });

      detectedStudents = currentDetected;
      updateFaceLog(results);

      if (results.length !== previousCount) {
        previousCount = results.length;
      }
    } catch(e) {
      console.error('Face detection error', e);
    }
  }, 200);
}

function updateFaceLog(results) {
  const log = document.getElementById('face-attendance-log');
  if (!log) return;

  if (!results?.length) {
    log.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-muted)">No face detected</div>`;
    return;
  }

  const knownMatches = results.filter(r => r.isKnown);
  const unknownCount = results.filter(r => !r.isKnown).length;

  log.innerHTML = `
    <div style="padding:12px;background:var(--bg-card);border-radius:8px;margin-bottom:12px;border:1px solid var(--border)">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap">
        <div style="font-weight:700;color:var(--text-primary)">${results.length} face(s) detected</div>
        <div style="font-size:12px;color:var(--text-muted)">${new Date().toLocaleTimeString('en-IN')}</div>
      </div>
      <div style="margin-top:8px;font-size:12px;color:${knownMatches.length ? 'var(--success)' : 'var(--warning)'}">
        ${knownMatches.length ? `${knownMatches.length} registered face(s) matched` : 'No registered face matched yet.'}
      </div>
    </div>
    ${results.map(r => `
      <div style="display:flex;align-items:center;gap:10px;padding:12px;border:1px solid var(--border);border-radius:10px;margin-bottom:8px;background:var(--bg-input)">
        <div style="width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:${r.isKnown ? 'var(--success-soft)' : 'var(--warning-soft)'};color:${r.isKnown ? 'var(--success)' : 'var(--warning)'}">
          <i class="fa-solid ${r.isKnown ? 'fa-user-check' : 'fa-user-slash'}"></i>
        </div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:600;font-size:13px">${r.label}</div>
          <div style="font-size:11px;color:var(--text-muted)">${r.isKnown ? 'Registered student' : 'Unknown person'} · Confidence ${r.score?.toFixed(2) || '--'}</div>
        </div>
      </div>`).join('')}
    ${unknownCount ? `<div style="padding:10px 12px;border-radius:10px;background:rgba(249,115,22,.06);color:var(--warning);font-size:12px">${unknownCount} unknown face(s) detected. Please register the student face template.</div>` : ''}`;
}

function stopFaceCamera() {
  if (faceStream) {
    faceStream.getTracks().forEach(t => t.stop());
    faceStream = null;
  }
  if (faceDetectionLoop) {
    clearInterval(faceDetectionLoop);
    faceDetectionLoop = null;
  }
  const video = document.getElementById('face-video');
  if (video) video.srcObject = null;
  const status = document.getElementById('face-status');
  if (status) {
    status.textContent = 'Camera stopped';
    status.style.color = 'var(--text-muted)';
  }
  showToast('Camera stopped', 'accent');
}

async function saveFaceAttendance() {
  const courseId = document.getElementById('face-course-select')?.value;
  if (!courseId) { showToast('Select course first', 'warning'); return; }

  const courseStudents = window._faceCourseStudents || [];
  if (!courseStudents.length) {
    showToast('Load course student list and register faces first.', 'warning');
    return;
  }

  const records = courseStudents.map(s => ({
    studentId: s._id,
    status: detectedStudents.has(s._id) ? 'present' : 'absent'
  }));

  if (!records.length) {
    showToast('No student records available for this course.', 'warning');
    return;
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    const res = await apiPost('/attendance', {
      courseId,
      date: today,
      records,
      facultyId: getUser().id
    });

    if (res.success) {
      showToast('Attendance saved successfully!', 'success');
      stopFaceCamera();
    } else {
      showToast(res.message || 'Unable to save attendance', 'danger');
    }
  } catch (err) {
    showToast('Server error saving attendance.', 'danger');
    console.error(err);
  }
}
function togglePassword(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon  = document.getElementById(iconId);
  if (!input || !icon) return;
  if (input.type === 'password') {
    input.type = 'text';
    icon.className = 'fa-solid fa-eye-slash';
  } else {
    input.type = 'password';
    icon.className = 'fa-solid fa-eye';
  }
}
