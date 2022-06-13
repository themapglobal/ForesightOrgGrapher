<script>
	import {getGraphNode} from "./graphutil.js"
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

    function getLabelDirection(edge, graph){
        let fromNode = edge.fromOrphan || getGraphNode(edge.fromId, graph);
        let toNode = edge.toOrphan || getGraphNode(edge.toId, graph);

        let angle = Math.atan2(toNode.pos.y - fromNode.pos.y, toNode.pos.x - fromNode.pos.x) * 180 / Math.PI;

        return (angle > 90 || angle < -120) ? 'right' : 'left';
    }

    function handleControlClicked(e){
        
    }
</script>

<g>
	<path 
        d={getEdgePath(graph)}
        fill="none"
        stroke={isSelected ? 'blue' : (item.stroke || 'red')}
        stroke-width={item.weight}
        stroke-dasharray={item.strokeType === 'dashed' ? '8,5' : false}
        marker-end={(item.directed && false) ? "url(#arrow)" : false}
        on:mousedown|stopPropagation={(e) => dispatch('itemMouseDown', {source: item, from: {x: e.clientX, y: e.clientY}})}
        on:mouseup|stopPropagation={(e) => dispatch('itemMouseUp', {source: item})}
        on:click|stopPropagation
        id={`edgepath${item.id}`}
    >
    </path>
	<text
        font-family="Verdana"
        font-size={4*item.weight} 
        fill={item.stroke} 
        on:mousedown|stopPropagation={(e) => dispatch('itemMouseDown', {source: item, from: {x: e.clientX, y: e.clientY}})}
        on:mouseup|stopPropagation={(e) => dispatch('itemMouseUp', {source: item})}
        on:click|stopPropagation
    >
			<textPath 
                href={`#edgepath${item.id}`}
                startOffset="40%" 
                lengthAdjust="spacingAndGlyphs" 
                font-family="Verdana"
                font-size={4*item.weight} 
                fill={isSelected ? 'blue' : (item.stroke || 'red')}
                stroke={isSelected ? 'blue' : (item.stroke || 'red')}
                on:mousedown|stopPropagation={(e) => dispatch('itemMouseDown', {source: item, from: {x: e.clientX, y: e.clientY}})}
                on:mouseup|stopPropagation={(e) => dispatch('itemMouseUp', {source: item})}
                on:click|stopPropagation
                side={getLabelDirection(item, graph)}>
                    {item.label}
            </textPath>
            {#if item.directed}
            <textPath 
                href={`#edgepath${item.id}`}
                startOffset="20%" 
                lengthAdjust="spacingAndGlyphs" 
                font-family="Verdana"
                font-size={4*item.weight} 
                fill={isSelected ? 'blue' : (item.stroke || 'red')}
                stroke={isSelected ? 'blue' : (item.stroke || 'red')}
                on:mousedown|stopPropagation={(e) => dispatch('itemMouseDown', {source: item, from: {x: e.clientX, y: e.clientY}})}
                on:mouseup|stopPropagation={(e) => dispatch('itemMouseUp', {source: item})}
                on:click|stopPropagation
                side="left">
                ----&gt;
            </textPath>
            {/if}
	</text>

    {#if isSelected}

	  	<circle 
			class="control"
			on:click={handleControlClicked}
			cx={item.pos.x + control[0] * item.width/2} 
			cy={item.pos.y + control[1] * item.height/2}
			title="Create new connected node"
			r={5}>
		</circle>
	{/if}
</g>

<style>
	g:hover text, g:hover textPath {
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

	circle.control {
		fill: white;
		stroke: black;
		cursor: pointer;
	}

	circle.control:hover {
		fill: magenta;
		stroke: red;
	}
</style>