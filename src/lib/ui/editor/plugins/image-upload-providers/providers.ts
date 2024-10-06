import { addToast } from '$lib/ui/toasts.svelte';

type SupportedProvider = 'vercel' | 'supabase' | 'cloudinary';

class UploadConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UploadConfigError';
  }
}

// Read and validate environment variables
const getEnvConfig = () => {
    const provider = import.meta.env.VITE_UPLOAD_PROVIDER as SupportedProvider;
    const bucketName = import.meta.env.VITE_UPLOAD_BUCKET_NAME;
    
    if (!provider) {
      throw new UploadConfigError(
        'VITE_UPLOAD_PROVIDER is required in your .env file. Supported values: vercel, supabase, cloudinary'
      );
    }
    
    if (!bucketName) {
      throw new UploadConfigError(
        'VITE_UPLOAD_BUCKET_NAME is required in your .env file'
      );
    }
  
    // Provider-specific token validation
    const tokenKey = `VITE_${provider.toUpperCase()}_ACCESS_TOKEN`;
    const accessToken = import.meta.env[tokenKey];
    
    if (!accessToken) {
      throw new UploadConfigError(
        `${tokenKey} is required in your .env file`
      );
    }
  
    return {
      provider,
      bucketName,
      accessToken
    };
  };
  
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

    supabase: async (file: File, config: { accessToken: string, bucketName: string }) => {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        
        if (!supabaseUrl) {
        throw new UploadConfigError('VITE_SUPABASE_URL is required in your .env file');
        }

        const supabase = createClient(supabaseUrl, config.accessToken);

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

    cloudinary: async (file: File, config: { accessToken: string, bucketName: string }) => {
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        
        if (!cloudName) {
        throw new UploadConfigError('VITE_CLOUDINARY_CLOUD_NAME is required in your .env file');
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', config.bucketName);

        const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
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
    const config = getEnvConfig();
    
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

    const url = await uploadFn(file, {
      accessToken: config.accessToken,
      bucketName: config.bucketName
    });

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