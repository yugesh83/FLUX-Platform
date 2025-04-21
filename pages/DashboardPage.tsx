import React from "react";

const DashboardPage = () => {
  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-4">
        <h2 className="text-xl font-bold mb-6">FLUX</h2>
        <nav className="space-y-4">
          <a href="#" className="block text-gray-700 hover:text-blue-600">Home</a>
          <a href="#" className="block text-gray-700 hover:text-blue-600">My Projects</a>
          <a href="#" className="block text-gray-700 hover:text-blue-600">Upload</a>
          <a href="#" className="block text-gray-700 hover:text-blue-600">Profile</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-4">Welcome to Your Dashboard</h1>
        <p className="text-gray-600">Showcasing your engineering brilliance!</p>
      </main>
    </div>
  );
};

export default DashboardPage;
