<script>
    import { currentPage, players, canvasDimmensions, maxScore, activeInput } from "../store";
    import CustomInput from './CustomInput.svelte'
    import CustomCheckbox from "./CustomCheckbox.svelte";
    import {isEmpty} from './common';
    import { startingBallRadius, startingSpeed, maxFramesBetweenGaps } from "./constants";


  let availablePlayers = {
                          'Red Monkey': {color: 'red', leftKeyCode: null, rightKeyCode: null, checked: false},
                          'Blue bell': {color: 'aqua', leftKeyCode: null, rightKeyCode: null, checked: false},
                          'Pink lady': {color: '#f047ff', leftKeyCode: null, rightKeyCode: null, checked: false},
                          'Yellow fever': {color: 'orange', leftKeyCode: null, rightKeyCode: null, checked: false},
                          'Greeney': {color: '#23ff0f', leftKeyCode: null, rightKeyCode: null, checked: false}
  }

  let errorMessage = ''

  function startGame(){
    let playerId = 1
    let dx, dy;
    for(var i in availablePlayers){
      if(availablePlayers[i].checked){
        if(availablePlayers[i].leftKeyCode == null || availablePlayers[i].rightKeyCode == null){
          errorMessage = `Missing buttons for ${availablePlayers[i].name}`
          return;
        }
        //gera random tölu frá 0 til 1 og svo 50/50 líkur á að margfalda hana með 1 eða -1. Þannig random tala frá -1 til 1
        [dx, dy] = [Math.random() * (Math.round(Math.random()) ? 1 : -1), Math.random() * Math.round(Math.random()) ? 1 : -1];
        $players[playerId] = {...availablePlayers[i],
          name: i,
          leftPressed: false,
          rightPressed: false,
          x: Math.floor(Math.random() * ($canvasDimmensions.width*0.8 - $canvasDimmensions.width*0.2)) + $canvasDimmensions.width*0.2,
          y: Math.floor(Math.random() * ($canvasDimmensions.height*0.8 - $canvasDimmensions.height*0.2)) + $canvasDimmensions.height*0.2,
          dx: dx,
          dy: dy,
          crashed: false,
          noTrail: true,
          trailPoints: [{x: this.x, y: this.y}],
          framesSinceLastTrail: -200, //when game starts, have extra frames of no trail. Trail begins when framesSinceLastTrail reaches 50
          framesSinceLastNoTrail: 0,
          framesUntilNextNoTrail: Math.round(Math.random()*maxFramesBetweenGaps),
          speed: 1,
          turningConstant: 0.025,
          powerupTimers: [],
          ballRadius: startingBallRadius,
          noTrailPowerupCount: 0,
          canPassThroughWallsPowerupCount: 0,
          onlyRightAnglesPowerupCount: 0,
          powerupBallTransparency: {value: 0, diff: 0.04},
          maxFramesBetweenGaps: maxFramesBetweenGaps, //<- constant defined in constants.js
          originalLeftKeyCode: availablePlayers[i].leftKeyCode,
          originalRightKeyCode: availablePlayers[i].rightKeyCode, //if a round ends with a player flipped, the key codes can be set to their original values
          score: 0,
          hasReleasedLeft: true,
          hasReleasedRight: true,
        }
        playerId++;
      }
    }
    $maxScore = 5*(playerId-1); //playerId-1 is same as player count here
    if(isEmpty($players)){
      errorMessage = 'Need players'
      return;
    }
    console.log($players)

    $currentPage = 'game';
  }

  function keyPressed(e){
    e = e.detail
    availablePlayers[e.player][`${e.direction}KeyCode`] = e.keyCode;
    $activeInput = `${e.player}-right`
  }

</script>

<div id='home-screen' style={$currentPage=='home' ? '' : 'display:none'}>
  <h1 id='title'>Curve Fever</h1>
  <div style='font-size:1.5rem'>
    <table id='players-table'>
      <tr>
        <th>Player</th>
        <th>Left</th>
        <th>Right</th>
      </tr>
      {#each Object.keys(availablePlayers) as p}
      <tr class='player-container'>
        <td class="player-name" style={`color:${availablePlayers[p].color}`}><CustomCheckbox color={availablePlayers[p].color} bind:checked={availablePlayers[p].checked}/>&nbsp;&nbsp;&nbsp;&nbsp;{p}</td>
        <!--<td class='table-cell'>Left: <input type="text" class='button-input' bind:value={p.leftKeyCode}/></td>
        <td class='table-cell'>Right: <input type="text" class='button-input' bind:value={p.rightKeyCode}/></td>-->
        <td><CustomInput name={`${p}-left`} color={availablePlayers[p].color} bind:keyCode={availablePlayers[p].leftKeyCode}/></td>
        <td><CustomInput name={`${p}-right`} color={availablePlayers[p].color} bind:keyCode={availablePlayers[p].rightKeyCode}/></td>
      </tr>
      {/each}
    </table>
    <p>{errorMessage}</p>
    <div>
      <button on:click={startGame}>Start Game</button>
    </div>
  </div>
</div>

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
      vertical-align: middle;
    }

    tr, .player-name{
      height: 3.5rem;
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
      display: flex;
      justify-content: flex-start;
      width: 12rem;
      align-items: center;
    }
</style>