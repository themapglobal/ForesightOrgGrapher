<script>

    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

	export let theme;
    export let item;
	export let isSelected;

	$: notesWidth = Math.min(300, item.notes ? item.notes.length *10 : 0)
	$: notesHeight = (item.notes ? (Math.ceil(item.notes.length*10 / notesWidth) * 20) : 0)
	// $: console.log(item.id, item.pos, item.width, item.height);
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
		x={item.pos.x - notesWidth/2} 
		y={item.pos.y - item.height/2 + 30} 
		font-family={theme.font}
		font-weight=300
		font-size={item.fontSize}	
		width={notesWidth}
		height={notesHeight}
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