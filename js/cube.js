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
        var projected = [];
        for (var i = 0; i < 8; ++i) {
            var pt = rotateY(this.pts[i], rot);
            pt.x += origin.x;
            pt.y += origin.y;
            pt.z += origin.z;
            projected[i] = dinfo.projectToScreen(pt);
        }

        dinfo.surfaces.push([[projected[0], projected[1], projected[2], projected[3]], "red"]);
        dinfo.surfaces.push([[projected[7], projected[6], projected[5], projected[4]], "green"]);
        dinfo.surfaces.push([[projected[2], projected[6], projected[7], projected[3]], "black"]);
        dinfo.surfaces.push([[projected[4], projected[5], projected[1], projected[0]], "blue"]);
        dinfo.surfaces.push([[projected[2], projected[1], projected[5], projected[6]], "brown"]);
    }

    this.update = function() {
        //rot += .01;
    }

}
