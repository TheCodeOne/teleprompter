import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { TitleBar } from "./TitleBar";

export const Preview: React.FC = () => {
  const [text, setText] = useState("");

  const handleBack = () => {
    window.electron.ipcRenderer.send("open-editor");
    window.close();
  };

  useEffect(() => {
    window.electron.ipcRenderer.on("set-text", (newText: string) => {
      setText(newText);
    });

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Escape") {
        e.preventDefault();
        handleBack();
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.electron.ipcRenderer.removeAllListeners("set-text");
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-800">
      <div className="draggable bg-gray-800 flex justify-between items-center px-4 py-2">
        <div className="text-gray-400 text-sm">Preview</div>
        <button onClick={handleBack} className="px-4 py-1 bg-blue-500 rounded hover:bg-blue-600 text-white no-drag">
          Back to Editor
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto prose prose-invert">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};
