<script>
  import MapEditor from "./MapEditor.svelte"
	
	let graph = {
        items: [{
            id: 1,
			kind: 'node',
            label: "Algebra",
            children: [],
            pos: {x: 700, y: 500},
            fill: "#7c2d12",
            stroke: "#eff6ff"
        },{
            id: 2,
            kind: 'node',
            label: "Arithmetic",
            children: [],
            pos: {x: 300, y: 200},
            fill: "#1e3a8a",
            stroke: "#fff7ed"
        },{
            id: 3,
            kind: 'edge',
            label: "is a prerequisite of",
            stroke: "black",
            strokeType: "dashed",
            directed: true, 
            weight: 5, 
            fromId: 2, 
            toId: 1, 
            fromHandle: 23, 
            toHandle: 21,
            shape: 'curved',
        }],
        grid: 'cartesian',
        fill: "#f5f5f4",
        debugger: false
    };
</script>

<MapEditor {graph} on:graphchanged="{e => graph = e.detail}"/>

