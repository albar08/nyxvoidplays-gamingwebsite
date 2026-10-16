const STORAGE_BUCKET = 'media';

const state = {
  supabase: null,
  activeTab: 'highlights',
  highlights: [],
  updates: []
};

const els = {
  saveConfigBtn: document.getElementById('saveConfigBtn'),
  configStatus: document.getElementById('configStatus'),
  supabaseUrl: document.getElementById('supabaseUrl'),
  supabaseKey: document.getElementById('supabaseKey'),
  loginPanel: document.getElementById('loginPanel'),
  dashboardPanel: document.getElementById('dashboardPanel'),
  logoutBtn: document.getElementById('logoutBtn'),
  loginForm: document.getElementById('loginForm'),
  loginStatus: document.getElementById('loginStatus'),
  highlightForm: document.getElementById('highlightForm'),
  updateForm: document.getElementById('updateForm'),
  highlightsList: document.getElementById('highlightsList'),
  updatesList: document.getElementById('updatesList'),
  highlightTab: document.getElementById('highlightsTab'),
  updateTab: document.getElementById('updatesTab'),
  configPanel: document.getElementById('configPanel')
};

function showStatus(element, message, type = 'success') {
  element.textContent = message;
  element.classList.remove('hidden', 'success', 'error');
  element.classList.add(type);
}

function getStoredConfig() {
  return {
    url: localStorage.getItem('supabase_url') || '',
    key: localStorage.getItem('supabase_key') || ''
  };
}

function setStoredConfig(url, key) {
  localStorage.setItem('supabase_url', url.trim());
  localStorage.setItem('supabase_key', key.trim());
}

function setupSupabase() {
  const config = getStoredConfig();
  els.supabaseUrl.value = config.url;
  els.supabaseKey.value = config.key;

  if (!config.url || !config.key) {
    showStatus(els.configStatus, 'Add your Supabase URL and anon key to continue.', 'error');
    els.configStatus.classList.remove('hidden');
    return null;
  }

  try {
    state.supabase = window.supabase.createClient(config.url, config.key);
    return state.supabase;
  } catch (error) {
    showStatus(els.configStatus, 'Invalid Supabase config. Check your project URL and anon key.', 'error');
    return null;
  }
}

els.saveConfigBtn.addEventListener('click', () => {
  const url = els.supabaseUrl.value.trim();
  const key = els.supabaseKey.value.trim();

  if (!url || !key) {
    showStatus(els.configStatus, 'Please provide both the project URL and anon key.', 'error');
    els.configStatus.classList.remove('hidden');
    return;
  }

  setStoredConfig(url, key);
  setupSupabase();
  showStatus(els.configStatus, 'Supabase config saved. You can now log in.', 'success');
  els.configStatus.classList.remove('hidden');
});

async function handleLogin(event) {
  event.preventDefault();

  if (!state.supabase) {
    showStatus(els.loginStatus, 'No Supabase client. Save your config first.', 'error');
    els.loginStatus.classList.remove('hidden');
    return;
  }

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  const { data, error } = await state.supabase.auth.signInWithPassword({ email, password });

  if (error) {
    showStatus(els.loginStatus, error.message || 'Login failed.', 'error');
    els.loginStatus.classList.remove('hidden');
    return;
  }

  if (data?.user) {
    showStatus(els.loginStatus, 'Login successful.', 'success');
    els.loginStatus.classList.remove('hidden');
    els.loginPanel.classList.add('hidden');
    els.dashboardPanel.classList.remove('hidden');
    els.logoutBtn.classList.remove('hidden');
    loadContent();
  }
}

async function handleLogout() {
  if (!state.supabase) return;
  await state.supabase.auth.signOut();
  els.dashboardPanel.classList.add('hidden');
  els.loginPanel.classList.remove('hidden');
  els.logoutBtn.classList.add('hidden');
  showStatus(els.loginStatus, 'Logged out.', 'success');
  els.loginStatus.classList.remove('hidden');
}

async function handleSessionCheck() {
  if (!state.supabase) return;

  const { data } = await state.supabase.auth.getSession();
  if (data?.session) {
    els.loginPanel.classList.add('hidden');
    els.dashboardPanel.classList.remove('hidden');
    els.logoutBtn.classList.remove('hidden');
    loadContent();
  } else {
    els.loginPanel.classList.remove('hidden');
    els.dashboardPanel.classList.add('hidden');
    els.logoutBtn.classList.add('hidden');
  }
}

async function uploadMedia(file) {
  if (!file) return '';
  if (!state.supabase) throw new Error('Supabase is not configured.');

  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
  const { error } = await state.supabase.storage.from(STORAGE_BUCKET).upload(fileName, file, { upsert: true });

  if (error) {
    throw new Error(error.message || 'Media upload failed.');
  }

  const { data } = state.supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}

async function loadContent() {
  if (!state.supabase) return;

  const { data: highlightsData, error: highlightsError } = await state.supabase
    .from('highlights')
    .select('*')
    .order('sort_order', { ascending: true });

  const { data: updatesData, error: updatesError } = await state.supabase
    .from('updates')
    .select('*')
    .order('created_at', { ascending: false });

  if (highlightsError) {
    console.error(highlightsError);
  }

  if (updatesError) {
    console.error(updatesError);
  }

  state.highlights = highlightsData || [];
  state.updates = updatesData || [];
  renderHighlights();
  renderUpdates();
}

function renderHighlights() {
  if (!state.highlights.length) {
    els.highlightsList.innerHTML = '<div class="item-card"><div><strong>No highlights yet.</strong><div class="small muted">Add your first highlight to start.</div></div></div>';
    return;
  }

  els.highlightsList.innerHTML = state.highlights.map(item => `
    <div class="item-card">
      <div>
        <strong>${item.title}</strong>
        <div class="small muted">Order: ${item.sort_order || 1}</div>
        <div class="small muted">${item.link || 'No link'}</div>
        ${item.image_url ? `<div class="small muted">Image: ${item.image_url}</div>` : ''}
      </div>
      <div class="item-actions">
        <button type="button" data-edit-highlight="${item.id}">Edit</button>
        <button type="button" class="danger" data-delete-highlight="${item.id}">Delete</button>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('[data-edit-highlight]').forEach(button => {
    button.addEventListener('click', () => populateHighlightForm(button.dataset.editHighlight));
  });

  document.querySelectorAll('[data-delete-highlight]').forEach(button => {
    button.addEventListener('click', () => deleteHighlight(button.dataset.deleteHighlight));
  });
}

function renderUpdates() {
  if (!state.updates.length) {
    els.updatesList.innerHTML = '<div class="item-card"><div><strong>No updates yet.</strong><div class="small muted">Add your first update.</div></div></div>';
    return;
  }

  els.updatesList.innerHTML = state.updates.map(item => `
    <div class="item-card">
      <div>
        <strong>${item.title}</strong>
        <div class="small muted">${item.type || 'video'}</div>
        <div class="small muted">${item.text}</div>
        ${item.image_url ? `<div class="small muted">Image: ${item.image_url}</div>` : ''}
        ${item.video_url ? `<div class="small muted">Video: ${item.video_url}</div>` : ''}
      </div>
      <div class="item-actions">
        <button type="button" data-edit-update="${item.id}">Edit</button>
        <button type="button" class="danger" data-delete-update="${item.id}">Delete</button>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('[data-edit-update]').forEach(button => {
    button.addEventListener('click', () => populateUpdateForm(button.dataset.editUpdate));
  });

  document.querySelectorAll('[data-delete-update]').forEach(button => {
    button.addEventListener('click', () => deleteUpdate(button.dataset.deleteUpdate));
  });
}

async function populateHighlightForm(id) {
  const item = state.highlights.find(entry => String(entry.id) === String(id));
  if (!item) return;

  document.getElementById('highlightId').value = item.id;
  document.getElementById('highlightTitle').value = item.title || '';
  document.getElementById('highlightLink').value = item.link || '';
  document.getElementById('highlightImageUrl').value = item.image_url || '';
  document.getElementById('highlightOrder').value = item.sort_order || 1;
  state.activeTab = 'highlights';
  setActiveTab('highlights');
}

async function populateUpdateForm(id) {
  const item = state.updates.find(entry => String(entry.id) === String(id));
  if (!item) return;

  document.getElementById('updateId').value = item.id;
  document.getElementById('updateTitle').value = item.title || '';
  document.getElementById('updateType').value = item.type || 'video';
  document.getElementById('updateText').value = item.text || '';
  document.getElementById('updateImageUrl').value = item.image_url || '';
  document.getElementById('updateVideoUrl').value = item.video_url || '';
  state.activeTab = 'updates';
  setActiveTab('updates');
}

async function deleteHighlight(id) {
  if (!confirm('Delete this highlight?')) return;
  const { error } = await state.supabase.from('highlights').delete().eq('id', id);
  if (error) {
    alert(error.message || 'Delete failed.');
    return;
  }
  await loadContent();
}

async function deleteUpdate(id) {
  if (!confirm('Delete this update?')) return;
  const { error } = await state.supabase.from('updates').delete().eq('id', id);
  if (error) {
    alert(error.message || 'Delete failed.');
    return;
  }
  await loadContent();
}

async function saveHighlight(event) {
  event.preventDefault();
  if (!state.supabase) return;

  const id = document.getElementById('highlightId').value;
  const title = document.getElementById('highlightTitle').value.trim();
  const link = document.getElementById('highlightLink').value.trim();
  const imageUrl = document.getElementById('highlightImageUrl').value.trim();
  const sortOrder = Number(document.getElementById('highlightOrder').value || 1);
  const file = document.getElementById('highlightImageFile').files[0];

  let finalImageUrl = imageUrl;
  if (file) {
    finalImageUrl = await uploadMedia(file);
  }

  const payload = {
    title,
    link,
    image_url: finalImageUrl,
    sort_order: sortOrder
  };

  let query = state.supabase.from('highlights');

  if (id) {
    query = query.update(payload).eq('id', id);
  } else {
    query = query.insert(payload);
  }

  const { error } = await query;
  if (error) {
    alert(error.message || 'Could not save highlight.');
    return;
  }

  els.highlightForm.reset();
  document.getElementById('highlightId').value = '';
  document.getElementById('highlightOrder').value = 1;
  await loadContent();
}

async function saveUpdate(event) {
  event.preventDefault();
  if (!state.supabase) return;

  const id = document.getElementById('updateId').value;
  const title = document.getElementById('updateTitle').value.trim();
  const text = document.getElementById('updateText').value.trim();
  const type = document.getElementById('updateType').value;
  const imageUrl = document.getElementById('updateImageUrl').value.trim();
  const videoUrl = document.getElementById('updateVideoUrl').value.trim();
  const imageFile = document.getElementById('updateImageFile').files[0];
  const videoFile = document.getElementById('updateVideoFile').files[0];

  let finalImageUrl = imageUrl;
  let finalVideoUrl = videoUrl;

  if (imageFile) {
    finalImageUrl = await uploadMedia(imageFile);
  }

  if (videoFile) {
    finalVideoUrl = await uploadMedia(videoFile);
  }

  const payload = {
    title,
    text,
    type,
    image_url: finalImageUrl,
    video_url: finalVideoUrl
  };

  let query = state.supabase.from('updates');

  if (id) {
    query = query.update(payload).eq('id', id);
  } else {
    query = query.insert(payload);
  }

  const { error } = await query;
  if (error) {
    alert(error.message || 'Could not save update.');
    return;
  }

  els.updateForm.reset();
  document.getElementById('updateId').value = '';
  await loadContent();
}

function setActiveTab(tab) {
  state.activeTab = tab;
  const isHighlights = tab === 'highlights';
  els.highlightTab.classList.toggle('hidden', !isHighlights);
  els.updateTab.classList.toggle('hidden', isHighlights);
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
}

document.querySelectorAll('.tab-btn').forEach(button => {
  button.addEventListener('click', () => setActiveTab(button.dataset.tab));
});

els.loginForm.addEventListener('submit', handleLogin);
els.logoutBtn.addEventListener('click', handleLogout);
els.highlightForm.addEventListener('submit', saveHighlight);
els.updateForm.addEventListener('submit', saveUpdate);
document.getElementById('resetHighlightForm').addEventListener('click', () => {
  els.highlightForm.reset();
  document.getElementById('highlightId').value = '';
  document.getElementById('highlightOrder').value = 1;
});
document.getElementById('resetUpdateForm').addEventListener('click', () => {
  els.updateForm.reset();
  document.getElementById('updateId').value = '';
});

setupSupabase();
handleSessionCheck();
