<script>
	import {
		exportJson,
		moveGraphNode,
		createGraphNodeEdge,
		layout,
		themes,
		deleteGraphItem,
		createGraphNode,
		createGraphNote,
		createGraphEdge,
		exportCytoscape,
		createGraphChildNode,
		getGraphNode,
		detachNodeFromParent,
		findNodeAtPosition,
		getParentAncestors,
	} from "./graphutil.js";

	import Node from "./Node.svelte";
	import Edge from "./Edge.svelte";
	import Grid from "./Grid.svelte";
	import Note from "./Note.svelte";
	import ItemEditor from "./ItemEditor.svelte";

	import { onMount } from "svelte";
	import { zoom, zoomIdentity } from "d3-zoom";
	import { select } from "d3-selection";
  import { NodeSearch } from "@themapglobal/themap-ocean.js";

	export let graphjsonpath;
	export let svgForTextBBox;
	export let overrideOptions = {};

	let showAboutBox = false;
	let showHelpBox = false;

	let graph;
	let graphHistory = { versions: [], current: -1 };
	const maxversions = 5;

	let itemsForRender;
	let tagGroups;
	let isInIframe = false;

	$: window.graph = graph;
	$: window.graphHistory = graphHistory;
	$: window.gpa = getParentAncestors;
	$: onlyNodes = graph
		? graph.items
				.filter((i) => i.kind === "node")
				.sort((a, b) => a.label.localeCompare(b.label))
		: [];
	$: itemsForRender = getItemsForRender(graph, selectedItem);
	$: tagGroups = getTagGroups(graph);

	// $: window.d3s = select;

	let currentMouse = {};
	let selectedItem = null;
	let draggingFrom = null;
	let contextMenuPosition = null;

	let svgElement;
	// $: window.svgg = svgElement;
	let topGroupElem;

	let highlighted = [];
	let zoomer;

	// panning and zooming
	$: if (svgElement && topGroupElem) {
		zoomer = zoom().on("zoom", ({ transform }) => {
			select(topGroupElem).attr("transform", transform);
		});
		select(svgElement).call(zoomer);
	}

	// $: console.log(selectedItem?.level)
	function resetZoomAndPan() {
		if (svgElement && topGroupElem) {
			select(svgElement)
				.transition()
				.duration(300)
				.call(zoomer.transform, zoomIdentity.translate(0, 0).scale(1));
		}
	}

	onMount(() => {
    const search = new NodeSearch();
    console.log(search);

		graphjsonpath &&
			fetch(graphjsonpath)
				.then((r) => r.json())
				.then((data) => {
					if (window.overrideOptions.persistLocalStorage) {
						let localStorageValue =
							localStorage.getItem(graphjsonpath);
						graph = localStorageValue
							? layout(
									JSON.parse(localStorageValue),
									null,
									svgForTextBBox
							  )
							: layout(
									Object.assign(data, overrideOptions),
									null,
									svgForTextBBox
							  );
					} else {
						graph = layout(
							Object.assign(data, overrideOptions),
							null,
							svgForTextBBox
						);
					}

					addGraphVersionHistory(graph);
				});
		inIframe();
	});

	function inIframe() {
		if (window.location !== window.parent.location) {
			isInIframe = true;
		}
	}

	function undoGraph() {
		if (graphHistory.current <= 0) return;
		// console.log("undoing");
		graph = structuredClone(
			graphHistory.versions[graphHistory.current - 1]
		);
		reRender();
		graphHistory = {
			versions: graphHistory.versions,
			current: graphHistory.current - 1,
		};
		// console.log(graphHistory);
	}

	function redoGraph() {
		if (graphHistory.current >= graphHistory.versions.length - 1) return;
		// console.log("redoing");
		graph = structuredClone(
			graphHistory.versions[graphHistory.current + 1]
		);
		reRender();
		graphHistory = {
			versions: graphHistory.versions,
			current: graphHistory.current + 1,
		};
		// console.log(graphHistory);
	}

	function addGraphVersionHistory(newgraph) {
		// console.log("adding version");
		let keep = graphHistory.versions.slice(
			graphHistory.versions.length == maxversions ? 1 : 0, // drop the oldest version from history
			graphHistory.current + 1 // new version will create a new branch so redo becomes disabled
		);
		graphHistory = {
			versions: [...keep, structuredClone(newgraph)],
			current: Math.min(graphHistory.current + 1, maxversions - 1),
		};
		// console.log(graphHistory);
	}

	function clearGraph() {
		// console.log("clearing graph");
		graph.items = [];
		contextMenuPosition = null;
		reRender();
		addGraphVersionHistory(graph);
	}

	function reRender(action) {
		// console.log('rerender()', svgForTextBBox)
		svgElement = svgElement;
		topGroupElem = topGroupElem;
		selectedItem = selectedItem;
		graph = layout(graph, selectedItem, svgForTextBBox, action);
		if (window.overrideOptions.persistLocalStorage) {
			localStorage.setItem(graphjsonpath, JSON.stringify(graph));
		}
	}

	function handleItemControlMouseDown(e) {
		// console.log("handleItemControlMouseDown");
		draggingFrom = {
			x: e.detail.rawEvent.clientX,
			y: e.detail.rawEvent.clientY,
		};
		contextMenuPosition = null;
		// create an edge to an orphan node
		// store it in draggingFrom so that mousemove can change it
		let pt1 = svgElement.createSVGPoint();
		pt1.x = draggingFrom.x;
		pt1.y = draggingFrom.y;
		let svgPt1 = pt1.matrixTransform(topGroupElem.getCTM().inverse());
		let toCoords = { x: svgPt1.x, y: svgPt1.y };
		draggingFrom.edge = createGraphEdge(e.detail.source, toCoords, graph);
		// console.log(draggingFrom.edge);
		reRender();
	}

	function handleItemMouseDown(e) {
		// console.log('handleItemMouseDown', e.detail.rawEvent.buttons);

		selectedItem = e.detail.source;

		// to stop mouse events from firing elsewhere
		// e.detail.rawEvent.target.setPointerCapture(e.detail.rawEvent.pointerId);

		draggingFrom = {
			x: e.detail.rawEvent.clientX,
			y: e.detail.rawEvent.clientY,
		};
		contextMenuPosition = null;
	}

	function handleItemMouseUp(e) {
		// console.log('handleItemMouseUp');

		// release pointer lock
		// e.detail.rawEvent.target.releasePointerCapture(e.detail.rawEvent.pointerId);

		selectedItem = e.detail.source;
		if (draggingFrom.edge && selectedItem.kind === "node") {
			draggingFrom.edge.toId = selectedItem.id;
			delete draggingFrom.edge.toOrphan;
		} else if (draggingFrom.edge && selectedItem.kind === "edge") {
			deleteGraphItem(draggingFrom.edge, graph, false);
			addGraphVersionHistory(graph);
		} else if (
			selectedItem?.kind === "node" &&
			!draggingFrom.hasOwnProperty("edge")
		) {
			//dropped a node on top of another
			let pt = svgElement.createSVGPoint();
			pt.x = draggingFrom.x;
			pt.y = draggingFrom.y;
			let svgPt = pt.matrixTransform(topGroupElem.getCTM().inverse());
			let destNode = findNodeAtPosition(svgPt, selectedItem, graph);
			if (
				destNode &&
				(selectedItem.parent != destNode.id) &&
				!getParentAncestors(graph, destNode).map((n) => n.id).includes(selectedItem.id)
			) {
				// prevent cyclic dependency
				console.log(
					"making ",
					selectedItem.label,
					" child of ",
					destNode.label
				);
				selectedItem.parent = destNode.id;
				addGraphVersionHistory(graph);
			}
		}
		draggingFrom = null;
		reRender();
	}

	function handleNodeChanged(e) {
		// console.log("handleNodeChanged");
		// graph = graph;
	}

	function handleItemBadgeClick(e) {
		let item = e.detail.source;
		let indexOfCurrentBadge = graph.theme.badges.indexOf(item.badge);
		let indexOfNextBadge =
			(indexOfCurrentBadge + 1) % graph.theme.badges.length;
		item.badge = graph.theme.badges[indexOfNextBadge];
		reRender();
	}

	function handleItemCollapserClick(e){
		let item = e.detail.source;
		if(item.kind === "node"){
			item.is_collapsed = !item.is_collapsed;
			reRender();
		}
	}

	function deleteItem(item, deleteDependents) {
		deleteGraphItem(item, graph, deleteDependents);
		addGraphVersionHistory(graph);
		selectedItem = null;
		reRender();
		contextMenuPosition = null;
	}

	function handleSvgMouseMove(e) {
		// console.log("mousemove");
		currentMouse = { x: e.clientX, y: e.clientY };
		if (!selectedItem || !draggingFrom || !selectedItem.pos) return;
		if (e.buttons != 1) return; // only process left-click

		if (draggingFrom.edge) {
			// drawing an edge
			// console.log("moving edge")
			let pt1 = svgElement.createSVGPoint();

			// Leave 20px gap for mouse events to work correctly
			pt1.x =
				draggingFrom.x +
				20 * Math.cos(Math.atan2(draggingFrom.y, draggingFrom.x));
			pt1.y =
				draggingFrom.y +
				20 * Math.sin(Math.atan2(draggingFrom.y, draggingFrom.x)) -
				20;

			let svgPt1 = pt1.matrixTransform(topGroupElem.getCTM().inverse());

			draggingFrom.edge.toOrphan = { pos: { x: svgPt1.x, y: svgPt1.y } };
		} else {
			// moving a node

			// move selectedItem along with all its children
			// transform into svg coordinates to handle dragging in zoomed-in/zoomed-out mode correctly
			let pt1 = svgElement.createSVGPoint();
			pt1.x = draggingFrom.x;
			pt1.y = draggingFrom.y;
			let svgPt1 = pt1.matrixTransform(topGroupElem.getCTM().inverse());

			let pt2 = svgElement.createSVGPoint();
			pt2.x = currentMouse.x;
			pt2.y = currentMouse.y;
			let svgPt2 = pt2.matrixTransform(topGroupElem.getCTM().inverse());

			moveGraphNode(
				selectedItem,
				graph,
				svgPt2.x - svgPt1.x,
				svgPt2.y - svgPt1.y
			);

			// TODO: if moved on top of another node, create parent-child relationship
		}

		draggingFrom.x = currentMouse.x;
		draggingFrom.y = currentMouse.y;
		reRender({ kind: "movingitem", item: selectedItem });
	}

	function createNode(e) {
		createGraphNode(e, graph, svgElement, topGroupElem);
		addGraphVersionHistory(graph);
		reRender();
		contextMenuPosition = null;
	}

	function createNote(e) {
		createGraphNote(e, graph, svgElement, topGroupElem);
		reRender();
		contextMenuPosition = null;
	}

	function handleContextMenu(e) {
		// console.log("handleContextMenu");
		if (!graph.contextmenu) return;
		contextMenuPosition = [e.clientX, e.clientY];
	}

	function handleCreateNode(e) {
		console.log("handleCreateNode", e.detail);
		createGraphNodeEdge(e.detail.from, e.detail.handle, graph);
		addGraphVersionHistory(graph);
		reRender();
	}

	function handleKeydown(e) {
		// console.log(e.key, e.keyCode, e.target)
		if (selectedItem && (e.key === "Backspace" || e.key === "Delete")) {
			deleteItem(selectedItem, false);
			addGraphVersionHistory(graph);
		}
	}

	function handleSvgMouseUp(e) {
		// console.log("Svg Mouseup");
		if (draggingFrom?.edge) {
			// remove this edge
			deleteGraphItem(draggingFrom.edge, graph, false);
		}
		draggingFrom = null;
		reRender();
	}

	function handleSvgMouseDown(e) {
		// console.log("Svg MouseDown");
		selectedItem = null;
		if (e.buttons === 1) {
			draggingFrom = { x: e.clientX, y: e.clientY };
			contextMenuPosition = null;
		} else {
			// right-click
		}
	}

	function handleEdgeChanged(e) {
		// console.log("handleEdgeChanged");
		let edge = e.detail.source;
		if (edge) {
			deleteGraphItem(edge, graph, false);
			addGraphVersionHistory(graph);
		}
		reRender();
	}

	function createChildNode(e, item) {
		// console.log("createChildNode", item);
		createGraphChildNode(e, graph, item, svgElement, topGroupElem);
		addGraphVersionHistory(graph);
		reRender();
		contextMenuPosition = null;
	}

	function detachNode(item) {
		detachNodeFromParent(item, graph);
		addGraphVersionHistory(graph);
		reRender();
		contextMenuPosition = null;
	}

	function isAncestorCollapsed(item, graph){
		if(item.kind === "edge"){
			// Hide edge only if both its nodes are hidden
			return isAncestorCollapsed(getGraphNode(item.fromId, graph), graph) && isAncestorCollapsed(getGraphNode(item.toId, graph), graph)
		} else if (item.kind === "note") {
			return false;
		}

		// Now handle nodes
		let parent = item.parent
		while(parent){
			let parentNode = getGraphNode(parent, graph)
			if(!parentNode){
				console.error(`item ${item.label}'s parent ${parent} is missing`);
				return false;
			}
			if(parentNode.is_collapsed){
				return true;
			} else {
				parent = parentNode.parent; // keep checking higher
			}
		}
		return false;
	}

	function getItemsForRender(graph, selectedItem) {
		if (!graph) return [];
		// draw selected edge on the top (at the end)
		if (selectedItem?.kind === "edge")
			return [
				...graph.items
					.sort((a, b) => a.level - b.level)
					.filter((i) => i.id !== selectedItem.id)
					.filter((i) => !isAncestorCollapsed(i, graph)),
				...graph.items.filter((i) => i.id === selectedItem.id),
			];
		else return graph.items.sort((a, b) => a.level - b.level).filter((i) => !isAncestorCollapsed(i, graph));
	}

	function switchTheme(name) {
		graph.theme = themes[name];
		reRender();
	}

	function panToNode(target) {
		// console.log("panning to node: ", target, "value: ", target.value, "cv:" , target.currentValue);
		let node = graph.items.find(
			(i) => i.kind === "node" && i.label === target.value
		);
		select(svgElement)
			.transition()
			.duration(1500)
			.call(
				zoomer.transform,
				zoomIdentity
					.translate(500, 500)
					.scale(1.8)
					.translate(0 - node.pos.x, 0 - node.pos.y)
			);
	}

	function getTagGroups(graph) {
		if (!graph) return Object.entries({});
		// get unique tags
		let tags = graph.items
			.filter((i) => ["node", "edge"].includes(i.kind))
			.map((i) => i.tags)
			.flat()
			.filter((value, index, self) => self.indexOf(value) === index);
		// console.log(tags);
		let groups = tags.reduce((acc, tag) => {
			let group =
				tag.split(":").length > 1 ? tag.split(":")[0] : "ungrouped";
			acc[group] = acc[group] ?? [];
			acc[group].push({ label: tag.split(":").reverse()[0], value: tag });

			return acc;
		}, {});
		return Object.entries(groups);
	}

	function downloadFile(content, name) {
		let element = document.createElement("a");
		element.setAttribute(
			"href",
			"data:text/plain;charset=utf-8," + encodeURIComponent(content)
		);
		element.setAttribute("download", name);
		element.style.display = "none";
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);
	}

	function handleMenu(e) {
		let value = e.detail.item.value;
		if (value.startsWith("theme.")) {
			switchTheme(value.split(".")[1]);
		} else if (value.startsWith("export.")) {
			let kind = value.split(".")[1]; //svg or cytoscape
			if (kind === "svg") {
				downloadFile(svgElement.outerHTML, "graph.svg");
			} else if (kind === "cytoscape") {
				downloadFile(exportCytoscape(graph), "graph-cytoscape.json");
			}
		} else if (value === "openfile") {
			// nothing to do, event listener is on file input
		} else if (value === "savefile") {
			downloadFile(exportJson(graph), "mynetwork.graph");
		} else if (value === "undo") {
			undoGraph();
		} else if (value === "redo") {
			redoGraph();
		} else if (value === "clear") {
			clearGraph();
		} else if (value === "about") {
			showAboutBox = true;
		} else if (value === "help") {
			showHelpBox = true;
		}
	}

	function uploadFile(e) {
		let jsonFile = e.target.files[0];
		let reader = new FileReader();
		reader.readAsText(jsonFile);
		reader.onload = (e) => {
			graph = layout(JSON.parse(e.target.result), null, svgForTextBBox);
			reRender();
		};
	}

	const handle_keydown = (e) => {
		if ((e.metaKey || e.ctrlKey) && e.which === 90) {
			// Z
			e.preventDefault();
			(e.shiftKey ? redoGraph : undoGraph)();
		}
	};
</script>

<svelte:window on:keydown={handle_keydown} />

{#if graph}
	<div class="container">
		<svg
			tabindex="0"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 1000 1000"
			on:mousedown={handleSvgMouseDown}
			on:mousemove={handleSvgMouseMove}
			on:mouseup={handleSvgMouseUp}
			on:contextmenu|preventDefault={handleContextMenu}
			style={`background-color: ${graph.theme.bgfill}`}
			bind:this={svgElement}
			on:keydown={handleKeydown}
		>
			<g bind:this={topGroupElem}>
				<Grid kind={graph.theme.grid} />

				{#each itemsForRender as item (item.id)}
					{#if item.kind === "node"}
						<Node
							{item}
							{graph}
							on:itemMouseDown={handleItemMouseDown}
							on:itemMouseUp={handleItemMouseUp}
							on:itemBadgeClick={handleItemBadgeClick}
							on:itemCollapserClick={handleItemCollapserClick}
							isSelected={item.id === selectedItem?.id}
							on:nodeChanged={handleNodeChanged}
							on:createnode={handleCreateNode}
							on:itemcontrolmousedown={handleItemControlMouseDown}
							theme={graph.theme}
							isHighlighted={highlighted.includes(item.id)}
							isHidden={highlighted.length > 0 &&
								!highlighted.includes(item.id)}
						/>
					{:else if item.kind === "edge"}
						<Edge
							{item}
							{graph}
							on:itemMouseDown={handleItemMouseDown}
							on:itemMouseUp={handleItemMouseUp}
							on:edgeChanged={handleEdgeChanged}
							isSelected={item.id === selectedItem?.id}
						/>
					{:else if item.kind === "note"}
						<Note
							{item}
							theme={graph.theme}
							isSelected={item.id === selectedItem?.id}
							on:itemMouseDown={handleItemMouseDown}
							on:itemMouseUp={handleItemMouseUp}
						/>
					{/if}
				{/each}
			</g>
		</svg>

		{#if isInIframe}
			<div class="alert">
				Please add comments only in the unzoomed, unpanned view.
				<button on:click={resetZoomAndPan}>Reset Zoom</button>
			</div>
		{/if}

		{#if selectedItem}
			<section class="sidepanel">
				<ItemEditor
					{selectedItem}
					{graph}
					on:graphchanged={(e) => {
						graph = layout(e.detail, selectedItem, svgForTextBBox);
						reRender();
					}}
				/>
			</section>
		{/if}

		{#if contextMenuPosition}
			<sl-menu
				class="contextmenu"
				style={`left: ${contextMenuPosition[0]}px; top: ${contextMenuPosition[1]}px;`}
			>
				{#if selectedItem}
					{#if selectedItem.kind === "node"}
						<sl-menu-item
							value="createchildnode"
							on:click={(e) => createChildNode(e, selectedItem)}
							>Create child node</sl-menu-item
						>

						{#if selectedItem.parent}
							<sl-menu-item
								value="detach"
								on:click={(e) => detachNode(selectedItem)}
							>
								Detach &quot;{selectedItem.label}&quot; from
								&quot;{getGraphNode(selectedItem.parent, graph)
									.label}&quot;</sl-menu-item
							>
						{/if}
						<sl-menu-item
							value="deleteitemwithdependents"
							on:click={(e) => deleteItem(selectedItem, true)}
							>Delete &quot;{selectedItem.label}&quot; including
							dependents</sl-menu-item
						>
					{/if}
					<sl-menu-item
						value="deleteitem"
						on:click={(e) => deleteItem(selectedItem, false)}
						>Delete &quot;{selectedItem.label}&quot; {#if ["node", "edge"].includes(selectedItem.kind)}leaving
							orphans{/if}</sl-menu-item
					>
				{:else}
					<sl-menu-item value="createnode" on:click={createNode}
						>Create new Node</sl-menu-item
					>
					<sl-menu-item value="createnote" on:click={createNote}
						>Create new Text Note</sl-menu-item
					>
					<sl-menu-item value="cleargraph" on:click={clearGraph}
						>Clear Graph</sl-menu-item
					>
				{/if}
			</sl-menu>
		{/if}
	</div>

	<section class="globalmenu">
		<sl-button-group>
			<sl-dropdown on:sl-select={handleMenu}>
				<sl-button slot="trigger" caret>
					Menu
					<sl-icon slot="prefix" name="list" />
				</sl-button>
				<sl-menu>
					{#if graph.jsonupload}
						<sl-menu-item value="openfile">
							<input
								type="file"
								name="uploader"
								accept=".graph"
								on:change={(e) => uploadFile(e)}
							/>
							<sl-icon slot="prefix" name="folder2-open" />
						</sl-menu-item>
					{/if}
					{#if graph.jsondownload}
						<sl-menu-item value="savefile">
							Save as .graph file...
							<sl-icon slot="prefix" name="download" />
						</sl-menu-item>
					{/if}
					<sl-divider />
					<sl-menu-item
						value="undo"
						disabled={graphHistory.current <= 0}
					>
						Undo (⌘-Z or ⌃Z)
						<sl-icon slot="prefix" name="arrow-counterclockwise" />
					</sl-menu-item>
					<sl-menu-item
						value="redo"
						disabled={graphHistory.versions[
							graphHistory.current + 1
						] === undefined}
					>
						Redo (⇧-⌘-Z or ⇧⌃Z)
						<sl-icon slot="prefix" name="arrow-clockwise" />
					</sl-menu-item>
					<sl-menu-item
						value="clear"
						disabled={graph.items.length == 0}>Clear</sl-menu-item
					>
					<sl-divider />
					<sl-menu-label>Export as:</sl-menu-label>
					{#if graph.exportsvg}
						<sl-menu-item value="export.svg">SVG</sl-menu-item>
					{/if}
					{#if graph.exportcytoscape}
						<sl-menu-item value="export.cytoscape"
							>Cytoscape JSON</sl-menu-item
						>
					{/if}
					<sl-divider />
					<sl-menu-label>Switch Theme To</sl-menu-label>
					<sl-menu-item
						value="theme.classic"
						checked={graph.theme.name === "classic"}
						>Classic</sl-menu-item
					>
					<sl-menu-item
						value="theme.elegant"
						checked={graph.theme.name === "elegant"}
						>Elegant</sl-menu-item
					>
					<sl-menu-item
						value="theme.foresight"
						checked={graph.theme.name === "foresight"}
						>Foresight</sl-menu-item
					>
					<sl-menu-item
						value="theme.minimal"
						checked={graph.theme.name === "minimal"}
						>Minimal</sl-menu-item
					>
					<sl-divider />
					<sl-menu-item value="about">About Grapher...</sl-menu-item>
					<sl-menu-item value="help">Help...</sl-menu-item>
				</sl-menu>
			</sl-dropdown>

			{#if graph}
				<fluent-combobox
					autocomplete="both"
					placeholder="Jump to node"
					on:change={(e) => panToNode(e.target)}
				>
					{#each onlyNodes as node (node.id)}
						<fluent-option value={node.id}
							>{node.label}</fluent-option
						>
					{/each}
				</fluent-combobox>
			{/if}

			<sl-select
				placeholder="Highlight by Tag"
				clearable
				on:sl-change={(e) =>
					(highlighted = graph.items
						.filter(
							(i) =>
								i.kind === "node" &&
								i.tags.includes(e.target.value)
						)
						.map((i) => i.id))}
			>
				{#each tagGroups as group (group[0])}
					<sl-menu-label>{group[0]}</sl-menu-label>
					{#each group[1] as tag (tag.value)}
						<sl-menu-item value={tag.value}
							>{tag.label}</sl-menu-item
						>
					{/each}
					<sl-divider />
				{/each}
			</sl-select>
		</sl-button-group>
	</section>
{/if}

<sl-dialog
	open={showAboutBox}
	on:sl-hide={(e) => (showAboutBox = false)}
	on:sl-show={(e) => (showAboutBox = true)}
	label="About Grapher"
	class="dialog-overview"
>
	<p>
		This tool was created by <a
			href="https://github.com/nileshtrivedi"
			target="_blank">@nileshtrivedi</a
		>
		while being supported by
		<a href="https://foresight.org/tech-tree/" target="_blank"
			>The Foresight Institute</a
		>
		who is using it for their
		<a
			href="https://github.com/foresight-org/LongevityTechTree"
			target="_blank"
			>Nanotech, Neurotech, Healthspan, Space and Intelligent Cooperation
			tech trees</a
		>.
	</p>

	<p>
		The code for this tool is <a
			href="https://codeberg.org/nilesh/grapher"
			target="_blank">available as open-source</a
		>.
	</p>

	<sl-button
		slot="footer"
		variant="primary"
		on:click={(e) => (showAboutBox = false)}>Close</sl-button
	>
</sl-dialog>

<sl-dialog
	open={showHelpBox}
	on:sl-hide={(e) => (showHelpBox = false)}
	on:sl-show={(e) => (showHelpBox = true)}
	label="Help"
	class="dialog-overview"
>
	<ul>
		<li>
			<b>To create a new node</b>: Right-click on empty area and select
			"Create New Node".
		</li>
		<li>
			<b>To create an edge</b>: Select source node by left-click, drag
			from one of the control points: ⊕ and release when on top of target
			node.
		</li>
		<li>
			<b>To create both a new node and an edge</b>: Select source-node and
			left-click on any of the control points: ⊕.
		</li>
		<li>
			<b>To create a child node</b>: Right-click on the parent node and
			choose "Create child node".
		</li>
		<li>
			<b>To make one node child of another</b>: Drag it and drop it on
			parent node.
		</li>
		<li>
			<b>To delete node</b>: Right-click on the node and choose "Delete"
			either "including dependents" or "leaving orphans".
		</li>
		<li>
			<b>To detach child node from its parent</b>: Right-click on the
			child node and choose "Detach _ from _".
		</li>
		<li>
			<b>To add a comment on the graph</b>: Right-click on empty area and
			choose "Create New Text Note".
		</li>
	</ul>
	<sl-button
		slot="footer"
		variant="primary"
		on:click={(e) => (showHelpBox = false)}>Close</sl-button
	>
</sl-dialog>

<style>
	.container {
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
		background-color: #e3e3e3;
		border: 3px solid #666;

		width: 300px;
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

	sl-menu.contextmenu {
		position: fixed;
		z-index: 20;
		max-width: 440px;
	}
	.alert {
		position: fixed;
		top: 0;
		left: 50%;
		transform: translateX(-50%);
		padding: 10px;
		background-color: #fee2e2;
		color: #b91c1c;
		border: 1px solid #b91c1c;
	}
</style>
