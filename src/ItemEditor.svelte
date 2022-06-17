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
	<a class="itemlink" href={selectedItem.link} target="_blank">See more at {selectedItem.link}</a>

	{#if selectedItem.kind === 'node' && getGraphNode(selectedItem.parent, graph)}
	<button on:click={detachFromParent}>Detach from &quot;{getGraphNode(selectedItem.parent, graph).label}&quot;</button>
	{/if}

	<div class="table">
	{#each ['number_id','text_label', 'text_desc', 'url_link', 'tags_tags', 'number_parent', 'color_fill', 'color_stroke', 'text_strokeType', 'checkbox_directed', 'number_weight', 'text_shape', 'json_custom'].filter(f => (f === 'json_custom' && graph.customjson) || Object.keys(selectedItem).includes(f.split("_")[1])) as field (field)}
	<div class="row">
		<span><strong>{field.split("_")[1]}</strong></span>
		{#if field === 'text_strokeType'}
		<select on:change={e => handleInputChange(e, field)}>
			<option value="solid" selected={selectedItem[field.split("_")[1]] === 'solid'}>solid</option>
			<option value="dashed" selected={selectedItem[field.split("_")[1]] === 'dashed'}>dashed</option>
		</select>
		{:else if field === 'text_shape'}
		<select on:change={e => handleInputChange(e, field)}>
			<option value="straight" selected={selectedItem[field.split("_")[1]] === 'straight'}>straight</option>
			<option value="curved" selected={selectedItem[field.split("_")[1]] === 'curved'}>curved</option>
			<option value="ortho" selected={selectedItem[field.split("_")[1]] === 'ortho'}>ortho</option>
		</select>
		{:else if field.startsWith('tags')}
		  <TagsInput tags={selectedItem[field.split("_")[1]]} on:tagschanged={e => { selectedItem[field.split("_")[1]] = e.detail.value; graph = graph; dispatch('graphchanged', graph) }}/>
		{:else if field === 'text_desc'}
			<sl-textarea 
				placeholder="Description..."
				size="small"
				resize="auto"
				on:sl-input={e => handleInputChange(e, field)}
				value={selectedItem[field.split("_")[1]]}
			>
			</sl-textarea>
		{:else if field.startsWith('checkbox')}
		<input 
			type='checkbox' 
			on:change={e => handleInputChange(e, field)}
			checked={selectedItem[field.split("_")[1]]}
		>
		{:else if field.startsWith('json')}
			<JSONEditor content={{json: selectedItem[field.split("_")[1]] || {}}} onChange={handleJsonChange} />
		{:else if field === 'color_fill' || field === 'color_stroke'}
			<sl-color-picker format="hex" size="small" 
				value={selectedItem[field.split("_")[1]]} 
				label={`Select a ${field}`}
				on:sl-change={e => handleInputChange(e, field)}
			>
			</sl-color-picker>
		{:else}
		<input 
			type={field.split("_")[0]} 
			value={selectedItem[field.split("_")[1]]} 
			on:input={e => handleInputChange(e, field)}
		>
		{/if}
	</div>
	{/each}
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
		width: 190px;
	}

	div.row input[type=checkbox] {
		text-align: left;
		height: 34px;
	}

	div.row sl-textarea {
		width: 190px;
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