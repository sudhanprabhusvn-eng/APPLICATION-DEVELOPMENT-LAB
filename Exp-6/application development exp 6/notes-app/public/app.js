/**
 * PocketNotes Application Client Logic
 * Exp 6: Full-Stack Notes Taking Application with MongoDB & Express
 */

const API = '/api/notes';
const HEALTH_API = '/api/health';

// Application State
let notesState = [];
let editingNoteId = null;
let selectedColor = '#6366f1';
let currentCategoryFilter = 'ALL';
let currentSort = 'newest';
let deleteTargetId = null;

// DOM Selectors
const $ = (id) => document.getElementById(id);
const searchInput = $('searchInput');
const clearSearchBtn = $('clearSearch');
const noteForm = $('noteForm');
const titleInput = $('titleInput');
const categoryInput = $('categoryInput');
const contentInput = $('contentInput');
const charCount = $('charCount');
const saveBtnText = $('saveBtnText');
const cancelBtn = $('cancelBtn');
const cancelEditTopBtn = $('cancelEditTopBtn');
const formModeBadge = $('formModeBadge');
const formTitle = $('formTitle');
const composerCard = $('composerCard');
const colorPicker = $('colorPicker');
const notesContainer = $('notesContainer');
const feedCount = $('feedCount');
const totalNotesStat = $('totalNotesStat');
const refreshBtn = $('refreshBtn');
const sortSelect = $('sortSelect');
const categoryPills = $('categoryPills');
const dbBadge = $('dbBadge');
const dbStatusText = $('dbStatusText');
const apiModal = $('apiModal');
const apiInfoBtn = $('apiInfoBtn');
const closeApiModal = $('closeApiModal');
const deleteModal = $('deleteModal');
const confirmDeleteBtn = $('confirmDeleteBtn');
const cancelDeleteBtn = $('cancelDeleteBtn');
const toastContainer = $('toastContainer');

// Utility: HTML Escaping
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Utility: Toast Notification
function showToast(message, type = 'info') {
  const container = $('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// Check MongoDB Connection Health
async function checkBackendHealth() {
  try {
    const res = await fetch(HEALTH_API);
    if (!res.ok) throw new Error('Health check error');
    const data = await res.json();
    if (data.mongodb === 'connected') {
      dbBadge.className = 'status-badge connected';
      dbStatusText.textContent = 'MongoDB Online';
    } else {
      dbBadge.className = 'status-badge disconnected';
      dbStatusText.textContent = 'MongoDB Offline';
    }
  } catch (err) {
    dbBadge.className = 'status-badge disconnected';
    dbStatusText.textContent = 'Server Offline';
  }
}

// Fetch Notes from Backend (READ)
async function fetchNotes() {
  try {
    const query = encodeURIComponent(searchInput.value.trim());
    const url = query ? `${API}?q=${query}` : API;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    
    notesState = await res.json();
    renderNotes();
  } catch (error) {
    console.error('Failed to load notes:', error);
    notesContainer.innerHTML = `
      <div class="empty-state">
        <h3>Could not load notes</h3>
        <p>Ensure the Node.js server and MongoDB service are running on localhost.</p>
        <button class="btn btn-secondary" style="width: auto; margin-top: 1rem;" onclick="fetchNotes()">Retry</button>
      </div>`;
    showToast('Failed to fetch notes from server', 'error');
  }
}

// Render Notes into DOM
function renderNotes() {
  let filtered = [...notesState];

  // Category filter
  if (currentCategoryFilter !== 'ALL') {
    filtered = filtered.filter(n => (n.category || 'General').toLowerCase() === currentCategoryFilter.toLowerCase());
  }

  // Sorting
  if (currentSort === 'newest') {
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (currentSort === 'oldest') {
    filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else if (currentSort === 'title') {
    filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  }

  // Update counters
  feedCount.textContent = `${filtered.length} item${filtered.length === 1 ? '' : 's'}`;
  totalNotesStat.textContent = notesState.length;

  if (filtered.length === 0) {
    const hasSearch = searchInput.value.trim().length > 0;
    notesContainer.innerHTML = `
      <div class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
        </svg>
        <h3>${hasSearch ? 'No matching notes found' : 'No notes saved yet'}</h3>
        <p>${hasSearch ? 'Try a different keyword or clear the search filter.' : 'Create your first note using the form on the left to save it directly to MongoDB.'}</p>
      </div>`;
    return;
  }

  notesContainer.innerHTML = filtered.map(note => {
    const createdDate = new Date(note.createdAt).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const category = escapeHtml(note.category || 'General');
    const noteColor = note.color || '#6366f1';

    return `
      <article class="note-card" style="--note-color: ${noteColor}" data-id="${note._id}">
        <div class="color-strip"></div>
        <div class="note-top">
          <span class="category-tag">${category}</span>
          <span class="date-text">${createdDate}</span>
        </div>
        <h3 class="note-title">${escapeHtml(note.title || 'Untitled')}</h3>
        <p class="note-body">${escapeHtml(note.content)}</p>
        <div class="note-actions">
          <div class="action-group">
            <button class="card-action-btn copy-btn" data-action="copy" data-id="${note._id}" title="Copy to clipboard">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              Copy
            </button>
            <button class="card-action-btn edit-btn" data-action="edit" data-id="${note._id}" title="Edit note">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
              Edit
            </button>
          </div>
          <button class="card-action-btn delete-btn" data-action="delete" data-id="${note._id}" title="Delete note">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Delete
          </button>
        </div>
      </article>
    `;
  }).join('');
}

// Reset Composer Form to Create Mode
function resetComposer() {
  editingNoteId = null;
  noteForm.reset();
  formModeBadge.textContent = 'New Note';
  formTitle.textContent = 'Create a Note';
  saveBtnText.textContent = 'Save Note';
  cancelBtn.hidden = true;
  cancelEditTopBtn.hidden = true;
  composerCard.classList.remove('editing-mode');
  selectColor('#6366f1');
  updateCharCount();
}

// Set Composer Form to Edit Mode
function setEditMode(note) {
  editingNoteId = note._id;
  titleInput.value = note.title || '';
  contentInput.value = note.content || '';
  categoryInput.value = note.category || 'General';
  selectColor(note.color || '#6366f1');

  formModeBadge.textContent = 'Editing Note';
  formTitle.textContent = 'Update Note';
  saveBtnText.textContent = 'Update Note';
  cancelBtn.hidden = false;
  cancelEditTopBtn.hidden = false;
  composerCard.classList.add('editing-mode');

  updateCharCount();
  composerCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
  contentInput.focus();
}

// Handle Color Selection
function selectColor(hex) {
  selectedColor = hex;
  const dots = colorPicker.querySelectorAll('.color-dot');
  dots.forEach(dot => {
    if (dot.dataset.color.toLowerCase() === hex.toLowerCase()) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });
}

// Live Content Character & Word Count
function updateCharCount() {
  const text = contentInput.value.trim();
  const words = text ? text.split(/\s+/).length : 0;
  charCount.textContent = `${words} word${words === 1 ? '' : 's'} • ${text.length} chars`;
}

// Create (POST) or Update (PUT) Note
noteForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = titleInput.value.trim() || 'Untitled';
  const content = contentInput.value.trim();
  const category = categoryInput.value;
  const color = selectedColor;

  if (!content) {
    showToast('Note content cannot be empty', 'error');
    contentInput.focus();
    return;
  }

  const payload = { title, content, category, color };

  try {
    saveBtnText.textContent = editingNoteId ? 'Updating...' : 'Saving...';
    const isEdit = Boolean(editingNoteId);
    const endpoint = isEdit ? `${API}/${editingNoteId}` : API;
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Server error saving note');
    }

    showToast(isEdit ? 'Note updated successfully!' : 'Note saved to MongoDB!', 'success');
    resetComposer();
    await fetchNotes();
  } catch (err) {
    console.error('Error saving note:', err);
    showToast(err.message, 'error');
  } finally {
    saveBtnText.textContent = editingNoteId ? 'Update Note' : 'Save Note';
  }
});

// Note Card Actions Delegation (Copy, Edit, Delete)
notesContainer.addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;

  const action = btn.dataset.action;
  const noteId = btn.dataset.id;
  const note = notesState.find(n => n._id === noteId);

  if (!note) return;

  if (action === 'copy') {
    const textToCopy = `${note.title ? note.title + '\n\n' : ''}${note.content}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      showToast('Note copied to clipboard!', 'info');
    }).catch(() => {
      showToast('Could not copy to clipboard', 'error');
    });
  } else if (action === 'edit') {
    setEditMode(note);
  } else if (action === 'delete') {
    deleteTargetId = noteId;
    deleteModal.showModal();
  }
});

// Delete Modal Handlers (DELETE)
confirmDeleteBtn.addEventListener('click', async () => {
  if (!deleteTargetId) return;

  try {
    confirmDeleteBtn.textContent = 'Deleting...';
    const res = await fetch(`${API}/${deleteTargetId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete note');

    showToast('Note deleted from MongoDB', 'info');
    deleteModal.close();

    // If currently editing the deleted note, reset
    if (editingNoteId === deleteTargetId) {
      resetComposer();
    }

    deleteTargetId = null;
    await fetchNotes();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    confirmDeleteBtn.textContent = 'Yes, Delete';
  }
});

cancelDeleteBtn.addEventListener('click', () => {
  deleteTargetId = null;
  deleteModal.close();
});

// Color picker clicks
colorPicker.addEventListener('click', (e) => {
  const dot = e.target.closest('.color-dot');
  if (dot) {
    selectColor(dot.dataset.color);
  }
});

// Category pills clicks
categoryPills.addEventListener('click', (e) => {
  const pill = e.target.closest('.pill');
  if (!pill) return;

  categoryPills.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
  pill.classList.add('active');
  currentCategoryFilter = pill.dataset.category;
  renderNotes();
});

// Sort select change
sortSelect.addEventListener('change', (e) => {
  currentSort = e.target.value;
  renderNotes();
});

// Search input handling
let searchTimeout;
searchInput.addEventListener('input', () => {
  clearSearchBtn.hidden = !searchInput.value;
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    fetchNotes();
  }, 250);
});

clearSearchBtn.addEventListener('click', () => {
  searchInput.value = '';
  clearSearchBtn.hidden = true;
  fetchNotes();
});

// Cancel buttons
cancelBtn.addEventListener('click', resetComposer);
cancelEditTopBtn.addEventListener('click', resetComposer);

// Live character counting
contentInput.addEventListener('input', updateCharCount);

// Refresh button
refreshBtn.addEventListener('click', () => {
  fetchNotes();
  checkBackendHealth();
  showToast('Notes synchronized with database', 'info');
});

// API Info Modal
apiInfoBtn.addEventListener('click', () => apiModal.showModal());
closeApiModal.addEventListener('click', () => apiModal.close());
apiModal.addEventListener('click', (e) => {
  if (e.target === apiModal) apiModal.close();
});
deleteModal.addEventListener('click', (e) => {
  if (e.target === deleteModal) deleteModal.close();
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (apiModal.open) apiModal.close();
    if (deleteModal.open) deleteModal.close();
    if (editingNoteId) resetComposer();
  }
  // Cmd/Ctrl + Enter to submit form
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    if (document.activeElement === contentInput || document.activeElement === titleInput) {
      noteForm.requestSubmit();
    }
  }
});

// Initial boot
(async function init() {
  await checkBackendHealth();
  await fetchNotes();
  // Periodic health check
  setInterval(checkBackendHealth, 15000);
})();
