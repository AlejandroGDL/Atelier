"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Lightbulb, Trash2, MoreHorizontal, LayoutGrid, List } from "lucide-react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddIdeaDialog } from "@/components/AddIdeaDialog";
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

export function Sidebar() {
  const { ideas, selectedIdeaId, selectIdea, deleteIdea, viewMode, setViewMode } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredIdeas = ideas.filter(
    (idea) =>
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <aside className="w-[320px] flex flex-col border-r border-[#E8E6E1] bg-[#FAF9F6]">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-[#FAF9F6]" />
          </div>
          <div>
            <h1 className="font-[family-name:var(--font-fraunces)] text-xl font-semibold tracking-tight text-[#1A1A1A]">
              Atelier
            </h1>
            <p className="text-xs text-[#8C8C8C] font-medium tracking-wide uppercase">
              Estudio de ideas
            </p>
          </div>
        </div>

        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="w-full h-11 bg-[#1A1A1A] hover:bg-[#333333] text-[#FAF9F6] rounded-lg font-medium transition-smooth"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva idea
        </Button>
      </div>

      <Separator className="bg-[#E8E6E1]" />

      {/* View Toggle */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-1 p-1 bg-[#F5F3EF] rounded-lg">
          <button
            onClick={() => setViewMode("list")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-medium transition-smooth ${
              viewMode === "list"
                ? "bg-white text-[#1A1A1A] shadow-sm"
                : "text-[#8C8C8C] hover:text-[#1A1A1A]"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            Lista
          </button>
          <button
            onClick={() => setViewMode("scrum")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-medium transition-smooth ${
              viewMode === "scrum"
                ? "bg-white text-[#1A1A1A] shadow-sm"
                : "text-[#8C8C8C] hover:text-[#1A1A1A]"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Scrum
          </button>
        </div>
      </div>

      <Separator className="bg-[#E8E6E1]" />

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8C8C]" />
          <Input
            placeholder="Buscar ideas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-[#F5F3EF] border-none rounded-lg text-sm placeholder:text-[#8C8C8C] focus-visible:ring-[#C4705A]"
          />
        </div>
      </div>

      {/* Ideas List */}
      <ScrollArea className="flex-1 px-3" style={{ minHeight: 0 }}>
        <div className="space-y-1 pb-4">
          <AnimatePresence mode="popLayout">
            {filteredIdeas.map((idea, index) => (
              <motion.div
                key={idea.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
              >
                <div
                  onClick={() => selectIdea(idea.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      selectIdea(idea.id);
                    }
                  }}
                  className={`w-full text-left p-4 rounded-xl transition-smooth group relative cursor-pointer ${
                    selectedIdeaId === idea.id
                      ? "bg-[#1A1A1A] text-[#FAF9F6] shadow-lg shadow-black/10"
                      : "hover:bg-[#F5F3EF] text-[#1A1A1A]"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {idea.coverImage ? (
                        <div className="w-6 h-6 rounded-md overflow-hidden flex-shrink-0">
                          <img src={idea.coverImage} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : idea.coverEmoji ? (
                        <span className="text-base leading-none">{idea.coverEmoji}</span>
                      ) : null}
                      <span
                        className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor:
                            selectedIdeaId === idea.id
                              ? "rgba(255,255,255,0.15)"
                              : `${statusColors[idea.status]}15`,
                          color:
                            selectedIdeaId === idea.id
                              ? "#FAF9F6"
                              : statusColors[idea.status],
                        }}
                      >
                        {statusLabels[idea.status]}
                      </span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md ${
                            selectedIdeaId === idea.id
                              ? "hover:bg-white/10"
                              : "hover:bg-[#E8E6E1]"
                          }`}
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={() => deleteIdea(idea.id)}
                          className="text-[#B54242] focus:text-[#B54242] cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <h3 className="font-[family-name:var(--font-fraunces)] text-[15px] font-medium leading-snug mb-1.5 line-clamp-2">
                    {idea.title}
                  </h3>

                  <p
                    className={`text-xs line-clamp-2 mb-3 ${
                      selectedIdeaId === idea.id
                        ? "text-white/60"
                        : "text-[#8C8C8C]"
                    }`}
                  >
                    {idea.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {idea.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className={`text-[10px] px-2 py-0.5 rounded-md ${
                          selectedIdeaId === idea.id
                            ? "bg-white/10 text-white/70"
                            : "bg-[#F5F3EF] text-[#8C8C8C]"
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                    {idea.tags.length > 3 && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md ${
                          selectedIdeaId === idea.id
                            ? "bg-white/10 text-white/70"
                            : "bg-[#F5F3EF] text-[#8C8C8C]"
                        }`}
                      >
                        +{idea.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredIdeas.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm text-[#8C8C8C]">
                {searchQuery
                  ? "No se encontraron ideas"
                  : "No hay ideas aún. Crea una nueva."}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer stats */}
      <div className="px-6 py-4 border-t border-[#E8E6E1]">
        <div className="flex items-center justify-between text-xs text-[#8C8C8C]">
          <span>{ideas.length} ideas</span>
          <span>
            {ideas.filter((i) => i.status === "in-progress").length} en progreso
          </span>
        </div>
      </div>

      <AddIdeaDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </aside>
  );
}
