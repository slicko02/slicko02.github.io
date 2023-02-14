const canvas = document.getElementById("game");
const context = canvas.getContext("2d");
const grid = 15;
const paddleHeight = grid * 5; // 80
const maxPaddleY = canvas.height - grid - paddleHeight;
const winningScore = 7;

var gameIsOver = false;
var paddleSpeed = 6;
var ballSpeed = 5;
var scoreOne = 0;
var scoreTwo = 0;
var leftPaddle = {};
var rightPaddle = {};
var ball = {};

var t = setInterval(function () {
  document.getElementById("display").innerHTML = scoreOne;
  document.getElementById("displayTwo").innerHTML = scoreTwo;
}, 500);

const handleKeyUp = (e) => {
  if (e.which === 38 || e.which === 40) {
    leftPaddle.dy = 0;
  }

  if (e.which === 83 || e.which === 87) {
    leftPaddle.dy = 0;
  }
};

const handleKeyDown = (e) => {
  // up arrow key
  if (e.which === 38) {
    leftPaddle.dy = -paddleSpeed;
  }
  // down arrow key
  else if (e.which === 40) {
    leftPaddle.dy = paddleSpeed;
  }

  // w key
  if (e.which === 87) {
    leftPaddle.dy = -paddleSpeed;
  }
  // a key
  else if (e.which === 83) {
    leftPaddle.dy = paddleSpeed;
  }
};

const initialGame = () => {
  scoreOne = 0;
  scoreTwo = 0;
  leftPaddle = {
    // start in the middle of the game on the left side
    x: grid * 2,
    y: canvas.height / 2 - paddleHeight / 2,
    width: grid,
    height: paddleHeight,

    // paddle velocity
    dy: 0,
  };

  rightPaddle = {
    // start in the middle of the game on the right side
    x: canvas.width - grid * 3,
    y: canvas.height / 2 - paddleHeight / 2,
    width: grid,
    height: paddleHeight,

    // paddle velocity
    dy: 0,
  };

  ball = {
    // start in the middle of the game
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: grid,
    height: grid,

    // keep track of when need to reset the ball position
    resetting: false,

    // ball velocity (start going to the top-right corner)
    dx: ballSpeed,
    dy: -ballSpeed,
  };

  // listen to keyboard events to move the paddles
  document.addEventListener("keydown", handleKeyDown);

  // listen to keyboard events to stop the paddle if key is released
  document.addEventListener("keyup", handleKeyUp);
};

// check for collision between two objects using axis-aligned bounding box (AABB)
// @see https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
function collides(obj1, obj2) {
  return (
    obj1.x < obj2.x + obj2.width &&
    obj1.x + obj1.width > obj2.x &&
    obj1.y < obj2.y + obj2.height &&
    obj1.y + obj1.height > obj2.y
  );
}

function showModal(winner) {
  // stop the game
  document.removeEventListener("keydown", handleKeyDown);
  document.removeEventListener("keyup", handleKeyUp);
  ball.dx = 0;
  ball.dy = 0;
  cancelAnimationFrame(loop);

  // get the modal element and the winner text element
  const modal = document.getElementById("modal");
  const winnerText = document.getElementById("winner-text");

  // set the winner text
  winnerText.innerText = winner;

  // display the modal
  modal.style.display = "block";

  // get the reset button and add a click event listener
  const resetButton = document.getElementById("reset-button");
  resetButton.addEventListener("click", function () {
    // reset the score and close the modal
    initialGame();
    modal.style.display = "none";
  });
}

// game loop
function loop() {
  requestAnimationFrame(loop);
  context.clearRect(0, 0, canvas.width, canvas.height);

  // compute the distance between the ball and the center of the right paddle
  var paddleCenter = rightPaddle.y + rightPaddle.height / 2;
  var distance = ball.y - paddleCenter;

  // move the right paddle based on the distance
  if (distance < 0) {
    rightPaddle.dy = -ballSpeed;
  } else if (distance > 0) {
    rightPaddle.dy = ballSpeed;
  } else {
    rightPaddle.dy = 0;
  }

  // move paddles by their velocity
  leftPaddle.y += leftPaddle.dy;
  rightPaddle.y += rightPaddle.dy;

  // prevent paddles from going through walls
  if (leftPaddle.y < grid) {
    leftPaddle.y = grid;
  } else if (leftPaddle.y > maxPaddleY) {
    leftPaddle.y = maxPaddleY;
  }

  if (rightPaddle.y < grid) {
    rightPaddle.y = grid;
  } else if (rightPaddle.y > maxPaddleY) {
    rightPaddle.y = maxPaddleY;
  }

  // draw paddles
  context.fillStyle = "white";
  context.fillRect(
    leftPaddle.x,
    leftPaddle.y,
    leftPaddle.width,
    leftPaddle.height
  );
  context.fillRect(
    rightPaddle.x,
    rightPaddle.y,
    rightPaddle.width,
    rightPaddle.height
  );

  // move ball by its velocity
  ball.x += ball.dx;
  ball.y += ball.dy;

  // prevent ball from going through walls by changing its velocity
  if (ball.y < grid) {
    ball.y = grid;
    ball.dy *= -1;
  } else if (ball.y + grid > canvas.height - grid) {
    ball.y = canvas.height - grid * 2;
    ball.dy *= -1;
  }

  // reset ball if it goes past paddle (but only if we haven't already done so)
  if ((ball.x < 0 || ball.x > canvas.width) && !ball.resetting) {
    ball.resetting = true;

    if (ball.x < 0) {
      scoreTwo++;
      if (scoreTwo === winningScore) {
        showModal("Game Over! You Lose!");
      }
    } else if (ball.x > canvas.width) {
      scoreOne++;
      if (scoreOne === winningScore) {
        showModal("Congratulations! You Win!");
      }
    }

    // give some time for the player to recover before launching the ball again
    setTimeout(() => {
      ball.resetting = false;
      ball.x = canvas.width / 2;
      ball.y = canvas.height / 2;
    }, 400);
  }

  // check to see if ball collides with paddle. if they do change x velocity
  if (collides(ball, leftPaddle)) {
    ball.dx *= -1;
    // move ball next to the paddle otherwise the collision will happen again
    // in the next frame
    ball.x = leftPaddle.x + leftPaddle.width;
  } else if (collides(ball, rightPaddle)) {
    ball.dx *= -1;
    // move ball next to the paddle otherwise the collision will happen again
    // in the next frame
    ball.x = rightPaddle.x - ball.width;
  }

  // draw ball
  context.fillRect(ball.x, ball.y, ball.width, ball.height);

  // draw walls
  context.fillStyle = "lightgrey";
  context.fillRect(0, 0, canvas.width, grid);
  context.fillRect(0, canvas.height - grid, canvas.width, canvas.height);

  // draw dotted line down the middle
  for (let i = grid; i < canvas.height - grid; i += grid * 2) {
    context.fillRect(canvas.width / 2 - grid / 2, i, grid, grid);
  }
}

// start the game
initialGame();
requestAnimationFrame(loop);
