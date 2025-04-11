export function toPoint(x, y, round) {
    if (x instanceof Point) {
        return x;
    }

    if (Array.isArray(x)) {
        return new Point(x[0], x[1]);
    }

    if (x === undefined || x === null) {
        return x;
    }

    if (typeof x === "object" && "x" in x && "y" in x) {
        return new Point(x.x, x.y);
    }
    return new Point(x, y, round);
}

export function Point(x, y, round) {
    this.x = round ? Math.round(x) : x;
    this.y = round ? Math.round(y) : y;
}

var trunc = Math.trunc || function (v) {
    return v > 0 ? Math.floor(v) : Math.ceil(v);
}

Point.prototype = {
    clone: function () {
        return new Point(this.x, this.y);
    },
    add: function (point) {
        return this.clone()._add(toPoint(point))
    },
    _add: function (point) {
        this.x += point.x;
        this.y += point.y;
        return this;
    },
    subtract: function (point) {
        return this.clone()._subtract(toPoint(point));
    },
    _subtract: function (point) {
        this.x -= point.x;
        this.y -= point.y;
        return this;
    },
    divideBy: function (num) {
        return this.clone()._divideBy(num);
    },
    _divideBy: function (num) {
        this.x /= num;
        this.y /= num;
        return this;
    },
    multiplyBy: function (num) {
        return this.clone()._multiplyBy(num);
    },
    _multiplyBy: function (num) {
        this.x *= num;
        this.y *= num;
        return this;
    },
    scaleBy: function () {
        return new Point(this.x * point.x, this.y * point.y)
    },
    unscaleBy: function () {
        return new Point(this.x / point.x, this.y / point.y)
    },
    round: function () {
        return this.clone()._round();
    },
    _round: function () {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        return this;
    },
    floor: function () {
        return this.clone()._floor();
    },
    _floor: function () {
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
        return this;
    },
    ceil: function () {
        return this.clone()._ceil();
    },

    _ceil: function () {
        this.x = Math.ceil(this.x);
        this.y = Math.ceil(this.y);
        return this;
    },
    trunc: function () {
        return this.clone()._trunc();
    },

    _trunc: function () {
        this.x = trunc(this.x);
        this.y = trunc(this.y);
        return this;
    },
    distanceTo: function (point) {
        point = toPoint(point);

        var x = point.x - this.x,
            y = point.y - this.y;

        return Math.sqrt(x * x + y * y);
    },

    equals: function (p) {
        return p && this.x === p.x && this.y === p.y;
    },
    contains: function (point) {
        point = toPoint(point);

        return Math.abs(point.x) <= Math.abs(this.x) &&
            Math.abs(point.y) <= Math.abs(this.y);
    },
    toString: function () {
        return 'Point(' +
            formatNum(this.x) + ', ' +
            formatNum(this.y) + ')';
    }
}