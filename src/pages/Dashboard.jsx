import { useState, useEffect, useMemo } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import ShowModal from "../components/ShowModal";
import ShowCard from "../components/ShowCard";
import { LogOut, Search, Plus, Loader2, ArrowUpDown } from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [shows, setShows] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const [activeTab, setActiveTab] = useState("watching");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("updated"); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShow, setEditingShow] = useState(null);

  const [showToDelete, setShowToDelete] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  useEffect(() => {
    if (!user) return;
    const showsRef = collection(db, "users", user.uid, "shows");

    const unsubscribe = onSnapshot(
      showsRef,
      (snapshot) => {
        const list = snapshot.docs.map((docItem) => ({
          id: docItem.id,
          ...docItem.data(),
        }));
        setShows(list);
        setLoadingData(false);
      },
      (error) => {
        console.error("Gagal memuat data Firestore:", error);
        setLoadingData(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleSaveShow = async (formData) => {
    if (!user) return;
    const showsRef = collection(db, "users", user.uid, "shows");

    if (editingShow) {
      const docRef = doc(db, "users", user.uid, "shows", editingShow.id);
      await updateDoc(docRef, {
        ...formData,
        updatedAt: serverTimestamp(),
      });
      triggerToast(`"${formData.title}" diperbarui.`);
    } else {
      await addDoc(showsRef, {
        ...formData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      triggerToast(`"${formData.title}" ditambahkan.`);
    }
  };

  const handleUpdateEpisode = async (show, newEpisode) => {
    if (!user || newEpisode < 0) return;
    const totalEp = Number(show.totalEpisodes) || 0;
    let newStatus = show.status;

    if (totalEp > 0 && newEpisode >= totalEp) {
      newStatus = "completed";
      triggerToast(`Selesai menonton "${show.title}".`);
    } else if (newEpisode > 0 && show.status === "plan") {
      newStatus = "watching";
    }

    const docRef = doc(db, "users", user.uid, "shows", show.id);
    await updateDoc(docRef, {
      currentEpisode: newEpisode,
      status: newStatus,
      updatedAt: serverTimestamp(),
    });
  };

  const confirmDeleteShow = async () => {
    if (!user || !showToDelete) return;
    const title = showToDelete.title;
    const docRef = doc(db, "users", user.uid, "shows", showToDelete.id);
    await deleteDoc(docRef);
    setShowToDelete(null);
    triggerToast(`"${title}" dihapus dari arsip.`);
  };

  const counts = useMemo(() => {
    return {
      all: shows.length,
      watching: shows.filter((s) => s.status === "watching").length,
      plan: shows.filter((s) => s.status === "plan").length,
      completed: shows.filter((s) => s.status === "completed").length,
    };
  }, [shows]);

  const filteredShows = useMemo(() => {
    const filtered = shows.filter((show) => {
      const matchTab = activeTab === "all" || show.status === activeTab;
      const matchSearch = (show.title || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchTab && matchSearch;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "az") {
        return (a.title || "").localeCompare(b.title || "");
      }
      if (sortBy === "za") {
        return (b.title || "").localeCompare(a.title || "");
      }
      if (sortBy === "episode") {
        return (Number(b.currentEpisode) || 0) - (Number(a.currentEpisode) || 0);
      }
      // Default: 'updated' (Terakhir Diupdate)
      return (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0);
    });
  }, [shows, activeTab, searchQuery, sortBy]);

  const TAB_META = {
    watching: { code: "01 // ONGOING", title: "Sedang Ditonton" },
    plan: { code: "02 // QUEUE", title: "Daftar Tunggu (Watchlist)" },
    completed: { code: "03 // ARCHIVE", title: "Selesai Ditonton" },
    all: { code: "04 // COMPLETE INDEX", title: "Semua Catatan" },
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex flex-col md:flex-row">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => {
          setEditingShow(null);
          setIsModalOpen(true);
        }}
        counts={counts}
      />

      <main className="flex-1 pb-24 md:pb-12">
        {/* Header Mobile */}
        <header className="md:hidden sticky top-0 z-30 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-zinc-900 px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <h1 className="font-extrabold text-sm tracking-[0.2em] uppercase">KYATCH</h1>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-zinc-500 hover:text-white rounded"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </header>

        <div className="max-w-6xl mx-auto p-4 sm:p-8">
          {/* Editorial Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 mb-6 border-b border-zinc-900">
            <div>
              <p className="font-mono text-[11px] text-orange-500 tracking-widest uppercase mb-1">
                {TAB_META[activeTab]?.code}
              </p>
              <div className="flex items-baseline gap-3">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  {TAB_META[activeTab]?.title}
                </h2>
                <span className="font-mono text-xs text-zinc-500">
                  [{filteredShows.length}]
                </span>
              </div>
            </div>

            {/* Search & Sort Controls */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Input Cari */}
              <div className="relative flex-1 sm:w-56">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter judul..."
                  className="w-full bg-[#111111] border border-zinc-800 focus:border-zinc-400 rounded pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none transition"
                />
              </div>

              {/* Dropdown Sorting */}
              <div className="relative shrink-0">
                <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[#111111] border border-zinc-800 focus:border-zinc-400 rounded pl-8 pr-3 py-1.5 font-mono text-[11px] text-zinc-300 focus:outline-none transition cursor-pointer"
                >
                  <option value="updated">TERBARU</option>
                  <option value="az">JUDUL A-Z</option>
                  <option value="za">JUDUL Z-A</option>
                  <option value="episode">EPS TERBANYAK</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grid Koleksi */}
          {loadingData ? (
            <div className="flex items-center justify-center py-24 text-zinc-500 font-mono text-xs gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
              <span>MEMUAT ARSIP...</span>
            </div>
          ) : filteredShows.length === 0 ? (
            <div className="border border-zinc-900 bg-[#0e0e0e] rounded-md p-12 text-center">
              <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest mb-1">
                // Empty Index
              </p>
              <p className="text-zinc-300 text-sm mb-5">
                Belum ada catatan tontonan pada kategori ini.
              </p>
              <button
                onClick={() => {
                  setEditingShow(null);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center gap-2 bg-zinc-100 hover:bg-white text-black font-semibold text-xs uppercase tracking-wider px-4 py-2.5 rounded transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Catat Judul Pertama</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4">
              {filteredShows.map((show) => (
                <ShowCard
                  key={show.id}
                  show={show}
                  onUpdateEpisode={handleUpdateEpisode}
                  onEdit={(item) => {
                    setEditingShow(item);
                    setIsModalOpen(true);
                  }}
                  onDelete={(item) => setShowToDelete(item)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <ShowModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingShow(null);
        }}
        onSave={handleSaveShow}
        editingShow={editingShow}
      />

      {/* Modal Konfirmasi Hapus */}
      {showToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111111] border border-zinc-800 rounded-md max-w-sm w-full p-5 shadow-2xl">
            <p className="font-mono text-[10px] uppercase tracking-widest text-red-500 mb-1">
              // Confirm Deletion
            </p>
            <h3 className="font-bold text-base text-white">Hapus dari arsip?</h3>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              Tontonan <strong className="text-white">"{showToDelete.title}"</strong> akan dihapus permanen dari catatanmu.
            </p>
            <div className="flex gap-2.5 mt-5">
              <button
                onClick={() => setShowToDelete(null)}
                className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-mono text-xs py-2 rounded uppercase cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={confirmDeleteShow}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-semibold py-2 rounded uppercase cursor-pointer"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto z-50 flex justify-center md:justify-end pointer-events-none">
          <div className="bg-zinc-100 text-black px-4 py-2.5 rounded shadow-2xl flex items-center gap-2.5 font-mono text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}