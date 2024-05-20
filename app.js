const RECORD_BTN = document.getElementById("recordBtn"); // HTMLButtonElement
const SOUND_BAR = document.getElementById("soundBar"); // HTMLDivElement

const MIC_ICON = '<i class="fa-solid fa-microphone"></i>';
const STOP_ICON = '<i class="fa-solid fa-stop"></i>';

let context = new AudioContext();
let stream = null // MediaStream
let isRecording = false; // boolean
let animationId = null // number | null

function toggleRecording() {
  isRecording = !isRecording
  if (context.state !== 'running') startContext()
  isRecording ? startRecording() : stopRecording()
}

async function startRecording() {
  const newStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
  })
  stream = newStream

  const source = context.createMediaStreamSource(newStream)
  const analyzer = context.createAnalyser()
  source.connect(analyzer)
  RECORD_BTN.innerHTML = STOP_ICON

  animationId = updateVisual(analyzer)
}

function updateVisual(analyzer) {
  const fbcArray = new Uint8Array(analyzer.frequencyBinCount)
  analyzer.getByteFrequencyData(fbcArray)
  const level = fbcArray.reduce((accum, val) => accum + val, 0) / fbcArray.length

  if (SOUND_BAR.classList.contains('circle')) {
    SOUND_BAR.style.transform = `translate(-50%, -50%) scale(${level})`
  } else {
    SOUND_BAR.style.width = `${level}%`
  }
  
  animationId = requestAnimationFrame(() => updateVisual(analyzer))
}

function stopRecording() {
  stream.getTracks().forEach(s => s.stop())
  stream = null
  cancelAnimationFrame(animationId)
  animationId = null
    if (SOUND_BAR.classList.contains('circle')) {
    SOUND_BAR.style.transform = 'translate(-50%, -50%) scale(0)'
  } else {
    SOUND_BAR.style.width = 0
  }
  RECORD_BTN.innerHTML = MIC_ICON
}

async function startContext() {
  await context.resume()
}

(function init() {
  RECORD_BTN.addEventListener("click", toggleRecording);
})()
