// @title Entanglement
// @details "Sometimes we all are just entangled together in this world..."
// @by Waveflower Gooi
// @url https://music.waveflower.org
// @license CC BY-NC-SA

samples('http://localhost:5432')
const C_MAJOR_JI_MAP = {  C2: 0,      C: 0,      C3: 0,      C4: 0,  D2: +0.039, D: +0.039, D3: +0.039, D4: +0.039,  E1: -0.137, E2: -0.137, E: -0.137, E3: -0.069, E4: -0.137,  F1: -0.02, F2: -0.02,  F: -0.02,  F3: -0.02,  F4: -0.02,  G1: +0.02, G2: +0.02,  G: +0.02,  G3: +0.02,  G4: +0.02,  A1: -0.156, A2: -0.156, A: -0.156, A3: -0.156, A4: -0.156,  B1: -0.117, B2: -0.117, B: -0.117, B3: -0.117, B4: -0.117,}
window.just = function(seq) {  return seq.note().add(note(0)).transpose(seq.pick(C_MAJOR_JI_MAP));}
const at = (min,max,c=16)=> min < max ? saw.rangex(min,max).slow(c) : saw.rev().rangex(max,min).slow(c)
register('lpfAt', (min, max, c, p) => p.lpf(at(min, max, c)));
register('gainAt', (min, max, c, p) => p.gain(at(min, max, c)));
setcpm(80/4)

ENV.lineColorStart = 'oklch(.55 .2 300)'
ENV.lineWidthStart = 3
ENV.lineWidthEnd = 3
ENV.blurFactor = 1
ENV.hueOffsets = -110

const opt= {height:100,width:750,thickness:7}

$:just(cat(
  "[C2, C, G]@3  [D2, D3, F4]",
  "[A1, A2, E4]@3 [G2, D3, B3]",
  "[C2, C, E4, G]@3  [D2, D3, F4, A]",
  "[A1, A2, E, C4]@3 [G2, D3, B2, D]",
))
.dec(1).sus(1).s("supersaw").unison(2).detune(1/12).gainAt(1/3,1/4,16)
.lpfAt(60,3200,16).lpe(2).lpq(0).hpf(40)
.color('oklch(.7 .2 255)')._scope(opt)
const melody = cat(
  "E C E C E C F C",
  "E C E C E C D G2",
  "E C E C E C F C",
  "E C E C E C G B2",
  "E C E C E C F C",
  "E C E C E C D G2",
  "G2 C G2 C G2 C G F",
  "C G C G C G C4 B",

  "C4 G C4 G C4 G F G",
  "C4 G C4 G C4 G C4 B",
  "C4 G C4 G C4 G B C4",
  "C4 G C4 G C4 G D4 C4",
  "C4 G C4 G C4 G F G",
  "C4 G C4 G C4 G C4 B",
  "C4 G C4 G C4 G B C4",
  "C4 G C4 G C4 [G B] D4 C4", 
)
$:stack(
  just(melody).s("square").vel(2/3),
  just(melody).s("square").vib(4).vibmod(1/4).pan(0).add(note(24)).vel(2/3),
  just(melody).s("square").vib(4).vibmod(1/3).pan(1).add(note(12)),
).att(1/32).color('oklch(.7 .2 160)')
  .room(1/2).size(9).delay(1/2)
  .decay(1).sustain(2).dur(1/7)
  .lpfAt(2400,12000,16)
  .postgain(1/3)._scope(opt)

