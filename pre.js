// CSS overrides
// use custom icon
document.head.querySelectorAll('[rel=icon]').forEach((n) => {
  n.type = 'image/png';
  n.href = 'https://waveflower.org/assets/r=sin2t.png';
});

let windowTitle = '[Prebaked] Strudel REPL';
/**
 * @name useTitle
 * @tags prebake
 * set a custom title to your browser window
 * does not override the '@title' tag
 * @param {String} title set browser window title
 * @example
 * useTitle('Strudel [Prebaked] REPL')
 */
window.useTitle = function (title = 'Strudel [Prebaked] REPL') {
  windowTitle = title;
};

setTimeout(() => {
  const title = document.head.querySelector('title');
  // avoid clashing with the @title mutations
  if (title.innerText.startsWith('Strudel')) {
    title.innerText = windowTitle;
  }
}, 100);

/**
 * @name removePrebakeCSS
 * @tags prebake
 * resets css to original state, removing all css overrides tagged with the #pre selector
 */
window.removePrebakeCSS = function () {
  document.querySelectorAll('style').forEach((n) => {
    let parts = n.innerText.split('#pre');
    n.innerText = parts[0];
  });
};

/**
 * @name wetEditor
 * @synonyms useWet
 * @tags prebake
 * @param {Number} saturation amount (default 3)
 * @param {Number} lineHeight multipler (default 1)
 * @param {Number} hue shift (default -15)
 * @example
 * useWet(3, -15)
 */
window.wetEditor = function (amount = 3, lineHeight = 1.4, hueShift = -12) {
  document.querySelectorAll('style').forEach((n) => {
    window.removePrebakeCSS();
    n.append('#pre,[type=range]{width:400px !important;accent-color:oklch(.7 .24 240);}');
    n.append('#pre,:root { --background: #0017 !important; --lineBackground: #0000 !important} ');
    n.append('#pre,canvas {filter:saturate(' + amount + ')}');
    n.append('#pre,#code .cm-line>*{background: #0000;}');
    n.append(
      '#pre,.cm-line{line-height:' + lineHeight + 'em;filter:hue-rotate(' + hueShift + 'deg) saturate(' + amount + ')}',
    );
    n.append('#pre,#header,.bg-lineHighlight,.cm-gutter,.cm-lineNumbers,.cm-gutters{background: #0015;}');
  });
};
window.useWet = (a, h) => window.wetEditor(a, h);

// CSS helper function
function lineargradient(stops = [], steps, freq, next, alpha, hue, hueStep, w, wmul = 0.1, mode = 'to bottom') {
  const freqStops = {
    [16000]: 4.4,
    [8000]: 12.3,
    [4000]: 20.6, // 5 *32 2^5
    [2000]: 28.9, // 4 *16 2^4
    [1000]: 37.2, // 3 *8 2^3 => 3 * -8.29
    [500]: 45.4, // 2 *4 2^2 => 2 * -8.29
    [250]: 53.7, // 1 *2 2^1 => -8.29
    [125]: 62, // use as base
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
  stops = stops.map(([freq, color, w]) => {
    if (!w) {
      w = 1 / 2;
    }
    let stop = freqStops[freq] || 70.3 - 8.29 * Math.log2(freq / 62.5);
    return [
      '#0000 ' + Number(stop - w).toFixed(2) + '%',
      color + ' ' + stop + '%',
      '#0000 ' + Number(stop + w).toFixed(2) + '%',
    ].join(',');
  });
  return 'linear-gradient(' + mode + ',' + stops.join(',') + ')';
}

/**
 *
 * @name useSpectrum
 * Draws spectral lines on canvas, useful for pinpointing frequency ranges in ._spectrum()
 * @tags prebake
 * @param {[Object]} config contains these options:
 * @param {Int} lines: generate up to number of lines
 * @param {Int} base: line draws first at this frequency
 * @param {Number} next: subsequent frequency will multiply by this multiplier
 * @param {Number} alpha: transparency of lines
 * @param {Int} hue: starting hue ranges between 0-360
 * @param {Int} hueStep: hue spacing between each subsequent hue, lower numbers mean colors will be closer
 * @param {Number} thickness: line thickness (in px)
 * @param {Number} mul: subsequent line thickness multiplier, positive => subsequently thicker lines
 * -- OR --
 * @param {[Array]} stops: an array of stops with this following format:
 * @param {Array} stop: [frequency <Int>, CSScolor <string>, thickness <Number (optional)>]
 * @example
 * useSpectrum({lines:3, base:1000, next:1/2, hue:40, hueStep:40, alpha:.7});
 *
 * @example
 * useSpectrum([
 *   [1000,'oklch(.7 .2 40/.7)',1],
 *   [500, 'oklch(.7 .2 80/.7)',1],
 *   [250, 'oklch(.7 .2 120/.7)',1],
 * ]);
 *
 * @example
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
  window.removePrebakeCSS();
  document
    .querySelectorAll('style')
    .forEach((n) =>
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
window.blockArrange = function (
  patArr = [
    [note('A'), '<F F>'],
    [note('C'), '<0 F>'],
  ],
  modifiers = [],
) {
  return stack(
    patArr
      .map(([pat, maskPat]) => {
        return maskPat
          .withValue((v) => {
            const value = v.toString();
            if (value == 0) {
              return;
            }
            modifiers.forEach(([modifier, callback]) => {
              if (value == modifier) {
                pat = callback(pat);
              }
            });
            return pat;
          })
          .innerJoin();
      })
      .flat(),
  );
};

// function definitions and new registrations
window.supersynth = function (
  pat,
  sound = 'sawtooth',
  { d = 0.1, v = 4, r = 3 / 4, w = 0.2, n = 4, a = 0.01, g = 3 / 4, l = 7, t = 0, os = [], gs = [], ts = [] } = {},
) {
  let lrpan = [Math.max(0.5 - w, 0), Math.min(0.5 + w, 1)];
  const voices = [];
  if (os.length > 0) {
    n = os.length - 1;
  } // override n if os is not empty
  let sign = +1;
  for (let i = 0; i <= n; i++) {
    let panning = lrpan[i % 2];
    let layer = pat
      .add(ts[i] || 0)
      .s(os[i] || sound)
      .FX(gain(gs[i] || g)); // construct base layer
    if (i > 0) {
      layer = layer.pan(panning);
    } // subsequent layers
    if (t > 0) {
      layer = layer.late(t * i);
    } // add optional time offset
    if (v > 0) {
      layer = layer.vib(v * r ** i).vmod(sign * d * r ** i);
    } // vibs, alt between inc/dec detune
    voices.push(layer);
    sign = -sign;
  }
  return stack(...voices)
    .attack(a)
    .lpf(2 ** (l + 5))
    .postgain(1 / (n + 1) ** 0.2);
};
/**
 * @name supersynth
 * @tags prebake
 * @memberof {Pattern}
 * @returns {Pattern}
 * create supersaws, supersquares, supersines and anything in between!
 * use directly on a Pattern: Pattern.supersynth(sound[String] | config[Object] | oscs[Array])
 * or as a top-level function: supersynth([Pattern], sound[String], config[Object])
 * @param {[String]} sound any sound, defaults to 5 voices
 * --- OR ---
 * @param {[Array]} oscs shape for each osc voice (accepts any valid sound like "sine" or "piano"!)
 * --- OR ---
 * @param {[Object]} config options:
 * @param {Number} detune/d: detune / vibmod depth amount (in semitones)
 * @param {Number} vibrato/vib/v: [Number] vibrato speed (in Hz)
 * @param {Number} ratio/r: of detune of subsequent osc'sc, (default 3/4)
 * @param {Number,0->1} stereo/width/w : [Number,0->1] stereo width, (default=0.2)
 * @param {Int} voices/n: number of additional voices, (default=4, or unison of 5, range=[0,infinity))
 * @param {Number} attack/att/a: (default=0.01 seconds)
 * @param {Number} gain/g: controls overall gain of voices
 * @param {NumberArray} gains/gs: gain ratios; gs:[3, 2, 2, 1, 1] will make oscs take 3/9,2/9,2/9,1/9,1/9 factor of overall gain, respectively
 * @param {Int,1->10} lowpass/lp/l: low-pass filter to apply in step, normalized 1->10, each step is double prev freq (default=7 [+ 5], which is 2**12=4096 Hz)
 * @param {Number} late/off/shift/t: delay each subsequent osc start time (by seconds)
 * @param {IntArray} transposes/ts: overrides each osc midi value by adding/subtracting; ts:[0, 12, 12] will make 2nd, 3rd oscs to play at 1 octave higher
 * @param {Array} osc: an array of shapes, each one corresponds to the voice at index n, which at 0 is the main voice
 *
 * @example
 * $:"A".supersynth(['sawtooth', 'sine', 'square']).note()._scope()
 * // => 1st voice is sawtooth, 2nd voice is sine
 *
 * @example
 * const ez = (start, end) => saw.rangex(start, end).slow(8)
 * $:n(cat(
 *   `~ 8 7 5 ~ ~ ~ ~`,
 *   `~ 2 1 3 ~ ~ ~ ~`,
 *   `~ 0 1 5 ~ ~ ~ ~`,
 * `<[~ 2 1 6 ~ ~ ~ <~ -2>]
 *   [0 1 0 -1 ~ ~ ~ ~]>`,
 * ).add(6)).trans(-24)
 *   .supersynth({
 *     o: ['sqr','sqr','sqr','pink','pink'],
 *     n: 4,
 *     r: 4/3,
 *     d: 1/4,
 *     w: 0.3,
 *     g: .7,
 *   }).scale("Bb:major")
 * .lpf(ez(2000,8000)).hpf(500)
 * .rel(.7).ftype(0)
 * .room(.1).size(7).rdim(500).delay(0.2)
 * ._scope()
 *
 * @example
 * $:chord("<[Gm D# F Gm]!3 [Bb D# F Gm]>").n(0)
 *   .mode("root").slow(2).voicing().segment(8)
 *   .transpose(-24)
 *   .makesuper({s: "sawtooth", n: 3, d: 1/3, w:0})
 *   .lpf(ez(200,700)).gain(1).attack(1/20).sustain(ez(1/2,2))
 *   .lpe(2).lpd(ez(1/20,3)).lps(ez(.1,2)).color('oklch(.6 .24 270)')._scope()
 *
 * @example
 * $:chord("<[Gm D# F Gm]!3 [Bb D# F Gm]>").n("[0,1,2] [0,1,3] [0,1,2] [0,1,4]")
 *   .mode("root").slow(2).voicing()
 *   .transpose(-24)
 *   .makesuper({
 *     s: "sawtooth",
 *     g: .5,
 *     a: 1/6,
 *     n: 2,
 *     d: 1/3,
 *     v: 0,
 *     r: 4/3,
 *     w: .5,
 *   }).rel(1/5)
 *   .ftype(2).lpf(ez(100,700))
 *   .room(.2).rlp(300).size(6).hpf(180)
 *   .color('oklch(.7 .2 240)')._scope()
 */
register('supersynth', (param, x) => {
  const aliases = {
    depth: 'd',
    detune: 'd',
    vib: 'v',
    vibrato: 'v',
    ratio: 'r',
    detuner: 'r',
    stereo: 'w',
    width: 'w',
    voices: 'n',
    att: 'a',
    attack: 'a',
    gain: 'g',
    lp: 'l',
    lowpass: 'l',
    late: 't',
    off: 't',
    shift: 't',
    oscs: 'os',
    osc: 'os',
    gains: 'gs',
    oscgains: 'gs',
    transposes: 'ts',
    noteadd: 'ts',
  };
  Object.keys(aliases).forEach((a) => {
    if (param[a] !== undefined) {
      param[aliases[a]] = param[a];
    }
  });
  if (typeof param == 'string') {
    return window.supersynth(x, param);
  }
  if (Array.isArray(param)) {
    return window.supersynth(x, param[0], { osc: param });
  }
  if (typeof param == 'object') {
    return window.supersynth(x, param.s || 'sawtooth', param);
  }
  return window.supersynth(x);
});

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

Pattern.prototype.up = function (pat) {
  return this.set.mix(pat);
};
Pattern.prototype.sq = function (pat) {
  return this.fmap((v) => v * v);
};
Pattern.prototype.sc = function (oc) {
  return this.scale(currScale).trans(reify(oc).sub(3).mul(12));
};
Pattern.prototype.upn = function (pat, oc = 3) {
  return this.up(pat.as('n')).sc(oc);
};
Pattern.prototype.pg = function (amt) {
  return this.postgain(amt);
};

// URL to current prebake for JSDoc processing
const URL = 'https://waveflower.org/scripts/prebake.js';
const sTagBorder = 'style="display:inline-block;border-color:var(--foreground);margin: 0px 1rem';
const sParamType =
  ' style="border-color:oklch(from var(--caret) .67 .2 h);color:oklch(from var(--caret) .67 .2 h) !important;font-weight:300;padding: 2px 4px;" ';
const sParamName =
  ' style="margin-right:2px;border-color:oklch(from var(--caret) l .15 h);color: oklch(from var(--caret) l .15 h) !important;font-family: inherit;padding: 1px 4px;font-weight: 400;filter: contrast(1.1);" ';

const TAGS = {
  name: (name, tags = '') =>
    '<h3 class="font-mono my-0 pt-4" style="font-family:inherit;font-weight:700;display:inline-block;padding-right:1rem;filter:brightness(120%)">' +
    name +
    '</h3>',

  tags: (tags) =>
    '<span ' + sTagBorder + 'class="ml-2 text-xs text-foreground border border-muted px-1 py-0.5">' + tags + '</span>',

  synonyms: (syn) => '<p><em>synonyms</em> <code>' + syn + '</code></p>',
  text: (text) => '<p style="font-size:.9em; letter-spacing:-.2px;"><p>' + codify(text) + '</p></p>',

  memberof: (mem) =>
    '<span style="margin:0 4px;text-align:right"><em style="color: var(--muted); font-size:small; filter:brightness(1.7)">memberof</em> <code style="font-weight:300;color:oklch(from var(--caret) .67 .2 h)">' +
    mem.replaceAll('{', '&lt;').replaceAll('}', '&gt;') +
    '</code></span>',

  returns: (ret) =>
    '<span style="margin:0 4px;text-align:right"><em style="color: var(--muted); font-size:small; filter:brightness(1.7)">returns</em> <code style="font-weight:300;color:oklch(from var(--caret) .67 .2 h)">' +
    ret.replaceAll('{', '&lt;').replaceAll('}', '&gt;') +
    '</code></span>',

  param: (type, name, desc, listStyle = 'square') =>
    '<li style="list-style-type:' +
    listStyle +
    ';list-style-position:inside;font-weight:400;letter-spacing:-.2px;">' +
    '<code class="border border-muted" ' +
    sParamName +
    '>' +
    name +
    '</code>' +
    '<code ' +
    sParamType +
    '>' +
    type +
    '</code>' +
    codify(desc) +
    '</li>',
};

function codify(text = '', delimiter = '`') {
  var open = true;
  return text
    .split('')
    .map((c) => {
      if (c === delimiter) {
        return open
          ? (open = false) ||
              '<code style="font-family:inherit; border-radius:2px; border:none; background:var(--muted); padding:2px 6px;">'
          : (open = true) && '</code>';
      }
      return c;
    })
    .join('');
}

/**
 * @name useJSDoc
 * @tags prebake
 * @synonyms useDoc
 * Enables JSDoc processing + HTML insertion into the reference tab
 * @param {String} url text content containing JSDoc to pull from
 * @example
 * useJSDoc('https://waveflower.org/scripts/prebake.js')
 */
window.useJSDoc = async function (url = URL) {
  function nav() {
    return document.querySelector('nav[aria-label="Menu Panel"]');
  }

  let docs = [];
  let as = [];
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Response status: ' + response.status);
    const s = await response.text();
    docs = String(s)
      .split(/(\/\*\*)|(\*\/)/)
      .filter((p) => p && p.substring(0, 512).includes('@' + 'name'))
      .map((p) => p.split('\n'));
    console.info('JSdocs parsed from ' + URL, docs);
  } catch (error) {
    console.error(error.message);
  }

  let prepended = 0; // token for rate limiting
  setInterval(() => (prepended = 0), 1000); // reset rate limit

  // observe mutations and prepend to the divNamesList
  new MutationObserver((mutationsList) => {
    let toMutate = false;
    for (const mutation of mutationsList) {
      if (
        mutation.type === 'childList' &&
        mutation.addedNodes.length > 0 &&
        !mutation.target.className.includes('cm-lineNumbers') &&
        !mutation.target.className.includes('cm-gutters')
      ) {
        toMutate = true;
      }
    }
    // do not prepend until the rate limit resets
    if (prepended > 1 || !toMutate || !nav()) {
      return;
    }
    const divs = nav().querySelectorAll('div');
    let divNamesList = null;
    divs.forEach((n) =>
      n.previousElementSibling &&
      n.previousElementSibling.firstChild &&
      n.previousElementSibling.firstChild.tagName === 'INPUT' // sibling is a search input box
        ? (divNamesList = n)
        : 0,
    );

    // remove all existing .pre elements before adding new ones
    document.querySelectorAll('.pre').forEach((n) => n.remove());
    docs.forEach((doc) => {
      if (!divNamesList) {
        return;
      }
      let a = document.createElement('A');
      a.className = divNamesList.firstChild.className + ' ' + 'block' + ' ' + 'pre';
      a.style = 'color: oklch(from var(--caret) .67 .18 h);font-family: inherit;';
      a.innerText = doc
        .filter((l) => l.includes('@name '))[0]
        .split('@name')[1]
        .trim();
      a.href = '#' + a.innerText;
      divNamesList.prepend(a);
      as.push(a);
      prepended += 1;
    });

    let sections = docs.map((d, i) => {
      let isExample = false;
      let isParam = false;
      return d
        .map((l) =>
          l
            .split(/(\*\s+\@)|(\s)/)
            .filter((s) => s && s.length > 0 && s !== ' ' && s !== '* @' && s !== '*  @' && s !== '*'),
        )
        .map(([tag, v1, v2, ...v3]) => {
          if (isExample) {
            if (tag === undefined) {
              isExample = false;
              return '</pre>';
            }
            if (tag === 'example') {
              tag = '';
            }
            return [tag, v1, v2, ...v3].join(' ') + '\n';
          }
          if (tag === 'example') {
            isExample = true;
            return '<pre class="bg-background" style="background:oklch(from var(--muted) l c h /.16) !important">';
          }
          if (tag && !TAGS[tag]) {
            return TAGS.text([tag, v1, v2, v3.join(' ')].join(' '));
          }
          if (!tag) {
            return '';
          }
          if (tag === 'name' && v2 === '@tags') {
            return TAGS.name(v1, v2, v3.join(','));
          }
          if (tag === 'param') {
            v1.includes('{') && v1.includes('}')
              ? (v1 = v1.replaceAll('{', '&lt;').replaceAll('}', '&gt;'))
              : (v2 = v1) && (v1 = '—');
            if (v1.includes('[')) {
              // disable list style for all [Object] param
              return TAGS[tag](v1, v2, v3.join(' '), 'none');
            }
          }
          return TAGS[tag](v1, v2, v3.join(' '));
        })
        .join('');
    });
    console.info({ as, sections });
    Array.from(sections)
      .reverse()
      .forEach((s, i) => {
        let section = document.createElement('section');
        section.id = s.match(/>(.*)<\/h/)[1];
        section.className = 'pre';
        section.innerHTML = s;
        let ref = document.querySelector('#reference-container');
        if (ref) {
          ref.firstElementChild.prepend(section);
          ref.previousElementSibling.style.maxWidth = '30%';
          ref.style.minWidth = '70%';
        }
      });
  }).observe(document.body, {
    childList: true,
    subtree: true,
  });
};

window.useNiceLists = function (color = 'var(--caret) !important') {
  document.querySelectorAll('style').forEach((n) => {
    n.append('#pre,::marker { color:' + color + '; filter:opacity(50%);margin-right: 2px }');
    n.append('.text-ellipsis {font-size: .9em !important; letter-spacing: -.4px;}');
  });
};
useNiceLists();

// PITCHWHEEL ========================================================
// IMPLEMENTATION ========================================================
// BELOW ========================================================

// centsToNote is based on 31edo, which contains all 12edo notes
// as this is an approximation, please only use this for visualization/closest match only
// ◃ = half-flat; ‡ = half-sharp
Pattern.prototype.rainbowCycle = function (offset = 10, cycles = 8) {
  const hues = Array(cycles)
    .fill(0)
    .map((_, i) => {
      const hue = (360 / cycles) * i + offset;
      return 'oklch(.7 .2 ' + hue + ')';
    });
  return this.color(slowcat(...hues));
};

const centsToANoteMap = {
  0: 'A',
  39: 'A‡', // or Bbb
  77: 'A♯',
  116: 'B♭',
  155: 'B◃', // or A##
  194: 'B',
  232: 'B‡', // or Cb
  271: 'B♯', // or C<
  310: 'C',
  348: 'C‡', // or B## or Dbb
  387: 'C♯',
  426: 'D♭',
  465: 'D◃', // or C##
  503: 'D',
  542: 'D‡', // or Ebb
  581: 'D♯',
  619: 'E♭',
  658: 'E◃', // or D## or Fbb
  697: 'E',
  735: 'E‡', // or Fb
  774: 'F◃', // or E#
  813: 'F',
  852: 'F‡', // or E## or Gbb
  890: 'F♯',
  929: 'G♭',
  968: 'G◃', // or F##
  1006: 'G',
  1045: 'G‡', // or Abb
  1084: 'G♯',
  1123: 'A♭',
  1162: 'A⦉', // or G##
};
// construct reversed {note: cents} object from above
const reverseNoteArray = Object.keys(centsToANoteMap).map((key) => [centsToANoteMap[key], key]);
const noteToCentsMap = Object.fromEntries(reverseNoteArray);

window.C = midiToFreq(36 + 12);
window.D = midiToFreq(38 + 12);
window.E = midiToFreq(40 + 12);
window.F = midiToFreq(41 + 12);
window.G = midiToFreq(43 + 12);
window.A = midiToFreq(45 + 12);
window.B = midiToFreq(47 + 12);

const freq2Note = {
  [Math.round(midiToFreq(36 + 12))]: 'C',
  [Math.round(midiToFreq(38 + 12))]: 'D',
  [Math.round(midiToFreq(40 + 12))]: 'E',
  [Math.round(midiToFreq(41 + 12))]: 'F',
  [Math.round(midiToFreq(43 + 12))]: 'G',
  [Math.round(midiToFreq(45 + 12))]: 'A',
  [Math.round(midiToFreq(47 + 12))]: 'B',
};

window.findRootCents = (rootFreq = A) => {
  rootFreq = Math.round(rootFreq);
  const nt = freq2Note[rootFreq];
  return Number(noteToCentsMap[nt]);
};

// centsToNote copies the centsToANoteMap, and offsets its cents based on root cents
// then seek note based on nearest cetns
function centsToNote(cents = 0, root = C) {
  cents = Math.round(cents + window.findRootCents(root));
  // if rootNote='C', rootCents=310, cents=400,then (+310) = 710 => 'E'
  while (cents > 1200) {
    cents -= 1200;
  }
  // round cents to nearest integer,
  // then seek 0, +1, seek -1
  // if not found, then seek 0, +2, -2... continue until found
  for (let seek = 0; seek < 100; seek++) {
    if (centsToANoteMap[cents]) {
      return centsToANoteMap[cents];
    }
    if (centsToANoteMap[cents + seek]) {
      return centsToANoteMap[cents + seek];
    }
    if (centsToANoteMap[cents - seek]) {
      return centsToANoteMap[cents - seek];
    }
  }
  return 'noteNotFoundError';
}

const circlePos = (cx, cy, radius, angle) => {
  angle = angle * Math.PI * 2;
  const x = Math.sin(angle) * radius + cx;
  const y = Math.cos(angle) * radius + cy;
  return [x, y];
};

const freq2angle = (freq, root, equalDivisionOfAngle = true) => {
  if (equalDivisionOfAngle) {
    return 0.5 - (Math.log2(freq / root) % 1);
  } else {
    let normalizer = 1;
    if (freq < root) {
      normalizer = 0.5;
    } else if (freq > root * 2) {
      normalizer = 2;
    } else if (freq > root * 4) {
      normalizer = 4;
    } else if (freq > root * 8) {
      normalizer = 8;
    } else if (freq > root * 16) {
      normalizer = 16;
    } else if (freq > root * 32) {
      normalizer = 32;
    } else if (freq > root * 64) {
      normalizer = 64;
    }
    freq = freq / normalizer;
    return 0.5 - ((freq / root) % 1);
  }
};
function pitchwheel({
  haps,
  ctx,
  id,
  hapcircles = 1,
  circle = 3,
  root = A,
  edo = 12,
  divisions = false, // alias to edo
  div = false, // alias to edo
  mode = 'polygon', // polygon or flake
  labels = 'letters', // numbers or letters
  edolabels = false, // alias of alpha
  distance = 1.1,
  font = 'monocraft',
  textsize = 1.07,
  thickness = 20,
  lineweight = false, // alias to thickness
  lineJoin = 'round',
  linejoin = '', // alias to lineJoin
  hapRadius = 0,
  dotsize = 0, // alias to hapRadius
  margin = 'auto',
  padding = 0,
  exponential = false,
  glow = 0,
} = {}) {
  const connectdots = mode === 'polygon';
  const centerlines = mode === 'flake';
  const labelnumbers = labels === 'numbers';
  const labelletters = labels === 'letters';
  const w = ctx.canvas.width;
  if (dotsize || dotsize === 0) {
    hapRadius = dotsize;
  }
  if (linejoin) {
    lineJoin = linejoin;
  }
  if (padding) {
    margin = padding;
  }
  if (margin === 'auto') {
    margin = ctx.canvas.width / 12;
  }
  if (divisions || div) {
    edo = divisions || div;
  }
  const h = ctx.canvas.height;
  ctx.clearRect(0, 0, w, h);
  const color = getTheme().foreground;

  const size = Math.min(w, h);
  const radius = size / 2 - thickness / 2 - hapRadius - margin;
  const centerX = w / 2;
  const centerY = h / 2;

  if (id) {
    haps = haps.filter((hap) => hap.hasTag(id));
  }
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineJoin = lineJoin;
  lineJoin === 'round' ? (ctx.lineCap = 'round') : (ctx.lineCap = 'butt'); // shrink caps
  ctx.globalAlpha = 1;
  ctx.lineWidth = thickness;

  if (circle) {
    ctx.lineWidth = circle;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + thickness / 2, 0, 2 * Math.PI);
    ctx.stroke();
  }

  if (!edo) {
    edo = 12;
  }
  Array.from({ length: edo }, (_, i) => {
    const angle = freq2angle(root * Math.pow(2, i / edo), root, !exponential);
    const [x, y] = circlePos(centerX, centerY, radius, angle);
    if (labels) {
      const [xl, yl] = circlePos(centerX, centerY, radius * distance + thickness / 3, angle);
      const size = String(radius ** (textsize * 0.6));
      ctx.font = size + 'px ' + font;
      ctx.globalAlpha = edolabels;
      ctx.fillText(i, xl - size / 2, yl + size / 3);
    }
    ctx.beginPath();
    ctx.arc(x, y, hapRadius, 0, 2 * Math.PI);
    ctx.fill();
  });
  ctx.stroke();
  ctx.globalAlpha = 1; // reset alpha

  let shape = [];
  ctx.lineWidth = hapRadius;
  haps.forEach((hap) => {
    let freq;
    try {
      freq = getFrequency(hap);
    } catch (err) {
      return;
    }
    const angle = freq2angle(freq, root, !exponential);
    const [x, y] = circlePos(centerX, centerY, radius, angle);
    const hapColor = hap.value.color || color;
    ctx.strokeStyle = hapColor;
    ctx.fillStyle = hapColor;
    const { velocity = 1, gain = 1 } = hap.value || {};
    const alpha = velocity * gain;
    ctx.globalAlpha = alpha;
    shape.push([x, y, angle, hapColor, alpha, freq]);
    ctx.beginPath();
    if (hapcircles) {
      ctx.moveTo(x + hapRadius, y);
      ctx.arc(x, y, hapRadius, 0, 2 * Math.PI);
      ctx.fill();
    }
    if (centerlines) {
      if (glow) {
        ctx.shadowColor = hapColor;
        ctx.shadowBlur = glow;
      }
      ctx.lineWidth = thickness;
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  });

  ctx.strokeStyle = color;
  ctx.globalAlpha = 1;

  if (connectdots && shape.length) {
    shape = shape.sort((a, b) => a[2] - b[2]);
    ctx.beginPath();
    ctx.moveTo(shape[0][0], shape[0][1]);
    shape.forEach(([x, y, angle, color, alpha, freq]) => {
      if (glow) {
        ctx.shadowColor = color;
        ctx.shadowBlur = glow;
      }

      if (labels) {
        const [xl, yl] = circlePos(centerX, centerY, radius * distance + thickness / 3, angle);
        const size = String(radius ** (textsize * 0.6));
        ctx.fillStyle = color;
        ctx.font = size + 'px ' + font;
        ctx.globalAlpha = 1;
        const i = (Math.log2(freq / root) * edo) % edo;
        if (labelnumbers) {
          ctx.fillText(i.toFixed(0), xl - size / 2, yl + size / 3);
        }
        if (labelletters) {
          let cents = Math.round((i * 1200) / edo);
          while (cents < 0) {
            cents = cents + 1200;
          }
          ctx.clearRect(xl - size / 2 - 4, yl - size / 3 - 3, (size * 4) / 3, (size * 3) / 4);
          ctx.fillText(centsToNote(cents, root), xl - size / 2, yl + size / 3);
        }
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = thickness;
      ctx.globalAlpha = alpha;
      ctx.lineTo(x, y);
    });
    ctx.lineTo(shape[0][0], shape[0][1]);
    ctx.stroke();
  }
  return;
}

Pattern.prototype.pitchwheel = function (options = {}) {
  let { ctx = getDrawContext(), id = 1 } = options;
  return this.tag(id).onPaint((_, time, haps) =>
    pitchwheel({
      ...options,
      time,
      ctx,
      haps: haps.filter((hap) => hap.isActive(time)),
      id,
    }),
  );
};

register('lpp', (min, max, x) => x.lpf(perlin.rangex(min, max)));
register('lep', (min, max, x) => x.lpe(perlin.rangex(min, max)));
