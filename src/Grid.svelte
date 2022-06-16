<script>
	let stops = [...Array(50).keys()].map(x => x*100)
	let anglestops = [0, 30, 60, 90, 120, 150].map(x => x*Math.PI/180.0);
	export let kind;
</script>


{#if kind === 'cartesian'}
{#each stops as stop}
	<!-- lines of constant y -->
	<line x1="0" y1={0+stop} x2={5000} y2={0+stop} />

	<!-- lines of constant x -->
	<line x1={0+stop} y1="0" x2={0+stop} y2="5000" />
{/each}
{/if}
<!-- TODO polar grid -->
{#if kind === 'polar'}
	{#each stops as stop}
		<!-- circles of same centers and different radius -->
		<circle r={100 + stop} stroke='black' fill='none' opacity='0.6'/>
	{/each}

	{#each anglestops as angle}
		<!-- lines originating from center of the circle -->
		<line x1={-5000*Math.cos(angle)} y1={-5000*Math.sin(angle)} x2={5000*Math.cos(angle)} y2={5000*Math.sin(angle)} />
	{/each}
{/if}

<style>
	line {
		opacity: 0.1;
		stroke: gray;
		stroke-width: 3;
	}
</style>