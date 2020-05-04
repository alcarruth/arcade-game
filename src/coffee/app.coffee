
class Entity

  constructor: (engine, @init_x, @init_y, @sprite) ->
    @numCols = engine.numCols
    @numRows = engine.numRows
    @colWidth = engine.colWidth
    @rowHeight = engine.rowHeight
    @context = engine.context
    @resources = engine.resources
    @reset()

  reset: =>
    @x = @init_x
    @y = @init_y

  render: =>
    img = @resources.get(@sprite)
    @context.drawImage(img, @x, @y)


class Enemy extends Entity

  constructor: (engine, row, speed, sprite) ->

    # some of the images are taller than the rows
    # so I tweaked it here.
    offset = -20
    x_init = -engine.colWidth
    y_init = (engine.numRows-row-1) * engine.rowHeight + offset
    super(engine, x_init, y_init, sprite)

    # speed is 1 (min) .. 10 (max).
    @speed = speed

  collision: (entity) =>
    x_min = Math.floor(@x/@colWidth) * @colWidth
    x_max = x_min + 2 * @colWidth
    y_min = Math.floor(@y/@rowHeight) * @rowHeight
    y_max = y_min + @rowHeight
    collision = 
      entity.x >= x_min && entity.x <  x_max &&
      entity.y >= y_min && entity.y <  y_max
    return collision

  update: (dt) =>
    # reset if at right edge
    if (@x >= @numCols * @colWidth) 
      @reset()

    # otherwise increase x position appropriately
    else 
      dx = @speed/5 * dt * @colWidth
      @x = @x + dx



class Player extends Entity

  constructor: (engine, sprite) ->
    # start on the bottom row
    row = 1
    # in the middle column
    col = (engine.numCols+1)/2

    # some of the images are taller than the rows
    # so I tweaked it here.
    offset = -10
    x_init = (col-1) * engine.colWidth
    y_init = (engine.numRows-row) * engine.rowHeight + offset

    super(engine, x_init, y_init, sprite)


  update: (dt) =>
    dt = dt

  handleInput: (direction) =>
    console.log("direction: #{direction}")
    move = {
      left: @move_left
      right: @move_right
      up: @move_up
      down: @move_down
      }[direction]
    if move?
      move()

  move_left: =>
    if (@x > 0)
      @x -= @colWidth

  move_right: =>
    if (@x < (@numCols-1) * @colWidth)
      @x += @colWidth

  move_up: =>
    if (@y >= @rowHeight) 
      @y -= @rowHeight
    else if (@y > 0) 
      @y -= @rowHeight
    else 
      @reset()

  move_down: =>
    # why minus 2 ? 
    if (@y < (@numRows - 2) * @rowHeight) 
      @y += @rowHeight

    

init = ->

  engine = new Engine()
  
  ###  Create a new Player object ###
  engine.setPlayer(new Player(engine, "images/char-boy.png"))

  ###  Create several Enemy objects ###
  engine.addEnemy(new Enemy(engine, 3, 8, 'images/enemy-bug.png'))
  engine.addEnemy(new Enemy(engine, 4, 7, 'images/enemy-bug.png'))
  engine.addEnemy(new Enemy(engine, 2, 5, 'images/enemy-bug.png'))

  window.app = engine


if document.readyState == 'complete'
  init()
else
  document.onreadystatechange = ->
    if document.readyState == 'complete'
      init()


