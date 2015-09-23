(function () {
  'use strict';
  /**
   * Base class for elements (players) of the game.
   * @param {int} x            x position in canvas
   * @param {int} y            y position in canvas
   * @param {int} width        width of the element inside the canvas
   * @param {int} height       width of the element inside the canvas
   * @param {int} speed        pixels/frame for moving our block
   * @param {string} direction top,right,left,down. String for moving our
   *                           element
   */
  function GameEntity(x, y, width, height, speed, direction) {
    this.x = x || 0;
    this.y = y || 0;
    this.width = width || 0;
    this.height = height || this.width;
    this.speed = speed || 2;
    this.direction = direction || 'none';
    this.collides = function () { return undefined; };
  }
  /**
   * Base class method, empty because it depends
   * of the type of entity.
   * 
   * @return undefined because need implementation
   */
  GameEntity.prototype.move = function () { return undefined; };
  /**
   * Draws the element on the canvas
   * 
   * @param  CanvasContext ctx   the context of the canvas, necesary
   *                             for drwawing elements;
   * @param  String        color the color of the element
   */
  GameEntity.prototype.fill = function (ctx, color) {
    if (ctx !== undefined) {
      ctx.fillStyle = color || '#fff';
      ctx.drawRectangle(this.x, this.y, this.width, this.height);
    }
  };
  /**
   * Abstract class, it will check if the element
   * collides with another element on the canvas
   * 
   * @return undefined because need implementation
   */
  GameEntity.prototype.collides = function () { return undefined; };
}());