<script>
    import { onMount } from "svelte";
    import { activeInput, currentPage } from "../store";
    import { createEventDispatcher } from 'svelte'

    const dispatch = createEventDispatcher()

    export let active = false;
    export let key = '';
    export let keyCode;
    export let name;
    export let color;

    let input;


    onMount(() => {

        activeInput.subscribe(value => {
            if(value == name){
                active = true;
                input.style = `border:1px ${color} solid; background-color: rgba(255,255,255, 0.1)`
            }
            else{
                active = false;
                input.style = 'border:1px white solid'
            }
        })
    })

    function keyDown(e){
        if(active){
            e.preventDefault()
            keyCode = e.keyCode;
            key = e.key.charAt(0).toUpperCase() + e.key.slice(1);
            $activeInput = `${name.split('-')[0]}-right`
        }
    }


    

</script>
<svelte:window on:keydown={(e) => {if($currentPage == 'home') keyDown(e);}}/>
<div bind:this={input} id='custom-input' on:click={() => {$activeInput = name;}}>
    <p id='text'>{key}</p>
</div>

<style>
#custom-input{
    height: 2.5rem;
    border: 1px solid white;
    display: flex;
    align-items: center;
    justify-content: center;
}

#custom-input:hover{
    cursor: pointer;
}

</style>