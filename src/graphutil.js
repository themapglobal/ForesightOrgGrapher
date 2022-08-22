export function getGraphNode(nodeid, graph){
    return graph && nodeid && graph.items.find(n => n.id === nodeid);
}

export function prepareGraph(graph, action){
    // populate item.children[] for convenience
    graph.items.filter(i => i.kind === 'node').forEach(item => { 
        item.children = []; 
        if(!item.pos || !item.pos.hasOwnProperty('x') || !item.pos.hasOwnProperty('y')){
            // handle missing position by choosing random x and y
            console.error(`Got null position for ${item.label}`);
            item.pos = {x: (Math.random() * 600), y: (Math.random() * 600)}
        }
        item.notes = item.notes ?? '';
        if(!item.hasOwnProperty('parent')){
            item.parent = null
        }
    });

    graph.items.filter(i => i.kind === 'note').forEach(item => { 
        item.children = [];
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

export function resizeGraphNode(item, graph, svgForTextBBox, action){
    
    // console.log({item});
    // first resize all children
    (item.children || []).forEach(c => {
        let child = getGraphNode(c, graph);
        resizeGraphNode(child, graph, svgForTextBBox, action)
    })
    
    // performance optimization
    if(action && action.kind === 'movingitem' && !getParentAncestors(graph, action.item).includes(item)){
        // console.log(`skipping ${item.label} because ${action.item.label} doesn't affect its size`);
        return;
    }

    let notesWidth = Math.min(300, item.notes ? item.notes.length * ((item.nodenotesfontsize || graph.theme.nodenotesfontsize || 16) - 6) : 0)
    let notesHeight = item.notes ? (Math.ceil(item.notes.length * ((item.nodenotesfontsize || graph.theme.nodenotesfontsize || 16) - 6) / notesWidth) * ((item.nodenotesfontsize || graph.theme.nodenotesfontsize || 16) + 4)) : 0;
    
    item.noteswidth = notesWidth;
    item.notesheight = notesHeight;
    
    let dynamicNotesHeight = item.has_dynamic_notes ? 140 : 0;
    // make sure label and children nodes fit inside width
    let fontweight = (item.children.length > 0) || (item.notes?.length > 0) ? '700' : '300';
    let fontsize = item.nodelabelfontsize || graph.theme.nodelabelfontsize || 16;
    // console.log({fontsize});
    // console.log({svgForTextBBox});
    let bbox = getTextBbox(svgForTextBBox, item.label, graph.theme.font, fontsize, fontweight);
    
    item.labelwidth = bbox.width;
    item.labelheight = bbox.height;
    // console.log({bbox});

    let halfLabelAndNotesWidth = Math.max(item.labelwidth / 2, notesWidth / 2);

    let rightchild = Math.max(...(item.children.map(c => {
        let child = getGraphNode(c, graph);
        return child.pos.x + child.width / 2 + 15;
    })), item.pos.x) - item.pos.x;
    
    let leftchild = item.pos.x - Math.min(...(item.children.map(c => {
        let child = getGraphNode(c, graph);
        return child.pos.x - child.width / 2 - 15;
    })), item.pos.x);

    // console.log(item.id, {leftchild}, {rightchild});

    item.width = 2 * Math.max(halfLabelAndNotesWidth, rightchild, leftchild) + 20;;

    // console.log("itemwidth", item.width);

    // if(!item.width){
    //     console.log("found missing width");
    //     console.log(item.id, item.label, item.width, item.height);
    // }

    let halfLabelAndNotesHeight = item.labelheight/2 + notesHeight/2 + dynamicNotesHeight/2;

    let childDownExtents = item.children.map(c => {
        let child = getGraphNode(c, graph);
        return child.pos.y + child.height / 2 + 20;
    });
    // console.log({childDownExtents});

    let downchild = Math.max(...childDownExtents, item.pos.y) - item.pos.y;
    // console.log({downchild})

    let childUpExtents = item.children.map(c => {
        let child = getGraphNode(c, graph);
        return child.pos.y - child.height / 2 - 20 - 30 - notesHeight - dynamicNotesHeight;
    }); 
  
    let upchild = item.pos.y - Math.min(...childUpExtents, item.pos.y);

    item.height = 2 * Math.max(halfLabelAndNotesHeight, upchild, downchild) + 20;
    
    // console.log(item.labelheight);
    // console.log({halfLabelAndNotesHeight});
    // console.log({upchild}, {downchild});
    // console.log(item.height);
}

function decideNodeLevel(item, graph, currentLevel, selectedItem){
    item.level = selectedItem && selectedItem.id === item.id ? (500 + currentLevel) : currentLevel;
    item.children.forEach(c => decideNodeLevel(getGraphNode(c, graph), graph, item.level + 2, selectedItem))
}

export function layout(graph, selectedItem, svgForTextBBox, action){
    if(!graph) return null;
    prepareGraph(graph, action);
    // resize top nodes only because they will recurse
    graph.items.filter(i => (i.kind === 'node' && !i.parent)).forEach(item => {
        resizeGraphNode(item, graph, svgForTextBBox, action);
        decideNodeLevel(item, graph, 0, selectedItem);
    });

    graph.items.filter(i => (i.kind === 'note')).forEach(item => {
        resizeGraphNode(item, graph, svgForTextBBox, action);
    });

    graph.items.filter(i => (i.kind === 'edge')).forEach(edge => {
        // draw an edge BELOW both connected nodes
        edge.level =  Math.min(
            edge.fromId ? getGraphNode(edge.fromId, graph).level : 20, 
            edge.toId ? getGraphNode(edge.toId, graph).level : 20
        ) - 1;
    });

    return graph;
}

export function deleteGraphItem(item, graph, deleteDependents){
    // console.log("deleteItem", item.label);
    if(item.kind === 'edge' || item.kind === 'note'){
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

export function createGraphNode(e, graph, svg, topGroupElem){
    // console.log("createGraphNode")
    let randomId = getNewRandomId(graph);
    graph.items.push({
        id: randomId,
        kind: 'node',
        label: `New node ${randomId}`,
        desc: '',
        link: '',
        tags: [],
        children: [],
        pos: getSvgCoordinates(svg, e, topGroupElem),
        nodelabelfontsize: null,
        nodenotesfontsize: null
    })
}

export function createGraphNote(e, graph, svg, topGroupElem){
    // console.log("createGraphNote")
    let randomId = getNewRandomId(graph);
    graph.items.push({
        id: randomId,
        kind: 'note',
        label: `Add your notes here`,
        notes: 'some extra content',
        pos: getSvgCoordinates(svg, e, topGroupElem),
        nodelabelfontsize: null,
        nodenotesfontsize: null
    })
}

function getSvgCoordinates(svg, e, topGroupElem){
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    let svgpt = pt.matrixTransform( topGroupElem.getCTM().inverse() );
    return {x: svgpt.x, y: svgpt.y};
}

function getTextBbox(svg, text, font, fontsize, fontweight){
    // console.log("in getTextBbox()", svg);
    let svgns = "http://www.w3.org/2000/svg";

    // var data = svg.createTextNode( text );
    var svgElement = document.createElementNS( svgns, "text" );
    svgElement.setAttribute("font-family", font);
    svgElement.setAttribute("font-size", fontsize);
    svgElement.setAttribute("font-weight", fontweight);
    svgElement.setAttributeNS(svgns, "x", 200);
    svgElement.setAttributeNS(svgns, "y", 300);
    svgElement.textContent = text;

    // svgElement.appendChild(data);

    svg.appendChild( svgElement );

    var bbox = svgElement.getBBox();

    // console.log({bbox});
    // console.log(svgElement);

    svgElement.parentNode.removeChild(svgElement);

    

    return bbox;
}

function getNewRandomId(graph){
    
    return Math.max(...graph.items.map(item => item.id), 0)+ 1
}

export function createGraphChildNode(e, graph, parent, svg, topGroupElem){
    // console.log("createGraphNode")
    let randomId = getNewRandomId(graph);
    graph.items.push({
        id: randomId,
        kind: 'node',
        label: `New node ${randomId}`,
        desc: '',
        link: '',
        tags: [],
        children: [],
        pos: getSvgCoordinates(svg, e, topGroupElem),
        nodelabelfontsize: null,
        nodenotesfontsize: null,
        parent: parent.id
    })
}

export function createGraphEdge(from, toCoords, graph){
    let edge = {
        id: getNewRandomId(graph),
        kind: 'edge',
        label: '',
        desc: '',
        link: '',
        tags: [],
        shape: 'straight',
        fromId: from.id,
        toOrphan: {pos: {x: toCoords.x, y: toCoords.y}},
        directed: true, 
        weight: 5
    }
    graph.items.push(edge);
    return edge;
}

export function createGraphNodeEdge(from, fromHandle, graph){
    console.log("createGraphNodeEdge")
    let newId = getNewRandomId(graph);
    graph.items.push({
        id: newId,
        kind: 'node',
        label: `New node ${newId}`,
        desc: '',
        link: '',
        tags: [],
        parent: from.parent,
        children: [],
        pos: {
            x: (from.pos.x + (100 + from.width/2 + Math.random()*100) * (Math.floor(fromHandle / 10) - 2)),
            y: (from.pos.y + (100 + from.height/2 + Math.random()*100) * ((fromHandle % 10) - 2)),
        },
        nodelabelfontsize: null,
        nodenotesfontsize: null,
        fill: from.fill,
        stroke: from.stroke
    })

    graph.items.push({
        id: getNewRandomId(graph),
        kind: 'edge',
        label: '',
        desc: '',
        link: '',
        tags: [],
        shape: 'straight',
        fromId: from.id,
        toId: newId,
        directed: true, 
        weight: 5
    })
}

export function findNodeAtPosition(svgPt, excludeNode, graph){
    let nodes = graph.items.filter(item => item.kind === 'node')
        .filter(node => node.id != excludeNode.id)
        .filter(node => {
            return (
                svgPt.x > node.pos.x - node.width/2 &&
                svgPt.x < node.pos.x + node.width/2 &&
                svgPt.y > node.pos.y - node.height/2 &&
                svgPt.y < node.pos.y + node.height/2
            );
        });
    
    // choose the node on top
    return nodes.sort((a,b) => b.level - a.level)[0];
}

export function getAncestors(graph, node, depth){
    // Follow directed edges backwards and collect ancestor nodes
    // Note: This does not follow the parent relationship
    if(node.kind !== 'node') return [];
    let incoming = graph.items.filter(item => item.kind === 'edge' && item.toId === node.id);
    let parents = incoming.map(edge => { 
        let p = getGraphNode(edge.fromId, graph);
        return {node: p, parents: (depth == 2 ? [] : getAncestors(graph, p, depth+1))}; 
    });
    return parents;
}

export function getParentAncestors(graph, item){
    // Follow parent backwards and collect ancestor nodes
    if(item == null) return [];
    if(item.kind !== 'node') return [];
    if(item.parent == null) return [];
    let parent = getGraphNode(item.parent, graph);
    return [...getParentAncestors(parent), parent];
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
                stroke: item.stroke,
                badge: item.badge,
                nodelabelfontsize: item.nodelabelfontsize,
                nodenotesfontsize: item.nodenotesfontsize
            };
        else if(item.kind === 'edge')
            return {
                id: item.id,
                kind: 'edge',
                label: item.label,
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
        else if(item.kind === 'note')
            return {
                id: item.id,
                kind: item.kind,
                pos: item.pos,
                label: item.label,
                notes: item.notes,
                nodelabelfontsize: item.nodelabelfontsize,
                nodenotesfontsize: item.nodenotesfontsize
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
        "selectionColor": "blue",
        "highlightColor": "red",
        "nodefill": "#bae6fd",
        "nodelabelstroke": "#334155",
        "nodelabelfontsize": 16,
        "nodenotesfontsize": 16,
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
        "selectionColor": "blue",
        "highlightColor": "red",
        "nodefill": "#7b9ecb",
        "nodelabelstroke": "black",
        "nodelabelfontsize": 16,
        "nodenotesfontsize": 16,
        "nodeborder": "white",
        "edgestroke": "#ccc",
        "edgeshape": "ortho",
        "edgestroketype": "solid",
        "font": "Roboto Condensed",
        "badges": ["✅", "❌", "⚡", "👎", "👍", "https://cdn.discordapp.com/attachments/987690735639875584/997881951534981203/hexbadge.png"]
    },

    minimal: {
        "name": "minimal",
        "bgfill": "#e5e7eb",
        "grid": false,
        "selectionColor": "#1f2937",
        "highlightColor": "red",
        "nodefill": "white",
        "nodelabelstroke": "black",
        "nodelabelfontsize": 16,
        "nodenotesfontsize": 16,
        "nodeborder": "black",
        "edgestroke": "#1f2937",
        "edgeshape": "curved",
        "edgestroketype": "solid",
        "font": "PT Mono",
        "badges": ["✅", "❌", "⚡", "👎", "👍"]
    },

    classic: {
        "name": "classic",
        "bgfill": "#f3f3f3",
        "grid": false,
        "selectionColor": "blue",
        "highlightColor": "red",
        "font": "Balsamiq Sans",
        "nodefill": "#fbe6a3",
        "nodelabelstroke": "black",
        "nodelabelfontsize": 16,
        "nodenotesfontsize": 16,
        "nodeborder": "black",
        "edgestroke": "#4277dd",
        "edgeshape": "curved",
        "edgestroketype": "solid",
        "badges": ["✅", "❌", "⚡", "👎", "👍"]
    }
};