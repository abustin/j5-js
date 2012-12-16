//  SNEI Trilithium
//  Copyright (C) 2009-2010 Sony Corporation
//  SONY CONFIDENTIAL MATERIAL. DO NOT DISTRIBUTE.
//  All Rights Reserved
//


// [JS Compatibility]
if (!Object.keys) {
    Object.keys = function(obj) {
      var array = [];
      var prop;
      for (prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          array.push(prop);
        }
      }
      return array;
    };
}

// [JS Compatibility]
if (!Object.defineProperty) {
    Object.defineProperty = function(obj, prop, options) {

      if (options.get) {
          obj.__defineGetter__(prop, options.get);
      }
      if (options.set) {
          obj.__defineSetter__(prop, options.set);
      }
    };
}

// Global trilithium XML Parser (maps to browsers DOMParser)
var XMLParser = function() {
    this.parseString = function(text) {
        parser = new DOMParser();
        xmlDoc = parser.parseFromString(text, "text/xml");
        return xmlDoc;
    };
};

// Global trilithium key-value storage 
var Dictionary = function(id) {

    var self = this;

    var prefix = "TriLi."+id+".";
    var db = localStorage;

    function getKeys(prefix) {

        var keys = [];
        var k,i,l;

        for (i=0,l=db.length; i<l; i++) {
            k = db.key(i);
            if (k.indexOf(prefix) === 0) {
                keys.push(k);
            }
        }

        return keys;
    }

    getKeys(prefix).forEach(function(key) {
        var item = JSON.parse(db.getItem(key));
        self[item.key] = item.value;
    });

    this.getPrefix = getKeys;
    this.remove = function(key) {
        db.removeItem(db.getItem(key));
    };

    this.flush = function() {

        var reservedKeys = {
            flush: true
        };

        getKeys(prefix).forEach(function(key) {
            db.removeItem(db.getItem(key));
        });

        Object.keys(self).forEach(function(key) {
            var value = self[key];
            if (!reservedKeys[key] && value !== null && value !== undefined) {
                db.setItem(prefix+key, JSON.stringify({key:key, value:value}));
            }
        });

    };

}


// [STUBED]
var Crypto = {
    
    encrypt: function(cipher, key, iv, message) {
        console.warn("WebGl Version of Trilithium does not support Crypto object");
    },
    decrypt: function(cipher, key, iv, message) {
        console.warn("WebGl Version of Trilithium does not support Crypto object");
    },
    digest: function(algorithm, message) {
        console.warn("WebGl Version of Trilithium does not support Crypto object");
    },
    getCiphers: function() {
        console.warn("WebGl Version of Trilithium does not support Crypto object");
    },
    getDigests: function() {
        console.warn("WebGl Version of Trilithium does not support Crypto object");
    }
    
}


// Global Trilithium Object
var engine = (function(doc) {
    
    
    // Load main.js when HTML window ready
    window.onload = function() {
        include("js/lib/main.js");
        include("js/app/main.js");
    }
    
    var Paths = {
        include: ["./","../", "./"],
        resources: "../Resources/"
    };

    var gl;         // WebGL Context
    var glCanvas;   // HTML Canvas
    var textCanvas; // HTML Canvas
    var textCtx;    // Canvas2d context for drawing text
    var screen;     // root scene-graph node
    var currentTime=0;// current running time from start of app
    
    //var framerate = new Framerate(function(msg) {
    //    window.status = msg;
    //});
    //
    
    
    // KeyManager manages key events from the brower, maintains key state and onKey events
    var KeyManager = (function(keyEvents) {

        // todo: add full set of spec'd names
		var keyIdentifier = {

		    16: "SHIFT",		17:  "CTRL",		18: "ALT",
		    20: "CAPSLOCK",		224: "META",		91: "META",
		    32: "SPACE",		13:  "ENTER",		9:  "TAB",
		    8:  "BACKSPACE",

		    37: "LEFT",			38: "UP",			39: "RIGHT",
		    40: "DOWN",

		    33: "PGUP",		    34: "PGDN",

		    35: "END",			36: "HOME",			45: "INSERT",
		    46: "DELETE",

		    112: "F1",			113: "F2",			114: "F3",
		    115: "F4",			116: "F5",			117: "F6",
		    118: "F7",			119: "F8",			120: "F9",
		    121: "F10",			122: "F11",			123: "F12",

		    144: "NUMLOCK",		44: "PRINTSCREEN",	145: "SCROLL",
		    19:  "PAUSE"

		};
		

	    var handler;         // onKey
	    var activeKeys = {}; // keys waiting to be released

	    var keyId = function(e) {
	        return ["key",e.keyCode].join("-");
	    }

	    var createKeyObj = function(e, name) {
	        return {
				deviceType:"keyboard",
				deviceId:1,
	            alt: e.altKey,
	            shift: e.shiftKey,
	            meta: e.metaKey,
				ctrl: e.ctrlKey,
				isDown: true,
				pressure: 1,
				name: name || String.fromCharCode(e.charCode).toUpperCase(),
	            toString: function() {
					var str;
					if (name === "SPACE") {
					    str = " ";
					}
					else if (name === "TAB") {
					    str = "\t";
					}
					else if (name === "ENTER") {
					    str = "\n";
					}
					else {
					    str = String.fromCharCode(e.charCode);
					}
	                return str;
	            }
	        }
	    }

		var keyDown = "";

        // keys events from browser
		keyEvents.addEventListener("blur", function onBlur(e) {
			Object.keys(activeKeys).forEach(function(key) {
				activeKeys[key].onEnd&&activeKeys[key].onEnd();
				delete activeKeys[key];
			})
		}, true);

        // keys events from browser
		keyEvents.addEventListener("keydown", function onKeyDown(e) {
		    console.log(e.keyCode)
			var identifier = keyIdentifier[e.keyCode];
			
			keyDown = keyId(e);
			!activeKeys[keyDown]&&identifier&&handler&&handler(activeKeys[keyDown] = createKeyObj(e, identifier));
			
			
		}, true);

        // keys events from browser
        keyEvents.addEventListener("keypress", function onKeyPress(e) {
			//console.log("keypress",e.keyCode)
			!activeKeys[keyDown]&&handler&&handler(activeKeys[keyDown] = createKeyObj(e));
			
			// hack for metaKey: keyup events are never called for keys w/ meta (Safari OS X)
			var key = activeKeys[keyDown];
			if (key&&key.meta&&key.toString()) {
				key.isDown = false;
				key.onEnd&&key.onEnd();
				delete activeKeys[keyId(e)];
			}
        }, true);

        // keys events from browser
	    keyEvents.addEventListener("keyup", function onKeyUp(e) {
	        //console.log("keyup",e.keyIdentifier)
			
	        var key = activeKeys[keyId(e)];
			if (key) {
				key.isDown = false;
				key.onEnd&&key.onEnd();
				delete activeKeys[keyId(e)];
			}
			
			[["Meta","meta"]].forEach(function(mod) {
				if (key&&key.name === mod[0]) {
					Object.keys(activeKeys).forEach(function(id) {
						var key = activeKeys[id];
						if (key[mod[1]]) {
							key.isDown = false;
							key.onEnd&&key.onEnd();
							delete activeKeys[id];
						}
					});
				}
			});
			
			
			
	    }, true);

	    return {

	        attach: function(api) {
	            Object.defineProperty(api, "onKey", {
	                get: function() {
	                    return handler;
	                },
	                set: function(v) {
	                    handler = v;
	                }
	            });
	        }

	    }


	})(window);
    
    
    // Initialize WebGL context, shaders and geometry 
    // (engine.onLoad maps to this method)
    function init(appInitialize) {
        
        glCanvas = doc.getElementById("trili");
        textCanvas = doc.createElement("canvas");
        
        textCtx = textCanvas.getContext("2d");
        initGL(glCanvas);
        initBuffers();
        initShaders();
        initScene();
        
        console.log("INIT")
        
        setTimeout(function() {
            appInitialize(screen);
            animationLoop(gl, Date, (new Date()).getTime()*0.001, setTimeout);
        }, 250);
        
        
    }

    // Get WebGL context
    // (Vendors refer to early webgl implementations by many different names)
    // [called from init]
    function initGL(canvas) {
        var names = ["webgl", "experimental-webgl", "moz-webgl", "webkit-3d"];
        var i;
        for (i=0; names.length > i; i++) {
            try {
                gl = canvas.getContext(names[i]);
                //_gl = gl // UNCOMMENT FOR A GLOBAL REF TO GL
                if (gl) {
                    // UNCOMMENT FOR WEBGL DEBUGGING
                    // Debug wrapper is currently nesting in HTML file.
                    //gl = WebGLDebugUtils.makeDebugContext(gl, function(a,b,c) {
                        //console.warn(a,b,c);
                    //});
                    break;
                }
            } catch(e) {}
        }
        if (!gl) {
            alert("Could not initialise WebGL, sorry :-(");
        }
    }
    
    
    // Setup root camera projection
    // Configure WebGL
    // [called from init]
    function initScene() {
        
        gl.viewport(0, 0, 1920, 1080);
        gl.clearColor(15 / 255, 15 / 255, 15 / 255, 1.0);
        gl.clearDepth(1.0);

        gl.mvMatrix = new CanvasMatrix4();
        gl.mvMatrix.makeIdentity();
        gl.mvMatrix.translate( - 21, 11.5, -23);

        gl.perspectiveMatrix = new CanvasMatrix4();
        gl.perspectiveMatrix.makeIdentity();
        gl.perspectiveMatrix.lookat(0, 0, 5, 0, 0, 0, 0, 1, 0);
        gl.perspectiveMatrix.perspective(45, 1920 / 1080, .1, 5000.0);
        gl.perspectiveMatrixArray = gl.perspectiveMatrix.getAsWebGLFloatArray();

        gl.enable(gl.BLEND);
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.SRC_ALPHA, gl.ONE)

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.box.indexObject);
        
        screen = createScreen();
        
        
    }
    
    // Create root node. Attach screen API to root node.
    function createScreen() {
        var cont = api.createContainer();
        
        var clearColor = [];
        
        cont.createSnapshot = function(scale, success) {
            return success(api.createContainer())
        };
        
        Object.defineProperty(cont, "naturalWidth", {
            get: function() {
                return 1920;
            }
        });
        
        Object.defineProperty(cont, "naturalHeight", {
            get: function() {
                return 1080;
            }
        });
        
        cont.width = 1080;
        cont.height = 1920;
        
        cont.resizeMode = "fill";
        
        cont.bounds = {
            x:0,
            y:0,
            width:1920,
            height:1080
        }
        
        Object.defineProperty(cont, "backgroundColor", {
            get: function() {
                return clearColor;
            },
            set: function(v) {
                if (v&&v.length) {
                    clearColor = v.concat();
                    clearColor.length = 3;
                    gl.clearColor.apply(gl, v);
                }
            }
        });
        
        return cont;
        
    }
    
    // Animation loop
    // (animationLoop is called ~60fps using setTimeout as a frame delay)
    function animationLoop(gl, Date, startTime, setTimeout) {
        setTimeout(animationLoop, 16, gl, Date, startTime, setTimeout);
        currentTime = (new Date()).getTime() * 0.001;  // calculate current time for frame
        currentTime -= startTime;
        enterFrameHandler && enterFrameHandler();       // Call onEnterFrame callback if running application has defined one
        gl.clear(gl.COLOR_BUFFER_BIT);                  // Clear drawing surface with backgroundColor (glColor)
        screen.__draw(gl, gl.mvMatrix);                 // Start scene-graph render walk
        
        
        //framerate.snapshot();
    }
    
    var Shader;

    // [Shaders]
    // initShaders contains all Shader code
    // [called from init]
    function initShaders() {        
        
        Shader = (function() {
            
            var UNIFORM_SETTER = {};

            // Return the number of elements for GL type
            var getTypeLength = function(type) {

                switch(type) {
                    case gl.FLOAT_MAT4:
                        return 4*4;
                    case gl.FLOAT_MAT3:
                        return 3*3;
                    case gl.FLOAT_MAT2:
                        return 2*2;
                    case gl.FLOAT_VEC4:
                    case gl.INT_VEC4:
                    case gl.BOOL_VEC4:
                        return 4;
                    case gl.FLOAT_VEC3:
                    case gl.INT_VEC3:
                    case gl.BOOL_VEC3:
                        return 3;
                    case gl.FLOAT_VEC2:
                    case gl.INT_VEC2:
                    case gl.BOOL_VEC2:
                        return 2;
                    default:
                        return 1;
                }
                
            }

            // Map GL type to a uniform setter method
            UNIFORM_SETTER[gl.FIXED] = gl.uniform1i;
            UNIFORM_SETTER[gl.SHORT] = gl.uniform1i;
            UNIFORM_SETTER[gl.UNSIGNED_BYTE] = gl.uniform1i;
            UNIFORM_SETTER[gl.BYTE] = gl.uniform1i;
            UNIFORM_SETTER[gl.INT] = gl.uniform1i;
            UNIFORM_SETTER[gl.UNSIGNED_INT] = gl.uniform1i;
            UNIFORM_SETTER[gl.FLOAT] = gl.uniform1f;
            UNIFORM_SETTER[gl.SAMPLER_2D] = gl.uniform1i;

            UNIFORM_SETTER[gl.FLOAT_MAT4] = gl.uniformMatrix4fv;
            UNIFORM_SETTER[gl.FLOAT_MAT3] = gl.uniformMatrix3fv;
            UNIFORM_SETTER[gl.FLOAT_MAT2] = gl.uniformMatrix2fv;

            UNIFORM_SETTER[gl.FLOAT_VEC2] = gl.uniform2fv;
            UNIFORM_SETTER[gl.FLOAT_VEC3] = gl.uniform3fv;
            UNIFORM_SETTER[gl.FLOAT_VEC4] = gl.uniform4fv;
            UNIFORM_SETTER[gl.INT_VEC2] = gl.uniform2iv;
            UNIFORM_SETTER[gl.INT_VEC3] = gl.uniform3iv;
            UNIFORM_SETTER[gl.INT_VEC4] = gl.uniform4iv;
            UNIFORM_SETTER[gl.BOOL] = gl.uniform1i;
            UNIFORM_SETTER[gl.BOOL_VEC2] = gl.uniform2iv;
            UNIFORM_SETTER[gl.BOOL_VEC3] = gl.uniform3iv;
            UNIFORM_SETTER[gl.BOOL_VEC4] = gl.uniform4iv;

            var defaultShader = null;   // Default shader program
            var programCache = {};      // Store of all loading shader programs

            
            // Get and Compile and fragment or vertex shader by ID.
            // (shader source is currently embeded within HTML file)
            function getShader(gl, id) {
                var shaderScript = doc.getElementById(id);
                if (!shaderScript) {
                    return null;
                }

                var str = "";
                var k = shaderScript.firstChild;
                while (k) {
                    if (k.nodeType == 3) {
                        str += k.textContent;
                    }
                    k = k.nextSibling;
                }

                var shader;
                if (shaderScript.type == "x-shader/x-fragment") {
                    shader = gl.createShader(gl.FRAGMENT_SHADER);
                } else if (shaderScript.type == "x-shader/x-vertex") {
                    shader = gl.createShader(gl.VERTEX_SHADER);
                } else {
                    return null;
                }

                gl.shaderSource(shader, str);
                gl.compileShader(shader);

                if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                    alert(gl.getShaderInfoLog(shader));
                    return null;
                }
                return shader;
            }
            
            // Shader data object
            // - program: GL Shader program
            // - meta: list of metadata about GL Shader program (uniform names/types)
            function createShaderObj(shaderProgram) {
                return {
                    program: shaderProgram,
                    meta: getShaderData(shaderProgram)
                };
            }
            

            // Create, load and link a GL shader program  
            function loadShaderProgram(v,f) {
                
                v = "Shaders/vpBasic.cg" // ab: temp 
                //f = "fpXRAY.cg";
                
                v = v.split(".cg").join("");
                f = f.split(".cg").join("");
                
                var name = v+"+"+f;
                
                if (programCache[name]) {
                    return programCache[name];
                }
                
                var fragmentShader = getShader(gl, f);
                var vertexShader = getShader(gl, v);
                
                if (!fragmentShader || !vertexShader) {
                    console.error("missing shader "+ name)
                    return null;
                }
                
                var shaderProgram = gl.createProgram();
                
                gl.attachShader(shaderProgram, vertexShader);
                gl.attachShader(shaderProgram, fragmentShader);
                gl.linkProgram(shaderProgram);

                if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
                    console.error("LINK_STATUS error")
                    return null;
                }
                
                var shaderObj = createShaderObj(shaderProgram);                
                var attribute = shaderObj.meta.attribute;

                gl.useProgram(shaderProgram);

                gl.enableVertexAttribArray(attribute.aVertexPosition.location);
                gl.enableVertexAttribArray(attribute.aTextureCoord.location);
                
                gl.bindBuffer(gl.ARRAY_BUFFER, gl.box.vertexObject);
                gl.vertexAttribPointer(attribute.aVertexPosition.location, gl.box.vertexObject.itemSize, gl.FLOAT, false, 0, 0);

                gl.bindBuffer(gl.ARRAY_BUFFER, gl.box.texCoordObject);
                gl.vertexAttribPointer(attribute.aTextureCoord.location, gl.box.texCoordObject.itemSize, gl.FLOAT, false, 0, 0);

                shaderProgram = createShaderObj(shaderProgram)
                programCache[name] = shaderProgram;
                
                if (!defaultShader) {
                    defaultShader = shaderObj;
                }
                
                return shaderObj;
            }

            // Create shader program metadata (uniform names/types)
            var getShaderData = function(shader) {
                
                var meta = {uniforms:[], uniform:{}, attribute:{}};

                var keys = [],i;
                for (i in gl) {
                    keys.push(i);
                }
                keys =  keys.sort();

                var rgl = {}

                keys.forEach(function(key) {
                    rgl[gl[key]] = key;
                })

                var info;
                var i = 0;
                var len = gl.getProgramParameter(shader, gl.ACTIVE_UNIFORMS)
                
                while (i<len) {
                    
                    info = gl.getActiveUniform(shader,i);
                    meta.uniforms.push(info.name);
                    meta.uniform[info.name] = {
                        name: info.name,
                        glType: info.type,
                        type: rgl[info.type],
                        length: getTypeLength(info.type),
                        idx: i,
                        location: gl.getUniformLocation(shader, info.name)
                    };
                    
                    i++;
                }

                len = gl.getProgramParameter(shader, gl.ACTIVE_ATTRIBUTES)
                i = 0;
                while (i<len) {
                    info = gl.getActiveAttrib(shader,i);
                    meta.attribute[info.name] = {
                        name: info.name,
                        glType: info.type,
                        type: rgl[info.type],
                        length: getTypeLength(info.type),
                        idx: i,
                        location: gl.getAttribLocation(shader, info.name)
                    };
                    i++;
                }
                
                return meta;

            }

            // (createShader maps to this method)
            return function(v,f) {
                
                var glShader = loadShaderProgram(v,f) || defaultShader;
                
                var shaderValues = {
                    alpha: 1
                };
                
                var self = this;
                
                // Create getter/setters for all uniforms and textures on Shader object
                glShader.meta.uniforms.forEach(function(name) {
                    var uniform = glShader.meta.uniform[name];
                    var len = uniform.length;
                    var name = uniform.name;
                    var vals = shaderValues;
                    (name != "uMVMatrix" && name != "uMVMatrix")&&Object.defineProperty(self, uniform.name, {
                        get: function() {
                            return vals[name];
                        },
                        set: function(v) {
                            if (v && v.length !== len) {
                                v.length = len;
                            }
                            vals[name] = v;
                        }
                    }); 
                });
                
                // Draw leaf node
                // (mv matrix, primary texture passed in)
                // [internal method]
                this.__draw = function(gl, mv, imageTexture) {
                    
                    var usetter = UNIFORM_SETTER;
                    var meta = glShader.meta;
                    var uniform = meta.uniform;
                    var uniforms = meta.uniforms;
                    var name, val, u, i = uniforms.length;
                    
                    // Change shader program if different from last draw
                    //if (gl.currentShaderProgram !== glShader) {
                        gl.currentShaderProgram = glShader;
                        gl.useProgram(glShader.program);
                        gl.uniformMatrix4fv(uniform.uPMatrix.location, false, gl.perspectiveMatrixArray);
                    //}
                    
                    // set mv matrix
                    gl.uniformMatrix4fv(uniform.uMVMatrix.location, false, mv);
                    
                    // add primary texture to shader values
                    var vals = shaderValues;
                    
                    if (imageTexture) {
                        vals.texture = imageTexture;
                    }

                    var textureSlot = 0;
                    
                    // Iterate over uniforms and textures setting values from JS to shader program
                    while (i--) {                        
                        name = uniforms[i];
                        val = vals[name];
                        u = uniform[name];
                        
                        if (val !== undefined && val !== null) {
                            if (u.glType === gl.SAMPLER_2D) { // if texture
                                gl.activeTexture(gl['TEXTURE'+textureSlot]);
                                gl.bindTexture(gl.TEXTURE_2D, val);
                                val = textureSlot++;
                            }
                            usetter[u.glType].apply(gl, [u.location, val]); // uses uniform setter map to set value
                        }
                    }
                    
                    // Draw call
                    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
                    
                }
                
                this.__getShaderProgram = function() {
                    return glShader.program;
                }

            }

        })(gl);
        
        var defaultShader = new Shader("Shaders/vpBasic.cg", "Shaders/fpAlphaTexture.cg");


    }
    
    // [called from init]
    function initBuffers() {
        gl.box = makeQuad(gl);
    }

    // Configure new texture objects
    function handleLoadedTexture(texture, image) {
        
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image); 
        image = null;
        
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);        
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        // [STUB]
        texture.blur = function() {
            return texture;
        };
        
        // [TEST] 
        texture.unload = function() {
            gl.deleteTexture(texture);
            texture = null;
            image = null;
        }
        
        return texture;
        
    }

    
    
    var requestWithPath = function(path) {
        //print("Requested " + path);
        var req = new XMLHttpRequest();
        req.open('GET', path, false);
        req.send(null);
        if (req.status !== 0 && req.status !== 200) {
            return false;
        } else {
            return req;
        }
    }
    
    // Global include method
    // (Load and run external script files)
    var include = (function() {
		
		var loadedPaths = {}
		
		var includeFunc = function(path, force) {
		    
		    
		    if (loadedPaths[path] && !force) {
		        return;
		    }
            
		    
		    loadedPaths[path] = true;
		    
            var req = false;
            if (path.indexOf("://") === -1) {
                var realPath;
                var i=0;
                while (i<Paths.include.length && req === false) {
                    realPath = Paths.include[i] + path;
                    req = requestWithPath(realPath);
                    i += 1;
                }
                path = realPath;
            } else {
                req = requestWithPath(path);
            }
		    
			if (req === false) {
				throw new Error("file not found");
			} else {

                if ("JSLINT" in this) {
                    if (!JSLINT(req.responseText)) {

                        JSLINT.errors.forEach(function(err) {
                            err&&console.warn("[JSLINT] "+path+":"+err.line +"."+err.character+"\t"+err.reason);
                        });

                    }
                }
			    
			    var script = document.createElement('script');
			    script.id = path
			    script.innerHTML = req.responseText;
			    script.type ="text/javascript";
			    
			    document.head.appendChild(script);
			 	
			}
			
		}
		return includeFunc;
		
	})();
    

    // assert(engine === api) // returned below
    var api = {
        
        // [STUB]
        keymap: {
            keyboardUS:{},
            keyboardUK:{},
            controllerPS3:{}
        },
        
        // [STUB]
        createVideo: function() {
            console.warn("WebGl Version of Trilithium does not support createVideo")
            return {
                play: function() {},
                pause: function() {},
                resume: function() {},
                stop: function() {},
                close: function() {}
            }
        },
        
        // [STUB]
        createBlob: function(data, format) {
            console.warn("WebGl Version of Trilithium does not support createBlob")
            var blob = new ArrayBuffer(32);
            return blob;
        },
        
        // [1.1 feature]
        storage: {
          local:new Dictionary("snei.trili"),
          session: {}  
        },
        
        restart:function() {
            window.reload();
        },
        
        createGuid: function() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
            });
        },
        
        stats: {

            version: [1, 0, 0],
            environment: "development",
            build: "debug",
        
            locale: "en_US",
        
            application: {
                name: "",
                publisher: "SNEI",
                version: [1, 0, 0],
                main: "js/app/main.js"
            },
            
            disk: {
                available: 999999999999
            },
            
            memory: {
                available: Number.POSITIVE_INFINITY,
                used: 0,
            },
        
            videoMemory: {
                available: Number.POSITIVE_INFINITY,
                used: 0,
            },
        
            device: {
                platform: "html",
                version: [5, 0, 0],
                id: "3bc6509b-4f48-4ac7-d16a2c404076670e"
            },
        
            bindings: {
                displayNode: 0,
                container: 1,
                slate: 0,
                screen: 0,
                textBlock: 0,
                image: 0
            },
        
        
        
            locale: "en_US",
            objectCounter: {
                create: function(name) {
                    return null;
                },
                get: function(name) {
                    return (name) ? 0: {};
                }
            }
        },
        
        networkStatus: true,

        include: function(path) {
            include(path);
        },
        
        createShader:function(v,f) {
            return new Shader(v,f);
        },

        getTimer: function() {
            return currentTime;
        },

        loadImage: function(url, success, err) {
            
            var ctx = gl;
            var texture = ctx.createTexture();
            var loaded = false;
            
            var loader = {
                totalBytes: 1024,    
                cancel: function() {
                    // Can't cancel an image load but can redefine the source
                    texture.image.src = "data:image/png;,";
                    texture.image.onload = null;
                    success = null;
                    err = null;
                }
            };
            
            Object.defineProperty(loader, "progress", {
                get: function() {
                    return loaded ? 1 : 0;
                }
            });

            texture.image = new Image();

            texture.image.onload = function() {
                handleLoadedTexture(texture, texture.image);
                loaded = true;
                loader.onProgress&&loader.onProgress(1);
                success && success(new Li.Image(texture));
                success = null;
                err = null;
                texture.image.src = "data:image/png;,";
                
            }
            texture.image.src = url;
            
            return loader;
        
        },

        // [STUB]
        loadSound: function() {
            return {
                start: function() {},
                play: function() {},
                pause: function() {},
                resume: function() {},
                stop: function() {}
            }
        },
        
        showKeyboard: function(opts) {
              
            var initString = (opts && opts.initString) || (opts && opts.text) || "";
        
            var value = prompt(opts&&opts.title || "",initString);
          
            if (value === null) {
                opts && opts.onCancel &&  opts.onCancel(value);
            } else {
                (value != initString) && opts && opts.onChange &&  opts.onChange(value);
                opts && opts.onEnd    &&  opts.onEnd(value);
            }
          
        },

        loadData: function(url, success, err) {
            var req = new XMLHttpRequest();
            var requestProgress = 0;
            var loaded = false;
            var loader = {
                totalBytes: 0,    
                cancel: function() {
                    req.abort();
                }
            };
            
            Object.defineProperty(loader, "progress", {
                get: function() {
                    return requestProgress
                }
            });
            
            
            req.onprogress = function(e) {
                loader.totalBytes = e.totalSize;
                requestProgress = e.position/e.totalSize;
                loader.onProgress&&loader.onProgress(requestProgress);
            }
            
            req.onreadystatechange = function() {
                if (req.readyState == 4) {
                    requestProgress = 1;
                    loader.onProgress&&loader.onProgress(1);
                    success&&success(req.responseText);
                }
            };
            
            req.open("GET", url, true);
            req.send(null);

            return loader;
        },

        createContainer: function() {
            return new Li.DisplayNodeContainer();
        },

        createTextBlock: function(text, fmt, width, async) {
            if (async) {
                setTimeout(function() {
                    async(createText(text, fmt, width));
                }, 1);
                
            } else {
                return createText(text, fmt, width);
            }
        },

        createSlate: function() {
            var node = new Li.Image(null);
            return node;
        },

        createHttpClient: function() {

            var headers = [];
            var user = undefined;
            var pass = undefined
            var that = this;

            return {

                request: function(method, url) {
                    method = method.toUpperCase();
                    
                    //if (url && url.indexOf("://") === -1) {
                    //    url = Paths.resources+url;
                    //}
                    
                    var postData = null;
                    var loader = new XMLHttpRequest();
                    var req = {
                        start: function() {
                            loader.open(method, url, true, user, pass);
                            // if (that.sessionCookie) {
                            //     loader.setRequestHeader("Cookie", that.sessionCookie);
                            // }
                            
                            if (method === "POST") {
                                loader.setRequestHeader("Content-type","application/x-www-form-urlencoded");
                            }
                            loader.send(postData);
                        },
                        sendBody: function(data) {
                            postData = data;
                        }
                    }

                    loader.onreadystatechange = function() {
                        if (loader.readyState == 4) {
                            // var sessCookie = loader.getResponseHeader("Set-Cookie");
                            // if (sessCookie) {
                            //     that.sessionCookie = sessCookie.substr(0,sessCookie.indexOf(';'));
                            // }
                            req.onComplete && req.onComplete(loader.responseText, 200);
                        }
                    };

                    return req;

                },
                disableCertValidation: function() {
                    //stub
                },
                enablePipelining: function(a, b, c, d) {
                    //stub
                },
                setAuth: function(u, p) {
                    user = u;
                    pass = p;
                },
                allowSelfSigned: function(a, b, c, d) {
                    //stub
                }

            }
        },
        

        loadVideo: function(url) {
            
            //if (url && url.indexOf("://") === -1) {
            //    url = Paths.resources+url;
            //}
            
            var node = Li.Video(url, gl.createTexture());
            return node;
        },
        
        garbageCollect: function() {},

        sessionCookie: false,
        
        // [STUB]
        createWebView: function() {
            console.warn("WebGl Version of Trilithium does not support createWebView")
        }



    }
    
    // Add KeyManager to the API object
    KeyManager.attach(api);

    Object.defineProperty(api, "onLoad", {
        set: function(func) {
            console.log("BALLLL")
            init(func);
        }
    });

    var enterFrameHandler;
    Object.defineProperty(api, "onEnterFrame", {
        get: function() {
            return enterFrameHandler;
        },
        set: function(callback) {
            enterFrameHandler = callback;
        }
    });

    // Define quad geom and texture attributes 
    function makeQuad(gl) {
        
        var vertices = new Float32Array([
             0,  0,  0,
             0, -1,  0, 
             1,  0,  0,
             1, -1,  0 
             
        ]);
        
        var texCoords = new Float32Array([
             0,  1,
             
             0,  0, 
             1,  1,
             1,  0 
             
             
        ]);
        
        var indices = new Uint16Array([1, 0, 2, 3]);
                
        var createBuffer = function(type, data, size) {
            var buffer = gl.createBuffer();
            gl.bindBuffer(type, buffer);
            gl.bufferData(type, data, gl.STATIC_DRAW);
            buffer.itemSize = size;
            buffer.numItems = data.length
            return buffer;
        };
        
        return {
            texCoordObject: createBuffer(gl.ARRAY_BUFFER, texCoords, 2),
            vertexObject: createBuffer(gl.ARRAY_BUFFER, vertices, 3),
            indexObject: createBuffer(gl.ELEMENT_ARRAY_BUFFER, indices, 1)
        };
   
    }

    // [TEXT]
    // Creates an text node.  Uses canvas2d to generate text.
    // todo: implement missing formating options 
    // todo: only support single font face (SoMa)
    // (createTextBlock indirectly maps to createText)
    function createText(str, fmt, width) {
        
        if (!str) {
            str = " ";
        }
        
        var lineSpace = 8;

        if (str === undefined || str === null) {
            str = " ";
        }

        var ctx = textCtx;
        var words = [];
        var lines = [];
        
        ctx.save();
        
        // update canvas2d font state based on fmt object
        var setFontFromFormat = function(fmt) {
            
            ctx.fillStyle = 'hsl(' + 360 * (30 / 60) + ',100%,50%)';
            
            var font = fmt && fmt.font || "";
            //if (font.toLowerCase().indexOf("soma") === -1) {
                font = "SoMARegular"; // default font
            //}

            font = font.split(".ttf").join("");
            font = "" + fmt.size + "px " + font;

            var color = fmt && fmt.color || [1,1,1,1];
            color = [color[0] * 255, color[1] * 255, color[2] * 255, color[3]];
            color = "rgba(" + color + ")";
            
            ctx.fillStyle = color;
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = color;
            ctx.font = font;
        }
        
        // Add a list of words that share the same formatting 
        var addWords = function(wordList, format) {
            wordList.forEach(function(strWord, i, wordList) {
                
                strWord.split("\n").forEach(function(strWord, i) {
                    if (i>0) {
                        words.push({
                            text: "\n", // make newline it's own word (helps with layout)
                            format: format
                        }); 
                    }
                    words.push({
                        text: strWord,
                        format: format
                    });
                });
                
                
            });
        };
        
        // Create a line object and append it to lines array
        var addLine = function() {
            
            var prevLine = lines[lines.length-1];
            var yPos = 0;
            
            if (prevLine) {
                yPos = prevLine.y + prevLine.height + lineSpace;
            }
            
            lines.push({
                x:0,
                y:yPos,
                text:"",
                height: 0,
                width: 0,
                words: []
            })
        }
        
        // Try adding a word to current last line.  
        // (returns true on success)
        var addToLastLine = function(word) {
            var line = lines[lines.length-1];
            
            setFontFromFormat(word.format);
            var addedWidth = ctx.measureText(word.text+" ").width;
            
            if ((line.words.length > 0 && line.width+addedWidth > width) || word.text == "\n") {
                line.text = line.text.slice(0,-1);
                return false;
            } else {
                word.x = line.width;
                line.words.push(word);
                line.text += word.text+" ";
                line.width += addedWidth;
                if (word.format.size > line.height) {
                    line.height = word.format.size;
                }
                return true;
            }
            
        };
        
        // Create words from input
        if (Array.isArray(str) && Array.isArray(fmt) && str.length === fmt.length) {
            str.forEach(function(span, i, spans) {
                addWords(span.split(" "), fmt[i]);
            });
        } else {
            if (Array.isArray(fmt)) {
                fmt = fmt[0];
            }
            if (Array.isArray(str)) {
                str = str.join("");
            }
            addWords(str.split(" "), fmt);
        }

        // Add first line object
        addLine();
        
        // Add words to text block 
        // and creates a concatenated string of words to be rendered 
        // (fmt object may limit lines for example)
        words = words.filter(function(word) {
            var addedWord = true;
            if (!addToLastLine(word)) {
                addLine();
                addedWord = addToLastLine(word);
            }
            return addedWord;
        }).map(function(word) {
            return word.text;
        }).reduce(function(a,b) {
            return a+" "+b;
        })
        
        var lastLine = lines[lines.length-1];
        
        // get max texture width of text block
        var maxWidth = (lines.length > 1) ? lines.reduce(function(a,b){
           return (a.width > b.width) ? a.width : b.width;
        }) : lines[0].width;
        
        textCanvas.width = maxWidth;
        textCanvas.height = lastLine.height + lastLine.y;
        //textCanvas.height = -lineSpace + (size + lineSpace) * lines.length + size*.3;
        
        // Draw text lines to canvas2d
        lines.forEach(function(line, i) {
            line.words.forEach(function(word) {
                setFontFromFormat(word.format);
                ctx.fillText(word.text, word.x, line.y+line.height);
            });
        });


        ctx.restore();
        
        ctx = gl;
        

        // Create a texture from canvas2d
        // Use that texture to create an Image node
        var textBlockNode = new Li.Image(handleLoadedTexture(ctx.createTexture(), textCanvas), textCanvas.width, textCanvas.height, true);
        texture = null;
        
        
        // Decorate Image node with Text node methods
        
        Object.defineProperty(textBlockNode, "numLines", {
            get: function() {
                return lines.length;
            }
        })
        
        Object.defineProperty(textBlockNode, "text", {
            get: function() {
                return words
            }
        })
        
        //getTextBoundsFor(lineNumber, [offset], [length]) // {text: "foobar", bounds:{x:20, y:10, width: 70, height: 10}}
        
        textBlockNode.getTextBoundsFor = function(lineNumber, offset, length) {
            
            var ctx = textCtx;
            var line = lines[lineNumber];
            
            if (offset !== undefined && offset !== null && length !== undefined && length !== null) {
                // sub metric
                
                ctx.save();
                
                var tempLine = {
                    text: "", 
                    bounds:{
                        x:0,
                        y:line.y,
                        width: 0,
                        height: 0
                    }
                };
                
                var getSubWords = function(line, start, end) {
                    
                    return line.words.map(function(word) {
                        
                        var newWord = {    
                            text:word.text.slice(start, end),
                            format:word.format
                        };
                        end   = Math.max(end-word.text.length,1)
                        start = Math.max(start-word.text.length,1);
                        return newWord;
                        
                    }).filter(function(word) {
                        
                        return word.text.length;
                        
                    });

                };
                
                getSubWords(line, 0, offset).forEach(function(word) {
                    setFontFromFormat(word.format);
                    var addedWidth = ctx.measureText(word.text+" ").width;
                    tempLine.bounds.x += addedWidth;
                });
                
                getSubWords(line, offset, length + offset).forEach(function(word) {
                    
                    setFontFromFormat(word.format);

                    var addedWidth = ctx.measureText(word.text+" ").width;
                    tempLine.text += word.text+" ";
                    tempLine.bounds.width += addedWidth;
                    if (word.format.size > tempLine.bounds.height) {
                        tempLine.bounds.height = word.format.size;
                    }
                    
                });
                
                ctx.restore();
                
                return tempLine;
                
                
            } else {
                return {
                    text: line.text, 
                    bounds:{
                        x:0,
                        y:line.y,
                        width: line.width,
                        height: line.height
                    }
                }
            }
            
            
        }
        
        // myTextBlock.getLineNumberOffset(x,y); // { lineNumber:2, offset:30 } 
        
        textBlockNode.getLineNumberOffset = function(x,y) {
            
            for (var i=0,l=lines.length;i<l;i++) {
                var bot = lines[i].y + lines[i].height;
                if (y <= bot) {
                    break;
                }
            }
            
            var line = lines[i];
            var lineNumber = i;
            
            for (var n=0,l=line.words.length;n<l;n++) {
                
                if (line.words[n].x >= x) {
                    break;
                }
                
            }
            
            var offset = line.words.slice(n).map(function(word) {
                return word.text;
            }).join(" ").length;
            
            
            return { lineNumber:lineNumber, offset:offset } 
        }
        
        return textBlockNode;

    }
    
    
    
    
    
    
    
    
    
    
    // [DISPLAY NODES]
    
    var Li = (function() {

        function defineNode(obj) {

            // Positional Values
            var props = {
                x: 0,
                y: 0,
                z: 0,
                scaleX: 1,
                scaleY: 1,
                scaleZ: 1,
                rotationX: 0,
                rotationY: 0,
                rotationZ: 0
            };

            // Create getter/setters for all positional values
            // setters will mark the invalidated flag
            Object.keys(props).forEach(function(k) {
                var p = props;

                Object.defineProperty(obj, k, {
                    get: function() {
                        return p[k];
                    },
                    set: function(v) {
                        invalidated = true;
                        p[k] = v;
                    }
                });
            });

            var widthScale = 1;
            var heightScale = 1;
            var shader = new Shader("Shaders/vpBasic.cg", "Shaders/fpAlphaTexture.cg");

            // [internal method]
            obj.__invalidate = function(w, h) {  
                widthScale = w;
                heightScale = h;
                invalidated = true;
            }

            Object.defineProperty(obj, "shader", {
                get: function() {
                    return shader;
                },
                set: function(v) {
                    if (v.__getShaderProgram() != shader.__getShaderProgram()) {
                        if (shader.texture) {
                            v.texture = shader.texture;
                        }
                        shader = v;
                    }
                }
            });

            var matrixScale = new CanvasMatrix4();
            var matrixRotate = new CanvasMatrix4();
            var matrixTrans = new CanvasMatrix4();
            var matrix = new CanvasMatrix4();
            matrix.makeIdentity();

            var invalidated = false; // If invalidated then matrix is recalulated at render time

            // [internal method]
            obj.__getMatrix = function(gl) {
                var m = matrix;

                if (invalidated) {

                    invalidated = false;

                    var scaleM = matrixScale, rotateM = matrixRotate, transM = matrixTrans;

                    m.makeIdentity();
                    scaleM.makeIdentity();
                    rotateM.makeIdentity();
                    transM.makeIdentity();

                    scaleM.scale(props.scaleX * widthScale, props.scaleY * heightScale, props.scaleZ);

                    transM.translate(((props.x / glScale)), -(props.y / glScale), -(props.z / glScale));

                    rotateM.rotate(props.rotationX, 1, 0, 0);
                    rotateM.rotate(props.rotationY, 0, 1, 0);
                    rotateM.rotate(props.rotationZ, 0, 0, 1);

                    m.multLeft(transM);
                    m.multLeft(scaleM);
                    m.multLeft(rotateM);

                }

                return m;
            }

        }

        var LiContainer = function() {

            defineNode(this);

            var childNodes = []; // Child nodes stored in draw order
            var self = this;

            this.setCamera = function(centerX, centerY, fov, cameraDistance) {
                 console.warn("WebGl Version of Trilithium does not support setCamera")
            };

            this.removeChildAt = function(idx) {
                var removed = childNodes.splice(idx, 1);
                removed.forEach(function(node) {
                    node.parent = undefined;
                });
            };
            this.removeChild = function(node) {
                var idx = childNodes.indexOf(node);
                if (idx !== -1) {
                    var removed = childNodes.splice(idx, 1);
                    removed.forEach(function(node) {
                        node.parent = undefined;
                    });
                }
            };
            this.addChild = function(node) {
                if (node.parent) {
                    if (node.parent === this) {
                        var idx = childNodes.indexOf(node);
                        if (idx !== -1) {
                            childNodes.splice(idx, 1);
                        }
                    } else {
                        node.parent.removeChild(node);
                    }
                }
                node.parent = this;

                childNodes.push(node);
                return node;
            };
            this.addChildAt = function(node, index) {
                if (node.parent) {
                    if (node.parent === this) {
                        var idx = childNodes.indexOf(node);
                        if (idx !== -1) {
                            childNodes.splice(idx, 1);
                        }
                    } else {
                        node.parent.removeChild(node);
                    }
                }
                node.parent = this;

                childNodes.splice(index, 0, node);
                return node;
            };
            this.getChildIndex = function(child) {
                return childNodes.indexOf(child);
            };
            this.getChildAt = function(idx) {
                return childNodes[idx] || null;
            };
            this.contains = function(node) {
                return (childNodes.indexOf(node) !== -1)
            };
            Object.defineProperty(this, "numChildren", {
                get: function() {
                    return childNodes.length;
                }
            });

            var _localMatrix = new CanvasMatrix4();

            // [internal method]
            this.__draw = function(gl, m) {

                var nodes = childNodes;
                var localMatrix = _localMatrix;
                localMatrix.load(m);
                localMatrix.multLeft(self.__getMatrix());
                
                var i = 0;
                var l = nodes.length;

                for (;i<l; ++i) {
                    nodes[i].__draw(gl, localMatrix);
                }
                
            }

        };

        var LiImage = function(texture, w, h, disableWidthHeightSetters) {


            //this.test = function() {
              //  gl.deleteTexture(texture);
            //}

            var self = this;
            var height = 0, width = 0;

            defineNode(this);
            
            if (texture) {
                this.shader.texture = texture;
            }

            //this.unload = function() {
            //    texture&&texture.unload&&texture.unload();
            //    texture=null;
            //}
            
            // [STUB]
            this.unload = function() {}

            function updateScale() {
                self.__invalidate(width / glScale, height / glScale);
            }

            Object.defineProperty(this, "naturalWidth", {
                get: function() {
                    return texture && texture.image && texture.image.naturalWidth || w || 0;
                }
            });


            Object.defineProperty(this, "naturalHeight", {
                get: function() {
                    return texture && texture.image && texture.image.naturalHeight || h || 0;
                }
            });

            Object.defineProperty(this, "width", {
                get: function() {
                    return width;
                },
                set: function(v) {
                    if (!disableWidthHeightSetters) {
                        width = v;
                        updateScale();
                    }
                }
            });

            Object.defineProperty(this, "height", {
                get: function() {
                    return height;
                },
                set: function(v) {
                    if (disableWidthHeightSetters !== true) {
                        height = v;
                        updateScale();
                    }
                }
            });


            var _disableWidthHeightSetters = disableWidthHeightSetters;
            if (disableWidthHeightSetters) {
                disableWidthHeightSetters = false;
            }
            self.width = self.naturalWidth;
            self.height = self.naturalHeight;
            disableWidthHeightSetters = _disableWidthHeightSetters;

            var _localMatrix = new CanvasMatrix4();
            
            // [internal method]
            this.__draw = function(gl, m) {

                var localMatrix = _localMatrix;
                localMatrix.load(m);
                localMatrix.multLeft(self.__getMatrix());

                self.shader.__draw(gl, localMatrix.getAsWebGLFloatArray(), texture);
            }

        };

        // [outdated/experimental video implementation]
        // uses HTML5 video and canvas2d
        // hack: video drawn to canvas2d before being drawn to a texture. vendor needs to fix.
        var videoIdCounter = 0;
        function makeVideo(url, tex) {
            var vid = "trili_video_" + (videoIdCounter++);
            var isPlaying;
            var isClosed;
            var videoPlayer;
            var hackCanvas;
            var hack2d;

            var _localMatrix = new CanvasMatrix4();
            var video = new LiImage(tex, 1920, 1080);

            function init(url) {

                if (!isClosed) {
                    clean();
                }

                isClosed = false;
                isPlaying = true;
                videoPlayer = document.createElement('video');
                videoPlayer.setAttribute('id', vid);
                videoPlayer.setAttribute('src', url);
                videoPlayer.setAttribute('autoplay', true);
                videoPlayer.setAttribute('style', "display:none;");
                document.body.appendChild(videoPlayer);

                hackCanvas = document.createElement('canvas');
                hackCanvas.setAttribute('id', vid + "_canvas");
                hackCanvas.setAttribute('style', "display:none;");

                hack2d = hackCanvas.getContext("2d");
                document.body.appendChild(hackCanvas);

            }
            init(url)

            function clean() {
                if (!isClosed && videoPlayer) {
                    isClosed = true;
                    isPlaying = false;
                    videoPlayer.pause();
                    document.body.removeChild(videoPlayer);
                    document.body.removeChild(hackCanvas);
                }
            }


            // [internal method]
            video.__draw = function(gl, m) {

                var localMatrix = _localMatrix;
                localMatrix.load(m);
                localMatrix.multLeft(video.__getMatrix());

                video.shader.__draw(gl, localMatrix.getAsWebGLFloatArray());
                gl.bindTexture(gl.TEXTURE_2D, video.shader.getTexture());

                if (isPlaying) {

                    hackCanvas.width = videoPlayer.videoWidth;
                    hackCanvas.height = videoPlayer.videoHeight;
                    hack2d.drawImage(videoPlayer, 0, 0)
                    //print(videoPlayer)

                    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, hackCanvas);

                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    //gl.generateMipmap(gl.TEXTURE_2D);
                    pendingUpdate = false;

                }

                if (!isClosed) {
                    gl.drawElements(gl.TRIANGLES, 4, gl.UNSIGNED_SHORT, 0);
                }

            }

            video.load = function(url) {
                init(url);
            }

            video.play = function() {
                if (!isClosed) {
                    if (!isPlaying) {
                        isPlaying = true;
                        videoPlayer.play();
                    }
                }
            }
            video.stop = function() {}
            video.close = function() {
                clean();
            }
            video.pause = function() {
                if (!isClosed) {
                    if (isPlaying) {
                        videoPlayer.pause();
                    } else {
                        videoPlayer.play();
                    }
                    isPlaying = !isPlaying;
                }
            }


            return video;



        }

        return {

            DisplayNodeContainer: LiContainer,
            Image: LiImage,
            Video: makeVideo

        }

    })();


    

    return api;

})(document);


var include = engine.include;
var glScale = 45;






