///// DO NOT CHANGE ANYTHING IN THIS FILE /////

///////////////////////////////////////////////
// Core functionality /////////////////////////
///////////////////////////////////////////////
function registerSetup(setup) {
  setupGame = setup;
}

function clearMathChallenge() {
  mathChallengeActive = false;
  mathChallengePrompt = "";
  mathChallengeAnswer = 0;
  mathChallengeInput = "";
  mathChallengeError = "";
  nextMathChallengeAt = performance.now() + 30000;
}

function main() {
  ctx.clearRect(0, 0, 1400, 750); //erase the screen so you can draw everything in it's most current position

  if (shouldDrawGrid) {
    makeGrid();
  }

  if (player.deadAndDeathAnimationDone) {
    deathOfPlayer();
    return;
  }

  if (player.winConditionMet) {
    winGame();
    return;
  }

  if (currentAnimationType === animationTypes.frontDeath) {
    clearMathChallenge();
  }

  drawPlatforms();
  drawFakePlatforms();
  drawBadPlatforms();
  drawProjectiles();
  drawCannons();
  drawCollectables();
  drawHeartTraps();

  maybeTriggerMathChallenge();
  if (mathChallengeActive) {
    animate();
    drawRobot();
    drawKeybindPrompt();
    drawHUD();
    drawMathChallenge();
    return;
  }

  playerFrictionAndGravity();

  player.x += player.speedX;
  player.y += player.speedY;

  collision(); //checks if the player will collide with something in this frame
  keyboardControlActions(); //keyboard controls.
  projectileCollision(); //checks if the player is getting hit by a projectile in the next frame
  badPlatformCollision(); //checks if the player is touching a bad platform
  collectablesCollide(); //checks if player has touched a collectable

  animate(); //this changes halle's picture to the next frame so it looks animated.
  // debug()                   //debugging values. Comment this out when not debugging.
  drawRobot(); //this actually displays the image of the robot.
  drawKeybindPrompt();
  drawHUD(); //draw the timer and collected items display
}

function maybeTriggerMathChallenge() {
  if (mathChallengeActive || typeof runStartedAt !== "number") {
    return;
  }

  if (performance.now() < nextMathChallengeAt) {
    return;
  }

  const easyNumbers = [2, 3, 4, 5, 6, 7, 8, 9, 10];
  const left = easyNumbers[Math.floor(Math.random() * easyNumbers.length)];
  const right = easyNumbers[Math.floor(Math.random() * easyNumbers.length)];
  const useAddition = Math.random() < 0.6;

  mathChallengePrompt = useAddition
    ? `${left} + ${right}`
    : `${left} × ${right}`;
  mathChallengeAnswer = useAddition ? left + right : left * right;
  mathChallengeInput = "";
  mathChallengeError = "";
  mathChallengeActive = true;
  nextMathChallengeAt = performance.now() + 30000;
}

function submitMathChallenge() {
  if (!mathChallengeActive) {
    return;
  }

  const guess = Number(mathChallengeInput);

  if (mathChallengeInput === "" || Number.isNaN(guess)) {
    mathChallengeError = "Enter a number first";
    return;
  }

  if (guess === mathChallengeAnswer) {
    clearMathChallenge();
    return;
  }

  mathChallengeInput = "";
  mathChallengeError = "Wrong answer!";
}

function drawMathChallenge() {
  const panelX = canvas.width / 2 - 290;
  const panelY = canvas.height / 2 - 120;
  const panelW = 580;
  const panelH = 220;

  ctx.fillStyle = "rgba(6, 10, 20, 0.82)";
  ctx.fillRect(panelX, panelY, panelW, panelH);
  ctx.strokeStyle = "#F5D76E";
  ctx.lineWidth = 4;
  ctx.strokeRect(panelX, panelY, panelW, panelH);

  ctx.fillStyle = "#F7F9FC";
  ctx.font = "bold 40px serif";
  ctx.fillText("Math Check!", panelX + 30, panelY + 55, panelW - 60);

  ctx.fillStyle = "#F5D76E";
  ctx.font = "bold 54px serif";
  ctx.fillText(
    `${mathChallengePrompt} = ?`,
    panelX + 30,
    panelY + 110,
    panelW - 60,
  );

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 32px serif";
  const answerText = mathChallengeInput === "" ? "_" : mathChallengeInput;
  ctx.fillText(`Answer: ${answerText}`, panelX + 30, panelY + 155, panelW - 60);

  ctx.fillStyle = "#D6E8FF";
  ctx.font = "bold 24px serif";
  ctx.fillText(
    "Type digits, then press Enter",
    panelX + 30,
    panelY + 195,
    panelW - 60,
  );

  if (mathChallengeError) {
    ctx.fillStyle = "#FF6B6B";
    ctx.font = "bold 24px serif";
    ctx.fillText(mathChallengeError, panelX + 30, panelY + 195, panelW - 60);
  }
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function getLeaderboard() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("platformerLeaderboard") || "[]",
    );
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    return [];
  }
}

function saveRunTime(elapsedSeconds) {
  const leaderboard = getLeaderboard();
  const cleanSeconds = Number(elapsedSeconds) || 0;

  const deduped = leaderboard.filter(
    (entry) => Number(entry.seconds) !== cleanSeconds,
  );
  deduped.push({
    seconds: cleanSeconds,
    label: formatTime(cleanSeconds),
  });

  deduped.sort((a, b) => a.seconds - b.seconds);
  const trimmed = deduped.slice(0, 10);
  localStorage.setItem("platformerLeaderboard", JSON.stringify(trimmed));
  return trimmed;
}

function drawLeaderboard(x, y, width, leaderboard) {
  const maxRows = Math.min(10, leaderboard.length || 1);
  const rowHeight = 18;
  const panelHeight = Math.max(150, 58 + maxRows * rowHeight + 18);
  const gradient = ctx.createLinearGradient(x, y, x, y + panelHeight);
  gradient.addColorStop(0, "#16263d");
  gradient.addColorStop(0.5, "#243d57");
  gradient.addColorStop(1, "#3b4d68");

  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, width, panelHeight);
  ctx.strokeStyle = "rgba(245, 215, 110, 0.9)";
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, width, panelHeight);

  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  ctx.fillRect(x + 12, y + 12, width - 24, 30);

  ctx.fillStyle = "#F7F9FC";
  ctx.font = "bold 26px serif";
  ctx.fillText("Leaderboard", x + 22, y + 32);

  if (!leaderboard.length) {
    ctx.fillStyle = "#D6E8FF";
    ctx.font = "bold 20px serif";
    ctx.fillText("No times yet", x + 22, y + 64, width - 40);
    return;
  }

  for (let i = 0; i < maxRows; i++) {
    const item = leaderboard[i];
    const text = `${i + 1}. ${item.label || formatTime(item.seconds || 0)}`;
    const rowY = y + 62 + i * rowHeight;

    ctx.fillStyle =
      i === 0
        ? "#F5D76E"
        : i === 1
          ? "#D7E6FF"
          : i === 2
            ? "#CFAF7A"
            : "#FFFFFF";
    ctx.font = "bold 18px serif";
    ctx.fillText(text, x + 22, rowY, width - 44);
  }
}

function getJSON(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.responseType = "json";
  xhr.onload = function () {
    var status = xhr.status;
    if (status === 200) {
      callback(null, xhr.response);
      setupGame();
    } else {
      callback(status, xhr.response);
    }
  };
  xhr.send();
}

function JsonFunction(status, response) {
  /*
      diagram of the json
      top level is the name of the animation
      also don't you dare complain, this is operation sparks fault for making the animation so complicated.
      animation name{
          coordinates{
              sx: xpadding,
              sy: ypadding,
              width: cords.swidth,
              height: cords.sheight,
              hitWidth: 50, //cords.width,
              hitHeight: 105,//cords.height,
              hitDx: 0,
              hitDy: 0,
              xoffset: xoffset,
              yoffset: yoffset,
          }
          maxHeight: largest size the sprite can be
          maxWidth: 
      }
    */
  animationDetails = response;
}

///////////////////////////////////////////////
// Helper functions ///////////////////////////
///////////////////////////////////////////////

function changeAnimationType() {
  if (currentAnimationType === animationTypes.frontDeath) {
    if (
      frameIndex >= animationDetails[currentAnimationType].coordinates.length
    ) {
      player.deadAndDeathAnimationDone = true;
    }
    return;
  }
  if (jumpTimer > 0 && !player.onGround) {
    currentAnimationType = animationTypes.jump;
    jumpTimer--;
  } else {
    jumpTimer = 0;
    if (Math.abs(player.speedX) > 0) {
      //if you're moving then change animation to walking or running
      if (keyPress.left || keyPress.right) {
        currentAnimationType = animationTypes.run;
      } else {
        currentAnimationType = animationTypes.walk;
      }
    } else if (player.onGround) {
      if (keyPress.down) {
        currentAnimationType = animationTypes.duck;
        if (duckTimer < DUCK_COUNTER_IDLE_VALUE) {
          // not using index 0 because the animation is too slow then
          frameIndex = 3;
          duckTimer = DUCK_COUNTER_IDLE_VALUE * 2 - frameIndex;
        }
      } else if (
        duckTimer === 0 ||
        currentAnimationType === animationTypes.walk
      ) {
        currentAnimationType = animationTypes.frontIdle;
      }
    }
  }
}

function debug() {
  debugVar = true;

  // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillText
  ctx.fillText("xs" + player.speedX + " x: " + player.x, 500, 200);
  ctx.fillText("ys" + player.speedY + " y: " + player.y, 500, 250);

  ctx.fillStyle = "black";
  ctx.fillText("on ground " + player.onGround, 150 + player.x, player.y - 20);
  ctx.fillText("hitx" + hitDx, 150 + player.x, player.y);
  ctx.fillText("hity" + hitDy, 150 + player.x, player.y + 20);
  ctx.fillText("offsetx" + offsetX, 150 + player.x, player.y + 40);
  ctx.fillText("offsetY" + offsetY, 150 + player.x, player.y + 60);

  ctx.fillStyle = "grey";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  //debug showing collision
  ctx.fillStyle = "yellow";
  ctx.fillRect(500, 100, 50, 50);

  ctx.fillStyle = "green";
  ctx.fillRect(player.x, player.y, hitBoxWidth, hitBoxHeight);

  if (collision() !== undefined) {
    ctx.fillStyle = "yellow";
    ctx.fillRect(player.x, player.y - 50, 10, 10);
  }
}

function animate() {
  if (
    !(
      keyPress.down &&
      duckTimer === DUCK_COUNTER_IDLE_VALUE &&
      currentAnimationType === animationTypes.duck
    )
  ) {
    frameIndex = frameIndex + 15 / frameRate;
    if (duckTimer > 0) {
      duckTimer -= 0.25;
    }
  }
  changeAnimationType();
  if (frameIndex >= animationDetails[currentAnimationType].coordinates.length) {
    frameIndex = 0;
  }
  spriteX =
    animationDetails[currentAnimationType].coordinates[Math.floor(frameIndex)]
      .sx;
  spriteY =
    animationDetails[currentAnimationType].coordinates[Math.floor(frameIndex)]
      .sy;
  spriteWidth =
    animationDetails[currentAnimationType].coordinates[Math.floor(frameIndex)]
      .width;
  spriteHeight =
    animationDetails[currentAnimationType].coordinates[Math.floor(frameIndex)]
      .height;
  maxWidth = animationDetails[currentAnimationType].maxWidth * playerScale;
  maxHeight = animationDetails[currentAnimationType].maxHeight * playerScale;
  offsetX =
    animationDetails[currentAnimationType].coordinates[Math.floor(frameIndex)]
      .xoffset * playerScale;
  offsetY =
    animationDetails[currentAnimationType].coordinates[Math.floor(frameIndex)]
      .yoffset * playerScale;
  player.width =
    animationDetails[currentAnimationType].coordinates[Math.floor(frameIndex)]
      .width * playerScale;
  player.height =
    animationDetails[currentAnimationType].coordinates[Math.floor(frameIndex)]
      .height * playerScale;
  hitDx =
    animationDetails[currentAnimationType].coordinates[Math.floor(frameIndex)]
      .hitDx * playerScale;
  hitDy =
    animationDetails[currentAnimationType].coordinates[Math.floor(frameIndex)]
      .hitDy * playerScale;
}

function drawRobot() {
  //ctx.drawImage(imageVaribale, sourceY, SourceX, sourceWidth, sourceHeight, canvasX, canvasY, finalWidth, finalHeight)
  //https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
  //you only need the extra four source arguments if you want to display just a portion of the picture; if you want to show the whole picture you can just do drawImage(imageVar, canvasX, canvasY, width, height)

  //next section draws hallie. There is an if so that the image is reversed based on the direction of travel
  //there is also a hitDx and hitDy; those are offsets for the animation; enable debugger to see the true hitbox in green
  //you can enable the debug view by uncommenting the debug() function call in the main function.
  if (player.deadAndDeathAnimationDone) {
    return; //return stops the function, we don't want to draw the robot after we die
  }

  if (player.facingRight) {
    ctx.drawImage(
      halleImage,
      spriteX,
      spriteY,
      spriteWidth,
      spriteHeight,
      player.x - hitDx,
      player.y - hitDy,
      player.width,
      player.height,
    );
  } else {
    //for running to the left you mirror the image
    ctx.save();
    ctx.scale(-1, 1); //mirror the entire canvas
    ctx.drawImage(
      halleImage,
      spriteX,
      spriteY,
      spriteWidth,
      spriteHeight,
      -player.x - player.width + hitDx,
      player.y - hitDy,
      player.width,
      player.height,
    );
    ctx.restore(); //put the canvas back to normal
  }
}

function collision() {
  player.onGround = false; // Reset this every frame; if the player is actually on the ground, the resolveCollision function will set it to true
  var result = undefined;
  for (var i = 0; i < platforms.length; i++) {
    // Check for collision
    if (
      player.x + hitBoxWidth > platforms[i].x &&
      player.x < platforms[i].x + platforms[i].width &&
      player.y < platforms[i].y + platforms[i].height &&
      player.y + hitBoxHeight > platforms[i].y
    ) {
      //now that we know we have collided, we figure out the direction of collision
      result = resolveCollision(
        platforms[i].x,
        platforms[i].y,
        platforms[i].width,
        platforms[i].height,
      );
    }
  }
  return result;
}

function resolveCollision(objx, objy, objw, objh) {
  //this is the return value
  let collisionDirection = "";
  //found here https://stackoverflow.com/questions/38648693/resolve-collision-of-two-2d-elements
  //first we find the distance between the center of the object and the player
  let dx = player.x + hitBoxWidth / 2 - (objx + objw / 2);
  let dy = player.y + hitBoxHeight / 2 - (objy + objh / 2);

  //get half-widths of each item
  let halfWidth = hitBoxWidth / 2 + objw / 2;
  let halfHeight = hitBoxHeight / 2 + objh / 2;

  // if the x and y vector are less than the half width or half height,
  // then we must be inside the object, causing a collision
  let originx = halfWidth - Math.abs(dx);
  let originy = halfHeight - Math.abs(dy);

  if (debugVar) {
    //debug
    ctx.strokeStyle = "blue";
    ctx.beginPath();
    ctx.moveTo(objx + dx, objy);
    ctx.lineTo(objx, objy);
    ctx.lineTo(objx, objy + dy);
    ctx.stroke();
    ctx.fillStyle = "rbga(252,186,3,.3)";
    ctx.fillRect(player.x, player.y, hitBoxWidth, hitBoxHeight);
  }

  if (originx >= originy) {
    if (dy > 0) {
      //bottom collision
      collisionDirection = "bottom";
      player.y = player.y + originy + 1;
      player.speedY = 0;
    } else {
      //top collision
      collisionDirection = "top";
      player.y = player.y - originy;
      player.speedY = 0;
      player.onGround = true;
    }
  } else {
    if (dx > 0) {
      //left collision
      collisionDirection = "left";
      player.x = player.x + originx;
      player.speedX = 0;
    } else {
      //right collision
      collisionDirection = "right";
      player.x = player.x - originx;
      player.speedX = 0;
    }
  }

  return collisionDirection;
}

function triggerFrontDeath() {
  if (currentAnimationType === animationTypes.frontDeath) {
    return;
  }

  currentAnimationType = animationTypes.frontDeath;
  frameIndex = 0;
  clearMathChallenge();
}

function projectileCollision() {
  //checking if the player is dead
  if (currentAnimationType === animationTypes.frontDeath) {
    return;
  }

  for (var i = 0; i < projectiles.length; i++) {
    //this deletes any projectiles that go off the screen
    if (
      projectiles[i].x > canvas.width + 100 + projectiles[i].width ||
      projectiles[i].x < -100 - projectiles[i].width ||
      projectiles[i].y > canvas.height + 100 + projectiles[i].height ||
      projectiles[i].y < -100 - projectiles[i].height
    ) {
      projectiles.splice(i, 1);
    }

    if (i === projectiles.length) {
      return;
    }

    //collision with the player
    if (
      projectiles[i].x < player.x + hitBoxWidth &&
      projectiles[i].x + projectiles[i].width > player.x &&
      projectiles[i].y < player.y + hitBoxHeight &&
      projectiles[i].y + projectiles[i].height > player.y
    ) {
      triggerFrontDeath();
    }
  }
}

function badPlatformCollision() {
  if (currentAnimationType === animationTypes.frontDeath) {
    return;
  }
  for (var i = 0; i < badPlatforms.length; i++) {
    if (
      player.x + hitBoxWidth > badPlatforms[i].x &&
      player.x < badPlatforms[i].x + badPlatforms[i].width &&
      player.y < badPlatforms[i].y + badPlatforms[i].height &&
      player.y + hitBoxHeight > badPlatforms[i].y
    ) {
      triggerFrontDeath();
    }
  }
}

function deathOfPlayer() {
  if (!respawnSkillActive && !respawnSkillFailed) {
    respawnSkillActive = true;
    respawnSkillMeter = 0.08;
    respawnSkillDirection = 1;
  }

  if (respawnSkillActive && !respawnSkillFailed) {
    respawnSkillMeter += respawnSkillSpeed * respawnSkillDirection;
    if (respawnSkillMeter <= 0.02 || respawnSkillMeter >= 0.98) {
      respawnSkillDirection *= -1;
      respawnSkillMeter = Math.max(0.02, Math.min(0.98, respawnSkillMeter));
    }
  }

  const panelX = canvas.width / 4;
  const panelY = canvas.height / 6;
  const panelW = canvas.width / 2;
  const panelH = canvas.height / 2;

  const gradient = ctx.createLinearGradient(
    panelX,
    panelY,
    panelX,
    panelY + panelH,
  );
  gradient.addColorStop(0, "#17233b");
  gradient.addColorStop(0.5, "#405b78");
  gradient.addColorStop(1, "#c47a68");

  ctx.fillStyle = gradient;
  ctx.fillRect(panelX, panelY, panelW, panelH);

  ctx.strokeStyle = "rgba(225, 236, 250, 0.55)";
  ctx.lineWidth = 5;
  ctx.strokeRect(panelX, panelY, panelW, panelH);

  ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
  ctx.font = "bold 140px serif";
  ctx.fillText(
    "You are dead",
    panelX + 20,
    panelY + panelH / 5 + 8,
    panelW - 40,
  );

  ctx.fillStyle = "#f7f9fc";
  ctx.font = "bold 140px serif";
  ctx.fillText("You are dead", panelX, panelY + panelH / 5, panelW - 40);

  const centerX = canvas.width / 2;
  const centerY = panelY + panelH * 0.62;
  const radius = 118;
  const startAngle = -Math.PI / 2 + respawnSkillWindowMin * Math.PI * 2;
  const endAngle = -Math.PI / 2 + respawnSkillWindowMax * Math.PI * 2;
  const markerAngle = -Math.PI / 2 + respawnSkillMeter * Math.PI * 2;

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.lineWidth = 18;
  ctx.strokeStyle = "rgba(15, 23, 42, 0.8)";
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, startAngle, endAngle);
  ctx.lineWidth = 18;
  ctx.strokeStyle = "#4ade80";
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
  ctx.stroke();

  const markerX = centerX + Math.cos(markerAngle) * radius;
  const markerY = centerY + Math.sin(markerAngle) * radius;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(markerX, markerY);
  ctx.lineWidth = 8;
  ctx.strokeStyle = "#f5d76e";
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(markerX, markerY, 10, 0, Math.PI * 2);
  ctx.fillStyle = "#f5d76e";
  ctx.fill();

  ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
  ctx.font = "bold 54px serif";
  ctx.fillText(
    "Space to pass the check",
    panelX + 90,
    panelY + panelH - 36,
    panelW - 180,
  );

  ctx.fillStyle = "#f7f9fc";
  ctx.font = "bold 54px serif";
  ctx.fillText(
    "Space to pass the check",
    panelX + 70,
    panelY + panelH - 52,
    panelW - 180,
  );

  if (keyPress.space && respawnSkillActive) {
    if (!player.keybinds.space) {
      showKeybindPrompt("space");
      keyPress.space = false;
      return;
    }

    const success =
      respawnSkillMeter >= respawnSkillWindowMin &&
      respawnSkillMeter <= respawnSkillWindowMax;
    keyPress.space = false;

    if (success) {
      resetCurrentRun();
      return;
    }

    respawnSkillActive = false;
    respawnSkillFailed = true;
  }

  if (respawnSkillFailed) {
    ctx.fillStyle = "rgba(7, 11, 20, 0.78)";
    ctx.fillRect(panelX + 60, panelY + 150, panelW - 120, 150);

    ctx.fillStyle = "#f7f9fc";
    ctx.font = "bold 78px serif";
    ctx.fillText("YOU LOSE", panelX + 110, panelY + 250, panelW - 200);

    drawLeaderboard(panelX + 80, panelY + 290, panelW - 160, getLeaderboard());
  }
}

function playerFrictionAndGravity() {
  //max speed limiter for ground
  if (player.speedX > maxSpeed) {
    player.speedX = maxSpeed;
  } else if (player.speedX < -maxSpeed) {
    player.speedX = -maxSpeed;
  }
  //friction
  if (Math.abs(player.speedX) < 1) {
    //this makes sure that the player actually stops when the speed gets low enough
    //otherwise if you just always reduce speed it will just end up jiggling
    player.speedX = 0;
  } else if (player.speedX > 0) {
    player.speedX = player.speedX - friction;
  } else {
    player.speedX = player.speedX + friction;
  }

  if (player.onGround === false) {
    player.speedY = player.speedY + gravity;
  }
}

function drawPlatforms() {
  for (var i = 0; i < platforms.length; i++) {
    // Check if platform should move horizontally
    if (platforms[i].minX !== null && platforms[i].maxX !== null) {
      // Move platform based on speed and direction
      platforms[i].x += platforms[i].speedX * platforms[i].directionX;

      // Reverse direction if platform reaches minX or maxX bounds
      if (platforms[i].x < platforms[i].minX) {
        platforms[i].x = platforms[i].minX;
        platforms[i].directionX *= -1; // Change direction to right
      } else if (platforms[i].x > platforms[i].maxX) {
        platforms[i].x = platforms[i].maxX;
        platforms[i].directionX *= -1; // Change direction to left
      }
    }

    // Check if platform should move vertically
    if (platforms[i].minY !== null && platforms[i].maxY !== null) {
      // Move platform based on speed and direction
      platforms[i].y += platforms[i].speedY * platforms[i].directionY;
      // Reverse direction if platform reaches minY or maxY bounds
      if (platforms[i].y < platforms[i].minY) {
        platforms[i].y = platforms[i].minY;
        platforms[i].directionY *= -1; // Change direction to down
      } else if (platforms[i].y > platforms[i].maxY) {
        platforms[i].y = platforms[i].maxY;
        platforms[i].directionY *= -1; // Change direction to up
      }
    }

    // Draw the platform
    const { color, x, y, width, height } = platforms[i];
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
  }
}

function drawFakePlatforms() {
  for (var i = 0; i < fakePlatforms.length; i++) {
    const { color, x, y, width, height } = fakePlatforms[i];
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
  }
}

function drawBadPlatforms() {
  for (var i = 0; i < badPlatforms.length; i++) {
    const { color, x, y, width, height } = badPlatforms[i];
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
  }
}

function toggleGrid() {
  shouldDrawGrid = true;
}

function makeGrid() {
  // vertical grid lines
  for (let i = 100; i < canvas.width; i += 100) {
    if (!gridMade) {
      createFakePlatform(i - 1, 35, 1, canvas.height);
    }
    // add text indicating x value at top of game
    ctx.font = "125% serif";
    ctx.fillStyle = "black";
    ctx.fillText(
      i, // text
      i - 15, // x location
      25, // y location
    );
  }

  // horizontal grid lines
  for (let i = 100; i < canvas.height; i += 100) {
    if (!gridMade) {
      createFakePlatform(45, i - 1, canvas.width, 1);
    }
    // add text indicating y value at left side of game
    ctx.font = "125% serif";
    ctx.fillText(
      i, // text
      10, // x location
      i + 5, // y location
    );
  }
  gridMade = true;
}

function drawProjectiles() {
  for (var i = 0; i < projectiles.length; i++) {
    ctx.drawImage(
      projectileImage,
      projectiles[i].x,
      projectiles[i].y,
      projectiles[i].width,
      projectiles[i].height,
    );
    projectiles[i].x = projectiles[i].x + projectiles[i].speedX;
    projectiles[i].y = projectiles[i].y + projectiles[i].speedY;
  }
}

function drawCannons() {
  for (var i = 0; i < cannons.length; i++) {
    if (cannons[i].projectileCountdown >= cannons[i].timeBetweenShots) {
      cannons[i].projectileCountdown = 0;
      createProjectile(
        cannons[i].location,
        cannons[i].x,
        cannons[i].y,
        cannons[i].projectileWidth,
        cannons[i].projectileHeight,
      );
    } else {
      cannons[i].projectileCountdown = cannons[i].projectileCountdown + 1;
    }

    // move cannon if minX and maxX are set
    if (cannons[i].minX !== null && cannons[i].maxX !== null) {
      cannons[i].x += cannons[i].speedX;
      if (cannons[i].x < cannons[i].minX || cannons[i].x > cannons[i].maxX) {
        cannons[i].speedX *= -1;
      }
    }
    // move cannon if minY and maxY are set
    if (cannons[i].minY !== null && cannons[i].maxY !== null) {
      cannons[i].y += cannons[i].speedY;
      if (cannons[i].y < cannons[i].minY || cannons[i].y > cannons[i].maxY) {
        cannons[i].speedY *= -1;
      }
    }

    ctx.fillStyle = "grey";
    ctx.save(); //save the current translation of the screen.
    ctx.translate(cannons[i].x, cannons[i].y); //you are moving the top left of the screen to the pictures location, this is because you can't rotate the image, you have to rotate the whole page
    ctx.rotate((cannons[i].rotation * Math.PI) / 180); //then you rotate. rotation is centered on 0,0 on the canvas, which is why we moved the picture to 0,0 with translate(x,y)
    ctx.drawImage(cannonImage, 0, 0, cannonWidth, cannonHeight); //you draw the image on the rotated canvas. as of this line, the picture is straight and the rest of the page is rotated
    //also the previous line uses -width / 2 so that the picture is centered. This will mean that (0,0) is at the exact center of the image
    ctx.translate(-cannons[i].x, -cannons[i].y); //the reverse of the previous translate, this moves the page back to the correct place so that the image is no longer at (0,0)
    ctx.restore(); //this unrotates the canvas so the canvas is straight, but now since you did that the picture looks rotated
  }
}

function drawHeart(x, y, width, height) {
  const heartWidth = width;
  const heartHeight = height;
  const centerX = x + heartWidth / 2;
  const centerY = y + heartHeight / 2;

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.beginPath();
  ctx.moveTo(0, heartHeight * 0.38);
  ctx.arc(
    -heartWidth * 0.28,
    -heartHeight * 0.08,
    heartWidth * 0.31,
    Math.PI,
    0,
  );
  ctx.arc(
    heartWidth * 0.28,
    -heartHeight * 0.08,
    heartWidth * 0.31,
    Math.PI,
    0,
  );
  ctx.lineTo(0, heartHeight * 0.9);
  ctx.closePath();
  ctx.fillStyle = "#ff4d6d";
  ctx.fill();
  ctx.restore();
}

function createHeartTrap(x, y, width = 34, height = 30) {
  baitHearts.push({ x, y, width, height });
}

function drawHeartTraps() {
  if (currentAnimationType === animationTypes.frontDeath) {
    return;
  }

  for (let i = 0; i < baitHearts.length; i++) {
    const trap = baitHearts[i];
    drawHeart(trap.x, trap.y, trap.width, trap.height);

    if (
      player.x + hitBoxWidth > trap.x - 8 &&
      player.x < trap.x + trap.width + 8 &&
      player.y < trap.y + trap.height + 8 &&
      player.y + hitBoxHeight > trap.y - 8
    ) {
      triggerFrontDeath();
    }
  }
}

function drawCollectables() {
  for (var i = 0; i < collectables.length; i++) {
    if (collectables[i].collected !== true) {
      //draw on screen if not collected
      ctx.drawImage(
        collectables[i].image,
        collectables[i].x,
        collectables[i].y,
        collectableWidth,
        collectableHeight,
      );
    } else {
      //draw the icons at the top if collected
      if (collectables[i].alpha > 0.4) {
        collectables[i].alpha = collectables[i].alpha - 0.007;
      }
      ctx.globalAlpha = collectables[i].alpha;
      ctx.drawImage(
        collectables[i].image,
        200 + 100 * i,
        10,
        collectableWidth,
        collectableHeight,
      );
      ctx.globalAlpha = 1;
    }

    // Horizontal movement logic for collectables
    if (collectables[i].minX !== null && collectables[i].maxX !== null) {
      // Move collectable based on speed and direction
      collectables[i].x += collectables[i].speed * collectables[i].direction;

      // Reverse direction if collectable reaches minX or maxX bounds
      if (collectables[i].x < collectables[i].minX) {
        collectables[i].x = collectables[i].minX;
        collectables[i].direction *= -1; // Change direction to right
      } else if (collectables[i].x > collectables[i].maxX) {
        collectables[i].x = collectables[i].maxX;
        collectables[i].direction *= -1; // Change direction to left
      }
    }

    //gravity
    collectables[i].speedY = collectables[i].speedY + collectables[i].gravity;
    collectables[i].y = collectables[i].y + collectables[i].speedY;

    // Check for collision with platforms in order to bounce
    for (var j = 0; j < platforms.length; j++) {
      if (
        collectables[i].x + collectableWidth > platforms[j].x &&
        collectables[i].x < platforms[j].x + platforms[j].width &&
        collectables[i].y < platforms[j].y + platforms[j].height &&
        collectables[i].y + collectableHeight > platforms[j].y
      ) {
        //bottom of collectable is below top of platform
        collectables[i].y = collectables[i].y - collectables[i].speedY;
        collectables[i].speedY *= -collectables[i].bounce;
      }
    }
  }
}

function collectablesCollide() {
  for (var i = 0; i < collectables.length; i++) {
    if (
      collectables[i].x + collectableWidth > player.x &&
      collectables[i].x < player.x + hitBoxWidth &&
      collectables[i].y < player.y + hitBoxHeight &&
      collectables[i].y + collectableHeight > player.y
    ) {
      collectables[i].collected = true;
      checkForWin();
    }
  }
}

function checkForWin() {
  if (collectables.length === 0) {
    return; // If there are no collectables, we can't win
  }
  for (var i = 0; i < collectables.length; i++) {
    if (collectables[i].collected !== true) {
      return; // If any collectable is not collected, we can't win yet
    }
  }
  if (runEndedAt === null) {
    runEndedAt = performance.now();
  }
  player.winConditionMet = true; // Set win condition to true
}

function drawHUD() {
  const elapsedTime =
    typeof runEndedAt === "number"
      ? (runEndedAt - runStartedAt) / 1000
      : (performance.now() - runStartedAt) / 1000;
  const minutes = Math.floor(elapsedTime / 60);
  const seconds = Math.floor(elapsedTime % 60);
  const timeString = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

  let collectedCount = 0;
  for (let i = 0; i < collectables.length; i++) {
    if (collectables[i].collected === true) {
      collectedCount++;
    }
  }

  const panelHeight = 92;
  const startX = 20;
  const gap = 18;

  ctx.fillStyle = "rgba(10, 18, 32, 0.78)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(startX, 18, 220, panelHeight, 18);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "rgba(13, 21, 35, 0.9)";
  ctx.beginPath();
  ctx.roundRect(startX + 238, 18, 280, panelHeight, 18);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "rgba(13, 21, 35, 0.9)";
  ctx.beginPath();
  ctx.roundRect(startX + 238 + 280 + gap, 18, 220, panelHeight, 18);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#F5D76E";
  ctx.font = "bold 26px Arial";
  ctx.fillText("⏱ TIME", startX + 18, 48);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 34px Arial";
  ctx.fillText(timeString, startX + 18, 82);

  ctx.fillStyle = "#FF7B72";
  ctx.font = "bold 26px Arial";
  ctx.fillText("★ COLLECTED", startX + 258, 48);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 34px Arial";
  ctx.fillText(`${collectedCount}/${collectables.length}`, startX + 258, 82);

  ctx.fillStyle = "#72F0A0";
  ctx.font = "bold 26px Arial";
  ctx.fillText("💰 CASH", startX + 238 + 280 + gap + 18, 48);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 34px Arial";
  ctx.fillText(`$${player.cash}`, startX + 238 + 280 + gap + 18, 82);
}

function drawKeybindPrompt() {
  if (!pendingKeybindPurchase && !payToWinPromptOpen) {
    return;
  }

  const x = canvas.width / 2 - 310;
  const y = canvas.height / 2 - 110;

  ctx.fillStyle = "rgba(5, 10, 20, 0.82)";
  ctx.fillRect(x, y, 620, 220);
  ctx.strokeStyle = "#F5D76E";
  ctx.lineWidth = 4;
  ctx.strokeRect(x, y, 620, 220);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 34px serif";

  if (pendingKeybindPurchase) {
    const key = pendingKeybindPurchase;
    if (key === "movement") {
      ctx.fillText(
        "Would you like to buy all movement keys (WASD + Space)?",
        x + 30,
        y + 55,
        560,
      );

      ctx.fillStyle = "#4ADE80";
      ctx.font = "bold 30px serif";
      ctx.fillText(`Cost: $${movementBundlePrice}`, x + 30, y + 100);
    } else {
      const item = keybindInfo[key];
      const price = keybindPrices[key];
      ctx.fillText(
        `Would you like to buy ${item.label} key to ${item.action}?`,
        x + 30,
        y + 55,
        560,
      );

      ctx.fillStyle = "#4ADE80";
      ctx.font = "bold 30px serif";
      ctx.fillText(`Cost: $${price}`, x + 30, y + 100);
    }
  } else {
    ctx.fillText("Would you like to pay to win?", x + 120, y + 55, 400);

    ctx.fillStyle = "#4ADE80";
    ctx.font = "bold 30px serif";
    ctx.fillText(`Cost: $${payToWinPrice}`, x + 220, y + 100);
  }

  ctx.fillStyle = "#F7F9FC";
  ctx.font = "bold 28px serif";
  ctx.fillText("Press Y to buy or N to cancel", x + 30, y + 150);

  if (payToWinPromptOpen && player.cash < payToWinPrice) {
    ctx.fillStyle = "#FF6B6B";
    ctx.font = "bold 28px serif";
    ctx.fillText("Not enough cash", x + 30, y + 190);
  }
}

function showPayToWinPrompt() {
  payToWinPromptOpen = true;
  pendingKeybindPurchase = null;
}

function buyPayToWin() {
  if (!payToWinPromptOpen) {
    return;
  }

  if (player.cash >= payToWinPrice) {
    player.cash -= payToWinPrice;
    player.winConditionMet = true;
    payToWinPromptOpen = false;
  }
}

function showKeybindPrompt(key) {
  if (movementBundleKeys.includes(key)) {
    if (
      movementBundleKeys.every((movementKey) => player.keybinds[movementKey])
    ) {
      return;
    }
    pendingKeybindPurchase = "movement";
    return;
  }

  if (!keybindInfo[key]) {
    return;
  }

  if (player.keybinds[key]) {
    return;
  }

  pendingKeybindPurchase = key;
}

function buyKeybind() {
  if (!pendingKeybindPurchase) {
    return;
  }

  if (pendingKeybindPurchase === "movement") {
    if (player.cash < movementBundlePrice) {
      return;
    }

    player.cash -= movementBundlePrice;
    movementBundleKeys.forEach((key) => {
      player.keybinds[key] = true;
    });
    pendingKeybindPurchase = null;
    return;
  }

  const key = pendingKeybindPurchase;
  const cost = keybindPrices[key];

  if (player.cash >= cost) {
    player.cash -= cost;
    player.keybinds[key] = true;
    pendingKeybindPurchase = null;
  }
}

function resetCurrentRun() {
  keyPress.any = false;
  keyPress.up = false;
  keyPress.left = false;
  keyPress.down = false;
  keyPress.right = false;
  keyPress.space = false;
  pendingKeybindPurchase = null;
  payToWinPromptOpen = false;
  secretPayToWinSequence = "";
  clearMathChallenge();

  if (typeof setupGame === "function") {
    setupGame();
  } else {
    window.location.reload();
  }
}

function winGame() {
  const panelX = canvas.width / 4;
  const panelY = canvas.height / 7;
  const panelW = canvas.width / 2;
  const panelH = canvas.height * 0.62;

  if (runEndedAt === null) {
    runEndedAt = performance.now();
  }

  const finalTime = (runEndedAt - runStartedAt) / 1000;
  const leaderboard = leaderboardSavedForRun
    ? getLeaderboard()
    : saveRunTime(finalTime);
  leaderboardSavedForRun = true;

  const gradient = ctx.createLinearGradient(
    panelX,
    panelY,
    panelX,
    panelY + panelH,
  );
  gradient.addColorStop(0, "#17233b");
  gradient.addColorStop(0.5, "#405b78");
  gradient.addColorStop(1, "#c47a68");

  ctx.fillStyle = gradient;
  ctx.fillRect(panelX, panelY, panelW, panelH);

  ctx.strokeStyle = "rgba(225, 236, 250, 0.55)";
  ctx.lineWidth = 5;
  ctx.strokeRect(panelX, panelY, panelW, panelH);

  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.font = "bold 76px serif";
  ctx.fillText("You Win!", panelX + 26, panelY + 88, panelW - 40);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 76px serif";
  ctx.fillText("You Win!", panelX + 10, panelY + 80, panelW - 40);

  ctx.fillStyle = "#F5D76E";
  ctx.font = "bold 32px serif";
  ctx.fillText(`Time: ${formatTime(finalTime)}`, panelX + 30, panelY + 150);

  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.font = "bold 34px serif";
  ctx.fillText(
    "Press R or Space to restart",
    panelX + 25,
    panelY + 202,
    panelW - 60,
  );

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 34px serif";
  ctx.fillText(
    "Press R or Space to restart",
    panelX + 10,
    panelY + 196,
    panelW - 60,
  );

  drawLeaderboard(panelX + 75, panelY + 210, panelW - 150, leaderboard);

  if (keyPress.space) {
    keyPress.space = false;
    resetCurrentRun();
  }
}

function createPlatform(
  x,
  y,
  width,
  height,
  color = "grey",
  minX = null,
  maxX = null,
  speedX = 1,
  minY = null,
  maxY = null,
  speedY = 1,
) {
  platforms.push({
    x,
    y,
    width,
    height,
    color,
    minX,
    maxX,
    speedX,
    minY,
    maxY,
    speedY,
    directionX: 1, // 1 for right, -1 for left
    directionY: 1, // 1 for down, -1 for up
  });
}

function createFakePlatform(x, y, width, height, color = "grey") {
  fakePlatforms.push({
    x,
    y,
    width,
    height,
    color,
  });
}

function createBadPlatform(x, y, width, height, color = "red") {
  badPlatforms.push({
    x,
    y,
    width,
    height,
    color,
  });
}

function createCannon(
  wallLocation,
  position,
  timeBetweenShots,
  width = defaultProjectileWidth,
  height = defaultProjectileHeight,
  minPos = null,
  maxPos = null,
  speed = 1,
) {
  const shotDelay = timeBetweenShots / (1000 / frameRate);

  if (wallLocation === "top") {
    cannons.push({
      x: position,
      y: cannonHeight,
      rotation: 180,
      projectileCountdown: 0,
      location: wallLocation,
      timeBetweenShots: shotDelay,
      projectileWidth: width,
      projectileHeight: height,
      minX: minPos,
      maxX: maxPos,
      speedX: -Math.abs(speed),
      minY: null,
      maxY: null,
      speedY: 0,
    });
  } else if (wallLocation === "bottom") {
    cannons.push({
      x: position,
      y: canvas.height - cannonHeight,
      rotation: 0,
      projectileCountdown: 0,
      location: wallLocation,
      timeBetweenShots: shotDelay,
      projectileWidth: width,
      projectileHeight: height,
      minX: minPos,
      maxX: maxPos,
      speedX: -Math.abs(speed),
      minY: null,
      maxY: null,
      speedY: 0,
    });
  } else if (wallLocation === "left") {
    cannons.push({
      x: cannonHeight,
      y: position,
      rotation: 90,
      projectileCountdown: 0,
      location: wallLocation,
      timeBetweenShots: shotDelay,
      projectileWidth: width,
      projectileHeight: height,
      minX: null,
      maxX: null,
      speedX: 0,
      minY: minPos,
      maxY: maxPos,
      speedY: Math.abs(speed),
    });
  } else if (wallLocation === "right") {
    cannons.push({
      x: canvas.width - cannonHeight,
      y: position,
      rotation: 270,
      projectileCountdown: 0,
      location: wallLocation,
      timeBetweenShots: shotDelay,
      projectileWidth: width,
      projectileHeight: height,
      minX: null,
      maxX: null,
      speedX: 0,
      minY: minPos,
      maxY: maxPos,
      speedY: Math.abs(speed),
    });
  }
}

function createCollectable(
  type,
  x,
  y,
  gravity = 0,
  bounce = 1,
  minX = null,
  maxX = null,
  speed = 1,
) {
  if (type !== "") {
    var image = document.createElement("img");
    image.src = collectableList[type].image;
    image.id = "image" + collectables.length;
    collectables.push({
      image,
      x,
      y,
      speedY: 0,
      collected: false,
      alpha: 2,
      gravity,
      bounce,
      minX,
      maxX,
      speed,
      direction: 1, // 1 for right, -1 for left
    });
  }
}

function createProjectile(wallLocation, x, y, width, height) {
  //checking if the player is dead
  if (currentAnimationType === animationTypes.frontDeath) {
    return;
  }

  if (wallLocation === "top") {
    projectiles.push({
      x: x - 71.5,
      y: y - 55 - height / 2,
      speedX: 0,
      speedY: projectileSpeed,
      width,
      height,
    });
  } else if (wallLocation === "bottom") {
    projectiles.push({
      x: x + 47,
      y: y + 50 + height / 2,
      speedX: 0,
      speedY: -projectileSpeed,
      width,
      height,
    });
  } else if (wallLocation === "left") {
    projectiles.push({
      x: x - 80 - width / 2,
      y: y + 46,
      speedX: projectileSpeed,
      speedY: 0,
      width,
      height,
    });
  } else if (wallLocation === "right") {
    projectiles.push({
      x: x + 40 + width / 2,
      y: y - 71.5,
      speedX: -projectileSpeed,
      speedY: 0,
      width,
      height,
    });
  }

  // putting this here instead of in every if
  projectiles[projectiles.length - 1].x -= (width - defaultProjectileWidth) / 2;
  projectiles[projectiles.length - 1].y -=
    (height - defaultProjectileHeight) / 2;
}

function keyboardControlActions() {
  if (
    mathChallengeActive ||
    currentAnimationType === animationTypes.frontDeath ||
    player.deadAndDeathAnimationDone ||
    player.winConditionMet
  ) {
    return;
  }

  keyPress.any = false; //keyboardHandler will set this to true if you press any key. Setting the variable to false here makes sure that key press dosen't stick around.
  //this is used for respawning; if you hit any key after you die this variable will be set to true and you will respawn.

  if (keyPress.left && player.keybinds.a) {
    player.speedX -= walkAcceleration;
    player.facingRight = false;
  }
  if (keyPress.right && player.keybinds.d) {
    player.speedX += walkAcceleration;
    player.facingRight = true;
  }
  if (keyPress.space && player.keybinds.space) {
    if (player.onGround) {
      //this only lets you jump if you are on the ground
      player.speedY = player.speedY - playerJumpStrength;
      jumpTimer = 19; //this counts how many frames to have the jump last.
      player.onGround = false; //bug fix for jump animation, you have to change this or the jump animation doesn't work
      frameIndex = 4;
    }
  } else if (keyPress.up) {
    if (player.onGround) {
      player.speedY = player.speedY - playerJumpStrength;
      jumpTimer = 19;
      player.onGround = false;
      frameIndex = 4;
    }
  }
}

function handleKeyDown(e) {
  const key = e.key ? e.key.toLowerCase() : "";
  const isSpaceKey = e.code === "Space" || key === " " || key === "space";

  if (mathChallengeActive) {
    if (key >= "0" && key <= "9") {
      mathChallengeInput += key;
      mathChallengeError = "";
      return;
    }

    if (key === "backspace") {
      mathChallengeInput = mathChallengeInput.slice(0, -1);
      mathChallengeError = "";
      return;
    }

    if (key === "enter") {
      submitMathChallenge();
      return;
    }

    return;
  }

  if (key === "r") {
    resetCurrentRun();
    return;
  }

  if (payToWinPromptOpen) {
    if (key === "y") {
      buyPayToWin();
      return;
    }
    if (key === "n") {
      payToWinPromptOpen = false;
      return;
    }
  }

  if (pendingKeybindPurchase) {
    if (
      pendingKeybindPurchase === "movement" ||
      pendingKeybindPurchase === "space"
    ) {
      if (pendingKeybindPurchase === "space" && isSpaceKey) {
        buyKeybind();
        if (player.keybinds.space) {
          keyPress.space = true;
        }
        return;
      }
      if (key === "y") {
        buyKeybind();
        return;
      }
      if (key === "n") {
        pendingKeybindPurchase = null;
        return;
      }
    } else if (key === "y") {
      buyKeybind();
      return;
    } else if (key === "n") {
      pendingKeybindPurchase = null;
      return;
    }
  }

  keyPress.any = true;

  if (key === "w" || key === "i" || key === "n") {
    secretPayToWinSequence += key;
    if (secretPayToWinSequence.length > 3) {
      secretPayToWinSequence = secretPayToWinSequence.slice(-3);
    }
    if (secretPayToWinSequence === "win") {
      showPayToWinPrompt();
      secretPayToWinSequence = "";
    }
  } else {
    secretPayToWinSequence = "";
  }

  if (key === "c" || key === "a" || key === "s" || key === "h") {
    cashCodeSequence += key;
    if (cashCodeSequence.length > 4) {
      cashCodeSequence = cashCodeSequence.slice(-4);
    }
    if (cashCodeSequence === "cash") {
      player.cash += 250;
      cashCodeSequence = "";
      return;
    }
    if (!"cash".startsWith(cashCodeSequence)) {
      cashCodeSequence = key === "c" ? "c" : "";
    }
  } else {
    cashCodeSequence = "";
  }

  if (key === "m" || key === "o" || key === "n" || key === "e" || key === "y") {
    superCodeSequence += key;
    if (superCodeSequence.length > 5) {
      superCodeSequence = superCodeSequence.slice(-5);
    }
    if (superCodeSequence === "money") {
      player.cash += 100000;
      superCodeSequence = "";
      return;
    }
    if (!"money".startsWith(superCodeSequence)) {
      superCodeSequence = key === "m" ? "m" : "";
    }
  } else {
    superCodeSequence = "";
  }

  if (key === "arrowup") {
    keyPress.up = true;
  }
  if (key === "w") {
    if (!player.keybinds.w) {
      showKeybindPrompt("w");
      return;
    }
    keyPress.up = true;
  }
  if (key === "arrowleft") {
    keyPress.left = true;
  }
  if (key === "a") {
    if (!player.keybinds.a) {
      showKeybindPrompt("a");
      return;
    }
    keyPress.left = true;
  }
  if (key === "arrowdown") {
    keyPress.down = true;
  }
  if (key === "s") {
    if (!player.keybinds.s) {
      showKeybindPrompt("s");
      return;
    }
    keyPress.down = true;
  }
  if (key === "arrowright") {
    keyPress.right = true;
  }
  if (key === "d") {
    if (!player.keybinds.d) {
      showKeybindPrompt("d");
      return;
    }
    keyPress.right = true;
  }
  if (isSpaceKey) {
    if (!player.keybinds.space) {
      showKeybindPrompt("space");
      return;
    }
    keyPress.space = true;
  }
}

function handleKeyUp(e) {
  const key = e.key ? e.key.toLowerCase() : "";
  const isSpaceKey = e.code === "Space" || key === " " || key === "space";

  if (mathChallengeActive) {
    return;
  }

  if (key === "arrowup" || key === "w") {
    keyPress.up = false;
  }
  if (key === "arrowleft" || key === "a") {
    keyPress.left = false;
  }
  if (key === "arrowdown" || key === "s") {
    keyPress.down = false;
    if (currentAnimationType === animationTypes.duck) {
      duckTimer = 8;
      frameIndex = 20;
    }
  }
  if (key === "arrowright" || key === "d") {
    keyPress.right = false;
  }
  if (isSpaceKey) {
    keyPress.space = false;
  }
}

function loadJson() {
  getJSON("halle.json", JsonFunction); //runs this before the setup because of timing things
}
