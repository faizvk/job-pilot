"use client";

import { APPLICATION_STATUSES, STATUS_CONFIG } from "@/lib/constants";
import { ApplicationCard } from "./application-card";
import { useState } from "react";

interface PipelineBoardProps {
  applications: any[];
  onStatusChange: (id: string, status: string) => void;
}

export function PipelineBoard({ applications, onStatusChange }: PipelineBoardProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);

  const handleDragStart = (id: string) => (e: React.DragEvent) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (status: string) => (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverStatus(status);
  };

  const handleDrop = (status: string) => (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedId) {
      onStatusChange(draggedId, status);
    }
    setDraggedId(null);
    setDragOverStatus(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverStatus(null);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {APPLICATION_STATUSES.map((status) => {
        const config = STATUS_CONFIG[status];
        const statusApps = applications.filter((a) => a.status === status);
        const isDragOver = dragOverStatus === status;

        return (
          <div
            key={status}
            className={`flex-shrink-0 w-72 rounded-lg ${isDragOver ? "bg-blue-50 border-blue-300" : "bg-slate-50"} border p-3`}
            onDragOver={handleDragOver(status)}
            onDrop={handleDrop(status)}
            onDragLeave={() => setDragOverStatus(null)}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${config.bgColor}`} />
                {config.label}
              </h3>
              <span className="text-xs text-slate-400 bg-white px-2 py-0.5 rounded-full">
                {statusApps.length}
              </span>
            </div>
            <div className="space-y-2">
              {statusApps.map((app) => (
                <div key={app.id} onDragEnd={handleDragEnd}>
                  <ApplicationCard
                    app={app}
                    draggable
                    onDragStart={handleDragStart(app.id)}
                  />
                </div>
              ))}
              {statusApps.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">Drop here</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
