const MAIN_CLASS = "main";
let replVisualizers = [];
let intervalID = 0;
let lastAnimationID = 0;

window.onload = () => {
  let urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("repl")) {
    manager.setREPL($("#repl").editor);
  }
  let u = window.location.href;
  const parts = u.split("#");
  if (parts.length > 1) {
    const code = hashTocode(parts[parts.length - 1]);
    $(".cm-content").textContent = code;
  }
  const base = $("[name=base]");
  base.value = ENV.baseFrequency;
};

const manager = new AudioSourceManager();
const visualizer = new Visualizer(MAIN_CLASS, manager.analyzer);

window.onresize = () => {
  visualizer.resetCanvasElements();
  visualizer.resize();
};

const base = $("[name=base]");
base.value = ENV.baseFrequency;
base.onchange = (e) => {
  ENV.baseFrequency = Number(e.target.value);
  if (ENV.baseFrequency > 110 && ENV.fftSize > 1024) {
    ENV.fftSize = ENV.fftSize / 2;
  }
  if (ENV.baseFrequency <= 110 && ENV.fftSize < 2048) {
    ENV.fftSize = ENV.fftSize * 2;
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
  if (manager.isREPLplaying) {
    replVisualizers.forEach((v) => {
      v.clear();
      v.draw();
    });
    lastAnimationID = requestAnimationFrame(drawFrames);
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
    replVisualizers = []; // reset temp array
    intervalID = setInterval(() => {
      for (k in analysers) {
        if (!Object.hasOwn(analysers, k)) {
          continue;
        }
        const has = !hasAny(replVisualizers, (v) => v.canvasClass === k);
        if (!hasAny(replVisualizers, (v) => v.canvasClass === k)) {
          replVisualizers.push(new Visualizer(k, analysers[k]));
        }
        analysers[k].fftSize = ENV.fftSize;
        analysers[k].sampleRate = ENV.sampleRate;
      }
    }, 100);
    setTimeout(() => {
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
  clearInterval(intervalID);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "F2" && !document.fullscreenElement) {
    $("#canvases").requestFullscreen();
  }
  if (e.key == "ESC") {
    document.exitFullscreen?.();
  }
});
