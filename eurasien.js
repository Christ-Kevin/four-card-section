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
    zoomControl: false,
    scrollWheelZoom: false,
    dragging: false,
    doubleClickZoom: false,
    touchZoom: false,
  }).setView([50, 90], 3); // Eurasien im Mittelpunkt
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "",
  }).addTo(leafletMap);
}

// Daten der Länder und Regionen in Eurasien
const countries = [
  {
    name: "Russland",
    lat: 61.524,
    lng: 105.3188,
    size: 50,
    color: "red",
    regions: [
      { name: "Moskau", lat: 55.7558, lng: 37.6173 },
      { name: "Sankt Petersburg", lat: 59.9343, lng: 30.3351 },
      { name: "Wladiwostok", lat: 43.115, lng: 131.885 },
    ],
  },
  {
    name: "China",
    lat: 35.8617,
    lng: 104.1954,
    size: 45,
    color: "blue",
    regions: [
      { name: "Peking", lat: 39.9042, lng: 116.4074 },
      { name: "Shanghai", lat: 31.2304, lng: 121.4737 },
      { name: "Guangzhou", lat: 23.1291, lng: 113.2644 },
    ],
  },
  {
    name: "Deutschland",
    lat: 51.1657,
    lng: 10.4515,
    size: 35,
    color: "green",
    regions: [
      { name: "Berlin", lat: 52.52, lng: 13.405 },
      { name: "München", lat: 48.1351, lng: 11.582 },
      { name: "Hamburg", lat: 53.5511, lng: 9.9937 },
    ],
  },
  {
    name: "Indien",
    lat: 20.5937,
    lng: 78.9629,
    size: 40,
    color: "orange",
    regions: [
      { name: "Delhi", lat: 28.6139, lng: 77.209 },
      { name: "Mumbai", lat: 19.076, lng: 72.8777 },
      { name: "Bangalore", lat: 12.9716, lng: 77.5946 },
    ],
  },
  {
    name: "Türkei",
    lat: 38.9637,
    lng: 35.2433,
    size: 30,
    color: "purple",
    regions: [
      { name: "Istanbul", lat: 41.0082, lng: 28.9784 },
      { name: "Ankara", lat: 39.9334, lng: 32.8597 },
      { name: "Izmir", lat: 38.4192, lng: 27.1287 },
    ],
  },
  {
    name: "Japan",
    lat: 36.2048,
    lng: 138.2529,
    size: 25,
    color: "yellow",
    regions: [
      { name: "Tokio", lat: 35.6895, lng: 139.6917 },
      { name: "Osaka", lat: 34.6937, lng: 135.5023 },
      { name: "Hiroshima", lat: 34.3853, lng: 132.4553 },
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
  const resetButton = document.getElementById("reset-button");

  if (resetButton) {
    resetButton.addEventListener("click", () => {
      if (leafletMap) {
        leafletMap.setView([50, 90], 3);
      }
    });
  }
}
