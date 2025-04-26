import React from "react";
import Link from "next/link"; // ✅ Import Link from Next.js

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
    <Link href={`/project/${project.id}`} passHref>
      <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-xl cursor-pointer transition-shadow duration-300">
        <img
          src={project.imageUrl || "/placeholder.png"}
          alt={project.title}
          className="w-full h-48 object-cover rounded-md"
        />
        <h3 className="text-lg font-semibold mt-4">{project.title}</h3>
        <p className="text-gray-500 mt-2">{project.description}</p>
      </div>
    </Link>
  );
};

export default ProjectCard;

