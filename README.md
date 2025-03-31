# Homebridge RGB Serial

A Homebridge plugin for controlling RGB LED strips via serial connection (Arduino, Raspberry Pi, etc.).

This plugin works with the Arduino sketch available at: [arduino-rgb-controller](https://github.com/whereayodev/arduino-rgb-controller)

## Installation

```bash
npm install -g homebridge-rgb-serial
```

## Configuration

Add the following configuration to your Homebridge's `config.json`:

```json
{
  "accessories": [
    {
      "accessory": "RGBSerial",
      "name": "RGB Light",
      "port": "/dev/ttyUSB0",
      "baudRate": 115200,
      "debounceMs": 20,
      "colorTempMin": 140,
      "colorTempMax": 500
    }
  ]
}
```

### Configuration Parameters

| Parameter      | Type   | Default        | Description                          |
| -------------- | ------ | -------------- | ------------------------------------ |
| `name`         | string | "RGB Light"    | Device name in HomeKit               |
| `port`         | string | "/dev/ttyUSB0" | Serial port path                     |
| `baudRate`     | number | 115200         | Communication speed (9600 or 115200) |
| `debounceMs`   | number | 20             | Color update delay (ms)              |
| `colorTempMin` | number | 140            | Minimum color temperature (K)        |
| `colorTempMax` | number | 500            | Maximum color temperature (K)        |

## Communication Protocol

The plugin sends the following commands through the serial port:

- Power control: `power on` or `power off`
- Color setting: `rgb R,G,B` (where R,G,B are values from 0 to 255)

## Arduino Wiring Diagram

```
           Arduino
    +------------------+
    |                  |
    | D5 -----> R LED |
    | D6 -----> G LED |
    | D7 -----> B LED |
    |                  |
    +------------------+
```

## Requirements

- Node.js >= 16.0.0
- Homebridge >= 1.6.0
- Device with serial port (Arduino, Raspberry Pi)

## Development

```bash
# Clone the repository
git clone https://github.com/whereayodev/homebridge-serial-rgb.git

# Install dependencies
npm install

# Build
npm run build

# Run in development mode
npm run watch
```

## Testing

```bash
# Run tests
npm test

# Run linter
npm run lint
```

## Features

- HomeKit integration
- RGB color control
- Power on/off
- Color temperature adjustment
- Brightness control
- Debounced color updates
- Serial communication

## License

MIT

## Support

If you encounter any issues, please create an [issue](https://github.com/whereayodev/homebridge-serial-rgb/issues) in the repository.

## Sponsorship

If you find this project helpful, consider supporting its development via [GitHub Sponsors](https://github.com/sponsors/whereayodev).

## Credits

Built with:

- [Homebridge](https://homebridge.io/)
- [Node SerialPort](https://serialport.io/)
- [TypeScript](https://www.typescriptlang.org/)
