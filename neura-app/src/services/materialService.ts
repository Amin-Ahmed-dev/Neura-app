import { apiClient } from "./apiClient";

export type ProcessingStatus = "pending" | "chunking" | "chunked" | "complete" | "failed" | "cached";

export interface Material {
  id: string;
  title: string;
  subject: string;
  page_count: number;
  processing_status: ProcessingStatus;
  created_at: string;
}

export interface MaterialChunk {
  id: string;
  title: string;
  content: string;
  order_index: number;
  subject?: string;
  is_math_physics?: boolean;
}

export interface MaterialDetail extends Material {
  chunks: MaterialChunk[];
}

export interface UploadResult {
  material_id: string;
  status: string;
  instant?: boolean;
  message: string;
}

export interface OcrResult {
  extracted_text: string;
  confidence: number;
}

export const materialService = {
  async list(): Promise<Material[]> {
    const { data } = await apiClient.get("/materials/");
    return data.materials;
  },

  async get(id: string): Promise<MaterialDetail> {
    const { data } = await apiClient.get(`/materials/${id}`);
    return data;
  },

  async upload(
    fileUri: string,
    fileName: string,
    mimeType: string,
    title: string,
    subject: string,
    onProgress?: (pct: number) => void
  ): Promise<UploadResult> {
    const form = new FormData();
    form.append("file", { uri: fileUri, name: fileName, type: mimeType } as any);
    form.append("title", title);
    form.append("subject", subject);

    const { data } = await apiClient.post("/materials/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e: { loaded: number; total?: number }) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      },
    });
    return data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/materials/${id}`);
  },

  async rename(id: string, title: string): Promise<void> {
    await apiClient.patch(`/materials/${id}`, { title });
  },

  async ocr(
    fileUri: string,
    fileName: string,
    mimeType: string
  ): Promise<OcrResult> {
    const form = new FormData();
    form.append("file", { uri: fileUri, name: fileName, type: mimeType } as any);
    const { data } = await apiClient.post("/materials/ocr", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};
