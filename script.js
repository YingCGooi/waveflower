class Text {
  constructor(text = '') {
    this.text = text;
  }
  toString() {
    return this.text;
  }
  type() {
    return 'String';
  }
  toHTML() {
    return '<p>' + this.text + '</p>';
  }
}
class Gooi {
  static waveflower = 'https://waveflower.org/assets/waveflowericon.webp';
  constructor() {
    this.about = new Text(
      'Waveflower.org is an educational visualization platform for music theory and audio signal processing.',
    );
  }
  about() {
    return this.about;
  }
  background() {
    return new Text();
  }
}

const gooi = new Gooi();
for (k in gooi) {
  document.querySelector('#' + k).innerHTML = gooi[k].toHTML();
}
