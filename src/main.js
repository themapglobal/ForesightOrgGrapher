import GraphEditor from './GraphEditor.svelte';

var app = new GraphEditor({
	target: document.body,
	props: {
		graphjsonpath: window.graphjsonpath,
		overrideOptions: (window.overrideOptions || {})
	}
});

export default app;