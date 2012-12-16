J5.JS
===

J5.JS is a thin tinker box abstraction around WebGL.  This lib takes an immediate-mode approach vs other libs such as three.js.

Here's an abridged example.  For full working examples, please see experiments dir.

    var drawCube = j5.cube().draw;
    var texShader = j5.shader();

    j5.texture("colortiles.png", function(txt) {
        texShader.$texture = txt;
    });

    j5.requestAnimationFrame(function onFrame() {

        xx += (mx-xx)/10
        p = sin(xx*5);
        i+=.051*my*my*my;
        x+=.044*my*my*my;
    
        container = j5.offset({
            x:sin(i),
            y:cos(i),
            rotateX:x,
            z:sin(x*2)*2,
            rotateY:x*1.01
        });
    
        drawCube(texShader, container);
        drawCube(texShader, j5.offset({rotateX:-pi90+p*pi45}, container));
        drawCube(texShader, j5.offset({rotateY:-pi90+p*pi45}, container));
        drawCube(texShader, j5.offset({z:-1, rotateY:pi45+p*pi45}, container))
        drawCube(texShader, j5.offset({x:1, originY:1, rotateZ:pi45+p*pi45}, container));
        
        j5.requestAnimationFrame(onFrame);
    
    });

Experiment
===
<http://abustin.github.com/j5-js/>

Project Status
===

Development has halted; Archived on github.

Experiments do work.
