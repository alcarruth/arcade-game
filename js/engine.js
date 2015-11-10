/*
 *  engine.js
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
 *   - class Engine()
 *   - window.engine which is an instance of Engine()
 */

/*
 * from jshint.com:
 *
 *   Metrics
 *
 *    - There are 14 functions in this file.
 *    - Function with the largest signature take 1 arguments, while
 *      the median is 0.5.
 *    - Largest function has 32 statements in it, while the median
 *      is 1.5.
 *    - The most complex function has a cyclomatic complexity value
 *      of 3 while the median is 1.
 */

/*
 * -----------------
 *  class: Engine()
 * -----------------
 *
 *  Engine() is a functional-style class definition.  It is intended
 *  as a 'singleton' class, ie a one-off definition of a single
 *  instance.  So Engine() is a constructor which, when called,
 *  creates a closure containing a number of vars, and then returns an
 *  object which exposes some of those vars as properties and methods
 *  of the instance.
 */
var Engine = function() {

    /*
     *  -----------------
     *  Engine properties
     *  -----------------
     */

    /*  TODO: do 'doc' and 'win' save us much?  I'm not so sure.
     *  They are only referenced a few times below.
     */
    var doc = document;
    var win = window;

    /*  TODO: find a better way to handle some of these global vars.
     *  The entities need access to the dimensions (or do they?)
     */
    var numCols = 5;
    var numRows = 6;
    var colWidth = 101;
    var rowHeight = 83;

    /*  score and lives are manipulated by the update() function.
     *  they are used for the scoreboard display.
     */
    var score = 0;
    var lives = 10;

    /*  score_board is used to display the player's score and
     *  number of lives left. It is used in update()
     */
    var score_board = {
        score: doc.getElementById("score"),
        lives: doc.getElementById("lives")
    };

    /*  'canvas', 'ctx', and 'lastTime' are used to display the
     *  game board.  'lastTime' is used in computing the
     *  elapsed time.
     */
    var canvas = doc.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var lastTime;

    /*  The player and the enemies are initialized by the
     *  functions setPlayer() and addEnemy().
     */
    var allEnemies = [];
    var player = null;

    /*  'rowImages' contains the images used in drawing the game
     *  background.  It is laid out so that the first image is
     *  used for the top row and the last image is for the bottom
     *  row.
     *
     *  TODO: Is this the best way to do this?  It facilitates the
     *  loop that draws the background in render(), which because of
     *  the frequency with which render() is called is possibly
     *  critical.
     */
    var rowImages = [
        'images/water-block.png',   // Top row is water
        'images/stone-block.png',   // Row 1 of 3 of stone
        'images/stone-block.png',   // Row 2 of 3 of stone
        'images/stone-block.png',   // Row 3 of 3 of stone
        'images/grass-block.png',   // Row 1 of 2 of grass
        'images/grass-block.png'    // Row 2 of 2 of grass
    ];

    var resources = win.Resources();

    /*  Prefetch all of the images we know we're going to
     *  need to draw our game level and set init() as the callback
     *  method, so that when all of these images are properly loaded
     *  our game will start.
     *
     *  TODO: 
     *  The global var 'resources' is an instance of functional-style
     *  class Resources()
     */
    resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/char-boy.png'
    ]);
    resources.onReady(init);

    /*  Setup the canvas for displaying the game.
     *  
     *  TODO: Consider refactoring to split off the game display from
     *  this Engine code.  At least put statements like the following
     *  into some cohesive function like init_display() or something.
     */
    canvas.width = numCols * colWidth;
    canvas.height = numRows * rowHeight + 100;
    doc.body.appendChild(canvas);

    /* This listens for key presses and sends the keys to your
     * Player.handleInput() method. You don't need to modify this.
     *
     *  TODO: this code used to be in app.js and seemed out of place
     *  there.  I put it here (just below
     *  'doc.body.appendChild(canvas)') because it seemed to fall into
     *  the same category of establishing the connections between the
     *  game data and the game view.  Hmmmm ...
     */
    doc.addEventListener('keyup', function(e) {
        var allowedKeys = {
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        };
        player.handleInput(allowedKeys[e.keyCode]);
    });

    /*
     *  --------------
     *  Engine methods 
     *  --------------
     */

    /* setter and getter for the player
     */
    function setPlayer(p) {
        player = p;
    }
    function getPlayer() {
        return player;
    }

    /* setter and getter for the enemies
     */
    function addEnemy(e) {
        allEnemies.push(e);
    }
    function getEnemies() {
        return allEnemies;
    }

    /*  This function serves as the kickoff point for the game loop
     *  itself and handles properly calling the update and render
     *  methods.
     *
     *  TODO: I'm not sure about the name 'main'.  Maybe 'main_loop'
     *  or 'run' (engines 'run', that's what they do !-) Using some
     *  verb seems appropriate.
     */
    function main() {

        var now = Date.now();
        var dt = (now - lastTime) / 1000.0;

        update(dt);
        render();

        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call
         * this function again as soon as the browser is able to draw
         * another frame.
         */
        win.requestAnimationFrame(main);
    }

    /*  This function does some initial setup that should only occur
     *  once, particularly setting the lastTime variable that is
     *  required for the game loop.
     *
     *  TODO: First of all, since init() calls main(), it's really
     *  more than initialization, it actually starts the game.  If it
     *  didn't call main() then it might better be considered
     *  initialization, but all it would be doing is setting the
     *  'lastTime' variable since 'reset()' is currently a no-op.
     *
     *  TODO: Secondly, what are all the steps in getting the game
     *  ready to run?  We load some javascript, initialize some data,
     *  load the document, pre-fetch some images and eventually start
     *  the game.  What exactly are the dependencies?  They seem to be
     *  scattered about, making it difficult to determine.
     *  
     */
    function init() {
        reset();
        lastTime = Date.now();
        main();
    }

    /*  Update all entity positions, check for collisions and adjust
     *  score_board accordingly.
     */
    function update(dt) {

        // update enemy positions
        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });

        // update player position
        player.update();

        // check for collisions
        allEnemies.forEach(function(enemy) {
            if (enemy.collision(player)) {
                player.reset();
                lives--;
                score_board.lives.innerHTML = 'Lives: ' + lives;
            }
        });

        // check for success
        if (player.y < 0) {
            score++;
            score_board.score.innerHTML = 'Score: ' + score;
            player.reset();
        }
    }

    /*  Render the game image.  render() is called each time through
     *  the main loop.  First we render the background, then the
     *  enemies and finally the player.
     */
    function render() {

        var img, row, col;
        
        // render the background
        for (row = 0; row < numRows; row++) {

            // There's no point in calling resources.get() each time
            // through the loop below.  Once we know the row we set
            // 'img' and refer to it instead.
            img = resources.get(rowImages[row]);

            for (col = 0; col < numCols; col++) {
                ctx.drawImage(img, col * colWidth, row * rowHeight);
            }
        }

        // render the enemies
        allEnemies.forEach( function(enemy) {
            enemy.render();
        });

        // render the player
        player.render();
    }

    /*  This function does nothing but it could have been a good place
     *  to handle game reset states - maybe a new game menu or a game
     *  over screen those sorts of things. It's only called once by
     *  the init() method.
     *
     *  TODO: Well if it's only called once by the init() method, then
     *  it hardly seems a good place to put 'Game Over' !-) But, some
     *  sort of settings menu seems like a good idea.  And a 'Game
     *  Over' screen, or at least message, is a good idea, but where
     *  should that go?  Clearly it would have to be called from
     *  update() which would check for lives == 0.  Similarly,
     *  update() could check for score >= target or something and
     *  displaying a 'You Win!!!' message or screen.
     */
    function reset() {
        // noop
    }

    /*  Returning the following object makes Engine() a functional
     *  style class definition, exposing links to private vars within
     *  the closure created by 'engine =Engine(this)' call below.
     */
    return {

        /* properties */
        numCols: numCols,
        numRows: numRows,
        colWidth: colWidth,
        rowHeight: rowHeight,
        ctx: ctx,
        resources: resources,

        /* methods */
        addEnemy: addEnemy,
        setPlayer: setPlayer,
        getPlayer: getPlayer,
        getEnemies: getEnemies
    };
};

window.engine = Engine(this);
