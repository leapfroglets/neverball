function Coin(x, y, z, radius, width) {
    var y_rot = 0;
    this.pts = [];
    this.origin = createPoint(x, y, z);
    var steps = 24;
    
    this.set = function(x, y, z, radius, width) {
        this.radius = radius;
        this.width = width;
        var vstp = 2.0 * Math.PI / steps;

        this.pts = [];
        this.pts.push(createPoint(0, radius, 0));

        for (var i = 1; i < steps; ++i) {
            var pt = rotateX(this.pts[i - 1], vstp);
            this.pts.push(pt);
        }

        for (var i = 0; i < steps; ++i) {
            var p = this.pts[i];
            p.x -= this.width / 2;
            var pt = createPoint(p.x + this.width, p.y, p.z);
            this.pts.push(pt);
        }
        this.pts.push(createPoint(-this.width / 2, 0, 0));
        this.pts.push(createPoint(this.width / 2, 0, 0));
    }

    this.vx = 0; 
    this.vy = 0;
    this.vz = 0;

    var self = this;

    this.set(x, y, z, radius, width);

    this.push = function(dinfo) {
        for (var i = 0; i < this.pts.length; ++i) {
            var pt = rotateY(createPoint(this.pts[i].x, this.pts[i].y, this.pts[i].z), y_rot);
            pt.x += this.origin.x;
            pt.y += this.origin.y;
            pt.z += this.origin.z;
            dinfo.points.push(pt);
        }
        var scale = 1.05;
        for (var i = 0; i < steps; ++i) {
            var color = "blue";
            var a = (i + 1) % steps;
            dinfo.surfaces.push([[a, i, i + steps, a + steps], color, scale]);
        }
        var l = this.pts.length - 2;
        for (var i = 0; i < steps; ++i) {
            var color = "red";
            var a = (i + 1) % steps;
            dinfo.surfaces.push([[l, i, a], color, scale]);
            dinfo.surfaces.push([[i + steps, l + 1, steps + a], color, scale]);
        }
    }

    this.update = function() {
        y_rot += .1;
    }

}

