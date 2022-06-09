<script>
	import { styles } from "./styles.js";
	import Node from "./Node.svelte";
	import Edge from "./Edge.svelte";
	import Grid from "./Grid.svelte";
	import ItemEditor from "./ItemEditor.svelte"

	// import ZoomSvg from '@svelte-parts/zoom/svg'
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let graph;

	let currentMouse = {};
	let selectedItem = null;
	let draggingFrom = null;
	let contextMenuPosition = null;
	let showJsonImport = false;

    // $: fetch('/getgraph.json').then(r => r.json()).then(d => {data = d;});

    function handleNodeMouseDown(e){
        // console.log('handleNodeMouseDown', e.detail);
		selectedItem = e.detail.source;
		draggingFrom = e.detail.from;
		contextMenuPosition = null;
    }
	
	function handleNodeMouseUp(e){
        // console.log('handleNodeMouseUp', e.detail);
		selectedItem = e.detail.source;
		draggingFrom = null;
    }

    function handleRightClick(e){
        // show context menu with allowed actions
		// console.log(e.detail);
    } 

	function handleNodeChanged(e){
		// graph = graph;
		// dispatch('graphchanged', graph);
	}
	
	function handleSvgClick(e){ 
		console.log("handleSvgClick");
		selectedItem = null;
		contextMenuPosition = null;
	} 
	
	function handleMouseMove(x,y){
		currentMouse = {x: x, y: y};
		if(!selectedItem || !draggingFrom || !selectedItem.pos) return;
		// console.log("updating");
		selectedItem.pos.x += currentMouse.x - draggingFrom.x; draggingFrom.x = currentMouse.x;
		selectedItem.pos.y += currentMouse.y - draggingFrom.y; draggingFrom.y = currentMouse.y;
		graph = graph; 
		dispatch('graphchanged', graph);
	};

	function deleteItem(item, deleteDependents){
		if(item.kind === 'edge'){
			// can be deleted safely
			graph.items = graph.items.filter(i => i != item);
		} else if(item.kind === 'node'){
			if(deleteDependents){
				// delete children and all their edges recursively?
			} else {
				// make dependents (children, edges) orphans
			}
		}
		selectedItem = null;
		graph = graph;
		dispatch('graphchanged', graph);
		contextMenuPosition = null;
		
	}

	function createNode(e){
		graph.items.push({
			id: Math.ceil(Math.random() * 10000),
			kind: 'node',
			label: 'New node',
			children: [],
			pos: {x: e.clientX,y: e.clientY},
			fill: 'yellow',
			stroke: 'black'
		})
		graph = graph;
		dispatch('graphchanged', graph);
		contextMenuPosition = null;
	}

	
	function getViewBox(){
		//TODO: Should change for zooming/panning
		return "0 0 1700 900";
	}

	function handleContextMenu(e){
		contextMenuPosition = [e.clientX, e.clientY];
	}

</script>
 
<svg viewBox={getViewBox()}
		on:mousemove="{e => handleMouseMove(e.clientX, e.clientY)}"
	    on:mousedown="{e => draggingFrom = {x: e.clientX, y: e.clientY}}"
	    on:mouseup="{() => draggingFrom = null}"
		on:click={handleSvgClick}
		on:contextmenu|preventDefault={handleContextMenu}
		use:styles={{color: graph.fill}}
>
  <defs>
	<marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5"
        markerWidth="6" markerHeight="6"
        orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#f00" />
    </marker>
  </defs>
	
	<Grid kind={graph.grid}/> 
	
    {#each graph.items.sort((a,b) => a.kind.localeCompare(b.kind)) as item (item.id)}
		{#if item.kind === 'node'}
    		<Node {item} 
					on:itemMouseDown={handleNodeMouseDown} 
					on:itemMouseUp={handleNodeMouseUp}
					isSelected={item.id === selectedItem?.id}
					on:nodeChanged={handleNodeChanged}
			/>
		{:else if item.kind === 'edge'}
			<Edge {item} {graph}
					on:itemMouseDown={handleNodeMouseDown} 
					on:itemMouseUp={handleNodeMouseUp}
					isSelected={item.id === selectedItem?.id}/>
		{/if}
    {/each}    
</svg>

<section class="sidepanel">
	<button on:click={(e) => showJsonImport = true}>View/Modify JSON</button>
	<ItemEditor {selectedItem} {graph} on:graphchanged="{e => {graph = e.detail; dispatch('graphchanged', graph); }}"/>

	{#if graph.debugger}
	<p>Debugger:
		selected = {selectedItem?.label}
		dragging = from {JSON.stringify(draggingFrom)} till {JSON.stringify(currentMouse)}
	</p>
	{/if}
</section>

{#if contextMenuPosition}
<sl-menu style={`left: ${contextMenuPosition[0]}px; top: ${contextMenuPosition[1]}px;`}>
  {#if selectedItem}
  	<sl-menu-item value="deleteitem" on:click={(e) => deleteItem(selectedItem, false)}>Delete {selectedItem.label}</sl-menu-item>
	{#if selectedItem.kind === 'node'}
  		<sl-menu-item value="deleteitemwithdependents" on:click={(e) => deleteItem(selectedItem, true)}>Delete {selectedItem.label} with dependents</sl-menu-item>
	{/if}
  {:else}
  <sl-menu-item value="createnode" on:click={createNode}>Create new node</sl-menu-item>
  {/if}
</sl-menu>
{/if}

<sl-dialog style="--width: 35vw;" open={showJsonImport} label="View or Modify JSON" class="dialog-overview" on:sl-hide={(e) => showJsonImport = false}>
  <textarea 
  	cols="54" rows="20" autofocus
	on:input={(e) => {graph = JSON.parse(e.target.value); dispatch('graphchanged', graph);}}
  >{JSON.stringify(graph, null, 2)}</textarea>
  
  <sl-button on:click={(e) => showJsonImport = false} slot="footer" variant="primary">Close</sl-button>
</sl-dialog>

<style>
	svg {
		width: 1700px;
		height: 900px;
		background-color: var(--color);
	}
	
	section.sidepanel {
		position: fixed;
		right: 0px;
		top: 0px;
		width: 300px;
		height: 100%;
		z-index: 10;
		background-color: white;
		padding: 10px;
		border-left: 3px solid #eeeeee;
	}

	sl-menu {
		position: fixed;
		z-index: 20;
		max-width: 300px;
	}

	sl-dialog textarea {
		resize: none;
	}
</style>