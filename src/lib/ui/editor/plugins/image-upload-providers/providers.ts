import { uploadConfig } from '$lib/stores/uploadConfig.js';
import { addToast } from '$lib/ui/toasts.svelte';
import { get } from 'svelte/store';

class UploadConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UploadConfigError';
  }
}
  
const providers = {
    vercel: async (file: File, config: { accessToken: string, bucketName: string }) => {
        const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
            "content-type": file?.type || "application/octet-stream",
            "x-vercel-filename": file?.name || "image.png",
            "authorization": `Bearer ${config.accessToken}`
        },
        body: file,
        });

        if (!response.ok) {
        throw new Error(`Vercel upload failed: ${response.statusText}`);
        }

        const { url } = await response.json();
        return url;
    },

    supabase: async (file: File, config: { accessToken: string, bucketName: string, supabaseUrl: string }) => {
        const { createClient } = await import('@supabase/supabase-js');
        
        if (!config.supabaseUrl) {
        throw new UploadConfigError('supabase url is required');
        }

        const supabase = createClient(config.supabaseUrl, config.accessToken, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
        }
        });

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;

        const { data, error } = await supabase.storage
        .from(config.bucketName)
        .upload(fileName, file);
        
        if (error) throw new Error(`Supabase upload failed: ${error.message}`);
        
        const { data: { publicUrl } } = supabase.storage
        .from(config.bucketName)
        .getPublicUrl(data.path);

        return publicUrl;
    },

    cloudinary: async (file: File, config: { accessToken: string, bucketName: string, cloudinaryCloudName: string }) => {
        if (!config.cloudinaryCloudName) {
          throw new UploadConfigError('cloudinaryCloudName is required in the configuration');
        }  

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', config.bucketName);

        const response = await fetch(
        `https://api.cloudinary.com/v1_1/${config.cloudinaryCloudName}/image/upload`,
        {
            method: 'POST',
            headers: {
            'Authorization': `Bearer ${config.accessToken}`
            },
            body: formData
        }
        );

        if (!response.ok) {
        throw new Error(`Cloudinary upload failed: ${response.statusText}`);
        }

        const { secure_url } = await response.json();
        return secure_url;
    }
};


export const handleImageUpload = async (file: File) => {
  try {
    // Get configuration from environment variables
    const config = get(uploadConfig)
    
    if (!config) {
      throw new UploadConfigError('Upload configuration is not set');
    }

    // Validate file type
    if (!file.type.includes('image/')) {
      throw new Error('File type not supported.');
    }

    // Validate file size (20MB limit)
    if (file.size / 1024 / 1024 > 20) {
      throw new Error('File size too big (max 20MB).');
    }

    const uploadFn = providers[config.provider];
    
    if (!uploadFn) {
      throw new Error(
        `Unsupported provider: ${config.provider}. Supported providers are: ${Object.keys(providers).join(', ')}`
      );
    }

    // Add loading toast
    addToast({
      data: {
        text: 'Uploading image...',
        type: 'loading'
      }
    });

    //@ts-ignore
    const url = await uploadFn(file, config);

    // Add success toast
    addToast({
      data: {
        text: 'Image uploaded successfully',
        type: 'success'
      }
    });

    // Preload the image
    return new Promise<string>((resolve) => {
      const image = new Image();
      image.src = url;
      image.onload = () => resolve(url);
    });

  } catch (error) {
    // Add error toast
    addToast({
      data: {
        text: error instanceof Error ? error.message : 'Error uploading image',
        type: 'error'
      }
    });

    throw error;
  }
};