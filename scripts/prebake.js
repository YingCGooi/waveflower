// CSS overrides
// use custom icon
document.head.querySelectorAll('[rel=icon]').forEach(n => {
  n.type = 'image/png'
  n.href = 'https://waveflower.org/assets/r=sin2t.png'
})
// use custom title
setTimeout(() => {
  const title = document.head.querySelector('title')
  if (title.innerText.startsWith('Strudel')) {
    title.innerText = 'Strudel - Waveflower Prebaked REPL'
  }
}, 100)

window.removePrebakeCSS = function () {
  document.querySelectorAll('style').forEach(n => { 
     let parts = n.innerText.split('#pre')
     n.innerText = parts[0]
 })
}

/**
 * @name wetEditor
 * @synonyms useWet
 * @alias useWet
 * @param {Number} saturation amount (default 3)
 * @param {Number} hue shift (default -15)
 * @example useWet(3, -15)
 */
window.wetEditor = function (amount = 3, hueShift = -15) {
  document.querySelectorAll('style').forEach(n => {
    window.removePrebakeCSS();
    n.append('#pre,[type=range]{width:400px !important;accent-color:oklch(.7 .24 240);}')
    n.append('#pre,:root { --background: #001 !important} ')
    n.append('#pre,canvas {filter:saturate(' + amount + ')}')
    n.append('#pre,#code .cm-line>*{background: #0000;}')
    n.append('#pre,.cm-line{filter:hue-rotate(' + hueShift + 'deg) saturate(' + amount + ')}')
  })
}
window.useWet = (a, h) => window.wetEditor(a, h)

// CSS helper function
function lineargradient(stops = [], steps, freq, next, alpha, hue, hueStep, w, wmul = 0.1, mode = 'to bottom') {
  const freqStops = {
    [16000]: 4.4,
    [8000]: 12.3,
    [4000]: 20.6, // 5 *32 2^5
    [2000]: 28.9, // 4 *16 2^4
    [1000]: 37.2, // 3 *8 2^3 => 3 * -8.29
    [500]: 45.4,  // 2 *4 2^2 => 2 * -8.29
    [250]: 53.7,  // 1 *2 2^1 => -8.29
    [125]: 62,    // use as base
    [62.5]: 70.3,
  };
  // only construct a stops array if not provided
  if (stops.length === 0) {
    for (let i = 0; i < steps; i++) {
      let width = next < 1 ? w + wmul * i : w * steps - wmul * i;
      stops.push([freq, 'oklch(.7 .2 ' + hue + '/' + alpha + ')', width]);
      hue += hueStep;
      freq *= next;
    }
  }
  stops = stops.sort(([fa], [fb]) => fb - fa); // ensure stops are sorted in descending order
  return (
    'linear-gradient(' +
    mode +
    ',' +
    stops
      .map(([freq, color, w]) => {
        if (!w) {
          w = 1 / 2;
        }
        let stop = freqStops[freq] || 70.3 - 8.29 * Math.log2(freq / 62.5);
        return [
          '#0000 ' + Number(stop - w).toFixed(2) + '%',
          color + ' ' + stop + '%',
          '#0000 ' + Number(stop + w).toFixed(2) + '%',
        ].join(',');
      })
      .join(',') +
    ')'
  );
}

/**
* @name useSpectrum(<Object>config|<Array>stops)
*
* @param {Object} config contains these options:
* @param {Int} lines: generate up to number of lines
* @param {Int} base: line draws first at this frequency
* @param {Number} next: subsequent frequency will multiply by this multiplier
* @param {Number} alpha: transparency of lines
* @param {Int} hue: starting hue ranges between 0-360
* @param {Int} hueStep: hue spacing between each subsequent hue, lower numbers mean colors will be closer
* @param {Number} thickness: line thickness (in px)
* @param {Number} mul: subsequent line thickness multiplier, positive => subsequently thicker lines
* -- OR --
* @param {Array} stops, an array of stops with this following format:
* @param {Array} stop: [frequency <Int>, CSScolor <string>, thickness <Number (optional)>]
* @example
* useSpectrum({lines:3, base:1000, next:1/2, hue:40, hueStep:40, alpha:.7});
* // OR
* useSpectrum([
*   [1000,'oklch(.7 .2 40/.7)',1],
*   [500, 'oklch(.7 .2 80/.7)',1],
*   [250, 'oklch(.7 .2 120/.7)',1],
* ]);
*
* $:freq("<125 250 500 1000 2000 4000>*4").s("sine")
*   .color("<blue cyan green yellow orange red>*4")
*   .gain("<6 5 4 3 2 1>*4".div(4))._spectrum({width:800})
*/
window.useSpectrum = function (opts) {
  let stops = [];
  const { lines = 7, base = 8000, next = 1 / 2, alpha = 1, hue = 40, hueStep = 40, thickness = 0.1, mul = 0.2 } = opts;
  if (Array.isArray(opts)) {
    stops = opts;
  }
  document
    .querySelectorAll('style')
    .forEach((n) =>
      window.removePrebakeCSS();
      n.append(
        '#pre, .cm-widget-container>canvas{' +
        'position:relative;' +
        'transform: scaleY(175%) translateY(7%);' +
        'z-index:-1;' +
        'filter:saturate(1.5);' +
        'background:' +
        lineargradient(stops, lines, base, next, alpha, hue, hueStep, thickness, mul) +
        '}',
      ),
    );
};


// global functions
window.blockArrange = function (patArr = [
  [note("A"), "<F F>"], [note("C"), "<0 F>"]
], modifiers = []) {
  return stack(
    patArr.map(([pat, maskPat]) => {
      return maskPat.withValue(v => {
        const value = v.toString()
        if (value == 0) { return }
        modifiers.forEach(([modifier, callback]) => {
          if (value == modifier) { pat = callback(pat) }
        })
        return pat
      }).innerJoin()
    }).flat()
  )
}

// function definitions and new registrations
function supersynth(pat, sound = 'sawtooth',
  { d = .1, v = 4, r = 3 / 4, w = 0.2, n = 4, a = .01, g = 3 / 4, l = 7, t = 0, os = [], gs = [], ts = [] } = {},
) {
  let lrpan = [Math.max(0.5 - w, 0), Math.min(0.5 + w, 1)]
  const voices = []
  if (os.length > 0) { n = os.length - 1 } // override n if os is not empty
  let sign = +1
  for (let i = 0; i <= n; i++) {
    let panning = lrpan[i % 2]
    let layer = pat.add(ts[i] || 0).s(os[i] || sound).FX(gain(gs[i] || g)) // construct base layer
    if (i > 0) { layer = layer.pan(panning) } // subsequent layers
    if (t > 0) { layer = layer.late(t * i) } // add optional time offset
    if (v > 0) { layer = layer.vib(v * r ** i).vmod(sign * d * r ** i) } // vibs, alt between inc/dec detune
    voices.push(layer)
    sign = -sign
  }
  return stack(...voices)
    .attack(a).lpf(2 ** (l + 5)).postgain(1 / ((n + 1) ** 0.2))
}
// register as a method
register('supersynth', (param, x) => {
  const aliases = {
    depth: 'd', detune: 'd', vib: 'v', vibrato: 'v', ratio: 'r',
    detuner: 'r', stereo: 'w', width: 'w', voices: 'n',
    att: 'a', attack: 'a', gain: 'g', lp: 'l', lowpass: 'l', late: 't', off: 't', shift: 't',
    oscs: 'os', osc: 'os', gains: 'gs', oscgains: 'gs', transposes: 'ts', noteadd: 'ts',
  }
  Object.keys(aliases).forEach(a => {
    if (param[a] !== undefined) {
      param[aliases[a]] = param[a]
    }
  })
  if (typeof param == 'string') {
    return supersynth(x, param)
  }
  if (Array.isArray(param)) {
    return supersynth(x, param[0], { osc: param })
  }
  if (typeof param == 'object') {
    return supersynth(x, (param.s || 'sawtooth'), param)
  }
  return supersynth(x)
})

// glossingg's prebakes
let glide = register(
  'glide',
  (time, pat) => {
    let curr = [],
      prev = [],
      lastT = null;
    const query = (state) => {
      const trig = !!state.controls._cps; // an actual trigger as opposed to lookahead
      const haps = pat.query(state);
      const output = [];
      haps.map((hap) => {
        const { value, whole } = hap;
        const t = Number(whole.begin);
        if (trig && (lastT == null || lastT !== t)) {
          prev = curr;
          curr = [];
          lastT = t;
        }
        const glideHaps = time.query(state.setSpan(hap.wholeOrPart()));
        glideHaps.map((glideHap) => {
          const part = hap.part.intersection(glideHap.part);
          if (!part) return;
          const context = hap.combineContext(glideHap);
          const glideT = glideHap.value;
          const freqF = getFrequencyFromValue(value, value.s === 'sbd' ? 29 : 36); // target
          const freqI = prev.length
            ? prev.reduce((closest, v) => {
              const phase = glideT > 0 ? Math.min((t - v.t) / glideT, 1) : 1;
              const cand = v.freqI + phase * (v.freqF - v.freqI);
              if (closest == null) return cand;
              return Math.abs(cand - freqF) < Math.abs(closest - freqF) ? cand : closest;
            }, null)
            : freqF;
          if (trig) {
            curr.push({ freqI, freqF, t });
          }
          let newVal = value;
          if (Math.abs(freqF - freqI) > 1e-6) {
            newVal = {
              ...value,
              panchor: 0,
              psustain: 0,
              pattack: 0,
              pdecay: glideT,
              penv: -12 * Math.log2(freqF / freqI),
            };
          }
          output.push(new Hap(whole, part, newVal, context));
        });
      });
      return output;
    };
    return new Pattern(query);
  },
  false,
);

Pattern.prototype.up = function (pat) { return this.set.mix(pat) };
Pattern.prototype.sq = function (pat) { return this.fmap((v) => v * v) };
Pattern.prototype.sc = function (oc) {
  return this.scale(currScale).trans(reify(oc).sub(3).mul(12));
}
Pattern.prototype.upn = function (pat, oc = 3) {
  return this.up(pat.as("n")).sc(oc);
}
Pattern.prototype.pg = function (amt) {
  return this.postgain(amt);
}
