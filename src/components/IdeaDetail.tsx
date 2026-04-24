"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pencil,
  ImageIcon,
  Type,
  Table,
  Trash2,
  Save,
  X,
  Calendar,
  Clock,
  Eraser,
  LayoutGrid,
  PenTool,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Canvas } from "@/components/Canvas";
import { IdeaScrumBoard } from "@/components/IdeaScrumBoard";
import type { IdeaStatus } from "@/types";

const statusColors: Record<IdeaStatus, string> = {
  idea: "#8C8C8C",
  planning: "#C4705A",
  "in-progress": "#1A1A1A",
  paused: "#D4A574",
  completed: "#5A8C6E",
};

const statusLabels: Record<IdeaStatus, string> = {
  idea: "Idea",
  planning: "Planificación",
  "in-progress": "En progreso",
  paused: "Pausado",
  completed: "Completado",
};

export function IdeaDetail() {
  const { ideas, selectedIdeaId, updateIdea, clearCanvasDrawing, getTasksByIdea } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [activeTab, setActiveTab] = useState<"canvas" | "tasks">("canvas");
  const [canvasMode, setCanvasMode] = useState<"select" | "draw" | "text" | "image" | "table">("select");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [brushColor, setBrushColor] = useState("#1A1A1A");
  const [brushSize, setBrushSize] = useState(2);

  const selectedIdea = ideas.find((i) => i.id === selectedIdeaId);
  const taskCount = selectedIdea ? getTasksByIdea(selectedIdea.id).length : 0;

  if (!selectedIdea) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-16 h-16 rounded-full bg-[#F5F3EF] flex items-center justify-center mx-auto mb-4">
            <Pencil className="w-7 h-7 text-[#8C8C8C]" />
          </div>
          <h2 className="font-[family-name:var(--font-fraunces)] text-xl text-[#1A1A1A] mb-2">
            Selecciona una idea
          </h2>
          <p className="text-sm text-[#8C8C8C] max-w-xs mx-auto">
            Elige una idea del panel lateral para ver sus detalles y trabajar en su canvas.
          </p>
        </motion.div>
      </div>
    );
  }

  const handleStartEdit = () => {
    setEditTitle(selectedIdea.title);
    setEditDescription(selectedIdea.description);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    updateIdea(selectedIdea.id, {
      title: editTitle,
      description: editDescription,
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 px-8 py-6 border-b border-[#E8E6E1] bg-white/50 backdrop-blur-sm">
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="edit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="text-xl font-[family-name:var(--font-fraunces)] h-12 border-[#E8E6E1] rounded-lg focus-visible:ring-[#C4705A]"
              />
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={2}
                className="border-[#E8E6E1] rounded-lg focus-visible:ring-[#C4705A] resize-none"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveEdit}
                  size="sm"
                  className="rounded-lg bg-[#1A1A1A] hover:bg-[#333333] text-[#FAF9F6]"
                >
                  <Save className="w-4 h-4 mr-1.5" />
                  Guardar
                </Button>
                <Button
                  onClick={handleCancelEdit}
                  size="sm"
                  variant="outline"
                  className="rounded-lg border-[#E8E6E1]"
                >
                  <X className="w-4 h-4 mr-1.5" />
                  Cancelar
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span
                    className="text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full"
                    style={{
                      backgroundColor: `${statusColors[selectedIdea.status]}15`,
                      color: statusColors[selectedIdea.status],
                    }}
                  >
                    {statusLabels[selectedIdea.status]}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-[#8C8C8C]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(selectedIdea.createdAt)}</span>
                  </div>
                  {selectedIdea.updatedAt.getTime() !== selectedIdea.createdAt.getTime() && (
                    <div className="flex items-center gap-1.5 text-xs text-[#8C8C8C]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Actualizado {formatDate(selectedIdea.updatedAt)}</span>
                    </div>
                  )}
                </div>
                <Button
                  onClick={handleStartEdit}
                  variant="ghost"
                  size="sm"
                  className="text-[#8C8C8C] hover:text-[#1A1A1A] hover:bg-[#F5F3EF] rounded-lg"
                >
                  <Pencil className="w-4 h-4 mr-1.5" />
                  Editar
                </Button>
              </div>

              <h1 className="font-[family-name:var(--font-fraunces)] text-3xl font-medium text-[#1A1A1A] mb-3 leading-tight">
                {selectedIdea.title}
              </h1>

              <p className="text-[15px] text-[#8C8C8C] leading-relaxed max-w-3xl">
                {selectedIdea.description}
              </p>

              {selectedIdea.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {selectedIdea.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2.5 py-1 rounded-md bg-[#F5F3EF] text-[#8C8C8C]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 px-8 border-b border-[#E8E6E1] bg-[#FAF9F6]">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("canvas")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
              activeTab === "canvas"
                ? "border-[#1A1A1A] text-[#1A1A1A]"
                : "border-transparent text-[#8C8C8C] hover:text-[#1A1A1A]"
            }`}
          >
            <PenTool className="w-4 h-4" />
            Canvas
          </button>
          <button
            onClick={() => setActiveTab("tasks")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
              activeTab === "tasks"
                ? "border-[#1A1A1A] text-[#1A1A1A]"
                : "border-transparent text-[#8C8C8C] hover:text-[#1A1A1A]"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Tareas
            {taskCount > 0 && (
              <span className="text-[10px] bg-[#F5F3EF] text-[#8C8C8C] px-1.5 py-0.5 rounded-full">
                {taskCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === "canvas" ? (
            <motion.div
              key="canvas"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col h-full"
            >
              {/* Canvas Toolbar */}
              <div className="flex-shrink-0 px-8 py-3 border-b border-[#E8E6E1] bg-[#FAF9F6] flex items-center gap-2">
                <span className="text-xs font-medium text-[#8C8C8C] mr-2">Canvas</span>

                <Tooltip>
                  <TooltipTrigger>
                    <button
                      onClick={() => setCanvasMode("select")}
                      className={`p-2 rounded-lg transition-smooth ${
                        canvasMode === "select"
                          ? "bg-[#1A1A1A] text-[#FAF9F6]"
                          : "hover:bg-[#F5F3EF] text-[#8C8C8C]"
                      }`}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Seleccionar</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger>
                    <button
                      onClick={() => setCanvasMode("draw")}
                      className={`p-2 rounded-lg transition-smooth ${
                        canvasMode === "draw"
                          ? "bg-[#1A1A1A] text-[#FAF9F6]"
                          : "hover:bg-[#F5F3EF] text-[#8C8C8C]"
                      }`}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 19l7-7 3 3-7 7-3-3z" />
                        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                        <path d="M2 2l7.586 7.586" />
                        <circle cx="11" cy="11" r="2" />
                      </svg>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Dibujar</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger>
                    <button
                      onClick={() => setCanvasMode("text")}
                      className={`p-2 rounded-lg transition-smooth ${
                        canvasMode === "text"
                          ? "bg-[#1A1A1A] text-[#FAF9F6]"
                          : "hover:bg-[#F5F3EF] text-[#8C8C8C]"
                      }`}
                    >
                      <Type className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Texto</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger>
                    <button
                      onClick={() => setCanvasMode("image")}
                      className={`p-2 rounded-lg transition-smooth ${
                        canvasMode === "image"
                          ? "bg-[#1A1A1A] text-[#FAF9F6]"
                          : "hover:bg-[#F5F3EF] text-[#8C8C8C]"
                      }`}
                    >
                      <ImageIcon className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Imagen</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger>
                    <button
                      onClick={() => setCanvasMode("table")}
                      className={`p-2 rounded-lg transition-smooth ${
                        canvasMode === "table"
                          ? "bg-[#1A1A1A] text-[#FAF9F6]"
                          : "hover:bg-[#F5F3EF] text-[#8C8C8C]"
                      }`}
                    >
                      <Table className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Tabla</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger>
                    <button
                      onClick={() => {
                        if (selectedIdea) {
                          clearCanvasDrawing(selectedIdea.id);
                        }
                      }}
                      className="p-2 rounded-lg transition-smooth hover:bg-[#F5F3EF] text-[#8C8C8C]"
                    >
                      <Eraser className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Limpiar canvas</p>
                  </TooltipContent>
                </Tooltip>

                <Separator orientation="vertical" className="h-6 mx-2 bg-[#E8E6E1]" />

                {canvasMode === "draw" && (
                  <>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: brushColor }}
                      />
                      <input
                        type="range"
                        min="1"
                        max="20"
                        value={brushSize}
                        onChange={(e) => setBrushSize(Number(e.target.value))}
                        className="w-20 accent-[#C4705A]"
                      />
                      <span className="text-xs text-[#8C8C8C] w-4">{brushSize}</span>
                    </div>
                    {showColorPicker && (
                      <div className="flex items-center gap-1.5">
                        {["#1A1A1A", "#C4705A", "#5A8C6E", "#D4A574", "#6B7DB3", "#B54242"].map((color) => (
                          <button
                            key={color}
                            onClick={() => {
                              setBrushColor(color);
                              setShowColorPicker(false);
                            }}
                            className="w-5 h-5 rounded-full border border-[#E8E6E1] hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Canvas Area */}
              <div className="flex-1 overflow-hidden bg-[#F5F3EF]">
                <Canvas
                  idea={selectedIdea}
                  mode={canvasMode}
                  brushColor={brushColor}
                  brushSize={brushSize}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="tasks"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              <IdeaScrumBoard ideaId={selectedIdea.id} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
