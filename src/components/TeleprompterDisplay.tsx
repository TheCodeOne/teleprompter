import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { TeleprompterSettings, loadSettings, saveSettings, MIN_SPEED, MAX_SPEED } from "../types/settings";

export const TeleprompterDisplay: React.FC<{ text?: string }> = ({ text: initialText }) => {
  const [text, setText] = useState(initialText || "");
  const [isScrolling, setIsScrolling] = useState(false);
  const [settings, setSettings] = useState<TeleprompterSettings>(loadSettings());
  const [isInverted, setIsInverted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollInterval = useRef<number>();
  const speedRef = useRef(settings.speed);
  const scrollAccumulator = useRef(0);

  const textSizes = {
    "1": "text-[8px]",
    "2": "text-[10px]",
    "3": "text-xs",
    "4": "text-sm",
    "5": "text-base",
    "6": "text-lg",
    "7": "text-xl",
    "8": "text-2xl",
    "9": "text-3xl",
    "10": "text-4xl",
    "11": "text-5xl",
    "12": "text-6xl",
    "13": "text-7xl",
    "14": "text-8xl",
  } as const;

  type TextSizeKey = keyof typeof textSizes;

  useEffect(() => {
    speedRef.current = settings.speed;
    if (isScrolling) {
      clearInterval(scrollInterval.current);
      scrollInterval.current = window.setInterval(() => {
        if (containerRef.current) {
          scrollAccumulator.current += speedRef.current;
          if (scrollAccumulator.current >= 1) {
            const pixels = Math.floor(scrollAccumulator.current);
            containerRef.current.scrollTop += pixels;
            scrollAccumulator.current -= pixels;
          }
        }
      }, 16);
    }
  }, [settings.speed, isScrolling]);

  const toggleScroll = () => {
    if (isScrolling) {
      clearInterval(scrollInterval.current);
      scrollAccumulator.current = 0;
      setIsScrolling(false);
    } else {
      scrollInterval.current = window.setInterval(() => {
        if (containerRef.current) {
          scrollAccumulator.current += speedRef.current;
          if (scrollAccumulator.current >= 1) {
            const pixels = Math.floor(scrollAccumulator.current);
            containerRef.current.scrollTop += pixels;
            scrollAccumulator.current -= pixels;
          }
        }
      }, 16);
      setIsScrolling(true);
    }
  };

  const adjustSpeed = (delta: number) => {
    const newSpeed = Math.max(MIN_SPEED, Math.min(MAX_SPEED, settings.speed + delta));
    updateSettings({ speed: Number(newSpeed.toFixed(1)) });
  };

  const adjustFontSize = (delta: number) => {
    const newSize = Math.max(1, Math.min(14, Number(settings.fontSize) + delta));
    updateSettings({ fontSize: String(newSize) });
  };

  const handleScroll = (direction: "up" | "down") => {
    if (containerRef.current) {
      const scrollAmount = direction === "up" ? -100 : 100;
      containerRef.current.scrollTop += scrollAmount;
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.code) {
        case "Space":
          e.preventDefault();
          toggleScroll();
          break;
        case "ArrowLeft":
          e.preventDefault();
          adjustSpeed(e.shiftKey ? -0.5 : -0.1);
          break;
        case "ArrowRight":
          e.preventDefault();
          adjustSpeed(e.shiftKey ? 0.5 : 0.1);
          break;
        case "ArrowUp":
          e.preventDefault();
          handleScroll("up");
          break;
        case "ArrowDown":
          e.preventDefault();
          handleScroll("down");
          break;
        case "BracketRight":
          e.preventDefault();
          adjustFontSize(e.shiftKey ? 2 : 1);
          break;
        case "BracketLeft":
          e.preventDefault();
          adjustFontSize(e.shiftKey ? -2 : -1);
          break;
        case "KeyI":
          e.preventDefault();
          setIsInverted((prev) => !prev);
          break;
        case "Escape":
          e.preventDefault();
          handleBack();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isScrolling, settings]);

  // Setup IPC listeners
  useEffect(() => {
    window.electron.ipcRenderer.on("toggle-scroll", () => toggleScroll());
    window.electron.ipcRenderer.on("adjust-speed", (_, delta) => adjustSpeed(delta));
    window.electron.ipcRenderer.on("adjust-font", (_, delta) => adjustFontSize(delta));
    window.electron.ipcRenderer.on("scroll", (_, direction) => handleScroll(direction));
    window.electron.ipcRenderer.on("go-back", () => handleBack());
    window.electron.ipcRenderer.on("set-text", (newText) => {
      setText(newText);
    });

    return () => {
      window.electron.ipcRenderer.removeAllListeners("toggle-scroll");
      window.electron.ipcRenderer.removeAllListeners("adjust-speed");
      window.electron.ipcRenderer.removeAllListeners("adjust-font");
      window.electron.ipcRenderer.removeAllListeners("scroll");
      window.electron.ipcRenderer.removeAllListeners("go-back");
      window.electron.ipcRenderer.removeAllListeners("set-text");
    };
  }, []);

  // Calculate initial time estimate when text changes
  useEffect(() => {
    if (containerRef.current && settings.speed > 0 && text) {
      // Wait for content to render
      setTimeout(() => {
        const totalHeight = containerRef.current!.scrollHeight - containerRef.current!.clientHeight;
        const pixelsPerSecond = settings.speed * 60;
        const seconds = totalHeight / pixelsPerSecond;
        setTimeRemaining(seconds);
      }, 100);
    }
  }, [text, settings.speed]);

  const handleBack = () => {
    window.electron.ipcRenderer.send("open-editor");
    window.close();
  };

  // Calculate time remaining
  useEffect(() => {
    const updateRemaining = () => {
      if (!containerRef.current || settings.speed <= 0) {
        setTimeRemaining(null);
        return;
      }

      const totalHeight = containerRef.current.scrollHeight - containerRef.current.clientHeight;
      const currentPosition = containerRef.current.scrollTop;

      // Check if we've reached the bottom
      if (isScrolling && Math.ceil(currentPosition) >= totalHeight) {
        setTimeRemaining(-1);
        return;
      }

      // Calculate remaining time based on current scroll position
      const remainingHeight = totalHeight - currentPosition;
      const pixelsPerSecond = settings.speed * 60;
      const seconds = Math.round(remainingHeight / pixelsPerSecond);

      setTimeRemaining(seconds);
    };

    // Update every frame when scrolling, or once when paused
    updateRemaining();
    if (isScrolling) {
      const interval = setInterval(updateRemaining, 1000);
      return () => clearInterval(interval);
    }
  }, [settings.speed, isScrolling]);

  // Remove the time update from the current time effect
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      now.setMilliseconds(0);
      setCurrentTime(now);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const updateSettings = (updates: Partial<TeleprompterSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Save window dimensions when they change
  useEffect(() => {
    const updateDimensions = () => {
      window.electron.ipcRenderer.send("update-window-size", {
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", updateDimensions);
    updateDimensions(); // Initial save

    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col draggable bg-transparent">
      <div className={`px-4 py-2 ${isInverted ? "bg-gray-200" : "bg-gray-800"} flex justify-between items-center`}>
        <div className={isInverted ? "text-black" : "text-white"}>{currentTime.toLocaleTimeString()}</div>
        <div className={isInverted ? "text-black" : "text-white"}>
          {timeRemaining
            ? timeRemaining === -1
              ? "finished"
              : (() => {
                  const endTime = new Date(currentTime);
                  endTime.setSeconds(endTime.getSeconds() + Math.round(timeRemaining));
                  return `🏁 ${endTime.toLocaleTimeString()}`;
                })()
            : "loading..."}
        </div>
        <div className={isInverted ? "text-black" : "text-white"}>{timeRemaining ? (timeRemaining === -1 ? "finished" : `⏱️ ${Math.floor(timeRemaining / 60)}:${String(Math.floor(timeRemaining % 60)).padStart(2, "0")}`) : "loading..."}</div>
      </div>
      <div className={`h-full w-full overflow-hidden ${isInverted ? "text-black bg-white/20" : "text-white bg-black/20"}`}>
        <div ref={containerRef} className="h-screen w-full overflow-y-auto p-8 hide-scrollbar">
          <div className={`max-w-4xl mx-auto ${textSizes[settings.fontSize as TextSizeKey]} leading-relaxed prose ${isInverted ? "prose-black" : "prose-invert"}`}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ node, ...props }) => <h1 className={`${textSizes[String(Math.min(14, Number(settings.fontSize) + 2)) as TextSizeKey]} mb-8`} {...props} />,
                h2: ({ node, ...props }) => <h2 className={`${textSizes[settings.fontSize as TextSizeKey]} mb-6`} {...props} />,
                h3: ({ node, ...props }) => <h3 className={`${textSizes[String(Math.max(1, Number(settings.fontSize) - 1)) as TextSizeKey]} mb-4`} {...props} />,
                p: ({ node, ...props }) => <p className="mb-6" {...props} />,
                ul: ({ node, ...props }) => <ul className="list-disc ml-8 mb-6" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal ml-8 mb-6" {...props} />,
              }}
            >
              {text}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};
