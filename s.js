document.addEventListener("DOMContentLoaded", () => {
  // Initialisiere die Leaflet-Karte
  const map = L.map("map", {
    zoomControl: true,
    attributionControl: true,
  }).setView([20, 0], 2);

  // Tile-Layer (OSM)
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // SVG-Overlay für Kartogramme
  const svg = d3.select("#kartogramme");
  const g = svg.append("g");

  // Beispielkartogramm-Daten (Geo-Koordinaten)
  const kartogrammeDaten = [
    {
      name: "Nigeria",
      coordinates: [9.082, 8.6753],
      color: "rgba(255, 0, 0, 0.5)",
    },
    {
      name: "Germany",
      coordinates: [51.1657, 10.4515],
      color: "rgba(0, 0, 255, 0.5)",
    },
  ];

  // Funktion: Kartogramme zeichnen
  function renderKartogramme() {
    g.selectAll("circle")
      .data(kartogrammeDaten)
      .join("circle")
      .attr("cx", (d) => map.latLngToLayerPoint(d.coordinates).x)
      .attr("cy", (d) => map.latLngToLayerPoint(d.coordinates).y)
      .attr("r", 20) // Beispielradius
      .attr("fill", (d) => d.color)
      .attr("stroke", "black")
      .attr("stroke-width", 1);
  }

  // Kartenbewegung synchronisieren
  map.on("move", () => {
    renderKartogramme();
  });

  // Initiale Kartogramme zeichnen
  renderKartogramme();
});
