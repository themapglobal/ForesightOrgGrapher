<script>
    import MapEditor from "./MapEditor.svelte"
	
    let graph = {
        "items": [
            {
            "id": 2,
            "kind": "node",
            "label": "Arithmetic",
            "parent": null,
            "pos": {
                "x": 264,
                "y": 351
            },
            "fill": "#ffffff",
            "stroke": "#ff0000"
            },
            {
            "id": 1,
            "kind": "node",
            "label": "Algebra",
            "parent": null,
            "pos": {
                "x": 155,
                "y": 783
            },
            "fill": "#ffe6d6",
            "stroke": "#ff0000"
            },
            {
            "id": 4,
            "kind": "edge",
            "label": "is a prerequisite of",
            "stroke": "#f94fc3",
            "strokeType": "solid",
            "directed": true,
            "weight": 5,
            "fromId": 3,
            "toId": 1,
            "shape": "curved"
            },
            {
            "id": 37845,
            "kind": "edge",
            "label": "",
            "stroke": "grey",
            "strokeType": "solid",
            "directed": true,
            "weight": 5,
            "fromId": 3,
            "toId": 94575,
            "shape": "curved"
            },
            {
            "id": 3,
            "kind": "node",
            "label": "Subtraction",
            "parent": 2,
            "pos": {
                "x": 445,
                "y": 364
            },
            "fill": "#f5f854",
            "stroke": "#103320"
            },
            {
            "id": 94575,
            "kind": "node",
            "label": "Multiplication",
            "parent": 2,
            "pos": {
                "x": 70,
                "y": 410
            },
            "fill": "#f5f854",
            "stroke": "#103320"
            },
            {
            "id": 1550,
            "kind": "node",
            "label": "Quadratic Equations",
            "parent": 1,
            "pos": {
                "x": 150,
                "y": 831
            },
            "fill": "yellow",
            "stroke": "black"
            },
            {
            "id": 17122,
            "kind": "edge",
            "label": "",
            "stroke": "grey",
            "strokeType": "solid",
            "directed": true,
            "weight": 5,
            "fromId": 5699,
            "toId": 10451,
            "shape": "curved"
            },
            {
            "id": 5699,
            "kind": "node",
            "label": "Arithmetic Sequences",
            "parent": 3,
            "pos": {
                "x": 465,
                "y": 274
            },
            "fill": "yellow",
            "stroke": "black"
            },
            {
            "id": 6916,
            "kind": "node",
            "label": "Factorizing",
            "parent": 94575,
            "pos": {
                "x": 48,
                "y": 450
            },
            "fill": "yellow",
            "stroke": "black"
            },
            {
            "id": 10451,
            "kind": "node",
            "label": "Proof by Induction",
            "parent": 3,
            "pos": {
                "x": 519,
                "y": 474
            },
            "fill": "yellow",
            "stroke": "black"
            },
            {
            "id": 3283,
            "kind": "node",
            "label": "Prime Numbers",
            "parent": 6916,
            "pos": {
                "x": 25,
                "y": 450
            },
            "fill": "#9f9f04",
            "stroke": "black"
            }
        ],
        "grid": "false",
        "fill": "#ffffde",
        "debugger": false,
        "sidepanel": true,
        "jsonview": true,
        "contextmenu": true,
        "customjson": false,
        "exportcytoscape": true,
        "exportsvg": true,
        "viewBox": [0,0,1000,1000]
        };
</script>

<MapEditor unsizedGraph={graph} on:graphchanged="{e => graph = e.detail}"/>
    