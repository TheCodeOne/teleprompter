import React from "react";

export const TitleBar: React.FC = () => {
  return (
    <div className="h-8 bg-gray-800 flex items-center justify-center draggable select-none cursor-move">
      <div className="text-gray-400 text-sm select-none">Teleprompter</div>
    </div>
  );
};
