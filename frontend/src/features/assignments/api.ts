import { AxiosProgressEvent } from "axios";
import { apiClient } from "@/lib/api";
import {
  AssignmentCreateFormValues,
} from "@/features/assignments/form-schema";
import { IAssignment } from "@/types/assignment.types";

type CreateAssignmentPayload = Omit<
  AssignmentCreateFormValues,
  "additionalInstructions"
> & {
  additionalInstructions?: string;
};

export type UploadFileResponse = {
  fileUrl: string;
};

export const createAssignment = async (
  payload: CreateAssignmentPayload,
): Promise<IAssignment> => {
  const response = await apiClient.post<IAssignment>("/api/assignments", {
    ...payload,
    additionalInstructions: payload.additionalInstructions?.trim() ?? "",
  });

  return response.data;
};

export const getAssignments = async (): Promise<IAssignment[]> => {
  const response = await apiClient.get<IAssignment[]>("/api/assignments");
  return response.data;
};

export const getAssignmentById = async (id: string): Promise<IAssignment> => {
  const response = await apiClient.get<IAssignment>(`/api/assignments/${id}`);
  return response.data;
};

export const deleteAssignment = async (id: string) => {
  await apiClient.delete(`/api/assignments/${id}`);
};

export const regenerateAssignment = async (
  id: string,
): Promise<IAssignment> => {
  const response = await apiClient.post<IAssignment>(
    `/api/assignments/${id}/regenerate`,
  );
  return response.data;
};

export const uploadFile = async (
  file: File,
  onUploadProgress?: (event: AxiosProgressEvent) => void,
): Promise<UploadFileResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post<UploadFileResponse>(
    "/api/upload",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress,
    },
  );

  return response.data;
};
