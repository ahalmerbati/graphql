// maps a value from one numeric range into another (used for x/y coordinates)
function scale(value, oldMin, oldMax, newMin, newMax) {
  const newValue =
    ((value - oldMin) / (oldMax - oldMin)) * (newMax - newMin) + newMin;
  return newValue;
}

// converts cumulative xp data into {x, y} pixel coordinates for the graph
function xpToCoordinates(data, width, height) {
  const first = data[0];
  const last = data[data.length - 1];

  const minDate = new Date(first.date).getTime();
  const maxDate = new Date(last.date).getTime();

  const minXP = 0;
  const maxXP = last.total;

  return data.map((entry) => {
    const x = scale(new Date(entry.date).getTime(), minDate, maxDate, 0, width);
    const y = scale(entry.total, minXP, maxXP, height, 0);
    return { x, y };
  });
}

// turns an array of {x, y} points into a "x,y x,y" string for svg
function pointsToString(coordinates) {
  return coordinates
    .map((point) => {
      return point.x + "," + point.y;
    })
    .join(" ");
}

// builds an svg line graph string from a set of coordinates
function buildXPGraph(coordinates, maxXP, startDate, endDate) {
  const points = pointsToString(coordinates);
  return `<svg viewBox="0 0 1000 320" width="100%" height="300" preserveAspectRatio="none">
    <line x1="0" y1="70" x2="1000" y2="70" stroke="#3a3d44" stroke-width="1" />
    <line x1="0" y1="140" x2="1000" y2="140" stroke="#3a3d44" stroke-width="1" />
    <line x1="0" y1="210" x2="1000" y2="210" stroke="#3a3d44" stroke-width="1" />
    <text x="1000" y="45" fill="#e0e0e0" font-size="24" text-anchor="end">${maxXP.toLocaleString()}</text>
    <text x="30" y="190" fill="#e0e0e0" font-size="24">0</text>
    <text x="10" y="308" fill="#5fa8d3" font-size="28">${startDate}</text>
    <text x="990" y="308" fill="#5fa8d3" font-size="28" text-anchor="end">${endDate}</text>
    <polyline points="${points}" fill="none" stroke="#00ff66" stroke-width="2" />
  </svg>`;
}

// builds an svg line graph showing pass vs fail counts
function buildPassFailGraph(counts) {
  const maxCount = Math.max(counts.pass, counts.fail);
  const passHeight = scale(counts.pass, 0, maxCount, 0, 220);
  const failHeight = scale(counts.fail, 0, maxCount, 0, 220);

  const passY = 260 - passHeight;
  const failY = 260 - failHeight;

  return `<svg viewBox="0 0 1000 320" width="100%" height="300" preserveAspectRatio="none">
    <line x1="0" y1="55" x2="1000" y2="55" stroke="#3a3d44" stroke-width="1" />
    <line x1="0" y1="115" x2="1000" y2="115" stroke="#3a3d44" stroke-width="1" />
    <line x1="0" y1="175" x2="1000" y2="175" stroke="#3a3d44" stroke-width="1" />
    <line x1="0" y1="260" x2="1000" y2="260" stroke="#3a3d44" stroke-width="1" />
    <rect x="200" y="${passY}" width="200" height="${passHeight}" fill="#00ff66" />
    <rect x="600" y="${failY}" width="200" height="${failHeight}" fill="#ffb000" />
    <text x="300" y="${passY - 15}" fill="#e0e0e0" font-size="28" text-anchor="middle">${counts.pass}</text>
    <text x="700" y="${failY - 15}" fill="#e0e0e0" font-size="28" text-anchor="middle">${counts.fail}</text>
    <text x="300" y="290" fill="#5fa8d3" font-size="30" text-anchor="middle">PASS</text>
    <text x="700" y="290" fill="#5fa8d3" font-size="30" text-anchor="middle">FAIL</text>
  </svg>`;
}
