<script>
    export let selectedItem;
    export let graph;
    import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

    function handleInputChange(e, field){
        // console.log(e.target);
        selectedItem[field.split("_")[1]] = field.split("_")[0] == 'text' ? e.target.value : JSON.parse(e.target.value); 
        graph = graph;
        dispatch('graphchanged', graph);
    }
</script>

{#if selectedItem}
	<h1>{selectedItem.kind}: {selectedItem.label}</h1>

	<div class="table">
	{#each ['number_id','text_label', 'text_fill', 'text_stroke', 'checkbox_directed', 'number_weight', 'number_fromHandle', 'number_toHandle', 'text_shape'].filter(f => Object.keys(selectedItem).includes(f.split("_")[1])) as field}
	<div class="row">
		<span><strong>{field.split("_")[1]}</strong></span>
		<input 
			type={field.split("_")[0]} 
			value={selectedItem[field.split("_")[1]]} 
			on:input={e => handleInputChange(e, field)}
			checked={selectedItem[field.split("_")[1]]}
		>
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