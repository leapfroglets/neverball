function Star(pos) {
    var gravity = 0.5;

    this.init = function() {
        this.pos = dup(pos);
        this.alpha = 1.0;
        this.vy = -Math.random() * 20 - 5;
        this.vx = (Math.random() - 0.5) * 20;
        this.w = this.h = Math.random() * 50 + 10;
    }

    this.init();

    this.update = function() {
        this.pos.x += this.vx;
        this.vy += gravity;
        this.pos.y += this.vy;
        this.alpha *= 0.98;
    }

    this.destroyed = function() {
        return this.alpha < 0.05;
    }
}


function NeverBall(dinfo) {
    var floor_y = -.4;
    var cb = new Cube(0, floor_y + .1, -1, .2, .2, .2);
    var cb2 = new Cube(-.5, floor_y + .1, -2, .2, .2, .2);
    var cb3 = new Cube(-1, floor_y + .1, -1, .2, 2, .2);
    var cube_list = [];
    //var cube_list = [];
    var coin_radius = .05;
    var coins = [];

    var radius = .1;
    var sphere = new Sphere(0, floor_y + radius, 3, radius);
    var grid = new Grid(0, floor_y, 0, 6, 6);

    var self = this;

    var handleKeyStrokes = function() {
        var vinc = 0.0001;
        var eff = dinfo.camera.yrot + Math.PI;
        if (KEY_STATE[KEY_UP]) {
            var u = vinc * Math.cos(eff);
            var v = vinc * Math.sin(eff);
            sphere.vz += u;
            sphere.vx += v;
        }

        if (KEY_STATE[KEY_DOWN]) {
            var u = vinc * Math.cos(eff);
            var v = vinc * Math.sin(eff);
            sphere.vz -= u;
            sphere.vx -= v;
        }

        if (KEY_STATE[KEY_LEFT]) {
            var u = vinc * Math.cos(eff + Math.PI / 2);
            var v = vinc * Math.sin(eff + Math.PI / 2);
            sphere.vz += u;
            sphere.vx += v;
        }

        if (KEY_STATE[KEY_RIGHT]) {
            var u = vinc * Math.cos(eff - Math.PI / 2);
            var v = vinc * Math.sin(eff - Math.PI / 2);
            sphere.vz += u;
            sphere.vx += v;
        }

        if (KEY_STATE[KEY_SPACE]) {
            sphere.vy = .03;
        }
    }

    function checkColl(poly, circle) {
        var N = poly.length;
        var minprj = 10000000000.0;
        var axis = -1;
        //i + 1, because there are four points and the last side
        //is ignored
        for (var i = 0; i + 1 < poly.length; ++i) {
            var pplane = {x : poly[i + 1].x - poly[i].x, z : poly[i + 1].z - poly[i].z};
            var mg = Math.sqrt(pplane.x * pplane.x + pplane.z * pplane.z);
            if (mg == 0) mg = 1;
            pplane.x /= mg;
            pplane.z /= mg;
            var minp = 1000000000.0;
            var maxp = -minp;
            for (var j = 0; j < N; ++j) {
                var p1 = poly[j].x * pplane.x + poly[j].z * pplane.z;
                minp = Math.min(minp, p1);
                maxp = Math.max(maxp, p1);
            }

            var midp = circle.x * pplane.x + circle.z * pplane.z;
            var l1 = midp - circle.r;
            var l2 = midp + circle.r;
            if (l1 >= maxp || l2 <= minp) return [0];
            var gp = Math.min(l2, maxp) - Math.max(l1, minp);
            if (gp < minprj) {
                minprj = gp;
                axis = pplane;
            }
        }

        var dmin = 1000000000000.0;
        var sel = 0;
        for (var i = 0; i < N; ++i) {
            var dx = circle.x - poly[i].x;
            var dz = circle.z - poly[i].z;
            var dist = dx * dx + dz * dz;
            if (dist < dmin) {
                dmin = dist;
                sel = i;
            }
        }

        var pplane = {x : circle.x - poly[sel].x, z : circle.z - poly[sel].z};
        var mg = Math.sqrt(pplane.x * pplane.x + pplane.z * pplane.z);
        if (mg == 0) mg = 1;
        pplane.x /= mg;
        pplane.z /= mg;
        var minp = 1000000000.0;
        var maxp = -minp;
        for (var i = 0; i < N; ++i) {
            var p1 = poly[i].x * pplane.x + poly[i].z * pplane.z;
            minp = Math.min(minp, p1);
            maxp = Math.max(maxp, p1);
        }

        var midp = circle.x * pplane.x + circle.z * pplane.z;
        var l1 = midp - circle.r;
        var l2 = midp + circle.r;
        if (l1 >= maxp || l2 <= minp) return [0];

        var gp = Math.min(l2, maxp) - Math.max(l1, minp);
        if (gp < minprj) {
            minprj = gp;
            axis = pplane;
        }
        //if (minprj < 0.05) return [0];
        console.log('collision', minprj);
        return [1, axis, minprj];
    }

    var checkCollision = function() {
        var circle = {x : sphere.origin.x, z : sphere.origin.z, r : sphere.radius};
        var spts = [];
        var collisions = [];
        for (var i = 0; i < cube_list.length; ++i) {
            var pts = cube_list[i].getPoints();
            spts.push(pts);
            var c = checkColl(pts, circle);
            if (c[0] == 0) continue;
            var sx = 0, sz = 0;
            for (var j = 0; j < pts.length; ++j) {
                sx += pts[j].x;
                sz += pts[j].z;
            }
            sx /= pts.length;
            sz /= pts.length;
            var dx = circle.x - sx;
            var dz = circle.z - sz;
            if (dx * c[1].x + dz * c[1].z < 0) {
                c[1].x *= -1;
                c[1].z *= -1;
            }
            collisions.push([i, c[1], c[2]]);
        }

        var chosen = -1;
        for (var i = 0; i < collisions.length; ++i) {
            var info = collisions[i]; //collision info
            var obj_id = info[0];
            var pts = spts[obj_id];
            var circle2 = {x : sphere.origin.x, z : sphere.origin.z, r : sphere.radius};
            circle2.x += info[2] * info[1].x;
            circle2.z += info[2] * info[1].z;

            var ok = 1;

            for (var j = 0; j < collisions.length && ok; ++j) {
                if (i == j) continue;
                var c = checkColl(spts[collisions[j][0]], circle2);
                ok = c[0] == 0;
            }

            if (ok) {
                chosen = i;
                break;
            }
        }
        if (collisions.length) {
            var found = chosen != -1;
            if (!found) {
                console.log("man o man");
                chosen = 0;
            } 
            var info = collisions[chosen]; //collision info
            if (found) {
                sphere.origin.x += info[2] * info[1].x;
                sphere.origin.z += info[2] * info[1].z;
            } else {
                //undo
                sphere.origin.x -= sphere.vx;
                sphere.origin.y -= sphere.vz;
            }
            var dot = sphere.vx * info[1].x + sphere.vz * info[1].z;
            sphere.vx -= 2 * dot * info[1].x;
            sphere.vz -= 2 * dot * info[1].z;
            //sphere.vx *= 0.9;
            //sphere.vz *= 0.9;
        }
        //coins part
        for (var i = 0; i < coins.length; ++i) {
            if (coins[i].destroyed) continue;
            var pts = coins[i].getPoints();
            var c = checkColl(pts, circle);
            if (c[0] == 0) continue;
            //add stars
            addStar(coins[i].origin);
            coins[i].destroyed = 1;
        }
    }

    var stars = [];

    var addStar = function(pos) {
        //create stars at the position of sphere
        var sp = dinfo.getScreenCoords(dinfo.projectToScreen(dinfo.toCamera(pos)));
        for (var i = 0; i < 10; ++i) {
            stars.push(new Star(sp));
        }
    }

    this.update = function() {
        handleKeyStrokes();
        for (var i = 0; i < cube_list.length; ++i) {
            cube_list[i].update();
        }
        var ns = [];
        for (var i = 0; i < stars.length; ++i) {
            if (stars[i].destroyed()) continue;
            stars[i].update();
            ns.push(stars[i]);
        }
        stars = ns;

        for (var i = 0; i < coins.length; ++i) {
            coins[i].update();
        }
        sphere.update();
        if (sphere.origin.y - sphere.radius + sphere.vy < floor_y) {
            sphere.origin.y = floor_y + sphere.radius;
            sphere.vy *= -0.88;
        } else {
            sphere.vy -= .001;
        }
        checkCollision();
        var mg = Math.sqrt(sphere.vx * sphere.vx + sphere.vz * sphere.vz);
        if (mg > 0) {
            var ref = dinfo.camera.yrot + Math.PI;
            ref = ref - Math.floor(ref / (2 * Math.PI)) * (2 * Math.PI);
            if (ref < 0) ref += 2 * Math.PI;
            var xnorm = sphere.vx / mg;
            var znorm = sphere.vz / mg;
            var dang = Math.atan2(xnorm, znorm);
            if (dang < 0) dang += 2 * Math.PI;

            var u = Math.cos(dinfo.camera.yrot + Math.PI / 2);
            var v = Math.sin(dinfo.camera.yrot + Math.PI / 2);
            var dot = sphere.vx * v + sphere.vz * u;

            var u2 = Math.cos(dinfo.camera.yrot + Math.PI);
            var v2 = Math.sin(dinfo.camera.yrot + Math.PI);
            var dt = u2 * znorm + v2 * xnorm;
            var df = dt > .06 ? mg * 1.5 : mg / 2;

            var dot = sphere.vx * v + sphere.vz * u;
            if (dot > 0) {
                if (dang > ref) {
                    dinfo.camera.yrot -= (2 * Math.PI - (dang - ref)) * df;
                } else {
                    dinfo.camera.yrot += (dang - ref) * df;
                }
            } else if (dot < 0) {
                if (dang > ref) {
                    dinfo.camera.yrot += (dang - ref) * df;
                } else {
                    dinfo.camera.yrot += (2 * Math.PI - (ref - dang)) * df;
                }
            }
        }
        var u = Math.cos(dinfo.camera.yrot + Math.PI);
        var v = Math.sin(dinfo.camera.yrot + Math.PI);
        var gap = .6;
        var dx = sphere.origin.x - v * gap ;
        var dz = sphere.origin.z - u * gap ;
        dinfo.camera.x += (dx - dinfo.camera.x) / 10;
        dinfo.camera.z += (dz - dinfo.camera.z) / 10;
    }

    var floor = [];

    var lmanager = new LevelManager();

    var loadLevel = function(name) {
        var m = lmanager.getLevel(name);
        if (m == -1) {
            console.log("Level not found");
            alert("Level not found");
        }

        var w = .5;

        if ('neverball' in m.map) {
            var nv = m.map['neverball'];
            var d = nv.pos;
            var x = d.col * w;
            var y = floor_y;
            var z = d.row * w;
            sphere.origin.x = x; 
            sphere.origin.y = y; 
            sphere.origin.z = z; 
            console.log(nv.dir.v, nv.dir.u);
            dinfo.camera.yrot = Math.atan2(nv.dir.u, nv.dir.v) - Math.PI;
        }

        floor = [];
        coins = [];
        var cl = [];
        for (var i = 0; i < m.meta.rows; ++i) {
            cl[i] = [];
            for (var j = 0; j < m.meta.cols; ++j) {
                var x = j * w;
                var y = floor_y;
                var z = i * w;
                if ('color' in m.map[i][j]) {
                    floor.push(new Tile(x, y, z, w, w, m.map[i][j]['color']));
                }
                if ('coin' in m.map[i][j]) {
                    coins.push(new Coin(x, floor_y + 2 * coin_radius, z, coin_radius, .01));
                }

                if ('cube' in m.map[i][j]) {
                    var height = .1;
                    var w2 = w * 1;
                    var cb = new Cube(x, y + height / 2, z, w2, w2, height);
                    cl[i][j] = cb;
                    cube_list.push(cb);
                    var cur = cube_list.length - 1;
                    if (j > 0 && 'cube' in m.map[i][j - 1]) {
                        cb.mask |= SIDE_LEFT;
                        cube_list[cur - 1].mask |= SIDE_RIGHT;
                    }
                    if (i > 0 && 'cube' in m.map[i - 1][j]) {
                        cb.mask |= SIDE_TOP;
                        cl[i - 1][j].mask |= SIDE_BOTTOM;
                    }
                }

            }
        }
    }

    loadLevel("newlevel");

    var drawFloor = function() {
        //grid.push(dinfo);
        //dinfo.push(false);
        //dinfo.flush();
        //return;
        for (var i = 0; i < floor.length; ++i) {
            floor[i].push(dinfo);
            dinfo.push(false);
        }
        dinfo.flush();
    }

    var obj_star = document.getElementById('star');

    this.draw = function() {
        //first clear the renderer
        dinfo.clear();

        //first draw the grid which is the bottom most
        //then draw other surfaces on top 
        drawFloor();

        for (var i = 0; i < cube_list.length; ++i) {
            cube_list[i].draw(dinfo);
            dinfo.push(true);
        }

        for (var i = 0; i < coins.length; ++i) {
            coins[i].push(dinfo);
            dinfo.push(true);
        }
        sphere.push(dinfo);
        //dinfo.push(false, 1.05);
        dinfo.push(false);
        dinfo.paintersSort();
        dinfo.flush();

        //draw stars
        for (var i = 0; i < stars.length; ++i) {
            dinfo.drawImage(obj_star, stars[i].pos, stars[i].w, stars[i].h, stars[i].alpha);
        }

    }

}
