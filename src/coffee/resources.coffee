

class Resources

  constructor: ->
    @resourceCache = {}
    @readyCallbacks = []

  _load: (url) =>
    if @resourceCache[url]
      return @resourceCache[url]
    else 
      @resourceCache[url] = undefined
      img = new Image()
      img.src = url
      img.onload = =>
        @resourceCache[url] = img
        if @isReady()
          @readyCallbacks.forEach((cb) -> cb())

  load: (urls) =>
    if (urls instanceof Array)
      urls.forEach(@_load)
    else 
      @_load(urls)

  get: (url) =>
    @resourceCache[url]

  isReady: =>
    ready = true
    for _,resource of @resourceCache
      ready &= resource?
    return ready

  onReady: (cb) =>
    @readyCallbacks.push(cb)


