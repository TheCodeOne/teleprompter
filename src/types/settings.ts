export interface TeleprompterSettings {
  fontSize: string;
  speed: number;
  windowHeight: number;
  windowWidth: number;
}

export const MIN_SPEED = 0.1;
export const MAX_SPEED = 5.0;
export const DEFAULT_SPEED = 1.0;

export const DEFAULT_SETTINGS: TeleprompterSettings = {
  fontSize: "7",
  speed: DEFAULT_SPEED,
  windowHeight: 200,
  windowWidth: 400
};

export const loadSettings = (): TeleprompterSettings => {
  const saved = localStorage.getItem("teleprompterSettings");
  return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
};

export const saveSettings = (settings: TeleprompterSettings): void => {
  localStorage.setItem("teleprompterSettings", JSON.stringify(settings));
}; 