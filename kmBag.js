/**
 * FORMAT
 * global string format. use:
 * "$1 is dead, but $1 is alive! $0 $2".format("ASP", "ASP.NET")
 */
if (!String.prototype.format) {
    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/\$([0-9]+)/g, function (match, number) {
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    };
}

/**
 * FIND
 * change global Array add method find(property, key)
 */
if (!Array.prototype.find) {
    Array.prototype.find = function arrayObjectIndexOf(property, value) {
        for (var i = 0, len = this.length; i < len; i++) {
            if (this[i][property] === value) return this[i];
        }
        return null;
    }
};

var kmApi = (function () {
    // private
    var _random = Math.random(),
        _format = 'fomating...';
    var _hash = (function () {
        var _textToSha1 = function (text) {
            if (typeof text === 'string') {
                var shaObj = new jsSHA(text, "TEXT");
                var hashHex = shaObj.getHash("SHA-1", "HEX");
                return hashHex;
            } else {
                throw 'please, input a string';
            }
        };

        var _textToMd5 = function (text) {
            if (typeof text === 'string') {
                var hashHex = md5(text);
                return hashHex;
            } else {
                throw 'please, input a string';
            }
        };
        
        var _hexToSha1 = function (hexText) {
            if (typeof hexText === 'string') {
                var shaObj = new jsSHA(hexText, "HEX");
                var hashHex = shaObj.getHash("SHA-1", "HEX");
                return hashHex;
            } else {
                throw 'please, input a HEX in string.';
}
        }
        return {
            sha1: _textToSha1,
            hexToSha1: _hexToSha1,
            md5: _textToMd5
        }
    })();

    /**
     *    HTML5 Web Storage
     *    With HTML5, web pages can store data locally within the user's browser.
     *
     *    Earlier, this was done with cookies. However, Web Storage is more secure and faster.
     *    The data is not included with every server request, but used ONLY when asked for.
     *    It is also possible to store large amounts of data, without affecting the website's performance.
     *
     *    The data is stored in name/value pairs, and a web page can only access data stored by itself.
     *
     *    Unlike cookies, the storage limit is far larger (at least 5MB) and information is never transferred to the server.
     */
    var _storage = (function () {
        var kmLocalStorage = {
            set: function (key, value) {
                localStorage[key] = JSON.stringify(value);
            },

            get: function (key) {
                var value = localStorage[key];
                if (value == null)
                    return null;

                return JSON.parse(value);
            },

            del: function (key) {
                localStorage.removeItem(key);
            }
        };

        var kmSessionStorage = {
            set: function (key, value) {
                sessionStorage[key] = JSON.stringify(value);
            },
            get: function (key) {
                var value = sessionStorage[key];
                if (value == null)
                    return null;

                return JSON.parse(value);
            },
            del: function (key) {
                sessionStorage.removeItem(key);
            }
        };
        /*
         * public interface
         */
        return {
            local: kmLocalStorage,
            session: kmSessionStorage
        };
    })(); //end storage    

    /**
     * Color Class
     * use:
     * color = new Color('#FFFFFF');     // for Hex colors, or
     * color = new Color(255, 255, 255); // for rgb colors, or
     * color = new Color(255, 255, 255); // for rgbalpha colors.
     *
     *
     * methods:
     *   color.add(color) or color.add(r, g, b):
     *   color.multiply(power):
     *   color.luminance(percent):
     *   color.inverse():
     *   color.blend(color, power):
     *   color.brigthness();
     *   color.difference(color):
     *   color.readability():
     *   color.toHex():
     *   color.toRGB():
     *   color.toRGBA():
     */
    function _color(r, g, b, a) {
        this.init(r, g, b, a);
    };

    _color.prototype = {
        r: 0,
        g: 0,
        b: 0,
        alpha: 1,

        init: function (r, g, b, alpha) {
            var color = r;

            if (typeof color === 'string') {
                if (!color.match('^#?(([0-9a-fA-F]{2}){3}|([0-9a-fA-F]){3})$'))
                    throw 'not a valid color.';

                var hex = this.normalize(color);
                this.r = parseInt(hex.charAt(0) + hex.charAt(1), 16);
                this.g = parseInt(hex.charAt(2) + hex.charAt(3), 16);
                this.b = parseInt(hex.charAt(4) + hex.charAt(5), 16);
            }

            if (typeof r === 'number') {
                this.r = this.rectify(r);
                this.g = this.rectify(g);
                this.b = this.rectify(b);
                if (typeof alpha === 'number')
                    this.alpha = Math.max(0, Math.min(alpha, 1));
            }
        },

        normalize: function (color) {
            var c = String(color).replace(/[^0-9a-f]/gi, '');
            if (c.length < 6) {
                c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
            }
            return c;
        },

        add: function (color, g, b) {
            if (typeof color === 'object') {
                this.r = this.rectify(this.r + color.r);
                this.g = this.rectify(this.r + color.g);
                this.b = this.rectify(this.r + color.b);
            } else {
                this.r = this.rectify(this.r + color);
                this.g = this.rectify(this.r + g);
                this.b = this.rectify(this.r + b);
            }
            return this;
        },

        multiply: function (power) {
            power = 0 || (1 + power);
            this.r = this.rectify(this.r * power);
            this.g = this.rectify(this.g * power);
            this.b = this.rectify(this.b * power);

            return this;
        },

        luminance: function (percent) {
            if (percent === undefined) return;

            var t = percent < 0 ? 0 : 255;
            percent = Math.abs(percent);
            this.r = this.rectify(((t - this.r) * percent) + this.r);
            this.g = this.rectify(((t - this.g) * percent) + this.g);
            this.b = this.rectify(((t - this.b) * percent) + this.b);

            return this;
        },

        inverse: function (color) {
            this.r = 255 - this.r;
            this.g = 255 - this.g;
            this.b = 255 - this.b;

            return this;
        },

        blend: function (color, power) {
            var r, g, b;
            if (typeof power === 'undefined') throw 'parameter power not defined. Ex: Color.blend(color, power)';
            r = ((color.r - this.r) * power) + this.r;
            g = ((color.g - this.g) * power) + this.g;
            b = ((color.b - this.b) * power) + this.b;
            return new _color(r, g, b);
        },

        brigthness: function () {
            return ((this.r * 299) + (this.g * 587) + (this.b * 114)) / 1000;
        },

        difference: function (color) {
            return Math.max(this.r, color.r) - Math.min(this.r, color.r) +
                Math.max(this.g, color.g) - Math.min(this.g, color.g) +
                Math.max(this.b, color.b) - Math.min(this.b, color.b);
        },

        complement: function (color) {
            var hsl = this.getHSL();
            hsl.H = (hsl.H + 180) % 360;
            var rgb = this.hslToRgb(hsl);
            return new _color(rgb.r, rgb.g, rgb.b);
        },

        getHSL: function () {
            var r = this.r / 255,
                g = this.g / 255,
                b = this.b / 255,
                delta = Math.max(r, g, b) - Math.min(r, g, b),
                L = (Math.max(r, g, b) + Math.min(r, g, b)) / 2,
                S = delta / (1 - Math.abs(2 * L - 1)),
                H = 0;

            if (Math.max(this.r, this.g, this.b) == this.r) {
                H = ((g - b) / delta % 6) * 60;
            } else if (Math.max(this.r, this.g, this.b) == this.g) {
                H = ((b - r) / delta + 2) * 60;
            } else {
                H = ((r - g) / delta + 4) * 60;
            }
            return {
                H: H,
                S: S,
                L: L
            };
        },

        hslToRgb: function (hsl) {
            var C = (1 - Math.abs(2 * hsl.L - 1)) * hsl.S,
                X = C * (1 - Math.abs((hsl.H / 60) % 2 - 1)),
                m = hsl.L - C / 2,
                h = (hsl.H % 360);

            if (h < 60) {
                return {
                    r: Math.round(255 * (C + m)),
                    g: Math.round(255 * (X + m)),
                    b: Math.round(255 * (m))
                }
            } else if (h < 120) {
                return {
                    r: Math.round(255 * (X + m)),
                    g: Math.round(255 * (C + m)),
                    b: Math.round(255 * (m))
                }
            } else if (h < 180) {
                return {
                    r: Math.round(255 * (m)),
                    g: Math.round(255 * (C + m)),
                    b: Math.round(255 * (X + m))
                }
            } else if (h < 240) {
                return {
                    r: Math.round(255 * (m)),
                    g: Math.round(255 * (X + m)),
                    b: Math.round(255 * (C + m))
                }
            } else if (h < 300) {
                return {
                    r: Math.round(255 * (X + m)),
                    g: Math.round(255 * (m)),
                    b: Math.round(255 * (C + m))
                }
            } else {
                return {
                    r: Math.round(255 * (C + m)),
                    g: Math.round(255 * (m)),
                    b: Math.round(255 * (X + m))
                }
            }
        },

        toHex: function () {
            return '#' + ('00' + this.r.toString(16)).slice(-2) +
                ('00' + this.g.toString(16)).slice(-2) +
                ('00' + this.b.toString(16)).slice(-2);
        },

        readability: function () {
            return this.brigthness() > 125 ? new _color(25, 25, 25) : new _color(225, 225, 225);
        },

        rectify: function (value) {
            return Math.round(Math.max(0, Math.min(value, 255)));
        },

        toRGB: function () {
            return 'rgb(' + this.r + ', ' + this.g + ', ' + this.b + ')';
        },

        toRGBA: function () {
            return 'rgba(' + this.r + ', ' + this.g + ', ' + this.b + ', ' + this.alpha + ')';
        },

        toString: function () {
            return this.toHex();
        }
    } // end _color

    return {
        //public 
        storage: _storage,
        rnd: _random,
        format: _format,
        Color: _color,
        hash: _hash
    }

})(); //kmApi and class