import { useState } from "react";

interface DiamondTrackerProps {
  value: number;
  max: number;
  onChange?: (newValue: number) => void;
  readOnly?: boolean;
}

export default function DiamondTracker({ value, max, onChange, readOnly = false }: DiamondTrackerProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleClick = (index: number) => {
    if (readOnly || !onChange) return;
    // If clicking the current value, it doesn't decrease. Or maybe it toggles?
    // Let's make it so clicking sets the value to index + 1. 
    // If clicking the currently selected max diamond, maybe clear it?
    if (value === index + 1) {
      onChange(index); // Decrease by 1
    } else {
      onChange(index + 1);
    }
  };

  return (
    <div className="flex gap-1.5 items-center">
      {Array.from({ length: max }).map((_, index) => {
        const isFilled = index < value;
        const isHovered = hoveredIndex !== null && index <= hoveredIndex;
        
        return (
          <button
            key={index}
            onClick={() => handleClick(index)}
            onMouseEnter={() => !readOnly && setHoveredIndex(index)}
            onMouseLeave={() => !readOnly && setHoveredIndex(null)}
            disabled={readOnly}
            className={`w-3.5 h-3.5 rotate-45 transition-colors border-[1.5px] ${
              isFilled 
                ? "bg-slate-900 border-slate-900" 
                : isHovered 
                  ? "bg-slate-300 border-slate-400" 
                  : "bg-white border-slate-900"
            } ${readOnly ? "cursor-default" : "cursor-pointer"}`}
            aria-label={`Set value to ${index + 1}`}
          />
        );
      })}
    </div>
  );
}
