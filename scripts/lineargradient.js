function lineargradient(stops = [], steps, freq, next, alpha, hue, hueStep, w, wmul = 0.1, mode = 'to bottom') {
  const freqStops = {
    [16000]: 4.4,
    [8000]: 12.3,
    [4000]: 20.6, // 5 *32 2^5
    [2000]: 28.9, // 4 *16 2^4
    [1000]: 37.2, // 3 *8 2^3 => 3 * -8.29
    [500]: 45.4, // 2 *4 2^2 => 2 * -8.29
    [250]: 53.7, // 1 *2 2^1 => -8.29
    [125]: 62, // use as base
    [62.5]: 70.3,
  };
  // only construct a stops array if not provided
  if (stops.length === 0) {
    for (let i = 0; i < steps; i++) {
      let width = next < 1 ? w + wmul * i : w * steps - wmul * i;
      stops.push([freq, 'oklch(.7 .2 ' + hue + '/' + alpha + ')', width]);
      hue += hueStep;
      freq *= next;
    }
  }
  stops = stops.sort(([fa], [fb]) => fb - fa); // ensure stops are sorted in descending order
  return (
    'linear-gradient(' +
    mode +
    ',' +
    stops
      .map(([freq, color, w]) => {
        if (!w) {
          w = 1 / 2;
        }
        let stop = freqStops[freq] || 70.3 - 8.29 * Math.log2(freq / 62.5);
        return [
          '#0000 ' + Number(stop - w).toFixed(2) + '%',
          color + ' ' + stop + '%',
          '#0000 ' + Number(stop + w).toFixed(2) + '%',
        ].join(',');
      })
      .join(',') +
    ')'
  );
}

// @name: useSpectrum(<Object> config | <Array> stops)

// @param: <Object> config
// @param: lines <Int> : generate up to number of lines
// @param: base <Int> : start frequency to draw line
// @param: next <Number> : subsequent frequency will multiply by this multiplier
// @param: alpha <Number> : transparency of lines
// @param: hue <Int> : starting hue ranges between 0-360
// @param: hueStep <Int> : hue spacing between each subsequent hue, lower numbers mean colors will be closer
// @param: thickness <Number> : line thickness (in px)
// @param: mul <Number> : subsequent line thickness multiplier, positive => subsequently thicker lines
//
// @param: <Array> stops, an array of stops with this following format
// @param: <Array> stop : [frequency <Int>, CSScolor <string>, thickness <Number (optional)>]
// @example:
// useSpectrum({lines:4, base:1000, next:1/2, hue:40, hueStep:40, alpha:1});
// // OR
// useSpectrum([
//   [1000,'oklch(.7 .2 40/1)',1],
//   [250, 'oklch(.7 .2 120/1)',1],
// ]);
//
// $:freq("<125 250 500 1000 2000 4000>*4").s("sine")
//   .color("<blue cyan green yellow orange red>*4")
//   .gain("<6 5 4 3 2 1>*4".div(4))._spectrum({width:800,speed:4})
window.useSpectrum = function (opts) {
  let stops = [];
  const { lines = 7, base = 8000, next = 1 / 2, alpha = 1, hue = 40, hueStep = 40, thickness = 0.1, mul = 0.2 } = opts;
  if (Array.isArray(opts)) {
    stops = opts;
  }
  document
    .querySelectorAll('style')
    .forEach((n) =>
      n.append(
        '#pre, .cm-widget-container>canvas{' +
          'position:relative;' +
          'transform: scaleY(175%) translateY(7%);' +
          'z-index:-1;' +
          'filter:saturate(1.5);' +
          'background:' +
          lineargradient(stops, lines, base, next, alpha, hue, hueStep, thickness, mul) +
          '}',
      ),
    );
};
