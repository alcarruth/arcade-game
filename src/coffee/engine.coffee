
class Engine

  constructor: ->
    @numCols = 5
    @numRows = 6
    @colWidth = 101
    @rowHeight = 83
    @score = 0
    @lives = 10

    @score_board = [
      score: document.getElementById("score")
      lives: document.getElementById("lives")
    ]
    @canvas = document.createElement('canvas')
    @ctx = canvas.getContext('2d')
    @lastTime = null
    @enemies = []
    @player = null

    @rowImages = [
      'images/water-block.png',   # Top row is water
      'images/stone-block.png',   # Row 1 of 3 of stone
      'images/stone-block.png',   # Row 2 of 3 of stone
      'images/stone-block.png',   # Row 3 of 3 of stone
      'images/grass-block.png',   # Row 1 of 2 of grass
      'images/grass-block.png'    # Row 2 of 2 of grass
    ]
    @resources = window.Resources()
    @resources.load([
      'images/stone-block.png',
      'images/water-block.png',
      'images/grass-block.png',
      'images/enemy-bug.png',
      'images/char-boy.png'
    ])
    @resources.onReady(init)
    @canvas.width = numCols * colWidth
    @canvas.height = numRows * rowHeight + 100
    @document.body.appendChild(canvas)
    @document.addEventListener('on_keyup', @on_keyup)


  @on_keyup: (e) =>
    direction =  {
      37: 'left'
      38: 'up'
      39: 'right'
      40: 'down'
      }[e.keyCode]
    @player.handleInput(direction)


  ###
   Methods
  ###

  setPlayer: (p) => @player = p
  getPlayer: => @player

  addEnemy: (e) => @enemies.push(e)
  getEnemies: => @enemies

  main: =>
    now = Date.now()
    dt = (now - lastTime) / 1000.0
    @update(dt)
    @render()
    @lastTime = now
    window.requestAnimationFrame(@main)

  init: =>
    @reset()
    @lastTime = Date.now()
    @main()

  update: (dt) =>
    @enemies.forEach((enemy) -> enemy.update(dt))
    @player.update()

    # check for collisions
    @enemies.forEach((enemy) ->
      if (enemy.collision(@player))
        @player.reset()
        @lives--
        @score_board.lives.innerHTML = 'Lives: ' + @lives

    # check for success
    if (@player.y < 0) 
      @score++
      @score_board.score.innerHTML = 'Score: ' + @score
      @player.reset()

  render: =>
    # render the background
    for row in [0...@numRows]
      img = resources.get(@rowImages[row])
      for col in [0...@numCols]
        ctx.drawImage(img, col * @colWidth, row * @rowHeight)

    # render the enemies
    @enemies.forEach( (enemy) -> enemy.render())

    # render the player
    @player.render()

  reset: ->  # noop


