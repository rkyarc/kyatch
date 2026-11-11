import { Play, Bookmark, Check, Layers, Plus, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const NAV_ITEMS = [
  { id: "watching", label: "Ditonton", code: "01", icon: Play },
  { id: "plan", label: "Watchlist", code: "02", icon: Bookmark },
  { id: "completed", label: "Selesai", code: "03", icon: Check },
  { id: "all", label: "Semua", code: "04", icon: Layers },
];

export default function Navbar({ activeTab, setActiveTab, onOpenAddModal, counts }) {
  const { user, logout } = useAuth();

  return (
    <>
      {/* ================= SIDEBAR DESKTOP (Layar >= 768px) ================= */}
      <aside className="hidden md:flex flex-col w-60 bg-[#0a0a0a] border-r border-zinc-900 h-screen sticky top-0 p-6 select-none">
        {/* Brand Identity */}
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <h1 className="font-extrabold text-base tracking-[0.22em] text-white uppercase">
              KYATCH
            </h1>
          </div>
          <p className="font-mono text-[10px] text-zinc-500 mt-1 tracking-wider uppercase">
            Watch Log & Index
          </p>
        </div>

        {/* Tombol Tambah Kontras Tinggi */}
        <button
          onClick={onOpenAddModal}
          className="w-full bg-zinc-100 hover:bg-white text-black font-semibold py-2.5 px-3.5 rounded-md text-xs uppercase tracking-wider flex items-center justify-between transition mb-8 cursor-pointer"
        >
          <span>Catat Judul</span>
          <Plus className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Navigasi Indeks */}
        <div className="flex-1">
          <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-600 mb-3">
            // Kategori
          </p>
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between py-2 px-2.5 rounded-md text-xs transition cursor-pointer ${
                    isActive
                      ? "bg-zinc-900 text-white font-semibold"
                      : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/40"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`font-mono text-[10px] ${
                        isActive ? "text-orange-500" : "text-zinc-600"
                      }`}
                    >
                      {item.code}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  <span
                    className={`font-mono text-[11px] ${
                      isActive ? "text-zinc-100" : "text-zinc-600"
                    }`}
                  >
                    {counts[item.id] || 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Akun */}
        <div className="pt-4 border-t border-zinc-900 flex items-center justify-between gap-2">
          <div className="truncate">
            <p className="font-mono text-[9px] uppercase tracking-wider text-zinc-600">Arsip Milik</p>
            <p className="text-xs text-zinc-400 truncate mt-0.5">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            title="Keluar"
            className="p-1.5 text-zinc-500 hover:text-white rounded-md hover:bg-zinc-900 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* ================= BOTTOM BAR MOBILE (Layar < 768px) ================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-md border-t border-zinc-900 px-3 py-1.5">
        <div className="grid grid-cols-5 items-center max-w-md mx-auto">
          {NAV_ITEMS.slice(0, 2).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-1.5 transition ${
                  isActive ? "text-white" : "text-zinc-500"
                }`}
              >
                <Icon className={`w-4 h-4 mb-1 ${isActive ? "text-orange-500" : ""}`} />
                <span className="text-[10px] font-medium tracking-tight">{item.label}</span>
              </button>
            );
          })}

          {/* Tombol Tambah Tengah (Putih Kontras Tanpa Glow Ungu) */}
          <div className="flex justify-center">
            <button
              onClick={onOpenAddModal}
              className="w-11 h-9 bg-zinc-100 active:scale-95 text-black rounded-md flex items-center justify-center transition"
              title="Tambah Tontonan"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          {NAV_ITEMS.slice(2, 4).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-1.5 transition ${
                  isActive ? "text-white" : "text-zinc-500"
                }`}
              >
                <Icon className={`w-4 h-4 mb-1 ${isActive ? "text-orange-500" : ""}`} />
                <span className="text-[10px] font-medium tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}