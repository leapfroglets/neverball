function NeverBall(dinfo) {
    var floor_y = -.4;
    var cb = new Cube(0, floor_y + .05, -1, .2, .2, .2);
    var cb2 = new Cube(-.5, floor_y + .05, -2, .2, .2, .2);

    var radius = .1;
    var sphere = new Sphere(0, floor_y + radius, -1, radius);
    var grid = new Grid(0, floor_y, -2, 2, 3.5);

    this.update = function() {
        cb.update();
        sphere.update();
        if (sphere.origin.y - sphere.radius + sphere.vy < floor_y) {
            sphere.origin.y = floor_y + sphere.radius;
            sphere.vy *= -0.88;
        } else {
            sphere.vy -= .001;
        }
        dinfo.camera.x += (sphere.origin.x - dinfo.camera.x) / 20;
        dinfo.camera.z += (sphere.origin.z + sphere.radius + 1 - dinfo.camera.z) / 20;
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
        dinfo.push(false, 1.05);
        dinfo.paintersSort();
        dinfo.flush();
    }

}
