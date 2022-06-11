<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let item;
	export let isSelected;

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

</g>

<style>
	g:hover rect {
		fill: pink;
		stroke: blue;
		stroke-width: 3px;
	}
	
	g:hover text {
		fill: blue;
		stroke: blue;
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
</style>