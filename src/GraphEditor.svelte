<script>
    import MapEditor from "./MapEditor.svelte"
	
    export let graphjsonpath;
    export let overrideOptions = {};

    let graph;
    
    $: graphjsonpath && fetch(graphjsonpath).then(r => r.json()).then(data => graph = Object.assign(data, overrideOptions))

</script>

{#if graph}
<MapEditor unsizedGraph={graph} on:graphchanged="{e => {graph = e.detail;}}"/>
{/if}
