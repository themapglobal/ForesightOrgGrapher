<script>
	import { styles } from "./styles.js";
	import {exportJson, moveGraphNode, createGraphNodeEdge, layout, themes,
		deleteGraphItem, createGraphNode, exportCytoscape, createGraphChildNode} from "./graphutil.js"
	import Node from "./Node.svelte";
	import Edge from "./Edge.svelte";
	import Grid from "./Grid.svelte";
	import ItemEditor from "./ItemEditor.svelte"
	import { onMount } from 'svelte'
	import { zoom } from 'd3-zoom'
	import { select } from 'd3-selection'

	export let graphjsonpath;
    export let overrideOptions = {};

	let graph;
	let itemsForRender;
	let tagGroups;

	$: itemsForRender = getItemsForRender(graph, selectedItem);
	$: tagGroups = getTagGroups(graph);
	
	let currentMouse = {};
	let selectedItem = null;
	let draggingFrom = null;
	let contextMenuPosition = null;

	let svgElement;
	let topGroupElem;
	let highlighted = [];

	// panning and zooming
	$: if (svgElement && topGroupElem) {
			select(svgElement).call(zoom().on('zoom', ({ transform }) => {
				const { k, x, y } = transform
				select(topGroupElem).attr('transform', `translate(${x}, ${y}) scale(${k})`)
			}))
	}
	
	onMount(() => {
		graphjsonpath && fetch(graphjsonpath)
		.then(r => r.json())
		.then(data => {
			console.log('fetched')
			graph = layout(Object.assign(data, overrideOptions))
		});
	})

    function reRender(){
		console.log("rerendering");
		svgElement = svgElement;
		selectedItem = selectedItem;
		graph = layout(graph);
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
		// graph = graph;
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
		if(!graph) return [];
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
		graph.theme = themes[name];
		reRender();
	}

    function getTagGroups(graph){
		if(!graph) return Object.entries({});
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

	function downloadFile(content, name){
		let element = document.createElement('a');
		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
		element.setAttribute('download', name);
		element.style.display = 'none';
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);
	}

	function handleMenu(e){
		let value = e.detail.item.value;
		if(value.startsWith("theme.")){
			switchTheme(value.split(".")[1])
		} else if (value.startsWith("export.")){
			let kind = value.split(".")[1]; //svg or cytoscape
			if(kind === 'svg'){
				downloadFile(svgElement.outerHTML, 'graph.svg')
			} else if (kind === 'cytoscape'){
				downloadFile(exportCytoscape(graph), 'graph-cytoscape.json')
			}
		} else if (value === 'openfile'){
			console.log(value)
			let fileinput = document.getElementsByClassName('fileupload')[0];
			console.log({fileinput})
			fileinput.click();
		} else if (value === 'savefile') {
			downloadFile(exportJson(graph), 'mynetwork.graph')
		}
	}
    
	function uploadFile(e) {
		let jsonFile = e.target.files[0];
		let reader = new FileReader();
		reader.readAsText(jsonFile);
		reader.onload = e => {
			graph = layout(JSON.parse(e.target.result))
		}
	}
</script>

{#if graph}
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


<section class="sidepanel">
	<ItemEditor {selectedItem} {graph} on:graphchanged={e => graph = e.detail} />
</section>

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

</div>

<section class="globalmenu">
<sl-button-group>
	<sl-dropdown on:sl-select={handleMenu}>
		<sl-button slot="trigger" caret>
			Menu
			<sl-icon slot="prefix" name="list"></sl-icon>
		</sl-button>
		<sl-menu>
			{#if graph.jsonupload}
		  	<sl-menu-item value="openfile">
				Load .graph File...
				<sl-icon slot="prefix" name="folder2-open"></sl-icon>
			</sl-menu-item>
			{/if}
			{#if graph.jsondownload}
		  	<sl-menu-item value="savefile">
				Save as .graph file...
				<sl-icon slot="prefix" name="download"></sl-icon>
			</sl-menu-item>
			{/if}
			<sl-divider></sl-divider>
			<sl-menu-label>Export as:</sl-menu-label>
			{#if graph.exportsvg}<sl-menu-item value="export.svg">SVG</sl-menu-item>{/if}
			{#if graph.exportcytoscape}<sl-menu-item value="export.cytoscape">Cytoscape JSON</sl-menu-item>{/if}
			<sl-divider></sl-divider>
			<sl-menu-label>Switch Theme To</sl-menu-label>
			<sl-menu-item value="theme.classic" checked={graph.theme.name === 'classic'}>Classic</sl-menu-item>
			<sl-menu-item value="theme.elegant" checked={graph.theme.name === 'elegant'}>Elegant</sl-menu-item>
			<sl-menu-item value="theme.foresight" checked={graph.theme.name === 'foresight'}>Foresight</sl-menu-item>
		</sl-menu>
	</sl-dropdown>

	<input class="fileupload" style="display: none;" type="file" name="upload" id="upload" accept=".graph" on:change="{e => uploadFile(e) }"/>

	<sl-select 
		placeholder="Highlight by Tag"
		clearable 
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
</sl-button-group>
</section>
{/if}

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
		top: 50px;
		z-index: 10;
		text-align: center;	
		background-color: #e3e3e3;
		border: 3px solid #666;
		border-radius: 6px;
		/* height: 100%; */
	}

	section.globalmenu {
        position: fixed;
        top: 20px;
        left: 20px;
    }

    section.globalmenu sl-select {
        width: 200px;
    }

</style>