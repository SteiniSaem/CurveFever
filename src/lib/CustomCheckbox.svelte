<script>
    export let checked = false; 
    export let color = 'rgb(0, 255, 0)';
</script>
<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div style={`color: ${color}`} id='custom-checkbox' on:click={() => {checked = !checked}}>
    {#if checked}
    <p id='checkmark'>&check;</p>
    {/if}
</div>

<style>
#custom-checkbox{
    width: 1.5rem;
    height: 1.5rem;
    border: 0.5px solid white;
    display: flex;
    align-items: center;
    justify-content: center;
}

#custom-checkbox:hover{
    cursor: pointer;
}

#checkmark{
    font-size: 1.5rem;
}

</style>