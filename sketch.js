let timeZoneSelect;
let themeSelect;
let modeSelect;
let customFont;
let currentTheme;

let themes;
let isDarkMode;

function preload() {
  // Load the custom font
  customFont = loadFont('font/PPMondwest-Bold.otf');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);

  // Detect system dark mode preference
  isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Initialize themes with proper dark/light mode handling
  themes = {
    'Green': {
      dark: { bg: color(0, 50, 0), fg: color(0, 255, 9) },
      light: { bg: color(200, 255, 200), fg: color(0, 100, 0) }
    },
    'Pink': {
      dark: { bg: color(100, 0, 50), fg: color(255, 0, 157) },
      light: { bg: color(255, 200, 225), fg: color(150, 0, 75) }
    },
    'Salmon': {
      dark: { bg: color(120, 50, 40), fg: color(240, 106, 91) },
      light: { bg: color(255, 200, 190), fg: color(150, 70, 60) }
    },
    'Blue': {
      dark: { bg: color(0, 0, 100), fg: color(0, 0, 255) },
      light: { bg: color(200, 220, 255), fg: color(50, 50, 150) }
    },
    'B&W': {
      dark: { bg: color(0), fg: color(255) },
      light: { bg: color(255), fg: color(0) }
    }
  };

  // Create dropdown for time zones
  timeZoneSelect = createSelect();
  timeZoneSelect.option('Local Time');
  timeZoneSelect.option('Europe/Rome');
  timeZoneSelect.option('UTC');
  timeZoneSelect.option('America/New_York');
  timeZoneSelect.option('Asia/Tokyo');
  timeZoneSelect.option('Australia/Sydney');
  timeZoneSelect.changed(() => redraw());

  // Create dropdown for themes
  themeSelect = createSelect();
  for (let themeKey in themes) {
    themeSelect.option(themeKey);
  }
  themeSelect.changed(() => {
    applyTheme();
    redraw();
  });

  // Create dropdown for Dark/Light mode
  modeSelect = createSelect();
  modeSelect.option('Dark Mode');
  modeSelect.option('Light Mode');
  modeSelect.changed(() => {
    isDarkMode = modeSelect.value() === 'Dark Mode';
    applyTheme();
    redraw();
  });

  // Initialize mode and theme
  modeSelect.value(isDarkMode ? 'Dark Mode' : 'Light Mode');
  themeSelect.value('Green');
  applyTheme();

  updateDropdownPosition();
}

function draw() {
  background(currentTheme.bg);

  translate(width / 2, height / 2);

  let clockDiameter = min(width, height) * 0.7;

  // Get the selected timezone
  let selectedTimeZone = timeZoneSelect.value();
  let now = new Date();

  if (selectedTimeZone !== 'Local Time') {
    // Convert local time to selected timezone
    let options = { timeZone: selectedTimeZone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    let timeParts = new Intl.DateTimeFormat('en-US', options).formatToParts(now);
    let hr = parseInt(timeParts.find(part => part.type === 'hour').value, 10);
    let mn = parseInt(timeParts.find(part => part.type === 'minute').value, 10);
    let sc = parseInt(timeParts.find(part => part.type === 'second').value, 10);

    now.setHours(hr, mn, sc);
  }

  let hr = now.getHours() % 12;
  let mn = now.getMinutes();
  let sc = now.getSeconds();

  let rotationAngle = -map(hr + mn / 60, 0, 12, 0, 360);
  let minuteRotationAngle = -map(mn, 0, 60, 0, 360);
  let secondRotationAngle = -map(sc, 0, 60, 0, 360);

  // Draw static clock hands pointing at 12:00
  stroke(currentTheme.fg);
  line(0, 0, 0, -clockDiameter * 0.18);
  line(0, 0, 0, -clockDiameter * 0.35);

  push();
  rotate(rotationAngle);

  textFont(customFont);
  textSize(clockDiameter * 0.1);
  textAlign(CENTER, CENTER);
  fill(currentTheme.fg);
  noStroke();

  // Draw hour numbers
  for (let i = 1; i <= 12; i++) {
    let angle = map(i, 0, 12, 0, 360);
    let x = (clockDiameter * 0.4) * cos(angle - 90);
    let y = (clockDiameter * 0.4) * sin(angle - 90);
    text(i, x, y);
  }

  pop();
  push();
  rotate(minuteRotationAngle);

  // Draw minute numbers
  textSize(clockDiameter * 0.04); // 1/3 size of the hour numbers
  textFont(customFont);
  textAlign(CENTER, CENTER);
  fill(currentTheme.fg);
  noStroke();
  for (let i = 1; i <= 60; i++) {
    let angle = map(i, 0, 60, 0, 360);
    let x = (clockDiameter * 0.5) * cos(angle - 90);
    let y = (clockDiameter * 0.5) * sin(angle - 90);
    text(i, x, y);
  }

  pop();

  push();
  rotate(secondRotationAngle);

  // Draw second numbers
  textSize(clockDiameter * 0.025); // Slightly smaller than minute numbers
  textFont(customFont);
  textAlign(CENTER, CENTER);
  fill(currentTheme.fg);
  noStroke();
  for (let i = 1; i <= 60; i++) {
    let angle = map(i, 0, 60, 0, 360);
    let x = (clockDiameter * 0.56) * cos(angle - 90);
    let y = (clockDiameter * 0.56) * sin(angle - 90);
    text(i, x, y);
  }

  pop();
}

function keyPressed() {
  if (key === 'P' || key === 'p') {
    saveCanvas('clock_' + nf(year(), 4) + nf(month(), 2) + nf(day(), 2) + '_' + nf(hour(), 2) + nf(minute(), 2) + nf(second(), 2), 'png');
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateDropdownPosition();
  redraw();
}

function updateDropdownPosition() {
  timeZoneSelect.position(width / 2 - 160, height / 2 + min(width, height) * 0.5 + 20);
  themeSelect.position(width / 2 - 30, height / 2 + min(width, height) * 0.5 + 20);
  modeSelect.position(width / 2 + 100, height / 2 + min(width, height) * 0.5 + 20);
}

function applyTheme() {
  let selectedTheme = themeSelect.value();
  currentTheme = isDarkMode ? themes[selectedTheme].dark : themes[selectedTheme].light;
}
