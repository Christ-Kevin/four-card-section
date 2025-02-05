// Leaflet-Karte initialisieren
const map = L.map("map").setView([0, 20], 3);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Daten für sechs afrikanische Länder
const kartogrammeDaten = [
  { name: "Nigeria", coordinates: [9.082, 8.6753], color: "red", size: 30 },
  {
    name: "Kenia",
    coordinates: [-1.286389, 36.817223],
    color: "blue",
    size: 25,
  },
  {
    name: "Südafrika",
    coordinates: [-30.5595, 22.9375],
    color: "green",
    size: 35,
  },
  {
    name: "Ägypten",
    coordinates: [26.8206, 30.8025],
    color: "orange",
    size: 30,
  },
  { name: "Ghana", coordinates: [7.9465, -1.0232], color: "purple", size: 20 },
  {
    name: "Äthiopien",
    coordinates: [9.145, 40.489673],
    color: "brown",
    size: 25,
  },
];

// SVG für Kartogramme erstellen
const svg = d3.select("#kartogramme");
const g = svg.append("g");

// Funktion zum Rendern der Kartogramme
function renderKartogramme() {
  const bounds = map.getBounds();
  const topLeft = map.latLngToLayerPoint(bounds.getNorthWest());
  const bottomRight = map.latLngToLayerPoint(bounds.getSouthEast());

  // Aktualisiere SVG-Größe
  svg.style("left", `${topLeft.x}px`).style("top", `${topLeft.y}px`);
  svg.attr("width", bottomRight.x - topLeft.x);
  svg.attr("height", bottomRight.y - topLeft.y);

  // Rendern der Kartogramme
  const circles = g.selectAll("circle").data(kartogrammeDaten);

  // Hinzufügen neuer Kreise
  circles
    .enter()
    .append("circle")
    .merge(circles) // Bestehende Kreise aktualisieren
    .attr("cx", (d) => map.latLngToLayerPoint(d.coordinates).x)
    .attr("cy", (d) => map.latLngToLayerPoint(d.coordinates).y)
    .attr("r", (d) => d.size)
    .attr("fill", (d) => d.color)
    .attr("stroke", "black")
    .attr("stroke-width", 1);

  // Entferne nicht benötigte Kreise
  circles.exit().remove();
}

// Initiales Rendern
renderKartogramme();

// Bei Kartenbewegungen und Zoom neu rendern
map.on("move", renderKartogramme);
map.on("zoom", renderKartogramme);
