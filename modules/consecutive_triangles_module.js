(function (root) {
  "use strict";

  const CLASSICS = [
    {
      id: "consecutive.row-length",
      nickname: "Row Has Row Count",
      skill: "Know that ordinary row r contains r numbers."
    },
    {
      id: "consecutive.row-end",
      nickname: "Row End",
      skill: "Find the last number in an ordinary consecutive triangle row."
    },
    {
      id: "consecutive.seat-value",
      nickname: "Find The Seat",
      skill: "Find position k in row r of the ordinary triangle."
    },
    {
      id: "consecutive.row-sum",
      nickname: "Whole Row Total",
      skill: "Add every number in an ordinary triangle row."
    },
    {
      id: "consecutive.find-address",
      nickname: "Find The Address",
      skill: "Find the row and position of an ordinary triangle value."
    },
    {
      id: "even.seat-value",
      nickname: "Even Twin Seat",
      skill: "Find position k in row r of the even-number triangle."
    },
    {
      id: "even.find-address",
      nickname: "Even Twin Address",
      skill: "Find the row and position of an even-number triangle value."
    },
    {
      id: "wide.seat-value",
      nickname: "Wide Row Seat",
      skill: "Use the 1, 3, 5, 7 row-length challenge triangle."
    }
  ];

  const CLASSIC_IDS = CLASSICS.map((classic) => classic.id);
  const CLASSIC_BY_ID = Object.fromEntries(CLASSICS.map((classic) => [classic.id, classic]));

  // Maps each classic to a registry skill so the skill-coverage gate can
  // verify the bank covers every skill the registry promises.
  // Registry skills: ["Row end", "Seat value", "Find address",
  // "Even twin", "Wide row"].
  const CLASSIC_SKILLS = {
    "consecutive.row-length": "Row end",
    "consecutive.row-end": "Row end",
    "consecutive.seat-value": "Seat value",
    "consecutive.row-sum": "Seat value",
    "consecutive.find-address": "Find address",
    "even.seat-value": "Even twin",
    "even.find-address": "Even twin",
    "wide.seat-value": "Wide row"
  };

  function triangular(n) {
    return (n * (n + 1)) / 2;
  }

  function ordinaryValue(row, position) {
    return triangular(row - 1) + position;
  }

  function ordinaryRow(row) {
    return Array.from({ length: row }, (_, index) => ordinaryValue(row, index + 1));
  }

  function ordinaryAddress(value) {
    let row = 1;
    while (triangular(row) < value) row += 1;
    return { row, position: value - triangular(row - 1) };
  }

  function ordinaryRowSum(row) {
    return (row * (row * row + 1)) / 2;
  }

  function evenValue(row, position) {
    return 2 * ordinaryValue(row, position);
  }

  function evenRow(row) {
    return ordinaryRow(row).map((value) => value * 2);
  }

  function evenAddress(value) {
    return ordinaryAddress(value / 2);
  }

  function wideValue(row, position) {
    return (row - 1) * (row - 1) + position;
  }

  function wideRow(row) {
    return Array.from({ length: 2 * row - 1 }, (_, index) => wideValue(row, index + 1));
  }

  function wideAddress(value) {
    const row = Math.ceil(Math.sqrt(value));
    return { row, position: value - (row - 1) * (row - 1) };
  }

  function rowForFamily(family, row) {
    if (family === "even") return evenRow(row);
    if (family === "wide") return wideRow(row);
    return ordinaryRow(row);
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

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
    ")": "⁾",
    r: "ʳ",
    o: "ᵒ",
    w: "ʷ"
  };

  function toSuperscript(value) {
    return String(value)
      .replace(/\s+/g, "")
      .split("")
      .map((char) => SUPERSCRIPTS[char.toLowerCase()] || char)
      .join("");
  }

  function formatMathText(value) {
    return String(value)
      .replace(/\^\(([^)]{1,40})\)/g, (_, exponent) => toSuperscript("(" + exponent + ")"))
      .replace(/\^(-?\d+)/g, (_, exponent) => toSuperscript(exponent))
      .replace(/\^([a-zA-Z]+)/g, (_, exponent) => toSuperscript(exponent));
  }

  function shuffledChoices(correct, wrongs) {
    const options = [correct, ...wrongs]
      .filter((value, index, values) => values.indexOf(value) === index)
      .slice(0, 4);
    while (options.length < 4) options.push(correct + options.length * 3 + 1);
    return options
      .map((value) => ({ value, label: String(value), isCorrect: value === correct }))
      .sort((a, b) => a.value - b.value);
  }

  function addressChoices(correct, wrongs) {
    return [correct, ...wrongs].map((item) => ({
      value: "row " + item.row + ", position " + item.position,
      label: "row " + item.row + ", position " + item.position,
      address: item,
      isCorrect: item.row === correct.row && item.position === correct.position
    }));
  }

  const PROBLEM_SETS = {
    "consecutive.row-length": [
      { row: 12 },
      { row: 37 },
      { row: 55 }
    ].map(({ row }) => ({
      prompt: "How many numbers are there in row " + row + " of the ordinary consecutive-number triangle?",
      answerType: "choice",
      expected: row,
      choices: shuffledChoices(row, [row - 1, row + 1, triangular(row)]),
      hint1: "Look at the row lengths: row 1 has 1 number, row 2 has 2, row 3 has 3.",
      hint2: "The row number and the number of seats are the same.",
      solution: "Row " + row + " contains " + row + " numbers.",
      visual: { family: "ordinary", row, mode: "row-length" }
    })),
    "consecutive.row-end": [
      { row: 7 },
      { row: 20 },
      { row: 13 }
    ].map(({ row }) => {
      const expected = triangular(row);
      return {
        prompt: "What is the last number in row " + row + " of the ordinary consecutive-number triangle?",
        answerType: "choice",
        expected,
        choices: shuffledChoices(expected, [expected - row, expected + row, row * row]),
        hint1: "The last number means: how many numbers have appeared by the end of that row?",
        hint2: "Add 1 + 2 + ... + " + row + ", or use " + row + " x " + (row + 1) + " / 2.",
        solution: "The row end is T_" + row + " = " + row + " x " + (row + 1) + " / 2 = " + expected + ".",
        visual: { family: "ordinary", row, mode: "row-end", value: expected }
      };
    }),
    "consecutive.seat-value": [
      { row: 21, position: 5 },
      { row: 12, position: 8 },
      { row: 30, position: 5 }
    ].map(({ row, position }) => {
      const before = triangular(row - 1);
      const expected = ordinaryValue(row, position);
      return {
        prompt: "What is the " + ordinal(position) + " number in row " + row + " of the ordinary consecutive-number triangle?",
        answerType: "choice",
        expected,
        choices: shuffledChoices(expected, [before, before + position - 1, triangular(row)]),
        hint1: "First count how many numbers are already used before this row starts.",
        hint2: "Before row " + row + " there are T_" + (row - 1) + " = " + before + " numbers. Then move " + position + " seats into the row.",
        solution: "Before row " + row + " there are " + before + " numbers. " + before + " + " + position + " = " + expected + ".",
        visual: { family: "ordinary", row, position, mode: "seat-value", value: expected, before }
      };
    }),
    "consecutive.row-sum": [
      { row: 10 },
      { row: 13 },
      { row: 20 }
    ].map(({ row }) => {
      const first = ordinaryValue(row, 1);
      const last = ordinaryValue(row, row);
      const expected = ordinaryRowSum(row);
      return {
        prompt: "What is the sum of all numbers in row " + row + " of the ordinary consecutive-number triangle?",
        answerType: "choice",
        expected,
        choices: shuffledChoices(expected, [triangular(row), first + last, expected - row]),
        hint1: "A row is a short run of consecutive numbers. Use first and last.",
        hint2: "Row " + row + " runs from " + first + " to " + last + ". Average x count gives the row total.",
        solution: "Row " + row + " has " + row + " numbers. (" + first + " + " + last + ") x " + row + " / 2 = " + expected + ".",
        visual: { family: "ordinary", row, mode: "row-sum", first, last, value: expected }
      };
    }),
    "consecutive.find-address": [
      { value: 60 },
      { value: 46 },
      { value: 100 }
    ].map(({ value }) => {
      const address = ordinaryAddress(value);
      const lower = triangular(address.row - 1);
      const upper = triangular(address.row);
      return {
        prompt: "In the ordinary consecutive-number triangle, what is the address of " + value + "?",
        answerType: "address",
        expected: address,
        hint1: "Find the two row-end numbers that trap " + value + ".",
        hint2: lower + " < " + value + " <= " + upper + ", so it is in row " + address.row + ". Then subtract " + lower + " to find the seat.",
        solution: value + " is after row-end " + lower + ". " + value + " - " + lower + " = " + address.position + ", so it is row " + address.row + ", position " + address.position + ".",
        visual: { family: "ordinary", row: address.row, position: address.position, mode: "find-address", value, lower, upper }
      };
    }),
    "even.seat-value": [
      { row: 21, position: 5 },
      { row: 6, position: 3 },
      { row: 61, position: 5 }
    ].map(({ row, position }) => {
      const ordinary = ordinaryValue(row, position);
      const expected = evenValue(row, position);
      return {
        prompt: "In the even-number triangle, what is the " + ordinal(position) + " number in row " + row + "?",
        answerType: "choice",
        expected,
        choices: shuffledChoices(expected, [ordinary, expected - 2, 2 * triangular(row)]),
        hint1: "Use the ordinary triangle address first, then double the value.",
        hint2: "Ordinary row " + row + ", position " + position + " is " + ordinary + ". The even triangle doubles it.",
        solution: "Ordinary value: " + ordinary + ". Even value: 2 x " + ordinary + " = " + expected + ".",
        visual: { family: "even", row, position, mode: "even-seat", value: expected, ordinary }
      };
    }),
    "even.find-address": [
      { value: 80 },
      { value: 60 },
      { value: 430 }
    ].map(({ value }) => {
      const half = value / 2;
      const address = evenAddress(value);
      return {
        prompt: "In the even-number triangle, " + value + " is in which row and position?",
        answerType: "address",
        expected: address,
        hint1: "Every value in the even triangle is double an ordinary-triangle value.",
        hint2: "First divide " + value + " by 2. Then find the address of " + half + " in the ordinary triangle.",
        solution: value + " / 2 = " + half + ". " + half + " is row " + address.row + ", position " + address.position + " in the ordinary triangle, so " + value + " has the same address in the even triangle.",
        visual: { family: "even", row: address.row, position: address.position, mode: "even-address", value, ordinary: half }
      };
    }),
    "wide.seat-value": [
      { row: 12, position: 23, type: "last" },
      { row: 21, position: 8 },
      { value: 83, type: "address" }
    ].map((vars) => {
      if (vars.type === "address") {
        const address = wideAddress(vars.value);
        return {
          prompt: "In the wide challenge triangle with row lengths 1, 3, 5, 7..., what is the address of " + vars.value + "?",
          answerType: "address",
          expected: address,
          hint1: "This is not the ordinary triangle. Wide-row ends are square numbers.",
          hint2: "Find the squares around " + vars.value + ". Then subtract the previous square.",
          solution: "9^2 = 81 and 10^2 = 100, so " + vars.value + " is in row 10. " + vars.value + " - 81 = 2, so it is position 2.",
          visual: { family: "wide", row: address.row, position: address.position, mode: "wide-address", value: vars.value }
        };
      }
      const expected = wideValue(vars.row, vars.position);
      const lastNote = vars.type === "last" ? "last number" : ordinal(vars.position) + " number";
      return {
        prompt: "In the wide challenge triangle with row lengths 1, 3, 5, 7..., what is the " + lastNote + " in row " + vars.row + "?",
        answerType: "choice",
        expected,
        choices: shuffledChoices(expected, [triangular(vars.row), vars.row * vars.row, expected - vars.position]),
        hint1: "This triangle has row lengths 1, 3, 5, 7..., so its row ends are 1, 4, 9, 16...",
        hint2: "Use (row - 1)^2 + position.",
        solution: "The value is (" + (vars.row - 1) + ")^2 + " + vars.position + " = " + expected + ".",
        visual: { family: "wide", row: vars.row, position: vars.position, mode: "wide-seat", value: expected }
      };
    })
  };

  function ordinal(n) {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return n + "st";
    if (mod10 === 2 && mod100 !== 12) return n + "nd";
    if (mod10 === 3 && mod100 !== 13) return n + "rd";
    return n + "th";
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
      source: "Lesson 7 Triangular Number Tables",
      rowConvention: "rows_start_at_1_positions_start_at_1"
    };
  }

  function parseInteger(value) {
    const cleaned = String(value || "").trim();
    if (!/^-?\d+$/.test(cleaned)) return null;
    return Number(cleaned);
  }

  function checkAnswer(problem, input) {
    if (problem.answerType === "address") {
      const row = parseInteger(input && input.row);
      const position = parseInteger(input && input.position);
      if (row === null || position === null) {
        return { isCorrect: false, errorClass: "missing_address", message: "Enter both the row and the position." };
      }
      if (row === problem.expected.row && position === problem.expected.position) {
        return { isCorrect: true, message: "Correct. You found the address." };
      }
      if (row === problem.expected.row) {
        return { isCorrect: false, errorClass: "position_error", message: "The row is right, but the position needs another look." };
      }
      if (position === problem.expected.position) {
        return { isCorrect: false, errorClass: "row_error", message: "The position is right, but the row is not." };
      }
      return { isCorrect: false, errorClass: "address_error", message: "Not quite. Trap the value between row ends, then count into the row." };
    }
    const value = parseInteger(input && input.value !== undefined ? input.value : input);
    if (value === null) return { isCorrect: false, errorClass: "missing_number", message: "Enter one whole number." };
    if (value === problem.expected) return { isCorrect: true, message: "Correct. Nice map reading." };
    if (problem.classicId.includes("even") && value === problem.expected / 2) {
      return { isCorrect: false, errorClass: "forgot_to_double", message: "That is the ordinary-triangle value. The even triangle doubles it." };
    }
    if (problem.classicId === "consecutive.seat-value" && value === triangular(problem.visual.row)) {
      return { isCorrect: false, errorClass: "used_row_end", message: "That is the row end. This question asks for a seat inside the row." };
    }
    return { isCorrect: false, errorClass: "wrong_number", message: "Not quite. Use the hint or the triangle map." };
  }

  function svgText(x, y, value, size, color, weight, anchor) {
    return '<text x="' + x + '" y="' + y + '" text-anchor="' + (anchor || "middle") + '" font-size="' + (size || 24) + '" font-weight="' + (weight || "750") + '" fill="' + (color || "#20313a") + '">' + escapeHtml(formatMathText(value)) + "</text>";
  }

  function svgCard(x, y, w, h, value, fill, stroke, size) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="12" fill="' + (fill || "#ffffff") + '" stroke="' + (stroke || "#d9e5e8") + '" stroke-width="3"></rect>' +
      svgText(x + w / 2, y + h / 2 + 8, value, size || 22);
  }

  function svgShell(body) {
    return '<svg viewBox="0 0 1000 560" role="img" xmlns="http://www.w3.org/2000/svg"><rect width="1000" height="560" fill="#fffdf7"></rect>' + body + "</svg>";
  }

  function triangleNodes(family, rows, target) {
    let out = "";
    const valuesForRow = family === "wide" ? wideRow : family === "even" ? evenRow : ordinaryRow;
    const startY = 92;
    const rowGap = 62;
    const colGap = family === "wide" ? 52 : 66;
    for (let row = 1; row <= rows; row += 1) {
      const values = valuesForRow(row);
      const y = startY + (row - 1) * rowGap;
      const startX = 500 - ((values.length - 1) * colGap) / 2;
      out += svgText(118, y + 8, "row " + row, 18, "#607983", "700", "start");
      for (let index = 0; index < values.length; index += 1) {
        const position = index + 1;
        const x = startX + index * colGap;
        const active = target && target.row === row && target.position === position;
        const rowActive = target && target.row === row && !target.position;
        const fill = active ? "#fff6df" : rowActive ? "#e6f3f6" : "#ffffff";
        const stroke = active ? "#b17700" : rowActive ? "#174c5f" : "#d9e5e8";
        out += '<circle cx="' + x + '" cy="' + y + '" r="26" fill="' + fill + '" stroke="' + stroke + '" stroke-width="3"></circle>';
        out += svgText(x, y + 8, values[index], values[index] > 999 ? 15 : 21, "#20313a", "750");
      }
    }
    return out;
  }

  function introSceneNewMap() {
    return svgShell(
      svgText(500, 42, "Not Pascal: this is an address map", 31, "#174c5f") +
      triangleNodes("ordinary", 4, { row: 4 }) +
      svgCard(60, 420, 380, 56, "ordinary: 1, 2, 3, 4...", "#ffffff", "#174c5f", 24) +
      svgCard(560, 420, 380, 56, "even twin: 2, 4, 6, 8...", "#fff6df", "#b17700", 24) +
      svgText(500, 520, "Every number has a row and a seat.", 24, "#607983")
    );
  }

  function introSceneRowEnds() {
    return svgShell(
      svgText(500, 42, "Row ends count everything so far", 31, "#174c5f") +
      triangleNodes("ordinary", 5, { row: 4 }) +
      svgCard(600, 118, 330, 56, "row 4 has 4 seats", "#e6f3f6", "#174c5f", 22) +
      svgCard(600, 190, 330, 56, "last = 1 + 2 + 3 + 4", "#ffffff", "#b17700", 21) +
      svgCard(600, 262, 330, 56, "last = 10", "#fff6df", "#b17700", 28)
    );
  }

  function introSceneSeatValue() {
    return svgShell(
      svgText(500, 42, "Find a seat: count before, then step in", 30, "#174c5f") +
      svgCard(95, 110, 810, 64, "5th number in row 21", "#ffffff", "#174c5f", 30) +
      svgCard(150, 215, 700, 58, "before row 21: 1 + 2 + ... + 20 = 210", "#e6f3f6", "#174c5f", 24) +
      svgCard(250, 315, 500, 58, "210 + 5 = 215", "#fff6df", "#b17700", 30) +
      svgText(500, 470, "This is the main move for ordinary consecutive triangles.", 24, "#607983")
    );
  }

  function introSceneReverse() {
    return svgShell(
      svgText(500, 42, "Find an address: trap the value", 31, "#174c5f") +
      svgCard(145, 110, 260, 60, "row 10 ends 55", "#ffffff", "#174c5f", 22) +
      svgCard(370, 110, 260, 60, "60", "#fff6df", "#b17700", 34) +
      svgCard(595, 110, 260, 60, "row 11 ends 66", "#ffffff", "#174c5f", 22) +
      svgText(500, 235, "55 < 60 <= 66", 44, "#20313a") +
      svgCard(280, 320, 440, 64, "row 11, position 5", "#e8f6ef", "#2e7d5b", 30) +
      svgText(500, 470, "Position = 60 - 55.", 24, "#607983")
    );
  }

  function introSceneRowSum() {
    return svgShell(
      svgText(500, 42, "Whole row total: first plus last", 31, "#174c5f") +
      svgCard(150, 105, 700, 58, "row 10 runs from 46 to 55", "#ffffff", "#174c5f", 28) +
      svgCard(150, 205, 700, 58, "average pair: 46 + 55", "#fff6df", "#b17700", 25) +
      svgCard(150, 305, 700, 58, "(46 + 55) x 10 / 2 = 505", "#e8f6ef", "#2e7d5b", 30) +
      svgText(500, 470, "Rows are consecutive runs, so the average trick works.", 24, "#607983")
    );
  }

  function introSceneEvenTwin() {
    return svgShell(
      svgText(500, 42, "The even triangle keeps the same address", 31, "#174c5f") +
      triangleNodes("even", 4, { row: 4, position: 4 }) +
      svgCard(560, 120, 360, 56, "80 / 2 = 40", "#ffffff", "#174c5f", 28) +
      svgCard(560, 200, 360, 56, "find 40 in ordinary map", "#fff6df", "#b17700", 23) +
      svgCard(560, 280, 360, 56, "same address in even map", "#e8f6ef", "#2e7d5b", 22)
    );
  }

  function introSceneWide() {
    return svgShell(
      svgText(500, 42, "Stretch warning: wide rows are different", 30, "#174c5f") +
      triangleNodes("wide", 4, { row: 4 }) +
      svgCard(585, 120, 340, 58, "row lengths: 1, 3, 5, 7", "#ffffff", "#174c5f", 22) +
      svgCard(585, 205, 340, 58, "row ends: 1, 4, 9, 16", "#fff6df", "#b17700", 22) +
      svgCard(585, 290, 340, 58, "last in row r = r^2", "#e8f6ef", "#2e7d5b", 25)
    );
  }

  function introSceneReady() {
    return svgShell(
      svgText(500, 58, "Ready to train the map?", 36, "#174c5f") +
      svgCard(110, 135, 780, 58, "First ask: ordinary, even, or wide?", "#ffffff", "#174c5f", 26) +
      svgCard(110, 225, 780, 58, "Then ask: row end, seat value, address, or row total?", "#fff6df", "#b17700", 24) +
      svgCard(110, 315, 780, 58, "Hints will show the triangle again.", "#e8f6ef", "#2e7d5b", 26) +
      svgText(500, 465, "Start the practice round.", 30, "#20313a")
    );
  }

  const INTRO_SCENES = [
    {
      title: "New Map",
      purpose: "Name the chapter and the address idea.",
      caption: "This looks a little like Pascal Triangle, but it is not Pascal. Here the numbers are placed row by row, so every number has an address: row and seat.",
      durationMs: 13000,
      svg: introSceneNewMap
    },
    {
      title: "Row Ends",
      purpose: "Connect row length to triangular totals.",
      caption: "Row four has four seats. Its last number is ten because by the end of row four we have placed one plus two plus three plus four numbers.",
      durationMs: 15000,
      svg: introSceneRowEnds
    },
    {
      title: "Seat Value",
      purpose: "Teach the main formula visually.",
      caption: "To find a seat, count everything before the row, then step into the row. The fifth number in row twenty-one is two hundred ten plus five, which is two hundred fifteen.",
      durationMs: 16000,
      svg: introSceneSeatValue
    },
    {
      title: "Find Address",
      purpose: "Find address: work backwards from a value to its row and seat.",
      caption: "To work backwards, trap the value between two row ends. Sixty is after fifty-five and before sixty-six, so it is in row eleven. It is five after fifty-five, so it is position five.",
      durationMs: 17000,
      svg: introSceneReverse
    },
    {
      title: "Row Sum",
      purpose: "Add one whole row efficiently.",
      caption: "A row is a run of consecutive numbers. For row ten, the first value is forty-six and the last is fifty-five. Use first plus last, times the number of seats, divided by two.",
      durationMs: 15000,
      svg: introSceneRowSum
    },
    {
      title: "Even Twin",
      purpose: "Transfer the address map to even numbers.",
      caption: "The even-number triangle uses the same addresses, but every ordinary value is doubled. If you are given an even value, divide by two, find the ordinary address, then keep that address.",
      durationMs: 16000,
      svg: introSceneEvenTwin
    },
    {
      title: "Wide Row",
      purpose: "Wide row triangle: separate the stretch pattern from the ordinary map.",
      caption: "The wide row triangle is different. Its rows have one, three, five, seven seats. That makes its row ends square numbers, not triangular numbers.",
      durationMs: 15000,
      svg: introSceneWide
    },
    {
      title: "Ready",
      purpose: "Move into practice.",
      caption: "Now train the map. First ask which triangle you are in, then choose row end, seat value, address, or row total.",
      durationMs: 9000,
      svg: introSceneReady
    }
  ];

  function renderProblemVisual(problem, visualState) {
    const visual = problem.visual;
    const target = visual.position ? { row: Math.min(visual.row, 4), position: visual.row <= 4 ? visual.position : undefined } : { row: Math.min(visual.row, 4) };
    let body = svgText(500, 42, problem.nickname, 31, "#174c5f");
    body += triangleNodes(visual.family, 4, target);
    const familyLabel = visual.family === "even" ? "even-number triangle" : visual.family === "wide" ? "wide-row triangle" : "ordinary triangle";
    body += svgCard(52, 430, 270, 54, familyLabel, "#ffffff", "#174c5f", 20);
    if (visualState === "hint1") {
      body += svgCard(360, 430, 590, 54, problem.hint1, "#fff6df", "#b17700", 17);
    } else if (visualState === "hint2" || visualState === "worked") {
      body += svgCard(360, 420, 590, 74, problem.hint2, "#fff6df", "#b17700", 16);
    } else if (visualState === "success") {
      body += svgCard(360, 430, 590, 54, problem.solution, "#e8f6ef", "#2e7d5b", 16);
    } else {
      const note = visual.mode === "row-length" ? "Row number tells you the number of seats." :
        visual.mode === "find-address" || visual.mode === "even-address" || visual.mode === "wide-address" ? "Find the row first, then the position." :
          "Count before the row, then step into the row.";
      body += svgCard(360, 430, 590, 54, note, "#f8fbfb", "#d9e5e8", 18);
    }
    return {
      svg: svgShell(body),
      text: formatMathText(visualState === "worked" || visualState === "success" ? problem.solution : "Rows and positions start at 1. Check which triangle map is being used before calculating.")
    };
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
      visualState: "initial",
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
      els.feedback.textContent = formatMathText(message);
    }

    function setVisual(visualState) {
      state.visualState = visualState;
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
      if (problem.answerType === "address") {
        els.answerHost.innerHTML = '<div class="address-grid">' +
          '<label class="field-label">Row<input id="row-answer" class="number-input" inputmode="numeric" autocomplete="off" aria-label="Row answer"></label>' +
          '<label class="field-label">Position<input id="position-answer" class="number-input" inputmode="numeric" autocomplete="off" aria-label="Position answer"></label>' +
          "</div>";
        els.formatHint.textContent = "Enter two numbers: row and position.";
        window.setTimeout(() => document.getElementById("row-answer").focus(), 0);
        return;
      }
      if (problem.answerType === "choice") {
        els.answerHost.innerHTML = '<div class="choice-grid">' + problem.choices.map((choice) =>
          '<button type="button" class="choice-card" data-choice="' + escapeHtml(choice.value) + '">' + escapeHtml(formatMathText(choice.label)) + "</button>"
        ).join("") + "</div>";
        els.formatHint.textContent = "Choose one answer.";
        return;
      }
      els.answerHost.innerHTML = '<input id="number-answer" class="number-input" inputmode="numeric" autocomplete="off" aria-label="Number answer">';
      els.formatHint.textContent = "Enter one whole number.";
      window.setTimeout(() => document.getElementById("number-answer").focus(), 0);
    }

    function renderProblem() {
      const item = state.currentItem;
      els.classicLabel.textContent = item.nickname;
      els.session.textContent = (state.classicIndex + 1) + " of " + CLASSIC_IDS.length;
      els.prompt.textContent = formatMathText(item.prompt);
      els.next.disabled = true;
      els.check.disabled = false;
      renderMastery();
      renderAnswer(item);
      setFeedback("muted", "Choose an answer, then check it.");
      setVisual("initial");
    }

    function getAnswerInput() {
      if (state.currentItem.answerType === "address") {
        return {
          row: document.getElementById("row-answer").value,
          position: document.getElementById("position-answer").value
        };
      }
      if (state.currentItem.answerType === "choice") {
        return { value: state.selectedChoice };
      }
      return { value: document.getElementById("number-answer").value };
    }

    function submitAnswer(event) {
      event.preventDefault();
      const result = checkAnswer(state.currentItem, getAnswerInput());
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
      const classicId = CLASSIC_IDS[state.classicIndex];
      state.currentItem = generateProblem(classicId, state.roundNumber + state.classicIndex);
      renderProblem();
    }

    function showRecap() {
      els.practice.hidden = true;
      els.recap.hidden = false;
      const seen = new Set();
      const missed = state.attempts.filter((attempt) => !attempt.result.isCorrect);
      const mistakeItems = missed.filter((attempt) => {
        const key = attempt.item.classicId;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      const baseItems = CLASSICS.map((classic) => {
        const status = mistakeItems.some((attempt) => attempt.item.classicId === classic.id) ? "Review" : "Secure";
        return '<div class="recap-item"><strong>' + escapeHtml(status + ": " + classic.nickname) + '</strong><span>' + escapeHtml(classic.skill) + "</span></div>";
      });
      els.recapContent.innerHTML = baseItems.join("");
    }

    function freshRound() {
      state.roundNumber += 1;
      state.classicIndex = 0;
      state.completed = new Set();
      state.attempts = [];
      state.currentItem = generateProblem(CLASSIC_IDS[0], state.roundNumber);
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
      els.introCaption.textContent = formatMathText(scene.caption);
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
    triangular,
    ordinaryValue,
    ordinaryAddress,
    ordinaryRowSum,
    evenValue,
    evenAddress,
    wideValue,
    wideAddress,
    formatMathText,
    generateProblem,
    checkAnswer,
    renderProblemVisual
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.ConsecutiveTrianglesModule = api;

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", startApp);
  }
})(typeof window !== "undefined" ? window : globalThis);
