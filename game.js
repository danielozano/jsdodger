/*jslint browser: true*/
/**
 * Ya se crea un enemigo, se actualiza, y se comprueba si colisiona
 * o no con el jugador.
 * Este enemigo se resetea reutilizandose en una posición nueva.
 *
 * TODO: añadir colección de enemigos que vaya aumentando su número
 * mientras transcurre el tiempo de juego.
 *
 * Necesito:
 *  - Contabilizar los segundos que llevo jugando. X
 *  - Crear una forma de aumentar el número de enemigos creados.
 *  - Aumentar número de enemigos creados según avanza el tiempo.
 *  - Crear un gameover y una forma de resetear el juego
 */
(function () {
  'use strict';
  var canvas;
  var ctx;
  var lastKey;
  var player;
  var enemies = [];
  var startTime;
  var gameTime;
  var gameOver = false;
  var pause = false;
  var animFrame;
  var startButton;

  // create animation frame function
  window.requestAnimFrame = (function () {
    return window.requestAnimationFrame   ||
      window.webkitRequestAnimationFrame  ||
      window.mozRequestAnimationFrame   ||
      window.oRequestAnimationFrame   ||
      window.msRequestAnimationFrame    ||
      function (callback) {
        window.setTimeout(callback, 1000 / 60);
      };
  }());
  /**
   * Base class for elements (players) of the game.
   */
  function GameEntity(x, y, width, height, speed, direction) {
    this.x = x || 0;
    this.y = y || 0;
    this.width = width || 0;
    this.height = height || this.width;
    this.speed = speed || 2;
    this.direction = direction || 'none';
    this.color = '#fff';
  }
  /**
   * Base class method, empty because it depends
   * of the type of entity.
   */
  GameEntity.prototype.move = function () { return undefined; };
  GameEntity.prototype.collidesRect = function () { return 'test'; };
  /**
   * Draws the element on the canvas
   */
  GameEntity.prototype.fill = function (color) {
    this.color = color || this.color;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  };
  /**
   * Abstract class, it will check if the element
   * collides with another element on the canvas
   */
  GameEntity.prototype.collides = function () { return undefined; };

  /**
   * GamePlayer construct. Represents the player controlled
   * by the user.
   */
  function GamePlayer(x, y, width, height, speed, direction) {
    GameEntity.call(this, x, y, width, height, speed, direction);
  }
  GamePlayer.prototype = Object.create(GameEntity.prototype);
  GamePlayer.prototype.constructor = GamePlayer;
  GamePlayer.prototype.move = function (speed) {
    // default speed: 2
    this.speed = speed || this.speed;

    if (this.direction === 'right') {
      this.x += this.speed;
      ctx.clearRect(this.x - this.speed, this.y, this.width, this.height);
    } else if (this.direction === 'left') {
      this.x -= this.speed;
      ctx.clearRect(this.x + this.speed, this.y, this.width, this.height);
    } else {
      console.log('Not supported direction');
    }
  };
  GamePlayer.prototype.collidesRect = function (element) {
    return (this.x < element.x + element.width  &&
      element.x < this.x + this.width           &&
      this.y < element.y + element.height       &&
      element.y < this.y + this.height);
  };
  /**
   * Clase Enemy, para generar enemigos
   */
  function Enemy(x, y, width, height, speed, direction) {
    this.active = true;
    GamePlayer.call(this, x, y, width, height, speed, direction);
  }
  Enemy.prototype = Object.create(GamePlayer.prototype);
  Enemy.prototype.constructor = Enemy;
  Enemy.prototype.move = function () {
    // mover hacia abajo a velocidades aleatorias, y con posiciones x aleatorias.
    this.y += this.speed;
    ctx.clearRect(this.x, this.y - this.height, this.width, this.height);
    // desactivar si se sale del canvas
    if (this.y > canvas.height) {
      this.reset(this);
    }
  };
  Enemy.prototype.reset = function (enemy) {
    var width = Math.floor(Math.random() * (20 - 10)) + 10 + 1;
    var height = width;
    var x = Math.floor(Math.random() * (canvas.width - width)) + width;
    var speed = Math.floor(Math.random() * (7 - 3)) + 3;
    enemy.x = x;
    enemy.y = 0;
    enemy.height = height;
    enemy.width = width;
    enemy.speed = speed;
  };
  /**
   * Main class, the Game
   */
  function Game(canvas, ctx) {
    this.canvas = canvas || undefined;
    this.ctx = ctx || undefined;
    this.player = undefined;
  }
  Game.prototype.draw = function () {
    var enemy;
    // draw player
    player.fill();
    // draw enemies
    for (enemy in enemies) {
      if (enemies.hasOwnProperty(enemy)) {
        enemies[enemy].fill();
      }
    }
  };
  Game.prototype.genEnemies = function () {
    var width = Math.floor(Math.random() * (20 - 10)) + 10 + 1;
    var height = width;
    var x = Math.floor(Math.random() * (canvas.width - width)) + width;
    var y = height;
    var speed = Math.floor(Math.random() * (5 - 2)) + 2;
    this.enemy = new Enemy(x, y, width, height, speed);
    enemies.push(this.enemy);
  };
  Game.prototype.init = function () {
    gameOver = false;
    pause = false;
    // iniciar tiempo de juego
    startTime = Date.now();
    // initialize event listener
    window.addEventListener('keydown', function (event) {
      lastKey = event.which;
    });
    window.addEventListener('keyup', function () {
      lastKey = undefined;
    });
    // initialize player
    player = new GamePlayer(10, canvas.height - 20, 10, 10);
    this.genEnemies();
    this.genEnemies();
    this.genEnemies();
    this.genEnemies();
    this.draw();
    this.run();
  };
  Game.prototype.update = function () {
    if (gameOver) {
      this.gameOver();
      return;
    }
    if (lastKey === 32) {
      pause = !pause;
      lastKey = undefined;
    }
    var enemy;
    var nowTime;
    // establecer tiempo actual
    if (pause !== false) {
      nowTime = Date.now();
      gameTime = (nowTime - startTime) / 1000;
      // move all enemies
      for (enemy in enemies) {
        if (enemies.hasOwnProperty(enemy)) {
          if (enemies[enemy].active) {
            enemies[enemy].move();
            if (player.collidesRect(enemies[enemy])) {
              // hay colisión
              enemies[enemy].active = false;
              gameOver = true;
            }
          }
        }
      }
      // mover jugador si se presiona tecla
      if (lastKey !== undefined) {
        if (lastKey === 37) {
          player.direction = 'left';
        } else if (lastKey === 38) {
          player.direction = 'up';
        } else if (lastKey === 39) {
          player.direction = 'right';
        } else if (lastKey === 40) {
          player.direction = 'down';
        }
        // move player
        player.move(5);
      }
    }
  };
  Game.prototype.run = function () {
    animFrame = requestAnimFrame(Game.prototype.run);
    Game.prototype.update();
    Game.prototype.draw();
  };
  Game.prototype.gameOver = function () {
    lastKey = null;
    ctx.fillStyle = '#fff';
    ctx.font = "2em Arial";
    ctx.fillText('Game Over', 200, Math.floor(canvas.height / 2));
    window.cancelAnimationFrame(animFrame);
  };
  // get canvas, context and init the game
  canvas = document.getElementById('game');
  var game = new Game(canvas, ctx);
  ctx = canvas.getContext('2d');
  startButton = document.getElementById('start');
  startButton.addEventListener('click', function (event) {
    event.preventDefault();
    game.init();
  });
}());