<script>
  import MapEditor from "./MapEditor.svelte"
	
	let graph = {
        items: [{
            id: 1,
			kind: 'node',
            label: "Algebra",
            children: [],
            pos: {x: 300, y: 200},
            fill: "orange",
            stroke: "red"
        },{
            id: 2,
            kind: 'node',
            label: "Arithmetic",
            children: [],
            pos: {x: 500, y: 500},
            fill: "white",
            stroke: "red"
        },{
            id: 3,
            kind: 'edge',
            label: "is friend of",
            stroke: "black",
            strokeType: "dashed",
            directed: true, 
            weight: 5, 
            fromId: 1, 
            toId: 2, 
            fromHandle: 23, 
            toHandle: 31,
            shape: 'curved',
        }],
        grid: 'cartesian',
        fill: "#ffffce",
        debugger: true
    };
</script>

<MapEditor {graph} on:graphchanged="{e => graph = e.detail}"/>

