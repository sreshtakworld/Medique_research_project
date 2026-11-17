const STORE = "mediqueState.v3";
const API_URL = "http://localhost:5000/api";
const PRIORITY = { Emergency: 1, High: 2, Normal: 3 };
const AVG_MINS = 9;
const SLOTS = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];
let selectedSlot = "";

const departments = [
  { name: "Cardiology", icon: "ECG", desc: "Heart rhythm, hypertension, chest pain, cardiac imaging.", beds: 42 },
  { name: "Neurology", icon: "NEU", desc: "Stroke care, migraine, epilepsy, movement disorders.", beds: 32 },
  { name: "Orthopedics", icon: "ORT", desc: "Joint care, trauma, sports injury, spine services.", beds: 46 },
  { name: "Pediatrics", icon: "PED", desc: "Child care, fever clinic, vaccination, neonatal support.", beds: 38 },
  { name: "Dermatology", icon: "DER", desc: "Skin, hair, allergy, cosmetic dermatology.", beds: 18 },
  { name: "Emergency Care", icon: "ER", desc: "24/7 triage, ambulance, critical response.", beds: 28 },
  { name: "General Medicine", icon: "MED", desc: "Fever, infection, diabetes, chronic care.", beds: 54 },
  { name: "Gynecology", icon: "GYN", desc: "Pregnancy care, women's health, fertility support.", beds: 30 },
  { name: "Oncology", icon: "ONC", desc: "Cancer screening, chemotherapy support, follow-ups.", beds: 24 }
];

const doctorSeed = [
  { id: "d-priya", name: "Dr. Priya Sharma", dept: "Cardiology", qualification: "MD, DM Cardiology", exp: 18, languages: "English, Hindi, Telugu", fee: 900, rating: 4.9, available: true, photo: "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { id: "d-arjun", name: "Dr. Arjun Mehta", dept: "Orthopedics", qualification: "MS Orthopedics", exp: 14, languages: "English, Hindi", fee: 850, rating: 4.8, available: true, photo: "https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { id: "d-anita", name: "Dr. Anita Reddy", dept: "Neurology", qualification: "MD, DM Neurology", exp: 12, languages: "English, Telugu", fee: 1000, rating: 4.8, available: true, photo: "https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { id: "d-rajesh", name: "Dr. Rajesh Kumar", dept: "Pediatrics", qualification: "MD Pediatrics", exp: 20, languages: "English, Hindi, Telugu", fee: 650, rating: 4.9, available: true, photo: "https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { id: "d-sneha", name: "Dr. Sneha Iyer", dept: "Dermatology", qualification: "MD Dermatology", exp: 9, languages: "English, Tamil, Hindi", fee: 700, rating: 4.7, available: false, photo: "https://images.pexels.com/photos/5214958/pexels-photo-5214958.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { id: "d-meera", name: "Dr. Meera Nair", dept: "Gynecology", qualification: "MS OBG", exp: 16, languages: "English, Malayalam, Hindi", fee: 800, rating: 4.8, available: true, photo: "https://images.pexels.com/photos/5452268/pexels-photo-5452268.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { id: "d-vikram", name: "Dr. Vikram Singh", dept: "Oncology", qualification: "DM Oncology", exp: 22, languages: "English, Hindi", fee: 1200, rating: 4.9, available: true, photo: "https://images.pexels.com/photos/5452206/pexels-photo-5452206.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { id: "d-suresh", name: "Dr. Suresh Babu", dept: "General Medicine", qualification: "MD Internal Medicine", exp: 25, languages: "English, Telugu, Hindi", fee: 500, rating: 4.7, available: true, photo: "https://images.pexels.com/photos/8376277/pexels-photo-8376277.jpeg?auto=compress&cs=tinysrgb&w=800" }
];

async function fetchDoctors() {
  try {

    const response = await fetch(`${API_URL}/doctors`);

    const doctors = await response.json();

    console.log("Doctors from MongoDB:", doctors);

    return doctors;

  } catch (error) {

    console.error("Error fetching doctors:", error);

    return [];

  }
}

function today(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function seedState() {
  const now = Date.now();
  const doctors = doctorSeed;
  const appointments = [
    appointmentSeed("a1", "Ramesh Babu", "9876543210", "d-priya", "Cardiology", today(), "09:00", "Emergency", "Emergency Consultation", "E001", "Serving", now - 3600000),
    appointmentSeed("a2", "Lakshmi Devi", "9876543211", "d-anita", "Neurology", today(), "09:30", "High", "General Consultation", "H001", "Waiting", now - 3000000),
    appointmentSeed("a3", "Anand Kumar", "9876543212", "d-suresh", "General Medicine", today(), "10:00", "Normal", "General Consultation", "N001", "Waiting", now - 2400000),
    appointmentSeed("a4", "Priya Nair", "9876543213", "d-rajesh", "Pediatrics", today(), "10:30", "High", "Follow-Up", "H002", "Waiting", now - 1800000),
    appointmentSeed("a5", "Venkat Rao", "9876543214", "d-arjun", "Orthopedics", today(), "11:00", "Normal", "General Consultation", "N002", "Waiting", now - 1200000)
  ];
  return {
    version: 3,
    hospital: { name: "Medique Multi-Speciality Hospital", city: "Hyderabad", state: "Telangana", beds: 350, doctors: 120, departments: 15 },
    doctors,
    appointments,
    queue: appointments.map(queueFromAppointment),
    medicalRecords: [
      { id: "mr1", patient: "Demo Patient", doctor: "Dr. Priya Sharma", date: today(-18), type: "Prescription", summary: "Hypertension follow-up. Continue medication and review in 30 days." },
      { id: "mr2", patient: "Demo Patient", doctor: "Dr. Suresh Babu", date: today(-40), type: "Lab Report", summary: "CBC and fasting glucose reviewed. Lifestyle advice given." }
    ],
    notifications: [
      { id: "n1", role: "patient", text: "Your cardiology follow-up reminder is due tomorrow.", time: now - 5400000, read: false },
      { id: "n2", role: "doctor", text: "Emergency token E001 is currently in consultation.", time: now - 4200000, read: false }
    ],
    counters: { Emergency: 1, High: 2, Normal: 2 },
    history: []
  };
}

function appointmentSeed(id, patient, phone, doctorId, department, date, time, priority, type, token, status, createdAt) {
  const doctor = doctorSeed.find(d => d.id === doctorId);
  return { id, patient, phone, email: "", doctorId, doctor: doctor.name, department, date, time, priority, type, token, status, source: "Online", notes: "Demo case", createdAt, updatedAt: createdAt };
}
function queueFromAppointment(a) {
  return { id: "q-" + a.id, appointmentId: a.id, token: a.token, patient: a.patient, phone: a.phone, department: a.department, doctorId: a.doctorId, doctor: a.doctor, priority: a.priority, source: a.source, status: a.status, createdAt: a.createdAt, updatedAt: a.updatedAt };
}
function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORE) || "null");
    if (parsed && parsed.version === 3) return parsed;
  } catch (e) { }
  const fresh = seedState();
  localStorage.setItem(STORE, JSON.stringify(fresh));
  return fresh;
}
function saveState(state) {
  localStorage.setItem(STORE, JSON.stringify(state));
}
function state() { return loadState(); }
async function doctorByMongoId(id) {

  const doctors = await fetchDoctors();

  return doctors.find(
    d => d._id === id
  );

}
function waitingQueue(s = state()) {
  return s.queue.filter(q => q.status === "Waiting").sort((a, b) => PRIORITY[a.priority] - PRIORITY[b.priority] || a.createdAt - b.createdAt);
}
function currentServing(s = state()) {
  return s.queue.find(q => q.status === "Serving") || null;
}
function nextToken(s, priority) {
  s.counters[priority] = (s.counters[priority] || 0) + 1;
  return ({ Emergency: "E", High: "H", Normal: "N" }[priority]) + String(s.counters[priority]).padStart(3, "0");
}
function patientInitials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(n => n[0]).join("").toUpperCase() || "P";
}
function escapeHtml(text) {
  return String(text || "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[ch]));
}
function showPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  const page = document.getElementById("page-" + id);
  if (page) page.classList.add("active");
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.toggle("active", b.textContent.toLowerCase().replace(/\s+/g, "-").includes(id)));
  const secondaryIds = ["departments", "doctors", "book", "queue", "emergency", "services", "contact"];
  document.getElementById("menuToggle")?.classList.toggle("active", secondaryIds.includes(id));
  if (id === "doctors") renderDoctors();
  if (id === "queue") renderQueuePage();
  if (id === "book") renderSlots();
  history.replaceState(null, "", "#" + id);
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function navTo(btn, id) {
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  closeMenu();
  showPage(id);
}
function toggleMenu() {
  const menu = document.getElementById("mainMenu");
  const toggle = document.getElementById("menuToggle");
  const open = !menu.classList.contains("open");
  menu.classList.toggle("open", open);
  toggle.setAttribute("aria-expanded", String(open));
}
function closeMenu() {
  const menu = document.getElementById("mainMenu");
  const toggle = document.getElementById("menuToggle");
  if (!menu || !toggle) return;
  menu.classList.remove("open");
  toggle.setAttribute("aria-expanded", "false");
}
function menuNav(id) {
  closeMenu();
  showPage(id);
}
function toast(message) {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove("show"), 3400);
}
function toggleTheme() {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  localStorage.setItem("medique.theme", next);
}
function openLogin() { document.getElementById("loginModal").classList.add("open"); }
function closeLogin() { document.getElementById("loginModal").classList.remove("open"); }
function goPortal(role) { window.location.href = "portal.html#" + role; }

function renderServices() {
  const serviceItems = [
    ...departments.slice(0, 6),
    { name: "ICU and Critical Care", icon: "ICU", desc: "Advanced monitoring, ventilator support, and specialist-led intensive care.", beds: 36 },
    { name: "Diagnostics and Labs", icon: "LAB", desc: "Pathology, imaging, ECG, and rapid reporting connected to patient records.", beds: 12 },
    { name: "Pharmacy", icon: "RX", desc: "In-hospital pharmacy support for discharge medicines and prescription fulfilment.", beds: 8 },
    { name: "Ambulance Services", icon: "AMB", desc: "24/7 ambulance coordination for emergency and transfer cases.", beds: 10 }
  ];
  const cardHtml = items => items.map(d => `
    <article class="card service-card">
      <div class="service-icon">${d.icon}</div>
      <h3>${d.name}</h3>
      <p>${d.desc}</p>
      <span class="badge blue">${d.beds} beds</span>
    </article>`).join("");
  const homeGrid = document.getElementById("homeServices");
  if (homeGrid) homeGrid.innerHTML = cardHtml(serviceItems.slice(0, 6));
  const servicesGrid = document.getElementById("servicesGrid");
  if (servicesGrid) servicesGrid.innerHTML = cardHtml(serviceItems);
}
function renderDepartments() {
  const s = state();
  document.getElementById("departmentsGrid").innerHTML = departments.map(d => {
    const deptWaiting = s.queue.filter(q => q.department === d.name && q.status === "Waiting").length;
    return `<article class="card service-card">
      <div class="service-icon">${d.icon}</div>
      <h3>${d.name}</h3>
      <p>${d.desc}</p>
      <div class="progress" aria-label="Department queue load"><span style="width:${Math.min(100, deptWaiting * 14)}%"></span></div>
      <div class="inline-actions"><span class="badge green">${deptWaiting} waiting</span><button class="btn btn-soft" onclick="bookDepartment('${d.name}')">Book</button></div>
    </article>`;
  }).join("");
}
function fillDepartmentFilters() {
  const filter = document.getElementById("doctorFilter");
  const depSelect = document.getElementById("departmentSelect");
  const options = departments.map(d => `<option value="${d.name}">${d.name}</option>`).join("");
  filter.innerHTML = `<option value="">All departments</option>${options}`;
  depSelect.innerHTML = `<option value="">Select department</option>${options}`;
}
async function populateDoctorSelect() {

  const dep = document.getElementById("departmentSelect").value;

  const doctors = await fetchDoctors();

  const docs = doctors.filter(
    d => !dep || d.specialization === dep
  );

  document.getElementById("doctorSelect").innerHTML =
    `<option value="">Select doctor</option>` +
    docs.map(
      d => `<option value="${d._id}">${d.name}</option>`
    ).join("");
}
async function renderDoctors(limit) {

  const doctors = await fetchDoctors();

  let docs = doctors.map(d => ({
    id: d._id,
    name: d.name,
    dept: d.specialization,
    qualification: d.qualification,
    exp: d.experience,
    languages: "English",
    fee: 500,
    rating: 4.8,
    available: d.availability,
    photo: "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=800"
  }));

  const q = (document.getElementById("doctorSearch")?.value || "").toLowerCase();
  const dep = document.getElementById("doctorFilter")?.value || "";

  docs = docs.filter(d =>
    (!dep || d.dept === dep) &&
    (!q || (d.name + " " + d.dept).toLowerCase().includes(q))
  );

  if (limit) docs = docs.slice(0, limit);

  const target = limit
    ? document.getElementById("featuredDoctors")
    : document.getElementById("doctorsGrid");

  target.innerHTML = docs.map(d => doctorCard(d)).join("");
}
function doctorCard(d) {
  return `<article class="card doctor-card">
    <img src="${d.photo}" alt="${d.name}, ${d.dept}" loading="lazy">
    <div class="doctor-body">
      <h3>${d.name}</h3>
      <p>${d.dept} | ${d.qualification}</p>
      <div class="doctor-meta">
        <span>${d.exp}+ years experience</span>
        <span>${d.languages}</span>
        <span>Fee: Rs. ${d.fee} | Rating ${d.rating}</span>
      </div>
      <div class="inline-actions">
        <span class="badge ${d.available ? "green" : "amber"}">${d.available ? "Available" : "Busy"}</span>
        <button class="btn btn-primary" onclick="bookDoctor('${d.id}')">Book</button>
      </div>
    </div>
  </article>`;
}
async function bookDoctor(id) {

  const doctors = await fetchDoctors();

  const d = doctors.find(doc => doc._id === id);

  if (!d) {
    alert("Doctor not found");
    return;
  }

  showPage("book");

  console.log("Doctor Specialization:", d.specialization);
  console.log("Department Options:",
    [...document.getElementById("departmentSelect").options]
      .map(o => o.value)
  );

  document.getElementById("departmentSelect").value =
    d.specialization;

  await populateDoctorSelect();

  document.getElementById("doctorSelect").value =
    d._id;

  renderSlots();
}
function bookDepartment(dep) {
  showPage("book");
  document.getElementById("departmentSelect").value = dep;
  populateDoctorSelect();
  renderSlots();
}
function renderSlots() {
  const s = state();
  const dateInput = document.getElementById("dateSelect");
  if (!dateInput.value) dateInput.value = today();
  dateInput.min = today();
  const doctorId = document.getElementById("doctorSelect").value;
  const date = dateInput.value;
  const taken = s.appointments.filter(a => a.doctorId === doctorId && a.date === date && !["Cancelled", "Rejected", "Completed"].includes(a.status)).map(a => a.time);
  document.getElementById("slotGrid").innerHTML = SLOTS.map(slot => `<button type="button" class="slot ${selectedSlot === slot ? "selected" : ""}" ${taken.includes(slot) ? "disabled" : ""} onclick="selectSlot(this,'${slot}')">${slot}</button>`).join("");
  renderBookingPreview();
}
function selectSlot(btn, slot) {
  if (btn.disabled) return;
  selectedSlot = slot;
  document.querySelectorAll(".slot").forEach(s => s.classList.remove("selected"));
  btn.classList.add("selected");
}
function renderBookingPreview() {
  const s = state();
  const rows = waitingQueue(s).slice(0, 5);
  document.getElementById("bookingPreview").innerHTML = rows.length ? rows.map((q, i) => miniPatient(q, i)).join("") : `<p style="color:var(--muted)">No patients waiting right now.</p>`;
}
function miniPatient(q, i) {
  return `<div class="mini-patient">
    <span class="token-pill ${q.priority.toLowerCase()}">${q.token}</span>
    <div><b>${escapeHtml(q.patient)}</b><br><small style="color:var(--muted)">${q.department} | ${q.doctor}</small></div>
    <span class="badge ${q.priority === "Emergency" ? "red" : q.priority === "High" ? "amber" : "green"}">#${i + 1}</span>
  </div>`;
}
async function bookAppointment() {
  const s = state();
  const patient = document.getElementById("patientName").value.trim();
  const phone = document.getElementById("patientPhone").value.trim();
  const email = document.getElementById("patientEmail").value.trim();
  const department = document.getElementById("departmentSelect").value;
  const doctorId = document.getElementById("doctorSelect").value;
  const date = document.getElementById("dateSelect").value;
  const priority = document.getElementById("prioritySelect").value;
  const type = document.getElementById("appointmentType").value;
  const notes = document.getElementById("notes").value.trim();
  if (!patient || !phone || !department || !doctorId || !date || !selectedSlot) { toast("Please complete patient, doctor, date, and slot details."); return; }
  const duplicate = s.appointments.find(a => a.phone === phone && a.doctorId === doctorId && a.date === date && !["Cancelled", "Rejected", "Completed"].includes(a.status));
  if (duplicate) { toast("Duplicate prevented: this patient already has an active booking with this doctor today."); return; }
  const overlap = s.appointments.find(a => a.doctorId === doctorId && a.date === date && a.time === selectedSlot && !["Cancelled", "Rejected", "Completed"].includes(a.status));
  if (overlap) { toast("That slot was just taken. Please choose another time."); renderSlots(); return; }
  const doctor = await doctorByMongoId(doctorId);
  if (!doctor) {
    toast("Doctor not found.");
    return;
  }
  const token = nextToken(s, priority);
  const id = "a-" + Date.now();
  const record = { id, patient, phone, email, doctorId, doctor: doctor.name, department, date, time: selectedSlot, priority, type, token, status: "Waiting", source: "Online", notes, createdAt: Date.now(), updatedAt: Date.now() };
  s.appointments.push(record);
  s.queue.push(queueFromAppointment(record));
  s.notifications.push({ id: "n-" + Date.now(), role: "patient", text: `Appointment confirmed with ${doctor.name}. Token ${token}.`, time: Date.now(), read: false });
  saveState(s);
  document.querySelector("#page-book form").reset();
  selectedSlot = "";
  populateDoctorSelect();
  renderSlots();
  refreshPublic();
  toast(`Appointment confirmed. Your token is ${token}.`);
  showPage("queue");
}
function quickEmergency() {
  const s = state();
  const doctor = s.doctors.find(d => d.dept === "Emergency Care") || s.doctors.find(d => d.dept === "General Medicine") || s.doctors[0];
  const token = nextToken(s, "Emergency");
  const id = "a-" + Date.now();
  const rec = { id, patient: "Emergency Walk-In", phone: "0000000000", email: "", doctorId: doctor.id, doctor: doctor.name, department: "Emergency Care", date: today(), time: "Immediate", priority: "Emergency", type: "Emergency Consultation", token, status: "Waiting", source: "Walk-In", notes: "Emergency token created from public site.", createdAt: Date.now(), updatedAt: Date.now() };
  s.appointments.push(rec); s.queue.push(queueFromAppointment(rec)); saveState(s);
  refreshPublic();
  toast(`Emergency token ${token} created and prioritized.`);
  showPage("queue");
}
function renderQueuePage() {
  const s = state();
  const serving = currentServing(s);
  const waiting = waitingQueue(s);
  const current = serving ? serving.token : "None";
  const next = waiting[0]?.token || "None";
  const emergencyCount = waiting.filter(q => q.priority === "Emergency").length;
  document.getElementById("queueStats").innerHTML = [
    statCard("Current Token", current),
    statCard("Next Token", next),
    statCard("Patients Waiting", waiting.length),
    statCard("Emergency Cases", emergencyCount)
  ].join("");
  const rows = [];
  if (serving) rows.push({ ...serving, position: "Now", wait: "In consultation" });
  waiting.forEach((q, i) => rows.push({ ...q, position: i + 1, wait: `~${Math.max(3, (serving ? AVG_MINS : 0) + i * AVG_MINS)} min` }));
  document.getElementById("queueTableBody").innerHTML = rows.length ? rows.map(q => `
    <tr>
      <td><span class="token-pill ${q.priority.toLowerCase()}" style="width:58px">${q.token}</span></td>
      <td>${escapeHtml(q.patient)}<br><small style="color:var(--muted)">${q.source}</small></td>
      <td><span class="badge ${q.priority === "Emergency" ? "red" : q.priority === "High" ? "amber" : "green"}">${q.priority}</span></td>
      <td>${q.doctor}<br><small style="color:var(--muted)">${q.department}</small></td>
      <td>${q.position}</td>
      <td>${q.wait}</td>
      <td><span class="badge ${q.status === "Serving" ? "blue" : "green"}">${q.status}</span></td>
    </tr>`).join("") : `<tr><td colspan="7">No active queue records.</td></tr>`;
}
function statCard(label, value) { return `<div class="stat"><b>${value}</b><span>${label}</span></div>`; }
function renderHomeQueue() {
  const s = state();
  const serving = currentServing(s);
  const waiting = waitingQueue(s);
  document.getElementById("homeCurrentToken").textContent = serving?.token || "None";
  document.getElementById("homeNextToken").textContent = waiting[0]?.token || "None";
  document.getElementById("homeWait").textContent = waiting.length ? `~${Math.max(3, (serving ? AVG_MINS : 0))} min` : "0 min";
  document.getElementById("homeQueueMini").innerHTML = waiting.slice(0, 3).map((q, i) => miniPatient(q, i)).join("") || `<p style="color:var(--muted)">Queue is clear.</p>`;
}
function refreshPublic() {
  renderHomeQueue();
  renderDepartments();
  renderBookingPreview();
  renderQueuePage();
}

window.addEventListener("storage", e => { if (e.key === STORE) refreshPublic(); });
document.addEventListener("click", event => {
  const wrap = document.getElementById("mainMenuWrap");
  if (wrap && !wrap.contains(event.target)) closeMenu();
});
document.addEventListener("keydown", event => { if (event.key === "Escape") closeMenu(); });
document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("medique.theme");
  if (savedTheme) document.documentElement.dataset.theme = savedTheme;
  fillDepartmentFilters();
  populateDoctorSelect();
  renderServices();
  renderDepartments();
  renderDoctors(4);
  renderDoctors();
  refreshPublic();
  const hash = location.hash.replace("#", "");
  if (hash) showPage(hash);
  setInterval(renderHomeQueue, 5000);
});

