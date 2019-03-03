var realGl = wtu.create3DContext(canvas);
var record = false;
var recording = [];
var gl = new Proxy(realGl, {
    get: function(obj, prop) {
        if (typeof realGl[prop] === 'function') {
            return function() {
                if (record) {
                    switch (prop) {
                        case 'getError':
                            recording.push('if (this.getError() !== gl.NONE) throw new Error("error")');
                            break;
                        case 'createProgram':
                            recording.push('var program = gl.createProgram()');
                            break;
                        case 'createShader':
                            if (arguments[0] === gl.VERTEX_SHADER) {
                                recording.push('var vertexShader = gl.createShader(gl.VERTEX_SHADER)');
                            } else if (arguments[0] === gl.FRAGMENT_SHADER) {
                                recording.push('var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)');
                            } else {
                                throw new Error('unrecognized shader type');
                            }
                            break;
                        case 'shaderSource':
                            if (arguments[0]._type === gl.VERTEX_SHADER) {
                                recording.push('gl.shaderSource(vertexShader, `' + arguments[1] + '`)');
                            } else if (arguments[0]._type === gl.FRAGMENT_SHADER) {
                                recording.push('gl.shaderSource(fragmentShader, `' + arguments[1] + '`)');
                            } else {
                                throw new Error('unrecognized shader type');
                            }
                            break;
                        case 'compileShader':
                            if (arguments[0]._type === gl.VERTEX_SHADER) {
                                recording.push('gl.compileShader(vertexShader)');
                            } else if (arguments[0]._type === gl.FRAGMENT_SHADER) {
                                recording.push('gl.shaderSource(fragmentShader)');
                            } else {
                                throw new Error('unrecognized shader type');
                            }
                            break;
                        case 'getShaderParameter':
                            if (arguments[0]._type === gl.VERTEX_SHADER) {
                                recording.push('if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) throw new Error("shader did not compile")');
                            } else if (arguments[0]._type === gl.FRAGMENT_SHADER) {
                                recording.push('if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) throw new Error("shader did not compile")');
                            } else {
                                throw new Error('unrecognized shader type');
                            }
                            break;
                        case 'attachShader':
                            if (arguments[1]._type === gl.VERTEX_SHADER) {
                                recording.push('gl.attachShader(program, vertexShader');
                            } else if (arguments[1]._type === gl.FRAGMENT_SHADER) {
                                recording.push('gl.attachShader(program, fragmentShader');
                            } else {
                                throw new Error('unrecognized shader type');
                            }
                            break;
                        case 'bindAttribLocation':
                            recording.push('gl.bindAttribLocation(program, ' + arguments[1] + ', ' + arguments[2] + ')');
                            break;
                        case 'linkProgram':
                            recording.push('gl.linkProgram(program)');
                            break;
                        case 'getProgramParameter':
                            recording.push('if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program))');
                            break;
                        case 'useProgram':
                            recording.push('gl.useProgram(program)');
                            break;
                        case 'createBuffer':
                            recording.push('var buffer = gl.createBuffer()');
                            break;
                        case 'bindBuffer':
                            recording.push('gl.bindBuffer(' + arguments[0] + ', buffer)');
                            break;
                        case 'bufferData':
                            if (arguments[0] === gl.ARRAY_BUFFER) {
                                recording.push('var bufferOutput = new Float32Array(' + arguments[1].length + ')');
                                recording.push('gl.bufferData(' + arguments[0] + ', bufferOutput, ' + arguments[2] + ')');
                            } else if (arguments[0] === gl.ELEMENT_ARRAY_BUFFER) {
                                recording.push('var bufferOutput = new Uint16Array(' + arguments[1].length + ')');
                                recording.push('gl.bufferData(' + arguments[0] + ', bufferOutput, ' + arguments[2] + ')');
                            } else {

                            }
                            break;
                        case 'readPixels':
                            recording.push('var pixels = new Uint8Array(' + (arguments[2] * arguments[3] * 4) + ')');
                            recording.push('gl.readPixels(' + arguments[0] + ', ' + arguments[1] + ', ' + arguments[2] + ', ' + arguments[3] + ', ' + arguments[4] + ', ' + arguments[5] + ', pixels)');
                            recording.push('var src = ["P3\\n# gl.ppm\\n", width, " ", height, "\\n255\\n"].join("")');
                            recording.push('for (var i = 0; i < bytes.length; i += 4) {');
                            recording.push('  src += bytes[i] + " " + bytes[i + 1] + " " + bytes[i + 2] + " "');
                            recording.push('}');
                            recording.push('require("fs").writeFileSync("./recording.ppm", src)');
                            break;
                        case 'deleteProgram':
                            recording.push('gl.deleteProgram(program)');
                            break;
                        default:
                            recording.push('gl.' + prop + '(' + (Array.from(arguments).map(function (argument) {
                                switch (typeof argument) {
                                    case 'string':
                                        return '`' + argument + '`';
                                    case 'number':
                                        return argument;
                                    case 'boolean':
                                        return argument ? 'true' : 'false';
                                    default:
                                        return '?';
                                }
                            }).join(', ')) + ')');
                    }
                }
                return realGl[prop].apply(realGl, arguments);
            };
        }
        return realGl[prop];
    }
});
