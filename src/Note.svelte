<script>

    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

	export let theme;
    export let item;
	export let isSelected;
</script>

<g>
    <rect 
		x={item.pos.x - item.width/2}
		y={item.pos.y - item.height/2} 
		width={item.width}
		height={item.height}
		fill={item.fill || theme.nodefill}
		stroke={isSelected ? theme.selectionColor : (item.bordercolor || theme.nodeborder)}
		stroke-width={isSelected  ? '6px' : '3px'}
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
		font-weight={(item.notes?.length > 0) ? '700' : '300'}
		font-size={item.nodelabelfontsize || theme.nodelabelfontsize || 16}
		fill={item.labelcolor || theme.nodelabelstroke} 
		on:mousedown|stopPropagation={(e) => dispatch('itemMouseDown', {source: item, rawEvent: e})}
		on:mouseup|stopPropagation={(e) => dispatch('itemMouseUp', {source: item, rawEvent: e})}
		on:click|stopPropagation
	>
			{item.label}
	</text>

	{#if item.notes}	
	<foreignObject 
		x={item.pos.x - item.noteswidth/2} 
		y={item.pos.y - item.height/2 + item.labelheight + 10} 
		font-family={theme.font}
		font-weight=300
		font-size={item.nodenotesfontsize || theme.nodenotesfontsize || 16}
		width={item.noteswidth}
		height={item.notesheight}
		on:mousedown|stopPropagation={(e) => dispatch('itemMouseDown', {source: item, rawEvent: e, from: {x: e.clientX, y: e.clientY}})}
		on:mouseup|stopPropagation={(e) => dispatch('itemMouseUp', {source: item, rawEvent: e})}
		on:click|stopPropagation>
			<div class="foreign-obj-div">
				{item.notes}
			</div>	
	</foreignObject>
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
		fill-opacity: 0.8;
		filter: drop-shadow(3px 5px 2px rgb(204 204 204 / 0.4));
		cursor: pointer;
	}
	.foreign-obj-div{
		width: 85%;
		margin: 0 auto;
	}
</style>