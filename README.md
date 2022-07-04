# Grapher

<img alt="image" src="https://user-images.githubusercontent.com/19304/177032566-2e182fd2-8b6a-4dd2-95fe-c14439018e37.png">

This is an SVG-based interactive graph dataset editor that allows you to manually lay out nodes and edges but at the same time produce a clean graph-like JSON that can be consumed easily with libraries like Cytoscape JS. You can add arbitrary data fields at nodes and edges. The code is declarative and minimal enough that it can be tweaked easily to give your users an interactive diagram.

Graphs can be saved in a `.graph` file which stores the array of nodes and edges and some other metadata in JSON format. To see an example of page where this .graph gets pre-loaded, see `index.html`. The page can also enable/disable features of the editor via `window.overrideOptions`. We use this to build a separate "editor" mode where any changes made by the users are saved automatically in browser's localStorage. 

## Features

- Infinite panning and zooming
- Loading from and saving to a clean JSON-based file format to easily process the graph in your applications.
- Exporting to Cytoscape format or SVG.
- Themability with 4 pre-defined themes.
- Edges can be straight, curved or orthogonal.
- Node description can be markdown including links.
- Custom JSON data fields can be assigned at each node and edge.
- Nodes can be given badges and user can rotate through them by clicking.
- Node can be highlighted by tags.

## TODO

- Better path and z-index calculation for edges
- Edge label readability
- Performance testing (1000+ nodes)
- Minimal theme
- Improve TagsInput accessibility

## Built with

- [SvelteJS](https://svelte.dev/) for reactivity
- [Shoelace.Style](https://shoelace.style/) for misc WebComponents
