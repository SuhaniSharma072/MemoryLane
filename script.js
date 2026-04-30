
const words = [
  { text: 'Memory', id: 'memory' },
  { text: 'Lane',   id: 'lane'   },
];

words.forEach(({ text, id }, wordIndex) => {
  const container = document.getElementById(id);
  text.split('').forEach((char, i) => {
    const span = document.createElement('span');
    span.className = 'bubbly-letter';
    span.textContent = char;
    span.style.animationDelay = `${wordIndex * 0.5 + i * 0.08}s`;
    container.appendChild(span);
  });
});


/* store */

const STORAGE_KEY = 'memorylane_memories';

function loadMemories() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
  } catch (e) {
    console.warn('Could not save to localStorage:', e);
  }
}

let memories = loadMemories();
let editingId = null; 


renderCards();


function openModal(id = null) {
  editingId = id;

  if (id !== null) {

    const m = memories.find(mem => mem.id === id);
    if (!m) return;

    document.getElementById('modal-title').textContent = '✿ edit memory ✿';
    document.getElementById('btn-save').textContent    = 'save changes ✿';
    document.getElementById('f-name').value            = m.name;
    document.getElementById('f-location').value        = m.location;
    document.getElementById('f-date-start').value      = m.dateStart;
    document.getElementById('f-date-end').value        = m.dateEnd;
    document.getElementById('f-desc').value            = m.desc;
    document.getElementById('f-github').value          = m.github;
    document.getElementById('f-project').value         = m.project;

    const preview = document.getElementById('photo-preview');
    if (m.photo) {
      preview.src = m.photo;
      preview.style.display = 'block';
    } else {
      preview.src = '';
      preview.style.display = 'none';
    }
  } else {

    document.getElementById('modal-title').textContent = '✿ new memory ✿';
    document.getElementById('btn-save').textContent    = 'pin this memory ✿';
    clearFields();
  }

  document.getElementById('modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
  document.body.style.overflow = '';
  editingId = null;
  clearFields();
}

function clearFields() {
  const preview = document.getElementById('photo-preview');
  preview.style.display = 'none';
  preview.src = '';

  ['f-name', 'f-location', 'f-date-start', 'f-date-end', 'f-desc', 'f-github', 'f-project'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('f-photo').value = '';
}



// clos modal when clicking outside
document.getElementById('modal').addEventListener('click', function (e) {
  if (e.target === this) closeModal();
});


function previewPhoto(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = e => {
      const preview = document.getElementById('photo-preview');
      preview.src = e.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(input.files[0]);
  }
}

/* save or add or edit*/
function saveMemory() {
  const name = document.getElementById('f-name').value.trim();
  if (!name) {
    document.getElementById('f-name').focus();
    return;
  }

  const previewEl = document.getElementById('photo-preview');
  const newPhoto  = previewEl.src && previewEl.src !== window.location.href ? previewEl.src : '';

  if (editingId !== null) {
    // Update existing memory
    const idx = memories.findIndex(m => m.id === editingId);
    if (idx === -1) return;

    memories[idx] = {
      ...memories[idx],
      name,
      location:  document.getElementById('f-location').value.trim(),
      dateStart: document.getElementById('f-date-start').value,
      dateEnd:   document.getElementById('f-date-end').value,
      desc:      document.getElementById('f-desc').value.trim(),
      github:    document.getElementById('f-github').value.trim(),
      project:   document.getElementById('f-project').value.trim(),
      // replacs foto if new one is chosen
      photo:     newPhoto || memories[idx].photo,
    };
  }
   else {
    // Add new memory
    memories.push({
      id:        Date.now(),
      name,
      location:  document.getElementById('f-location').value.trim(),
      dateStart: document.getElementById('f-date-start').value,
      dateEnd:   document.getElementById('f-date-end').value,
      desc:      document.getElementById('f-desc').value.trim(),
      github:    document.getElementById('f-github').value.trim(),
      project:   document.getElementById('f-project').value.trim(),
      photo:     newPhoto,
    });
  }



  saveToStorage(); 
  renderCards();
  closeModal();
}

function deleteMemory(id) {
  memories = memories.filter(m => m.id !== id);
  saveToStorage();
  renderCards();
}


function formatDateRange(startStr, endStr) {
  if (!startStr) return '';

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const parseDate = str => {
    const [y, m, d] = str.split('-');
    return { year: +y, month: +m, day: +d, monthName: months[+m - 1] };
  };

  const s = parseDate(startStr);

  if (!endStr || endStr === startStr) {
    return `${s.monthName} ${s.day}, ${s.year}`;
  }

  const e = parseDate(endStr);

  if (s.year === e.year && s.month === e.month) {
  
    return `${s.monthName} ${s.day}–${e.day}, ${s.year}`;
  } else if (s.year === e.year) {

    return `${s.monthName} ${s.day} – ${e.monthName} ${e.day}, ${s.year}`;
  } else {

    return `${s.monthName} ${s.day}, ${s.year} – ${e.monthName} ${e.day}, ${e.year}`;
  }
}


function renderCards() {
  const container  = document.getElementById('allnotes');
  const emptyState = document.getElementById('empty-state');

  if (memories.length === 0) {
    container.innerHTML = '';
    container.appendChild(emptyState);
    return;
  }


  
  container.innerHTML = '';

  memories.forEach((m, i) => {
    const card = document.createElement('div');
    card.className = 'memory-card';
    card.style.transform = i % 2 === 0 ? 'rotate(-1.5deg)' : 'rotate(1.2deg)';

    const dateLabel = formatDateRange(m.dateStart, m.dateEnd);

    card.innerHTML = `
      <div class="tape"></div>

      <div class="card-actions">
        <button class="card-btn card-btn-edit"   onclick="openModal(${m.id})" title="edit">✎</button>
        <button class="card-btn card-btn-delete" onclick="deleteMemory(${m.id})" title="delete">✕</button>
      </div>

      ${m.photo
        ? `<img class="card-photo" src="${m.photo}" alt="${m.name}">`
        : `<div class="card-photo-placeholder">✿</div>`
      }

      <div class="card-title">${m.name}</div>

      <div class="card-meta">
        ${m.location ? `
          <span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
            ${m.location}
          </span>` : ''
        }
        ${dateLabel ? `
          <span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8"  y1="2" x2="8"  y2="6"/>
              <line x1="3"  y1="10" x2="21" y2="10"/>
            </svg>
            ${dateLabel}
          </span>` : ''
        }
      </div>

      ${m.desc ? `<p class="card-desc">${m.desc}</p>` : ''}

      <div class="card-links">
        ${m.github  ? `<a class="card-link" href="${m.github}"  target="_blank">⌥ github</a>`  : ''}
        ${m.project ? `<a class="card-link" href="${m.project}" target="_blank">✦ project</a>` : ''}
      </div>
    `;

    container.appendChild(card);
  });
}

