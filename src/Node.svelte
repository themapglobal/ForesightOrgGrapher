<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let item;
	export let isSelected;

	function handleControlClicked(e){
		let handle = parseInt(e.target.getAttribute('data-handle'));
		console.log(handle)
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
		stroke={isSelected ? 'blue' : 'none'}
		stroke-width={isSelected ? '3px' : '0px'}
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
	  	<circle 
			class="control"
			data-handle={22 + control[1] + 10*control[0]}
			on:click={handleControlClicked}
			cx={item.pos.x + control[0] * item.width/2} 
			cy={item.pos.y + control[1] * item.height/2}
			title="Create new connected node"
			r={5}>
		</circle>
	  {/each}
	{/if}

</g>

<style>
	g:hover rect {
		fill-opacity: 0.7;
		stroke: black;
		stroke-width: 1px;
	}
	
	text {
		cursor: pointer;
		user-select: none;
	}
	
	rect {
		opacity: 0.5;
		filter: drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));
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