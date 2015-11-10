/*
 *  app.js
 *
 *  Author: Al Carruth
 *  Origin: git@github.com:alcarruth/frontend-p3-arcade-game.git
 *
 *  This file is part a project submitted by the author for the
 *  Udacity Front End Web Developer Nanodegree, Project 3 Classic
 *  Arcade Game clone.
 */

/*
 *  Here we define the following:
 *
 *   - Class Entity() a superclass
 *   - Class Enemy() which extends Entity()
 *   - Class Player() which extends Entity()
 *   - Function createEntities()
 */

/*
 * from jshint.com:
 *
 * Metrics
 *
 * - There are 10 functions in this file.
 * - Function with the largest signature take 4 arguments, while
 *   the median is 1.
 * - Largest function has 13 statements in it, while the median is 5.
 * - The most complex function has a cyclomatic complexity value of
 *   10 while the median is 1.
 */

/*
 * -----------------
 *  Class: Entity()
 * -----------------
 *
 * usage: Entity() is intended to be sub-classed,
 *        rather than called directly.
 * 
 * args:
 *   engine: the game engine, an instance of Engine()
 *   init_x: the initial x position for the sprite
 *   init_y: the initial y position for the sprite
 *   sprite: url / path to the sprite image file
 */
var Entity = function(engine, init_x, init_y, sprite) {

    this.x = init_x;
    this.y = init_y;
    this.engine = engine;
    this.numCols = engine.numCols;
    this.numRows = engine.numRows;
    this.colWidth = engine.colWidth;
    this.rowHeight = engine.rowHeight;
    this.ctx = engine.ctx;
    this.resources = engine.resources;

    this.init_x = init_x;
    this.init_y = init_y;
    this.sprite = sprite;
    this.reset();
};

/*  Entity() method: reset()
 */
Entity.prototype.reset = function() {
    this.x = this.init_x;
    this.y = this.init_y;
};

/*  Entity() method: render()
 */
Entity.prototype.render = function() {
    var img = this.resources.get(this.sprite);
    this.ctx.drawImage(img, this.x, this.y);
};

/*
 * ---------------------------------
 *  Class: Enemy() extends Entity()
 * ---------------------------------
 * 
 *  usage:  enemy = new Enemy(engine, row, speed)
 * 
 *  args:
 *     engine: the game engine, an instance of Engine()
 *     row: the row which the enemy will traverse.
 *     speed: the speed at which the enemy moves.
 *            min: 1, max: 10
 */
var Enemy = function(engine, row, speed, sprite) {

    // some of the images are taller than the rows
    // so I tweaked it here.
    var offset = -20;
    var x_init = -engine.colWidth;
    var y_init = (engine.numRows-row-1) * engine.rowHeight + offset;

    Entity.call(this, engine, x_init, y_init, sprite);

    // speed is 1 (min) .. 10 (max).
    this.speed = speed;
};

// The 'Enemy() extends Entity()' relationship.
Enemy.prototype = Object.create(Entity.prototype);
Enemy.prototype.constructor = Enemy;

/*  Enemy method: collision()
 *  
 *  Detect whether player has attempted to occupy the same square.
 *  If he has, too bad for him!
 *
 *  usage: enemy.collision(player)
 *  returns: boolean, true indicates there was a collision.
 *  args: 
 *    entity: the entity to be checked for collision.
 *
 *  TODO: The computation of the collision boolean is complicated
 *  by the fact that the enemies (bugs in our case) don't move
 *  a square at a time, like the player, but at a 'continuous'
 *  speed across the row.  Hence an enemy can occupy more than one
 *  square, or at least parts thereof.  
 */
Enemy.prototype.collision = function(entity) {

    var x_min = Math.floor(this.x/this.colWidth) * this.colWidth;
    var x_max = x_min + 2 * this.colWidth;
    var y_min = Math.floor(this.y/this.rowHeight) * this.rowHeight;
    var y_max = y_min + this.rowHeight;

    var collision = 
            entity.x >= x_min &&
            entity.x <  x_max &&
            entity.y >= y_min &&
            entity.y <  y_max;

    return collision;
};

/*  Enemy method: update()
 *
 *  Called by engine.update() to update the enemy's position
 *  usage: enemy.update(dt)
 *  args:
 *     dt: the elapsed time since last update.
 */
Enemy.prototype.update = function(dt) {

    // change in x
    var dx;

    // reset if at right edge
    if (this.x >= this.numCols * this.colWidth) {
        this.reset();
    }
    // otherwise increase x position appropriately
    else {
        dx = this.speed/5 * dt * this.colWidth;
        this.x = this.x + dx;
    }
};

/*
 * ----------------------------------
 *  Class: Player() extends Entity()
 * ----------------------------------
 */
var Player = function(engine, sprite) {

    // Should I think in terms of rows and columns?
    // or in terms of pixels (i.e. x and y) ?
    // In general, the answer is 'pixels'.

    // start on the bottom row
    var row = 1;

    // in the middle column
    var col = (engine.numCols+1)/2;

    // some of the images are taller than the rows
    // so I tweaked it here.
    var offset = -10;
    var x_init = (col-1) * engine.colWidth;
    var y_init = (engine.numRows-row) * engine.rowHeight + offset;
    Entity.call(this, engine, x_init, y_init, sprite);
};

// The 'Player() extends Entity()' relationship
Player.prototype = Object.create(Entity.prototype);
Player.prototype.constructor = Player;

/*  Player method: update() 
 *
 *  This is a no-op since player's movement depends only on keyboard
 *  input and not on dt.  However, player.update() _is_ called from
 *  engine.update() so it must exist.  Also, one might imagine that,
 *  in some future enhancements to the game, the player might be
 *  subject to other forces, e.g. gravity, in addition to keyboard
 *  input.
 */
Player.prototype.update = function(dt) {
    // without the following, jshint complains about an unused
    // variable. I could just remove it from the parameter list since
    // javascript is pretty loose about the matching of actual
    // parameters with formal parameters, but I thought it better to
    // preserve the signature.
    dt = dt;
};

/*  Player method: handleInput()
 *   - handle player keyboard input
 *
 *  usage: player.handleInput(direction)
 *  args:
 *    direction: 'left', 'right', 'up' or 'down'
 *  result: players (x,y) adjusted accordingly
 *
 *  TODO: check the arithmetic.  Why did I have to put this.numRows-2
 *  in the 'down' case?  It seems to work but it doesn't make sense to
 *  me.  Check the sizes of the images and see if we can make this
 *  more precise.  The images seem to all be 101 pixels wide, which is
 *  the same as the column width, but they are taller than the row
 *  height.  Why is that and what does that mean here?
 *
 *  AND remember: 'up is down and down is up'. y? idk !-)
 */
Player.prototype.handleInput = function(direction) {

    switch (direction) {

    case 'left':
        if (this.x > 0) {
            this.x -= this.colWidth;
        }
        break;

    case 'right':
        if (this.x < (this.numCols-1) * this.colWidth) {
            this.x += this.colWidth;
        }
        break;

    case 'up':
        if (this.y >= this.rowHeight) {
            this.y -= this.rowHeight;
        }
        else if (this.y > 0) {
            this.y -= this.rowHeight;
        }
        else {
            this.reset();
        }
        break;

    case 'down':
        // why minus 2 ? 
        if (this.y < (this.numRows - 2) * this.rowHeight) {
            this.y += this.rowHeight;
        }
        break;
    }
};

/*
 * -----------------------------------
 *  function: createEntities()
 * -----------------------------------
 *  
 *  creates all the entities for the game
 *  usage: createEntities(window.engine);
 */
var createEntities = function(engine) {

    /*  Create a new Player object
     */
    engine.setPlayer(new Player(engine, "images/char-boy.png"));

    /*  Create several Enemy objects
     */
    engine.addEnemy(new Enemy(engine, 3, 8, 'images/enemy-bug.png'));
    engine.addEnemy(new Enemy(engine, 4, 7, 'images/enemy-bug.png'));
    engine.addEnemy(new Enemy(engine, 2, 5, 'images/enemy-bug.png'));
};

createEntities(window.engine);
