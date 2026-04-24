export type IdeaStatus = "idea" | "planning" | "in-progress" | "paused" | "completed";
export type TaskStatus = "todo" | "in-progress" | "review" | "done";

export const statusOrder: IdeaStatus[] = ["idea", "planning", "in-progress", "paused", "completed"];

export interface Task {
  id: string;
  ideaId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: "low" | "medium" | "high";
  createdAt: Date;
  updatedAt: Date;
}

export interface CanvasElement {
  id: string;
  type: "text" | "image" | "table" | "shape";
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  style?: Record<string, string>;
  src?: string;
  tableData?: string[][];
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  status: IdeaStatus;
  tags: string[];
  coverImage?: string;
  coverEmoji?: string;
  createdAt: Date;
  updatedAt: Date;
  canvasElements: CanvasElement[];
  canvasDrawing?: string;
}

export interface DrawingPoint {
  x: number;
  y: number;
}

export interface DrawingStroke {
  points: DrawingPoint[];
  color: string;
  width: number;
}
