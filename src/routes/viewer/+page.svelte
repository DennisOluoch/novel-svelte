<script lang="ts">
	import { type EditorType, Editor, Viewer } from '$lib/index.js';
	import Nav from '../nav.svelte';

	let editor: EditorType;
</script>

<Nav />

<main class="flex justify-center sm:pt-[15vh] sm:px-4">
	<Viewer bind:editor />
</main>
