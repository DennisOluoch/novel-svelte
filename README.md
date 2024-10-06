# Novella Svelte

Heavily biased Notion-style WYSIWYG editor without the bells and whistles. I'm maintaining this for my blogging website called [AcademiaScribes](https://academiascribes.com).

Based on [Novel](https://github.com/steven-tey/novel)

Forked from [Novel-Svelte](https://github.com/DennisOluoch/novel-svelte)

Made for [DennisOluoch](https://github.com/DennisOluoch)

## Features

- 📝 Rich Text Editor with Notion-style formatting
- 🖼️ Image uploads with drag & drop, paste, and file selection
- 💾 Auto-saving to local storage
- ⚡ Lightning fast and lightweight
- 🎨 Fully customizable with Tailwind CSS
- 📱 Mobile-friendly and responsive

## Techs and Works

- **Svelte** - Frontend framework
- **Tiptap** - Headless editor framework
- **Tailwind CSS** - Styling

# Installation

```bash
npm i another-novel-svelte
```

# Basic Usage

```svelte
<script>
    import { Editor } from 'another-novel-svelte';

    let saveStatus = 'Saved';
    let editor;
</script>

<main>
    <Editor
        bind:editor
        onUpdate={() => {
            saveStatus = 'Unsaved';
        }}
        onDebouncedUpdate={() => {
            saveStatus = 'Saving...';
            // Saving code goes here
            saveStatus = 'Saved';
        }}
    >
        <div>
            {saveStatus}
        </div>
    </Editor>
</main>
```

# Image Upload Configuration

The editor supports image uploads to multiple providers: Vercel Blob, Supabase Storage, and Cloudinary.

## Environment Variables Setup

Create a `.env` file in your project root. For client-side access, all variables must be prefixed with `VITE_`:

```env
# Required for all providers
VITE_UPLOAD_PROVIDER=supabase  # Options: 'vercel', 'supabase', 'cloudinary'
VITE_UPLOAD_BUCKET_NAME=your-bucket-name

# Provider-specific configuration

# For Vercel Blob:
VITE_VERCEL_ACCESS_TOKEN=your-token

# For Supabase:
VITE_SUPABASE_ACCESS_TOKEN=your-token
VITE_SUPABASE_URL=your-project-url

# For Cloudinary:
VITE_CLOUDINARY_ACCESS_TOKEN=your-token
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
```

## Provider Setup Instructions

### Vercel Blob

1. Set up a Vercel project
2. Get your Blob access token from the Vercel dashboard
3. Configure environment variables as shown above

### Supabase Storage

1. Create a Supabase project
2. Create a storage bucket
3. Set the storage bucket to public if you want the images to be publicly accessible
4. Get your service role key from the project settings
5. Configure environment variables as shown above

### Cloudinary

1. Create a Cloudinary account
2. Create an upload preset (can be done in the Settings > Upload section)
3. Get your cloud name and API credentials
4. Configure environment variables as shown above

## Image Upload Features

- 📤 Drag and drop image uploads
- 📋 Paste images directly from clipboard
- 🖼️ Support for all standard image formats (jpg, png, gif, etc.)
- ⚖️ Maximum file size: 20MB
- 🔄 Real-time upload status with toast notifications
- 📏 Image resizing after upload
- 💾 Automatic image optimization

## Security Considerations

⚠️ **Important**: The environment variables configured above will be visible in the client-side code. For production use, we strongly recommend implementing a server-side API endpoint to handle the actual upload operations.

### Recommended Production Setup

1. Create a server-side API endpoint (using SvelteKit or your preferred backend):

```typescript
// routes/api/upload/+server.ts
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
    const file = await request.blob();
    // Handle upload using server-side tokens
    // Return the URL of the uploaded file
    return json({ url: uploadedUrl });
}
```

2. Use the server endpoint in production:

```typescript
const uploadFile = async (file: File) => {
    if (import.meta.env.DEV) {
        // Use direct provider upload in development
        return handleDirectUpload(file);
    } else {
        // Use server endpoint in production
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        const { url } = await response.json();
        return url;
    }
};
```

# Development

1. Install Node.js and npm ([download here](https://nodejs.org/en/download/))

2. Clone the repository:

```bash
git clone https://github.com/DennisOluoch/novel-svelte.git
cd novel-svelte
```

3. Install dependencies:

```bash
npm install
```

4. Create and configure your `.env` file based on the examples above

5. Start the development server:

```bash
npm run dev
```

Visit `http://localhost:5173/` to see the preview.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `class` | `string` | `'relative min-h-[500px] w-full max-w-screen-lg border-stone-200 bg-white p-12 px-8 sm:mb-[calc(20vh)] sm:rounded-lg sm:border sm:px-12 sm:shadow-lg'` | Additional classes to add to the editor container |
| `defaultValue` | `JSONContent \| string` | `defaultEditorContent` | The default value to use for the editor |
| `extensions` | `Extension[]` | `[]` | Additional extensions to use for the editor |
| `editorProps` | `EditorProps` | `{}` | Additional props to pass to the Tiptap editor |
| `onUpdate` | `(editor?: Editor) => void \| Promise<void>` | `noop` | Callback function called on every editor update |
| `onDebouncedUpdate` | `(editor?: Editor) => void \| Promise<void>` | `noop` | Callback function called after debounce duration |
| `debounceDuration` | `number` | `750` | Duration to debounce the onDebouncedUpdate callback |
| `storageKey` | `string` | `'novel__content'` | Key to use for storing editor content in localStorage |
| `disableLocalStorage` | `boolean` | `false` | Disable local storage read/save |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License
