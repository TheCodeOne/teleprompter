export interface IElectronAPI {
  ipcRenderer: {
    send: (channel: string, ...args: any[]) => void;
    on: (channel: string, func: (...args: any[]) => void) => void;
    removeAllListeners: (channel: string) => void;
  };
  systemInfo: {
    os: {
      platform: string;
      release: string;
      version: string;
      arch: string;
    };
    versions: {
      chrome: string;
      electron: string;
      node: string;
      v8: string;
    };
  };
}

declare global {
  interface Window {
    electron: IElectronAPI;
  }
}

export {}; 