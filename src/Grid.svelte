<script>
	let stops = [...Array(30).keys()].map(x => x*100)
	export let showPlane = false;
</script>

<!-- show a plane -->
{#if showPlane}
<rect 
	x="-500" 
	y="-500"
	width="5000"
	height="5000"
	fill="#e9ffe9">
</rect>
{/if}

{#each stops as stop}
	<!-- lines of constant y -->
	<line x1="0" y1={0+stop} x2={30*100} y2={0+stop}></line>

	<!-- lines of constant x -->
	<line x1={0+stop} y1="0" x2={0+stop} y2="3000"></line>
{/each}

<style>
	line {
		opacity: 0.1;
		stroke: gray;
		stroke-width: 3;
	}
</style>