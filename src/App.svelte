<script>
    import MapEditor from "./MapEditor.svelte"
	
    let graph = {
        items: [{
            id: 1,
            kind: 'node',
            label: "Algebra",
            pos: {x: 700, y: 500},
            fill: "orange",
            stroke: "red"
        },{
            id: 2,
            kind: 'node',
            label: "Arithmetic",
            pos: {x: 300, y:200},
            fill: "white",
            stroke: "red"
        },{
            id: 3,
            kind: 'node',
            label: "Subtraction",
            pos: {x: 200, y: 100},
            fill: "yellow",
            stroke: "black",
            parent: 2,
        },{
            id: 4,
            kind: 'edge',
            label: "is a prerequisite of",
            stroke: "grey",
            strokeType: "dashed",
            directed: true, 
            weight: 5, 
            fromId: 3, 
            toId: 1, 
            fromHandle: 13, 
            toHandle: 23,
            shape: 'curved',
        }],
        grid: 'cartesian',
        fill: "#ffffce",
        debugger: false,
        sidepanel: true,
        jsonview: true,
        contextmenu: true
    };
</script>

<MapEditor unsizedGraph={graph} on:graphchanged="{e => graph = e.detail}"/>

