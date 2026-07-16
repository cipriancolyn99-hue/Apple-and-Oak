import { useRef, useCallback, useState, useEffect } from 'react';
import { useDesktopStore } from '@/hooks/useDesktopStore';
import type { WindowData } from '@/types';
import { X, Minus, Square, GripVertical } from 'lucide-react';

interface WindowProps {
  windowData: WindowData;
  children: React.ReactNode;
}

export function Window({ windowData, children }: WindowProps) {
  const { closeWindow, minimizeWindow, focusWindow, updateWindowPosition, updateWindowSize } = useDesktopStore();
  const windowRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const [viewport, setViewport] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Track viewport size for responsive constraints
  useEffect(() => {
    const handleResize = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Constrain window to viewport on mount and resize
  useEffect(() => {
    const vw = viewport.width;
    const vh = viewport.height;
    const isMobile = vw < 768;

    // Calculate max size
    const maxWidth = isMobile ? vw - 16 : Math.min(windowData.size.width, vw - 40);
    const maxHeight = isMobile ? vh - 100 : Math.min(windowData.size.height, vh - 100);

    // Ensure position is within viewport
    const maxX = vw - maxWidth;
    const maxY = vh - maxHeight;
    const newX = isMobile ? 8 : Math.max(0, Math.min(windowData.position.x, maxX));
    const newY = isMobile ? 60 : Math.max(0, Math.min(windowData.position.y, maxY));

    if (newX !== windowData.position.x || newY !== windowData.position.y ||
        maxWidth !== windowData.size.width || maxHeight !== windowData.size.height) {
      updateWindowPosition(windowData.id, { x: newX, y: newY });
      updateWindowSize(windowData.id, { width: maxWidth, height: maxHeight });
    }
  }, [viewport.width, viewport.height]);

  const handleMouseDown = useCallback(() => { focusWindow(windowData.id); }, [focusWindow, windowData.id]);

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.window-control')) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - windowData.position.x, y: e.clientY - windowData.position.y };
  }, [windowData.position]);

  const handleDragMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      const newX = Math.max(0, e.clientX - dragStart.current.x);
      const newY = Math.max(0, e.clientY - dragStart.current.y);
      updateWindowPosition(windowData.id, { x: newX, y: newY });
    }
    if (isResizing) {
      const newWidth = Math.max(320, resizeStart.current.width + (e.clientX - resizeStart.current.x));
      const newHeight = Math.max(250, resizeStart.current.height + (e.clientY - resizeStart.current.y));
      updateWindowSize(windowData.id, { width: newWidth, height: newHeight });
    }
  }, [isDragging, isResizing, windowData.id, updateWindowPosition, updateWindowSize]);

  const handleDragEnd = useCallback(() => { setIsDragging(false); setIsResizing(false); }, []);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    resizeStart.current = { x: e.clientX, y: e.clientY, width: windowData.size.width, height: windowData.size.height };
  }, [windowData.size]);

  // Touch support for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('.window-control')) return;
    const touch = e.touches[0];
    setIsDragging(true);
    dragStart.current = { x: touch.clientX - windowData.position.x, y: touch.clientY - windowData.position.y };
  }, [windowData.position]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const newX = Math.max(0, touch.clientX - dragStart.current.x);
    const newY = Math.max(0, touch.clientY - dragStart.current.y);
    updateWindowPosition(windowData.id, { x: newX, y: newY });
  }, [isDragging, windowData.id, updateWindowPosition]);

  const isMobile = viewport.width < 768;

  return (
    <div
      ref={windowRef}
      className={`absolute rounded-xl overflow-hidden shadow-2xl border border-white/20 flex flex-col ${isMobile ? 'touch-none' : ''}`}
      style={{
        left: isMobile ? 8 : windowData.position.x,
        top: isMobile ? 60 : windowData.position.y,
        width: isMobile ? viewport.width - 16 : windowData.size.width,
        height: isMobile ? viewport.height - 80 : windowData.size.height,
        zIndex: windowData.zIndex,
        cursor: isDragging ? 'grabbing' : 'default',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleDragEnd}
    >
      {/* Title Bar */}
      <div
        className="h-10 bg-gradient-to-r from-[#1a2744] to-[#243352] flex items-center px-3 select-none shrink-0"
        onMouseDown={handleDragStart}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <GripVertical className="w-4 h-4 text-white/30 mr-2" />
        <span className="text-white text-sm font-medium flex-1 truncate">{windowData.title}</span>
        <div className="flex gap-1.5 window-control">
          <button onClick={() => minimizeWindow(windowData.id)} className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <Minus className="w-3.5 h-3.5 text-white/70" />
          </button>
          <button onClick={() => {}} className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <Square className="w-3 h-3 text-white/70" />
          </button>
          <button onClick={() => closeWindow(windowData.id)} className="w-7 h-7 rounded-lg bg-red-500/80 hover:bg-red-600 flex items-center justify-center transition-colors">
            <X className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-[#0f1923]/95 backdrop-blur-sm overflow-auto min-h-0">
        {children}
      </div>

      {/* Resize Handle — hidden on mobile */}
      {!isMobile && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          onMouseDown={handleResizeStart}
          style={{ background: 'linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.3) 50%)' }}
        />
      )}
    </div>
  );
}
