function Renderer(camera, canvas, context) {
    this.camera = camera;
    this.canvas = canvas;
    this.context = context;

    this.surfaces = [];

    this.getScreenCoords = function(point) {
        return {
            x : this.canvas.width / 2 * (1 + point.x),
            y : this.canvas.height / 2 * (1 - point.y),
            z : point.z
        };
    }

    this.projectToScreen = function(point) {
        var cx = point.x - this.camera.x;
        var cy = point.y - this.camera.y;
        var cz = point.z - this.camera.z;
        return {x : cx / -cz, y : cy / -cz, z : cz};
    }

    this.clear = function() {
        this.surfaces = [];
        this.context.fillStyle = "grey";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    //performs the final rendering to the canvas
    this.flush = function(cull = false) {
        for (var i = 0; i < this.surfaces.length; ++i) {
            var o = this.surfaces[i][0];
            var draw = 1;
            if (cull) {
                var ab = sub(o[0], o[1]);
                var cb = sub(o[2], o[1]);
                var cross = ab.x * cb.y - ab.y * cb.x;
                draw = cross > -0.00001;
            }

            if (!draw) continue;

            var surf_to_screen = [];

            for (var j = 0; j < o.length; ++j) {
                surf_to_screen.push(this.getScreenCoords(o[j]));
            }

            o = surf_to_screen;

            this.context.beginPath();
            this.context.fillStyle = this.surfaces[i][1];
            this.context.moveTo(o[0].x, o[0].y);
            for (var j = 1; j < o.length; ++j) {
                this.context.lineTo(o[j].x, o[j].y);
            }
            this.context.fill();
        }
        this.surfaces = [];
    }

    this.paintersSort = function() {
        var d = [];
        for (var i = 0; i < this.surfaces.length; ++i) {
            var o = this.surfaces[i][0];
            var avg_z = 0;
            for (var j = 0; j < o.length; ++j) {
                avg_z += o[j].z;
            }
            avg_z /= o.length;
            d.push({z : avg_z, surface : this.surfaces[i]});
        }

        d.sort(function(a, b) {
            return a.z > b.z;
        });

        this.surfaces = [];
        for (var i = 0; i < d.length; ++i) {
            this.surfaces.push(d[i].surface);
        }
    }

}
