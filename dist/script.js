// Get references to elements
const colorTab = document.getElementById("colorTab");
const whiteTab = document.getElementById("whiteTab");
const colorPage = document.getElementById("colorPage");
const whitePage = document.getElementById("whitePage");
const powerSwitch = document.getElementById("powerSwitch");
const colorPresets = document.querySelectorAll(
  "#colorPage .current-color-circle[data-color]"
);
const colorPicker = document.getElementById("colorPicker");
const colorIndicator = document.getElementById("colorIndicator");
const pickedColorDisplay = document.getElementById("pickedColorDisplay");
const brightnessColorSlider = document.getElementById("brightnessColorSlider");
const brightnessColorValue = document.getElementById("brightnessColorValue");
const whiteTempPicker = document.getElementById("whiteTempPicker");
const whiteTempIndicator = document.getElementById("whiteTempIndicator");
const whitePresets = document.querySelectorAll(
  "#whitePage .current-color-circle[data-white-temp]"
);
const brightnessWhiteSlider = document.getElementById("brightnessWhiteSlider");
const brightnessWhiteValue = document.getElementById("brightnessWhiteValue");

let isPickingColor = false; // Flag to track if color picker is active

let debounceTimer = null;

// Function to update the active tab
function setActiveTab(tabId) {
  // Remove 'active' class from all tab buttons
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.classList.remove("active");
  });
  // Add 'active' class to the clicked tab button
  document.getElementById(tabId).classList.add("active");

  // Hide all content pages
  document.querySelectorAll(".page-content").forEach((page) => {
    page.classList.add("hidden");
  });
  // Show the selected content page
  if (tabId === "colorTab") {
    colorPage.classList.remove("hidden");
  } else {
    whitePage.classList.remove("hidden");
  }
}

// Event listener for Color tab click
colorTab.addEventListener("click", () => {
  setActiveTab("colorTab");
  console.log("Switched to Color Tab");
});

// Event listener for White tab click
whiteTab.addEventListener("click", () => {
  setActiveTab("whiteTab");
  console.log("Switched to White Tab");
});

// Event listener for power switch
powerSwitch.addEventListener("change", () => {
  const isOn = powerSwitch.checked;
  console.log("Light Switch:", isOn ? "ON" : "OFF");

  controlBuldAPI({ power: isOn ? true : false });
  // Here you can add logic to visually dim/brighten the bulb image or other elements
  // For this example, we'll just log it.
});

// Function to convert HSL to RGB
function hslToRgb(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const r255 = Math.round(r * 255);
  const g255 = Math.round(g * 255);
  const b255 = Math.round(b * 255);

  return {
    rgbStr: `rgb(${r255}, ${g255}, ${b255})`,
    rgb: { r: r255, g: g255, b: b255 },
  };
}

// Color Picker Logic
function updateColorFromPicker(event) {
  const rect = colorPicker.getBoundingClientRect();
  let x = event.clientX - rect.left;
  let y = event.clientY - rect.top;

  // Clamp x and y to stay within bounds
  x = Math.max(0, Math.min(x, rect.width));
  y = Math.max(0, Math.min(y, rect.height));

  // Simple mapping: Hue based on X, Saturation/Lightness fixed for simplicity
  // In a real app, Y would control saturation/lightness
  const hue = (x / rect.width) * 360;
  const saturation = 100;
  const lightness = 50;

  const pickedRgb = hslToRgb(hue, saturation, lightness);

  // Update indicator position
  colorIndicator.style.left = `${x}px`;
  colorIndicator.style.top = `${y}px`;
  colorIndicator.style.backgroundColor = pickedRgb;
  colorIndicator.classList.remove("hidden");

  // Update display text and background
  pickedColorDisplay.style.backgroundColor = pickedRgb;
  pickedColorDisplay.textContent = "Custom"; // Can't easily name custom colors

  console.log(
    `Color Picker: Picked RGB: ${pickedRgb.rgbStr} (Hue: ${Math.round(hue)})`
  );

  clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
    controlBuldAPI({
      power: powerSwitch.checked,
      rgb: pickedRgb.rgb,
      mode: "colour",
      colorBrightness: brightnessColorValue.textContent,
    });
  }, 500);
}

colorPicker.addEventListener("mousedown", (e) => {
  isPickingColor = true;
  updateColorFromPicker(e);
});

colorPicker.addEventListener("mousemove", (e) => {
  if (isPickingColor) {
    updateColorFromPicker(e);
  }
});

colorPicker.addEventListener("mouseup", () => {
  isPickingColor = false;
});

// For mobile/touch devices
colorPicker.addEventListener("touchstart", (e) => {
  isPickingColor = true;
  updateColorFromPicker(e.touches[0]);
});

colorPicker.addEventListener("touchmove", (e) => {
  if (isPickingColor) {
    updateColorFromPicker(e.touches[0]);
  }
});

colorPicker.addEventListener("touchend", () => {
  isPickingColor = false;
});

// Color preset circles
colorPresets.forEach((circle) => {
  circle.addEventListener("click", () => {
    const color = circle.dataset.color;
    pickedColorDisplay.style.backgroundColor = color;
    // Get the name from the background color class if possible, otherwise use a default
    const colorName = circle.className.includes("bg-red-500")
      ? "Red"
      : circle.className.includes("bg-green-500")
      ? "Green"
      : circle.className.includes("bg-blue-500")
      ? "Blue"
      : "Custom";
    pickedColorDisplay.textContent = colorName;

    // Hide color indicator when a preset is chosen
    colorIndicator.classList.add("hidden");

    console.log(`Color Preset: Selected ${colorName} (${color})`);
  });
});

// Brightness slider for Color Page
brightnessColorSlider.addEventListener("input", (e) => {
  const brightness = e.target.value;
  brightnessColorValue.textContent = `${brightness}%`;
  console.log(`Brightness (Color Page): ${brightness}%`);

  clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
    controlBuldAPI({
      power: powerSwitch.checked,
      mode: "colour",
      colorBrightness: brightness,
    });
  }, 500);
  // You could apply a filter to the bulb image here for visual effect
});

// White Temperature Picker Logic
function updateWhiteTempFromPicker(event) {
  const rect = whiteTempPicker.getBoundingClientRect();
  let x = event.clientX - rect.left;
  let y = event.clientY - rect.top;
  x = Math.max(0, Math.min(x, rect.width));
  y = Math.max(0, Math.min(y, rect.height));

  const whiteTempTuya = Math.round((x / rect.width) * 1000);

  // Update indicator position and color
  whiteTempIndicator.style.left = `${x}px`;
  whiteTempIndicator.style.top = `${y}px`;
  whiteTempIndicator.style.backgroundColor = `rgb(${255 - whiteTempTuya / 4}, ${255 - whiteTempTuya / 2}, ${255 - whiteTempTuya / 1})`; // rough approximation
  whiteTempIndicator.classList.remove("hidden");

  console.log(`White Temp: ${whiteTempTuya} (Tuya scale)`);

  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    controlBuldAPI({
      power: powerSwitch.checked,
      temperature: whiteTempTuya,
      mode: "white",
    });
  }, 500);
}

// function updateWhiteTempFromPicker(event) {
//   const rect = whiteTempPicker.getBoundingClientRect();
//   let x = event.clientX - rect.left;
//   x = Math.max(0, Math.min(x, rect.width)); // Clamp x

//   // Map x to a temperature value (e.g., from 2000K to 6500K)
//   const minK = 2000;
//   const maxK = 6500;
//   const whiteTempK = minK + (x / rect.width) * (maxK - minK);

//   // Update indicator position
//   whiteTempIndicator.style.left = `${x}px`;
//   whiteTempIndicator.style.top = `50%`; // Centered vertically
//   whiteTempIndicator.style.backgroundColor = `rgb(${Math.round(
//     255 - ((whiteTempK - minK) / (maxK - minK)) * 100
//   )}, ${Math.round(
//     255 - ((whiteTempK - minK) / (maxK - minK)) * 150
//   )}, ${Math.round(255 - ((whiteTempK - minK) / (maxK - minK)) * 255)})`; // Very rough visual, real calculation is complex
//   whiteTempIndicator.classList.remove("hidden");

//   console.log(`White Temperature Picker: ${Math.round(whiteTempK)}K`);
//   clearTimeout(debounceTimer);

//   debounceTimer = setTimeout(() => {
//     controlBuldAPI({
//       power: powerSwitch.checked,
//       temperature: Math.round(whiteTempK) / 10,
//       mode: "white",
//     });
//   }, 500);
// }

whiteTempPicker.addEventListener("mousedown", (e) => {
  isPickingColor = true; // Re-use flag for picking state
  updateWhiteTempFromPicker(e);
});

whiteTempPicker.addEventListener("mousemove", (e) => {
  if (isPickingColor) {
    updateWhiteTempFromPicker(e);
  }
});

whiteTempPicker.addEventListener("mouseup", () => {
  isPickingColor = false;
});

// For mobile/touch devices
whiteTempPicker.addEventListener("touchstart", (e) => {
  isPickingColor = true;
  updateWhiteTempFromPicker(e.touches[0]);
});

whiteTempPicker.addEventListener("touchmove", (e) => {
  if (isPickingColor) {
    updateWhiteTempFromPicker(e.touches[0]);
  }
});

whiteTempPicker.addEventListener("touchend", () => {
  isPickingColor = false;
});

// White preset circles
whitePresets.forEach((circle) => {
  circle.addEventListener("click", () => {
    const tempType = circle.dataset.whiteTemp;
    whiteTempIndicator.classList.add("hidden"); // Hide indicator for presets
    console.log(`White Preset: Selected ${tempType} white`);
  });
});

// Brightness slider for White Page
brightnessWhiteSlider.addEventListener("input", (e) => {
  const brightness = e.target.value;
  brightnessWhiteValue.textContent = `${brightness}%`;
  console.log(`Brightness (White Page): ${brightness}%`);

  clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
    controlBuldAPI({
      power: powerSwitch.checked,
      brightness: brightness,
      mode: "white",
    });
  }, 500);
  // You could apply a filter to the bulb image here for visual effect
});

// Set initial active tab on load
window.onload = () => {
  setActiveTab("colorTab");
  // Log initial states
  console.log(
    "Initial Light Switch state:",
    powerSwitch.checked ? "ON" : "OFF"
  );
  console.log(
    "Initial Brightness (Color Page):",
    brightnessColorSlider.value + "%"
  );
  console.log(
    "Initial Brightness (White Page):",
    brightnessWhiteSlider.value + "%"
  );
};

async function controlBuldAPI({
  power,
  rgb,
  brightness,
  colorBrightness,
  temperature,
  mode,
}) {
  try {
    await fetch("/change", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        power: power,
        rgb: rgb,
        brightness: brightness ? Number(brightness) * 10 : undefined,
        colorBrightness: colorBrightness
          ? Number(colorBrightness) * 10
          : undefined,
        temperature: temperature,
        mode: mode,
      }),
    });
  } catch (error) {
    console.error("Failed to control bulb:", error);
  }
}
