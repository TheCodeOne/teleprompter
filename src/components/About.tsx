import React from "react";
import { TitleBar } from "./TitleBar";

export const About: React.FC = () => {
  const [systemInfo] = React.useState({
    version: "1.0.0",
    date: "2024-12-06T05:11:55.168Z",
    electron: window.electron.systemInfo.versions.electron,
    chrome: window.electron.systemInfo.versions.chrome,
    node: window.electron.systemInfo.versions.node,
    v8: window.electron.systemInfo.versions.v8,
    os: formatOS(window.electron.systemInfo.os),
  });

  function formatOS(os: { platform: string; release: string; version: string; arch: string }) {
    if (os.platform === "darwin") {
      // Convert version number to macOS name
      const majorVersion = parseInt(os.release);
      const macOSNames: Record<number, string> = {
        22: "Ventura",
        23: "Sonoma",
        21: "Monterey",
        20: "Big Sur",
        19: "Catalina",
        18: "Mojave",
        17: "High Sierra",
      };
      const osName = macOSNames[majorVersion] || os.release;
      return `macOS ${osName} ${os.arch}`;
    }
    return `${os.platform} ${os.release} ${os.arch}`;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-800 text-white">
      <TitleBar />
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="max-w-md w-full space-y-8">
          <div className="flex flex-col items-center space-y-4">
            <img src="../resources/iconTemplate.png" alt="Teleprompter" className="w-24 h-24" />
            <h1 className="text-2xl font-bold">Teleprompter</h1>
            <p className="text-gray-400">© 2024 Dimitrios Kokkonias</p>
          </div>

          <div className="bg-gray-700 rounded-lg p-6 space-y-3 font-mono text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Version:</span>
              <span>{systemInfo.version}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Commit:</span>
              <span className="text-xs">{systemInfo.commit.slice(0, 7)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Date:</span>
              <span>{new Date(systemInfo.date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Electron:</span>
              <span>{systemInfo.electron}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Chromium:</span>
              <span>{systemInfo.chrome}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Node.js:</span>
              <span>{systemInfo.node}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">V8:</span>
              <span>{systemInfo.v8}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">OS:</span>
              <span>{systemInfo.os}</span>
            </div>
          </div>

          <div className="flex flex-col items-center space-y-2">
            <p className="text-gray-400">Built with Electron & React</p>
            <a
              href="https://github.com/TheCodeOne/teleprompter"
              className="text-blue-400 hover:text-blue-300"
              onClick={(e) => {
                e.preventDefault();
                window.electron.ipcRenderer.send("open-external", "https://github.com/TheCodeOne/teleprompter");
              }}
            >
              View on GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
