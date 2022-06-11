<script>
    export let selectedItem;
    export let graph;
    import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

    function handleInputChange(e, field){
		if(field.split("_")[0] == 'text' || field.split("_")[0] == 'color'){
			selectedItem[field.split("_")[1]] = e.target.value
		} else if( field.split("_")[0] == 'checkbox'){
			selectedItem[field.split("_")[1]] = e.target.checked
		} else {
			selectedItem[field.split("_")[1]] = JSON.parse(e.target.value); 
		}
        graph = graph;
        dispatch('graphchanged', graph);
    }
</script>

{#if selectedItem}
	<h1>{selectedItem.kind}: {selectedItem.label}</h1>

	<div class="table">
	{#each ['number_id','text_label', 'number_parent', 'color_fill', 'color_stroke', 'text_strokeType', 'checkbox_directed', 'number_weight', 'number_fromHandle', 'number_toHandle', 'text_shape'].filter(f => Object.keys(selectedItem).includes(f.split("_")[1])) as field (field)}
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
		{:else if field === 'number_fromHandle' || field === 'number_toHandle'}
		<select on:change={e => handleInputChange(e, field)}>
			<option value="11" selected={selectedItem[field.split("_")[1]] === 11}>top-left</option>
			<option value="12" selected={selectedItem[field.split("_")[1]] === 12}>mid-left</option>
			<option value="13" selected={selectedItem[field.split("_")[1]] === 13}>bottom-left</option>
			<option value="21" selected={selectedItem[field.split("_")[1]] === 21}>top-mid</option>
			<option value="22" selected={selectedItem[field.split("_")[1]] === 22}>mid-mid</option>
			<option value="23" selected={selectedItem[field.split("_")[1]] === 23}>bottom-mid</option>
			<option value="31" selected={selectedItem[field.split("_")[1]] === 31}>top-right</option>
			<option value="32" selected={selectedItem[field.split("_")[1]] === 32}>mid-right</option>
			<option value="33" selected={selectedItem[field.split("_")[1]] === 33}>bottom-right</option>
		</select>
		{:else if field.startsWith('checkbox')}
		<input 
			type='checkbox' 
			on:change={e => handleInputChange(e, field)}
			checked={selectedItem[field.split("_")[1]]}
		>
		{:else}
		<input 
			type={field.split("_")[0]} 
			value={selectedItem[field.split("_")[1]]} 
			on:input={e => handleInputChange(e, field)}
			readonly={field==='number_parent'}
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
		margin-top: 20px;
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

	div.row input[type=text], div.row input[type=number] {
		width: 190px;
	}

	div.row input[type=checkbox] {
		text-align: left;
		height: 34px;
	}
</style>