function Wrapper(dinfo, obj) {
    var alpha = 1;
    var ENTER = 0, EXIT = 1;

    var state;

    this.enter = function() {
        state = ENTER;
    }

    this.update = function() {
        var f = 0.02;
        if (state == ENTER) {
            alpha -= f;
            if (alpha < 0) {
                alpha = 0;
            }
        } else if (state == EXIT) {
            alpha += f;
            if (alpha > 1) {
                alpha = 1;
                this.onexit();
            }
        }
        //draw overlay
        dinfo.context.fillStyle = "rgba(0, 0, 0, " + alpha + ")";
        dinfo.context.fillRect(0, 0, canvas.width, canvas.height);
    }

    this.exit = function() {
        state = EXIT;
    }

}

function Game(container_id, options) {
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d')

    var frame_time;

    var setFPS = function(fps) {
        frame_time = 1000.0 / fps; //in milliseconds
    }

    var camera = new Camera(1, 0, 100);

    var dinfo = new Renderer(camera, canvas, context);

    this.start = function() {
        this.resize(options.width, options.height);
        setFPS(options.FPS);
        createMenu();
        gameloop();
    }

    this.resize = function(width, height) {
        canvas.width = width;
        canvas.height = height;
        createMenu();
    }

    var neverball = new NeverBall(dinfo);

    var handleKeyStrokes = function() {
        if (state == GAME) {
            var w = 'W'.charCodeAt(0);
            var s = 'S'.charCodeAt(0);
            var a = 'A'.charCodeAt(0);
            var d = 'D'.charCodeAt(0);

            if (KEY_STATE[w]) {
                camera.z -= .01;
            }

            if (KEY_STATE[s]) {
                camera.z += .01;
            }

            if (KEY_STATE[a]) {
                camera.yrot += .01;
            }

            if (KEY_STATE[d]) {
                camera.yrot -= .01;
            }
        }
        
    }
    

    var wrapper = new Wrapper(dinfo);
    wrapper.enter();

    var MENU = 0, GAME = 2;
    var ABOUT = 3;

    var menu_sel = 0;
    var state = MENU;

    function Button(x, y, w, caption) {
        this.x = x;
        this.y = y;
        this.w = w;
        var font = 20;
        this.h = font + 10;
        this.caption = caption;

        this.draw = function(sel = false) {
            if (sel) {
                dinfo.context.fillStyle = "grey";
                dinfo.context.fillRect(this.x, this.y, this.w, this.h);
            }
            dinfo.context.fillStyle = "black";
            dinfo.context.font = font + "px Monospace";
            dinfo.context.textAlign = 'center';
            dinfo.context.fillText(this.caption, this.x + w / 2, this.y + font);
        }
    }

    var btnlist = [];

    var createMenu = function() {
        var w = 180;
        var gap = 20;

        btnlist = [];
        btnlist.push(new Button(0, 0, w, "PLAY"));
        var h = btnlist[0].h;
        btnlist.push(new Button(0, 0, w, "LEVEL EDITOR"));
        btnlist.push(new Button(0, 0, w, "ABOUT"));
        var sx = dinfo.canvas.width / 2 - w / 2;
        var sy = (dinfo.canvas.height - btnlist.length * (h + gap) + gap) / 2;
        for (var i = 0; i < btnlist.length; ++i) {
            btnlist[i].x = sx;
            btnlist[i].y = sy + i * (h + gap);
        }
    }

    document.addEventListener('keydown', function(e) {
        if (state == MENU) {
            if (e.keyCode == KEY_UP) {
                menu_sel = (menu_sel + btnlist.length - 1) % btnlist.length;
            }

            if (e.keyCode == KEY_DOWN) {
                menu_sel = (menu_sel + 1) % btnlist.length;
            }
        }

        if (e.keyCode == KEY_ENTER) {
            wrapper.exit();
            if (state == MENU) {
                if (menu_sel == 0) {
                    wrapper.onexit = function() {
                        state = GAME;
                        wrapper.enter();
                    }
                } else if (menu_sel == 1) {
                    wrapper.onexit = function() {
                        window.location = "level_editor.html";
                    }
                } else if (menu_sel == 2) {
                    wrapper.onexit = function() {
                        state = ABOUT;
                        wrapper.enter();
                    }
                }
            } else if (state == ABOUT) {
                wrapper.onexit = function() {
                    state = MENU;
                    wrapper.enter();
                }
            } else if (state == GAME) {
                wrapper.onexit = function() {
                    state = MENU;
                    wrapper.enter();
                }
            }
        }
    });

    var showMenu = function() {
        dinfo.context.fillStyle = "skyblue";
        dinfo.context.fillRect(0, 0, canvas.width, canvas.height);
        for (var i = 0; i < btnlist.length; ++i) {
            btnlist[i].draw(i == menu_sel);
        }
    }
    
    var showAbout = function() {
        dinfo.context.fillStyle = "skyblue";
        dinfo.context.fillRect(0, 0, dinfo.canvas.width, dinfo.canvas.height);
        dinfo.context.fillStyle = "black";
        dinfo.context.font = "40px Monospace";
        dinfo.context.fillText("LEAPFROG INTERSHIP PROJECT", dinfo.canvas.width / 2, dinfo.canvas.height / 2);
        dinfo.context.font = "20px Monospace";
        dinfo.context.fillText("Created by Uttamraj Khanal", dinfo.canvas.width / 2, dinfo.canvas.height / 2 + 40);
    }

    var gameloop = function() {
        var frame_start = Date.now();
        handleKeyStrokes();
        if (state == MENU) {
            showMenu();
        } else if (state == ABOUT) {
            showAbout();
        } else if (state == GAME) {
            neverball.update();
            neverball.draw(dinfo);
        } else console.log("undefined state");
        wrapper.update();
        var diff = Math.max(1, frame_time - (Date.now() - frame_start));
        setTimeout(gameloop, diff);
    }

}
