<script>
    import MapEditor from "./MapEditor.svelte"
	
    let graph = {
        items: [{
            id: 1,
            kind: 'node',
            label: "Algebra",
            pos: {x: 700, y: 500},
            fill: "#ffe6d6",
            stroke: "#ff0000"
        },{
            id: 2,
            kind: 'node',
            label: "Arithmetic",
            pos: {x: 300, y:200},
            fill: "#ffffff",
            stroke: "#ff0000"
        },{
            id: 3,
            kind: 'node',
            label: "Subtraction",
            pos: {x: 200, y: 100},
            fill: "#f5f854",
            stroke: "#103320",
            parent: 2,
        },{
            id: 4,
            kind: 'edge',
            label: "is a prerequisite of",
            stroke: "#f94fc3",
            strokeType: "solid",
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
        contextmenu: true,
        viewBox: [0, 0, 1700, 1200]
    };
</script>

<MapEditor unsizedGraph={graph} on:graphchanged="{e => graph = e.detail}"/>

