let volcanoData;
let fontSans;

// === Variabili globali ===
let activeType = null;
let volcanoTypes = [];
let hoveredVolcano = null;

// === Colori per tipo ===
let glyphColors = {};

// === Mappatura codici eruzione ===
const eruptionCodes = {
  "D1": "1964 or later",
  "D2": "1900–1963",
  "D3": "1800–1899",
  "D4": "1700–1799",
  "D5": "1500–1699",
  "D6": "A.D. 1–1499",
  "D7": "B.C. (Holocene)",
  "U": "Undated, but probable Holocene eruption",
  "Q": "Quaternary eruption(s) with only known Holocene activity being hydrothermal",
  "?": "Uncertain Holocene eruption"
};

// === Mappatura tipo → categoria ===
const typeCategoryMap = {
  "stratovolcano": "Stratovolcanoes",
  "shield": "Shield Volcanoes",
  "shield volcano": "Shield Volcanoes",
  "cinder cone": "Cinder Cones",
  "scoria cone": "Cinder Cones",
  "caldera": "Calderas",
  "lava dome": "Lava Domes",
  "lava domes": "Lava Domes",
  "complex": "Complex Volcanoes",
  "maar": "Maars",
  "submarine volcano": "Submarine Volcanoes",
  "fissure vent": "Fissure Vents",
  "pyroclastic cone": "Pyroclastic Cones",
  "tuff cone": "Tuff Cones",
  "tuff ring": "Tuff Rings",
  "volcanic field": "Volcanic Fields",
  "hydrothermal field": "Hydrothermal Fields",
  "cone": "Cones",
  "unknown": "Unknown Type"
};

// === PRELOAD ===
function preload() {
  volcanoData = loadTable("asset/dataset.csv", "csv", "header");
  fontSans = loadFont("asset/font/static/Montserrat-Medium.ttf");
}

// === SETUP ===
function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont(fontSans);
  textAlign(LEFT, CENTER);
  noStroke();

  // Ricava categorie presenti nel dataset
  let catSet = new Set();
  let typeSet = new Set();

  for (let r = 0; r < volcanoData.getRowCount(); r++) {
    let t = volcanoData.getString(r, "Type")?.toLowerCase().trim() || "unknown";
    let cat = typeCategoryMap[t] || "Other";
    catSet.add(cat);
    typeSet.add(t);
  }

  volcanoTypes = Array.from(catSet).sort();

  assignGlyphColors(Array.from(typeSet)); // colori per tipo
  createTypeBar();
}

// === DRAW ===
function draw() {
  background(25, 30, 102);

  drawTitle();
  drawLegendBox();

  let mapMargin = 50;
  let mapX = mapMargin;
  let mapY = 130;
  let mapW = width - 2 * mapMargin;
  let mapH = height - mapY - mapMargin;

  drawVolcanoes(mapX, mapY, mapW, mapH);
}

// === TITLE ===
function drawTitle() {
  textAlign(CENTER, CENTER);
  textFont(fontSans);
  textSize(60);
  fill(255);
  text("VOLCANOES OF THE WORLD", width/2, 70);
}

// === VOLCANOES ===
function drawVolcanoes(mapX, mapY, mapW, mapH) {
  hoveredVolcano = null;
  let closestDist = Infinity;
  let fixedSize = 20;

  // Trova il vulcano più vicino al mouse
  for (let r = 0; r < volcanoData.getRowCount(); r++) {
    let row = volcanoData.getRow(r);
    let lat = float(row.get("Latitude"));
    let lon = float(row.get("Longitude"));
    let type = row.get("Type")?.toLowerCase();
    let name = row.get("Volcano Name") || "Unknown";

    let category = typeCategoryMap[type] || "Other";
    if (activeType && category !== activeType) continue;

    let x = map(lon, -180, 180, mapX, mapX + mapW);
    let y = map(lat, 90, -90, mapY, mapY + mapH);

    let d = dist(mouseX, mouseY, x, y);
    if (d < fixedSize && d < closestDist) {
      closestDist = d;
      hoveredVolcano = {
        name,
        type,
        x,
        y,
        size: fixedSize,
        elev: row.get("Elevation") || "Unknown",
        location: row.get("Location") || "Unknown",
        country: row.get("Country") || "Unknown",
        lastEruption: row.get("Last Known Eruption") || "Unknown"
      };
    }
  }

  // Disegna i glifi
  for (let r = 0; r < volcanoData.getRowCount(); r++) {
    let row = volcanoData.getRow(r);
    let lat = float(row.get("Latitude"));
    let lon = float(row.get("Longitude"));
    let type = row.get("Type")?.toLowerCase();
    let name = row.get("Volcano Name") || "Unknown";
    let category = typeCategoryMap[type] || "Other";

    if (activeType && category !== activeType) continue;

    let x = map(lon, -180, 180, mapX, mapX + mapW);
    let y = map(lat, 90, -90, mapY, mapY + mapH);
    let c = glyphColors[type] || color(200);

    // Hover
    if (hoveredVolcano && hoveredVolcano.name === name) {
      c = color(min(red(c) + 80, 255), min(green(c) + 80, 255), min(blue(c) + 80, 255));
      stroke(255);
      strokeWeight(2);
    } else {
      noStroke();
    }

    fill(c);
    drawGlyph(x, y, fixedSize, type);
  }

  if (hoveredVolcano) drawTooltip(hoveredVolcano);
}

// === GLYPHS PER OGNI TIPO ===
function drawGlyph(x, y, size, type) {
  push();
  translate(x, y);
  noStroke();
  let t = type?.toLowerCase() || "unknown";

  switch (t) {
    case "stratovolcano":
      triangle(-size / 2, size / 2, size / 2, size / 2, 0, -size / 2);
      break;

    case "shield":
    case "shield volcano":
      ellipse(0, 0, size, size * 0.6);
      break;

    case "caldera":
      ellipse(0, 0, size, size);
      fill(25, 30, 102);
      ellipse(0, 0, size * 0.5, size * 0.5);
      break;

    case "lava dome":
    case "lava domes":
      beginShape();
      vertex(-size / 2, size / 2);
      vertex(size / 2, size / 2);
      quadraticVertex(0, -size / 3, -size / 2, size / 2);
      endShape(CLOSE);
      break;

    case "cinder cone":
    case "scoria cone":
      triangle(-size / 2, size / 2, size / 2, size / 2, 0, -size * 0.7);
      break;

    case "maar":
      stroke(255);
      strokeWeight(2);
      noFill();
      ellipse(0, 0, size, size);
      ellipse(0, 0, size * 0.6, size * 0.6);
      break;

    case "complex":
    case "complex volcano":
      triangle(-size / 2, size / 2, size / 2, size / 2, 0, -size / 2);
      triangle(-size / 3, size / 2, size / 3, size / 2, 0, -size / 4);
      break;

    case "submarine volcano":
      ellipse(0, 0, size, size);
      stroke(255);
      strokeWeight(2);
      noFill();
      for (let i = -1; i <= 1; i++) {
        arc(0, i * 3, size * 0.8, size * 0.4, 0, PI);
      }
      break;

    case "fissure vent":
      stroke(255);
      strokeWeight(3);
      line(-size / 2, 0, size / 2, 0);
      break;

    case "pyroclastic cone":
      triangle(-size / 3, size / 3, size / 3, size / 3, 0, -size / 2);
      break;

    case "tuff cone":
      ellipse(0, 0, size, size);
      fill(25, 30, 102);
      triangle(-size * 0.3, size * 0.2, size * 0.3, size * 0.2, 0, -size * 0.3);
      break;

    case "tuff ring":
      noFill();
      stroke(255);
      strokeWeight(2);
      ellipse(0, 0, size, size);
      ellipse(0, 0, size * 0.7, size * 0.7);
      break;

    case "volcanic field":
      for (let i = 0; i < 5; i++) {
        ellipse(cos((TWO_PI / 5) * i) * (size * 0.4), sin((TWO_PI / 5) * i) * (size * 0.4), size * 0.3, size * 0.3);
      }
      break;

    case "hydrothermal field":
      noFill();
      stroke(255);
      strokeWeight(2);
      for (let i = -1; i <= 1; i++) {
        bezier(-size * 0.2, i * 3, -size * 0.1, i * 8, size * 0.1, i * 8, size * 0.2, i * 3);
      }
      break;

    case "cone":
      triangle(-size / 2, size / 2, size / 2, size / 2, 0, -size * 0.5);
      break;

    default:
      ellipse(0, 0, size, size);
      break;
  }

  pop();
}

// === TOOLTIP ===
function drawTooltip(volcano) {
  push();
  textFont(fontSans);
  textSize(12);
  let padding = 8;
  let eruptionCode = volcano.lastEruption.trim();
  let eruptionText = eruptionCodes[eruptionCode] || eruptionCode;

  let txtLines = [
    `${volcano.name}`,
    `Type: ${volcano.type}`,
    `Elevation: ${volcano.elev} m`,
    `Location: ${volcano.location}`,
    `Country: ${volcano.country}`,
    `Last Eruption: ${eruptionText}`
  ];

  textAlign(LEFT, TOP);
  let tw = 0;
  for (let t of txtLines) tw = max(tw, textWidth(t));
  tw += padding * 2;
  let th = txtLines.length * 16 + padding * 2;

  let tx = volcano.x + 12;
  let ty = volcano.y - th - 12;
  if (tx + tw > width - 8) tx = volcano.x - tw - 12;
  if (ty < 8) ty = volcano.y + 12;

  fill(255, 250, 240, 240);
  stroke(180);
  rect(tx, ty, tw, th, 6);

  noStroke();
  fill(20);
  for (let i = 0; i < txtLines.length; i++) {
    text(txtLines[i], tx + padding, ty + padding + i * 16);
  }
  pop();
}

// === TYPE BAR ===
let typeBarDiv;
let typeButtons = [];

function createTypeBar() {
  if (typeBarDiv) typeBarDiv.remove();
  typeBarDiv = createDiv();
  typeBarDiv.position(0, 0);
  typeBarDiv.size(windowWidth, 40);
  typeBarDiv.style('overflow-x', 'auto');
  typeBarDiv.style('white-space', 'nowrap');
  typeBarDiv.style('background-color', '#0b1d4c');
  typeBarDiv.style('padding', '5px 10px');
  typeBarDiv.style('box-sizing', 'border-box');

  let categoriesWithAll = ["All", ...volcanoTypes];
  typeButtons = [];

  for (let cat of categoriesWithAll) {
    let btn = createDiv(cat);
    btn.parent(typeBarDiv);
    btn.style('display', 'inline-block');
    btn.style('padding', '6px 14px');
    btn.style('margin-right', '8px');
    btn.style('cursor', 'pointer');
    btn.style('color', '#fff');
    btn.style('font-family', 'Montserrat, Helvetica, sans-serif');
    btn.style('font-size', '14px');
    btn.style('border-radius', '6px');
    btn.style('transition', '0.2s');
    btn.style('background-color', 'transparent');

    btn.mouseOver(() => btn.style('background-color', '#1a3b7c'));
    btn.mouseOut(() => updateTypeBarHighlight());
    btn.mousePressed(() => {
      activeType = cat === "All" ? null : cat;
      updateTypeBarHighlight();
    });

    typeButtons.push({ btn, type: cat });
  }

  updateTypeBarHighlight();
}

function updateTypeBarHighlight() {
  for (let obj of typeButtons) {
    if ((activeType === null && obj.type === "All") || obj.type === activeType) {
      obj.btn.style('background-color', '#1a3b7c');
    } else {
      obj.btn.style('background-color', 'transparent');
    }
  }
}

// === COLORI PER TIPO ===
function assignGlyphColors(typeList) {
  colorMode(HSB);
  for (let i = 0; i < typeList.length; i++) {
    let t = typeList[i];
    glyphColors[t] = color(map(i, 0, typeList.length, 0, 360), 80, 90);
  }
  colorMode(RGB);
}

// === WINDOW RESIZE ===
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  typeBarDiv.size(windowWidth, 40);
}

// === LEGEND BOX ===
function drawLegendBox() {}
