'use client';

import { useState, useRef } from 'react';
import { useDrag } from 'react-dnd';
import { motion } from 'framer-motion';
import type { ChordPlacement, FontFamily } from '@/types';

interface ChordDisplayProps {
  placement: ChordPlacement;
  fontSize: number;
  fontFamily: FontFamily;
  color: string;
  isEraserMode: boolean;
  onClick: (event: React.MouseEvent) => void;
  onMove?: (id: string, x: number, y: number) => void;
}

/**
 * 配置されたコードを表示するコンポーネント
 */
export function ChordDisplay({
  placement,
  fontSize,
  fontFamily,
  color,
  isEraserMode,
  onClick,
  onMove,
}: ChordDisplayProps) {
  const [isHovered, setIsHovered] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'chord',
    item: { id: placement.id, x: placement.x, y: placement.y },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: !isEraserMode,
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult<{ x: number; y: number }>();
      if (item && dropResult && onMove) {
        onMove(item.id, dropResult.x, dropResult.y);
      }
    },
  });

  const getFontFamilyValue = (family: FontFamily) => {
    switch (family) {
      case 'serif': return 'serif';
      case 'mono': return 'monospace';
      case 'rounded': return 'system-ui, sans-serif';
      default: return 'sans-serif';
    }
  };

  // DnDとFramer Motionの組み合わせ
  drag(buttonRef);

  return (
    <motion.button
      ref={buttonRef}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ 
        scale: isEraserMode ? 1.1 : 1.05,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.95 }}
      className={`absolute z-10 px-1 py-0.5 rounded font-medium select-none chord ${
        isEraserMode 
          ? 'hover:bg-red-100 hover:border-red-300 border-2 border-transparent cursor-pointer' 
          : isDragging
          ? 'cursor-grabbing opacity-50'
          : 'hover:bg-opacity-80 cursor-grab'
      } ${isHovered ? 'shadow-md' : 'shadow-sm'}`}
      style={{
        left: placement.x,
        top: placement.y,
        fontSize: `${fontSize}px`,
        fontFamily: getFontFamilyValue(fontFamily),
        color: color,
        backgroundColor: isEraserMode && isHovered ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.9)',
        borderColor: isEraserMode && isHovered ? '#ef4444' : 'transparent',
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={isEraserMode ? `クリックして「${placement.chord}」を削除` : placement.chord}
    >
      <motion.span
        initial={{ y: 0 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {placement.chord}
      </motion.span>
      {isEraserMode && isHovered && (
        <motion.span 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="ml-1 text-red-500 text-xs"
        >
          ×
        </motion.span>
      )}
    </motion.button>
  );
}
