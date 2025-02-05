document.addEventListener("DOMContentLoaded", () => {
  // Auslesen der gespeicherten Daten
  const backgroundData = JSON.parse(
    localStorage.getItem("continentBackground")
  );

  // Anwenden der Hintergrunddaten, falls vorhanden
  if (backgroundData) {
    document.body.style.backgroundImage =
      "url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')";
    document.body.style.backgroundPosition = backgroundData.position;
    document.body.style.backgroundSize = backgroundData.size;
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.backgroundColor = "#f0f0f0"; // Fallback-Hintergrundfarbe
  }
});
