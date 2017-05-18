function Game(container_id, options) {
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d')

    var frame_time;

    var setFPS = function(fps) {
        frame_time = 1000.0 / fps; //in milliseconds
    }

    var camera = createPoint(0, 0, 0);

    var dinfo = new Renderer(camera, canvas, context);

    this.start = function() {
        this.resize(options.width, options.height);
        setFPS(options.FPS);
        gameloop();
    }

    this.resize = function(width, height) {
        canvas.width = width;
        canvas.height = height;
    }

    var neverball = new NeverBall(dinfo);

    var handleKeyStrokes = function() {
        if (KEY_STATE[KEY_LEFT]) {
            camera.x -= .01;
        }
        if (KEY_STATE[KEY_RIGHT]) {
            camera.x += .01;
        }

        if (KEY_STATE[KEY_UP]) {
            camera.z -= .01;
        }

        if (KEY_STATE[KEY_DOWN]) {
            camera.z += .01;
        }
    }

    var gameloop = function() {
        var frame_start = Date.now();
        //handleKeyStrokes();
        neverball.update();
        neverball.draw(dinfo);
        var diff = Math.max(1, frame_time - (Date.now() - frame_start));
        setTimeout(gameloop, diff);
    }

}
