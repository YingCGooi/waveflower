// CSS overrides
// use custom icon
window.addEventListener('DOMContentLoaded', (e) => {
  document.head.querySelectorAll('[rel=icon]').forEach((n) => {
    n.type = 'image/png';
    n.href = 'https://waveflower.org/assets/icons/waveflower_icon_aligned.png';
  });

  const cmLines = document.querySelectorAll('.cm-line');
  if (!cmLines) {
    return;
  }
  const cmEditor = document.querySelectorAll('.cm-line');
  if (!cmEditor) {
    return;
  }
  // prevents auto scroll in mobile such that cursor ends up *behind* the virtual keyboard
  cmLines.forEach((n) => {
    n.onfocus = (e) => {
      e.preventDefault();
      e.focus({ preventScroll: true });
    };
  });
  cmEditor.onfocus = (e) => {
    e.preventDefault();
    e.focus({ preventScroll: true });
  };
});

/**
 * @name addCSS
 * @tags prebake
 * adds any arbitrary css property to be applied to .cm-lines
 *
 * @example
 * addCSS('font-weight: 300; line-height: .75em;')
 */
window.addCSS = function (css = '') {
  document.querySelectorAll('style').forEach((n) => {
    n.append('#pre,.cm-line{' + css + '}');
  });
};

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
 * @param {Number} saturation amount (default 1)
 * @param {Number} hueShift (default 0)
 * @param {String} commentColor (default '#222')
 * @param {String} commentStyle (default 'italic')
 * @param {String} gutterColor (default '#444')
 * @param {String} lineHighlightColor (default '#2222')
 * @param {String} selectionBackground (default '#FFFFFF07')
 * @param {String} background color (default '#0017')
 * @param {Number} glow (default 0)
 * @param {Number} letterSpacing, in px (default 0)
 * @param {Number} lineHeight, in rem (default 1.55)
 * @example
 * useWet({amount: 1.4, commentColor: '#111', gutterColor: '#000', commentStyle: 'normal', letterSpacing: -0.1})
 */
window.wetEditor = function ({
  amount = 1,
  saturation = 0,
  brightness = 1,
  hueShift = 0,
  commentColor = '#222',
  commentStyle = 'italic',
  gutterColor = '#444',
  lineHighlightColor = '#2222',
  selectionBackground = '#FFFFFF07',
  background = '#0017',
  glow = 0,
  letterSpacing = 0,
  lineHeight = 1.55,
  h1Indent = 0,
} = {}) {
  if (saturation) {
    amount = saturation
  }
  document.querySelectorAll('style').forEach((n) => {
    window.removePrebakeCSS();
    n.append('#pre,[type=range]{width:400px !important;accent-color:oklch(.7 .24 240);}');
    n.append('#pre,:root { --background:'+background+' !important; --lineBackground: #0000 !important;} ');
    n.append('#pre,canvas {filter:saturate(' + amount + ');}');
    n.append('#pre,#code .cm-line>*{background:#0000;}');
    n.append(
      '#pre,.cm-line{filter:hue-rotate(' +
        String(hueShift) +
        'deg) saturate(' +
        amount +
        ') brightness('+brightness+') drop-shadow(0 0 ' +
        glow +
        'px);}',
    );
    n.append('#pre,#header,.bg-lineHighlight,.cm-gutter,.cm-lineNumbers,.cm-gutters{background:'+background+';}');
    n.append('#pre,.cm-line{letter-spacing:' + letterSpacing + 'px;line-height:' + lineHeight + 'rem;}');
    n.append('#pre,.ͼbi { font-style:' + commentStyle + '; color:' + commentColor + '!important }');
    n.append('#pre,.cm-gutters{ color: ' + gutterColor + ' !important}');
    n.append('#pre,.cm-activeLine{ background-color:' + lineHighlightColor + '!important}');
    n.append(
      '#pre,.ͼau.cm-focused .cm-selectionBackground,.ͼau .cm-line::selection,.ͼau .cm-selectionLayer .cm-selectionBackground,.ͼau .cm-content ::selection{background:' +
        selectionBackground +
        ' !important}',
    );
    n.append('#pre,h1.text-xl{margin-left:'+h1Indent+'px}')
  });
};
window.useWet = (opts) => window.wetEditor(opts);

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
          ';}',
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
window.filtval = register('filtval', (key, val, func, pat) => {
  return pat.when(
    pat.fmap((v) => v[key] === val),
    func,
  );
});
window.where = window.filtval;
// Ping pong delay
window.pong = register('pong', (mix, t, fb, pat) => {
  return pat
    .FX(
      K(() => {
        const mix = S(mix);
        const t = S(t);
        const fb = S(fb);
        const input = audioin();
        const L = add(0);
        const R = add(0);
        L.withIns(input, R.delay(t).mul(fb)).pan(-1);
        R.withIns(add(0), L.delay(t).mul(fb)).pan(1);
        const wet = poly(L, R).mix(2);
        return add(input.mix(2).mul(1 - mix), wet.mul(mix)).out();
      }),
    )
    .fxr(3);
});
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

var sTagBorder = 'style="display:inline-block;border-color:var(--foreground);margin: 0px 1rem';
var sParamType =
  ' style="border-color:oklch(from var(--caret) .67 .2 h);color:oklch(from var(--caret) .67 .2 h) !important;font-weight:300;padding: 2px 4px;" ';
var sParamName =
  ' style="margin-right:2px;border-color:oklch(from var(--caret) l .15 h);color: oklch(from var(--caret) l .15 h) !important;font-family: inherit;padding: 1px 4px;font-weight: 400;filter: contrast(1.1);" ';

var TAGS = {
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
window.useJSDoc = async function (url) {
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
    console.info('JSdocs parsed from ' + url, docs);
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
            return '<pre class="bg-background" style="background:oklch(from var(--muted) l c h /.16) !important;">';
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

Pattern.prototype.rainbowCycle = function (offset = 10, cycles = 8) {
  const hues = Array(cycles)
    .fill(0)
    .map((_, i) => {
      const hue = (360 / cycles) * i + offset;
      return 'oklch(.7 .2 ' + hue + ')';
    });
  return this.color(slowcat(...hues));
};

window.C = midiToFreq(36 + 12);
window.D = midiToFreq(38 + 12);
window.E = midiToFreq(40 + 12);
window.F = midiToFreq(41 + 12);
window.G = midiToFreq(43 + 12);
window.A = midiToFreq(45 + 12);
window.B = midiToFreq(47 + 12);

// PITCHWHEEL ========================================================
// IMPLEMENTATION ========================================================
// BELOW ========================================================

// PITCHWHEEL ========================================================
// IMPLEMENTATION ========================================================
// BELOW ========================================================
const circlePos = (cx, cy, radius, angle) => {
  angle = angle * Math.PI * 2;
  const x = Math.sin(angle) * radius + cx;
  const y = Math.cos(angle) * radius + cy;
  return [x, y];
};

// centsTo12Note maps cents to note in 12TET
// including sharps and flats
const centsTo12Note = {
  0: 'A',
  77: 'A#',
  116: 'Bb',
  194: 'B',
  271: 'B#',
  310: 'C',
  387: 'C#',
  426: 'Db',
  503: 'D',
  581: 'D#',
  619: 'Eb',
  697: 'E',
  813: 'F',
  890: 'F#',
  929: 'Gb',
  1006: 'G',
  1084: 'G#',
  1123: 'Ab',
};

// construct reversed {note: cents} object from above
const revCentsTo12Note = Object.keys(centsTo12Note).map((key) => [centsTo12Note[key], key]);
const twelveNoteToCents = Object.fromEntries(revCentsTo12Note);

const noteSymbolMap = {
  b: '♭',
  '#': '♯',
};
// centsToANoteMap is based on 31edo, which also contains all 12edo notes
// as this is an approximation, please only use this for visualization/closest match only
// ⦉ = half-flat; ‡ = half-sharp
const centsToANoteMap = {
  0: 'A',
  39: 'A‡', // or Bbb
  77: 'A♯',
  116: 'B♭',
  155: 'B⦉', // or A##
  194: 'B',
  232: 'B‡', // or Cb
  271: 'B♯', // or C<
  310: 'C',
  348: 'C‡', // or B## or Dbb
  387: 'C♯',
  426: 'D♭',
  465: 'D⦉', // or C##
  503: 'D',
  542: 'D‡', // or Ebb
  581: 'D♯',
  619: 'E♭',
  658: 'E⦉', // or D## or Fbb
  697: 'E',
  735: 'E‡', // or Fb
  774: 'F⦉', // or E#
  813: 'F',
  852: 'F‡', // or E## or Gbb
  890: 'F♯',
  929: 'G♭',
  968: 'G⦉', // or F##
  1006: 'G',
  1045: 'G‡', // or Abb
  1084: 'G♯',
  1123: 'A♭',
  1162: 'A⦉', // or G##
};
// construct reversed {note: cents} object from above
const reverseNoteArray = Object.keys(centsToANoteMap).map((key) => [centsToANoteMap[key], key]);
const noteToCentsMap = Object.fromEntries(reverseNoteArray);

const midiOffsetFromC = {
  auto: 0,
  C: 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  Fb: 4,
  'E#': 5,
  F: 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11,
};

// make these global variables so they can be easily referenced
const midiNoteToFreq = {
  Bb1: midiToFreq(34),
  B1: midiToFreq(35),
  C2: midiToFreq(36),
  D2: midiToFreq(38),
  E2: midiToFreq(40),
  F2: midiToFreq(41),
  G2: midiToFreq(43),
  A2: midiToFreq(45),
  Bb2: midiToFreq(34),  
  B2: midiToFreq(47),
  c: midiToFreq(36 + 12),
  d: midiToFreq(38 + 12),
  e: midiToFreq(40 + 12),
  f: midiToFreq(41 + 12),
  g: midiToFreq(43 + 12),
  a: midiToFreq(45 + 12),
  b: midiToFreq(47 + 12),
  auto: midiToFreq(36 + 12), // default auto to C if not found in scale or xen baseFreq
  C: midiToFreq(36 + 12),
  'C#': midiToFreq(37 + 12),
  Db: midiToFreq(37 + 12),
  D: midiToFreq(38 + 12),
  'D#': midiToFreq(39 + 12),
  Eb: midiToFreq(39 + 12),
  E: midiToFreq(40 + 12),
  Fb: midiToFreq(40 + 12),
  'E#': midiToFreq(41 + 12),
  F: midiToFreq(41 + 12),
  'F#': midiToFreq(42 + 12),
  Gb: midiToFreq(42 + 12),
  G: midiToFreq(43 + 12),
  'G#': midiToFreq(44 + 12),
  Ab: midiToFreq(44 + 12),
  A: midiToFreq(45 + 12),
  'A#': midiToFreq(46 + 12),
  Bb: midiToFreq(46 + 12),
  B: midiToFreq(47 + 12),
  Cb: midiToFreq(47 + 12),
  C3: midiToFreq(36 + 24),
  D3: midiToFreq(38 + 24),
  E3: midiToFreq(40 + 24),
  F3: midiToFreq(41 + 24),
  G3: midiToFreq(43 + 24),
  A3: midiToFreq(45 + 24),
  B3: midiToFreq(47 + 24),
};

const freq2Note = {
  [Math.round(midiToFreq(36-24))]: 'C',  
  [Math.round(midiToFreq(37-24))]: 'C#',
  [Math.round(midiToFreq(38-24))]: 'D',
  [Math.round(midiToFreq(39-24))]: 'D#',
  [Math.round(midiToFreq(40-24))]: 'E',
  [Math.round(midiToFreq(41-24))]: 'F',
  [Math.round(midiToFreq(42-24))]: 'F#',
  [Math.round(midiToFreq(43-24))]: 'G',
  [Math.round(midiToFreq(44-24))]: 'G#',
  [Math.round(midiToFreq(45-24))]: 'A',
  [Math.round(midiToFreq(46-24))]: 'A#',
  [Math.round(midiToFreq(47-24))]: 'B', 
  [Math.round(midiToFreq(36-12))]: 'C',  
  [Math.round(midiToFreq(37-12))]: 'C#',
  [Math.round(midiToFreq(38-12))]: 'D',
  [Math.round(midiToFreq(39-12))]: 'D#',
  [Math.round(midiToFreq(40-12))]: 'E',
  [Math.round(midiToFreq(41-12))]: 'F',
  [Math.round(midiToFreq(42-12))]: 'F#',
  [Math.round(midiToFreq(43-12))]: 'G',
  [Math.round(midiToFreq(44-12))]: 'G#',
  [Math.round(midiToFreq(45-12))]: 'A',
  [Math.round(midiToFreq(46-12))]: 'A#',
  [Math.round(midiToFreq(47-12))]: 'B',
  [Math.round(midiToFreq(36))]: 'C',
  [Math.round(midiToFreq(37))]: 'C#',
  [Math.round(midiToFreq(38))]: 'D',
  [Math.round(midiToFreq(39))]: 'D#',
  [Math.round(midiToFreq(40))]: 'E',
  [Math.round(midiToFreq(41))]: 'F',
  [Math.round(midiToFreq(42))]: 'F#',
  [Math.round(midiToFreq(43))]: 'G',
  [Math.round(midiToFreq(44))]: 'G#',
  [Math.round(midiToFreq(45))]: 'A',
  [Math.round(midiToFreq(46))]: 'A#',
  [Math.round(midiToFreq(47))]: 'B',
  [Math.round(midiToFreq(36 + 12))]: 'C',
  [Math.round(midiToFreq(37 + 12))]: 'C#',
  [Math.round(midiToFreq(38 + 12))]: 'D',
  [Math.round(midiToFreq(39 + 12))]: 'D#',
  [Math.round(midiToFreq(40 + 12))]: 'E',
  [Math.round(midiToFreq(41 + 12))]: 'F',
  [Math.round(midiToFreq(42 + 12))]: 'F#',
  [Math.round(midiToFreq(43 + 12))]: 'G',
  [Math.round(midiToFreq(44 + 12))]: 'G#',
  [Math.round(midiToFreq(45 + 12))]: 'A',
  [Math.round(midiToFreq(46 + 12))]: 'A#',
  [Math.round(midiToFreq(47 + 12))]: 'B',
  [Math.round(midiToFreq(36 + 24))]: 'C',
  [Math.round(midiToFreq(37 + 24))]: 'C#',
  [Math.round(midiToFreq(38 + 24))]: 'D',
  [Math.round(midiToFreq(39 + 24))]: 'D#',
  [Math.round(midiToFreq(40 + 24))]: 'E',
  [Math.round(midiToFreq(41 + 24))]: 'F',
  [Math.round(midiToFreq(42 + 24))]: 'F#',
  [Math.round(midiToFreq(43 + 24))]: 'G',
  [Math.round(midiToFreq(44 + 24))]: 'G#',
  [Math.round(midiToFreq(45 + 24))]: 'A',
  [Math.round(midiToFreq(46 + 24))]: 'A#',
  [Math.round(midiToFreq(47 + 24))]: 'B',
};

const findRootCents = (root = 'C', twelveTET = false) => {
  let rootFreq = root; // if root is a lettered string, lookup its freq

  if (Number(root) != root) {
    rootFreq = midiNoteToFreq[root];   
  }
  rootFreq = Math.round(rootFreq);
  const nt = freq2Note[rootFreq];
  return twelveTET ? Number(twelveNoteToCents[nt]) : Number(noteToCentsMap[nt]);
};

// centsToNote copies the centsToANoteMap, and offsets its cents based on root cents
// then seek note based on nearest cetns
function centsToNote(cents = 0, root = 'C', twelveTET = false) {
  let rootFreq = root; // if root is a lettered string, lookup its freq
  if (Number(root) != root) {
    rootFreq = midiNoteToFreq[root];
  }
  rootFreq = Math.round(rootFreq);
  cents = Math.round(cents + findRootCents(rootFreq, twelveTET));
  // if rootNote='C', rootCents=310, cents=400,then (+310) = 710 => 'E'
  while (cents > 1200) {
    cents -= 1200;
  }
  let lookup = {};
  twelveTET ? (lookup = centsTo12Note) : (lookup = centsToANoteMap);
  // round cents to nearest integer,
  // then seek 0, +1, seek -1
  // if not found, then seek 0, +2, -2... continue until found
  for (let seek = 0; seek <= 100; seek++) {
    if (lookup[cents]) {
      return lookup[cents];
    }
    if (lookup[cents + seek]) {
      return lookup[cents + seek];
    }
    if (lookup[cents - seek]) {
      return lookup[cents - seek];
    }
  }
  return 'noteNotFoundError';
}

const freq2angle = (freq, root, equalDivisionOfAngle = true) => {
  if (equalDivisionOfAngle) {
    return 0.5 - (Math.log2(freq / root) % 1);
  } else {
    while (freq < root) {
      root /= 2
    }
    while (freq > root * 2) {
      root *= 2
    }
    return 0.5 - (freq / root);
  }
};

const offText = (ctx, text = '0') => ctx.measureText(text).width;
const fillText = (ctx, text = '0', x, y, clear = true) => {
  clear
    ? ctx.clearRect(
        x - offText(ctx, text) / 1.5,
        y - offText(ctx, text) / 4,
        offText(ctx, text) * 1.25,
        offText(ctx, text) * 0.75,
      )
    : null;
  ctx.fillText(text, x - offText(ctx, text) / 2, y + offText(ctx, text) / 3);
};

function pitchwheel({
  haps,
  ctx,
  id,
  hapcircles = 1,
  circle = 0,
  root = 'auto',
  edo = 12,
  divisions = false, // alias to edo
  div = false, // alias to edo
  mode = 'flake', // polygon, flake or flakygon (both)
  labels = false, // numbers or letters
  label = false, // alias of labels
  edolabel = 0, // controls the alpha of the edo index label
  edolabels = false, // alias to edolabel
  customlabels = false, // false or must be an array
  degreelabel = true, // controls the alpha of the degree index label
  distance = 1.1,
  font = 'monocraft',
  textsize = 1.06,
  thickness = 4,
  lineweight = false, // alias to thickness
  lineJoin = 'round',
  linejoin = '', // alias to lineJoin
  hapradius = 7,
  dotsize = 7, // alias to hapradius
  margin = 'auto',
  padding = 0,
  exponential = false,
  glow = 0,
  autonote = true,
  dotalpha = 1/3,
  hapradiusx = 1,
  activedotrx = 1,
  clearrect = false,
  notelabel = false,
  notelabels = false, // alias to notelabel
  notelabeldistance = 0.94,
  lineoctavediv = 0,
} = {}) {
  const connectdots = mode === 'polygon' || mode === 'both' || mode === 'flakygon';
  const centerlines = mode === 'flake' || mode === 'both' || mode === 'flakygon';
  const labelnumbers = label === 'numbers' || labels === 'numbers';
  const labelletters = label === 'letters' || labels === 'letters';
  notelabel = notelabels || notelabel;
  edolabel = Number(edolabel);
  const w = ctx.canvas.width;
  if (dotsize || dotsize === 0) {
    hapradius = dotsize;
  }
  if (lineweight) {
    thickness = lineweight;
  }
  if (linejoin) {
    lineJoin = linejoin;
  }
  if (padding) {
    margin = padding;
  }
  if (margin === 'auto') {
    margin = ctx.canvas.width / 16;
  }
  if (divisions || div) {
    edo = divisions || div;
  }
  if (edolabels) {
    edolabel = edolabels;
  }
  if (activedotrx !== 1) {
    hapradiusx = activedotrx;
  }
  const h = ctx.canvas.height;
  ctx.clearRect(0, 0, w, h);
  const color = getTheme().foreground;

  const size = Math.min(w, h);
  const radius = size / 2 - thickness / 2 - hapradius - margin;
  const centerX = w / 2;
  const centerY = h / 2;

  if (id) {
    haps = haps.filter((hap) => hap.hasTag(id));
  }
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineJoin = lineJoin;
  lineJoin === 'round' ? (ctx.lineCap = 'round') : (ctx.lineCap = 'butt'); // shrink caps
  ctx.lineWidth = 1;

  edo = haps.length >= 1 && haps[0].value && haps[0].value.edo ? haps[0].value.edo : edo;
  root = haps.length >= 1 && haps[0].value && haps[0].value.root ? haps[0].value.root : root;
  // if root is auto look up root from scale
  if (root === 'auto') {
    root = haps.length >= 1 && haps[0].context && haps[0].context.scale ? haps[0].context.scale.split(' ')[0] : root;
    root = haps.length >= 1 && haps[0].context && haps[0].context.baseFreq ? haps[0].context.baseFreq : root;
  }
  // if root is a lettered string, lookup its freq value
  if (Number(root) != root) {
    root = midiNoteToFreq[root];
  }
  const degreeIndexes =
    haps.length >= 1 && haps[0].value && haps[0].value.degreeIndexes ? haps[0].value.degreeIndexes : null;
  const intLabels = haps.length >= 1 && haps[0].value && haps[0].value.intLabels ? haps[0].value.intLabels : null;
  const fontsize = String(radius ** (textsize * 0.6));
  ctx.font = fontsize + 'px ' + font;

  Array.from({ length: edo }, (_, i) => {
    const angle = freq2angle(root * Math.pow(2, i / edo), root, !exponential);
    const [x, y] = circlePos(centerX, centerY, radius, angle);
    let [xl, yl] = circlePos(centerX, centerY, radius * distance , angle);
    if (edolabel) {
      ctx.globalAlpha = edolabel;
      ctx.font = fontsize * 0.85 + 'px ' + font;
      if (Array.isArray(customlabels)) {
        i = customlabels[i];
      }
      fillText(ctx, i, xl, yl, clearrect);
    }
    if (notelabel) {
      let [xn, yn] = circlePos(centerX, centerY, radius * notelabeldistance, angle);
      const cents = Math.round((i * 1200) / edo);
      let nte = centsToNote(cents, root, edo === 12);
      ctx.globalAlpha = notelabel;
      for (let s in noteSymbolMap) {
        nte = nte.replaceAll(s, noteSymbolMap[s]);
      }
      ctx.font = fontsize * 0.8 + 'px ' + font;
      fillText(ctx, nte, xn, yn, clearrect);
    }
    ctx.beginPath();

    // Draw interval label for degree i when it exists:
    if (degreeIndexes === null || degreeIndexes.includes(i)) {
      ctx.globalAlpha = dotalpha;
      hapradius ? ctx.arc(x, y, hapradius, 0, 2 * Math.PI) : null;
      if (intLabels !== null) {
        const degree = degreeIndexes.indexOf(i);
        let intDegLabel = intLabels[degree];
        if (intDegLabel && degreelabel) {
          ctx.globalAlpha = dotalpha*3;
          ctx.font = fontsize * 0.8 + 'px ' + font;
          fillText(ctx, intDegLabel, xl, yl, clearrect);
        }
      }
    } else {
      ctx.globalAlpha = dotalpha;
      ctx.arc(x, y, hapradius, 0, 2 * Math.PI);
    }
    ctx.fill();
  });
  ctx.stroke();

  let shape = [];
  haps.forEach((hap) => {
    let freq;
    try {
      freq = getFrequency(hap);
    } catch (err) {
      return;
    }
    let noteName;
    // only autonote if root is not a freq
    if (edo === 12 && autonote && typeof root === 'string') {
      try {
        noteName = getPlayableNoteValue(hap);
      } catch (err) {
        // warn instead of swallowing the error
        console.warn(err)
      }
    }
    const angle = freq2angle(freq, root, !exponential);
    const [x, y] = circlePos(centerX, centerY, radius, angle);
    const hapColor = hap.value.color || color;
    ctx.strokeStyle = hapColor;
    ctx.fillStyle = hapColor;
    const { velocity = 1, gain = 1 } = hap.value || {};
    const alpha = velocity * gain;
    ctx.globalAlpha = alpha;
    shape.push([x, y, angle, hapColor, alpha, freq, noteName]);
    ctx.beginPath();
    if (dotsize > 0) {
      ctx.globalAlpha = dotalpha;
      ctx.color = hapColor;
      ctx.arc(x, y, hapradius * hapradiusx, 0, 3 * Math.PI);
      ctx.fill();
      ctx.globalAlpha = alpha;
    }
    if (centerlines) {
      if (glow) {
        ctx.shadowColor = hapColor;
        ctx.shadowBlur = glow;
      }
      ctx.lineWidth = thickness;
      if (lineoctavediv !== 0 && edo === 12) {
        const midi = valueToMidi({ freq, noteName });
        const offFromC = midiOffsetFromC[root] || 0;
        let octave = (midi - offFromC) / 12;
        octave = octave < 1 ? 4 : octave;
        ctx.lineWidth = thickness / (octave * lineoctavediv);
      }
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  });

  ctx.strokeStyle = color;

  if (shape.length) {
    shape = shape.sort((a, b) => a[2] - b[2]);
    ctx.beginPath();
    ctx.moveTo(shape[0][0], shape[0][1]);
    const shapeNoteMap = {};
    // make a map of {'A#':0...}
    shape.forEach(([x, y, angle, color, alpha, freq, noteName]) => {
      if (noteName && noteName.length > 0) {
        const noteLetter = noteName.split(/\d/g)[0];
        if (shapeNoteMap[noteLetter] === undefined) {
          shapeNoteMap[noteLetter] = 1;
        } else {
          shapeNoteMap[noteLetter] += 1;
        }
      }
    });
    shape
      .toReversed()
      .map(([x, y, angle, color, alpha, freq, noteName]) => {
        if (!noteName) {
          return [x, y, angle, color, alpha, freq, noteName];
        }
        const letter = noteName.split(/\d/g)[0];
        if (shapeNoteMap[letter] && shapeNoteMap[letter] > 1) {
          shapeNoteMap[letter] -= 1;
          return [x, y, angle, color, 0, freq, ' ']; // draw blank
        }
        return [x, y, angle, color, alpha, freq, noteName];
      })
      .forEach(([x, y, angle, color, alpha, freq, noteName]) => {
        if (glow) {
          ctx.shadowColor = color;
          ctx.shadowBlur = glow;
        }

        if (labels) {
          let [xl, yl] = circlePos(centerX, centerY, radius * distance + thickness / 4, angle);
          const size = String(radius ** ((textsize * 2) / 3));
          ctx.fillStyle = color;
          ctx.font = size + 'px ' + font;
          let i = (Math.log2(freq / root) * edo) % edo;
          if (labelnumbers) {
            i < 0 ? (i += 12) : null;
            let txt = i.toFixed(0);
            if (Array.isArray(customlabels)) {
              txt = customlabels[Number(txt)];
            }
            ctx.font = size / 1.8 + 'px ' + font;
            fillText(ctx, txt, xl, yl, false);
          }
          if (labelletters) {
            if (edolabels) {
              [xl, yl] = circlePos(centerX, centerY, radius * distance * 1.1 + thickness / 4, angle);
            } else {
              [xl, yl] = circlePos(centerX, centerY, radius * distance * 1.03 + thickness / 4, angle);
            }
            let cents = Math.round((i * 1200) / edo);
            while (cents < 0) {
              cents = cents + 1200;
            }
            if (noteName) {
              ctx.font = (size * 3) / 4 + 'px ' + font;
              for (let s in noteSymbolMap) {
                noteName = noteName.replaceAll(s, noteSymbolMap[s]);
              }
              fillText(ctx, noteName, xl, yl, false);
            } else {
              const nte = centsToNote(cents, root, edo === 12);
              fillText(ctx, nte, xl, yl, false);
            }
          }
        }
        if (connectdots) {
          ctx.strokeStyle = color;
          ctx.lineWidth = thickness;

          if (lineoctavediv !== 0 && edo === 12) {
            const midi = valueToMidi({ freq, noteName });
            const offFromC = midiOffsetFromC[root] || 0;
            let octave = (midi - offFromC) / 12;
            octave = octave < 1 ? 1 : octave;
            ctx.lineWidth = thickness / (octave * lineoctavediv);
          }
          ctx.globalAlpha = alpha;
          ctx.lineTo(x, y);
        }
      });
    ctx.lineTo(shape[0][0], shape[0][1]);
    ctx.stroke();
  }
  if (circle) {
    ctx.lineWidth = circle;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + thickness / 2, 0, 2 * Math.PI);
    ctx.stroke();
  }
  return;
}
/**
 * Renders a pitch circle to visualize frequencies within one octave
 * @name pitchwheel
 * @tags visualization
 *
 * @param {number} root: frequency (in Hz) of root note (if edoScale() is set, this is automatically set to the root note)
 * @param {string} root: string value of root note (e.g 'C2'/'G'/'F4', defaults to 'C')
 * @param {int} edo: dots will be draw at intervals of equal division of octave (defaults to 12)
 * @param {number/bool} label/labels: `'letters'` (show note letter) or `'numbers'` (show n or i value of hap)
 * @param {number/bool} edolabel/edolabels: alpha (transparency) of edo labels from 0~1, default=0, if true, sets this to 1
 * @param {number/bool} degreelabel: alpha (transparency) of edo scale degree labels (see edoScale() for more information)
 * @param {number} distance: if non-zero, controls how far number labels are from the center (>1 => away from circle, default to 0)
 * @param {string} font: set font family of the labels (defaults to 'monocraft')
 * @param {number} textsize: controls the size factor of the text, in em (default 1.07)
 * @param {number/bool} circle: circumference radius (defaults to 0 or false)
 * @param {string} linejoin: `'round'` (line corners and caps are rounded) or 'miter' or 'bevel' (default 'round'; alias lineJoin)
 * @param {string} mode: `'polygon'` (lines rendered to join dots) or to `'flake'` (default, lines connected from center origin) or `'both'`
 * @param {number} thickness/lineweight: adjust line stroke width (in px; defaults to 3)
 * @param {number} dotsize/hapRadius: adjusts the size of dots along the circle (in px, defaults to 6; alias hapRadius)
 * @param {number} padding/margin: controls the padding surrouding the wheel, larger values -> smaller wheel (default: 'auto')
 * @param {bool} exponential: controls whether the next interval angle is based on actual frequency value (defaults to false -> equal division of intervals)
 * if set to true, the major 3rd will be exactly 90 deg and major 5th exactly 180 deg
 * @param {number/bool} glow: line shadow blur amount, default: 0
 * @param {number} dotalpha: transparency of dots from 0-1 (default 1)
 * @param {number} hapradiusx/activedotrx: adjusts radius multiplier of active hap dots
 * @param {bool} clearrect: set to false to disable labels from clearing rectangle area before drawing (default: true)
 * @param {number/bool} notelabel: sets the alpha of static notation-based labels in addition to edolabels (default: 0)
 * @param {number} notelabeldistance: sets the distance of notation-based labels from the origin of circle (default: 0.94, inside circle)
 * @param {lineoctavediv}: allow for dynamic line thickness based on octave (higher octave => thinner, lower octave => thicker)
 *
 * @example
 * n("0 .. 12").scale("C:chromatic")
 * .s('sawtooth')
 * .lpf(500)
 * ._pitchwheel({
 *   root: 'A',        // 0th note starts at A
 *   edo: 31,          // dots are equally divided into 31 intervals
 *   edolabels: 1/2,
 *   degreelabel: 2/3,
 *   circle: true,     // render circle to 1px
 *   padding: 200,     // shrink wheel to prevent overflow
 *   exponential: true,// intervals are rendered in natual exponential scale
 *   linejoin: 'round',
 *   thickness: 24,
 *   dotsize: 4,
 *   mode: 'polygon',
 * })
 */
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

// convenience functions for lpf/hpf/vel filter automations
const at = (min, max, c = 16) => (min < max ? saw.rangex(min, max).slow(c) : saw.rev().rangex(max, min).slow(c));
register('lpp', (min, max, p) => p.lpf(perlin.rangex(min, max)));
register('lep', (min, max, p) => p.lpe(perlin.rangex(min, max)));
register('lpfat', (min, max, c, p) => p.lpf(at(min, max, c)));
register('lpfAt', (min, max, c, p) => p.lpf(at(min, max, c)));
register('lpeat', (min, max, c, p) => p.lpe(at(min, max, c)));
register('lpeAt', (min, max, c, p) => p.lpe(at(min, max, c)));
register('hpfat', (min, max, c, p) => p.hpf(at(min, max, c)));
register('hpfAt', (min, max, c, p) => p.hpf(at(min, max, c)));
register('bpfAt', (min, max, c, p) => p.bpf(at(min, max, c)));
register('gainat', (min, max, c, p) => p.gain(at(min, max, c)));
register('gainAt', (min, max, c, p) => p.gain(at(min, max, c)));
register('velat', (min, max, c, p) => p.vel(at(min, max, c)));
register('velAt', (min, max, c, p) => p.vel(at(min, max, c)));

const triAt = (min,max,c=16)=> min < max ? tri.rangex(min,max).slow(c) : tri.rev().rangex(max,min).slow(c)
register('lpfTri', (min, max, c, p) => p.lpf(triAt(min, max, c)));
register('hpfTri', (min, max, c, p) => p.hpf(triAt(min, max, c)));
register('bpfTri', (min, max, c, p) => p.bpf(triAt(min, max, c)));
register('gainTri', (min, max, c, p) => p.gain(triAt(min, max, c)));
register('velTri', (min, max, c, p) => p.vel(triAt(min, max, c)));

register('cyan', p => p.color('oklch(.5 .17 220)'))
register('teal', p => p.color('oklch(.7 .2 200)'))
register('magenta', p => p.color('oklch(.7 .17 0)'))
register('gold', p=>p.color('oklch(.7 .2 80)'))
register('transcyan',p=>p.color('oklch(.67 .2 240 / .1)'))
register('violet', p=>p.color('oklch(.4 .2 300)'))
register('yellow', p=>p.color('oklch(.9 .2 80)'))

register('last4', (p) => p.mask('<0@4 1@4>'));
register('first4', (p) => p.mask('<1@4 0@4>'));
register('first2', (p) => p.mask('<1@2 0@6>'));

document.addEventListener('keydown', function (event) {
  // Check if the user presses the "Enter" key
  if (event.metaKey && event.key === 'Enter') {
    console.log('cmd+enter pressed');
    event.preventDefault();
    document.querySelector('button[title="play"]').click();
  }

  // Check if the user presses the "." key
  if (event.metaKey && event.key === '.') {
    console.log('cmd+ . pressed');
    event.preventDefault();
    console.log(document.querySelector('button[title="stop"]'), document.querySelector('button[title="play"]'));
    document.querySelector('button[title="stop"]').click();
  }
});

// prettier-ignore
const wcords = {
  root: "[1,3,5]",
  hope: "[1,4,6]",
  desp: "[3,5,7]",
  loom: "[1,3,6]",
  hero: "[5,7,9]",
  mist: "[2,4,6]",
};

/**
 * @name w
 * @tags alias wcords
 * use words instead of note letters or index values to describe chords
 *
 * @example
 * $:w("<root cont glom desp hope root mist glom>")
 * .scale('A#:major')
 * .pitchwheel()
 **/
window.w = function (ptrn) {
  return ptrn.pick(wcords).n().sub(n(1));
};
Pattern.prototype.w = function () {
  return this.pick(wcords).n().sub(n(1));
};

// tone function mimics the tone(freq, gain) function in Desmos
// plays a sine tone by default
window.tone = (frq = 110, gn = 1, shape = 'sine') => freq(frq).s(shape).gain(gn);

const C_MAJOR_JI_MAP = {
  C1: 0,
  C2: 0,
  C: 0,
  C3: 0,
  C4: 0,
  D1: 0,
  D2: +0.039,
  D: +0.039,
  D3: +0.039,
  D4: +0.039,
  E1: -0.137,
  E2: -0.137,
  E: -0.137,
  E3: -0.069,
  E4: -0.137,
  F1: -0.02,
  F2: -0.02,
  F: -0.02,
  F3: -0.02,
  F4: -0.02,
  G1: +0.02,
  G2: +0.02,
  G: +0.02,
  G3: +0.02,
  G4: +0.02,
  A1: -0.156,
  A2: -0.156,
  A: -0.156,
  A3: -0.156,
  A4: -0.156,
  B1: -0.117,
  B2: -0.117,
  B: -0.117,
  B3: -0.117,
  B4: -0.117,
};
// jitrans is a just intonation transpose
Pattern.prototype.jitrans = function (seq) {
  return this.add(note(0)).transpose(seq.pick(C_MAJOR_JI_MAP));
};

// just is a top-level function that transform a seq into justly intonated scale
window.just = function (seq) {
  return seq.note().add(note(0)).transpose(seq.pick(C_MAJOR_JI_MAP));
};

Pattern.prototype.supersaw = function () {
  return this.s('supersaw');
};
Pattern.prototype.sine = function () {
  return this.s('sine');
};
Pattern.prototype.triangle = function () {
  return this.s('triangle');
};
Pattern.prototype.square = function () {
  return this.s('square');
};
Pattern.prototype.sawtooth = function () {
  return this.s('sawtooth');
};

// @source https://glossing.dev/scripts.js
/* Polyphonic non-legato glide

This also has the nice feature of glide persisting across notes, so if you have a very long glide
it'll actually slowly drift between those targets rather than starting its glide over on
every new note
*/
window.glide = register(
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
