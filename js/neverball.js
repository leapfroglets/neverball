function NeverBall(dinfo) {
    var floor_y = -.4;
    var cb = new Cube(0, floor_y + .1, -1, .2, .2, .2);
    var cb2 = new Cube(-.5, floor_y + .1, -2, .2, .2, .2);

    var radius = .1;
    var sphere = new Sphere(0, floor_y + radius, -1, radius);
    var grid = new Grid(0, floor_y, -1, 2, 3.5);

    var handleKeyStrokes = function() {
        var vinc = 0.0005;
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

    this.update = function() {
        handleKeyStrokes();
        cb.update();
        sphere.update();
        if (sphere.origin.y - sphere.radius + sphere.vy < floor_y) {
            sphere.origin.y = floor_y + sphere.radius;
            sphere.vy *= -0.88;
        } else {
            sphere.vy -= .001;
        }
        var mg = Math.sqrt(sphere.vx * sphere.vx + sphere.vz * sphere.vz);
        if (mg > 0) {
            var ref = dinfo.camera.yrot + Math.PI;
            ref = ref - Math.floor(ref / (2 * Math.PI)) * (2 * Math.PI);
            if (ref < 0) ref += 2 * Math.PI;

            var dang = Math.atan2(sphere.vx / mg, sphere.vz / mg);
            if (dang < 0) dang += 2 * Math.PI;

            var u = Math.cos(dinfo.camera.yrot + Math.PI / 2);
            var v = Math.sin(dinfo.camera.yrot + Math.PI / 2);
            var dot = sphere.vx * v + sphere.vz * u;
            var df = mg * 1.5;
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
        var gap = .8;
        var dx = sphere.origin.x - v * gap ;
        var dz = sphere.origin.z - u * gap ;
        dinfo.camera.x += (dx - dinfo.camera.x) / 10;
        dinfo.camera.z += (dz - dinfo.camera.z) / 10;
    }

    this.draw = function() {
        //first clear the renderer
        dinfo.clear();

        //first draw the grid which is the bottom most
        //then draw other surfaces on top 
        grid.push(dinfo);
        dinfo.push();
        dinfo.flush();

        cb.draw(dinfo);
        dinfo.push(true);
        cb2.draw(dinfo);
        dinfo.push(true);
        sphere.push(dinfo);
        //dinfo.push(false, 1.05);
        dinfo.push(false);
        dinfo.paintersSort();
        dinfo.flush();
    }

}
