"use client";

import { useState, useRef } from "react";
import { useApp } from "@/lib/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { X, Plus, ImageIcon } from "lucide-react";
import type { IdeaStatus } from "@/types";

interface AddIdeaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusOptions: { value: IdeaStatus; label: string }[] = [
  { value: "idea", label: "Idea" },
  { value: "planning", label: "Planificación" },
  { value: "in-progress", label: "En progreso" },
  { value: "paused", label: "Pausado" },
  { value: "completed", label: "Completado" },
];

const emojiOptions = [
  "💡", "🚀", "🎯", "🧘", "🌿", "📚", "✍️", "☕",
  "🎨", "🎵", "🏃", "🍳", "🧠", "🔬", "🌍", "💻",
  "📱", "🛒", "🎓", "💰", "🔧", "🎮", "📸", "🎬",
];

export function AddIdeaDialog({ open, onOpenChange }: AddIdeaDialogProps) {
  const { addIdea } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<IdeaStatus>("idea");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>("💡");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addIdea({
      title: title.trim(),
      description: description.trim(),
      status,
      tags,
      coverEmoji: selectedEmoji || undefined,
      coverImage: coverImage || undefined,
      canvasElements: [],
    });

    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStatus("idea");
    setTags([]);
    setTagInput("");
    setSelectedEmoji("💡");
    setCoverImage(null);
    setShowEmojiPicker(false);
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCoverImage(event.target?.result as string);
      setSelectedEmoji(null);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] bg-white border-[#E8E6E1] rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-fraunces)] text-xl">
            Nueva idea
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {/* Cover / Icon selector */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#1A1A1A]">
              Icono o imagen
            </Label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-14 h-14 rounded-xl bg-[#F5F3EF] hover:bg-[#E8E6E1] flex items-center justify-center text-2xl transition-smooth border border-[#E8E6E1]"
              >
                {selectedEmoji || (coverImage ? "🖼️" : "💡")}
              </button>
              <div className="flex-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-14 rounded-xl border-2 border-dashed border-[#E8E6E1] hover:border-[#C4705A]/50 flex items-center justify-center gap-2 text-sm text-[#8C8C8C] hover:text-[#C4705A] transition-smooth"
                >
                  <ImageIcon className="w-4 h-4" />
                  {coverImage ? "Cambiar imagen" : "Subir imagen de portada"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>

            {showEmojiPicker && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-[#F5F3EF] rounded-xl border border-[#E8E6E1]"
              >
                <div className="grid grid-cols-8 gap-1.5">
                  {emojiOptions.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        setSelectedEmoji(emoji);
                        setCoverImage(null);
                        setShowEmojiPicker(false);
                      }}
                      className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-smooth ${
                        selectedEmoji === emoji
                          ? "bg-[#1A1A1A] scale-110"
                          : "hover:bg-white"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {coverImage && (
              <div className="relative mt-2 rounded-xl overflow-hidden border border-[#E8E6E1] w-full h-24">
                <img src={coverImage} alt="Portada" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setCoverImage(null);
                    setSelectedEmoji("💡");
                  }}
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-[#1A1A1A]">
              Título
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="¿Qué estás pensando?"
              className="h-11 border-[#E8E6E1] rounded-lg focus-visible:ring-[#C4705A] placeholder:text-[#8C8C8C]/60"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-[#1A1A1A]">
              Descripción
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe tu idea..."
              rows={3}
              className="border-[#E8E6E1] rounded-lg focus-visible:ring-[#C4705A] placeholder:text-[#8C8C8C]/60 resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#1A1A1A]">Estado</Label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStatus(option.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-smooth ${
                    status === option.value
                      ? "bg-[#1A1A1A] text-[#FAF9F6]"
                      : "bg-[#F5F3EF] text-[#8C8C8C] hover:bg-[#E8E6E1]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#1A1A1A]">Etiquetas</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Agregar etiqueta..."
                className="h-9 border-[#E8E6E1] rounded-lg focus-visible:ring-[#C4705A] placeholder:text-[#8C8C8C]/60"
              />
              <Button
                type="button"
                onClick={addTag}
                variant="outline"
                size="icon"
                className="h-9 w-9 border-[#E8E6E1] rounded-lg hover:bg-[#F5F3EF]"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center bg-[#F5F3EF] text-[#8C8C8C] hover:bg-[#E8E6E1] rounded-md font-normal text-xs cursor-pointer px-2 py-1 transition-colors"
                    onClick={() => removeTag(tag)}
                  >
                    {tag}
                    <X className="w-3 h-3 ml-1" />
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-lg border-[#E8E6E1] hover:bg-[#F5F3EF]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!title.trim()}
              className="rounded-lg bg-[#1A1A1A] hover:bg-[#333333] text-[#FAF9F6]"
            >
              Crear idea
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
