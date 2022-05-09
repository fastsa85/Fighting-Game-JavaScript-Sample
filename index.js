const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;

const GAME_VELOCITY = 5;
const GAME_GRAVITY = 0.8;
const JUMP_VELOCITY = 20;
const ATTACK_TIME = 200; // milliseconds
const GAME_TIME = 60; // seconds
const GROUND_Y_POSITION = 330;
const CRITICAL_TIME = 15; // seconds left when timer gets red

const SAMURAI_MACK_HEALTH = 120;
const KENJI_HEALTH = 100;

const HIT_DAMAGE = 10;

const timerElement = document.querySelector('#timer');
const displayText = document.querySelector('#displayText');

const keys = {
  // player
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
  w: {
    pressed: false,
  },

  // enemy
  ArrowRight: {
    pressed: false,
  },
  ArrowLeft: {
    pressed: false,
  },
  ArrowUp: {
    pressed: false,
  },
};
let lastKey;

const background = new Sprite({
  position: { x: 0, y: 0 },
  imgSrc: './img/background.png',
});

const shop = new Sprite({
  position: { x: 624, y: 128 },
  imgSrc: './img/shop.png',
  scale: 2.75,
  framesMax: 6,
});

const samuraiMack = new Fighter({
  position: { x: 40, y: 0 },
  velocity: { x: 0, y: 0 },
  size: { width: 50, height: 150 },
  imgSrc: './img/samuraiMack/Idle.png',
  framesMax: 8,
  scale: 2.5,
  offset: { x: 215, y: 157 },
  sprites: {
    idle: {
      imgSrc: './img/samuraiMack/Idle.png',
      framesMax: 8,
    },
    run: {
      imgSrc: './img/samuraiMack/Run.png',
      framesMax: 8,
    },
    jump: {
      imgSrc: './img/samuraiMack/Jump.png',
      framesMax: 2,
    },
    fall: {
      imgSrc: './img/samuraiMack/Fall.png',
      framesMax: 2,
    },
    attack1: {
      imgSrc: './img/samuraiMack/Attack1.png',
      framesMax: 6,
    },
    attack2: {
      imgSrc: './img/samuraiMack/Attack2.png',
      framesMax: 6,
    },
    takeHit: {
      imgSrc: './img/samuraiMack/Take hit.png',
      framesMax: 4,
    },
    death: {
      imgSrc: './img/samuraiMack/Death.png',
      framesMax: 6,
    },
  },
  health: SAMURAI_MACK_HEALTH,
  attackBox: { offset: { x: 100, y: 50 }, width: 150, height: 50 },
});

const kenji = new Fighter({
  position: { x: canvas.width - 100, y: 0 },
  velocity: { x: 0, y: 0 },
  size: { width: 50, height: 150 },
  color: 'blue',
  imgSrc: './img/kenji/Idle.png',
  framesMax: 4,
  scale: 2.5,
  offset: { x: 215, y: 167 },
  sprites: {
    idle: {
      imgSrc: './img/kenji/Idle.png',
      framesMax: 4,
    },
    run: {
      imgSrc: './img/kenji/Run.png',
      framesMax: 8,
    },
    jump: {
      imgSrc: './img/kenji/Jump.png',
      framesMax: 2,
    },
    fall: {
      imgSrc: './img/kenji/Fall.png',
      framesMax: 2,
    },
    attack1: {
      imgSrc: './img/kenji/Attack1.png',
      framesMax: 4,
    },
    attack2: {
      imgSrc: './img/kenji/Attack2.png',
      framesMax: 4,
    },
    takeHit: {
      imgSrc: './img/kenji/Take hit.png',
      framesMax: 3,
    },
    death: {
      imgSrc: './img/kenji/Death.png',
      framesMax: 7,
    },
  },
  health: KENJI_HEALTH,
  attackBox: { offset: { x: -170, y: 50 }, width: 170, height: 150 },
});

let timer = GAME_TIME;
let timerId;
function decreaseTimer() {
  timerId = setTimeout(decreaseTimer, 1000);
  if (timer > 0) {
    timer--;
    timerElement.innerHTML = timer;
    if (timer < CRITICAL_TIME) timerElement.style.color = 'red';
  } else if (timer == 0) {
    determineWinner({ player: samuraiMack, enemy: kenji, timerId });
  }
}
decreaseTimer();

function animate() {
  window.requestAnimationFrame(animate);
  background.update();
  shop.update();

  context.fillStyle = 'rgba(255, 255, 255, 0.15)';
  context.fillRect(0, 0, canvas.width, canvas.height);

  samuraiMack.update();
  kenji.update();

  samuraiMack.velocity.x = 0;
  kenji.velocity.x = 0;

  // move samuraiMack
  if (keys.a.pressed && samuraiMack.lastKey === 'a') {
    samuraiMack.velocity.x = -GAME_VELOCITY;
    samuraiMack.switchSprite('run');
  } else if (keys.d.pressed && samuraiMack.lastKey === 'd') {
    samuraiMack.velocity.x = GAME_VELOCITY;
    samuraiMack.switchSprite('run');
  } else {
    samuraiMack.switchSprite('idle');
  }

  if (samuraiMack.velocity.y < 0) {
    samuraiMack.switchSprite('jump');
  } else if (samuraiMack.velocity.y > 0) {
    samuraiMack.switchSprite('fall');
  }

  // move kenji
  if (keys.ArrowLeft.pressed && kenji.lastKey === 'ArrowLeft') {
    kenji.velocity.x = -GAME_VELOCITY;
    kenji.switchSprite('run');
  } else if (keys.ArrowRight.pressed && kenji.lastKey === 'ArrowRight') {
    kenji.velocity.x = GAME_VELOCITY;
    kenji.switchSprite('run');
  } else {
    kenji.switchSprite('idle');
  }

  if (kenji.velocity.y < 0) {
    kenji.switchSprite('jump');
  } else if (kenji.velocity.y > 0) {
    kenji.switchSprite('fall');
  }

  // detect collision
  if (
    rectangularCollisions({ rectangle1: samuraiMack, rectangle2: kenji }) &&
    samuraiMack.isAttacking &&
    samuraiMack.framesCurrent === 4 // attacking frame
  ) {
    samuraiMack.isAttacking = false;
    kenji.takeHit();

    gsap.to('#enemyHealth', {
      width: (kenji.healthCurrent / KENJI_HEALTH) * 100 + '%',
    });
  }

  if (
    rectangularCollisions({ rectangle1: kenji, rectangle2: samuraiMack }) &&
    kenji.isAttacking &&
    kenji.framesCurrent === 2 // attacking frame
  ) {
    kenji.isAttacking = false;
    samuraiMack.takeHit();

    gsap.to('#playerHealth', {
      width: (samuraiMack.healthCurrent / SAMURAI_MACK_HEALTH) * 100 + '%',
    });
  }

  // attack misses
  if (samuraiMack.isAttacking && samuraiMack.framesCurrent === 4) {
    samuraiMack.isAttacking = false;
  }
  if (kenji.isAttacking && kenji.framesCurrent === 2) {
    kenji.isAttacking = false;
  }

  // end game based on health
  if (samuraiMack.healthCurrent <= 0 || kenji.healthCurrent <= 0) {
    determineWinner({ player: samuraiMack, enemy: kenji, timerId });
  }
}

animate();

window.addEventListener('keydown', (event) => {
  // samurai Mack keys
  if (!samuraiMack.dead) {
    switch (event.key) {
      case 'd':
        keys.d.pressed = true;
        samuraiMack.lastKey = 'd';
        break;
      case 'a':
        keys.a.pressed = true;
        samuraiMack.lastKey = 'a';
        break;
      case 'w':
        if (samuraiMack.position.y === GROUND_Y_POSITION) {
          samuraiMack.velocity.y = -JUMP_VELOCITY;
        }
        break;
      case 's':
        samuraiMack.attackOne();
        break;
      case ' ':
        samuraiMack.attackTwo();
        break;
    }
  }

  // kenji keys
  if (!kenji.dead) {
    switch (event.key) {
      case 'ArrowRight':
        keys.ArrowRight.pressed = true;
        kenji.lastKey = 'ArrowRight';
        break;
      case 'ArrowLeft':
        keys.ArrowLeft.pressed = true;
        kenji.lastKey = 'ArrowLeft';
        break;
      case 'ArrowUp':
        if (kenji.position.y === GROUND_Y_POSITION) {
          kenji.velocity.y = -JUMP_VELOCITY;
        }
        break;
      case 'ArrowDown':
        kenji.attackOne();
        break;
      case '0':
        kenji.attackTwo();
        break;
    }
  }
});

window.addEventListener('keyup', (event) => {
  switch (event.key) {
    // samuraiMack keys
    case 'd':
      keys.d.pressed = false;
      break;
    case 'a':
      keys.a.pressed = false;
      break;

    // kenji keys
    case 'ArrowRight':
      keys.ArrowRight.pressed = false;
      break;
    case 'ArrowLeft':
      keys.ArrowLeft.pressed = false;
      break;
  }
});
