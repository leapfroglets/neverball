function NeverBall(dinfo) {
    var floor_y = -.4;
    var cb = new Cube(0, floor_y + .1, -1, .2, .2, .2);
    var cb2 = new Cube(-.5, floor_y + .1, -2, .2, .2, .2);

    var radius = .1;
    var sphere = new Sphere(0, floor_y + radius, -1, radius);
    var grid = new Grid(0, floor_y, -1, 2, 3.5);

    var handleKeyStrokes = function() {
        var vinc = 0.0005;
        var u = vinc * Math.cos(dinfo.camera.yrot + Math.PI);
        var v = vinc * Math.sin(dinfo.camera.yrot + Math.PI);

        if (KEY_STATE[KEY_UP]) {
            sphere.vz += u;
            sphere.vx += v;
        }

        if (KEY_STATE[KEY_DOWN]) {
            sphere.vz -= u;
            sphere.vx -= v;
        }

        if (KEY_STATE[KEY_LEFT]) {
            dinfo.camera.yrot += .02;
        }

        if (KEY_STATE[KEY_RIGHT]) {
            dinfo.camera.yrot -= .02;
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
        var u = Math.cos(dinfo.camera.yrot + Math.PI);
        var v = Math.sin(dinfo.camera.yrot + Math.PI);
        var dx = sphere.origin.x - v * 1 ;
        var dz = sphere.origin.z - u * 1 ;
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

        //cb.draw(dinfo);
        //dinfo.push(true);
        //cb2.draw(dinfo);
        //dinfo.push(true);
        sphere.push(dinfo);
        //dinfo.push(false, 1.05);
        dinfo.push(false);
        dinfo.paintersSort();
        dinfo.flush();
    }

}
