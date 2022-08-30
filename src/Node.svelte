<script>
	import ControlPoint from "./ControlPoint.svelte"
    import { createEventDispatcher } from 'svelte';
	import { getGraphNode } from "./graphutil.js";

    const dispatch = createEventDispatcher();

	export let theme;
    export let item;
	export let graph; // is useful for getTags() which is used for dynamicNotes
	export let isSelected;
	export let isHighlighted;
	export let isHidden = false;

	// $: item && item.is_collapsed && console.log(`Node ${item.label} is collapsed`)

	function handleControlClicked(e){
		let handle = parseInt(e.target.getAttribute('data-handle'));
		// console.log(handle)
		dispatch('createnode', {from: item, handle: handle})
	}

	function handleControlMouseDown(e){
		let handle = parseInt(e.target.getAttribute('data-handle'));
		dispatch('itemcontrolmousedown', {source: item, handle: handle, rawEvent: e})
	}

	function getTags(graph, item, tagset){
		// Look at all descendent nodes of item and extract information like tags as text
		// Can return HTML like <table>, <p> or <button>
		// console.log({item}, {tagset});
		item.tags.forEach(t => tagset.add(t));

		item.children.forEach(c => {
			getTags(graph, getGraphNode(c, graph), tagset)
		})
		return tagset;
	}

	function getDynamicNotesHtml(tagset){
		let tags = Array.from(tagset);
		let groups = tags.reduce((acc, tag) => {
			let group =
				tag.split(":").length > 1 ? tag.split(":")[0] : "ungrouped";
			acc[group] = acc[group] ?? [];
			acc[group].push({ label: tag.split(":").reverse()[0], value: tag });

			return acc;
		}, {});

		return `<table>` 
			+ Object.entries(groups).map(e => 
				`<tr><td>${e[0]}</td><td>` 
				+ "<div style='display: flex'>" + e[1].map(t => `<div style='background-color: yellow; padding: 2px 4px; border: thin solid black; margin-right: 4px'>${t.label}</div>`).join('') + "</div>"
				+ `</td></tr>`
			  ).join('') 
			+ `</table>`;
	}

	$: dynamicNotes = getDynamicNotesHtml(getTags(graph, item, new Set()));

</script>

<g>
    <rect 
		x={item.pos.x - item.width/2}
		y={item.pos.y - item.height/2} 
		width={item.width}
		height={item.height}
		fill={isHidden ? 'transparent' : (item.fill || theme.nodefill)}
		stroke={isSelected ? theme.selectionColor : (isHighlighted ? theme.highlightColor : (item.bordercolor || theme.nodeborder))}
		stroke-width={(isSelected || isHighlighted) ? '6px' : '3px'}
		rx={8+Math.floor(item.height/50)}	
		on:mousedown|stopPropagation={(e) => dispatch('itemMouseDown', {source: item, rawEvent: e})}
		on:mouseup|stopPropagation={(e) => dispatch('itemMouseUp', {source: item, rawEvent: e})}
		on:click|stopPropagation
	>
	</rect>
	
	<text 
		x={item.pos.x - item.labelwidth / 2 + 2} 
		y={item.pos.y - item.height/2 + item.labelheight} 
		font-family={theme.font}
		font-weight={(item.children.length > 0) || (item.notes?.length > 0) ? '700' : '300'}
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

	{#if item.has_dynamic_notes}	
	<foreignObject 
		x={item.pos.x - item.width/2} 
		y={item.pos.y - item.height/2 + 30 + item.notesheight} 
		font-family={theme.font}
		font-weight=300
		font-size={item.nodenotesfontsize || theme.nodenotesfontsize || 16}
		width={item.width}
		height={140}
		on:mousedown|stopPropagation={(e) => dispatch('itemMouseDown', {source: item, rawEvent: e, from: {x: e.clientX, y: e.clientY}})}
		on:mouseup|stopPropagation={(e) => dispatch('itemMouseUp', {source: item, rawEvent: e})}
		on:click|stopPropagation>
			<div xmlns="http://www.w3.org/1999/xhtml" class="dynamicnotes-div">
				{@html dynamicNotes}
			</div>	
	</foreignObject>
	{/if}

	{#if isSelected}
	  {#each [[1,0],[0,1],[-1,0],[0,-1]] as control}
	  	<ControlPoint 
			kind='plus'
			data={22 + control[1] + 10*control[0]}
			on:click={handleControlClicked}
			on:mousedown={handleControlMouseDown}
			x={item.pos.x + control[0] * item.width/2} 
			y={item.pos.y + control[1] * item.height/2}
			title="Create new connected node"
			size={4}/>
	  {/each}
	{/if}

	{#if item.badge}
	<g class="badge">
		 {#if item.badge.startsWith("http")}
			<foreignObject
				x={item.pos.x - item.width/2 - 10} 
				y={item.pos.y - item.height/2 - 10} 
				width={30}
				height={28}
			>
				<img width="100%" height="100%" alt="badge" src={item.badge}/>
			</foreignObject>
		 {:else}
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
		{/if}
	</g>
	{/if}

	{#if item.kind === "node" && item.children && item.children.length > 0}
		<circle 
				cx={item.pos.x + item.width/2 - 1} 
				cy={item.pos.y - item.height/2 + 2} 
				r={9}
				fill="white" stroke="none"
				on:mousedown|stopPropagation
				on:mouseup|stopPropagation
				on:click|stopPropagation={(e) => dispatch('itemCollapserClick', {source: item, rawEvent: e})}
		/>
		<text 
				x={item.pos.x + item.width/2 - 10} 
				y={item.pos.y - item.height/2 + 9} 
				stroke={item.bordercolor || theme.nodeborder}
				fill={item.bordercolor || theme.nodeborder}
				font-size={20}
				on:mousedown|stopPropagation
				on:mouseup|stopPropagation
				on:click|stopPropagation={(e) => dispatch('itemCollapserClick', {source: item, rawEvent: e})}
		>{item.is_collapsed ? '⊕' : '⊖'}</text>
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

	.dynamicnotes-div {
		width: 100%;
		height: 100%;
	}

</style>