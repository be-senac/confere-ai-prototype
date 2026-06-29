import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Link2, FileText, RotateCcw } from "lucide-react";
import { getAnalysisById } from "../lib/api";
import type { Analysis } from "../lib/api";
import ClassificationBadge from "../components/ClassificationBadge";
import PercentageBar from "../components/PercentageBar";

const CLASSIFICATION_CONFIG = {
  "Confiável": {
    border: "border-l-emerald-500",
    label: "Esta notícia foi classificada como confiável pela análise.",
  },
  "Falsa": {
    border: "border-l-red-500",
    label: "Atenção: esta notícia apresenta fortes indicadores de desinformação.",
  },
  "Inconclusiva": {
    border: "border-l-amber-400",
    label: "Não foi possível determinar com certeza a veracidade desta notícia.",
  },
};

export default function Resultado() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    getAnalysisById(id)
      .then(setAnalysis)
      .catch(() => setError("Análise não encontrada."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="pt-14 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 text-sm">Carregando resultado...</p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="pt-14 min-h-screen flex items-center justify-center px-4">
        <div className="text-center card p-10 max-w-md">
          <p className="text-red-600 text-sm mb-4">{error || "Análise não encontrada"}</p>
          <button onClick={() => navigate("/")} className="text-sm text-accent hover:text-accent-hover flex items-center gap-1.5 mx-auto">
            <ArrowLeft size={13} /> Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  const cfg = CLASSIFICATION_CONFIG[analysis.classification] || CLASSIFICATION_CONFIG["Inconclusiva"];
  const content = analysis.Content;
  const date = new Date(analysis.createdAt).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric"
  });

  return (
    <div className="pt-14 min-h-screen bg-white px-4 py-10">
      <div className="max-w-2xl mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          Voltar
        </button>

        {/* Classification card */}
        <div className={`card border-l-4 ${cfg.border} p-6 mb-4 animate-fade-in`}>
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-400 mb-2">Resultado da análise #{analysis.id}</p>
              <ClassificationBadge classification={analysis.classification} size="lg" />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Calendar size={11} />
              {date}
            </div>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed border-t border-gray-100 pt-4">
            {cfg.label}
          </p>
        </div>

        {/* Metrics */}
        <div className="card p-6 mb-4 space-y-5 animate-slide-up">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Métricas detalhadas</h3>
          <PercentageBar label="Probabilidade de conteúdo falso" value={analysis.fake_percentage} color="red" delay={100} />
          <PercentageBar label="Conteúdo gerado por IA" value={analysis.ai_percentage} color="blue" delay={300} />
          <PercentageBar label="Nível de confiança da análise" value={analysis.confidence_level} color="green" delay={500} />
        </div>

        {/* Content details */}
        {content && (
          <div className="card p-6 mb-6 animate-slide-up space-y-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Conteúdo analisado</h3>

            {content.title && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Título</p>
                <p className="text-gray-900 font-medium text-sm">{content.title}</p>
              </div>
            )}

            {content.url && (
              <div>
                <p className="text-xs text-gray-400 mb-1">URL</p>
                <a
                  href={content.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-accent hover:text-accent-hover text-sm transition-colors"
                >
                  <Link2 size={12} />
                  <span className="truncate">{content.url}</span>
                </a>
              </div>
            )}

            {content.text && (
              <div>
                <p className="text-xs text-gray-400 mb-2">Texto analisado</p>
                <div className="card-muted p-4 rounded-md">
                  <p className="text-gray-500 text-sm leading-relaxed line-clamp-6">
                    <FileText size={11} className="inline mr-1.5 text-gray-400" />
                    {content.text}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 animate-fade-in">
          <Link
            to="/"
            className="btn-primary flex items-center gap-2"
          >
            <RotateCcw size={14} />
            Nova análise
          </Link>
          <Link
            to="/historico"
            className="btn-secondary flex items-center gap-2"
          >
            Ver histórico
          </Link>
        </div>
      </div>
    </div>
  );
}
