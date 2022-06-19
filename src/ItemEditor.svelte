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
        graph = graph;
        dispatch('graphchanged', graph);
    }

	function handleJsonChange(updatedContent, previousContent, patchResult){
		selectedItem.custom = updatedContent.json;
		graph = graph;
		dispatch('graphchanged', graph);
	}

	function detachFromParent(){
		detachNodeFromParent(selectedItem, graph)
		graph = graph;
        dispatch('graphchanged', graph);
	}
</script>

{#if selectedItem}
	<h1>{selectedItem.label}</h1>
	<!-- <p>{selectedItem.kind === 'edge' ? `from ${getGraphNode(selectedItem.fromId, graph)?.label} to ${getGraphNode(selectedItem.toId, graph)?.label}` : `${selectedItem.children.length} children`}</p> -->

	<p class="itemdesc">{selectedItem.desc}</p>
	
	{#if selectedItem.link && selectedItem.link.toString().length > 0}
	<a class="itemlink" href={selectedItem.link} target="_blank">See more at {selectedItem.link}</a>
	{/if}

	{#if selectedItem.kind === 'node' && getGraphNode(selectedItem.parent, graph)}
	<button on:click={detachFromParent}>Detach from &quot;{getGraphNode(selectedItem.parent, graph).label}&quot;</button>
	{/if}

	<div class="table">
		<div class="row">
			<span><strong>id</strong></span>
			<input 
				type='number' 
				value={selectedItem.id} 
				on:input={e => handleInputChange(e, 'number_id')}
			>
		</div>
		
		<div class="row">
			<span><strong>label</strong></span>
			<input 
				type='text' 
				value={selectedItem.label} 
				on:input={e => handleInputChange(e, 'text_label')}
			>
		</div>
		
		<div class="row">
			<span><strong>desc</strong></span>
			<sl-textarea 
				placeholder="Description..."
				size="small"
				resize="auto"
				on:sl-input={e => handleInputChange(e, 'text_desc')}
				value={selectedItem.desc}
			>
			</sl-textarea>
		</div>
		
		<div class="row">
			<span><strong>link</strong></span>
			<input 
				type='url' 
				value={selectedItem.link} 
				on:input={e => handleInputChange(e, 'url_link')}
			>
		</div>
		
		<div class="row">
			<span><strong>tags</strong></span>
			<TagsInput tags={selectedItem.tags} on:tagschanged={e => { selectedItem.tags = e.detail.value; graph = graph; dispatch('graphchanged', graph) }}/>
		</div>
			
		{#if selectedItem.kind === 'node'}
			<div class="row">
			<span><strong>fill</strong></span>
			<sl-color-picker format="hex" size="small" 
				value={selectedItem.fill} 
				label={`Select fill color`}
				on:sl-change={e => handleInputChange(e, 'color_fill')}
			>
			</sl-color-picker>
			</div>

			<div class="row">
			<span><strong>Border Color</strong></span>
			<sl-color-picker format="hex" size="small" 
				value={selectedItem.bordercolor} 
				label={`Select border color`}
				on:sl-change={e => handleInputChange(e, 'color_bordercolor')}
			>
			</sl-color-picker>
			</div>

			<div class="row">
			<span><strong>Label Color</strong></span>
			<sl-color-picker format="hex" size="small" 
				value={selectedItem.labelcolor} 
				label={`Select label color`}
				on:sl-change={e => handleInputChange(e, 'color_labelcolor')}
			>
			</sl-color-picker>
			</div>
		{:else if selectedItem.kind === 'edge'} <!-- edge -->
			<div class="row">
			<span><strong>directed</strong></span>
			<input 
				type='checkbox' 
				on:change={e => handleInputChange(e, 'checkbox_directed')}
				checked={selectedItem.directed}
			/>
			</div>

			<div class="row">
			<span><strong>weight</strong></span>
			<input 
				type='number' 
				step="1"
				min="1"
				value={selectedItem.weight} 
				on:input={e => handleInputChange(e, 'number_weight')}
			/>
			</div>

			<div class="row">
			<span><strong>shape</strong></span>
			<select value={selectedItem.shape} placeholder="Select shape" on:change={e => handleInputChange(e, 'text_shape')}>
				<option value="straight" selected={selectedItem.shape === 'straight'}>straight</option>
				<option value="curved" selected={selectedItem.shape === 'curved'}>curved</option>
				<option value="ortho" selected={selectedItem.shape === 'ortho'}>ortho</option>
			</select>
			</div>

			<div class="row">
				<span><strong>stroke</strong></span>
				<sl-color-picker format="hex" size="small" 
					value={selectedItem.stroke} 
					label={`Select stroke color`}
					on:sl-change={e => handleInputChange(e, 'color_stroke')}
				>
				</sl-color-picker>
			</div>
			
			<div class="row">
			<span><strong>strokeType</strong></span>
			<select value={selectedItem.strokeType} placeholder="Select strokeType" on:change={e => handleInputChange(e, 'text_strokeType')}>
				<option value="solid" selected={selectedItem.strokeType === 'solid'}>solid</option>
				<option value="dashed" selected={selectedItem.strokeType === 'dashed'}>dashed</option>
				<option value="dotted" selected={selectedItem.strokeType === 'dotted'}>dotted</option>
			</select>
			</div>
		{/if}

		{#if graph.customjson}
		<div class="row">
			<span><strong>custom</strong></span>
			<JSONEditor content={{json: selectedItem.custom || {}}} onChange={handleJsonChange} />
		</div>
		{/if}

	</div>
{/if}

<style>
	div.table { 
		display: flex;
		flex-direction: column;
		margin-top: 30px;
	}

	div.row { 
		display: flex;
		flex-direction: row;
	}

	div.row span {
		width: 100px;
		text-align: right;
		padding-top: 8px;
		margin-right: 4px;
	}

	div.row input[type=text], div.row input[type=number], div.row input[type=url] {
		width: 280px;
	}

	div.row input[type=checkbox] {
		text-align: left;
		height: 34px;
	}

	div.row sl-textarea {
		width: 280px;
		margin-bottom: 10px;
	}

	p.itemdesc {
		font-size: 14px;
		color: #888;
	}

	a.itemlink {
		font-size: 16px;
	}
</style>