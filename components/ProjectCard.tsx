import React from "react";

// Define the type for the project prop
export interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
    uid: string;
    createdAt: any; // Or use a specific type for Firebase timestamps if needed
  };
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <img
        src={project.imageUrl || "/placeholder.png"}
        alt={project.title}
        className="w-full h-48 object-cover rounded-md"
      />
      <h3 className="text-lg font-semibold mt-4">{project.title}</h3>
      <p className="text-gray-500 mt-2">{project.description}</p>
    </div>
  );
};

export default ProjectCard;
