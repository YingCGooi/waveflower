/*
util.mjs - <short description TODO>
Copyright (C) 2022 Strudel contributors - see <https://codeberg.org/uzu/strudel/src/branch/main/packages/core/util.mjs>
This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details. You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

// returns true if the given string is a note
const isNoteWithOctave = (name) => /^[a-gA-G][#bsf]*[0-9]*$/.test(name);
const isNote = (name) => /^[a-gA-G][#bsf]*-?[0-9]*$/.test(name);
const tokenizeNote = (note) => {
  if (typeof note !== "string") {
    return [];
  }
  const [pc, acc = "", oct] =
    note.match(/^([a-gA-G])([#bsf]*)(-?[0-9]*)$/)?.slice(1) || [];
  if (!pc) {
    return [];
  }
  return [pc, acc, oct ? Number(oct) : undefined];
};

const chromas = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
const accs = { "#": 1, b: -1, s: 1, f: -1 };

const getAccidentalsOffset = (accidentals) => {
  return accidentals?.split("").reduce((o, char) => o + accs[char], 0) || 0;
};

// turns the given note into its midi number representation
const noteToMidi = (note, defaultOctave = 3) => {
  const [pc, acc, oct = defaultOctave] = tokenizeNote(note);
  if (!pc) {
    throw new Error('not a note: "' + note + '"');
  }
  const chroma = chromas[pc.toLowerCase()];
  const offset = getAccidentalsOffset(acc);
  return (Number(oct) + 1) * 12 + chroma + offset;
};
const midiToFreq = (n) => {
  return Math.pow(2, (n - 69) / 12) * 440;
};

const freqToMidi = (freq) => {
  return (12 * Math.log(freq / 440)) / Math.LN2 + 69;
};

const valueToMidi = (value, fallbackValue) => {
  if (typeof value !== "object") {
    throw new Error("valueToMidi: expected object value");
  }
  let { freq, note } = value;
  if (typeof freq === "number") {
    return freqToMidi(freq);
  }
  if (typeof note === "string") {
    return noteToMidi(note);
  }
  if (typeof note === "number") {
    return note;
  }
  if (!fallbackValue) {
    throw new Error("valueToMidi: expected freq or note to be set");
  }
  return fallbackValue;
};

const pcs = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "Bb", "B"];
/**
 * @deprecated only used in workshop (first-notes)
 * @noAutocomplete
 */
const midiToNote = (n) => {
  const oct = Math.floor(n / 12) - 1;
  const pc = pcs[n % 12];
  return pc + oct;
};

// code hashing helpers
function unicodeToBase64(text) {
  const utf8Bytes = new TextEncoder().encode(text);
  const base64String = btoa(String.fromCharCode(...utf8Bytes));
  return base64String;
}

function base64ToUnicode(base64String) {
  const utf8Bytes = new Uint8Array(
    atob(base64String)
      .split("")
      .map((char) => char.charCodeAt(0))
  );
  const decodedText = new TextDecoder().decode(utf8Bytes);
  return decodedText;
}

function codeTohash(code) {
  return encodeURIComponent(unicodeToBase64(code));
  //return '#' + encodeURIComponent(btoa(code));
}

function hashTocode(hash) {
  return base64ToUnicode(decodeURIComponent(hash));
  //return atob(decodeURIComponent(codeParam || ''));
}

// other functions for helping waveflower
function infoLog(msg = "") {
  console.info("[waveflower] " + msg);
}

function $(selector = "") {
  return document.querySelector(selector);
}
function $all(selector = "") {
  return document.querySelectorAll(selector);
}

function hasAny(arr = [], callback = () => {}) {
  let has = false;
  arr.forEach((v) => {
    if (callback(v)) {
      has = true;
    }
  });
  return has;
}
