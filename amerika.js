let leafletMap; // Globale Referenz für die Karte

document.addEventListener("DOMContentLoaded", () => {
  applyBackgroundFromLocalStorage();
  initTimer();
  initMap();
  initKartogrammWithD3();
  setupInteractiveElements();
});

// Hintergrundbilder aus Local Storage anwenden
function applyBackgroundFromLocalStorage() {
  const backgroundData = JSON.parse(
    localStorage.getItem("continentBackground")
  );
  if (backgroundData) {
    document.body.style.backgroundImage =
      "url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')";
    document.body.style.backgroundPosition = backgroundData.position;
    document.body.style.backgroundSize = backgroundData.size;
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.backgroundColor = "#f0f0f0"; // Fallback-Hintergrundfarbe
  }
}

// Timer initialisieren
function initTimer() {
  let countdown = 30;
  const timerElement = document.getElementById("timer");
  if (timerElement) {
    timerElement.textContent = `${countdown}s`;

    const interval = setInterval(() => {
      countdown--;
      timerElement.textContent = `${countdown}s`;

      if (countdown === 0) {
        clearInterval(interval);
        timerElement.textContent = "Zeit abgelaufen!";
      }
    }, 1000);
  }
}

// Leaflet-Karte initialisieren
function initMap() {
  if (leafletMap) return; // Verhindere doppelte Initialisierung

  leafletMap = L.map("map", {
    zoomControl: true,
    scrollWheelZoom: true,
    dragging: true,
    doubleClickZoom: true,
    touchZoom: true,
  }).setView([15, -70], 2); // Amerika-Zentrierung

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "",
  }).addTo(leafletMap);
}

// Länder und Regionen in Amerika
const countries = [
  {
    name: "USA",
    lat: 37.0902,
    lng: -95.7129,
    size: 50,
    color: "red",
    regions: [
      { name: "New York", lat: 40.7128, lng: -74.006 },
      { name: "Los Angeles", lat: 34.0522, lng: -118.2437 },
      { name: "Chicago", lat: 41.8781, lng: -87.6298 },
    ],
  },
  {
    name: "Kanada",
    lat: 56.1304,
    lng: -106.3468,
    size: 45,
    color: "blue",
    regions: [
      { name: "Toronto", lat: 43.65107, lng: -79.347015 },
      { name: "Vancouver", lat: 49.2827, lng: -123.1207 },
      { name: "Montreal", lat: 45.5017, lng: -73.5673 },
    ],
  },
  {
    name: "Brasilien",
    lat: -14.235,
    lng: -51.9253,
    size: 40,
    color: "green",
    regions: [
      { name: "São Paulo", lat: -23.5505, lng: -46.6333 },
      { name: "Rio de Janeiro", lat: -22.9068, lng: -43.1729 },
      { name: "Brasília", lat: -15.8267, lng: -47.9218 },
    ],
  },
  {
    name: "Mexiko",
    lat: 23.6345,
    lng: -102.5528,
    size: 35,
    color: "orange",
    regions: [
      { name: "Mexiko-Stadt", lat: 19.4326, lng: -99.1332 },
      { name: "Guadalajara", lat: 20.6597, lng: -103.3496 },
      { name: "Monterrey", lat: 25.6866, lng: -100.3161 },
    ],
  },
  {
    name: "Argentinien",
    lat: -38.4161,
    lng: -63.6167,
    size: 50,
    color: "purple",
    regions: [
      { name: "Buenos Aires", lat: -34.6037, lng: -58.3816 },
      { name: "Córdoba", lat: -31.4201, lng: -64.1888 },
      { name: "Rosario", lat: -32.9442, lng: -60.6505 },
    ],
  },
  {
    name: "Chile",
    lat: -35.6751,
    lng: -71.543,
    size: 30,
    color: "yellow",
    regions: [
      { name: "Santiago", lat: -33.4489, lng: -70.6693 },
      { name: "Valparaíso", lat: -33.0472, lng: -71.6127 },
      { name: "Concepción", lat: -36.8201, lng: -73.0444 },
    ],
  },
];

// SVG-Kartogramme mit D3 hinzufügen
function initKartogrammWithD3() {
  const svg = d3
    .select(leafletMap.getPanes().overlayPane)
    .append("svg")
    .attr("id", "kartogramme")
    .style("position", "absolute")
    .style("pointer-events", "auto");

  function updateKartogrammePositions() {
    const bounds = leafletMap.getBounds();
    const topLeft = leafletMap.latLngToLayerPoint(bounds.getNorthWest());
    const bottomRight = leafletMap.latLngToLayerPoint(bounds.getSouthEast());

    svg
      .style("left", `${topLeft.x}px`)
      .style("top", `${topLeft.y}px`)
      .attr("width", bottomRight.x - topLeft.x)
      .attr("height", bottomRight.y - topLeft.y);

    const circles = svg.selectAll("circle.country").data(countries);

    circles
      .enter()
      .append("circle")
      .attr("class", "country")
      .merge(circles)
      .attr(
        "cx",
        (d) => leafletMap.latLngToLayerPoint([d.lat, d.lng]).x - topLeft.x
      )
      .attr(
        "cy",
        (d) => leafletMap.latLngToLayerPoint([d.lat, d.lng]).y - topLeft.y
      )
      .attr("r", (d) => d.size)
      .attr("fill", (d) => d.color)
      .style("stroke", "#fff")
      .style("stroke-width", 1)
      .on("mouseenter", (event, d) => showTooltip(event, d))
      .on("mouseleave", hideTooltip)
      .on("click", (event, d) => showRegions(event, d));

    circles.exit().remove();
  }

  function showRegions(event, country) {
    const regionCircles = svg.selectAll("circle.region").data(country.regions);

    regionCircles
      .enter()
      .append("circle")
      .attr("class", "region")
      .merge(regionCircles)
      .attr(
        "cx",
        (region) =>
          leafletMap.latLngToLayerPoint([region.lat, region.lng]).x -
          leafletMap.latLngToLayerPoint(leafletMap.getBounds().getNorthWest()).x
      )
      .attr(
        "cy",
        (region) =>
          leafletMap.latLngToLayerPoint([region.lat, region.lng]).y -
          leafletMap.latLngToLayerPoint(leafletMap.getBounds().getNorthWest()).y
      )
      .attr("r", 10)
      .attr("fill", "#888")
      .style("stroke", "#000")
      .style("stroke-width", 1)
      .on("mouseenter", (event, region) => showRegionTooltip(event, region))
      .on("mouseleave", hideTooltip);

    regionCircles.exit().remove();
  }

  function showTooltip(event, d) {
    d3.select("body")
      .append("div")
      .attr("id", "tooltip")
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.7)")
      .style("color", "#fff")
      .style("padding", "5px")
      .style("border-radius", "5px")
      .style("pointer-events", "none")
      .style("top", `${event.pageY}px`)
      .style("left", `${event.pageX}px`)
      .text(`${d.name}: Größe ${d.size}`);
  }

  function showRegionTooltip(event, region) {
    d3.select("body")
      .append("div")
      .attr("id", "tooltip")
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.7)")
      .style("color", "#fff")
      .style("padding", "5px")
      .style("border-radius", "5px")
      .style("pointer-events", "none")
      .style("top", `${event.pageY}px`)
      .style("left", `${event.pageX}px`)
      .text(region.name);
  }

  function hideTooltip() {
    d3.select("#tooltip").remove();
  }

  leafletMap.on("zoomend moveend", updateKartogrammePositions);
  updateKartogrammePositions();
}

// Interaktive Elemente initialisieren
function setupInteractiveElements() {
  const randomMessageButton = document.getElementById("random-message-button");
  const messageElement = document.getElementById("message");
  const resetButton = document.getElementById("reset-button");

  if (randomMessageButton && messageElement) {
    randomMessageButton.addEventListener("click", () => {
      const messages = [
        "Willkommen in Nord- und Südamerika!",
        "Brasilien hat den größten Regenwald der Welt!",
        "Kanada ist das zweitgrößte Land der Erde!",
        "Die USA haben 50 Bundesstaaten!",
      ];
      const randomMessage =
        messages[Math.floor(Math.random() * messages.length)];
      messageElement.textContent = randomMessage;
    });
  }

  if (resetButton) {
    resetButton.addEventListener("click", () => {
      leafletMap.setView([15, -70], 2); // Zurück zur Amerika-Ansicht
    });
  }
}
