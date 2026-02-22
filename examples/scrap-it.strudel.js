// @title Scrap It (2026 version)
// @by Gooi <https://transynergyc.bandcamp.com/track/scrap-it>
// @genre melody trance
// @details original track transscribed into Strudel
const filtenv = (start, end, cycles = 16) =>
  start < end
    ? saw.rangex(start, end).slow(cycles)
    : saw.rev().range(end, start).slow(cycles);

const highnotes = note("[[d#5,Bb5] ~] * 4").lpf(6000).hpf(330).gain(0.33);

const introA = cat(
  "d#4 Bb4 d#5 Bb4 f5  Bb4 d#5 Bb4",
  "d#4 Bb4 f5  Bb4 d#5 Bb4 d5  d#5",
  "g#4 Bb4 d#5 Bb4 f5  Bb4 d#5 Bb4",
  "g#4 Bb4 d#5 Bb4 f5  Bb4 <d#5 f5> <d5 g5>"
)
  .note()
  .s("piano");

const introB = cat(
  "d#4 Bb4 d#5 Bb4 f5  Bb4 d#5 <d5 Bb4>",
  "d#4 Bb4 f5  Bb4 d#5 Bb4 d5 d#5",
  "g#4 Bb4 d#5 Bb4 f5 Bb4 f5  Bb4",
  "g5  Bb4 g5 Bb4 g#5 Bb4 g#5 <g5 Bb5>"
)
  .note()
  .s("piano")
  .gain(1.2);

$: arrange(
  [8, introA.lpf(filtenv(220, 12000, 8)).gain(filtenv(2, 1, 8))._scope()],
  [8, introB._scope()]
);

$: arrange([16, highnotes.lpf(filtenv(220, 6000, 16))._scope()]);
