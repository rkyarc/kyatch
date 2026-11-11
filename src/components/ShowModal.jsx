import { useState, useEffect } from "react";
import { X, Search, Loader2, Check } from "lucide-react";
import { searchPosterByTitle } from "../lib/posterApi";

const INITIAL_FORM = {
  title: "",
  status: "watching",
  season: 1,
  currentEpisode: 1,
  totalEpisodes: "",
  lastTimestamp: "",
  episodeLink: "",
  posterUrl: "",
  year: "",
};

export default function ShowModal({ isOpen, onClose, onSave, editingShow }) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [posterResults, setPosterResults] = useState([]);
  const [isSearchingPoster, setIsSearchingPoster] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editingShow) {
      setFormData({
        title: editingShow.title || "",
        status: editingShow.status || "watching",
        season: editingShow.season ?? 1,
        currentEpisode: editingShow.currentEpisode ?? 1,
        totalEpisodes: editingShow.totalEpisodes || "",
        lastTimestamp: editingShow.lastTimestamp || "",
        episodeLink: editingShow.episodeLink || "",
        posterUrl: editingShow.posterUrl || "",
        year: editingShow.year || "",
      });
    } else {
      setFormData(INITIAL_FORM);
    }
    setPosterResults([]);
  }, [editingShow, isOpen]);

  if (!isOpen) return null;

  const handleSearchPoster = async () => {
    if (!formData.title.trim()) return;
    setIsSearchingPoster(true);
    const results = await searchPosterByTitle(formData.title);
    setPosterResults(results);
    if (results.length > 0 && !formData.posterUrl) {
      handleSelectPoster(results[0]);
    }
    setIsSearchingPoster(false);
  };

  const handleSelectPoster = (item) => {
    setFormData((prev) => ({
      ...prev,
      title: item.title,
      posterUrl: item.posterUrl,
      year: item.year || prev.year,
      totalEpisodes: item.totalEpisodes || prev.totalEpisodes,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const currentEp = Number(formData.currentEpisode) || 0;
      const totalEp = Number(formData.totalEpisodes) || 0;
      const seasonNum = Number(formData.season) || 1;

      let finalStatus = formData.status;
      if (totalEp > 0 && currentEp >= totalEp) {
        finalStatus = "completed";
      }

      let cleanLink = formData.episodeLink.trim();
      if (cleanLink && !/^https?:\/\//i.test(cleanLink)) {
        cleanLink = `https://${cleanLink}`;
      }

      await onSave({
        ...formData,
        season: seasonNum,
        currentEpisode: currentEp,
        totalEpisodes: totalEp,
        episodeLink: cleanLink,
        lastTimestamp: formData.lastTimestamp.trim(),
        status: finalStatus,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#111111] border border-zinc-800 w-full max-w-lg rounded-t-xl sm:rounded-md max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#111111]/95 backdrop-blur-md border-b border-zinc-800 px-5 py-4 flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-orange-500">
              {editingShow ? "// Edit Entry" : "// New Entry"}
            </p>
            <h3 className="font-bold text-base text-white mt-0.5">
              {editingShow ? "Perbarui Data Tontonan" : "Catat Tontonan Baru"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-500 hover:text-white rounded hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Judul & Cari Poster */}
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-400 mb-1.5">
              Judul Film / Series / Anime *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ketik judul..."
                className="flex-1 bg-[#0a0a0a] border border-zinc-800 focus:border-zinc-400 rounded px-3 py-2 text-sm text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSearchPoster}
                disabled={isSearchingPoster || !formData.title.trim()}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3.5 py-2 rounded font-mono text-xs flex items-center gap-1.5 transition disabled:opacity-40 cursor-pointer shrink-0"
              >
                {isSearchingPoster ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5" />
                )}
                <span>AMBIL POSTER</span>
              </button>
            </div>
          </div>

          {/* Hasil Pencarian Poster */}
          {posterResults.length > 0 && (
            <div className="bg-[#0a0a0a] border border-zinc-800 rounded p-3">
              <p className="font-mono text-[10px] text-zinc-500 uppercase mb-2">
                Pilih Poster Resmi:
              </p>
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {posterResults.map((item) => {
                  const isSelected = formData.posterUrl === item.posterUrl;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectPoster(item)}
                      className={`relative shrink-0 w-20 rounded overflow-hidden border-2 transition text-left cursor-pointer ${
                        isSelected ? "border-orange-500" : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={item.posterUrl}
                        alt={item.title}
                        className="w-20 h-28 object-cover bg-zinc-900"
                      />
                      {isSelected && (
                        <div className="absolute top-1 right-1 bg-orange-500 rounded-full p-0.5">
                          <Check className="w-3 h-3 text-black stroke-[3]" />
                        </div>
                      )}
                      <div className="p-1 bg-zinc-950">
                        <p className="text-[10px] font-medium text-zinc-200 truncate">{item.title}</p>
                        <p className="font-mono text-[9px] text-zinc-500">
                          {item.year || item.type}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Status */}
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-400 mb-1.5">
              Status Arsip
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "watching", label: "Ditonton" },
                { id: "plan", label: "Watchlist" },
                { id: "completed", label: "Selesai" },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, status: st.id })}
                  className={`py-2 px-3 rounded font-mono text-xs border transition cursor-pointer ${
                    formData.status === st.id
                      ? "bg-zinc-100 border-zinc-100 text-black font-semibold"
                      : "bg-[#0a0a0a] border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Season, Eps Terakhir, Total Eps */}
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-400 mb-1.5">
                Season
              </label>
              <input
                type="number"
                min="1"
                value={formData.season}
                onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-zinc-800 focus:border-zinc-400 rounded px-3 py-2 font-mono text-sm text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-400 mb-1.5">
                Episode
              </label>
              <input
                type="number"
                min="0"
                value={formData.currentEpisode}
                onChange={(e) => setFormData({ ...formData, currentEpisode: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-zinc-800 focus:border-zinc-400 rounded px-3 py-2 font-mono text-sm text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-400 mb-1.5">
                Total Eps
              </label>
              <input
                type="number"
                min="0"
                placeholder="—"
                value={formData.totalEpisodes}
                onChange={(e) => setFormData({ ...formData, totalEpisodes: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-zinc-800 focus:border-zinc-400 rounded px-3 py-2 font-mono text-sm text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Menit Terakhir & Link Episode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-400 mb-1.5">
                Timestamp / Menit (Opsional)
              </label>
              <input
                type="text"
                placeholder="mis. 24:15"
                value={formData.lastTimestamp}
                onChange={(e) => setFormData({ ...formData, lastTimestamp: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-zinc-800 focus:border-zinc-400 rounded px-3 py-2 font-mono text-sm text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-400 mb-1.5">
                Tautan Streaming
              </label>
              <input
                type="text"
                placeholder="https://..."
                value={formData.episodeLink}
                onChange={(e) => setFormData({ ...formData, episodeLink: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-zinc-800 focus:border-zinc-400 rounded px-3 py-2 text-sm text-white focus:outline-none"
              />
            </div>
          </div>

          {/* URL Poster */}
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-400 mb-1.5">
              URL Poster
            </label>
            <input
              type="text"
              placeholder="Otomatis dari pencarian atau tempel URL gambar..."
              value={formData.posterUrl}
              onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
              className="w-full bg-[#0a0a0a] border border-zinc-800 focus:border-zinc-400 rounded px-3 py-2 text-xs font-mono text-zinc-300 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-zinc-800 flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium py-2.5 rounded text-xs uppercase tracking-wider transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-zinc-100 hover:bg-white text-black font-bold py-2.5 rounded text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{editingShow ? "Simpan" : "Tambahkan"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}