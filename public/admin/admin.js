const API = '/api';

async function checkAuth() {
  const res = await fetch(`${API}/auth/me`);
  const data = await res.json();
  return data;
}

async function login(username, password) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  return res.json();
}

async function logout() {
  await fetch(`${API}/auth/logout`, { method: 'POST' });
}

async function getSections() {
  const res = await fetch(`${API}/content`);
  return res.json();
}

async function updateSection(section, data) {
  const res = await fetch(`${API}/content/${section}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

function showView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

document.addEventListener('DOMContentLoaded', async () => {
  const auth = await checkAuth();
  if (auth.authenticated) {
    enterDashboard(auth);
  } else {
    showView('loginView');
  }

  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const result = await login(
      document.getElementById('loginUser').value,
      document.getElementById('loginPass').value
    );
    if (result.error) {
      document.getElementById('loginError').textContent = result.error;
    } else {
      enterDashboard(result);
    }
  });

  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await logout();
    showView('loginView');
    document.getElementById('sectionList').innerHTML = '';
    document.getElementById('editorForm').style.display = 'none';
  });

  document.getElementById('editorForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const section = document.getElementById('editorForm').dataset.section;
    const data = {
      title: document.getElementById('editTitle').value,
      body: document.getElementById('editBody').value,
      image_url: document.getElementById('editImage').value
    };
    const result = await updateSection(section, data);
    const msg = document.getElementById('editorMsg');
    if (result.success) {
      msg.textContent = '¡Guardado!';
      msg.className = 'msg success';
    } else {
      msg.textContent = result.error || 'Error al guardar';
      msg.className = 'msg error';
    }
  });
});

async function enterDashboard(auth) {
  document.getElementById('userName').textContent = auth.username;
  showView('dashboardView');
  await loadSections();
}

async function loadSections() {
  const sections = await getSections();
  const list = document.getElementById('sectionList');
  list.innerHTML = '';
  Object.keys(sections).forEach(section => {
    const li = document.createElement('li');
    li.textContent = sections[section].title || section;
    li.dataset.section = section;
    li.addEventListener('click', () => selectSection(section));
    list.appendChild(li);
  });
  if (Object.keys(sections).length > 0) {
    selectSection(Object.keys(sections)[0]);
  }
}

function selectSection(section) {
  document.querySelectorAll('#sectionList li').forEach(li => li.classList.remove('active'));
  const li = document.querySelector(`#sectionList li[data-section="${section}"]`);
  if (li) li.classList.add('active');

  fetch(`${API}/content/${section}`)
    .then(res => res.json())
    .then(data => {
      document.getElementById('editorTitle').textContent = data.title || section;
      document.getElementById('editTitle').value = data.title || '';
      document.getElementById('editBody').value = data.body || '';
      document.getElementById('editImage').value = data.image_url || '';
      document.getElementById('editorMsg').textContent = '';
      document.getElementById('editorForm').style.display = 'block';
      document.getElementById('editorForm').dataset.section = section;
    });
}
