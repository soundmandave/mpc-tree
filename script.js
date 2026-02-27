/*
==================================================
MPC OS 95 ENGINE
All dynamic content is loaded from pads.json
==================================================
*/

let selectedLink = null;
let selectedPadElement = null;

const goButton = document.getElementById("goButton");
const padGrid = document.getElementById("padGrid");
const display = document.getElementById("mpcDisplay");
const artistHeader = document.getElementById("artistName");
const taglineHeader = document.getElementById("tagline");
const tabBar = document.getElementById("tabBar");

/*
==================================================
LOAD JSON DATA
This fetches user-editable content
==================================================
*/
fetch("pads.json")
  .then(res => res.json())
  .then(data => {

    // Insert artist name into title bar
    artistHeader.textContent = data.artistName;

    // Insert tagline
    taglineHeader.textContent = data.tagline;

    // Default screen text
    display.innerHTML = `
      <h1>${data.artistName}</h1>
      <p>Select Category</p>
    `;

    /*
    ==============================================
    BUILD CATEGORY TABS
    ==============================================
    */
    data.categories.forEach((category, index) => {

      const tab = document.createElement("button");
      tab.classList.add("tab-button");
      tab.textContent = category.name;

      if (index === 0) tab.classList.add("active");

      tab.addEventListener("click", () => {
        document.querySelectorAll(".tab-button")
          .forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        buildPads(category.pads, data.artistName);
      });

      tabBar.appendChild(tab);
    });

    // Load first category by default
    buildPads(data.categories[0].pads, data.artistName);

  });

/*
==================================================
BUILD PAD GRID
- Always fills to 16 pads
- Adds thumbnails
- Adds hover display
- Optional sound
- Optional glow color
==================================================
*/
function buildPads(pads, artistName) {

  padGrid.innerHTML = "";

  const totalPads = 16;
  const padded = [...pads];

  // Auto-fill empty pads
  while (padded.length < totalPads) {
    padded.push({});
  }

  padded.forEach((pad, index) => {

    const padElement = document.createElement("a");
    padElement.classList.add("pad");

  // Pads no longer auto-navigate
padElement.href = "#";

    // Thumbnail
    if (pad.thumbnail) {
      const img = document.createElement("img");
      img.src = "images/" + pad.thumbnail;
      img.alt = pad.displayTitle || `Pad ${index+1}`;
      padElement.appendChild(img);
    }

    // Overlay label
    const label = document.createElement("div");
    label.classList.add("pad-label");
    label.textContent = pad.padLabel || `PAD ${index+1}`;
    padElement.appendChild(label);

    // Hover updates display screen
    padElement.addEventListener("mouseenter", () => {
      display.innerHTML = `
        <h1>${artistName}</h1>
        <p>${pad.displayTitle || "Empty Slot"}</p>
      `;
    });

 padElement.addEventListener("click", (e) => {
  e.preventDefault();

  // Remove previous selection
  if (selectedPadElement) {
    selectedPadElement.classList.remove("selected");
  }

  // Select new pad
  selectedPadElement = padElement;
  selectedPadElement.classList.add("selected");

  selectedLink = pad.link || null;

  if (selectedLink) {
    goButton.disabled = false;
    goButton.classList.add("armed");
    statusLed.classList.add("active");
    goInstruction.textContent = "Ready. Press GO to launch.";
  } else {
    goButton.disabled = true;
  }

  // Optional sound
  if (pad.sound) {
    new Audio("sounds/" + pad.sound).play();
  }
});

    // Optional glow color
    if (pad.color) {
      padElement.style.boxShadow =
        `inset 0 0 15px ${pad.color}`;
    }

    padGrid.appendChild(padElement);
  });

  bootAnimation();
}

/*
==================================================
BOOT ANIMATION
Sequential pad light flash
==================================================
*/
function bootAnimation() {

  const pads = document.querySelectorAll(".pad");

  pads.forEach((pad, index) => {

    setTimeout(() => {
      pad.style.filter = "brightness(1.5)";
      setTimeout(() => {
        pad.style.filter = "brightness(1)";
      }, 100);
    }, index * 60);

  });
}




goButton.addEventListener("click", () => {
  if (!selectedLink) return;

  // Quick flash effect
  goInstruction.textContent = "Launching...";
  statusLed.classList.remove("active");

  setTimeout(() => {
    window.open(selectedLink, "_blank");
    resetSelection();
  }, 400);
});

cancelButton.addEventListener("click", () => {
  resetSelection();
});


function resetSelection() {
  if (selectedPadElement) {
    selectedPadElement.classList.remove("selected");
  }

  selectedPadElement = null;
  selectedLink = null;

  goButton.disabled = true;
  goButton.classList.remove("armed");
  statusLed.classList.remove("active");

  goInstruction.innerHTML =
    'Press a Pad then hit <strong>GO</strong> to launch';
}



