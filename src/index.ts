import { SerialPort } from "serialport";
import {
  API,
  AccessoryConfig,
  AccessoryPlugin,
  CharacteristicValue,
  HAP,
  Logging,
  Service,
} from "homebridge";
import { hsvToRgb } from "./utils";

interface RGBAccessoryConfig extends AccessoryConfig {
  port: string;
  name: string;
  debounceMs?: number;
  colorTempMin?: number;
  colorTempMax?: number;
  baudRate?: 9600 | 115200;
}

export = (api: API) => {
  api.registerAccessory("RGBSerial", RGBAccessory);
};

class RGBAccessory implements AccessoryPlugin {
  private readonly serialPort: SerialPort;
  private readonly rgbService: Service;
  private readonly hap: HAP;
  private hue = 0;
  private brightness = 100;
  private saturation = 100;
  private readonly debounceMs: number;
  private debounceTimer: NodeJS.Timeout | null = null;
  private readonly colorTempMin: number;
  private readonly colorTempMax: number;

  constructor(
    private readonly log: Logging,
    private readonly config: RGBAccessoryConfig,
    private readonly api: API
  ) {
    this.hap = api.hap;
    this.debounceMs = config.debounceMs || 20;
    this.colorTempMin = config.colorTempMin || 140;
    this.colorTempMax = config.colorTempMax || 500;

    this.serialPort = new SerialPort({
      path: config.port || "/dev/ttyUSB0",
      baudRate: config.baudRate || 115200,
    });

    this.setupSerialPortListeners();
    this.rgbService = this.setupLightbulbService();
  }

  private setupSerialPortListeners(): void {
    this.serialPort.on("open", () => {
      this.log.info("Serial port opened");
    });

    this.serialPort.on("error", (err: Error) => {
      this.log.error("Serial port error:", err.message);
    });
  }

  private setupLightbulbService(): Service {
    const service = new this.hap.Service.Lightbulb(this.config.name);

    service
      .getCharacteristic(this.hap.Characteristic.On)
      .onSet(this.setPower.bind(this));

    service
      .getCharacteristic(this.hap.Characteristic.Hue)
      .onSet(this.setHue.bind(this));

    service
      .getCharacteristic(this.hap.Characteristic.Saturation)
      .onSet(this.setSaturation.bind(this));

    service
      .getCharacteristic(this.hap.Characteristic.Brightness)
      .onSet(this.setBrightness.bind(this));

    return service;
  }

  private writeToSerial(command: string): void {
    this.serialPort.write(`${command}\n`, (error) => {
      if (error) {
        this.log.error("Serial write error:", error.message);
      }
    });
  }

  async setPower(value: CharacteristicValue): Promise<void> {
    const state = value ? "on" : "off";
    this.writeToSerial(`power ${state}`);
  }

  private async updateColor(): Promise<void> {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      const { r, g, b } = hsvToRgb(this.hue, this.saturation, this.brightness);
      this.writeToSerial(`rgb ${r},${g},${b}`);
      this.debounceTimer = null;
    }, this.debounceMs);
  }

  async setHue(value: CharacteristicValue): Promise<void> {
    this.hue = value as number;
    await this.updateColor();
  }

  async setSaturation(value: CharacteristicValue): Promise<void> {
    this.saturation = value as number;
    await this.updateColor();
  }

  async setBrightness(value: CharacteristicValue): Promise<void> {
    this.brightness = value as number;
    await this.updateColor();
  }

  async setColorTemperature(value: CharacteristicValue): Promise<void> {
    const kelvin = value as number;
    this.hue = Math.max(
      0,
      Math.min(
        ((kelvin - this.colorTempMin) /
          (this.colorTempMax - this.colorTempMin)) *
          360,
        360
      )
    );
    this.saturation = 20;
    await this.updateColor();
  }

  getServices(): Service[] {
    return [this.rgbService];
  }
}
