// @title Entanglement
// @by Waveflower Gooi, (feat. Glossing)
// @url waveflower.org/assets/entanglement.strudel.js
// @details A song about how we all are connected in ways we cannot imagine; 
//          Even in the midst of loss, confusion or stagnation, we can somehow find hope in one another
// @license CC BY-NC-SA
//  ___ _  _ _____ _   _  _  ___ _    ___ __  __ ___ _  _ _____
// | __| \| |_   _/_\ | \| |/ __| |  | __|  \/  | __| \| |_   _|
// | _|| .` | | |/ _ \| .` | (_ | |__| _|| |\/| | _|| .` | | |(╲  __
// |___|_|\_| |_/_/ \_\_|\_|\___|____|___|_|  |_|___|_|\_| |_|_╲|/_/
//                                                           /_/|╲ 
// @fraggedBy Glossing                                           ╲)
// @re-fraggedBy Waveflower Gooi
// @dedicatedTo Glossing & the live-coding community

await import('https://glossing.dev/scripts.js')
await import('https://waveflower.org/pre.js')
useWet({amount:1.5,letterSpacing:-1,commentColor:'#FFFFFF09',gutterColor:'#FFF9',brightness:.9})
setcpm(120 / 4)
ENV.scaleRadius = 2; ENV.lineWidthEnd = 3; ENV.lineWidthStart = 3; ENV.blurFactor = 1; ENV.hueOffsets = 45
const opt= {height:20,width:800,thickness:4,scale:1.5}

$PADS_END: just(`<
[C2, C, G]@4
[G1, G2]@4
[F1, F2]@4
[C1, C2, C3]@4
>*2`).vel(`<1@4 2.1@4 1.8@4 1.1@4>*2`)
.s("supersaw")
.detune(1/9).unison(2).spread(1)
.sus(4/3).rel(1/2).att(1/3).color('blue')
.lpfAt(1800,4800,32).lfo({s:1/12,depthabs:4000,shape:0})
.lpe(1).lpq(1/2).compressor(-12).pg(3/8)//._scope(opt)

const chrd = cat(
  "[C2, C, G]@3     [D2, F3, D4]",  "[A1, A2, A3]@3    [G1, G2, B3]",
  "[C2, C, E4, G]@3 [D2, F, D, A]", "[A1, A2, E, C]@3  [G2, D3, B2, D3]",
  "[C2, C, G]@3     [D2, D3, F4]",  "[A1, A2, C, E4]@3 [G2, D3, B3]",
  "[C2, C, E4, G]@3 [D2, F, D, A]", "[A1, A2, C, E]@3  [G1, G2, G, B2]",  
)
const interlude = cat(
  "[A2, A3, E3]@3     [E2, E3, G3]",    "[F1, F2, C3, F3]@3 [G1, G2, D3]",
  "[A2, A3, E3, E4]@3 [E2, G2, E3, G3]","[F2, A3, C3, F3]@3 [G2, G3, B3]",
  "[A2, A3, C2]@3     [E2, E3, G3]",    "[F1, F2, A2, F3]@3 [G2, D3, B3]",
  "[C2, C, E4, G]@3   [E2, E3, G3, B3]","[A3, C3, F3]@3 [G1, G2, G3, B2]",
)

$PADS: just(chrd).vel(
  "<1.2 1 .9 .9>"
)
.sus(4/3).rel(1/4).s("supersaw").unison(2).detune(1/77).spread(1)
.lpfTri(300,6400,32).lpe(1).lpq(0).compressor(-14).hpf(40).pg(1/4)
.color('oklch(.7 .2 255)').o(7)._scope(opt)
const m1 = cat(
  "E C E C E C F C",   "E C E C E C D G2",
  "E C E C E C F C",   "E C E C E C G B2",
  "E C E C E C F C",   "E C E C E C D G2",
  "G2 C G2 C G2 C G F", "C G C G C G C4 B"
)
const m2 = cat(
  "C4 G C4 G C4 G F G",  "C4 G C4 G C4 G C4 B",
  "C4 G C4 G C4 G B C4", "C4 G C4 G C4 [G C4] D4 C4",  
  "C4 G C4 G C4 G F G",  "C4 G C4 G C4 G C4 B",
  "C4 G C4 G C4 G B C4", "C4 E4 C4 G4 F4 E4 G4 C4",
)
const i1 = cat(
  "C4 G B C4 C4 [G C4] D4 C4", "C4 [F G] B C4 C4 [C4 D4] C4 B",
  "C4 G B C4 C4 [G C4] D4 C4", "C4 G B [C4 D4] E4 D4 C4 B",  
  "C4 G B C4 C4 [G C4] D4 C4", "C4 G B C4 C4 [C4 D4] C4 B",
  "C4 G B C4 C4 [G C4] D4 C4", "C4 G B [C4 D4] E4 F4 E4 D4",
)
const iarp = cat(
  "[A2 E3 C4]!3 [E2 E G]", "[F2 C3 F3]!3 [G2 B2 C]",
  "[A2 E3 C4]!3 [E2 E G]", "[F2 C3 F3]!3 [G2 B2 D]",
  "[A2 E3 C4]!3 [E2 E G]", "[F2 C3 F3]!3 [G2 B2 C]",
  "[G2 C3 G3]!3 [E2 E C]", "[F2 C3 F3]!3 [G2 D G]",
)

$TRIANGLE: 
  just(iarp).s("tri").add(note("12")).pan(0)
.off(1/128, x=>x.add(note("0")).pan(2/3).color('oklch(.7 .2 0)')._scope(opt))
.att(1/64).room(1/4)
.lpfTri(3200,14400,32)  
.postgain(1/2).diode(1)
.color('oklch(.7 .2 200)')

let notes = m2
$SUPERSQUARE:stack(
  just(notes).s("square").vel(1),
  just(notes).s("square").vib(2).vibmod(1/12).pan(1).add(note(12)).vel(3/4),
  just(notes).s("square").vib(4).vibmod(1/4).pan(2/3).add(note(24)).vel(1/2),  
).att(1/32).color('oklch(.7 .2 160)')
  .room(1/4).size(7).delay(1/4)
  .decay(1).sustain(2).rel(1/8)
  .lpfTri(1600,20000,32).pan("[.9 .67]*4").gain("[1 .8]*4").delayfb(0.6)
  .postgain(3/8)._scope(opt)
const bm = `<
  G1@3 F1 A1@3 B1 C2@3 F1 A1@3 B1
  C2@3 D2 A1@3 B1 C2@3 D2 C2@3 B1                        
>*4`

const bi = `<
  A1@3 E1 F1@3 G1 A2@3 E1 F1@3 G1
  A2@3 E2 F2@3 G1 C2@3 E2 F2@3 B1  
>*4`

$GLOSSING_FATBASS: just(bm).s("saw").hpf(270).pan(1/2)
  .lpfTri(700,3200,32).diode(1).compressor(-20)//.seg(16).dur(1/24)
  .add(stack(note("0"), note("12.1").gain(0.2))).color('red')
  .postgain(1/2).glide(0.1).o(5)._scope(opt)

$PSYKICKS: s("[bd:2:.1,bd:5]*4").set.out(`<1 1 1 1>*4`).lpf(660).pg(3/4)
  .fit().clip(1/5).hpf(60)
  .duck("5:7").duckatt(".3:.4").duckdepth(".9:.9")
  .mask("<1@7 0 1@7 0>").pg(5/8)

$CLAPS: s("[cp,white]").struct(`<
~ x ~ x ~ x ~ x
~ x ~ x ~ x ~ [x ~ x x] 
>*4`)
.lpfTri(1200,4000,32).mask("<1 1>/8").pan(2/3).pg(1/4)

$GLOSSING_OHH: s("[~ oh]*4").crush(7).vel(rand.range(0.77, 1))
  .pan(.8)
  .hpf(3200).almostNever(ply(2)).clip(rand.seed(2).range(0.6, 1)).rib(28, 2).pg(2/3)
  .mask("<0 1 1 1>/8")

$HH: s("oh").struct(`<
x [x x] x [x  x   ]
x  x    x [x [x x]]
>`).vel(`<
1 [.8 1] 1 [1  .8    ]
1  .8    1 [1 [.7 .8]]
>`).clip(1/5).pg(1.1)
  .fast(8).crush(5).pan(.2).lpfTri(1400,3200,32).hpf(1200)

S$GLOSSING_HIGHSAW: s("sawtooth").set.out(`<
 -1@6 4@6 3@4 
 -1@6 2@6 -2@4 
  4@6 5@4 
  -2@6 2@6 0 ~ 
  4@2 5@3 -3@3
>*8`.as("note")).scale("A4:minor").add(note("0,0.33")).room(0.8).delay(0.2)
  .dry(0.6).gain(0).lfo({ da: 1, dc: 0, sh: 'saw', s: 16})
  .compressor(-10).hpf(700).lpf(saw.slow(8).range(1200, 3600)).lpa(0.1).lpe(2)
  .mask("<1 1@2 1 1@2>/8").pg(.7).clip(saw.slow(8).range(1, 2)).add(note(rand.mul(0.1)))
  .pan(perlin.seed(3).slow(4).range(0.1, 0.6)).pg(1/2).o(5).color('oklch(.88 .2 0)')._scope(opt)
