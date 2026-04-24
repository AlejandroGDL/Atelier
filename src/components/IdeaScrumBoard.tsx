"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, GripVertical, Calendar, Flag, Trash2, X, Check } from "lucide-react";
import { useApp } from "@/lib/store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Task, TaskStatus } from "@/types";

const taskColumns: { key: TaskStatus; label: string; color: string }[] = [
  { key: "todo", label: "Por hacer", color: "#8C8C8C" },
  { key: "in-progress", label: "En progreso", color: "#C4705A" },
  { key: "review", label: "Revisión", color: "#D4A574" },
  { key: "done", label: "Hecho", color: "#5A8C6E" },
];

const priorityConfig = {
  low: { label: "Baja", color: "#8C8C8C" },
  medium: { label: "Media", color: "#D4A574" },
  high: { label: "Alta", color: "#B54242" },
};

interface IdeaScrumBoardProps {
  ideaId: string;
}

export function IdeaScrumBoard({ ideaId }: IdeaScrumBoardProps) {
  const { getTasksByIdea, addTask, updateTask, deleteTask, moveTaskStatus } = useApp();
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);
  const [isAddingTask, setIsAddingTask] = useState<TaskStatus | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high">("medium");

  const tasks = getTasksByIdea(ideaId);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTask(taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (draggedTask) {
      moveTaskStatus(draggedTask, status);
    }
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const getTasksByStatus = (status: TaskStatus) =>
    tasks.filter((task) => task.status === status);

  const handleAddTask = (status: TaskStatus) => {
    if (!newTaskTitle.trim()) return;
    addTask({
      ideaId,
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim(),
      status,
      priority: newTaskPriority,
    });
    setNewTaskTitle("");
    setNewTaskDesc("");
    setNewTaskPriority("medium");
    setIsAddingTask(null);
  };

  const handleCancelAdd = () => {
    setIsAddingTask(null);
    setNewTaskTitle("");
    setNewTaskDesc("");
    setNewTaskPriority("medium");
  };

  return (
    <div className="flex flex-col h-full bg-[#FAF9F6]">
      {/* Header */}
      <div className="flex-shrink-0 px-8 py-4 border-b border-[#E8E6E1]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-[family-name:var(--font-fraunces)] text-xl font-medium text-[#1A1A1A]">
              Tareas del proyecto
            </h2>
            <p className="text-sm text-[#8C8C8C] mt-0.5">
              {tasks.length} {tasks.length === 1 ? "tarea" : "tareas"} ·{" "}
              {tasks.filter((t) => t.status === "done").length} completadas
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#8C8C8C]">
            {taskColumns.map((col) => (
              <div key={col.key} className="flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: col.color }}
                />
                <span>{getTasksByStatus(col.key).length}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex h-full gap-4 px-8 py-6 min-w-max">
          {taskColumns.map((column) => {
            const columnTasks = getTasksByStatus(column.key);
            const isDragOver = dragOverColumn === column.key;
            const isAdding = isAddingTask === column.key;

            return (
              <div
                key={column.key}
                className={`flex flex-col w-[280px] h-full rounded-2xl transition-all ${
                  isDragOver
                    ? "ring-2 ring-[#C4705A]/30 bg-[#FDF6F4]"
                    : ""
                }`}
                onDragOver={(e) => handleDragOver(e, column.key)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.key)}
              >
                {/* Column header */}
                <div className="flex items-center justify-between px-3 py-3 mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: column.color }}
                    />
                    <h3 className="font-[family-name:var(--font-fraunces)] text-sm font-medium text-[#1A1A1A]">
                      {column.label}
                    </h3>
                    <span className="text-[10px] text-[#8C8C8C] bg-[#F5F3EF] px-2 py-0.5 rounded-full font-medium">
                      {columnTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsAddingTask(column.key)}
                    className="p-1 rounded-md hover:bg-[#F5F3EF] text-[#8C8C8C] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Column content */}
                <ScrollArea className="flex-1">
                  <div className="px-1.5 pb-2 space-y-2">
                    <AnimatePresence mode="popLayout">
                      {columnTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          onDragEnd={handleDragEnd}
                          onUpdate={(updates) => updateTask(task.id, updates)}
                          onDelete={() => deleteTask(task.id)}
                        />
                      ))}
                    </AnimatePresence>

                    {/* Add task form */}
                    {isAdding && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl border border-[#E8E6E1] p-3 shadow-sm"
                      >
                        <Input
                          placeholder="Título de la tarea..."
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          autoFocus
                          className="h-8 text-sm border-[#E8E6E1] rounded-lg mb-2 focus-visible:ring-[#C4705A]"
                        />
                        <Textarea
                          placeholder="Descripción (opcional)..."
                          value={newTaskDesc}
                          onChange={(e) => setNewTaskDesc(e.target.value)}
                          rows={2}
                          className="text-xs border-[#E8E6E1] rounded-lg mb-2 resize-none focus-visible:ring-[#C4705A]"
                        />
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            {(["low", "medium", "high"] as const).map((p) => (
                              <button
                                key={p}
                                type="button"
                                onClick={() => setNewTaskPriority(p)}
                                className={`text-[10px] px-2 py-1 rounded-md font-medium transition-colors ${
                                  newTaskPriority === p
                                    ? "bg-[#1A1A1A] text-white"
                                    : "bg-[#F5F3EF] text-[#8C8C8C] hover:bg-[#E8E6E1]"
                                }`}
                              >
                                {priorityConfig[p].label}
                              </button>
                            ))}
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={handleCancelAdd}
                              className="p-1.5 rounded-md hover:bg-[#F5F3EF] text-[#8C8C8C] transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleAddTask(column.key)}
                              disabled={!newTaskTitle.trim()}
                              className="p-1.5 rounded-md bg-[#1A1A1A] text-white hover:bg-[#333] transition-colors disabled:opacity-40"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {columnTasks.length === 0 && !isAdding && (
                      <div className="text-center py-6 px-3">
                        <p className="text-[11px] text-[#8C8C8C]/50">
                          Suelta tareas aquí o haz clic en + para añadir
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

interface TaskCardProps {
  task: Task;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onUpdate: (updates: Partial<Task>) => void;
  onDelete: () => void;
}

function TaskCard({ task, onDragStart, onDragEnd, onUpdate, onDelete }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description);
  const [isDragging, setIsDragging] = useState(false);

  const handleSave = () => {
    onUpdate({ title: editTitle, description: editDesc });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDesc(task.description);
    setIsEditing(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.18 }}
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
        onDoubleClick={() => setIsEditing(true)}
        className={`group bg-white rounded-xl border border-[#E8E6E1] p-3 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-[#C4705A]/20 transition-all ${
          isDragging ? "opacity-50 rotate-1" : ""
        }`}
      >
        {isEditing ? (
          <div className="space-y-2">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              autoFocus
              className="h-7 text-sm border-[#E8E6E1] rounded-lg focus-visible:ring-[#C4705A]"
            />
            <Textarea
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              rows={2}
              className="text-xs border-[#E8E6E1] rounded-lg resize-none focus-visible:ring-[#C4705A]"
            />
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {(["low", "medium", "high"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => onUpdate({ priority: p })}
                    className={`text-[9px] px-1.5 py-0.5 rounded font-medium transition-colors ${
                      task.priority === p
                        ? "bg-[#1A1A1A] text-white"
                        : "bg-[#F5F3EF] text-[#8C8C8C] hover:bg-[#E8E6E1]"
                    }`}
                  >
                    {priorityConfig[p].label}
                  </button>
                ))}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={handleCancel}
                  className="p-1 rounded hover:bg-[#F5F3EF] text-[#8C8C8C]"
                >
                  <X className="w-3 h-3" />
                </button>
                <button
                  onClick={handleSave}
                  className="p-1 rounded bg-[#1A1A1A] text-white hover:bg-[#333]"
                >
                  <Check className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm font-medium text-[#1A1A1A] leading-snug flex-1">
                {task.title}
              </h4>
              <GripVertical className="w-3 h-3 text-[#E8E6E1] flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
            </div>

            {task.description && (
              <p className="text-[11px] text-[#8C8C8C] line-clamp-2 mt-1.5">
                {task.description}
              </p>
            )}

            <div className="flex items-center justify-between mt-2.5">
              <div className="flex items-center gap-1.5">
                <Flag
                  className="w-3 h-3"
                  style={{ color: priorityConfig[task.priority].color }}
                />
                <span
                  className="text-[9px] font-medium"
                  style={{ color: priorityConfig[task.priority].color }}
                >
                  {priorityConfig[task.priority].label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-[9px] text-[#8C8C8C]">
                  <Calendar className="w-2.5 h-2.5" />
                  {new Intl.DateTimeFormat("es-ES", {
                    day: "numeric",
                    month: "short",
                  }).format(task.createdAt)}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-[#B54242]/10 text-[#8C8C8C] hover:text-[#B54242] transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
