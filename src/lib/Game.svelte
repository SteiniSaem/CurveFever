<script>
    import { currentPage, players, canvasDimmensions, maxScore } from "../store";
    import { onMount } from "svelte";
    import { startingBallRadius, startingSpeed, maxFramesBetweenGaps, gapLength, powerupDuration } from "./constants";
    let devMode = false;

    let canvas;
    let startGame = false;
    let restart = false;
    let roundOver = false;
    let gameOver = false;
    let roundWinner = '';
    let gameWinners = [];
    let occupiedPoints = [];
    let maxFramesUntilPowerup = 500;
    let powerFrenzyTimer = 0;
    let crashedPlayers = [];

    let powerupRadius = 30;
    let framesUntilPowerup = Math.round(Math.random()*maxFramesUntilPowerup);
    let neutralPowers = ['cleanSlate', 'powerFrenzy'];
    let onlyType1Powers = ["noTrail", 'passThroughWalls']
    let livePowerups = [];

    let powerEffects = { 'doubleSpeed': doubleSpeed, 'cleanSlate': cleanSlate, 'doubleThick': doubleThick, 'leftRightSwitch': leftRightSwitch, "noTrail": noTrail, 'passThroughWalls': passThroughWalls, 'halfSpeed': halfSpeed, 'powerFrenzy': powerFrenzy, 'frequentGaps': frequentGaps, 'onlyRightAngles': onlyRightAngles}
    function getRandomPower(){
        var keys = Object.keys(powerEffects);
        return keys[ keys.length * Math.random() << 0];
    }

    function onlyRightAngles(id, activate, type){
        if(activate){
            if(type == 1){
                $players[id].onlyRightAnglesPowerupCount += 1;
            }
            else{
                for(let i in $players){
                    if(parseInt(i) != id){
                        $players[i].onlyRightAnglesPowerupCount += 1;
                    }
                }
            }
        }
        else{
            $players[id].onlyRightAnglesPowerupCount -= 1;
        }
    }

    function frequentGaps(id, activate, type){
        if(activate){
            if(type == 1){
                $players[id].maxFramesBetweenGaps = 70;
                $players[id].framesUntilNextNoTrail = Math.round(Math.random()*70)
            }
            else{
                for(let i in $players){
                    if(parseInt(i) != id){
                        $players[i].maxFramesBetweenGaps = 70;
                        $players[i].framesUntilNextNoTrail = Math.round(Math.random()*70)
                    }
                }
            }
        }
        else{
            $players[id].maxFramesBetweenGaps = maxFramesBetweenGaps
        }
    }

    function powerFrenzy(id, activate, type){
        powerFrenzyTimer = 300;
    }

    function halfSpeed(id, activate, type){
        if(activate){
            if(type == 1){
                $players[id].speed /= 2;
                $players[id].turningConstant /= 2;
                //maybe also halve the turning constant
            }
            else{
                for(let i in $players){
                    if(parseInt(i) != id){
                        $players[i].speed /= 2;
                        $players[i].turningConstant /= 2;
                    }
                }
            }
        }
        else{
            $players[id].speed *= 2;
            $players[id].turningConstant *= 2;
        }
    }
    
    function passThroughWalls(id, activate, type=null){
        if(activate){
            $players[id].canPassThroughWallsPowerupCount += 1;
        }
        else {
            $players[id].canPassThroughWallsPowerupCount -= 1;
        }
    }

    function noTrail(id, activate, type=null){
        if(activate){
            if(type == 1){
                $players[id].noTrail = true;
                $players[id].noTrailPowerupCount += 1
            }
            else {
                for(let i in $players){
                    if(parseInt(i) != id){
                        $players[i].noTrail = true;
                        $players[i].noTrailPowerupCount += 1;
                    }
                }
            }
        } else{
            $players[id].noTrailPowerupCount -= 1;
            if($players[id].noTrailPowerupCount <= 0){
                $players[id].noTrail = false;
                $players[id].noTrailPowerupCount = 0; //just in case this value somehow becomes -1 or less
            }
        }
    }

    function leftRightSwitch(id, activate, type=null){
        if(activate){
            if(type == 1){
                [$players[id].leftKeyCode, $players[id].rightKeyCode] = [$players[id].rightKeyCode, $players[id].leftKeyCode]
                console.log(`left: ${$players[id].leftKeyCode}, right: ${$players[id].rightKeyCode}`);
                if($players[id].leftPressed){
                    $players[id].leftPressed = false;
                    $players[id].rightPressed = true
                }
                if($players[id].rightPressed){
                    $players[id].rightPressed = false;
                    $players[id].leftPressed = true
                }
            }
            else{
                for(let i in $players){
                    if(parseInt(i) != id){
                        [$players[i].leftKeyCode, $players[i].rightKeyCode] = [$players[i].rightKeyCode, $players[i].leftKeyCode]
                        if($players[i].leftPressed){
                            $players[i].leftPressed = false;
                            $players[i].rightPressed = true
                        }
                        if($players[i].rightPressed){
                            $players[i].rightPressed = false;
                            $players[i].leftPressed = true
                        }
                    }
                }
            }
        }
        else{
            [$players[id].leftKeyCode, $players[id].rightKeyCode] = [$players[id].rightKeyCode, $players[id].leftKeyCode]
            if($players[id].leftPressed){
                $players[id].leftPressed = false;
                $players[id].rightPressed = true
            }
            if($players[id].rightPressed){
                $players[id].rightPressed = false;
                $players[id].leftPressed = true
            }
            console.log(`left: ${$players[id].leftKeyCode}, right: ${$players[id].rightKeyCode}`);
        }
    }

    function doubleThick(id, activate, type=null){
        if(activate){
            if(type == 1){
                $players[id].ballRadius *= 2
            }
            else{
                for(let i in $players){
                    if(parseInt(i) != id){
                        $players[i].ballRadius *= 2
                    }
                }
            }
        }
        else{
            $players[id].ballRadius /= 2
        }
    }

    function doubleSpeed(id, activate, type=null){
        if(activate){
            if(type == 1){
                $players[id].speed *= 2;
                $players[id].turningConstant *= 2;
            }
            else{
                for(let i in $players){
                    if(parseInt(i) != id){
                        $players[i].speed *= 2;
                        $players[i].turningConstant *= 2;
                    }
                }
            }
        }
        else{
            $players[id].speed /= 2
            $players[id].turningConstant /= 2;
        }
    }

    function cleanSlate(id, activate, type){ //parameters aren't used but are there so it is same as other power functions
        for(let pl in $players){
            $players[pl].trailPoints = [];
        }
        occupiedPoints = [];
        livePowerups = [];
    }

    function pageBack(){
        startGame = false;
        restart = true;
        gameOver = false;
        roundOver = false;
        $currentPage = 'home';
    }

    function restartGame(){
        startGame = false;
        let dx, dy;
        occupiedPoints = [];
        framesUntilPowerup = maxFramesUntilPowerup;
        livePowerups = [];
        crashedPlayers = [];
        for(let id in $players){
            [dx, dy] = [Math.random() * (Math.round(Math.random()) ? 1 : -1), Math.random() * Math.round(Math.random()) ? 1 : -1];
            $players[id].leftPressed = false;
            $players[id].rightPressed = false;
            $players[id].leftKeyCode = $players[id].originalLeftKeyCode,
            $players[id].rightKeyCode = $players[id].originalRightKeyCode
            $players[id].x = Math.floor(Math.random() * ($canvasDimmensions.width*0.8 - $canvasDimmensions.width*0.2)) + $canvasDimmensions.width*0.2;
            $players[id].y = Math.floor(Math.random() * ($canvasDimmensions.height*0.8 - $canvasDimmensions.height*0.2)) + $canvasDimmensions.height*0.2;
            $players[id].dx = dx;
            $players[id].dy = dy;
            $players[id].crashed = false;
            $players[id].noTrail = true;
            $players[id].trailPoints = [];
            $players[id].framesSinceLastTrail = -200; //when game starts, have extra frames of no trail. Trail begins when framesSinceLastTrail reaches 50
            $players[id].framesUntilNextNoTrail = Math.round(Math.random()*maxFramesBetweenGaps);
            $players[id].speed = 1;
            $players[id].turningConstant = 0.025
            $players[id].powerupTimers = [];
            $players[id].ballRadius = startingBallRadius
            $players[id].noTrailPowerupCount = 0;
            $players[id].canPassThroughWallsPowerupCount = 0;
            $players[id].powerupBallTransparency = {value: 0, diff: 0.04};
            $players[id].maxFramesBetweenGaps = maxFramesBetweenGaps;
            $players[id].onlyRightAnglesPowerupCount = 0;
            $players[id].hasReleasedLeft = true;
            $players[id].hasReleasedRight = true;
        }
    }


    onMount(() => {
        const ctx = canvas.getContext('2d');

        function isPointOccupied(px, py, ballRadius, id) {
            let crashMargin = ballRadius
            for(let i in occupiedPoints){
                if(occupiedPoints[i].x >= px-crashMargin && occupiedPoints[i].x <= px+crashMargin && occupiedPoints[i].y >= py-crashMargin &&occupiedPoints[i].y <= py+crashMargin){
                    for(let j = $players[id].trailPoints.length-1; j > $players[id].trailPoints.length-30; j--){
                        if(occupiedPoints[i].x == $players[id].trailPoints[j].x && occupiedPoints[i].y == $players[id].trailPoints[j].y){ ////so thick balls don't crash into themselves when slightly turning
                            return false;
                        }
                    }
                    return true;
                }
            }
            return false;
        }

        function drawBall(x, y, color, ballRadius) {
            ctx.beginPath();
            ctx.arc(x, y, ballRadius, 0, Math.PI*2);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.closePath();
            //console.log(`draw ${x}, ${y}`)
		}


        function normalize_vector(dx, dy){
            let speed = Math.sqrt(dx**2 + dy**2);
            if(speed != 0){
                dx /= speed;
                dy /= speed;
            }
            return [dx, dy]
        }

        function turnRight(id){
            if($players[id].onlyRightAnglesPowerupCount > 0){
                [$players[id].dx, $players[id].dy] = [-1*$players[id].dy, $players[id].dx]
            }
            else{
                let turningConstant = $players[id].turningConstant

                if($players[id].dy >= 0 && $players[id].dx >= 0){
                    $players[id].dx -= turningConstant;
                    $players[id].dy += turningConstant;
                }
                else if($players[id].dy >= 0 && $players[id].dx < 0){
                    $players[id].dx -= turningConstant;
                    $players[id].dy -= turningConstant;
                }
                else if($players[id].dy < 0 && $players[id].dx >= 0){
                    $players[id].dx += turningConstant;
                    $players[id].dy += turningConstant;
                }
                else if($players[id].dy < 0 && $players[id].dx < 0){
                    $players[id].dx += turningConstant;
                    $players[id].dy -= turningConstant;
                }
            }
        }

        function turnLeft(id){
            if($players[id].onlyRightAnglesPowerupCount > 0){
                [$players[id].dx, $players[id].dy] = [$players[id].dy, -1*$players[id].dx]
            }
            else{
                let turningConstant = $players[id].turningConstant

                if($players[id].dy >= 0 && $players[id].dx >= 0){
                    $players[id].dx += turningConstant;
                    $players[id].dy -= turningConstant;
                }
                else if($players[id].dy >= 0 && $players[id].dx < 0){
                    $players[id].dx += turningConstant;
                    $players[id].dy += turningConstant;
                }
                else if($players[id].dy < 0 && $players[id].dx >= 0){
                    $players[id].dx -= turningConstant;
                    $players[id].dy -= turningConstant;
                }
                else if($players[id].dy < 0 && $players[id].dx < 0){
                    $players[id].dx -= turningConstant;
                    $players[id].dy += turningConstant;
                }
            }
        }

        function drawPowerup(x, y, power, type){ //type is 1 or 2, type 1 gives player power, type 2 gives opponents power. Type has no effect if power is neutral (like cleanSlate)
            //yellow circle
            let typeColors = {1: 'rgb(0,255,0)', 2: 'red'}
            let isNeutral = false;
            if(neutralPowers.includes(power)){
                isNeutral = true
            }
            ctx.beginPath();
            ctx.arc(x, y, powerupRadius, 0, Math.PI*2);
            ctx.strokeStyle = isNeutral ? 'yellow' : typeColors[type];
            ctx.lineWidth = 2;
            ctx.stroke()
            ctx.closePath();
            ctx.strokeStyle = 'yellow'
            //['doubleThick', 'doubleSpeed', 'cleanSlate', 'leftRightSwitch']
            if(power == 'doubleThick'){
                ctx.beginPath()
                ctx.lineWidth=3;
                ctx.moveTo(x-(powerupRadius-15), y+(powerupRadius-15))
                ctx.lineTo(x, y)
                ctx.stroke()
                ctx.closePath()
                
                ctx.beginPath()
                ctx.lineWidth = 8;
                ctx.moveTo(x,y)
                ctx.lineTo(x+(powerupRadius-15), y-(powerupRadius-15))
                ctx.stroke()
                ctx.closePath()
            }

            else if(power == 'doubleSpeed'){
                ctx.beginPath()
                ctx.lineWidth = 5;
                ctx.moveTo(x-3, y);
                ctx.lineTo(x-12, y-20)
                ctx.moveTo(x-3, y);
                ctx.lineTo(x-12, y+20)

                ctx.moveTo(x+12, y);
                ctx.lineTo(x+3, y-20)
                ctx.moveTo(x+12, y);
                ctx.lineTo(x+3, y+20)
                ctx.stroke()
                ctx.closePath()
            }
            else if(power == 'cleanSlate'){
                //ekkert
            }
            else if(power == 'leftRightSwitch'){
                ctx.beginPath()
                ctx.lineWidth = 5;
                ctx.moveTo(x + 20, y - 5)
                ctx.lineTo(x-20, y-5)
                ctx.lineTo(x-10, y-15)

                ctx.moveTo(x - 20, y + 5)
                ctx.lineTo(x+20, y+5)
                ctx.lineTo(x+10, y+15)
                ctx.stroke()
                ctx.closePath()
            }
            
            else if(power == 'noTrail'){
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI*2);
                ctx.fillStyle = 'yellow';
                ctx.fill();
                ctx.closePath();
            }

            else if(power == 'passThroughWalls'){
                ctx.beginPath()
                ctx.strokeStyle = 'yellow';
                let bounds = [{lower: x-15, upper: x+15, side: y-15}, {lower: y-15, upper: y+15, side: x+15}, {lower: x-15, upper: x+15, side: y+15}, {lower: y-15, upper: y+15, side: x-15}]
                for(let bound = 0; bound < bounds.length; bound++){
                    let b = bounds[bound];
                    let count = 1;
                    for(let i = b.lower; i < b.upper; i+=3){
                        if(count % 2 == 0){
                            bound % 2 == 0 ? ctx.lineTo(i, b.side) : ctx.lineTo(b.side, i)
                        }
                        else{
                            bound % 2 == 0 ? ctx.moveTo(i, b.side) : ctx.moveTo(b.side, i)
                        }
                        count++;
                    }
                }
                ctx.stroke()
                ctx.closePath()
            }

            else if(power == 'halfSpeed'){
                // Draw turtle body
                ctx.beginPath();
                ctx.arc(x, y, 12, 0, 2 * Math.PI); // body
                ctx.fillStyle = 'yellow';
                ctx.fill();
                ctx.closePath();

                // Draw turtle head
                ctx.beginPath();
                ctx.arc(x, y-15, 6, 0, 2 * Math.PI); // head
                ctx.fillStyle = 'yellow';
                ctx.fill();
                
                ctx.closePath();

                // Draw turtle legs
                ctx.beginPath();
                ctx.arc(x-10, y-8, 4, 0, 2 * Math.PI) //left front foot
                ctx.arc(x+10, y-8, 4, 0, 2 * Math.PI) //right front foot
                ctx.arc(x-10, y+8, 4, 0, 2 * Math.PI) //left back foot
                ctx.fill()
                ctx.closePath();
                ctx.beginPath()
                ctx.arc(x+10, y+8, 4, 0, 2 * Math.PI) //right back foot
                ctx.fill();
                ctx.closePath();
            }
            else if(power == 'powerFrenzy'){
                ctx.beginPath()
                ctx.strokeStyle = 'yellow'
                ctx.arc(x-12, y-10, 4, 0, 2 * Math.PI);
                ctx.stroke();
                ctx.closePath();

                ctx.beginPath()
                ctx.arc(x+3, y-14, 4, 0, 2 * Math.PI)
                ctx.stroke()
                ctx.closePath();

                ctx.beginPath()
                ctx.arc(x, y+5, 4, 0, 2 * Math.PI)
                ctx.stroke()
                ctx.closePath();

                ctx.beginPath()
                ctx.arc(x+15, y, 4, 0, 2 * Math.PI)
                ctx.stroke()
                ctx.closePath();

                ctx.beginPath()
                ctx.arc(x+12, y+15, 4, 0, 2 * Math.PI)
                ctx.stroke()
                ctx.closePath();

                ctx.beginPath()
                ctx.arc(x-15, y+10, 4, 0, 2 * Math.PI)
                ctx.stroke()
                ctx.closePath();

                ctx.beginPath()
                ctx.arc(x+12, y+15, 4, 0, 2 * Math.PI)
                ctx.stroke()
                ctx.closePath();
            }
            else if(power == 'frequentGaps'){
                 // Set the line to be dotted
                ctx.setLineDash([4, 4]);

                // Draw the first curve
                ctx.beginPath();
                ctx.moveTo(x - 15, y + 15);
                ctx.quadraticCurveTo(x-15, y-10, x, y);
                ctx.stroke();

                // Draw the second curve in the opposite direction
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.quadraticCurveTo(x + 15, y+10, x + 15, y - 15);
                ctx.stroke();

                ctx.setLineDash([0, 0]);
            }
            else if(power == 'onlyRightAngles'){
                ctx.beginPath()
                ctx.moveTo(x-15, y+15)
                ctx.lineTo(x-15, y-15)
                ctx.lineTo(x-5, y-15)
                ctx.lineTo(x-5, y+15)
                ctx.lineTo(x+5, y+15)
                ctx.lineTo(x+5, y-15)
                ctx.lineTo(x+15, y-15)
                ctx.lineTo(x+15, y+15)
                ctx.stroke()
            }
        }


        function generateRandomPowerup(){
            let px = Math.random()*canvas.width;
            let py = Math.random()*canvas.height;
            let randomPower = getRandomPower();
            let type = onlyType1Powers.includes(randomPower) ? 1 : Math.round(Math.random())+1
            livePowerups.push({x: px, y: py, power: randomPower, type: type})
        }


        function powerCaught(power, type, playerId){
            if(!neutralPowers.includes(power)){ //add to players powerupTimers or opponents powerupTimers
                if(type == 1){
                    $players[playerId].powerupTimers.push({'power': power, 'framesLeft': powerupDuration})
                    console.log(`${$players[playerId].name} has ${power}`)
                }
                else{
                    for(let i in $players){
                        if(parseInt(i) != playerId){
                            $players[i].powerupTimers.push({'power': power, 'framesLeft': powerupDuration})
                        }
                    }
                }
            }
            powerEffects[power](playerId, true, type)
        }

        function draw(){
            if(restart){
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                restartGame();
                restart = false;
            }
            if(startGame){
                // Clear the entire canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                for(let p in livePowerups){
                    drawPowerup(livePowerups[p].x, livePowerups[p].y, livePowerups[p].power, livePowerups[p].type)
                }
                for(let id in $players){
                    //if(noPath)clearPoint($players[id].lastPoints[0].x, $players[id].lastPoints[0].y)
                    drawBall($players[id].x, $players[id].y, $players[id].color, $players[id].ballRadius);
                    
                    //drawTrails
                    for(let p in $players[id].trailPoints){
                        drawBall($players[id].trailPoints[p].x, $players[id].trailPoints[p].y, $players[id].color, $players[id].trailPoints[p].radius)
                    }

                    //draw yellow ball that fades in and out while player has the passTroughWalls powerup
                    if($players[id].canPassThroughWallsPowerupCount > 0){
                        drawBall($players[id].x, $players[id].y, `rgba(255, 255, 0, ${$players[id].powerupBallTransparency.value})`, $players[id].ballRadius + 1);
                        $players[id].powerupBallTransparency.value += $players[id].powerupBallTransparency.diff
                        if($players[id].powerupBallTransparency.value <= 0 || $players[id].powerupBallTransparency.value >= 1){
                            $players[id].powerupBallTransparency.diff *= -1;
                        }
                    }

                    //check if powerup has been caught
                    for(let i = 0; i < livePowerups.length; i++){
                        let p = livePowerups[i]
                        if($players[id].x >= p.x-powerupRadius && $players[id].x <= p.x+powerupRadius && $players[id].y >= p.y-powerupRadius && $players[id].y <= p.y+powerupRadius){
                            powerCaught(p.power, p.type, id)
                            livePowerups.splice(i, 1)
                            break;
                        }
                    }
                    //check on powerupTimers
                    for(let t = 0; t < $players[id].powerupTimers.length; t++){
                        let timer = $players[id].powerupTimers[t]
                        timer.framesLeft--;
                        if(timer.framesLeft <= 0){
                            console.log(`deactivate ${$players[id].name} ${timer.power}`)
                            powerEffects[timer.power](id, false) //false deactivates power
                            $players[id].powerupTimers.splice(t, 1)
                            t--;
                            continue
                        }
                    }

                    //$players[id].lastPoints.push($players[id].x, $players[id].y)
                    if(!$players[id].crashed){
                        if($players[id].canPassThroughWallsPowerupCount > 0){
                            if($players[id].x >= canvas.width){
                                $players[id].x = 0;
                            }
                            else if($players[id].x <= 0){
                                $players[id].x = canvas.width;
                            }
                            if($players[id].y >= canvas.height){
                                $players[id].y = 0;
                            }
                            else if($players[id].y <= 0){
                                $players[id].y = canvas.height;
                            }
                        }
                        else{
                            //wall crash detection
                            if($players[id].x >= canvas.width || $players[id].x <= 0 || $players[id].y >= canvas.height || $players[id].y <= 0){
                                $players[id].crashed = true;
                                crashedPlayers.push($players[id])
                                for(let i in $players){
                                    if(!$players[i].crashed){
                                        $players[i].score++; //give other players a point
                                    }
                                }
                            }
                        }
                        //crash detection                       without this, the ball crashes into itself immediately
                        if(isPointOccupied($players[id].x + ($players[id].dx*1.2*$players[id].ballRadius), $players[id].y + ($players[id].dy*1.2*$players[id].ballRadius), $players[id].ballRadius, id)){
                            if(!$players[id].noTrail){
                                console.log(`${$players[id].name} crashed`)
                                $players[id].crashed = true;
                                crashedPlayers.push($players[id])
                                for(let i in $players){
                                    if(!$players[i].crashed){
                                        $players[i].score++; //give other players a point
                                    }
                                }
                            }
                        }
                        if($players[id].rightPressed){
                            if($players[id].onlyRightAnglesPowerupCount > 0){
                                if($players[id].hasReleasedRight){
                                    turnRight(id)
                                }
                            }
                            else{
                                turnRight(id);
                            }
                            $players[id].hasReleasedRight = false;
                        }
                        else if($players[id].leftPressed){
                            if($players[id].onlyRightAnglesPowerupCount > 0){
                                if($players[id].hasReleasedLeft){
                                    turnLeft(id)
                                }
                            }
                            else{
                                turnLeft(id);
                            }
                            $players[id].hasReleasedLeft = false;
                        }
                        // passa að hraðinn sé alltaf 1, þ.e. sqrt(dx**2 + dy**2) = 1
                        [$players[id].dx, $players[id].dy] = normalize_vector($players[id].dx, $players[id].dy)
                        $players[id].dx *= $players[id].speed
                        $players[id].dy *= $players[id].speed


                        //$players[id].lastPoints[0] = $players[id].lastPoints[1]
                        //$players[id].lastPoints[1] = {x: $players[id].x, y: $players[id].y,}

                        $players[id].x += $players[id].dx;
                        $players[id].y += $players[id].dy;
                    }

                    if(!$players[id].noTrail){
                        $players[id].trailPoints.push({x: $players[id].x, y: $players[id].y, radius: $players[id].ballRadius})
                        $players[id].framesUntilNextNoTrail -= 1;
                        occupiedPoints.push({x: $players[id].x, y: $players[id].y})
                    }
                    else{
                        if($players[id].noTrailPowerupCount == 0){
                            $players[id].framesSinceLastTrail += 1; //don't count up if player has no trail powerup
                        }
                        if($players[id].framesSinceLastTrail >= gapLength){
                            $players[id].noTrail = false
                            $players[id].framesSinceLastTrail = 0
                            $players[id].framesUntilNextNoTrail = Math.round(Math.random()*$players[id].maxFramesBetweenGaps);
                        }
                    }

                    if($players[id].framesUntilNextNoTrail <= 0){
                        $players[id].noTrail = true;
                    }
                }

                framesUntilPowerup--;
                //console.log(framesUntilPowerup)
                if(framesUntilPowerup <= 0){
                    generateRandomPowerup()
                    framesUntilPowerup = Math.round(Math.random()*maxFramesUntilPowerup)
                }

                if(powerFrenzyTimer > 0){ //frenzy timer is set to 600 when frenzy powerup is caught. So 5 powerups are generated
                    powerFrenzyTimer--;
                    if(powerFrenzyTimer % 50 == 0){
                        generateRandomPowerup();
                    }
                }
                if(crashedPlayers.length == Object.entries($players).length-1){
                    startGame = false;
                    for(let i in $players){
                        if(!$players[i].crashed){
                            $players[i].score++; //extra point for winner of round
                            roundOver = true;
                            roundWinner = $players[i].name
                        }
                        if($players[i].score >= $maxScore){
                            gameOver = true;
                        }
                    }
                }
            }
            requestAnimationFrame(draw)
        }
        draw()
    });


    function keyDown(e){
        e.preventDefault();
        if(e.key == " "){
            if(roundOver){
                if(gameOver){
                    for(let i in $players){
                        $players[i].score = 0;
                    }
                    gameOver = false;
                }
                roundOver = false;
                restartGame()
                startGame = true;
            }
            else{
                startGame = !startGame;
            }
        }
        else if(e.key == 'r' && devMode){
            console.log('restart')
            restart = true;
        }
        /*else if(e.key == 'c'){
            $players[1].noTrail = !$players[1].noTrail;
        }*/
        else{
            for(let id in $players){
                if(e.keyCode == $players[id].rightKeyCode){
                    $players[id].rightPressed = true;
                }

                else if(e.keyCode == $players[id].leftKeyCode){
                    $players[id].leftPressed = true;
                }
                
            }
        }
    }

    function keyUp(e){
        for(let id in $players){
            if(e.keyCode == $players[id].rightKeyCode){
                $players[id].rightPressed = false;
                $players[id].hasReleasedRight = true;
                console.log('right released')
            }

            else if(e.keyCode == $players[id].leftKeyCode){
                $players[id].leftPressed = false;
                $players[id].hasReleasedLeft = true;
            }
        }
    }

</script>

<svelte:window on:keydown={(e) => {if ($currentPage == 'game') keyDown(e);}} on:keyup={keyUp}/>

<div id='game-page' style={$currentPage=='game' ? '' : 'display:none'}> <!--þarf að hafa style=... frekar en {#if show} svo að canvas actually rendereist og canvas breytan sé ekki undefined-->
    <div id='top-container'>
        <div id='buttons-container'>
            <button id='back-button' on:click={pageBack}>&#8249;</button>
            {#if devMode}
            <button id='restart-button' on:click={() => {restart = true}}>&#8635;</button>
            {/if}
        </div>
        <!--<h3>{startGame ? 'GAME ON' : 'Paused'}</h3>
        <p></p>-->
    </div>
    <div style='display:flex; width: 100%'>
        <div id='canvas-container'>
            {#if gameOver}
            <h1 id='round-over-message'>Konec Hry</h1>
            {:else if roundOver}
            <h1 id='round-over-message'>{roundWinner} wins <br> Press SPACE to start next round</h1>
            {/if}
            <canvas bind:this={canvas} id=game-container width={$canvasDimmensions.width} height={$canvasDimmensions.height}>
        </div>
        <div id='score-container'>
            <h2 id='score-heading'>Score</h2>
            <p style='margin:0'>(score limit: {$maxScore})</p>
            <table id='score-table'>
                {#each Object.entries($players) as [id, player]}
                <tr class='score-table-row' style={`color: ${player.color}`}>
                    <td style='text-align:left'>{player.name}:</td>
                    <td>{player.score}</td>
                </tr>
                {/each}
            </table>
        </div>
    </div>
</div>

<style>
    #game-page{
        display: flex;
        flex-direction: column;
        padding: 1rem;
        width: 100%;
    }

    #top-container{
        display: flex;
        justify-content: space-between;
        width: 100%;
    }

    #game-container{
        width: 75rem;
        height: 45rem;
        border: 1px white solid;
        background-color: black;
        float: left;
    }

    #buttons-container{
        display: flex;
        margin-bottom: 1rem;
    }

    #back-button{
        margin-right: 1rem;

        background-color: rgb(207, 95, 95);
    }

    #restart-button{
        background-color: rgb(241, 255, 82);
    }

    #back-button:hover{
        background-color: rgb(157, 75, 75);
    }

    #restart-button:hover{
        background-color: rgb(175, 185, 65);
    }

    #score-container{
        flex-grow: 100;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-left: 1rem;
    }

    .score-table-row{
        font-weight: bold;
    }

    #score-heading{
        margin: 0;
    }

    #score-table{
        width: 100%;
        table-layout: fixed;
    }

    #canvas-container{
        position: relative;
        text-align: center;
    }

    #round-over-message{
        position: absolute; 
        left: 0; 
        right: 0; 
        top: 40%;
        margin: auto;
        width: 50rem; /* Need a specific value to work */
}

</style>