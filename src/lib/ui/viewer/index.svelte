<script lang="ts">
	// import 'cal-sans';
	import '../../styles/index.css';
	import '../../styles/prosemirror.css';
	import '../../styles/tailwind.css';

	import { Editor, Extension, type JSONContent } from '@tiptap/core';
	import type { EditorProps } from '@tiptap/pm/view';
	import { onMount } from 'svelte';
	import { defaultEditorContent } from './default-content.js';
	import { defaultExtensions } from './extensions/index.js';
	import { defaultEditorProps } from './props.js';
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

	export let editor: Editor | undefined = undefined;

	let element: Element;

	const content = defaultValue;
	let hydrated = false;
	$: if (editor && !hydrated) {
		const value = content;

		if (value) {
			editor.commands.setContent(value);
		}

		hydrated = true;
	}

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
			editable: false,
			autofocus: 'end'
		});

		return () => editor.destroy();
	});
</script>

<div id="editor" class={className} bind:this={element}>
	<slot />
</div>
