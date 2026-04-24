"use client";

import { AppProvider, useApp } from "@/lib/store";
import { Sidebar } from "@/components/Sidebar";
import { IdeaDetail } from "@/components/IdeaDetail";
import { ScrumBoard } from "@/components/ScrumBoard";
import { Lightbulb } from "lucide-react";

function MainContent() {
  const { viewMode, isLoaded } = useApp();

  if (!isLoaded) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#FAF9F6]">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Lightbulb className="w-5 h-5 text-[#FAF9F6]" />
          </div>
          <p className="text-sm text-[#8C8C8C] font-medium">Cargando Atelier...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#FAF9F6]">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        {viewMode === "scrum" ? <ScrumBoard /> : <IdeaDetail />}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
