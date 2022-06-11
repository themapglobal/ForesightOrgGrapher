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

export function layout(graph){
    // console.log("layout");
    prepareGraph(graph);
    // resize top nodes only because they will recurse
    graph.items.filter(i => (i.kind === 'node' && !i.parent)).forEach(item => {
        resizeGraphNode(item, graph);
    });
    return graph;
}

export function deleteGraphItem(item, deleteDependents){
    console.log("deleteItem");
    if(item.kind === 'edge'){
        // can be deleted safely
        graph.items = graph.items.filter(i => i != item);
    } else if(item.kind === 'node'){
        if(deleteDependents){
            // delete children and all their edges recursively?
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

export function createGraphNode(e){
    console.log("createNode")
    graph.items.push({
        id: Math.ceil(Math.random() * 10000),
        kind: 'node',
        label: 'New node',
        children: [],
        pos: {x: e.clientX,y: e.clientY},
        fill: 'yellow',
        stroke: 'black'
    })
}