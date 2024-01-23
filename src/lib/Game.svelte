<script>
    import { currentPage } from "../store";
    import { onMount } from "svelte";

    let show;
    let canvas;
    let startGame = false;
    let restart = false;
    let leftPressed = false;
    let rightPressed = false;

    const turningConstant = 0.025;

    let ballRadius = 3;
    let x = 100;
    let y = 500;
    let dx = 1;
    let dy = 0;

    currentPage.subscribe(value => {
        if(value == 'game'){
            show = true;
        } else{
            show = false;
        }
    })

    function pageBack(){
        restart = true;
        $currentPage = 'home'
    }

    function restartGame(){
        startGame = false;
        ballRadius = 3;
        x = 100;
        y = 500;
        dx = 1;
        dy = 0;
    }


    onMount(() => {
        const ctx = canvas.getContext('2d')

        function getColorAtPoint(x, y) {
            // Get the image data for the specified pixel
            var imageData = ctx.getImageData(x, y, 1, 1);
            var data = imageData.data;

            // Extract the RGB values
            var red = data[0];
            var green = data[1];
            var blue = data[2];
            var alpha = data[3] / 255; // Alpha value (transparency)

            // Return the color in RGBA format
            return 'rgba(' + red + ',' + green + ',' + blue + ',' + alpha + ')';
        }

        function isPointOccupied(px, py) {
            // Get the image data for the specified pixel
            var imageData = ctx.getImageData(px, py, 1, 1);
            var color = imageData.data;
            if(color[0] == 0 && color[1] == 0 && color[2] == 0 && color[3] == 0){
                return false;
            }
            return true;
        }



        function drawBall() {
			ctx.beginPath();
			ctx.arc(x, y, ballRadius, 0, Math.PI*2);
			ctx.fillStyle = "aqua";
			ctx.fill();
			ctx.closePath();
		}

        function normalize_vector(dx, dy){
            let speed = Math.sqrt(dx**2 + dy**2);
            if(speed != 0){
                dx /= speed;
                dy /= speed;
            }
            return [dx, dy]
        }

        function draw(){
            if(restart){
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                restartGame();
                restart = false;
            }
            if(startGame){
                drawBall();
                if(rightPressed){
                    if(dy >= 0 && dx >= 0){
                        dx -= turningConstant;
                        dy += turningConstant;
                    }
                    else if(dy >= 0 && dx < 0){
                        dx -= turningConstant;
                        dy -= turningConstant;
                    }
                    else if(dy < 0 && dx >= 0){
                        dx += turningConstant;
                        dy += turningConstant;
                    }
                    else if(dy < 0 && dx < 0){
                        dx += turningConstant;
                        dy -= turningConstant;
                    }
                    //console.log(`dx: ${Math.round(dx*1000)/1000}, dy: ${Math.round(dy*1000)/1000}, speed: ${Math.round(Math.sqrt(dx**2 + dy**2))}`)
                }
                else if(leftPressed){
                    if(dy >= 0 && dx >= 0){
                        dx += turningConstant;
                        dy -= turningConstant;
                    }
                    else if(dy >= 0 && dx < 0){
                        dx += turningConstant;
                        dy += turningConstant;
                    }
                    else if(dy < 0 && dx >= 0){
                        dx -= turningConstant;
                        dy -= turningConstant;
                    }
                    else if(dy < 0 && dx < 0){
                        dx -= turningConstant;
                        dy += turningConstant;
                    }
                    //console.log(`dx: ${Math.round(dx*1000)/1000}, dy: ${Math.round(dy*1000)/1000}, speed: ${Math.round(Math.sqrt(dx**2 + dy**2)*100)/100}`)
                }
                [dx, dy] = normalize_vector(dx, dy)
                x += dx;
                y += dy;

                if(isPointOccupied(x + (dx*1.1*ballRadius), y + (dy*1.1*ballRadius))){
                    console.log('CRASH')
                    startGame = false;
                }
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
            }
            requestAnimationFrame(draw)
        }
        draw()
    });


    function keyDown(e){
        e.preventDefault();
        console.log(e)
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
            restart = true;
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

<svelte:window on:keydown={(e) => {if ($currentPage == 'game') keyDown(e);}} on:keyup={keyUp}/>

<div id='game-page' style={show ? '' : 'display:none'}> <!--þarf að hafa style=... frekar en {#if show} svo að canvas actually rendereist og canvas breytan sé ekki undefined-->
    <div id='top-container'>
        <button id='back-button' on:click={pageBack}>&#8249;</button>
        <h3>{startGame ? 'GAME ON' : 'Paused'}</h3>
        <p></p>
    </div>
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

    #top-container{
        display: flex;
        justify-content: space-between;
        width: 100%;
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