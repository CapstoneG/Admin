export interface UploadVideoResponse {
  url: string;
  publicId: string;
}

export interface ApiResponse<T> {
  code: number;
  message?: string;
  result?: T;
}

class UploadService {

  async uploadVideo(file: File): Promise<UploadVideoResponse | null> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8080/api/v1/upload/video', {
        method: 'POST',
        body: formData,
      });

      const data: ApiResponse<UploadVideoResponse> = await response.json();
      
      if (data.code === 0 && data.result) {
        return data.result;
      } else {
        throw new Error(data.message || 'Upload video failed');
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      throw error;
    }
  }

  async deleteVideo(publicId: string): Promise<void> {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/upload/video?publicId=${publicId}`, {
        method: 'DELETE'
      });

      const data: ApiResponse<null> = await response.json();
      
      if (data.code !== 0) {
        throw new Error(data.message || 'Delete video failed');
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      throw error;
    }
  }

  async uploadImage(file: File): Promise<UploadVideoResponse | null> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8080/api/v1/upload/image', {
        method: 'POST',
        body: formData,
      });

      const data: ApiResponse<UploadVideoResponse> = await response.json();
      
      if (data.code === 0 && data.result) {
        return data.result;
      } else {
        throw new Error(data.message || 'Upload image failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/upload/image?publicId=${publicId}`, {
        method: 'DELETE'
      });

      const data: ApiResponse<null> = await response.json();
      
      if (data.code !== 0) {
        throw new Error(data.message || 'Delete image failed');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }
}

export const uploadService = new UploadService();
