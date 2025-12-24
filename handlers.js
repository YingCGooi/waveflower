const manager = new AudioSourceManager();
window.onload = () => {
  if (params.get("repl")) {
    manager.setREPL($("#repl").editor);
  }
};
const visualizer = new Visualizer("#canvases", MAIN_CLASS, manager.analyzer);
let lastAnimationID = 0;

window.onresize = () => {
  visualizer.resetCanvasElements();
  visualizer.resize();
};

const base = $("[name=base]");
base.value = ENV.baseFrequency;
base.onchange = (e) => {
  ENV.baseFrequency = Number(e.target.value);
  if (ENV.baseFrequency > 110) {
    ENV.fftSize / 2;
  }
  let v = visualizer;
  v.resetCanvasElements();
  v.resize();
  infoLog(`base period set to 1/${e.target.value}s`);
};

const freqInput = $("input[name=freq]");
freqInput.value = ENV.baseFrequency; // reset to base frequency at start
freqInput.onchange = (e) => manager.setOSCfreq(freqInput.value);

const drawFrames = (currentTime) => {
  if (manager.isOSCplaying || manager.isFileplaying) {
    visualizer.clear();
    visualizer.draw();
    lastAnimationID = requestAnimationFrame(drawFrames); // recurse
  }
  return lastAnimationID;
};

$("#fileinput").onchange = (event) => {
  const r = new FileReader();
  r.readAsArrayBuffer(event.target.files[0]);
  r.onload = (e) => {
    manager.ctx.decodeAudioData(
      e.target.result,
      (buffer) => manager.updateBuffer(buffer),
      (err) => console.error(err)
    );
  };
};

$all("input[name=osc]").forEach((radio) => {
  radio.onchange = (e) => {
    if (e.target.checked) {
      manager.setOSCtype(e.target.value);
    }
  };
});

$("#play").addEventListener("click", (e) => {
  visualizer.calculateColorSteps(
    new Color(ENV.lineColorStart),
    new Color(ENV.lineColorEnd)
  );
  if (manager.replHasCode()) {
    manager.playREPL(() => {});
    setTimeout(() => {
      const visualizers = [];
      for (k in analysers) {
        if (Object.hasOwn(analysers, k)) {
          visualizers.push(new Visualizer(null, analysers[k]));
        }
      }
      drawFrames();
    }, ENV.analyzerWaitDelayMs); // wait for 'analysers' object to initialize
    return;
  }
  if ($("#fileinput").value !== "" && !manager.isFileplaying) {
    infoLog("file buffer start");
    manager.playBuffer();
    drawFrames();
    return;
  } else if (!manager.isOSCplaying) {
    infoLog("osc start");
    manager.setOSCtype($("input[name=osc]:checked").value);
    manager.setOSCfreq(freqInput.value);
    manager.playOSC();
    drawFrames();
    return;
  }
});

$("#stop").addEventListener("click", (e) => {
  const f = $("#fileinput");
  if (f.value !== "") {
    f.value = "";
  }
  manager.isREPLplaying && manager.stopREPL();
  manager.isOSCplaying && manager.stopOSC();
  manager.isFileplaying && manager.stopBuffer();
  infoLog("stop");
  cancelAnimationFrame(lastAnimationID);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "F2" && !document.fullscreenElement) {
    $("#canvases").requestFullscreen();
  }
  if (e.key == "ESC") {
    document.exitFullscreen?.();
  }
});
