// CSS overrides
document.querySelectorAll('style').forEach(n => {
  n.append('[type=range]{width:400px !important;accent-color:oklch(.7 .2 240);}')
  n.append(':root { --background: #001 !important} ')
  n.append('canvas {filter:saturate(4)}')  
  n.append('#code .cm-line>*{background: #0000;}')
  n.append('.cm-line{filter:hue-rotate(-15deg) saturate(3)}')
})

// global functions
window.blockArrange = function (patArr=[
  [note("A"),"<F F>"],[note("C"),"<0 F>"]
], modifiers=[]) {
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
function supersynth(pat, sound='sawtooth', 
  {d=.1,v=4,r=3/4,w=0.2,n=4,a=.01,g=3/4,l=7,t=0,os=[],gs=[],ts=[]} = {},
) {
  let lrpan = [Math.max(0.5-w,0), Math.min(0.5+w,1)]
  const voices = []
  if (os.length > 0) { n = os.length-1 } // override n if os is not empty
  let sign = +1  
  for (let i=0; i<=n; i++) {
    let panning = lrpan[i%2]
    let layer = pat.add(ts[i]||0).s(os[i]||sound).FX(gain(gs[i]||g)) // construct base layer
    if (i > 0) { layer = layer.pan(panning) } // subsequent layers
    if (t > 0) { layer = layer.late(t*i) } // add optional time offset
    if (v > 0) { layer = layer.vib(v*r**i).vmod(sign*d*r**i) } // vibs, alt between inc/dec detune
    voices.push(layer)
    sign = -sign    
  }
  return stack(...voices)
    .attack(a).lpf(2**(l+5)).postgain(1/((n+1)**0.2))
}
// register as a method
register('supersynth', (param, x)=> {
  const aliases = {
    depth:'d',detune:'d',vib:'v',vibrato:'v',ratio:'r',
    detuner:'r',stereo:'w',width:'w',voices:'n',
    att:'a',attack:'a',gain:'g',lp:'l',lowpass:'l',late:'t',off:'t',shift:'t',
    oscs:'os',osc:'os',gains:'gs',oscgains:'gs',transposes:'ts',noteadd:'ts',
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
    return supersynth(x, param[0], {osc: param})
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
