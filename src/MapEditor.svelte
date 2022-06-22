<script>
	import { styles } from "./styles.js";
	import {exportJson, moveGraphNode, createGraphNodeEdge, layout, 
		deleteGraphItem, createGraphNode, exportCytoscape, createGraphChildNode} from "./graphutil.js"
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
	$: itemsForRender = getItemsForRender(graph, selectedItem);
	$: tagGroups = getTagGroups(graph);
	
	let currentMouse = {};
	let selectedItem = null;
	let draggingFrom = null;
	let contextMenuPosition = null;
	let showJson = false;
	let showCytoscape = false;
	let showSvgExport = false;
	let svgElement;
	let topGroupElem;
	let highlighted = [];
	
	onMount(() => {
		if (svgElement && topGroupElem) {
			select(svgElement).call(zoom().on('zoom', ({ transform }) => {
				const { k, x, y } = transform
				select(topGroupElem).attr('transform', `translate(${x}, ${y}) scale(${k})`)
			}))
		}
	})

    function reRender(){
		svgElement = svgElement;
		selectedItem = selectedItem;
		dispatch('graphchanged', graph);
	}

    function handleItemMouseDown(e){
        // console.log('handleItemMouseDown');

		selectedItem = e.detail.source;

		// to stop mouse events from firing elsewhere
		// e.detail.rawEvent.target.setPointerCapture(e.detail.rawEvent.pointerId);

		draggingFrom = {x: e.detail.rawEvent.clientX, y: e.detail.rawEvent.clientY};
		contextMenuPosition = null;
		svgElement.onmousemove = handleMouseMove;
    }
	
	function handleItemMouseUp(e){
        // console.log('handleItemMouseUp');

		// release pointer lock
		// e.detail.rawEvent.target.releasePointerCapture(e.detail.rawEvent.pointerId);

		selectedItem = e.detail.source;
		draggingFrom = null;
		svgElement.onmousemove = null;
    }

	function handleNodeChanged(e){
		// console.log("handleNodeChanged");
		// dispatch('graphchanged', graph);
	}

	function handleItemBadgeClick(e){
		let item = e.detail.source;
		let indexOfCurrentBadge = graph.theme.badges.indexOf(item.badge);
		let indexOfNextBadge = (indexOfCurrentBadge + 1) % graph.theme.badges.length;
		item.badge = graph.theme.badges[indexOfNextBadge]
		reRender();
	}

	function deleteItem(item, deleteDependents){
		deleteGraphItem(item, graph, deleteDependents);
		selectedItem = null;
		reRender();
		contextMenuPosition = null;
	}
	
	function handleSvgClick(e){ 
		// console.log("handleSvgClick");
		selectedItem = null;
		contextMenuPosition = null;
	} 
	
	function handleMouseMove(e){
		// console.log("mousemove");
		currentMouse = {x: e.clientX, y: e.clientY};
		if(!selectedItem || !draggingFrom || !selectedItem.pos) return;
		
		// move selectedItem along with all its children
		moveGraphNode(selectedItem, graph, (currentMouse.x - draggingFrom.x), (currentMouse.y - draggingFrom.y))

		// TODO: if moved on top of another node, create parent-child relationship

		draggingFrom.x = currentMouse.x;
		draggingFrom.y = currentMouse.y;
		// console.log("handleMouseMove");
		reRender();
	};

	function createNode(e){
		createGraphNode(e, graph, svgElement);
		reRender();
		contextMenuPosition = null;
	}

	function handleContextMenu(e){
		if(!graph.contextmenu) return;
		contextMenuPosition = [e.clientX, e.clientY];
	}

	function handleCreateNode(e){
		// console.log("createnode", e.detail)
		createGraphNodeEdge(e.detail.from, e.detail.handle, graph)
		reRender();
	}

	function handleKeydown(e){
		// console.log(e.key, e.keyCode, e.target)
		if(selectedItem && (e.key === 'Backspace' || e.key === 'Delete')){
			deleteItem(selectedItem, false)
		}
	}

	function handleEdgeChanged(e){
		reRender();
	}

	function createChildNode(e, item){
		console.log("createChildNode", item);
		createGraphChildNode(e, graph, item, svgElement);
		reRender();
		contextMenuPosition = null;
	}

	function getItemsForRender(graph, selectedItem){
		// draw selected edge on the top (at the end)
		if(selectedItem?.kind === 'edge')
			return [
				...graph.items.sort((a,b) => a.level - b.level)
				.filter(i => i.id !== selectedItem.id), 
				...graph.items.filter(i => i.id === selectedItem.id)];
		else 
			return graph.items.sort((a,b) => a.level - b.level);
	}

	function switchTheme(name){
		switch(name){
			case 'elegant':
				graph.theme = {
					"name": "elegant",
					"bgfill": "#334155",
					"grid": "cartesian",
					"nodefill": "#bae6fd",
					"nodelabelstroke": "#334155",
					"nodeborder": "white",
					"edgestroke": "red",
					"edgeshape": "curved",
					"edgestroketype": "solid",
					"font": "Dosis",
            		"badges": ["✅", "❌", "⚡", "👎", "👍"]
				}; break;
			case 'foresight':
				graph.theme = {
					"name": "foresight",
					"bgfill": "#1c170b",
					"grid": false,
					"nodefill": "#7b9ecb",
					"nodelabelstroke": "black",
					"nodeborder": "white",
					"edgestroke": "#ccc",
					"edgeshape": "ortho",
					"edgestroketype": "solid",
					"font": "Roboto Condensed",
            		"badges": ["✅", "❌", "⚡", "👎", "👍"]
				}; break;
			default:
				graph.theme = {
				"name": "classic",
				"bgfill": "#f3f3f3",
				"grid": false,
				"font": "Balsamiq Sans",
				"nodefill": "#fbe6a3",
				"nodelabelstroke": "black",
				"nodeborder": "black",
				"edgestroke": "#4277dd",
				"edgeshape": "curved",
				"edgestroketype": "solid",
            	"badges": ["✅", "❌", "⚡", "👎", "👍"]
			}
		};
		reRender();
	}

    function getTagGroups(graph){
        // get unique tags
        let tags = graph.items.map(i => i.tags).flat().filter((value, index, self) => self.indexOf(value) === index); 
        let groups = tags.reduce((acc, tag)=> {
            let [kind,name] = tag.split(":");
            acc[kind] = acc[kind] ?? [];
            acc[kind].push(name);
            return acc;
        }, {});
        return Object.entries(groups);
    }

  // function for upload and displaying the json file 
	const uploadFile = (e) => {
		let jsonFile = e.target.files[0];
			let reader = new FileReader();
			reader.readAsText(jsonFile);
			reader.onload = e => {
				
				dispatch('graphchanged', JSON.parse(e.target.result))
			}
			//console.log(reader)
	}
</script>

<div class="container">
<svg tabindex="0" id="mysvg" xmlns="http://www.w3.org/2000/svg"
		viewBox={graph.viewBox.join(" ")}
	    on:mousedown="{e => { draggingFrom = {x: e.clientX, y: e.clientY}; svgElement.onmousemove = handleMouseMove;}}"
	    on:mouseup="{() => {draggingFrom = null; svgElement.onmousemove = null; }}"
		on:click={handleSvgClick}
		on:contextmenu|preventDefault={handleContextMenu}
		use:styles={{color: graph.theme.bgfill}}
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
	<Grid kind={graph.theme.grid}/> 

    {#each itemsForRender as item (item.id)}
		{#if item.kind === 'node'}
    		<Node {item}
					on:itemMouseDown={handleItemMouseDown} 
					on:itemMouseUp={handleItemMouseUp}
					on:itemBadgeClick={handleItemBadgeClick}
					isSelected={item.id === selectedItem?.id}
					on:nodeChanged={handleNodeChanged}
					on:createnode={handleCreateNode}
					theme={graph.theme}
					isHighlighted={highlighted.includes(item.id)}
			/>
		{:else if item.kind === 'edge'}
			<Edge {item} {graph}
					on:itemMouseDown={handleItemMouseDown} 
					on:itemMouseUp={handleItemMouseUp}
					on:edgeChanged={handleEdgeChanged}
					isSelected={item.id === selectedItem?.id}/>
		{/if}
    {/each}    
  </g>
</svg>

{#if graph.sidepanel}
<section class="sidepanel">
	<div class="btn-group">
		<sl-button variant="default" href="data:text/json;charset=utf-8,{encodeURIComponent(exportJson(graph))}" download="graph.json">
			<sl-icon slot="prefix" name="download"></sl-icon>
			Download file
		</sl-button>
		
			<label for="upload" class="custom-file-upload">
				<svg xmlns="http://www.w3.org/2000/svg" class="upSvg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
				</svg> Load File
			</label>
			<input type="file" name="upload" id="upload" accept=".json"
			on:change="{e => uploadFile(e) }"/>

		<!-- svelte-ignore component-name-lowercase -->
			<select value={graph.theme.name} on:change="{(e) => switchTheme(e.target.value)}" class="theme" >
				<option value="classic">Theme: Classic</option>
				<option value="elegant">Theme: Elegant</option>
				<option value="foresight">Theme: Foresight</option>
			</select>
			
	</div>
	
	<!-- TODO:  upload file instead of jsonimportexport -->
	<!-- {#if graph.jsonupload}
		<label for="upload" class="upload">
			<input type="file" size='30' name="upload" id="file-upload" accept=".json"
			on:change="{e => uploadFile(e) }">
			<svg xmlns="http://www.w3.org/2000/svg" style="width: 15px; height: 15px" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
			</svg>
			Load File
		</label>
		
	{/if} -->
	
	<div class="editor">
		{#if graph.exportcytoscape}
		<button on:click={(e) => showCytoscape = true}>View Cytoscape JSON</button>
		{/if}

		{#if graph.exportsvg}
		<button on:click={(e) => showSvgExport = true}>Export as SVG</button>
		{/if}

		<ItemEditor {selectedItem} {graph} on:graphchanged />

		{#if graph.debugger}
		<p>Debugger:
			selected = {selectedItem?.label}
			dragging = from {JSON.stringify(draggingFrom)} till {JSON.stringify(currentMouse)}
		</p>
		{/if}
	</div>	
</section>
{/if}

{#if contextMenuPosition}
<sl-menu style={`left: ${contextMenuPosition[0]}px; top: ${contextMenuPosition[1]}px;`}>
  {#if selectedItem}
	{#if selectedItem.kind === 'node'}
		<sl-menu-item value="createchildnode" on:click={(e) => createChildNode(e, selectedItem)}>Create child node</sl-menu-item>
		<sl-menu-item value="deleteitemwithdependents" on:click={(e) => deleteItem(selectedItem, true)}>Delete &quot;{selectedItem.label}&quot; including dependents</sl-menu-item>
	{/if}
	  <sl-menu-item value="deleteitem" on:click={(e) => deleteItem(selectedItem, false)}>Delete &quot;{selectedItem.label}&quot; leaving orphans</sl-menu-item>
  {:else}
  <sl-menu-item value="createnode" on:click={createNode}>Create new node</sl-menu-item>
  {/if}
</sl-menu>
{/if}

{#if graph.exportcytoscape}
<!-- textarea for exporting Cytoscape compatible json -->
<sl-dialog style="--width: 35vw;" open={showCytoscape} label="View Cytoscape-compatible JSON" class="dialog-overview" on:sl-hide={(e) => showCytoscape = false}>
  <textarea 
  	cols="54" rows="20" autofocus
  >{exportCytoscape(graph)}</textarea>
  
  <sl-button on:click={(e) => showCytoscape = false} slot="footer" variant="primary">Close</sl-button>
</sl-dialog>
{/if}

{#if graph.exportsvg}
<!-- textarea for SVG export -->
<sl-dialog style="--width: 35vw;" open={showSvgExport} label="Export SVG" class="dialog-overview" on:sl-hide={(e) => showSvgExport = false}>
	<textarea 
		cols="54" rows="20" autofocus
	>{svgElement?.outerHTML}</textarea>
	
	<sl-button on:click={(e) => showSvgExport = false} slot="footer" variant="primary">Close</sl-button>
  </sl-dialog>
{/if}

</div>

<section class="tagfilter">
	<sl-select 
		placeholder="Highlight by Tag"
		clearable pill
		on:sl-change={e => highlighted = graph.items.filter(i => i.kind === 'node' && i.tags.includes(e.target.value)).map(i => i.id)}
	>
			{#each tagGroups as group (group[0])}
				<sl-menu-label>{group[0]}</sl-menu-label>
				{#each group[1] as tag}
					<sl-menu-item value={`${group[0]}:${tag}`}>{tag}</sl-menu-item>
				{/each}
				<sl-divider></sl-divider>
			{/each}
	</sl-select>
</section>

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
		z-index: 10;
		padding: 0 10px;	
		background-color: #e3e3e3;
		border-left: 3px solid #666;
		border-bottom: 3px solid #666;
		/* height: 100%; */
	}
	.editor{
	text-align: center;
	padding-bottom: 20px;
	}
	sl-menu {
		position: fixed;
		z-index: 20;
		max-width: 380px;
	}

	sl-dialog textarea {
		resize: none;
	}

	section.tagfilter {
        position: fixed;
        top: 20px;
        left: 20px;
    }

    section.tagfilter sl-select {
        width: 200px;
    }
	
	
	input[type="file"] {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0,0,0,0);
    border: 0;
}
.custom-file-upload, .theme{
		border: 1px solid #ccc;
    padding-top: 8px;
		padding-bottom: 8px;
    cursor: pointer;
		font-weight: 500;
		font-size: 14px;
		border-radius: 5px;
		display: inline-flex;
		justify-items: center;
		align-items: center;
		gap: 10px;
		width: 145.66px;
		background-color: white;
}

.custom-file-upload:hover, .theme:hover{
	background-color: #f0f9ff;
	border-color: #38bdf8;
}
.btn-group{
	display: flex;	
	flex-direction: column;
	align-items: end;
	gap: 5px;
	margin-top: 5px;
}
.upSvg{
	width: 16px; 
	height: 16px;
	padding-left: 10px;
}
</style>