import { writable } from 'svelte/store';

export interface UploadConfig {
  provider: 'vercel' | 'supabase' | 'cloudinary';
  bucketName: string;
  accessToken: string;
  supabaseUrl?: string;
  cloudinaryCloudName?: string;
}

const createUploadConfigStore = () => {
  const { subscribe, set, update } = writable<UploadConfig | null>(null);

  return {
    subscribe,
    setConfig: (config: UploadConfig) => set(config),
    updateConfig: (partialConfig: Partial<UploadConfig>) => update(config => {
      if (!config) return partialConfig as UploadConfig;
      return { ...config, ...partialConfig };
    }),
    reset: () => set(null)
  };
};

export const uploadConfig = createUploadConfigStore();