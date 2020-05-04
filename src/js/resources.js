/*
 *  resources.js
 *
 *  Author: Al Carruth
 *  Origin: git@github.com:alcarruth/frontend-p3-arcade-game.git
 *
 *  This file is part a project submitted by the author for the
 *  Udacity Front End Web Developer Nanodegree, Project 3 Classic
 *  Arcade Game clone.
 *
 */

/*
 * from jshint.com:
 * 
 *  Metrics
 *
 *  - There are 9 functions in this file.
 *  - Function with the largest signature take 1 arguments, while 
 *    the median is 1.
 *  - Largest function has 8 statements in it, while the median is 3.
 *  - The most complex function has a cyclomatic complexity value of 
 *    3 while the median is 1. *
 */

/*
 * ------------------
 * class: Resources() 
 * ------------------
 *
 *  Resources() is functional style class.
 *
 *  This is simple an image loading utility. It eases the process of
 *  loading image files so that they can be used within your game. It
 *  also includes a simple "caching" layer so it will reuse cached
 *  images if you attempt to load the same image multiple times.
 * 
 *  usage: resource = Resource()
 *
 *  returns: an object exposing the public methods
 *      load(), 
 *      get(),
 *      onReady(),
 *      isReady()
 */
var Resources = function() {

    // TODO: loading is unused. Remove it?
    // var loading = [];
    var resourceCache = {};
    var readyCallbacks = [];

    /* This is our private image loader function, it is called by the
     * public image loader function.
     */
    function _load(url) {

        var img;

        if(resourceCache[url]) {

            /* If this URL has been previously loaded it will exist
             * within our resourceCache array. Just return that image
             * rather re-loading the image.
             */
            return resourceCache[url];
        }

        else {

            /* TODO: the following line seems to be redundant given
             * the failed condition that got us here.
             */
            resourceCache[url] = false;

            /* This URL has not been previously loaded and is not present
             * within our cache; we'll need to load this image.
             */
            img = new Image();
            img.src = url;
            img.onload = function() {

                /*  Once our image has properly loaded, add it to our
                 *  cache so that we can simply return this image if
                 *  the developer attempts to load this file in the
                 *  future.
                 */
                resourceCache[url] = img;

                /*  Once the image is actually loaded and properly
                 *  cached, call all of the onReady() callbacks we
                 *  have defined.
                 *
                 *  TODO: Wait just a minute!
                 *
                 *  Clearly, if we are not ready, we shouldn't execute
                 *  the callbacks.  But what happens after that?  This
                 *  test won't be executed again until another image
                 *  is loaded.
                 *
                 *  Maybe that's ok since the state won't change to
                 *  'ready' without another image being loaded.  But
                 *  wouldn't it be better to wait just for _this_
                 *  image to be loaded to execute this images
                 *  callback.
                 */
                if(isReady()) {
                    readyCallbacks.forEach(function(func) { func(); });
                }
            };

            /* Set the initial cache value to false, this will change
             * when the image's onload event handler is called.
             * Finally, point the images src attribute to the passed
             * in URL.
             */
        }
    }

    /* This is the publicly accessible image loading function. It
     * accepts an array of strings pointing to image files or a string
     * for a single image. It will then call our private image loading
     * function accordingly.
     */
    function load(urls) {

        if(urls instanceof Array) {

            /* If the developer passed in an array of images loop
             * through each value and call our image loader on that
             * image file
             */
            urls.forEach(function(url) {
                _load(url);
            });
        }
        else {
            /* The developer did not pass an array to this function,
             * assume the value is a string and call our image loader
             * directly.
             */
            _load(urls);
        }
    }

    /* This is used by developers to grab references to images they
     * know have been previously loaded. If an image is cached, this
     * functions the same as calling load() on that URL.
     */
    function get(url) {
        return resourceCache[url];
    }

    /* This function determines if all of the images that have been
     * requested for loading have in fact been loaded.  
     *
     * TODO: It is currently only used internally in the _load()
     * function.  Why is it made public?
     */
    function isReady() {
        var ready = true;
        for(var k in resourceCache) {
            if(resourceCache.hasOwnProperty(k) &&
               !resourceCache[k]) {
                ready = false;
            }
        }
        return ready;
    }

    /*  This function will add a function to the callback stack that
     *  is called when all requested images are properly loaded.
     * 
     *  TODO: I feel like there is a bug lurking here.  Suppose we
     *  have more than one active load() being processed.  Aren't
     *  their callbacks co-mingled?  Shouldn't each call to load()
     *  have it's own set of callbacks?  And how do the ready checks
     *  for separate loads impact each other?
     *
     *  Or, perhaps it's the case that load() should only be called
     *  once, or otherwise restricted.  If so, we need to be precise
     *  about what those restrictions are.
     */
    function onReady(func) {
        readyCallbacks.push(func);
    }

    /*  Expose the public methods in the returned object.
     */
    return {
        load: load,
        get: get,
        onReady: onReady,

        /*  TODO: It seems that isReady() is currently only used used
         *  internally and not in engine.js or app.js, so maybe it
         *  ought not be published.
         */
        isReady: isReady
    };
};

window.Resources = Resources;
