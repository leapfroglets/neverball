function Camera(x, y, z, yrot = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.yrot = yrot;
}

function Renderer(camera, canvas, context) {
    this.camera = camera;
    this.canvas = canvas;
    this.context = context;

    this.surfaces = [];
    this.points = [];
    this.pending_surfaces = [];

    this.aspect_ratio = 1.0;

    this.setAspectRatio = function(ar) {
        this.aspect_ratio = ar;
        //this.aspect_ratio = ar - .1;
    }

    this.zprp = -.6;

    this.getScreenCoords = function(point) {
        return {
            x : this.canvas.width / 2 * (1 + point.x / this.aspect_ratio),
            y : this.canvas.height / 2 * (1 - point.y),
            z : point.z
        };
    }

    this.toCamera = function(point) {
        point = {x : point.x - this.camera.x, y : point.y - this.camera.y, z : point.z - this.camera.z};
        point = rotateY(point, -this.camera.yrot);
        return {x : point.x, y : point.y, z : point.z};
    }

    this.projectToScreen = function(point) {
        var f = 1 / this.zprp / point.z;
        return {x : point.x * f, y : point.y * f, z : point.z};
    }

    this.clear = function() {
        this.surfaces = [];
        this.context.fillStyle = "white";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    this.drawImage = function(image, pos, w, h, alpha) {
        this.context.globalAlpha = alpha;
        this.context.drawImage(image, pos.x, pos.y, w, h);
        this.context.globalAlpha = 1;
    }

    //performs the final rendering to the canvas
    this.flush = function() {
        var twice = 0;
        for (var i = 0; i < this.pending_surfaces.length; ++i) {
            var o = this.pending_surfaces[i][0];
            this.context.beginPath();
            this.context.fillStyle = this.pending_surfaces[i][1];
            this.context.moveTo(o[0].x, o[0].y);
            for (var j = 1; j < o.length; ++j) {
                this.context.lineTo(o[j].x, o[j].y);
            }
            this.context.fill();
            if (twice) {
                this.context.translate(0.5, 0.5);
                this.context.beginPath();
                this.context.fillStyle = this.pending_surfaces[i][1];
                this.context.moveTo(o[0].x, o[0].y);
                for (var j = 1; j < o.length; ++j) {
                    this.context.lineTo(o[j].x, o[j].y);
                }
                this.context.fill();
                this.context.translate(-0.5, -0.5);
            }
        }
        this.pending_surfaces = [];
    }

    var self = this;

    var clip = function() {
        var near_plane = -.01;
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
        var again = 0;
        var toclip = [];
        var nottoclip = [];
        for (var i = 0; i < self.surfaces.length; ++i) {
            var o = self.surfaces[i][0];
            var mxz = self.points[o[0]].z;
            for (var j = 1; j < o.length; ++j) {
                mxz = Math.max(mxz, self.points[o[j]].z);
            }
            if (mxz < near_plane) {
                nottoclip.push(self.surfaces[i]);
                continue;
            }
            if (o.length == 4) {
                var ns = [[[o[0], o[1], o[2]], self.surfaces[i][1], self.surfaces[i][2]], [[o[2], o[3], o[0]], self.surfaces[i][1], self.surfaces[i][2]]];
                for (var j = 0; j < 2; ++j) {
                    var minz = self.points[ns[j][0][0]].z;
                    var maxz = self.points[ns[j][0][0]].z;
                    for (var k = 1; k < 3; ++k) {
                        var z = self.points[ns[j][0][k]].z;
                        minz = Math.min(minz, z);
                        maxz = Math.max(maxz, z);
                    }
                    if (minz < near_plane) {
                        if (maxz < near_plane) nottoclip.push(ns[j]);
                        else {
                            toclip.push(ns[j]);
                        }
                    }
                }
            } else {
                toclip.push(self.surfaces[i]);
            }
        }
        self.surfaces = [];
        for (var i = 0; i < toclip.length; ++i) {
            var s = toclip[i][0];
            var a = 0, b = 1, c = 2;
            var w = 0;
            if (self.points[s[a]].z < self.points[s[b]].z) {
                var tmp = a;
                a = b;
                b = tmp;
                w = 1 - w;
            }
            if (self.points[s[b]].z < self.points[s[c]].z) {
                var tmp = b;
                b = c;
                c = tmp;
                w = 1 - w;
            }
            if (self.points[s[a]].z < self.points[s[b]].z) {
                var tmp = a;
                a = b;
                b = tmp;
                w = 1 - w;
            }
            var scale = 1;
            //var scale = 1.00042;
            if (self.points[s[b]].z > near_plane) {
                var ua = (near_plane - self.points[s[c]].z) / (self.points[s[a]].z - self.points[s[c]].z);
                var ub = (near_plane - self.points[s[c]].z) / (self.points[s[b]].z - self.points[s[c]].z);
                var da = sub(self.points[s[a]], self.points[s[c]]);
                var db = sub(self.points[s[b]], self.points[s[c]]);
                var pa = createPoint(self.points[s[c]].x + ua * da.x, self.points[s[c]].y + ua * da.y, near_plane);
                var pb = createPoint(self.points[s[c]].x + ub * db.x, self.points[s[c]].y + ub * db.y, near_plane);
                self.points.push(pa);
                self.points.push(pb);
                var l = self.points.length - 1;
                s[a] = l - 1;
                s[b] = l;
                toclip[i][2] = scale;
                self.surfaces.push(toclip[i]);
            } else {
                var ub = (near_plane - self.points[s[a]].z) / (self.points[s[b]].z - self.points[s[a]].z);
                var uc = (near_plane - self.points[s[a]].z) / (self.points[s[c]].z - self.points[s[a]].z);
                var db = sub(self.points[s[b]], self.points[s[a]]);
                var dc = sub(self.points[s[c]], self.points[s[a]]);
                var pb = createPoint(self.points[s[a]].x + ub * db.x, self.points[s[a]].y + ub * db.y, self.points[s[a]].z + ub * db.z);
                //console.log(pb.x - self.points[s[a]].x, pb.y - self.points[s[a]].y, pb.z - self.points[s[a]].z);
                var pc = createPoint(self.points[s[a]].x + uc * dc.x, self.points[s[a]].y + uc * dc.y, near_plane);
                self.points.push(pb);
                self.points.push(pc);
                var l = self.points.length - 1;
                var col = toclip[i][1];
                //var scale = toclip[i][2];
                if (w == 0) {
                    self.surfaces.push([[l - 1, s[b], s[c]], col, scale]);
                    self.surfaces.push([[s[c], l, l - 1], col, scale]);
                } else {
                    self.surfaces.push([[l - 1, s[c], s[b]], col, scale]);
                    self.surfaces.push([[s[c], l - 1, l], col, scale]);
                }
            }
        }

        for (var i = 0; i < nottoclip.length; ++i) {
            self.surfaces.push(nottoclip[i]);
        }
    }

    this.push = function(cull = false) {

        for (var i = 0; i < this.points.length; ++i) {
            this.points[i] = this.toCamera(this.points[i]);
        }

        for (var i = 0; i < this.points.length; ++i) {
            this.points[i] = sub(this.points[i], this.info.point);
        }

        for (var i = 0; i < this.points.length; ++i) {
            this.points[i] = rotateZ(rotateX(this.points[i], this.info.xrot), this.info.zrot);
        }

        for (var i = 0; i < this.points.length; ++i) {
            this.points[i] = add(this.points[i], this.info.point);
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
            var scale = this.surfaces[i][2];
            for (var j = 0; j < o.length; ++j) {
                np.push({x : (this.points[o[j]].x - sx) * scale + sx, y : sy + (this.points[o[j]].y - sy) * scale, z : this.points[o[j]].z});
            }
            this.pending_surfaces.push([np, this.surfaces[i][1], this.surfaces[i][2]]);
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
