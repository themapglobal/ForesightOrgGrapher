<script>
	import { styles } from "./styles.js";
	import {getGraphNode, moveGraphNode, createGraphNodeEdge, layout, 
		deleteGraphItem, createGraphNode, exportCytoscape} from "./graphutil.js"
	import Node from "./Node.svelte";
	import Edge from "./Edge.svelte";
	import Grid from "./Grid.svelte";
	import ItemEditor from "./ItemEditor.svelte"
	import { onMount } from 'svelte'
	import { zoom } from 'd3-zoom'
  import { select } from 'd3-selection'

	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let unsizedGraph;

	$: graph = layout(unsizedGraph);

	let currentMouse = {};
	let selectedItem = null;
	let draggingFrom = null;
	let contextMenuPosition = null;
	let showJson = false;
	let showCytoscape = false;
	let showSvgExport = false;
	let svgElement;
	let topGroupElem;

	onMount(() => {
		if (svgElement && topGroupElem) {
			select(svgElement).call(zoom().on('zoom', ({ transform }) => {
				const { k, x, y } = transform
				select(topGroupElem).attr('transform', `translate(${x}, ${y}) scale(${k})`)
			}))
		}
	})

    // $: fetch('/getgraph.json').then(r => r.json()).then(d => {data = d;});

    function handleItemMouseDown(e){
        // console.log('handleItemMouseDown');
		selectedItem = e.detail.source;
		draggingFrom = e.detail.from;
		contextMenuPosition = null;
    }
	
	function handleItemMouseUp(e){
        // console.log('handleItemMouseUp');
		selectedItem = e.detail.source;
		draggingFrom = null;
    }

	function handleNodeChanged(e){
		// console.log("handleNodeChanged");
		// graph = graph;
		// dispatch('graphchanged', graph);
	}

	function deleteItem(item, deleteDependents){
		deleteGraphItem(item, graph, deleteDependents);
		selectedItem = null;
		graph = graph;
		dispatch('graphchanged', graph);
		contextMenuPosition = null;
	}
	
	function handleSvgClick(e){ 
		// console.log("handleSvgClick");
		selectedItem = null;
		contextMenuPosition = null;
	} 
	
	function handleMouseMove(x,y){
		currentMouse = {x: x, y: y};
		if(!selectedItem || !draggingFrom || !selectedItem.pos) return;
		
		// move selectedItem along with all its children
		moveGraphNode(selectedItem, graph, (currentMouse.x - draggingFrom.x), (currentMouse.y - draggingFrom.y))

		draggingFrom.x = currentMouse.x;
		draggingFrom.y = currentMouse.y;
		// console.log("handleMouseMove");
		graph = graph; 
		dispatch('graphchanged', graph);
	};

	function createNode(e){
		createGraphNode(e);
		graph = graph;
		dispatch('graphchanged', graph);
		contextMenuPosition = null;
	}

	function handleContextMenu(e){
		if(!graph.contextmenu) return;
		contextMenuPosition = [e.clientX, e.clientY];
	}

	function handleCreateNode(e){
		console.log("createnode", e.detail)
		createGraphNodeEdge(e.detail.from, e.detail.handle)
		graph = graph; 
		dispatch('graphchanged', graph);
	}

	function handleKeydown(e){
		// console.log(e.key, e.keyCode, e.target)
		if(selectedItem && (e.key === 'Backspace' || e.key === 'Delete')){
			deleteItem(selectedItem, false)
		}
	}

	// $: console.log('arithmetic pos', graph.items.find(i => i.label === 'Arithmetic').pos)
	// $: console.log('subtraction pos', graph.items.find(i => i.label === 'Subtraction').pos)
	$: window.graph = graph;
	$: window.move = moveGraphNode;
	$: window.getnode = getGraphNode;

</script>

<div class="container">
<svg tabindex="0" id="mysvg" viewBox={graph.viewBox.join(" ")}
		on:mousemove="{e => handleMouseMove(e.clientX, e.clientY)}"
	    on:mousedown="{e => draggingFrom = {x: e.clientX, y: e.clientY}}"
	    on:mouseup="{() => draggingFrom = null}"
		on:click={handleSvgClick}
		on:contextmenu|preventDefault={handleContextMenu}
		use:styles={{color: graph.fill}}
		bind:this={svgElement}
		on:keydown={handleKeydown}
>
  <defs>
	<marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5"
        markerWidth="4" markerHeight="4"
        orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="grey" />
    </marker>
  </defs>
  
  <g bind:this={topGroupElem}>
	<Grid kind={graph.grid}/> 
	
	<!-- draw edges first, then parent nodes, then child nodes, then selectedItem -->
	<!-- Edges need nodes' width and height for path calculation -->

    {#each graph.items.sort((a,b) => a.kind.localeCompare(b.kind)) as item (item.id)}
		{#if item.kind === 'node'}
    		<Node {item}
					on:itemMouseDown={handleItemMouseDown} 
					on:itemMouseUp={handleItemMouseUp}
					isSelected={item.id === selectedItem?.id}
					on:nodeChanged={handleNodeChanged}
					on:createnode={handleCreateNode}
			/>
		{:else if item.kind === 'edge'}
			<Edge {item} {graph}
					on:itemMouseDown={handleItemMouseDown} 
					on:itemMouseUp={handleItemMouseUp}
					isSelected={item.id === selectedItem?.id}/>
		{/if}
    {/each}    
  </g>
</svg>

{#if graph.sidepanel}
<section class="sidepanel">
	<button on:click={(e) => showJson = true}>View/Modify JSON</button>
	<button on:click={(e) => showCytoscape = true}>View Cytoscape JSON</button>
	<button on:click={(e) => showSvgExport = true}>Export as SVG</button>

	<ItemEditor {selectedItem} {graph} on:graphchanged="{e => {graph = e.detail; dispatch('graphchanged', graph); }}"/>

	{#if graph.debugger}
	<p>Debugger:
		selected = {selectedItem?.label}
		dragging = from {JSON.stringify(draggingFrom)} till {JSON.stringify(currentMouse)}
	</p>
	{/if}
</section>
{/if}

{#if contextMenuPosition}
<sl-menu style={`left: ${contextMenuPosition[0]}px; top: ${contextMenuPosition[1]}px;`}>
  {#if selectedItem}
  	<sl-menu-item value="deleteitem" on:click={(e) => deleteItem(selectedItem, false)}>Delete &quot;{selectedItem.label}&quot; leaving orphans</sl-menu-item>
	{#if selectedItem.kind === 'node'}
  		<sl-menu-item value="deleteitemwithdependents" on:click={(e) => deleteItem(selectedItem, true)}>Delete &quot;{selectedItem.label}&quot; including dependents</sl-menu-item>
	{/if}
  {:else}
  <sl-menu-item value="createnode" on:click={createNode}>Create new node</sl-menu-item>
  {/if}
</sl-menu>
{/if}

<!-- textarea for importing/exporting json -->
{#if graph.jsonview}
<sl-dialog style="--width: 35vw;" open={showJson} label="View or Modify JSON" class="dialog-overview" on:sl-hide={(e) => showJson = false}>
  <textarea 
  	cols="54" rows="20" autofocus
	on:input={(e) => {graph = JSON.parse(e.target.value); dispatch('graphchanged', graph);}}
  >{JSON.stringify(graph, null, 2)}</textarea>
  
  <sl-button on:click={(e) => showJson = false} slot="footer" variant="primary">Close</sl-button>
</sl-dialog>
{/if}

<!-- textarea for exporting Cytoscape compatible json -->
<sl-dialog style="--width: 35vw;" open={showCytoscape} label="View Cytoscape-compatible JSON" class="dialog-overview" on:sl-hide={(e) => showCytoscape = false}>
  <textarea 
  	cols="54" rows="20" autofocus
  >{exportCytoscape(graph)}</textarea>
  
  <sl-button on:click={(e) => showCytoscape = false} slot="footer" variant="primary">Close</sl-button>
</sl-dialog>

<!-- textarea for SVG export -->
<sl-dialog style="--width: 35vw;" open={showSvgExport} label="Export SVG" class="dialog-overview" on:sl-hide={(e) => showSvgExport = false}>
	<textarea 
		cols="54" rows="20" autofocus
	>{svgElement?.outerHTML}</textarea>
	
	<sl-button on:click={(e) => showSvgExport = false} slot="footer" variant="primary">Close</sl-button>
  </sl-dialog>
</div>

<style>
	.container{
		width: 100%;
		height: 100%;
		position: relative;
	}
	svg {
		width: 100%;
		height: 100%;
		background-color: var(--color);
	}
	
	section.sidepanel {
		position: absolute;
		right: 0px;
		top: 0px;
		width: 300px;
		height: 100%;
		z-index: 10;
		background-color: white;
		padding: 0 10px;
		border-left: 3px solid #eeeeee;
	}

	sl-menu {
		position: fixed;
		z-index: 20;
		max-width: 320px;
	}

	sl-dialog textarea {
		resize: none;
	}
</style>