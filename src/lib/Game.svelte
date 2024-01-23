<script>
    import { onMount } from "svelte";
    import { currentPage } from "../store";
    import App from "../App.svelte";

    let show;
    let canvas;
    let startGame = false;
    let restartGame = false;
    let leftPressed = false;
    let rightPressed = false;

    let ballRadius = 3;
    let x = 100;
    let y = 500;
    let dx = 1;
    let dy = 0;

    function setToStartingValues(){
        ballRadius = 3;
        x = 100;
        y = 500;
        dx = 1;
        dy = 0;
    }

    currentPage.subscribe(value => {
        if(value == 'game'){
            show = true;
        } else{
            show = false;
        }
    })

    onMount(() => {
        const ctx = canvas.getContext('2d')


        function drawBall() {
			ctx.beginPath();
			ctx.arc(x, y, ballRadius, 0, Math.PI*2);
			ctx.fillStyle = "aqua";
			ctx.fill();
			ctx.closePath();
		}

        function draw(){
            if(restartGame){
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                setToStartingValues();
                restartGame = false;
            }
            if(startGame){
                console.log('start game')
                drawBall()

                
                if(rightPressed){
                    dy += 0.05;
                    dx -= 0.05
                }
                else if(leftPressed){
                    dy -= 0.05;
                    if(y >= 0 && x >0){
                        dx -= 0.05;
                    
                }
                x += dx;
                y += dy;
                if(x >= 1000){
                    x = 0;
                }
                else if(x <= 0){
                    x = 1000;
                }
                if(y >= 1000){
                    y = 0;
                }
                else if(y <= 0){
                    y = 1000;
                }
                console.log(`x: ${x}, y: ${y}`)
            }
            requestAnimationFrame(draw)
        }
        draw()
    });


    function keyDown(e){
        e.preventDefault();
        if(e.key == " "){
            startGame = !startGame;
        }
        else if(e.keyCode == 39){
            rightPressed = true;
        }

        else if(e.keyCode == 37){
            leftPressed = true;
        }
        else if(e.key == 'r'){
            console.log('restart')
            restartGame = true;
        }
    }

    function keyUp(e){
        if(e.keyCode == 39){
            rightPressed = false;
        }

        else if(e.keyCode == 37){
            leftPressed = false;
        }

    }

</script>

<svelte:window on:keydown={keyDown} on:keyup={keyUp}/>

<div id='game-page' style={show ? '' : 'display:none'}> <!--þarf að hafa style=... frekar en {#if show} svo að canvas actually rendereist og canvas breytan sé ekki undefined-->
    <h3>{startGame ? 'Game On' : 'Paused'}</h3>
    <button id='back-button' on:click={() => {$currentPage='home'}}>&#8249;</button>
    <canvas bind:this={canvas} id=game-container width="1000" height="1000">
    </canvas>
</div>

<style>
    #game-page{
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100vw;
    }

    #game-container{
        width: 60rem;
        height: 40rem;
        border: 1px white solid;
        background-color: black;
    }

    #back-button{
        align-self: flex-start;
        margin: 0 0 1rem 1rem;
        background-color: rgb(207, 95, 95);
    }

    #back-button:hover{
        background-color: rgb(157, 75, 75);
    }
</style>