# Novella Svelte

Heavily biased Notion-style WYSIWYG editor without the bells and whistles. I'm maintaining this for my upcoming blogging website called [BrainDead](https://github.com/BrainDeadSocial).

Based on [Novel](https://github.com/steven-tey/novel)

Forked from [Novel-Svelte](https://github.com/TGlide/novel-svelte)

Made for [BrainDead](https://github.com/BrainDeadSocial)

## Techs and Works

- **Svelte**
- **Tiptap**
- **Tailwind CSS**

# Usage

1. Set up your Svelte project.

2. Install novella-svelte

```bash
npm i novella-svelte
```

3. Import and Use

```svelte
<script>
	import { Editor } from 'novella-svelte';

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
			// Saving code go here
			saveStatus = 'Saved';
		}}
	>
		<div>
			{saveStatus}
		</div>
	</Editor>
</main>
```

# Development Installation

1. Install Node.js and npm. Download them [here](https://nodejs.org/en/download/).

2. Clone the repo

```bash
git clone https://github.com/TGlide/novel-svelte.git
cd novel-svelte
```

3. Install npm packages:

```bash
npm install
```

4. Start vite server:

```bash
npm run dev
```

Go to `http://localhost:5173/` to view the preview.
