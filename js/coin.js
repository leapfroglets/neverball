function Coin(x, y, z, radius, width) {
    var y_rot = 0;
    this.pts = [];
    this.origin = createPoint(x, y, z);
    var steps = 24;
    var alpha = 1;
    this.destroyed = 0;
    
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
            var pt = rotateY(this.pts[i], y_rot);
            pt.x += this.origin.x;
            pt.y += this.origin.y;
            pt.z += this.origin.z;
            dinfo.points.push(pt);
        }
        var scale = this.destroyed ? 1 : 1.15;
        for (var i = 0; i < steps; ++i) {
            var color = "rgba(125, 0, 0, " + alpha + ")";
            var a = (i + 1) % steps;
            dinfo.surfaces.push([[a, i, i + steps, a + steps], color, scale]);
        }
        var l = this.pts.length - 2;
        for (var i = 0; i < steps; ++i) {
            var color = "rgba(255, 0, 0, " + alpha + ")";
            var a = (i + 1) % steps;
            dinfo.surfaces.push([[l, i, a], color, scale]);
            dinfo.surfaces.push([[i + steps, l + 1, steps + a], color, scale]);
        }
    }

    this.getPoints = function() {
        var p = createPoint(-this.width / 2, 0, this.radius);
        var res = [p, dup(p), dup(p), dup(p)];
        res[1].z = -this.radius;
        res[2].x = this.width / 2;
        res[2].z = -this.radius;
        res[3].x = this.width / 2;
        res[3].z = -this.radius;
        for (var i = 0; i < res.length; ++i) {
            res[i] = rotateY(res[i], y_rot);
            res[i] = add(res[i], this.origin);
        }
        return res;
    }

    this.update = function() {
        y_rot += .1;
        if (this.destroyed) {
            alpha *= 0.92;
        }
    }

}

