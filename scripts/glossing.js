/* Similar to set.mix but won't write over values that `vals` does not contain.
  This lets you do things like

  $: s("bd").n(5).room(0.1).rlp(1800).up(`<
    1 0.5 ~ 0.7:4
    1 0.5 ~ ~
    1 0.5 ~ [0.4:4 0.6:4]
    1 0.5 1:22:sd:1 ~
  >*8`.as("velocity:n:s:room"))

  to do Elektron-style parameter locks ++ set the rhythm of an element (similar to `struct`)
  at the same time
*/
window.up = register(
  'up',
  (vals, pat) =>
    pat
      .withValue(
        (v) => (vNew) =>
          Object.assign(v, Object.fromEntries(Object.entries(vNew).filter(([_, val]) => val !== undefined))),
      )
      .appBoth(vals),
  false,
);

/* Plays a sound once (when the REPL is updated) but locked to a provided grid/quantize

So doing

s("downlifter").oneshot(4)

will play it, but only at the next 4-divisible cycle (t = 0, 4, 8, etc)
Useful for locking it into relevant parts of the arrangement

*/
window.oneshot = register('oneshot', (grid, pat) => {
  const t = getTime();
  const qt = Math.ceil(t / grid) * grid;
  return pat.filterWhen((t) => t >= qt && t < qt + 1);
});

/* Executes a function when a specific control key matches a specific value. For example

$: s("bd hh sd hh").filtval("s", "bd", x => x.duck(2))

To only have the kicks trigger the sidechain

*/
window.filtval = register('filtval', (key, val, func, pat) => {
  return pat.when(
    pat.fmap((v) => v[key] === val),
    func,
  );
});

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

/* Try all(x => x.glitch(rand)) to absolutely destroy your patterns :p <3

Fun to trigger at the end of bars for weird glitchy fills

*/
window.glitch = register('glitch', (amt, pat) => {
  return pat.fmap((v) => {
    const keys = Object.keys(v);
    const numKeys = keys.length;
    for (let i = 0; i < numKeys; i++) {
      const k = keys[i];
      if (['orbit', 'duckorbit', 'distorttype'].includes(k)) continue;
      const rand = 2 * Math.random() - 1;
      const val = v[k];
      const isNumber = typeof val === 'number';
      if (k === 'note' && !isNumber) {
        const midi = noteToMidi(val);
        v[k] = Math.round(Math.max(midi * (1 + amt * 0.5 * Math.random()), 24));
      } else if (isNumber) {
        v[k] *= 1 + rand * amt;
      }
    }
    return v;
  });
});

/* Square ⬜️. Useful for making knobs / sliders feel smoother
 */
window.sq = register('sq', (pat) => pat.fmap((v) => v * v));

/* Strums chords

$: s("gm_slap_bass_2")
  .note("a1,c2,e3,g4").clip(0.125).decay(0.2).delay(0.3)
  .strum(slider(0.0849, 0, 0.1))._pianoroll()

*/
window.strum = register('strum', (amt, pat) => {
  return pat.collect().withHaps((haps) => {
    return flatten(
      haps.map((hap) => {
        const collected = hap.value;
        if (collected.length <= 1) {
          return collected;
        }
        const l = collected.length - 1;
        return collected.map((hap, idx) => {
          const offset = amt * ((2 * idx) / l - 1);
          return hap.withSpan((span) => span.withTime((t) => t + offset));
        });
      }),
    );
  });
});

/* Moves hits off the grid and adds velocity variation

$: s("bd hh sd hh").humanize(slider(0.0328, 0, 1))
  .bank("tr909")
  ._pianoroll()
metronome: s("hh*8").n(9).dec(0.3)

*/
window.humanize = register('humanize', (amt, pat) => {
  const amtC = clamp(amt, 0, 1);
  return pat
    .withHaps((haps) => {
      return haps.map((hap) => {
        const offset = 0.1 * amtC * (2 * Math.random() - 1);
        return hap.withSpan((span) => span.withTime((t) => t + offset));
      });
    })
    .withValue((v) => ({ ...v, velocity: (v.velocity ?? 1) + 0.5 * amtC * (2 * Math.random() - 1) }));
});

/**
 * State
 */

/**
 * Resolves all patterns appearing in the `value` of the pattern into actual values
 * Similar to `outerJoin`, but applies to _all_ patterns within the value
 *
 * @name resolveValues
 * @memberof Pattern
 * @returns Pattern
 * @example
 * s("square")
 *   .withValue(() => ({ cutoff: run(8).slow(8).add(1).mul(200), note: "<[A,C,E] [G,B,D]>"}))
 *   .resolveValues()
 */
window.resolveValues = register('resolveValues', (pat) => {
  return pat.withHaps((haps, state) => {
    const out = [];
    for (const hap of haps) {
      const baseWhole = hap.whole;
      const basePart = hap.part;
      const entries = Object.entries(hap.value || {});
      const resolvedValues = entries.map(([key, val]) => {
        if (val instanceof Pattern) {
          const vHaps = val.query(state) || [];
          return vHaps.map((vHap) => ({
            key,
            val: vHap.value,
            part: vHap.part,
            context: vHap.context,
            locations: vHap.context.locations || [],
          }));
        }
        return [
          {
            key,
            val,
            part: basePart,
            context: {},
            locations: [],
          },
        ];
      });
      if (resolvedValues.length === 0) {
        out.push(hap);
        continue;
      }
      const stack = [
        {
          count: 0,
          part: basePart,
          value: {},
          context: {},
          locations: [],
        },
      ];
      while (stack.length) {
        const { count, part, value, context, locations } = stack.pop();
        if (count === resolvedValues.length) {
          context.locations = locations;
          out.push(new Hap(baseWhole, part, value, context));
          continue;
        }
        for (const entry of resolvedValues[count]) {
          const newPart = part.intersection(entry.part);
          if (!newPart) continue;
          stack.push({
            count: count + 1,
            part: newPart,
            value: { ...value, [entry.key]: entry.val },
            context: { ...context, ...entry.context },
            locations: [...locations, ...entry.locations],
          });
        }
      }
    }
    return out;
  });
});

/**
 * Sets up `state` propagation on the pattern. The state will be updated on each timestep where there
 * is a trigger, via the provided `updateFn`.
 *
 * Note that all values on the state will automatically propagate, so you only need to return an object
 * that has the values you wish to update.
 *
 * The state provides a `__count` value to support things like [Isorhythms](https://en.wikipedia.org/wiki/Isorhythm) and
 * the `__time` of the current trigger.
 *
 * @name state
 * @memberof Pattern
 * @returns Pattern
 * @param {function} updateFn The function used to update the state
 * @example
 * s("tri").struct("x ~ [~ x] ~ x!2").duration(0.75).lpf(200).lpenv(2).delay(0.5)
 *   .state((s) => ({
 *     note: ["c#4", "f#2", "a#", "f#4", "g#3", "d#3"][s.__count % 6],
 *     room: _mod((s.room ?? 0) + 0.1, 1),
 *   }))
 */
window.state = register('state', (updateFn, pat) => {
  const state = { __count: 0, __time: 0 };
  Object.assign(state, updateFn(state));
  return pat
    .withValue((v) => ({ ...v, ...state }))
    .resolveValues()
    .onTrigger((hap) => {
      const t = Number(hap.part.begin);
      if (t === state.__time) return;
      state.__time = t;
      state.__count += 1;
      Object.assign(state, updateFn(state));
    }, false);
});

/**
 * Turns the pattern into a [Markov chain](https://en.wikipedia.org/wiki/Markov_chain) with values
 * equal to an index from the `table` parameter, which defines the transition probabilities between
 * indices. Each trigger will sample from the distribution. Often paired with `pick` or `pickOut`.
 *
 * @name markov
 * @memberof Pattern
 * @returns Pattern
 * @param {number[][]} table Table of transition probabilities
 * @example
 * const markovTable = [[ 0, .2, .8], [ .3,  0, .7], [ .9, .1,  0]];
 * "x".beat("0, 3, 6, 8", 16)
 *   .markov(markovTable)
 *   .pickOut(['bd', 'sd', 'hh']).s().bank('tr909').log()
 *   .early(5)
 */
window.markov = register('markov', (table, pat) => {
  return pat
    .state((state) => {
      const cdf = table[state.value ?? 0].reduce((acc, p) => {
        return (acc.push((acc.at(-1) ?? 0) + p), acc);
      }, []);
      const sampled = getRandsAtTime(state.__time);
      const next = cdf.findIndex((element) => element > sampled);
      return {
        value: next,
      };
    })
    .fmap((v) => v.value);
});

Pattern.prototype.stadd = function (addPat) {
  return this.state((s, span) => {
    const v = addPat.queryArc(span.begin, span.end)[0].value;
    for (const k of Object.keys(v)) {
      s[k] = (s[k] ?? 0) + v[k];
    }
    return s;
  });
};

const _wrap = (x, max, min = 0) => min + _mod(x - min, max - min);
Pattern.prototype.wrap = function (maxPat, minPat) {
  return this.withHaps((haps, state) => {
    const vMax = maxPat.query(state)[0].value;
    const vMin = minPat ? minPat.query(state)[0].value : undefined;
    return haps.map((h) => {
      for (const k of Object.keys(vMax)) {
        const max = vMax[k] ?? Number.POSITIVE_INFINITY;
        const min = vMin?.[k];
        h.value[k] = _wrap(h.value[k] ?? 0, max, min);
      }
      return h;
    });
  });
};

// Converts db to linear values so you can do things like .gain(dbToLin(-5)) to reduce 5db
window.dbToLin = (db) => Math.pow(10, db / 20);

let currScale = 'G#:minor';

// Set the global scale
const setScale = (scaleName) => (currScale = scaleName);

// Attach the global scale to the pattern (and shift the octave if provided)
Pattern.prototype.sc = function (oct = 3) {
  return this.scale(currScale).trans(reify(oct).sub(3).mul(12));
};

// Get segmented rands
window.rands = (div) => rand.seg(div);

// Like `up` but a shorthand for writing notes in the global scale
Pattern.prototype.upn = function (pat, oct = 3) {
  return this.up(pat.as('n')).sc(oct);
};

// Like `up` but a shorthand for setting `begin` of sounds and automatically setting clip(1)
// so they don't risk ringing out FOREVER
Pattern.prototype.upb = function (pat) {
  return this.up(pat.as('begin')).clip(1);
};

// Like postgain but faster to type & can be chained so that `pat.pg(0.5).pg(0.5)` will have overall
// postgain of 0.25
Pattern.prototype.pg = function (val) {
  return this.mul(postgain(val));
};

// Fit a sound to a given length. Useful for e.g. top loops and breaks. Note that typically what
// one would do is `pat.slow(len).fit()` which means that the pattern will only play every `len` cycles
// => you could be waiting a while after stopping the sound before it stops playing. This guarantees
// that the sound will only ever play for one cycle
Pattern.prototype.ifit = function (len) {
  return this.inside(len, fit).clip(1);
};

// Don't like counting to 8? THEN THIS IS THE FUNCTION FOR YOU!
// It automatically turns patterns like n("0@3 4@4 2@2") into n("<0@3 4@4 2>*8") (meaning that
// it sets it to the correct metric subdivision (8th notes) _and_ truncates the 2@2 down to just 2 since that
// would spill past the measure)
/*
  @example
  $: n("0@3 4@4 2@2").meter(8).scale("F:minor")._pianoroll()
*/
window.meter = register(
  'meter',
  (stepSize, pat) => {
    const total = pat._steps;
    stepSize = Fraction(stepSize);
    if (total.lt(stepSize)) {
      const pad = stepSize.sub(total);
      return stepcat(pat, gap(pad)).pace(stepSize).restart('1');
    }
    const remainder = total.mod(stepSize);
    const newSteps = total.sub(remainder);
    const numCycles = newSteps.div(stepSize);
    return pat.take(newSteps).pace(stepSize).restart(pure(1).slow(numCycles));
  },
  true,
  false,
  (x) => x.stepJoin(),
);

// Chops up a sample and plays back those sections. Similar to ableton's "beat" mode. Useful for
// emphasizing transients in tops/breaks and to do time stretching
/*
  @example
  $: s("numbers:5").splay(16, 0.3, 2)
*/
Pattern.prototype.splay = function (cuts = 8, dec = 0.3, slow = 1) {
  return this.slice(cuts, run(cuts).slow(slow)).decay(dec).clip(1);
};

// Gives you access to velocity values. Useful for making other controls a function of velocity
/*
  @example
  $: s("saw").seg(8).note("F1").velocity(rand).vmap((v, x) => x.lpf(v.range(200, 4000)))
*/
window.vmap = register('vmap', (func, pat) => {
  const vPat = pat.fmap((v) => v.velocity ?? 1);
  return func(vPat, pat);
});

// Lets you set the BPM (i.e. cpm x 4) in real time via a slider (or other control)
/*
  @example
  $: slider(100, 100, 200).setbpm()
*/
Pattern.prototype.setbpm = function () {
  const query = (state) => {
    if (!!state.controls.cyclist) {
      setCpm(Number(this.query(state)[0].value) / 4);
    }
    return [];
  };
  return new Pattern(query);
};

// Shorthand for sending to a bus without allowing dry signal through
Pattern.prototype.bsend = function (id) {
  return this.bus(id).dry(0);
};

// Allows setting up various modes of a pattern
/*
  @example
  s("saw").modes("<0 1>", x => x, x => x.lfo({ c: "s" }))
*/
register('_modes', (mode, modeFnArr, pat) => {
  return modeFnArr[mode % modeFnArr.length](pat);
});
Pattern.prototype.modes = function (mode, ...modeFns) {
  return this._modes(mode, modeFns);
};

// Fade in a sound via a lowpass filter
Pattern.prototype.lpfade = function (t = 8, min = 200, max = 10000) {
  return this.FX(lpf(saw.slow(t).range(min, max)));
};

// Fade _out_ a sound via a highpass filter
Pattern.prototype.hpfade = function (t = 8, min = 200, max = 10000) {
  return this.FX(hpf(saw.sq().slow(t).range(min, max)));
};

// Add a customizable riser. You are given access to `rise` which is a 0-1 variable
// that indicates progress towards the end of the rise
/*
  @example
  $: riser(16, 8, (x, rise) => x.s("supersaw").detune(rise))
*/
window.riser = (speed = 16, cycles = 16, callback = (x, _rise) => x) => {
  return saw
    .slow(cycles)
    .fmap((v) => v * v)
    .apply((rise) =>
      s('pulse')
        .seg(speed)
        .note(rise.mul(24))
        .add(note('F1'))
        .lpf(rise.range(50, 20000))
        .apply((x) => callback(x, rise)),
    );
};

// Simple white noise sweep via exponential envelope
window.noiseSweep = (t = 8, bpm = 120) =>
  s('white')
    .slow(t)
    .hpf(800)
    .postgain(0)
    .env({
      da: 0.7,
      s: 1,
      a: reify(t)
        .mul(4 * 60)
        .div(reify(bpm)),
      ac: -0.8,
    })
    .rel(0.1)
    .sus(1)
    .compressor(-20);

// Arp(up). Instead of the normal arp which just cycles back around to the initial note when
// inputting an index above the total # of notes, `arpu` will change the octave up/down
/*
  @example
  $: note("[A2,C3,E5]").arpu("0 1 2 3 4 -1 -2 -3".fast(2))
*/
window.arpu = register(
  'arpu',
  (indices, pat) =>
    pat.arpWith((haps) =>
      reify(indices).fmap((i) => {
        const oct = Math.floor(i / haps.length);
        const hap = haps[(i - oct * haps.length) % haps.length];
        hap.value.note = parseNumeral(hap.value.note) + 12 * oct;
        return hap;
      }),
    ),
  false,
);

// Pans each _voice_ of a chord individually
/*
  @example
  $: chord("<Am F G C>").voicing().panv("<0 0.25 0.75 1>").arp("0 1 2 3").s("piano")
*/
window.panv = register('panv', (amt, pat) => {
  return pat
    .collect()
    .fmap((haps) =>
      stack(
        ...haps.map((hap, idx) =>
          hap.withValue((v) => ({
            ...v,
            pan: idx % 2 === 0 ? amt : 1 - amt,
          })),
        ),
      ),
    )
    .innerJoin()
    .withHap((h) => new Hap(h.whole, h.part, h.value.value, h.combineContext(h.value)));
});

// Allows you to reverse a sound and use it as a sweep up
/*
  @example
  $: sweep("bd", 0.5, 1)
*/
window.sweep = (name, soundLen = 1, totLen = 8) => {
  return arrange([totLen - soundLen, silence], [soundLen, s(name).slow(soundLen).fit().mul(speed(-1))]);
};

// Comb filter
Pattern.prototype.comb = function (delay = 0.005, feedback = 0.6) {
  delay = reify(delay);
  feedback = reify(feedback);
  return this.FX(
    K(() => {
      const d = S(delay);
      const q = S(feedback);
      return audioin()
        .add((x) => x.delay(d).mul(q))
        .add((x) => x.delay(2 * d).mul(q * q))
        .add((x) => x.delay(3 * d).mul(q * q * q))
        .add((x) => x.delay(4 * d).mul(q * q * q * q))
        .out();
    }),
  ).fxr(1);
};

// Fun lil bass guy
window.spinor = (alive = 1, dead = 0) =>
  s('wt_digital')
    .lfo({ dr: 0.05 })
    .wtrate(alive)
    .unison(3)
    .detune(alive)
    .compressor(-20)
    .fm(dead)
    .fmh(4)
    .FX(
      lpf(200)
        .lpe(4)
        .lpa(0.5)
        .lps(1)
        .K(() => {
          audioin()
            .sub((x) => x.bpf(sine(0.13).mul(S(rand))))
            .out();
        })
        .asym('0.3'.mul(dead)),
      diode(0.7),
      gain(0.3),
    )
    .fxr(1);

// Same as `duck` but will scale down the depth based on the velocity of the triggering pattern
window.vduck = register('vduck', (target, pat) => {
  return pat.fmap((v) => ({
    ...v,
    duckorbit: target,
    duckdepth: (v.duckdepth ?? 1) * (v.velocity ?? 1),
  }));
});

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

Pattern.prototype.sophie = function (squish = 0.1, splat = 0.1, speed = 4, clang = 0.8) {
  clang = reify(clang).fmap((v) => clamp(v, 0, 0.999));
  squish = reify(squish).range(0.005, 0.05);
  splat = reify(splat).range(0.001, 0.5);
  return this.FX(delayt(squish).lfo({ dc: 0, da: splat, s: speed }).delay(1).dry(0).delayfb(clang)).fxr(2);
};

/* Trigger things!

control = what will cause the trigger to happen (cc(..), keyDown(..), etc)
grid = what time division to snap to. E.g. grid = 8 means triggering the sound will play it at the start of the next 8 bar section
length = # of cycles to play the sound for after it starts

@example
$: s("hh").trig(keyDown("Control:j"), 1, 1)
$: s("bd*4")

*/
Pattern.prototype.trig = function (control, length = 16, grid = 8) {
  let qt = -1e9;
  const query = (state) => {
    const real = !!state.controls._cps;
    const cch = control.query(state);
    const truthy = cch ? cch.some((h) => h.value > 0) : false;
    if (real && truthy) {
      // Quantize
      qt = Math.ceil(getTime() / grid) * grid;
    }
    return this.late(qt)
      .filterWhen((t) => t >= qt && t < qt + length)
      .query(state);
  };
  return new Pattern(query);
};
