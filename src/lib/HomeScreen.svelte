<script>
    import { currentPage, players, activeInput } from "../store";
    import CustomInput from './CustomInput.svelte'


  let availablePlayers = [{name: 'Blue bell', color: 'aqua', leftKeyCode: null, rightKey: null, checked: false},
                          {name: 'Red Monkey', color: 'red', leftKeyCode: null, rightKeyCode: null, checked: false},
                          {name: 'Pink lady', color: 'pink', leftKeyCode: null, rightKeyCode: null, checked: false},
                          {name: 'Yellow fever', color: 'yellow', leftKeyCode: null, rightKeyCode: null, checked: false},
                          {name: 'Greeney', color: 'lightgreen', leftKeyCode: null, rightKeyCode: null, checked: false}
                        ]

  let show;
  let errorMessage = ''

  currentPage.subscribe(value =>{
    if(value == 'home'){
        show = true;
    } else{
        show = false;
    }
  })

  function startGame(){
    for(var i in availablePlayers){
      if(availablePlayers[i].checked){
        if(availablePlayers[i].leftKeyCode == null || availablePlayers[i].rightKeyCode == null){
          errorMessage = `Missing buttons for ${availablePlayers[i].name}`
          return;
        }
        $players = [...$players, availablePlayers[i]]
      }
    }
    if($players.length == 0){
      errorMessage = 'Need players'
      return;
    }
    console.log(availablePlayers)

    $currentPage = 'game';
  }

</script>

{#if show}
<div id='home-screen'>
  <h1 id='title'>Curve Fever</h1>
  <table id='players-table'>
    <tr>
      <th>Player</th>
      <th>Left</th>
      <th>Right</th>
    </tr>
    {#each availablePlayers as p}
    <tr class='player-container'>
      <td class="player-name" style={`color:${p.color}`}><input type="checkbox" bind:checked={p.checked}> {p.name}</td>
      <!--<td class='table-cell'>Left: <input type="text" class='button-input' bind:value={p.leftKeyCode}/></td>
      <td class='table-cell'>Right: <input type="text" class='button-input' bind:value={p.rightKeyCode}/></td>-->
      <td><CustomInput name={`${p.name}-left`} bind:keyCode={p.leftKeyCode}/></td>
      <td><CustomInput name={`${p.name}-right`} bind:keyCode={p.rightKeyCode}/></td>
    </tr>
    {/each}
  </table>
  <p>{errorMessage}</p>
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
    }

    #title{
        font-size: 6rem;
        font-family: BalonkuFont;
    }

    #players-table{
      margin-bottom: 2rem;
    }

    td, th{
      width: 8rem;
    }

    .button-input{
      height: 2rem;
      width: 5rem;
      margin: 0 1rem;
      background-color: black;
      border: 1px solid white;
      color: white;
    }

    .player-name{
      text-align: left;
    }
</style>