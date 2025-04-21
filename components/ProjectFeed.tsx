// components/ProjectFeed.tsx
import React from "react";

type Project = {
  id: string;
  name: string;
  createdAt: any;
  imageUrl?: string;
  sparks?: number;
};

interface ProjectFeedProps {
  projects: Project[];
}

export default function ProjectFeed({ projects }: ProjectFeedProps) {
  return (
    <div className="space-y-6">
      {projects.length === 0 ? (
        <p className="text-gray-500 text-center">No projects available yet.</p>
      ) : (
        projects.map((project) => (
          <div
            key={project.id}
            className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 transition-all hover:shadow-xl"
          >
            <h3 className="text-2xl font-semibold text-gray-800">{project.name}</h3>
            <img
              src={project.imageUrl || "/placeholder.png"}
              alt={project.name}
              className="w-full h-48 object-cover rounded-lg mt-4"
            />
            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-gray-600">{project.sparks ?? 0} ⚡ SPARKS</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
