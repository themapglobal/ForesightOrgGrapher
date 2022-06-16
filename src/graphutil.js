export function getGraphNode(nodeid, graph){
    return graph && nodeid && graph.items.find(n => n.id === nodeid);
}

export function prepareGraph(graph){
    // populate item.children[] for convenience
    graph.items.filter(i => i.kind === 'node').forEach(item => { item.children = []; });
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
    
    // make sure label and children nodes fit inside width
    let halfLabelWidth = 0.5 * item.label.length * 10;

    let rightchild = Math.max(...(item.children.map(c => {
        let child = getGraphNode(c, graph);
        return child.pos.x + child.width / 2 + 15;
    })), item.pos.x) - item.pos.x;
    
    let leftchild = item.pos.x - Math.min(...(item.children.map(c => {
        let child = getGraphNode(c, graph);
        return child.pos.x - child.width / 2 - 15;
    })), item.pos.x);

    item.width = 2 * Math.max(halfLabelWidth, rightchild, leftchild);

    let halfLabelHeight = 15;

    let childDownExtents = item.children.map(c => {
        let child = getGraphNode(c, graph);
        return child.pos.y + child.height / 2 + 30;
    });
    // console.log({childDownExtents});

    let downchild = Math.max(...childDownExtents, item.pos.y) - item.pos.y;
    // console.log({downchild})

    let childUpExtents = item.children.map(c => {
        let child = getGraphNode(c, graph);
        return child.pos.y - child.height / 2 - 30;
    }); 
    
    let upchild = item.pos.y - Math.min(...childUpExtents, item.pos.y);
    // console.log({upchild})

    item.height = 2 * Math.max(halfLabelHeight, upchild, downchild);
    // console.log(item.label, item.width, item.height);
}

function decideNodeLevel(item, graph, currentLevel){
    item.level = currentLevel;
    item.children.forEach(c => decideNodeLevel(getGraphNode(c, graph), graph, currentLevel + 1))
}

export function layout(graph){
    // console.log("layout");
    prepareGraph(graph);
    // resize top nodes only because they will recurse
    graph.items.filter(i => (i.kind === 'node' && !i.parent)).forEach(item => {
        resizeGraphNode(item, graph);
        decideNodeLevel(item, graph, 0);
    });

    graph.items.filter(i => (i.kind === 'edge')).forEach(edge => {
        // handle edges without nodes
        edge.level = Math.max(
            edge.fromId ? (getGraphNode(edge.fromId, graph).level) : 20, 
            edge.toId ? (getGraphNode(edge.toId, graph).level) : 20
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
        children: [],
        pos: getSvgCoordinates(svg, e),
        fill: 'yellow',
        stroke: 'black'
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
        children: [],
        pos: getSvgCoordinates(svg, e),
        fill: 'yellow',
        stroke: 'black',
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
        fromId: from.id,
        toId: newId,
        shape: 'curved',
        label: '',
        stroke: "grey",
        strokeType: "solid",
        directed: true, 
        weight: 5
    })
}

export function exportCytoscape(graph){
    return JSON.stringify({}, null, 2);
}
