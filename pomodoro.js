const timerText = document.getElementById("timerText");
const modeLabel = document.getElementById("modeLabel");
const cycleCountEl = document.getElementById("cycleCount");
const workBar = document.querySelector(".progress-bar");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const skipBtn = document.getElementById("skipBtn");
const rewindBtn = document.getElementById("rewindBtn");
const ffBtn = document.getElementById("ffBtn");
const restartBtn = document.getElementById("restartBtn");
const stopBtn = document.getElementById("stopBtn");

const statSessions = document.getElementById("statSessions");
const statMinutes = document.getElementById("statMinutes");
const statStreak = document.getElementById("statStreak");

const logList = document.getElementById("logList");
const yearEl = document.getElementById("year");


let workDuration = 25 * 60;
let breakDuration = 5 * 60; 
let timeLeft = workDuration;

let isWork = true;
let isRunning = false;
let cycle = 1;
let streak = 0;
let totalSessions = 0;
let totalMinutes = 0;
let timer;

const radius = 160;
const circumference = 2 * Math.PI * radius;
workBar.style.strokeDasharray = circumference;
workBar.style.strokeDashoffset = circumference;

function formatTime(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function updateUI() {
  timerText.textContent = formatTime(timeLeft);
  modeLabel.textContent = isWork ? "Work" : "Break";
  cycleCountEl.textContent = cycle;

  const duration = isWork ? workDuration : breakDuration;
  const progress = timeLeft / duration;
  workBar.style.strokeDashoffset = circumference * (1 - progress);

  // Stats
  statSessions.textContent = totalSessions;
  statMinutes.textContent = totalMinutes;
  statStreak.textContent = streak;
}

// ------------------ TIMER LOGIC ------------------
function startTimer() {
  if (isRunning) return;
  isRunning = true;

  timer = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      updateUI();
    } else {
      completeSession();
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timer);
  isRunning = false;
}

function resetTimer() {
  pauseTimer();
  isWork = true;
  timeLeft = workDuration;
  cycle = 1;
  updateUI();
}

function skipTimer() {
  completeSession();
}

function completeSession() {
  pauseTimer();

  if (isWork) {
    totalSessions++;
    totalMinutes += Math.round(workDuration / 60);
    streak++;
    addLog("✅ Work session completed");
    timeLeft = breakDuration;
    isWork = false;
  } else {
    addLog("☕ Break finished");
    cycle++;
    timeLeft = workDuration;
    isWork = true;
  }

  updateUI();
  startTimer(); // auto-continue
}

// ------------------ EXTRA CONTROLS ------------------
rewindBtn.addEventListener("click", () => {
  if (timeLeft > 60) timeLeft -= 60;
  updateUI();
});
ffBtn.addEventListener("click", () => {
  timeLeft += 300;
  updateUI();
});
restartBtn.addEventListener("click", () => {
  timeLeft = isWork ? workDuration : breakDuration;
  updateUI();
});
stopBtn.addEventListener("click", resetTimer);

// ------------------ LOGGING ------------------
function addLog(text) {
  const li = document.createElement("li");
  li.textContent = `${new Date().toLocaleTimeString()} - ${text}`;
  logList.appendChild(li);
}

// ------------------ EVENTS ------------------
startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);
skipBtn.addEventListener("click", skipTimer);

// ------------------ INIT ------------------
yearEl.textContent = new Date().getFullYear();
updateUI();
