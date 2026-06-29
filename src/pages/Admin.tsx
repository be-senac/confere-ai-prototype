import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, BarChart2, TrendingUp, Trash2, Shield, CheckCircle
} from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from "recharts";
import { getUsers, getAnalyses, deleteUser } from "../lib/api";
import type { User, Analysis } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import ClassificationBadge from "../components/ClassificationBadge";

const PIE_COLORS = { "Confiável": "#10b981", "Falsa": "#ef4444", "Inconclusiva": "#f59e0b" };

function StatCard({ icon, label, value, sub }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</span>
        <div className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center text-gray-500">{icon}</div>
      </div>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function Admin() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    Promise.all([getUsers(), getAnalyses()])
      .then(([u, a]) => { setUsers(u); setAnalyses(a); })
      .catch(() => showToast("Erro ao carregar dados", "error"))
      .finally(() => setLoading(false));
  }, [user]);

  const avgConfidence = analyses.length
    ? (analyses.reduce((s, a) => s + Number(a.confidence_level), 0) / analyses.length).toFixed(1)
    : "—";

  const pieData = ["Confiável", "Falsa", "Inconclusiva"].map((c) => ({
    name: c,
    value: analyses.filter((a) => a.classification === c).length,
  })).filter((d) => d.value > 0);

  const monthlyMap: Record<string, { Confiável: number; Falsa: number; Inconclusiva: number }> = {};
  analyses.forEach((a) => {
    const month = new Date(a.createdAt).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
    if (!monthlyMap[month]) monthlyMap[month] = { Confiável: 0, Falsa: 0, Inconclusiva: 0 };
    monthlyMap[month][a.classification as keyof typeof monthlyMap[string]]++;
  });
  const barData = Object.entries(monthlyMap).slice(-6).map(([m, v]) => ({ mes: m, ...v }));

  const handleDeleteUser = async (id: number) => {
    if (confirmDelete !== id) { setConfirmDelete(id); return; }
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      showToast("Usuário excluído", "success");
    } catch {
      showToast("Erro ao excluir usuário", "error");
    } finally {
      setConfirmDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="pt-14 min-h-screen flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-14 min-h-screen bg-white px-4 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="page-header flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gray-900 flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Painel Administrativo</h1>
            <p className="text-gray-400 text-sm">Visão geral da plataforma</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Users size={14} />} label="Usuários" value={users.length} />
          <StatCard icon={<BarChart2 size={14} />} label="Análises" value={analyses.length} />
          <StatCard icon={<TrendingUp size={14} />} label="Confiança média" value={`${avgConfidence}%`} />
          <StatCard
            icon={<CheckCircle size={14} />}
            label="Taxa confiável"
            value={analyses.length ? `${Math.round(analyses.filter(a => a.classification === "Confiável").length / analyses.length * 100)}%` : "—"}
          />
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="card p-6">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5">Distribuição por classificação</h2>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={PIE_COLORS[entry.name as keyof typeof PIE_COLORS]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12, color: "#374151" }}
                    formatter={(v, n) => [v, n]}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, color: "#6b7280" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-56 flex items-center justify-center text-gray-400 text-sm">Sem dados ainda</div>
            )}
          </div>

          <div className="card p-6">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5">Evolução mensal</h2>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="mes" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12 }} />
                  <Bar dataKey="Confiável" fill="#10b981" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Falsa" fill="#ef4444" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Inconclusiva" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-56 flex items-center justify-center text-gray-400 text-sm">Sem dados mensais ainda</div>
            )}
          </div>
        </div>

        {/* Users table */}
        <div className="card overflow-hidden mb-4">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Users size={14} className="text-gray-400" />
            <h2 className="text-sm font-medium text-gray-900">Usuários cadastrados ({users.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-50 bg-gray-50/50">
                  <th className="px-5 py-3 text-left font-medium">ID</th>
                  <th className="px-5 py-3 text-left font-medium">Nome</th>
                  <th className="px-5 py-3 text-left font-medium">E-mail</th>
                  <th className="px-5 py-3 text-left font-medium">Criado em</th>
                  <th className="px-5 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3 text-xs text-gray-400 font-mono">#{u.id}</td>
                    <td className="px-5 py-3 text-sm text-gray-800 font-medium">{u.name}</td>
                    <td className="px-5 py-3 text-sm text-gray-500">{u.email}</td>
                    <td className="px-5 py-3 text-xs text-gray-400">{new Date(u.createdAt).toLocaleDateString("pt-BR")}</td>
                    <td className="px-5 py-3 text-right">
                      {confirmDelete === u.id ? (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleDeleteUser(u.id)} className="px-2 py-1 bg-red-600 text-white text-xs rounded font-medium hover:bg-red-700 transition-colors">Confirmar</button>
                          <button onClick={() => setConfirmDelete(null)} className="btn-secondary text-xs py-1 px-2">Cancelar</button>
                        </div>
                      ) : (
                        <button onClick={() => handleDeleteUser(u.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && <div className="py-10 text-center text-gray-400 text-sm">Nenhum usuário cadastrado</div>}
          </div>
        </div>

        {/* Recent analyses */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <BarChart2 size={14} className="text-gray-400" />
            <h2 className="text-sm font-medium text-gray-900">Análises recentes ({analyses.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-50 bg-gray-50/50">
                  <th className="px-5 py-3 text-left font-medium">ID</th>
                  <th className="px-5 py-3 text-left font-medium">Título</th>
                  <th className="px-5 py-3 text-left font-medium">Classificação</th>
                  <th className="px-5 py-3 text-left font-medium">Confiança</th>
                  <th className="px-5 py-3 text-left font-medium">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {analyses.slice().reverse().slice(0, 10).map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3 text-xs text-gray-400 font-mono">#{a.id}</td>
                    <td className="px-5 py-3 text-sm text-gray-600 max-w-xs truncate">{a.Content?.title || "—"}</td>
                    <td className="px-5 py-3"><ClassificationBadge classification={a.classification} size="sm" /></td>
                    <td className="px-5 py-3 text-sm text-gray-500">{a.confidence_level}%</td>
                    <td className="px-5 py-3 text-xs text-gray-400">{new Date(a.createdAt).toLocaleDateString("pt-BR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {analyses.length === 0 && <div className="py-10 text-center text-gray-400 text-sm">Nenhuma análise ainda</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
