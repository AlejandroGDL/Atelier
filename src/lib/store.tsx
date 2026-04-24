"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { Idea, IdeaStatus, Task, TaskStatus, CanvasElement } from "@/types";
import { loadIdeas, saveIdeas, loadTasks, saveTasks } from "./db";

interface AppState {
  ideas: Idea[];
  tasks: Task[];
  selectedIdeaId: string | null;
  viewMode: "list" | "scrum";
  isLoaded: boolean;
  addIdea: (idea: Omit<Idea, "id" | "createdAt" | "updatedAt">) => void;
  updateIdea: (id: string, updates: Partial<Idea>) => void;
  deleteIdea: (id: string) => void;
  selectIdea: (id: string | null) => void;
  moveIdeaStatus: (id: string, newStatus: IdeaStatus) => void;
  setViewMode: (mode: "list" | "scrum") => void;
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTaskStatus: (id: string, newStatus: TaskStatus) => void;
  getTasksByIdea: (ideaId: string) => Task[];
  addCanvasElement: (ideaId: string, element: Omit<CanvasElement, "id">) => void;
  updateCanvasElement: (ideaId: string, elementId: string, updates: Partial<CanvasElement>) => void;
  removeCanvasElement: (ideaId: string, elementId: string) => void;
  updateCanvasDrawing: (ideaId: string, drawing: string) => void;
  clearCanvasDrawing: (ideaId: string) => void;
}

const defaultIdeas: Idea[] = [
  {
    id: "idea-1",
    title: "App de meditación para creativos",
    description: "Una aplicación minimalista que combine sonidos generativos con prompts creativos para sesiones de meditación enfocadas.",
    status: "planning",
    tags: ["wellness", "audio", "minimal"],
    coverEmoji: "🧘",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-03-20"),
    canvasElements: [
      {
        id: "el-1",
        type: "text",
        x: 50,
        y: 50,
        width: 300,
        height: 60,
        content: "Concepto principal: Meditación + Creatividad",
        style: { fontSize: "18px", fontWeight: "600" },
      },
      {
        id: "el-2",
        type: "text",
        x: 50,
        y: 130,
        width: 400,
        height: 100,
        content: "Características clave:\n• Sonidos generativos\n• Prompts diarios\n• Tracker de estado de ánimo\n• Modo offline",
      },
    ],
  },
  {
    id: "idea-2",
    title: "Marketplace de plantas locales",
    description: "Plataforma para conectar viveros locales con compradores urbanos, incluyendo guías de cuidado personalizadas.",
    status: "idea",
    tags: ["e-commerce", "local", "sustainability"],
    coverEmoji: "🌿",
    createdAt: new Date("2024-02-10"),
    updatedAt: new Date("2024-02-10"),
    canvasElements: [],
  },
  {
    id: "idea-3",
    title: "Dashboard analytics para escritores",
    description: "Herramienta de análisis de hábitos de escritura con visualizaciones elegantes y metas personalizables.",
    status: "in-progress",
    tags: ["productivity", "analytics", "writing"],
    coverEmoji: "✍️",
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-04-01"),
    canvasElements: [
      {
        id: "el-3",
        type: "table",
        x: 50,
        y: 50,
        width: 500,
        height: 200,
        content: "Métricas",
        tableData: [
          ["Métrica", "Frecuencia", "Meta"],
          ["Palabras/día", "Diaria", "1000"],
          ["Sesiones", "Semanal", "5"],
          ["Tiempo promedio", "Diaria", "45 min"],
        ],
      },
    ],
  },
  {
    id: "idea-4",
    title: "Red social para lectores",
    description: "Un espacio íntimo para compartir descubrimientos literarios, citas favoritas y recomendaciones personales.",
    status: "idea",
    tags: ["social", "books", "community"],
    coverEmoji: "📚",
    createdAt: new Date("2024-03-15"),
    updatedAt: new Date("2024-03-15"),
    canvasElements: [],
  },
  {
    id: "idea-5",
    title: "Gestor de hábitos visuales",
    description: "Aplicación que transforma la constancia en arte visual generativo. Cada hábito es un pincelada en un canvas personal.",
    status: "in-progress",
    tags: ["habits", "visual", "art"],
    coverEmoji: "🎯",
    createdAt: new Date("2024-02-28"),
    updatedAt: new Date("2024-04-10"),
    canvasElements: [],
  },
  {
    id: "idea-6",
    title: "Coffee subscription tracker",
    description: "App para registrar y comparar suscripciones de café de especialidad con notas de cata y recomendaciones.",
    status: "completed",
    tags: ["food", "subscription", "tracking"],
    coverEmoji: "☕",
    createdAt: new Date("2023-11-10"),
    updatedAt: new Date("2024-01-20"),
    canvasElements: [],
  },
];

const defaultTasks: Task[] = [
  {
    id: "task-1",
    ideaId: "idea-1",
    title: "Investigar librerías de audio",
    description: "Buscar librerías de sonido generativo en React Native",
    status: "done",
    priority: "high",
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-02-01"),
  },
  {
    id: "task-2",
    ideaId: "idea-1",
    title: "Diseñar wireframes principales",
    description: "Crear los wireframes de las 5 pantallas clave",
    status: "in-progress",
    priority: "high",
    createdAt: new Date("2024-02-05"),
    updatedAt: new Date("2024-03-10"),
  },
  {
    id: "task-3",
    ideaId: "idea-1",
    title: "Definir paleta de sonidos",
    description: "Seleccionar 10 sonidos base para las sesiones",
    status: "todo",
    priority: "medium",
    createdAt: new Date("2024-03-15"),
    updatedAt: new Date("2024-03-15"),
  },
  {
    id: "task-4",
    ideaId: "idea-1",
    title: "User research con meditadores",
    description: "Entrevistar a 10 personas que meditan regularmente",
    status: "review",
    priority: "medium",
    createdAt: new Date("2024-02-20"),
    updatedAt: new Date("2024-03-05"),
  },
  {
    id: "task-5",
    ideaId: "idea-3",
    title: "Estructurar base de datos",
    description: "Definir el schema para usuarios, sesiones y métricas",
    status: "done",
    priority: "high",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-25"),
  },
  {
    id: "task-6",
    ideaId: "idea-3",
    title: "Implementar gráficas",
    description: "Integrar librería de visualización de datos",
    status: "in-progress",
    priority: "high",
    createdAt: new Date("2024-02-15"),
    updatedAt: new Date("2024-04-01"),
  },
];

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ideas, setIdeas] = useState<Idea[]>(defaultIdeas);
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(defaultIdeas[0]?.id ?? null);
  const [viewMode, setViewMode] = useState<"list" | "scrum">("list");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load persisted data on mount
  useEffect(() => {
    let cancelled = false;
    async function init() {
      const [savedIdeas, savedTasks] = await Promise.all([
        loadIdeas(),
        loadTasks(),
      ]);
      if (cancelled) return;
      if (savedIdeas && savedIdeas.length > 0) {
        setIdeas(savedIdeas);
        setSelectedIdeaId(savedIdeas[0]?.id ?? null);
      }
      if (savedTasks && savedTasks.length > 0) {
        setTasks(savedTasks);
      }
      setIsLoaded(true);
    }
    init();
    return () => { cancelled = true; };
  }, []);

  // Persist ideas whenever they change
  useEffect(() => {
    if (isLoaded) {
      saveIdeas(ideas);
    }
  }, [ideas, isLoaded]);

  // Persist tasks whenever they change
  useEffect(() => {
    if (isLoaded) {
      saveTasks(tasks);
    }
  }, [tasks, isLoaded]);

  const addIdea = useCallback((idea: Omit<Idea, "id" | "createdAt" | "updatedAt">) => {
    const newIdea: Idea = {
      ...idea,
      id: `idea-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setIdeas((prev) => [newIdea, ...prev]);
    setSelectedIdeaId(newIdea.id);
  }, []);

  const updateIdea = useCallback((id: string, updates: Partial<Idea>) => {
    setIdeas((prev) =>
      prev.map((idea) =>
        idea.id === id ? { ...idea, ...updates, updatedAt: new Date() } : idea
      )
    );
  }, []);

  const deleteIdea = useCallback((id: string) => {
    setIdeas((prev) => prev.filter((idea) => idea.id !== id));
    setTasks((prev) => prev.filter((task) => task.ideaId !== id));
    setSelectedIdeaId((prev) => (prev === id ? null : prev));
  }, []);

  const selectIdea = useCallback((id: string | null) => {
    setSelectedIdeaId(id);
  }, []);

  const moveIdeaStatus = useCallback((id: string, newStatus: IdeaStatus) => {
    setIdeas((prev) =>
      prev.map((idea) =>
        idea.id === id ? { ...idea, status: newStatus, updatedAt: new Date() } : idea
      )
    );
  }, []);

  const addTask = useCallback((task: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setTasks((prev) => [...prev, newTask]);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, ...updates, updatedAt: new Date() } : task
      )
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }, []);

  const moveTaskStatus = useCallback((id: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, status: newStatus, updatedAt: new Date() } : task
      )
    );
  }, []);

  const getTasksByIdea = useCallback((ideaId: string) => {
    return tasks.filter((task) => task.ideaId === ideaId);
  }, [tasks]);

  const addCanvasElement = useCallback((ideaId: string, element: Omit<CanvasElement, "id">) => {
    const newElement: CanvasElement = {
      ...element,
      id: `el-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setIdeas((prev) =>
      prev.map((idea) =>
        idea.id === ideaId
          ? { ...idea, canvasElements: [...idea.canvasElements, newElement], updatedAt: new Date() }
          : idea
      )
    );
  }, []);

  const updateCanvasElement = useCallback((ideaId: string, elementId: string, updates: Partial<CanvasElement>) => {
    setIdeas((prev) =>
      prev.map((idea) =>
        idea.id === ideaId
          ? {
              ...idea,
              canvasElements: idea.canvasElements.map((el) =>
                el.id === elementId ? { ...el, ...updates } : el
              ),
              updatedAt: new Date(),
            }
          : idea
      )
    );
  }, []);

  const removeCanvasElement = useCallback((ideaId: string, elementId: string) => {
    setIdeas((prev) =>
      prev.map((idea) =>
        idea.id === ideaId
          ? {
              ...idea,
              canvasElements: idea.canvasElements.filter((el) => el.id !== elementId),
              updatedAt: new Date(),
            }
          : idea
      )
    );
  }, []);

  const updateCanvasDrawing = useCallback((ideaId: string, drawing: string) => {
    setIdeas((prev) =>
      prev.map((idea) =>
        idea.id === ideaId ? { ...idea, canvasDrawing: drawing, updatedAt: new Date() } : idea
      )
    );
  }, []);

  const clearCanvasDrawing = useCallback((ideaId: string) => {
    setIdeas((prev) =>
      prev.map((idea) =>
        idea.id === ideaId ? { ...idea, canvasDrawing: undefined, updatedAt: new Date() } : idea
      )
    );
  }, []);

  return (
    <AppContext.Provider
      value={{
        ideas,
        tasks,
        selectedIdeaId,
        viewMode,
        isLoaded,
        addIdea,
        updateIdea,
        deleteIdea,
        selectIdea,
        moveIdeaStatus,
        setViewMode,
        addTask,
        updateTask,
        deleteTask,
        moveTaskStatus,
        getTasksByIdea,
        addCanvasElement,
        updateCanvasElement,
        removeCanvasElement,
        updateCanvasDrawing,
        clearCanvasDrawing,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
