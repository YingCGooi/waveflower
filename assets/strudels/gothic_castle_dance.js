// @title Gothic Castle Dance
// @by Waveflower Gooi

samples({
  tick: 'cactus/dyad/CACTUS_DYAD_ONESHOT.mp3',
  short: 'cactus/perc/CACTUS_PERC_14_ONESHOT.mp3',
  uplifter: 'fl/uplifter1.wav',
  downlifter: 'fl/dnlifter1.wav',
  chimes2: 'fl/windchimes/windchimes2.wav',
  chimes3: 'fl/windchimes/windchimes3.wav',
  chimes4: 'fl/windchimes/windchimes4.wav',
  magic: 'fl/magic_chimes.wav',
  takeoff: 'TakeOff.wav',
}, 'https://waveflower.org/samples/');

await import('https://waveflower.org/pre.js')
const triAt = (min,max,c=16)=> min < max ? tri.rangex(min,max).slow(c) : tri.rev().rangex(max,min).slow(c)
register('bpfTri', (min, max, c, p) => p.bpf(triAt(min, max, c)));
register('bpfAt', (min, max, c, p) => p.bpf(at(min, max, c)));
register('cyan', p => p.color('oklch(.5 .17 220 / .3)'))
register('teal', p => p.color('oklch(.7 .2 200)'))
register('magenta', p => p.color('oklch(.77 .1 0)'))
register('gold', p=>p.color('oklch(.7 .2 80)'))
register('transcyan',p=>p.color('oklch(.67 .2 240 / .1)'))
register('violet', p=>p.color('oklch(.4 .2 300)'))
register('yellow', p=>p.color('oklch(.9 .2 80)'))

const o = {height:20,scale:8}
let opts = {
  customlabels: ['I', 'I#', 'II', 'II#', 
    'III', 'VI', 'VI#', 'V', 
    'V#', 'VI', 'VI#', 'VII'],
  root: 'D',
  exponential: true,
  mode: 'flakygon',
  thickness: 200,
  glow: 64,
  labels: 'numbers',
  textsize: 1.1,
  edolabel: 3/4,
  dotsize: 9,
  dotalpha: 1/2,
  circle: 8,
  distance: 1.1,
  linejoin: 'round',
  lineoctavediv: 4,
  margin: 270,
}

setcpm(83)

// ENV ||= {}
// ENV.scaleRadius = 6
// ENV.lineWidthStart = 4
// ENV.lineWidthEnd = 3
// ENV.lineColorStart = 'oklch(.4 .2 270)'
// ENV.lineColorEnd = 'oklch(.8 .2 220)'
// ENV.hueOffsets = 55
// ENV.blurFactor = .7

useWet({commentColor: '#444', glow:0, amount:2})

const PAD = (p,n) => chord(p).n(n).mode("root").anchor("A3").voicing()
  .s("gm_pad_warm").pan(0).add(note(2)).vel(1)
  .off(1/89,x=>x.s("gm_pad_sweep:4").transpose(-.1).pan(1).vel(1))
  .off(1/77,x=>x.s("triangle").transpose(.24).vel(1/2).pan(2/3).lfo({c:'pan',s:1/4,da:1}))
  .att(1/5).dec(3).rel(1/2).postgain(1/21)
  .compressor("-20:10:20:.001:.03")
  .hpf(420).rel(1/5)
  .off(0, x=>x.hpf(1).bpf(160).vel(2/3))

const GLOCK = (p) => note(p).fast(3).add(note(14))
.s("vibraphone:3:.2,gm_vibraphone:5:.2,gm_glockenspiel:4:1,handbells:1").vel(1/3)
.pan(`<.8 .9 1>`.fast(3)).hpf(990)
.sus(1/3).dec(1/2)
.off(0, x=>x.bpf(12800))
.postgain(3/5).pitchwheel(opts)

const BELLS = (p, lp=6400) => note(p).fast(3).add(note(14))
.s("xylophone_hard_ff").vel(1/4).pan(1/7)
.off(1/64, x=>x.s("gm_glockenspiel:4,gm_glockenspiel:1:.33")
  .set.mix(pan(".1 .2 .3").vel(".7 .5 .4")).hpf(200).lpf(lp)
  .compressor("-20:10:10:.001:.03")
)
.room(1/7).size(7).roomlp(1440).roomfade(1/16).roomdim(440)
.rel(1/7)
.postgain(1/6).pitchwheel(opts)

const HARP = (p) => stack(p.fast(3).add(note(2))
  .s("gm_orchestral_harp:1").pan(0).vel(1).hpf(1800)
  .off(0,x=>x.s("gm_synth_strings_2:1,gm_pizzicato_strings:1:.2")
    .hpf(1).bpf(990).sus(1/7).dec(1/16).vel(1).pan(1/2))
  .off(0,x=>x.s("gm_kalimba:6").add(note(12)).bpf(6400).vel(1/4))
  .off(1/32,x=>x.s("gm_orchestral_harp:4").vel(2/3).pan(2/3))
  .lpf(12800).lpe(2).bus(7).dry(0).pitchwheel(opts),
  s("bus:7").room(3/4).compressor("-20:10:10:.001:.03").postgain(1/9),
)

const SQUARE = (melody) => stack(note(melody.fast(3)).add(note(2))
.att(1/64).rel(1/8).sus(2/3).dec(1/8).gain(2/3)
.hpf(440)                             
.off(0, x=>x.s("square").fm(5).add(note(12.19)).vel(1/2).pan(1/3))
.off(1/84, x=>x.s("square").fm(8).add(note(12.1)).vel(1/2).pan(1))                                 
.color('oklch(.7 .2 210)')
.postgain(1/6).bus(9).dry(0),
  s("bus:9").lpf(11000).diode("2:.17")
).pitchwheel(opts)

const MELODY = (p) => note(p.fast(3)).add(note(14))
.s("tri").pan(1/2)
.vel(1/2).pan(".4 .6 .8")
.off(0,x=>x.s("gm_violin:3").add(note(0)).pan(1/2).vel(2/3))
.off(0,x=>x.s("gm_violin:1:.7").add(note(12)).pan(1/2).vel(2/3))
.att(1/256).dec(3/2)
.hpf(660)
.compressor("-20:20:20:.002:.02")
.postgain(1/7)
.delay(1/4).delaysync(1/4).pitchwheel(opts)

const LOW = (p) => p.note()
.s("gm_piano:4:.3").pan(1/7).rel(1/4)
.add(note(2))
.hpf(110).diode("2.4:.1")
.lpf(330).orbit(4)
.off(1/84,x=>x.s("gm_piano:25").pan(6/7))
.off(0,x=>x.bpf(1700).lpf(20000).vel(1/4))
.off(0,x=>x.bpf(6400).lpf(20000).vel(1/5))
.postgain(.9).orbit(4).pitchwheel(opts)

const ORGAN = (p) => p.note().add(note(2+12))
.s("gm_drawbar_organ").pan(0)
.off(1/64, x=>x.s("gm_drawbar_organ:4").pan(1).vel(2/3))
.hpf(55)
.postgain(1/2).orbit(4)

const FAT = (p, lfoDepth=6400) => p.note().add(note(2)).color('oklch(.8 .2 270)')
.off(0, x=>x.s("sawtooth").distort(2/3).distorttype("chebyshev").sub(note(12)).lpf(20000).bpf(5400).pan(0).vel(1/4))
.off(1/64, x=>x.s("sawtooth").distort(3/4).lpf(20000).bpf(8400).pan(1).vel(1/4))
.lfo({c:"bpf",s:3,da:8400})._spectrum()
.postgain(1/2)

const PIZZ = (p) => p.note().fast(3).add(note(2-12))
.s("gm_pizzicato_strings").vel(1/3)
.set.mix(pan(".3 .4 .5")).hpf(330).lpf(770)
.off(0, x=>x.add(note(12)).vel(1))
.att(0).dec(1/3).sus(1/3)
.off(1/84, x=>x.s("gm_pizzicato_strings:4")
  .add(note(12))
  .set.mix(pan(".7 .9 1"))
  .vel(.7).hpf(330).lpf(9600)
).gain(".6 .4 .3").pitchwheel(opts)

const triplets = `<
x ~ ~ 
x <x ~> <~ [x x]>
x ~ ~
x <x ~> <~ x ~ [~ x]>
>`
const fourOnTheFloor = `<
x ~ x
~ x ~
x ~ x
~ x <x [x x]>
>`

const CHIMESDOWN = s("chimes2").slow(2)
.postgain(1/2).room(2/3).size(7).hpf(770).lpf(16000)

const CHIMESUP = s("chimes3").mask("<0@15 1 0@99>")
.postgain(1/11).room(1).size(7).hpf(550).lpf(8400)

const CHIMES = s("chimes4").mask("<1 0@99>")
.postgain(1/7).room(2/3).size(7).hpf(550).lpf(14400)

const MAGIC = s("magic").postgain(1/4).slow(4)
const TAKEOFF = s("takeoff").hpf(2400).lpf(9600).pan(0)
.off(1/84, x=>x.hpf(3200).pan(1)).postgain(1/5)

const KICK = s("mc303_bd:0").struct(triplets).fast(3).hpf(77)
.off(0,x=>x.s("bossdr550_rd:1,ry30_rd:2:.3").vel(1/4).hpf(7700).lpf(6400))
.dec(1/16)
.sus(1/16)
.postgain(2/5).pan(1/2).lpf(3200)
.duckorbit(4).duckdepth(2/3).duckatt(1/5)

const CLAP = s("alesissr16_sd,alesissr16_sd:9").struct(`<
~ ~ x
~ x [~ x]
~ ~ x
~ x <~ [x x]>
>`.fast(3)).postgain(1/7)
.off(0,x=>x.bpf(4800).room(2).vel(1/2))

const TICK = s("tick").struct(`<
x [x x] [x ~] 
x [~ x] [<~ x> x]
x [x x] [x ~]
x [~ x] [x [x x]]
>`).vel(`<
1 [.5 .3] [.6 .3]
>`).pan(`<
.7 [.8 .9] [.8 .9]
>`).fast(3).hpf(1100).postgain(3/4)
.off(0,x=>x.bpf(4000).vel(1))

const HH = s("hh:4,circuitstom_hh:0:.3").struct(`<
x [x x] ~
x ~ [x x]
x [x x] ~
x  x [x [x x]]
>`).vel(`<
.3 [1 .5] [.7 .5]
>`).pan(`<
.4 [.3 .6] [.3 .6]
>`).fast(3).crush(7).coarse(2)
.dec(1/11).rel(0)
.lpf(12800).hpf(6200)
.diode("3:.1").postgain(1/9)

const chrd = `<Am@2 F2 C2  Am@2 F C2  Am@2 G2 C  <Am F2>@2 <Em7 G2> <F2 Am F2 C>>`.cyan()
const b1 = `<
A2 A3 C4 E3 C4 E4  F2 F3 C4 C3 E3 G3
A2 E3 A3 C4 A3 E3  F3 A3 C4 C3 G3 C4
A2 E3 A3 C4 A3 E3  G3 B3 D4 C3 E3 G3
<[A2 C3 E3 A3 C4 E4] [F2 C3 F3 C4 A3 F3]>@6
<[E3 G3 B3 F3 A3 C4] [G3 B3 D4 A4 E4 C4]
[E3 B3 E4 F3 A3 C4] [G3 B3 D4 C3 E3 G3]>@6
>`.teal()

const m1 = `<
E@3 E C E F@3 E@3
E@3 C@2 G F@3 E@2 C
E@3 E C E D@3 E@3
C@3 <E2 F2> <G2 G2 G2 G3> <C C C E> <B2 D>@3 C@3
>`.magenta()

const plucklets = `<
A3 A4 A3 E3 A3 C4        F2 F3 F4 C2 E3 G3
A2 A3 A4 C4 [E3 A3] C4   F2 F3 F4 C3 E3 [G3 B3]
A3 A4 A3 C3 A3 E4        G2 G3 G4 C2 E3 G3
<[A2 A3 A4 E3 A3 [A4 C4]] [F2 F3 F4 A4 F4 C4]>@6
<[E2 B3 E4 F3 A3 F4] [G2 G3 G4 A2 C3 A3]
 [E2 B3 E4 F3 A3 F4] [G3 B3 G4 C3 E3 G3]>@6
>`.gold()

const bass = `<
A1@2 F1 C1
A1@2 F1 [C1@2 B1]
A1@2 G1 [C1@2 G1]
<A1 F1>@2 <E1 G1> <F1 [A1@2 B1] F1 C2>
>`.violet()

const impact = `<
~ ~ A4      ~ ~ <C5 E4>      ~ ~ F4      ~ ~ C4
~ ~ A4      ~ ~ E5      ~ ~ F5      ~ ~ C5
~ ~ <A4 E5> ~ ~ C5      ~ ~ G4      ~ ~ C4
~ ~ <A4 F4> ~ ~ <E5 A4> ~ ~ <B4 G4> ~ ~ <F4 A4 F5 C5>
>`.as("note:vel").yellow()
opts.margin = 600
arrange(
  [64, TAKEOFF],
  // [32, stack(CHIMES, CHIMESUP,
  //   PAD(chrd,"<[0,1,2]@4 [0,1,2]@2 <[0,1,2] [0,1,2,3]> [0,1,2] [0,1,2]@4 [0,1,2]@3 [0,1]>").lpfAt(550,3200,32),
  //   BELLS(b1,330).lpfAt(330,1800,32),
  //   GLOCK(b1).lpfAt(660,2400,32).mask("<0@16 1@16>"),
  //   HARP(impact).lpfAt(1270,9600,48),
  // )],
  [64, stack(
    CHIMESDOWN.mask("<0@32 1@8 0@99>").lpfAt(20000,4800,8).gainAt(1,1/20,8),
    PAD(chrd,"<[0,1,2]@4 [0,1,2]@2 [0,1,2,3] [0,1,2] [0,1,2]@4 [0,1,2]@3 [0,1]>").lpfAt(2880,770,64),
    PIZZ(plucklets).lpfAt(770, 14400, 64),
    BELLS(b1,1210).lpfAt(1440,1220,64),
    LOW(bass).mask("<0@16 1@48>").lpfTri(1440,4400,64),
    GLOCK(m1).add(note(12)).hpf(770).lpfTri(1670,4800,64).mask("<1@32 0@32>"),
    GLOCK(b1).hpf(770).lpfTri(1670,4800,64).mask("<0@32 1@32>"),    
    HARP(impact).lpf(8400).mask("<0@32 1@32>"),
    MELODY(m1).lpfAt(330,2900,64).mask("<0@32 1@32>"),
    ORGAN(bass).mask("<0@32 1@32>"),
    TICK.mask("<0@32 1@32>"),
  )],
  [32, stack(CHIMESDOWN.mask("<1 0@15>").lpfAt(20000,4800,8).gainAt(1,1/20,8), 
    TAKEOFF.mask("<0@9 1 0@99>"),
    PAD(chrd,"<[0,1,2]@4 [0,1,2]@2 [0,1,2,3] [0,1,2] [0,1,2]@4 [0,1,2]@3 [0,1]>").lpfAt(770,440,32),
    SQUARE(m1).lpfAt(440,9600,32).mask("<0@16 1@16>"),
    MELODY(m1).lpfAt(2800,2400,32),
    PIZZ(plucklets).lpfAt(770, 14400, 32),             
    HARP(impact).lpfAt(1270,440.,48),
    LOW(bass).hpf(170).lpf(4400),
    BELLS(b1,1670).lpfAt(1220,1670,32),
    KICK, TICK, HH.lpfAt(770,12800,32), CLAP.mask("<0@16 1@16>"),
  )],
  [32, stack(CHIMESUP.mask("<1 0@31>"),
    PAD(chrd,"<[0,1,2]@4 [0,1,2]@2 [0,1,2,3] [0,1,2] [0,1,2]@4 [0,1,2]@3 [0,1]>").lpfAt(440,880,32),             
    SQUARE(m1).lpfAt(9600,4800,64),
    MELODY(m1).lpfAt(2400,1800,64),
    HARP(impact).lpf(12800),
    PIZZ(plucklets).lpf(14400),
    BELLS(b1,1670).lpfAt(990,1670,64), 
    GLOCK(b1).lpf(6400).mask("<1@16 0@48>"),
    LOW(bass).hpf(160).lpf(4400).mask("<0@16 1@48>"),             
    ORGAN(bass).lpfAt(4400,3300,64),
    KICK, TICK, HH, CLAP,
  )],
  [8, stack(CHIMESUP.mask("<1 0@31>"),
    PAD(chrd,"<[0,1,2]@4 [0,1,2]@2 [0,1,2,3] [0,1,2] [0,1,2]@4 [0,1,2]@3 [0,1]>").early(56).lpfAt(880,2800,4),
    SQUARE(m1).lpfAt(880,440,64).early(24),
    MELODY(m1).lpfAt(2800,770,64).early(24),
    HARP(impact).lpf(12800).early(56),
    PIZZ(plucklets).lpfAt(6400,2400,8).early(56),
    BELLS(b1,1670).lpfAt(1670,990,8).early(56), 
    GLOCK(b1).lpfAt(4800,3200,8).early(56),
    TICK, CLAP,
  )],
  [4, stack(
    PAD(chrd,"<[0,1,2]@4 [0,1,2]@2 [0,1,2,3] [0,1,2] [0,1,2]@4 [0,1,2]@3 [0,1]>").early(60).lpfAt(2800,1440,4),
    GLOCK(b1).lpfAt(3200,1670,4).early(56),
  )],
  [4, stack(
    PAD(chrd,"<[0,1,2]@4 [0,1,2]@2 [0,1,2,3] [0,1,2] [0,1,2]@4 [0,1,2]@3 [0,1]>").early(60).lpfAt(1670,770,4),
    GLOCK(b1).lpfAt(3200,1670,4).early(56),
  )]
)
// ._pianoroll({
//   height:800, width:300, playhead:7/8,
//   flipTime:0,vertical:1,autorange:1,fold:1,
//   playheadColor:'#0000',overscan:4,
//   cycles:16, smear:0,fill:1,fillActive:0,stroke:1}
// )




















