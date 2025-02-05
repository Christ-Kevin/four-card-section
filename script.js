document.addEventListener("DOMContentLoaded", () => {
  // Utility-Funktion zum Erstellen eines Buttons
  const createButton = (text, styles = {}, onClick) => {
    const button = document.createElement("button");
    button.textContent = text;
    Object.assign(button.style, {
      padding: "10px 20px",
      backgroundColor: "#007BFF",
      color: "#fff",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      ...styles,
    });
    button.addEventListener("click", onClick);
    return button;
  };

  /*// Nachrichtenlogik
  const messages = [
    "Du hast Walter fast gefunden!",
    "Weiter so, du bist auf dem richtigen Weg!",
    "Walter ist ganz in der Nähe!",
    "Tipp: Schau nach historischen Städten!",
    "Toll, dass du weitermachst!",
  ];

  const showMessage = () => {
    const randomIndex = Math.floor(Math.random() * messages.length);
    message.textContent = messages[randomIndex];
  };

  // Button für zufällige Nachrichten
  const randomMessageButton = createButton("Klicke mich!", {}, showMessage);

  // Nachrichtenelement
  const message = document.createElement("p");
  Object.assign(message.style, {
    marginTop: "20px",
    fontFamily: "'Poppins', sans-serif",
    fontSize: "18px",
    color: "#333",
  }); */

  // Reset-Button
  const resetButton = createButton(
    "Zurück zur Weltkarte",
    { marginTop: "20px", backgroundColor: "#28a745" },
    () => {
      document.body.style.backgroundPosition = "center";
      document.body.style.backgroundSize = "200%";
    }
  );

  // Daten für Kontinente
  const continentData = {
    ".afrika": { url: "afrika.html", position: "50% 50%", size: "250%" },
    ".asien": { url: "asien.html", position: "90% 60%", size: "250%" },
    ".amerika": { url: "amerika.html", position: "10% 40%", size: "250%" },
    ".eurasien": { url: "eurasien.html", position: "70% 10%", size: "250%" },
  };

  // Event Listener für jede Kontinent-Section hinzufügen
  Object.entries(continentData).forEach(
    ([selector, { url, position, size }]) => {
      const section = document.querySelector(selector);
      if (section) {
        section.style.cursor = "pointer";
        section.addEventListener("click", () => {
          // Speichert Hintergrunddaten
          localStorage.setItem(
            "continentBackground",
            JSON.stringify({ position, size })
          );

          // Wechselt zur Zielseite
          window.location.href = url;
        });
      }
    }
  );

  // Hintergrunddaten aus LocalStorage abrufen
  const backgroundData = JSON.parse(
    localStorage.getItem("continentBackground")
  );
  if (backgroundData) {
    const { position, size } = backgroundData;
    document.body.style.backgroundPosition = position;
    document.body.style.backgroundSize = size;
  }

  // Elemente ins DOM einfügen
  const main = document.querySelector("main");
  if (main) {
    main.appendChild(randomMessageButton);
    main.appendChild(message);
    main.appendChild(resetButton);
  }
});
