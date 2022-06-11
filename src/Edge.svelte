<script>
	import { styles } from "./styles.js";
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let item;
	export let graph; // is useful when drawing edges
	export let isSelected;
	
	function getEdgePath(graph){
        let fromX, fromY, toX, toY;
        let fromControlPointX, fromControlPointY, toControlPointX, toControlPointY;

        if(item.fromOrphan){
            fromX = item.fromOrphan.pos.x;
            fromY = item.fromOrphan.pos.y;
        } else {
            let fromNode = graph.items.find(i => i.id === item.fromId);
            
            // convert handleIndex like 23 or 31 into -1,0,1 for both x and y
            let fromXHandleIndex = Math.round(item.fromHandle / 10) - 2;
            let fromYHandleIndex = item.fromHandle % 10 - 2;

            // coordinates of the handle
            fromX = fromNode.pos.x + fromXHandleIndex * (fromNode.width / 2);
            fromY = fromNode.pos.y + fromYHandleIndex * (fromNode.height / 2);

            if(item.shape === 'curved'){
                // control points for bezier curve: center + 3*(handle - center)
                fromControlPointX = fromNode.pos.x + 3*(fromX - fromNode.pos.x);
                fromControlPointY = fromNode.pos.y + 6*(fromY - fromNode.pos.y);
            }
        }

        if(item.toOrphan){
            toX = item.toOrphan.pos.x;
            toY = item.toOrphan.pos.y;
        } else {
            let toNode = graph.items.find(i => i.id === item.toId);
            
            let toXHandleIndex = Math.round(item.toHandle / 10) - 2;
            let toYHandleIndex = item.toHandle % 10 - 2;
            
            toX = toNode.pos.x + toXHandleIndex * (toNode.width / 2);
            toY = toNode.pos.y + toYHandleIndex * (toNode.height / 2);
            
            if(item.shape === 'curved'){
                toControlPointX = toNode.pos.x + 3*(toX - toNode.pos.x);
                toControlPointY = toNode.pos.y + 6*(toY - toNode.pos.y);
            }
        }

        if(item.shape === 'straight' || item.fromOrphan || item.toOrphan){
            return `M ${fromX},${fromY} L ${toX},${toY}`;
        } else if(item.shape === 'curved'){
            return `M ${fromX},${fromY} C ${fromControlPointX},${fromControlPointY} ${toControlPointX},${toControlPointY} ${toX},${toY}`
        } else if(item.shape === 'ortho'){
            return `M ${fromX},${fromY} h ${(toX - fromX)/2} v ${toY - fromY} L ${toX},${toY}`;
        };
	}
	
	function getEdgeLabelLocation(graph){
        let fromNode = item.fromOrphan || graph.items.find(i => i.id === item.fromId);
        let toNode = item.toOrphan || graph.items.find(i => i.id === item.toId);

        // mid-point of fromNode and toNode
        return {x: (fromNode.pos.x + toNode.pos.x)/2, y: (fromNode.pos.y + toNode.pos.y)/2};
	}
</script>

<g>
	<path 
        d={getEdgePath(graph)}
        fill="none"
        stroke={isSelected ? 'blue' : (item.stroke || 'red')}
        stroke-width={item.weight}
        stroke-dasharray={item.strokeType === 'dashed' ? '8,5' : false}
        marker-end={item.directed ? "url(#arrow)" : false}
        on:mousedown|stopPropagation={(e) => dispatch('itemMouseDown', {source: item, from: {x: e.clientX, y: e.clientY}})}
        on:mouseup|stopPropagation={(e) => dispatch('itemMouseUp', {source: item})}
        on:click|stopPropagation
    >
    </path>
	<text 
        x={getEdgeLabelLocation(graph).x} y={getEdgeLabelLocation(graph).y} 
        font-family="Verdana"
        font-size={4*item.weight} 
        fill={item.stroke} 
        on:mousedown|stopPropagation={(e) => dispatch('itemMouseDown', {source: item, from: {x: e.clientX, y: e.clientY}})}
        on:mouseup|stopPropagation={(e) => dispatch('itemMouseUp', {source: item})}
        on:click|stopPropagation
    >
			{item.label}
	</text>
</g>

<style>
	g:hover text {
		fill: blue;
		stroke: blue;
	}
	
	g:hover path {
		stroke: blue;
	}
	
	text {
		cursor: pointer;
		user-select: none;
	}

    path {
        cursor: pointer;
    }
</style>