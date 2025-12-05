var ENV = {
  fftSize: 2048,
  colorSpace: "display-p3",
  sampleRate: 44100,
  baseFrequency: 110,
  alphaExponent: 1 / 4,
  blurFactor: 1 / 2,
  dpr: window.devicePixelRatio,
  lineWidthStart: 2,
  lineWidthEnd: 0.33,
  lineColorStartLCH: [0.5, 0.3, 290],
  lineColorEndLCH: [0.8, 0.24, 220],
  syncPeriodPhase: true,
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
    ENV.sampleRate = buffer.sampleRate;
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
  constructor(
    canvases = $all("#canvases>canvas"),
    analyzer = new AnalyserNode()
  ) {
    this.resetCanvasElements();
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
    while ($("#canvases>canvas") != null) {
      $("#canvases").removeChild($("#canvases>canvas"));
    }
    for (let i = 0; i < numPeriods; i++) {
      let canvas = document.createElement("canvas");
      canvas.id = `${i}`;
      $("#canvases").appendChild(canvas);
    }
    this.canvases = $all("#canvases>canvas");
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

    for (let i = 1; i < ENV.fftSize + 1; i++) {
      const SAMPLES_PER_PERIOD = ENV.sampleRate / ENV.baseFrequency;
      let period = Math.floor(i / SAMPLES_PER_PERIOD);
      let ctx = this.contexts[period];
      ctx.strokeStyle = this.strokeColor(period, this.contexts.length);
      ctx.lineWidth = ENV.lineWidthStart;
      ctx.filter = `blur(${
        ENV.blurFactor * (this.canvases.length - 1 - period)
      }px)`;

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

  strokeColor(period = 0, periods = this.contexts.length) {
    const [ls, cs, hs] = ENV.lineColorStartLCH;
    const [le, ce, he] = ENV.lineColorEndLCH;
    const lStep = (le - ls) / periods;
    const cStep = (ce - cs) / periods;
    const hStep = (he - hs) / periods;
    const lightness = ls + period * lStep;
    const chroma = cs + period * cStep;
    const hue = hs + period * hStep;
    const alpha = ((period + 1) / periods) ** ENV.alphaExponent;
    return `oklch(${lightness} ${chroma} ${hue} / ${alpha})`;
  }

  lineWidth(period = 0, periods = this.contexts.length) {
    const widthStep = (ENV.lineWidthEnd - ENV.lineWidthStart) / periods;
    return ENV.lineWidthStart + period * widthStep;
  }
}

const manager = new AudioSourceManager();
const visualizer = new Visualizer($all("#canvases>canvas"), manager.analyzer);
var replVisualizer = undefined;

$("#test-canvas").style.top = "7.77%";

const base = $("input[name=base]");
base.value = ENV.baseFrequency;
const freq = $("input[name=freq]");
freq.value = ENV.baseFrequency; // reset to base frequency at start
freq.onchange = (e) => manager.setOSCfreq(freq.value);
let lastAnimationID = 0;
let isPlaying = false;

const drawFrames = (currentTime) => {
  if (manager.isPlaying) {
    visualizer.clear();
    visualizer.draw();
    lastAnimationID = requestAnimationFrame(drawFrames); // recurse
  }
  // analysers is a built-in object available through @strudel/core
  if (Object.keys(analysers).length > 0) {
    if (!replVisualizer) {
      analysers[1].fftSize = ENV.fftSize;
      replVisualizer = new Visualizer($all("#canvases>canvas"), analysers[1]);
    }
    replVisualizer.clear();
    replVisualizer.draw();
    lastAnimationID = requestAnimationFrame(drawFrames);
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
    drawFrames();
  } else if ($("#repl").editor.code !== "") {
    $("#repl").editor.evaluate();
    setTimeout(() => drawFrames(), 400); // wait to load analyzer
  } else {
    manager.playOSC();
    drawFrames();
  }
});

$("#stop").addEventListener("click", (e) => {
  $("#fileinput").value !== "" && manager.stopBuffer();
  $("#repl").value !== "" && $("#repl").editor.stop();
  manager.isPlaying && manager.stopOSC();

  cancelAnimationFrame(lastAnimationID);
});
