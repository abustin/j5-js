CanvasMatrix4=function(a){if(typeof a=="object")if("length"in a&&a.length>=16){this.load(a[0],a[1],a[2],a[3],a[4],a[5],a[6],a[7],a[8],a[9],a[10],a[11],a[12],a[13],a[14],a[15]);return}else if(a instanceof CanvasMatrix4){this.load(a);return}this.makeIdentity()};
CanvasMatrix4.prototype.multVector=function(a,d){var c=a[0],e=a[1],g=a[2],d=d||[];d[0]=c*this.m11+e*this.m21+g*this.m31+1*this.m41;d[1]=c*this.m12+e*this.m22+g*this.m32+1*this.m42;d[2]=c*this.m13+e*this.m23+g*this.m33+1*this.m43;d[3]=c*this.m14+e*this.m24+g*this.m34+1*this.m44;return d};
CanvasMatrix4.prototype.load=function(a){if(a&&typeof a=="object"){if(a instanceof CanvasMatrix4){this.m11=a.m11;this.m12=a.m12;this.m13=a.m13;this.m14=a.m14;this.m21=a.m21;this.m22=a.m22;this.m23=a.m23;this.m24=a.m24;this.m31=a.m31;this.m32=a.m32;this.m33=a.m33;this.m34=a.m34;this.m41=a.m41;this.m42=a.m42;this.m43=a.m43;this.m44=a.m44;return}if("length"in a&&a.length==16){this.m11=a[0];this.m12=a[1];this.m13=a[2];this.m14=a[3];this.m21=a[4];this.m22=a[5];this.m23=a[6];this.m24=a[7];this.m31=a[8];
this.m32=a[9];this.m33=a[10];this.m34=a[11];this.m41=a[12];this.m42=a[13];this.m43=a[14];this.m44=a[15];return}}this.makeIdentity()};CanvasMatrix4.prototype.getAsArray=function(){return[this.m11,this.m12,this.m13,this.m14,this.m21,this.m22,this.m23,this.m24,this.m31,this.m32,this.m33,this.m34,this.m41,this.m42,this.m43,this.m44]};
CanvasMatrix4.prototype.getAsWebGLFloatArray=function(){return new Float32Array([this.m11,this.m12,this.m13,this.m14,this.m21,this.m22,this.m23,this.m24,this.m31,this.m32,this.m33,this.m34,this.m41,this.m42,this.m43,this.m44])};CanvasMatrix4.prototype.makeIdentity=function(){this.m11=1;this.m21=this.m14=this.m13=this.m12=0;this.m22=1;this.m32=this.m31=this.m24=this.m23=0;this.m33=1;this.m43=this.m42=this.m41=this.m34=0;this.m44=1};
CanvasMatrix4.prototype.transpose=function(){var a=this.m12;this.m12=this.m21;this.m21=a;a=this.m13;this.m13=this.m31;this.m31=a;a=this.m14;this.m14=this.m41;this.m41=a;a=this.m23;this.m23=this.m32;this.m32=a;a=this.m24;this.m24=this.m42;this.m42=a;a=this.m34;this.m34=this.m43;this.m43=a};
CanvasMatrix4.prototype.invert=function(){var a=this._determinant4x4();if(Math.abs(a)<1.0E-8)return null;this._makeAdjoint();this.m11/=a;this.m12/=a;this.m13/=a;this.m14/=a;this.m21/=a;this.m22/=a;this.m23/=a;this.m24/=a;this.m31/=a;this.m32/=a;this.m33/=a;this.m34/=a;this.m41/=a;this.m42/=a;this.m43/=a;this.m44/=a};CanvasMatrix4.prototype.translateOpt=function(a,d,c){this.m41=a||0;this.m42=d||0;this.m43=c||0};
CanvasMatrix4.prototype.translate=function(a,d,c){var e=new CanvasMatrix4;e.m41=a||0;e.m42=d||0;e.m43=c||0;this.multRight(e)};CanvasMatrix4.prototype.scale=function(a,d,c){a==void 0&&(a=1);c==void 0?c=d==void 0?d=a:1:d==void 0&&(d=a);var e=new CanvasMatrix4;e.m11=a;e.m22=d;e.m33=c;this.multRight(e)};CanvasMatrix4.prototype.sin=Math.sin;CanvasMatrix4.prototype.cos=Math.cos;
CanvasMatrix4.prototype.rotateX=function(a){a*=0.5;var d=this.sin(a),a=this.cos(a),c=d*d;this.m22=1-2*c;this.m23=2*d*a;this.m32=-2*d*a;this.m33=1-2*c;return this};CanvasMatrix4.prototype.rotateY=function(a){a*=0.5;var d=this.sin(a),a=this.cos(a),c=d*d;this.m11=1-2*c;this.m13=-2*d*a;this.m31=2*d*a;this.m33=1-2*c;return this};CanvasMatrix4.prototype.rotateZ=function(a){a*=0.5;var d=this.sin(a),a=this.cos(a),c=d*d;this.m11=1-2*c;this.m12=2*d*a;this.m21=-2*d*a;this.m22=1-2*c;return this};
CanvasMatrix4.prototype.rotate=function(a,d,c,e){a/=2;var g=Math.sin(a),a=Math.cos(a),f=g*g,b=Math.sqrt(d*d+c*c+e*e);b==0?(c=d=0,e=1):b!=1&&(d/=b,c/=b,e/=b);b=new CanvasMatrix4;if(d==1&&c==0&&e==0)b.m11=1,b.m12=0,b.m13=0,b.m21=0,b.m22=1-2*f,b.m23=2*g*a,b.m31=0,b.m32=-2*g*a,b.m33=1-2*f;else if(d==0&&c==1&&e==0)b.m11=1-2*f,b.m12=0,b.m13=-2*g*a,b.m21=0,b.m22=1,b.m23=0,b.m31=2*g*a,b.m32=0,b.m33=1-2*f;else if(d==0&&c==0&&e==1)b.m11=1-2*f,b.m12=2*g*a,b.m13=0,b.m21=-2*g*a,b.m22=1-2*f,b.m23=0,b.m31=0,b.m32=
0,b.m33=1;else{var k=d*d,l=c*c,h=e*e;b.m11=1-2*(l+h)*f;b.m12=2*(d*c*f+e*g*a);b.m13=2*(d*e*f-c*g*a);b.m21=2*(c*d*f-e*g*a);b.m22=1-2*(h+k)*f;b.m23=2*(c*e*f+d*g*a);b.m31=2*(e*d*f+c*g*a);b.m32=2*(e*c*f-d*g*a);b.m33=1-2*(k+l)*f}b.m14=b.m24=b.m34=0;b.m41=b.m42=b.m43=0;b.m44=1;this.multRight(b)};
CanvasMatrix4.prototype.multRight=function(a){var d=this.m11*a.m12+this.m12*a.m22+this.m13*a.m32+this.m14*a.m42,c=this.m11*a.m13+this.m12*a.m23+this.m13*a.m33+this.m14*a.m43,e=this.m11*a.m14+this.m12*a.m24+this.m13*a.m34+this.m14*a.m44,g=this.m21*a.m11+this.m22*a.m21+this.m23*a.m31+this.m24*a.m41,f=this.m21*a.m12+this.m22*a.m22+this.m23*a.m32+this.m24*a.m42,b=this.m21*a.m13+this.m22*a.m23+this.m23*a.m33+this.m24*a.m43,k=this.m21*a.m14+this.m22*a.m24+this.m23*a.m34+this.m24*a.m44,l=this.m31*a.m11+
this.m32*a.m21+this.m33*a.m31+this.m34*a.m41,h=this.m31*a.m12+this.m32*a.m22+this.m33*a.m32+this.m34*a.m42,n=this.m31*a.m13+this.m32*a.m23+this.m33*a.m33+this.m34*a.m43,o=this.m31*a.m14+this.m32*a.m24+this.m33*a.m34+this.m34*a.m44,m=this.m41*a.m11+this.m42*a.m21+this.m43*a.m31+this.m44*a.m41,j=this.m41*a.m12+this.m42*a.m22+this.m43*a.m32+this.m44*a.m42,q=this.m41*a.m13+this.m42*a.m23+this.m43*a.m33+this.m44*a.m43,p=this.m41*a.m14+this.m42*a.m24+this.m43*a.m34+this.m44*a.m44;this.m11=this.m11*a.m11+
this.m12*a.m21+this.m13*a.m31+this.m14*a.m41;this.m12=d;this.m13=c;this.m14=e;this.m21=g;this.m22=f;this.m23=b;this.m24=k;this.m31=l;this.m32=h;this.m33=n;this.m34=o;this.m41=m;this.m42=j;this.m43=q;this.m44=p};
CanvasMatrix4.prototype.multLeft=function(a){var d=this.m11,c=this.m12,e=this.m13,g=this.m14,f=this.m21,b=this.m22,k=this.m23,l=this.m24,h=this.m31,n=this.m32,o=this.m33,m=this.m34,j=this.m41,q=this.m42,p=this.m43,w=this.m44,x=a.m11,t=a.m12,r=a.m13,u=a.m14,i=a.m21,v=a.m22,A=a.m23,B=a.m24,z=a.m31,C=a.m32,D=a.m33,y=a.m34,s=a.m41,E=a.m42,F=a.m43,a=a.m44;this.m11=x*d+t*f+r*h+u*j;this.m12=x*c+t*b+r*n+u*q;this.m13=x*e+t*k+r*o+u*p;this.m14=x*g+t*l+r*m+u*w;this.m21=i*d+v*f+A*h+B*j;this.m22=i*c+v*b+A*n+B*
q;this.m23=i*e+v*k+A*o+B*p;this.m24=i*g+v*l+A*m+B*w;this.m31=z*d+C*f+D*h+y*j;this.m32=z*c+C*b+D*n+y*q;this.m33=z*e+C*k+D*o+y*p;this.m34=z*g+C*l+D*m+y*w;this.m41=s*d+E*f+F*h+a*j;this.m42=s*c+E*b+F*n+a*q;this.m43=s*e+E*k+F*o+a*p;this.m44=s*g+E*l+F*m+a*w;return this};
CanvasMatrix4.prototype.ortho=function(a,d,c,e,g,f){var b=(a+d)/(a-d),k=(e+c)/(e-c),l=(f+g)/(f-g),h=new CanvasMatrix4;h.m11=2/(a-d);h.m12=0;h.m13=0;h.m14=0;h.m21=0;h.m22=2/(e-c);h.m23=0;h.m24=0;h.m31=0;h.m32=0;h.m33=-2/(f-g);h.m34=0;h.m41=b;h.m42=k;h.m43=l;h.m44=1;this.multRight(h)};
CanvasMatrix4.prototype.frustum=function(a,d,c,e,g,f){var b=new CanvasMatrix4;b.m11=2*g/(d-a);b.m12=0;b.m13=0;b.m14=0;b.m21=0;b.m22=2*g/(e-c);b.m23=0;b.m24=0;b.m31=(d+a)/(d-a);b.m32=(e+c)/(e-c);b.m33=-(f+g)/(f-g);b.m34=-1;b.m41=0;b.m42=0;b.m43=-(2*f*g)/(f-g);b.m44=0;this.multRight(b)};CanvasMatrix4.prototype.perspective=function(a,d,c,e){var a=Math.tan(a*Math.PI/360)*c,g=-a;this.frustum(d*g,d*a,g,a,c,e)};
CanvasMatrix4.prototype.lookat=function(a,d,c,e,g,f,b,k,l){var h=new CanvasMatrix4,e=a-e,g=d-g,f=c-f,n=Math.sqrt(e*e+g*g+f*f);n&&(e/=n,g/=n,f/=n);var o=k*f-l*g,m=-b*f+l*e,j=b*g-k*e,k=-e*j+f*o,b=e*m-g*o;if(n=Math.sqrt(o*o+m*m+j*j))o/=n,m/=n,j/=n;if(n=Math.sqrt(b*b+k*k+l*l))b/=n,k/=n,l/=n;h.m11=o;h.m12=m;h.m13=j;h.m14=0;h.m21=b;h.m22=k;h.m23=l;h.m24=0;h.m31=e;h.m32=g;h.m33=f;h.m34=0;h.m41=0;h.m42=0;h.m43=0;h.m44=1;h.translate(-a,-d,-c);this.multRight(h)};
CanvasMatrix4.prototype._determinant2x2=function(a,d,c,e){return a*e-d*c};CanvasMatrix4.prototype._determinant3x3=function(a,d,c,e,g,f,b,k,l){return a*this._determinant2x2(g,f,k,l)-e*this._determinant2x2(d,c,k,l)+b*this._determinant2x2(d,c,g,f)};
CanvasMatrix4.prototype._determinant4x4=function(){var a=this.m12,d=this.m13,c=this.m14,e=this.m21,g=this.m22,f=this.m23,b=this.m24,k=this.m31,l=this.m32,h=this.m33,n=this.m34,o=this.m41,m=this.m42,j=this.m43,q=this.m44;return this.m11*this._determinant3x3(g,l,m,f,h,j,b,n,q)-a*this._determinant3x3(e,k,o,f,h,j,b,n,q)+d*this._determinant3x3(e,k,o,g,l,m,b,n,q)-c*this._determinant3x3(e,k,o,g,l,m,f,h,j)};
CanvasMatrix4.prototype._makeAdjoint=function(){var a=this.m11,d=this.m12,c=this.m13,e=this.m14,g=this.m21,f=this.m22,b=this.m23,k=this.m24,l=this.m31,h=this.m32,n=this.m33,o=this.m34,m=this.m41,j=this.m42,q=this.m43,p=this.m44;this.m11=this._determinant3x3(f,h,j,b,n,q,k,o,p);this.m21=-this._determinant3x3(g,l,m,b,n,q,k,o,p);this.m31=this._determinant3x3(g,l,m,f,h,j,k,o,p);this.m41=-this._determinant3x3(g,l,m,f,h,j,b,n,q);this.m12=-this._determinant3x3(d,h,j,c,n,q,e,o,p);this.m22=this._determinant3x3(a,
l,m,c,n,q,e,o,p);this.m32=-this._determinant3x3(a,l,m,d,h,j,e,o,p);this.m42=this._determinant3x3(a,l,m,d,h,j,c,n,q);this.m13=this._determinant3x3(d,f,j,c,b,q,e,k,p);this.m23=-this._determinant3x3(a,g,m,c,b,q,e,k,p);this.m33=this._determinant3x3(a,g,m,d,f,j,e,k,p);this.m43=-this._determinant3x3(a,g,m,d,f,j,c,b,q);this.m14=-this._determinant3x3(d,f,h,c,b,n,e,k,o);this.m24=this._determinant3x3(a,g,l,c,b,n,e,k,o);this.m34=-this._determinant3x3(a,g,l,d,f,h,e,k,o);this.m44=this._determinant3x3(a,g,l,d,
f,h,c,b,n)};
WebGLDebugUtils=function(){function a(a){if(b==null){b={};for(var d in a)typeof a[d]=="number"&&(b[a[d]]=d)}}function d(){if(b==null)throw"WebGLDebugUtils.init(ctx) not called";}function c(a){d();var c=b[a];return c!==void 0?c:"*UNKNOWN WebGL ENUM (0x"+a.toString(16)+")"}function e(a,b,d){a=f[a];if(a!==void 0&&a[b])return c(d);return d.toString()}function g(a){var b=a.getParameter(a.MAX_VERTEX_ATTRIBS),d=a.createBuffer();a.bindBuffer(a.ARRAY_BUFFER,d);for(var c=0;c<b;++c)a.disableVertexAttribArray(c),a.vertexAttribPointer(c,
4,a.FLOAT,!1,0,0),a.vertexAttrib1f(c,0);a.deleteBuffer(d);b=a.getParameter(a.MAX_TEXTURE_IMAGE_UNITS);for(c=0;c<b;++c)a.activeTexture(a.TEXTURE0+c),a.bindTexture(a.TEXTURE_CUBE_MAP,null),a.bindTexture(a.TEXTURE_2D,null);a.activeTexture(a.TEXTURE0);a.useProgram(null);a.bindBuffer(a.ARRAY_BUFFER,null);a.bindBuffer(a.ELEMENT_ARRAY_BUFFER,null);a.bindFramebuffer(a.FRAMEBUFFER,null);a.bindRenderbuffer(a.RENDERBUFFER,null);a.disable(a.BLEND);a.disable(a.CULL_FACE);a.disable(a.DEPTH_TEST);a.disable(a.DITHER);
a.disable(a.SCISSOR_TEST);a.blendColor(0,0,0,0);a.blendEquation(a.FUNC_ADD);a.blendFunc(a.ONE,a.ZERO);a.clearColor(0,0,0,0);a.clearDepth(1);a.clearStencil(-1);a.colorMask(!0,!0,!0,!0);a.cullFace(a.BACK);a.depthFunc(a.LESS);a.depthMask(!0);a.depthRange(0,1);a.frontFace(a.CCW);a.hint(a.GENERATE_MIPMAP_HINT,a.DONT_CARE);a.lineWidth(1);a.pixelStorei(a.PACK_ALIGNMENT,4);a.pixelStorei(a.UNPACK_ALIGNMENT,4);a.pixelStorei(a.UNPACK_FLIP_Y_WEBGL,!1);a.pixelStorei(a.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1);a.UNPACK_COLORSPACE_CONVERSION_WEBGL&&
a.pixelStorei(a.UNPACK_COLORSPACE_CONVERSION_WEBGL,a.BROWSER_DEFAULT_WEBGL);a.polygonOffset(0,0);a.sampleCoverage(1,!1);a.scissor(0,0,a.canvas.width,a.canvas.height);a.stencilFunc(a.ALWAYS,0,4294967295);a.stencilMask(4294967295);a.stencilOp(a.KEEP,a.KEEP,a.KEEP);a.viewport(0,0,a.canvas.clientWidth,a.canvas.clientHeight);for(a.clear(a.COLOR_BUFFER_BIT|a.DEPTH_BUFFER_BIT|a.STENCIL_BUFFER_BIT);a.getError(););}var f={enable:{0:!0},disable:{0:!0},getParameter:{0:!0},drawArrays:{0:!0},drawElements:{0:!0,
2:!0},createShader:{0:!0},getShaderParameter:{1:!0},getProgramParameter:{1:!0},getVertexAttrib:{1:!0},vertexAttribPointer:{2:!0},bindTexture:{0:!0},activeTexture:{0:!0},getTexParameter:{0:!0,1:!0},texParameterf:{0:!0,1:!0},texParameteri:{0:!0,1:!0,2:!0},texImage2D:{0:!0,2:!0,6:!0,7:!0},texSubImage2D:{0:!0,6:!0,7:!0},copyTexImage2D:{0:!0,2:!0},copyTexSubImage2D:{0:!0},generateMipmap:{0:!0},bindBuffer:{0:!0},bufferData:{0:!0,2:!0},bufferSubData:{0:!0},getBufferParameter:{0:!0,1:!0},pixelStorei:{0:!0,
1:!0},readPixels:{4:!0,5:!0},bindRenderbuffer:{0:!0},bindFramebuffer:{0:!0},checkFramebufferStatus:{0:!0},framebufferRenderbuffer:{0:!0,1:!0,2:!0},framebufferTexture2D:{0:!0,1:!0,2:!0},getFramebufferAttachmentParameter:{0:!0,1:!0,2:!0},getRenderbufferParameter:{0:!0,1:!0},renderbufferStorage:{0:!0,1:!0},clear:{0:!0},depthFunc:{0:!0},blendFunc:{0:!0,1:!0},blendFuncSeparate:{0:!0,1:!0,2:!0,3:!0},blendEquation:{0:!0},blendEquationSeparate:{0:!0,1:!0},stencilFunc:{0:!0},stencilFuncSeparate:{0:!0,1:!0},
stencilMaskSeparate:{0:!0},stencilOp:{0:!0,1:!0,2:!0},stencilOpSeparate:{0:!0,1:!0,2:!0,3:!0},cullFace:{0:!0},frontFace:{0:!0}},b=null;return{init:a,mightBeEnum:function(a){d();return b[a]!==void 0},glEnumToString:c,glFunctionArgToString:e,makeDebugContext:function(b,d){function g(a,b){return function(){var c=a[b].apply(a,arguments),e=a.getError();e!=0&&(f[e]=!0,d(e,b,arguments));return c}}a(b);var d=d||function(a,b,d){for(var g="",h=0;h<d.length;++h)g+=(h==0?"":", ")+e(b,h,d[h]);a=a+" WebGL error "+
c(a)+" in "+b+"("+g+")";window.console&&window.console.log&&window.console.log(a)},f={},o={},m;for(m in b)o[m]=typeof b[m]=="function"?g(b,m):b[m];o.getError=function(){for(var a in f)if(f[a])return f[a]=!1,a;return b.NO_ERROR};return o},makeLostContextSimulatingContext:function(a){function b(){for(var a=Object.keys(t),i=0;i<a.length;++i)delete glErrorShdow_[a]}function d(a,i){var b=a[i];return function(){if(!j){var i;a:{i=arguments;for(var d=0;d<i.length;++d){var e=i[d];if(e instanceof WebGLBuffer||
e instanceof WebGLFramebuffer||e instanceof WebGLProgram||e instanceof WebGLRenderbuffer||e instanceof WebGLShader||e instanceof WebGLTexture){i=e.__webglDebugContextLostId__==f;break a}}i=!0}if(i)return b.apply(a,arguments);else t[a.INVALID_OPERATION]=!0}}}function c(a){return typeof a=="function"?a:function(i){a.handleEvent(i)}}var e={},f=1,j=!1,q=[],p=void 0,w=void 0,x=void 0,t={},r;for(r in a)e[r]=typeof a[r]=="function"?d(a,r):a[r];e.loseContext=function(){if(!j){j=!0;for(++f;a.getError(););
b();t[a.CONTEXT_LOST_WEBGL]=!0;setTimeout(function(){p&&p({statusMessage:"context lost"})},0)}};e.restoreContext=function(){if(j)if(w)setTimeout(function(){for(var i=0;i<q.length;++i){var b=q[i];b instanceof WebGLBuffer?a.deleteBuffer(b):b instanceof WebctxFramebuffer?a.deleteFramebuffer(b):b instanceof WebctxProgram?a.deleteProgram(b):b instanceof WebctxRenderbuffer?a.deleteRenderbuffer(b):b instanceof WebctxShader?a.deleteShader(b):b instanceof WebctxTexture&&a.deleteTexture(b)}g(a);j=!1;w&&(i=
w,w=x,x=void 0,i({statusMessage:"context restored"}))},0);else throw"You can not restore the context without a listener";};e.getError=function(){if(!j)for(var i;i=a.getError();)t[i]=!0;for(i in t)if(t[i])return delete t[i],i;return a.NO_ERROR};var u=["createBuffer","createFramebuffer","createProgram","createRenderbuffer","createShader","createTexture"];for(r=0;r<u.length;++r){var i=u[r];e[i]=function(i){return function(){if(j)return null;var b=i.apply(a,arguments);b.__webglDebugContextLostId__=f;
q.push(b);return b}}(a[i])}u=["getActiveAttrib","getActiveUniform","getBufferParameter","getContextAttributes","getAttachedShaders","getFramebufferAttachmentParameter","getParameter","getProgramParameter","getProgramInfoLog","getRenderbufferParameter","getShaderParameter","getShaderInfoLog","getShaderSource","getTexParameter","getUniform","getUniformLocation","getVertexAttrib"];for(r=0;r<u.length;++r)i=u[r],e[i]=function(i){return function(){if(j)return null;return i.apply(a,arguments)}}(e[i]);u=
["isBuffer","isEnabled","isFramebuffer","isProgram","isRenderbuffer","isShader","isTexture"];for(r=0;r<u.length;++r)i=u[r],e[i]=function(i){return function(){if(j)return!1;return i.apply(a,arguments)}}(e[i]);e.checkFramebufferStatus=function(i){return function(){if(j)return a.FRAMEBUFFER_UNSUPPORTED;return i.apply(a,arguments)}}(e.checkFramebufferStatus);e.getAttribLocation=function(i){return function(){if(j)return-1;return i.apply(a,arguments)}}(e.getAttribLocation);e.getVertexAttribOffset=function(i){return function(){if(j)return 0;
return i.apply(a,arguments)}}(e.getVertexAttribOffset);e.isContextLost=function(){return j};e.registerOnContextLostListener=function(a){p=c(a)};e.registerOnContextRestoredListener=function(a){j?x=c(a):w=c(a)};return e},resetToInitialState:g}}();Framerate=function(a){this.numFramerates=10;this.framerateUpdateInterval=500;this.callback=a;this.renderTime=-1;this.framerates=[];var d=this;setInterval(function(){d.updateFramerate()},this.framerateUpdateInterval)};
Framerate.prototype.updateFramerate=function(){for(var a=0,d=0;d<this.framerates.length;++d)a+=this.framerates[d];a/=this.framerates.length;a=Math.round(a);this.callback&&this.callback("Framerate:"+a+"fps")};Framerate.prototype.snapshot=function(){if(this.renderTime<0)this.renderTime=(new Date).getTime();else{var a=(new Date).getTime();for(this.framerates.push(1E3/(a-this.renderTime));this.framerates.length>this.numFramerates;)this.framerates.shift();this.renderTime=a}};
var j5=function(){var a,d,c=function(){var a=CanvasMatrix4;return function(){var b=new a;b.lookat(0,0,5,0,0,0,0,1,0);b.perspective(45,p.width/p.height,1,1E3);return b.getAsWebGLFloatArray()}}(),e=function(a,b){return function(){function d(a,i){var c=b.getElementById(i);if(!c)return null;for(var e="",g=c.firstChild;g;)g.nodeType===3&&(e+=g.textContent),g=g.nextSibling;if(c.type==="x-shader/x-fragment")c=a.createShader(a.FRAGMENT_SHADER);else if(c.type==="x-shader/x-vertex")c=a.createShader(a.VERTEX_SHADER);
else return null;a.shaderSource(c,e);a.compileShader(c);if(!a.getShaderParameter(c,a.COMPILE_STATUS))return console.error("Error compiling shader\n",a.getShaderInfoLog(c)),null;return c}function e(b,c){var b=b||"vBasic",c=c||"fAlphaTexture",g=b+"+"+c;if(s[g])return s[g];var h=d(a,c),z=d(a,b);if(!h||!z)return console.error("missing shader "+g),null;var v=a.createProgram();a.attachShader(v,z);a.attachShader(v,h);a.linkProgram(v);if(!a.getProgramParameter(v,a.LINK_STATUS))return console.error("LINK_STATUS error"),
null;h={program:v,meta:j(v)};v={program:v,meta:j(v)};s[g]=v;f||(f=h);return h}var c={},g=function(b){switch(b){case a.FLOAT_MAT4:return 16;case a.FLOAT_MAT3:return 9;case a.FLOAT_MAT2:return 4;case a.FLOAT_VEC4:case a.INT_VEC4:case a.BOOL_VEC4:return 4;case a.FLOAT_VEC3:case a.INT_VEC3:case a.BOOL_VEC3:return 3;case a.FLOAT_VEC2:case a.INT_VEC2:case a.BOOL_VEC2:return 2;default:return 1}},h=function(b){switch(b){case a.FLOAT_MAT4:case a.FLOAT_MAT3:case a.FLOAT_MAT2:case a.FLOAT_VEC4:case a.FLOAT_VEC2:case a.FLOAT_VEC3:return a.FLOAT;
case a.INT_VEC4:case a.INT_VEC3:case a.INT_VEC2:return a.INT;case a.BOOL_VEC4:case a.BOOL_VEC3:case a.BOOL_VEC2:return a.BOOL;default:return b}};c[a.FIXED]=a.uniform1i;c[a.SHORT]=a.uniform1i;c[a.UNSIGNED_BYTE]=a.uniform1i;c[a.BYTE]=a.uniform1i;c[a.INT]=a.uniform1i;c[a.UNSIGNED_INT]=a.uniform1i;c[a.FLOAT]=a.uniform1f;c[a.SAMPLER_2D]=a.uniform1i;c[a.FLOAT_MAT4]=a.uniformMatrix4fv;c[a.FLOAT_MAT3]=a.uniformMatrix3fv;c[a.FLOAT_MAT2]=a.uniformMatrix2fv;c[a.FLOAT_VEC2]=a.uniform2fv;c[a.FLOAT_VEC3]=a.uniform3fv;
c[a.FLOAT_VEC4]=a.uniform4fv;c[a.INT_VEC2]=a.uniform2iv;c[a.INT_VEC3]=a.uniform3iv;c[a.INT_VEC4]=a.uniform4iv;c[a.BOOL]=a.uniform1i;c[a.BOOL_VEC2]=a.uniform2iv;c[a.BOOL_VEC3]=a.uniform3iv;c[a.BOOL_VEC4]=a.uniform4iv;var f=null,s={},j=function(b){var d={uniforms:[],uniform:{},attribute:{}},e=[],f;for(f in a)e.push(f);var e=e.sort(),v={};e.forEach(function(b){v[a[b]]=b});f=0;for(var s=a.getProgramParameter(b,a.ACTIVE_UNIFORMS),j;f<s;){e=a.getActiveUniform(b,f);j=a.getUniformLocation(b,e.name);d.uniforms.push(e.name);
var A=d.uniform,k=e.name,l=e.name,B=e.type,m=v[e.type],n=e.type===a.SAMPLER_2D,y;a:switch(e.type){case a.FLOAT_MAT4:case a.FLOAT_MAT3:case a.FLOAT_MAT2:y=!0;break a;default:y=!1}A[k]={name:l,glType:B,type:m,isTexture:n,isMatrixType:y,length:g(e.type),idx:f,location:j,setter:c[e.type],locVal:[j,!1]};f++}s=a.getProgramParameter(b,a.ACTIVE_ATTRIBUTES);for(f=0;f<s;)e=a.getActiveAttrib(b,f),d.attribute[e.name]={name:e.name,glType:e.type,glBaseType:h(e.type),type:v[e.type],length:g(e.type),idx:f,location:a.getAttribLocation(b,
e.name)},f++;return d};return function(a,b){var i=e(a,b)||f,c={alpha:1},d={};i.meta.uniforms.forEach(function(a){var b=i.meta.uniform[a],e=b.length,a=b.name;Object.defineProperty(d,"$"+b.name,{get:function(){return c[a]},set:function(b){if(b&&b.length!==e)b.length=e;c[a]=b}})});d.setAttribute=function(a,b,c,e){if(b=i.meta.attribute[b])a.enableVertexAttribArray(b.location),a.vertexAttribPointer(b.location,b.length,b.glBaseType,!1,c,e)};d.update=function(a){var b=i.meta,e=b.uniform,b=b.uniforms,d,g,
f=b.length;a.currentShaderProgram=i;a.useProgram(i.program);for(var h=0;f--;)d=b[f],g=c[d],d=e[d],g!==void 0&&g!==null&&(d.isTexture?(a.activeTexture(a["TEXTURE"+h]),a.bindTexture(a.TEXTURE_2D,g),d.locVal[1]=h++):d.isMatrixType?d.locVal[2]=g:d.locVal[1]=g,d.setter.apply(a,d.locVal))};d.$getShaderProgram=function(){return i.program};return d}}(a)},g=function(a,b,d,c){var e=a.createBuffer();a.bindBuffer(b,e);a.bufferData(b,d,a.STATIC_DRAW);e.itemSize=c;e.numItems=d.length/c;return e},f=function(a,e,
d){var c=a.createTexture();c.image=new Image;c.image.onload=function(){b(a,c,c.image);d&&d(c);d=null;c.image.src="data:image/png;,"};c.image.src=e},b=function(a,b,c){a.bindTexture(a.TEXTURE_2D,b);a.pixelStorei(a.UNPACK_FLIP_Y_WEBGL,!0);a.texImage2D(a.TEXTURE_2D,0,a.RGBA,a.RGBA,a.UNSIGNED_BYTE,c);c=null;a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MAG_FILTER,a.LINEAR);a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MIN_FILTER,a.LINEAR_MIPMAP_NEAREST);a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_S,a.CLAMP_TO_EDGE);
a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_T,a.CLAMP_TO_EDGE);a.generateMipmap(a.TEXTURE_2D);b.destory=function(){a.deleteTexture(b);c=b=null};a.bindTexture(a.TEXTURE_2D,null);return b},k={},l=0,h=0,n=function(a){l=(a.offsetX||a.pageX)/p.width;h=(a.offsetY||a.pageY)/p.height;w&&w(l,h)},o=function(a,b,c,d,e){for(var g=b.length,e=e||0,f=0,h=[0,0,0,1],s=[];e<g;e+=d){for(f=0;f<c;f++)h[f]=b[e+f];a.multVector(h,s);for(f=0;f<c;f++)b[e+f]=s[f]}return b},m=function(b,c,e,d){var f=new CanvasMatrix4,b=q(b,
c,e,d),h=[],j=[],c=function(a,b,c){h=h.concat(o(b,a.vertices.concat(),3,5,0));j=j.concat(a.indices.map(function(a){return c*4+a}))};c(b,f,0);f.translate(0,0,-1);c(b,f,1);f.makeIdentity();f.rotate(Math.PI*0.5,0,1,0);c(b,f,2);f.makeIdentity();f.rotate(Math.PI*0.5,-1,0,0);c(b,f,3);f.makeIdentity();f.rotate(Math.PI*0.5,0,1,0);f.translate(1,0,0);c(b,f,4);f.makeIdentity();f.rotate(Math.PI*0.5,-1,0,0);f.translate(0,1,0);c(b,f,5);return{vertices:g(a,a.ARRAY_BUFFER,new Float32Array(h),5),indices:g(a,a.ELEMENT_ARRAY_BUFFER,
new Uint16Array(j),1),size:j.length}},j=function(b,c,e,d){b=q(b,c,e,d);return{vertices:g(a,a.ARRAY_BUFFER,new Float32Array(b.vertices),5),indices:g(a,a.ELEMENT_ARRAY_BUFFER,new Uint16Array(b.indices),1),size:b.indices.length}},q=function(a,b,c,e){var d,f,g=[],h=[],s=[],j=s.size=0;for(f=0;f<a+1;f++){g[f]=[];for(d=0;d<b+1;d++)g[f][d]=s.size,s[j++]=f*c,s[j++]=d*e,s[j++]=0,s[j++]=f/a,s[j++]=d/b,s.size++}var c=0,k,l;for(f=0;f<a;f++)for(d=0;d<b;d++)e=g[f][d],j=g[f+1][d],k=g[f][d+1],l=g[f+1][d+1],h[c+0]=
e,h[c+1]=j,h[c+2]=l,h[c+3]=e,h[c+4]=l,h[c+5]=k,c+=6;return{vertices:s,indices:h}},p,w,x,t={onMouseMove:function(a){w=a},offset:function(){var a=CanvasMatrix4,b=new a,c=new a,d=new a,e=new a,f=new a,g=new a,h=new a;return function(a,i){i?h.load(i):h.makeIdentity();if(a.x||a.y||a.z)b.translateOpt(a.x,a.y,a.z),h.multLeft(b);if(a.originX||a.originY||a.originX)g.translateOpt(a.originX,a.originY,a.originZ),h.multLeft(g);if(a.scaleX!==void 0||a.scaleY!==void 0||a.scaleZ!==void 0)c.makeIdentity(),c.scale(a.scaleX===
void 0?1:a.scaleX,a.scaleY===void 0?1:a.scaleY,a.scaleZ===void 0?1:a.scaleZ),h.multLeft(c);a.rotateX&&h.multLeft(d.rotateX(a.rotateX));a.rotateY&&h.multLeft(e.rotateY(a.rotateY));a.rotateZ&&h.multLeft(f.rotateZ(a.rotateZ));if(a.originX||a.originY||a.originX)g.translateOpt(-a.originX,-a.originY,-a.originZ),h.multLeft(g);return h.getAsWebGLFloatArray()}}(),camera:c,attachCanvas:function(b){p=b;var f,g=["webgl","experimental-webgl","moz-webgl","webkit-3d"],h;for(h=0;g.length>h;h++)try{if(f=b.getContext(g[h]))break}catch(j){}!f&&
console.error("Could not initialise WebGL");b=a=f;b.viewport(0,0,p.width,p.height);x=c();b.clearColor(0,0,0,1);b.enable(b.DEPTH_TEST);b.enable(b.BLEND);b.blendFuncSeparate(b.SRC_ALPHA,b.ONE_MINUS_SRC_ALPHA,b.SRC_ALPHA,b.ONE);b.clear(b.COLOR_BUFFER_BIT);b.clear(b.DEPTH_BUFFER_BIT);d=e(a,document);p.addEventListener("mousemove",n,!1);t.gl=a},texture:function(b,c){f(a,b,c)},shader:function(){return d()},quad:function(b,c,d,e,f){var e=f=f||1,d=d||1,c=c||1,b="quad,"+[c,d,e,f],g=k[b]=k[b]||j(c,d,e,f);return{draw:function(b,
c,d){if(c)b.$uMVMatrix=c;b.$uPMatrix=d||x;a.bindBuffer(a.ELEMENT_ARRAY_BUFFER,g.indices);a.bindBuffer(a.ARRAY_BUFFER,g.vertices);b.setAttribute(a,"aTextureCoord",20,12);b.setAttribute(a,"aVertexPosition",20,0);b.update(a,c);a.drawElements(a.TRIANGLES,g.size,a.UNSIGNED_SHORT,0)}}},cube:function(b,c,d,e,f){var e=f=f||1,d=d||1,c=c||1,b="quad,"+[c,d,e,f],g=k[b]=k[b]||m(c,d,e,f);return{draw:function(b,c,d){if(c)b.$uMVMatrix=c;b.$uPMatrix=d||x;a.bindBuffer(a.ELEMENT_ARRAY_BUFFER,g.indices);a.bindBuffer(a.ARRAY_BUFFER,
g.vertices);b.setAttribute(a,"aTextureCoord",20,12);b.setAttribute(a,"aVertexPosition",20,0);b.update(a,c);a.drawElements(a.TRIANGLES,g.size,a.UNSIGNED_SHORT,0)}}}},r=function(){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(a){setTimeout(a,16.66666666)}}();t.requestAnimationFrame=function(b){aa=r;r(function(){a.clear(a.COLOR_BUFFER_BIT|a.DEPTH_BUFFER_BIT);b();u&&u.snapshot()},
p)};Object.defineProperty(t,"mouseX",{get:function(){return l}});Object.defineProperty(t,"mouseY",{get:function(){return h}});var u;t.onFramerate=function(a){u?u.callback=a:u=new Framerate(a)};return t}();
function init(){j5.attachCanvas(document.getElementById("webglcanvas"));var a=j5.cube().draw,d=j5.shader(),c,e=0,g=2.34,f=0,b=0,k=0,l=Math.PI,h=Math.PI*0.5,n=Math.sin,o=Math.sin,m=0;j5.onFramerate(function(a){window.status=a});j5.onMouseMove(function(a,c){f=a;b=c});j5.texture("colortiles.png",function(a){d.$texture=a});j5.requestAnimationFrame(function q(){k+=(f-k)/10;m=n(k*5);e+=0.051*b*b*b;g+=0.044*b*b*b;c=j5.offset({x:n(e),y:o(e),rotateX:g,z:n(g*2)*5,rotateY:g*1.01});a(d,c);a(d,j5.offset({rotateX:-l+
m*h},c));a(d,j5.offset({rotateY:-l+m*h},c));a(d,j5.offset({z:-1,rotateY:h+m*h},c));a(d,j5.offset({x:1,originY:1,rotateZ:h+m*h},c));j5.requestAnimationFrame(q)})}window.addEventListener("load",init,!1);