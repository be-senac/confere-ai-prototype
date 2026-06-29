import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Shield, ArrowRight, Eye, EyeOff } from "lucide-react";
import { createUser } from "../lib/api";
import { useToast } from "../context/ToastContext";

export default function Cadastro() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      showToast("Preencha todos os campos.", "error");
      return;
    }
    if (password.length < 6) {
      showToast("A senha deve ter pelo menos 6 caracteres.", "error");
      return;
    }
    setLoading(true);
    try {
      await createUser(name, email, password);
      showToast("Conta criada com sucesso! Faça login.", "success");
      navigate("/login");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Erro ao criar conta.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-14 min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center mx-auto mb-4">
            <Shield size={18} className="text-white" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Criar conta</h1>
          <p className="text-gray-400 text-sm mt-1">Comece a verificar notícias gratuitamente</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600 block">Nome completo</label>
            <div className="relative">
              <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" className="input-base pl-9" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600 block">E-mail</label>
            <div className="relative">
              <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className="input-base pl-9" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600 block">Senha</label>
            <div className="relative">
              <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="input-base pl-9 pr-9"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
            {loading ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Criar conta<ArrowRight size={14} /></>
            )}
          </button>

          <p className="text-center text-sm text-gray-400 pt-1">
            Já tem uma conta?{" "}
            <Link to="/login" className="text-accent hover:text-accent-hover font-medium transition-colors">
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
