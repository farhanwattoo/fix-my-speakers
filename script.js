const startBtn = document.getElementById("speakerStart");
const stopBtn = document.getElementById("speakerStop");
const durationInput = document.getElementById("speakerDuration");
const statusEl = document.getElementById("speakerStatus");
const cyclesEl = document.getElementById("speakerCycles");
const freqEl = document.getElementById("speakerFreq");
const timerEl = document.getElementById("speakerTimer");
const errorEl = document.getElementById("speakerError");
let audioContext, oscillator, gainNode, cycleTimer, uiTimer;
let secondsLeft = 0;
let cycles = 0;
function setText(el, value) { if (el) el.textContent = value; }
function formatTime(totalSeconds) {
  const safeSeconds = Math.max(0, Number.isFinite(totalSeconds) ? totalSeconds : 0);
  const mins = String(Math.floor(safeSeconds / 60)).padStart(2, "0");
  const secs = String(safeSeconds % 60).padStart(2, "0");
  return `${mins}:${secs}`;
}
function stopSpeaker() {
  clearInterval(cycleTimer); clearInterval(uiTimer);
  try {
    if (gainNode && audioContext) {
      gainNode.gain.cancelScheduledValues(audioContext.currentTime);
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    }
    if (oscillator) { oscillator.stop(); oscillator.disconnect(); }
    if (gainNode) gainNode.disconnect();
    if (audioContext && audioContext.state !== "closed") audioContext.close().catch(() => {});
  } catch (error) { /* Safe cleanup fallback for browsers that already stopped audio. */ }
  oscillator = null; gainNode = null; audioContext = null;
  setText(statusEl, "Stopped"); setText(freqEl, "0 Hz"); setText(timerEl, "00:00");
}
async function startSpeaker() {
  if (!startBtn || !stopBtn || !durationInput) return;
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) { setText(errorEl, "Your browser does not support Web Audio. Try a modern mobile or desktop browser."); return; }
  stopSpeaker(); cycles = 0; setText(cyclesEl, "0");
  const selectedDuration = Math.max(5, Math.min(60, Number(durationInput.value) || 25));
  try {
    audioContext = new AudioCtor(); await audioContext.resume();
    oscillator = audioContext.createOscillator(); gainNode = audioContext.createGain();
    oscillator.type = "sine"; oscillator.frequency.value = 165; gainNode.gain.value = 0;
    oscillator.connect(gainNode).connect(audioContext.destination); oscillator.start();
    secondsLeft = selectedDuration; setText(statusEl, "Running"); setText(timerEl, formatTime(secondsLeft));
    cycleTimer = setInterval(() => {
      if (!audioContext || !oscillator || !gainNode) return;
      const now = audioContext.currentTime;
      const nextFreq = 160 + Math.random() * 80;
      oscillator.frequency.cancelScheduledValues(now);
      oscillator.frequency.setTargetAtTime(nextFreq, now, 0.04);
      gainNode.gain.cancelScheduledValues(now);
      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.linearRampToValueAtTime(0.22, now + 0.03);
      gainNode.gain.linearRampToValueAtTime(0.02, now + 0.22);
      cycles += 1; setText(cyclesEl, String(cycles)); setText(freqEl, `${Math.round(nextFreq)} Hz`);
    }, 320);
    uiTimer = setInterval(() => { secondsLeft -= 1; setText(timerEl, formatTime(secondsLeft)); if (secondsLeft <= 0) stopSpeaker(); }, 1000);
  } catch (error) {
    stopSpeaker(); setText(statusEl, "Blocked"); setText(errorEl, "Audio could not start. Tap the start button again, check volume, and make sure browser audio is allowed.");
  }
}
if (startBtn) startBtn.addEventListener("click", startSpeaker);
if (stopBtn) stopBtn.addEventListener("click", stopSpeaker);
