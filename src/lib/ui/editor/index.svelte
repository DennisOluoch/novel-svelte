<script lang="ts">
	// import 'cal-sans';
	import '../../styles/index.css';
	import '../../styles/prosemirror.css';
	import '../../styles/tailwind.css';

	import { getPrevText } from '$lib/editor.js';
	import { createLocalStorageStore } from '$lib/stores/localStorage.js';
	import { createDebouncedCallback, noop } from '$lib/utils.js';
	import { Editor, Extension, type JSONContent } from '@tiptap/core';
	import type { EditorProps } from '@tiptap/pm/view';
	import ImageResizer from './extensions/ImageResizer.svelte';
	import { onMount } from 'svelte';
	import { defaultEditorContent } from './default-content.js';
	import { defaultExtensions } from './extensions/index.js';
	import { defaultEditorProps } from './props.js';
	import Toasts, { addToast } from '../toasts.svelte';

	import EditorBubbleMenu from './bubble-menu/index.svelte';
	import { uploadConfig, type UploadConfig } from '$lib/stores/uploadConfig.js';
	/**
	 * Additional classes to add to the editor container.
	 * Defaults to "relative min-h-[500px] w-full max-w-screen-lg border-stone-200 bg-white p-12 px-8 sm:mb-[calc(20vh)] sm:rounded-lg sm:border sm:px-12 sm:shadow-lg".
	 */
	let className =
		'relative min-h-[500px] w-full max-w-screen-lg border-stone-200 bg-white p-12 pb-24 sm:pb-12 px-8 sm:mb-[calc(20vh)] sm:rounded-lg sm:border sm:px-12 sm:shadow-lg';
	export { className as class };
	/**
	 * The default value to use for the editor.
	 * Defaults to defaultEditorContent.
	 */
	export let defaultValue: JSONContent | string = defaultEditorContent;
	/**
	 * A list of extensions to use for the editor, in addition to the default Novel extensions.
	 * Defaults to [].
	 */
	export let extensions: Extension[] = [];
	/**
	 * Props to pass to the underlying Tiptap editor, in addition to the default Novel editor props.
	 * Defaults to {}.
	 */
	export let editorProps: EditorProps = {};
	/**
	 * A callback function that is called whenever the editor is updated.
	 * Defaults to () => {}.
	 */
	export let onUpdate: (editor?: Editor) => void | Promise<void> = noop;
	/**
	 * A callback function that is called whenever the editor is updated, but only after the defined debounce duration.
	 * Defaults to () => {}.
	 */
	export let onDebouncedUpdate: (editor?: Editor) => void | Promise<void> = noop;
	/**
	 * The duration (in milliseconds) to debounce the onDebouncedUpdate callback.
	 * Defaults to 750.
	 */
	export let debounceDuration = 750;
	/**
	 * The key to use for storing the editor's value in local storage.
	 * Defaults to "novel__content".
	 */
	export let storageKey = 'novel__content';
	/**
	 * Disable local storage read/save.
	 * @default false
	 */
	export let disableLocalStorage = false;

	/**
	 * Configuration for the image upload provider.
	 * This is optional. If not provided, image upload functionality may be limited.
	 * @type {Object} UploadConfig
	 * @property {('vercel' | 'supabase' | 'cloudinary')} provider - The name of the upload provider.
	 * @property {string} bucketName - The name of the bucket to upload to.
	 * @property {string} accessToken - The access token for the upload provider.
	 * @property {string} [supabaseUrl] - The Supabase URL (required if provider is 'supabase').
	 * @property {string} [cloudinaryCloudName] - The Cloudinary cloud name (required if provider is 'cloudinary').
	 */
	export let imageProviderConfig: UploadConfig | undefined = undefined;

	export let editor: Editor | undefined = undefined;

	let element: Element;

	const content = createLocalStorageStore(storageKey, defaultValue);
	let hydrated = false;
	$: if (editor && !hydrated) {
		const value = disableLocalStorage ? defaultValue : $content;

		if (value) {
			editor.commands.setContent(value);
		}

		hydrated = true;
	}

	let prev = '';

	const debouncedUpdates = createDebouncedCallback(async ({ editor }) => {
		if (!disableLocalStorage) {
			const json = editor.getJSON();
			content.set(json);
		}

		onDebouncedUpdate(editor);
	}, debounceDuration);

	onMount(() => {
		editor = new Editor({
			element: element,
			onTransaction: () => {
				// force re-render so `editor.isActive` works as expected
				editor = editor;
			},
			extensions: [...defaultExtensions, ...extensions],
			editorProps: {
				...defaultEditorProps,
				...editorProps
			},
			onUpdate: (e) => {
				onUpdate(e.editor);
				debouncedUpdates(e);
			},
			autofocus: 'end'
		});

		if (imageProviderConfig) {
			uploadConfig.setConfig({ ...imageProviderConfig });
		}

		return () => editor?.destroy();
	});
</script>

{#if editor && editor.isEditable}
	<EditorBubbleMenu {editor} />
{/if}

<div id="editor" class={className} bind:this={element}>
	<slot />
	{#if editor?.isActive('image')}
		<ImageResizer {editor} />
	{/if}
</div>

<Toasts />
