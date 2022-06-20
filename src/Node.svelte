<script>
	import ControlPoint from "./ControlPoint.svelte"
    import { createEventDispatcher } from 'svelte';
import { style } from "d3-selection";
    const dispatch = createEventDispatcher();

	export let theme;
    export let item;
	export let isSelected;
	export let isHighlighted;

	function handleControlClicked(e){
		let handle = parseInt(e.target.getAttribute('data-handle'));
		// console.log(handle)
		dispatch('createnode', {from: item, handle: handle})
	}
	$: notesWidth = Math.min(300, item.notes ? item.notes.length *10 : 0)
	$: notesHeight = (item.notes ? (Math.ceil(item.notes.length*10 / notesWidth) * 20) : 0)
</script>

<g>
    <rect 
		x={item.pos.x - item.width/2}
		y={item.pos.y - item.height/2} 
		width={item.width}
		height={item.height}
		fill={item.fill || theme.nodefill}
		stroke={isSelected ? 'blue' : (isHighlighted ? 'red' : (item.bordercolor || theme.nodeborder))}
		stroke-width={(isSelected || isHighlighted) ? '6px' : '3px'}
		rx={8+Math.floor(item.height/50)}	
		on:mousedown|stopPropagation={(e) => dispatch('itemMouseDown', {source: item, rawEvent: e})}
		on:mouseup|stopPropagation={(e) => dispatch('itemMouseUp', {source: item, rawEvent: e})}
		on:click|stopPropagation
	>
	</rect>
	
	<text 
		x={item.pos.x - 0.5 * item.label.length * 10 + 5} 
		y={item.pos.y - item.height/2 + 20} 
		font-family={theme.font}
		font-weight={item.children.length > 0 ? '700' : '300'}
		font-size={item.fontSize} 
		fill={item.labelcolor || theme.nodelabelstroke} 
		on:mousedown|stopPropagation={(e) => dispatch('itemMouseDown', {source: item, rawEvent: e})}
		on:mouseup|stopPropagation={(e) => dispatch('itemMouseUp', {source: item, rawEvent: e})}
		on:click|stopPropagation
	>
			{item.label}
	</text>

	{#if item.notes}	
	<foreignObject 
		x={item.pos.x - notesWidth/2 + 10} 
		y={item.pos.y - item.height/2 + 10} 
		font-family={theme.font}
		font-weight=300
		font-size={item.fontSize}	
		width={notesWidth}
		height={notesHeight}
		on:mousedown|stopPropagation={(e) => dispatch('itemMouseDown', {source: item, from: {x: e.clientX, y: e.clientY}})}
		on:mouseup|stopPropagation={(e) => dispatch('itemMouseUp', {source: item})}
		on:click|stopPropagation>
			<div style="padding:15px; margin-top:10px">
				{item.notes}
			</div>	
	</foreignObject>
{/if}

	{#if isSelected}
	  {#each [[1,0],[0,1],[-1,0],[0,-1]] as control}
	  	<ControlPoint 
			kind='plus'
			data={22 + control[1] + 10*control[0]}
			on:click={handleControlClicked}
			x={item.pos.x + control[0] * item.width/2} 
			y={item.pos.y + control[1] * item.height/2}
			title="Create new connected node"
			size={4}/>
	  {/each}
	{/if}

	{#if item.badge}
	<g class="badge">
		<circle 
			cx={item.pos.x - item.width/2} 
			cy={item.pos.y - item.height/2} 
			r={10}
			fill="white" stroke="orange"
			on:mousedown|stopPropagation={(e) => dispatch('itemMouseDown', {source: item, rawEvent: e})}
			on:mouseup|stopPropagation={(e) => dispatch('itemMouseUp', {source: item, rawEvent: e})}
			on:click|stopPropagation={(e) => dispatch('itemBadgeClick', {source: item, rawEvent: e})}
		 />
		 <text 
		 	x={item.pos.x - item.width/2 - 7} 
			y={item.pos.y - item.height/2 + 6} 
			stroke="white" 
			fill="white"
			on:mousedown|stopPropagation={(e) => dispatch('itemMouseDown', {source: item, rawEvent: e})}
			on:mouseup|stopPropagation={(e) => dispatch('itemMouseUp', {source: item, rawEvent: e})}
			on:click|stopPropagation={(e) => dispatch('itemBadgeClick', {source: item, rawEvent: e})}
		>{item.badge}</text>
	</g>
	{/if}

</g>

<style>
	g:hover rect {
		filter: invert(10%) drop-shadow(3px 5px 2px rgb(204 204 204 / 0.4));
	
	}
	
	text {
		cursor: pointer;
		user-select: none;
	}
	
	rect {
		fill-opacity: 1;
		filter: drop-shadow(3px 5px 2px rgb(204 204 204 / 0.4));
		cursor: pointer;
	}


</style>