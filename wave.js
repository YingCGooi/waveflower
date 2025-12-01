var ENV = {
  fftSize: 2048,
  colorSpace: "display-p3",
  sampleRate: 44100,
  baseFrequency: 440,
  alphaExponent: 2,
  dpr: window.devicePixelRatio,
  lineWidth: 3,
  lineColorLCH: [0.77, 0.2, 220],
  syncPeriodPhase: true,
};

document.onload = (e) => {};

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
    this.bufferSource.stop(this.ctx.currentTime);
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
  setOSCtype(type = $("input[name=osc]:checked").value) {
    this.oscillator.type = type;
  }
  setOSCfreq(freq = ENV.baseFrequency) {
    this.oscillator.frequency.setValueAtTime(freq, this.ctx.currentTime);
  }
}

class Visualizer {
  constructor(canvases = $all("canvas"), analyzer = new AnalyserNode()) {
    if (canvases.length == 0) {
      this.resetCanvasElements();
    }
    const dim = Math.min(window.innerHeight, window.innerWidth);
    this.dim = dim;
    this.drawRadius = (this.dim * ENV.dpr) / 2;
    this.resize(this.dim);
    this.analyzer = analyzer;
    this.currentTimeDomain = this.getTimeDomainArray();
    this.lastDrawnValue = 0;
    this.lastDrawnRadian = 0;
    this.lastTimeDomainCache = { 0: 0 };
    this.lastTimeDomainRadians = new Float32Array(ENV.fftSize);
  }

  resetCanvasElements() {
    const numPeriods = Math.ceil(
      ENV.fftSize / (ENV.sampleRate / ENV.baseFrequency)
    );
    while ($("canvas") != null) {
      $("#canvases").removeChild($("canvas"));
    }
    for (let i = 0; i < numPeriods; i++) {
      let canvas = document.createElement("canvas");
      canvas.id = `${i}`;
      $("#canvases").appendChild(canvas);
    }
    this.canvases = $all("canvas");
    this.contexts = [];
    this.canvases.forEach((canvas) => {
      const ctx = canvas.getContext("2d", { colorSpace: ENV.colorSpace });
      this.contexts.push(ctx);
    });
    return this.canvases, this.contexts;
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

  getTimeDomainArray(shouldCache = true) {
    let data = new Float32Array(ENV.fftSize);
    this.analyzer.getFloatTimeDomainData(data);
    return data;
  }

  cacheTimeDomainValues(data = new Float32Array()) {
    this.lastTimeDomainCache = {}; // reset cache
    data.forEach((v, i) => {
      this.lastTimeDomainCache[v] = i;
    });
  }

  computePoints(
    data = new Float32Array(),
    i = 1,
    offsetRadian = 0,
    SAMPLES_PER_PERIOD = ENV.sampleRate / ENV.baseFrequency
  ) {
    const RADIANS_PER_SAMPLE = (2 * Math.PI) / SAMPLES_PER_PERIOD;
    let r0 = data[i - 1] * this.drawRadius;
    let r1 = data[i] * this.drawRadius;
    let th0 = ((i - 1) * RADIANS_PER_SAMPLE) % (2 * Math.PI);
    let th1 = (i * RADIANS_PER_SAMPLE) % (2 * Math.PI);

    th0 = r0 < 0 ? th0 + Math.PI : th0;
    th1 = r1 < 0 ? th1 + Math.PI : th1;
    return [
      [Math.abs(r0), Math.abs(r1)],
      [th0 + offsetRadian, th1 + offsetRadian],
      [r0 <= 0, r1 <= 0],
    ];
  }

  findLastOffsetIndex(value = 0) {
    const i = this.lastTimeDomainCache[value];
    if (i == undefined) {
      return 0;
    }
    return i;
  }

  findLastRadian(lastIndex = 1) {
    return this.lastTimeDomainRadians[lastIndex] % (2 * Math.PI);
  }

  draw() {
    const data = this.getTimeDomainArray();
    this.contexts.forEach((ctx) => ctx.beginPath());
    let currTimeDomainRadians = new Float32Array(ENV.fftSize);

    const lastOffsetIndex = this.findLastOffsetIndex(data[0]);
    const offsetRadian = this.findLastRadian(lastOffsetIndex);
    console.info({ lastOffsetIndex, offsetRadian });

    for (let i = 1; i < ENV.fftSize + 1; i++) {
      const SAMPLES_PER_PERIOD = ENV.sampleRate / ENV.baseFrequency;
      let period = Math.floor(i / SAMPLES_PER_PERIOD);
      let ctx = this.contexts[period];
      ctx.strokeStyle = this.strokeColor(
        ENV.lineColorLCH,
        period,
        this.contexts.length
      );
      ctx.lineWidth = ENV.lineWidth;

      let [[r0, r1], [th0, th1], [_, flipped]] = this.computePoints(
        data,
        i,
        offsetRadian
      );
      ctx.moveTo(r0 * Math.cos(th0), r0 * Math.sin(th0));
      ctx.lineTo(r1 * Math.cos(th1), r1 * Math.sin(th1));
      currTimeDomainRadians[i] = flipped ? th1 - Math.PI : th1;
    }
    this.lastTimeDomainRadians = currTimeDomainRadians;
    this.cacheTimeDomainValues(data);
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

  strokeColor([l, c, h], period = 1, periods = this.contexts.length) {
    return `oklch(${l} ${c} ${h}/ ${(period / periods) ** ENV.alphaExponent})`;
  }
}

const manager = new AudioSourceManager();
const visualizer = new Visualizer($all("canvas"), manager.analyzer);

const freq = $("input[name=freq]");
freq.onchange = (e) => manager.setOSCfreq(freq.value);
let lastAnimationID = 0;
let isPlaying = false;

const drawFrames = (currentTime) => {
  if (manager.isPlaying) {
    visualizer.clear();
    visualizer.draw(0);
    lastAnimationID = requestAnimationFrame(drawFrames); // recurse
  }
  return lastAnimationID;
};

$("#fileinput").onchange = (event) => {
  const r = new FileReader();
  r.readAsArrayBuffer(event.target.files[0]);
  r.onload = (e) => {
    manager.ctx.decodeAudioData(
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

$("#play").addEventListener("click", (e) => {
  manager.setOSCtype();
  manager.setOSCfreq(freq.value);
  if ($("#fileinput").value !== "") {
    manager.playBuffer();
  } else {
    manager.playOSC();
  }
  drawFrames(0);
});

$("#stop").addEventListener("click", (e) => {
  if ($("#fileinput").value !== "") {
    manager.stopBuffer();
  }
  manager.stopOSC();
  cancelAnimationFrame(lastAnimationID);
});
