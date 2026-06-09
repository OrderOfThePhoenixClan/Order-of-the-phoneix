const API = '/api';

async function fetchAPI(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  return res.json();
}

// --- Auth ---
async function checkAuth() { return fetchAPI('/auth/me'); }
async function login(u, p) { return fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify({ username: u, password: p }) }); }
async function logout() { return fetchAPI('/auth/logout', { method: 'POST' }); }

function showView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// --- Tabs ---
function switchTab(tab) {
  document.querySelectorAll('#navTabs li').forEach(l => l.classList.remove('active'));
  document.querySelector(`#navTabs li[data-tab="${tab}"]`).classList.add('active');
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.getElementById(`${tab}View`).classList.add('active');
  if (tab === 'founders') loadMembers('founders');
  if (tab === 'admins') loadMembers('admins');
}

// --- Content sections ---
async function loadSections() {
  const sections = await fetchAPI('/content');
  const list = document.getElementById('sectionList');
  list.innerHTML = '';
  Object.keys(sections).forEach(section => {
    const li = document.createElement('li');
    li.textContent = sections[section].title || section;
    li.dataset.section = section;
    li.addEventListener('click', () => selectSection(section));
    list.appendChild(li);
  });
  if (Object.keys(sections).length > 0) selectSection(Object.keys(sections)[0]);
}

async function selectSection(section) {
  document.querySelectorAll('#sectionList li').forEach(li => li.classList.remove('active'));
  const li = document.querySelector(`#sectionList li[data-section="${section}"]`);
  if (li) li.classList.add('active');
  const data = await fetchAPI(`/content/${section}`);
  document.getElementById('editorTitle').textContent = data.title || section;
  document.getElementById('editTitle').value = data.title || '';
  document.getElementById('editBody').value = data.body || '';
  document.getElementById('editImage').value = data.image_url || '';
  document.getElementById('editorMsg').textContent = '';
  document.getElementById('editorForm').style.display = 'block';
  document.getElementById('editorForm').dataset.section = section;
}

document.getElementById('editorForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const section = document.getElementById('editorForm').dataset.section;
  const msg = document.getElementById('editorMsg');
  const result = await fetchAPI(`/content/${section}`, {
    method: 'PUT',
    body: JSON.stringify({
      title: document.getElementById('editTitle').value,
      body: document.getElementById('editBody').value,
      image_url: document.getElementById('editImage').value
    })
  });
  msg.textContent = result.success ? '¡Guardado!' : (result.error || 'Error');
  msg.className = result.success ? 'msg success' : 'msg error';
});

// --- Members (founders / admins) ---
async function loadMembers(type) {
  const members = await fetchAPI(`/${type}`);
  const tbody = document.querySelector(`#${type}Table tbody`);
  const empty = document.getElementById(`${type}Empty`);
  tbody.innerHTML = '';
  if (members.length === 0) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  members.forEach(m => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${m.sort_order}</td>
      <td><img src="${m.photo_url || 'https://i.ibb.co/nWT5mTy/phoenix.jpg'}" alt=""></td>
      <td>${m.name}</td>
      <td>${m.nickname}</td>
      <td>${m.country}</td>
      <td>${m.role}</td>
      <td>
        <button class="btn-edit" onclick="editMember('${type}', ${m.id})">Editar</button>
        <button class="btn-delete" onclick="deleteMember('${type}', ${m.id})">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function showMemberForm(type, data = null) {
  document.getElementById('memberModal').style.display = 'flex';
  document.getElementById('memberType').value = type;
  document.getElementById('modalTitle').textContent = data ? 'Editar miembro' : 'Agregar miembro';
  document.getElementById('memberId').value = data ? data.id : '';
  document.getElementById('mName').value = data ? data.name : '';
  document.getElementById('mNickname').value = data ? data.nickname : '';
  document.getElementById('mCountry').value = data ? data.country : '';
  document.getElementById('mRole').value = data ? data.role : '';
  document.getElementById('mPhoto').value = data ? data.photo_url : '';
  document.getElementById('mCover').value = data ? data.cover_url : '';
  document.getElementById('memberMsg').textContent = '';
}
window.showMemberForm = showMemberForm;

function closeMemberForm() {
  document.getElementById('memberModal').style.display = 'none';
}
window.closeMemberForm = closeMemberForm;

async function editMember(type, id) {
  const data = await fetchAPI(`/${type}/${id}`);
  showMemberForm(type, data);
}
window.editMember = editMember;

async function deleteMember(type, id) {
  if (!confirm('¿Eliminar este miembro?')) return;
  await fetchAPI(`/${type}/${id}`, { method: 'DELETE' });
  loadMembers(type);
}
window.deleteMember = deleteMember;

document.getElementById('memberForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const type = document.getElementById('memberType').value;
  const id = document.getElementById('memberId').value;
  const data = {
    name: document.getElementById('mName').value,
    nickname: document.getElementById('mNickname').value,
    country: document.getElementById('mCountry').value,
    role: document.getElementById('mRole').value,
    photo_url: document.getElementById('mPhoto').value,
    cover_url: document.getElementById('mCover').value
  };
  const msg = document.getElementById('memberMsg');
  let result;
  if (id) {
    result = await fetchAPI(`/${type}/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  } else {
    result = await fetchAPI(`/${type}`, { method: 'POST', body: JSON.stringify(data) });
  }
  if (result.success) {
    closeMemberForm();
    loadMembers(type);
  } else {
    msg.textContent = result.error || 'Error al guardar';
    msg.className = 'msg error';
  }
});

// --- Navigation tabs ---
document.querySelectorAll('#navTabs li').forEach(li => {
  li.addEventListener('click', () => switchTab(li.dataset.tab));
});

// --- Init ---
document.addEventListener('DOMContentLoaded', async () => {
  const auth = await checkAuth();
  if (auth.authenticated) {
    document.getElementById('userName').textContent = auth.username;
    showView('dashboardView');
    await loadSections();
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
      document.getElementById('userName').textContent = result.username;
      showView('dashboardView');
      await loadSections();
    }
  });

  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await logout();
    showView('loginView');
  });
});
