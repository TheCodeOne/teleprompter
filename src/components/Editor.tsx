import React, { useState, useEffect, useRef } from "react";
import { TitleBar } from "./TitleBar";
import { Prompt } from "../types/prompt";
import { v4 as uuidv4 } from "uuid";
import { calculateScrollTime } from "../utils/timeCalculation";
import { loadSettings } from "../types/settings";

export const Editor: React.FC = () => {
  const [text, setText] = useState("");
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [promptTitle, setPromptTitle] = useState("");
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const settings = loadSettings();
  const saveTimeoutRef = useRef<number>();

  useEffect(() => {
    const savedPrompts = localStorage.getItem("prompts");
    if (savedPrompts) {
      setPrompts(JSON.parse(savedPrompts));
    }
  }, []);

  useEffect(() => {
    if (text.trim()) {
      const seconds = calculateScrollTime(text, settings.speed, settings.fontSize, settings);
      setEstimatedTime(seconds);
    } else {
      setEstimatedTime(null);
    }
  }, [text, settings]);

  // Auto-save effect
  useEffect(() => {
    if (!text.trim() || !promptTitle.trim()) return;

    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout to save after 1 second of no changes
    saveTimeoutRef.current = window.setTimeout(() => {
      const newPrompts = selectedPrompt ? prompts.map((p) => (p.id === selectedPrompt ? { ...p, title: promptTitle, content: text } : p)) : [...prompts, { id: uuidv4(), title: promptTitle, content: text }];

      setPrompts(newPrompts);
      localStorage.setItem("prompts", JSON.stringify(newPrompts));
      if (!selectedPrompt) {
        setSelectedPrompt(newPrompts[newPrompts.length - 1].id);
      }
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [text, promptTitle, selectedPrompt]);

  const deletePrompt = (id: string) => {
    const newPrompts = prompts.filter((p) => p.id !== id);
    setPrompts(newPrompts);
    localStorage.setItem("prompts", JSON.stringify(newPrompts));
    if (selectedPrompt === id) {
      setSelectedPrompt(null);
      setPromptTitle("");
      setText("");
    }
  };

  const loadPrompt = (prompt: Prompt) => {
    setText(prompt.content);
    setPromptTitle(prompt.title);
    setSelectedPrompt(prompt.id);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const openTeleprompter = () => {
    window.electron.ipcRenderer.send("open-teleprompter", text);
    window.close();
  };

  const openPreview = () => {
    window.electron.ipcRenderer.send("open-preview", text);
  };

  const formatTime = (seconds: number) => {
    return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
  };

  const getEstimatedTime = (content: string) => {
    return calculateScrollTime(content, settings.speed, settings.fontSize, settings);
  };

  const truncateTitle = (title: string, maxLength: number = 15) => {
    if (title.length <= maxLength) return title;
    return title.slice(0, maxLength) + "...";
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <TitleBar />
      <div className="flex-1 bg-gray-800 text-white p-4 flex overflow-hidden">
        <div className="w-64 border-r border-gray-700 pr-4 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Saved Prompts</h2>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {prompts.map((prompt) => (
              <div key={prompt.id} className="flex items-center justify-between bg-gray-700 p-2 rounded">
                <button onClick={() => loadPrompt(prompt)} className="text-left flex-1 hover:text-blue-300">
                  <div className="flex items-center justify-between w-full">
                    <span className="flex-1" title={prompt.title}>
                      {truncateTitle(prompt.title)}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-gray-600 text-gray-200 rounded-full shadow-sm">{formatTime(getEstimatedTime(prompt.content))}</span>
                  </div>
                </button>
                <button onClick={() => deletePrompt(prompt.id)} className="text-red-400 hover:text-red-300 ml-2">
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 pl-4 space-y-4 flex flex-col">
          <input type="text" value={promptTitle} onChange={(e) => setPromptTitle(e.target.value)} placeholder="Prompt title" className="w-full p-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <textarea value={text} onChange={handleTextChange} placeholder="Enter your script here..." className="flex-1 w-full p-4 bg-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-white min-h-0" />
          <div className="flex justify-end gap-2">
            <button onClick={openPreview} disabled={!text.trim()} className="flex items-center justify-center gap-2 h-10 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">
              <span>Preview</span>
            </button>
            <button onClick={openTeleprompter} disabled={!text.trim()} className="flex items-center justify-center gap-2 h-10 px-4 bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">
              <span>Open</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
