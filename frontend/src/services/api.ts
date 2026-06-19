import type { Application, ApplicationFormData } from "../types";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const handleResponse = async (res: Response) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Something went wrong");
  return data;
};

export const getApplications = async (status?: string, search?: string): Promise<Application[]> => {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (search) params.append("search", search);
  const res = await fetch(`${BASE_URL}/applications?${params}`);
  const data = await handleResponse(res);
  return data.data;
};

export const createApplication = async (payload: ApplicationFormData): Promise<Application> => {
  const res = await fetch(`${BASE_URL}/applications`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await handleResponse(res);
  return data.data;
};

export const updateApplication = async (id: string, payload: Partial<ApplicationFormData>): Promise<Application> => {
  const res = await fetch(`${BASE_URL}/applications/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await handleResponse(res);
  return data.data;
};

export const deleteApplication = async (id: string): Promise<void> => {
  const res = await fetch(`${BASE_URL}/applications/${id}`, { method: "DELETE" });
  await handleResponse(res);
};