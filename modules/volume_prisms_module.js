(function (root) {
  "use strict";

  const ROUND_LENGTH = 10;

  // Maps each classic to a registry skill so the skill-coverage gate can
  // verify the bank covers every skill the registry promises.
  // Registry skills: ["Base area", "Hollow prisms", "Composite faces",
  // "Water rise", "Partial submerge"].
  const CLASSIC_SKILLS = {
    "cuboid-warmup": "Base area",
    "base-area-stack": "Base area",
    "hollow-prism": "Hollow prisms",
    "hollow-height": "Hollow prisms",
    "composite-cross-section": "Composite faces",
    "water-rise-volume": "Water rise",
    "new-water-level": "Water rise",
    "full-tank-removal": "Partial submerge",
    "partial-submerged-block": "Partial submerge",
    "extensive-cross-section": "Composite faces"
  };

  const CLASSICS = [
    {
      id: "cuboid-warmup",
      nickname: "Cuboid Warmup",
      skill: "Use length x width x height directly, then reverse it to find a missing height.",
      sourcePages: "Book 85 / PDF 95"
    },
    {
      id: "base-area-stack",
      nickname: "Base Area Stack",
      skill: "Treat any prism as one base area stacked through a height.",
      sourcePages: "Book 86 / PDF 96",
      // Prism shape varies per variant by design (triangular / rectangular / cylinder-style / pentagonal) — recognising "any prism is base x height" across shapes IS the lesson.
      variantStability: false
    },
    {
      id: "hollow-prism",
      nickname: "Hollow Prism",
      skill: "Subtract the hole area from the outside area before multiplying by height.",
      sourcePages: "Book 87 / PDF 97"
    },
    {
      id: "hollow-height",
      nickname: "Hollow Height",
      skill: "Reverse the hollow-prism formula to find the prism height.",
      sourcePages: "Book 87-88 / PDF 97-98"
    },
    {
      id: "composite-cross-section",
      nickname: "Split The Face",
      skill: "Split a cross-section into rectangles and triangles, then multiply by prism length.",
      sourcePages: "Book 88, 93-96 / PDF 98, 103-106",
      // Composite shape alternates per variant (house = rectangle + triangle vs L-shape = rectangle minus corner) by design — splitting different composite cross-sections IS the lesson.
      variantStability: false
    },
    {
      id: "water-rise-volume",
      nickname: "Water Rise Volume",
      skill: "Use tank base area times water-height increase to find submerged volume.",
      sourcePages: "Book 89, 94-97 / PDF 99, 104-107"
    },
    {
      id: "new-water-level",
      nickname: "New Water Level",
      skill: "Turn a known submerged volume into a water-height increase.",
      sourcePages: "Book 90, 97 / PDF 100, 107"
    },
    {
      id: "full-tank-removal",
      nickname: "Full Tank Removal",
      skill: "When a full tank loses an object, the water drops by object volume divided by base area.",
      sourcePages: "Book 91, 94, 97 / PDF 101, 104, 107"
    },
    {
      id: "partial-submerged-block",
      nickname: "Tall Block Trap",
      skill: "Use the container base area minus the block base area when the block sticks out of the water.",
      sourcePages: "Book 92, 98 / PDF 102, 108"
    },
    {
      id: "extensive-cross-section",
      nickname: "Challenge Cross-Section",
      skill: "Combine a square and trapezium cross-section, then stretch it through the prism.",
      sourcePages: "Book 98 / PDF 108"
    }
  ];

  const CLASSIC_IDS = CLASSICS.map((classic) => classic.id);
  const CLASSIC_BY_ID = Object.fromEntries(CLASSICS.map((classic) => [classic.id, classic]));

  const SOURCE_COVERAGE = {
    "cuboid-warmup": ["Let's Get Ready direct cuboid", "Let's Get Ready reverse cuboid height"],
    "base-area-stack": ["Base area times height blanks", "Non-cuboid prism recognition"],
    "hollow-prism": ["Exploration 1 hollow square prism", "Further Exercises hollow prism volume"],
    "hollow-height": ["Exploration 1 reverse hollow height", "Further Exercises reverse hollow height"],
    "composite-cross-section": ["Rectangle plus triangle prism", "L-shaped prism", "slanted composite prism"],
    "water-rise-volume": ["Stone volume from level rise", "multiple equal stones", "block volume from level rise"],
    "new-water-level": ["Known stone volume raises water", "known volume in rectangular tank"],
    "full-tank-removal": ["Filled tank with object inside, then remove object"],
    "partial-submerged-block": ["Tall block protrudes above water, available base area shrinks"],
    "extensive-cross-section": ["Square plus trapezium optional challenge"]
  };

  const INTRO_SCENES = [
    {
      title: "A Prism Is A Stack",
      purpose: "See the repeated slice before the formula.",
      kind: "stack",
      caption: "A prism is the same slice copied again and again. If we know one slice, we can stack it through the height."
    },
    {
      title: "Base Area x Height",
      purpose: "Bridge the picture to the shortcut.",
      kind: "base",
      caption: "The base area tells us one layer. The height tells us how many layers. That is why volume is base area x height."
    },
    {
      title: "Hollow Means Subtract",
      purpose: "Hollow prisms: keep the missing space visible.",
      kind: "hollow",
      caption: "A hole is missing space. Find the outside area, remove the hole area, then multiply by the prism height."
    },
    {
      title: "Split The Cross-Section",
      purpose: "Composite faces: split the cross-section into friendly shapes.",
      kind: "composite",
      caption: "For a composite prism, split the front face into friendly shapes. Add their areas, then stretch that area through the prism."
    },
    {
      title: "Water Rise Is Volume",
      purpose: "Connect displacement to volume.",
      kind: "waterRise",
      caption: "When a stone goes fully under water, the extra water height tells us exactly how much space the stone took."
    },
    {
      title: "Known Volume Raises Water",
      purpose: "Reverse the displacement move.",
      kind: "newLevel",
      caption: "If we already know the stone volume, divide it by the tank base area. That gives the water rise."
    },
    {
      title: "Full Then Remove",
      purpose: "Prepare filled-tank removal questions.",
      kind: "remove",
      caption: "If the tank was full while the object was inside, taking the object out leaves a missing water volume equal to the object's volume."
    },
    {
      title: "Tall Block Trap",
      purpose: "Handle partial submergence.",
      kind: "partial",
      caption: "If the block sticks out, only the underwater part counts. The water rises through the container area minus the block area."
    },
    {
      title: "Ready To Train",
      purpose: "Map the video into practice.",
      kind: "ready",
      caption: "Now train the same source moves with fresh numbers, mixed answer styles, hints, worked steps, and repair questions."
    }
  ];

  const SUPERSCRIPTS = {
    "0": "⁰",
    "1": "¹",
    "2": "²",
    "3": "³",
    "4": "⁴",
    "5": "⁵",
    "6": "⁶",
    "7": "⁷",
    "8": "⁸",
    "9": "⁹",
    "+": "⁺",
    "-": "⁻",
    "(": "⁽",
    ")": "⁾"
  };

  const PLAIN_SUPERSCRIPTS = {
    "⁰": "0",
    "¹": "1",
    "²": "2",
    "³": "3",
    "⁴": "4",
    "⁵": "5",
    "⁶": "6",
    "⁷": "7",
    "⁸": "8",
    "⁹": "9"
  };

  function toSuperscript(value) {
    return String(value)
      .replace(/\s+/g, "")
      .split("")
      .map((char) => SUPERSCRIPTS[char] || char)
      .join("");
  }

  function formatMathText(value) {
    return String(value)
      .replace(/\^\(([^)]{1,40})\)/g, (_, exponent) => toSuperscript("(" + exponent + ")"))
      .replace(/\^(-?\d+)/g, (_, exponent) => toSuperscript(exponent));
  }

  function plainMathText(value) {
    return String(value).replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, (char) => PLAIN_SUPERSCRIPTS[char] || char);
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

  function parseNumber(value) {
    const cleaned = plainMathText(value)
      .toLowerCase()
      .replace(/,/g, "")
      .replace(/cm3|cm2|cm|m3|m2|m/g, " ")
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
    while (values.length < 4) {
      values.push(expected + values.length + 2);
    }
    return values
      .map((value) => ({ value, sortKey: stableSeed(seed + "|" + formatNumber(value)) }))
      .sort((a, b) => a.sortKey - b.sortKey)
      .map((item) => item.value);
  }

  function applyAnswerMode(problem, variantIndex) {
    const classicOffset = CLASSIC_IDS.indexOf(problem.classicId);
    const wantsTyped = (variantIndex + classicOffset) % 3 === 1;
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
      formatHint: fields.unit === "cm^3"
        ? "Give the volume in cubic centimetres."
        : fields.unit === "cm"
          ? "Give the length or water level in centimetres."
          : "Give the number.",
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

  function cuboidWarmup(variantIndex) {
    const direct = [
      [8, 5, 6],
      [9, 4, 7],
      [11, 3, 8],
      [7, 6, 5],
      [12, 4, 6],
      [10, 9, 3],
      [13, 4, 5],
      [6, 6, 9]
    ];
    const reverse = [
      [16, 5, 7],
      [18, 4, 9],
      [14, 6, 5],
      [15, 8, 4],
      [20, 3, 11],
      [12, 7, 8],
      [9, 9, 6],
      [22, 5, 4]
    ];
    if (variantIndex % 2 === 0) {
      const [length, width, height] = pick(direct, Math.floor(variantIndex / 2));
      const expected = length * width * height;
      return problemBase("cuboid-warmup", {
        prompt: "A rectangular prism is " + length + " cm long, " + width + " cm wide, and " + height + " cm high. What is its volume?",
        expected,
        unit: "cm^3",
        wrongs: [length * width, length * height, width * height, expected + length * width, expected - width * height],
        hint1: "A cuboid is a rectangular prism, so use length x width x height.",
        hint2: length + " x " + width + " x " + height + " gives the number of cubic centimetres.",
        solution: "Multiply the three perpendicular dimensions: " + length + " x " + width + " x " + height + " = " + expected + " cm^3.",
        visual: { type: "cuboid", length, width, height, mode: "direct" },
        audit: { kind: "cuboid-direct", length, width, height }
      }, variantIndex);
    }
    const [length, width, height] = pick(reverse, Math.floor(variantIndex / 2));
    const volume = length * width * height;
    return problemBase("cuboid-warmup", {
      prompt: "A cuboid has volume " + volume + " cm^3. Its base is " + length + " cm by " + width + " cm. What is its height?",
      expected: height,
      unit: "cm",
      wrongs: [volume / length, volume / width, length + width, height + 2, Math.max(1, height - 2)],
      hint1: "Reverse the cuboid formula. Height = volume / base area.",
      hint2: "The base area is " + length + " x " + width + " = " + length * width + " cm^2.",
      solution: "Divide the volume by the base area: " + volume + " / (" + length + " x " + width + ") = " + height + " cm.",
      visual: { type: "cuboid", length, width, height, volume, mode: "reverse" },
      audit: { kind: "cuboid-reverse", length, width, height, volume }
    }, variantIndex);
  }

  function baseAreaStack(variantIndex) {
    const sets = [
      ["triangular prism", 24, 7],
      ["rectangular prism", 35, 8],
      ["cylinder-style prism", 28, 6],
      ["pentagonal prism", 42, 5],
      ["right prism", 54, 4],
      ["triangular prism", 36, 9],
      ["rectangular prism", 45, 6],
      ["cylinder-style prism", 32, 11]
    ];
    const [shape, baseArea, height] = pick(sets, variantIndex);
    const expected = baseArea * height;
    return problemBase("base-area-stack", {
      prompt: "A " + shape + " has base area " + baseArea + " cm^2 and height " + height + " cm. What is its volume?",
      expected,
      unit: "cm^3",
      wrongs: [baseArea + height, baseArea * (height + 1), baseArea * Math.max(1, height - 1), baseArea / 2 * height],
      hint1: "For any prism, one base area is stacked through the height.",
      hint2: "Use volume = base area x height.",
      solution: "Stack the base area through the height: " + baseArea + " x " + height + " = " + expected + " cm^3.",
      visual: { type: "baseArea", shape, baseArea, height },
      audit: { kind: "base-area", baseArea, height }
    }, variantIndex);
  }

  function hollowPrism(variantIndex) {
    const sets = [
      [12, 4, 9],
      [14, 6, 8],
      [9, 3, 16],
      [15, 5, 6],
      [11, 2, 10],
      [16, 4, 7],
      [18, 6, 5],
      [13, 5, 12]
    ];
    const [outerSide, holeSide, height] = pick(sets, variantIndex);
    const outerArea = outerSide * outerSide;
    const holeArea = holeSide * holeSide;
    const crossArea = outerArea - holeArea;
    const expected = crossArea * height;
    return problemBase("hollow-prism", {
      prompt: "A square prism has outside side " + outerSide + " cm and a vertical square hole of side " + holeSide + " cm. Its height is " + height + " cm. What is the volume of the hollow prism?",
      expected,
      unit: "cm^3",
      wrongs: [outerArea * height, holeArea * height, (outerSide - holeSide) * (outerSide - holeSide) * height, expected + holeArea * height],
      hint1: "The hole is missing space, so subtract its area from the outside square area.",
      hint2: "Cross-section area = " + outerSide + "^2 - " + holeSide + "^2 = " + crossArea + " cm^2.",
      solution: "(" + outerSide + "^2 - " + holeSide + "^2) x " + height + " = " + expected + " cm^3.",
      visual: { type: "hollow", outerSide, holeSide, height, crossArea },
      audit: { kind: "hollow-direct", outerSide, holeSide, height }
    }, variantIndex);
  }

  function hollowHeight(variantIndex) {
    const sets = [
      [10, 2, 9],
      [12, 6, 5],
      [8, 2, 13],
      [15, 3, 7],
      [14, 4, 11],
      [9, 5, 8],
      [16, 8, 6],
      [18, 6, 4]
    ];
    const [outerSide, holeSide, height] = pick(sets, variantIndex);
    const crossArea = outerSide * outerSide - holeSide * holeSide;
    const volume = crossArea * height;
    return problemBase("hollow-height", {
      prompt: "A hollow square prism has outside side " + outerSide + " cm and a vertical square hole of side " + holeSide + " cm. Its volume is " + volume + " cm^3. What is its height?",
      expected: height,
      unit: "cm",
      wrongs: [volume / (outerSide * outerSide), volume / (holeSide * holeSide), height + 3, Math.max(1, height - 2), outerSide + holeSide],
      hint1: "Find the hollow cross-section first. Then divide the volume by that area.",
      hint2: "Area left behind = " + outerSide + "^2 - " + holeSide + "^2 = " + crossArea + " cm^2.",
      solution: "Divide the volume by the hollow cross-section area: " + volume + " / " + crossArea + " = " + height + " cm.",
      visual: { type: "hollow", outerSide, holeSide, height, crossArea, volume },
      audit: { kind: "hollow-reverse", outerSide, holeSide, height, volume }
    }, variantIndex);
  }

  function compositeCrossSection(variantIndex) {
    const houseSets = [
      [9, 8, 4, 18],
      [12, 7, 6, 14],
      [10, 9, 5, 16],
      [8, 6, 4, 22],
      [14, 5, 8, 12]
    ];
    const stepSets = [
      [13, 8, 7, 3, 15],
      [12, 9, 5, 4, 18],
      [15, 7, 8, 2, 16],
      [10, 11, 4, 5, 20],
      [14, 10, 6, 3, 12]
    ];
    if (variantIndex % 2 === 0) {
      const [width, wallHeight, roofHeight, length] = pick(houseSets, Math.floor(variantIndex / 2));
      const rectArea = width * wallHeight;
      const triArea = width * roofHeight / 2;
      const crossArea = rectArea + triArea;
      const expected = crossArea * length;
      return problemBase("composite-cross-section", {
        prompt: "A house-shaped prism has a rectangular part " + width + " cm wide and " + wallHeight + " cm high, plus a triangular roof of height " + roofHeight + " cm. The prism length is " + length + " cm. What is its volume?",
        expected,
        unit: "cm^3",
        wrongs: [rectArea * length, triArea * length, width * (wallHeight + roofHeight) * length, expected + width * length],
        hint1: "Split the front face into a rectangle and a triangle.",
        hint2: "Cross-section area = " + width + " x " + wallHeight + " + (" + width + " x " + roofHeight + ") / 2.",
        solution: "Cross-section area = " + rectArea + " + " + formatNumber(triArea) + " = " + formatNumber(crossArea) + " cm^2. Volume = " + formatNumber(crossArea) + " x " + length + " = " + expected + " cm^3.",
        visual: { type: "composite", shape: "house", width, wallHeight, roofHeight, length, crossArea },
        audit: { kind: "composite-house", width, wallHeight, roofHeight, length }
      }, variantIndex);
    }
    const [bottomWidth, totalHeight, topWidth, lowerHeight, length] = pick(stepSets, Math.floor(variantIndex / 2));
    const missingWidth = bottomWidth - topWidth;
    const missingHeight = totalHeight - lowerHeight;
    const crossArea = bottomWidth * totalHeight - missingWidth * missingHeight;
    const expected = crossArea * length;
    return problemBase("composite-cross-section", {
      prompt: "An L-shaped prism has an outside rectangle " + bottomWidth + " cm by " + totalHeight + " cm. The missing corner is " + missingWidth + " cm by " + missingHeight + " cm. The prism length is " + length + " cm. What is the volume?",
      expected,
      unit: "cm^3",
      wrongs: [bottomWidth * totalHeight * length, missingWidth * missingHeight * length, topWidth * lowerHeight * length, expected - missingWidth * length],
      hint1: "Use the big rectangle, then subtract the missing corner.",
      hint2: "Cross-section area = " + bottomWidth + " x " + totalHeight + " - " + missingWidth + " x " + missingHeight + ".",
      solution: "Cross-section area = " + bottomWidth * totalHeight + " - " + missingWidth * missingHeight + " = " + crossArea + " cm^2. Volume = " + crossArea + " x " + length + " = " + expected + " cm^3.",
      visual: { type: "composite", shape: "step", bottomWidth, totalHeight, topWidth, lowerHeight, length, crossArea },
      audit: { kind: "composite-step", bottomWidth, totalHeight, topWidth, lowerHeight, length }
    }, variantIndex);
  }

  function waterRiseVolume(variantIndex) {
    const sets = [
      [18, 10, 7, 10, 1],
      [16, 12, 5, 8, 2],
      [14, 9, 6, 11, 3],
      [20, 8, 4, 7, 1],
      [15, 14, 9, 12, 1],
      [12, 11, 8, 14, 2],
      [22, 6, 5, 9, 4],
      [13, 10, 6, 12, 3]
    ];
    const [length, width, startHeight, endHeight, stones] = pick(sets, variantIndex);
    const baseArea = length * width;
    const rise = endHeight - startHeight;
    const totalVolume = baseArea * rise;
    const expected = totalVolume / stones;
    const stoneText = stones === 1 ? "one stone is" : stones + " equal stones are";
    const targetText = stones === 1 ? "the stone" : "each stone";
    return problemBase("water-rise-volume", {
      prompt: "A tank is " + length + " cm by " + width + " cm. Its water level rises from " + startHeight + " cm to " + endHeight + " cm when " + stoneText + " fully submerged. What is the volume of " + targetText + "?",
      expected,
      unit: "cm^3",
      wrongs: [totalVolume, baseArea, baseArea * endHeight, baseArea * startHeight, expected + baseArea],
      hint1: "Fully submerged volume equals tank base area times the change in water height.",
      hint2: "Base area = " + length + " x " + width + " = " + baseArea + " cm^2, and the rise is " + rise + " cm.",
      solution: stones === 1
        ? "Volume displaced = base area x rise = " + baseArea + " x " + rise + " = " + expected + " cm^3."
        : "Total displaced volume is " + baseArea + " x " + rise + ". Divide by " + stones + ": (" + baseArea + " x " + rise + ") / " + stones + " = " + expected + " cm^3.",
      visual: { type: "waterRise", length, width, startHeight, endHeight, stones, baseArea },
      audit: { kind: "water-rise", length, width, startHeight, endHeight, stones }
    }, variantIndex);
  }

  function newWaterLevel(variantIndex) {
    const sets = [
      [12, 10, 8, 360],
      [15, 8, 9, 240],
      [14, 11, 6, 308],
      [18, 9, 7, 486],
      [16, 10, 5, 640],
      [13, 12, 8, 468],
      [20, 7, 6, 560],
      [11, 10, 9, 220]
    ];
    const [length, width, startHeight, objectVolume] = pick(sets, variantIndex);
    const baseArea = length * width;
    const rise = objectVolume / baseArea;
    const expected = startHeight + rise;
    return problemBase("new-water-level", {
      prompt: "A water tank is " + length + " cm by " + width + " cm. The water starts at " + startHeight + " cm high. A fully submerged object has volume " + objectVolume + " cm^3. What is the new water level?",
      expected,
      unit: "cm",
      wrongs: [rise, startHeight + objectVolume / length, startHeight + objectVolume / width, startHeight, expected + 2],
      hint1: "Known submerged volume becomes a height rise.",
      hint2: "Height rise = object volume / tank base area.",
      solution: "Base area = " + baseArea + " cm^2. Rise = " + objectVolume + " / " + baseArea + " = " + formatNumber(rise) + " cm. New level = " + formatNumber(expected) + " cm.",
      visual: { type: "newLevel", length, width, startHeight, objectVolume, expected },
      audit: { kind: "new-level", length, width, startHeight, objectVolume }
    }, variantIndex);
  }

  function fullTankRemoval(variantIndex) {
    const sets = [
      [12, 10, 8, 5, 4, 6],
      [15, 12, 10, 6, 5, 9],
      [14, 10, 9, 4, 4, 7],
      [18, 8, 12, 6, 3, 8],
      [16, 10, 7, 5, 5, 4],
      [20, 9, 11, 6, 5, 6],
      [13, 12, 10, 4, 6, 5],
      [22, 10, 9, 5, 4, 8]
    ];
    const [tankL, tankW, tankH, blockL, blockW, blockH] = pick(sets, variantIndex);
    const baseArea = tankL * tankW;
    const objectVolume = blockL * blockW * blockH;
    const drop = objectVolume / baseArea;
    const expected = tankH - drop;
    return problemBase("full-tank-removal", {
      prompt: "A tank " + tankL + " cm by " + tankW + " cm by " + tankH + " cm is filled to the top while a " + blockL + " cm by " + blockW + " cm by " + blockH + " cm block is inside. If the block is removed, what is the water level?",
      expected,
      unit: "cm",
      wrongs: [tankH, drop, tankH - objectVolume / tankL, tankH - objectVolume / tankW, expected + 1],
      hint1: "The removed block leaves behind missing water space equal to its volume.",
      hint2: "Water drop = block volume / tank base area.",
      solution: "Block volume = " + objectVolume + " cm^3. Tank base area = " + baseArea + " cm^2. Drop = " + formatNumber(drop) + " cm, so water level = " + formatNumber(expected) + " cm.",
      visual: { type: "remove", tankL, tankW, tankH, blockL, blockW, blockH, expected },
      audit: { kind: "remove-full", tankL, tankW, tankH, blockL, blockW, blockH }
    }, variantIndex);
  }

  function partialSubmergedBlock(variantIndex) {
    const sets = [
      [72, 8, 12, 22, 20],
      [96, 10, 16, 24, 22],
      [120, 9, 30, 25, 20],
      [150, 12, 25, 30, 24],
      [88, 9, 22, 21, 20],
      [140, 11, 20, 28, 24],
      [180, 10, 45, 26, 22],
      [160, 13, 30, 32, 28]
    ];
    const [containerBaseArea, startHeight, blockBaseArea, blockHeight, tankHeight] = pick(sets, variantIndex);
    const waterVolume = containerBaseArea * startHeight;
    const availableArea = containerBaseArea - blockBaseArea;
    const expected = waterVolume / availableArea;
    return problemBase("partial-submerged-block", {
      prompt: "A tank has base area " + containerBaseArea + " cm^2 and water height " + startHeight + " cm. A tall vertical block with base area " + blockBaseArea + " cm^2 and height " + blockHeight + " cm is placed in the water, but it sticks out above the surface. What is the new water level?",
      expected,
      unit: "cm",
      wrongs: [startHeight + blockBaseArea * blockHeight / containerBaseArea, startHeight + blockBaseArea / containerBaseArea, waterVolume / containerBaseArea, expected + 2, Math.max(1, expected - 2)],
      hint1: "Because the block sticks out, do not add the whole block volume.",
      hint2: "The water now occupies the container base area minus the block base area.",
      solution: "Initial water volume = " + containerBaseArea + " x " + startHeight + " = " + waterVolume + " cm^3. Available area = " + containerBaseArea + " - " + blockBaseArea + " = " + availableArea + " cm^2. Water level = " + waterVolume + " / " + availableArea + " = " + formatNumber(expected) + " cm.",
      visual: { type: "partial", containerBaseArea, startHeight, blockBaseArea, blockHeight, tankHeight, expected },
      audit: { kind: "partial", containerBaseArea, startHeight, blockBaseArea, blockHeight, tankHeight }
    }, variantIndex);
  }

  function extensiveCrossSection(variantIndex) {
    const sets = [
      [8, 18, 14, 70],
      [10, 24, 17, 50],
      [9, 21, 15, 80],
      [7, 17, 13, 90],
      [11, 25, 18, 60],
      [6, 16, 12, 100],
      [13, 29, 21, 40],
      [12, 28, 19, 75]
    ];
    const [squareSide, longBase, totalHeight, length] = pick(sets, variantIndex);
    const trapeziumHeight = totalHeight - squareSide;
    const squareArea = squareSide * squareSide;
    const trapeziumArea = (squareSide + longBase) * trapeziumHeight / 2;
    const crossArea = squareArea + trapeziumArea;
    const expected = crossArea * length;
    return problemBase("extensive-cross-section", {
      prompt: "A prism has a cross-section made from a square of side " + squareSide + " cm on top of a trapezium. The trapezium has parallel sides " + squareSide + " cm and " + longBase + " cm, and the total cross-section height is " + totalHeight + " cm. The prism length is " + length + " cm. What is the total volume?",
      expected,
      unit: "cm^3",
      wrongs: [squareArea * length, trapeziumArea * length, squareSide * longBase * length, crossArea * totalHeight, expected - squareArea * length],
      hint1: "This is an extensive challenge: find the square area and trapezium area separately.",
      hint2: "The trapezium height is total height minus the square side.",
      solution: "Square area = " + squareArea + " cm^2. Trapezium area = (" + squareSide + " + " + longBase + ") x " + trapeziumHeight + " / 2 = " + formatNumber(trapeziumArea) + " cm^2. Volume = " + formatNumber(crossArea) + " x " + length + " = " + expected + " cm^3.",
      visual: { type: "trapezium", squareSide, longBase, totalHeight, length, trapeziumHeight, crossArea },
      audit: { kind: "extensive", squareSide, longBase, totalHeight, length }
    }, variantIndex);
  }

  const GENERATORS = {
    "cuboid-warmup": cuboidWarmup,
    "base-area-stack": baseAreaStack,
    "hollow-prism": hollowPrism,
    "hollow-height": hollowHeight,
    "composite-cross-section": compositeCrossSection,
    "water-rise-volume": waterRiseVolume,
    "new-water-level": newWaterLevel,
    "full-tank-removal": fullTankRemoval,
    "partial-submerged-block": partialSubmergedBlock,
    "extensive-cross-section": extensiveCrossSection
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
        ? { isCorrect: true, message: "Correct. The volume move checks out." }
        : { isCorrect: false, errorClass: "wrong_choice", message: "Not quite. Check which area or height the question is using." };
    }
    const actual = parseNumber(input.value);
    if (!Number.isFinite(actual)) {
      return { isCorrect: false, errorClass: "bad_number_format", message: "Type a number. Units are optional." };
    }
    return Math.abs(actual - problem.expected) < 0.011
      ? { isCorrect: true, message: "Correct. That answer matches the diagram." }
      : { isCorrect: false, errorClass: "wrong_number", message: "Not quite. Re-read the diagram labels and try the formula again." };
  }

  function validateProblemMath(problem) {
    const a = problem.audit;
    let expected;
    if (a.kind === "cuboid-direct") expected = a.length * a.width * a.height;
    if (a.kind === "cuboid-reverse") expected = a.volume / (a.length * a.width);
    if (a.kind === "base-area") expected = a.baseArea * a.height;
    if (a.kind === "hollow-direct") expected = (a.outerSide * a.outerSide - a.holeSide * a.holeSide) * a.height;
    if (a.kind === "hollow-reverse") expected = a.volume / (a.outerSide * a.outerSide - a.holeSide * a.holeSide);
    if (a.kind === "composite-house") expected = (a.width * a.wallHeight + a.width * a.roofHeight / 2) * a.length;
    if (a.kind === "composite-step") expected = (a.bottomWidth * a.totalHeight - (a.bottomWidth - a.topWidth) * (a.totalHeight - a.lowerHeight)) * a.length;
    if (a.kind === "water-rise") expected = a.length * a.width * (a.endHeight - a.startHeight) / a.stones;
    if (a.kind === "new-level") expected = a.startHeight + a.objectVolume / (a.length * a.width);
    if (a.kind === "remove-full") expected = a.tankH - (a.blockL * a.blockW * a.blockH) / (a.tankL * a.tankW);
    if (a.kind === "partial") expected = (a.containerBaseArea * a.startHeight) / (a.containerBaseArea - a.blockBaseArea);
    if (a.kind === "extensive") expected = (a.squareSide * a.squareSide + (a.squareSide + a.longBase) * (a.totalHeight - a.squareSide) / 2) * a.length;
    return Number.isFinite(expected) && Math.abs(expected - problem.expected) < 1e-8;
  }

  function svgText(x, y, text, labelFor, cls) {
    return '<text x="' + x + '" y="' + y + '" text-anchor="middle" class="' + (cls || "volume-label") + '" data-label-for="' + escapeHtml(labelFor || text) + '">' + math(text) + '</text>';
  }

  function dimensionLine(x1, y1, x2, y2, label, labelFor, tx, ty) {
    return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="#0e5d6f" stroke-width="3" data-label-for="' + escapeHtml(labelFor) + '"></line>' +
      '<circle cx="' + x1 + '" cy="' + y1 + '" r="3.5" fill="#0e5d6f"></circle>' +
      '<circle cx="' + x2 + '" cy="' + y2 + '" r="3.5" fill="#0e5d6f"></circle>' +
      svgText(tx, ty, label, labelFor);
  }

  function baseSvg(inner, ariaLabel) {
    return '<svg viewBox="0 0 620 360" role="img" aria-label="' + escapeHtml(ariaLabel) + '">' +
      '<rect width="620" height="360" rx="18" fill="#fbfefd"></rect>' +
      inner +
      '</svg>';
  }

  function cuboidSvg(v, state) {
    const answer = v.mode === "reverse" ? v.height + " cm" : v.length * v.width * v.height + " cm^3";
    const inner =
      '<polygon points="190,105 360,105 430,65 260,65" fill="#eaf4ff" stroke="#172333" stroke-width="3"></polygon>' +
      '<polygon points="360,105 430,65 430,210 360,250" fill="#d2e9ff" stroke="#172333" stroke-width="3"></polygon>' +
      '<rect x="190" y="105" width="170" height="145" fill="#ffffff" stroke="#172333" stroke-width="3"></rect>' +
      dimensionLine(190, 266, 360, 266, "length = " + v.length + " cm", "length", 275, 292) +
      dimensionLine(365, 258, 435, 218, "width = " + v.width + " cm", "width", 464, 244) +
      dimensionLine(174, 105, 174, 250, "height = " + (v.mode === "reverse" && state !== "solution" ? "?" : v.height) + " cm", "height", 128, 182) +
      (state === "solution" ? svgText(310, 326, "Answer: " + answer, "answer", "volume-label") : "");
    return baseSvg(inner, "labelled cuboid prism");
  }

  function baseAreaSvg(v, state) {
    const answer = v.baseArea * v.height + " cm^3";
    let shape;
    if (/triangular/i.test(v.shape)) {
      shape =
        '<g data-shape="triangular-prism">' +
        '<polygon points="160,230 245,230 202,135" fill="#fff8dc" stroke="#172333" stroke-width="3"></polygon>' +
        '<polygon points="300,190 385,190 342,95" fill="#e5f7f9" stroke="#172333" stroke-width="3"></polygon>' +
        '<line x1="160" y1="230" x2="300" y2="190" stroke="#172333" stroke-width="3"></line>' +
        '<line x1="245" y1="230" x2="385" y2="190" stroke="#172333" stroke-width="3"></line>' +
        '<line x1="202" y1="135" x2="342" y2="95" stroke="#172333" stroke-width="3"></line>' +
        svgText(202, 208, "base area = " + v.baseArea + " cm^2", "base area") +
        dimensionLine(245, 248, 385, 208, "height = " + v.height + " cm", "height", 352, 250) +
        '</g>';
    } else if (/rectangular|right/i.test(v.shape)) {
      shape =
        '<g data-shape="rectangular-prism">' +
        '<polygon points="170,105 330,105 395,68 235,68" fill="#eaf4ff" stroke="#172333" stroke-width="3"></polygon>' +
        '<polygon points="330,105 395,68 395,210 330,247" fill="#d2e9ff" stroke="#172333" stroke-width="3"></polygon>' +
        '<rect x="170" y="105" width="160" height="142" fill="#ffffff" stroke="#172333" stroke-width="3"></rect>' +
        svgText(250, 171, "base area = " + v.baseArea + " cm^2", "base area") +
        dimensionLine(330, 263, 395, 226, "height = " + v.height + " cm", "height", 428, 258) +
        '</g>';
    } else if (/pentagonal/i.test(v.shape)) {
      shape =
        '<g data-shape="pentagonal-prism">' +
        '<polygon points="155,225 185,142 245,106 305,142 335,225" fill="#fff8dc" stroke="#172333" stroke-width="3"></polygon>' +
        '<polygon points="285,188 315,105 375,69 435,105 465,188" fill="#e5f7f9" stroke="#172333" stroke-width="3"></polygon>' +
        '<line x1="155" y1="225" x2="285" y2="188" stroke="#172333" stroke-width="3"></line>' +
        '<line x1="335" y1="225" x2="465" y2="188" stroke="#172333" stroke-width="3"></line>' +
        '<line x1="245" y1="106" x2="375" y2="69" stroke="#172333" stroke-width="3"></line>' +
        svgText(245, 184, "base area = " + v.baseArea + " cm^2", "base area") +
        dimensionLine(335, 242, 465, 205, "height = " + v.height + " cm", "height", 430, 248) +
        '</g>';
    } else {
      shape =
        '<g data-shape="cylinder-style-prism">' +
        '<ellipse cx="220" cy="210" rx="95" ry="38" fill="#fff8dc" stroke="#172333" stroke-width="3"></ellipse>' +
        '<path d="M125 210 L125 120 C125 99 315 99 315 120 L315 210" fill="#ffffff" stroke="#172333" stroke-width="3"></path>' +
        '<ellipse cx="220" cy="120" rx="95" ry="38" fill="#e5f7f9" stroke="#172333" stroke-width="3"></ellipse>' +
        svgText(220, 126, "base area = " + v.baseArea + " cm^2", "base area") +
        dimensionLine(350, 120, 350, 210, "height = " + v.height + " cm", "height", 404, 170) +
        '</g>';
    }
    const inner = shape +
      svgText(320, 292, "volume = base area x height", "formula") +
      (state === "solution" ? svgText(320, 326, "Answer: " + answer, "answer") : "");
    return baseSvg(inner, v.shape + " base area prism diagram");
  }

  function hollowSvg(v, state) {
    const answer = v.volume ? v.height + " cm" : (v.outerSide * v.outerSide - v.holeSide * v.holeSide) * v.height + " cm^3";
    const inner =
      '<polygon points="205,75 380,75 440,112 265,112" fill="#e5f7f9" stroke="#172333" stroke-width="3"></polygon>' +
      '<rect x="205" y="112" width="175" height="155" fill="#ffffff" stroke="#172333" stroke-width="3"></rect>' +
      '<polygon points="380,112 440,75 440,230 380,267" fill="#d8edf2" stroke="#172333" stroke-width="3"></polygon>' +
      '<polygon points="285,86 330,86 347,96 302,96" fill="#73848c" stroke="#172333" stroke-width="2"></polygon>' +
      dimensionLine(205, 62, 380, 62, "outside side = " + v.outerSide + " cm", "outside side", 292, 48) +
      dimensionLine(285, 105, 330, 105, "hole side = " + v.holeSide + " cm", "hole side", 338, 130) +
      dimensionLine(174, 112, 174, 267, "height = " + (v.volume && state !== "solution" ? "?" : v.height) + " cm", "height", 124, 194) +
      (state !== "initial" ? svgText(310, 314, "area left = outside^2 - hole^2", "hollow formula") : "") +
      (state === "solution" ? svgText(310, 344, "Answer: " + answer, "answer") : "");
    return baseSvg(inner, "hollow prism with top hole");
  }

  function compositeSvg(v, state) {
    if (v.shape === "step") {
      const inner =
        '<path d="M170 255 L170 95 L320 95 L320 165 L420 165 L420 255 Z" fill="#fff8dc" stroke="#172333" stroke-width="3"></path>' +
        '<polygon points="420,165 482,132 482,222 420,255" fill="#ffe8a8" stroke="#172333" stroke-width="3"></polygon>' +
        '<polygon points="320,95 382,62 482,132 420,165 320,165" fill="#fff1eb" stroke="#172333" stroke-width="3"></polygon>' +
        dimensionLine(170, 274, 420, 274, "front width = " + v.bottomWidth + " cm", "bottom width", 295, 300) +
        dimensionLine(148, 95, 148, 255, "total height = " + v.totalHeight + " cm", "total height", 94, 180) +
        dimensionLine(170, 78, 320, 78, "top width = " + v.topWidth + " cm", "top width", 245, 63) +
        dimensionLine(420, 264, 482, 231, "prism length = " + v.length + " cm", "length", 514, 256) +
        (state !== "initial" ? svgText(310, 318, "cross-section = big rectangle - missing corner", "formula") : "") +
        (state === "solution" ? svgText(310, 346, "Answer: " + v.crossArea * v.length + " cm^3", "answer") : "");
      return baseSvg(inner, "L-shaped composite prism");
    }
    const inner =
      '<path d="M175 245 L175 145 L290 75 L405 145 L405 245 Z" fill="#fff8dc" stroke="#172333" stroke-width="3"></path>' +
      '<polygon points="405,145 472,112 472,212 405,245" fill="#ffe8a8" stroke="#172333" stroke-width="3"></polygon>' +
      '<polygon points="290,75 357,42 472,112 405,145" fill="#fff1eb" stroke="#172333" stroke-width="3"></polygon>' +
      '<line x1="175" y1="145" x2="405" y2="145" stroke="#172333" stroke-width="3"></line>' +
      dimensionLine(175, 264, 405, 264, "front width = " + v.width + " cm", "front width", 290, 291) +
      dimensionLine(152, 145, 152, 245, "rectangle height = " + v.wallHeight + " cm", "rectangle height", 90, 198) +
      dimensionLine(290, 145, 290, 75, "triangle height = " + v.roofHeight + " cm", "triangle height", 232, 116) +
      dimensionLine(405, 255, 472, 222, "prism length = " + v.length + " cm", "length", 514, 249) +
      (state !== "initial" ? svgText(310, 315, "rectangle area + triangle area", "formula") : "") +
      (state === "solution" ? svgText(310, 344, "Answer: " + v.crossArea * v.length + " cm^3", "answer") : "");
    return baseSvg(inner, "house-shaped composite prism");
  }

  function waterTank(x, y, width, height, waterLevel, label) {
    const waterY = y + height - waterLevel;
    return '<g>' +
      '<rect x="' + x + '" y="' + y + '" width="' + width + '" height="' + height + '" fill="#ffffff" stroke="#172333" stroke-width="3"></rect>' +
      '<rect class="water" x="' + (x + 3) + '" y="' + waterY + '" width="' + (width - 6) + '" height="' + waterLevel + '"></rect>' +
      '<line x1="' + x + '" y1="' + waterY + '" x2="' + (x + width) + '" y2="' + waterY + '" stroke="#0e5d6f" stroke-width="3"></line>' +
      svgText(x + width / 2, y + height + 26, label, "tank label") +
      '</g>';
  }

  function waterRiseSvg(v, state) {
    const answer = v.length * v.width * (v.endHeight - v.startHeight) / v.stones + " cm^3";
    const inner =
      waterTank(110, 95, 150, 145, 72, "before " + v.startHeight + " cm") +
      waterTank(360, 95, 150, 145, 106, "after " + v.endHeight + " cm") +
      '<circle cx="435" cy="188" r="22" fill="#7f8588" stroke="#172333" stroke-width="2"></circle>' +
      svgText(310, 54, "tank length = " + v.length + " cm", "tank length") +
      svgText(310, 78, "tank width = " + v.width + " cm", "tank width") +
      svgText(310, 276, "base area = " + v.baseArea + " cm^2", "base area") +
      (state !== "initial" ? svgText(310, 304, "rise = " + (v.endHeight - v.startHeight) + " cm", "height rise") : "") +
      (state === "solution" ? svgText(310, 332, "Answer: " + answer, "answer") : "");
    return baseSvg(inner, "water displacement before and after");
  }

  function newLevelSvg(v, state) {
    const baseArea = v.length * v.width;
    const rise = v.objectVolume / baseArea;
    const inner =
      waterTank(120, 95, 150, 150, 80, "start " + v.startHeight + " cm") +
      waterTank(355, 95, 150, 150, 112, "new level") +
      '<circle cx="430" cy="196" r="22" fill="#7f8588" stroke="#172333" stroke-width="2"></circle>' +
      svgText(310, 46, "tank length = " + v.length + " cm", "tank length") +
      svgText(310, 70, "tank width = " + v.width + " cm", "tank width") +
      svgText(310, 282, "object volume = " + v.objectVolume + " cm^3", "object volume") +
      (state !== "initial" ? svgText(310, 310, "rise = " + v.objectVolume + " / " + baseArea + " = " + formatNumber(rise) + " cm", "rise formula") : "") +
      (state === "solution" ? svgText(310, 336, "Answer: " + formatNumber(v.expected) + " cm", "answer") : "");
    return baseSvg(inner, "known volume raising water level");
  }

  function removeSvg(v, state) {
    const blockVolume = v.blockL * v.blockW * v.blockH;
    const baseArea = v.tankL * v.tankW;
    const drop = blockVolume / baseArea;
    const inner =
      waterTank(115, 82, 150, 170, 170, "full with block") +
      '<rect x="165" y="156" width="50" height="96" fill="#5a5f62" stroke="#172333" stroke-width="3"></rect>' +
      waterTank(365, 82, 150, 170, 126, "after removal") +
      svgText(310, 44, "tank length = " + v.tankL + " cm, width = " + v.tankW + " cm", "tank base dimensions") +
      svgText(310, 68, "tank height = " + v.tankH + " cm", "tank height") +
      svgText(310, 284, "block volume = " + blockVolume + " cm^3", "block volume") +
      (state !== "initial" ? svgText(310, 310, "drop = " + blockVolume + " / " + baseArea + " = " + formatNumber(drop) + " cm", "drop formula") : "") +
      (state === "solution" ? svgText(310, 338, "Answer: " + formatNumber(v.expected) + " cm", "answer") : "");
    return baseSvg(inner, "full tank removal diagram");
  }

  function partialSvg(v, state) {
    const available = v.containerBaseArea - v.blockBaseArea;
    const inner =
      waterTank(135, 98, 160, 155, 94, "before " + v.startHeight + " cm") +
      waterTank(350, 98, 160, 155, 116, "block inside") +
      '<rect x="414" y="32" width="36" height="221" fill="#747a7e" stroke="#172333" stroke-width="3"></rect>' +
      svgText(310, 50, "container base area = " + v.containerBaseArea + " cm^2", "container base area") +
      svgText(310, 74, "block base area = " + v.blockBaseArea + " cm^2", "block base area") +
      (state !== "initial" ? svgText(310, 304, "available area = " + v.containerBaseArea + " - " + v.blockBaseArea + " = " + available + " cm^2", "available area") : "") +
      (state === "solution" ? svgText(310, 338, "Answer: " + formatNumber(v.expected) + " cm", "answer") : "");
    return baseSvg(inner, "partial submerged tall block");
  }

  function trapeziumSvg(v, state) {
    const answer = v.crossArea * v.length + " cm^3";
    const inner =
      '<path d="M205 88 L330 88 L330 178 L205 178 Z" fill="#d9d9d9" stroke="#172333" stroke-width="3"></path>' +
      '<path d="M205 178 L330 178 L390 278 L150 278 Z" fill="#c8c8c8" stroke="#172333" stroke-width="3"></path>' +
      '<polygon points="330,88 455,128 455,218 330,178" fill="#eeeeee" stroke="#172333" stroke-width="3"></polygon>' +
      '<polygon points="330,178 455,218 500,300 390,278" fill="#e8e8e8" stroke="#172333" stroke-width="3"></polygon>' +
      dimensionLine(205, 72, 330, 72, "square side = " + v.squareSide + " cm", "square side", 268, 56) +
      dimensionLine(150, 300, 390, 300, "long base = " + v.longBase + " cm", "long trapezium base", 270, 326) +
      dimensionLine(128, 88, 128, 278, "total height = " + v.totalHeight + " cm", "total height", 72, 185) +
      dimensionLine(390, 286, 500, 308, "prism length = " + v.length + " cm", "prism length", 476, 338) +
      (state !== "initial" ? svgText(310, 326, "area = square + trapezium", "formula") : "") +
      (state === "solution" ? svgText(310, 352, "Answer: " + answer, "answer") : "");
    return baseSvg(inner, "square plus trapezium prism");
  }

  function renderProblemVisual(problem, state) {
    const v = problem.visual || {};
    const mode = state || "initial";
    let html;
    if (v.type === "cuboid") html = cuboidSvg(v, mode);
    else if (v.type === "baseArea") html = baseAreaSvg(v, mode);
    else if (v.type === "hollow") html = hollowSvg(v, mode);
    else if (v.type === "composite") html = compositeSvg(v, mode);
    else if (v.type === "waterRise") html = waterRiseSvg(v, mode);
    else if (v.type === "newLevel") html = newLevelSvg(v, mode);
    else if (v.type === "remove") html = removeSvg(v, mode);
    else if (v.type === "partial") html = partialSvg(v, mode);
    else if (v.type === "trapezium") html = trapeziumSvg(v, mode);
    else html = baseSvg(svgText(310, 180, problem.classic, "classic"), "volume problem");
    const text = mode === "solution" ? problem.solution : mode === "hint" ? problem.hint2 : problem.skill;
    return { html, text: formatMathText(text) };
  }

  function renderIntroScene(index) {
    const scene = INTRO_SCENES[index] || INTRO_SCENES[0];
    const dataByKind = {
      stack: { type: "baseArea", shape: "rectangular prism", baseArea: 30, height: 6 },
      base: { type: "baseArea", shape: "triangular prism", baseArea: 24, height: 7 },
      hollow: { type: "hollow", outerSide: 12, holeSide: 4, height: 8, crossArea: 128 },
      composite: { type: "composite", shape: "house", width: 10, wallHeight: 7, roofHeight: 4, length: 15, crossArea: 90 },
      waterRise: { type: "waterRise", length: 12, width: 10, startHeight: 6, endHeight: 9, stones: 1, baseArea: 120 },
      newLevel: { type: "newLevel", length: 12, width: 10, startHeight: 8, objectVolume: 360, expected: 11 },
      remove: { type: "remove", tankL: 12, tankW: 10, tankH: 8, blockL: 5, blockW: 4, blockH: 6, expected: 7 },
      partial: { type: "partial", containerBaseArea: 96, startHeight: 10, blockBaseArea: 16, blockHeight: 24, tankHeight: 22, expected: 12 },
      ready: { type: "trapezium", squareSide: 8, longBase: 18, totalHeight: 14, length: 70, trapeziumHeight: 6, crossArea: 142 }
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

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  root.VolumePrismsModule = api;

  if (root.document) {
    initApp(api);
  }

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

    function classicForRound() {
      return CLASSIC_IDS[state.roundIndex % CLASSIC_IDS.length];
    }

    function variantForRound() {
      return state.roundSeed + Math.floor(state.roundIndex / CLASSIC_IDS.length);
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
      if (slot.status === "skipped") return "unanswered";
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

    function captureCurrentInput() {
      if (!state.currentSlot || !state.currentProblem) return;
      state.currentSlot.lastInput = collectInput(state.currentProblem);
    }

    function restoreInput(problem, input) {
      if (!input) return;
      if (problem.answerType === "choice") {
        const selector = 'input[name="answer-choice"][value="' + String(input.choice || "").replace(/"/g, '\\"') + '"]';
        const checked = els.answerHost.querySelector(selector);
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
      input.placeholder = problem.unit === "cm^3" ? "Example: 480" : "Example: 12.5";
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
      for (let index = 0; index < slot.hintCount; index += 1) {
        appendHintItem(index === 0 ? problem.hint1 : problem.hint2);
      }
      els.next.disabled = false;
      els.check.disabled = state.problemResolved;
      els.why.disabled = state.problemResolved;
      els.similar.hidden = !(slot.status === "wrong" || slot.status === "shown");
      els.similar.disabled = els.similar.hidden;
      renderAnswer(problem);
      restoreInput(problem, slot.lastInput);
      setAnswerLocked(state.problemResolved);
      if (slot.status === "correct") {
        setFeedback("good", slot.feedback || "Already correct. You can move on or use the question numbers to review.");
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
