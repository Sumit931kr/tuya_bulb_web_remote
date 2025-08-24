const { TuyaContext } = require("@tuya/tuya-connector-nodejs");

const context = new TuyaContext({
  baseUrl: process.env.BASE_URL, // Change based on your region
  accessKey: process.env.ACCESS_KEY,
  secretKey: process.env.SECRET_KEY,
});

// console.log(context)

const deviceId = process.env.DEVICE_ID; // Your device ID

// console.log(deviceId)

let lastUsedBuldData= {
power: true,
rgb: { r: 255, g: 0, b: 200 }, // Default to pink color 
brightness: 1000, // Default brightness
temperature: 1000, // Default temperature (cool white)
mode: 'colour', // Default to color mode
colorBrightness: 1000 // Default color brightness
}

async function controlBulb({ power=lastUsedBuldData.power, rgb=lastUsedBuldData.rgb, brightness=lastUsedBuldData.brightness, colorBrightness=lastUsedBuldData.colorBrightness, temperature=lastUsedBuldData.temperature, mode=lastUsedBuldData.mode }) {
  const commands = [];

  lastUsedBuldData = {
    power,
    rgb,
    brightness,
    colorBrightness,
    temperature,
    mode
  };
  
  // Power on/off
  if (typeof power === 'boolean') {
    commands.push({ code: 'switch_led', value: power });
  }
  
  // Determine mode automatically if not specified
  const hasRgb = rgb && typeof rgb.r === 'number' && typeof rgb.g === 'number' && typeof rgb.b === 'number';

  const hasWhiteSettings = typeof brightness === 'number' || typeof temperature === 'number';
  
  let workMode = mode;
  
  // Set work mode first (this is crucial!)
  if (workMode) {
    commands.push({ code: 'work_mode', value: workMode });
  }
  
  // RGB color: accepts { r: 255, g: 0, b: 128 }
  if (hasRgb && (workMode === 'colour' || !workMode)) {
    // Ensure RGB values are within valid range (0-255)
    const clampedRgb = {
      r: Math.max(0, Math.min(255, rgb.r)),
      g: Math.max(0, Math.min(255, rgb.g)),
      b: Math.max(0, Math.min(255, rgb.b))
    };

    // console.log(clampedRgb)
    
    const hsv = rgbToHSV(clampedRgb.r, clampedRgb.g, clampedRgb.b);
    lastUsedBuldData.colorBrightness = hsv.v; // Store color brightness for later use
    commands.push({
      code: 'colour_data_v2',
      value: {
        h: hsv.h,
        s: hsv.s*10,
        v: colorBrightness ? colorBrightness : hsv.v // Use provided color brightness or calculated value,
      },
    });
  }

  
  // White mode settings (brightness and temperature)
  if (workMode === 'white' || (!hasRgb && hasWhiteSettings)) {
    // Brightness (0–1000) - use bright_value_v2 for newer bulbs
    if (typeof brightness === 'number') {
      const clampedBrightness = Math.max(10, Math.min(1000, brightness));
      commands.push({ code: 'bright_value_v2', value: clampedBrightness });
    }
    
    // Temperature (0–1000) - use temp_value_v2 for newer bulbs
    if (typeof temperature === 'number') {
      const clampedTemperature = Math.floor(Math.max(0, Math.min(1000, temperature)));
      commands.push({ code: 'temp_value_v2', value: clampedTemperature });
    }
  }
  
  // Check if we have any commands to send
  if (commands.length === 0) {
    console.warn('No valid commands to send');
    return null;
  }

  // console.log("commands")
  // console.log(commands)

    const devicedetail = await context.device.detail({
    device_id: deviceId,
  });
  if(!devicedetail.success) {
   console.log("Failed to get device details:", devicedetail);
  }
  console.log("Device details:",devicedetail);
  
  try {
    const response = await context.request({
      method: 'POST',
      path: `/v1.0/devices/${deviceId}/commands`,
      body: { commands },
    });
    // console.log('Success:', response);
    return response;
  } catch (error) {
    console.error('Error controlling bulb:', error.message || error);
    throw error; // Re-throw for proper error handling
  }
}

function rgbToHSV(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const v = max;

  const d = max - min;
  s = max === 0 ? 0 : d / max;

  if (max !== min) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
}



// Convenience functions for specific modes
async function setColorMode({ power = true, rgb, brightness }) {
  return controlBulb({
    power,
    rgb,
    mode: 'colour'
  });
}

async function setWhiteMode({ power = true, brightness, temperature }) {
  return controlBulb({
    power,
    brightness,
    temperature,
    mode: 'white'
  });
}

// Call the example function
// example();

module.exports = {
  controlBulb,
  setColorMode,
  setWhiteMode,
  rgbToHSV
};