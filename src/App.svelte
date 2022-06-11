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
            stroke: "black",
            strokeType: "dashed",
            directed: true, 
            weight: 5, 
            fromId: 3, 
            toId: 1, 
            fromHandle: 22, 
            toHandle: 22,
            shape: 'curved',
        },{
            id: 5,
            kind: 'edge',
            label: "is orphan edge",
            stroke: "black",
            strokeType: "dashed",
            directed: true, 
            weight: 5, 
            fromOrphan: {pos: {x: 200,y: 200}},
            toOrphan: {pos: {x: 440, y: 400}},
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

