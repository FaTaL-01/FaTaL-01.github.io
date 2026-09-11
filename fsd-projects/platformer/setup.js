// setup variables
const walkAcceleration = 2.5; // how much is added to the speed each frame
const gravity = 0.5; // how much is subtracted from speedY each frame
const friction = 1.5; // how much the player is slowed each frame
const maxSpeed = 8; // maximum horizontal speed, not vertical
const playerJumpStrength = 12; // this is subtracted from the speedY each jump
const projectileSpeed = 8; // the speed of projectiles
let shouldDrawGrid = false;
let gridMade = false;

/////////////////////////////////////////////////
//////////ONLY CHANGE ABOVE THIS POINT///////////
/////////////////////////////////////////////////

// Base game variables
const frameRate = 60;
const playerScale = 0.8; //makes the player just a bit smaller. Doesn't affect the hitbox, just the image

// Player variables
const player = {
  x: 50,
  y: 100,
  speedX: 0,
  speedY: 0,
  width: undefined,
  height: undefined,
  onGround: false,
  facingRight: true,
  deadAndDeathAnimationDone: false,
  winConditionMet: false,
  cash: 500,
  keybinds: {
    w: false,
    a: false,
    s: false,
    d: false,
    space: false,
  },
};

const movementBundleKeys = ["w", "a", "s", "d", "space"];

const keybindPrices = {
  w: 50,
  a: 50,
  s: 50,
  d: 50,
  space: 50,
};

const movementBundlePrice = movementBundleKeys.reduce(
  (total, key) => total + keybindPrices[key],
  0,
);

const keybindInfo = {
  w: { label: "W", action: "go forwards" },
  a: { label: "A", action: "move left" },
  s: { label: "S", action: "move down" },
  d: { label: "D", action: "move right" },
  space: { label: "Space", action: "jump and hit skill checks" },
};

let hitDx;
let hitDy;
let hitBoxWidth = 50 * playerScale;
let hitBoxHeight = 105 * playerScale;
let firstTimeSetup = true;

const keyPress = {
  any: false,
  up: false,
  left: false,
  down: false,
  right: false,
  space: false,
};

let respawnSkillActive = false;
let respawnSkillMeter = 0.5;
let respawnSkillDirection = 1;
const respawnSkillSpeed = 0.015;
const respawnSkillWindowMin = 0.42;
const respawnSkillWindowMax = 0.58;
let respawnSkillFailed = false;
let pendingKeybindPurchase = null;
let secretPayToWinSequence = "";
let cashCodeSequence = "";
let superCodeSequence = "";
let payToWinPromptOpen = false;
const payToWinPrice = 100000;

// Player animation variables
const animationTypes = {
  duck: "duck",
  flyingJump: "flying-jump",
  frontDeath: "front-death",
  frontIdle: "front-idle",
  jump: "jump",
  lazer: "lazer",
  run: "run",
  stop: "stop",
  walk: "walk",
};
let currentAnimationType = animationTypes.run;
let frameIndex = 0;
let jumpTimer = 0;
let duckTimer = 0;
let DUCK_COUNTER_IDLE_VALUE = 14;
let debugVar = false;

let spriteHeight = 0;
let spriteWidth = 0;
let spriteX = 0;
let spriteY = 0;
let offsetX = 0;
let offsetY = 0;

// Platform, cannon, projectile, and collectable variables
let platforms = [];
let fakePlatforms = [];
let badPlatforms = [];
let cannons = [];
const cannonWidth = 118;
const cannonHeight = 80;
let projectiles = [];
const defaultProjectileWidth = 24;
const defaultProjectileHeight = defaultProjectileWidth;
const collectableWidth = 40;
const collectableHeight = 40;
let collectables = [];
let baitHearts = [];

// canvas and context variables; must be initialized later
let canvas;
let ctx;

// setup function variable
let setup;

// Timer variable
let runStartedAt;
let runEndedAt = null;
let leaderboardSavedForRun = false;

let mathChallengeActive = false;
let mathChallengePrompt = "";
let mathChallengeAnswer = 0;
let mathChallengeInput = "";
let mathChallengeError = "";
let nextMathChallengeAt = 0;

let halleImage;
let animationDetails = {};

var collectableList = {
  database: { image: "images/collectables/database.png" },
  diamond: { image: "images/collectables/diamond-head.png" },
  grace: { image: "images/collectables/grace-head.png" },
  kennedi: { image: "images/collectables/kennedi-head.png" },
  max: { image: "images/collectables/max-head.png" },
  steve: { image: "images/collectables/steve-head.png" },
};
