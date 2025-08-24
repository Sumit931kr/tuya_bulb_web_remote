const TuyAPI = require("tuyapi");

const device = new TuyAPI({
  id: "d750e8d1b3cc67871dhhja",
  key: "<tmb9/$AKg4GiH0[",
  ip: "192.168.1.3",
  version: "3.5",
});


async function setBulb(device, mode, brightness, color = { h: 0, s: 100 }) {
  // Scale brightness to Tuya (0–1000)
  const v = Math.round((brightness / 100) * 1000);

  if (mode === "white") {
    // Switch to white mode
    await device.set({ dps: 21, set: "white" });
    // Set brightness
    await device.set({ dps: 22, set: v });
  } else if (mode === "colour") {
    // Switch to colour mode
    await device.set({ dps: 21, set: "colour" });

    // Scale hue and saturation to Tuya’s range
    const h = color.h; // already 0–360
    const s = Math.round((color.s / 100) * 1000);

    // Encode HSV → hex string: HHHHSSVVVV
    const hex =
      h.toString(16).padStart(4, "0") +
      s.toString(16).padStart(4, "0") +
      v.toString(16).padStart(4, "0");

    await device.set({ dps: 24, set: hex });
  }
}

(async () => {
  await device.find();
  await device.connect();

  // White mode at 70% brightness
  await setBulb(device, "white", 100);

  // Red color at 100% brightness
  // await setBulb(device, "colour", 100, { h: 0, s: 100 });

  // Blue at 50% brightness
  // await setBulb(device, "colour", 50, { h: 240, s: 100 });

  await device.disconnect();
})();


// (async () => {
//   await device.find(); // Optional if IP is known
//   await device.connect(); // Connect to the device

//   // Turn ON the bulb
//   // await device.set({ dps: 20, set: true });

//   // Set to white mode
//   // await device.set({ dps: 21, set: 'white' });
//   await device.set({ dps: 21, set: "colour" });

//   //   // Set brightness
//   // await device.set({ dps: 22, set: 100 });

//   // color temperature
//   // await device.set({ dps: 23, set: 1000 });

//   // color
//   // await device.set({ dps: 24, set: "00DC004B004E" });
//   // await device.set({ dps: 210, set: "00DC004B004E" });

//   // await device.set({ dps: 24, set: 1000 });

//   //   // Set color temp (try 0–1000, or check correct DPS index)
//   //   await device.set({ dps: 23, set: 1000 })
//   // ;

//   // Set red color
//   await device.set({
//     dps: 24,
//     set: "000003E80320", // RED in HSV hex
//   });

//   const status = await device.get({ schema: true });
//   console.log("Current state:", status);

//   // // Example vacation timing payload
//   // const vacationHex = "000B014404740564007850606032";

//   // await device.set({
//   //   dps: 210,          // DP210 = vacation timing
//   //   set: vacationHex   // hex string
//   // });

//   await device.disconnect(); // Clean up
// })();
