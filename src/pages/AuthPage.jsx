import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Loader2, ArrowRight } from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
    } catch (err) {
      setError(`Gagal masuk (${err.code}). Periksa kembali email & password.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex flex-col justify-between p-6 sm:p-12">
      {/* Top Brand Header */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-5">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
          <span className="font-extrabold tracking-[0.2em] text-sm uppercase">KYATCH</span>
        </div>
        <span className="font-mono text-[11px] text-zinc-500 uppercase tracking-widest">
          Personal Cinema Index
        </span>
      </div>

      {/* Main Form */}
      <div className="w-full max-w-sm mx-auto my-auto py-12">
        <div className="mb-8">
          <p className="font-mono text-[11px] uppercase tracking-widest text-orange-500 mb-2">
            {isLogin ? "// Autentikasi" : "// Registrasi Akun"}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {isLogin ? "Masuk ke Arsip." : "Buat Arsip Baru."}
          </h1>
          <p className="text-sm text-zinc-500 mt-1.5">
            Catat progres episode dan tautan tontonan terakhir Anda di satu tempat.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 bg-red-950/30 border-l-2 border-red-500 text-red-300 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-400 mb-1.5">
              Alamat Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@domain.com"
              className="w-full bg-[#121212] border border-zinc-800 focus:border-zinc-300 rounded-md px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-400 mb-1.5">
              Kata Sandi
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#121212] border border-zinc-800 focus:border-zinc-300 rounded-md px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 bg-zinc-100 hover:bg-white text-black font-semibold py-2.5 px-4 rounded-md text-sm transition flex items-center justify-between cursor-pointer disabled:opacity-50"
          >
            <span>{isLogin ? "Masuk Sekarang" : "Buat Akun"}</span>
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-900 flex items-center justify-between text-xs text-zinc-500">
          <span>{isLogin ? "Belum punya akses?" : "Sudah punya akun?"}</span>
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="text-zinc-200 hover:text-orange-400 font-medium underline underline-offset-4 cursor-pointer"
          >
            {isLogin ? "Daftar akun baru" : "Kembali ke login"}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-900 pt-5 flex justify-between text-[11px] font-mono text-zinc-600">
        <span>KYATCH LOG SYSTEM</span>
        <span>PRIVATE ARCHIVE</span>
      </div>
    </div>
  );
}