ENV.blurFactor = 0.7
ENV.hueOffsets = 90

setcpm(100/4)
const seq = `<
[C2,C] [C,E4] [E,G4] [E,G,C4]
[A2,A] [A2,E] [C,A]  [E4,A,C]
[F2,C] [C,F]  [C,F,A] [F,C4,A4]
[G,D] [G,B] [G,B,D4] [G,B4,G4]
[C2,G,C4]@2 [C2, C]@2
>`
const JI = {
  C2: 0,D2: +0.039,
  E2: -0.137,F2: -0.02,
  G2: +0.02,A2: -0.156,B2: -0.117,C: 0,D: +0.039,E: -0.137,F: -0.02,G: +0.02,
  A: -0.156,B: -0.117,C3: 0,D3: +0.039,
  E3: -0.07,F3: -0.02,
  G3: +0.02,A3: -0.156,B3:-0,C4: 0,D4: +0.039,
  E4: -0,
  F4: -0.02,G4: +0.02,A4: -0.156,B4: -0,C5: 0,
};
Pattern.prototype.jitrans = function(seq) {
  return this.add(note(0)).transpose(seq.pick(JI))
}

all(x=>x.att(1/128).postgain(2/3))
$:seq.note().mask(`<1 0 0 0 1>`.slow(4))
  .s("sawtooth").set.mix("<.8 .8 .8 .67>".vel())
  .jitrans(seq).gain(1/2)
  ._scope()
$:seq.note().mask(`<0 1 0 0 0>`.slow(4))
  .s("z_tan").set.mix("<.8 1 1 .67>".vel())
  .jitrans(seq).gain(1/2)
  ._scope()

$:seq.note().mask(`<0 0 0 1 0>`.slow(4))
  .s("z_tan").set.mix("<.8 1 .67 .67>".vel())
  .jitrans(seq).gain(1/2)
  ._scope()
$:seq.note().mask(`<0 0 1 0 0>`.slow(4))
  .s("z_tan").set.mix("<1 1 .67 .67>".vel())
  .jitrans(seq).gain(1/2)
  ._scope()

