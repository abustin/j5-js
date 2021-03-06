CanvasMatrix4 = function(a) {
    if (typeof a == "object") if ("length" in a && a.length >= 16) {
        this.load(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[9], a[10], a[11], a[12], a[13], a[14], a[15]);
        return
    } else if (a instanceof CanvasMatrix4) {
        this.load(a);
        return
    }
    this.makeIdentity()
};
CanvasMatrix4.prototype.multVector = function(a, c) {
    var d = a[0],
    e = a[1],
    f = a[2],
    c = c || [];
    c[0] = d * this.m11 + e * this.m21 + f * this.m31 + 1 * this.m41;
    c[1] = d * this.m12 + e * this.m22 + f * this.m32 + 1 * this.m42;
    c[2] = d * this.m13 + e * this.m23 + f * this.m33 + 1 * this.m43;
    c[3] = d * this.m14 + e * this.m24 + f * this.m34 + 1 * this.m44;
    return c
};
CanvasMatrix4.prototype.load = function(a) {
    if (a && typeof a == "object") {
        if (a instanceof CanvasMatrix4) {
            this.m11 = a.m11;
            this.m12 = a.m12;
            this.m13 = a.m13;
            this.m14 = a.m14;
            this.m21 = a.m21;
            this.m22 = a.m22;
            this.m23 = a.m23;
            this.m24 = a.m24;
            this.m31 = a.m31;
            this.m32 = a.m32;
            this.m33 = a.m33;
            this.m34 = a.m34;
            this.m41 = a.m41;
            this.m42 = a.m42;
            this.m43 = a.m43;
            this.m44 = a.m44;
            return
        }
        if ("length" in a && a.length == 16) {
            this.m11 = a[0];
            this.m12 = a[1];
            this.m13 = a[2];
            this.m14 = a[3];
            this.m21 = a[4];
            this.m22 = a[5];
            this.m23 = a[6];
            this.m24 = a[7];
            this.m31 = a[8];
            this.m32 = a[9];
            this.m33 = a[10];
            this.m34 = a[11];
            this.m41 = a[12];
            this.m42 = a[13];
            this.m43 = a[14];
            this.m44 = a[15];
            return
        }
    }
    this.makeIdentity()
};
CanvasMatrix4.prototype.getAsArray = function() {
    return [this.m11, this.m12, this.m13, this.m14, this.m21, this.m22, this.m23, this.m24, this.m31, this.m32, this.m33, this.m34, this.m41, this.m42, this.m43, this.m44]
};
CanvasMatrix4.prototype.getAsWebGLFloatArray = function() {
    return new Float32Array([this.m11, this.m12, this.m13, this.m14, this.m21, this.m22, this.m23, this.m24, this.m31, this.m32, this.m33, this.m34, this.m41, this.m42, this.m43, this.m44])
};
CanvasMatrix4.prototype.makeIdentity = function() {
    this.m11 = 1;
    this.m21 = this.m14 = this.m13 = this.m12 = 0;
    this.m22 = 1;
    this.m32 = this.m31 = this.m24 = this.m23 = 0;
    this.m33 = 1;
    this.m43 = this.m42 = this.m41 = this.m34 = 0;
    this.m44 = 1
};
CanvasMatrix4.prototype.transpose = function() {
    var a = this.m12;
    this.m12 = this.m21;
    this.m21 = a;
    a = this.m13;
    this.m13 = this.m31;
    this.m31 = a;
    a = this.m14;
    this.m14 = this.m41;
    this.m41 = a;
    a = this.m23;
    this.m23 = this.m32;
    this.m32 = a;
    a = this.m24;
    this.m24 = this.m42;
    this.m42 = a;
    a = this.m34;
    this.m34 = this.m43;
    this.m43 = a
};
CanvasMatrix4.prototype.invert = function() {
    var a = this._determinant4x4();
    if (Math.abs(a) < 1.0E-8) return null;
    this._makeAdjoint();
    this.m11 /= a;
    this.m12 /= a;
    this.m13 /= a;
    this.m14 /= a;
    this.m21 /= a;
    this.m22 /= a;
    this.m23 /= a;
    this.m24 /= a;
    this.m31 /= a;
    this.m32 /= a;
    this.m33 /= a;
    this.m34 /= a;
    this.m41 /= a;
    this.m42 /= a;
    this.m43 /= a;
    this.m44 /= a
};
CanvasMatrix4.prototype.translateOpt = function(a, c, d) {
    this.m41 = a || 0;
    this.m42 = c || 0;
    this.m43 = d || 0
};
CanvasMatrix4.prototype.translate = function(a, c, d) {
    var e = new CanvasMatrix4;
    e.m41 = a || 0;
    e.m42 = c || 0;
    e.m43 = d || 0;
    this.multRight(e)
};
CanvasMatrix4.prototype.scale = function(a, c, d) {
    a == void 0 && (a = 1);
    d == void 0 ? d = c == void 0 ? c = a: 1: c == void 0 && (c = a);
    var e = new CanvasMatrix4;
    e.m11 = a;
    e.m22 = c;
    e.m33 = d;
    this.multRight(e)
};
CanvasMatrix4.prototype.sin = Math.sin;
CanvasMatrix4.prototype.cos = Math.cos;
CanvasMatrix4.prototype.rotateX = function(a) {
    a *= 0.5;
    var c = this.sin(a),
    a = this.cos(a),
    d = c * c;
    this.m22 = 1 - 2 * d;
    this.m23 = 2 * c * a;
    this.m32 = -2 * c * a;
    this.m33 = 1 - 2 * d;
    return this
};
CanvasMatrix4.prototype.rotateY = function(a) {
    a *= 0.5;
    var c = this.sin(a),
    a = this.cos(a),
    d = c * c;
    this.m11 = 1 - 2 * d;
    this.m13 = -2 * c * a;
    this.m31 = 2 * c * a;
    this.m33 = 1 - 2 * d;
    return this
};
CanvasMatrix4.prototype.rotateZ = function(a) {
    a *= 0.5;
    var c = this.sin(a),
    a = this.cos(a),
    d = c * c;
    this.m11 = 1 - 2 * d;
    this.m12 = 2 * c * a;
    this.m21 = -2 * c * a;
    this.m22 = 1 - 2 * d;
    return this
};
CanvasMatrix4.prototype.rotate = function(a, c, d, e) {
    a /= 2;
    var f = Math.sin(a),
    a = Math.cos(a),
    h = f * f,
    b = Math.sqrt(c * c + d * d + e * e);
    b == 0 ? (d = c = 0, e = 1) : b != 1 && (c /= b, d /= b, e /= b);
    b = new CanvasMatrix4;
    if (c == 1 && d == 0 && e == 0) b.m11 = 1,
    b.m12 = 0,
    b.m13 = 0,
    b.m21 = 0,
    b.m22 = 1 - 2 * h,
    b.m23 = 2 * f * a,
    b.m31 = 0,
    b.m32 = -2 * f * a,
    b.m33 = 1 - 2 * h;
    else if (c == 0 && d == 1 && e == 0) b.m11 = 1 - 2 * h,
    b.m12 = 0,
    b.m13 = -2 * f * a,
    b.m21 = 0,
    b.m22 = 1,
    b.m23 = 0,
    b.m31 = 2 * f * a,
    b.m32 = 0,
    b.m33 = 1 - 2 * h;
    else if (c == 0 && d == 0 && e == 1) b.m11 = 1 - 2 * h,
    b.m12 = 2 * f * a,
    b.m13 = 0,
    b.m21 = -2 * f * a,
    b.m22 = 1 - 2 * h,
    b.m23 = 0,
    b.m31 = 0,
    b.m32 =
    0,
    b.m33 = 1;
    else {
        var i = c * c,
        j = d * d,
        g = e * e;
        b.m11 = 1 - 2 * (j + g) * h;
        b.m12 = 2 * (c * d * h + e * f * a);
        b.m13 = 2 * (c * e * h - d * f * a);
        b.m21 = 2 * (d * c * h - e * f * a);
        b.m22 = 1 - 2 * (g + i) * h;
        b.m23 = 2 * (d * e * h + c * f * a);
        b.m31 = 2 * (e * c * h + d * f * a);
        b.m32 = 2 * (e * d * h - c * f * a);
        b.m33 = 1 - 2 * (i + j) * h
    }
    b.m14 = b.m24 = b.m34 = 0;
    b.m41 = b.m42 = b.m43 = 0;
    b.m44 = 1;
    this.multRight(b)
};
CanvasMatrix4.prototype.multRight = function(a) {
    var c = this.m11 * a.m12 + this.m12 * a.m22 + this.m13 * a.m32 + this.m14 * a.m42,
    d = this.m11 * a.m13 + this.m12 * a.m23 + this.m13 * a.m33 + this.m14 * a.m43,
    e = this.m11 * a.m14 + this.m12 * a.m24 + this.m13 * a.m34 + this.m14 * a.m44,
    f = this.m21 * a.m11 + this.m22 * a.m21 + this.m23 * a.m31 + this.m24 * a.m41,
    h = this.m21 * a.m12 + this.m22 * a.m22 + this.m23 * a.m32 + this.m24 * a.m42,
    b = this.m21 * a.m13 + this.m22 * a.m23 + this.m23 * a.m33 + this.m24 * a.m43,
    i = this.m21 * a.m14 + this.m22 * a.m24 + this.m23 * a.m34 + this.m24 * a.m44,
    j = this.m31 * a.m11 +
    this.m32 * a.m21 + this.m33 * a.m31 + this.m34 * a.m41,
    g = this.m31 * a.m12 + this.m32 * a.m22 + this.m33 * a.m32 + this.m34 * a.m42,
    k = this.m31 * a.m13 + this.m32 * a.m23 + this.m33 * a.m33 + this.m34 * a.m43,
    l = this.m31 * a.m14 + this.m32 * a.m24 + this.m33 * a.m34 + this.m34 * a.m44,
    m = this.m41 * a.m11 + this.m42 * a.m21 + this.m43 * a.m31 + this.m44 * a.m41,
    n = this.m41 * a.m12 + this.m42 * a.m22 + this.m43 * a.m32 + this.m44 * a.m42,
    o = this.m41 * a.m13 + this.m42 * a.m23 + this.m43 * a.m33 + this.m44 * a.m43,
    p = this.m41 * a.m14 + this.m42 * a.m24 + this.m43 * a.m34 + this.m44 * a.m44;
    this.m11 = this.m11 * a.m11 +
    this.m12 * a.m21 + this.m13 * a.m31 + this.m14 * a.m41;
    this.m12 = c;
    this.m13 = d;
    this.m14 = e;
    this.m21 = f;
    this.m22 = h;
    this.m23 = b;
    this.m24 = i;
    this.m31 = j;
    this.m32 = g;
    this.m33 = k;
    this.m34 = l;
    this.m41 = m;
    this.m42 = n;
    this.m43 = o;
    this.m44 = p
};
CanvasMatrix4.prototype.multLeft = function(a) {
    var c = this.m11,
    d = this.m12,
    e = this.m13,
    f = this.m14,
    h = this.m21,
    b = this.m22,
    i = this.m23,
    j = this.m24,
    g = this.m31,
    k = this.m32,
    l = this.m33,
    m = this.m34,
    n = this.m41,
    o = this.m42,
    p = this.m43,
    q = this.m44,
    r = a.m11,
    s = a.m12,
    t = a.m13,
    u = a.m14,
    v = a.m21,
    w = a.m22,
    x = a.m23,
    y = a.m24,
    z = a.m31,
    A = a.m32,
    B = a.m33,
    C = a.m34,
    D = a.m41,
    E = a.m42,
    F = a.m43,
    a = a.m44;
    this.m11 = r * c + s * h + t * g + u * n;
    this.m12 = r * d + s * b + t * k + u * o;
    this.m13 = r * e + s * i + t * l + u * p;
    this.m14 = r * f + s * j + t * m + u * q;
    this.m21 = v * c + w * h + x * g + y * n;
    this.m22 = v * d + w * b + x * k + y * o;
    this.m23 = v * e + w * i + x * l + y * p;
    this.m24 = v * f + w * j + x * m + y * q;
    this.m31 = z * c + A * h + B * g + C * n;
    this.m32 = z * d + A * b + B * k + C * o;
    this.m33 = z * e + A * i + B * l + C * p;
    this.m34 = z * f + A * j + B * m + C * q;
    this.m41 = D * c + E * h + F * g + a * n;
    this.m42 = D * d + E * b + F * k + a * o;
    this.m43 = D * e + E * i + F * l + a * p;
    this.m44 = D * f + E * j + F * m + a * q;
    return this
};
CanvasMatrix4.prototype.ortho = function(a, c, d, e, f, h) {
    var b = (a + c) / (a - c),
    i = (e + d) / (e - d),
    j = (h + f) / (h - f),
    g = new CanvasMatrix4;
    g.m11 = 2 / (a - c);
    g.m12 = 0;
    g.m13 = 0;
    g.m14 = 0;
    g.m21 = 0;
    g.m22 = 2 / (e - d);
    g.m23 = 0;
    g.m24 = 0;
    g.m31 = 0;
    g.m32 = 0;
    g.m33 = -2 / (h - f);
    g.m34 = 0;
    g.m41 = b;
    g.m42 = i;
    g.m43 = j;
    g.m44 = 1;
    this.multRight(g)
};
CanvasMatrix4.prototype.frustum = function(a, c, d, e, f, h) {
    var b = new CanvasMatrix4;
    b.m11 = 2 * f / (c - a);
    b.m12 = 0;
    b.m13 = 0;
    b.m14 = 0;
    b.m21 = 0;
    b.m22 = 2 * f / (e - d);
    b.m23 = 0;
    b.m24 = 0;
    b.m31 = (c + a) / (c - a);
    b.m32 = (e + d) / (e - d);
    b.m33 = -(h + f) / (h - f);
    b.m34 = -1;
    b.m41 = 0;
    b.m42 = 0;
    b.m43 = -(2 * h * f) / (h - f);
    b.m44 = 0;
    this.multRight(b)
};
CanvasMatrix4.prototype.perspective = function(a, c, d, e) {
    var a = Math.tan(a * Math.PI / 360) * d,
    f = -a;
    this.frustum(c * f, c * a, f, a, d, e)
};
CanvasMatrix4.prototype.lookat = function(a, c, d, e, f, h, b, i, j) {
    var g = new CanvasMatrix4,
    e = a - e,
    f = c - f,
    h = d - h,
    k = Math.sqrt(e * e + f * f + h * h);
    k && (e /= k, f /= k, h /= k);
    var l = i * h - j * f,
    m = -b * h + j * e,
    n = b * f - i * e,
    i = -e * n + h * l,
    b = e * m - f * l;
    if (k = Math.sqrt(l * l + m * m + n * n)) l /= k,
    m /= k,
    n /= k;
    if (k = Math.sqrt(b * b + i * i + j * j)) b /= k,
    i /= k,
    j /= k;
    g.m11 = l;
    g.m12 = m;
    g.m13 = n;
    g.m14 = 0;
    g.m21 = b;
    g.m22 = i;
    g.m23 = j;
    g.m24 = 0;
    g.m31 = e;
    g.m32 = f;
    g.m33 = h;
    g.m34 = 0;
    g.m41 = 0;
    g.m42 = 0;
    g.m43 = 0;
    g.m44 = 1;
    g.translate( - a, -c, -d);
    this.multRight(g)
};
CanvasMatrix4.prototype._determinant2x2 = function(a, c, d, e) {
    return a * e - c * d
};
CanvasMatrix4.prototype._determinant3x3 = function(a, c, d, e, f, h, b, i, j) {
    return a * this._determinant2x2(f, h, i, j) - e * this._determinant2x2(c, d, i, j) + b * this._determinant2x2(c, d, f, h)
};
CanvasMatrix4.prototype._determinant4x4 = function() {
    var a = this.m12,
    c = this.m13,
    d = this.m14,
    e = this.m21,
    f = this.m22,
    h = this.m23,
    b = this.m24,
    i = this.m31,
    j = this.m32,
    g = this.m33,
    k = this.m34,
    l = this.m41,
    m = this.m42,
    n = this.m43,
    o = this.m44;
    return this.m11 * this._determinant3x3(f, j, m, h, g, n, b, k, o) - a * this._determinant3x3(e, i, l, h, g, n, b, k, o) + c * this._determinant3x3(e, i, l, f, j, m, b, k, o) - d * this._determinant3x3(e, i, l, f, j, m, h, g, n)
};
CanvasMatrix4.prototype._makeAdjoint = function() {
    var a = this.m11,
    c = this.m12,
    d = this.m13,
    e = this.m14,
    f = this.m21,
    h = this.m22,
    b = this.m23,
    i = this.m24,
    j = this.m31,
    g = this.m32,
    k = this.m33,
    l = this.m34,
    m = this.m41,
    n = this.m42,
    o = this.m43,
    p = this.m44;
    this.m11 = this._determinant3x3(h, g, n, b, k, o, i, l, p);
    this.m21 = -this._determinant3x3(f, j, m, b, k, o, i, l, p);
    this.m31 = this._determinant3x3(f, j, m, h, g, n, i, l, p);
    this.m41 = -this._determinant3x3(f, j, m, h, g, n, b, k, o);
    this.m12 = -this._determinant3x3(c, g, n, d, k, o, e, l, p);
    this.m22 = this._determinant3x3(a,
    j, m, d, k, o, e, l, p);
    this.m32 = -this._determinant3x3(a, j, m, c, g, n, e, l, p);
    this.m42 = this._determinant3x3(a, j, m, c, g, n, d, k, o);
    this.m13 = this._determinant3x3(c, h, n, d, b, o, e, i, p);
    this.m23 = -this._determinant3x3(a, f, m, d, b, o, e, i, p);
    this.m33 = this._determinant3x3(a, f, m, c, h, n, e, i, p);
    this.m43 = -this._determinant3x3(a, f, m, c, h, n, d, b, o);
    this.m14 = -this._determinant3x3(c, h, g, d, b, k, e, i, l);
    this.m24 = this._determinant3x3(a, f, j, d, b, k, e, i, l);
    this.m34 = -this._determinant3x3(a, f, j, c, h, g, e, i, l);
    this.m44 = this._determinant3x3(a, f, j, c,
    h, g, d, b, k)
};