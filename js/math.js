function createPoint(x, y, z) {
    return {x : x, y : y, z : z};
}

function add(point1, point2) {
    return {x : point1.x + point2.x, y : point1.y + point2.y, z : point1.z + point2.z};
}

function sub(point1, point2) {
    return {x : point1.x - point2.x, y : point1.y - point2.y, z : point1.z - point2.z};
}

function dot(point1, point2) {
    return point1.x * point2.x + point1.y * point2.y + point1.z * point2.z;
}

function rotateY(point, ang) {
    var cos = Math.cos(ang);
    var sin = Math.sin(ang);
    return createPoint(sin * point.z + cos * point.x, point.y, cos * point.z - sin * point.x);
}

function rotateX(point, ang) {
    var cos = Math.cos(ang);
    var sin = Math.sin(ang);
    return createPoint(point.x, cos * point.y - sin * point.z, sin * point.y + cos * point.z);

}

function rotateZ(point, ang) {
    var cos = Math.cos(ang);
    var sin = Math.sin(ang);
    return createPoint(cos * point.x - sin * point.y, sin * point.x + cos * point.y, point.z);
}

function dup(point) {
    return createPoint(point.x, point.y, point.z);
}
