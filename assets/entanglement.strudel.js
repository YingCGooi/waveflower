// @title Entanglement
// @by Waveflower Gooi
// @license CC BY-NC-SA
// @fraggedBy Glossing
// @re-fraggedBy Waveflower Gooi

await import('https://glossing.dev/scripts.js')
await import('https://waveflower.org/pre.js')
useWet({amount:2,letterSpacing:-1,commentColor:'#FFFFFF09',gutterColor:'#FFF1'})
const C_MAJOR_JI_MAP = {C1:0,C2:0,C:0,C3:0,C4:0,D2:+0.039,D:+0.039,D3:+0.039,D4:+0.039,E1:-0.137,E2:-0.137,E:-0.137,E3:-0.069,E4:-0.137,F1:-0.02,F2:-0.02,F:-0.02,  F3: -0.02,  F4: -0.02,  G1: +0.02, G2: +0.02,  G: +0.02,  G3: +0.02,  G4: +0.02,  A1: -0.156, A2: -0.156, A: -0.156, A3: -0.156, A4: -0.156,  B1: -0.117, B2: -0.117, B: -0.117, B3: -0.117, B4: -0.117,}
window.just = function(seq) {  return seq.note().add(note(0)).transpose(seq.pick(C_MAJOR_JI_MAP));}
const triAt = (min,max,c=16)=> min < max ? tri.rangex(min,max).slow(c) : tri.rev().rangex(max,min).slow(c)
register('lpfTri', (min, max, c, p) => p.lpf(triAt(min, max, c)));
setcpm(124 / 4)

const opt= {height:100,width:750,thickness:7}
all(x=>x.pianoroll({vertical:true}))

S$PADS_END: just(`<
[C2, C, E4]@4 [C1, C2, E4, G]@4
[C1, C2, C3]@8
>*2`)
.s("supersaw").seg(4).unison(2).detune(1/7).dec(1).sus(1)
.lpfTri(160,3200,8).lpe(1).lpq(1/2).compressor(-10).hpf(40).pg(1/2)

$PADS: just(cat(
  "[G2, C, G]@3  [D2, D3, F4]",
  "[A1, A2, E4]@3 [G2, D3, B3]",
  "[C2, C, E4, G]@3  [D2, D3, F4, A]",
  "[A1, A2, E, C4]@3 [G2, D3, B2, D]",
)).vel(
  "<1 1 .9 .9>"
)
.dec(1).sus(1).s("supersaw").unison(2).detune(1/7)
.lpfTri(160,3200,32).lpe(1).lpq(1/2).compressor(-10).hpf(40).pg(1/2)
.color('oklch(.6 .2 255)').o(7)._scope(opt)
const melody = cat(
  "E C E C E C F C",   "E C E C E C D G2",
  "E C E C E C F C",   "E C E C E C G B2",
  "E C E C E C F C",   "E C E C E C D G2",
  "G2 C G2 C G2 C G F","C G C G C G C4 B",

  "E C E C E C F C",   "E C E C E C D G2",
  "E C E C E C F C",   "E C E C E C G B2",
  "E C E C E C F C",   "E C E C E C D G2",
  "G2 C G2 C G2 C G F","C G C G C G C4 B",  

  "C4 G C4 G C4 G F G", "C4 G C4 G C4 G C4 B",
  "C4 G C4 G C4 G B C4","C4 G C4 G C4 [G C4] D4 C4",  
  "C4 G C4 G C4 G F G", "C4 G C4 G C4 G C4 B",
  "C4 G C4 G C4 G B C4", "C4 E4 C4 G4 F4 E4 G4 C4",
)
$MELODY:stack(
  just(melody).s("square").vel(2/3),
  just(melody).s("square").vib(4).vibmod(1/4).pan(0).add(note(24)).vel(2/3),
  just(melody).s("square").vib(4).vibmod(1/3).pan(1).add(note(12)),
).att(1/32).color('oklch(.7 .2 160)')
  .room(1/4).size(7).delay(1/4)
  .decay(1).sustain(2).dur(1/8).hpf(200)
  .lpfTri(1600,14400,16).pan("[.9 .4]*4").gain("[1 .8]*4").delayfb(0.6)
  .postgain(1/2)._scope(opt)

$TEETH: s("sawtooth").set.out(`<
 -1@6 4@6 3@4 
 -1@6 2@6 -2@4 
  4@6 5@4 
  4@6 2@6 0 ~ 
  4@2 5@3 -3@3
>*8`.as("note")).scale("A4:minor").add(note("0,0.33")).room(0.8).delay(0.2)
  .dry(0.6).gain(0).lfo({ da: 1, dc: 0, sh: 'saw', s: 16})
  .compressor(-10).hpf(800).lpf(saw.slow(8).range(900, 3200)).lpa(0.1).lpe(2)
  .mask("<0 1@2 0 1@2>/8").pg(.7).clip(saw.slow(8).range(1, 2)).add(note(rand.mul(0.1)))
  .pan(perlin.seed(3).slow(4).range(0, 0.5)).pg(1/2).o(5).color('oklch(.88 .2 100)')._scope(opt)

$FATBASS: just(`<
  G1@3 F1 A1@3 B1 C2@3 F1 A1@3 B1
  C2@3 D2 A1@3 B1 C2@3 D2 C2@3 B1                        
>*4`).s("saw").hpf(300)
  .lpfTri(300,1600,32).diode(0.8).compressor(-20)
  .add(stack(note("0"), note("12.1").gain(0.2)))
  .postgain(2/3).glide(0.2).o(5)._scope()

$KICKS: s("bd:5*4").set.out(`<1 1 1 1>*4`).lpf(660).pg(2/3)
  .fit().clip(1/5)
  .duck("5:7").duckatt(".3:.4").duckdepth(".9:.9")
  .mask("<1@7 0 1@8>").pg(2/3)
$CLAPS: s("[cp,white]").struct(`<
  ~ x ~ x
  ~ x ~ x
  ~ x ~ x
  ~ x ~ [x ~ x x]
>*4`).lpfTri(800,4000,32).mask("<1 1>/8").pan(2/3).pg(1/3)
$OHH: s("[~ oh]*4").crush(7).vel(rand.range(0.77, 1))
  .pan(.7)
  .hpf(3200).almostNever(ply(2)).clip(rand.seed(2).range(0.6, 1)).rib(28, 2).pg(1/2)
  .mask("<0 1>/8")
$HH: s("oh").struct(`<
x [x x] x [x  x   ]
x  x    x [x [x x]]
>`).vel(`<
1 [.8 1] 1 [1  .8    ]
1  .8    1 [1 [.7 .8]]
>`).clip(1/5).pg(1)
  .fast(8).crush(5).pan(.2).lpfTri(800,2800,32).hpf(1200)
