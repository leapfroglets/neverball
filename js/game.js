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
                //must be set by sth
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
        listLevels();
        gameloop();
    }

    this.resize = function(width, height) {
        canvas.width = width;
        canvas.height = height;
        dinfo.setAspectRatio(width / height);
        createMenu();
        listLevels();
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
    var LEVEL_LIST = 4;
    var HELP = 5;

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

    var btn_width = 280;
    var btn_gap = 20;

    var centerize = function(btns) {
        if (btns.length == 0) return ;
        var h = btns[0].h;
        var sx = dinfo.canvas.width / 2 - btn_width / 2;
        var sy = (dinfo.canvas.height - btns.length * (h + btn_gap) + btn_gap) / 2;
        console.log(btns.length + " " + sx + " " + sy);
        for (var i = 0; i < btns.length; ++i) {
            btns[i].x = sx;
            btns[i].y = sy + i * (h + btn_gap);
        }
    }

    var createMenu = function() {
        btnlist = [];
        btnlist.push(new Button(0, 0, btn_width, "PLAY"));
        btnlist.push(new Button(0, 0, btn_width, "DEMO"));
        btnlist.push(new Button(0, 0, btn_width, "HELP"));
        btnlist.push(new Button(0, 0, btn_width, "ABOUT"));
        centerize(btnlist);
    }

    document.addEventListener('keydown', function(e) {
        if (e.keyCode == KEY_ESCAPE) {
            wrapper.exit();
            wrapper.onexit = function() {
                state = MENU;
                wrapper.enter();
            }
            return ;
        }

        if (e.keyCode == 'T'.charCodeAt(0) && state == GAME) {
            neverball.TILT ^= 1;
        }

        if (state == MENU) {
            if (e.keyCode == KEY_UP) {
                menu_sel = (menu_sel + btnlist.length - 1) % btnlist.length;
            }

            if (e.keyCode == KEY_DOWN) {
                menu_sel = (menu_sel + 1) % btnlist.length;
            }
        }

        if (state == LEVEL_LIST) {
            if (e.keyCode == KEY_UP) {
                level_sel = (level_sel + level_list.length - 1) % level_list.length;
            }

            if (e.keyCode == KEY_DOWN) {
                level_sel = (level_sel + 1) % level_list.length;
            }
        }

        if (e.keyCode == KEY_ENTER) {
            wrapper.exit();
            if (state == MENU) {
                if (menu_sel == 0) {
                    wrapper.onexit = function() {
                        state = LEVEL_LIST;
                        wrapper.enter();
                    }
                } else if (menu_sel == 1) {
                    wrapper.onexit = function() {
                        //exportLevel('neverball');
                        var lvl = getDemoLevel("neverball");
                        neverball.loadLevelObj(lvl);
                        state = GAME;
                        wrapper.enter();
                    }
                } else if (menu_sel == 2) {
                    wrapper.onexit = function() {
                        state = HELP;
                        wrapper.enter();
                    }
                } else if (menu_sel == 3) {
                    wrapper.onexit = function() {
                        state = ABOUT;
                        wrapper.enter();
                    }
                }
            } else if (state == LEVEL_LIST) {
                wrapper.onexit = function() {
                    if (level_list.length) {
                        neverball.loadLevel(level_list[level_sel].caption);
                        state = GAME;
                        wrapper.enter();
                    } else {
                        state = MENU;
                        wrapper.enter();
                    }
                }
            } else if (state == ABOUT || state == HELP) {
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
        dinfo.context.fillText("LEAPFROG INTERNSHIP PROJECT", dinfo.canvas.width / 2, dinfo.canvas.height / 2);
        dinfo.context.font = "20px Monospace";
        dinfo.context.fillText("Created by Uttamraj Khanal", dinfo.canvas.width / 2, dinfo.canvas.height / 2 + 40);
    }
    
    var showHelp = function() {
        dinfo.context.fillStyle = "skyblue";
        dinfo.context.fillRect(0, 0, dinfo.canvas.width, dinfo.canvas.height);
        dinfo.context.fillStyle = "black";
        dinfo.context.font = "20px Monospace";
        dinfo.context.fillText("CONTROLS: ARROW KEYS, T (toggle tilt mode), ESCAPE / ENTER to return to main menu", dinfo.canvas.width / 2, dinfo.canvas.height / 2);
        dinfo.context.font = "20px Monospace";
        dinfo.context.fillText("You need to create levels first to play(or import levels somehow)", dinfo.canvas.width / 2, dinfo.canvas.height / 2 + 40);
    }

    var level_sel = 0;
    var level_list = [];

    var showLevels = function() {
        dinfo.context.fillStyle = "skyblue";
        dinfo.context.fillRect(0, 0, dinfo.canvas.width, dinfo.canvas.height);
        for (var i = 0; i < level_list.length; ++i) {
            level_list[i].draw(i == level_sel);
        }
        if (level_list.length == 0) {
            dinfo.context.font = "20px Monospace";
            dinfo.context.fillStyle = "red";
            dinfo.context.fillText("No levels found! You need to create some in order to play.", dinfo.canvas.width / 2, dinfo.canvas.height / 2);
        }
    }

    var listLevels = function() {
        level_list = [];
        var lmanager = new LevelManager();
        var lv = lmanager.getLevels();
        for (var i in lv) {
            level_list.push(new Button(0, 0, btn_width, i));
        }
        centerize(level_list);
    }


    var gameloop = function() {
        var frame_start = Date.now();
        handleKeyStrokes();
        if (state == MENU) {
            showMenu();
        } else if (state == ABOUT) {
            showAbout();
        } else if (state == LEVEL_LIST) {
            showLevels();
        } else if (state == GAME) {
            neverball.update();
            neverball.draw(dinfo);
        } else if (state == HELP) {
            showHelp();
        } else console.log("undefined state");

        wrapper.update();
        var diff = Math.max(1, frame_time - (Date.now() - frame_start));
        setTimeout(gameloop, diff);
    }

}
