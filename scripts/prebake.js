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
