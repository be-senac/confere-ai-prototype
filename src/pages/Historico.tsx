import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, Trash2, ExternalLink, Calendar, TrendingUp } from "lucide-react";
import { getAnalyses, deleteAnalysis } from "../lib/api";
import type { Analysis, Classification } from "../lib/api";
import ClassificationBadge from "../components/ClassificationBadge";
import { useToast } from "../context/ToastContext";

const FILTERS: Array<Classification | "Todas"> = ["Todas", "Confiável", "Falsa", "Inconclusiva"];

export default function Historico() {
  const { showToast } = useToast();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Classification | "Todas">("Todas");
  const [deleting, setDeleting] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  useEffect(() => {
    getAnalyses()
      .then((data) => setAnalyses(data.reverse()))
      .catch(() => showToast("Erro ao carregar análises", "error"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = analyses.filter((a) => {
    const matchSearch =
      !search ||
      a.Content?.title?.toLowerCase().includes(search.toLowerCase()) ||
      a.Content?.text?.toLowerCase().includes(search.toLowerCase()) ||
      a.Content?.url?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "Todas" || a.classification === filter;
    return matchSearch && matchFilter;
  });

  const handleDelete = async (id: number) => {
    if (confirmDelete !== id) {
      setConfirmDelete(id);
      return;
    }
    setDeleting(id);
    try {
      await deleteAnalysis(id);
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
      showToast("Análise excluída com sucesso", "success");
    } catch {
      showToast("Erro ao excluir análise", "error");
    } finally {
      setDeleting(null);
      setConfirmDelete(null);
    }
  };

  return (
    <div className="pt-14 min-h-screen bg-white px-4 py-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="page-header">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Histórico de análises</h1>
          <p className="text-gray-400 text-sm">Todas as verificações realizadas na plataforma</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título, texto ou URL..."
              className="input-base pl-9"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={13} className="text-gray-400 shrink-0" />
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all border ${
                  filter === f
                    ? "bg-gray-900 text-white border-gray-900"
                    : "text-gray-500 hover:text-gray-900 border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <p className="text-xs text-gray-400 mb-5">
          {filtered.length} {filtered.length === 1 ? "resultado" : "resultados"}
        </p>

        {/* List */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-50 rounded-lg border border-gray-100 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Search size={28} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium text-sm text-gray-500">Nenhuma análise encontrada</p>
            <p className="text-xs mt-1 text-gray-400">Tente ajustar os filtros ou realize uma nova análise</p>
            <Link to="/" className="mt-4 inline-block text-accent text-sm hover:text-accent-hover transition-colors">
              Nova análise →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((a) => (
              <div
                key={a.id}
                className="card p-4 hover:border-gray-300 transition-colors group"
                onClick={() => confirmDelete === a.id && setConfirmDelete(null)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <ClassificationBadge classification={a.classification} size="sm" />
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(a.createdAt).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <p className="text-gray-800 text-sm truncate">
                      {a.Content?.title || `Análise #${a.id}`}
                    </p>
                    {a.Content?.url && (
                      <a
                        href={a.Content.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-accent hover:text-accent-hover flex items-center gap-1 mt-0.5 w-fit"
                      >
                        <ExternalLink size={10} />
                        <span className="truncate max-w-xs">{a.Content.url}</span>
                      </a>
                    )}
                    <div className="flex gap-4 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <TrendingUp size={10} />
                        Confiança: {a.confidence_level}%
                      </span>
                      <span>Falso: {a.fake_percentage}%</span>
                      <span>IA: {a.ai_percentage}%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      to={`/resultado/${a.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="opacity-0 group-hover:opacity-100 transition-opacity btn-secondary flex items-center gap-1 py-1.5 px-2.5 text-xs"
                    >
                      <ExternalLink size={11} />
                      Ver
                    </Link>

                    {confirmDelete === a.id ? (
                      <div className="flex gap-1.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(a.id); }}
                          disabled={deleting === a.id}
                          className="px-2.5 py-1.5 bg-red-600 text-white rounded-md text-xs font-medium hover:bg-red-700 transition-colors"
                        >
                          {deleting === a.id ? "..." : "Confirmar"}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setConfirmDelete(null); }}
                          className="btn-secondary py-1.5 px-2.5 text-xs"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(a.id); }}
                        className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                        title="Excluir"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
