let video = document.getElementById('video');
let canvas = document.getElementById('canvas');
let photo = document.getElementById('photo');
let photo_btn = document.getElementById('photo-btn');
let camera_btn = document.getElementById('camera-btn');

function openCamera() {
    navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.style.display = 'block';
        video.srcObject = stream;
        photo_btn.style.display = 'block';
        camera_btn.style.display = 'none';
        canvas.style.display = 'block';
    })
    .catch(err => {
        alert("Erreur d'accès à la caméra : " + err);
    });
    
}

function takePhoto() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    let imageData = canvas.toDataURL('image/png');
    photo.src = imageData;
    photo_btn.style.display = 'none';
    video.style.display = 'none';
}

document.getElementById('uploadInput').addEventListener('change', function (event) {
   const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      document.getElementById('photo').src = e.target.result;
      const canvas = document.getElementById('canvas');
      const ctx = canvas.getContext('2d');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
 });


async function identifyTrack() {
  try {
    const resizedCanvas = document.createElement('canvas');
    resizedCanvas.width = 256;
    resizedCanvas.height = 256;
    const resizedCtx = resizedCanvas.getContext('2d');
    resizedCtx.drawImage(canvas, 0, 0, 256, 256);
    const imageData = resizedCtx.getImageData(0, 0, 256, 256).data;
    const reshaped = [];
    for (let y = 0; y < 256; y++) {
      const row = [];
      for (let x = 0; x < 256; x++) {
        const i = (y * 256 + x) * 4;
        row.push([imageData[i], imageData[i + 1], imageData[i + 2]]); // R, G, B
      }
      reshaped.push(row);
    }

   
    let loc = "Unknown";
    try {
      const pos = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject)
      );
      const { latitude: lat, longitude: lon } = pos.coords;
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      const geoData = await geoRes.json();
      loc = geoData.address?.city || geoData.address?.town || geoData.address?.village || geoData.display_name || "Unknown";
    } catch (geoErr) {
      console.warn("Location unavailable:", geoErr);
    }

    const payload = {
      image: reshaped,
      path: `track_${Date.now()}_${Math.floor(Math.random() * 10000)}.png`,
      loc,
      date: new Date().toISOString()
    };


    const response = await fetch("http://localhost:5000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

   
    const contentType = response.headers.get("content-type");
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server error:", errorText);
      alert("Server error: " + response.status);
      return;
    }

    if (contentType && contentType.includes("application/json")) {
      const result = await response.json();
      alert(`Identified animal: ${result.species || JSON.stringify(result)}`);
      console.log("API response:", result);
      // display response in html
      const container = document.getElementById("animal-info-container");
      container.innerHTML = ""; // clean last content

      const title = document.createElement("h3");
      title.textContent = `Species: ${result.species || "Unknown"}`;
      container.appendChild(title);

      const img = document.createElement("img");
      img.src =`assets/animals/${result.picture}`;
      img.alt = result.species || "Identified animal";
      img.style.maxWidth = "300px";
      img.style.border = "1px solid #ccc";
      img.style.marginTop = "10px";
      container.appendChild(img);

  const list = document.createElement("ul");
  for (const [key, value] of Object.entries(result)) {
    const item = document.createElement("li");
    item.textContent = `${key}: ${value}`;
    list.appendChild(item);
  }
    } else {
      const text = await response.text();
      console.warn("Unexpected response format:", text);
      alert("Unexpected server response");
    }

  } catch (err) {
    console.error("API error:", err);
    alert("Unable to contact the server");
  }
}



