function Renderer(camera, canvas, context) {
    this.camera = camera;
    this.canvas = canvas;
    this.context = context;

    this.surfaces = [];
    this.points = [];
    this.pending_surfaces = [];

    this.getScreenCoords = function(point) {
        return {
            x : this.canvas.width / 2 * (1 + point.x),
            y : this.canvas.height / 2 * (1 - point.y),
            z : point.z
        };
    }

    this.toCamera = function(point) {
        var cx = point.x - this.camera.x;
        var cy = point.y - this.camera.y;
        var cz = point.z - this.camera.z;
        return {x : cx, y : cy, z : cz};
    }

    this.projectToScreen = function(point) {
        return {x : point.x / -point.z, y : point.y / -point.z, z : point.z};
    }

    this.clear = function() {
        this.surfaces = [];
        this.context.fillStyle = "white";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    //performs the final rendering to the canvas
    this.flush = function() {
        for (var i = 0; i < this.pending_surfaces.length; ++i) {
            var o = this.pending_surfaces[i][0];
            this.context.beginPath();
            this.context.fillStyle = this.pending_surfaces[i][1];
            this.context.moveTo(o[0].x, o[0].y);
            for (var j = 1; j < o.length; ++j) {
                this.context.lineTo(o[j].x, o[j].y);
            }
            this.context.fill();
        }
        this.pending_surfaces = [];
    }

    var self = this;

    var clip = function() {
        var near_plane = -.5;
        var nw = [];
        for (var i = 0; i < self.surfaces.length; ++i) {
            var o = self.surfaces[i][0];
            var minz = self.points[o[0]].z;
            for (var j = 1; j < o.length; ++j) {
                minz = Math.min(minz, self.points[o[j]].z);
            }
            if (minz < near_plane) {
                nw.push(self.surfaces[i]);
            }
        }
        self.surfaces = nw;
    }

    this.push = function(cull = false, scale = 1) {
        for (var i = 0; i < this.points.length; ++i) {
            this.points[i] = this.toCamera(this.points[i]);
        }
        clip();
        for (var i = 0; i < this.points.length; ++i) {
            this.points[i] = this.projectToScreen(this.points[i]);
        }
        var todraw = [];
        for (var i = 0; i < this.surfaces.length; ++i) {
            var o = this.surfaces[i][0];
            var draw = 1;
            if (draw && cull) {
                var ab = sub(this.points[o[0]], this.points[o[1]]);
                var cb = sub(this.points[o[2]], this.points[o[1]]);
                var cross = ab.x * cb.y - ab.y * cb.x;
                draw = cross > -0.0000001;
            }

            todraw.push(draw);
        }

        for (var i = 0; i < this.points.length; ++i) {
            this.points[i] = this.getScreenCoords(this.points[i]);
        }

        for (var i = 0; i < this.surfaces.length; ++i) {
            if (!todraw[i]) continue;
            var o = this.surfaces[i][0];
            var sx = 0, sy = 0;
            for (var j = 0; j < o.length; ++j) {
                sx += this.points[o[j]].x;
                sy += this.points[o[j]].y;
            }
            sx /= o.length;
            sy /= o.length;
            var np = [];
            for (var j = 0; j < o.length; ++j) {
                np.push({x : (this.points[o[j]].x - sx) * scale + sx, y : sy + (this.points[o[j]].y - sy) * scale, z : this.points[o[j]].z});
            }
            this.pending_surfaces.push([np, this.surfaces[i][1]]);
        }
        this.surfaces = [];
        this.points = [];
    }

    this.paintersSort = function() {
        var d = [];
        for (var i = 0; i < this.pending_surfaces.length; ++i) {
            var o = this.pending_surfaces[i][0];
            var avg_z = 0;
            for (var j = 0; j < o.length; ++j) {
                avg_z += o[j].z;
            }
            avg_z /= o.length;
            d.push({z : avg_z, surface : this.pending_surfaces[i]});
        }

        d.sort(function(a, b) {
            return a.z - b.z;
        });

        this.pending_surfaces = [];
        for (var i = 0; i < d.length; ++i) {
            this.pending_surfaces.push(d[i].surface);
        }
    }

}
