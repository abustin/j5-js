






var j5 = (function() {

    var gl;
    var createShader;
    
    
    var camera = (function() {
        var CM4 = CanvasMatrix4;
        /*
        
        gl.perspectiveMatrix = new CanvasMatrix4();
        gl.perspectiveMatrix.makeIdentity();
        gl.perspectiveMatrix.lookat(0.0, 0.5, 5, 0, 0, 0, 0, 1, 0);
        gl.perspectiveMatrix.perspective(45, 750 / 750, .1, 1000.0);
        gl.perspectiveMatrixArray = gl.perspectiveMatrix.getAsWebGLFloatArray();
        
        
        */
        
        return function(x,y) {
            var cam = new CM4();
            cam.lookat(0,0,5, 0, 0, 0, 0, 1, 0);
            cam.perspective(45, glCanvas.width / glCanvas.height, 1, 1000);
            
            
            return cam.getAsWebGLFloatArray();
        }
        
        
    })();
    
    
    
    
    var offset = (function() {
        
        var CM4 = CanvasMatrix4;
        
        var trans = new CM4();
        var scale = new CM4();
        var rotateX = new CM4();
        var rotateY = new CM4();
        var rotateZ = new CM4();
        var origin = new CM4();
        var mat = new CM4();
        
        return function(args, parent) {
            
           // = 1;
            //args.originY = 1;
            //args.originZ = 0;
            
            if (parent) {
                mat.load(parent)
            } else {
                mat.makeIdentity();
            }
            
            
            
            if (args.x || args.y || args.z) {
                //trans.makeIdentity();
                trans.translateOpt(args.x, args.y, args.z);
                mat.multLeft(trans);
            }
            
            
            if (args.originX || args.originY || args.originX) {
                //origin.makeIdentity();
                origin.translateOpt(args.originX, args.originY, args.originZ);
                mat.multLeft(origin);
            }
            
            if (args.scaleX !== undefined || args.scaleY !== undefined || args.scaleZ !== undefined) {
                scale.makeIdentity();
                scale.scale((args.scaleX === undefined) ? 1 : args.scaleX,
                            (args.scaleY === undefined) ? 1 : args.scaleY,
                            (args.scaleZ === undefined) ? 1 : args.scaleZ);
                mat.multLeft(scale);
            }
            
            
            args.rotateX&&mat.multLeft(rotateX.rotateX(args.rotateX))
            args.rotateY&&mat.multLeft(rotateY.rotateY(args.rotateY))
            args.rotateZ&&mat.multLeft(rotateZ.rotateZ(args.rotateZ))
            
            if (args.originX || args.originY || args.originX) {
                //origin.makeIdentity();
                origin.translateOpt(-args.originX, -args.originY, -args.originZ);
                mat.multLeft(origin);
            }
            
            return mat.getAsWebGLFloatArray();
        }
        
        
        
    })();
    
    var initGL = function(canvas) {
    	var gl
        var names = ["webgl", "experimental-webgl", "moz-webgl", "webkit-3d"];
        var i;
        for (i=0; names.length > i; i++) {
            try {
                gl = canvas.getContext(names[i]);
                //_gl = gl // UNCOMMENT FOR A GLOBAL REF TO GL
                if (gl) {
                    //gl = WebGLDebugUtils.makeDebugContext(gl);
                    break;
                }
            } catch(e) {}
        }
        !gl&&console.error("Could not initialise WebGL");
    	return gl;
    }
    
    var initScene = function(gl) {
        
        gl.viewport(0, 0, glCanvas.width, glCanvas.height);
        defaultCamera = camera();
        
        
        gl.clearColor(0 / 255, 0 / 255, 0 / 255, 1.0);
        //gl.clearDepth(1);
    	gl.enable(gl.DEPTH_TEST);

        gl.enable(gl.BLEND);
        gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA, gl.SRC_ALPHA, gl.ONE)
        
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.clear(gl.DEPTH_BUFFER_BIT);

    }
    
    var initShaders = function(gl,doc) {        

        return (function() {

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
            
            var isMatrixType = function(type) {
                switch(type) {
                    case gl.FLOAT_MAT4:
                    case gl.FLOAT_MAT3:
                    case gl.FLOAT_MAT2:
                        return true;
                    default:
                        return false;
                }
            }
            
            // Return the number of elements for GL type
            var getBaseType = function(type) {

                switch(type) {
                    case gl.FLOAT_MAT4:
                    case gl.FLOAT_MAT3:
                    case gl.FLOAT_MAT2:
                    case gl.FLOAT_VEC4:
                    case gl.FLOAT_VEC2:
                    case gl.FLOAT_VEC3:
                        return gl.FLOAT;
                    case gl.INT_VEC4:
                    case gl.INT_VEC3:
                    case gl.INT_VEC2:
                        return gl.INT;
                    case gl.BOOL_VEC4:
                    case gl.BOOL_VEC3:
                    case gl.BOOL_VEC2:
                        return gl.BOOL;
                    default:
                        return type;
                }

            }

            // Map GL type to a uniform setter method
            UNIFORM_SETTER[gl.FIXED]        = gl.uniform1i;
            UNIFORM_SETTER[gl.SHORT]        = gl.uniform1i;
            UNIFORM_SETTER[gl.UNSIGNED_BYTE]= gl.uniform1i;
            UNIFORM_SETTER[gl.BYTE]         = gl.uniform1i;
            UNIFORM_SETTER[gl.INT]          = gl.uniform1i;
            UNIFORM_SETTER[gl.UNSIGNED_INT] = gl.uniform1i;
            UNIFORM_SETTER[gl.FLOAT]        = gl.uniform1f;
            UNIFORM_SETTER[gl.SAMPLER_2D]   = gl.uniform1i;

            UNIFORM_SETTER[gl.FLOAT_MAT4]  = gl.uniformMatrix4fv;
            UNIFORM_SETTER[gl.FLOAT_MAT3]  = gl.uniformMatrix3fv;
            UNIFORM_SETTER[gl.FLOAT_MAT2]  = gl.uniformMatrix2fv;

            UNIFORM_SETTER[gl.FLOAT_VEC2]  = gl.uniform2fv;
            UNIFORM_SETTER[gl.FLOAT_VEC3]  = gl.uniform3fv;
            UNIFORM_SETTER[gl.FLOAT_VEC4]  = gl.uniform4fv;
            UNIFORM_SETTER[gl.INT_VEC2]    = gl.uniform2iv;
            UNIFORM_SETTER[gl.INT_VEC3]    = gl.uniform3iv;
            UNIFORM_SETTER[gl.INT_VEC4]    = gl.uniform4iv;
            UNIFORM_SETTER[gl.BOOL]        = gl.uniform1i;
            UNIFORM_SETTER[gl.BOOL_VEC2]   = gl.uniform2iv;
            UNIFORM_SETTER[gl.BOOL_VEC3]   = gl.uniform3iv;
            UNIFORM_SETTER[gl.BOOL_VEC4]   = gl.uniform4iv;

            var defaultShader = null;   // Default shader program
            var programCache = {};      // Store of all loading shader programs


            // Get and Compile and fragment or vertex shader by ID.
            // (shader source is currently embeded within HTML file)
            function getShader(gl, id) {
                
                //console.log("getShader",id)
                
                var shaderScript = doc.getElementById(id);
                if (!shaderScript) {
                    return null;
                }

                var str = "";
                var k = shaderScript.firstChild;
                while (k) {
                    if (k.nodeType === 3) {
                        str += k.textContent;
                    }
                    k = k.nextSibling;
                }


                var shader;
                if (shaderScript.type === "x-shader/x-fragment") {
                    shader = gl.createShader(gl.FRAGMENT_SHADER);
                } else if (shaderScript.type === "x-shader/x-vertex") {
                    shader = gl.createShader(gl.VERTEX_SHADER);
                } else {
                    return null;
                }
                                

                gl.shaderSource(shader, str);
                gl.compileShader(shader);
                //console.log("->",gl.getError());
                if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                    console.error("Error compiling shader\n",gl.getShaderInfoLog(shader));
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

    			v = v || "vBasic";
    			f = f || "fAlphaTexture";

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
                var loc;
                
                while (i<len) {
                    
                    info = gl.getActiveUniform(shader,i);
                    loc = gl.getUniformLocation(shader, info.name);
                    meta.uniforms.push(info.name);
                    meta.uniform[info.name] = {
                        name: info.name,
                        glType: info.type,
                        type: rgl[info.type],
                        isTexture: (info.type === gl.SAMPLER_2D),
                        isMatrixType: isMatrixType(info.type),
                        length: getTypeLength(info.type),
                        idx: i,
                        location: loc,
                        setter: UNIFORM_SETTER[info.type],
                        locVal:[loc,false]
                    };

                    //console.log(meta.uniform[info.name])
                    i++;
                }

                len = gl.getProgramParameter(shader, gl.ACTIVE_ATTRIBUTES)
                i = 0;
                while (i<len) {
                    info = gl.getActiveAttrib(shader,i);
                    meta.attribute[info.name] = {
                        name: info.name,
                        glType: info.type,
                        glBaseType: getBaseType(info.type),
                        type: rgl[info.type],
                        length: getTypeLength(info.type),
                        idx: i,
                        location: gl.getAttribLocation(shader, info.name)
                        
                    };
                    //console.log(meta.attribute[info.name] )
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

                var self = {};

                // Create getter/setters for all uniforms and textures on Shader object
                glShader.meta.uniforms.forEach(function(name) {
                    var uniform = glShader.meta.uniform[name];
                    var len = uniform.length;
                    var name = uniform.name;
                    var vals = shaderValues;
                    //(name != "uMVMatrix" && name != "uMVMatrix")&&

                    Object.defineProperty(self, "$"+uniform.name, {
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

                self.setAttribute = function(gl, attributeName, stride, offset) {
                    var at = glShader.meta.attribute[attributeName];
                    if (at) {
                        gl.enableVertexAttribArray(at.location);
                        gl.vertexAttribPointer(at.location, at.length, at.glBaseType, false, stride, offset);
                    }
                }

                self.update = function(gl, geomAttributes) {

                    var meta = glShader.meta;
                    var uniform = meta.uniform;
                    var uniforms = meta.uniforms;
                    var name, val, u, i = uniforms.length;
    				var attribute = meta.attribute;

    				
                    gl.currentShaderProgram = glShader;
                    gl.useProgram(glShader.program);
                    //uniform.uPMatrix  && gl.uniformMatrix4fv(uniform.uPMatrix.location,  false, gl.perspectiveMatrixArray);
                    //uniform.uMVMatrix && gl.uniformMatrix4fv(uniform.uMVMatrix.location, false, mv);


                    var vals = shaderValues;
                    var textureSlot = 0;

                    // Iterate over uniforms and textures setting values from JS to shader program
                    while (i--) {                        
                        name = uniforms[i];
                        val = vals[name];
                        u = uniform[name];
 
                        if (val !== undefined && val !== null) {
                            if (u.isTexture) { 
                                gl.activeTexture(gl['TEXTURE'+textureSlot]);
                                gl.bindTexture(gl.TEXTURE_2D, val);
                                u.locVal[1] = textureSlot++;
                            } else if (u.isMatrixType) {
                                u.locVal[2] = val;
                            } else {
                                u.locVal[1] = val;
                            }
                           
                            u.setter.apply(gl, u.locVal); // uses uniform setter map to set value
                        }
                    }
                    
    				//gl.drawElements(gl.TRIANGLES, geom.indexObject.numItems, gl.UNSIGNED_SHORT, 0);
                }

                self.$getShaderProgram = function() {
                    return glShader.program;
                }

    			return self;

            }

        })(gl);

        //var defaultShader = new Shader("Shaders/vpBasic.cg", "Shaders/fpAlphaTexture.cg");


    }
    
    

    var textureManager = (function() {
        
        
        
        
    })();
    
    var createBuffer = function(gl, type, data, size) {
        //console.log("createBuffer")
        var buffer = gl.createBuffer();
        gl.bindBuffer(type, buffer);
        gl.bufferData(type, data, gl.STATIC_DRAW);
        buffer.itemSize = size;
        buffer.numItems = data.length/size;
        return buffer;
    };
    
    
    var loadImage = function(gl, url, success, err) {
        //console.log("loadImage")
        var ctx = gl;
        //gl.activeTexture(gl.TEXTURE0);
        var texture = ctx.createTexture();
        var loaded = false;

        texture.image = new Image();

        texture.image.onload = function() {
            handleLoadedTexture(gl, texture, texture.image);
            loaded = true;
            success && success(texture);
            success = null;
            err = null;
            texture.image.src = "data:image/png;,";

        }
        texture.image.src = url;

    };
    
    var handleLoadedTexture = function(gl, texture, image) {
        //console.log("handleLoadedTexture")
        //gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image); 
      //gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, rttFramebuffer.width, rttFramebuffer.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        image = null;

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);        
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.generateMipmap(gl.TEXTURE_2D)
        

        texture.destory = function() {
            gl.deleteTexture(texture);
            texture = null;
            image = null;
        }

    	gl.bindTexture(gl.TEXTURE_2D, null);
        return texture;

    }
    
    var geomCache = {};
    
    var _mouseX = 0;
    var _mouseY = 0;
    var mouseMoveHandler = function(e) {
        _mouseX = (e.offsetX||e.pageX)/glCanvas.width;
        _mouseY = (e.offsetY||e.pageY)/glCanvas.height;
        if (onMouseMove) {
           onMouseMove(_mouseX,_mouseY);
        }
    }
    
    
    
    var offsetVerts = function(mat, data, size, stride, offset) {
        
        var len = data.length;
        var i = offset ||0;
        var x = 0;
        var v = [0,0,0,1], nv = [];
        
        for (;i<len;i+=stride) {
         
            for (x=0;x<size;x++) {
                v[x] = data[i+x];
            }
         
            mat.multVector(v,nv);
            
            for (x=0;x<size;x++) {
                data[i+x] = nv[x];
            }
            
        }
        
        return data;
    }
    
    var createCubeData = function(cols, rows, colSize, rowSize){

        var mat = new CanvasMatrix4();
        var quad = makeQuad(cols, rows, colSize, rowSize);
        
        var vertices = [];
        var indices = [];
        
        var addQuad = function(quad, mat, i) {
            var len = 4;
            vertices = vertices.concat(offsetVerts(mat,quad.vertices.concat(),3,5,0));
            indices = indices.concat(quad.indices.map(function(idx) {
                return i*len + idx;
            }));
            //console.log(indices)
        }

        // front
        addQuad(quad, mat, 0);
        
        // back
        mat.translate(0,0,-1);
        addQuad(quad, mat, 1);
        
        // left
        mat.makeIdentity();
        mat.rotate(Math.PI*.5,0,1,0)
        addQuad(quad, mat, 2);
        
        // bottom
        mat.makeIdentity();
        mat.rotate(Math.PI*.5,-1,0,0)
        addQuad(quad, mat, 3);
        
        // right
        mat.makeIdentity();
        mat.rotate(Math.PI*.5,0,1,0)
        mat.translate(1,0,0);
        addQuad(quad, mat, 4);
        
        // top
        mat.makeIdentity();
        mat.rotate(Math.PI*.5,-1,0,0)
        mat.translate(0,1,0);
        addQuad(quad, mat, 5);
        

        return {
            vertices: createBuffer(gl, gl.ARRAY_BUFFER,         new Float32Array(vertices),5),
	        indices:  createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), 1),
	        size: indices.length
        }

    }

    var createQuadData = function(cols, rows, colSize, rowSize){

        var quad = makeQuad(cols, rows, colSize, rowSize);

        return {
            vertices: createBuffer(gl, gl.ARRAY_BUFFER,         new Float32Array(quad.vertices),5),
	        indices:  createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(quad.indices), 1),
	        size: quad.indices.length
        }

    }

    var makeQuad = function(cols, rows, colSize, rowSize, transform){
	
	    var row, col, grid = [], data;
		var colsData = [], rowsData = [], ins = []
	
		var comboData = [];
		comboData.size = 0;
		var comboDatai = 0;

		for (col=0;col<cols+1;col++) {
	    
			grid[col] = [];
		
			for (row=0;row<rows+1;row++) {

		        grid[col][row] = comboData.size;
	            
	            // vert
				comboData[comboDatai++] = col*colSize;
				comboData[comboDatai++] = row*rowSize;
				comboData[comboDatai++] = 0;
			    // txt
				comboData[comboDatai++] = col/cols;
				comboData[comboDatai++] = row/rows;
			
				comboData.size++;

			}
		}
	
		var vi = 0;
		var v0;
		var v1;
		var v2;
		var v3;
	
		for (col=0;col<cols;col++) {

			for (row=0;row<rows;row++) {

				v0 = grid[col][row];
				v1 = grid[col+1][row];
				v2 = grid[col][row+1];
				v3 = grid[col+1][row+1];
			
				ins[vi+0] = v0;
				ins[vi+1] = v1;
				ins[vi+2] = v3;
			
				ins[vi+3] = v0;
				ins[vi+4] = v3;
				ins[vi+5] = v2;
			
				vi += 6;

			}
		}

		
		
		
		var data = {
		    vertices: comboData,
		    indices:  ins
		}
		
		return data;
	
	}

    var glCanvas;
    var onMouseMove;

    var defaultCamera;

	var api = {
	    
	    onMouseMove: function(callback) {
	        onMouseMove = callback;
	    },
	    
	    offset:offset,
	    camera:camera,
	    
	    attachCanvas: function(glCanvasElement) {
	        
	        //console.log("attachCanvas")
	        glCanvas = glCanvasElement;
	        gl = initGL(glCanvasElement);
	        initScene(gl);
	        createShader = initShaders(gl, document);
	        
	        glCanvas.addEventListener("mousemove", mouseMoveHandler, false);
	        
	        api.gl = gl;
	    },
	    
	    texture: function(url, callback) {
	        //console.log("texture", url)
	        loadImage(gl,url,callback);
	    },
	    
	    shader: function() {
	        return createShader()
	    },

		quad: function(shader, cols, rows, colSize, rowSize) {
		    //console.log("quad")
			rowSize = rowSize || 1;
			colSize = rowSize || 1;

			rows = rows || 1;
			cols = cols || 1;
			
			var geomId = "quad,"+[cols, rows, colSize, rowSize];
			
			var geomData = geomCache[geomId] = geomCache[geomId] || createQuadData(cols, rows, colSize, rowSize)
			

			return {
			    draw: function(shader, position, camera) {
			        //console.log("draw")
			        if (position) {
			            shader.$uMVMatrix = position;
		            }
			        shader.$uPMatrix = camera || defaultCamera;
			        
			        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geomData.indices);
    				gl.bindBuffer(gl.ARRAY_BUFFER, geomData.vertices);
    				
    				shader.setAttribute(gl, "aTextureCoord",   5*4, 3*4);
    				shader.setAttribute(gl, "aVertexPosition", 5*4, 0*4);
    				
    				shader.update(gl,position);
    				
                    gl.drawElements(gl.TRIANGLES, geomData.size, gl.UNSIGNED_SHORT, 0);
                                        
			    }
			};


		},
		
		
		cube: function(shader, cols, rows, colSize, rowSize) {
    	    //console.log("quad")
    		rowSize = rowSize || 1;
    		colSize = rowSize || 1;

    		rows = rows || 1;
    		cols = cols || 1;

    		var geomId = "quad,"+[cols, rows, colSize, rowSize];

    		var geomData = geomCache[geomId] = geomCache[geomId] || createCubeData(cols, rows, colSize, rowSize)


    		return {
    		    draw: function(shader, position, camera) {
    		        //console.log("draw")
    		        if (position) {
    		            shader.$uMVMatrix = position;
    	            }
    		        shader.$uPMatrix =  camera || defaultCamera;

    		        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geomData.indices);
    				gl.bindBuffer(gl.ARRAY_BUFFER, geomData.vertices);

    				shader.setAttribute(gl, "aTextureCoord",   5*4, 3*4);
    				shader.setAttribute(gl, "aVertexPosition", 5*4, 0*4);

    				shader.update(gl,position);

                    gl.drawElements(gl.TRIANGLES, geomData.size, gl.UNSIGNED_SHORT, 0);

    		    }
    		};


    	}
        
		

	}
	
	var _requestAnimationFrame = (function(){
          return  window.requestAnimationFrame       || 
                  window.webkitRequestAnimationFrame || 
                  window.mozRequestAnimationFrame    || 
                  window.oRequestAnimationFrame      || 
                  window.msRequestAnimationFrame     || 
                  function(callback, element){
                      setTimeout(callback, 16);
                  };
    })();
	
	
	api.requestAnimationFrame = function(callback) {
	    aa = _requestAnimationFrame;
	    var onFrame = function() {
	        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	        callback();
	        framerateTracker&&framerateTracker.snapshot();
	    }
	    
	    _requestAnimationFrame(onFrame, glCanvas);
	    
	}
	
	Object.defineProperty(api, "mouseX", {
        get: function() {
            return _mouseX;
        }
    });

    Object.defineProperty(api, "mouseY", {
        get: function() {
            return _mouseY;
        }
    });
    
    var framerateTracker;
    
    
    api.onFramerate = function(callback) {
        if (framerateTracker) {
            framerateTracker.callback = callback;
        } else {
            framerateTracker = new Framerate(callback);
        }
    };
    
	return api;


})();

/*

var j3 = (function() {

	var api = {

		createPlain: function(cols, rows, colSize, rowSize) {
			rowSize = rowSize || 1;
			colSize = rowSize || 1;

			rows = rows || 1;
			cols = cols || 1;
			
			var row, col, grid = [], vertexData = [], data;
			var colsData = [], rowsData = [], ins = []
			
			var comboData = [];
			comboData.size = 0;
			var comboDatai = 0;

			for (col=0;col<cols+1;col++) {
				grid[col] = [];
				for (row=0;row<rows+1;row++) {

					data = {
						idx: comboData.size++,
			            vertex: [col*colSize,row*rowSize,0],
						txtCord: [col/cols, row/rows]
			        }
			        
			        comboData.size++;
			
					comboData[comboDatai++] = col*colSize;
					comboData[comboDatai++] = row*rowSize;
					comboData[comboDatai++] = 0;
					
					comboData[comboDatai++] = col/cols;
					comboData[comboDatai++] = row/rows;
					
					vertexData.push(data)
					grid[col].push(data);

				}
			}
			
			var vi;
			var v0;
			var v1;
			var v2;
			var v3;
			
			for (col=0;col<cols;col++) {

				for (row=0;row<rows;row++) {
					vi = ins.length;
					v0 = grid[col][row];
					v1 = grid[col+1][row];
					v2 = grid[col][row+1];
					v3 = grid[col+1][row+1];
					
					ins[vi+0] = v0.idx;
					ins[vi+1] = v1.idx;
					ins[vi+2] = v3.idx;
					
					ins[vi+3] = v0.idx;
					ins[vi+4] = v3.idx;
					ins[vi+5] = v2.idx;

				}
			}

			
			
			
			
			return {
			    features:null,
				comboData:comboData,
				vData: vData,
				tData: tData,
				vertices: vertexData,
				indices: ins
			};


		}

	}

    


	return api;


})();



var createBuffer = function(gl, type, data, size) {
    var buffer = gl.createBuffer();
    gl.bindBuffer(type, buffer);
    gl.bufferData(type, data, gl.STATIC_DRAW);
    buffer.itemSize = size;
    buffer.numItems = data.length/size;
    return buffer;
};



function createTexture(gl, width, height) {
	  
	  gl.activeTexture(gl.TEXTURE0);
	  
      var texture = gl.createTexture();

      texture.width = width;
      texture.height = height;
	
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      //gl.generateMipmap(gl.TEXTURE_2D);

      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

      gl.bindTexture(gl.TEXTURE_2D, null);
      return texture;

  }

function initTextureFramebuffer(gl, texture) {

    var rttFramebuffer = gl.createFramebuffer();
    var renderbuffer = gl.createRenderbuffer();

	gl.bindFramebuffer(gl.FRAMEBUFFER, rttFramebuffer);
	
	
	//gl.enable(gl.DEPTH_TEST);
	//gl.enable(gl.CULL_FACE);
	
	
	
	gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
	//gl.activeTexture(gl.TEXTURE0);             
	gl.bindTexture(gl.TEXTURE_2D, texture);
	
	
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, texture.width, texture.height);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);
	
	
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return {
        begin: function() {

			 gl.clearColor(100 / 255, 100 / 255, 100 / 255, 0.3);
            gl.bindFramebuffer(gl.FRAMEBUFFER, rttFramebuffer);
            //gl.viewport(0, 0, texture.width, texture.height);

			gl.clear(gl.COLOR_BUFFER_BIT);
			gl.clear(gl.DEPTH_BUFFER_BIT);
			
			
        },
        end: function() {
			
			gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, null);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			//gl.viewport(0, 0, 750, 750);
			gl.clearColor(0 / 255, 0 / 255, 0 / 255, 1.0);
        }
    }

  }

// Configure new texture objects


var createGeom = function(gl, mesh) {
	
	var ii = 0;
	
	//console.log(mesh.tData)
	
	return {
	
		attsObject: createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(mesh.comboData),5),
	
		//vertexObject: createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(mesh.vData),3),
	
		//texCoordObject: createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(mesh.tData),2),
	
		indexObject: createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(mesh.indices),1)
	
	}
}



function init2() {
	
	
	
	var glCanvas = document.getElementById("webglcanvas");
	var gl = initGL(glCanvas);
	_gl = gl;
	gl.enable(gl.SAMPLE_ALPHA_TO_COVERAGE);
	//gl.sampleCoverage(.5, false)
	initScene(gl);
	gl.lineWidth(5);

	var t = createTexture(gl,750,750);
	var fbo = initTextureFramebuffer(gl,t);
	var createShader = initShaders(gl,document);
	
	var d = 80;
	
	var plain = createGeom(gl,j3.createPlain(d,d,1/d,1/d));
	
	
	
	
	var drawable = createShader();
	//var drawable2 = createShader("Shaders/vpPoint.cg","Shaders/fpPoint.cg");
	var drawable2 = createShader("Shaders/vpBasic.cg","Shaders/fpPoint.cg");
	
	loadImage(gl,"Rainbow_Ocean__by_Thelma1.jpg", function(txt) {
		drawable.texture = txt;
	});
	
	
	drawable2.texture = t;
	
	//gl.enable(gl.STENCIL_TEST);
	
	
	var fr = new Framerate(function(msg) {
		window.status = msg;
	});
	
	gl.mvMatrix.scale(2)
	gl.mvMatrix2.scale(1.5)
	
	var loop = function() {
		
		
		
		fbo.begin();
			drawable.__draw(gl, gl.mvMatrix.getAsWebGLFloatArray(), plain);
		fbo.end();
		
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.clear(gl.DEPTH_BUFFER_BIT);
	
		d+=0.03;
		//plain = createGeom(gl,j3.createPlain(d,d,2/d,2/d));
		//gl.clear(gl.COLOR_BUFFER_BIT);  
		
		//drawable.tick = d;
		drawable2.tick = d;

		
		//
		//gl.mvMatrix.rotate(-0.01,.33,.3,.21)
		//
		
		//gl.stencilFunc(gl.EQUAL, 0x2, 0x1); 
		//gl.stencilOp(gl.INVERT, gl.KEEP, gl.KEEP);
		
		drawable2.__draw(gl, gl.mvMatrix2.getAsWebGLFloatArray(), plain);


		fr.snapshot();
		

	}
	
	setInterval(loop, 8);
	
	//gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
	//gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
	
}

function initGL(canvas) {
	var gl
    var names = ["webgl", "experimental-webgl", "moz-webgl", "webkit-3d"];
    var i;
    for (i=0; names.length > i; i++) {
        try {
            gl = canvas.getContext(names[i]);
            //_gl = gl // UNCOMMENT FOR A GLOBAL REF TO GL
            if (gl) {
                // UNCOMMENT FOR WEBGL DEBUGGING
                // Debug wrapper is currently nesting in HTML file.
                //gl = WebGLDebugUtils.makeDebugContext(gl);
                break;
            }
        } catch(e) {}
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
	return gl;
}

function initScene(gl) {

//gl.enable(0x8642)
    gl.viewport(0, 0, 750, 750);
    gl.clearColor(150 / 255, 150 / 255, 150 / 255, 1.0);
    //gl.clearDepth(1.0);
	//gl.enable(gl.DEPTH_TEST);
	//gl.enable(gl.CULL_FACE);

    gl.mvMatrix = new CanvasMatrix4();
    gl.mvMatrix.makeIdentity();

	gl.mvMatrix2 = new CanvasMatrix4();
    gl.mvMatrix2.makeIdentity();
    //gl.mvMatrix.translate( - 21, 11.5, -23);

    gl.perspectiveMatrix = new CanvasMatrix4();
    gl.perspectiveMatrix.makeIdentity();
    //gl.perspectiveMatrix.lookat(0.0, 0.5, 5, 0, 0, 0, 0, 1, 0);
    //gl.perspectiveMatrix.perspective(45, 750 / 750, .1, 5000.0);
    //gl.perspectiveMatrix.translate(0, 0, 2);
    gl.perspectiveMatrixArray = gl.perspectiveMatrix.getAsWebGLFloatArray();

    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.SRC_ALPHA, gl.ONE)

    //gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.box.indexObject);

    
    gl.clear(gl.COLOR_BUFFER_BIT);
	//gl.clear(gl.DEPTH_BUFFER_BIT);

}


var initShaders = function(gl,doc) {        

    return (function() {

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

			v = v || "Shaders/vpBasic.cg";
			f = f || "Shaders/fpAlphaTexture.cg";

            console.log("->",gl.getError());

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

            //gl.enableVertexAttribArray(attribute.aVertexPosition.location);
            //gl.enableVertexAttribArray(attribute.aTextureCoord.location);
            //
            //gl.bindBuffer(gl.ARRAY_BUFFER, gl.box.vertexObject);
            //gl.vertexAttribPointer(attribute.aVertexPosition.location, gl.box.vertexObject.itemSize, gl.FLOAT, false, 0, 0);
            //
            //gl.bindBuffer(gl.ARRAY_BUFFER, gl.box.texCoordObject);
            //gl.vertexAttribPointer(attribute.aTextureCoord.location, gl.box.texCoordObject.itemSize, gl.FLOAT, false, 0, 0);

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

            var self = {};

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

			var flag = true;

            // Draw leaf node
            // (mv matrix, primary texture passed in)
            // [internal method]
            self.draw = function(gl, mv, geom, imageTexture) {

                var usetter = UNIFORM_SETTER;
                var meta = glShader.meta;
                var uniform = meta.uniform;
                var uniforms = meta.uniforms;
                var name, val, u, i = uniforms.length;
				var attribute = meta.attribute;
				
				


				attribute.aVertexPosition&&gl.enableVertexAttribArray(attribute.aVertexPosition.location);
                attribute.aTextureCoord&&gl.enableVertexAttribArray(attribute.aTextureCoord.location);

				// texture coordinate 0 is vertex attribute 2 
				//gl.vertexAttribPointer(INDX, SIZE, GL_FLOAT, GL_FALSE, VERTEX_ATTRIB_SIZE * sizeof(float), (p + VERTEX_TEXCOORD0_OFFSET));

                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geom.indexObject);
                
				gl.bindBuffer(gl.ARRAY_BUFFER, geom.attsObject);
                //gl.bindBuffer(gl.ARRAY_BUFFER, geom.vertexObject);
                attribute.aVertexPosition&&gl.vertexAttribPointer(attribute.aVertexPosition.location, 3, gl.FLOAT, false, 5*4, 0*4);

                //gl.bindBuffer(gl.ARRAY_BUFFER, geom.texCoordObject);
                attribute.aTextureCoord&&gl.vertexAttribPointer(attribute.aTextureCoord.location, 2, gl.FLOAT, false, 5*4, 3*4);


                // Change shader program if different from last draw
                //if (gl.currentShaderProgram !== glShader) {
                    
                    gl.currentShaderProgram = glShader;
                    gl.useProgram(glShader.program);
                    uniform.uPMatrix&&gl.uniformMatrix4fv(uniform.uPMatrix.location, false, gl.perspectiveMatrixArray);
                //}

                // set mv matrix
                uniform.uMVMatrix&&gl.uniformMatrix4fv(uniform.uMVMatrix.location, false, mv);

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
                //gl.drawArray(gl.TRIANGLE_STRIP, 0, 4);
				gl.drawArrays(gl.POINTS, 0,geom.attsObject.numItems);
				//gl.drawElements(gl.LINES, geom.indexObject.numItems, gl.UNSIGNED_SHORT, 0);
				//gl.drawElements(gl.TRIANGLES, geom.indexObject.numItems, gl.UNSIGNED_SHORT, 0);

            }

            self.getShaderProgram = function() {
                return glShader.program;
            }

			return self;

        }

    })(gl);

    var defaultShader = new Shader("Shaders/vpBasic.cg", "Shaders/fpAlphaTexture.cg");


}
*/