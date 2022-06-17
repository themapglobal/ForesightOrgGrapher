<script>
	import ControlPoint from "./ControlPoint.svelte"
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let item;
	export let isSelected;

	function handleControlClicked(e){
		let handle = parseInt(e.target.getAttribute('data-handle'));
		// console.log(handle)
		dispatch('createnode', {from: item, handle: handle})
	}

</script>

<g>
    <rect 
		x={item.pos.x - item.width/2}
		y={item.pos.y - item.height/2} 
		width={item.width}
		height={item.height}
		fill={item.fill}
		stroke={isSelected ? 'blue' : item.stroke}
		stroke-width={isSelected ? '3px' : '1px'}
		rx='8'		
		on:mousedown|stopPropagation={(e) => dispatch('itemMouseDown', {source: item, from: {x: e.clientX, y: e.clientY}})}
		on:mouseup|stopPropagation={(e) => dispatch('itemMouseUp', {source: item})}
		on:click|stopPropagation
	>
	</rect>
	
	<text 
		x={item.pos.x - 0.5 * item.label.length * 10 + 5} 
		y={item.pos.y - item.height/2 + 20} 
		font-family="Verdana"
		font-size={item.fontSize} 
		fill={item.stroke} 
		on:mousedown|stopPropagation={(e) => dispatch('itemMouseDown', {source: item, from: {x: e.clientX, y: e.clientY}})}
		on:mouseup|stopPropagation={(e) => dispatch('itemMouseUp', {source: item})}
		on:click|stopPropagation
	>
			{item.label}
	</text>

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

</g>

<style>
	g:hover rect {
		fill-opacity: 1;
		stroke: blue;
		stroke-width: 2px;
	}
	
	text {
		cursor: pointer;
		user-select: none;
	}
	
	rect {
		fill-opacity: 0.8;
		filter: drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));
		cursor: pointer;
	}


</style>