// @title video game battle song
// @by Gooi
// fragged @by tzwaan
// key fragged @by Gooi
setcpm(120/4)

const chords = "<0@31 1@8 1@8 2@14 3>".pickRestart(
[`<
Gm Gm Eb F
Gm Gm Bb F
Gm Gm Eb F
Cm Cm <D F>
>`,`<
Gm!4 G#m!4
>`, `<
G# G# Cm Bb
<[F6 F] [D#]> <Bb6 D#6> <[F F6] D#aug:g4:duck>
>`,
`[D#:f4:below]`]).as("chord:anchor:mode").fast(2)

const keytrans = "<0@31 8@31>"

$:n("[0 1 2 0 1 2 0 1]*2")
.mode("root").anchor("c4")
.set(chords).voicing().transpose(keytrans)
.pan("[.3 .5 .6 .2 .5 .7 .2 .7]*2").postgain(2/3)._scope()

$:n("[0 [0,3]]*4").mode("root")
.set(chords).voicing().transpose(keytrans).transpose(-36)
  .set.mix(s("sqr:0:.5,tri").vel(".75 .6").pan(".45 .7").fast(4))
  .mask("<0@31 1@31>")
  .lpe(1).lpq(0).lpd(1/12).lpf(4000)
  .dec(1/4).sus(1/16)._scope()

$:note("<0@15 0@16 1@4 2@4 1@4 2@4 3@14 4>*2".pickRestart(
[`<
G _ G A
Bb _ Bb G
Bb _ Bb G
<[A _ _ _] [A _ Bb A]>@4

G _ G A
<[Bb _ Bb C4] [Bb _ Bb G]>@4
<[D4 _ D4 Bb] [A _ A F]>@4
<[C4 _ Bb A] [G _ _ _]>@4>`.fast(8),
`<[G - G -]@3 <<G Ab> F>>`.fast(8),
`<[G# - G# -]@3 <<G B> <A C4>>>`.fast(8),
`<
<
  [[G# Eb4]@3 D4 [C4 Bb]@3 Bb [C4 G]@3 [G# Eb4]@3 D4 _]
  [[Eb4 G#]@3 Eb4 _ D4 C4 Bb [G Bb]@3 G F@4]
>@16
<
  [[Eb4 G#]@3 Eb4 _ D4 Eb4 C4 D4@4]
  [[G Ab]@3 [Bb C4]@3 D4 Eb4 F4@4]
>@12
>`.fast(8),
`G4`
])).add(note(12))
.s("sqr").transpose(keytrans)
.clip(.97)
.adsr("0.004:.01:.25:.1")
.gain(1/2)._scope()

$: note("<-@15 -@16 0@4 1@4 0@4 1@4 -@14 ->*2".pickRestart(["<g5 ->", "<g#5 ->"]))
.late(1/8).transpose(keytrans)
.vib(5).vibmod(.7)
.att(2)
.rel(2)
.s("tri")
.fm(.3)
.gain(.4)
.pan(.5).lfo({s:.7, dep:3})._scope()

$: n("[2 3 5 7 9]*<16@2 8@2>").pan("[.1 .9 .3 .7 .5]*<16@2 8@2>").early(1/32).set(chords).voicing()
.mask("<0@15 0@16 0@8 1@8 1@14 1>*2")
.s("tri").transpose(keytrans)
.clip(.9)
.fm(1)
.gain(.2)._scope()

$: s("white").set.out("<0@15 0@16 1@8 1@8 2@6 1 2@7 1>*2".pickRestart([
  "[- <.05:1300:.4!3 - .05:1300:.6!4>]*8,[- <[.05 -] <[.1 .1] [.1 -]>>:<1000 2000>:<.3 .7>]*4",
  "[[.05:500 .05:1000:.2 .1:2000:.7]!2@6 .05:500 .1:1000:.2]*2",
  "[<<.1:1000:.5 .05:500> .1:2000:.7> .05:1000:.2]*8",
]).as("dec:lp:pan")).lpe(1).lpq(4).postgain(2/3).mask("<0@15 1@16 0@12 1@4 1@14 1>*2")._scope()
