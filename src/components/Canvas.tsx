"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Trash2, GripVertical, Move } from "lucide-react";
import { useApp } from "@/lib/store";
import type { Idea, CanvasElement } from "@/types";

const CANVAS_WIDTH = 3000;
const CANVAS_HEIGHT = 2000;

interface CanvasProps {
  idea: Idea;
  mode: "select" | "draw" | "text" | "image" | "table";
  brushColor: string;
  brushSize: number;
}

export function Canvas({ idea, mode, brushColor, brushSize }: CanvasProps) {
  const { addCanvasElement, updateCanvasElement, removeCanvasElement, updateCanvasDrawing } = useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });
  const [draggedElement, setDraggedElement] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [editingText, setEditingText] = useState<string | null>(null);
  const [tableDimensions, setTableDimensions] = useState({ rows: 3, cols: 3 });

  // Initialize drawing canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (idea.canvasDrawing) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = idea.canvasDrawing;
    }
  }, [idea.id, idea.canvasDrawing]);

  const getCanvasCoordinates = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (mode === "draw") {
      const coords = getCanvasCoordinates(e);
      setIsDrawing(true);

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.beginPath();
          ctx.moveTo(coords.x, coords.y);
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.strokeStyle = brushColor;
          ctx.lineWidth = brushSize;
        }
      }
    } else if (mode === "select" && !draggedElement && e.target === wrapperRef.current) {
      // Start panning when clicking empty space in select mode
      const container = scrollContainerRef.current;
      if (!container) return;
      setIsPanning(true);
      setPanStart({
        x: e.clientX,
        y: e.clientY,
        scrollLeft: container.scrollLeft,
        scrollTop: container.scrollTop,
      });
    }
  }, [mode, brushColor, brushSize, getCanvasCoordinates, draggedElement]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (mode === "draw" && isDrawing) {
      const coords = getCanvasCoordinates(e);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.lineTo(coords.x, coords.y);
          ctx.stroke();
        }
      }
    } else if (isPanning) {
      const container = scrollContainerRef.current;
      if (!container) return;
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      container.scrollLeft = panStart.scrollLeft - dx;
      container.scrollTop = panStart.scrollTop - dy;
    }
  }, [mode, isDrawing, isPanning, panStart, getCanvasCoordinates]);

  const handleMouseUp = useCallback(() => {
    if (mode === "draw" && isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      if (canvas) {
        updateCanvasDrawing(idea.id, canvas.toDataURL());
      }
    }
    if (isPanning) {
      setIsPanning(false);
    }
  }, [mode, isDrawing, isPanning, idea.id, updateCanvasDrawing]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    // Only handle click if not panning and not dragging an element
    if (isPanning || draggedElement) return;

    if (mode === "text") {
      const coords = getCanvasCoordinates(e);
      addCanvasElement(idea.id, {
        type: "text",
        x: coords.x,
        y: coords.y,
        width: 300,
        height: 40,
        content: "Haz doble clic para editar",
      });
    } else if (mode === "table") {
      const coords = getCanvasCoordinates(e);
      const tableData: string[][] = [];
      for (let i = 0; i < tableDimensions.rows; i++) {
        const row: string[] = [];
        for (let j = 0; j < tableDimensions.cols; j++) {
          row.push(i === 0 ? `Columna ${j + 1}` : "");
        }
        tableData.push(row);
      }
      addCanvasElement(idea.id, {
        type: "table",
        x: coords.x,
        y: coords.y,
        width: tableDimensions.cols * 120,
        height: tableDimensions.rows * 40 + 30,
        content: "Tabla",
        tableData,
      });
    } else if (mode === "image") {
      fileInputRef.current?.click();
    }
  }, [mode, isPanning, draggedElement, getCanvasCoordinates, idea.id, addCanvasElement, tableDimensions]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 400;
        const scale = Math.min(1, maxWidth / img.width);
        addCanvasElement(idea.id, {
          type: "image",
          x: 100,
          y: 100,
          width: img.width * scale,
          height: img.height * scale,
          content: file.name,
          src: event.target?.result as string,
        });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, [idea.id, addCanvasElement]);

  const handleElementMouseDown = useCallback((e: React.MouseEvent, elementId: string) => {
    if (mode !== "select") return;
    e.stopPropagation();
    const element = idea.canvasElements.find((el) => el.id === elementId);
    if (!element) return;

    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const rect = wrapper.getBoundingClientRect();
    setDraggedElement(elementId);
    setDragOffset({
      x: e.clientX - rect.left - element.x,
      y: e.clientY - rect.top - element.y,
    });
  }, [mode, idea.canvasElements]);

  const handleElementMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggedElement) return;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const rect = wrapper.getBoundingClientRect();
    const newX = e.clientX - rect.left - dragOffset.x;
    const newY = e.clientY - rect.top - dragOffset.y;

    updateCanvasElement(idea.id, draggedElement, {
      x: Math.max(0, Math.min(CANVAS_WIDTH - 50, newX)),
      y: Math.max(0, Math.min(CANVAS_HEIGHT - 50, newY)),
    });
  }, [draggedElement, dragOffset, idea.id, updateCanvasElement]);

  const handleElementMouseUp = useCallback(() => {
    setDraggedElement(null);
  }, []);

  const handleTextEdit = useCallback((elementId: string, newContent: string) => {
    updateCanvasElement(idea.id, elementId, { content: newContent });
    setEditingText(null);
  }, [idea.id, updateCanvasElement]);

  const handleTableCellEdit = useCallback((elementId: string, row: number, col: number, value: string) => {
    const element = idea.canvasElements.find((el) => el.id === elementId);
    if (!element || !element.tableData) return;

    const newTableData = element.tableData.map((r, ri) =>
      r.map((c, ci) => (ri === row && ci === col ? value : c))
    );
    updateCanvasElement(idea.id, elementId, { tableData: newTableData });
  }, [idea.id, idea.canvasElements, updateCanvasElement]);

  // Cursor style based on mode
  const cursorStyle =
    mode === "draw"
      ? "crosshair"
      : mode === "select"
      ? isPanning
        ? "grabbing"
        : "grab"
      : "crosshair";

  return (
    <div
      ref={scrollContainerRef}
      className="relative w-full h-full overflow-auto bg-white"
      style={{ cursor: cursorStyle }}
    >
      {/* Large canvas wrapper */}
      <div
        ref={wrapperRef}
        className="relative"
        style={{
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          minWidth: CANVAS_WIDTH,
          minHeight: CANVAS_HEIGHT,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={(e) => {
          handleMouseMove(e);
          handleElementMouseMove(e);
        }}
        onMouseUp={() => {
          handleMouseUp();
          handleElementMouseUp();
        }}
        onMouseLeave={() => {
          handleMouseUp();
          handleElementMouseUp();
        }}
        onClick={handleCanvasClick}
      >
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#E8E6E1 1px, transparent 1px), linear-gradient(90deg, #E8E6E1 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            opacity: 0.4,
          }}
        />

        {/* Drawing canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 z-0"
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          style={{ pointerEvents: mode === "draw" ? "auto" : "none" }}
        />

        {/* Canvas elements */}
        {idea.canvasElements.map((element) => (
          <CanvasElementComponent
            key={element.id}
            element={element}
            isDragging={draggedElement === element.id}
            isEditing={editingText === element.id}
            mode={mode}
            onMouseDown={(e) => handleElementMouseDown(e, element.id)}
            onStartEdit={() => setEditingText(element.id)}
            onFinishEdit={(content) => handleTextEdit(element.id, content)}
            onUpdateTableCell={(row, col, value) => handleTableCellEdit(element.id, row, col, value)}
            onDelete={() => removeCanvasElement(idea.id, element.id)}
          />
        ))}

        {/* Hidden file input for images */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Empty state hint */}
        {idea.canvasElements.length === 0 && !idea.canvasDrawing && mode === "select" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-sm text-[#8C8C8C]/50 font-medium mb-1">
                Canvas vacío
              </p>
              <p className="text-xs text-[#8C8C8C]/40">
                Selecciona una herramienta para empezar a crear
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Table dimension selector (shown when in table mode) */}
      {mode === "table" && (
        <div className="fixed bottom-6 left-[340px] z-30 bg-white rounded-xl shadow-lg border border-[#E8E6E1] p-4">
          <p className="text-xs font-medium text-[#8C8C8C] mb-2">Dimensiones de tabla</p>
          <div className="flex items-center gap-3">
            <div>
              <label className="text-[10px] text-[#8C8C8C] uppercase tracking-wide">Filas</label>
              <input
                type="number"
                min="1"
                max="10"
                value={tableDimensions.rows}
                onChange={(e) => setTableDimensions({ ...tableDimensions, rows: Number(e.target.value) })}
                className="w-16 h-8 border border-[#E8E6E1] rounded-md text-sm text-center mt-1"
              />
            </div>
            <div>
              <label className="text-[10px] text-[#8C8C8C] uppercase tracking-wide">Columnas</label>
              <input
                type="number"
                min="1"
                max="10"
                value={tableDimensions.cols}
                onChange={(e) => setTableDimensions({ ...tableDimensions, cols: Number(e.target.value) })}
                className="w-16 h-8 border border-[#E8E6E1] rounded-md text-sm text-center mt-1"
              />
            </div>
          </div>
        </div>
      )}

      {/* Canvas size indicator */}
      <div className="fixed bottom-4 right-4 z-30 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 text-[10px] text-[#8C8C8C] border border-[#E8E6E1] shadow-sm">
        {CANVAS_WIDTH} x {CANVAS_HEIGHT}px
      </div>
    </div>
  );
}

interface CanvasElementComponentProps {
  element: CanvasElement;
  isDragging: boolean;
  isEditing: boolean;
  mode: string;
  onMouseDown: (e: React.MouseEvent) => void;
  onStartEdit: () => void;
  onFinishEdit: (content: string) => void;
  onUpdateTableCell: (row: number, col: number, value: string) => void;
  onDelete: () => void;
}

function CanvasElementComponent({
  element,
  isDragging,
  isEditing,
  mode,
  onMouseDown,
  onStartEdit,
  onFinishEdit,
  onUpdateTableCell,
  onDelete,
}: CanvasElementComponentProps) {
  const [editValue, setEditValue] = useState(element.content);

  useEffect(() => {
    setEditValue(element.content);
  }, [element.content]);

  return (
    <motion.div
      className="absolute group"
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        minHeight: element.height,
        cursor: mode === "select" ? (isDragging ? "grabbing" : "grab") : "default",
        zIndex: isDragging ? 50 : 10,
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      onMouseDown={onMouseDown}
    >
      {/* Element controls */}
      {mode === "select" && (
        <div className="absolute -top-8 right-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="p-1 rounded-md bg-white shadow-sm border border-[#E8E6E1]">
            <GripVertical className="w-3 h-3 text-[#8C8C8C]" />
          </div>
          <div
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 rounded-md bg-white shadow-sm border border-[#E8E6E1] hover:bg-[#B54242] hover:text-white transition-colors cursor-pointer"
          >
            <Trash2 className="w-3 h-3 text-[#8C8C8C] hover:text-white" />
          </div>
        </div>
      )}

      {/* Text Element */}
      {element.type === "text" && (
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm border border-[#E8E6E1] hover:border-[#C4705A]/50 transition-colors">
          {isEditing ? (
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => onFinishEdit(editValue)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onFinishEdit(editValue);
                }
              }}
              autoFocus
              className="w-full bg-transparent resize-none outline-none text-sm text-[#1A1A1A]"
              style={element.style}
              rows={3}
            />
          ) : (
            <div
              onDoubleClick={onStartEdit}
              className="text-sm text-[#1A1A1A] whitespace-pre-wrap"
              style={element.style}
            >
              {element.content}
            </div>
          )}
        </div>
      )}

      {/* Image Element */}
      {element.type === "image" && element.src && (
        <div className="relative rounded-lg overflow-hidden shadow-md border border-[#E8E6E1]">
          <img
            src={element.src}
            alt={element.content}
            className="w-full h-auto object-cover"
            draggable={false}
          />
        </div>
      )}

      {/* Table Element */}
      {element.type === "table" && element.tableData && (
        <div className="bg-white rounded-lg shadow-sm border border-[#E8E6E1] overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {element.tableData.map((row, rowIndex) => (
                <tr key={rowIndex} className={rowIndex === 0 ? "bg-[#F5F3EF]" : "border-t border-[#E8E6E1]"}>
                  {row.map((cell, colIndex) => (
                    <td key={colIndex} className="px-3 py-2 min-w-[80px]">
                      <input
                        type="text"
                        value={cell}
                        onChange={(e) => onUpdateTableCell(rowIndex, colIndex, e.target.value)}
                        className="w-full bg-transparent outline-none text-[#1A1A1A] text-sm"
                        style={{ fontWeight: rowIndex === 0 ? 600 : 400 }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
