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
      runStartedAt = performance.now();
      //start game
      setInterval(main, 1000 / frameRate);
    }

    // Create walls - do not delete or modify this code
    createPlatform(-50, -50, canvas.width + 100, 50); // top wall
    createPlatform(
      -50,
      canvas.height - 10,
      canvas.width + 100,
      200,
      "rgb(118, 0, 233)",
    ); // bottom wall
    createPlatform(-50, -50, 50, canvas.height + 500); // left wall
    createPlatform(canvas.width, -50, 50, canvas.height + 100); // right wall

    // ONL BELOW POINT //

    // TODO 1 - Enable the Grid
    //toggleGrid();

    // TODO 2 - Create Platforms

    createPlatform(300, 607, 150, 10, "blue");

    createPlatform(600, 500, 150, 10, "green");

    createPlatform(900, 400, 150, 10, "purple");

    createPlatform(600, 300, 150, 10, "green");

    createPlatform(300, 200, 150, 10, "blue");

    // TODO 3 - Create Collectables

    createCollectable("max", 300, 550, 0, 0);

    createCollectable("diamond", 1000, 350, 0, 0);

    createCollectable("steve", 300, 150, 0, 0);

    // TODO 4 - Create Cannons

    createCannon("top", 450, 900);

    createCannon("right", 750, 3500);

    createCannon("left", 200, 2000);

    // ONLY  POINT //
  }

  registerSetup(setup);
});
