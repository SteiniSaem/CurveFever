<script>
    import { currentPage } from "../store";

  function startGame(){
    $currentPage = 'game';
  }

  let show;

  currentPage.subscribe(value =>{
    if(value == 'home'){
        show = true;
    } else{
        show = false;
    }
  })
</script>

{#if show}
<div id='home-screen'>
  <h1 id='title'>Curve Fever</h1>
  <div>
    <button on:click={startGame}>Start Game</button>
  </div>
</div>
{/if}

<style>
    #home-screen{
        width: 100vw;
        height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    #title{
        font-size: 6rem;
        font-family: BalonkuFont;
    }
</style>