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
        } else if (e.key === 'Backspace') {
            if(e.target.value.length == 0) {
                tags = tags.slice(0, -1);
                dispatch('tagschanged', {value: tags});
            }
        } else {
            // console.log("got", e.key, e.code);
        }
    }

    function handleTagRemove(idx){
        tags = tags.filter((_, index) => index != idx)
        dispatch('tagschanged', {value: tags});
    }

</script>

<sl-input 
    label="Tags"
    help-text="press spacebar after the name to create a tag"
    on:keydown={handleKeydown}
    size="small"
    help-text="Use SPACE to create tags"
>
    <span slot="prefix">
        {#each tags as tag, idx}
            <sl-tag 
                removable
                pill
                size="small"
                variant="success"
                data-value={tag}
                on:sl-remove={e => handleTagRemove(idx)}
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