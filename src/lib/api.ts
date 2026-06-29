const API_URL = "https://back-end-pi2-node-ts.onrender.com";

// --- Types ---
export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Content {
  id: number;
  user_id: number;
  title: string;
  text?: string;
  url?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type Classification = "Confiável" | "Falsa" | "Inconclusiva";

export interface Analysis {
  id: number;
  content_id: number;
  ai_percentage: number;
  fake_percentage: number;
  classification: Classification;
  confidence_level: number;
  createdAt: string;
  updatedAt: string;
  Content?: Content;
}

// --- Auth ---
export async function login(email: string, password: string): Promise<User> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erro ao fazer login");
  return data;
}

// --- Users ---
export async function createUser(name: string, email: string, password: string): Promise<User> {
  const res = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erro ao criar usuário");
  return data;
}

export async function getUsers(): Promise<User[]> {
  const res = await fetch(`${API_URL}/users`);
  if (!res.ok) throw new Error("Erro ao buscar usuários");
  return res.json();
}

export async function getUserById(id: number): Promise<User> {
  const res = await fetch(`${API_URL}/users/${id}`);
  if (!res.ok) throw new Error("Usuário não encontrado");
  return res.json();
}

export async function updateUser(id: number, data: Partial<{ name: string; email: string; password: string }>): Promise<User> {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Erro ao atualizar usuário");
  return json;
}

export async function deleteUser(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/users/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Erro ao excluir usuário");
}

// --- Contents ---
export async function getContents(): Promise<Content[]> {
  const res = await fetch(`${API_URL}/contents`);
  if (!res.ok) throw new Error("Erro ao buscar conteúdos");
  return res.json();
}

export async function deleteContent(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/contents/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Erro ao excluir conteúdo");
}

// --- Analyses ---
export async function createAnalysis(payload: {
  user_id: number;
  title: string;
  text?: string;
  url?: string;
  ai_percentage: number;
  fake_percentage: number;
  classification: Classification;
  confidence_level: number;
}): Promise<Analysis> {
  const res = await fetch(`${API_URL}/analyses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erro ao criar análise");
  return data;
}

export async function getAnalyses(): Promise<Analysis[]> {
  const res = await fetch(`${API_URL}/analyses`);
  if (!res.ok) throw new Error("Erro ao buscar análises");
  return res.json();
}

export async function getAnalysisById(id: number | string): Promise<Analysis> {
  const res = await fetch(`${API_URL}/analyses/${id}`);
  if (!res.ok) throw new Error("Análise não encontrada");
  return res.json();
}

export async function deleteAnalysis(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/analyses/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Erro ao excluir análise");
}

export async function updateAnalysis(id: number, data: {
  ai_percentage: number;
  fake_percentage: number;
  classification: string;
  confidence_level: number;
}): Promise<Analysis> {
  const res = await fetch(`${API_URL}/analyses/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Erro ao atualizar análise");
  return json;
}

// --- Simulation helpers ---
export function generateSimulatedResults(text: string): {
  ai_percentage: number;
  fake_percentage: number;
  classification: Classification;
  confidence_level: number;
} {
  const seed = text.length % 100;
  const fake_percentage = Math.min(95, Math.max(5, (seed * 1.7 + Math.random() * 30)));
  const ai_percentage = Math.min(90, Math.max(10, (seed * 0.9 + Math.random() * 25)));
  const confidence_level = Math.min(98, Math.max(60, 70 + Math.random() * 28));

  let classification: Classification;
  if (fake_percentage > 65) classification = "Falsa";
  else if (fake_percentage < 35) classification = "Confiável";
  else classification = "Inconclusiva";

  return {
    ai_percentage: Math.round(ai_percentage * 10) / 10,
    fake_percentage: Math.round(fake_percentage * 10) / 10,
    classification,
    confidence_level: Math.round(confidence_level * 10) / 10,
  };
}
