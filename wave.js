var ENV = {
  fftSize: 2048,
  colorSpace: "display-p3",
  sampleRate: 88200,
  baseFrequency: 220,
  fadeExp: 2,
  dpr: window.devicePixelRatio,
  lineWidth: 2,
};

function $(selector = "") {
  return document.querySelector(selector);
}
function $all(selector = "") {
  return document.querySelectorAll(selector);
}

class AudioSourceManager {
  constructor(
    audioContext = new window.AudioContext({
      sampleRate: ENV.sampleRate,
    })
  ) {
    this.ctx = audioContext;
    this.analyzer = this.generateAnalyzer();
    this.oscillator = this.generateOSC();
    this.bufferSource = this.generateBufferSource();
    this.isPlaying = false;
  }

  generateAnalyzer() {
    const a = this.ctx.createAnalyser();
    a.fftSize = ENV.fftSize;
    a.connect(this.ctx.destination);
    return a;
  }
  generateOSC() {
    const osc = this.ctx.createOscillator();
    osc.connect(this.analyzer);
    return osc;
  }
  generateBufferSource() {
    const s = this.ctx.createBufferSource();
    s.connect(this.analyzer);
    return s;
  }
  updateBuffer(buffer = new AudioBuffer()) {
    this.bufferSource.buffer = buffer;
    this.bufferSource.connect(this.analyzer);
  }
  playBuffer() {
    this.bufferSource.start();
    this.isPlaying = true;
  }
  stopBuffer() {
    this.bufferSource.stop();
    this.bufferSource = this.generateBufferSource();
    this.isPlaying = false;
  }
  playOSC() {
    this.oscillator.start();
    this.isPlaying = true;
  }
  stopOSC() {
    this.oscillator.stop();
    this.oscillator = this.generateOSC();
    this.isPlaying = false;
  }
  setOSCtype(type = "") {
    this.oscillator.type = type;
  }
  setOSCfreq(freq = ENV.baseFrequency) {
    this.oscillator.frequency.setValueAtTime(freq, this.ctx.currentTime);
  }
}

class Visualizer {
  constructor(canvases = $all("canvas"), analyzer = new AnalyserNode()) {
    const dim = Math.min(window.innerHeight, window.innerWidth);
    var contexts = [];
    canvases.forEach((canvas) => {
      const ctx = canvas.getContext("2d", { colorSpace: ENV.colorSpace });
      contexts.push(ctx);
    });
    this.canvases = canvases;
    this.contexts = contexts;
    this.dim = dim;
    this.drawRadius = (this.dim * ENV.dpr) / 2;
    this.resize(this.dim);
    this.analyzer = analyzer;
  }

  scaleResolutionTo(dpr = 2, canvas, ctx) {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr; // set the "actual" size of the canvas
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr); // scale up to proper resolution
    canvas.style.width = `${rect.width}px`; // set the css size of the canvas
    canvas.style.height = `${rect.height}px`;
  }

  resetDrawOrigin(ctx) {
    ctx.resetTransform();
    ctx.translate(this.drawRadius, this.drawRadius); // set origin (x=0, y) to center of canvas
  }

  resize(dimension = window.innerHeight) {
    this.canvases.forEach((canvas, i) => {
      const ctx = this.contexts[i];
      canvas.width = dimension; // stretch the canvas to viewport
      canvas.height = dimension;
      this.scaleResolutionTo(ENV.dpr, canvas, ctx);
      this.resetDrawOrigin(ctx);
    });
    this.dim = dimension;
  }

  computePoints(data = new Float32Array(), i = 1, samplesPerPeriod = 0) {
    const RADIANS_PER_SAMPLE = (2 * Math.PI) / samplesPerPeriod;
    let r0 = data[i - 1] * this.drawRadius;
    let r1 = data[i] * this.drawRadius;
    let th0 = (i - 1) * RADIANS_PER_SAMPLE;
    let th1 = i * RADIANS_PER_SAMPLE;

    th0 = r0 > 0 ? th0 : th0 + Math.PI;
    th1 = r1 > 0 ? th1 : th1 + Math.PI;
    [r0, r1] = [Math.abs(r0), Math.abs(r1)];
    return [
      [r0, r1],
      [th0, th1],
    ];
  }

  draw(currentTime) {
    let data = new Float32Array(ENV.fftSize);
    this.analyzer.getFloatTimeDomainData(data);
    data = data.reverse(); // draw waveform from last to first point

    this.contexts.forEach((ctx) => ctx.beginPath());

    for (let i = 1; i < ENV.fftSize - 1; i++) {
      const SAMPLES_PER_PERIOD = ENV.sampleRate / ENV.baseFrequency;
      let [[r0, r1], [th0, th1]] = this.computePoints(
        data,
        i,
        SAMPLES_PER_PERIOD
      );
      let period = Math.floor(i / SAMPLES_PER_PERIOD);
      if (period >= this.canvases.length) {
        break;
      }
      let ctx = this.contexts[period];
      if (i % SAMPLES_PER_PERIOD < 1) {
        ctx.strokeStyle = this.strokeColor(1, 0, 0, period);
        ctx.lineWidth = ENV.lineWidth;
      }
      ctx.moveTo(r0 * Math.cos(th0), r0 * Math.sin(th0));
      ctx.lineTo(r1 * Math.cos(th1), r1 * Math.sin(th1));
    }
    this.contexts.forEach((ctx) => ctx.stroke() && ctx.closePath());
  }

  clear() {
    for (let i = 0; i < this.contexts.length; i++) {
      let ctx = this.contexts[i];
      ctx.clearRect(
        -this.drawRadius,
        -this.drawRadius,
        this.drawRadius * 2,
        this.drawRadius * 2
      );
    }
  }

  strokeColor(l, c, h, period = 0) {
    return `oklch(${l} ${c} ${h}/ ${Math.abs(
      0.01 * (period - 10) ** ENV.fadeExp
    )})`;
  }
}

const manager = new AudioSourceManager();
const visualizer = new Visualizer($all("canvas"), manager.analyzer);

$("#fileinput").onchange = (event) => {
  const r = new FileReader();
  r.readAsArrayBuffer(event.target.files[0]);
  r.onload = (e) => {
    ctx.decodeAudioData(
      e.target.result,
      (buffer) => manager.updateBuffer(buffer),
      (err) => console.error(err)
    );
  };
};

$all("input[name=osc]").forEach((radio) => {
  radio.onchange = (e) => {
    if (e.target.checked) {
      manager.setOSCtype(e.target.value);
    }
  };
});

const freq = $("input[name=freq]");
freq.onchange = (e) => manager.setOSCfreq(freq.value);
let lastAnimationID = 0;
let isPlaying = false;
let elapsedSeconds = 0;

const drawFrames = (currentTime) => {
  elapsedSeconds = currentTime;
  if (manager.isPlaying) {
    visualizer.clear();
    visualizer.draw(currentTime);
    lastAnimationID = requestAnimationFrame(drawFrames); // recurse
    console.info({ lastAnimationID, currentTime });
  }
  return lastAnimationID;
};

$("#play").addEventListener("click", (e) => {
  manager.setOSCfreq(freq.value);
  manager.playOSC();
  drawFrames(0);
});

$("#stop").addEventListener("click", (e) => {
  manager.stopOSC();
  cancelAnimationFrame(lastAnimationID);
});
