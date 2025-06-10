// 🌐 Replace this with your actual Web App URL from Apps Script
const SHEET_URL = 'https://corsproxy.io/?https://script.google.com/macros/s/AKfycbyR2VU0C86kt1OCoCcYq0TZN5RrcvrdZ_YOt2WpUrj9Joh9T9uXJsoAV7-nhE0ah1qB/exec';

// Set up the map centered on Alaska
const map = L.map('map').setView([64.2008, -149.4937], 4);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Create the "Done" button
const doneButton = document.createElement("button");
doneButton.textContent = "Done";
doneButton.style.display = "none";
doneButton.style.position = "absolute";
doneButton.style.top = "80px";
doneButton.style.left = "calc(50% - 40px)";
doneButton.style.zIndex = "1000";
doneButton.style.padding = "10px 20px";
doneButton.style.borderRadius = "8px";
doneButton.style.border = "none";
doneButton.style.backgroundColor = "#28a745";
doneButton.style.color = "white";
doneButton.style.cursor = "pointer";
document.body.appendChild(doneButton);

// Add Pin button logic
document.getElementById('addPinBtn').addEventListener('click', () => {
  const name = prompt("What's your name?");
  const location = prompt("What's your location?");
  
  if (!name || !location) {
    alert("Please provide both your name and location.");
    return;
  }

  alert("Now click on the map to place your pin. You can drag it to adjust, then click 'Done'.");

  const clickHandler = (event) => {
    const { lat, lng } = event.latlng;
    const label = `${name} - ${location}`;

    const tempMarker = L.marker([lat, lng], { draggable: true }).addTo(map);
    tempMarker.bindTooltip(label, { direction: 'top' });
    tempMarker.bindPopup(`<strong>${name}</strong><br>${location}`);

    doneButton.style.display = "inline-block";

    doneButton.onclick = () => {
      const finalPos = tempMarker.getLatLng();
      tempMarker.setLatLng(finalPos);
      tempMarker.dragging.disable();
      tempMarker.openPopup();
      doneButton.style.display = "none";

      // Send pin to Google Sheet
      fetch(SHEET_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          location,
          lat: finalPos.lat,
          lng: finalPos.lng
        })
      })
      .then(response => {
        if (!response.ok) throw new Error("Failed to save pin");
        console.log("Pin saved!");
      })
      .catch(err => {
        console.error("Error saving pin:", err);
        alert("Something went wrong saving your pin.");
      });
    };

    map.off('click', clickHandler);
  };

  map.on('click', clickHandler);
});

// 🧲 Load existing pins from Google Sheet
function loadPins() {
  fetch(SHEET_URL)
    .then(response => response.json())
    .then(data => {
      data.forEach(pin => {
        const label = `${pin.name} - ${pin.location}`;
        const marker = L.marker([pin.lat, pin.lng]).addTo(map);
        marker.bindTooltip(label, { direction: 'top' });
        marker.bindPopup(`<strong>${pin.name}</strong><br>${pin.location}`);
      });
    })
    .catch(err => {
      console.error("Error loading pins:", err);
    });
}

loadPins(); // Load pins when the page starts