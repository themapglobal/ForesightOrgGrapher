<script>
    import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

    export let tags = [];
    export let separator = ' ';

    function handleKeydown(e){
        let str = e.target.value.trim()
        // console.log(str, tags);
        if(e.key === separator){
            if(str.length > 0) { tags = [...tags, str]; }
            e.target.value = '';
            dispatch('tagschanged', {value: tags});
        } else {
            // console.log("got", e.key);
        }
    }

    function handleTagRemove(e){
        tags = tags.filter(t => t !== e.target.dataset.value)
        dispatch('tagschanged', {value: tags});
    }

</script>

<sl-input 
    label="Tags"
    on:keydown={handleKeydown}
    size="small"
>
    <span slot="prefix">
        {#each tags as tag}
            <sl-tag 
                removable
                pill
                size="small"
                variant="success"
                data-value={tag}
                on:sl-remove={handleTagRemove}
            >{tag}
            </sl-tag>
        {/each}
    </span>
</sl-input>

<style>
    sl-input {      
        margin-bottom: 10px;
    }
</style>