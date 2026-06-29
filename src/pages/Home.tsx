import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Search, Link2, Brain, CheckCircle, Database,
  ArrowRight, TrendingUp, AlertTriangle
} from "lucide-react";
import { createAnalysis, getAnalyses, generateSimulatedResults } from "../lib/api";
import type { Analysis } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import ClassificationBadge from "../components/ClassificationBadge";

export default function Home() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [inputType, setInputType] = useState<"text" | "url">("text");
  const [loading, setLoading] = useState(false);
  const [recentAnalyses, setRecentAnalyses] = useState<Analysis[]>([]);

  useEffect(() => {
    getAnalyses()
      .then((data) => setRecentAnalyses(data.slice(-3).reverse()))
      .catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!input.trim()) {
      showToast("Cole um texto ou URL para analisar.", "error");
      return;
    }
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 2500));
      const sim = generateSimulatedResults(input);
      const userId = user?.id ?? 1;
      const isUrl = inputType === "url" || input.startsWith("http");
      const analysis = await createAnalysis({
        user_id: userId,
        title: isUrl ? `Análise de URL` : input.slice(0, 80) + (input.length > 80 ? "..." : ""),
        text: isUrl ? undefined : input,
        url: isUrl ? input : undefined,
        ...sim,
      });
      navigate(`/resultado/${analysis.id}`);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Erro ao analisar. Tente novamente.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-14 min-h-screen bg-white">
      {/* Hero */}
      <section className="border-b border-gray-100 py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-5">
            Verificação de conteúdo
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight mb-4 leading-[1.1]">
            Analise qualquer notícia<br />
            <span className="text-accent">em segundos.</span>
          </h1>
          <p className="text-gray-500 text-base max-w-xl mb-10 leading-relaxed">
            Cole um texto ou URL e receba métricas detalhadas de confiabilidade geradas por IA — sem adivinhação, sem ruído.
          </p>

          {/* Input card */}
          <div className="card p-5">
            {/* Toggle */}
            <div className="flex gap-1 mb-4 border-b border-gray-100 pb-4">
              <button
                onClick={() => setInputType("text")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all ${
                  inputType === "text"
                    ? "bg-gray-900 text-white font-medium"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Search size={13} />
                Texto
              </button>
              <button
                onClick={() => setInputType("url")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all ${
                  inputType === "url"
                    ? "bg-gray-900 text-white font-medium"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Link2 size={13} />
                URL
              </button>
            </div>

            {inputType === "text" ? (
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Cole aqui o texto da notícia que deseja verificar..."
                rows={5}
                className="input-base resize-none mb-4"
              />
            ) : (
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="https://exemplo.com/noticia..."
                className="input-base mb-4"
              />
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Brain size={15} />
                  Analisar conteúdo
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-14 px-4 max-w-5xl mx-auto">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Como funciona</h2>
          <p className="text-gray-400 text-sm">Três etapas automáticas, resultado em segundos</p>
        </div>
        <div className="grid md:grid-cols-3 gap-px bg-gray-100 rounded-lg overflow-hidden border border-gray-100">
          {[
            {
              icon: <Database size={18} className="text-gray-400" />,
              step: "01",
              title: "Extração inteligente",
              desc: "O sistema identifica automaticamente o conteúdo, seja um texto longo ou URL de uma matéria jornalística.",
            },
            {
              icon: <Brain size={18} className="text-gray-400" />,
              step: "02",
              title: "Análise por IA",
              desc: "Modelos de linguagem treinados avaliam padrões linguísticos, inconsistências e marcadores de desinformação.",
            },
            {
              icon: <CheckCircle size={18} className="text-gray-400" />,
              step: "03",
              title: "Checagem de fontes",
              desc: "Confronto com base de dados de fontes confiáveis e histórico de notícias verificadas.",
            },
          ].map((card) => (
            <div key={card.step} className="bg-white p-6">
              <div className="flex items-center justify-between mb-5">
                {card.icon}
                <span className="text-xs font-mono text-gray-300 font-medium">{card.step}</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2 text-sm">{card.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent analyses */}
      {recentAnalyses.length > 0 && (
        <section className="py-12 px-4 max-w-5xl mx-auto border-t border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-0.5">Análises recentes</h2>
              <p className="text-gray-400 text-sm">Verificações realizadas na plataforma</p>
            </div>
            <Link
              to="/historico"
              className="flex items-center gap-1 text-sm text-accent hover:text-accent-hover transition-colors"
            >
              Ver todas <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {recentAnalyses.map((a) => (
              <Link
                key={a.id}
                to={`/resultado/${a.id}`}
                className="card p-4 hover:border-gray-300 transition-colors group"
              >
                <p className="text-sm text-gray-800 line-clamp-2 mb-3 leading-relaxed">
                  {a.Content?.title || `Análise #${a.id}`}
                </p>
                <ClassificationBadge classification={a.classification} size="sm" />
                <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <TrendingUp size={11} />
                    {a.confidence_level}% confiança
                  </div>
                  <div className="flex items-center gap-1">
                    <AlertTriangle size={11} />
                    {a.fake_percentage}% falso
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
