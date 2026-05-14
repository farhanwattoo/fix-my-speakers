const startBtn = document.getElementById("speakerStart");
const stopBtn = document.getElementById("speakerStop");
const durationInput = document.getElementById("speakerDuration");
const statusEl = document.getElementById("speakerStatus");
const cyclesEl = document.getElementById("speakerCycles");
const freqEl = document.getElementById("speakerFreq");
const timerEl = document.getElementById("speakerTimer");

let audioContext;
let oscillator;
let gainNode;
let cycleTimer;
let uiTimer;
let secondsLeft = 0;
let cycles = 0;

function formatTime(totalSeconds) {
  const mins = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const secs = String(totalSeconds % 60).padStart(2, "0");
  return `${mins}:${secs}`;
}

function stopSpeaker() {
  clearInterval(cycleTimer);
  clearInterval(uiTimer);
  if (gainNode && audioContext) {
    gainNode.gain.cancelScheduledValues(audioContext.currentTime);
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  }
  if (oscillator) {
    oscillator.stop();
    oscillator.disconnect();
    oscillator = null;
  }
  if (gainNode) {
    gainNode.disconnect();
    gainNode = null;
  }
  if (audioContext && audioContext.state !== "closed") {
    audioContext.close().catch(() => {});
    audioContext = null;
  }
  statusEl.textContent = "Stopped";
  freqEl.textContent = "0 Hz";
  timerEl.textContent = "00:00";
}

async function startSpeaker() {
  stopSpeaker();
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  await audioContext.resume();
  oscillator = audioContext.createOscillator();
  gainNode = audioContext.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = 165;
  gainNode.gain.value = 0;
  oscillator.connect(gainNode).connect(audioContext.destination);
  oscillator.start();

  secondsLeft = Number(durationInput.value);
  statusEl.textContent = "Running";
  timerEl.textContent = formatTime(secondsLeft);

  cycleTimer = setInterval(() => {
    const now = audioContext.currentTime;
    const nextFreq = 160 + Math.random() * 80;
    oscillator.frequency.cancelScheduledValues(now);
    oscillator.frequency.setTargetAtTime(nextFreq, now, 0.04);
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.linearRampToValueAtTime(0.22, now + 0.03);
    gainNode.gain.linearRampToValueAtTime(0.02, now + 0.22);
    cycles += 1;
    cyclesEl.textContent = String(cycles);
    freqEl.textContent = `${Math.round(nextFreq)} Hz`;
  }, 320);

  uiTimer = setInterval(() => {
    secondsLeft -= 1;
    timerEl.textContent = formatTime(Math.max(secondsLeft, 0));
    if (secondsLeft <= 0) {
      stopSpeaker();
    }
  }, 1000);
}

startBtn.addEventListener("click", startSpeaker);
stopBtn.addEventListener("click", stopSpeaker);
