"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GripVertical, Calendar, Tag } from "lucide-react";
import { useApp } from "@/lib/store";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Idea, IdeaStatus } from "@/types";

const statusColumns: { key: IdeaStatus; label: string; color: string; bgColor: string }[] = [
  { key: "idea", label: "Idea", color: "#8C8C8C", bgColor: "#F5F3EF" },
  { key: "planning", label: "Planificación", color: "#C4705A", bgColor: "#FDF6F4" },
  { key: "in-progress", label: "En progreso", color: "#1A1A1A", bgColor: "#F5F5F5" },
  { key: "paused", label: "Pausado", color: "#D4A574", bgColor: "#FDF9F4" },
  { key: "completed", label: "Completado", color: "#5A8C6E", bgColor: "#F4F9F6" },
];

export function ScrumBoard() {
  const { ideas, selectIdea, moveIdeaStatus, setViewMode } = useApp();
  const [draggedIdea, setDraggedIdea] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<IdeaStatus | null>(null);

  const handleDragStart = (e: React.DragEvent, ideaId: string) => {
    setDraggedIdea(ideaId);
    e.dataTransfer.effectAllowed = "move";
    // Create a custom drag image
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    e.dataTransfer.setDragImage(el, rect.width / 2, 20);
  };

  const handleDragOver = (e: React.DragEvent, status: IdeaStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, status: IdeaStatus) => {
    e.preventDefault();
    if (draggedIdea) {
      moveIdeaStatus(draggedIdea, status);
    }
    setDraggedIdea(null);
    setDragOverColumn(null);
  };

  const handleDragEnd = () => {
    setDraggedIdea(null);
    setDragOverColumn(null);
  };

  const getIdeasByStatus = (status: IdeaStatus) =>
    ideas.filter((idea) => idea.status === status);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "short",
    }).format(date);
  };

  return (
    <div className="flex flex-col h-full bg-[#FAF9F6]">
      {/* Header */}
      <div className="flex-shrink-0 px-8 py-6 border-b border-[#E8E6E1]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-medium text-[#1A1A1A]">
              Tablero Scrum
            </h1>
            <p className="text-sm text-[#8C8C8C] mt-1">
              Arrastra las ideas entre columnas para cambiar su estado
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-[#8C8C8C]">
              <span className="w-2 h-2 rounded-full bg-[#8C8C8C]" />
              {ideas.filter((i) => i.status === "idea").length} ideas
              <span className="w-2 h-2 rounded-full bg-[#1A1A1A] ml-2" />
              {ideas.filter((i) => i.status === "in-progress").length} en progreso
              <span className="w-2 h-2 rounded-full bg-[#5A8C6E] ml-2" />
              {ideas.filter((i) => i.status === "completed").length} completadas
            </div>
          </div>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex h-full gap-4 px-8 py-6 min-w-max">
          {statusColumns.map((column) => {
            const columnIdeas = getIdeasByStatus(column.key);
            const isDragOver = dragOverColumn === column.key;

            return (
              <div
                key={column.key}
                className={`flex flex-col w-[300px] h-full rounded-2xl transition-colors ${
                  isDragOver ? "ring-2 ring-[#C4705A]/30 bg-[#FDF6F4]" : ""
                }`}
                onDragOver={(e) => handleDragOver(e, column.key)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.key)}
              >
                {/* Column header */}
                <div className="flex items-center justify-between px-4 py-3 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: column.color }}
                    />
                    <h3 className="font-[family-name:var(--font-fraunces)] text-sm font-medium text-[#1A1A1A]">
                      {column.label}
                    </h3>
                    <span className="text-xs text-[#8C8C8C] bg-[#F5F3EF] px-2 py-0.5 rounded-full">
                      {columnIdeas.length}
                    </span>
                  </div>
                </div>

                {/* Column content */}
                <ScrollArea className="flex-1">
                  <div className="px-2 pb-4 space-y-2">
                    <AnimatePresence mode="popLayout">
                      {columnIdeas.map((idea) => (
                        <ScrumCard
                          key={idea.id}
                          idea={idea}
                          onDragStart={(e) => handleDragStart(e, idea.id)}
                          onDragEnd={handleDragEnd}
                          onClick={() => {
                            selectIdea(idea.id);
                            setViewMode("list");
                          }}
                        />
                      ))}
                    </AnimatePresence>

                    {columnIdeas.length === 0 && (
                      <div className="text-center py-8 px-4">
                        <p className="text-xs text-[#8C8C8C]/60">
                          Suelta ideas aquí
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface ScrumCardProps {
  idea: Idea;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onClick: () => void;
}

function ScrumCard({ idea, onDragStart, onDragEnd, onClick }: ScrumCardProps) {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      <div
        draggable
        onDragStart={(e) => {
          setIsDragging(true);
          onDragStart(e);
        }}
        onDragEnd={() => {
          setIsDragging(false);
          onDragEnd();
        }}
        onClick={onClick}
        className={`group bg-white rounded-xl border border-[#E8E6E1] p-3.5 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-[#C4705A]/20 transition-all ${
          isDragging ? "opacity-50 rotate-2" : ""
        }`}
      >
        {/* Cover / Emoji */}
        {idea.coverImage && (
          <div className="w-full h-24 rounded-lg overflow-hidden mb-3">
            <img
              src={idea.coverImage}
              alt=""
              className="w-full h-full object-cover"
              draggable={false}
            />
          </div>
        )}

        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {!idea.coverImage && idea.coverEmoji && (
              <span className="text-lg">{idea.coverEmoji}</span>
            )}
            <h4 className="font-[family-name:var(--font-fraunces)] text-sm font-medium text-[#1A1A1A] line-clamp-2">
              {idea.title}
            </h4>
          </div>
          <GripVertical className="w-3.5 h-3.5 text-[#E8E6E1] flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {idea.description && (
          <p className="text-xs text-[#8C8C8C] line-clamp-2 mt-2">
            {idea.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1.5 text-[10px] text-[#8C8C8C]">
            <Calendar className="w-3 h-3" />
            {new Intl.DateTimeFormat("es-ES", {
              day: "numeric",
              month: "short",
            }).format(idea.createdAt)}
          </div>

          {idea.tags.length > 0 && (
            <div className="flex items-center gap-1">
              <Tag className="w-3 h-3 text-[#8C8C8C]" />
              <span className="text-[10px] text-[#8C8C8C]">{idea.tags.length}</span>
            </div>
          )}
        </div>

        {idea.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {idea.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-[9px] px-1.5 py-0.5 rounded bg-[#F5F3EF] text-[#8C8C8C]"
              >
                {tag}
              </span>
            ))}
            {idea.tags.length > 2 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#F5F3EF] text-[#8C8C8C]">
                +{idea.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
