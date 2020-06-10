/*jshint ignore: start*/
(function () {

    window.Base64 = {
        _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
        _y: ['isNaN', 'null', 0, -1, 1, 2, 3, 4],
        _x: 'rstuvwxyz0123456',
        encode: function (e) {
            var t = "";
            var n, r, i, s, o, u, a;
            var f = 0;
            e = Base64._utf8_encode(e);
            while (f < e.length) {
                n = e.charCodeAt(f++);
                r = e.charCodeAt(f++);
                i = e.charCodeAt(f++);
                s = n >> 2;
                o = (n & 3) << 4 | r >> 4;
                u = (r & 15) << 2 | i >> 6;
                a = i & 63;
                if (isNaN(r)) {
                    u = a = 64
                } else if (isNaN(i)) {
                    a = 64
                }
                t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a)
            }
            return t
        },
        decode: function (e) {
            var t = "";
            var n, r, i;
            var s, o, u, a;
            var f = 0;
            e = e.replace(/[^A-Za-z0-9+/=]/g, "");
            while (f < e.length) {
                s = this._keyStr.indexOf(e.charAt(f++));
                o = this._keyStr.indexOf(e.charAt(f++));
                u = this._keyStr.indexOf(e.charAt(f++));
                a = this._keyStr.indexOf(e.charAt(f++));
                n = s << 2 | o >> 4;
                r = (o & 15) << 4 | u >> 2;
                i = (u & 3) << 6 | a;
                t = t + String.fromCharCode(n);
                if (u != 64) {
                    t = t + String.fromCharCode(r)
                }
                if (a != 64) {
                    t = t + String.fromCharCode(i)
                }
            }
            t = Base64._utf8_decode(t);
            return t
        },
        _utf8_encode: function (e) {
            e = e.replace(/rn/g, "n");
            var t = "";
            for (var n = 0; n < e.length; n++) {
                var r = e.charCodeAt(n);
                if (r < 128) {
                    t += String.fromCharCode(r)
                } else if (r > 127 && r < 2048) {
                    t += String.fromCharCode(r >> 6 | 192);
                    t += String.fromCharCode(r & 63 | 128)
                } else {
                    t += String.fromCharCode(r >> 12 | 224);
                    t += String.fromCharCode(r >> 6 & 63 | 128);
                    t += String.fromCharCode(r & 63 | 128)
                }
            }
            return t
        },
        _utf8_decode: function (e) {
            var t = "";
            var n = 0;
            var r = c1 = c2 = 0;
            while (n < e.length) {
                r = e.charCodeAt(n);
                if (r < 128) {
                    t += String.fromCharCode(r);
                    n++
                } else if (r > 191 && r < 224) {
                    c2 = e.charCodeAt(n + 1);
                    t += String.fromCharCode((r & 31) << 6 | c2 & 63);
                    n += 2
                } else {
                    c2 = e.charCodeAt(n + 1);
                    c3 = e.charCodeAt(n + 2);
                    t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
                    n += 3
                }
            }
            return t
        }
    };
})();


(function () {
    'use strict';
    window.formUrl = function (obj) {
        var str = "";
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                str += "&" + i + "=" + encodeURIComponent(obj[i]);
            }
        }
        return str.replace(/^&/i, "");
    };

    window.formArrayURL = function (nombre, arr) {
        var fd = new FormData();
        for (var i = 0; i < arr.length; i++) {
            fd.append(nombre + "[]", formURL(arr[i]));
        }
        return fd;
    };

    window.isFunction = function (object) {
        return object && (typeof object == 'function');
    };

    /**
     * Define el lugar (Fila o Celda) y el color/clase a aplicar
     *
     * @param {prioridad}
     *            String
     * @param {dias}
     *            Number
     * @return {Object}
     */
    window.defineColorMuestra = function (prioridad, dias) {
        if (arguments.length < 2) {
            throw new Error('El numero de argumentos es inválido [prioridad | dias]');
        }
        prioridad = prioridad ? prioridad.toUpperCase() : null;

        switch (prioridad) {
            case 'URGENTE':
                if (dias <= 2) {
                    return {
                        tipo: 'celda',
                        color: 'text-success'
                    };
                } else if (dias <= 4) {
                    return {
                        tipo: 'celda',
                        color: 'text-warning'
                    };
                } else if (dias === 5) {
                    return {
                        tipo: 'celda',
                        color: 'text-danger'
                    };
                } else {
                    return {
                        tipo: 'fila',
                        // Aqui debe ser un color establecido en la tabla
                        color: 'pink'
                    };
                }
                break;
            case 'NORMAL':
                if (dias <= 10) {
                    return {
                        tipo: 'celda',
                        color: 'text-success'
                    };
                } else if (dias <= 20) {
                    return {
                        tipo: 'celda',
                        color: 'text-warning'
                    };
                } else if (dias <= 31) {
                    return {
                        tipo: 'celda',
                        color: 'text-danger'
                    };
                } else {
                    return {
                        tipo: 'fila',
                        // Aqui debe ser un color establecido en la tabla
                        color: 'pink'
                    };
                }
                break;
            default:
                return {
                    tipo: null,
                    color: ''
                };
        }
    };

    /**
     * Convierte una URL a un tag de Img
     *
     * @param {url}
     *            String
     * @param {alt}
     *            String
     * @return {String} Un tag de img con atributos "src" y "alt"
     */
    window._urlToImgTag = function (url, alt) {
        var img = '<img src="' + url + '"';
        if (alt) {
            img += 'alt="' + alt + '"';
        }
        img += '></img>';

        return img;
    };

    /**
     * Numero aleatorio positivo entre 1 - 50 si no se especifica el limite
     *
     * @return Number
     */
    window.randNum = function (limite) {
        limite = limite ? limite : 50;
        return Math.floor((Math.random() * limite) + 1);
    };

    /**
     * Recibe un longint de una fecha que convierte en el formato dd/mm/aaaa hh:mm
     *
     * @param {}
     *            longint del tiempo
     * @return {String} 22/12/2016 10:10
     */
    window.convertirMilisegundosFechaCompleta = function (milisegundos) {
        if (milisegundos == null || milisegundos === undefined) return "";
        var f = new Date(milisegundos);
        var m = (((f.getMonth() + 1) > 9) ? f.getMonth() + 1 : "0" + (f.getMonth() + 1));
        var d = (((f.getDate()) > 9) ? f.getDate() : "0" + f.getDate());
        var hh = (((f.getHours()) > 9) ? f.getHours() : "0" + (f.getHours()));
        var mm = (((f.getMinutes()) > 9) ? f.getMinutes() : "0" + f.getMinutes());
        var ss = (f.getSeconds() > 9) ? f.getSeconds() : "0" + f.getSeconds();
        return d + "/" + m + "/" + f.getFullYear() + " " + hh + ":" + mm + ":" + ss;
    };

    /**
     * Recibe un longint de una fecha que convierte en el formato visible
     *
     * @param {}
     *            longint del tiempo
     * @return {String} 22/12/2016
     */
    window.convertirMilisegundosFecha = function (milisegundos) {
        if (milisegundos == null || milisegundos === undefined) return "";
        var f = new Date(milisegundos);
        var m = (((f.getMonth() + 1) > 9) ? f.getMonth() + 1 : "0" + (f.getMonth() + 1));
        var d = (((f.getDate()) > 9) ? f.getDate() : "0" + f.getDate());
        return d + "/" + m + "/" + f.getFullYear();
    };

    /**
     * Recibe un longint de una fecha de las que obtiene sus horas
     *
     * @param {}
     *            longint del tiempo
     * @return {String} 10:16
     */
    function convertirMilisegundosHora(milisegundos) {
        if (milisegundos == null || milisegundos === undefined) return "";
        var f = new Date(milisegundos);
        var hh = (((f.getHours()) > 9) ? f.getHours() : "0" + (f.getHours()));
        var mm = (((f.getMinutes()) > 9) ? f.getMinutes() : "0" + f.getMinutes());
        return hh + ":" + mm;
    }

    /**
     * Recibe un numero de minutos y los convierte en horas
     *
     * @param {int}
     *            Numero de minutos
     * @return {String} hh:ss
     */
    window.minutosAHoras = function (minutos) {
        var hh = parseInt(minutos / 60);
        var mm = parseInt(minutos % 60);
        if (hh < 10) hh = "0" + hh;
        if (mm < 10) mm = "0" + mm;
        return hh + ":" + mm;
    };

    /**
     * Recibe un numero de minutos y los convierte en horas
     *
     * @param {date}
     *            fecha1
     * @param {date}
     *            fecha2
     * @return {int} numeroMinutos
     */
    window.minutosEntreFecha = function (f1, f2) {
        return parseInt((f1 - f2) / 1000 / 60);
    };

    /**
     * Verifica si un objeto esta vacío
     *
     * @param {Object}
     *            obj
     * @return {Boolean}
     */
    window.objetoVacio = function (obj) {
        if (!obj) {
            return true;
        }
        for (var bar in obj) {
            if (obj.hasOwnProperty(bar)) {
                return false;
            }
        }
        return true;
    };


    window.isFunction = function (object) {
        return object && (typeof object == 'function');
    };

    /**
     * regresa el index de un elemento dentro de un arreglo de objetos
     *
     * @param {array}
     * @param {string}
     * @param {string}
     * @return {int} el indice donde se encontro el elemento
     */
    window.arrayObjectIndexOf = function (myArray, searchTerm, property) {
        for (var i = 0, len = myArray.length; i < len; i++) {
            if (myArray[i][property] === searchTerm) {
                return i;
            }
        }
        return -1;
    }

    /**
     * regresa una url remplazando los parametros :parametro en una url
     *
     * @param {String}
     * @param {Object}
     * @returns {String}
     */
    window.replaceUrlParams = function (url, row) {
        var params = url.match(/:[a-zA-Z0-9]+/g);
        for (var i = 0; i < params.length; i++) {
            url = url.replace(params[i], row[params[i].substring(1, params[i].lenght)]);
        }
        return url;
    };

    /**
     * regresa el objeto depurado con solo los atributos solicitados
     *
     * @param obj
     * @param attr
     * @returns
     */
    window.depurarAtributos = function (obj, attr) {
        var nuevoObj = {};
        for (var i = 0; i < attr.length; i++) {
            nuevoObj[attr[i]] = obj[attr[i]];
        }
        return nuevoObj;
    };

    /**
     * regresa la fecha actual en formato yyyy/mm/dd hh:mm
     *
     * @returns {String}
     */
    window._obtenerFechaActual = function () {
        var f = new Date();
        var m = (((f.getMonth() + 1) > 9) ? f.getMonth() + 1 : "0" + (f.getMonth() + 1));
        var d = (((f.getDate()) > 9) ? f.getDate() : "0" + f.getDate());
        var hh = (((f.getHours()) > 9) ? f.getHours() : "0" + (f.getHours()));
        var mm = (((f.getMinutes()) > 9) ? f.getMinutes() : "0" + f.getMinutes());
        return f.getFullYear() + "/" + m + "/" + d + " " + hh + ":" + mm;
    }


    /*
     * RC4 symmetric cipher encryption/decryption
     *
     * @license Public Domain @param string key - secret key for
     * encryption/decryption @param string str - string to be encrypted/decrypted
     * @return string
     */
    window.rc4 = function (key, str) {
        var s = [], j = 0, x, res = '';
        for (var i = 0; i < 256; i++) {
            s[i] = i;
        }
        for (i = 0; i < 256; i++) {
            j = (j + s[i] + key.charCodeAt(i % key.length)) % 256;
            x = s[i];
            s[i] = s[j];
            s[j] = x;
        }
        i = 0;
        j = 0;
        for (var y = 0; y < str.length; y++) {
            i = (i + 1) % 256;
            j = (j + s[i]) % 256;
            x = s[i];
            s[i] = s[j];
            s[j] = x;
            res += String.fromCharCode(str.charCodeAt(y) ^ s[(s[i] + s[j]) % 256]);
        }
        return res;
    };

    window.ROTn = function (text, map) {
        // Generic ROT-n algorithm for keycodes in MAP.
        var r = '';
        var i, j, c, len = map.length;
        for (i = 0; i < text.length; i++) {
            c = text.charAt(i);
            j = map.indexOf(c);
            if (j >= 0) {
                c = map.charAt((j + len / 2) % len);
            }
            r = r + c;
        }
        return r;
    };

    window.ROT47 = function (text) {
        // Hides all ASCII-characters from 33 ("!") to 126 ("~"). Hence can be used
        // to obfuscate virtually any text, including URLs and emails.
        var R = new String()
        R = ROTn(text,
            "!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~")
        return R;
    };

    window.toHexString = function (byteArray) {
        return byteArray.map(function (byte) {
            return ('0' + (byte & 0xFF).toString(16)).slice(-2);
        }).join('');
    };


// Convert a hex string to a byte array
    window.hexToBytes = function (hex) {
        for (var bytes = [], c = 0; c < hex.length; c += 2) {
            bytes.push(parseInt(hex.substr(c, 2), 16));
        }
        return bytes;
    }

    'use strict';
    if (!('remove' in Element.prototype)) {
        Element.prototype.remove = function () {
            if (this.parentNode) {
                this.parentNode.removeChild(this);
            }
        };
    }


    window.addEvent = window.addEventListener ? function (elem, type, method) {
        elem.addEventListener(type, method, false);
    } : function (elem, type, method) {
        elem.attachEvent('on' + type, method);
    };

    window.removeEvent = window.removeEventListener ? function (elem, type, method) {
        elem.removeEventListener(type, method, false);
    } : function (elem, type, method) {
        elem.detachEvent('on' + type, method);
    };

    window.isIE = function (userAgent) {
        userAgent = userAgent || navigator.userAgent;
        return userAgent.indexOf("MSIE ") > -1 || userAgent.indexOf("Trident/") > -1 || userAgent.indexOf("Edge/") > -1;
    };



})();