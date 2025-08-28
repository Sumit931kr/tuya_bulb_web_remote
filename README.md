# Web-Based Remote for Havells Smart Bulb (Tuya Powered)

I built a custom web-based remote to control my Havells smart bulb, which is powered by Tuya. The official app works fine, but I wanted the flexibility of controlling my bulb through a browser — so I made one.

### 🔧 Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: Vanilla JavaScript, HTML, CSS

### ✅ Features

- Power on/off control
- Brightness adjustment
- White temperature control (0–1000 scale)
- HSV color picker for full RGB spectrum
- Responsive UI that works across desktop and mobile
- Visual slider-based controls with real-time feedback

### 🌐 Tuya Integration

To communicate with the bulb, I used Tuya’s Cloud APIs. The setup involved:

1. Registering a cloud project at [Tuya IoT Console](https://iot.tuya.com)
2. Linking my smart bulb to the project using the Tuya Smart app
3. Using the following credentials:
   - `access_key`
   - `secret_key`
   - `device_id`

Once configured, my backend authenticated with Tuya and sent device commands using Tuya's standard data point (DP) codes like:

- `switch_led`
- `bright_value_v2`
- `temp_value_v2`
- `work_mode`
- `colour_data` (HSV)

### 📸 Preview

![UI Screenshot](./assets/ui.png) <!-- Add your screenshot -->


### 🚀 Run Locally

1. Clone the repo
2. Install dependencies  
   npm install
3. Create a .env file with your Tuya credentials:
    ACCESS_ID=your_access_key
    ACCESS_SECRET=your_secret_key
    DEVICE_ID=your_device_id
4.Start the server
    node index.js
5.Open the browser and go to http://localhost:3000