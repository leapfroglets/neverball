function Sphere(x, y, z, radius) {
    var x_rot = 0;
    var z_rot = 0;
    this.pts = [];
    this.origin = createPoint(x, y, z);
    var steps = 21;
    
    this.set = function(x, y, z, radius) {
        this.radius = radius;
        var vstp = Math.PI / (steps - 1);
        var hstp = 2 * Math.PI / (steps - 1);

        this.pts = [];
        var pt = createPoint(0, radius, 0);
        for (var i = 0; i < steps; ++i) {
            var row = [];
            var cur = createPoint(pt.x, pt.y, pt.z);
            for (var j = 0; j < steps; ++j) {
                row.push(cur);
                cur = rotateY(cur, hstp);
            }
            pt = rotateX(pt, vstp);
            this.pts.push(row);
        }
    }

    var vx = 0, vy = 0, vz = 0;

    var handleKeyStrokes = function() {
        var vinc = 0.0005;
        if (KEY_STATE[KEY_LEFT]) {
            vx -= vinc;
        }
        if (KEY_STATE[KEY_RIGHT]) {
            vx += vinc;
        }

        if (KEY_STATE[KEY_UP]) {
            vz -= vinc;
        }

        if (KEY_STATE[KEY_DOWN]) {
            vz += vinc;
        }
    }

    this.set(x, y, z, radius);

    this.drawLines = function(dinfo) {
        var projected = [];
        for (var i = 0; i < this.pts.length; ++i) {
            var row = [];
            var pt = rotateY(this.pts[i], rot);
            pt.x += this.origin.x;
            pt.y += this.origin.y;
            pt.z += this.origin.z;
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
        for (var i = 0; i < this.pts.length; ++i) {
            var row = [];
            for (var j = 0; j < this.pts[i].length; ++j) {
                var pt = createPoint(this.pts[i][j].x, this.pts[i][j].y, this.pts[i][j].z);
                pt.x += this.origin.x;
                pt.y += this.origin.y;
                pt.z += this.origin.z;
                row[j] = dinfo.projectToScreen(pt);
            }
            projected[i] = row;
        }

        for (var i = 0; i + 1 < projected.length; ++i) {
            for (var j = 0; j + 1 < projected[i].length; ++j) {
                var color = (Math.floor(j / 2)) % 2 == 0 ? "red" : "black";
                dinfo.surfaces.push([[projected[i][j], projected[i][j + 1], projected[i + 1][j + 1], projected[i + 1][j]], color]);
            }
        }
    }

    this.update = function() {
        handleKeyStrokes();
        this.origin.x += vx;
        this.origin.y += vy;
        this.origin.z += vz;
        var mg = Math.sqrt(vx * vx + vz * vz);
        if (mg != 0) {
            var u = vx / mg;
            var v = vz / mg;
            //console.log(u, v);
            var ang = Math.atan2(u, v) + Math.PI / 2;
            //console.log((ang + Math.PI / 2) * 180 / Math.PI);
            var rot = mg / this.radius;
            for (var i = 0; i < this.pts.length; ++i) {
                for (var j = 0; j < this.pts[i].length; ++j) {
                    this.pts[i][j] = rotateY(rotateZ(rotateY(this.pts[i][j], -ang), rot), ang);
                }
            }
        }

        vx *= 0.98;
        vy *= 0.98;
        vz *= 0.98;

    }

}
