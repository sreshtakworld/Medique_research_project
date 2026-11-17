const STORE = "mediqueState.v3";
const PRIORITY = { Emergency: 1, High: 2, Normal: 3 };
const AVG_MINS = 9;
const SLOTS = ["09:00","09:30","10:00","10:30","11:00","11:30","14:00","14:30","15:00","15:30","16:00","16:30"];
let currentRole = "patient";
let currentView = "dashboard";
let selectedSlot = "";
let channel = "BroadcastChannel" in window ? new BroadcastChannel("medique") : null;

const departments = [
  "Cardiology","Neurology","Orthopedics","Pediatrics","Dermatology","Emergency Care","General Medicine","Gynecology","Oncology"
];
const doctorSeed = [
  {id:"d-priya",name:"Dr. Priya Sharma",dept:"Cardiology",qualification:"MD, DM Cardiology",exp:18,languages:"English, Hindi, Telugu",fee:900,rating:4.9,available:true,photo:"https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {id:"d-arjun",name:"Dr. Arjun Mehta",dept:"Orthopedics",qualification:"MS Orthopedics",exp:14,languages:"English, Hindi",fee:850,rating:4.8,available:true,photo:"https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {id:"d-anita",name:"Dr. Anita Reddy",dept:"Neurology",qualification:"MD, DM Neurology",exp:12,languages:"English, Telugu",fee:1000,rating:4.8,available:true,photo:"https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {id:"d-rajesh",name:"Dr. Rajesh Kumar",dept:"Pediatrics",qualification:"MD Pediatrics",exp:20,languages:"English, Hindi, Telugu",fee:650,rating:4.9,available:true,photo:"https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {id:"d-sneha",name:"Dr. Sneha Iyer",dept:"Dermatology",qualification:"MD Dermatology",exp:9,languages:"English, Tamil, Hindi",fee:700,rating:4.7,available:false,photo:"https://images.pexels.com/photos/5214958/pexels-photo-5214958.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {id:"d-meera",name:"Dr. Meera Nair",dept:"Gynecology",qualification:"MS OBG",exp:16,languages:"English, Malayalam, Hindi",fee:800,rating:4.8,available:true,photo:"https://images.pexels.com/photos/5452268/pexels-photo-5452268.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {id:"d-vikram",name:"Dr. Vikram Singh",dept:"Oncology",qualification:"DM Oncology",exp:22,languages:"English, Hindi",fee:1200,rating:4.9,available:true,photo:"https://images.pexels.com/photos/5452206/pexels-photo-5452206.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {id:"d-suresh",name:"Dr. Suresh Babu",dept:"General Medicine",qualification:"MD Internal Medicine",exp:25,languages:"English, Telugu, Hindi",fee:500,rating:4.7,available:true,photo:"https://images.pexels.com/photos/8376277/pexels-photo-8376277.jpeg?auto=compress&cs=tinysrgb&w=800"}
];

const navByRole = {
  patient:[
    ["dashboard","DB","Dashboard"],["book","BK","Book"],["appointments","AP","Appointments"],["queue","Q","Queue Status"],["records","MR","Medical Records"],["notifications","NT","Notifications"],["profile","PR","Profile"]
  ],
  doctor:[
    ["dashboard","DB","Dashboard"],["appointments","AP","My Appointments"],["queue","Q","Queue Management"],["patients","PT","Patients"],["prescriptions","RX","Prescriptions"],["schedule","SC","Schedule"],["analytics","AN","Analytics"]
  ],
  admin:[
    ["dashboard","DB","Dashboard"],["doctors","DR","Doctors"],["patients","PT","Patients"],["appointments","AP","Appointments"],["queue","Q","Queue Management"],["reports","RP","Reports"],["settings","ST","Settings"]
  ]
};

function today(offset=0){
  const d = new Date();
  d.setDate(d.getDate()+offset);
  return d.toISOString().slice(0,10);
}
function appointmentSeed(id,patient,phone,doctorId,department,date,time,priority,type,token,status,createdAt){
  const doctor = doctorSeed.find(d=>d.id===doctorId);
  return {id,patient,phone,email:"",doctorId,doctor:doctor.name,department,date,time,priority,type,token,status,source:"Online",notes:"Demo case",createdAt,updatedAt:createdAt};
}
function queueFromAppointment(a){
  return {id:"q-"+a.id,appointmentId:a.id,token:a.token,patient:a.patient,phone:a.phone,department:a.department,doctorId:a.doctorId,doctor:a.doctor,priority:a.priority,source:a.source,status:a.status,createdAt:a.createdAt,updatedAt:a.updatedAt};
}
function seedState(){
  const now = Date.now();
  const appointments = [
    appointmentSeed("a1","Ramesh Babu","9876543210","d-priya","Cardiology",today(), "09:00","Emergency","Emergency Consultation","E001","Serving",now-3600000),
    appointmentSeed("a2","Lakshmi Devi","9876543211","d-anita","Neurology",today(), "09:30","High","General Consultation","H001","Waiting",now-3000000),
    appointmentSeed("a3","Anand Kumar","9876543212","d-suresh","General Medicine",today(), "10:00","Normal","General Consultation","N001","Waiting",now-2400000),
    appointmentSeed("a4","Priya Nair","9876543213","d-rajesh","Pediatrics",today(), "10:30","High","Follow-Up","H002","Waiting",now-1800000),
    appointmentSeed("a5","Venkat Rao","9876543214","d-arjun","Orthopedics",today(), "11:00","Normal","General Consultation","N002","Waiting",now-1200000)
  ];
  return {
    version:3,
    hospital:{name:"Medique Multi-Speciality Hospital",city:"Hyderabad",state:"Telangana",beds:350,doctors:120,departments:15},
    doctors:doctorSeed,
    appointments,
    queue:appointments.map(queueFromAppointment),
    medicalRecords:[
      {id:"mr1",patient:"Demo Patient",doctor:"Dr. Priya Sharma",date:today(-18),type:"Prescription",summary:"Hypertension follow-up. Continue medication and review in 30 days."},
      {id:"mr2",patient:"Demo Patient",doctor:"Dr. Suresh Babu",date:today(-40),type:"Lab Report",summary:"CBC and fasting glucose reviewed. Lifestyle advice given."}
    ],
    notifications:[
      {id:"n1",role:"patient",text:"Your cardiology follow-up reminder is due tomorrow.",time:now-5400000,read:false},
      {id:"n2",role:"doctor",text:"Emergency token E001 is currently in consultation.",time:now-4200000,read:false}
    ],
    counters:{Emergency:1,High:2,Normal:2},
    history:[]
  };
}
function loadState(){
  try{
    const parsed = JSON.parse(localStorage.getItem(STORE) || "null");
    if(parsed && parsed.version === 3) return parsed;
  }catch(e){}
  const fresh = seedState();
  localStorage.setItem(STORE, JSON.stringify(fresh));
  return fresh;
}
function saveState(s){
  localStorage.setItem(STORE, JSON.stringify(s));
  if(channel) channel.postMessage({type:"state"});
}
function state(){ return loadState(); }
function doctorById(id, s=state()){ return s.doctors.find(d=>d.id===id) || s.doctors[0]; }
function waitingQueue(s=state()){
  return s.queue.filter(q=>q.status==="Waiting").sort((a,b)=>PRIORITY[a.priority]-PRIORITY[b.priority] || a.createdAt-b.createdAt);
}
function servingQueue(s=state()){ return s.queue.find(q=>q.status==="Serving") || null; }
function patientInitials(name){
  return String(name || "P").split(/\s+/).filter(Boolean).slice(0,2).map(n=>n[0]).join("").toUpperCase();
}
function escapeHtml(text){
  return String(text || "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[ch]));
}
function nextToken(s, priority){
  s.counters[priority] = (s.counters[priority] || 0) + 1;
  return ({Emergency:"E",High:"H",Normal:"N"}[priority]) + String(s.counters[priority]).padStart(3,"0");
}
function statusBadge(status){
  const cls = status==="Completed" ? "green" : status==="Serving" ? "blue" : status==="Rejected" || status==="Cancelled" ? "red" : "amber";
  return `<span class="badge ${cls}">${status}</span>`;
}
function priorityBadge(priority){
  const cls = priority==="Emergency" ? "red" : priority==="High" ? "amber" : "green";
  return `<span class="badge ${cls}">${priority}</span>`;
}
function tokenClass(priority){ return String(priority || "Normal").toLowerCase(); }
function formatTime(ts){
  return ts ? new Date(ts).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}) : "-";
}

function selectLoginRole(btn, role){
  currentRole = role;
  document.querySelectorAll(".role-tab").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById("loginEmail").value = `${role}@medique.in`;
}
function login(){
  const email = document.getElementById("loginEmail").value.trim();
  const pass = document.getElementById("loginPassword").value.trim();
  if(!email || !pass){ toast("Please enter email and password."); return; }
  if(email.includes("admin")) currentRole = "admin";
  else if(email.includes("doctor")) currentRole = "doctor";
  document.getElementById("loginShell").style.display = "none";
  document.getElementById("app").style.display = "block";
  document.getElementById("rolePill").textContent = currentRole.charAt(0).toUpperCase()+currentRole.slice(1);
  renderSideNav();
  openView("dashboard");
  toast(`Signed in as ${currentRole}.`);
}
function logout(){
  document.getElementById("app").style.display = "none";
  document.getElementById("loginShell").style.display = "grid";
}
function renderSideNav(){
  const nav = navByRole[currentRole];
  document.getElementById("sideNav").innerHTML = `<div class="nav-section">${currentRole} Portal</div>` + nav.map(item=>`
    <button class="side-btn ${item[0]===currentView?"active":""}" onclick="openView('${item[0]}')">
      <span class="side-icon">${item[1]}</span>${item[2]}
    </button>`).join("") + `
    <div class="nav-section">System</div>
    <button class="side-btn" onclick="openWebsite()"><span class="side-icon">WEB</span>Public Website</button>`;
}
function openWebsite(){ window.location.href = "index.html"; }
function toggleProjectMenu(){
  const menu = document.getElementById("projectMenu");
  const toggle = document.getElementById("projectToggle");
  const open = !menu.classList.contains("open");
  menu.classList.toggle("open", open);
  toggle.setAttribute("aria-expanded", String(open));
}
function closeProjectMenu(){
  const menu = document.getElementById("projectMenu");
  const toggle = document.getElementById("projectToggle");
  if(!menu || !toggle) return;
  menu.classList.remove("open");
  toggle.setAttribute("aria-expanded", "false");
}
function switchProject(role){
  closeProjectMenu();
  currentRole = role;
  document.getElementById("rolePill").textContent = role.charAt(0).toUpperCase()+role.slice(1);
  currentView = "dashboard";
  renderSideNav();
  openView("dashboard");
  history.replaceState(null, "", "#"+role);
}
function openView(view){
  currentView = view;
  renderSideNav();
  const map = {
    dashboard: renderDashboard,
    book: renderBookingView,
    appointments: renderAppointmentsView,
    queue: renderQueueView,
    records: renderRecordsView,
    notifications: renderNotificationsView,
    profile: renderProfileView,
    patients: renderPatientsView,
    prescriptions: renderPrescriptionsView,
    schedule: renderScheduleView,
    analytics: renderAnalyticsView,
    doctors: renderDoctorsView,
    reports: renderReportsView,
    settings: renderSettingsView
  };
  (map[view] || renderDashboard)();
}
function header(title, subtitle, actions=""){
  return `<div class="view-head"><div><h1>${title}</h1><p>${subtitle}</p></div><div style="display:flex;gap:8px;flex-wrap:wrap">${actions}</div></div>`;
}
function kpi(label,value,sub,icon){
  return `<div class="card kpi" data-icon="${icon}"><small>${label}</small><strong>${value}</strong><span>${sub}</span></div>`;
}

function renderDashboard(){
  const s = state();
  const waiting = waitingQueue(s);
  const serving = servingQueue(s);
  if(currentRole==="patient") renderPatientDashboard(s, waiting, serving);
  else if(currentRole==="doctor") renderDoctorDashboard(s, waiting, serving);
  else renderAdminDashboard(s, waiting, serving);
}
function renderPatientDashboard(s, waiting, serving){
  const myPhone = "9999999999";
  const upcoming = s.appointments.filter(a=>!["Completed","Cancelled","Rejected"].includes(a.status)).length;
  const pos = waiting.findIndex(q=>q.phone===myPhone);
  document.getElementById("view").innerHTML = header("Patient Dashboard","Appointments, queue token, records, and reminders in one place.", `<button class="btn btn-green" onclick="openView('book')">+ Book Appointment</button>`) + `
    <div class="grid grid-4">
      ${kpi("Upcoming Appointments", upcoming, "Includes online and walk-in tokens", "AP")}
      ${kpi("Completed Visits", s.appointments.filter(a=>a.status==="Completed").length, "Consultation history", "OK")}
      ${kpi("Queue Position", pos >= 0 ? "#"+(pos+1) : "-", serving ? "Current: "+serving.token : "No active serving", "Q")}
      ${kpi("Medical Records", s.medicalRecords.length, "Prescriptions and lab notes", "MR")}
    </div>
    <div style="height:16px"></div>
    <div class="grid grid-2">
      <div class="card">${sectionTitle("My Queue Status")}${queueStatusCard(s)}</div>
      <div class="card">${sectionTitle("Notifications")}${notificationList("patient",3)}</div>
    </div>
    <div style="height:16px"></div>
    ${appointmentTable(s.appointments.slice(0,6), "Recent Appointments")}
  `;
}
function renderDoctorDashboard(s, waiting, serving){
  const todayApps = s.appointments.filter(a=>a.date===today()).length;
  document.getElementById("view").innerHTML = header("Doctor Dashboard","Manage consultations, call next patients, and keep care moving.", `<button class="btn btn-green" onclick="callNextPatient()">Call Next Patient</button><button class="btn btn-soft" onclick="openPrescriptionForCurrent()">Add Prescription</button>`) + `
    <div class="grid grid-4">
      ${kpi("Patients Today", todayApps, "Across all departments", "PT")}
      ${kpi("Pending Queue", waiting.length, "Priority sorted", "Q")}
      ${kpi("Completed Consultations", s.appointments.filter(a=>a.status==="Completed").length, "Today and demo history", "OK")}
      ${kpi("Avg Consultation", AVG_MINS+"m", "Used for wait estimates", "TM")}
    </div>
    <div style="height:16px"></div>
    <div class="queue-board">${nowServingCard(s)}<div>${queueStack(s, true)}</div></div>
    <div style="height:16px"></div>
    ${appointmentTable(s.appointments.filter(a=>a.date===today()).slice(0,8), "Today's Appointments")}
  `;
}
function renderAdminDashboard(s, waiting, serving){
  const emergency = waiting.filter(q=>q.priority==="Emergency").length;
  document.getElementById("view").innerHTML = header("Admin Dashboard","Hospital overview, active queues, emergency load, and operational reports.", `<button class="btn btn-green" onclick="openWalkIn()">+ Add Walk-In</button><button class="btn btn-soft" onclick="exportRecords()">Export CSV</button>`) + `
    <div class="grid grid-4">
      ${kpi("Total Patients", uniquePatients(s), "Across appointment records", "PT")}
      ${kpi("Total Doctors", s.doctors.length, "15 departments supported", "DR")}
      ${kpi("Appointments Today", s.appointments.filter(a=>a.date===today()).length, "Scheduled and walk-in", "AP")}
      ${kpi("Queue Length", waiting.length, emergency+" emergency cases", "Q")}
      ${kpi("Emergency Cases", emergency, "Highest priority", "ER")}
      ${kpi("Revenue", "Rs. 2.4L", "Demo month-to-date", "INR")}
      ${kpi("Avg Wait", projectedWait(waiting.length), "Based on queue load", "TM")}
      ${kpi("Patient Rating", "4.8", "8,402 review signals", "ST")}
    </div>
    <div style="height:16px"></div>
    <div class="grid grid-2">
      <div class="card">${sectionTitle("Hourly Queue Load")}<div class="bar-chart">${barChart()}</div></div>
      <div class="card">${sectionTitle("System Activity")}${activityFeed(s)}</div>
    </div>
    <div style="height:16px"></div>
    <div class="queue-board">${nowServingCard(s)}<div>${queueStack(s, false)}</div></div>
  `;
}
function sectionTitle(text){ return `<h3 style="margin:0 0 14px">${text}</h3>`; }
function uniquePatients(s){ return new Set(s.appointments.map(a=>a.phone || a.patient)).size; }
function projectedWait(count){ return "~" + Math.max(0,count*AVG_MINS) + " min"; }

function queueStatusCard(s){
  const serving = servingQueue(s);
  const waiting = waitingQueue(s);
  return `
    <div class="q-card ${serving ? "serving" : ""}">
      <span class="token ${tokenClass(serving?.priority)}">${serving?.token || "-"}</span>
      <div><b>${serving ? escapeHtml(serving.patient) : "No patient serving"}</b><small>${serving ? serving.doctor+" | "+serving.department : "Queue is ready"}</small></div>
      <span class="badge blue">Current</span>
    </div>
    <div style="height:10px"></div>
    ${waiting.slice(0,4).map((q,i)=>queueCard(q,i,false)).join("") || `<div class="empty">No waiting patients.</div>`}
  `;
}
function notificationList(role, limit){
  const s = state();
  const items = s.notifications.filter(n=>n.role===role || n.role==="all").slice(0,limit || 20);
  return items.length ? items.map(n=>`<div class="q-card"><div class="avatar">NT</div><div><b>${escapeHtml(n.text)}</b><small>${formatTime(n.time)}</small></div><span class="badge ${n.read?"green":"amber"}">${n.read?"Read":"New"}</span></div>`).join("") : `<div class="empty">No notifications.</div>`;
}
function appointmentTable(rows, title){
  return `<div class="table-wrap"><table><thead><tr><th colspan="8">${title}</th></tr><tr><th>Token</th><th>Patient</th><th>Doctor</th><th>Department</th><th>Date</th><th>Time</th><th>Priority</th><th>Status</th></tr></thead><tbody>` +
    (rows.length ? rows.map(a=>`<tr><td><span class="token ${tokenClass(a.priority)}">${a.token}</span></td><td>${escapeHtml(a.patient)}<br><small>${a.source}</small></td><td>${a.doctor}</td><td>${a.department}</td><td>${a.date}</td><td>${a.time}</td><td>${priorityBadge(a.priority)}</td><td>${statusBadge(a.status)}</td></tr>`).join("") : `<tr><td colspan="8">No appointments found.</td></tr>`) +
    `</tbody></table></div>`;
}

function nowServingCard(s){
  const serving = servingQueue(s);
  return `<div class="now-serving">
    <div><small>Now Serving</small><strong>${serving?.token || "None"}</strong><p>${serving ? escapeHtml(serving.patient) : "Queue ready for the next patient."}</p></div>
    <div>
      <p>${serving ? serving.doctor+" | "+serving.department : "No active consultation."}</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-green" onclick="callNextPatient()">Call Next</button>
        <button class="btn btn-soft" onclick="completeCurrent()">Complete</button>
      </div>
    </div>
  </div>`;
}
function queueStack(s, controls){
  const waiting = waitingQueue(s);
  return `<div class="card">${sectionTitle("Priority Ordered Queue")}
    <div class="queue-stack">${waiting.length ? waiting.map((q,i)=>queueCard(q,i,controls)).join("") : `<div class="empty">No waiting patients.</div>`}</div>
  </div>`;
}
function queueCard(q, i, controls){
  const wait = "~" + Math.max(3,(servingQueue()?.token?AVG_MINS:0)+i*AVG_MINS) + " min";
  return `<div class="q-card">
    <span class="token ${tokenClass(q.priority)}">${q.token}</span>
    <div><b>${escapeHtml(q.patient)}</b><small>${q.priority} | ${q.doctor} | Position #${i+1} | ${wait}</small></div>
    ${controls ? `<button class="btn btn-soft btn-small" onclick="promoteToken('${q.token}')">Serve</button>` : priorityBadge(q.priority)}
  </div>`;
}

function renderBookingView(){
  document.getElementById("view").innerHTML = header("Book Appointment","Create a patient appointment with token generation and slot validation.") + `
    <div class="grid grid-2">
      <form class="card" onsubmit="event.preventDefault(); createAppointmentFromForm();">
        <div class="form-grid">
          <div class="field"><label>Patient Name</label><input id="bookName" value="${currentRole==="patient"?"Demo Patient":""}" required></div>
          <div class="field"><label>Phone</label><input id="bookPhone" value="${currentRole==="patient"?"9999999999":""}" required></div>
          <div class="field"><label>Email</label><input id="bookEmail" type="email" value="${currentRole==="patient"?"patient@medique.in":""}"></div>
          <div class="field"><label>Appointment Type</label><select id="bookType"><option>General Consultation</option><option>Follow-Up</option><option>Emergency Consultation</option></select></div>
          <div class="field"><label>Department</label><select id="bookDept" onchange="fillDoctorDropdown('bookDoctor',this.value); renderBookSlots();" required></select></div>
          <div class="field"><label>Doctor</label><select id="bookDoctor" onchange="renderBookSlots()" required></select></div>
          <div class="field"><label>Date</label><input id="bookDate" type="date" value="${today()}" min="${today()}" onchange="renderBookSlots()" required></div>
          <div class="field"><label>Priority</label><select id="bookPriority"><option>Normal</option><option>High</option><option>Emergency</option></select></div>
        </div>
        <div class="field"><label>Available Slots</label><div class="slots" id="bookSlots"></div></div>
        <div class="field"><label>Notes</label><textarea id="bookNotes"></textarea></div>
        <button class="btn btn-green" style="width:100%" type="submit">+ Create Appointment</button>
      </form>
      <div class="card">${sectionTitle("Queue Impact Preview")}<div id="bookPreview"></div></div>
    </div>
  `;
  fillDepartmentDropdown("bookDept");
  fillDoctorDropdown("bookDoctor", document.getElementById("bookDept").value);
  renderBookSlots();
}
function fillDepartmentDropdown(id){
  const el = document.getElementById(id);
  if(el) el.innerHTML = departments.map(d=>`<option>${d}</option>`).join("");
}
function fillDoctorDropdown(id, dept){
  const s = state();
  const el = document.getElementById(id);
  if(!el) return;
  const docs = s.doctors.filter(d=>!dept || d.dept===dept);
  el.innerHTML = docs.map(d=>`<option value="${d.id}">${d.name}</option>`).join("");
}
function renderBookSlots(){
  const s = state();
  const doctorId = document.getElementById("bookDoctor")?.value;
  const date = document.getElementById("bookDate")?.value || today();
  const taken = s.appointments.filter(a=>a.doctorId===doctorId && a.date===date && !["Cancelled","Rejected","Completed"].includes(a.status)).map(a=>a.time);
  const el = document.getElementById("bookSlots");
  if(el) el.innerHTML = SLOTS.map(slot=>`<button type="button" class="slot ${selectedSlot===slot?"selected":""}" ${taken.includes(slot)?"disabled":""} onclick="selectSlot(this,'${slot}')">${slot}</button>`).join("");
  const preview = document.getElementById("bookPreview");
  if(preview) preview.innerHTML = queueStatusCard(s);
}
function selectSlot(btn, slot){
  if(btn.disabled) return;
  selectedSlot = slot;
  document.querySelectorAll(".slot").forEach(s=>s.classList.remove("selected"));
  btn.classList.add("selected");
}
function createAppointmentFromForm(){
  const s = state();
  const patient = document.getElementById("bookName").value.trim();
  const phone = document.getElementById("bookPhone").value.trim();
  const email = document.getElementById("bookEmail").value.trim();
  const department = document.getElementById("bookDept").value;
  const doctorId = document.getElementById("bookDoctor").value;
  const date = document.getElementById("bookDate").value;
  const priority = document.getElementById("bookPriority").value;
  const type = document.getElementById("bookType").value;
  const notes = document.getElementById("bookNotes").value.trim();
  if(!patient || !phone || !department || !doctorId || !date || !selectedSlot){ toast("Complete patient, doctor, date, and slot details."); return; }
  const duplicate = s.appointments.find(a=>a.phone===phone && a.doctorId===doctorId && a.date===date && !["Cancelled","Rejected","Completed"].includes(a.status));
  if(duplicate){ toast("Duplicate prevented: active booking already exists for this patient and doctor today."); return; }
  const overlap = s.appointments.find(a=>a.doctorId===doctorId && a.date===date && a.time===selectedSlot && !["Cancelled","Rejected","Completed"].includes(a.status));
  if(overlap){ toast("Slot overlap prevented. Select another slot."); renderBookSlots(); return; }
  const doctor = doctorById(doctorId, s);
  const token = nextToken(s, priority);
  const id = "a-" + Date.now();
  const rec = {id,patient,phone,email,doctorId,doctor:doctor.name,department,date,time:selectedSlot,priority,type,token,status:"Waiting",source:currentRole==="patient"?"Online":"Staff",notes,createdAt:Date.now(),updatedAt:Date.now()};
  s.appointments.push(rec);
  s.queue.push(queueFromAppointment(rec));
  s.notifications.push({id:"n-"+Date.now(),role:"patient",text:`Appointment created. Token ${token} with ${doctor.name}.`,time:Date.now(),read:false});
  saveState(s);
  selectedSlot = "";
  toast(`Appointment created. Token ${token}.`);
  openView(currentRole==="patient" ? "queue" : "appointments");
}

function renderAppointmentsView(){
  const s = state();
  const actions = currentRole==="patient" ? `<button class="btn btn-green" onclick="openView('book')">+ Book Appointment</button>` : `<button class="btn btn-green" onclick="openWalkIn()">+ Add Walk-In</button>`;
  document.getElementById("view").innerHTML = header(currentRole==="doctor" ? "My Appointments" : "Appointments","Accept, reject, monitor, and update appointment status.", actions) + `
    <div class="toolbar"><input id="apptSearch" placeholder="Search patient, doctor, token" oninput="renderAppointmentsTable()"><select id="apptStatus" onchange="renderAppointmentsTable()"><option value="">All statuses</option><option>Waiting</option><option>Serving</option><option>Completed</option><option>Cancelled</option><option>Rejected</option></select></div>
    <div id="appointmentsTable"></div>
  `;
  renderAppointmentsTable();
}
function renderAppointmentsTable(){
  const s = state();
  const q = (document.getElementById("apptSearch")?.value || "").toLowerCase();
  const status = document.getElementById("apptStatus")?.value || "";
  const rows = s.appointments.filter(a=>(!status || a.status===status) && (!q || (a.patient+" "+a.doctor+" "+a.token).toLowerCase().includes(q)));
  document.getElementById("appointmentsTable").innerHTML = `<div class="table-wrap"><table><thead><tr><th>Token</th><th>Patient</th><th>Doctor</th><th>Date/Time</th><th>Priority</th><th>Status</th><th>Actions</th></tr></thead><tbody>` + (rows.length ? rows.map(a=>`
    <tr><td><span class="token ${tokenClass(a.priority)}">${a.token}</span></td><td>${escapeHtml(a.patient)}<br><small>${a.phone}</small></td><td>${a.doctor}<br><small>${a.department}</small></td><td>${a.date}<br><small>${a.time}</small></td><td>${priorityBadge(a.priority)}</td><td>${statusBadge(a.status)}</td><td>${appointmentActions(a)}</td></tr>`).join("") : `<tr><td colspan="7">No appointments found.</td></tr>`) + `</tbody></table></div>`;
}
function appointmentActions(a){
  if(currentRole==="patient") return `<button class="btn btn-ghost btn-small" onclick="cancelAppointment('${a.id}')">Cancel</button>`;
  if(a.status==="Waiting") return `<button class="btn btn-soft btn-small" onclick="promoteToken('${a.token}')">Serve</button> <button class="btn btn-danger btn-small" onclick="rejectAppointment('${a.id}')">Reject</button>`;
  if(a.status==="Serving") return `<button class="btn btn-green btn-small" onclick="completeCurrent()">Complete</button> <button class="btn btn-soft btn-small" onclick="openPrescription('${a.token}','${a.doctor}')">Rx</button>`;
  return `<button class="btn btn-ghost btn-small" onclick="openPrescription('${a.token}','${a.doctor}')">Record</button>`;
}
function cancelAppointment(id){ updateAppointmentStatus(id, "Cancelled"); }
function rejectAppointment(id){ updateAppointmentStatus(id, "Rejected"); }
function updateAppointmentStatus(id, status){
  const s = state();
  const a = s.appointments.find(x=>x.id===id);
  if(!a) return;
  a.status = status; a.updatedAt = Date.now();
  const q = s.queue.find(x=>x.appointmentId===id);
  if(q) q.status = status;
  if(["Cancelled","Rejected"].includes(status)) s.queue = s.queue.filter(x=>x.appointmentId!==id);
  saveState(s);
  toast(`Appointment ${a.token} marked ${status}.`);
  openView(currentView);
}

function renderQueueView(){
  const s = state();
  const actions = currentRole==="patient" ? `<button class="btn btn-soft" onclick="syncNow()">Refresh</button>` : `<button class="btn btn-green" onclick="callNextPatient()">Call Next</button><button class="btn btn-soft" onclick="openWalkIn()">+ Walk-In</button><button class="btn btn-danger" onclick="addEmergencyDemo()">Emergency</button>`;
  document.getElementById("view").innerHTML = header("Queue Management","Hybrid priority queue with FIFO order inside each priority level.", actions) + `
    <div class="queue-board">${nowServingCard(s)}<div>${queueStack(s, currentRole!=="patient")}</div></div>
    <div style="height:16px"></div>
    <div class="table-wrap"><table><thead><tr><th>Token</th><th>Patient</th><th>Priority</th><th>Doctor</th><th>Source</th><th>Position</th><th>Estimated Wait</th><th>Status</th></tr></thead><tbody>${queueTableRows(s)}</tbody></table></div>
  `;
}
function queueTableRows(s){
  const rows = [];
  const serving = servingQueue(s);
  if(serving) rows.push({...serving,pos:"Now",wait:"In consultation"});
  waitingQueue(s).forEach((q,i)=>rows.push({...q,pos:i+1,wait:"~"+Math.max(3,(serving?AVG_MINS:0)+i*AVG_MINS)+" min"}));
  return rows.length ? rows.map(q=>`<tr><td><span class="token ${tokenClass(q.priority)}">${q.token}</span></td><td>${escapeHtml(q.patient)}<br><small>${q.phone}</small></td><td>${priorityBadge(q.priority)}</td><td>${q.doctor}<br><small>${q.department}</small></td><td>${q.source}</td><td>${q.pos}</td><td>${q.wait}</td><td>${statusBadge(q.status)}</td></tr>`).join("") : `<tr><td colspan="8">No queue records.</td></tr>`;
}
function callNextPatient(){
  const s = state();
  const serving = servingQueue(s);
  if(serving) markQueueCompleted(s, serving);
  const next = waitingQueue(s)[0];
  if(!next){ saveState(s); toast("No waiting patients in queue."); openView(currentView); return; }
  next.status = "Serving"; next.updatedAt = Date.now();
  const app = s.appointments.find(a=>a.id===next.appointmentId);
  if(app){ app.status = "Serving"; app.updatedAt = Date.now(); }
  s.notifications.push({id:"n-"+Date.now(),role:"patient",text:`Token ${next.token} is now serving with ${next.doctor}.`,time:Date.now(),read:false});
  saveState(s);
  toast(`Now serving ${next.token}.`);
  openView(currentView);
}
function completeCurrent(){
  const s = state();
  const serving = servingQueue(s);
  if(!serving){ toast("No active consultation to complete."); return; }
  markQueueCompleted(s, serving);
  saveState(s);
  toast(`${serving.token} completed.`);
  openView(currentView);
}
function markQueueCompleted(s, q){
  q.status = "Completed"; q.updatedAt = Date.now();
  const app = s.appointments.find(a=>a.id===q.appointmentId);
  if(app){ app.status = "Completed"; app.updatedAt = Date.now(); }
  s.history.unshift({token:q.token,patient:q.patient,doctor:q.doctor,department:q.department,priority:q.priority,completedAt:Date.now()});
}
function promoteToken(token){
  const s = state();
  const current = servingQueue(s);
  if(current) markQueueCompleted(s, current);
  const q = s.queue.find(x=>x.token===token && x.status==="Waiting");
  if(!q){ toast("Token is not waiting."); return; }
  q.status = "Serving"; q.updatedAt = Date.now();
  const app = s.appointments.find(a=>a.id===q.appointmentId);
  if(app){ app.status = "Serving"; app.updatedAt = Date.now(); }
  saveState(s);
  toast(`Promoted ${token} to consultation.`);
  openView(currentView);
}
function addEmergencyDemo(){
  const s = state();
  const doctor = s.doctors.find(d=>d.dept==="General Medicine") || s.doctors[0];
  const token = nextToken(s, "Emergency");
  const id = "a-" + Date.now();
  const rec = {id,patient:"Emergency Case",phone:"0000000000",email:"",doctorId:doctor.id,doctor:doctor.name,department:"Emergency Care",date:today(),time:"Immediate",priority:"Emergency",type:"Emergency Consultation",token,status:"Waiting",source:"Walk-In",notes:"Critical emergency case.",createdAt:Date.now(),updatedAt:Date.now()};
  s.appointments.push(rec); s.queue.push(queueFromAppointment(rec)); saveState(s);
  toast(`Emergency token ${token} added.`);
  openView("queue");
}

function openWalkIn(){
  fillDepartmentDropdown("walkDept");
  fillDoctorDropdown("walkDoctor", document.getElementById("walkDept").value);
  document.getElementById("walkinModal").classList.add("open");
}
function addWalkIn(){
  const s = state();
  const patient = document.getElementById("walkName").value.trim();
  const phone = document.getElementById("walkPhone").value.trim();
  const department = document.getElementById("walkDept").value;
  const doctorId = document.getElementById("walkDoctor").value;
  const priority = document.getElementById("walkPriority").value;
  const type = document.getElementById("walkType").value;
  const notes = document.getElementById("walkNotes").value.trim();
  const duplicate = s.appointments.find(a=>a.phone===phone && a.date===today() && !["Completed","Cancelled","Rejected"].includes(a.status));
  if(duplicate){ toast("Duplicate prevented: this walk-in already has an active token today."); return; }
  const doctor = doctorById(doctorId, s);
  const token = nextToken(s, priority);
  const id = "a-" + Date.now();
  const rec = {id,patient,phone,email:"",doctorId,doctor:doctor.name,department,date:today(),time:"Walk-In",priority,type,token,status:"Waiting",source:"Walk-In",notes,createdAt:Date.now(),updatedAt:Date.now()};
  s.appointments.push(rec); s.queue.push(queueFromAppointment(rec)); saveState(s);
  closeModal("walkinModal");
  document.getElementById("walkName").value = "";
  document.getElementById("walkPhone").value = "";
  document.getElementById("walkNotes").value = "";
  toast(`Walk-in added. Token ${token}.`);
  openView("queue");
}
function closeModal(id){ document.getElementById(id).classList.remove("open"); }

function renderRecordsView(){
  const s = state();
  document.getElementById("view").innerHTML = header("Medical Records","Prescriptions, consultation notes, and clinical history.", currentRole==="doctor" ? `<button class="btn btn-primary" onclick="openPrescriptionForCurrent()">+ Add Prescription</button>` : "") + recordsTable(s.medicalRecords);
}
function recordsTable(records){
  return `<div class="table-wrap"><table><thead><tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Type</th><th>Summary</th></tr></thead><tbody>` + (records.length ? records.map(r=>`<tr><td>${escapeHtml(r.patient)}</td><td>${r.doctor}</td><td>${r.date}</td><td>${r.type}</td><td>${escapeHtml(r.summary)}</td></tr>`).join("") : `<tr><td colspan="5">No records found.</td></tr>`) + `</tbody></table></div>`;
}
function renderNotificationsView(){
  document.getElementById("view").innerHTML = header("Notifications","Queue updates, appointment reminders, and hospital messages.", `<button class="btn btn-soft" onclick="markNotificationsRead()">Mark Read</button>`) + `<div class="card">${notificationList(currentRole,20)}</div>`;
}
function markNotificationsRead(){
  const s = state();
  s.notifications.forEach(n=>{ if(n.role===currentRole || n.role==="all") n.read = true; });
  saveState(s); openView("notifications");
}
function renderProfileView(){
  document.getElementById("view").innerHTML = header("Profile","Patient identity and account preferences.") + `
    <div class="grid grid-2">
      <div class="card patient-card"><div class="avatar">DP</div><div><h3 style="margin:0">Demo Patient</h3><p style="margin:4px 0;color:var(--muted)">patient@medique.in | Hyderabad</p></div></div>
      <div class="card"><h3 style="margin-top:0">Privacy</h3><p style="color:var(--muted)">This local demo stores data in your browser only. A production deployment would use authenticated APIs, database encryption, audit logs, and role-based access controls.</p></div>
    </div>`;
}
function renderPatientsView(){
  const s = state();
  document.getElementById("view").innerHTML = header("Patients","Patient directory generated from appointments and queue records.", `<button class="btn btn-soft" onclick="exportRecords()">Export CSV</button>`) + `
    <div class="toolbar"><input id="patientSearch" placeholder="Search patients" oninput="renderPatientDirectory()"></div><div id="patientDirectory"></div>`;
  renderPatientDirectory();
}
function renderPatientDirectory(){
  const s = state();
  const q = (document.getElementById("patientSearch")?.value || "").toLowerCase();
  const map = new Map();
  s.appointments.forEach(a=>{ if(!map.has(a.phone)) map.set(a.phone,{name:a.patient,phone:a.phone,last:a.date,count:0,priority:a.priority}); map.get(a.phone).count++; });
  const rows = Array.from(map.values()).filter(p=>!q || (p.name+" "+p.phone).toLowerCase().includes(q));
  document.getElementById("patientDirectory").innerHTML = `<div class="grid grid-3">` + rows.map(p=>`<div class="card patient-card"><div class="avatar">${patientInitials(p.name)}</div><div><b>${escapeHtml(p.name)}</b><br><small style="color:var(--muted)">${p.phone} | ${p.count} visits | Last ${p.last}</small></div></div>`).join("") + `</div>`;
}
function renderPrescriptionsView(){
  document.getElementById("view").innerHTML = header("Prescriptions","Create notes for the current or completed token.", `<button class="btn btn-primary" onclick="openPrescriptionForCurrent()">+ Add Prescription</button>`) + recordsTable(state().medicalRecords);
}
function openPrescriptionForCurrent(){
  const q = servingQueue(state());
  openPrescription(q?.token || "", q?.doctor || "Dr. Priya Sharma");
}
function openPrescription(token, doctor){
  document.getElementById("rxToken").value = token;
  document.getElementById("rxDoctor").value = doctor;
  document.getElementById("rxNotes").value = "";
  document.getElementById("prescriptionModal").classList.add("open");
}
function savePrescription(){
  const s = state();
  const token = document.getElementById("rxToken").value.trim();
  const doctor = document.getElementById("rxDoctor").value.trim();
  const notes = document.getElementById("rxNotes").value.trim();
  const app = s.appointments.find(a=>a.token===token);
  s.medicalRecords.unshift({id:"mr-"+Date.now(),patient:app?.patient || "Patient",doctor,date:today(),type:"Prescription",summary:notes});
  closeModal("prescriptionModal");
  saveState(s);
  toast("Prescription saved to medical records.");
  openView(currentView);
}
function renderScheduleView(){
  const s = state();
  document.getElementById("view").innerHTML = header("Schedule","Doctor availability and daily clinical sessions.") + `
    <div class="grid grid-3">${s.doctors.map(d=>`<div class="card"><h3 style="margin:0">${d.name}</h3><p style="color:var(--muted)">${d.dept} | ${d.exp}+ years</p><span class="badge ${d.available?"green":"amber"}">${d.available?"Available":"Unavailable"}</span><div style="height:12px"></div><button class="btn btn-soft btn-small" onclick="toggleDoctor('${d.id}')">Toggle Availability</button></div>`).join("")}</div>`;
}
function renderAnalyticsView(){
  document.getElementById("view").innerHTML = header("Analytics","Queue throughput and consultation performance.") + `<div class="grid grid-2"><div class="card">${sectionTitle("Hourly Consultations")}<div class="bar-chart">${barChart()}</div></div><div class="card">${sectionTitle("Priority Mix")}<div class="bar-chart">${priorityBars()}</div></div></div>`;
}

function renderDoctorsView(){
  const s = state();
  document.getElementById("view").innerHTML = header("Doctor Management","Manage hospital doctors, fees, departments, and availability.") + `
    <div class="grid grid-3">${s.doctors.map(d=>`<div class="card"><div class="patient-card"><div class="avatar">${patientInitials(d.name.replace("Dr.",""))}</div><div><b>${d.name}</b><br><small style="color:var(--muted)">${d.dept} | ${d.qualification}</small></div></div><p style="color:var(--muted)">Experience: ${d.exp}+ years<br>Languages: ${d.languages}<br>Fee: Rs. ${d.fee} | Rating ${d.rating}</p><span class="badge ${d.available?"green":"amber"}">${d.available?"Available":"Unavailable"}</span><div style="height:12px"></div><button class="btn btn-soft btn-small" onclick="toggleDoctor('${d.id}')">Toggle Availability</button></div>`).join("")}</div>`;
}
function toggleDoctor(id){
  const s = state();
  const d = s.doctors.find(x=>x.id===id);
  if(d) d.available = !d.available;
  saveState(s);
  toast(`${d.name} is now ${d.available ? "available" : "unavailable"}.`);
  openView(currentView);
}
function renderReportsView(){
  const s = state();
  document.getElementById("view").innerHTML = header("Reports","Operational reporting and export tools.", `<button class="btn btn-soft" onclick="exportRecords()">Export Appointments CSV</button>`) + `
    <div class="grid grid-4">
      ${kpi("Appointments", s.appointments.length, "All demo records", "AP")}
      ${kpi("Completed", s.appointments.filter(a=>a.status==="Completed").length, "Consultations done", "OK")}
      ${kpi("Queue History", s.history.length, "Completed queue events", "Q")}
      ${kpi("Notifications", s.notifications.length, "Patient and staff messages", "NT")}
    </div>
    <div style="height:16px"></div>
    <div class="grid grid-2"><div class="card">${sectionTitle("Daily Queue Load")}<div class="bar-chart">${barChart()}</div></div><div class="card">${sectionTitle("Recent Activity")}${activityFeed(s)}</div></div>`;
}
function renderSettingsView(){
  document.getElementById("view").innerHTML = header("Settings","Hospital configuration, demo state, and deployment notes.") + `
    <div class="grid grid-2">
      <div class="card"><h3 style="margin-top:0">Hospital</h3><p style="color:var(--muted)">Medique Multi-Speciality Hospital, Hyderabad, Telangana. 350 beds, 120 doctors, 15 departments, 24/7 emergency care.</p><button class="btn btn-ghost" onclick="toggleTheme()">Toggle Theme</button></div>
      <div class="card"><h3 style="margin-top:0">Demo Data</h3><p style="color:var(--muted)">Reset browser storage to the seeded appointment and queue state.</p><button class="btn btn-danger" onclick="resetDemo()">Reset Demo Data</button></div>
      <div class="card"><h3 style="margin-top:0">Production Architecture</h3><p style="color:var(--muted)">Frontend views map to protected routes. LocalStorage in this demo represents PostgreSQL tables for users, doctors, appointments, queues, queue tokens, notifications, schedules, records, and admin controls.</p></div>
      <div class="card"><h3 style="margin-top:0">Security Notes</h3><p style="color:var(--muted)">A full deployment should use HTTPS, JWT sessions, role middleware, encrypted medical data, audit logs, rate limiting, and server-side validation.</p></div>
    </div>`;
}
function resetDemo(){
  localStorage.setItem(STORE, JSON.stringify(seedState()));
  toast("Demo data reset.");
  openView("dashboard");
}

function barChart(){
  const vals = [4,8,15,11,18,13,9,6];
  const labels = ["9","10","11","12","14","15","16","17"];
  const max = Math.max(...vals);
  return vals.map((v,i)=>`<div class="bar"><span style="height:${Math.round(v/max*132)}px"></span><b>${v}</b><small>${labels[i]}h</small></div>`).join("");
}
function priorityBars(){
  const s = state();
  const vals = ["Emergency","High","Normal"].map(p=>s.queue.filter(q=>q.priority===p && q.status==="Waiting").length);
  const labels = ["Emergency","High","Normal"];
  const max = Math.max(1,...vals);
  return vals.map((v,i)=>`<div class="bar"><span style="height:${Math.round(v/max*132)}px;background:${i===0?"var(--red)":i===1?"var(--amber)":"var(--green)"}"></span><b>${v}</b><small>${labels[i]}</small></div>`).join("");
}
function activityFeed(s){
  const items = [
    ...s.history.slice(0,3).map(h=>`${h.token} completed by ${h.doctor}`),
    ...waitingQueue(s).slice(0,3).map(q=>`${q.token} waiting for ${q.doctor}`),
    "System sync completed"
  ].slice(0,6);
  return items.map((text,i)=>`<div class="q-card"><div class="avatar">${i+1}</div><div><b>${escapeHtml(text)}</b><small>${i+1} min ago</small></div><span class="badge blue">Live</span></div>`).join("");
}
function exportRecords(){
  const s = state();
  const rows = [["Token","Patient","Phone","Doctor","Department","Date","Time","Priority","Status","Source"]];
  s.appointments.forEach(a=>rows.push([a.token,a.patient,a.phone,a.doctor,a.department,a.date,a.time,a.priority,a.status,a.source]));
  const csv = rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  a.download = "medique-appointments.csv";
  a.click();
  toast("CSV exported.");
}
function syncNow(){ openView(currentView); toast("Portal synced with latest browser data."); }
function toggleTheme(){
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  localStorage.setItem("medique.theme", next);
}
function toast(message){
  const el = document.getElementById("toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(el._timer);
  el._timer = setTimeout(()=>el.classList.remove("show"), 3200);
}
window.addEventListener("storage", e=>{ if(e.key===STORE && document.getElementById("app").style.display==="block") openView(currentView); });
if(channel) channel.onmessage = () => { if(document.getElementById("app").style.display==="block") openView(currentView); };
document.addEventListener("click", event=>{
  const wrap = document.getElementById("projectWrap");
  if(wrap && !wrap.contains(event.target)) closeProjectMenu();
});
document.addEventListener("keydown", event=>{ if(event.key==="Escape") closeProjectMenu(); });
document.addEventListener("DOMContentLoaded", ()=>{
  const savedTheme = localStorage.getItem("medique.theme");
  if(savedTheme) document.documentElement.dataset.theme = savedTheme;
  loadState();
  const role = location.hash.replace("#","");
  if(["patient","doctor","admin"].includes(role)){
    currentRole = role;
    document.querySelectorAll(".role-tab").forEach(btn=>{
      btn.classList.toggle("active", btn.textContent.toLowerCase()===role);
    });
    document.getElementById("loginEmail").value = `${role}@medique.in`;
  }
});

