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
  handpan: 'handpan_root.wav',
}, 'https://waveflower.org/samples/');
setcpm(77)
await import('https://waveflower.org/pre.js')
const triAt = (min,max,c=16)=> min < max ? tri.rangex(min,max).slow(c) : tri.rev().rangex(max,min).slow(c)
register('bpfTri', (min, max, c, p) => p.bpf(triAt(min, max, c)));
register('bpfAt', (min, max, c, p) => p.bpf(at(min, max, c)));
register('transyellow', p => p.color('oklch(.7 .14 70/.3)'))

Pattern.prototype.sophie = function (squish = 0.1, splat = 0.1, speed = 4, clang = 0.8) {
      clang = reify(clang).fmap((v) => clamp(v, 0, 0.999));
      squish = reify(squish).range(0.005, 0.05);
      splat = reify(splat).range(0.001, 0.5);
      
      return this.FX(
        delaytime(squish).lfo({ c:'delaytime', dc: 0, da: splat, s: speed})
    .delay(1).dry(0).delayfb(clang)
  ).fxr(2);
};

const o = {height:20,scale:8}
let opts = {
  customlabels: ['○', ' ', '⚔', ' ', 
    '❤︎', '✧', ' ', '⚝', 
    ' ', '✡', ' ', '☽'],
  root: 'D',
  exponential: true,
  mode: 'flakygon',
  thickness: 256,
  glow: 64,
  labels: 'numbers',
  textsize: 1.33,
  edolabel: 1/11,
  dotsize: 16,
  dotalpha: 1/7,
  circle: 16,
  distance: 1.15,
  linejoin: 'round',
  lineoctavediv: 3,
  margin: 160,
}

useWet({commentColor: '#444', glow:0, amount:2})

const PAD = (p,n,tr=0) => chord(p).n(n).mode("root").anchor("A3").voicing().add(note(2))
  .s("gm_violin:3").pan(1/5).vel(3/2)
  .off(1/77,x=>x.s("gm_violin:12").pan(4/5).transpose(-12).vel(2/3))
  .hpf(220)
  .off(0, x=>x.hpf(1).bpf(127).vel(4))  
  .off(0,x=>x.s("gm_string_ensemble_1:4").hpf(990).pan(0)
    .vib(3).vibmod(1/4).vel(2/3))
  .off(1/77,x=>x.s("gm_string_ensemble_1:4").hpf(990).pan(1)
    .transpose(tr).vel(2/3))
  .att(1/7).dec(2).room(1/7).rel(1/5).postgain(1/36)
  .compressor("-20:17:20:.001:.03").ftype(0)
  
const PIANO = (p, bv=2/3, pv=1/8) => note(p).fast(3).add(note(14))
// .s("vibraphone:3:.2,gm_vibraphone:5:.2,gm_glockenspiel:4:1,handbells:1").vel(1/3)
.s("gm_vibraphone:5:.7,handbells:1").vel(bv)
.pan(`<.9 .95 1>`.fast(3)).hpf(880)
.sus(1/4).room(1/9)
.off(1/32, x=>x.s("piano")
  .pan(`<.3 .4 .5>`.fast(3)).add(note(0))
  .att(0).vel(pv).sus(1/2).dec(1/2).rel(2/3)
  .hpf(340).delay(0)
).postgain(2/3).pitchwheel(opts)

const BELLS = (p, lp=6400) => note(p).fast(3).add(note(14))
.s("xylophone_hard_ff").vel(1/3).pan(1/7)
.off(1/64, x=>x.s("gm_glockenspiel:4")
  .set.mix(pan("0 .1 .2").vel(".8 .6 .5")).hpf(240).lpf(lp)
  .compressor("-20:10:10:.001:.03")
)
.room(1/9).size(7).roomlp(1440).roomfade(1/16).roomdim(440)
.rel(1/7)
.postgain(1/4).pitchwheel(opts)

const HARP = (p) => stack(p.fast(3).add(note(2))
  .s("gm_orchestral_harp:1").pan(0).vel(1).hpf(1800)
  .off(0,x=>x.s("gm_synth_strings_2:1")
    .hpf(1).bpf(990).sus(1/7).dec(1/16).vel(1).pan(1/2))
  .off(0,x=>x.s("gm_kalimba:6").add(note(12)).bpf(6400).vel(1/4))
  .off(1/64,x=>x.s("gm_orchestral_harp:4").vel(3/4).pan(2/3))
  .lpf(12800).lpe(2).bus(7).dry(0),
  s("bus:7").room(3/4).compressor("-20:10:10:.001:.03").postgain(1/3),
)

const SQUARE = (melody) => stack(
melody.fast(3).as("note:gain").add(note(2))
.att(1/64).rel(1/8).sus(2/3).dec(1/8).gain(2/3)
.hpf(440)                             
.off(0, x=>x.s("square").fm(5).add(note(12.19)).vel(1/2).pan(1/3))
.off(1/84, x=>x.s("square").fm(8).add(note(12.1)).vel(1/2).pan(1))                                 
.color('oklch(.7 .2 210)')
.postgain(1/5).bus(9).dry(0),
  s("bus:9").lpf(11000).diode("2:.17")
)

const VIOLIN = (p) => p.fast(3).as("note:gain").add(note(14))
.vel(1/2).pan(".4 .6 .8")
.off(0,x=>x.s("gm_violin:3").add(note(0)).pan(1/2).vel(2/3))
.off(0,x=>x.s("gm_violin:1:.7").add(note(12)).pan(1/2).vel(2/3))
.att(1/256).dec(3/2)
.hpf(660)
.compressor("-20:20:20:.002:.02")
.postgain(1/7)
.delay(1/4).delaysync(1/4).pitchwheel(opts).magenta()

const LOW = (p) => p.note()
.s("gm_piano:4:.3").pan(1/3).rel(0).sus(2/3).dec(1)
.add(note(2))
.hpf(57).diode("2.7:.1")
.lpf(270).orbit(4)
.off(1/84,x=>x.s("gm_piano:25").pan(2/3)) 
.off(0,x=>x.bpf(1670).lpf(20000).vel(1/6))
.off(0,x=>x.bpf(3300).lpf(20000).vel(1/8))
.off(0,x=>x.bpf(6400).lpf(20000).vel(1/9))
.postgain(8/9).orbit(5).pitchwheel(opts)

const ORGAN = (p) => p.note().add(note(2+12))
.s("gm_drawbar_organ").pan(0)
.off(1/64, x=>x.s("gm_drawbar_organ:4").pan(1).vel(2/3))
.hpf(90)
.postgain(2).orbit(4)

const FAT = (p, lfoDepth=6400) => p.note().add(note(2)).color('oklch(.8 .2 270)')
.off(0, x=>x.s("sawtooth").distort(2/3).distorttype("chebyshev").sub(note(12)).lpf(20000).bpf(5400).pan(0).vel(1/4))
.off(1/64, x=>x.s("sawtooth").distort(3/4).lpf(20000).bpf(8400).pan(1).vel(1/4))
.lfo({c:"bpf",s:3,da:8400})._spectrum()
.postgain(1/2)

const PIZZ = (p) => p.note().fast(3).add(note(2-12))
.s("gm_pizzicato_strings").vel(2/5)
.set.mix(pan(".5 .2 .7")).hpf(204).lpf(770)
.off(0, x=>x.add(note(12)).vel(1))
.att(0).dec(1/3).sus(1/3)
.off(1/84, x=>x.s("gm_pizzicato_strings:4")
  .add(note(12))
  .set.mix(pan(".7 .9 1"))
  .vel(.7).hpf(290).lpf(9600)
).gain(".55 .45 .6").pitchwheel(opts)
//.s("vibraphone_soft:0:.3,vibraphone_bowed")
const DING = (p) => stack(
  p.note().add(note(2-17)).rel(0).sus(1/2).dec(1/2)
  .s("handpan").lpf(4400).bus(14),
  s("bus:14").room(1/2).size(9).clip(4)
  .hpf(220).postgain(1/5)
).violet()

const CHIMESDOWN = s("chimes2").slow(2)
.postgain(1/4).room(2/3).size(7).hpf(770).lpf(16000)

const CHIMESUP = s("chimes3")
.postgain(1/7).room(1).size(7).hpf(550).lpf(7200)

const CHIMES = s("chimes4").mask("<1 0@99>")
.postgain(1/7).room(2/3).size(7).hpf(550).lpf(14400)

const MAGIC = s("magic").postgain(1/4).slow(4)
// sophie(squish = 0.1, splat = 0.1, speed = 4, clang = 0.8)
const TAKEOFF = s("takeoff").hpf(2400).lpf(9600).pan(0)
.off(1/84, x=>x.hpf(3200).pan(1)).postgain(1/5)

const WAVESUP = s("white").slow(16).FX(delaytime(.1)
  .lfo({ c:'delaytime', dc: 0, da: .04, s: 16})
  .delay(1/2).dry(0).delayfb(.4)).fxr(2).postgain(1/4)
  .lpf(3300).lfo({c:'lpf',da:14400,s:1/64,sh:2}).hpf(880).lfo({c:'hpf',da:7700,s:1/64,sh:2})
  
const WAVESDOWN = s("white").slow(4).FX(delaytime(.1)
  .lfo({ c:'delaytime', dc: 0, da: .04, s:12}).room(2/3)
  .delay(1/2).dry(0).delayfb(.4)).fxr(2).postgain(1)
  .lpf(4400).lfo({c:'lpf',da:14400,s:1/16,sh:3}).hpf(1200).lfo({c:'hpf',da:3200,s:1/16,sh:3})


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
const KICKPAT = (p)=> s("mc303_bd:0").struct(p).fast(3).hpf(89)
.off(0,x=>x.s("bossdr550_rd:1").vel(2).hpf(7700).lpf(6400))
.dec(1/16)
.sus(1/16)
.postgain(3/5).pan(1/2).lpf(3200)
.duckorbit("4:5").duckdepth("0.67:0.33").duckatt("0.25:0.2")

const KICK = KICKPAT(triplets)
const KICK4 = KICKPAT(fourOnTheFloor)
const HH4 = s("hh:4,circuitstom_hh:0:.3").struct(`<
x [x] x [x x]
x [x x] x [x x]
x [x] x [x [x x]]
x [x x] x [x x]
>`).fast(3).crush(5)
.dec(1/11).rel(0)
.lpf(12800).hpf(6200)
.diode("3:.1").postgain(1/7)

//dr220_oh:0:.2,rolandd110_oh:0:.2
const TB = s("bossdr550_tb").hpf(770).pan(2/3).struct(`<
~ ~ x
~ ~ x
~ x x
~ <~ x> <x [x x]>
>`.fast(3)).diode("1:.2").room(1).size(4).pan("<.5 .6 .9>*3")
.off(0,x=>x.s("rolandr8_tb").bpf(9700).pan(1).vel(2/3))
.off(0,x=>x.bpf(2700).pan(1/2).vel(1))  
.postgain(1/4)


const CLAP = s("alesissr16_sd,alesissr16_sd:9").struct(`<
~ ~ x
~ x [~ x]
~ ~ x
~ x <~ [x x]>
>`.fast(3)).postgain(1/10)
.off(0,x=>x.bpf(1270).vel(2))  
.off(0,x=>x.bpf(4800).room(2).vel(1/3))

const TICK = s("tick").struct(`<
x [x x] [x ~] 
x [~ <~ x>] [<~ x> x]
x [x x] [x ~]
x [~ ] [x [x x]]
>`).vel(`<
1 [.5 .3] [.6 .3]
>`).pan(`<
.7 [.8 .9] [.8 .9]
>`).fast(3).hpf(1100).postgain(4/5)
.off(0,x=>x.bpf(4000).vel(1))

const HH = s("hh:4,circuitstom_hh:0:.3").struct(`<
x [x x] ~
x ~ [x x]
x [x x] ~
x  x [~ [x x]]
>`).vel(`<
.3 [1 .5] [.7 .5]
>`).pan(`<
.4 [.3 .6] [.3 .6]
>`).fast(3).crush(5).coarse(2)
.dec(1/11).rel(0)
.lpf(12800).hpf(6200)
.diode("3:.1").postgain(1/7)

const chrd = `<Am@2 F2 C2  Am@2 F C2  Am@2 G2 C  <Am F2>@2 <Em7 G2> <F2 Am F2 C>>`.transyellow()
const chrd2 = `<
Am@2   F2 C2  C2@2 Dm Am  Am@2 F2 C2    Am@2 Em7 F
Em Em7 F2 C2  Am@2 F2 C2  Em Em7 F2 C2  Am Am G2 C2
F2@2   G2 Am  F2@2 Am G2  Dm@2 Em F2    Am@2 G C
>`.transyellow()

const ci = `
<<[Em F G Am] [Am@2 G F]>@4  F@2 G7 Am  F@2 Am G  Dm@2 Em F
 F@2 G7 Am  F@2 Am7 G  Dm@2 Em F  Am@2 <Em G> <F C> >`.transyellow()

const ding = `<
<[E F G [A@2 G]] [A@2 G F]>@4  F@2 G A  F@2 A [G@2 C] D@2 E F
F@2 G A        F@2 A G  D@2 E [F@2 G] A@2 <E G> <F C> 
>`.violet()

const mi = `<
<C C2>@3    C G2 C B2@3  C@3
C2:3@3 _ G2 C D@3  E@2 D
C@3    _ G  F E@2 [F E] C@2 E
F2:2@3 _ G2 C B2@3  C@2 D

C@3    C G2 C B2@3  C@3
C2:3@3 _ G F  E@2   [F E] C@2 E
F2:2@3 _ G2 C D@3   E@2 D
C@3    C G2 C <B2 D>@3  C3@3
>`

const bi = `<
<[E B G4  F C4 G4  G B D4 A C4 E4] 
[A C4 E4 A4 E4 C   G B D4 F C4 F4 ]>@12
F C4 G4 A C4 F4  G B D4 A C4 E4
F C4 G4 F C4 F4  A C4 G4 G C4 G4
D A  D4 F A  D4  E  B G4 F C4 F4

F C4 G4 A4 C4 F3   G D4 G4 A C4 E4
F C4 G4 A4 C4 F3   A C4 E4 G C4 G4
D A  D4 F A  D4    E  B G4 F C4 F4
A E4 G4 A4 E4 C4  <[E B G4 F C4 F4] [G D4 G4 C3 G3 C4]>@6
>`.teal()

const m2 = `<
G@3    C@2 G   F@3            E@2 C
E@2 C  E C E   F@2 <F [G F]>  E@2 C
G@3    C@2 G   F@3            E@3
C@3 <E2 F2> <G2 G2 G2 G3> <C C C E> <B2 D>@3 C@3
>`

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

const p1 = `<
A3 A4 A3 E3 A3 C4        F2 F3 F4 C2 E3 G3
A2 A3 A4 C4 [E3 A3] C4   F2 F3 F4 C3 E3 [G3 B3]
A3 A4 A3 C3 A3 E4        G2 G3 G4 C2 E3 G3
<[A2 A3 A4 E3 A3 [A4 C4]] [F2 F3 F4 A4 F4 C4]>@6
<[E2 B3 E4 F3 A3 F4] [G2 G3 G4 A2 C3 A3]
 [E2 B3 E4 F3 A3 F4] [G3 B3 G4 C3 E3 G3]>@6
>`.gold()

const pi = `<
<[E2 B3 E4 F2 F3 F4  G2 G3 G4 A2 A3 A4]
[A2 C3 A3 A4 C4 A3   G2 G3 G4 F2 F3 F4]>@12
F2 F3 G4 F3 A3 F4    G2 G3 G4 E3 A3 [C4 B3]
F2 F3 G4 F3 A3 F4    A3 C4 G4 G  C4 D4
D2 A3 D4 F3 A3 D4    E2 B3 E4 F2 F3 F4

F2 C4 G4 F3 C4 F4   G2 G3 G4 A2 A3 A4
F2 C4 G4 F3 C4 F4   A2 C4 G4 G3 C4 G4
D2 A3 D4 F3 A3 D4   E2 B3 G4 F2 F3 F4
A2 E4 G4 A4 E4 C4  <[E2 B3 G4 F2 C4 F4] [G2 D3 G3 C3 G4 C4]>@6
>`.gold()

const bass = `<
A1@2 F1 C1
A1@2 F1 [C1@2 B1]
A1@2 G1 [C1@2 G1]
<A1 F1>@2 <E1 G1> <F1 [A1@2 B1] F1 C2>
>`.violet()

const impact = `<
~ ~ A4      ~ ~ <C5 E4> ~ ~ F4      ~ ~ C4
~ ~ A4      ~ ~ E5      ~ ~ F5      ~ ~ C5
~ ~ <A4 E5> ~ ~ C5      ~ ~ G4      ~ ~ C4
~ ~ <A4 F4> ~ ~ <E5 A4> ~ ~ <B4 G4> ~ ~ <F4 A4 F5 C5>
>`.as("note:vel").yellow()
arrange(
  [1/2, BELLS(b1,55).lpfAt(55,55,2)],
  
  [64, stack(
    VIOLIN(mi).lpfAt(3200,4400,64),
    SQUARE(mi).lpfAt(880,12800,64),
    BELLS(bi, 990).lpfAt(880, 1960, 64).mask("<1@32 1@32>"),
    PIANO(bi, 1, 1/4).lpfAt(1440, 6400, 64),
    PAD(ci,"<[0,1,2]@2 [0,1,3] [0,1]>","<0@32 12@32>").lpfAt(1270,3300,64),
    PIZZ(pi).lpfAt(770,14400,64).mask("<0@32 1@32>"),
    DING(ding).lpfAt(770, 3300, 64),
    KICK4.mask("<0@16 1@32 1@64>"), HH4.mask("<0@32 1@64>"),
  )],
  [64, stack(
    VIOLIN(mi).lpfAt(3200,4400,64),
    SQUARE(mi).lpfAt(880,12800,64),
    BELLS(bi, 990).lpfAt(880, 1960, 64).mask("<1@32 1@32>"),
    PIANO(bi, 1, 1/4).lpfAt(1440, 6400, 64),
    PAD(ci,"<[0,1,2]@2 [0,1,3] [0,1]>","<0@32 12@32>").lpfAt(1270,3300,64),
    PIZZ(pi).lpfAt(770,14400,64).mask("<0@32 1@32>"),
    DING(ding).lpfAt(770, 3300, 64),
    KICK4.mask("<0@16 1@32 1@64>"), HH4.mask("<0@32 1@64>"),
  )],  
  
  [2, stack(
    PAD(chrd,"<[0,1,2]@4 [0,1,2]@2 <[0,1,2] [0,1,2,3]> [0,1,2] [0,1,2]@4 [0,1,2]@3 [0,1]>").lpfAt(110,220,2),
    BELLS(b1,55).lpfAt(55,55,2),
  )],
  [64, stack(CHIMES, CHIMESUP.mask("<0@15 1 0@16>"),
    PAD(chrd,"<[0,1,2]@4 [0,1,2]@2 <[0,1,2] [0,1,2,3]> [0,1,2] [0,1,2]@4 [0,1,2]@3 [0,1]>","<0@16 [0,12]@16>")
    .lpfAt(330,2800,64),
    BELLS(b1,330).lpfAt(330,1800,64),
    PIANO(b1,1,1/3).lpfAt(220,3200,64).mask("<1@16 1@48>"),
    HARP(impact).lpfAt(1270,12800,64),
  )],
  [64, stack(
    CHIMESDOWN.mask("<0@32 1@8 0@99>").lpfAt(20000,3200,16).gainAt(1,1/20,16),
    PAD(chrd,"<[0,1,2]@4 [0,1,2]@2 [0,1,2,3] [0,1,2] [0,1,2]@4 [0,1,2]@3 [0,1]>","<12@16 [0,12]@16>")
    .lpfAt(3100,770,32).mask("<1@32 0@32>"),
    PIZZ(p1).lpfAt(770, 12800, 64),
    BELLS(b1,1210).lpfAt(1440,1220,64),
    LOW(bass).mask("<0@32 1@32>").lpfTri(1440,4400,64),
    PIANO(m1, 2, 0).add(note(12)).hpf(770).lpfTri(2440,3300,32).mask("<1@32 0@32>"),
    PIANO(b1, 0, 1/2).hpf(770).lpfTri(1670,2440,64).mask("<0@32 1@32>"),
    VIOLIN(m1).lpfAt(660,4400,64).mask("<1@32 1@32>"),
    ORGAN(bass).lpf(220).mask("<0@32 1@32>"),
    TICK.mask("<0@32 1@32>"),
  )],
  [64, stack(CHIMES, CHIMESDOWN.mask("<1@2 0@31 1@2 0@99>").lpfAt(20000,10,32).gainAt(1,1/20,32), 
    CHIMESUP.mask("<0@30 1 0 1 0@99>").lpfAt(20000,8400,64),
    WAVESUP.mask("<0@32 1@32>"),
    // PAD(chrd,"<[0,1,2]@4 [0,1,2]@2 [0,1,2,3] [0,1,2] [0,1,2]@4 [0,1,2]@3 [0,1]>","[0,12]").lpfAt(770,440,32),
    SQUARE(m1).lpfAt(770,12800,64).mask("<0@32 1@32>"),
    VIOLIN(m1).lpfAt(440,4400,64).mask("<1@32 1@32>"),
    PIZZ(p1).lpfAt(9600, 17000, 64), 
    LOW(bass).hpf(170).lpfAt(3300,6400,64),
    ORGAN(bass).lpfAt(4400,3300,64),
    BELLS(b1,1670).lpfAt(1670,1960,64),
    HARP(impact).lpfAt(8400,14400,64).mask("<0@32 1@32>"),
    KICK, TICK, HH.lpfAt(1260,20000,64), CLAP.mask("<0@16 1@48>"),
  )],
  [64, stack(
    WAVESDOWN.mask("<1@16 0@99>"),
    PAD(chrd,"<[0,1,2]@4 [0,1,2]@2 [0,1,2,3] [0,1,2] [0,1,2]@4 [0,1,2]@3 [0,1]>").lpfAt(440,2800,64),             
    SQUARE(m1).lpfAt(12800,4800,64),
    VIOLIN(m1).lpfAt(4400,2400,64),
    HARP(impact).lpf(12800).mask("<1@16 0@16>"),
    PIZZ(p1).lpf(14400),
    BELLS(b1,1670).lpfAt(990,1670,64), 
    PIANO(b1, 3/2, 1/4).lpf(6400).mask("<1@16 0@48>"),
    LOW(bass).hpf(160).lpf(4400).mask("<0@16 1@48>"),             
    ORGAN(bass).lpfAt(4400,3300,64),
    KICK.mask("<1@48 0@16>"), TICK, HH, CLAP, TB.mask("<1@48 0@16>"),
  )],
  [8, stack(CHIMES,
    PAD(chrd,"<[0,1,2]@4 [0,1,2]@2 [0,1,2,3] [0,1,2] [0,1,2]@4 [0,1,2]@3 [0,1]>").early(56).lpfAt(2800,1900,4),
    SQUARE(m1).lpfAt(880,550,8).early(56),
    VIOLIN(m1).lpfAt(2800,2400,8).early(56),
    HARP(impact).lpfAt(12800,4800,8).early(56),
    PIZZ(p1).lpfAt(6400,2400,8).early(56),
    BELLS(b1,1670).lpfAt(1670,1440,8).early(56), 
    PIANO(b1).lpfAt(4800,4000,8).early(56),
    TB, TICK, CLAP,
  )],
  [8, stack(
    PAD(chrd,"<[0,1,2]@4 [0,1,2]@2 [0,1,2,3] [0,1,2] [0,1,2]@4 [0,1,2]@3 [0,1]>").early(24).lpfAt(1900,1700,4),
    SQUARE(m1).lpfAt(550,440,8).early(24),
    VIOLIN(m1).lpfAt(2400,2200,8).early(24),
    HARP(impact).lpfAt(4800,2200,8).early(24),
    PIZZ(p1).lpfAt(2400,1670,8).early(24),
    BELLS(b1,1670).lpfAt(1440,990,8).early(24), 
    PIANO(b1).lpfAt(4000,3200,8).early(24),
    TICK,
  )],  
  [4, stack(
    PAD(chrd,"<[0,1,2]@4 [0,1,2]@2 [0,1,2,3] [0,1,2] [0,1,2]@4 [0,1,2]@3 [0,1]>").early(28).lpfAt(1700,1440,4),
    PIANO(b1, 0, 1/5).lpfAt(3200,1670,4).early(60),
  )],
  [4, stack(
    PAD(chrd,"<[0,1,2]@4 [0,1,2]@2 [0,1,2,3] [0,1,2] [0,1,2]@4 [0,1,2]@3 [0,1]>").early(60).lpfAt(1670,770,4),
    PIANO(b1, 0, 1/5).lpfAt(1670,770,4).early(60),
  )],
  [4, stack(
    PAD(chrd,"<[0,1,2]@4 [0,1,2]@2 [0,1,2,3] [0,1,2] [0,1,2]@4 [0,1,2]@3 [0,1]>").early(60).lpfAt(770,440,4),
    PIANO(b1, 0, 1/5).lpfAt(770,440,4).early(60),
  )],
  [4, stack(
    PAD(chrd,"<[0,1,2]@4 [0,1,2]@2 [0,1,2,3] [0,1,2] [0,1,2]@4 [0,1,2]@3 [0,1]>").early(60).lpfAt(440,220,4),
    PIANO(b1, 0, 1/5).lpfAt(440,220,4).early(60),
  )]
)

