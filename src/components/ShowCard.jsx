import { ArrowUpRight, Plus, Minus, Pencil, Trash2 } from "lucide-react";

const STATUS_DOT = {
  watching: { label: "ONGOING", dot: "bg-orange-500" },
  plan: { label: "WATCHLIST", dot: "bg-zinc-400" },
  completed: { label: "DONE", dot: "bg-emerald-500" },
};

export default function ShowCard({ show, onUpdateEpisode, onEdit, onDelete }) {
  const currentEp = Number(show.currentEpisode) || 0;
  const totalEp = Number(show.totalEpisodes) || 0;
  const seasonNum = String(Number(show.season) || 1).padStart(2, "0");
  const epFormatted = String(currentEp).padStart(2, "0");
  const totalFormatted = totalEp > 0 ? String(totalEp).padStart(2, "0") : "??";

  const progressPercent =
    totalEp > 0 ? Math.min(100, Math.round((currentEp / totalEp) * 100)) : null;
  const statusInfo = STATUS_DOT[show.status] || STATUS_DOT.watching;

  return (
    <div className="group bg-[#111111] border border-zinc-900 hover:border-zinc-700 rounded-md overflow-hidden flex sm:flex-col transition duration-200">
      {/* AREA POSTER */}
      <div className="relative w-24 sm:w-full sm:aspect-[2/3] bg-zinc-950 shrink-0 overflow-hidden">
        {show.posterUrl ? (
          <img
            src={show.posterUrl}
            alt={show.title}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-950 text-zinc-700 font-mono text-[10px] uppercase tracking-widest p-3 text-center">
            No Poster
          </div>
        )}

        {/* Gradasi halus di bagian atas & bawah poster */}
        <div className="hidden sm:block absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

        {/* Status Indicator Kiri Atas */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/80 backdrop-blur-sm px-2 py-0.5 rounded text-[9px] font-mono tracking-wider text-zinc-200 border border-white/10">
          <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
          <span>{statusInfo.label}</span>
        </div>

        {/* Tombol Edit & Hapus */}
        <div className="absolute top-2 right-2 flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition">
          <button
            onClick={() => onEdit(show)}
            title="Edit"
            className="p-1.5 bg-black/80 hover:bg-white text-zinc-300 hover:text-black rounded transition cursor-pointer"
          >
            <Pencil className="w-3 h-3" />
          </button>
          <button
            onClick={() => onDelete(show)}
            title="Hapus"
            className="p-1.5 bg-black/80 hover:bg-red-500 text-zinc-300 hover:text-white rounded transition cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>

        {/* Garis Progres Tipis Menempel di Bawah Poster */}
        {progressPercent !== null && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-900">
            <div
              className="h-full bg-orange-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* AREA INFORMASI & KONTROL */}
      <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Baris Tahun & Timestamp */}
          <div className="flex items-center justify-between gap-2 font-mono text-[10px] text-zinc-500 mb-1">
            <span>{show.year || "—"}</span>
            {show.lastTimestamp && (
              <span className="text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded truncate">
                @{show.lastTimestamp}
              </span>
            )}
          </div>

          {/* Judul Film */}
          <h3
            className="font-bold text-sm text-zinc-100 leading-snug line-clamp-1 group-hover:text-white"
            title={show.title}
          >
            {show.title}
          </h3>

          {/* Baris Nomor Season & Episode */}
          <div className="mt-2.5 flex items-baseline justify-between border-t border-zinc-900 pt-2">
            <span className="font-mono text-[11px] text-zinc-400">
              S{seasonNum}
            </span>
            <div className="font-mono text-xs">
              <span className="text-zinc-500">EP </span>
              <span className="font-bold text-white text-sm">{epFormatted}</span>
              <span className="text-zinc-600">/{totalFormatted}</span>
            </div>
          </div>
        </div>

        {/* Baris Tombol Kontrol Bawah (Segmented Stepper + Play) */}
        <div className="mt-3 pt-2.5 border-t border-zinc-900 flex items-center justify-between gap-2">
          {/* Segmented Control: [-] dan [+1] menyatu & anti turun baris */}
          <div className="inline-flex items-center bg-zinc-900/90 border border-zinc-800 rounded overflow-hidden shrink-0">
            <button
              onClick={() => onUpdateEpisode(show, currentEp - 1)}
              disabled={currentEp <= 0}
              className="w-7 h-7 hover:bg-zinc-800 disabled:opacity-25 text-zinc-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              title="Kurangi 1 Episode"
            >
              <Minus className="w-3 h-3" />
            </button>
            <div className="w-[1px] h-3.5 bg-zinc-800" />
            <button
              onClick={() => onUpdateEpisode(show, currentEp + 1)}
              disabled={totalEp > 0 && currentEp >= totalEp}
              className="h-7 px-2.5 hover:bg-zinc-100 text-zinc-200 hover:text-black font-mono text-[11px] font-semibold flex items-center justify-center whitespace-nowrap transition disabled:opacity-25 cursor-pointer"
              title="Tambah 1 Episode"
            >
              +1 EP
            </button>
          </div>

          {/* Tombol Play / Link */}
          {show.episodeLink ? (
            <a
              href={show.episodeLink}
              target="_blank"
              rel="noopener noreferrer"
              className="h-7 px-2.5 bg-orange-500/15 hover:bg-orange-500 border border-orange-500/20 hover:border-orange-500 text-orange-400 hover:text-black rounded font-mono text-[11px] font-semibold inline-flex items-center justify-center gap-1 whitespace-nowrap shrink-0 transition"
            >
              <span>PLAY</span>
              <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
            </a>
          ) : (
            <span className="font-mono text-[10px] text-zinc-700 uppercase whitespace-nowrap">
              NO LINK
            </span>
          )}
        </div>
      </div>
    </div>
  );
}