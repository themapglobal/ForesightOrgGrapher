<script>
    export let selectedItem;
    export let graph;
	let showLitReview = false;

	import { JSONEditor } from 'svelte-jsoneditor';
	import { marked } from "marked";
	import TagsInput from "./TagsInput.svelte";
	import { getAncestors } from "./graphutil.js";

    import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	const swatch_colors = [ '#d0021bff', '#f5a623ff', '#bbae0eff', '#8b572aff', '#7ed321ff', '#417505ff', '#b00b0bff', '#9013feff', '#4a90e2ff', '#16b591ff', '#b8e986ff', '#000000ff', '#444444ff', '#888888ff', '#ccccccff', '#ffffffff' ]

	function handleInputChange(e, field){
		if(field.split("_")[0] == 'text' || field.split("_")[0] == 'color' || field.split("_")[0] == 'url'){
			selectedItem[field.split("_")[1]] = e.target.value;
		} else if( field.split("_")[0] == 'number'){
			selectedItem[field.split("_")[1]] = e.target.value === '' ? null : JSON.parse(e.target.value);
		} else if( field.split("_")[0] == 'checkbox'){
			selectedItem[field.split("_")[1]] = e.target.checked;
		} else {
			selectedItem[field.split("_")[1]] = JSON.parse(e.target.value); 
		}
        dispatch('graphchanged', graph);
    }

	function handleJsonChange(updatedContent, previousContent, patchResult){
		selectedItem.custom = updatedContent.json;
		dispatch('graphchanged', graph);
	}

	$: ancestors = getAncestors(graph, selectedItem, 0);

</script>

	{#if ["node","edge", "note"].includes(selectedItem?.kind)}
		<h1>
			{selectedItem.label}
			{#if ["node"].includes(selectedItem?.kind)}
			<sl-button variant="default" size="small" circle on:click={e => showLitReview = true}>
				<sl-icon name="gear" label="Settings"></sl-icon>
			</sl-button>
			{/if}
		</h1>

		{#if ["node", "edge"].includes(selectedItem?.kind)}
		<p class="itemdesc">{@html marked(selectedItem.desc)}</p>
		{/if}
	{/if}
	

	<div class="node-panel">
		<!-- <sl-input 
			label="ID" type='number' size="small"
			value={selectedItem.id} 
			on:input={e => handleInputChange(e, 'number_id')}>
		</sl-input> -->

		
		<sl-input 
			label="Label" type='text' size="small"
			value={selectedItem.label} 
			on:sl-change={e => handleInputChange(e, 'text_label')}>
		</sl-input>	

		{#if selectedItem.kind === 'node' || selectedItem.kind === 'note'}
		<sl-textarea 
			label="Notes" placeholder="Notes (these will be shown in the graph)..."
			size="small"
			on:sl-change={e => handleInputChange(e, 'text_notes')}
			value={selectedItem.notes}> 
		</sl-textarea>
		{/if}

		{#if selectedItem.kind !== 'note'}
			<sl-textarea 
				label="Description" placeholder="Description in markdown..."
				size="small"
				on:sl-change={e => handleInputChange(e, 'text_desc')}
				value={selectedItem.desc}> 
					<p slot="help-text"><a href="https://www.markdownguide.org/cheat-sheet/" target="_blank">Learn about MarkDown</a></p>
			</sl-textarea>
		

			<TagsInput tags={selectedItem.tags} on:tagschanged={e => { selectedItem.tags = e.detail.value; dispatch('graphchanged', graph) }}/>
		{/if}
		
		{#if selectedItem.kind === 'node'}
		<sl-select 
			label="Badge" clearable value={selectedItem.badge} 
			placeholder="Select badge" 
			on:sl-change={e => handleInputChange(e, 'text_badge')}>
			{#if selectedItem.badge?.startsWith("http")}
				<img width="30" height="28" alt="badge" src={selectedItem.badge} slot="prefix"/>
			{/if}
			{#each graph.theme.badges as badge}
			<sl-menu-item value={badge} selected={selectedItem.badge === badge}>
				{#if badge.startsWith("http")}
				<img width="30" height="28" alt="badge" src={badge} class="http-badge"/>
				{:else}
				{badge}
				{/if}
			</sl-menu-item>
			{/each}
		</sl-select>
		{/if}
	</div>

		
		{#if selectedItem.kind === 'node' || selectedItem.kind === 'note'}
		<div class="node-colors">
			<div class="node-color">				
				<sl-color-picker format="hex" size="small" 
					value={selectedItem.fill} 
					label={`Select fill color`}
					opacity
					swatches={swatch_colors}
					on:sl-change={e => handleInputChange(e, 'color_fill')}
				>
				</sl-color-picker>
				<span>Fill</span>
			</div>

			<div class="node-color">				
				<sl-color-picker format="hex" size="small" 
					value={selectedItem.bordercolor} 
					label={`Select border color`}
					opacity
					swatches={swatch_colors}
					on:sl-change={e => handleInputChange(e, 'color_bordercolor')}
				>
				</sl-color-picker>
				<span>Border</span>
			</div>

			<div class="node-color">	
				<sl-color-picker format="hex" size="small" 
					value={selectedItem.labelcolor} 
					label={`Select label color`}
					opacity
					swatches={swatch_colors}
					on:sl-change={e => handleInputChange(e, 'color_labelcolor')}
				>
				</sl-color-picker>
				<span>Label</span>
			</div>
		</div>	
		
		<div class="node-colors">
			<sl-input 
				label="Label Font Size" type='number' size="small" placeholder="16" min="12" max="32" step="1"
				value={selectedItem.nodelabelfontsize || graph.theme.nodelabelfontsize || 16} 
				on:input={e => handleInputChange(e, 'number_nodelabelfontsize')}>
			</sl-input>

			<sl-input 
				label="Notes Font Size" type='number' size="small" placeholder="16" min="12" max="32" step="1"
				value={selectedItem.nodenotesfontsize || graph.theme.nodenotesfontsize || 16} 
				on:input={e => handleInputChange(e, 'number_nodenotesfontsize')}>
			</sl-input>
		</div>


		{:else if selectedItem.kind === 'edge'} <!-- edge -->
		<div class="edge-panel">
			<sl-checkbox 
				style="width:100%;"
				on:sl-change={e => handleInputChange(e, 'checkbox_directed')}
				checked={selectedItem.directed}>
				Directed
			</sl-checkbox>

			<div class="edge-stroke">	
				<sl-color-picker
					format="hex" size="small" 
					value={selectedItem.stroke} 
					label={`Select stroke color`}
					opacity
					swatches={swatch_colors}
					on:sl-change={e => handleInputChange(e, 'color_stroke')}
				>
				</sl-color-picker>
				<span class="title">Stroke</span>
			</div>

			<sl-input 
				label="Weight" type="number"
				value={selectedItem.weight} 
				on:sl-change={e => handleInputChange(e, 'number_weight')}>
			</sl-input>

			<sl-select 
				
				label="Shape" value={selectedItem.shape} 
				placeholder="Select shape" 
				on:sl-change={e => handleInputChange(e, 'text_shape')}>
				<sl-menu-item value="straight" selected={selectedItem.shape === 'straight'}>straight</sl-menu-item>
				<sl-menu-item value="curved" selected={selectedItem.shape === 'curved'}>curved</sl-menu-item>
				<sl-menu-item value="ortho" selected={selectedItem.shape === 'ortho'}>ortho</sl-menu-item>
			</sl-select>

			<sl-select 
			
				label="StrokeType" value={selectedItem.strokeType} 
			  placeholder="Select strokeType" 
				on:sl-change={e => handleInputChange(e, 'text_strokeType')}>
				<sl-menu-item value="solid" selected={selectedItem.strokeType === 'solid'}>solid</sl-menu-item>
				<sl-menu-item value="dashed" selected={selectedItem.strokeType === 'dashed'}>dashed</sl-menu-item>
				<sl-menu-item value="dotted" selected={selectedItem.strokeType === 'dotted'}>dotted</sl-menu-item>
			</sl-select>

			
		</div>		
		{/if}

		{#if graph.customjson && (selectedItem.kind === 'node' || selectedItem.kind === 'edge')}
		<div class="row">
			<span><strong>custom</strong></span>
			<JSONEditor content={{json: selectedItem.custom || {}}} onChange={handleJsonChange} />
		</div>
		{/if}

		{#if ["node"].includes(selectedItem?.kind)}
		<sl-dialog label="Literature Review for {selectedItem.label}" style="--width: 50vw;" open={showLitReview} on:sl-hide={e => showLitReview = false}>
			<p class="itemdesc">{@html marked(selectedItem.desc)}</p>
			{#each ancestors as anc1}
			<div class="details-group-example">
				<sl-details summary={anc1.node.label} open>
					<!-- <summary>{anc1.node.label}</summary> -->
					{#if anc1.node.desc}
					<p class="itemdesc">{@html marked(anc1.node.desc)}</p>
					{/if}
					{#each anc1.parents as anc2}
					<sl-details summary={anc2.node.label}>
						<!-- <summary>{anc2.node.label}</summary> -->
						{#if anc2.node.desc}
						<p class="itemdesc">{@html marked(anc2.node.desc)}</p>
						{/if}
						{#each anc2.parents as anc3}
						<sl-details summary={anc2.node.label}>
							<!-- <summary>{anc3.node.label}</summary> -->
							{#if anc3.node.desc}
							<p class="itemdesc">{@html marked(anc3.node.desc)}</p>
							{/if}
						</sl-details>
						{/each}
					</sl-details>
					{/each}
				</sl-details>
			</div>
			{/each}
			<sl-button slot="footer" variant="primary" on:click={e => showLitReview = false}>Close</sl-button>
		</sl-dialog>
		{/if}


<style>
	h1 {
		text-align: center;
	}
	.node-panel, .edge-panel{
		width: 90%; 
		margin:20px auto;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	div.node-colors { 
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 10px;
		width: 90%;
		margin: 30px auto;
	}

	div.node-color { 
		display: flex;
		flex-direction: column;
		align-items: center;
		border: 1px solid #ccc;
		border-radius: 5px;
		padding: 8px;
		background-color: whitesmoke;
	}

	div.node-color span {
		width: 60px;
		text-align: center;
	}

	
	div.edge-stroke{
		display: flex;
		align-items: center;
		gap:5px;
		font-size: 16px;
	}
	.title{
		grid-column: 1/3;
		text-align: end;
	}
	
	.itemdesc{
		padding: 10px 30px;
	}

	p.itemdesc {
		font-size: 14px;
		color: #888;
	}

	.http-badge{
		display: flex;
		justify-self: center;
	}
	/* details {
		padding-left: 15px;;
	} */

	
	
</style>