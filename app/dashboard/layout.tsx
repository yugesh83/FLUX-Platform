export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm p-4">
        <h1 className="text-2xl font-bold text-gray-800">FLUX Dashboard</h1>
      </header>
      <main>{children}</main>
    </div>
  )
}
