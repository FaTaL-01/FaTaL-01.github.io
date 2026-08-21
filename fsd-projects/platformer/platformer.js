$(function () {
  // initialize canvas and context when able to
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  window.addEventListener("load", loadJson);

  function setup() {
    if (firstTimeSetup) {
      halleImage = document.getElementById("player");
      projectileImage = document.getElementById("projectile");
      cannonImage = document.getElementById("cannon");
      $(document).on("keydown", handleKeyDown);
      $(document).on("keyup", handleKeyUp);
      firstTimeSetup = false;
      //start game
      setInterval(main, 1000 / frameRate);
    }

    // Create walls - do not delete or modify this code
    createPlatform(
      -50,
      canvas.height - 10,
      canvas.width + 100,
      200,
      "rgb(118, 0, 233)",
    ); // bottom wall
    createPlatform(-50, canvas.height - 100, canvas.width + 100, 100, "#3f4c6b");
    createPlatform(-50, -1000000, 50, 1001000); // left wall
    createPlatform(canvas.width, -1000000, 50, 1001000); // right wall

    //////////////////////////////////
    // ONLY CHANGE BELOW THIS POINT //
    //////////////////////////////////

    // TODO 1 - Enable the Grid
    // toggleGrid();

    // TODO 2 - Create Platforms
    const firstPlatformX = 80 + Math.floor(layoutRandom(1) * 150);
    const secondPlatformX = 420 + Math.floor(layoutRandom(2) * 180);
    const trampolineX = 760 + Math.floor(layoutRandom(3) * 180);
    createPlatform(firstPlatformX, 620, 260, 25, "#596275");
    createPlatform(secondPlatformX, 510, 240, 25, "#596275");
    createTrampoline(trampolineX, 400, 190, 24, 20);
    createPlatform(
      260 + Math.floor(layoutRandom(4) * 260),
      290,
      240,
      25,
      "#596275",
    );
    createOneWayPlatform(600 + Math.floor(layoutRandom(5) * 180), 245, 190, 18);
    createPlatform(
      820 + Math.floor(layoutRandom(6) * 220),
      180,
      250,
      25,
      "#596275",
    );
    createTrampoline(440 + Math.floor(layoutRandom(7) * 180), 70, 190, 24, 22);
    generatedPlatformY = -40;

    // TODO 3 - Create Collectables

    // TODO 4 - Create Cannons

    //////////////////////////////////
    // ONLY CHANGE ABOVE THIS POINT //
    //////////////////////////////////
  }

  registerSetup(setup);
});

let generatedPlatformY = -40;
let generatedPlatformIndex = 0;
let generatedPlatformCount = 0;
let layoutSeed = Date.now() + Math.random() * 1000000;
let lastGeneratedX = 100;

function layoutRandom(index) {
  const value = Math.sin(layoutSeed + index * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function generateVerticalPlatforms() {
  while (generatedPlatformY > cameraOffset - 1400) {
    const pattern = Math.floor(layoutRandom(generatedPlatformIndex + 20) * 4);
    const colors = ["#596275", "#2d8f85", "#7b61a8", "#c27c3a"];
    const color = colors[pattern];
    const offset = Math.floor(layoutRandom(generatedPlatformIndex + 40) * 180);
    const platformWidth = 320 + Math.floor(layoutRandom(generatedPlatformIndex + 80) * 80);
    const platformXs = [40 + offset, 500 - offset / 2, 960 + offset / 2, 1420 - offset / 2, 1880];

    platformXs.forEach((x, segmentIndex) => {
      const width = Math.min(platformWidth, canvas.width - x - 40);
      if (pattern === 1 && segmentIndex === 2) {
        createOneWayPlatform(x, generatedPlatformY, width, 18);
      } else {
        createPlatform(x, generatedPlatformY, width, 24, color);
      }
      generatedPlatformCount++;

      if (layoutRandom(generatedPlatformIndex + segmentIndex + 100) > 0.84) {
        createTrampoline(x + 25, generatedPlatformY - 26, width - 50, 22, 21);
      }

      if (generatedPlatformCount % 35 === 0) {
        const powerUpType = layoutRandom(generatedPlatformCount + 120) > 0.5
          ? "super-jump"
          : "teleport";
        createPowerUp(x + width / 2 - 18, generatedPlatformY - 58, powerUpType);
      }
    });

    generatedPlatformY -= 105;
    generatedPlatformIndex++;
  }
}
