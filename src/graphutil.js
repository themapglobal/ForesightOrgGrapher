export function getGraphNode(nodeid, graph){
    return graph && nodeid && graph.items.find(n => n.id === nodeid);
}

export function prepareGraph(graph){
    // populate item.children[] for convenience
    graph.items.filter(i => i.kind === 'node').forEach(item => { 
        item.children = []; 
        if(!item.hasOwnProperty('parent')){
            item.parent = null
        }
    });
    graph.items.forEach(item => {
        if(item.parent){
            let parent = getGraphNode(item.parent, graph);
            if(!parent){
                delete item.parent;
                return;
            }
            parent.children = [...(parent.children || []), item.id]
        }
    })
    return graph;
}

export function detachNodeFromParent(item, graph){
    if(getGraphNode(item.parent, graph)){
        item.parent = null;
    }
    return graph;
}

export function moveGraphNode(item, graph, dx, dy){
    item.pos.x += dx;
    item.pos.y += dy;

    // move its children recursively by the same dx, dy
    (item.children || []).forEach(c => {
        let child = getGraphNode(c, graph);
        moveGraphNode(child, graph, dx, dy)
    })
}

export function resizeGraphNode(item, graph){
    // console.log("resizing", item.label);
    // first resize all children
    (item.children || []).forEach(c => {
        let child = getGraphNode(c, graph);
        resizeGraphNode(child, graph)
    })
    let notesWidth = Math.min(300, item.notes ? item.notes.length *10 : 0)
    let notesHeight = (item.notes ? (Math.ceil(item.notes.length*9 / notesWidth) * 20) : 0)
    // make sure label and children nodes fit inside width
    let halfLabelAndNotesWidth = Math.max(25 + (0.5 * item.label.length *9), notesWidth/2);

    let rightchild = Math.max(...(item.children.map(c => {
        let child = getGraphNode(c, graph);
        return child.pos.x + child.width / 2 + 15;
    })), item.pos.x) - item.pos.x;
    
    let leftchild = item.pos.x - Math.min(...(item.children.map(c => {
        let child = getGraphNode(c, graph);
        return child.pos.x - child.width / 2 - 15;
    })), item.pos.x);

    item.width = 2 * Math.max(halfLabelAndNotesWidth, rightchild, leftchild);

    let halfLabelAndNotesHeight = 15 + notesHeight/2 ;

    let childDownExtents = item.children.map(c => {
        let child = getGraphNode(c, graph);
        return child.pos.y + child.height / 2 + 30;
    });
    // console.log({childDownExtents});

    let downchild = Math.max(...childDownExtents, item.pos.y) - item.pos.y;
    // console.log({downchild})

    let childUpExtents = item.children.map(c => {
        let child = getGraphNode(c, graph);
        return child.pos.y - child.height / 2 - 30 - notesHeight;
    }); 
  
    let upchild = item.pos.y - Math.min(...childUpExtents, item.pos.y);
    // console.log({upchild})

    item.height = 2 * Math.max(halfLabelAndNotesHeight, upchild, downchild);
    // console.log(item.label, item.width, item.height);
}

function decideNodeLevel(item, graph, currentLevel){
    item.level = currentLevel;
    item.children.forEach(c => decideNodeLevel(getGraphNode(c, graph), graph, currentLevel + 2))
}

export function layout(graph){
    if(!graph) return null;
    prepareGraph(graph);
    // resize top nodes only because they will recurse
    graph.items.filter(i => (i.kind === 'node' && !i.parent)).forEach(item => {
        resizeGraphNode(item, graph);
        decideNodeLevel(item, graph, 0);
    });

    graph.items.filter(i => (i.kind === 'edge')).forEach(edge => {
        // handle edges without nodes
        edge.level = -1 + Math.min(
            edge.fromId ? getGraphNode(edge.fromId, graph).level : 20, 
            edge.toId ? getGraphNode(edge.toId, graph).level : 20
        )
    });

    return graph;
}

export function deleteGraphItem(item, graph, deleteDependents){
    // console.log("deleteItem", item.label);
    if(item.kind === 'edge'){
        // can be deleted safely
        graph.items = graph.items.filter(i => i != item);
    } else if(item.kind === 'node'){
        if(deleteDependents){
            // delete all connected edges
            graph.items.filter(i => i.kind === 'edge' && [i.fromId, i.toId].includes(item.id)).forEach(edge => {
                deleteGraphItem(edge, graph, false)
            })

            // delete children and all their edges recursively
            graph.items.filter(i => i.kind === 'node' && i.parent === item.id).forEach(child => {
                deleteGraphItem(child, graph, true)
            });

            graph.items = graph.items.filter(i => i != item);
        } else {
            // make dependents (children, edges) orphans
            graph.items.filter(i => i.kind === 'node' && i.parent === item.id).forEach(child => {
                if(item.parent)
                    child.parent = item.parent;
                else
                    delete child.parent;
            });

            graph.items.filter(i => i.kind === 'edge' && [i.fromId, i.toId].includes(item.id)).forEach(edge => {
                if(edge.fromId === item.id){
                    if(item.parent){
                        edge.fromId = item.parent;
                    } else {
                        delete edge.fromId;
                        edge.fromOrphan = {pos: {x: item.pos.x, y: item.pos.y}}
                    }
                }
                if(edge.toId === item.id) {
                    if(item.parent){
                        edge.toId = item.parent
                    } else {
                        delete edge.toId;
                        edge.toOrphan = {pos: {x: item.pos.x, y: item.pos.y}}
                    }
                }
            })

            graph.items = graph.items.filter(i => i != item);
        }
    }    
}

export function createGraphNode(e, graph, svg){
    // console.log("createGraphNode")
    graph.items.push({
        id: Math.ceil(Math.random() * 10000),
        kind: 'node',
        label: 'New node',
        desc: '',
        link: '',
        tags: [],
        children: [],
        pos: getSvgCoordinates(svg, e),
    })
}

function getSvgCoordinates(svg, e){
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    return pt.matrixTransform( svg.getScreenCTM().inverse() );
}

export function createGraphChildNode(e, graph, parent, svg){
    // console.log("createGraphNode")
    graph.items.push({
        id: Math.ceil(Math.random() * 10000),
        kind: 'node',
        label: 'New node',
        desc: '',
        link: '',
        tags: [],
        children: [],
        pos: getSvgCoordinates(svg, e),
        parent: parent.id
    })
}

export function createGraphNodeEdge(from, fromHandle, graph){
    // console.log("createGraphNodeEdge")
    let newId = Math.ceil(Math.random() * 100000);
    graph.items.push({
        id: newId,
        kind: 'node',
        label: 'new node',
        desc: '',
        link: '',
        tags: [],
        parent: from.parent,
        children: [],
        pos: {
            x: (from.pos.x + (100 + from.width/2 + Math.random()*100) * (Math.floor(fromHandle / 10) - 2)),
            y: (from.pos.y + (100 + from.height/2 + Math.random()*100) * ((fromHandle % 10) - 2)),
        },
        fill: from.fill,
        stroke: from.stroke
    })

    graph.items.push({
        id: Math.ceil(Math.random() * 100000),
        kind: 'edge',
        label: '',
        desc: '',
        link: '',
        tags: [],
        fromId: from.id,
        toId: newId,
        directed: true, 
        weight: 5
    })
}

export function exportJson(graph){
    // remove temporary fields before serializing
    let data = {};

    data.items = graph.items.map(item => {
        if(item.kind === 'node')
            return {
                id: item.id,
                kind: 'node',
                label: item.label,
                notes: item.notes,
                desc: item.desc,
                link: item.link,
                tags: item.tags,
                parent: item.parent,
                pos: item.pos,
                fill: item.fill,
                stroke: item.stroke
            };
        else if(item.kind === 'edge')
            return {
                id: item.id,
                kind: 'edge',
                label: item.label,
                notes: item.notes,
                desc: item.desc,
                link: item.link,
                tags: item.tags,
                stroke: item.stroke,
                strokeType: item.strokeType,
                directed: item.directed,
                weight: item.weight,
                fromId: item.fromId,
                toId: item.toId,
                shape: item.shape,
                fromOrphan: item.fromOrphan,
                toOrphan: item.toOrphan
            }
    })

    data.grid = graph.grid;
    data.theme = graph.theme;
    data.jsondownload = graph.jsondownload;
    data.jsonupload = graph.jsonupload;
    data.contextmenu = graph.contextmenu;
    data.customjson = graph.customjson;
    data.exportcytoscape = graph.exportcytoscape;
    data.exportsvg = graph.exportsvg;

    return JSON.stringify(data, null, 2);
}

export function exportCytoscape(graph){
    let cy = {};

    cy.elements = graph.items.filter(x => x.kind === 'node' || (x.fromId && x.toId)).map(item => {
        if(item.kind === 'node')
            return {
                group: 'nodes', 
                data: {
                        id: item.id,
                        parent: item.parent
                    },
                position: {x: item.pos.x, y: item.pos.y}
            };
        else if(item.kind === 'edge')
            return {group: 'edges', data: {
                        
                        id: item.id,
                        source: item.fromId,
                        target: item.toId
                    }}
    })

    return JSON.stringify(cy, null, 2);
}

export const themes = {
    elegant: {
        "name": "elegant",
        "bgfill": "#334155",
        "grid": "cartesian",
        "nodefill": "#bae6fd",
        "nodelabelstroke": "#334155",
        "nodeborder": "white",
        "edgestroke": "red",
        "edgeshape": "curved",
        "edgestroketype": "solid",
        "font": "Dosis",
        "badges": ["✅", "❌", "⚡", "👎", "👍"]
    },

    foresight: {
        "name": "foresight",
        "bgfill": "#1c170b",
        "grid": false,
        "nodefill": "#7b9ecb",
        "nodelabelstroke": "black",
        "nodeborder": "white",
        "edgestroke": "#ccc",
        "edgeshape": "ortho",
        "edgestroketype": "solid",
        "font": "Roboto Condensed",
        "badges": ["✅", "❌", "⚡", "👎", "👍"]
    },

    classic: {
        "name": "classic",
        "bgfill": "#f3f3f3",
        "grid": false,
        "font": "Balsamiq Sans",
        "nodefill": "#fbe6a3",
        "nodelabelstroke": "black",
        "nodeborder": "black",
        "edgestroke": "#4277dd",
        "edgeshape": "curved",
        "edgestroketype": "solid",
        "badges": ["✅", "❌", "⚡", "👎", "👍"]
    }
};