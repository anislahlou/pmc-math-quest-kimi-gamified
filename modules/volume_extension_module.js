(function (root) {
  "use strict";

  const ROUND_LENGTH = 12;

  // Maps each classic to a registry skill so the skill-coverage gate can
  // verify the bank covers every skill the registry promises.
  // Registry skills: ["Layer maps", "Tunnel overlap", "Height maps",
  // "Views", "Cube displacement"].
  const CLASSIC_SKILLS = {
    "layer-count-core": "Layer maps",
    "layer-map-sum": "Layer maps",
    "adjacent-cube-build": "Layer maps",
    "cross-tunnel-overlap": "Tunnel overlap",
    "side-slice-tunnel": "Tunnel overlap",
    "height-map-volume": "Height maps",
    "staircase-stack": "Height maps",
    "front-left-view": "Views",
    "view-rebuild": "Views",
    "reverse-missing-layer": "Layer maps",
    "water-cube-rise": "Cube displacement",
    "compare-layer-solids": "Cube displacement"
  };

  const CLASSICS = [
    {
      id: "layer-count-core",
      nickname: "Layer Count",
      skill: "Count a cube solid one layer at a time, subtracting the removed squares in each layer.",
      sourcePages: "Book 101-102 / PDF 111-112",
      // Cube size, layer count, and hole positions vary per variant by design — counting differently shaped solids IS the lesson.
      variantStability: false
    },
    {
      id: "layer-map-sum",
      nickname: "Layer Map Sum",
      skill: "Use a separate top-view grid for each layer, then add the kept cubes.",
      sourcePages: "Book 102, 106, 108 / PDF 112, 116, 118",
      // Number and shape of layer plans varies per variant by design — each set teaches reading a different cube configuration.
      variantStability: false
    },
    {
      id: "adjacent-cube-build",
      nickname: "Adjacent Cubes",
      skill: "Count connected cube towers that touch side-to-side without losing hidden cubes.",
      sourcePages: "Book 104, 118 / PDF 114, 118",
      // Plan-view grid size and tower heights vary per variant by design — counting differently shaped connected towers IS the lesson.
      variantStability: false
    },
    {
      id: "cross-tunnel-overlap",
      nickname: "Tunnel Overlap",
      skill: "Subtract tunnels through a cube without double-counting the cube where tunnels meet.",
      sourcePages: "Book 103 / PDF 113",
      // Cube size (3-6) and tunnel-axis count (2 or 3) vary per variant by design — visualising different overlap configurations IS the lesson.
      variantStability: false
    },
    {
      id: "side-slice-tunnel",
      nickname: "Side Slice Tunnel",
      skill: "Treat a straight tunnel as a repeated missing rectangular slice.",
      sourcePages: "Book 103, 107 / PDF 113, 117",
      // Cuboid dimensions and tunnel cross-section vary per variant by design — each variant is a different cuboid shape.
      variantStability: false
    },
    {
      id: "height-map-volume",
      nickname: "Height Map",
      skill: "Read plan-view numbers as tower heights and add all the towers.",
      sourcePages: "Book 104 / PDF 114",
      // Plan-view grid size and per-cell tower heights vary per variant by design — reading different tower-grid shapes IS the lesson.
      variantStability: false
    },
    {
      id: "staircase-stack",
      nickname: "Stair Stack",
      skill: "Count a stepped solid by adding layer rows or by using triangular totals.",
      sourcePages: "Book 104-105 / PDF 114-115",
      // Staircase level count (3-6) and length vary per variant by design — each variant is a different stepped solid.
      variantStability: false
    },
    {
      id: "front-left-view",
      nickname: "Front & Left Views",
      skill: "Read a tower plan from the front or the left by taking the tallest tower in each column or row.",
      sourcePages: "Book 105 / PDF 115",
      // Plan-view grid size, tower heights, and which view (front vs left) the variant asks for vary by design.
      variantStability: false
    },
    {
      id: "view-rebuild",
      nickname: "View Rebuild",
      skill: "Use front, left, and plan views to rebuild a cube solid before counting it.",
      sourcePages: "Book 105, 109 / PDF 115, 119",
      // Plan-view grid size and tower heights vary per variant by design — each variant is a different solid to rebuild.
      variantStability: false
    },
    {
      id: "reverse-missing-layer",
      nickname: "Reverse Missing",
      skill: "Work backwards from the total volume to find how many cubes were removed from each layer.",
      sourcePages: "Book 106-108 / PDF 116-118",
      // Cube size (3-6) and layer count (3-5) vary per variant by design — reverse-engineering different cube shapes IS the lesson.
      variantStability: false
    },
    {
      id: "water-cube-rise",
      nickname: "Cube Displacement",
      skill: "Convert a counted cube solid into displaced volume, then find the water rise or new level.",
      sourcePages: "Book 113 / PDF 123-125"
    },
    {
      id: "compare-layer-solids",
      nickname: "Compare Solids",
      skill: "Compare two layer-built solids by counting each one, not by trusting which drawing looks bigger.",
      sourcePages: "Book 108-112 / PDF 118-122"
    }
  ];

  const CLASSIC_IDS = CLASSICS.map((classic) => classic.id);
  const CLASSIC_BY_ID = Object.fromEntries(CLASSICS.map((classic) => [classic.id, classic]));

  const SOURCE_COVERAGE = {
    "layer-count-core": ["In Class first model: cube counted layer by layer with removed cells marked X"],
    "layer-map-sum": ["Layer grids on practice and after-class pages"],
    "adjacent-cube-build": ["Adjacent cube/tower models where touching cubes hide faces but still count as volume"],
    "cross-tunnel-overlap": ["Cube with hidden removed cubes through more than one direction"],
    "side-slice-tunnel": ["Cuboid/cube with a straight rectangular missing slice"],
    "height-map-volume": ["Plan table with numbers 3, 2, 1 showing tower heights"],
    "staircase-stack": ["Step-shaped block drawings and plan/front/left views"],
    "front-left-view": ["Source page with Front view, Left view, and Plan view diagrams"],
    "view-rebuild": ["Front view, left view, and plan view reconstruction"],
    "reverse-missing-layer": ["Homework-style reverse totals for removed layer squares"],
    "water-cube-rise": ["Extension pages with tank diagram after cube-volume counting"],
    "compare-layer-solids": ["Further exercise pages with multiple layer grids to compare"]
  };

  const INTRO_SCENES = [
    {
      title: "Slice The Solid",
      purpose: "Layer maps: count one layer at a time before adding the whole model.",
      kind: "layer",
      caption: "A complicated cube solid becomes friendly when you slice it into floors. Count what is kept on each floor, then add the floors."
    },
    {
      title: "Mark Missing Cubes",
      purpose: "Make holes visible before subtracting.",
      kind: "missing",
      caption: "If a square is missing in a layer, mark it. A 3 by 3 layer with one missing square has 9 - 1 = 8 cubes."
    },
    {
      title: "Tunnels Can Overlap",
      purpose: "Tunnel overlap: avoid subtracting the same cube twice when tunnels cross.",
      kind: "tunnel",
      caption: "Two tunnels that cross share one cube in the middle. Subtract both tunnels, then put the overlap back once."
    },
    {
      title: "Adjacent Cubes Still Count",
      purpose: "Touching faces hide cubes, but volume still adds them.",
      kind: "adjacent",
      caption: "When cube towers sit next to each other, some faces disappear from view. The cubes are still there, so add every tower."
    },
    {
      title: "Read Height Maps",
      purpose: "Treat plan numbers as tower heights.",
      kind: "heightMap",
      caption: "A number in a plan square tells you how many cubes are stacked there. Add the numbers to get the volume."
    },
    {
      title: "Stairs Are Layers",
      purpose: "Turn a stepped solid into row totals.",
      kind: "stair",
      caption: "A staircase can be counted as 1 row, then 2 rows, then 3 rows, stretched through its length."
    },
    {
      title: "Views Are Clues",
      purpose: "Use front, left, and plan views together.",
      kind: "views",
      caption: "The front view gives column heights. The left view gives row heights. The plan view tells where cubes are allowed to sit."
    },
    {
      title: "View Direction Matters",
      purpose: "Front view and left view read different directions.",
      kind: "frontLeft",
      caption: "For a front view, take the tallest tower in each column. For a left view, take the tallest tower in each row."
    },
    {
      title: "Reverse The Count",
      purpose: "Work backwards from a total.",
      kind: "reverse",
      caption: "If you know the final volume, divide by the number of layers to find cubes per layer, then compare with the full layer."
    },
    {
      title: "Cubes Move Water",
      purpose: "Cube displacement: connect counted cubes back to displaced volume.",
      kind: "water",
      caption: "Once you know how many 1 cm cubes are in the solid, you know its volume in cubic centimetres. That can raise water."
    },
    {
      title: "Ready To Rebuild",
      purpose: "Move from lesson pages into training.",
      kind: "ready",
      caption: "Now you will count layer plans, tunnels, views, stair stacks, and water extensions with fresh numbers and repair questions."
    }
  ];

  const SUPERSCRIPTS = {
    "0": "0",
    "1": "1",
    "2": "2",
    "3": "3",
    "4": "4",
    "5": "5",
    "6": "6",
    "7": "7",
    "8": "8",
    "9": "9"
  };

  function formatMathText(value) {
    return String(value)
      .replace(/\^2/g, "²")
      .replace(/\^3/g, "³")
      .replace(/\^(-?\d+)/g, (_, exponent) => String(exponent).split("").map((char) => SUPERSCRIPTS[char] || char).join(""));
  }

  function plainMathText(value) {
    return String(value).replace(/[²]/g, "2").replace(/[³]/g, "3");
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function math(value) {
    return escapeHtml(formatMathText(value));
  }

  function stableSeed(value) {
    let seed = 0;
    for (let index = 0; index < String(value).length; index += 1) {
      seed = (seed * 31 + String(value).charCodeAt(index)) >>> 0;
    }
    return seed;
  }

  function pick(items, variantIndex) {
    return items[((variantIndex % items.length) + items.length) % items.length];
  }

  function formatNumber(value) {
    if (Math.abs(value - Math.round(value)) < 1e-9) return String(Math.round(value));
    return String(Math.round(value * 100) / 100).replace(/\.0$/, "");
  }

  function displayValue(value, unit) {
    return formatMathText(formatNumber(value) + (unit ? " " + unit : ""));
  }

  function displayList(values) {
    return values.join(", ");
  }

  function normalizeTextAnswer(value) {
    const numbers = String(value || "").match(/-?\d+(?:\.\d+)?/g);
    if (numbers && numbers.length) return numbers.map((item) => formatNumber(Number(item))).join(",");
    return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
  }

  function parseNumber(value) {
    const cleaned = plainMathText(value)
      .toLowerCase()
      .replace(/,/g, "")
      .replace(/cm3|cm2|cm|cubes|cube|unit/g, " ")
      .replace(/[^\d./-]+/g, " ")
      .trim();
    const fraction = cleaned.match(/^-?\d+\s*\/\s*-?\d+$/);
    if (fraction) {
      const parts = cleaned.split("/").map((part) => Number(part.trim()));
      return parts[1] === 0 ? NaN : parts[0] / parts[1];
    }
    const match = cleaned.match(/-?\d+(?:\.\d+)?/);
    return match ? Number(match[0]) : NaN;
  }

  function uniqueNumbers(values, expected) {
    const seen = new Set([formatNumber(expected)]);
    const result = [];
    for (const value of values) {
      if (!Number.isFinite(value)) continue;
      const key = formatNumber(value);
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(value);
    }
    return result;
  }

  function shuffledChoiceValues(expected, wrongs, seed) {
    const values = [expected, ...uniqueNumbers(wrongs, expected)].slice(0, 5);
    while (values.length < 4) values.push(expected + values.length + 2);
    const sorted = values
      .map((value) => ({ value, sortKey: stableSeed(seed + "|" + formatNumber(value)) }))
      .sort((a, b) => a.sortKey - b.sortKey)
      .map((item) => item.value);
    const rotation = stableSeed(seed + "|rotate") % sorted.length;
    return sorted.slice(rotation).concat(sorted.slice(0, rotation));
  }

  function shuffledTextChoices(expected, wrongs, seed) {
    const seen = new Set();
    const values = [expected, ...(wrongs || [])].filter((value) => {
      const key = normalizeTextAnswer(value);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 4);
    const sorted = values
      .map((value) => ({ value, sortKey: stableSeed(seed + "|" + normalizeTextAnswer(value)) }))
      .sort((a, b) => a.sortKey - b.sortKey)
      .map((item) => item.value);
    const rotation = stableSeed(seed + "|text-rotate") % Math.max(1, sorted.length);
    return sorted.slice(rotation).concat(sorted.slice(0, rotation));
  }

  function applyAnswerMode(problem, variantIndex) {
    const classicOffset = CLASSIC_IDS.indexOf(problem.classicId);
    const wantsTyped = (variantIndex + classicOffset) % 3 === 1;
    if (problem.answerKind === "view-list") {
      if (wantsTyped) {
        return {
          ...problem,
          answerType: "text",
          answerMode: "filled",
          expectedDisplay: problem.expectedText,
          correctInput: { value: problem.expectedText }
        };
      }
      const textChoices = shuffledTextChoices(problem.expectedText, problem.wrongsText || [], problem.classicId + "|" + variantIndex);
      return {
        ...problem,
        answerType: "choice",
        answerMode: "choice",
        choices: textChoices.map((value) => ({
          value: normalizeTextAnswer(value),
          label: value,
          isCorrect: normalizeTextAnswer(value) === normalizeTextAnswer(problem.expectedText)
        })),
        expectedDisplay: problem.expectedText,
        correctInput: { choice: normalizeTextAnswer(problem.expectedText) }
      };
    }
    if (wantsTyped) {
      return {
        ...problem,
        answerType: "number",
        answerMode: "filled",
        expectedDisplay: displayValue(problem.expected, problem.unit),
        correctInput: { value: formatNumber(problem.expected) }
      };
    }
    const choiceValues = shuffledChoiceValues(problem.expected, problem.wrongs || [], problem.classicId + "|" + variantIndex);
    return {
      ...problem,
      answerType: "choice",
      answerMode: "choice",
      choices: choiceValues.map((value) => ({
        value: formatNumber(value),
        label: displayValue(value, problem.unit),
        isCorrect: Math.abs(value - problem.expected) < 1e-9
      })),
      expectedDisplay: displayValue(problem.expected, problem.unit),
      correctInput: { choice: formatNumber(problem.expected) }
    };
  }

  function problemBase(classicId, fields, variantIndex) {
    const classic = CLASSIC_BY_ID[classicId];
    const problem = {
      classicId,
      classic: classic.nickname,
      skill: classic.skill,
      sourcePages: classic.sourcePages,
      formatHint: fields.unit === "view"
        ? "Give the view heights in order, for example: 3, 2, 1."
        : fields.unit === "cm^3"
        ? "Give the volume in cubic centimetres."
        : fields.unit === "cm"
          ? "Give the water rise or level in centimetres."
          : "Give the number of unit cubes.",
      ...fields
    };
    problem.id = classicId + "-" + variantIndex;
    problem.variantIndex = variantIndex;
    problem.prompt = formatMathText(problem.prompt);
    problem.hint1 = formatMathText(problem.hint1);
    problem.hint2 = formatMathText(problem.hint2);
    problem.solution = formatMathText(problem.solution);
    return applyAnswerMode(problem, variantIndex);
  }

  function countFullLayer(size) {
    return size * size;
  }

  function countLayer(size, holes) {
    return countFullLayer(size) - holes.length;
  }

  function sum(values) {
    return values.reduce((total, value) => total + value, 0);
  }

  function viewHeights(grid) {
    const front = [];
    const left = grid.map((row) => Math.max(...row));
    for (let col = 0; col < grid[0].length; col += 1) {
      front.push(Math.max(...grid.map((row) => row[col] || 0)));
    }
    return { front, left };
  }

  function columnSums(grid) {
    return grid[0].map((_, col) => sum(grid.map((row) => row[col] || 0)));
  }

  function viewDistractors(grid, target, expected) {
    const { front, left } = viewHeights(grid);
    const other = target === "front" ? left : front;
    const sums = target === "front" ? columnSums(grid) : grid.map((row) => sum(row));
    const plusOne = expected.map((value) => value + 1);
    return [
      displayList(other),
      displayList(expected.slice().reverse()),
      displayList(sums),
      displayList(plusOne)
    ];
  }

  function layerCountCore(variantIndex) {
    const sets = [
      { size: 3, layers: 3, holes: [[1, 1]], name: "centre shaft" },
      { size: 4, layers: 4, holes: [[1, 1], [2, 2]], name: "two-square diagonal shaft" },
      { size: 5, layers: 3, holes: [[2, 2], [1, 3]], name: "two marked squares" },
      { size: 4, layers: 5, holes: [[0, 1], [3, 2]], name: "edge-to-edge pair" },
      { size: 5, layers: 4, holes: [[1, 1], [2, 2], [3, 3]], name: "slanted three-square path" },
      { size: 6, layers: 3, holes: [[2, 2], [2, 3], [3, 2]], name: "corner bend" }
    ];
    const v = pick(sets, variantIndex);
    const keptPerLayer = countLayer(v.size, v.holes);
    const expected = keptPerLayer * v.layers;
    return problemBase("layer-count-core", {
      prompt: "A solid has " + v.layers + " layers. Each layer is a " + v.size + " by " + v.size + " square of unit cubes, but the same " + v.holes.length + " marked square" + (v.holes.length === 1 ? " is" : "s are") + " removed in every layer. How many unit cubes remain?",
      expected,
      unit: "cubes",
      wrongs: [v.size * v.size * v.layers, keptPerLayer, v.holes.length * v.layers, expected + v.holes.length, expected - v.layers],
      hint1: "Count one layer first, then multiply by the number of layers.",
      hint2: "One full layer has " + v.size + " x " + v.size + " = " + v.size * v.size + " cubes. Kept per layer = " + v.size * v.size + " - " + v.holes.length + " = " + keptPerLayer + ".",
      solution: "Kept per layer = " + v.size * v.size + " - " + v.holes.length + " = " + keptPerLayer + ". There are " + v.layers + " layers, so " + keptPerLayer + " x " + v.layers + " = " + expected + " cubes.",
      visual: { type: "layerRepeat", size: v.size, layers: v.layers, holes: v.holes, name: v.name, keptPerLayer },
      audit: { kind: "layer-repeat", size: v.size, layers: v.layers, holes: v.holes.length }
    }, variantIndex);
  }

  function layerMapSum(variantIndex) {
    const sets = [
      { size: 3, layers: [[[1, 1]], [[0, 1], [2, 1]], [[1, 1]]], label: "three colour layers" },
      { size: 4, layers: [[[0, 0]], [[1, 1], [2, 2]], [[0, 3]], []], label: "four plan layers" },
      { size: 4, layers: [[[1, 1], [1, 2]], [[2, 1]], [[2, 2], [3, 2]]], label: "uneven missing squares" },
      { size: 5, layers: [[[2, 2]], [[1, 2], [2, 2], [3, 2]], [[2, 2]], [[0, 4]]], label: "middle tunnel layer" },
      { size: 3, layers: [[], [[0, 0]], [[1, 1]], [[2, 2]], []], label: "five thin layers" },
      { size: 5, layers: [[[0, 0], [4, 4]], [[1, 3]], [[2, 2], [3, 1]]], label: "wide three-layer model" }
    ];
    const v = pick(sets, variantIndex);
    const counts = v.layers.map((holes) => countLayer(v.size, holes));
    const expected = sum(counts);
    return problemBase("layer-map-sum", {
      prompt: "A cube model is shown as " + v.layers.length + " separate layer plans from top to bottom. Each plan is a " + v.size + " by " + v.size + " grid; the missing-cell counts by layer are " + v.layers.map((holes) => holes.length).join(", ") + ". How many unit cubes are in the whole model?",
      expected,
      unit: "cubes",
      wrongs: [v.size * v.size * v.layers.length, counts[0], expected + v.layers.length, expected - v.layers.length, sum(v.layers.map((holes) => holes.length))],
      hint1: "Write the kept cubes under each layer plan.",
      hint2: "The layer counts are " + counts.join(", ") + ". Add those counts.",
      solution: "Layer counts: " + counts.join(" + ") + " = " + expected + " cubes.",
      visual: { type: "layerMap", size: v.size, layers: v.layers, counts, label: v.label },
      audit: { kind: "layer-map", size: v.size, layers: v.layers.map((holes) => holes.length) }
    }, variantIndex);
  }

  function adjacentCubeBuild(variantIndex) {
    const maps = [
      [[2, 1, 0], [1, 2, 1], [0, 1, 0]],
      [[3, 2, 0], [1, 2, 1], [0, 1, 1]],
      [[1, 2, 1, 0], [2, 3, 1, 1], [0, 1, 0, 1]],
      [[2, 0, 1], [2, 3, 2], [1, 1, 0]],
      [[1, 1, 2, 1], [0, 2, 3, 1], [0, 1, 1, 0]],
      [[3, 1, 1], [2, 2, 0], [1, 0, 1], [1, 1, 1]]
    ];
    const grid = pick(maps, variantIndex);
    const rowTotals = grid.map((row) => sum(row));
    const expected = sum(rowTotals);
    const occupied = grid.flat().filter((value) => value > 0).length;
    return problemBase("adjacent-cube-build", {
      prompt: "A connected block model is built on adjacent squares. The plan rows are " + grid.map((row) => row.join(", ")).join(" / ") + ". Touching towers share side faces. How many unit cubes are in the whole connected model?",
      expected,
      unit: "cubes",
      wrongs: [occupied, sum(viewHeights(grid).front), sum(viewHeights(grid).left), expected + occupied, expected - 1],
      hint1: "Adjacent towers touch, but touching does not remove cubes from the volume.",
      hint2: "Add the tower heights row by row: " + rowTotals.join(" + ") + ".",
      solution: "The adjacent towers still count as separate cubes. Row totals are " + rowTotals.join(" + ") + " = " + expected + " cubes.",
      visual: { type: "adjacentCubes", grid, rowTotals, occupied },
      audit: { kind: "adjacent-cubes", grid }
    }, variantIndex);
  }

  function crossTunnelOverlap(variantIndex) {
    const sets = [
      { size: 3, axes: 2 },
      { size: 4, axes: 2 },
      { size: 5, axes: 2 },
      { size: 3, axes: 3 },
      { size: 4, axes: 3 },
      { size: 6, axes: 2 }
    ];
    const v = pick(sets, variantIndex);
    const total = v.size * v.size * v.size;
    const removed = v.axes === 2 ? 2 * v.size - 1 : 3 * v.size - 2;
    const expected = total - removed;
    const tunnelText = v.axes === 2 ? "two 1-cube-wide tunnels cross through the centre" : "three 1-cube-wide tunnels cross through the centre";
    return problemBase("cross-tunnel-overlap", {
      prompt: "A " + v.size + " by " + v.size + " by " + v.size + " cube is made from unit cubes. " + tunnelText + ". How many unit cubes remain?",
      expected,
      unit: "cubes",
      wrongs: [total - v.axes * v.size, total, removed, expected + 1, expected - 1],
      hint1: "Do not subtract the centre cube more than once.",
      hint2: v.axes === 2 ? "Two tunnels remove " + v.size + " + " + v.size + " cubes, but the middle cube was counted twice." : "Three tunnels remove " + v.size + " + " + v.size + " + " + v.size + " cubes, but the middle cube is shared by all three.",
      solution: "Full cube = " + v.size + "^3 = " + total + ". Removed cubes = " + removed + ". Remaining volume = " + total + " - " + removed + " = " + expected + " cubes.",
      visual: { type: "crossTunnel", size: v.size, axes: v.axes, removed, total },
      audit: { kind: "cross-tunnel", size: v.size, axes: v.axes }
    }, variantIndex);
  }

  function sideSliceTunnel(variantIndex) {
    const sets = [
      { length: 5, width: 4, height: 4, tunnelW: 1, tunnelH: 2 },
      { length: 6, width: 5, height: 4, tunnelW: 2, tunnelH: 1 },
      { length: 7, width: 4, height: 5, tunnelW: 1, tunnelH: 3 },
      { length: 4, width: 6, height: 5, tunnelW: 2, tunnelH: 2 },
      { length: 8, width: 5, height: 5, tunnelW: 1, tunnelH: 2 },
      { length: 6, width: 6, height: 4, tunnelW: 2, tunnelH: 2 }
    ];
    const v = pick(sets, variantIndex);
    const total = v.length * v.width * v.height;
    const removed = v.length * v.tunnelW * v.tunnelH;
    const expected = total - removed;
    return problemBase("side-slice-tunnel", {
      prompt: "A cuboid made from unit cubes is " + v.length + " cubes long, " + v.width + " cubes wide, and " + v.height + " cubes high. A straight tunnel with opening " + v.tunnelW + " by " + v.tunnelH + " goes through the full length. How many unit cubes remain?",
      expected,
      unit: "cubes",
      wrongs: [total, removed, v.width * v.height - v.tunnelW * v.tunnelH, expected + removed, expected - v.length],
      hint1: "Find the full cuboid, then subtract the repeated missing tunnel slice.",
      hint2: "The missing slice has area " + v.tunnelW + " x " + v.tunnelH + " = " + v.tunnelW * v.tunnelH + ", repeated for " + v.length + " positions.",
      solution: "Full cuboid = " + v.length + " x " + v.width + " x " + v.height + " = " + total + ". Tunnel volume = " + v.length + " x " + v.tunnelW + " x " + v.tunnelH + " = " + removed + ". Remaining = " + expected + " cubes.",
      visual: { type: "sideTunnel", ...v, total, removed },
      audit: { kind: "side-tunnel", ...v }
    }, variantIndex);
  }

  function heightMapVolume(variantIndex) {
    const maps = [
      [[3, 2, 1], [2, 2, 1], [1, 1, 1]],
      [[4, 3, 1], [2, 2, 1], [1, 0, 0]],
      [[2, 2, 2, 1], [3, 0, 2, 1], [1, 1, 1, 1]],
      [[5, 3, 2], [4, 0, 2], [1, 1, 1]],
      [[3, 3, 0, 1], [2, 2, 2, 1], [0, 1, 1, 1]],
      [[4, 2, 2], [4, 0, 1], [2, 1, 1], [1, 1, 0]]
    ];
    const grid = pick(maps, variantIndex);
    const expected = sum(grid.flat());
    const visibleTowers = grid.flat().filter((value) => value > 0).length;
    return problemBase("height-map-volume", {
      prompt: "A " + grid.length + " by " + grid[0].length + " plan view shows tower heights. The row totals shown by the plan are " + grid.map((row) => sum(row)).join(", ") + ", and each number tells how many unit cubes are stacked on that square. What is the total volume of the model?",
      expected,
      unit: "cubes",
      wrongs: [visibleTowers, Math.max(...grid.flat()), expected + grid.length, expected - grid.length, sum(grid[0])],
      hint1: "Do not count the squares; add the tower heights written in the squares.",
      hint2: "The total is the sum of every height number in the plan.",
      solution: "Add every tower height in the plan: " + grid.map((row) => row.join(" + ")).join(" | ") + " gives " + expected + " cubes.",
      visual: { type: "heightMap", grid },
      audit: { kind: "height-map", grid }
    }, variantIndex);
  }

  function staircaseStack(variantIndex) {
    const sets = [
      { levels: 3, length: 4 },
      { levels: 4, length: 3 },
      { levels: 5, length: 2 },
      { levels: 3, length: 6 },
      { levels: 4, length: 5 },
      { levels: 6, length: 2 }
    ];
    const v = pick(sets, variantIndex);
    const cross = v.levels * (v.levels + 1) / 2;
    const expected = cross * v.length;
    return problemBase("staircase-stack", {
      prompt: "A stepped block has a staircase cross-section with " + v.levels + " levels: 1 cube, then 2 cubes, up to " + v.levels + " cubes. This staircase is repeated for a length of " + v.length + " cubes. How many unit cubes are in the solid?",
      expected,
      unit: "cubes",
      wrongs: [v.levels * v.length, v.levels * v.levels * v.length, cross, expected + v.length, expected - v.length],
      hint1: "Count the staircase cross-section first.",
      hint2: "The cross-section count is 1 + 2 + ... + " + v.levels + " = " + cross + ". Then multiply by the length.",
      solution: "Staircase cross-section = " + v.levels + " x " + (v.levels + 1) + " / 2 = " + cross + ". Volume = " + cross + " x " + v.length + " = " + expected + " cubes.",
      visual: { type: "stair", levels: v.levels, length: v.length, cross },
      audit: { kind: "stair", levels: v.levels, length: v.length }
    }, variantIndex);
  }

  function frontLeftView(variantIndex) {
    const maps = [
      [[2, 1, 0], [3, 1, 1], [1, 0, 0]],
      [[1, 2, 2], [0, 3, 1], [0, 1, 1]],
      [[3, 2, 1], [2, 0, 1], [1, 1, 0]],
      [[2, 2, 0, 1], [3, 1, 1, 0], [1, 0, 2, 1]],
      [[4, 1, 0], [2, 2, 1], [0, 1, 1]],
      [[2, 3, 1], [1, 0, 2], [1, 1, 1]]
    ];
    const grid = pick(maps, variantIndex);
    const { front, left } = viewHeights(grid);
    const target = variantIndex % 2 === 0 ? "front" : "left";
    const expectedList = target === "front" ? front : left;
    const expectedText = displayList(expectedList);
    const directionText = target === "front" ? "from the front, reading left to right" : "from the left, reading front to back";
    return problemBase("front-left-view", {
      prompt: "The plan view rows are " + grid.map((row) => row.join(", ")).join(" / ") + ". What are the " + target + " view heights " + directionText + "?",
      expected: sum(expectedList),
      expectedText,
      answerKind: "view-list",
      unit: "view",
      wrongsText: viewDistractors(grid, target, expectedList),
      hint1: target === "front" ? "For the front view, take the tallest tower in each column." : "For the left view, take the tallest tower in each row.",
      hint2: "The " + target + " view heights are " + expectedText + ".",
      solution: "Read the " + target + " view by taking the visible tallest towers: " + expectedText + ".",
      visual: { type: "frontLeftView", grid, front, left, target, expectedText },
      audit: { kind: "front-left-view", grid, target, expectedText }
    }, variantIndex);
  }

  function viewRebuild(variantIndex) {
    const maps = [
      [[2, 1, 0], [3, 1, 1], [1, 0, 0]],
      [[1, 2, 2], [0, 3, 1], [0, 1, 1]],
      [[3, 2, 1], [2, 0, 1], [1, 1, 0]],
      [[2, 2, 0, 1], [3, 1, 1, 0], [1, 0, 2, 1]],
      [[4, 1, 0], [2, 2, 1], [0, 1, 1]],
      [[2, 3, 1], [1, 0, 2], [1, 1, 1]]
    ];
    const grid = pick(maps, variantIndex);
    const expected = sum(grid.flat());
    const { front, left } = viewHeights(grid);
    return problemBase("view-rebuild", {
      prompt: "A cube model is described by a " + grid.length + " by " + grid[0].length + " plan with tower heights. The front view heights are " + front.join(", ") + " and the left view heights are " + left.join(", ") + ". Find the total number of unit cubes.",
      expected,
      unit: "cubes",
      wrongs: [sum(front), sum(left), front.length * left.length, expected + 2, expected - 2],
      hint1: "The front view gives the tallest tower in each column. The left view gives the tallest tower in each row.",
      hint2: "After the views check out, add every tower height in the plan.",
      solution: "Front heights are " + front.join(", ") + " and left heights are " + left.join(", ") + ". The plan total is " + expected + " cubes.",
      visual: { type: "views", grid, front, left },
      audit: { kind: "views", grid, front, left }
    }, variantIndex);
  }

  function reverseMissingLayer(variantIndex) {
    const sets = [
      { size: 3, layers: 4, missing: 1 },
      { size: 4, layers: 3, missing: 2 },
      { size: 5, layers: 4, missing: 3 },
      { size: 4, layers: 5, missing: 1 },
      { size: 6, layers: 3, missing: 4 },
      { size: 5, layers: 5, missing: 2 }
    ];
    const v = pick(sets, variantIndex);
    const total = (v.size * v.size - v.missing) * v.layers;
    return problemBase("reverse-missing-layer", {
      prompt: "A solid has " + v.layers + " identical layers. Each layer began as a " + v.size + " by " + v.size + " square of unit cubes. After the same number of cubes was removed from each layer, the solid has " + total + " cubes left. How many cubes were removed from each layer?",
      expected: v.missing,
      unit: "cubes",
      wrongs: [v.missing * v.layers, v.size * v.size - v.missing, v.size * v.size, v.missing + 1, Math.max(0, v.missing - 1)],
      hint1: "Divide the final volume by the number of layers first.",
      hint2: "Cubes kept per layer = " + total + " / " + v.layers + " = " + (total / v.layers) + ". Compare with the full layer.",
      solution: "Full layer = " + v.size + " x " + v.size + " = " + v.size * v.size + ". Kept per layer = " + total + " / " + v.layers + " = " + (total / v.layers) + ". Removed per layer = " + v.missing + " cubes.",
      visual: { type: "reverse", size: v.size, layers: v.layers, total, missing: v.missing },
      audit: { kind: "reverse", size: v.size, layers: v.layers, total }
    }, variantIndex);
  }

  function waterCubeRise(variantIndex) {
    const sets = [
      { cubes: 24, baseArea: 60, start: 5, ask: "rise" },
      { cubes: 36, baseArea: 72, start: 8, ask: "new" },
      { cubes: 45, baseArea: 90, start: 6, ask: "rise" },
      { cubes: 64, baseArea: 80, start: 7, ask: "new" },
      { cubes: 30, baseArea: 75, start: 9, ask: "rise" },
      { cubes: 48, baseArea: 96, start: 4, ask: "new" }
    ];
    const v = pick(sets, variantIndex);
    const rise = v.cubes / v.baseArea;
    const expected = v.ask === "rise" ? rise : v.start + rise;
    const askText = v.ask === "rise" ? "what is the water rise" : "what is the new water level";
    return problemBase("water-cube-rise", {
      prompt: "A cube model contains " + v.cubes + " unit cubes, each with volume 1 cm^3. It is fully submerged in a tank with base area " + v.baseArea + " cm^2. The water starts at " + v.start + " cm. " + askText + "?",
      expected,
      unit: "cm",
      wrongs: [v.cubes, v.baseArea, rise + 1, v.start, v.start + v.cubes],
      hint1: "The model volume is the number of 1 cm cubes.",
      hint2: "Water rise = submerged volume / tank base area.",
      solution: "Volume displaced = " + v.cubes + " cm^3. Rise = " + v.cubes + " / " + v.baseArea + " = " + formatNumber(rise) + " cm" + (v.ask === "new" ? ". New level = " + v.start + " + " + formatNumber(rise) + " = " + formatNumber(expected) + " cm." : "."),
      visual: { type: "water", cubes: v.cubes, baseArea: v.baseArea, start: v.start, rise, expected, ask: v.ask },
      audit: { kind: "water-rise", cubes: v.cubes, baseArea: v.baseArea, start: v.start, ask: v.ask }
    }, variantIndex);
  }

  function compareLayerSolids(variantIndex) {
    const sets = [
      { a: [8, 7, 8], b: [9, 6, 6] },
      { a: [14, 13, 15], b: [12, 12, 12] },
      { a: [21, 20, 18, 20], b: [19, 19, 19, 19] },
      { a: [10, 9, 11, 8], b: [12, 8, 8, 7] },
      { a: [24, 22, 23], b: [20, 20, 20] },
      { a: [15, 14, 13, 12], b: [16, 16, 12] }
    ];
    const v = pick(sets, variantIndex);
    const totalA = sum(v.a);
    const totalB = sum(v.b);
    const expected = Math.abs(totalA - totalB);
    const bigger = totalA >= totalB ? "A" : "B";
    return problemBase("compare-layer-solids", {
      prompt: "Solid A has layer counts " + v.a.join(", ") + ". Solid B has layer counts " + v.b.join(", ") + ". How many more cubes does the larger solid have?",
      expected,
      unit: "cubes",
      wrongs: [totalA, totalB, totalA + totalB, Math.max(0, expected - 1), expected + 2],
      hint1: "Add the layers for each solid separately.",
      hint2: "Solid A has " + totalA + " cubes. Solid B has " + totalB + " cubes.",
      solution: "A = " + totalA + " cubes and B = " + totalB + " cubes. Solid " + bigger + " is larger by " + expected + " cubes.",
      visual: { type: "compare", a: v.a, b: v.b, totalA, totalB, bigger },
      audit: { kind: "compare", a: v.a, b: v.b }
    }, variantIndex);
  }

  const GENERATORS = {
    "layer-count-core": layerCountCore,
    "layer-map-sum": layerMapSum,
    "adjacent-cube-build": adjacentCubeBuild,
    "cross-tunnel-overlap": crossTunnelOverlap,
    "side-slice-tunnel": sideSliceTunnel,
    "height-map-volume": heightMapVolume,
    "staircase-stack": staircaseStack,
    "front-left-view": frontLeftView,
    "view-rebuild": viewRebuild,
    "reverse-missing-layer": reverseMissingLayer,
    "water-cube-rise": waterCubeRise,
    "compare-layer-solids": compareLayerSolids
  };

  function generateProblem(classicId, variantIndex) {
    const id = CLASSIC_BY_ID[classicId] ? classicId : CLASSIC_IDS[0];
    const problem = GENERATORS[id](variantIndex || 0);
    if (problem && CLASSIC_SKILLS[id]) problem.skillTag = CLASSIC_SKILLS[id];
    return problem;
  }

  function checkAnswer(problem, input) {
    if (!problem) return { isCorrect: false, errorClass: "missing_problem", message: "No problem is loaded yet." };
    if (problem.answerType === "choice") {
      const actual = String(input.choice || "");
      const correct = String(problem.correctInput.choice);
      return actual === correct
        ? { isCorrect: true, message: "Correct. The cube count checks out." }
        : { isCorrect: false, errorClass: "wrong_choice", message: "Not quite. Count the layers or views before choosing." };
    }
    if (problem.answerType === "text") {
      const actualText = normalizeTextAnswer(input.value);
      const correctText = normalizeTextAnswer(problem.correctInput.value);
      if (!actualText) return { isCorrect: false, errorClass: "bad_text_format", message: "Type the view heights in order, such as 3, 2, 1." };
      return actualText === correctText
        ? { isCorrect: true, message: "Correct. That view matches the tower plan." }
        : { isCorrect: false, errorClass: "wrong_view_list", message: "Not quite. Check whether you need columns for the front view or rows for the left view." };
    }
    const actual = parseNumber(input.value);
    if (!Number.isFinite(actual)) return { isCorrect: false, errorClass: "bad_number_format", message: "Type a number. Units are optional." };
    return Math.abs(actual - problem.expected) < 0.011
      ? { isCorrect: true, message: "Correct. That matches the cube model." }
      : { isCorrect: false, errorClass: "wrong_number", message: "Not quite. Rebuild the solid from the labelled parts and try again." };
  }

  function validateProblemMath(problem) {
    const a = problem.audit || {};
    let expected;
    if (a.kind === "layer-repeat") expected = (a.size * a.size - a.holes) * a.layers;
    else if (a.kind === "layer-map") expected = sum(a.layers.map((holes) => a.size * a.size - holes));
    else if (a.kind === "cross-tunnel") expected = a.size ** 3 - (a.axes === 2 ? 2 * a.size - 1 : 3 * a.size - 2);
    else if (a.kind === "side-tunnel") expected = a.length * a.width * a.height - a.length * a.tunnelW * a.tunnelH;
    else if (a.kind === "adjacent-cubes") expected = sum(a.grid.flat());
    else if (a.kind === "height-map") expected = sum(a.grid.flat());
    else if (a.kind === "stair") expected = a.levels * (a.levels + 1) / 2 * a.length;
    else if (a.kind === "front-left-view") {
      const views = viewHeights(a.grid);
      const expectedText = displayList(a.target === "front" ? views.front : views.left);
      return normalizeTextAnswer(expectedText) === normalizeTextAnswer(problem.expectedText);
    }
    else if (a.kind === "views") expected = sum(a.grid.flat());
    else if (a.kind === "reverse") expected = a.size * a.size - a.total / a.layers;
    else if (a.kind === "water-rise") expected = a.ask === "rise" ? a.cubes / a.baseArea : a.start + a.cubes / a.baseArea;
    else if (a.kind === "compare") expected = Math.abs(sum(a.a) - sum(a.b));
    else return false;
    return Math.abs(expected - problem.expected) < 1e-9;
  }

  function svgText(x, y, text, labelFor, cls) {
    return '<text x="' + x + '" y="' + y + '" text-anchor="middle" class="' + (cls || "volume-label") + '" data-label-for="' + escapeHtml(labelFor || text) + '">' + math(text) + '</text>';
  }

  function baseSvg(inner, ariaLabel) {
    return '<svg viewBox="0 0 620 360" role="img" aria-label="' + escapeHtml(ariaLabel) + '">' +
      '<rect width="620" height="360" rx="18" fill="#fbfefd"></rect>' +
      inner +
      '</svg>';
  }

  function gridSvg(x, y, size, cell, holes, label, numbers) {
    const holeSet = new Set((holes || []).map((item) => item[0] + "," + item[1]));
    let html = '<g data-label-for="' + escapeHtml(label) + '">';
    for (let row = 0; row < size; row += 1) {
      for (let col = 0; col < size; col += 1) {
        const key = row + "," + col;
        const fill = holeSet.has(key) ? "#ffffff" : "#d8e6ea";
        html += '<rect x="' + (x + col * cell) + '" y="' + (y + row * cell) + '" width="' + cell + '" height="' + cell + '" fill="' + fill + '" stroke="#172333" stroke-width="2" data-label-for="' + escapeHtml(label) + '"></rect>';
        if (holeSet.has(key)) html += svgText(x + col * cell + cell / 2, y + row * cell + cell * 0.68, "x", label);
        if (numbers && numbers[row] && Number(numbers[row][col]) > 0) html += svgText(x + col * cell + cell / 2, y + row * cell + cell * 0.68, numbers[row][col], label);
      }
    }
    html += svgText(x + size * cell / 2, y + size * cell + 24, label, label);
    return html + '</g>';
  }

  function heightPlanGridSvg(x, y, grid, cell, label, options) {
    const rows = grid.length;
    const cols = grid[0].length;
    const showAdjacent = options && options.showAdjacent;
    let html = '<g data-label-for="' + escapeHtml(label) + '">';
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const value = Number(grid[row][col] || 0);
        const fill = value > 0 ? "#d8e6ea" : "#ffffff";
        html += '<rect x="' + (x + col * cell) + '" y="' + (y + row * cell) + '" width="' + cell + '" height="' + cell + '" fill="' + fill + '" stroke="#172333" stroke-width="2" data-label-for="' + escapeHtml(label) + '"></rect>';
        if (value > 0) html += svgText(x + col * cell + cell / 2, y + row * cell + cell * 0.68, value, label);
        if (showAdjacent && value > 0 && col + 1 < cols && Number(grid[row][col + 1] || 0) > 0) {
          html += '<line x1="' + (x + (col + 1) * cell) + '" y1="' + (y + row * cell + 4) + '" x2="' + (x + (col + 1) * cell) + '" y2="' + (y + (row + 1) * cell - 4) + '" stroke="#ff6d58" stroke-width="4" data-label-for="adjacent shared face"></line>';
        }
        if (showAdjacent && value > 0 && row + 1 < rows && Number(grid[row + 1][col] || 0) > 0) {
          html += '<line x1="' + (x + col * cell + 4) + '" y1="' + (y + (row + 1) * cell) + '" x2="' + (x + (col + 1) * cell - 4) + '" y2="' + (y + (row + 1) * cell) + '" stroke="#ff6d58" stroke-width="4" data-label-for="adjacent shared face"></line>';
        }
      }
    }
    html += '<rect x="' + x + '" y="' + y + '" width="' + (cols * cell) + '" height="' + (rows * cell) + '" fill="none" stroke="#172333" stroke-width="3" data-label-for="' + escapeHtml(label) + '"></rect>';
    html += svgText(x + cols * cell / 2, y + rows * cell + 24, label, label);
    return html + '</g>';
  }

  function viewBarsSvg(x, y, heights, label, fill, showValues) {
    const cell = 18;
    const gap = 8;
    const maxHeight = Math.max(1, ...heights);
    const base = y + maxHeight * cell;
    let html = '<g data-label-for="' + escapeHtml(label) + '">';
    heights.forEach((height, index) => {
      const barX = x + index * (cell + gap);
      for (let level = 0; level < height; level += 1) {
        html += '<rect x="' + barX + '" y="' + (base - (level + 1) * cell) + '" width="' + cell + '" height="' + cell + '" fill="' + fill + '" stroke="#172333" stroke-width="2" data-label-for="' + escapeHtml(label) + '"></rect>';
      }
      if (showValues) html += svgText(barX + cell / 2, base + 18, height, label);
    });
    html += svgText(x + (heights.length * (cell + gap) - gap) / 2, base + 42, label, label);
    return html + '</g>';
  }

  function adjacentStackPreviewSvg(x, y, grid) {
    const cells = [];
    grid.forEach((row, rowIndex) => {
      row.forEach((height, colIndex) => {
        if (height > 0) cells.push({ row: rowIndex, col: colIndex, height });
      });
    });
    const visible = cells.slice(0, 8);
    let html = '<g data-label-for="visible adjacent cube stacks">';
    visible.forEach((cellData, index) => {
      const px = x + index * 24;
      for (let level = 0; level < cellData.height; level += 1) {
        html += '<rect x="' + px + '" y="' + (y - (level + 1) * 20) + '" width="20" height="20" fill="#fff8dc" stroke="#172333" stroke-width="2" data-label-for="visible adjacent cube stacks"></rect>';
      }
      if (index > 0) {
        html += '<line x1="' + (px - 4) + '" y1="' + (y - 10) + '" x2="' + px + '" y2="' + (y - 10) + '" stroke="#ff6d58" stroke-width="3" data-label-for="touching cubes"></line>';
      }
    });
    html += svgText(x + 92, y + 28, "touching cubes still count", "touching cubes");
    return html + '</g>';
  }

  function cubeIcon(x, y, scale, label) {
    const w = 52 * scale;
    const h = 42 * scale;
    const d = 24 * scale;
    return '<g data-label-for="' + escapeHtml(label) + '">' +
      '<polygon points="' + x + ',' + (y + d) + ' ' + (x + w) + ',' + (y + d) + ' ' + (x + w + d) + ',' + y + ' ' + (x + d) + ',' + y + '" fill="#e5f7f9" stroke="#172333" stroke-width="2"></polygon>' +
      '<rect x="' + x + '" y="' + (y + d) + '" width="' + w + '" height="' + h + '" fill="#fff8dc" stroke="#172333" stroke-width="2"></rect>' +
      '<polygon points="' + (x + w) + ',' + (y + d) + ' ' + (x + w + d) + ',' + y + ' ' + (x + w + d) + ',' + (y + h) + ' ' + (x + w) + ',' + (y + h + d) + '" fill="#d8edf2" stroke="#172333" stroke-width="2"></polygon>' +
      '</g>';
  }

  function arrowLine(x1, y1, x2, y2, label) {
    return '<g data-label-for="' + escapeHtml(label) + '">' +
      '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="#172333" stroke-width="2"></line>' +
      '<path d="M ' + x1 + ' ' + y1 + ' l 7 -4 l 0 8 z" fill="#172333"></path>' +
      '<path d="M ' + x2 + ' ' + y2 + ' l -7 -4 l 0 8 z" fill="#172333"></path>' +
      '</g>';
  }

  function centerRange(size, count) {
    const start = Math.floor((size - count) / 2);
    return Array.from({ length: count }, (_, index) => start + index);
  }

  function cubeCellGridSvg(x, y, cols, rows, cell, removedCells, label, options) {
    const removed = new Set((removedCells || []).map((item) => item[0] + "," + item[1]));
    const highlight = new Set(((options && options.highlightCells) || []).map((item) => item[0] + "," + item[1]));
    const showCounts = options && options.showCounts;
    let html = '<g data-label-for="' + escapeHtml(label) + '">';
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const key = row + "," + col;
        const isRemoved = removed.has(key);
        const isHighlight = highlight.has(key);
        const fill = isRemoved ? "#ffffff" : isHighlight ? "#ffe16d" : "#d8e6ea";
        const stroke = isRemoved ? "#c3423f" : "#172333";
        const dash = isRemoved ? ' stroke-dasharray="5 3"' : "";
        html += '<rect x="' + (x + col * cell) + '" y="' + (y + row * cell) + '" width="' + cell + '" height="' + cell + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="2"' + dash + ' data-label-for="' + escapeHtml(label) + '"></rect>';
        if (!isRemoved && showCounts) {
          html += '<circle cx="' + (x + col * cell + cell * 0.72) + '" cy="' + (y + row * cell + cell * 0.28) + '" r="' + Math.max(2, cell * 0.08) + '" fill="#172333" opacity="0.35"></circle>';
        }
        if (isRemoved) html += svgText(x + col * cell + cell / 2, y + row * cell + cell * 0.68, "x", label);
      }
    }
    html += '<rect x="' + x + '" y="' + y + '" width="' + (cols * cell) + '" height="' + (rows * cell) + '" fill="none" stroke="#172333" stroke-width="3" data-label-for="' + escapeHtml(label) + '"></rect>';
    html += svgText(x + cols * cell / 2, y + rows * cell + 23, label, label);
    return html + '</g>';
  }

  function tunnelCrossCells(size) {
    const mid = Math.floor(size / 2);
    const cells = [];
    for (let index = 0; index < size; index += 1) {
      cells.push([mid, index]);
      if (index !== mid) cells.push([index, mid]);
    }
    return cells;
  }

  function tunnelOpeningCells(width, height, tunnelW, tunnelH) {
    const cols = centerRange(width, tunnelW);
    const rows = centerRange(height, tunnelH);
    const cells = [];
    for (const row of rows) {
      for (const col of cols) cells.push([row, col]);
    }
    return cells;
  }

  function miniSliceStripSvg(x, y, length, tunnelW, tunnelH, removed) {
    const visible = Math.min(length, 6);
    let html = '<g data-label-for="length slices">';
    for (let index = 0; index < visible; index += 1) {
      const sx = x + index * 35;
      const sy = y - index * 4;
      html += '<polygon points="' + sx + ',' + sy + ' ' + (sx + 28) + ',' + (sy - 6) + ' ' + (sx + 28) + ',' + (sy + 50) + ' ' + sx + ',' + (sy + 56) + '" fill="#e5f7f9" stroke="#172333" stroke-width="2" opacity="' + (0.94 - index * 0.06) + '" data-label-for="one length slice"></polygon>';
      html += '<rect x="' + (sx + 8) + '" y="' + (sy + 18) + '" width="' + Math.max(8, tunnelW * 7) + '" height="' + Math.max(8, tunnelH * 7) + '" fill="#ffffff" stroke="#c3423f" stroke-width="2" stroke-dasharray="4 3" data-label-for="same tunnel opening"></rect>';
    }
    if (length > visible) html += svgText(x + visible * 35 + 12, y + 26, "...", "more slices");
    html += svgText(x + 118, y + 88, length + " slices along the length", "length slices");
    html += svgText(x + 118, y + 114, "remove " + removed + " cubes total", "removed");
    return html + '</g>';
  }

  function stairSliceCells(levels) {
    const cells = [];
    for (let row = 0; row < levels; row += 1) {
      const cubesInRow = row + 1;
      for (let col = 0; col < cubesInRow; col += 1) cells.push([row, col]);
    }
    return cells;
  }

  function stairSliceGridSvg(x, y, levels, cell) {
    const cells = stairSliceCells(levels);
    let html = '<g data-label-for="front stair slice: 1 + 2 + ... + ' + levels + '">';
    for (const [row, col] of cells) {
      const px = x + col * cell;
      const py = y + row * cell;
      html += '<rect x="' + px + '" y="' + py + '" width="' + cell + '" height="' + cell + '" fill="#d8e6ea" stroke="#172333" stroke-width="2" data-label-for="front stair slice"></rect>';
      html += '<circle cx="' + (px + cell * 0.72) + '" cy="' + (py + cell * 0.28) + '" r="' + Math.max(2, cell * 0.08) + '" fill="#172333" opacity="0.35"></circle>';
    }
    const outlinePoints = [
      [x, y],
      [x + cell, y],
      [x + cell, y + cell],
      [x + cell * 2, y + cell],
      [x + cell * 2, y + cell * 2],
      [x + cell * 3, y + cell * 2]
    ];
    if (levels > 3) {
      outlinePoints.length = 0;
      outlinePoints.push([x, y]);
      for (let step = 1; step <= levels; step += 1) {
        outlinePoints.push([x + step * cell, y + (step - 1) * cell]);
        outlinePoints.push([x + step * cell, y + step * cell]);
      }
    }
    outlinePoints.push([x, y + levels * cell], [x, y]);
    html += '<polyline points="' + outlinePoints.map((point) => point.join(",")).join(" ") + '" fill="none" stroke="#0b8993" stroke-width="4" stroke-linejoin="round" data-label-for="stair outline"></polyline>';
    html += svgText(x + levels * cell / 2, y + levels * cell + 24, "front stair slice", "front stair slice");
    return html + '</g>';
  }

  function miniStairSliceStripSvg(x, y, levels, length, cell, cross) {
    const visible = Math.min(length, 5);
    let html = '<g data-label-for="repeated stair slices">';
    for (let slice = 0; slice < visible; slice += 1) {
      const sx = x + slice * 36;
      const sy = y - slice * 5;
      const points = [];
      points.push([sx, sy]);
      for (let step = 1; step <= levels; step += 1) {
        points.push([sx + step * cell, sy + (step - 1) * cell]);
        points.push([sx + step * cell, sy + step * cell]);
      }
      points.push([sx, sy + levels * cell], [sx, sy]);
      html += '<polygon points="' + points.map((point) => point.join(",")).join(" ") + '" fill="#e5f7f9" stroke="#172333" stroke-width="2" opacity="' + (0.95 - slice * 0.08) + '" data-label-for="one stair slice"></polygon>';
      for (let step = 1; step < levels; step += 1) {
        html += '<line x1="' + (sx + step * cell) + '" y1="' + (sy + step * cell) + '" x2="' + (sx + levels * cell) + '" y2="' + (sy + step * cell) + '" stroke="#172333" stroke-width="1" opacity="0.35" data-label-for="cube rows"></line>';
      }
    }
    if (length > visible) html += svgText(x + visible * 36 + 10, y + levels * cell / 2, "...", "more stair slices");
    html += svgText(x + 118, y + levels * cell + 34, length + " identical stair slices", "length slices");
    html += svgText(x + 118, y + levels * cell + 60, "each slice has " + cross + " cubes", "cross-section");
    return html + '</g>';
  }

  function layerRepeatSvg(v, mode) {
    const inner =
      cubeIcon(96, 78, 1.25, "cube solid") +
      gridSvg(330, 62, v.size, Math.min(34, 150 / v.size), v.holes, "one layer plan") +
      svgText(180, 210, v.layers + " layers", "layers") +
      svgText(405, 270, "kept per layer = " + v.keptPerLayer, "kept per layer") +
      (mode !== "initial" ? svgText(310, 310, v.keptPerLayer + " x " + v.layers, "formula") : "") +
      (mode === "solution" ? svgText(310, 342, "Answer: " + v.keptPerLayer * v.layers + " cubes", "answer") : "");
    return baseSvg(inner, "layer count with removed cells");
  }

  function layerMapSvg(v, mode) {
    const cell = v.size <= 3 ? 26 : 21;
    const startX = 42;
    const inner = v.layers.map((holes, index) =>
      gridSvg(startX + index * 112, 72, v.size, cell, holes, "layer " + (index + 1))
    ).join("") +
      (mode !== "initial" ? svgText(310, 272, "layer counts = " + v.counts.join(" + "), "layer counts") : "") +
      (mode === "solution" ? svgText(310, 316, "Answer: " + sum(v.counts) + " cubes", "answer") : "");
    return baseSvg(inner, "separate layer plans");
  }

  function adjacentCubesSvg(v, mode) {
    const cell = v.grid[0].length > 3 ? 32 : 38;
    const inner =
      heightPlanGridSvg(58, 68, v.grid, cell, "plan of adjacent towers", { showAdjacent: true }) +
      svgText(162, 42, "numbers are tower heights", "plan of adjacent towers") +
      adjacentStackPreviewSvg(336, 210, v.grid) +
      svgText(452, 72, "red edges show touching faces", "adjacent shared face") +
      svgText(452, 102, "touching does not remove volume", "touching cubes") +
      (mode !== "initial" ? svgText(452, 150, "row totals = " + v.rowTotals.join(" + "), "row totals") : "") +
      (mode !== "initial" ? svgText(452, 178, "add every tower", "tower count") : "") +
      (mode === "solution" ? svgText(452, 318, "Answer: " + sum(v.rowTotals) + " cubes", "answer") : "");
    return baseSvg(inner, "adjacent cube towers counted from a plan");
  }

  function crossTunnelSvg(v, mode) {
    const cell = v.size <= 4 ? 30 : 24;
    const mid = Math.floor(v.size / 2);
    const cross = tunnelCrossCells(v.size);
    const centre = [[mid, mid]];
    const sideLayer = v.axes === 3 ? centre : [];
    const sideLabel = v.axes === 3 ? "top/bottom layer: vertical tunnel" : "other layers: full";
    const inner =
      cubeIcon(40, 58, 0.95, "unit cube key") +
      '<g data-label-for="each square is one cube in a layer">' +
      svgText(92, 145, "each square", "unit cube key") +
      svgText(92, 169, "is one cube", "unit cube key") +
      '</g>' +
      cubeCellGridSvg(205, 48, v.size, v.size, cell, sideLayer, sideLabel, { showCounts: true }) +
      cubeCellGridSvg(205, 178, v.size, v.size, cell, cross, "centre layer: row and column tunnels", { highlightCells: centre, showCounts: true }) +
      '<path d="M 345 114 C 400 132, 400 178, 345 196" fill="none" stroke="#0b8993" stroke-width="3" data-label-for="tunnel continues through layers"></path>' +
      svgText(462, 84, "centre cube is shared", "share") +
      svgText(462, 114, "count it once", "share") +
      svgText(462, 182, "removed = " + v.removed, "removed") +
      (v.axes === 2 ? svgText(462, 214, v.size + " + " + v.size + " - 1", "overlap formula") : svgText(462, 214, v.size + " + " + v.size + " + " + v.size + " - 2", "overlap formula")) +
      (mode === "solution" ? svgText(462, 310, "Answer: " + (v.total - v.removed) + " cubes", "answer") : "") +
      (mode !== "initial" ? svgText(250, 330, "full cube = " + v.size + " x " + v.size + " x " + v.size + " = " + v.total, "full cube") : "");
    return baseSvg(inner, "cube tunnel overlap shown with layer grids");
  }

  function sideTunnelSvg(v, mode) {
    const cell = Math.min(31, Math.floor(150 / Math.max(v.width, v.height)));
    const x = 80;
    const y = 58;
    const removedCells = tunnelOpeningCells(v.width, v.height, v.tunnelW, v.tunnelH);
    const gridW = v.width * cell;
    const gridH = v.height * cell;
    const inner =
      cubeCellGridSvg(x, y, v.width, v.height, cell, removedCells, "front slice: width by height", { showCounts: true }) +
      arrowLine(x, y + gridH + 42, x + gridW, y + gridH + 42, "width") +
      svgText(x + gridW / 2, y + gridH + 62, "width = " + v.width, "width") +
      '<line x1="' + (x - 28) + '" y1="' + y + '" x2="' + (x - 28) + '" y2="' + (y + gridH) + '" stroke="#172333" stroke-width="2" data-label-for="height"></line>' +
      svgText(x - 8, y + gridH / 2, "height = " + v.height, "height") +
      '<path d="M ' + (x + gridW + 12) + ' ' + (y + gridH * 0.42) + ' L 334 126" fill="none" stroke="#c3423f" stroke-width="3" data-label-for="tunnel opening"></path>' +
      svgText(342, 104, "tunnel opening", "tunnel opening") +
      svgText(342, 130, v.tunnelW + " wide x " + v.tunnelH + " high", "tunnel opening") +
      miniSliceStripSvg(368, 158, v.length, v.tunnelW, v.tunnelH, v.removed) +
      svgText(465, 72, "same missing slice repeats", "length slices") +
      svgText(465, 98, "through the full length = " + v.length, "length") +
      (mode !== "initial" ? svgText(310, 316, "subtract " + v.length + " x " + v.tunnelW + " x " + v.tunnelH + " = " + v.removed, "formula") : "") +
      (mode === "solution" ? svgText(310, 346, "Answer: " + (v.total - v.removed) + " cubes", "answer") : "");
    return baseSvg(inner, "straight tunnel shown as repeated cube slices");
  }

  function heightMapSvg(v, mode) {
    const rows = v.grid.length;
    const cols = v.grid[0].length;
    const cell = rows > 3 || cols > 3 ? 34 : 42;
    const inner =
      heightPlanGridSvg(72, 70, v.grid, cell, "plan height map") +
      '<g data-label-for="tower preview">' +
      v.grid.slice(0, 3).map((row, r) => row.slice(0, 4).map((height, c) => height > 0 ? '<rect x="' + (350 + c * 35) + '" y="' + (230 - height * 24 - r * 4) + '" width="28" height="' + (height * 24) + '" fill="#d8e6ea" stroke="#172333" stroke-width="2"></rect>' : "").join("")).join("") +
      '</g>' +
      svgText(425, 280, "each number is a tower", "tower rule") +
      (mode === "solution" ? svgText(310, 334, "Answer: " + sum(v.grid.flat()) + " cubes", "answer") : "");
    return baseSvg(inner, "plan view height map");
  }

  function stairSvg(v, mode) {
    const cell = v.levels >= 6 ? 22 : 26;
    const x = 72;
    const y = 58;
    const baseY = y + v.levels * cell;
    const inner =
      stairSliceGridSvg(x, y, v.levels, cell) +
      arrowLine(x, baseY + 36, x + v.levels * cell, baseY + 36, "slice width") +
      svgText(x + v.levels * cell / 2, baseY + 56, "stair rows: " + Array.from({ length: v.levels }, (_, index) => index + 1).join(" + "), "cross-section") +
      '<path d="M ' + (x + v.levels * cell + 24) + ' ' + (y + v.levels * cell * 0.55) + ' C 260 120, 310 124, 350 126" fill="none" stroke="#0b8993" stroke-width="3" data-label-for="repeat through length"></path>' +
      miniStairSliceStripSvg(350, 72, v.levels, v.length, Math.max(10, Math.floor(cell * 0.54)), v.cross) +
      svgText(462, 58, "repeat the slice", "repeat through length") +
      svgText(462, 86, "length = " + v.length, "length") +
      (mode !== "initial" ? svgText(310, 306, "cross-section = " + v.cross + " cubes", "formula") : "") +
      (mode !== "initial" ? svgText(310, 330, v.cross + " x " + v.length + " length slices", "length formula") : "") +
      (mode === "solution" ? svgText(310, 354, "Answer: " + v.cross * v.length + " cubes", "answer") : "");
    return baseSvg(inner, "staircase stack shown as repeated cube slices");
  }

  function viewsSvg(v, mode) {
    const inner =
      heightPlanGridSvg(54, 72, v.grid, v.grid[0].length > 3 ? 28 : 34, "plan with heights") +
      svgText(168, 48, "plan view", "plan with heights") +
      viewBarsSvg(292, 76, v.front, "front view: tallest in each column", "#d8e6ea", true) +
      viewBarsSvg(462, 76, v.left, "left view: tallest in each row", "#fff8dc", true) +
      svgText(380, 260, "front checks columns; left checks rows", "view rule") +
      (mode === "solution" ? svgText(310, 334, "Answer: " + sum(v.grid.flat()) + " cubes", "answer") : "");
    return baseSvg(inner, "front left and plan views");
  }

  function frontLeftViewSvg(v, mode) {
    const isFront = v.target === "front";
    const targetList = isFront ? v.front : v.left;
    const inner =
      heightPlanGridSvg(66, 74, v.grid, v.grid[0].length > 3 ? 30 : 36, "plan view with tower heights") +
      svgText(176, 48, "plan view", "plan view with tower heights") +
      '<path d="' + (isFront ? "M 176 245 L 176 214" : "M 48 150 L 74 150") + '" fill="none" stroke="#0b8993" stroke-width="4" marker-end="url(#arrowhead)" data-label-for="' + v.target + ' view direction"></path>' +
      viewBarsSvg(350, 78, targetList, v.target + " view answer", isFront ? "#d8e6ea" : "#fff8dc", mode !== "initial") +
      svgText(456, 56, (isFront ? "front view = tallest column heights" : "left view = tallest row heights"), "view rule") +
      (mode !== "initial" ? svgText(456, 250, "heights: " + v.expectedText, "view heights") : svgText(456, 250, "which heights can be seen?", "view heights")) +
      (mode === "solution" ? svgText(456, 320, "Answer: " + v.expectedText, "answer") : "");
    return '<svg viewBox="0 0 620 360" role="img" aria-label="front or left view from a tower plan">' +
      '<defs><marker id="arrowhead" markerWidth="10" markerHeight="8" refX="8" refY="4" orient="auto"><path d="M0,0 L10,4 L0,8 Z" fill="#0b8993"></path></marker></defs>' +
      '<rect width="620" height="360" rx="18" fill="#fbfefd"></rect>' +
      inner +
      '</svg>';
  }

  function reverseSvg(v, mode) {
    const kept = v.total / v.layers;
    const inner =
      gridSvg(88, 76, v.size, Math.min(34, 150 / v.size), [], "full layer") +
      svgText(410, 100, "total left = " + v.total, "total left") +
      svgText(410, 140, "layers = " + v.layers, "layers") +
      (mode !== "initial" ? svgText(410, 204, "kept per layer = " + kept, "kept per layer") : "") +
      (mode === "solution" ? svgText(310, 324, "Answer: " + v.missing + " removed per layer", "answer") : "");
    return baseSvg(inner, "reverse missing layer count");
  }

  function waterSvg(v, mode) {
    const answer = v.ask === "rise" ? v.rise : v.expected;
    const inner =
      '<rect x="116" y="80" width="170" height="172" fill="#ffffff" stroke="#172333" stroke-width="3"></rect>' +
      '<rect class="water" x="120" y="164" width="162" height="84"></rect>' +
      '<rect x="184" y="192" width="36" height="56" fill="#777f85" stroke="#172333" stroke-width="2"></rect>' +
      '<rect x="365" y="80" width="170" height="172" fill="#ffffff" stroke="#172333" stroke-width="3"></rect>' +
      '<rect class="water" x="369" y="140" width="162" height="108"></rect>' +
      svgText(201, 272, "start = " + v.start + " cm", "start level") +
      svgText(450, 272, "base area = " + v.baseArea + " cm^2", "base area") +
      svgText(310, 58, "solid volume = " + v.cubes + " cm^3", "solid volume") +
      (mode !== "initial" ? svgText(310, 312, "rise = " + v.cubes + " / " + v.baseArea + " = " + formatNumber(v.rise) + " cm", "rise") : "") +
      (mode === "solution" ? svgText(310, 344, "Answer: " + formatNumber(answer) + " cm", "answer") : "");
    return baseSvg(inner, "cube solid displaces water");
  }

  function compareSvg(v, mode) {
    const barA = Math.max(24, v.totalA * 3);
    const barB = Math.max(24, v.totalB * 3);
    const inner =
      svgText(170, 70, "Solid A layers: " + v.a.join(", "), "solid A") +
      '<rect x="80" y="100" width="' + barA + '" height="42" fill="#d8e6ea" stroke="#172333" stroke-width="2"></rect>' +
      svgText(170, 190, "Solid B layers: " + v.b.join(", "), "solid B") +
      '<rect x="80" y="220" width="' + barB + '" height="42" fill="#fff8dc" stroke="#172333" stroke-width="2"></rect>' +
      (mode !== "initial" ? svgText(420, 132, "A = " + v.totalA + ", B = " + v.totalB, "totals") : "") +
      (mode === "solution" ? svgText(420, 254, "Answer: " + Math.abs(v.totalA - v.totalB) + " cubes", "answer") : "");
    return baseSvg(inner, "compare two layer solids");
  }

  function renderProblemVisual(problem, state) {
    const v = problem.visual || {};
    const mode = state || "initial";
    let html;
    if (v.type === "layerRepeat") html = layerRepeatSvg(v, mode);
    else if (v.type === "layerMap") html = layerMapSvg(v, mode);
    else if (v.type === "adjacentCubes") html = adjacentCubesSvg(v, mode);
    else if (v.type === "crossTunnel") html = crossTunnelSvg(v, mode);
    else if (v.type === "sideTunnel") html = sideTunnelSvg(v, mode);
    else if (v.type === "heightMap") html = heightMapSvg(v, mode);
    else if (v.type === "stair") html = stairSvg(v, mode);
    else if (v.type === "frontLeftView") html = frontLeftViewSvg(v, mode);
    else if (v.type === "views") html = viewsSvg(v, mode);
    else if (v.type === "reverse") html = reverseSvg(v, mode);
    else if (v.type === "water") html = waterSvg(v, mode);
    else if (v.type === "compare") html = compareSvg(v, mode);
    else html = baseSvg(svgText(310, 180, problem.classic, "classic"), "volume extension problem");
    const text = mode === "solution" ? problem.solution : mode === "hint" ? problem.hint2 : problem.skill;
    return { html, text: formatMathText(text) };
  }

  function renderIntroScene(index) {
    const scene = INTRO_SCENES[index] || INTRO_SCENES[0];
    const dataByKind = {
      layer: { type: "layerRepeat", size: 3, layers: 3, holes: [[1, 1]], keptPerLayer: 8 },
      missing: { type: "layerMap", size: 3, layers: [[[1, 1]], [[0, 1], [2, 1]], [[1, 1]]], counts: [8, 7, 8] },
      tunnel: { type: "crossTunnel", size: 4, axes: 2, removed: 7, total: 64 },
      adjacent: { type: "adjacentCubes", grid: [[2, 1, 0], [1, 2, 1], [0, 1, 0]], rowTotals: [3, 4, 1], occupied: 6 },
      heightMap: { type: "heightMap", grid: [[3, 2, 1], [2, 2, 1], [1, 1, 1]] },
      stair: { type: "stair", levels: 4, length: 3, cross: 10 },
      views: { type: "views", grid: [[2, 1, 0], [3, 1, 1], [1, 0, 0]], front: [3, 1, 1], left: [2, 3, 1] },
      frontLeft: { type: "frontLeftView", grid: [[2, 1, 0], [3, 1, 1], [1, 0, 0]], front: [3, 1, 1], left: [2, 3, 1], target: "front", expectedText: "3, 1, 1" },
      reverse: { type: "reverse", size: 4, layers: 3, total: 42, missing: 2 },
      water: { type: "water", cubes: 36, baseArea: 72, start: 8, rise: 0.5, expected: 8.5, ask: "new" },
      ready: { type: "compare", a: [8, 7, 8], b: [9, 6, 6], totalA: 23, totalB: 21, bigger: "A" }
    };
    const fakeProblem = {
      classic: scene.title,
      skill: scene.purpose,
      hint2: scene.caption,
      solution: scene.caption,
      visual: dataByKind[scene.kind]
    };
    return renderProblemVisual(fakeProblem, scene.kind === "ready" ? "hint" : "solution").html;
  }

  function findSimilarVariant(problem, startVariant) {
    const base = Number.isFinite(startVariant) ? startVariant : problem.variantIndex;
    for (let offset = 1; offset <= 40; offset += 1) {
      const candidate = generateProblem(problem.classicId, base + offset);
      if (candidate.prompt !== problem.prompt) return base + offset;
    }
    return base + 1;
  }

  const api = {
    CLASSICS,
    CLASSIC_IDS,
    CLASSIC_BY_ID,
    CLASSIC_SKILLS,
    SOURCE_COVERAGE,
    INTRO_SCENES,
    ROUND_LENGTH,
    generateProblem,
    checkAnswer,
    validateProblemMath,
    renderProblemVisual,
    renderIntroScene,
    findSimilarVariant,
    formatMathText,
    parseNumber,
    displayValue
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.VolumeExtensionModule = api;
  if (root.document) initApp(api);

  function initApp(mod) {
    const doc = root.document;
    const els = {
      introScreen: doc.getElementById("intro-screen"),
      practiceGrid: doc.getElementById("practice-grid"),
      recap: doc.getElementById("round-recap"),
      introSkillGrid: doc.getElementById("intro-skill-grid"),
      introFrame: doc.getElementById("intro-frame"),
      introTitle: doc.getElementById("intro-scene-title"),
      introPurpose: doc.getElementById("intro-scene-purpose"),
      introCaption: doc.getElementById("intro-caption"),
      introProgress: doc.getElementById("intro-progress"),
      introProgressFill: doc.getElementById("intro-progress-fill"),
      introStoryboard: doc.getElementById("intro-storyboard"),
      introPlay: doc.getElementById("intro-play"),
      introPause: doc.getElementById("intro-pause"),
      introNext: doc.getElementById("intro-next"),
      introStart: doc.getElementById("intro-start"),
      introVoice: doc.getElementById("intro-voice-toggle"),
      introChoiceWatch: doc.getElementById("intro-choice-watch"),
      introChoiceTrain: doc.getElementById("intro-choice-train"),
      modeIntro: doc.getElementById("mode-intro-button"),
      modePractice: doc.getElementById("mode-practice-button"),
      classicLabel: doc.getElementById("classic-label"),
      sessionCount: doc.getElementById("session-count"),
      masteryChips: doc.getElementById("mastery-chips"),
      liveScore: doc.getElementById("live-score"),
      questionStrip: doc.getElementById("question-strip"),
      prompt: doc.getElementById("problem-prompt"),
      formatHint: doc.getElementById("format-hint"),
      answerForm: doc.getElementById("answer-form"),
      answerHost: doc.getElementById("answer-host"),
      check: doc.getElementById("check-button"),
      hint: doc.getElementById("hint-button"),
      why: doc.getElementById("why-button"),
      similar: doc.getElementById("similar-button"),
      next: doc.getElementById("next-button"),
      hintLadder: doc.getElementById("hint-ladder"),
      feedback: doc.getElementById("feedback"),
      visualFrame: doc.getElementById("visual-frame"),
      visualText: doc.getElementById("visual-text"),
      visualState: doc.getElementById("visual-state"),
      recapContent: doc.getElementById("recap-content"),
      freshRound: doc.getElementById("fresh-round-button"),
      reviewIntro: doc.getElementById("review-intro-button")
    };

    const state = {
      introIndex: 0,
      introTimer: null,
      roundSeed: 0,
      roundIndex: 0,
      currentProblem: null,
      currentVariant: 0,
      hintCount: 0,
      correct: 0,
      attempts: [],
      slots: [],
      currentSlot: null,
      wrongOnCurrent: false,
      problemResolved: false
    };

    function renderSkillGrid() {
      els.introSkillGrid.innerHTML = CLASSICS.map((classic) =>
        '<div><strong>' + escapeHtml(classic.nickname) + '</strong><span>' + escapeHtml(classic.skill) + '</span></div>'
      ).join("");
      els.masteryChips.innerHTML = CLASSICS.map((classic) =>
        '<span class="mastery-chip" data-classic="' + escapeHtml(classic.id) + '">' + escapeHtml(classic.nickname) + '</span>'
      ).join("");
    }

    function renderIntro() {
      const scene = INTRO_SCENES[state.introIndex];
      els.introTitle.textContent = scene.title;
      els.introPurpose.textContent = scene.purpose;
      els.introCaption.textContent = scene.caption;
      els.introFrame.innerHTML = mod.renderIntroScene(state.introIndex);
      els.introProgress.textContent = state.introIndex + 1 + " of " + INTRO_SCENES.length;
      els.introProgressFill.style.width = ((state.introIndex + 1) / INTRO_SCENES.length * 100) + "%";
      els.introStoryboard.innerHTML = INTRO_SCENES.map((item, index) => {
        const current = index === state.introIndex ? " current" : "";
        return '<li><button type="button" class="' + current + '" data-scene-index="' + index + '"><strong>' + escapeHtml(item.title) + '</strong><span class="scene-purpose">' + escapeHtml(item.purpose) + '</span></button></li>';
      }).join("");
    }

    function speak(text) {
      if (!els.introVoice.checked || !root.speechSynthesis) return;
      root.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      root.speechSynthesis.speak(utterance);
    }

    function stopIntroPlayback() {
      if (state.introTimer) root.clearInterval(state.introTimer);
      state.introTimer = null;
      els.introPlay.disabled = false;
      els.introPause.disabled = true;
      if (root.speechSynthesis) root.speechSynthesis.cancel();
    }

    function nextIntroScene() {
      state.introIndex = (state.introIndex + 1) % INTRO_SCENES.length;
      renderIntro();
      speak(INTRO_SCENES[state.introIndex].caption);
    }

    function playIntro() {
      stopIntroPlayback();
      els.introPlay.disabled = true;
      els.introPause.disabled = false;
      speak(INTRO_SCENES[state.introIndex].caption);
      state.introTimer = root.setInterval(nextIntroScene, 5200);
    }

    function showIntro() {
      stopIntroPlayback();
      els.introScreen.hidden = false;
      els.practiceGrid.hidden = true;
      els.recap.hidden = true;
      renderIntro();
    }

    function showPractice() {
      stopIntroPlayback();
      els.introScreen.hidden = true;
      els.practiceGrid.hidden = false;
      els.recap.hidden = true;
      if (!state.currentProblem) loadProblem();
    }

    function makeSlot(index) {
      const classicId = CLASSIC_IDS[index % CLASSIC_IDS.length];
      const variant = state.roundSeed + Math.floor(index / CLASSIC_IDS.length);
      return {
        index,
        classicId,
        variant,
        problem: mod.generateProblem(classicId, variant),
        status: "unseen",
        attempts: 0,
        hintCount: 0,
        lastInput: null,
        hadWrong: false,
        repaired: false,
        feedback: ""
      };
    }

    function buildSessionSlots() {
      state.slots = Array.from({ length: ROUND_LENGTH }, (_, index) => makeSlot(index));
    }

    function ensureSessionSlots() {
      if (!state.slots.length) buildSessionSlots();
    }

    function isAnsweredSlot(slot) {
      return slot && (slot.status === "correct" || slot.status === "wrong" || slot.status === "shown");
    }

    function slotStatusLabel(slot) {
      if (!slot) return "unanswered";
      if (slot.status === "correct") return slot.hadWrong ? "correct after repair" : "correct";
      if (slot.status === "wrong") return "needs another try";
      if (slot.status === "shown") return "solution shown";
      return "unanswered";
    }

    function updateSessionUI() {
      ensureSessionSlots();
      const correct = state.slots.filter((slot) => slot.status === "correct").length;
      const answered = state.slots.filter(isAnsweredSlot).length;
      const unanswered = ROUND_LENGTH - answered;
      state.correct = correct;
      els.liveScore.textContent = "Score " + correct + " / " + answered + " - Unanswered " + unanswered;
      els.questionStrip.innerHTML = state.slots.map((slot, index) => {
        const statusClass = slot.status === "unseen" ? "" : " " + slot.status;
        const current = index === state.roundIndex ? " current" : "";
        return '<button type="button" class="question-jump' + statusClass + current + '" data-question-index="' + index + '" aria-label="Question ' + (index + 1) + ': ' + escapeHtml(slotStatusLabel(slot)) + '">' + (index + 1) + '</button>';
      }).join("");
    }

    function setVisual(mode) {
      const rendered = mod.renderProblemVisual(state.currentProblem, mode);
      els.visualFrame.innerHTML = rendered.html;
      els.visualText.textContent = rendered.text;
      els.visualState.textContent = mode;
    }

    function renderAnswer(problem) {
      els.answerHost.innerHTML = "";
      if (problem.answerType === "choice") {
        const grid = doc.createElement("div");
        grid.className = "choice-grid";
        problem.choices.forEach((choice) => {
          const label = doc.createElement("label");
          label.className = "choice-card";
          label.innerHTML = '<input type="radio" name="answer-choice" value="' + escapeHtml(String(choice.value)) + '"><span>' + escapeHtml(formatMathText(choice.label)) + '</span>';
          grid.appendChild(label);
        });
        els.answerHost.appendChild(grid);
        return;
      }
      const input = doc.createElement("input");
      input.id = "answer-input";
      input.name = "answer-input";
      input.autocomplete = "off";
      input.placeholder = problem.answerType === "text" ? "Example: 3, 2, 1" : problem.unit === "cm" ? "Example: 8.5" : "Example: 24";
      els.answerHost.appendChild(input);
    }

    function collectInput(problem) {
      if (problem.answerType === "choice") {
        const checked = doc.querySelector("input[name='answer-choice']:checked");
        return { choice: checked ? checked.value : "" };
      }
      const input = doc.getElementById("answer-input");
      return { value: input ? input.value : "" };
    }

    function setAnswerLocked(locked) {
      els.answerHost.querySelectorAll("input").forEach((input) => {
        input.disabled = locked;
      });
    }

    function setFeedback(type, message) {
      els.feedback.className = "feedback-card " + type;
      els.feedback.textContent = formatMathText(message);
    }

    function captureCurrentInput() {
      if (!state.currentSlot || !state.currentProblem) return;
      state.currentSlot.lastInput = collectInput(state.currentProblem);
    }

    function restoreInput(problem, input) {
      if (!input) return;
      if (problem.answerType === "choice") {
        const checked = Array.from(els.answerHost.querySelectorAll("input[name='answer-choice']")).find((item) => String(item.value) === String(input.choice || ""));
        if (checked) checked.checked = true;
        return;
      }
      const field = doc.getElementById("answer-input");
      if (field && input.value) field.value = input.value;
    }

    function answerText(problem, input) {
      if (!input) return "no answer entered";
      if (problem.answerType === "choice") {
        const choice = (problem.choices || []).find((item) => String(item.value) === String(input.choice || ""));
        return choice ? choice.label : "no answer selected";
      }
      return input.value ? input.value : "no answer entered";
    }

    function appendHintItem(text) {
      const item = doc.createElement("div");
      item.className = "hint-item";
      item.textContent = formatMathText(text);
      els.hintLadder.appendChild(item);
    }

    function markCurrentSkipped() {
      if (!state.currentSlot) return;
      captureCurrentInput();
      if (state.currentSlot.status === "unseen") {
        state.currentSlot.status = "skipped";
        state.currentSlot.feedback = "Left unanswered for now.";
      }
      updateSessionUI();
    }

    function loadProblem(note, forcedClassicId, forcedVariant) {
      ensureSessionSlots();
      const slot = state.slots[state.roundIndex] || makeSlot(state.roundIndex);
      if (forcedClassicId && Number.isFinite(forcedVariant)) {
        slot.classicId = forcedClassicId;
        slot.variant = forcedVariant;
        slot.problem = mod.generateProblem(forcedClassicId, forcedVariant);
        slot.status = "unseen";
        slot.attempts = 0;
        slot.hintCount = 0;
        slot.lastInput = null;
        slot.hadWrong = true;
        slot.repaired = true;
        slot.feedback = "Fresh repair question loaded.";
      }
      const problem = slot.problem;
      state.currentSlot = slot;
      state.currentProblem = problem;
      state.currentVariant = slot.variant;
      state.hintCount = slot.hintCount;
      state.wrongOnCurrent = slot.hadWrong;
      state.problemResolved = slot.status === "correct" || slot.status === "shown";
      els.classicLabel.textContent = problem.classic;
      els.sessionCount.textContent = Math.min(state.roundIndex + 1, ROUND_LENGTH) + " of " + ROUND_LENGTH;
      els.prompt.textContent = problem.prompt;
      els.formatHint.textContent = problem.formatHint + " Source: " + problem.sourcePages + ".";
      els.hintLadder.innerHTML = "";
      for (let index = 0; index < slot.hintCount; index += 1) appendHintItem(index === 0 ? problem.hint1 : problem.hint2);
      els.next.disabled = false;
      els.check.disabled = state.problemResolved;
      els.why.disabled = state.problemResolved;
      els.similar.hidden = !(slot.status === "wrong" || slot.status === "shown");
      els.similar.disabled = els.similar.hidden;
      renderAnswer(problem);
      restoreInput(problem, slot.lastInput);
      setAnswerLocked(state.problemResolved);
      if (slot.status === "correct") {
        setFeedback("good", slot.feedback || "Already correct. You can move on or review another question.");
        setVisual("solution");
      } else if (slot.status === "wrong") {
        setFeedback("bad", slot.feedback || "This one still needs repair. Try again, use a hint, or take a similar question.");
        setVisual(slot.hintCount ? "hint" : "initial");
      } else if (slot.status === "shown") {
        setFeedback("muted", slot.feedback || problem.solution);
        setVisual("solution");
      } else {
        setFeedback("muted", note || (slot.status === "skipped" ? "This was left unanswered. You can answer it now." : "Use the diagram first. Then choose or type your answer."));
        setVisual(slot.hintCount ? "hint" : "initial");
      }
      els.masteryChips.querySelectorAll(".mastery-chip").forEach((chip) => {
        chip.classList.toggle("active", chip.dataset.classic === problem.classicId);
      });
      updateSessionUI();
    }

    function checkCurrentAnswer(event) {
      if (event) event.preventDefault();
      if (state.problemResolved) {
        setFeedback("muted", "This one is resolved. Move next or try a fresh round.");
        return;
      }
      const slot = state.currentSlot;
      const input = collectInput(state.currentProblem);
      if (slot) {
        slot.lastInput = input;
        slot.attempts += 1;
      }
      const result = mod.checkAnswer(state.currentProblem, input);
      if (result.isCorrect) {
        setFeedback("good", result.message);
        state.problemResolved = true;
        if (slot) {
          slot.status = "correct";
          slot.feedback = result.message;
          slot.hadWrong = slot.hadWrong || state.wrongOnCurrent;
          slot.hintCount = state.hintCount;
          state.attempts.push({ problem: state.currentProblem, correct: true, repaired: slot.repaired || slot.hadWrong, hintCount: state.hintCount });
        }
        els.check.disabled = true;
        els.why.disabled = true;
        els.similar.hidden = true;
        els.similar.disabled = true;
        setAnswerLocked(true);
        setVisual("solution");
        updateSessionUI();
      } else {
        const message = result.message + " You can retry, use a hint, or take a similar question with fresh numbers.";
        setFeedback("bad", message);
        if (slot) {
          slot.status = "wrong";
          slot.hadWrong = true;
          slot.feedback = message;
          slot.errorClass = result.errorClass;
          slot.hintCount = state.hintCount;
        }
        if (!state.wrongOnCurrent) {
          state.attempts.push({ problem: state.currentProblem, correct: false, errorClass: result.errorClass, hintCount: state.hintCount });
          state.wrongOnCurrent = true;
        }
        els.similar.hidden = false;
        els.similar.disabled = false;
        updateSessionUI();
      }
    }

    function showHint() {
      state.hintCount += 1;
      if (state.currentSlot) state.currentSlot.hintCount = state.hintCount;
      const hint = state.hintCount === 1 ? state.currentProblem.hint1 : state.currentProblem.hint2;
      appendHintItem(hint);
      setFeedback("muted", hint);
      setVisual("hint");
      updateSessionUI();
    }

    function showWhy() {
      setFeedback("muted", state.currentProblem.solution + " Take a similar one if you want to repair this skill before moving on.");
      setVisual("solution");
      els.similar.hidden = false;
      els.similar.disabled = false;
      els.check.disabled = true;
      els.why.disabled = true;
      setAnswerLocked(true);
      if (!state.problemResolved) {
        state.attempts.push({ problem: state.currentProblem, correct: false, errorClass: "shown_solution", hintCount: state.hintCount });
        state.problemResolved = true;
      }
      if (state.currentSlot) {
        state.currentSlot.status = "shown";
        state.currentSlot.feedback = state.currentProblem.solution;
        state.currentSlot.hintCount = state.hintCount;
        state.currentSlot.lastInput = collectInput(state.currentProblem);
      }
      updateSessionUI();
    }

    function trySimilarProblem() {
      const nextVariant = mod.findSimilarVariant(state.currentProblem, state.currentVariant);
      loadProblem("Same source skill, fresh numbers. Repair it here.", state.currentProblem.classicId, nextVariant);
    }

    function nextProblem() {
      markCurrentSkipped();
      state.roundIndex += 1;
      if (state.roundIndex >= ROUND_LENGTH) {
        showRecap();
        return;
      }
      loadProblem();
    }

    function showRecap() {
      ensureSessionSlots();
      els.introScreen.hidden = true;
      els.practiceGrid.hidden = true;
      els.recap.hidden = false;
      const correct = state.slots.filter((slot) => slot.status === "correct").length;
      const answered = state.slots.filter(isAnsweredSlot).length;
      const unanswered = ROUND_LENGTH - answered;
      const repaired = state.slots.filter((slot) => slot.status === "correct" && (slot.repaired || slot.hadWrong)).length;
      const rows = [
        '<div class="recap-item"><strong>Score</strong><span>' + correct + " correct out of " + ROUND_LENGTH + " questions. " + unanswered + " unanswered.</span></div>",
        '<div class="recap-item"><strong>Repairs</strong><span>' + repaired + " repaired after a miss or similar-question retry.</span></div>"
      ];
      state.slots.forEach((slot, index) => {
        const problem = slot.problem;
        const status = slotStatusLabel(slot);
        const expected = problem.expectedDisplay || displayValue(problem.expected, problem.unit);
        const studentAnswer = answerText(problem, slot.lastInput);
        const needsWork = slot.status !== "correct";
        const detail = needsWork
          ? "Your answer: " + studentAnswer + ". Correct answer: " + expected + ". " + problem.solution
          : "Your answer: " + studentAnswer + ". " + (slot.hadWrong ? "You repaired it." : "Clean solve.");
        rows.push('<div class="recap-item ' + (needsWork ? "needs-work" : "solid") + '"><strong>Q' + (index + 1) + " - " + escapeHtml(problem.classic) + '</strong><span class="recap-status">' + escapeHtml(status) + '</span><p>' + escapeHtml(formatMathText(detail)) + '</p></div>');
      });
      els.recapContent.innerHTML = rows.join("");
      updateSessionUI();
    }

    function freshRound() {
      state.roundSeed += 3;
      state.roundIndex = 0;
      state.correct = 0;
      state.attempts = [];
      buildSessionSlots();
      state.currentProblem = state.slots[0].problem;
      state.currentSlot = null;
      showPractice();
      loadProblem("Fresh round with new numbers.");
    }

    function goToQuestion(index) {
      if (index < 0 || index >= ROUND_LENGTH) return;
      markCurrentSkipped();
      state.roundIndex = index;
      loadProblem("Returned to question " + (index + 1) + ".");
    }

    renderSkillGrid();
    renderIntro();
    updateSessionUI();
    els.introStoryboard.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-scene-index]");
      if (!button) return;
      stopIntroPlayback();
      state.introIndex = Number(button.dataset.sceneIndex);
      renderIntro();
      speak(INTRO_SCENES[state.introIndex].caption);
    });
    els.introPlay.addEventListener("click", playIntro);
    els.introPause.addEventListener("click", stopIntroPlayback);
    els.introNext.addEventListener("click", nextIntroScene);
    els.introStart.addEventListener("click", showPractice);
    els.introChoiceWatch.addEventListener("click", playIntro);
    els.introChoiceTrain.addEventListener("click", showPractice);
    els.modeIntro.addEventListener("click", showIntro);
    els.modePractice.addEventListener("click", showPractice);
    els.answerForm.addEventListener("submit", checkCurrentAnswer);
    els.hint.addEventListener("click", showHint);
    els.why.addEventListener("click", showWhy);
    els.similar.addEventListener("click", trySimilarProblem);
    els.next.addEventListener("click", nextProblem);
    els.questionStrip.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-question-index]");
      if (!button) return;
      goToQuestion(Number(button.dataset.questionIndex));
    });
    els.freshRound.addEventListener("click", freshRound);
    els.reviewIntro.addEventListener("click", showIntro);
  }
})(typeof window !== "undefined" ? window : globalThis);
