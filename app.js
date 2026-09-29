"use strict";

const chapters = [...document.querySelectorAll(".chapter")];
const chapterLinks = [...document.querySelectorAll(".chapter-link")];
const progressFill = document.querySelector("#progress-fill");
const progressLabel = document.querySelector("#progress-label");
const chapterKicker = document.querySelector("#chapter-kicker");
const footerProgress = document.querySelector("#footer-progress");
const previousButton = document.querySelector("#previous-chapter");
const nextButton = document.querySelector("#next-chapter");
const startPage = document.querySelector("#start-page");
const courseLayout = document.querySelector("#course-layout");
const startButton = document.querySelector("#start-course");
const homeLink = document.querySelector(".brand");
const skipLink = document.querySelector(".skip-link");
let activeChapter = 0;
const completedChapters = new Set();

function getChapterTitle(index) {
  const heading = chapters[index].querySelector("h1").cloneNode(true);
  heading.querySelectorAll("br").forEach((lineBreak) => lineBreak.replaceWith(document.createTextNode(" ")));
  return heading.textContent.replace(/\s+/g, " ").trim();
}

function isChapterUnlocked(index) {
  return index === 0 || completedChapters.has(index - 1);
}

function showChapter(index, focusHeading = false) {
  if (index < 0 || index >= chapters.length) return;
  if (!isChapterUnlocked(index)) return;
  activeChapter = index;
  chapters.forEach((chapter, chapterIndex) => {
    chapter.classList.toggle("is-visible", chapterIndex === index);
    chapter.hidden = chapterIndex !== index;
  });
  chapterLinks.forEach((link, linkIndex) => {
    link.classList.toggle("is-active", linkIndex === index);
    link.classList.toggle("is-complete", completedChapters.has(linkIndex));
    link.disabled = !isChapterUnlocked(linkIndex);
    if (linkIndex === index) link.setAttribute("aria-current", "step");
    else link.removeAttribute("aria-current");
  });
  const number = String(index + 1).padStart(2, "0");
  chapterKicker.textContent = chapters[index].dataset.kicker;
  progressLabel.textContent = `${number} / 06`;
  progressFill.style.width = `${((index + 1) / chapters.length) * 100}%`;
  footerProgress.textContent = `${number} — 06`;
  previousButton.disabled = index === 0;
  nextButton.disabled = index === chapters.length - 1 || !completedChapters.has(index);
  previousButton.querySelector("strong").textContent = index > 0
    ? getChapterTitle(index - 1)
    : "Start here";
  nextButton.querySelector("strong").textContent = index < chapters.length - 1
    ? getChapterTitle(index + 1)
    : "Course complete";
  if (focusHeading) {
    document.querySelector("#main").focus();
    window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }
}

function completeChapter(index) {
  completedChapters.add(index);
  const link = chapterLinks[index];
  if (link) link.classList.add("is-complete");
  chapterLinks.forEach((chapterLink, linkIndex) => {
    chapterLink.disabled = !isChapterUnlocked(linkIndex);
  });
  if (activeChapter === index) nextButton.disabled = index === chapters.length - 1;
}

chapterLinks.forEach((link) => link.addEventListener("click", () => showChapter(Number(link.dataset.chapter), true)));
previousButton.addEventListener("click", () => showChapter(activeChapter - 1, true));
nextButton.addEventListener("click", () => showChapter(activeChapter + 1, true));
startButton.addEventListener("click", () => {
  startPage.hidden = true;
  courseLayout.hidden = false;
  skipLink.href = "#main";
  showChapter(0, true);
});
homeLink.addEventListener("click", (event) => {
  event.preventDefault();
  courseLayout.hidden = true;
  startPage.hidden = false;
  skipLink.href = "#start-page";
  window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  document.querySelector("#start-title").focus();
});
showChapter(0);

// GAME-01: Sort each sample into its scientific category.
const samples = [
  { id: "antibiotics", label: "Pharmaceuticals", kind: "pollutant", explanation: "medicine compounds that can remain as organic contaminants in wastewater" },
  { id: "bisphenol-a", label: "Bisphenol A", kind: "pollutant", explanation: "a synthetic organic chemical used in some plastics and resins" },
  { id: "chlorinated-organics", label: "Chlorinated organics", kind: "pollutant", explanation: "organic chemicals containing chlorine that can be treatment targets" },
  { id: "decaying-plants", label: "Decaying plants", kind: "dom", explanation: "once-living plant material that releases natural organic molecules as it breaks down" },
  { id: "animal-tissues", label: "Decaying animal tissues", kind: "dom", explanation: "organic material from once-living animals that contributes to DOM during decay" },
  { id: "microplastics", label: "Plastic waste", kind: "pollutant", explanation: "plastic particles and fragments; these are suspended particles, not dissolved organic matter" },
];
const sampleAssignments = new Map();
let selectedSample = null;
const sampleContainer = document.querySelector("#sample-items");
const sortFeedback = document.querySelector("#game1-feedback");
const sortBins = [...document.querySelectorAll(".sort-bin")];

function setFeedback(element, message, state = "") {
  element.textContent = message;
  element.classList.toggle("is-success", state === "success");
  element.classList.toggle("is-error", state === "error");
}

function renderSortingGame() {
  sampleContainer.replaceChildren();
  document.querySelector("#dom-items").replaceChildren();
  document.querySelector("#pollutant-items").replaceChildren();
  samples.forEach((sample) => {
    const button = document.createElement("button");
    const assignedBin = sampleAssignments.get(sample.id);
    button.type = "button";
    button.className = "sample-chip";
    button.textContent = sample.label;
    button.draggable = true;
    button.dataset.sample = sample.id;
    button.setAttribute("aria-pressed", String(selectedSample === sample.id));
    if (selectedSample === sample.id) button.classList.add("is-selected");
    if (assignedBin === sample.kind) button.classList.add("is-correct");
    button.addEventListener("click", () => {
      selectedSample = selectedSample === sample.id ? null : sample.id;
      if (selectedSample) setFeedback(sortFeedback, `${sample.label}: ${sample.explanation}. Choose a bin.`);
      renderSortingGame();
    });
    button.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", sample.id);
      event.dataTransfer.effectAllowed = "move";
      selectedSample = sample.id;
    });
    sampleContainer.append(button);
    if (assignedBin) {
      const pill = document.createElement("span");
      pill.className = `bin-item-pill${assignedBin === sample.kind ? "" : " incorrect"}`;
      pill.textContent = sample.label;
      document.querySelector(assignedBin === "dom" ? "#dom-items" : "#pollutant-items").append(pill);
    }
  });
  const correct = samples.filter((sample) => sampleAssignments.get(sample.id) === sample.kind).length;
  document.querySelector("#game1-progress").textContent = `${correct} / ${samples.length} sorted`;
  sortBins.forEach((bin) => bin.removeAttribute("aria-pressed"));
  if (correct === samples.length) {
    setFeedback(sortFeedback, "Perfect sort! Natural organic matter is one of the sources of DOM while the other four are pollutants!", "success");
    completeChapter(0);
  }
}

function assignSample(id, bin) {
  const sample = samples.find((item) => item.id === id);
  if (!sample) return;
  selectedSample = null;
  sampleAssignments.set(id, bin);
  if (sample.kind === bin) {
    const correct = samples.filter((item) => sampleAssignments.get(item.id) === item.kind).length;
    setFeedback(sortFeedback, correct === samples.length
      ? "Perfect sort! Natural organic matter is one of the sources of DOM while the other four are pollutants!"
      : `Correct: ${sample.label} belongs in ${bin === "dom" ? "DOM" : "target pollutants"}. ${correct} of 6 sorted correctly.`, correct === samples.length ? "success" : "");
  } else {
    setFeedback(sortFeedback, `Not quite. ${sample.label} is ${sample.kind === "dom" ? "natural dissolved organic matter" : "a target pollutant"}. Try moving it to the other bin.`, "error");
  }
  renderSortingGame();
}

sortBins.forEach((bin) => {
  bin.addEventListener("click", () => {
    if (selectedSample) assignSample(selectedSample, bin.dataset.bin);
    else setFeedback(sortFeedback, "Select or drag a sample into this bin first.");
  });
  bin.addEventListener("dragover", (event) => { event.preventDefault(); bin.classList.add("drag-over"); });
  bin.addEventListener("dragleave", () => bin.classList.remove("drag-over"));
  bin.addEventListener("drop", (event) => {
    event.preventDefault();
    bin.classList.remove("drag-over");
    assignSample(event.dataTransfer.getData("text/plain"), bin.dataset.bin);
  });
});
document.querySelector("#game1-reset").addEventListener("click", () => {
  sampleAssignments.clear();
  selectedSample = null;
  setFeedback(sortFeedback, "Choose a sample to get started.");
  renderSortingGame();
});
renderSortingGame();

// GAME-02: Build the explicit-atom graph for CH3-C(=O)-O-O-H.
const moleculeSvg = document.querySelector("#molecule-grid");
const moleculeFeedback = document.querySelector("#molecule-feedback");
const moleculeAtoms = Array(9).fill(null);
const moleculeBonds = [];
const moleculeGroupSelection = new Set();
let selectedAtom = null;
let selectedBondIndex = null;
let selectedBond = 1;
let markingGroup = false;
let armedAtom = null;
const moleculePositions = [[120, 170], [270, 170], [270, 82], [350, 170], [430, 170], [490, 170], [72, 115], [67, 224], [141, 255]];
const targetMolecule = {
  atoms: ["C", "C", "O", "O", "O", "H", "H", "H", "H"],
  bonds: [[0, 1, 1], [1, 2, 2], [1, 3, 1], [3, 4, 1], [4, 5, 1], [0, 6, 1], [0, 7, 1], [0, 8, 1]],
  group: new Set([1, 2, 3, 4, 5]),
};

function resetMolecule() {
  moleculeAtoms.fill(null);
  moleculeBonds.length = 0;
  moleculeGroupSelection.clear();
  selectedAtom = null;
  selectedBondIndex = null;
  clearArmedAtom();
  markingGroup = false;
  document.querySelector("#mark-group").setAttribute("aria-pressed", "false");
  document.querySelector("#mark-group").disabled = true;
  document.querySelector("#game2-success").hidden = true;
  renderMolecule();
  setFeedback(moleculeFeedback, "Tap an atom, then tap a box to place it.");
}

function placeAtom(index, element) {
  if (!["C", "O", "H"].includes(element) || index < 0 || index >= moleculeAtoms.length) return;
  clearArmedAtom();
  if (element !== targetMolecule.atoms[index]) {
    setFeedback(moleculeFeedback, "Try a different atom", "error");
    return;
  }
  if (moleculeAtoms[index]) {
    moleculeBonds.splice(0, moleculeBonds.length, ...moleculeBonds.filter(([a, b]) => a !== index && b !== index));
  }
  const [x, y] = moleculePositions[index];
  moleculeAtoms[index] = { element, x, y };
  moleculeGroupSelection.delete(index);
  selectedAtom = null;
  selectedBondIndex = null;
  renderMolecule();
  validateMolecule();
}

function expectedBondOrder(first, second) {
  const bond = targetMolecule.bonds.find(([a, b]) => (
    (a === first && b === second) || (a === second && b === first)
  ));
  return bond?.[2] ?? null;
}

function graphMatchesTarget() {
  if (moleculeAtoms.some((atom, index) => !atom || atom.element !== targetMolecule.atoms[index])
    || moleculeBonds.length !== targetMolecule.bonds.length
    || moleculeBonds.some(([, , order]) => order !== 1 && order !== 2)) return false;
  const actualBonds = new Map(moleculeBonds.map(([a, b, order]) => [`${Math.min(a, b)}:${Math.max(a, b)}`, order]));
  return targetMolecule.bonds.every(([a, b, order]) => actualBonds.get(`${Math.min(a, b)}:${Math.max(a, b)}`) === order);
}

function renderMolecule() {
  const children = [...moleculeSvg.children].filter((child) => !["defs", "rect"].includes(child.tagName.toLowerCase()));
  children.forEach((child) => child.remove());
  moleculeBonds.forEach((bond, bondIndex) => {
    const [first, second, order] = bond;
    const a = moleculeAtoms[first];
    const b = moleculeAtoms[second];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const length = Math.hypot(dx, dy);
    const offsets = order === 2 ? [-4, 4] : [0];
    offsets.forEach((offset) => {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      const offsetX = length ? (-dy / length) * offset : 0;
      const offsetY = length ? (dx / length) * offset : 0;
      line.setAttribute("x1", (a.x + offsetX).toString());
      line.setAttribute("y1", (a.y + offsetY).toString());
      line.setAttribute("x2", (b.x + offsetX).toString());
      line.setAttribute("y2", (b.y + offsetY).toString());
      line.setAttribute("class", `molecule-bond${order === 2 ? " is-double" : ""}${selectedBondIndex === bondIndex ? " is-selected" : ""}${moleculeGroupSelection.has(first) && moleculeGroupSelection.has(second) ? " is-marked" : ""}`);
      line.dataset.bondIndex = bondIndex.toString();
      line.setAttribute("tabindex", "0");
      line.setAttribute("role", "button");
      line.setAttribute("aria-label", `${order === 2 ? "Double" : "Single"} bond between boxes ${first + 1} and ${second + 1}`);
      line.addEventListener("click", (event) => {
        event.stopPropagation();
        selectedBondIndex = bondIndex;
        selectedAtom = null;
        renderMolecule();
        setFeedback(moleculeFeedback, "Bond selected. Remove it or connect these atoms again with the other bond setting.");
      });
      line.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          line.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        }
      });
      moleculeSvg.append(line);
    });
  });
  moleculePositions.forEach(([x, y], index) => {
    const atom = moleculeAtoms[index];
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("class", `molecule-node${atom ? ` atom-${atom.element}` : " molecule-slot-empty"}${selectedAtom === index ? " is-selected" : ""}${moleculeGroupSelection.has(index) ? " is-marked" : ""}`);
    group.setAttribute("transform", `translate(${x} ${y})`);
    group.setAttribute("tabindex", "0");
    group.setAttribute("role", "button");
    group.dataset.slotIndex = index.toString();
    group.setAttribute("aria-label", atom
      ? `${atom.element} atom in box ${index + 1}${moleculeGroupSelection.has(index) ? ", marked as part of the peracetic acid functional group" : ""}`
      : `Empty atom box ${index + 1}. Drag an atom here.`);
    const box = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    box.setAttribute("x", "-19");
    box.setAttribute("y", "-19");
    box.setAttribute("width", "38");
    box.setAttribute("height", "38");
    box.setAttribute("rx", "4");
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("y", "6");
    text.textContent = atom?.element ?? "";
    group.append(box, text);
    group.addEventListener("dragover", (event) => {
      event.preventDefault();
      group.classList.add("is-drop-target");
    });
    group.addEventListener("dragleave", () => group.classList.remove("is-drop-target"));
    group.addEventListener("drop", (event) => {
      event.preventDefault();
      event.stopPropagation();
      group.classList.remove("is-drop-target");
      placeAtom(index, event.dataTransfer.getData("text/plain"));
    });
    group.addEventListener("click", () => {
      if (armedAtom) {
        const element = armedAtom;
        armedAtom = null;
        placeAtom(index, element);
      } else if (atom) {
        selectMoleculeAtom(index);
      }
    });
    group.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (armedAtom) {
          const element = armedAtom;
          armedAtom = null;
          placeAtom(index, element);
        } else if (atom) {
          selectMoleculeAtom(index);
        }
      }
    });
    moleculeSvg.append(group);
  });
  const placed = moleculeAtoms.filter(Boolean).length;
  moleculeSvg.setAttribute("aria-label", `${placed} of 9 atoms placed in the peracetic acid structure. Drag atoms into empty boxes, then connect filled boxes.`);
}

function selectMoleculeAtom(index) {
  if (!moleculeAtoms[index]) return;
  if (markingGroup) {
    if (moleculeGroupSelection.has(index)) moleculeGroupSelection.delete(index);
    else moleculeGroupSelection.add(index);
    renderMolecule();
    checkMoleculeGroup();
    return;
  }
  if (selectedAtom === null) {
    selectedAtom = index;
    selectedBondIndex = null;
    renderMolecule();
    setFeedback(moleculeFeedback, `${moleculeAtoms[index].element} selected. Choose a second atom to connect with a ${selectedBond === 1 ? "single" : "double"} bond.`);
    return;
  }
  if (selectedAtom === index) {
    selectedAtom = null;
    renderMolecule();
    return;
  }
  const key = `${Math.min(selectedAtom, index)}:${Math.max(selectedAtom, index)}`;
  if (moleculeBonds.some(([a, b]) => `${Math.min(a, b)}:${Math.max(a, b)}` === key)) {
    setFeedback(moleculeFeedback, "Those atoms are already connected. Clear the grid to rebuild this bond.", "error");
    return;
  }
  moleculeBonds.push([selectedAtom, index, selectedBond]);
  const bondOrder = expectedBondOrder(selectedAtom, index);
  selectedAtom = null;
  selectedBondIndex = null;
  renderMolecule();
  if (bondOrder !== selectedBond) {
    setFeedback(moleculeFeedback, "Tip: Check the target structure—use one double bond and single bonds for the other connections.", "error");
  } else {
    validateMolecule();
  }
}

function validateMolecule() {
  const counts = ["C", "O", "H"].map((element) => `${moleculeAtoms.filter((atom) => atom?.element === element).length} ${element}`).join(", ");
  if (graphMatchesTarget()) {
    document.querySelector("#mark-group").disabled = false;
    if (moleculeGroupSelection.size) checkMoleculeGroup();
    else setFeedback(moleculeFeedback, "The molecular graph is correct! Now mark the carbonyl carbon, both peroxide oxygens, carbonyl oxygen, and terminal hydrogen as –COOOH.", "success");
  } else {
    document.querySelector("#mark-group").disabled = true;
    const placed = moleculeAtoms.filter(Boolean).length;
    const incorrectBond = moleculeBonds.some(([first, second, order]) => expectedBondOrder(first, second) !== order);
    if (incorrectBond) {
      setFeedback(moleculeFeedback, "Tip: Check the target structure—use one double bond and single bonds for the other connections.", "error");
    } else {
      setFeedback(moleculeFeedback, `${placed} of 9 atoms placed (${counts}); ${moleculeBonds.length} bonds added. Keep building and check the connectivity.`);
    }
  }
}

function removeSelectedMoleculeItem() {
  if (selectedBondIndex === null && selectedAtom === null) {
    setFeedback(moleculeFeedback, "Select an atom or bond to remove.");
    return;
  }
  if (selectedBondIndex !== null) {
    moleculeBonds.splice(selectedBondIndex, 1);
    selectedBondIndex = null;
    selectedAtom = null;
    renderMolecule();
    validateMolecule();
    return;
  }
  if (selectedAtom !== null) {
    const index = selectedAtom;
    moleculeAtoms[index] = null;
    moleculeBonds.splice(0, moleculeBonds.length, ...moleculeBonds.filter(([first, second]) => first !== index && second !== index));
    moleculeGroupSelection.delete(index);
    selectedAtom = null;
    selectedBondIndex = null;
    renderMolecule();
    validateMolecule();
  }
}

function checkMoleculeGroup() {
  if (!graphMatchesTarget()) return;
  const exact = targetMolecule.group.size === moleculeGroupSelection.size
    && [...targetMolecule.group].every((index) => moleculeGroupSelection.has(index));
  if (exact) {
    document.querySelector("#game2-success").hidden = false;
    setFeedback(moleculeFeedback, "Correct! The peroxyacid group is -COOOH!", "success");
    completeChapter(1);
  } else {
    document.querySelector("#game2-success").hidden = true;
    setFeedback(moleculeFeedback, `${moleculeGroupSelection.size} atom${moleculeGroupSelection.size === 1 ? "" : "s"} marked. The –COOOH group includes its carbonyl carbon and oxygen, both peroxide oxygens, and the terminal hydrogen.`, "error");
  }
}

function clearArmedAtom() {
  armedAtom = null;
  document.querySelectorAll(".atom-source").forEach((source) => {
    source.classList.remove("is-armed");
    source.setAttribute("aria-pressed", "false");
  });
}

function armAtom(source) {
  armedAtom = source.dataset.atom;
  document.querySelectorAll(".atom-source").forEach((button) => {
    const isArmed = button === source;
    button.classList.toggle("is-armed", isArmed);
    button.setAttribute("aria-pressed", String(isArmed));
  });
  setFeedback(moleculeFeedback, `${armedAtom} selected. Tap an empty box to place it.`);
}

document.querySelectorAll(".atom-source").forEach((source) => {
  source.addEventListener("dragstart", (event) => {
    event.dataTransfer.setData("text/plain", source.dataset.atom);
    event.dataTransfer.effectAllowed = "copy";
  });
  source.addEventListener("click", () => armAtom(source));
  source.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      armAtom(source);
    }
  });
});
moleculeSvg.addEventListener("dragover", (event) => {
  if (event.target.closest("[data-slot-index]")) event.preventDefault();
});
moleculeSvg.addEventListener("drop", (event) => {
  const slot = event.target.closest("[data-slot-index]");
  if (!slot) return;
  event.preventDefault();
  const element = event.dataTransfer.getData("text/plain");
  placeAtom(Number(slot.dataset.slotIndex), element);
});
document.querySelectorAll(".bond-choice").forEach((button) => button.addEventListener("click", () => {
  selectedBond = Number(button.dataset.bond);
  document.querySelectorAll(".bond-choice").forEach((choice) => {
    const selected = choice === button;
    choice.classList.toggle("is-selected", selected);
    choice.setAttribute("aria-pressed", String(selected));
  });
}));
document.querySelector("#mark-group").addEventListener("click", (event) => {
  if (!graphMatchesTarget()) {
    setFeedback(moleculeFeedback, "Complete the molecular structure before marking the –COOOH group.", "error");
    return;
  }
  markingGroup = !markingGroup;
  event.currentTarget.setAttribute("aria-pressed", String(markingGroup));
  setFeedback(moleculeFeedback, markingGroup ? "Select the five atoms in –COOOH: carbonyl C, carbonyl O, O–O, and the terminal H." : "Group marking paused. Choose the single- or double-bond tool to keep building.");
});
document.querySelector("#molecule-reset").addEventListener("click", resetMolecule);
document.querySelector("#remove-molecule-item").addEventListener("click", removeSelectedMoleculeItem);
document.querySelector("#mark-group").disabled = true;
renderMolecule();

// GAME-03: Activate PAA, create radicals, then direct them to pollutants.
const reactorSvg = document.querySelector("#reactor-svg");
const reactorTargets = [...reactorSvg.querySelectorAll(".reactor-target")];
const reactorPhase = document.querySelector("#reactor-phase");
const reactorTimer = document.querySelector("#game3-timer");
const reactorFeedback = document.querySelector("#game3-feedback");
const reactorHits = document.querySelector("#reactor-hits");
const uvTool = document.querySelector("#uv-tool");
let reactorState = null;
let reactorInterval = null;
let radicalCount = 0;
let activatedTotal = 0;
let hitTotal = 0;
let uvArmed = false;
let armedRadical = null;
let reactorEffectTimeouts = [];

function clearReactorEffectTimeouts() {
  reactorEffectTimeouts.forEach((timeout) => window.clearTimeout(timeout));
  reactorEffectTimeouts = [];
}

function scheduleReactorEffect(callback, delay) {
  const timeout = window.setTimeout(() => {
    reactorEffectTimeouts = reactorEffectTimeouts.filter((pending) => pending !== timeout);
    callback();
  }, delay);
  reactorEffectTimeouts.push(timeout);
}

function stopReactor(message, won) {
  window.clearInterval(reactorInterval);
  reactorInterval = null;
  reactorState = "finished";
  uvTool.setAttribute("draggable", "false");
  document.querySelector("#reactor-start").disabled = false;
  document.querySelector("#game3-success").hidden = !won;
  reactorPhase.textContent = won ? "Treatment sequence complete!" : "The reactor run has ended.";
  setFeedback(reactorFeedback, message, won ? "success" : "error");
  if (won) completeChapter(2);
}

function updateReactorCounts() {
  reactorHits.textContent = `PAA ${activatedTotal}/3 · TARGETS ${hitTotal}/3 · RADICALS ${radicalCount}`;
}

function activatePaa(target) {
  if (reactorState !== "activate" || !target.classList.contains("paa-target") || target.classList.contains("is-activated")) {
    setFeedback(reactorFeedback, "Drag UV onto an inactive PAA molecule.");
    return;
  }
  target.classList.add("is-activating");
  target.classList.add("is-activated");
  target.querySelector("text").textContent = "radicals";
  target.setAttribute("aria-label", `Radicals formed from PAA molecule ${target.dataset.target.at(-1)}. Click to select or drag onto an intact pollutant.`);
  target.setAttribute("draggable", "true");
  document.querySelector("#reactor-beam").classList.add("is-on");
  scheduleReactorEffect(() => {
    target.classList.remove("is-activating");
    document.querySelector("#reactor-beam").classList.remove("is-on");
  }, 650);
  radicalCount += 1;
  activatedTotal += 1;
  uvArmed = false;
  if (activatedTotal === 3) {
    reactorState = "oxidize";
    reactorPhase.textContent = "PHASE 2 — USE RADICALS FROM PAA";
    setFeedback(reactorFeedback, "Three PAA molecules activated! Click a radical label and then a pollutant, or drag a radical to a pollutant.");
  } else {
    setFeedback(reactorFeedback, "UV absorbed! The O–O bond split and radicals formed. Activate the next PAA molecule.");
  }
  updateReactorCounts();
}

function hitPollutant(target, radicalSource) {
  if (reactorState !== "oxidize" || !target.classList.contains("pollutant-target") || target.classList.contains("is-consumed")
    || target.classList.contains("is-consuming")
    || !radicalSource?.classList.contains("is-activated") || radicalSource.classList.contains("is-consumed")) {
    setFeedback(reactorFeedback, "Click or drag an available radical from PAA onto an intact pollutant.");
    return;
  }
  target.classList.add("is-consuming");
  target.setAttribute("aria-label", `Pollutant target ${target.dataset.target.at(-1)}, oxidized and removed`);
  radicalSource.classList.add("is-consumed");
  radicalCount -= 1;
  hitTotal += 1;
  uvArmed = false;
  armedRadical = null;
  scheduleReactorEffect(() => {
    target.classList.remove("is-consuming");
    target.classList.add("is-consumed");
  }, 520);
  updateReactorCounts();
  if (hitTotal === 3) stopReactor("All pollutant targets were oxidized and removed.", true);
  else setFeedback(reactorFeedback, "Target oxidized! Drag another radical to an intact pollutant.");
}

function activateFromKeyboard(target) {
  if (uvArmed) activatePaa(target);
  else if (reactorState === "oxidize" && target.classList.contains("paa-target") && target.classList.contains("is-activated")) {
    armedRadical = target;
    setFeedback(reactorFeedback, "Radical selected. Choose a pollutant target to consume it.");
  } else if (armedRadical && target.classList.contains("pollutant-target")) hitPollutant(target, armedRadical);
  else setFeedback(reactorFeedback, reactorState === "activate" ? "Select the UV photon, then choose a PAA molecule." : "Select a radical formed from PAA, then choose a pollutant.");
}

function startReactor() {
  window.clearInterval(reactorInterval);
  clearReactorEffectTimeouts();
  reactorTargets.forEach((target) => {
    target.classList.remove("is-selected", "is-activated", "is-activating", "is-hit", "is-consuming", "is-consumed");
    target.setAttribute("tabindex", "0");
    target.removeAttribute("draggable");
    if (target.classList.contains("paa-target")) target.querySelector("text").textContent = "PAA";
    else target.querySelector("text").textContent = "pollutants";
  });
  uvArmed = false;
  armedRadical = null;
  radicalCount = 0;
  activatedTotal = 0;
  hitTotal = 0;
  reactorState = "activate";
  uvTool.setAttribute("draggable", "true");
  document.querySelector("#reactor-start").disabled = true;
  document.querySelector("#game3-success").hidden = true;
  reactorTimer.textContent = "35 SECONDS";
  reactorPhase.textContent = "PHASE 1 — DRAG UV TO PAA";
  setFeedback(reactorFeedback, "Drag the UV photon onto each PAA molecule.");
  updateReactorCounts();
  let remaining = 35;
  reactorInterval = window.setInterval(() => {
    remaining -= 1;
    reactorTimer.textContent = `${remaining} SECONDS`;
    if (remaining <= 0) stopReactor("Time ran out. Restart and aim carefully—you need three activated PAA molecules and three target hits.", false);
  }, 1000);
}

reactorSvg.addEventListener("click", (event) => {
  const target = event.target.closest(".reactor-target");
  if (target) activateFromKeyboard(target);
});
reactorSvg.addEventListener("keydown", (event) => {
  const target = event.target.closest(".reactor-target");
  if (target && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    activateFromKeyboard(target);
  }
});
document.querySelector("#reactor-start").addEventListener("click", startReactor);
uvTool.addEventListener("dragstart", (event) => {
  if (reactorState !== "activate") {
    event.preventDefault();
    return;
  }
  event.dataTransfer.setData("text/plain", "uv");
  event.dataTransfer.effectAllowed = "copy";
});
uvTool.addEventListener("click", () => {
  if (reactorState === "activate") {
    uvArmed = true;
    armedRadical = null;
    setFeedback(reactorFeedback, "UV selected. Choose a PAA molecule to activate it.");
  }
});
uvTool.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    uvTool.click();
  }
});
reactorSvg.addEventListener("dragover", (event) => {
  if (event.target.closest(".reactor-target")) event.preventDefault();
});
reactorSvg.addEventListener("dragstart", (event) => {
  const radicalSource = event.target.closest(".paa-target.is-activated");
  if (!radicalSource || reactorState !== "oxidize") return;
  event.dataTransfer.setData("text/plain", `radical:${radicalSource.dataset.target}`);
  event.dataTransfer.effectAllowed = "move";
});
reactorSvg.addEventListener("drop", (event) => {
  const target = event.target.closest(".reactor-target");
  if (!target) return;
  event.preventDefault();
  const action = event.dataTransfer.getData("text/plain");
  if (action === "uv") activatePaa(target);
  else if (action.startsWith("radical:")) {
    const source = reactorTargets.find((item) => item.dataset.target === action.slice("radical:".length));
    hitPollutant(target, source);
  }
});
document.querySelector("#reactor-reset").addEventListener("click", () => {
  window.clearInterval(reactorInterval);
  clearReactorEffectTimeouts();
  reactorInterval = null;
  reactorState = null;
  uvArmed = false;
  armedRadical = null;
  radicalCount = 0;
  activatedTotal = 0;
  hitTotal = 0;
  reactorTargets.forEach((target) => {
    target.classList.remove("is-selected", "is-activated", "is-activating", "is-hit", "is-consuming", "is-consumed");
    target.setAttribute("tabindex", "-1");
    target.removeAttribute("draggable");
    if (target.classList.contains("paa-target")) {
      target.querySelector("text").textContent = "PAA";
      target.setAttribute("aria-label", `PAA molecule ${target.dataset.target.at(-1)}, inactive`);
    } else {
      target.querySelector("text").textContent = "pollutants";
      target.setAttribute("aria-label", `Pollutant target ${target.dataset.target.at(-1)}, intact`);
    }
  });
  document.querySelector("#reactor-beam").classList.remove("is-on");
  document.querySelector("#reactor-start").disabled = false;
  uvTool.setAttribute("draggable", "false");
  document.querySelector("#game3-success").hidden = true;
  reactorTimer.textContent = "READY WHEN YOU ARE";
  reactorPhase.textContent = "The reactor is waiting.";
  setFeedback(reactorFeedback, "Start the reactor, then drag UV photons to PAA molecules.");
  updateReactorCounts();
});
document.querySelector("#reactor-reset").click();

// GAME-04: A transparent, monotonic teaching model of radical competition.
const sliders = {
  dom: document.querySelector("#dom-slider"),
  paa: document.querySelector("#paa-slider"),
  uv: document.querySelector("#uv-slider"),
};
Object.entries(sliders).forEach(([name, slider]) => slider.addEventListener("input", () => {
  document.querySelector(`#${name}-value`).value = slider.value;
  const feedback = document.querySelector("#simulation-feedback");
  if (document.querySelector("#removal-value").textContent !== "—") {
    setFeedback(feedback, "Settings changed. Run the simulation to update the result.");
    feedback.classList.remove("is-success", "is-error");
  }
}));
document.querySelector("#run-simulation").addEventListener("click", () => {
  const dom = Number(sliders.dom.value);
  const paa = Number(sliders.paa.value);
  const uv = Number(sliders.uv.value);
  const removal = Math.round((1 - dom / 100) * (paa / 100) * (uv / 100) * 100);
  document.querySelector("#removal-value").textContent = String(removal);
  document.querySelector("#result-fill").style.width = `${removal}%`;
  document.querySelector(".result-meter").setAttribute("aria-valuenow", String(removal));
  const feedback = document.querySelector("#simulation-feedback");
  if (removal >= 80) {
    setFeedback(feedback, "success!", "success");
    completeChapter(3);
  } else {
    setFeedback(feedback, "Below the 80% learning target.", "error");
  }
});

// GAME-05: Identify the model decarboxylation reaction.
document.querySelectorAll("[data-reaction]").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll("[data-reaction]").forEach((choice) => choice.classList.toggle("is-selected", choice === button));
  if (button.dataset.reaction === "decarboxylation") {
    setFeedback(document.querySelector("#game5-feedback"), "Exactly. Decarboxylation removes the –COOH group; its carbon and two oxygens leave together as CO₂.", "success");
    completeChapter(4);
  } else {
    setFeedback(document.querySelector("#game5-feedback"), "Not this time. Track the carbon in the departing –COOH group: it appears in the CO₂ product.", "error");
  }
}));

// GAME-06: Scroll through five questions; score answers as they are selected.
const quizQuestions = [
  {
    question: "What structural feature makes PAA more reactive than ethanoic acid?",
    answers: ["A carbon–carbon bond", "The hydroxyl group", "The peroxide O–O bond", "A hydrogen atom"],
    correct: 2,
  },
  {
    question: "What is UV’s role in UV/PAA treatment?",
    answers: ["To cool the reactor", "To activate PAA and generate radicals", "To remove DOM directly", "To add oxygen to water"],
    correct: 1,
  },
  {
    question: "What are radicals?",
    answers: ["Stable molecules", "Highly unstable species that formed under UV attack", "Pollutants", "DOM"],
    correct: 1,
  },
  {
    question: "What can increasing DOM do during UV/PAA treatment?",
    answers: ["Increase removal by reacting with pollutants", "Have no effect", "Decrease pollutant removal by competing for oxidants", "Stop UV from entering the water"],
    correct: 2,
  },
  {
    question: "What does oxygen addition mean?",
    answers: ["Removal of oxygen atoms", "Addition of oxygen-containing groups to molecules", "Addition of CO₂-containing groups", "Conversion of DOM into PAA"],
    correct: 1,
  },
];
let quizAnswers = Array(quizQuestions.length).fill(null);
let quizCompleted = false;
const quizArea = document.querySelector("#quiz-area");
const quizFeedback = document.querySelector("#quiz-feedback");
const quizReset = document.querySelector("#quiz-reset");
const quizProgress = document.querySelector("#quiz-progress");

function renderQuiz() {
  quizArea.replaceChildren();
  quizReset.hidden = true;
  quizFeedback.textContent = `0 of ${quizQuestions.length} answered · Current score: 0 / ${quizQuestions.length}.`;
  quizFeedback.classList.remove("is-success", "is-error");

  quizQuestions.forEach((item, questionIndex) => {
    const card = document.createElement("section");
    card.className = "quiz-question-card";
    card.setAttribute("aria-labelledby", `quiz-question-${questionIndex + 1}`);
    const question = document.createElement("h3");
    question.className = "quiz-question";
    question.id = `quiz-question-${questionIndex + 1}`;
    question.textContent = `${questionIndex + 1}. ${item.question}`;
    const answers = document.createElement("div");
    answers.className = "quiz-answers";
    answers.setAttribute("role", "group");
    answers.setAttribute("aria-label", `Question ${questionIndex + 1} answer choices`);
    item.answers.forEach((answer, answerIndex) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "quiz-answer";
      button.setAttribute("aria-pressed", "false");
      const letter = document.createElement("span");
      letter.className = "quiz-letter";
      letter.textContent = String.fromCharCode(65 + answerIndex);
      const label = document.createElement("span");
      label.textContent = answer;
      button.append(letter, label);
      button.addEventListener("click", () => {
        quizAnswers[questionIndex] = answerIndex;
        updateQuiz();
      });
      answers.append(button);
    });
    const feedback = document.createElement("p");
    feedback.className = "quiz-answer-feedback";
    card.append(question, answers, feedback);
    quizArea.append(card);
  });
  updateQuiz();
}

function updateQuiz() {
  const answeredCount = quizAnswers.filter((answer) => answer !== null).length;
  const score = quizAnswers.reduce((total, answer, index) => (
    total + (answer === quizQuestions[index].correct ? 1 : 0)
  ), 0);
  quizProgress.textContent = `${answeredCount} OF ${quizQuestions.length} ANSWERED`;
  quizArea.querySelectorAll(".quiz-question-card").forEach((card, questionIndex) => {
    const selectedAnswer = quizAnswers[questionIndex];
    const item = quizQuestions[questionIndex];
    const choices = [...card.querySelectorAll(".quiz-answer")];
    choices.forEach((choice, answerIndex) => {
      choice.classList.toggle("is-selected", answerIndex === selectedAnswer);
      choice.classList.toggle("is-correct", selectedAnswer === answerIndex && answerIndex === item.correct);
      choice.classList.toggle("is-wrong", selectedAnswer === answerIndex && answerIndex !== item.correct);
      choice.setAttribute("aria-pressed", String(answerIndex === selectedAnswer));
    });
    const feedback = card.querySelector(".quiz-answer-feedback");
    if (selectedAnswer === null) {
      feedback.textContent = "";
      feedback.classList.remove("is-success", "is-error");
    } else if (selectedAnswer === item.correct) {
      setFeedback(feedback, "Correct. That’s right.", "success");
    } else {
      setFeedback(feedback, "Not quite. Give it another thought.", "error");
    }
  });

  const result = quizArea.querySelector(".quiz-result");
  if (answeredCount === quizQuestions.length) {
    if (!result) {
      const resultCard = document.createElement("div");
      resultCard.className = "quiz-result";
      const resultScore = document.createElement("div");
      resultScore.className = "quiz-result-score";
      const resultMessage = document.createElement("p");
      resultCard.append(resultScore, resultMessage);
      quizArea.append(resultCard);
    }
    const finalResult = quizArea.querySelector(".quiz-result");
    finalResult.querySelector(".quiz-result-score").textContent = `${score} / ${quizQuestions.length}`;
    finalResult.querySelector("p").textContent = score === quizQuestions.length
      ? "Brilliant work—you followed the chemistry all the way through. Keep asking good questions about the water around you."
      : score >= 3
        ? "Nice work. You have the main story; revisit any chapter you would like to explore again."
        : "Every water sample has another story to teach. Review a chapter, then give the quiz another try.";
    quizReset.hidden = false;
    setFeedback(quizFeedback, `Final score: ${score} out of ${quizQuestions.length}. You can change answers or retake the quiz.`, "success");
    if (!quizCompleted) completeChapter(5);
    quizCompleted = true;
  } else {
    result?.remove();
    quizReset.hidden = true;
    quizFeedback.textContent = `${answeredCount} of ${quizQuestions.length} answered · Current score: ${score} / ${quizQuestions.length}.`;
    quizFeedback.classList.remove("is-success", "is-error");
  }
}

quizReset.addEventListener("click", () => {
  quizAnswers = Array(quizQuestions.length).fill(null);
  quizCompleted = false;
  renderQuiz();
});
renderQuiz();

// All figures share a keyboard-accessible native dialog for a full-screen view.
const lightbox = document.querySelector("#image-lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const lightboxCaption = document.querySelector("#lightbox-caption");
const lightboxClose = document.querySelector(".lightbox-close");
let lightboxOpener = null;
document.querySelectorAll(".image-open").forEach((button) => button.addEventListener("click", () => {
  const image = button.querySelector("img");
  const caption = button.closest("figure")?.querySelector("figcaption")?.textContent.trim() ?? button.getAttribute("aria-label");
  lightboxOpener = button;
  document.querySelector("#lightbox-title").textContent = button.dataset.image ?? "ILLUSTRATION";
  lightboxImage.src = image.src;
  lightboxImage.alt = image.alt;
  lightboxCaption.textContent = caption;
  lightbox.showModal();
  lightboxClose.focus();
}));
lightboxClose.addEventListener("click", () => lightbox.close());
lightbox.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && lightbox.open) lightbox.close();
});
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.close();
});
lightbox.addEventListener("close", () => lightboxOpener?.focus());
