<script>
	import {getGraphNode, detachNodeFromParent} from "./graphutil.js"
    export let selectedItem;
    export let graph;
	import { JSONEditor } from 'svelte-jsoneditor';
	import TagsInput from "./TagsInput.svelte";
    import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

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

	function detachFromParent(){
		detachNodeFromParent(selectedItem, graph)
        dispatch('graphchanged', graph);
	}

</script>

	<h1>{selectedItem.label}</h1>
	<!-- <p>{selectedItem.kind === 'edge' ? `from ${getGraphNode(selectedItem.fromId, graph)?.label} to ${getGraphNode(selectedItem.toId, graph)?.label}` : `${selectedItem.children.length} children`}</p> -->


	<p class="itemdesc">{selectedItem.desc}</p>
	
	{#if selectedItem.link && selectedItem.link.toString().length > 0}
	<a class="itemlink" href={selectedItem.link} target="_blank">See more at {selectedItem.link}</a>
	{/if}

	{#if selectedItem.kind === 'node' && getGraphNode(selectedItem.parent, graph)}
	<p class="detachBtn"><button on:click={detachFromParent}>Detach from &quot;{getGraphNode(selectedItem.parent, graph).label}&quot;</button></p>
	{/if}

	<div class="node-panel">
		<sl-input 
			label="ID" type='number' size="small"
			value={selectedItem.id} 
			on:input={e => handleInputChange(e, 'number_id')}>
		</sl-input>

		
		<sl-input 
			label="Label" type='text' size="small"
			value={selectedItem.label} 
			on:input={e => handleInputChange(e, 'text_label')}>
		</sl-input>	

		{#if selectedItem.kind === 'node'}
		<sl-textarea 
			label="Notes" placeholder="Notes (these will be shown in the graph)..."
			size="small"
			on:sl-input={e => handleInputChange(e, 'text_notes')}
			value={selectedItem.notes}> 
		</sl-textarea>
		{/if}

		<sl-textarea 
			label="Description" placeholder="Desc..."
			size="small"
			on:sl-input={e => handleInputChange(e, 'text_desc')}
			value={selectedItem.desc}> 
		</sl-textarea>

		<sl-input 
			label="Link" type='url' size="small"
			value={selectedItem.link} 
			on:input={e => handleInputChange(e, 'url_link')}>
		</sl-input>

		<TagsInput tags={selectedItem.tags} on:tagschanged={e => { selectedItem.tags = e.detail.value; dispatch('graphchanged', graph) }}/>
		
		{#if selectedItem.kind === 'node'}
		<sl-select 
			label="Badge" clearable value={selectedItem.badge} 
			placeholder="Select badge" 
			on:sl-change={e => handleInputChange(e, 'text_badge')}>
			{#each graph.theme.badges as badge}
			<sl-menu-item value={badge} selected={selectedItem.badge === badge}>{badge}</sl-menu-item>
			{/each}
		</sl-select>
		{/if}
	</div>

	<div class="table">		
		{#if selectedItem.kind === 'node'}

			<div class="row">				
				<sl-color-picker format="hex" size="small" 
					value={selectedItem.fill} 
					label={`Select fill color`}
					on:sl-change={e => handleInputChange(e, 'color_fill')}
				>
				</sl-color-picker>
				<span><strong>Fill</strong></span>
			</div>

			<div class="row">				
				<sl-color-picker format="hex" size="small" 
					value={selectedItem.bordercolor} 
					label={`Select border color`}
					on:sl-change={e => handleInputChange(e, 'color_bordercolor')}
				>
				</sl-color-picker>
				<span><strong>Border</strong></span>
			</div>

			<div class="row">	
				<sl-color-picker format="hex" size="small" 
					value={selectedItem.labelcolor} 
					label={`Select label color`}
					on:sl-change={e => handleInputChange(e, 'color_labelcolor')}
				>
				</sl-color-picker>
				<span><strong>Label</strong></span>
			</div>

		{:else if selectedItem.kind === 'edge'} <!-- edge -->
		<div class="edge-table">
			<div class="edge-row">
				<span><strong>directed</strong></span>
				<input 
					type='checkbox' 
					on:change={e => handleInputChange(e, 'checkbox_directed')}
					checked={selectedItem.directed}
				/>
			</div>

			<div class="edge-row">
				<span><strong>weight</strong></span>
				<input 
					type='number' 
					step="1"
					min="1"
					value={selectedItem.weight} 
					on:input={e => handleInputChange(e, 'number_weight')}
				/>
			</div>

			<div class="edge-row">
				<span><strong>shape</strong></span>
				<select value={selectedItem.shape} placeholder="Select shape" on:change={e => handleInputChange(e, 'text_shape')}>
					<option value="straight" selected={selectedItem.shape === 'straight'}>straight</option>
					<option value="curved" selected={selectedItem.shape === 'curved'}>curved</option>
					<option value="ortho" selected={selectedItem.shape === 'ortho'}>ortho</option>
				</select>
			</div>

			<div class="edge-row">
				<span><strong>stroke</strong></span>
				<sl-color-picker format="hex" size="small" 
					value={selectedItem.stroke} 
					label={`Select stroke color`}
					on:sl-change={e => handleInputChange(e, 'color_stroke')}
				>
				</sl-color-picker>
			</div>
			
			<div class="edge-row">
				<span><strong>strokeType</strong></span>
				<select value={selectedItem.strokeType} placeholder="Select strokeType" on:change={e => handleInputChange(e, 'text_strokeType')}>
					<option value="solid" selected={selectedItem.strokeType === 'solid'}>solid</option>
					<option value="dashed" selected={selectedItem.strokeType === 'dashed'}>dashed</option>
					<option value="dotted" selected={selectedItem.strokeType === 'dotted'}>dotted</option>
				</select>
			</div>
		</div>	
		{/if}

		{#if graph.customjson}
		<div class="row">
			<span><strong>custom</strong></span>
			<JSONEditor content={{json: selectedItem.custom || {}}} onChange={handleJsonChange} />
		</div>
		{/if}

	</div>

<style>
	h1, .detachBtn{
		text-align: center;
	}
	.node-panel{
		width: 80%; 
		margin:0 auto;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	div.table { 
		display: flex;
		margin-top: 30px;
		margin-bottom: 20px;
		justify-content: center;
		align-items: center;
		gap: 10px;
	}

	div.row { 
		display: flex;
		flex-direction: column;
		align-items: center;
		border: 1px solid #ccc;
		border-radius: 5px;
		padding: 8px;
		background-color: whitesmoke;
	}

	div.row span {
		width: 60px;
		text-align: center;
	
	}
	div.edge-table{
		display: flex;
		flex-direction: column;
	}

	p.itemdesc {
		font-size: 14px;
		color: #888;
	}

	a.itemlink {
		font-size: 16px;
	}
</style>