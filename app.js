// 1. Namunaviy Xonalar Misollari
const defaultRooms = [
  { id: 'R101', number: '101-Xona', capacity: 30, floor: 1 },
  { id: 'R102', number: '102-Xona', capacity: 40, floor: 1 },
  { id: 'R201', number: '201-Laboratoriya', capacity: 20, floor: 2 },
  { id: 'R202', number: '202-Kompyuter Zali', capacity: 30, floor: 2 },
  { id: 'R301', number: '301-Ma\'ruzaxona', capacity: 100, floor: 3 }
];

// 2. Namunaviy Darslar (Har bir xona va kun uchun misollar)
const defaultSchedule = [
  {
    id: 1,
    day: 'Dushanba',
    roomId: 'R101',
    subject: 'Sun\'iy Intellekt Asoslari',
    teacher: 'Prof. A. Alimov',
    group: 'AI-201',
    startTime: '09:00',
    endTime: '10:20'
  },
  {
    id: 2,
    day: 'Dushanba',
    roomId: 'R101',
    subject: 'Python Backend (FastAPI)',
    teacher: 'A. Karimov',
    group: 'PY-102',
    startTime: '10:30',
    endTime: '11:50'
  },
  {
    id: 3,
    day: 'Dushanba',
    roomId: 'R202',
    subject: 'Web Dasturlash (React)',
    teacher: 'B. Rustamov',
    group: 'FE-301',
    startTime: '09:00',
    endTime: '10:20'
  },
  {
    id: 4,
    day: 'Dushanba',
    roomId: 'R301',
    subject: 'Oliy Matematika',
    teacher: 'D. Qodirov',
    group: 'ALL-101',
    startTime: '11:00',
    endTime: '12:30'
  },
  {
    id: 5,
    day: 'Seshanba',
    roomId: 'R201',
    subject: 'Fizika Laboratoriyasi',
    teacher: 'N. Umarova',
    group: 'PH-105',
    startTime: '13:30',
    endTime: '14:50'
  },
  {
    id: 6,
    day: 'Seshanba',
    roomId: 'R102',
    subject: 'UX/UI Dizayn Tamoyillari',
    teacher: 'M. Zokirova',
    group: 'DZ-402',
    startTime: '10:00',
    endTime: '11:20'
  }
];

// Dastur Holati
let rooms = defaultRooms;
let schedule = JSON.parse(localStorage.getItem('eduschedule_data')) || defaultSchedule;
let selectedDay = 'Dushanba';
let statusFilter = 'all';
let searchQuery = '';

// DOM Elementlari
const roomsGrid = document.getElementById('roomsGrid');
const scheduleBody = document.getElementById('scheduleBody');
const daySelect = document.getElementById('daySelect');
const searchInput = document.getElementById('searchInput');
const roomSelectInput = document.getElementById('roomSelectInput');
const lessonModal = document.getElementById('lessonModal');
const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const lessonForm = document.getElementById('lessonForm');
const conflictAlert = document.getElementById('conflictAlert');
const exportCsvBtn = document.getElementById('exportCsvBtn');

// Dasturni Ishga Tushirish
function init() {
  populateRoomDropdown();
  updateLiveClock();
  setInterval(updateLiveClock, 1000);
  renderAll();
  setupEventListeners();
}

// Xonalarni tanlash menyusini to'ldirish
function populateRoomDropdown() {
  roomSelectInput.innerHTML = rooms.map(r => `<option value="${r.id}">${r.number} (${r.capacity} kishilik)</option>`).join('');
}

// Real vaqt soatini yangilash
function updateLiveClock() {
  const now = new Date();
  document.getElementById('liveClock').innerText = now.toLocaleTimeString('uz-UZ');
  document.getElementById('liveDate').innerText = now.toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
  
  // Real vaqt o'tishi bilan xonalar bandligini qayta tekshirish
  renderRooms();
  updateStats();
}

// Xona ayni daqiqada band yoki bo'shligini hisoblash
function getRoomCurrentLesson(roomId) {
  const now = new Date();
  const currentDaysMap = ['Shanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
  const todayName = currentDaysMap[now.getDay()];

  // Tanlangan kunga mos keladigan va ayni vaqt oralig'idagi darsni topish
  const currentTimeStr = now.toTimeString().substring(0, 5); // "HH:MM"

  return schedule.find(s => {
    return s.roomId === roomId &&
           s.day === selectedDay &&
           currentTimeStr >= s.startTime &&
           currentTimeStr <= s.endTime;
  });
}

// Xonalarni vizual chiqarish
function renderRooms() {
  roomsGrid.innerHTML = '';

  rooms.forEach(room => {
    const activeLesson = getRoomCurrentLesson(room.id);
    const isBusy = Boolean(activeLesson);

    if (statusFilter === 'free' && isBusy) return;
    if (statusFilter === 'busy' && !isBusy) return;

    const card = document.createElement('div');
    card.className = `room-card ${isBusy ? 'is-busy' : 'is-free'}`;
    card.innerHTML = `
      <div class="room-head">
        <span class="room-title">${room.number}</span>
        <span class="status-tag ${isBusy ? 'tag-busy' : 'tag-free'}">
          ${isBusy ? '🔴 BAND' : '🟢 BO\'SH'}
        </span>
      </div>
      <div class="room-body">
        <p>📏 Sig'im: <b>${room.capacity} ta o'rin</b> (${room.floor}-qavat)</p>
        ${isBusy ? `
          <p class="subject-title">📘 ${activeLesson.subject}</p>
          <p>👨‍🏫 ${activeLesson.teacher}</p>
          <p>👥 Guruh: <b>${activeLesson.group}</b></p>
          <p>⏰ ${activeLesson.startTime} - ${activeLesson.endTime}</p>
        ` : `
          <p class="subject-title" style="color: var(--success); margin-top:0.6rem;">Hozirda bo'sh turibdi</p>
        `}
      </div>
    `;
    roomsGrid.appendChild(card);
  });
}

// Jadvalni chiqarish
function renderSchedule() {
  scheduleBody.innerHTML = '';

  const filtered = schedule.filter(s => {
    const matchesDay = s.day === selectedDay;
    const q = searchQuery.toLowerCase();
    const room = rooms.find(r => r.id === s.roomId);
    const roomName = room ? room.number.toLowerCase() : '';

    const matchesSearch = s.subject.toLowerCase().includes(q) ||
                          s.teacher.toLowerCase().includes(q) ||
                          s.group.toLowerCase().includes(q) ||
                          roomName.includes(q);

    return matchesDay && matchesSearch;
  });

  if (filtered.length === 0) {
    scheduleBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: var(--text-muted); padding: 1.5rem;">Ma'lumot topilmadi yoki bu kunga dars biriktirilmagan.</td></tr>`;
    return;
  }

  // Vaqt boyicha tartiblash
  filtered.sort((a, b) => a.startTime.localeCompare(b.startTime));

  const nowStr = new Date().toTimeString().substring(0, 5);

  filtered.forEach(s => {
    const room = rooms.find(r => r.id === s.roomId);
    const isOngoing = nowStr >= s.startTime && nowStr <= s.endTime;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><b>${s.startTime} - ${s.endTime}</b></td>
      <td>${room ? room.number : 'Noma\'lum'}</td>
      <td><b>${s.subject}</b></td>
      <td>${s.teacher}</td>
      <td><span style="background: var(--bg-main); padding: 0.2rem 0.5rem; border-radius: 4px; font-weight:600;">${s.group}</span></td>
      <td>
        <span class="status-tag ${isOngoing ? 'tag-busy' : 'tag-free'}">
          ${isOngoing ? 'Dars jarayonda' : 'Rejalashtirilgan'}
        </span>
      </td>
      <td>
        <button class="btn-del" onclick="deleteLesson(${s.id})">O'chirish</button>
      </td>
    `;
    scheduleBody.appendChild(tr);
  });
}

// Statistikani yangilash
function updateStats() {
  const dayLessons = schedule.filter(s => s.day === selectedDay);
  const busyRoomsCount = rooms.filter(r => Boolean(getRoomCurrentLesson(r.id))).length;

  document.getElementById('statTotalRooms').innerText = rooms.length;
  document.getElementById('statBusyRooms').innerText = busyRoomsCount;
  document.getElementById('statFreeRooms').innerText = rooms.length - busyRoomsCount;
  document.getElementById('statTodayLessons').innerText = dayLessons.length;
}

// Hammasini qayta chizish
function renderAll() {
  renderRooms();
  renderSchedule();
  updateStats();
}

// Darslar vaqt to'qnashuvini tekshirish (Conflict Detection)
function checkTimeConflict(roomId, day, startTime, endTime) {
  return schedule.some(item => {
    if (item.roomId !== roomId || item.day !== day) return false;
    // Vaqt oraliqlari kesishish sharti
    return (startTime < item.endTime) && (endTime > item.startTime);
  });
}

// Darsni o'chirish
window.deleteLesson = function(id) {
  schedule = schedule.filter(s => s.id !== id);
  saveData();
  showToast('Dars muvaffaqiyatli o\'chirildi');
};

// LocalStorage va saqlash
function saveData() {
  localStorage.setItem('eduschedule_data', JSON.stringify(schedule));
  renderAll();
}

// Toast Bildirishnomasi
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.innerText = msg;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3000);
}

// CSV Eksport qilish funksiyasi
function exportToCSV() {
  let csv = 'Hafta Kuni,Vaqti,Xona,Fan,Oqituvchi,Guruh\n';
  schedule.forEach(s => {
    const room = rooms.find(r => r.id === s.roomId);
    csv += `"${s.day}","${s.startTime}-${s.endTime}","${room ? room.number : ''}","${s.subject}","${s.teacher}","${s.group}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `Dars_Jadvali_${selectedDay}.csv`;
  link.click();
  showToast('Dars jadvali CSV formatida yuklandi!');
}

// Hodisalarni sozlash
function setupEventListeners() {
  daySelect.addEventListener('change', (e) => {
    selectedDay = e.target.value;
    renderAll();
  });

  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderSchedule();
  });

  // Status bo'yicha filter tugmalari
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      statusFilter = e.target.dataset.status;
      renderRooms();
    });
  });

  // Modalni ochish/yopish
  openModalBtn.addEventListener('click', () => {
    conflictAlert.classList.add('hidden');
    lessonModal.classList.remove('hidden');
  });
  closeModalBtn.addEventListener('click', () => lessonModal.classList.add('hidden'));

  exportCsvBtn.addEventListener('click', exportToCSV);

  // Formani topshirish va to'qnashuvni tekshirish
  lessonForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const day = document.getElementById('dayInput').value;
    const roomId = document.getElementById('roomSelectInput').value;
    const group = document.getElementById('groupInput').value;
    const subject = document.getElementById('subjectInput').value;
    const teacher = document.getElementById('teacherInput').value;
    const startTime = document.getElementById('startTimeInput').value;
    const endTime = document.getElementById('endTimeInput').value;

    if (startTime >= endTime) {
      alert('Tugash vaqti boshlanish vaqtidan keyin bo\'lishi kerak!');
      return;
    }

    // To'qnashuvni tekshirish
    const hasConflict = checkTimeConflict(roomId, day, startTime, endTime);
    if (hasConflict) {
      conflictAlert.classList.remove('hidden');
      return;
    }

    const newLesson = {
      id: Date.now(),
      day, roomId, group, subject, teacher, startTime, endTime
    };

    schedule.push(newLesson);
    saveData();

    lessonForm.reset();
    lessonModal.classList.add('hidden');
    showToast('Yangi dars jadvalga biriktirildi!');
  });
}

// Dasturni yurgizish
init();
