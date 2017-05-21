function Tile(x, y, z, width, breadth, color = "blue") {
    this.pts = [];
    var origin = createPoint(x, y, z);
    this.set = function(x, y, z, width, breadth) {
        var sx = -width / 2; 
        var sy = 0;
        var sz = breadth / 2;
        this.pts[0] = createPoint(sx, sy, sz);
        this.pts[1] = createPoint(sx, sy, sz - breadth);
        this.pts[2] = createPoint(sx + width, sy, sz - breadth);
        this.pts[3] = createPoint(sx + width, sy, sz);
        //console.log(this.pts[0]);
    }

    this.set(x, y, z, width, breadth);

    this.push = function(dinfo) {
        for (var i = 0; i < 4; ++i) {
            var pt = dup(this.pts[i]);
            pt.x += origin.x;
            pt.y += origin.y;
            pt.z += origin.z;
            dinfo.points.push(pt);
        }

        dinfo.surfaces.push([[0, 1, 2, 3], color, 1]);
    }


}

function Cube(x, y, z, width, breadth, height) {
    var rot = 0;
    this.pts = [];
    var origin = createPoint(x, y, z);
    this.set = function(x, y, z, width, breadth, height) {
        var sx = -width / 2; 
        var sy = -height / 2; 
        var sz = breadth / 2;
        this.pts[0] = createPoint(sx, sy, sz);
        this.pts[1] = createPoint(sx, sy + height, sz);
        this.pts[2] = createPoint(sx + width, sy + height, sz);
        this.pts[3] = createPoint(sx + width, sy, sz);
        for (var i = 4; i < 8; ++i) {
            var n = i - 4;
            this.pts[i] = createPoint(this.pts[n].x, this.pts[n].y, this.pts[n].z - breadth);
        }
    }

    this.set(x, y, z, width, breadth, height);

    this.drawLines = function(dinfo) {
        var projected = [];
        for (var i = 0; i < 8; ++i) {
            var pt = rotateY(this.pts[i], rot);
            pt.x += origin.x;
            pt.y += origin.y;
            pt.z += origin.z;
            projected[i] = dinfo.getScreenCoords(dinfo.projectToScreen(pt));
        }

        for (var j = 0; j < 2; ++j) {
            dinfo.context.beginPath();
            dinfo.context.moveTo(projected[4 * j].x, projected[4 * j].y);

            for (var i = 1; i < 4; ++i) {
                dinfo.context.lineTo(projected[4 * j + i].x, projected[4 * j + i].y);
            }
            dinfo.context.lineTo(projected[4 * j].x, projected[4 * j].y);
            dinfo.context.stroke();
        }

        dinfo.context.beginPath();
        for (var i = 0; i < 4; ++i) {
            dinfo.context.moveTo(projected[i].x, projected[i].y);
            dinfo.context.lineTo(projected[i + 4].x, projected[i + 4].y);
        }
        dinfo.context.stroke();
    }

    this.draw = function(dinfo) {
        for (var i = 0; i < 8; ++i) {
            var pt = rotateY(this.pts[i], rot);
            pt.x += origin.x;
            pt.y += origin.y;
            pt.z += origin.z;
            dinfo.points.push(pt);
        }

        dinfo.surfaces.push([[0, 1, 2, 3], "#D2691E", 1]);
        dinfo.surfaces.push([[7, 6, 5, 4], "#F4A460", 1]);
        dinfo.surfaces.push([[2, 6, 7, 3], "#CD853F", 1]);
        dinfo.surfaces.push([[4, 5, 1, 0], "#A0522D", 1]);
        //top surface
        dinfo.surfaces.push([[2, 1, 5, 6], "#8B4513", 1, 1]);
    }

    this.update = function() {
        //rot += .01;
    }

    this.getPoints = function() {
        var res = [];
        var idx = [0, 4, 7, 3];
        for (var i = 0; i < 4; ++i) {
            res.push({x : this.pts[idx[i]].x + origin.x, z : this.pts[idx[i]].z + origin.z});
        }
        return res;
    }

}
