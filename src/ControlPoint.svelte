<script>
  export let kind = 'plus'; // plus or cross
  export let x;
  export let y;
  export let size = 4;
  export let data;
  export let title; 
</script>

<g>
    <circle cx={x} cy={y} r={size+2} data-handle={data} on:click {title}/>
    {#if kind === 'plus'}
        <path d={`M ${x},${y-size} v ${2*size} M ${x-size},${y} h ${2*size}`}  data-handle={data} on:click/>
    {:else if kind === 'cross'}
        <path d={`M ${x-size},${y-size} l ${2*size},${2*size} M ${x+size},${y-size} l ${-2*size},${2*size}`}  data-handle={data} on:click/>
    {/if}
</g>

<style>
	circle {
		fill: white;
		stroke: black;
		cursor: pointer;
	}

    path {
        fill: black;
        stroke: black;
        stroke-width: 2;
        cursor: pointer;
    }

	g:hover circle {
		fill: magenta;
		stroke: magenta;
	}

    g:hover path {
        fill: white;
        stroke: white;
    }
</style>