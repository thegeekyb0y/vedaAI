import axios from "axios";
import { IAssignment } from "@/types/assignment.types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Assignments
export const createAssignment = async (
  data: Omit<
    IAssignment,
    "_id" | "status" | "result" | "createdAt" | "updatedAt"
  >,
): Promise<IAssignment> => {
  const res = await api.post<IAssignment>("/api/assignments", data);
  return res.data;
};

export const getAssignments = async (): Promise<IAssignment[]> => {
  const res = await api.get<IAssignment[]>("/api/assignments");
  return res.data;
};

export const getAssignmentById = async (id: string): Promise<IAssignment> => {
  const res = await api.get<IAssignment>(`/api/assignments/${id}`);
  return res.data;
};

export const deleteAssignment = async (id: string): Promise<void> => {
  await api.delete(`/api/assignments/${id}`);
};

export const regenerateAssignment = async (
  id: string,
): Promise<IAssignment> => {
  const res = await api.post<IAssignment>(`/api/assignments/${id}/regenerate`);
  return res.data;
};

// Upload
export const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post<{ fileUrl: string }>("/api/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.fileUrl;
};
