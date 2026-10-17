
const timer = document.getElementById("timer");
const statusText = document.getElementById("status");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const fullscreenIcon = document.getElementById("fullscreenIcon");

let elapsed = Number(localStorage.getItem("neonElapsed")) || 0;
let running = localStorage.getItem("neonRunning") === "true";
let startedAt = running
  ? Number(localStorage.getItem("neonStartedAt")) || Date.now()
  : 0;

function getElapsed() {
  return elapsed + (running ? Date.now() - startedAt : 0);
}

function formatTime(ms) {
  const centiseconds = Math.floor(ms / 10);
  const minutes = Math.floor(centiseconds / 6000);
  const seconds = Math.floor(centiseconds / 100) % 60;
  const cs = centiseconds % 100;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
}

function saveState() {
  localStorage.setItem("neonElapsed", elapsed);
  localStorage.setItem("neonRunning", running);
  localStorage.setItem("neonStartedAt", startedAt);
}

function update() {
  timer.textContent = formatTime(getElapsed());
  saveState();
}

function setStatus(text, color) {
  statusText.textContent = text;
  statusText.style.color = color;
}

function startTimer() {
  if (running) return;

  startedAt = Date.now();
  running = true;
  setStatus("ÇALIŞIYOR", "#00f5ff");

  saveState();
  update();
}

function pauseTimer() {
  if (!running) return;

  elapsed = getElapsed();
  running = false;
  startedAt = 0;

  setStatus("DURAKLATILDI", "#ae8bff");
  saveState();
  update();
}

function resetTimer() {
  running = false;
  elapsed = 0;
  startedAt = 0;

  setStatus("SIFIRLANDI", "#9caec9");
  saveState();
  update();
}

/* Tam ekran kontrolü */
function isFullscreen() {
  return Boolean(
    document.fullscreenElement ||
    document.webkitFullscreenElement
  );
}

async function toggleFullscreen() {
  try {
    if (isFullscreen()) {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
      return;
    }

    const target = document.documentElement;

    if (target.requestFullscreen) {
      await target.requestFullscreen();
    } else if (target.webkitRequestFullscreen) {
      target.webkitRequestFullscreen();
    } else {
      setStatus("TAM EKRAN DESTEKLENMİYOR", "#ffad66");
    }
  } catch (error) {
    console.warn("Tam ekran açılamadı:", error);
    setStatus("TAM EKRAN AÇILAMADI", "#ffad66");
  }
}

function updateFullscreenButton() {
  const active = isFullscreen();

  fullscreenBtn.setAttribute(
    "aria-label",
    active ? "Tam ekrandan çık" : "Tam ekrana geç"
  );

  fullscreenBtn.title = active ? "Tam ekrandan çık" : "Tam ekran";

  if (active) {
    // Köşeler dışarı açılan simge: tam ekrandan çık
    fullscreenIcon.innerHTML = `
      <path d="M8 3v5H3"/>
      <path d="M16 3v5h5"/>
      <path d="M3 16h5v5"/>
      <path d="M21 16h-5v5"/>
    `;
  } else {
    // Köşeler dışarı bakan simge: tam ekrana geç
    fullscreenIcon.innerHTML = `
      <path d="M8 3H5a2 2 0 0 0-2 2v3"/>
      <path d="M16 3h3a2 2 0 0 1 2 2v3"/>
      <path d="M21 16v3a2 2 0 0 1-2 2h-3"/>
      <path d="M3 16v3a2 2 0 0 0 2 2h3"/>
    `;
  }
}

document.addEventListener("fullscreenchange", updateFullscreenButton);
document.addEventListener("webkitfullscreenchange", updateFullscreenButton);

document.addEventListener("keydown", (event) => {
  // Boşluk tuşuyla sayfayı kaydırma
  if (event.code === "Space" && event.target.tagName !== "BUTTON") {
    event.preventDefault();
    running ? pauseTimer() : startTimer();
  }

  if (
    event.key.toLowerCase() === "r" &&
    event.target.tagName !== "INPUT" &&
    event.target.tagName !== "TEXTAREA"
  ) {
    resetTimer();
  }
});

setInterval(update, 30);
update();
updateFullscreenButton();

if (running) {
  setStatus("ÇALIŞIYOR", "#00f5ff");
}
