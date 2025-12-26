var ENV = {
  fftSize: 2048,
  colorSpace: "display-p3",
  sampleRate: 44100,
  baseFrequency: 155.56,
  alphaExponent: 0,
  blurFactor: 0.5,
  dpr: window.devicePixelRatio,
  lineWidthStart: 3.3, // start = tail of spiral
  lineWidthEnd: 1, // end = head of spiral
  lineColorStart: "oklch(0.5 0.3 290)",
  lineColorEnd: "oklch(0.8 0.24 220)",
  interpolationSpace: "oklch",
  syncPeriodPhase: true,
  smoothingTimeConstant: 1,
  analyzerWaitDelayMs: 400,
};

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
    this.repl = null;
    this.isREPLplaying = false;
    this.isOSCplaying = false;
    this.isFileplaying = false;
  }
  setREPL(repl = $("#repl").editor) {
    this.repl = repl;
  }
  replHasCode() {
    if (!this.repl) {
      return false;
    }
    return this.repl.code.trim() !== "";
  }
  playREPL(forceScopeFn = () => {}) {
    forceScopeFn(this.repl);
    this.repl.evaluate();
    this.isREPLplaying = true;
  }
  stopREPL() {
    this.repl.stop();
    this.isREPLplaying = false;
  }
  getAnalyzer() {
    return this.analyzer;
  }
  generateAnalyzer() {
    const a = this.ctx.createAnalyser();
    a.fftSize = ENV.fftSize;
    a.smoothingTimeConstant = ENV.smoothingTimeConstant;
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
    if (this.isFileplaying) {
      infoLog("file buffer already playing");
      return;
    }
    this.bufferSource.start();
    this.isFileplaying = true;
  }
  stopBuffer() {
    this.bufferSource.stop(this.ctx.currentTime);
    this.bufferSource = this.generateBufferSource();
    this.isFileplaying = false;
  }
  playOSC() {
    if (this.isOSCplaying) {
      infoLog("osc already playing");
      return;
    }
    this.oscillator.start();
    this.isOSCplaying = true;
  }
  stopOSC() {
    this.oscillator.stop();
    this.oscillator = this.generateOSC();
    this.isOSCplaying = false;
  }
  setOSCtype(type = $("input[name=osc]:checked").value) {
    this.oscillator.type = type;
  }
  setOSCfreq(freq = ENV.baseFrequency) {
    this.oscillator.frequency.setValueAtTime(freq, this.ctx.currentTime);
  }
}

class Visualizer {
  constructor(canvasClass = "", analyzer = new AnalyserNode()) {
    this.sectionID = "#canvases";
    this.canvasClass = canvasClass;
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
    this.colorSteps = [ENV.lineColorStart, ENV.lineColorEnd];
    this.calculateColorSteps(
      new Color(ENV.lineColorStart),
      new Color(ENV.lineColorEnd)
    );
  }

  resetCanvasElements() {
    const numPeriods = Math.ceil(
      ENV.fftSize / (ENV.sampleRate / ENV.baseFrequency)
    );
    const canvasSelector = this.sectionID + ">." + this.canvasClass;
    while ($(canvasSelector) != null) {
      $(this.sectionID).removeChild($(canvasSelector));
    }
    for (let i = 0; i < numPeriods; i++) {
      let canvas = document.createElement("canvas");
      canvas.id = this.canvasClass + "_" + i;
      canvas.classList.add(this.canvasClass);
      $(this.sectionID).appendChild(canvas);
    }
    this.canvases = $all(canvasSelector);
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

  resize(dimension = Math.min(window.innerHeight, window.innerWidth)) {
    this.canvases.forEach((canvas, i) => {
      const ctx = this.contexts[i];
      canvas.width = dimension; // stretch the canvas to viewport
      canvas.height = dimension;
      this.dim = dimension;
      this.drawRadius = (dimension * ENV.dpr) / 2;
      this.scaleResolutionTo(ENV.dpr, canvas, ctx);
      this.resetDrawOrigin(ctx);
    });
    this.dim = dimension;
  }

  getTimeDomainArray() {
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
      ctx.strokeStyle = this.strokeColorJS(period, this.contexts.length);
      ctx.lineWidth = this.lineWidth(period, this.contexts.length);
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

  calculateColorSteps(start = new Color(), end = new Color(), minSteps = 16) {
    const s = start.steps(end, {
      space: ENV.interpolationSpace,
      outputSpace: ENV.interpolationSpace,
      maxDeltaE: 120,
      steps: minSteps, // min number of steps
    });
    this.colorSteps = s.map((c) => c.toString());
    return this.colorSteps;
  }

  strokeColorJS(period = 0, periods = this.contexts.length) {
    const pos = (period / periods) * this.colorSteps.length;
    const i = Math.floor(pos);
    return this.colorSteps[i];
  }

  lineWidth(period = 0, periods = this.contexts.length) {
    const widthStep = (ENV.lineWidthEnd - ENV.lineWidthStart) / periods;
    return ENV.lineWidthStart + period * widthStep;
  }
}
