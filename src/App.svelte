<script>
    import MapEditor from "./MapEditor.svelte"
	
    let graph = {
        "items": [
            {
            "id": 2,
            "kind": "node",
            "label": "Arithmetic",
            "desc": "",
            "link": "",
            "tags": [],
            "parent": null,
            "pos": {
                "x": 264,
                "y": 351
            }
            },
            {
            "id": 1,
            "kind": "node",
            "label": "Algebra",
            "desc": "",
            "link": "",
            "tags": [],
            "parent": null,
            "pos": {
                "x": 155,
                "y": 783
            }
            },
            {
            "id": 4,
            "kind": "edge",
            "label": "is a prerequisite of",
            "desc": "",
            "link": "",
            "tags": [],
            "directed": true,
            "weight": 5,
            "fromId": 3,
            "toId": 1
            },
            {
            "id": 37845,
            "kind": "edge",
            "label": "",
            "desc": "",
            "link": "",
            "tags": [],
            "directed": true,
            "weight": 5,
            "fromId": 3,
            "toId": 94575
            },
            {
            "id": 3,
            "kind": "node",
            "label": "Subtraction",
            "desc": "",
            "link": "",
            "tags": [],
            "parent": 2,
            "pos": {
                "x": 445,
                "y": 364
            }
            },
            {
            "id": 94575,
            "kind": "node",
            "label": "Multiplication",
            "desc": "",
            "link": "",
            "tags": [],
            "parent": 2,
            "pos": {
                "x": 70,
                "y": 410
            }
            },
            {
            "id": 1550,
            "kind": "node",
            "label": "Quadratic Equations",
            "desc": "",
            "link": "",
            "tags": [],
            "parent": 1,
            "pos": {
                "x": 150,
                "y": 831
            }
            },
            {
            "id": 17122,
            "kind": "edge",
            "label": "",
            "desc": "",
            "link": "",
            "tags": [],
            "directed": true,
            "weight": 5,
            "fromId": 5699,
            "toId": 10451,
            "strokeType": "dotted",
            },
            {
            "id": 5699,
            "kind": "node",
            "label": "Arithmetic Sequences",
            "desc": "",
            "link": "",
            "tags": [],
            "parent": 3,
            "pos": {
                "x": 465,
                "y": 274
            }
            },
            {
            "id": 6916,
            "kind": "node",
            "label": "Factorizing",
            "desc": "",
            "link": "",
            "tags": [],
            "parent": 94575,
            "pos": {
                "x": 48,
                "y": 450
            }
            },
            {
            "id": 10451,
            "kind": "node",
            "label": "Proof by Induction",
            "desc": "",
            "link": "",
            "tags": [],
            "parent": 3,
            "pos": {
                "x": 519,
                "y": 474
            }
            },
            {
            "id": 3283,
            "kind": "node",
            "label": "Prime Numbers",
            "desc": "",
            "link": "",
            "tags": [],
            "badge": "\u2705",
            "parent": 6916,
            "pos": {
                "x": 25,
                "y": 450
            }
            }
        ],
        "extra": [
            {
                "kind": "note",
                pos: {x:200, y:250},
                value: "hello"
            }
        ],
        "grid": "false",
        "theme": {
            "name": "classic",
            "bgfill": "#f3f3f3",
            "grid": false,
            "nodefill": "#fde047",
            "nodestroke": "black",
            "edgestroke": "red",
            "edgeshape": "curved",
            "edgestroketype": "solid"
        },
        "debugger": false,
        "sidepanel": true,
        "jsonview": true,
        "contextmenu": true,
        "customjson": false,
        "exportcytoscape": true,
        "exportsvg": false,
        "viewBox": [0,0,1000,1000]
        };
</script>

<MapEditor unsizedGraph={graph} on:graphchanged="{e => {graph = e.detail;}}"/>
    