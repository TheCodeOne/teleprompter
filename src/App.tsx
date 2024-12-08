import React from "react";
import { Routes, Route } from "react-router-dom";
import { Editor, TeleprompterDisplay, Preview, About } from "./components";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Editor />} />
      <Route path="/editor" element={<Editor />} />
      <Route path="/teleprompter" element={<TeleprompterDisplay />} />
      <Route path="/preview" element={<Preview />} />
      <Route path="/about" element={<About />} />
    </Routes>
  );
};

export default App;
