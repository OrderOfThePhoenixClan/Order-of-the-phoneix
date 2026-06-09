const API = '/api';

async function fetchAPI(path, options = {}) {
  const headers = {};
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (options.body instanceof FormData && options.method === 'PUT') {
    options.body.append('_method', 'PUT');
  }
  const res = await fetch(`${API}${path}`, {
    headers,
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
  if (tab === 'gallery') loadGallery();
  if (tab === 'founders') loadMembers('founders');
  if (tab === 'admins') loadMembers('admins');
  if (tab === 'users') loadUsers();
}

// --- Users ---
async function loadUsers() {
  const users = await fetchAPI('/users');
  const tbody = document.querySelector('#usersTable tbody');
  const empty = document.getElementById('usersEmpty');
  tbody.innerHTML = '';
  if (users.length === 0) { empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  users.forEach(u => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${u.username}</td>
      <td>${u.role}</td>
      <td>${u.created_at ? new Date(u.created_at).toLocaleDateString() : ''}</td>
      <td>
        <button class="btn-edit" onclick="editUser(${u.id}, '${u.username}', '${u.role}')">Editar</button>
        <button class="btn-delete" onclick="deleteUser(${u.id})">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function showUserForm(data = null) {
  document.getElementById('userModal').style.display = 'flex';
  document.getElementById('userModalTitle').textContent = data ? 'Editar usuario' : 'Agregar usuario';
  document.getElementById('userId').value = data ? data.id : '';
  document.getElementById('uName').value = data ? data.username : '';
  document.getElementById('uPass').value = '';
  document.getElementById('uPass').required = !data;
  document.getElementById('uRole').value = data ? data.role : 'editor';
  document.getElementById('userMsg').textContent = '';
}
window.showUserForm = showUserForm;

function closeUserForm() {
  document.getElementById('userModal').style.display = 'none';
}
window.closeUserForm = closeUserForm;

function editUser(id, username, role) {
  showUserForm({ id, username, role });
}
window.editUser = editUser;

async function deleteUser(id) {
  if (!confirm('¿Eliminar este usuario?')) return;
  const result = await fetchAPI('/users/' + id, { method: 'DELETE' });
  if (result.error) { alert(result.error); return; }
  loadUsers();
}
window.deleteUser = deleteUser;

document.getElementById('userForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('userId').value;
  const msg = document.getElementById('userMsg');
  const data = {
    username: document.getElementById('uName').value,
    password: document.getElementById('uPass').value,
    role: document.getElementById('uRole').value
  };
  let result;
  if (id) {
    result = await fetchAPI('/users/' + id + '/password', { method: 'PUT', body: JSON.stringify({ password: data.password }) });
  } else {
    result = await fetchAPI('/users', { method: 'POST', body: JSON.stringify(data) });
  }
  if (result.success || result.id) {
    closeUserForm();
    loadUsers();
  } else {
    msg.textContent = result.error || 'Error al guardar';
    msg.className = 'msg error';
  }
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
  document.getElementById('mOrder').value = data ? data.sort_order : '';
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
    cover_url: document.getElementById('mCover').value,
    sort_order: parseInt(document.getElementById('mOrder').value) || 0
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

// --- Gallery ---
let galleryUploadedUrl = '';

async function loadGallery() {
  const items = await fetchAPI('/gallery');
  const grid = document.getElementById('galleryGrid');
  const empty = document.getElementById('galleryEmpty');
  grid.innerHTML = '';
  if (items.length === 0) { empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'gallery-item-admin';
    div.innerHTML = `
      <img src="${item.image_url}" alt="${item.title}">
      <div class="info">
        <span>${item.title || 'Sin título'}</span>
        <div>
          <button onclick="editGallery(${item.id})">Editar</button>
          <button onclick="deleteGallery(${item.id})" style="color:#d32f2f">×</button>
        </div>
      </div>
    `;
    grid.appendChild(div);
  });
}

function showGalleryForm(data = null) {
  document.getElementById('galleryModal').style.display = 'flex';
  document.getElementById('galleryModalTitle').textContent = data ? 'Editar dinámica' : 'Agregar dinámica';
  document.getElementById('galleryId').value = data ? data.id : '';
  document.getElementById('galleryTitle').value = data ? data.title : '';
  document.getElementById('galleryUrl').value = data ? data.image_url : '';
  document.getElementById('galleryFile').value = '';
  galleryUploadedUrl = data ? data.image_url : '';
  const preview = document.getElementById('galleryPreview');
  if (galleryUploadedUrl) {
    preview.style.display = 'block';
    preview.innerHTML = `<img src="${galleryUploadedUrl}">`;
  } else {
    preview.style.display = 'none';
  }
  document.getElementById('galleryMsg').textContent = '';
}
window.showGalleryForm = showGalleryForm;

function closeGalleryForm() {
  document.getElementById('galleryModal').style.display = 'none';
}
window.closeGalleryForm = closeGalleryForm;

async function editGallery(id) {
  const data = await fetchAPI('/gallery/' + id);
  showGalleryForm(data);
}
window.editGallery = editGallery;

async function deleteGallery(id) {
  if (!confirm('¿Eliminar esta imagen?')) return;
  await fetchAPI('/gallery/' + id, { method: 'DELETE' });
  loadGallery();
}
window.deleteGallery = deleteGallery;

document.getElementById('galleryFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const fd = new FormData();
  fd.append('file', file);
  const result = await fetchAPI('/gallery/upload', { method: 'POST', body: fd });
  if (result.url) {
    galleryUploadedUrl = result.url;
    document.getElementById('galleryUrl').value = result.url;
    const preview = document.getElementById('galleryPreview');
    preview.style.display = 'block';
    preview.innerHTML = `<img src="${result.url}">`;
  }
});

document.getElementById('galleryUrl').addEventListener('input', (e) => {
  const url = e.target.value;
  if (url) {
    galleryUploadedUrl = url;
    const preview = document.getElementById('galleryPreview');
    preview.style.display = 'block';
    preview.innerHTML = `<img src="${url}">`;
  }
});

document.getElementById('galleryForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('galleryId').value;
  const data = {
    title: document.getElementById('galleryTitle').value,
    image_url: galleryUploadedUrl
  };
  const msg = document.getElementById('galleryMsg');
  let result;
  if (id) {
    result = await fetchAPI('/gallery/' + id, { method: 'PUT', body: JSON.stringify(data) });
  } else {
    result = await fetchAPI('/gallery', { method: 'POST', body: JSON.stringify(data) });
  }
  if (result.success) {
    closeGalleryForm();
    loadGallery();
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
