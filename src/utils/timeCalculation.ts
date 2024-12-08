import { TeleprompterSettings } from '../types/settings';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';

export const calculateScrollTime = (text: string, speed: number, fontSize: string, settings: TeleprompterSettings): number => {
  // Create a div that matches the display's structure exactly
  const div = document.createElement('div');
  div.className = 'h-screen w-full overflow-y-auto p-8';
  div.style.cssText = `
    position: absolute;
    visibility: hidden;
    height: ${settings.windowHeight}px;
    width: ${settings.windowWidth}px;
  `;
  
  const content = document.createElement('div');
  content.className = `max-w-4xl mx-auto ${textSizes[fontSize as TextSizeKey]} leading-relaxed prose prose-invert`;
  
  // Render markdown content
  const markdownContent = createElement(ReactMarkdown, {
    remarkPlugins: [remarkGfm],
    components: {
      h1: ({ ...props }) => createElement('h1', { 
        className: `${textSizes[String(Math.min(14, Number(fontSize) + 2)) as TextSizeKey]} mb-8`,
        ...props 
      }),
      h2: ({ ...props }) => createElement('h2', { 
        className: `${textSizes[fontSize as TextSizeKey]} mb-6`,
        ...props 
      }),
      h3: ({ ...props }) => createElement('h3', { 
        className: `${textSizes[String(Math.max(1, Number(fontSize) - 1)) as TextSizeKey]} mb-4`,
        ...props 
      }),
      p: ({ ...props }) => createElement('p', { className: 'mb-6', ...props }),
      ul: ({ ...props }) => createElement('ul', { className: 'list-disc ml-8 mb-6', ...props }),
      ol: ({ ...props }) => createElement('ol', { className: 'list-decimal ml-8 mb-6', ...props }),
    },
    children: text
  });
  
  content.innerHTML = renderToString(markdownContent);
  div.appendChild(content);
  document.body.appendChild(div);
  
  const totalHeight = div.scrollHeight - div.clientHeight;
  document.body.removeChild(div);
  
  // Calculate time using the same formula as TeleprompterDisplay
  const pixelsPerSecond = speed * 60;
  return Math.round(totalHeight / pixelsPerSecond);
};

type TextSizeKey = keyof typeof textSizes;

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