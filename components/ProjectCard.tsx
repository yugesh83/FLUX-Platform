import React from "react";

type ProjectCardProps = {
  name: string;
  uploaderName: string;
  imageUrl?: string;
  description: string;
  onClick?: () => void;
};

const ProjectCard: React.FC<ProjectCardProps> = ({
  name,
  uploaderName,
  imageUrl,
  description,
  onClick,
}) => {
  return (
    <div
      className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition cursor-pointer"
      onClick={onClick}
    >
      <img
        src={imageUrl || "/placeholder.png"}
        alt={name}
        className="w-full h-40 object-cover rounded-lg mb-4"
      />
      <h2 className="text-lg font-bold text-gray-800">{name}</h2>
      <p className="text-sm text-gray-600">By {uploaderName}</p>
      <p className="text-gray-500 mt-2 line-clamp-2">{description}</p>
    </div>
  );
};

export default ProjectCard;
