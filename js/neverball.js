function NeverBall(dinfo) {
    var floor_y = -.4;
    var cb = new Cube(0, floor_y + .05, -1, .1, .1, .1);
    var radius = .1;
    var sphere = new Sphere(0, floor_y + radius / 2, -1, radius);
    var grid = new Grid(0, floor_y, -2, 2, 3.5);

    this.update = function() {
        cb.update();
        sphere.update();
        dinfo.camera.x += (sphere.origin.x - dinfo.camera.x) / 20;
        dinfo.camera.z += (sphere.origin.z + sphere.radius + 1 - dinfo.camera.z) / 20;
    }
    
    this.draw = function() {
        //first clear the renderer
        dinfo.clear();

        //first draw the grid which is the bottom most
        grid.draw(dinfo);
        dinfo.flush();

        //then draw other surfaces on top 
        //cb.draw(dinfo);
        sphere.draw(dinfo);
        dinfo.paintersSort();
        dinfo.flush(true);
    }

}
