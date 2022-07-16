import GraphEditor from './GraphEditor.svelte';

var app = new GraphEditor({
	target: document.querySelector('#grapheditor'),
	props: {
		graphjsonpath: window.graphjsonpath,
		overrideOptions: (window.overrideOptions || {}),
		svgForTextBBox: document.getElementById('textbbox')
	}
});

export default app;