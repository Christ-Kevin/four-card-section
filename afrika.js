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
  }).setView([0, 20], 3); // Afrika im Mittelpunkt

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "",
  }).addTo(leafletMap);
}

// Daten der Länder und Regionen
const countries = [
  {
    name: "Nigeria",
    lat: 9.082,
    lng: 8.6753,
    size: 40,
    color: "red",
    regions: [
      { name: "Lagos", lat: 6.5244, lng: 3.3792 },
      { name: "Abuja", lat: 9.0579, lng: 7.4951 },
      { name: "Kano", lat: 12.0022, lng: 8.5919 },
    ],
  },
  {
    name: "Ägypten",
    lat: 26.8206,
    lng: 30.8025,
    size: 35,
    color: "blue",
    regions: [
      { name: "Kairo", lat: 30.0444, lng: 31.2357 },
      { name: "Alexandria", lat: 31.2001, lng: 29.9187 },
      { name: "Gizeh", lat: 30.0131, lng: 31.2089 },
    ],
  },
  {
    name: "Südafrika",
    lat: -30.5595,
    lng: 22.9375,
    size: 45,
    color: "green",
    regions: [
      { name: "Kapstadt", lat: -33.9249, lng: 18.4241 },
      { name: "Johannesburg", lat: -26.2041, lng: 28.0473 },
      { name: "Durban", lat: -29.8587, lng: 31.0218 },
    ],
  },
  {
    name: "Kenia",
    lat: -1.286389,
    lng: 36.817223,
    size: 30,
    color: "orange",
    regions: [
      { name: "Nairobi", lat: -1.286389, lng: 36.817223 },
      { name: "Mombasa", lat: -4.0435, lng: 39.6682 },
      { name: "Kisumu", lat: -0.0917, lng: 34.768 },
    ],
  },
  {
    name: "Algerien",
    lat: 28.0339,
    lng: 1.6596,
    size: 50,
    color: "purple",
    regions: [
      { name: "Algier", lat: 36.7372, lng: 3.0869 },
      { name: "Oran", lat: 35.6971, lng: -0.6308 },
      { name: "Constantine", lat: 36.365, lng: 6.6147 },
    ],
  },
  {
    name: "Ghana",
    lat: 7.9465,
    lng: -1.0232,
    size: 25,
    color: "yellow",
    regions: [
      { name: "Accra", lat: 5.6037, lng: -0.187 },
      { name: "Kumasi", lat: 6.6884, lng: -1.6244 },
      { name: "Tamale", lat: 9.4008, lng: -0.8393 },
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
    .style("pointer-events", "auto"); // SVG nicht interaktiv machen

  const projection = d3.geoTransform({
    point: function (lng, lat) {
      const point = leafletMap.latLngToLayerPoint(new L.LatLng(lat, lng));
      this.stream.point(point.x, point.y);
    },
  });

  const path = d3.geoPath().projection(projection);

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
      .style("stroke", "#fff") // Optional: Umrandung hinzufügen
      .style("stroke-width", 1)
      .on("mouseenter", (event, d) => showTooltip(event, d))
      .on("mouseleave", hideTooltip)
      .on("click", (event, d) => showRegions(event, d));

    circles.exit().remove();
  }

  function showTooltip(event, d) {
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("id", "tooltip")
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.7)")
      .style("color", "#fff")
      .style("padding", "5px")
      .style("border-radius", "5px")
      .style("pointer-events", "auto")
      .style("top", `${event.pageY}px`)
      .style("left", `${event.pageX}px`)
      .text(`${d.name}: Größe ${d.size}`);
  }

  function hideTooltip() {
    d3.select("#tooltip").remove();
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
      .on("mouseleave", hideTooltip)
      .on("click", (event, region) => handleRegionClick(event, region)); // Klick-Event

    regionCircles.exit().remove();
  }

  function handleRegionClick(event, region) {
    alert(`Du hast Walter in ${region.name} gefunden!`);
  }

  function showRegionTooltip(event, region) {
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("id", "tooltip")
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.7)")
      .style("color", "#fff")
      .style("padding", "5px")
      .style("border-radius", "5px")
      .style("pointer-events", "auto")
      .style("top", `${event.pageY}px`)
      .style("left", `${event.pageX}px`)
      .text(region.name);
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
        "Willkommen in Afrika!",
        "Wusstest du? Afrika hat 54 Länder.",
        "Such Walter in Ägypten oder Südafrika!",
        "Die Sahara ist die größte Wüste der Welt!",
      ];
      const randomMessage =
        messages[Math.floor(Math.random() * messages.length)];
      messageElement.textContent = randomMessage;
    });
  }

  if (resetButton) {
    resetButton.addEventListener("click", () => {
      leafletMap.setView([0, 20], 3); // Zurück zur Afrika-Ansicht
    });
  }
}
