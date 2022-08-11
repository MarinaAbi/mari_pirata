const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Constraint = Matter.Constraint;

var engine, world, backgroundImg, boat;
var canvas, angle, tower, ground, cannon;
var boatSpriteSheet,
  boatSpriteData,
  boatBrokenSpriteSheet,
  boatBrokenSpriteData;
var waterSplashSheet, waterSplashData;

var boatAnimation = [];
var boatBrokenAnimation = [];
var waterSplashAnimation = [];
var balls = [];
var boats = [];

var isGameOver = false;
var isLaughing = false;

var laughMusic, waterMusic, explosionMusic, bkMusic;

var score = 0;

function preload() {
  backgroundImg = loadImage('./assets/background.gif');
  towerImage = loadImage('./assets/tower.png');

  boatSpriteSheet = loadImage('./assets/boat/boat.png');
  boatSpriteData = loadJSON('./assets/boat/boat.json');

  boatBrokenSpriteSheet = loadImage('./assets/boat/brokenBoat.png');
  boatBrokenSpriteData = loadJSON('./assets/boat/brokenBoat.json');

  waterSplashSheet = loadImage('./assets/waterSplash/waterSplash.png');
  waterSplashData = loadJSON('./assets/waterSplash/watersplash.json');

  laughMusic = loadSound('./assets/pirate_laugh.mp3');
  waterMusic = loadSound('./assets/cannon_water.mp3');
  explosionMusic = loadSound('./assets/cannon_explosion.mp3');
  bkMusic = loadSound('./assets/background_music.mp3');
}

function setup() {
  canvas = createCanvas(1200, 600);

  engine = Engine.create();
  world = engine.world;

  angleMode(DEGREES);
  angle = 15;

  ground = Bodies.rectangle(0, height - 1, width * 2, 1, { isStatic: true });
  World.add(world, ground);

  tower = Bodies.rectangle(160, 350, 160, 310, { isStatic: true });
  World.add(world, tower);

  cannon = new Cannon(180, 110, 130, 100, angle);

  var boatFrames = boatSpriteData.frames;
  for (var i = 0; i < boatFrames.length; i++) {
    var pos = boatFrames[i].position;
    var img = boatSpriteSheet.get(pos.x, pos.y, pos.w, pos.h);
    boatAnimation.push(img);
  }

  var boatBrokenFrames = boatBrokenSpriteData.frames;
  for (var i = 0; i < boatBrokenFrames.length; i++) {
    var pos = boatBrokenFrames[i].position;
    var img = boatBrokenSpriteSheet.get(pos.x, pos.y, pos.w, pos.h);
    boatBrokenAnimation.push(img);
  }

  var waterSplashFrames = waterSplashData.frames;
  for (var i = 0; i < waterSplashFrames.length; i++) {
    var pos = waterSplashFrames[i].position;
    var img = waterSplashSheet.get(pos.x, pos.y, pos.w, pos.h);
    waterSplashAnimation.push(img);
  }
}

function draw() {
  background(189);
  image(backgroundImg, 0, 0, width, height);
  if (!bkMusic.isPlaying()) {
    bkMusic.play();
    bkMusic.setVolume(0.1);
  }

  Engine.update(engine);

  rect(ground.position.x, ground.position.y, width * 2, 1);

  push();
  imageMode(CENTER);
  image(towerImage, tower.position.x, tower.position.y, 160, 310);
  pop();

  showBoats();

  for (var i = 0; i < balls.length; i++) {
    showCannonBalls(balls[i], i);
    collisionWithBoat(i);
  }

  cannon.display();

  fill('#6d4c41');
  textSize(40);
  text(`Pontuação: ${score}`, width - 200, 50);
  textAlign(CENTER, CENTER);
}

function keyPressed() {
  if (keyCode === DOWN_ARROW) {
    var cannonBall = new CannonBall(cannon.x, cannon.y);
    cannonBall.trajectory = [];
    Matter.Body.setAngle(cannonBall.body, cannon.angle);
    balls.push(cannonBall);
  }
}

function keyReleased() {
  if (keyCode === DOWN_ARROW) {
    balls[balls.length - 1].shoot();
    explosionMusic.play();
  }
}

function showCannonBalls(ball, index) {
  if (ball) {
    ball.display();
    ball.animate();

    if (ball.body.position.x >= width || ball.body.position.y >= height - 50) {
      ball.remove(index);
      waterMusic.play();
    }
  }
}

function showBoats() {
  if (boats.length > 0) {
    if (
      boats[boats.length - 1] === undefined ||
      boats[boats.length - 1].body.position.x < width - 300
    ) {
      var positions = [-40, -60, -70, -20];
      var position = random(positions);
      var boat = new Boat(
        width,
        height - 100,
        170,
        170,
        position,
        boatAnimation
      );

      boats.push(boat);
    }

    for (var i = 0; i < boats.length; i++) {
      if (boats[i]) {
        Matter.Body.setVelocity(boats[i].body, {
          x: -0.9,
          y: 0
        });

        boats[i].display();
        boats[i].animate();

        var collision = Matter.SAT.collides(this.tower, boats[i].body);

        if (collision.collided && !boats[i].isBroken) {
          isGameOver = true;
          //gameOver();
          if (!laughMusic.isPlaying() && !isLaughing) {
            isLaughing = true;
            laughMusic.play();
          }
        }
      }
    }
  } else {
    var boat = new Boat(width, height - 60, 170, 170, -60, boatAnimation);
    boats.push(boat);
  }
}

function collisionWithBoat(index) {
  for (var i = 0; i < boats.length; i++) {
    if (balls[index] !== undefined && boats[i] !== undefined) {
      var collision = Matter.SAT.collides(balls[index].body, boats[i].body);

      if (collision.collided) {
        boats[i].remove(i);
        score += 5

        Matter.World.remove(world, balls[index].body);
        delete balls[index];
      }
    }
  }
}

function gameOver() {
  swal(
    {
      title: `Fim de Jogo!!!`,
      text: 'Obrigada por jogar!!',
      imageUrl:
        'https://raw.githubusercontent.com/whitehatjr/PiratesInvasion/main/assets/boat.png',
      imageSize: '150x150',
      confirmButtonText: 'Jogar Novamente'
    },
    function (isConfirm) {
      if (isConfirm) {
        location.reload();
      }
    }
  );
}
