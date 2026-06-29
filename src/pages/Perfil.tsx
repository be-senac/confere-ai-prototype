import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, Save, Trash2, LogOut, Shield } from "lucide-react";
import { updateUser, deleteUser } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Perfil() {
  const { user, setUser, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: { name: string; email: string; password?: string } = { name, email };
      if (password) payload.password = password;
      const updated = await updateUser(user.id, payload);
      setUser(updated);
      showToast("Perfil atualizado com sucesso!", "success");
      setPassword("");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Erro ao salvar.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    try {
      await deleteUser(user.id);
      logout();
      showToast("Conta excluída.", "info");
      navigate("/");
    } catch {
      showToast("Erro ao excluir conta.", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="pt-14 min-h-screen bg-white px-4 py-10">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="page-header flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-gray-900 flex items-center justify-center text-white font-semibold text-lg">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{user.name}</h1>
            <p className="text-gray-400 text-sm">{user.email}</p>
          </div>
        </div>

        {/* Edit form */}
        <form onSubmit={handleSave} className="card p-6 mb-4 space-y-4 animate-slide-up">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={14} className="text-gray-400" />
            <h2 className="text-sm font-medium text-gray-700">Editar perfil</h2>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600 block">Nome</label>
            <div className="relative">
              <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-base pl-9" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600 block">E-mail</label>
            <div className="relative">
              <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-base pl-9" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600 block">Nova senha <span className="text-gray-400 font-normal">(opcional)</span></label>
            <div className="relative">
              <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Deixe em branco para manter atual" className="input-base pl-9" />
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={13} />}
            Salvar alterações
          </button>
        </form>

        {/* Danger zone */}
        <div className="card p-6 border-red-100 animate-fade-in">
          <h2 className="text-sm font-medium text-red-600 mb-4 flex items-center gap-2">
            <Trash2 size={13} />
            Zona de perigo
          </h2>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => { logout(); navigate("/"); }}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <LogOut size={13} />
              Sair da conta
            </button>

            {!confirmDelete ? (
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-md text-sm text-red-600 hover:bg-red-100 transition-colors"
              >
                <Trash2 size={13} />
                Excluir conta
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-red-600 rounded-md text-sm text-white font-medium hover:bg-red-700 transition-colors"
                >
                  {deleting ? "..." : "Confirmar exclusão"}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="btn-secondary text-sm"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            A exclusão da conta é permanente e não pode ser desfeita.
          </p>
        </div>
      </div>
    </div>
  );
}
