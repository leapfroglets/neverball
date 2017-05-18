function Grid2(x, y, z, width, breadth) {
    this.pts_horz = [];

    var steps = 10;

    this.set = function(x, y, z, width, breadth) {
        var sx = x - width / 2, sy = y, sz = z + breadth / 2;
        var w = width / steps;
        var b = breadth / steps;
        for (var i = 0; i < steps; ++i) {
            this.pts_horz[2 * i] = createPoint(sx + i * w, sy, sz);
            this.pts_horz[2 * i + 1] = createPoint(sx + i * w, sy, sz - breadth);
        }
    }

    this.set(x, y, z, width, breadth);

    this.draw = function(dinfo) {
        var projected = [];
        for (var i = 0; i < this.pts_horz.length; ++i) {
            projected[i] = dinfo.getScreenCoords(dinfo.projectToScreen(this.pts_horz[i]));
        }

        dinfo.lineStyle = "black";
        for (var i = 0; i < this.pts_horz.length; i += 2) {
            dinfo.context.beginPath();
            dinfo.context.moveTo(projected[i].x, projected[i].y);
            dinfo.context.lineTo(projected[i + 1].x, projected[i + 1].y);
            dinfo.context.stroke();
        }
    }

}

function Grid(x, y, z, width, breadth) {
    this.pts = [];
    var steps = 10;
    var w = width / steps;
    var b = breadth / steps;

    this.set = function(x, y, z, width, breadth) {
        var sx = x - width / 2, sy = y, sz = z + breadth / 2;
        this.pts = [];
        for (var i = 0; i < steps; ++i) {
            var row = [];
            for (var j = 0; j < steps; ++j) {
                row.push(createPoint(sx + j * w, sy, sz - i * b));
            }
            this.pts.push(row);
        }
    }

    this.set(x, y, z, width, breadth);

    this.draw = function(dinfo) {
        var projected = [];
        for (var i = 0; i < steps; ++i) {
            projected.push([]);
            for (var j = 0; j < steps; ++j) {
                projected[i][j] = dinfo.projectToScreen(this.pts[i][j]);
            }
        }

        for (var i = 0; i + 1 < steps; ++i) {
            for (var j = 0; j + 1 < steps; ++j) {
                var color = (i + j) % 2 == 0 ? "white" : "rgb(100, 100, 100)";
                dinfo.surfaces.push([[projected[i][j], projected[i][j + 1], projected[i + 1][j + 1], projected[i + 1][j]], color]);
            }
        }
    }

}
