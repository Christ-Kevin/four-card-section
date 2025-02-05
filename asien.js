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
  }).setView([30, 105], 3); // Asien-Zentrierung (inkl. Ozeanien)

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "",
  }).addTo(leafletMap);
}

// SVG-Kartogramme mit D3 hinzufügen
function initKartogrammWithD3() {
  const countries = [
    {
      name: "China",
      lat: 35.8617,
      lng: 104.1954,
      size: 50,
      color: "red",
      regions: [
        { name: "Peking", lat: 39.9042, lng: 116.4074 },
        { name: "Shanghai", lat: 31.2304, lng: 121.4737 },
      ],
    },
    {
      name: "Indien",
      lat: 20.5937,
      lng: 78.9629,
      size: 45,
      color: "blue",
      regions: [
        { name: "Delhi", lat: 28.6139, lng: 77.209 },
        { name: "Mumbai", lat: 19.076, lng: 72.8777 },
      ],
    },
    {
      name: "Australien",
      lat: -25.2744,
      lng: 133.7751,
      size: 40,
      color: "green",
      regions: [
        { name: "Sydney", lat: -33.8688, lng: 151.2093 },
        { name: "Melbourne", lat: -37.8136, lng: 144.9631 },
      ],
    },
    {
      name: "Japan",
      lat: 36.2048,
      lng: 138.2529,
      size: 35,
      color: "orange",
      regions: [
        { name: "Tokyo", lat: 35.6895, lng: 139.6917 },
        { name: "Osaka", lat: 34.6937, lng: 135.5023 },
      ],
    },
    {
      name: "Indonesien",
      lat: -0.7893,
      lng: 113.9213,
      size: 50,
      color: "purple",
      regions: [
        { name: "Jakarta", lat: -6.2088, lng: 106.8456 },
        { name: "Bali", lat: -8.3405, lng: 115.092 },
      ],
    },
    {
      name: "Neuseeland",
      lat: -40.9006,
      lng: 174.886,
      size: 30,
      color: "yellow",
      regions: [
        { name: "Auckland", lat: -36.8485, lng: 174.7633 },
        { name: "Wellington", lat: -41.2867, lng: 174.7762 },
      ],
    },
  ];

  const svg = d3
    .select(leafletMap.getPanes().overlayPane)
    .append("svg")
    .attr("id", "kartogramme")
    .style("position", "absolute")
    .style("pointer-events", "none"); // SVG nicht interaktiv machen

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
        leafletMap.setView([30, 105], 3); // Zurück zur Asien/Ozeanien-Ansicht
      }
    });
  }
}
