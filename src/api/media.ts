import { apiRequest, isApiConfigured } from "./client";
import { mockResponse } from "./mock";

export type UploadedMedia = {
  url: string;
};

export async function uploadMedia(fileUri: string) {
  if (isApiConfigured()) {
    const formData = new FormData();
    formData.append("file", {
      uri: fileUri,
      name: "upload.jpg",
      type: "image/jpeg",
    } as unknown as Blob);

    return apiRequest<UploadedMedia>("/media/uploads", {
      method: "POST",
      body: formData,
      headers: {},
    });
  }

  return mockResponse({ url: fileUri } satisfies UploadedMedia);
}
