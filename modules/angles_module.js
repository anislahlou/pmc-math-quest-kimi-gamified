(function (root) {
  "use strict";

  const CLASSICS = [
    { id: "angles.triangle-sum", nickname: "Triangle Total", skill: "Find a missing triangle angle using 180 degrees." },
    { id: "angles.isosceles-base", nickname: "Twin Base Angles", skill: "Use equal sides to find equal base angles." },
    { id: "angles.straight-line", nickname: "Straight-Line Partner", skill: "Find the partner angle on a straight line." },
    { id: "angles.alternate", nickname: "Z-Angle Match", skill: "Use alternate angles in parallel lines." },
    { id: "angles.corresponding", nickname: "F-Angle Match", skill: "Use corresponding angles in parallel lines." },
    { id: "angles.co-interior", nickname: "C-Angle Pair", skill: "Use co-interior angles that add to 180 degrees." },
    { id: "angles.parallel-zigzag-total", nickname: "Parallel Zigzag Total", skill: "Find an a + b total in a zigzag between parallel lines." },
    { id: "angles.parallel-chase", nickname: "Angle Chase", skill: "Chain straight-line, triangle, and parallel-line facts." },
    { id: "angles.equilateral-chase", nickname: "Equilateral Chase", skill: "Use equilateral-triangle facts inside a multi-step angle chase." },
    // variantStability: false — the polygon's side count n varies per variant by design (the lesson is the (n - 2) x 180 formula across different n).
    { id: "angles.polygon-sum", nickname: "Polygon Total", skill: "Find a polygon interior-angle sum using (n - 2) x 180 degrees.", variantStability: false },
    // variantStability: false — the regular polygon's side count n varies per variant by design (pentagon, octagon, ... teach the same formula).
    { id: "angles.regular-polygon", nickname: "Regular Polygon Corner", skill: "Find a regular polygon angle from the interior-angle sum.", variantStability: false },
    // variantStability: false — the combined regular shapes vary per variant by design (hexagon+square+equilateral vs square+pentagon+octagon, etc.).
    { id: "angles.shape-combo", nickname: "Shape Stack", skill: "Combine standard angles from common regular shapes.", variantStability: false }
  ];

  const CLASSIC_IDS = CLASSICS.map((classic) => classic.id);
  const CLASSIC_BY_ID = Object.fromEntries(CLASSICS.map((classic) => [classic.id, classic]));

  // Maps each classic to a registry skill so the skill-coverage gate can
  // verify the bank covers every skill the registry promises.
  // Registry skills: ["Triangle total", "Z/F/C angles", "Zigzag totals",
  // "Angle chase", "Polygon formula"].
  const CLASSIC_SKILLS = {
    "angles.triangle-sum": "Triangle total",
    "angles.isosceles-base": "Triangle total",
    "angles.straight-line": "Triangle total",
    "angles.alternate": "Z/F/C angles",
    "angles.corresponding": "Z/F/C angles",
    "angles.co-interior": "Z/F/C angles",
    "angles.parallel-zigzag-total": "Zigzag totals",
    "angles.parallel-chase": "Angle chase",
    "angles.equilateral-chase": "Angle chase",
    "angles.polygon-sum": "Polygon formula",
    "angles.regular-polygon": "Polygon formula",
    "angles.shape-combo": "Angle chase"
  };

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function shuffledChoices(correct, wrongs) {
    const values = [correct, ...wrongs]
      .filter((value, index, all) => Number.isFinite(value) && all.indexOf(value) === index)
      .slice(0, 5)
      .sort((a, b) => a - b);
    while (values.length < 4) values.push(correct + values.length * 7);
    return values.map((value) => ({
      value,
      label: value + "°",
      isCorrect: value === correct
    }));
  }

  const PROBLEM_SETS = {
    "angles.triangle-sum": [
      { a: 48, b: 67 },
      { a: 72, b: 38 },
      { a: 41, b: 83 },
      { a: 35, b: 78 },
      { a: 58, b: 62 },
      { a: 29, b: 96 },
      { a: 66, b: 44 },
      { a: 27, b: 103 }
    ].map(({ a, b }) => {
      const expected = 180 - a - b;
      return {
        prompt: "A triangle has angles " + a + "° and " + b + "°. What is the missing angle?",
        answerType: "choice",
        expected,
        choices: shuffledChoices(expected, [180 - a, 180 - b, a + b, expected + 10]),
        hint1: "A triangle total is always 180°.",
        hint2: "Subtract both known angles from 180°.",
        solution: "180° - " + a + "° - " + b + "° = " + expected + "°.",
        visual: { type: "triangle", labels: [a, b, "x"], answer: expected }
      };
    }),
    "angles.isosceles-base": [
      { vertex: 30 },
      { vertex: 46 },
      { vertex: 82 },
      { vertex: 28 },
      { vertex: 64 },
      { vertex: 96 },
      { vertex: 110 }
    ].map(({ vertex }) => {
      const expected = (180 - vertex) / 2;
      return {
        prompt: "An isosceles triangle has vertex angle " + vertex + "°. What is each base angle?",
        answerType: "choice",
        expected,
        choices: shuffledChoices(expected, [180 - vertex, vertex, expected + 15, expected - 10]),
        hint1: "The matching side marks tell you the two base angles are equal.",
        hint2: "First remove the vertex angle from 180°. Then split the rest in half.",
        solution: "(180° - " + vertex + "°) / 2 = " + expected + "°.",
        visual: { type: "isosceles", vertex, answer: expected }
      };
    }),
    "angles.straight-line": [
      { shown: 130 },
      { shown: 118 },
      { shown: 47 },
      { shown: 95 },
      { shown: 126 },
      { shown: 143 },
      { shown: 64 }
    ].map(({ shown }) => {
      const expected = 180 - shown;
      return {
        prompt: "Two angles sit on a straight line. One is " + shown + "°. What is the other one?",
        answerType: "choice",
        expected,
        choices: shuffledChoices(expected, [shown, 180 + shown, Math.abs(shown - 90), expected + 20]),
        hint1: "A straight line is a 180° total.",
        hint2: "Subtract the shown angle from 180°.",
        solution: "180° - " + shown + "° = " + expected + "°.",
        visual: { type: "straight", shown, answer: expected }
      };
    }),
    "angles.alternate": [
      { shown: 48 },
      { shown: 73 },
      { shown: 126 },
      { shown: 55 },
      { shown: 94 },
      { shown: 112 },
      { shown: 38 }
    ].map(({ shown }) => ({
      prompt: "Two parallel lines make a Z-shape. One alternate angle is " + shown + "°. What is the matching alternate angle?",
      answerType: "choice",
      expected: shown,
      choices: shuffledChoices(shown, [180 - shown, shown + 10, Math.max(0, shown - 10), 90]),
      hint1: "Z-angles are alternate angles.",
      hint2: "Alternate angles in parallel lines are equal.",
      solution: "The matching alternate angle is equal to " + shown + "°.",
      visual: { type: "alternate", shown, answer: shown }
    })),
    "angles.corresponding": [
      { shown: 115 },
      { shown: 64 },
      { shown: 38 },
      { shown: 95 },
      { shown: 126 },
      { shown: 54 },
      { shown: 142 }
    ].map(({ shown }) => ({
      prompt: "Two parallel lines make an F-shape. One corresponding angle is " + shown + "°. What is the matching corresponding angle?",
      answerType: "choice",
      expected: shown,
      choices: shuffledChoices(shown, [180 - shown, shown + 15, Math.max(0, shown - 15), 90]),
      hint1: "F-angles are corresponding angles.",
      hint2: "Corresponding angles in parallel lines are equal.",
      solution: "The matching corresponding angle is equal to " + shown + "°.",
      visual: { type: "corresponding", shown, answer: shown }
    })),
    "angles.co-interior": [
      { shown: 132 },
      { shown: 74 },
      { shown: 109 },
      { shown: 95 },
      { shown: 126 },
      { shown: 54 },
      { shown: 142 }
    ].map(({ shown }) => {
      const expected = 180 - shown;
      return {
        prompt: "Two parallel lines make a C-shape. One co-interior angle is " + shown + "°. What is the other co-interior angle?",
        answerType: "choice",
        expected,
        choices: shuffledChoices(expected, [shown, shown - 20, 180 + shown, 90]),
        hint1: "C-angles are the parallel-line pair that add to 180°.",
        hint2: "Use 180° - " + shown + "°.",
        solution: "Co-interior pair: " + shown + "° + x = 180°, so x = " + expected + "°.",
        visual: { type: "cointerior", shown, answer: expected }
      };
    }),
    "angles.parallel-zigzag-total": [
      { top: 30, middle: 120, bottom: 40 },
      { top: 25, middle: 130, bottom: 35 },
      { top: 40, middle: 115, bottom: 25 },
      { top: 35, middle: 110, bottom: 45 },
      { top: 28, middle: 125, bottom: 32 },
      { top: 42, middle: 105, bottom: 38 },
      { top: 33, middle: 118, bottom: 29 }
    ].map(({ top, middle, bottom }) => {
      const expected = top + middle + bottom;
      return {
        prompt: "Parallel zigzag: the shown angles are " + top + "°, " + middle + "°, and " + bottom + "°. What is a + b?",
        answerType: "choice",
        expected,
        choices: shuffledChoices(expected, [middle + top, middle + bottom, 180 - top, 360 - expected]),
        hint1: "This source pattern asks for a total, a + b, not just one marked angle.",
        hint2: "The zigzag's turn total gives a + b = top angle + middle angle + bottom angle.",
        solution: "For this parallel zigzag, a + b = " + top + "° + " + middle + "° + " + bottom + "° = " + expected + "°.",
        visual: { type: "parallel-zigzag", top, middle, bottom, answer: expected }
      };
    }),
    "angles.parallel-chase": [
      { leftExterior: 134, rightExterior: 132 },
      { leftExterior: 120, rightExterior: 110 },
      { leftExterior: 126, rightExterior: 139 },
      { leftExterior: 125, rightExterior: 100 },
      { leftExterior: 148, rightExterior: 112 },
      { leftExterior: 118, rightExterior: 137 }
    ].map(({ leftExterior, rightExterior }) => {
      const leftInside = 180 - leftExterior;
      const rightInside = 180 - rightExterior;
      const expected = 180 - leftInside - rightInside;
      return {
        prompt: "Angle chase: two exterior base angles are " + leftExterior + "° and " + rightExterior + "°. After turning them into inside triangle angles, what is the top angle?",
        answerType: "choice",
        expected,
        choices: shuffledChoices(expected, [leftInside + rightInside, 180 - expected, expected + 8, Math.abs(leftExterior - rightExterior)]),
        hint1: "First use straight lines to convert each exterior angle into an inside base angle.",
        hint2: "Inside base angles are " + leftInside + "° and " + rightInside + "°. Then use triangle total.",
        solution: "Inside angles: " + leftInside + "° and " + rightInside + "°. Top angle = 180° - " + leftInside + "° - " + rightInside + "° = " + expected + "°.",
        visual: { type: "chase", leftExterior, rightExterior, leftInside, rightInside, answer: expected }
      };
    }),
    "angles.equilateral-chase": [
      { p: 40, q: 35 },
      { p: 35, q: 30 },
      { p: 25, q: 40 },
      { p: 45, q: 20 },
      { p: 30, q: 42 },
      { p: 38, q: 28 }
    ].map(({ p, q }) => {
      const expected = 60 + p + q;
      return {
        prompt: "Triangle PQR is equilateral. Angle SPR is " + p + "° and angle TQR is " + q + "°. What is the marked angle SXT?",
        answerType: "choice",
        expected,
        choices: shuffledChoices(expected, [180 - expected, p + q, 120 - p + q, expected - 30]),
        hint1: "Equilateral triangles give you three 60° corners before the angle chase begins.",
        hint2: "Use the 60° corner, then add the two given turns to reach the marked obtuse angle.",
        solution: "In this source pattern, the marked obtuse angle SXT = 60° + " + p + "° + " + q + "° = " + expected + "°.",
        visual: { type: "equilateral-chase", p, q, answer: expected }
      };
    }),
    "angles.polygon-sum": [
      { sides: 7 },
      { sides: 9 },
      { sides: 12 },
      { sides: 5 },
      { sides: 8 },
      { sides: 10 }
    ].map(({ sides }) => {
      const expected = (sides - 2) * 180;
      return {
        prompt: "What is the sum of the interior angles of a " + polygonName(sides) + "?",
        answerType: "choice",
        expected,
        choices: shuffledChoices(expected, [sides * 180, (sides - 1) * 180, Math.round(expected / sides), 360]),
        hint1: "A polygon with n sides can be split into n - 2 triangles.",
        hint2: "Use (n - 2) x 180°.",
        solution: "(" + sides + " - 2) x 180° = " + expected + "°.",
        visual: { type: "polygon-sum", sides, sum: expected }
      };
    }),
    "angles.regular-polygon": [
      { sides: 5 },
      { sides: 8 },
      { sides: 12 },
      { sides: 6 },
      { sides: 9 },
      { sides: 10 }
    ].map(({ sides }) => {
      const sum = (sides - 2) * 180;
      const exterior = 360 / sides;
      const expected = sum / sides;
      return {
        prompt: "What is each interior angle of a regular " + polygonName(sides) + "?",
        answerType: "choice",
        expected,
        choices: shuffledChoices(expected, [sum, exterior, 180, expected - 15]),
        hint1: "Start with the total: (n - 2) x 180 degrees.",
        hint2: "Interior sum = (" + sides + " - 2) x 180 degrees. Because it is regular, divide that total by " + sides + ".",
        solution: "Interior sum = (" + sides + " - 2) x 180 degrees = " + sum + " degrees. Each interior angle = " + sum + " degrees / " + sides + " = " + expected + " degrees.",
        visual: { type: "polygon", sides, exterior, sum, answer: expected }
      };
    }),
    "angles.shape-combo": [
      { family: "hexagon-square-equilateral", expected: 135 },
      { family: "regular-shape-gap", square: 90, polygonA: 108, polygonB: 135, expected: 27 },
      { family: "around-point", a: 90, b: 60, names: "a square corner and an equilateral triangle corner", expected: 210 },
      { family: "around-point", a: 120, b: 90, names: "a regular hexagon corner and a square corner", expected: 150 }
    ].map((shape) => {
      const expected = shape.expected;
      const prompt = shape.family === "hexagon-square-equilateral"
        ? "A regular hexagon, a square, and an equilateral triangle fit together as in the book diagram. What is angle XVR?"
        : shape.family === "regular-shape-gap"
          ? "A square, a regular pentagon, and a regular octagon meet at one point. What is the small gap angle?"
          : "Around one point, " + shape.names + " meet. What angle is left around the point?";
      return {
        prompt,
        answerType: "choice",
        expected,
        choices: shuffledChoices(expected, [120, 125, 130, 140, 150, 210, 27, 33]),
        hint1: shape.family === "hexagon-square-equilateral"
          ? "Use the real shapes: hexagon side, square side, and equilateral side all give fixed angles."
          : "Angles around a point add to 360°.",
        hint2: shape.family === "hexagon-square-equilateral"
          ? "At Q, the square side and hexagon side make an isosceles triangle QVR. Then compare that with the equilateral side VX."
          : "Subtract the standard interior angles of the regular shapes from 360°.",
        solution: shape.family === "hexagon-square-equilateral"
          ? "The source diagram gives angle XVR = 135°. The key moves are square 90°, equilateral 60°, and the regular-hexagon 120° corner creating a 75° base angle in triangle QVR."
          : shape.family === "regular-shape-gap"
            ? "Square 90° + pentagon 108° + octagon 135° = 333°. The remaining gap is 360° - 333° = 27°."
            : "360° - " + shape.a + "° - " + shape.b + "° = " + expected + "°.",
        visual: { type: "shape-combo", ...shape, answer: expected }
      };
    })
  };

  function polygonName(sides) {
    if (sides === 5) return "pentagon";
    if (sides === 7) return "heptagon";
    if (sides === 8) return "octagon";
    if (sides === 9) return "nonagon";
    if (sides === 12) return "dodecagon";
    return sides + "-gon";
  }

  function generateProblem(classicId, variantIndex) {
    const set = PROBLEM_SETS[classicId];
    const base = set[variantIndex % set.length];
    const classic = CLASSIC_BY_ID[classicId];
    const skillTag = CLASSIC_SKILLS[classicId];
    return {
      ...base,
      id: classicId + "." + variantIndex,
      classicId,
      nickname: classic.nickname,
      skill: classic.skill,
      skillTag,
      source: "Lesson 3 Angles",
      rowConvention: "angles_in_degrees"
    };
  }

  function parseInteger(value) {
    const cleaned = String(value || "").trim().replace(/[°\s]/g, "");
    if (!/^-?\d+$/.test(cleaned)) return null;
    return Number(cleaned);
  }

  function checkAnswer(problem, input) {
    const value = parseInteger(input && input.value !== undefined ? input.value : input);
    if (value === null) return { isCorrect: false, errorClass: "missing_angle", message: "Enter one angle in degrees." };
    if (value === problem.expected) return { isCorrect: true, message: "Correct. You named the move and kept the arithmetic tidy." };
    if (problem.classicId === "angles.co-interior" && value === problem.visual.shown) {
      return { isCorrect: false, errorClass: "cointerior_equal_confusion", message: "C-angles are not equal; they add to 180°." };
    }
    if ((problem.classicId === "angles.alternate" || problem.classicId === "angles.corresponding") && value === 180 - problem.expected) {
      return { isCorrect: false, errorClass: "parallel_pair_confusion", message: "This one is an equal parallel-line pair, not a 180° pair." };
    }
    if (problem.classicId === "angles.regular-polygon" && value === problem.visual.exterior) {
      return { isCorrect: false, errorClass: "exterior_as_interior", message: "That is the exterior angle. Interior angle is 180° minus that." };
    }
    if (problem.classicId === "angles.regular-polygon" && value === problem.visual.sum) {
      return { isCorrect: false, errorClass: "polygon_total_as_one_angle", message: "That is the whole interior-angle sum. For one regular-polygon angle, divide by the number of sides." };
    }
    if (problem.classicId === "angles.polygon-sum" && value === Math.round(problem.visual.sum / problem.visual.sides)) {
      return { isCorrect: false, errorClass: "one_angle_as_polygon_total", message: "That is one regular angle. This question asks for the whole interior-angle sum." };
    }
    return { isCorrect: false, errorClass: "wrong_angle", message: "Not quite. Name the move before calculating." };
  }

  function svgText(x, y, value, size, color, weight, anchor) {
    return '<text x="' + x + '" y="' + y + '" text-anchor="' + (anchor || "middle") + '" font-size="' + (size || 24) + '" font-weight="' + (weight || "750") + '" fill="' + (color || "#20313a") + '">' + escapeHtml(value) + "</text>";
  }

  function svgCard(x, y, w, h, value, fill, stroke, size) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="12" fill="' + (fill || "#ffffff") + '" stroke="' + (stroke || "#d9e5e8") + '" stroke-width="3"></rect>' +
      svgText(x + w / 2, y + h / 2 + 8, value, size || 22);
  }

  function svgShell(body) {
    return '<svg viewBox="0 0 1000 560" role="img" xmlns="http://www.w3.org/2000/svg"><rect width="1000" height="560" fill="#fffdf7"></rect>' + body + "</svg>";
  }

  function line(x1, y1, x2, y2, color, width) {
    return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + (color || "#20313a") + '" stroke-width="' + (width || 4) + '" stroke-linecap="round"></line>';
  }

  function polar(cx, cy, radius, degrees) {
    const radians = (degrees * Math.PI) / 180;
    return [cx + Math.cos(radians) * radius, cy + Math.sin(radians) * radius];
  }

  function angleSector(cx, cy, radius, startDeg, endDeg, fill, stroke) {
    const start = polar(cx, cy, radius, startDeg);
    const end = polar(cx, cy, radius, endDeg);
    const largeArc = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
    return '<path d="M' + cx + " " + cy + " L" + start[0].toFixed(1) + " " + start[1].toFixed(1) +
      " A" + radius + " " + radius + " 0 " + largeArc + " 1 " + end[0].toFixed(1) + " " + end[1].toFixed(1) +
      ' Z" fill="' + (fill || "#fff6df") + '" stroke="' + (stroke || "#b17700") + '" stroke-width="3" opacity="0.88"></path>';
  }

  function angleSectorWithAttrs(cx, cy, radius, startDeg, endDeg, fill, stroke, attrs) {
    const start = polar(cx, cy, radius, startDeg);
    const end = polar(cx, cy, radius, endDeg);
    const largeArc = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
    return '<path ' + (attrs || "") + ' d="M' + cx + " " + cy + " L" + start[0].toFixed(1) + " " + start[1].toFixed(1) +
      " A" + radius + " " + radius + " 0 " + largeArc + " 1 " + end[0].toFixed(1) + " " + end[1].toFixed(1) +
      ' Z" fill="' + (fill || "#fff6df") + '" stroke="' + (stroke || "#b17700") + '" stroke-width="3" opacity="0.88"></path>';
  }

  function angleBadge(x, y, value, fill, stroke, w) {
    const width = w || Math.max(62, String(value).length * 14 + 22);
    return '<rect x="' + (x - width / 2) + '" y="' + (y - 24) + '" width="' + width + '" height="48" rx="24" fill="' + (fill || "#fff6df") + '" stroke="' + (stroke || "#b17700") + '" stroke-width="3"></rect>' +
      svgText(x, y + 8, value, 22, "#20313a", "800");
  }

  function labelledAngleSector(cx, cy, radius, startDeg, endDeg, label, fill, stroke) {
    const size = Math.round(Math.abs(endDeg - startDeg));
    const mid = (startDeg + endDeg) / 2;
    const badge = polar(cx, cy, radius + 24, mid);
    const attrs = 'data-angle-size="' + size + '" data-label-value="' + escapeHtml(label) + '"';
    return angleSectorWithAttrs(cx, cy, radius, startDeg, endDeg, fill, stroke, attrs) +
      angleBadge(badge[0], badge[1], label, fill, stroke);
  }

  function arcLabel(x, y, value, fill) {
    return angleBadge(x, y, value, fill, "#b17700");
  }

  function triangleDiagram(a, b, cLabel) {
    return line(260, 410, 500, 105) + line(500, 105, 740, 410) + line(260, 410, 740, 410) +
      arcLabel(340, 372, a + "°", "#e6f3f6") + arcLabel(660, 372, b + "°", "#fff6df") + arcLabel(500, 170, cLabel, "#e8f6ef");
  }

  function parallelGeometry(angleValue) {
    const dy = 225;
    const angle = Math.max(32, Math.min(148, Number(angleValue) || 70));
    const radians = (angle * Math.PI) / 180;
    const dx = dy / Math.tan(radians);
    const topX = Math.max(340, Math.min(660, 500 - dx / 2));
    const top = { x: topX, y: 165 };
    const bottom = { x: topX + dx, y: 390 };
    const unit = { x: Math.cos(radians), y: Math.sin(radians) };
    return { angle, top, bottom, unit };
  }

  function angleValueLabel(value) {
    return Number.isFinite(Number(value)) ? value + "°" : String(value);
  }

  function parallelDiagram(kind, shown, answer) {
    const g = parallelGeometry(shown);
    const top = g.top;
    const bottom = g.bottom;
    const startX = top.x - g.unit.x * 90;
    const startY = top.y - g.unit.y * 90;
    const endX = bottom.x + g.unit.x * 90;
    const endY = bottom.y + g.unit.y * 90;
    let anchored = line(220, top.y, 800, top.y) + line(220, bottom.y, 800, bottom.y) + line(startX, startY, endX, endY);
    anchored += '<text x="810" y="170" font-size="24" fill="#607983">parallel</text>';
    anchored += '<text x="810" y="395" font-size="24" fill="#607983">parallel</text>';
    if (kind === "alternate") {
      anchored += labelledAngleSector(top.x, top.y, 72, 0, g.angle, angleValueLabel(shown), "#fff6df", "#b17700");
      anchored += labelledAngleSector(bottom.x, bottom.y, 72, 180, 180 + g.angle, angleValueLabel(answer), "#e8f6ef", "#2e7d5b");
      anchored += svgText(500, 505, "Z-angle match: equal", 28, "#174c5f");
    } else if (kind === "corresponding") {
      anchored += labelledAngleSector(top.x, top.y, 72, 0, g.angle, angleValueLabel(shown), "#fff6df", "#b17700");
      anchored += labelledAngleSector(bottom.x, bottom.y, 72, 0, g.angle, angleValueLabel(answer), "#e8f6ef", "#2e7d5b");
      anchored += svgText(500, 505, "F-angle match: same corner, equal", 27, "#174c5f");
    } else {
      anchored += labelledAngleSector(top.x, top.y, 72, 0, g.angle, angleValueLabel(shown), "#fff6df", "#b17700");
      anchored += labelledAngleSector(bottom.x, bottom.y, 72, 180 + g.angle, 360, angleValueLabel(answer), "#e8f6ef", "#2e7d5b");
      anchored += svgText(500, 505, "C-angle pair: adds to 180 degrees", 26, "#174c5f");
    }
    return anchored;
  }

  function regularPolygonPoints(cx, cy, radius, sides) {
    const points = [];
    for (let i = 0; i < sides; i += 1) {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / sides;
      points.push([cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius]);
    }
    return points.map((point) => point.join(",")).join(" ");
  }

  function regularPolygonPointList(cx, cy, radius, sides) {
    const points = [];
    for (let i = 0; i < sides; i += 1) {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / sides;
      points.push([cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius]);
    }
    return points;
  }

  function polygonLinesFromFirst(points) {
    return points.slice(2, -1).map((point) => line(points[0][0], points[0][1], point[0], point[1], "#9bb0b8", 2)).join("");
  }

  function pointOnRay(point, degrees, distance) {
    const radians = (degrees * Math.PI) / 180;
    return { x: point.x + Math.cos(radians) * distance, y: point.y + Math.sin(radians) * distance };
  }

  function pointString(points) {
    return points.map((point) => point.x.toFixed(1) + "," + point.y.toFixed(1)).join(" ");
  }

  function textLabel(point, label, dx, dy, size) {
    return svgText(point.x + (dx || 0), point.y + (dy || 0), label, size || 22, "#20313a");
  }

  function lineIntersection(a, b, c, d) {
    const x1 = a.x, y1 = a.y, x2 = b.x, y2 = b.y;
    const x3 = c.x, y3 = c.y, x4 = d.x, y4 = d.y;
    const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (Math.abs(denominator) < 0.001) return { x: (x1 + x3) / 2, y: (y1 + y3) / 2 };
    const px = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / denominator;
    const py = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / denominator;
    return { x: px, y: py };
  }

  function parallelZigzagDiagram(v, stateName) {
    const theta2 = 130;
    const theta3 = theta2 + v.middle - 180;
    const theta4 = 180 - v.bottom;
    const p0 = { x: 340, y: 105 };
    const p1 = pointOnRay(p0, v.top, 115);
    const p2 = pointOnRay(p1, theta2, 112);
    const p3 = pointOnRay(p2, theta3, 112);
    const p4 = pointOnRay(p3, theta4, (440 - p3.y) / Math.sin((theta4 * Math.PI) / 180));
    const aSize = Math.round(180 + v.top - theta2);
    const bSize = Math.round(theta3 + v.bottom);
    let body = line(220, p0.y, 820, p0.y) + line(220, p4.y, 820, p4.y);
    body += line(p0.x, p0.y, p1.x, p1.y, "#20313a", 5) + line(p1.x, p1.y, p2.x, p2.y, "#20313a", 5) +
      line(p2.x, p2.y, p3.x, p3.y, "#20313a", 5) + line(p3.x, p3.y, p4.x, p4.y, "#20313a", 5);
    body += '<text x="830" y="' + (p0.y + 6) + '" font-size="23" fill="#607983">parallel</text><text x="830" y="' + (p4.y + 6) + '" font-size="23" fill="#607983">parallel</text>';
    body += angleSectorWithAttrs(p0.x, p0.y, 58, 0, v.top, "#fff6df", "#b17700", 'data-angle-size="' + v.top + '" data-label-value="' + v.top + '°"') +
      angleBadge(p0.x + 84, p0.y + 28, v.top + "°", "#fff6df", "#b17700");
    body += angleSectorWithAttrs(p2.x, p2.y, 68, theta2 + 180, theta2 + v.middle, "#e6f3f6", "#174c5f", 'data-angle-size="' + v.middle + '" data-label-value="' + v.middle + '°"') +
      angleBadge(p2.x + 92, p2.y + 2, v.middle + "°", "#e6f3f6", "#174c5f", 78);
    body += angleSectorWithAttrs(p4.x, p4.y, 58, 360 - v.bottom, 360, "#fff6df", "#b17700", 'data-angle-size="' + v.bottom + '" data-label-value="' + v.bottom + '°"') +
      angleBadge(p4.x + 82, p4.y - 30, v.bottom + "°", "#fff6df", "#b17700");
    body += angleSectorWithAttrs(p1.x, p1.y, 48, theta2, 180 + v.top, "#e8f6ef", "#2e7d5b", 'data-angle-size="' + aSize + '" data-label-value="a"') +
      angleBadge(p1.x - 58, p1.y + 2, "a", "#e8f6ef", "#2e7d5b", 54);
    body += angleSectorWithAttrs(p3.x, p3.y, 48, theta4, theta3 + 180, "#e8f6ef", "#2e7d5b", 'data-angle-size="' + bSize + '" data-label-value="b"') +
      angleBadge(p3.x - 58, p3.y + 2, "b", "#e8f6ef", "#2e7d5b", 54);
    body += svgCard(240, 485, 520, 52, stateName === "initial" ? "find a + b" : "a + b = " + v.answer + " degrees", "#ffffff", "#174c5f", 24);
    return body;
  }

  function equilateralChaseDiagram(v, stateName) {
    const q = { x: 300, y: 430 };
    const r = { x: 700, y: 430 };
    const p = { x: 500, y: 84 };
    const s = pointOnRay(p, 60 + v.p, (q.y - p.y) / Math.sin(((60 + v.p) * Math.PI) / 180));
    const tLineEnd = pointOnRay(q, -v.q, 640);
    const t = lineIntersection(q, tLineEnd, p, r);
    const x = lineIntersection(p, s, q, t);
    let body = '<polygon points="' + pointString([p, q, r]) + '" fill="#ffffff" stroke="#20313a" stroke-width="4"></polygon>';
    body += line(p.x, p.y, s.x, s.y, "#174c5f", 5) + line(q.x, q.y, t.x, t.y, "#174c5f", 5);
    body += labelledAngleSector(p.x, p.y, 62, 60, 60 + v.p, v.p + "°", "#fff6df", "#b17700");
    body += labelledAngleSector(q.x, q.y, 62, 360 - v.q, 360, v.q + "°", "#fff6df", "#b17700");
    body += labelledAngleSector(x.x, x.y, 54, -v.q, 60 + v.p, stateName === "initial" ? "x" : v.answer + "°", "#e8f6ef", "#2e7d5b");
    body += textLabel(p, "P", 0, -16) + textLabel(q, "Q", -22, 22) + textLabel(r, "R", 22, 22) + textLabel(s, "S", 0, 25) + textLabel(t, "T", 24, -4) + textLabel(x, "X", -22, -10);
    body += svgCard(160, 485, 680, 52, "source diagram: equilateral 60 degrees + two given turns", "#ffffff", "#174c5f", 22);
    return body;
  }

  function polygonSumDiagram(v) {
    const points = regularPolygonPointList(500, 275, 150, v.sides);
    let body = '<polygon points="' + points.map((point) => point.join(",")).join(" ") + '" fill="#ffffff" stroke="#20313a" stroke-width="4"></polygon>';
    body += polygonLinesFromFirst(points);
    body += angleBadge(500, 75, v.sides + " sides", "#e6f3f6", "#174c5f", 102);
    body += svgCard(195, 455, 610, 55, "sum = (" + v.sides + " - 2) x 180 = " + v.sum + " degrees", "#ffffff", "#174c5f", 22);
    return body;
  }

  function sourceHexagonSquareTriangleDiagram(v, stateName) {
    const side = 138;
    const p = { x: 330, y: 390 };
    const q = { x: p.x + side, y: p.y };
    const r = { x: q.x + side / 2, y: q.y - (Math.sqrt(3) * side) / 2 };
    const s = { x: q.x, y: q.y - Math.sqrt(3) * side };
    const t = { x: p.x, y: s.y };
    const u = { x: p.x - side / 2, y: r.y };
    const w = { x: p.x, y: p.y - side };
    const vv = { x: q.x, y: q.y - side };
    const x = { x: (w.x + vv.x) / 2, y: w.y - (Math.sqrt(3) * side) / 2 };
    let body = '<polygon points="' + pointString([p, q, r, s, t, u]) + '" fill="#f7fbfb" stroke="#20313a" stroke-width="4"></polygon>';
    body += '<polygon points="' + pointString([p, q, vv, w]) + '" fill="#fff6df" stroke="#b17700" stroke-width="4"></polygon>';
    body += '<polygon points="' + pointString([w, vv, x]) + '" fill="#e8f6ef" stroke="#2e7d5b" stroke-width="4"></polygon>';
    body += labelledAngleSector(vv.x, vv.y, 58, -120, 15, stateName === "initial" ? "x" : v.answer + "°", "#e6f3f6", "#174c5f");
    body += textLabel(p, "P", -16, 24) + textLabel(q, "Q", 16, 24) + textLabel(r, "R", 20, 8) + textLabel(s, "S", 18, -8) +
      textLabel(t, "T", -18, -8) + textLabel(u, "U", -24, 8) + textLabel(w, "W", -22, 3) + textLabel(vv, "V", 24, 3) + textLabel(x, "X", 0, -16);
    body += svgCard(160, 485, 680, 52, "source shapes: regular hexagon + square + equilateral triangle", "#ffffff", "#174c5f", 20);
    return body;
  }

  function regularShapeGapDiagram(v, stateName) {
    const d = { x: 470, y: 310 };
    const da = pointOnRay(d, -135, 82);
    const dc = pointOnRay(d, 135, 82);
    const db = { x: da.x + dc.x - d.x, y: da.y + dc.y - d.y };
    const dg = pointOnRay(d, 27, 96);
    const df = pointOnRay(dg, 99, 96);
    const de = pointOnRay(df, 171, 96);
    const dm = pointOnRay(d, -108, 96);
    const oct = [d, dg];
    let angle = -18;
    for (let i = 0; i < 5; i += 1) {
      oct.push(pointOnRay(oct[oct.length - 1], angle, 82));
      angle -= 45;
    }
    oct.push(dm);
    let body = '<polygon points="' + pointString([d, da, db, dc]) + '" fill="#fff6df" stroke="#b17700" stroke-width="4"></polygon>';
    body += '<polygon points="' + pointString([dc, d, dg, df, de]) + '" fill="#e8f6ef" stroke="#2e7d5b" stroke-width="4"></polygon>';
    body += '<polygon points="' + pointString(oct) + '" fill="#eef5f7" stroke="#174c5f" stroke-width="4"></polygon>';
    body += labelledAngleSector(d.x, d.y, 70, -135, -108, stateName === "initial" ? "x" : v.answer + "°", "#ffffff", "#20313a");
    body += svgText(330, 265, "square 90°", 19, "#607983");
    body += svgText(455, 440, "pentagon 108°", 19, "#607983");
    body += svgText(660, 210, "octagon 135°", 19, "#607983");
    body += textLabel(d, "D", 0, -10) + textLabel(da, "A", -16, -8) + textLabel(dc, "C", -14, 18) + textLabel(dg, "G", 14, 18) + textLabel(dm, "M", 0, -14);
    body += svgCard(160, 485, 680, 52, "gap = 360 - 90 - 108 - 135", "#ffffff", "#174c5f", 22);
    return body;
  }

  function aroundPointShapeDiagram(v) {
    let body = '<circle cx="500" cy="270" r="5" fill="#20313a"></circle>';
    body += '<path d="M500 270 L730 270 A230 230 0 0 1 500 500 Z" fill="#fff6df" stroke="#b17700" stroke-width="4"></path>';
    body += '<path d="M500 270 L500 60 A210 210 0 0 1 710 270 Z" fill="#e6f3f6" stroke="#174c5f" stroke-width="4"></path>';
    body += svgText(620, 365, v.a + "°", 30, "#20313a") + svgText(585, 170, v.b + "°", 30, "#20313a");
    body += svgCard(220, 455, 560, 55, "angles around a point = 360°", "#ffffff", "#174c5f", 24);
    return body;
  }

  function shapeComboDiagram(v, stateName) {
    if (v.family === "hexagon-square-equilateral") return sourceHexagonSquareTriangleDiagram(v, stateName);
    if (v.family === "regular-shape-gap") return regularShapeGapDiagram(v, stateName);
    return aroundPointShapeDiagram(v);
  }

  function visualSvg(problem, stateName) {
    const v = problem.visual;
    let body = svgText(500, 42, problem.nickname, 31, "#174c5f");
    if (v.type === "triangle") {
      body += triangleDiagram(v.labels[0], v.labels[1], stateName === "initial" ? "x" : v.answer + "°");
      body += svgCard(245, 455, 510, 55, "triangle total = 180°", "#ffffff", "#174c5f", 24);
    } else if (v.type === "isosceles") {
      body += triangleDiagram("x", "x", v.vertex + "°");
      body += line(375, 250, 390, 270, "#20313a", 4) + line(610, 270, 625, 250, "#20313a", 4);
      body += svgCard(240, 455, 520, 55, "equal sides -> equal base angles", "#ffffff", "#174c5f", 22);
    } else if (v.type === "straight") {
      body += line(200, 310, 800, 310) + line(500, 310, 650, 165);
      body += arcLabel(440, 280, v.shown + "°", "#fff6df") + arcLabel(620, 280, stateName === "initial" ? "x" : v.answer + "°", "#e8f6ef");
      body += svgCard(280, 430, 440, 55, "straight line total = 180°", "#ffffff", "#174c5f", 24);
    } else if (v.type === "alternate" || v.type === "corresponding" || v.type === "cointerior") {
      body += parallelDiagram(v.type, v.shown, stateName === "initial" ? "x" : v.answer);
    } else if (v.type === "parallel-zigzag") {
      body += parallelZigzagDiagram(v, stateName);
    } else if (v.type === "chase") {
      body += line(225, 420, 775, 420) + line(330, 420, 500, 135) + line(670, 420, 500, 135);
      body += arcLabel(300, 385, v.leftExterior + "°", "#fff6df") + arcLabel(700, 385, v.rightExterior + "°", "#fff6df");
      body += arcLabel(500, 195, stateName === "initial" ? "x" : v.answer + "°", "#e8f6ef");
      body += svgCard(160, 470, 680, 55, "straight lines first, then triangle total", "#ffffff", "#174c5f", 23);
    } else if (v.type === "equilateral-chase") {
      body += equilateralChaseDiagram(v, stateName);
    } else if (v.type === "polygon-sum") {
      body += polygonSumDiagram(v);
    } else if (v.type === "polygon") {
      body += '<polygon points="' + regularPolygonPoints(500, 285, 150, v.sides) + '" fill="#ffffff" stroke="#20313a" stroke-width="4"></polygon>';
      body += arcLabel(500, 140, stateName === "initial" ? "interior?" : v.answer + "°", "#e8f6ef");
      body += svgCard(185, 455, 630, 55, "sum = (" + v.sides + " - 2) x 180, then divide by " + v.sides, "#ffffff", "#174c5f", 21);
    } else if (v.type === "shape-combo") {
      body += shapeComboDiagram(v, stateName);
    }
    return svgShell(body);
  }

  function introSceneToolkit() {
    return svgShell(
      svgText(500, 42, "Angles are solved by naming the move", 31, "#174c5f") +
      svgCard(55, 92, 285, 54, "straight line = 180°", "#ffffff", "#174c5f", 20) +
      svgCard(357, 92, 285, 54, "triangle = 180°", "#ffffff", "#174c5f", 20) +
      svgCard(660, 92, 285, 54, "isosceles = twins", "#fff6df", "#b17700", 20) +
      svgCard(55, 175, 285, 54, "Z angles equal", "#e8f6ef", "#2e7d5b", 20) +
      svgCard(357, 175, 285, 54, "F angles equal", "#e8f6ef", "#2e7d5b", 20) +
      svgCard(660, 175, 285, 54, "C angles add to 180°", "#fff6df", "#b17700", 20) +
      svgCard(55, 258, 285, 54, "zigzag: find a + b", "#e8f6ef", "#2e7d5b", 19) +
      svgCard(357, 258, 285, 54, "equilateral: 60°", "#ffffff", "#174c5f", 20) +
      svgCard(660, 258, 285, 54, "polygon: (n - 2) x 180", "#fff6df", "#b17700", 18) +
      svgText(500, 435, "Do not guess. Name the rule first.", 32, "#20313a")
    );
  }

  const INTRO_SCENES = [
    { title: "Angle Toolkit", purpose: "Name the moves before calculating.", caption: "Angles are not about guessing. This chapter gives you a toolkit: straight line, triangle, isosceles, Z-angle, F-angle, C-angle, parallel zigzag totals, equilateral chases, and polygon sums.", durationMs: 14000, svg: introSceneToolkit },
    { title: "Straight + Triangle", purpose: "Use the two 180 degree tools.", caption: "Two of your best tools are 180 degrees. Angles on a straight line add to one hundred eighty, and angles inside a triangle also add to one hundred eighty.", durationMs: 14000, svg: () => svgShell(svgText(500, 42, "Two different 180° tools", 31, "#174c5f") + line(130, 220, 450, 220) + arcLabel(250, 190, "180°", "#fff6df") + triangleDiagram(50, 60, "70°") + svgText(500, 500, "Line total and triangle total are both powerful.", 24, "#607983")) },
    { title: "Isosceles", purpose: "Equal sides create equal base angles.", caption: "In an isosceles triangle, matching side marks create matching base angles. If the top angle is thirty degrees, the other two share the remaining one hundred fifty degrees.", durationMs: 15000, svg: () => svgShell(svgText(500, 42, "Matching sides make matching angles", 31, "#174c5f") + triangleDiagram("75°", "75°", "30°") + line(375, 250, 390, 270, "#20313a", 4) + line(610, 270, 625, 250, "#20313a", 4)) },
    { title: "Z/F/C Angles", purpose: "Recognise Z, F, and C parallel-line moves together.", caption: "When a line cuts through parallel lines, Z-angles are equal and F-angles are equal, but C-angles add to 180 degrees. These are the three pass-the-angle moves you reach for first.", durationMs: 15000, svg: () => svgShell(svgText(500, 42, "Z and F angles match", 31, "#174c5f") + parallelDiagram("alternate", 64, 64)) },
    { title: "Parallel 180 Move", purpose: "Use C-angles as a supplement pair within the Z/F/C angles family.", caption: "C-angles are different from Z-angles and F-angles. They do not match. They add to one hundred eighty degrees, so one angle is one hundred eighty minus the other.", durationMs: 15000, svg: () => svgShell(svgText(500, 42, "C angles add to 180°", 31, "#174c5f") + parallelDiagram("cointerior", 132, 48)) },
    { title: "Zigzag Totals", purpose: "Find a + b zigzag totals, not only single angles.", caption: "Some parallel-line questions ask for a plus b. In the source zigzag, keep both target angles in view and collect the turns that feed into the total.", durationMs: 16000, svg: () => visualSvg(generateProblem("angles.parallel-zigzag-total", 0), "worked") },
    { title: "Angle Chase", purpose: "Chain two or three moves.", caption: "Competition diagrams often hide the answer two or three moves away. Convert outside angles with straight lines, then use the triangle total or parallel-line moves.", durationMs: 16000, svg: () => visualSvg(generateProblem("angles.parallel-chase", 0), "worked") },
    { title: "Equilateral Chase", purpose: "Bring the hidden 60 degree angles into the chase.", caption: "When an equilateral triangle appears, write in sixty degrees first. Then the extra given angles tell you how the crossing angle has turned.", durationMs: 16000, svg: () => visualSvg(generateProblem("angles.equilateral-chase", 0), "worked") },
    { title: "Polygon Sum", purpose: "Polygon formula: use (n - 2) x 180, then divide by n if the polygon is regular.", caption: "A polygon with n sides splits into n minus two triangles. That gives the total interior angle sum. If the polygon is regular, divide that total by the number of sides.", durationMs: 16000, svg: () => visualSvg(generateProblem("angles.regular-polygon", 0), "worked") },
    { title: "Ready", purpose: "Move into practice.", caption: "Now train the moves. Say the name of the rule first, then calculate the angle.", durationMs: 9000, svg: () => svgShell(svgText(500, 58, "Ready to angle chase?", 36, "#174c5f") + svgCard(110, 150, 780, 58, "1. Name the move", "#ffffff", "#174c5f", 28) + svgCard(110, 245, 780, 58, "2. Calculate carefully", "#fff6df", "#b17700", 28) + svgCard(110, 340, 780, 58, "3. Pass the angle on", "#e8f6ef", "#2e7d5b", 28)) }
  ];

  function renderProblemVisual(problem, visualState) {
    const text = visualState === "worked" || visualState === "success" ? problem.solution : "Name the angle move before calculating. Equal, 180-pair, or full-turn?";
    return { svg: visualSvg(problem, visualState), text };
  }

  function startApp() {
    const els = {
      intro: document.getElementById("intro-screen"),
      practice: document.getElementById("practice-grid"),
      recap: document.getElementById("round-recap"),
      introTitle: document.getElementById("intro-scene-title"),
      introPurpose: document.getElementById("intro-scene-purpose"),
      introProgress: document.getElementById("intro-progress"),
      introFrame: document.getElementById("intro-frame"),
      introCaption: document.getElementById("intro-caption"),
      introProgressFill: document.getElementById("intro-progress-fill"),
      introPlay: document.getElementById("intro-play"),
      introPause: document.getElementById("intro-pause"),
      introNext: document.getElementById("intro-next"),
      introStart: document.getElementById("intro-start"),
      introVoiceToggle: document.getElementById("intro-voice-toggle"),
      introChoiceWatch: document.getElementById("intro-choice-watch"),
      introChoiceTrain: document.getElementById("intro-choice-train"),
      introStoryboard: document.getElementById("intro-storyboard"),
      modeIntro: document.getElementById("mode-intro-button"),
      modePractice: document.getElementById("mode-practice-button"),
      mastery: document.getElementById("mastery-chips"),
      classicLabel: document.getElementById("classic-label"),
      session: document.getElementById("session-count"),
      prompt: document.getElementById("problem-prompt"),
      formatHint: document.getElementById("format-hint"),
      form: document.getElementById("answer-form"),
      answerHost: document.getElementById("answer-host"),
      check: document.getElementById("check-button"),
      hint: document.getElementById("hint-button"),
      why: document.getElementById("why-button"),
      next: document.getElementById("next-button"),
      feedback: document.getElementById("feedback"),
      visualFrame: document.getElementById("visual-frame"),
      visualText: document.getElementById("visual-text"),
      visualState: document.getElementById("visual-state"),
      recapContent: document.getElementById("recap-content"),
      fresh: document.getElementById("fresh-round-button"),
      reviewIntro: document.getElementById("review-intro-button")
    };

    const state = {
      introComplete: false,
      introPlaying: false,
      introSceneIndex: 0,
      introTimer: null,
      classicIndex: 0,
      roundNumber: 0,
      variantOffset: 0,
      selectedChoice: null,
      completed: new Set(),
      attempts: [],
      currentItem: generateProblem(CLASSIC_IDS[0], 0)
    };

    function setMode(introComplete) {
      state.introComplete = introComplete;
      els.intro.hidden = introComplete;
      els.practice.hidden = !introComplete;
      els.recap.hidden = true;
      els.modeIntro.classList.toggle("secondary", introComplete);
      els.modePractice.classList.toggle("secondary", !introComplete);
    }

    function setFeedback(kind, message) {
      els.feedback.className = "feedback-card " + kind;
      els.feedback.textContent = message;
    }

    function setVisual(visualState) {
      const rendered = renderProblemVisual(state.currentItem, visualState);
      els.visualFrame.innerHTML = rendered.svg;
      els.visualText.textContent = rendered.text;
      els.visualState.textContent = visualState;
    }

    function renderMastery() {
      els.mastery.innerHTML = CLASSICS.map((classic, index) => {
        const current = index === state.classicIndex ? " current" : "";
        const done = state.completed.has(classic.id) ? " done" : "";
        return '<span class="mastery-chip' + current + done + '">' + escapeHtml(classic.nickname) + "</span>";
      }).join("");
    }

    function renderAnswer(problem) {
      state.selectedChoice = null;
      els.answerHost.innerHTML = '<div class="choice-grid">' + problem.choices.map((choice) =>
        '<button type="button" class="choice-card" data-choice="' + escapeHtml(choice.value) + '">' + escapeHtml(choice.label) + "</button>"
      ).join("") + "</div>";
      els.formatHint.textContent = "Choose one angle.";
    }

    function renderProblem() {
      const item = state.currentItem;
      els.classicLabel.textContent = item.nickname;
      els.session.textContent = (state.classicIndex + 1) + " of " + CLASSIC_IDS.length;
      els.prompt.textContent = item.prompt;
      els.next.disabled = true;
      els.check.disabled = false;
      renderMastery();
      renderAnswer(item);
      setFeedback("muted", "Choose an answer, then check it.");
      setVisual("initial");
    }

    function submitAnswer(event) {
      event.preventDefault();
      const result = checkAnswer(state.currentItem, { value: state.selectedChoice });
      state.attempts.push({ item: state.currentItem, result });
      if (result.isCorrect) {
        state.completed.add(state.currentItem.classicId);
        setFeedback("correct", result.message + " " + state.currentItem.solution);
        setVisual("success");
        els.next.disabled = false;
        els.check.disabled = true;
        renderMastery();
      } else {
        setFeedback("wrong", result.message);
        setVisual("hint1");
      }
    }

    function nextProblem() {
      if (state.classicIndex === CLASSIC_IDS.length - 1) {
        showRecap();
        return;
      }
      state.classicIndex += 1;
      state.currentItem = generateProblem(CLASSIC_IDS[state.classicIndex], state.variantOffset + state.roundNumber + state.classicIndex);
      renderProblem();
    }

    function showRecap() {
      els.practice.hidden = true;
      els.recap.hidden = false;
      const missed = new Set(state.attempts.filter((attempt) => !attempt.result.isCorrect).map((attempt) => attempt.item.classicId));
      els.recapContent.innerHTML = CLASSICS.map((classic) => {
        const status = missed.has(classic.id) ? "Review" : "Secure";
        return '<div class="recap-item"><strong>' + escapeHtml(status + ": " + classic.nickname) + '</strong><span>' + escapeHtml(classic.skill) + "</span></div>";
      }).join("");
    }

    function freshRound() {
      state.roundNumber += 1;
      state.variantOffset = Math.floor(Math.random() * 997);
      state.classicIndex = 0;
      state.completed = new Set();
      state.attempts = [];
      state.currentItem = generateProblem(CLASSIC_IDS[0], state.variantOffset + state.roundNumber);
      setMode(true);
      renderProblem();
    }

    function showHint() {
      setFeedback("muted", state.currentItem.hint1);
      setVisual("hint1");
    }

    function showWhy() {
      setFeedback("muted", state.currentItem.solution);
      setVisual("worked");
    }

    function renderIntro() {
      const scene = INTRO_SCENES[state.introSceneIndex];
      els.introTitle.textContent = scene.title;
      els.introPurpose.textContent = scene.purpose;
      els.introProgress.textContent = (state.introSceneIndex + 1) + " of " + INTRO_SCENES.length;
      els.introFrame.innerHTML = scene.svg();
      els.introCaption.textContent = scene.caption;
      els.introProgressFill.style.width = (((state.introSceneIndex + 1) / INTRO_SCENES.length) * 100) + "%";
      els.introPlay.disabled = state.introPlaying;
      els.introPause.disabled = !state.introPlaying;
      els.introNext.textContent = state.introSceneIndex === INTRO_SCENES.length - 1 ? "Replay" : "Next scene";
      els.introStoryboard.innerHTML = INTRO_SCENES.map((item, index) => {
        const current = index === state.introSceneIndex ? " current" : "";
        return '<li><button type="button" class="' + current + '" data-scene-index="' + index + '">' +
          '<span class="scene-dot">' + (index + 1) + '</span>' +
          '<span><span>' + escapeHtml(item.title) + '</span><span class="scene-purpose">' + escapeHtml(item.purpose) + '</span></span>' +
          "</button></li>";
      }).join("");
    }

    function speakIntroScene(scene) {
      if (!els.introVoiceToggle.checked) {
        if ("speechSynthesis" in window) window.speechSynthesis.cancel();
        return;
      }
      if (!("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(scene.caption);
      const voices = window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
      const preferred = voices.find((voice) => /zira|jenny|aria|sonia|natural/i.test(voice.name)) || voices.find((voice) => /^en/i.test(voice.lang));
      if (preferred) utterance.voice = preferred;
      utterance.rate = 0.92;
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
    }

    function stopIntro() {
      state.introPlaying = false;
      window.clearTimeout(state.introTimer);
      state.introTimer = null;
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      renderIntro();
    }

    function playIntroScene() {
      if (!state.introPlaying || state.introComplete) return;
      const scene = INTRO_SCENES[state.introSceneIndex];
      renderIntro();
      speakIntroScene(scene);
      window.clearTimeout(state.introTimer);
      state.introTimer = window.setTimeout(() => {
        if (!state.introPlaying) return;
        if (state.introSceneIndex === INTRO_SCENES.length - 1) {
          stopIntro();
          els.introStart.focus();
          return;
        }
        state.introSceneIndex += 1;
        playIntroScene();
      }, scene.durationMs);
    }

    function startIntroVideo() {
      if (state.introComplete) return;
      if (state.introSceneIndex === INTRO_SCENES.length - 1) state.introSceneIndex = 0;
      state.introPlaying = true;
      playIntroScene();
    }

    function showIntroMode() {
      stopIntro();
      setMode(false);
      renderIntro();
    }

    function nextIntroScene() {
      stopIntro();
      state.introSceneIndex = state.introSceneIndex === INTRO_SCENES.length - 1 ? 0 : state.introSceneIndex + 1;
      renderIntro();
    }

    function startExercises() {
      stopIntro();
      setMode(true);
      renderProblem();
    }

    els.form.addEventListener("submit", submitAnswer);
    els.hint.addEventListener("click", showHint);
    els.why.addEventListener("click", showWhy);
    els.next.addEventListener("click", nextProblem);
    els.fresh.addEventListener("click", freshRound);
    els.reviewIntro.addEventListener("click", showIntroMode);
    els.introPlay.addEventListener("click", startIntroVideo);
    els.introPause.addEventListener("click", stopIntro);
    els.introNext.addEventListener("click", nextIntroScene);
    els.introStart.addEventListener("click", startExercises);
    els.introChoiceWatch.addEventListener("click", startIntroVideo);
    els.introChoiceTrain.addEventListener("click", startExercises);
    els.modeIntro.addEventListener("click", showIntroMode);
    els.modePractice.addEventListener("click", startExercises);
    els.introStoryboard.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-scene-index]");
      if (!button) return;
      stopIntro();
      state.introSceneIndex = Number(button.dataset.sceneIndex);
      renderIntro();
    });
    els.answerHost.addEventListener("click", (event) => {
      const button = event.target.closest(".choice-card");
      if (!button) return;
      state.selectedChoice = button.dataset.choice;
      els.answerHost.querySelectorAll(".choice-card").forEach((choiceButton) => choiceButton.classList.remove("selected"));
      button.classList.add("selected");
    });

    setMode(false);
    renderIntro();
  }

  const api = {
    CLASSICS,
    CLASSIC_IDS,
    CLASSIC_SKILLS,
    INTRO_SCENES,
    generateProblem,
    checkAnswer,
    renderProblemVisual
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.AnglesModule = api;

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", startApp);
  }
})(typeof window !== "undefined" ? window : globalThis);

