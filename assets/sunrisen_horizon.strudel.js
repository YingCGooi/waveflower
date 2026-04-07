// @title Sunrisen Horizon 2026
// @by Waveflower Gooi
// @license CC BY-NC-SA

//    _____ __  ___   ______  _________ _______   __
//   / ___// / / / | / / __ \/  _/ ___// ____/ | / /
//   \__ \/ / / /  |/ / /_/ // / \__ \/ __/ /  |/ /
//  ___/ / /_/ / / | / _  _// / ___/ / /___/ /|  /
// /_____\______/  |__/ |___________________/ __/
//    / / / / __ \/ __ \/  _/__   / __ \/ | / / 
//   / /_/ / / / / /_/ // /   ╱ ╱/ / / /  |/ / (╲ __
//  / __  / /_/ / _  _// /_ ╱ ╱_/ /_/ / /|  / _╲|/_/
// /_/ /_/\____/_/ |_/___ /_____\____/_/ |_/ /_/|╲
//                                              ╲)

samples({
  tick: 'cactus/dyad/CACTUS_DYAD_ONESHOT.mp3',
  short: 'cactus/perc/CACTUS_PERC_14_ONESHOT.mp3',
  uplifter: 'fl/uplifter1.wav',
  downlifter: 'fl/dnlifter1.wav'
}, 'http://localhost:5432/');

useWet({amount: 1.4, commentColor: '#FFFFFF07', gutterColor: '#FFF1', commentStyle: 'normal', letterSpacing: -0.1})

setcpm(132/4)

const t = (p) => dry(p.withValue(x=>0)).color('oklch(.8 .2 90)')
const at = (min,max,c=16)=> min < max ? saw.rangex(min,max).slow(c) : saw.rev().rangex(max,min).slow(c)
register('ov', (c, p) => p.slow(c))
register('cyan', (alpha, p) => p.color('oklch(.7 .2 240 /'+alpha+')'))
register('teal', (alpha, p) => p.color('oklch(.7 .2 190 /'+alpha+')'))
register('olive', (alpha, p) => p.color('oklch(.6 .2 110 /'+alpha+')'))
register('maroon', (alpha,p) => p.color('oklch(.4 .2 0 /'+alpha+')'))
         
register('delayBy', (n, p) => p.mask("<0@4 1@4>"))
register('first4', (p) => p.mask("<1@4 0@4>"))
register('first2', (p) => p.mask("<1@2 0@6>"))

const UP_SQ = `<[C3:.4,C4]>`.slow(2).as("note:vel").s("square")
.room(1/2).size(6)
.delay(2/3).delaysync(1/8)
.teal(2/3)


const INTRO_SQ = `<
C4:.33 C5:1 C4:.33 [C5:1 C4:.33:.8]
C4:.33 C5:1 C4:.33 [C5:1 <C4:1 C6:1:.7>]
C4:.33 C5:1 C4:.33 [C5:1 C4:.33:.7]
C4:.33 C5:1 C4:.33 [C5:.5 C3:.33:.7]
>`.as("note:pan:vel").fast(4)
.s("square")
.decay(1/4).att(0).sus(1/8).room(1/2).size(6)
.delay(2/3).delaysync(1/8)
.lpe(2).lpq(0.1).hpf(400)
.gain(3/4).teal(2/3)

const INTRO_BASS = `<
C2:2 C2:2 C2:1.5 C2:2.5
C2:2 C2:2 C2:1.5 C2:2.5
>`.as("note:vel").fast(8)
.s("sawtooth")
.postgain(1.4).hpf(70)

const INTRO_PAD = `<
C2:2 C2:2 C2:1.5 C2:2.5
C2:2 C2:2 C:1.5 C2:2.5
>`.as("chord:vel").fast(8)
.anchor("<E4>")
.voicing()
.postgain(1/3)
.s("supersaw").detune(1/8).spread(at(1,.75,16)).cyan(2/3)
.superimpose(
  x=>x.diode("2:0.5")
).lpe(2)

const SWEEP_DOWN = s("pink,brown").seg(6)
.lpf(at(12000,100,8)).pan(0)
.gain(1.6).att(1/4).rel(1)
.superimpose(x=>x.late(1/32).pan(1))
.gain(at(1,1.2,8))
.hpf(at(8000,100,8)).color('#0000')

const DOWNLIFT = s("brown").seg(6)
.lpf(at(9000,100,4)).pan(0)
.gain(1.6).att(1/4).rel(1)
.superimpose(x=>x.late(1/32).pan(1))
.gain(at(2,.1,8))
.hpf(at(7000,400,4))

const UPLIFT = s("uplifter").slice(1, "0")
  .sus(1).rel(1).lpf(9600)
  .hpf(1200).slow(2.2).fit().gain(4.4)

const DNLIFT = s("downlifter").slice(1, "0").slow(2.2).fit().clip(1)
  .gain(3).hpf(900).lpf(9600).room(1).size(7)

const SWEEP_UP = s("pink,brown").seg(4)
.lpf(at(100,16000,16)).lfo({s:1/16}).pan(0.1)
.gain(1.6).att(1/32).rel(1)
.superimpose(x=>x.late(1/16).pan(1))
.gain(at(1.1,1.2,16))
.hpf(at(100,8000,16))

const BASS = `<
C2 G1 F1 _ A1 G1 F1 _
C2 G1 F1 _ A1 G1 F2 _
C2 G1 F1 _ A1 G1 F2 _
C2 G1 F2 _ A1 B1 F1 _
>`.as("note:vel").fast(2).up("~ x ~ x ~ x ~ x".as("struct"))
.s("sawtooth").hpf(70)
.att(1/100).rel(1/32).ftype(0)
.postgain(5).orbit(4).color('oklch(.25 .15 30)')

const BASSBREAK = `<
C2 C2 G2 G2 
F2 F2 F2 F2
>`.as("note:vel").fast(2).up("~ x ~ x ~ x ~ x".as("struct"))
.s("sawtooth")
.att(1/100).rel(1/32).ftype(0).hpf(97)
.postgain(1.75).orbit(4).maroon(1)

const violinchrd = chord(`<
C Em7 F2 _ Am G F2 _
C G F2 _ Am G F2 _
C Em7 F2 _ Am Em F2 _
C G F2 _ Am G F2 _
>`).n(`<
[3,4] [2,3] [3,4]@6
>`)
.anchor(`<
E4@2 C4@2 E4 C4 F4 _
G4@2 F4 F4 E4 C4@3
E4 E4 F4@2 C4 D4 F4@2
G4@2 F4@2 C4 G4 C5@2
>`).voicing().fast(2)

const VIOLIN = (chrds) => stack(
  chrds.hpf(880).transpose("12").lpf(1400).s("gm_violin:6").vel(1).pan(.4),
  chrds.hpf(1200).transpose("0,12").lpf(3300).s("gm_violin:7:.3,gm_string_ensemble_1:4").vel(3/4).pan(1)
).dec(1/4).sus(1).rel(1/3).gain(1/4).env({dec:1/4,sus:1/2,rel:1,sc:-1,rc:-1})
.color('oklch(.77 .2 100)')

const PAD = chord(`<
C Em7 F2 _ Am G F2 _
C G F2 _ Am G F2 _
C Em7 F2 _ Am Em F2 _
C G F2 _ Am G F2 _
>`).n(`<
[0,1,2,3,4] [0,1,2,3] [0,1,2,3,4]@6
>`)
.anchor(`<
E4@2 C4@2 E4 C4@3
E4 E4 F4 F4 E4 C4@3
E4 E4 F4@2 C4 D4 F4@2
G4@2 F4@2 C4 G4 C5@2
>`).fast(2)
.voicing()
.clip(1).postgain(5/3)
.s("supersaw").detune(1/9).spread(.8).unison(5)
.lpe(1).lpq(0)
.hpf(275).color('gold')

const violinbreak = chord(`<
C _ G _ F2 _ _ _
>`).n(`<[2,3,4] [1,2,3] [2,3,4]@6>`)
.anchor(`<
C4@2 C4@2 E4 C4@3
>`).fast(2).voicing()

const PADBREAK = chord(`<
C _ G _ F2 _ _ _
>`).n(`<
[0,1,2,3,4] [0,1,2,3] [0,1,2,3,4]@6
>`)
.anchor(`<
E4@2 C4@2 E4 C4@3
>`).fast(2)
.voicing()
.clip(1)
.s("supersaw").detune(1/9).spread(.8).unison(5)
.lpe(4).lpq(-4).lpd(2)
.hpf(275)
.color('gold')

const SQ = `<
C4:.4 C5:.9 B3:.4 B4:.9
C4:.4 C5:.9 C4:.4 [C5:.9 C4:.4]
E4:.4 E5:.9 B3:.4 B4:.9
C4:.4 C5:.9 C4:.4 [C5:.9 C4:.4]
E4:.4 C5:.9 D4:.4 D5:.9
C4:.4 C5:.9 C4:.4 [C5:.9 C4:.4]
E4:.4 E5:.9 B3:.4 B4:.9
C4:.4 C5:.7 F4:.4 [C5:.9 C4:.4]
>`.as("note:pan:vel").fast(4)
.s("square").gain(1)
.superimpose(x => 
  x.dry(0).delay(1/2).FX(lpf(4000))
  .delaysync(1/8)
).color('oklch(.6 .2 180)')
.decay(1/8).att(1/256).sus(1/4)
.FX(
  lpf(9000).lpe(2).lpq(1).hpf(400)
)

const SNARE = s("akaimpc60_sd:1,akaixr10_sd:7,d70_cp:0,pink").struct(`<
~ x ~ x
~ x ~ [x ~ x x]
~ x ~ x
~ x ~ [x ~ x x]
>`)
.fast(4).gain(2/3).dec(1/2).sus(1/4).pan(2/3).coarse(3).crush(7)
.room(1/2).size(3).hpf(400)

const SNARE2 = s("akaimpc60_sd:1,akaixr10_sd:7,d70_cp:0").struct(`<
~ x ~ x
~ x ~ x
~ x ~ x
~ x ~ [x ~ x x]
>`).fast(4).gain(4/5).pan(2/3).off(1/64, x=>x.s("pink").hpf(1000))
.room(1/2).size(3).hpf(700)

const SNUP = s("alesissr16_sd:0").struct(`<
x x x [x x] x x x [x x]
x x x x x x x x
[x x] [x x] [x x] [x [x x]]
[x [x x]] [x [x x]] [x [x x]] [x [x x]]
[x x x x] [x x x [x x]] [x x x x] [x x x [x x]]
[x x x [x x]] [x x _ [x x]] [x x x [x x]] [x x _ [x x]]
>`).pan(3/4)
.fast(4).gain(1/2).dec(1/8).sus(1/16).rel(1).att(0)
.room(1/4).size(4)
.hpf(400)

const OHH = s("akaixr10_oh").up(`<
~ x ~ x
~ x ~ x
~ x ~ x
~ x ~ x
>`.as("struct:vel")).fast(8).pan(7/8)
  .gain(1/3).att(1/32).sus(1).rel(1/4).hpf(6700)

const OH = s("oh:6").up(`<
x [x:.7 x] x [x  x:.7      ]
x  x:.8    x [x [x:.5 x:.7]]
>`.as("struct:vel")).fast(4).pan(1/4)
  .superimpose(x => x.early(1/16).dry(1/128).room(1/4).size(1))
  .dec(1/9)
  .sus(1/16)
  .hpf(7700)
  .rel(1/4).coarse(12).crush(8)
  .fast(2).gain(1.5).maroon(.7)

const CRASH = s("alesissr16_cr")
.struct(`<x _ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~>`).room(1).size(9).gain(1/2).pan(.7)
.superimpose(x=>
  x.dry(1/2).lpf(at(1600,200,8).slow(4)).att(1/16).delay(3/4)
  .delaysync(1/4).up(".2 1 .2 1 .2 1 .2 1".slow(2).as("pan"))
)

const SOFT_CR = s("bossdr550_cr,lm8953_cr").stretch(1/64)
.struct(`<x _ _ _ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~>`)
.dry(1/2).lpf(at(16000,4800,1)).pan(0).room(1).size(9)
.superimpose(x=>x.late(1/64).room(1).size(7).pan(1))  
.gain(1/4)

const HARD_CR = SOFT_CR.dry(3/4)

const rundown = "<14 13 12 11 10 9 8 7 6 5 4 3 2 1 0 0>".fast(2)
const runup = rundown.revv()
const run8 = "<7 8 9 10 11 12 13 14>"

const CLOCK4 = s(`<
~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~
~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~
t s k s t s k s
t s k s t s k s
t s k s t s k s
t s k s t s k s
>`.pick({t: "tick,short", k: "tick", s: "tick"}))
.fast(8)
.set.mix(pan("1 0.33".fast(4)))
.set.mix(vel("1 0.75".fast(4)))
.set.mix(lpf("12800 4800".fast(4)))
.set.mix(rel("0.5 0.1".fast(4))).hpf(200)
.color('white')
.n("<0 1 2 3 4 5 6 7 8 9 10 11>".add(20).fast(4))

const CLOCK8 = s(`<
t s k s t s k s
t s k s t s k s
t s k s t s k s
t s k s t s k s
>`.pick({t: "tick,short", k: "tick", s: "tick"}))
.fast(8)
.set.mix(pan("1 0.75".fast(4)))
.set.mix(vel("1 .9".fast(4)))
.set.mix(lpf("12800 6400".fast(4)))
.set.mix(rel("0.5 0.1".fast(4)))
.postgain(5).hpf(200)
.n("<0 1 2 3 4 5 6 7 8 9 10 11>".add(20).fast(4))

const HH = s("akailinn_hh").dec(1/12).up(`<
  x:.5 ~ x x:.7
  x:.5 ~ x x:.7
>`.as("struct:vel")).fast(16).hpf(5400).gain(1/3)

const PERC = s("dr220_perc")
  .up("x:.7 ~ x:.6 <~ [~ x:.55]>".as("struct:vel")) 
  .gain(1/2)
  .fast(2).hpf(800).lpf(4800)

const SYNTHLINE = `<
C3 C3 C3 [C3:1 C2]
C3 C3 C3 C3
C3 C3 C3 [C3:1 C2]
C3 C3 C3 C2
C3 C3 C3 [C3:1 C2]
C3 C3 C3 C3
C3 C3 C3 [C3:1 C2]
C3 C3 C3 C2
>`.as("note").add(note("0,12")).fast(8).s("supersaw")
.detune(1/2).color('oklch(.5 .2 240)')
.unison(5).spread(1).gain(2/3)
.dec(1/4).sus(1/4).rel(0).orbit(4)
.hpf(440)

const lineC = `<
C2:2 C2:2 C2:1.5 C2:2
C2:2 C2:2 C2:1.5 C2:2
C2:2 C2:2 C2:1.5 C2:2
C2:2 C2:2 C2:1.5 C1:2
C2:2 C2:2 C2:1.5 C2:2
C2:2 C2:2 C2:1.5 C2:2
C2:2 C2:2 C2:1.5 C2:2
C2:2 C2:2 C2:1.5 <~ ~ C1:2 C1:2>
>`

const line0 = `<
~ A2:2 A2:1.5 E2:2
~ C2:2 C2:1.5 C2:2
~ G1:2 G1:1.5 E1:2
~ F1:2 F1:1.5 <G1:2 ~>
>`

const line1 = `<
    ~ A2:2 A2:1.5 E2:2
    ~ C2:2 C2:1.5 C2:2
    ~ G1:2 G1:1.5 E1:2
    ~ F1:2 F1:1.5 G1:2
    ~ A2:2 A2:1.5 E2:2
    ~ F2:2 F2:1.5 F2:2
    ~ G2:2 G1:1.5 B1:2
    ~ C2:2 C2:1.5 G1:2
    ~ A2:2 A2:1.5 E2:2
    ~ C2:2 C2:1.5 C2:2
    ~ G1:2 G1:1.5 E2:2
    ~ F1:2 F1:1.5 G2:2
    ~ A2:2 A2:1.5 E2:2
    ~ F2:2 F1:1.5 F1:2
    ~ E2:2 F2:1.5 F2:2
    ~ G1:2 C2:1.5 C1:2
>`

const FATBASS = (p) => p.as("note:vel").fast(8)
.s("sawtooth:0:1.1")
.orbit(4).FX(
  diode("3.33:0.33")
)
.fm(2.7).hpf(100).color('oklch(.45 .24 0)')
._scope({height:100,width:800,scale:2/3})
const FATFAT = (p) => FATBASS(p).pan(1/4).dec(0.25).sus(0)
  .off(1/60, x=>x.add(note(12)).pan(1)).FX(diode(5).lpf(12800).lfo({s:1/16,depth:2.1}))
  .hpf(300).color('oklch(.4 .17 200)')


const kickpat = `<
x x x x
x x x [x x]
x x x x
x x x x
x x x x
x x x [x x]
x x x x
x x x x
>`.fast(4)

const RIDE = stack(
  s("alesissr16_rd:1:3"),
  s("alesissr16_rd:2:2")
).dec(1/8).postgain(1/5)
.rel(1/8).struct(kickpat).hpf(6400)

const KICK = stack(
  s("bd:9*4").lpf(7200),
  s("compurhythm78_bd*4"),
).struct(kickpat).gain(1).ftype(0).duck("4:5").duckatt("0.25:0").duckdepth("1:0.7")
.color('oklch(.2 .2 340)')

const melody0 = cat(
"G@2 C@2 G@2 F@2 E@2 F@2 E@2 C@2",
"B2@2 C B2@3 G2@2 C@2 G2@2 C@2 D@2",
"G@2 C G@3 F@2 E@2 F@2 E@2 C@2",
"B2@2 C@2 B2@2 G2 C@3 G2@2 C@2 D@2",
"G@2 C G@3 F@2 E@2 F@2 G@2 C@2",
"B2@2 C B2@3 G2@2 C@2 G2@2 C@2 D@2",
"G@2 C G@3 F@2 E@2 F@2 E@2 C@2",
"B2@2 C B2@3 G2@2 C@2 G2@2 C@2 ~@2",
).note()

const melody1 = cat(
"G@2 C@2 G@2 F@2 E@2 F@2 E@2 C@2",
"B2@2 C B2@3 G2@2 C@2 G2@2 C@2 D@2",
"E@2 C@2 E@2 F@2 C@2 F2@2 G2@2 C@2",
"B2@2 G2@2 C@2 B2 C@3 G2@2 C@2 D@2",
"G@2 C@2 G@2 F@2 E@2 F@2 G@2 C@2",
"B@2 G B@3 G@2 C4@2 C@2 G@2 B@2",
"C4@2 C@2 G@2 C@2 G@2 F C E@2 C@2",
"C@2 G2@2 E@2 C@2 G@2 F C E@2 C@2"
).note()

const melody2 = cat(
"G@2 C@2 G@2 F@2 E@2 F@2 E@2 C@2",
"B2@2 C B2@3 G2@2 C@2 G2@2 C@2 D@2",
"E@2 C@2 E@2 F@2 C@2 F2@2 G2@2 C@2",
"B2@2 G2@2 C@2 B2 C@3 G2@2 C@2 D@2",
"G@2 C@2 G@2 F@2 E@2 F@2 G@2 C@2",
"B@2 G B@3 G@2 C4@2 C@2 G@2 B@2",
"C4@2 C@2 G@2 C@2 G@2 F C E@2 C@2",
"C@2 G2@2 E@2 C F G@2 C@2 B@2 C4@2"
).note()

const melodyEnd = cat(
"C C2 C G",
"C C2 C E",
"D D2 D G",
"C C2 C B2",
"C C2 C G",
"C C2 C E",
"D D2 D [D E]",
"C C2 C <B2 [C,C4]>",
).note().vel(cat(
".7 .7 .8 .7",
".8 .7 .8 .7",
".7 .7 .8 .7",
".8 .7 .8 .7",
".7 .7 .8 .7",
".8 .7 .8 .7",
".7 .7 .8 [.7 .7]",
".8 .7 .7 .7"
))

const submelEnd = cat(
"A2@4 A2@2 A2 E1",
"F2@4 F2@2 F2 C1",
"G2@4 G2@2 G2 G1",
"C2@4 C2@2 C2 B1",
"A2@4 A2@2 A2 E1",
"F2@4 F2@2 F2 C1",
"G2@4 G2@2 G2 G1",
"C2@4 C1@4",
).note()

const submel0 = cat(`<
A2 ~ ~ E2
C2 ~ ~ C2
G2 ~ G2 E2
F2 ~ ~ <G2 ~>
>`).fast(8).note()

const submel1 = cat(`<
A2 ~ ~ E2
C2 ~ ~ C2
G2 ~ G2 E2
F2 ~ ~ <G2 ~>
A2 ~ ~ E2
F2 ~ ~ F2
G2 ~ G2 B2
C2 ~ ~ <B2 ~>
A2 ~ ~ E2
C2 ~ ~ C2
G2 ~ G2 E2
F2 ~ ~ <G2 ~>
A2 ~ ~ A2
F2 ~ ~ F2
C1 ~ F1 ~
G1 ~ ~ C1
>`).fast(8).note()

const PIZZMEL = (melody) => melody
  .s("gm_pizzicato_strings:4,gm_pizzicato_strings:0:.6")
  .att(0).dec(1/2).sus(1/2)
  .add(note("0,12")).pan(0)
  .off(1/128, x=>x.add(note(12)).postgain(1.67).pan(1))
  .hpf(700).delay(1/3).delaysync(1/8)
  .color('oklch(.77 .2 80)')

const PIZZ = (submelody) => 
submelody.s("gm_pizzicato_strings:4").add(note("0,12"))
  .att(0).dec(1/2).sus(1/2).rel(1)
  .pan(0).off(1/60, x=>x.add(note("0")).pan(1))
  .hpf(75).color('oklch(.67 .21 55)').postgain(2.9)
  .orbit(5)

const SQMEL = (melody) => melody.add(note(24))
.att(1/64).rel(1/4).gain(2/3).delay(1/2).delaysync(1/8).sus(1/2)
.hpf(440)
.off(0, x=>x.s("sawtooth").transpose(1/5).pan(0))
.off(0, x=>x.s("square").transpose(-1/4).pan(1))
.off(0, x=>x.s("square").transpose(1/6).vel(3/4).pan(1))
.color('oklch(.7 .2 210)')  
const piano1 = cat(`<
A3 ~ ~ E3
C3 ~ ~ C3
G3 ~ G3 E3
F3 ~ ~ <G3 ~>
A3 ~ ~ E3
F3 ~ ~ F3
G3 ~ G3 B3
C3 ~ ~ <B3 ~>
A3 ~ ~ E3
C3 ~ ~ C3
G3 ~ G3 E3
F3 ~ ~ <G3 ~>
A3 ~ ~ A3
F3 ~ ~ F3
C2 ~ F2 ~
G2 ~ ~ C2
>`).fast(8).note().add(note("12,24"))
.pan(`.7 .8 .9 .8`.fast(2))

const pianoEnd = cat(
"A C  A@2 A@2 A E2",
"F _  F@2 E F@2 C2",
"G B2 G@2 G@2 G G2",
"C G1 C@2 C4 G C B2",
"A C  A@2 A@2 A E2",
"F _  F@2 E F@2 C2",
"G@4 G@2 G G2",
"C@4 C2@4"
).note()

const PIANO = (melody) => melody.add(note("0"))
  .s("piano:31:.5,gm_piano:8").rel(1/8)
  .hpf(500).vel(1).room(1/2).size(3)

$:arrange(
  // [2, stack(UPLIFT,
  //           UP_SQ.att(4).lpe(-4).lpq(4).lpa(4).lpd(4).hpf(200).lpf(30).gain(7/8), 
  //           SWEEP_UP.lpfAt(4000,9000,2).hpfAt(3000,4000,2).room(1).size(4).gainAt(1,1/2,2)
  //           .att(1/2))
  // ],
  // [8, stack(DNLIFT.first2(),
  //           SOFT_CR.att(1/2).first4(), 
  //           DOWNLIFT.first4(),
  //           INTRO_SQ.lpfAt(100,6000,24),
  //           INTRO_PAD.hpfAt(500,270,24).lpfAt(40,800,24),
  //           INTRO_BASS.lpfAt(40,300,24),
  //           SWEEP_UP)
  // ],
  // [8, stack(CLOCK8,
  //           OH.delayBy(4),
  //           INTRO_SQ.lpfAt(100,6000,24).early(8),
  //           INTRO_PAD.hpfAt(500,270,24).lpfAt(40,800,24).early(8),
  //           INTRO_BASS.lpfAt(40,300,24).early(8),
  //           SWEEP_UP)
  // ],
  // [8, stack(CLOCK8, OH,
  //           INTRO_SQ.lpfAt(100,6000,24).early(16),
  //           INTRO_PAD.hpfAt(500,270,24).lpfAt(40,800,24).early(16),
  //           INTRO_BASS.lpfAt(40,300,24).early(16),
  //           SWEEP_UP.early(8), SNUP)
  // ],
  // [8, stack(SWEEP_DOWN,
  //           PAD.lpfAt(800,12000,16), 
  //           BASS.lpfAt(120,400,16), CRASH, SQ)],
  // [8, stack(
  //   RIDE, 
  //   PAD.lpfAt(800,14400,16).early(8), 
  //   BASS.lpfAt(100,400,16).early(8), SQ, 
  //   SNARE.coarse("<1 1.5 2 2.5 3 3.5 4 4.5 5 5.5 6 6.6 7 7.5 8 8.5>*2"), 
  //   OH.lpfAt(8000,12000,8).pan(.2))],
  // [8, stack(
  //   VIOLIN(violinchrd).lpfAt(700, 3200, 8),    
  //   PAD.lpf(at(9000,4000,8)), 
  //   BASS.lpf(400), SQ.lpf(at(8000,200,8)), 
  //   SNARE.room(1/4).postgain(3/4).coarse(run8),
  //   OH.lpf(at(8000,200,8)),
  //   SWEEP_UP.early(4),
  //   CLOCK4.gain(1.4),
  // )],
  // [4, stack(
  //   VIOLIN(violinbreak).lpfAt(3200,1200,4).hpfAt(800,400,4).room("<0 .2 .7 1>").size(9),
  //   PADBREAK.lpfAt(700,180,4), 
  //   BASSBREAK.lpfAt(400,100,4), 
  //   SWEEP_UP.early(12),
  //   CLOCK4.early(4))],
  // [8, stack(KICK, RIDE, FATBASS(lineC).postgain(1/2).lpf(at(170,6400,16)),
  //           SOFT_CR.postgain(2/3),
  //           CLOCK4,
  //           SNARE.coarse(5).postgain(2/3).delayBy(4).lpf(12800).hpf(3200)
  //          )],
  // [8, stack(KICK, RIDE, HH, SNARE.coarse(6).postgain(2/3).lpf(12800).hpf(3200),
  //           FATBASS(lineC).postgain(1/3).lpf(at(170,6400,16)).early(8),
  //           SYNTHLINE)],
  // [8, stack(KICK, RIDE, HH, SWEEP_UP.late(4),
  //           SNARE.coarse(6).postgain(2/3).lpf(12800).hpf(3200),
  //           FATBASS(lineC).lpf(6400).postgain(1/3),
  //           SYNTHLINE.lpf(12800),
  //           INTRO_SQ.lpf(at(200,6000,8)))],
  // [8, stack(KICK, RIDE, OH, HH, SWEEP_UP.early(8),SNUP, CLOCK8.gainAt(1,1/4,8),
  //           SNARE.coarse(run8).postgain(2/3).lpf(12800).hpf(6400),
  //           FATBASS(lineC).lpf(6400).postgain(1/3),
  //           SYNTHLINE.lpf(at(12800,400,8)),
  //           INTRO_SQ.lpf(6000)
  // )],
  // [8, stack(
  //           t(`<this pizzicato rhythm is inspired by Enyas classics>`),
  //           PIZZ(submel0),//.lpf(at(12800,16000,8)), 
  //           PIZZMEL(melody0),//.lpf(at(300,14400,8)).gain(at(1.25,1,8)),
  //           FATFAT(line0).hpf(320).lpf(at(60,2400,8)).postgain(1/7).delayBy(4),
  //           HARD_CR.first4(),
  //           RIDE.lpf(at(8400,100,4)).first4(), 
  //           OH.lpf(at(4800,400,4)).first4(), 
  //           SYNTHLINE.lpf(at(800,10,4)).first2(),    
  //           SWEEP_DOWN.phaser(1/128).lpf(at(16000,1,4)).first4(),
  // )],
  // [8, stack(t(`<distort fatbass added to complement the bounciness of pizzicato>`),
  //           PIZZ(submel0).lpf(16000),
  //           FATFAT(line0).hpf(330).lpf(at(2400,3200,8)).postgain(1/8),             
  //           PIZZMEL(melody0).hpf(500).lpf(14400),            
  //           KICK.lpf(1400), SWEEP_UP.hpf(at(550,8000,8)).lpf(at(800,14000,8)).postgain(1/3),
  //           HH.delayBy(4),
  //           SNARE2.delayBy(4).coarse(4).crush(3).room(1/4).rel(1/4).postgain(1/2).lpf(8400).hpf(2400),
  // )],
  [8, stack(t(`<layer a 3x-square-lead to create extra richness>`),
            PIZZ(submel1).lpf(1200).postgain(2.7),
            FATFAT(line1).hpf(330).lpf(3300).postgain(1/8),            
            PIZZMEL(melody2).hpf(500).lpf(14400),
            SQMEL(melody2).hpf(550).lpf(at(300,12800,8)),            
            SOFT_CR, KICK.lpf(2200), RIDE,
            HH, OH.lpf(9600).pan(1/9),
            SNARE2.coarse(3).crush(3).postgain(1/2).lpf(12800).hpf(3200),
  )],
  [8, stack(t(`<RAVE RAVE RAVE RAVE RAVE RAVE RAVE RAVE>`),          
            PIZZ(submel1).lpf(1200).postgain(2.7),
            FATFAT(line1).hpf(330).lpf(3300).postgain(1/8),            
            PIZZMEL(melody1).hpf(500).lpf(14400),
            SQMEL(melody1).hpf(550).lpf(12800),
            PIANO(piano1),
            SOFT_CR, KICK.lpf(2200), RIDE, SNUP.lpf(at(20000,400,8)).postgain(1.33).delayBy(4),
            HH, OHH, OH.lpf(9600).pan(1/9),
            SNARE2.coarse(3).crush(3).postgain(1/2).lpf(12800).hpf(3200),
  )],  
  [8, stack(RIDE.lpf(at(8400,100,4)).first4(), CLOCK4.lpf(6400).postgain(7/8),
            PIANO(piano1),
            PIZZ(submel1).lpf(14400),
            FATFAT(line1).hpf(330).lpf(at(2400, 200, 8)).postgain(1/6),            
            PIZZMEL(melody1).hpf(500).lpf(14400),
            SQMEL(melody1).lpe(1).hpf(700).lpf(at(9600,700,8)),          
            SWEEP_DOWN.postgain(2/3), OH.lpf(at(9600,6400,8)).pan(1/9),  
            SNARE2.coarse("<3 3.5 4 5 5@4>").crush(4).postgain(1/2).lpf(at(4800,400,8)).hpf(800),
  )],
  [1, "~"],
  [8, stack(
            PIZZMEL(melodyEnd).hpf(400).lpf(at(16000,12800,8)),
            PIZZ(submelEnd).lpf(12800),
            OH.lpf(at(6400,2200,8)).pan(1/9).first4(),
            SWEEP_DOWN.early(8).postgain(1/2),
            SNARE2.coarse(5).crush(4).postgain(1/2).lpf(at(800,80,8)).hpf(800),
  )],
  [8, stack(
            PIZZMEL(melodyEnd.early(8)).hpf(400).lpf(at(16000,12800,8)),
            PIZZ(submelEnd.early(8)).lpf(12800),
            CLOCK8.lpf(at(12800, 6400, 8)).postgain(12/7)
            .n("<0 0.375 0.75 1.125 1.5 1.875 2.25 2.625 3 3.375 3.75 4.125 4.5 4.875 5.25 5.625 6 6.375 6.75 7.125 7.5 7.875 8.25 8.625 9 9.375 9.75 10.125 10.5 10.875 11.25 11.625>"
            .revv().add(12).fast(4)),
  )],  
  [4, "~"]
)
.pitchwheel({
  customlabels: ['I', 'I#', 'II', 'II#', 'III', 'VI', 'VI#', 'V', 'V#', 'VI', 'VI#', 'VII'],
  root: 'C',
  exponential: false,
  mode:'flakygon',
  thickness: 64,
  glow: 64,
  labels: 'numbers',
  textsize: 1.1,
  edolabel: 3/4,
  dotsize: 12,
  dotalpha: 1/2,
  circle: 0,
  linejoin: 'miter',
  lineoctavediv: 1,
  margin: 160,
})
