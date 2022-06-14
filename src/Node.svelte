<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let item;
	export let isSelected;
	let textElement;

	// Edge needs nodes' width and height for path calculation
	$: {
		item.width = textElement ? textElement.getBBox().width + 20 : 32;
		item.height = textElement ? textElement.getBBox().height + 12 : 32;
		dispatch('nodeChanged', item);
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
		x={item.pos.x - item.width/2 + 7} 
		y={item.pos.y - item.height/2 + 20} 
		font-family="Verdana"
		font-size={item.fontSize} 
		fill={item.stroke} 
		bind:this={textElement}
		on:mousedown|stopPropagation={(e) => dispatch('itemMouseDown', {source: item, from: {x: e.clientX, y: e.clientY}})}
		on:mouseup|stopPropagation={(e) => dispatch('itemMouseUp', {source: item})}
		on:click|stopPropagation
	>
			{item.label}
	</text>

    {#each [...(item.children || [])] as child (child.id)}
        <svelte:self item={child}></svelte:self>
    {/each}
</g>

<style>
	g:hover rect {
		fill-opacity: 0.7;
		stroke: black;
		stroke-width: 1px;
	}
	
	text {
		cursor: default;
		user-select: none;
	}
	
	rect {
		filter: drop-shadow(3px 3px 2px rgb(0 0 0 / 0.4));
	}
</style>