class Score_Board

  constructor: (@engine) ->
    @score_elt = document.getElementById("score")
    @lives_elt = document.getElementById("lives")

  update: =>
    @score_elt.innerHTML = "Score: #{@engine.score}"
    @lives_elt.innerHTML = "Lives: #{@engine.lives}"


    
class Engine

  constructor: ->

    @numCols = 5
    @numRows = 6
    @initLives = 10

    @colWidth = 101
    @rowHeight = 83

    @score_board = new Score_Board(this)

    @lastTime = null
    @enemies = []

    @player = null
    @paused = false

    @rowImages = [
      'images/water-block.png'   # Top row is water
      'images/stone-block.png'   # Row 1 of 3 of stone
      'images/stone-block.png'   # Row 2 of 3 of stone
      'images/stone-block.png'   # Row 3 of 3 of stone
      'images/grass-block.png'   # Row 1 of 2 of grass
      'images/grass-block.png'   # Row 2 of 2 of grass
      ]

    @resources = new Resources()
    @resources.onReady(@reset)
    @resources.load([
      'images/stone-block.png'
      'images/water-block.png'
      'images/grass-block.png'
      'images/enemy-bug.png'
      'images/char-boy.png'
      ])
    
    @canvas = document.createElement('canvas')
    @canvas.width = @numCols * @colWidth
    @canvas.height = @numRows * @rowHeight + 100
    @context = @canvas.getContext('2d')

    document.body.appendChild(@canvas)
    document.addEventListener('keyup', @on_keyup)



  # class Engine methods

  # player getter() and setter() methods
  setPlayer: (p) => @player = p
  getPlayer: => @player

  # add and get enemies
  addEnemy: (e) => @enemies.push(e)
  getEnemies: => @enemies

  # main loop
  main: =>
    now = Date.now()
    dt = (now - @lastTime) / 1000.0
    @update(dt)
    @render()
    if not @paused && @lives > 0 
      @lastTime = now
      window.requestAnimationFrame(@main)

  # pause the game
  toggle_pause: =>
    if @paused
      @start()
    else
      @stop()

  # initialize and start the game
  init: =>
    @paused = true
    @reset()

  stop: =>
    @paused = true
    
  start: =>
    if @lives < 1
      @reset()
    @lastTime = Date.now()
    @paused = false
    @main()

  # handle player key press
  on_keyup: (e) =>
    @player.handleInput({
      37: 'left'
      38: 'up'
      39: 'right'
      40: 'down'
      }[e.keyCode])

  # update the positions of the entities and act accordingly
  update: (dt) =>

    # update enemies
    for enemy in @enemies
      enemy.update(dt)
      
    # update player
    @player.update()

    # check for collisions
    for enemy in @enemies
      if (enemy.collision(@player))
        @lives--
        @score_board.update()
        if @lives > 0
          @player.reset()

    # check for success
    if (@player.y < 0) 
      @score++
      @score_board.update()
      @player.reset()


  # render the game board
  render: =>

    # render the background
    for row in [0...@numRows]
      img = @resources.get(@rowImages[row])
      for col in [0...@numCols]
        @context.drawImage(img, col * @colWidth, row * @rowHeight)

    # render the enemies
    for enemy in @enemies
      enemy.render()

    # render the player
    @player.render()


  # reset game 
  reset: =>
    @score = 0
    @lives = @initLives
    @score_board.update()
    @player.reset()
    for enemy in @enemies
      enemy.reset()
    @lastTime = Date.now()
    @render()



