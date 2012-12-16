

(function() {
    
    var PI_3div4 = 3 * Math.PI / 4;
    var PI_2 = Math.PI / 2;
    var EPSILON = 1e-12;
    var kAlpha = 0.3;

    var Orientation = { CW: 1, CCW: -1, COLLINEAR: 0 };
    
    var Orient2d = function(pa, pb, pc) {
        var detleft = (pa.x - pc.x) * (pb.y - pc.y);
        var detright = (pa.y - pc.y) * (pb.x - pc.x);
        var val = detleft - detright;
        if (val > -EPSILON && val < EPSILON) {
            return Orientation.COLLINEAR;
        } else if (val > 0) {
            return Orientation.CCW;
        } else {
            return Orientation.CW;
        }
    };

    var InScanArea = function(pa, pb, pc, pd) {
        var pdx = pd.x;
        var pdy = pd.y;
        var adx = pa.x - pdx;
        var ady = pa.y - pdy;
        var bdx = pb.x - pdx;
        var bdy = pb.y - pdy;

        var adxbdy = adx * bdy;
        var bdxady = bdx * ady;
        var oabd = adxbdy - bdxady;

        if (oabd <= EPSILON) {
            return false;
        }

        var cdx = pc.x - pdx;
        var cdy = pc.y - pdy;

        var cdxady = cdx * ady;
        var adxcdy = adx * cdy;
        var ocad = cdxady - adxcdy;

        if (ocad <= EPSILON) {
            return false;
        }

        return true;
    };
    
    
    
    var createNode = function(point, triangle) {        
        return {
            point: point,
            triangle: triangle||null,
            next:null,
            prev:null,
            value: point.x
        };
    };
    
    
    var AdvancingFront = function(head, tail) {

        var search_node = head;

        var self = {

            //head:head,
            //tail:tail,
            //search_node:head,

            head:function() {
                return head;
            },
            FindSearchNode: function() {
                return search_node;
            },
            LocateNode: function(x) {
                
                var node = search_node;
                //////////console.log(node,x)
                if (x < node.value) {
                    while ((node = node.prev) != null) {
                        if (x >= node.value) {
                            search_node = node;
                            return node;
                        }
                    }
                } else {
                    while ((node = node.next) != null) {
                        if (x < node.value) {
                            search_node = node.prev;
                            return node.prev;
                        }
                    }
                }
                return null;
            },
            LocatePoint: function(point) {
                var px = point.x;
                var node = self.FindSearchNode(px);
                var nx = node.point.x;

                if (px == nx) {
                    // We might have two nodes with same x value for a short time
                    if (point == node.prev.point) {
                        node = node.prev;
                    } else if (point == node.next.point) {
                        node = node.next;
                    } else if (point == node.point) {
                        // do nothing
                    } else {
                        //////////console.log('Invalid AdvancingFront.LocatePoint call!');
                        return null;
                    }
                } else if (px < nx) {
                    while ((node = node.prev) != null) {
                        if (point==node.point) {break;}
                    }
                } else {
                    while ((node = node.next) != null) {
                        if (point==node.point) {break;}
                    }
                }

                if (node != null) {search_node = node;}
                return node;
            }





        };

        return self;


    };
    
    var createBasin = function() {
        var self = {};
        var init = function() {
            self.left_node = null; // createNode
            self.bottom_node = null; // createNode
            self.right_node = null; // createNode
            self.width = 0.0; // number
            self.left_highest = false;
            self.Clear = init;
        }
        init();
        return self;
    };
    
    
    
    
    
    var createPoint = function(x,y,id) {
        return {
            id:id,
            x:x||0,
            y:y||0,
            edge_list:[]
        };
    };
    
    var pointSort = function(a,b) {
        if (a.y == b.y) {
            return a.x - b.x;
        } else {
            return a.y - b.y;
        }
    };
    
    
    var createEdge = function(point1,point2) {
        
        var edge;

        // maybe pointSort can do this?
        if (point1.y > point2.y) {
            edge = {q:point1,p:point2};
        } else if (point1.y == point2.y) {
            if (point1.x > point2.x) {
                edge = {q:point1,p:point2};
            } else if (point1.x == point2.x) {
                console.error('Invalid edge constructor call: repeated points!');
            } else {
                edge = {p:point1,q:point2};
            }
        } else {
            edge = {p:point1,q:point2};
        }
        
        
        edge.q.edge_list.push(edge);   
        return edge;
        
    };
    
    
    var createTriangle = function(point1,point2,point3) {
        
        //////////console.log("Triangle",point1,point2,point3)

        var points = [point1,point2,point3];
        var neighbors = [null,null,null];
        var interior = false;
        var constrained_edge = [false,false,false];
        var delaunay_edge = [false, false, false];


        var self = {
            points:points,
            neighbors:neighbors,
            constrained_edge:constrained_edge,
            delaunay_edge:delaunay_edge,
            GetPoint:function(i) {
                return points[i];
            },
            GetPoints:function() {
                return points;
            },
            GetNeighbor: function(i) {
                
                return neighbors[i];
            },
            ContainsP: function(pt1,pt2) {
                
                return (points.indexOf(pt1) !== -1 && points.indexOf(pt2) !== -1);
                
                //var p1 = points[0], p2 = points[1], p3 = points[2];
                //return (pt1==p1 || pt1==p2 || pt1==p3) &&
                //       (pt2==p1 || pt2==p2 || pt2==p3);
            },
            IsInterior: function() {
                if (arguments.length == 0) {
                       return interior;
                   } else {
                       interior = arguments[0];
                       return interior;
                   }
            },
            MarkNeighbor: function(p1,p2,t) {

                var p = points;

                if (t) {
                    if ((p1==p[2] && p2==p[1]) || (p1==p[1] && p2==p[2])) {neighbors[0] = t;}
                    else if ((p1==p[0] && p2==p[2]) || (p1==p[2] && p2==p[0])) {neighbors[1] = t;}
                    else if ((p1==p[0] && p2==p[1]) || (p1==p[1] && p2==p[0])) {neighbors[2] = t;}
                    else {console.error('Invalid Triangle.MarkNeighbor call (1)!');}
                } else if (p1) {
                    // exhaustive search to update neighbor pointers
                    t = p1
                    if (t.ContainsP(p[1], p[2])) {
                        neighbors[0] = t;
                        t.MarkNeighbor(p[1], p[2], self);
                    } else if (t.ContainsP(p[0], p[2])) {
                        neighbors[1] = t;
                        t.MarkNeighbor(p[0], p[2], self);
                    } else if (t.ContainsP(p[0], p[1])) {
                        neighbors[2] = t;
                        t.MarkNeighbor(p[0], p[1], self);
                    }
                } else {
                    console.warn('Invalid Triangle.MarkNeighbor call! (2)');
                }
            },
            ClearNeigbors: function() {
                var n = neighbors;
                n[0] = null;
                n[1] = null;
                n[2] = null;
            },
            ClearDelunayEdges: function() {
                var n = delaunay_edge;
                n[0] = false;
                n[1] = false;
                n[2] = false;
            },
            PointCW: function(p) {
                if (p==points[0]) {
                    return points[2];
                } else if (p==points[1]) {
                    return points[0];
                } else if (p==points[2]) {
                    return points[1];
                } else {
                    return null;
                }
            },
            PointCCW: function(p) {
                if (p==points[0]) {
                    return points[1];
                } else if (p==points[1]) {
                    return points[2];
                } else if (p==points[2]) {
                    return points[0];
                } else {
                    return null;
                }
            },
            NeighborCW: function(p) {
                if (p==points[0]) {
                    return neighbors[1];
                } else if (p==points[1]) {
                    return neighbors[2];
                } else {
                    return neighbors[0];
                }
            },
            NeighborCCW: function(p) {
                if (p==points[0]) {
                    return neighbors[2];
                } else if (p==points[1]) {
                    return neighbors[0];
                } else {
                    return neighbors[1];
                }
            },

            GetConstrainedEdgeCW: function(p) {
                if (p==points[0]) {
                    return constrained_edge[1];
                } else if (p==points[1]) {
                    return constrained_edge[2];
                } else {
                    return constrained_edge[0];
                }
            },

            GetConstrainedEdgeCCW: function(p) {
                if (p==points[0]) {
                    return constrained_edge[2];
                } else if (p==points[1]) {
                    return constrained_edge[0];
                } else {
                    return constrained_edge[1];
                }
            },

            SetConstrainedEdgeCW: function(p, ce) {
                if (p==points[0]) {
                    constrained_edge[1] = ce;
                } else if (p==points[1]) {
                    constrained_edge[2] = ce;
                } else {
                    constrained_edge[0] = ce;
                }
            },

            SetConstrainedEdgeCCW: function(p, ce) {
                if (p==points[0]) {
                    constrained_edge[2] = ce;
                } else if (p==points[1]) {
                    constrained_edge[0] = ce;
                } else {
                    constrained_edge[1] = ce;
                }
            },

            GetDelaunayEdgeCW: function(p) {
                if (p==points[0]) {
                    return delaunay_edge[1];
                } else if (p==points[1]) {
                    return delaunay_edge[2];
                } else {
                    return delaunay_edge[0];
                }
            },

            GetDelaunayEdgeCCW: function(p) {
                if (p==points[0]) {
                    return delaunay_edge[2];
                } else if (p==points[1]) {
                    return delaunay_edge[0];
                } else {
                    return delaunay_edge[1];
                }
            },

            SetDelaunayEdgeCW: function(p, e) {
                if (p==points[0]) {
                    delaunay_edge[1] = e;
                } else if (p==points[1]) {
                    delaunay_edge[2] = e;
                } else {
                    delaunay_edge[0] = e;
                }
            },

            SetDelaunayEdgeCCW: function(p, e) {
                if (p==points[0]) {
                    delaunay_edge[2] = e;
                } else if (p==points[1]) {
                    delaunay_edge[0] = e;
                } else {
                    delaunay_edge[1] = e;
                }
            },

            /**
             * The neighbor across to given point.
             */
            NeighborAcross: function(p) {
                if (p==points[0]) {
                    return neighbors[0];
                } else if (p==points[1]) {
                    return neighbors[1];
                } else {
                    return neighbors[2];
                }
            },

            OppositePoint: function(t, p) {
                var cw = t.PointCW(p);
                return self.PointCW(cw);
            },


            Legalize: function() {
                if (arguments.length == 1) {
                    self.Legalize(points[0], arguments[0]);
                } else if (arguments.length == 2) {
                    var opoint = arguments[0];
                    var npoint = arguments[1];

                    if (opoint==points[0]) {
                        points[1] = points[0];
                        points[0] = points[2];
                        points[2] = npoint;
                    } else if (opoint==points[1]) {
                        points[2] = points[1];
                        points[1] = points[0];
                        points[0] = npoint;
                    } else if (opoint==points[2]) {
                        points[0] = points[2];
                        points[2] = points[1];
                        points[1] = npoint;
                    } else {
                        console.warn('Invalid Triangle.Legalize call!');
                    }
                } else {
                    console.warn('Invalid Triangle.Legalize call!');
                }
            },

            Index: function(p) {
                return points.indexOf(p);
            },

            EdgeIndex: function(p1, p2) {
                if (p1==points[0]) {
                    if (p2==points[1]) {
                        return 2;
                    } else if (p2==points[2]) {
                        return 1;
                    }
                } else if (p1==points[1]) {
                    if (p2==points[2]) {
                        return 0;
                    } else if (p2==points[0]) {
                        return 2;
                    }
                } else if (p1==points[2]) {
                    if (p2==points[0]) {
                        return 1;
                    } else if (p2==points[1]) {
                        return 0;
                    }
                }
                return -1;
            },

            /**
             * Mark an edge of self triangle as constrained.<br>
             * self method takes either 1 parameter (an edge index or an Edge instance) or
             * 2 parameters (two Point instances defining the edge of the triangle).
             */
            MarkConstrainedEdge: function() {
                if (arguments.length == 1) {
                    if (typeof(arguments[0]) == 'number') {
                        self.constrained_edge[arguments[0]] = true;
                    } else {
                        self.MarkConstrainedEdge(arguments[0].p, arguments[0].q);
                    }
                } else if (arguments.length == 2) {
                    var p = arguments[0];
                    var q = arguments[1];
                    if ((q==points[0] && p==points[1]) || (q==points[1] && p==points[0])) {
                        self.constrained_edge[2] = true;
                    } else if ((q==points[0] && p==points[2]) || (q==points[2] && p==points[0])) {
                        self.constrained_edge[1] = true;
                    } else if ((q==points[1] && p==points[2]) || (q==points[2] && p==points[1])) {
                        self.constrained_edge[0] = true;
                    }
                } else {
                    ////console.log('Invalid Triangle.MarkConstrainedEdge call!');
                }
                //////console.log(constrained_edge)
            }



        };

        return self;

    };






    var createSweepContext = function(points) {

        var triangles = [];
        var map = [];
        var edge_list = [];
        var front = null;
        var head = null;
        var tail = null;

        var self = {
            edge_list:edge_list,
            basin:createBasin(),
            edge_event:{
                constrained_edge:null,
                right: false
            },
            AddHole: function(polyline) {
                self.InitEdges(polyline);
                points = points.concat(polyline);
            },
            front: function() {
                return front;
            },
            point_count: function() {
                return points.length;
            },
            head: function() {
                return head;
            },
            tail: function() {
                return tail;
            },
            GetTriangles: function() {
                ////////console.log(front)
                return triangles;
            },
            GetMap: function() {
                return map;
            },
            InitTriangulation: function() {

                var p = points[0], i,l;
                var xmax = p.x;
                var xmin = p.x;
                var ymax = p.y;
                var ymin = p.y;

                // Calculate bounds
                for (i=0,l=points.length; i<l; ++i) {
                    p = points[i];
                    if (p.x > xmax) {xmax = p.x;}
                    if (p.x < xmin) {xmin = p.x;}
                    if (p.y > ymax) {ymax = p.y;}
                    if (p.y < ymin) {ymin = p.y;}
                }

                var dx = kAlpha * (xmax - xmin);
                var dy = kAlpha * (ymax - ymin);
                head = createPoint(xmax + dx, ymin - dy);
                tail = createPoint(xmin - dy, ymin - dy);

                // Sort points along y-axis
                points.sort(pointSort);
            },
            InitEdges: function(polyline) {
                var len = polyline.length,i;
                for (i=0; i < len; ++i) {
                    edge_list.push(createEdge(polyline[i], polyline[(i+1) % len]));
                }
            },
            GetPoint: function(i) {
                return points[i];
            },
            AddToMap: function(triangle) {
                map.push(triangle);
            },
            LocateNode: function(point) {
                //////////console.log("11")
                return front.LocateNode(point.x);
            },
            CreateAdvancingFront: function() {

                // Initial triangle
                var triangle = createTriangle(points[0], tail, head);

                map.push(triangle);

                var headNode = createNode(triangle.GetPoint(1), triangle);
                var middleNode = createNode(triangle.GetPoint(0), triangle);
                var tailNode = createNode(triangle.GetPoint(2));

                front = AdvancingFront(headNode, tailNode);

                headNode.next = middleNode;
                middleNode.next = tailNode;
                middleNode.prev = headNode;
                tailNode.prev = middleNode;
                

            },
            MapTriangleToNodes: function(t) {


                var neighbors = t.neighbors;
                var points = t.points;
                
                if (neighbors[0] == null) {
                    n = front.LocatePoint(t.PointCW(points[0]));
                    if (n != null) {
                        n.triangle = t;
                    }
                }
                if (neighbors[1] == null) {
                    n = front.LocatePoint(t.PointCW(points[1]));
                    if (n != null) {
                        n.triangle = t;
                    }
                }
                if (neighbors[2] == null) {
                    n = front.LocatePoint(t.PointCW(points[2]));
                    if (n != null) {
                        n.triangle = t;
                    }
                }
            },
            MeshClean: function MeshClean(triangle) {
                if (triangle != null && !triangle.IsInterior()) {
                    triangle.IsInterior(true);
                    triangles.push(triangle);
                    
                    var n = triangle.neighbors;
                    var e = triangle.constrained_edge;
                    !e[0] && MeshClean(n[0]);
                    !e[1] && MeshClean(n[1]);
                    !e[2] && MeshClean(n[2]);
                }
            }



        };
        
        
        self.InitEdges(points);
        
        return self;


    };
    
    
    var Triangulate = function(tcx) {
        tcx.InitTriangulation();
        tcx.CreateAdvancingFront();
        // Sweep points; build mesh
        SweepPoints(tcx);
        // Clean up
        FinalizationPolygon(tcx);
    }

    var SweepPoints = function(tcx) {
        for (var i=1; i < tcx.point_count(); ++i) {
            var point = tcx.GetPoint(i);
            var node = PointEvent(tcx, point);
            for (var j=0; j < point.edge_list.length; ++j) {
                //////console.log("~",tcx, point.edge_list[j], node)
                EdgeEvent(tcx, point.edge_list[j], node);
            }
        }
    }

    var FinalizationPolygon = function(tcx) {
        // Get an Internal triangle to start with
        var t = tcx.front().head().next.triangle;
        var p = tcx.front().head().next.point;
        while (!t.GetConstrainedEdgeCW(p)) {
            t = t.NeighborCCW(p);
        }

        // Collect interior triangles constrained by edges
        tcx.MeshClean(t);
    }

    /**
     * Find closes node to the left of the new point and
     * create a new triangle. If needed new holes and basins
     * will be filled to.
     */
    var PointEvent = function(tcx, point) {
        var node = tcx.LocateNode(point);
        var new_node = NewFrontTriangle(tcx, point, node);

        // Only need to check +epsilon since point never have smaller
        // x value than node due to how we fetch nodes from the front
        if (point.x <= node.point.x + (EPSILON)) {
            Fill(tcx, node);
        }

        //tcx.AddNode(new_node);

        FillAdvancingFront(tcx, new_node);
        return new_node;
    }

    var EdgeEvent = function() {
        var tcx;
        //////console.log("1EdgeEvent+",arguments.length)
        if (arguments.length == 3) {
            tcx = arguments[0];
            var edge = arguments[1];
            var node = arguments[2];

            tcx.edge_event.constrained_edge = edge;
            tcx.edge_event.right = (edge.p.x > edge.q.x);

            if (IsEdgeSideOfTriangle(node.triangle, edge.p, edge.q)) {
                return;
            }

            // For now we will do all needed filling
            // TODO: integrate with flip process might give some better performance
            //       but for now this avoid the issue with cases that needs both flips and fills
            FillEdgeEvent(tcx, edge, node);
            EdgeEvent(tcx, edge.p, edge.q, node.triangle, edge.q);
        } else if (arguments.length == 5) {
            tcx = arguments[0];
            var ep = arguments[1];
            var eq = arguments[2];
            var triangle = arguments[3];
            var point = arguments[4];

            if (IsEdgeSideOfTriangle(triangle, ep, eq)) {
                return;
            }

            var p1 = triangle.PointCCW(point);
            var o1 = Orient2d(eq, p1, ep);
            if (o1 == Orientation.COLLINEAR) {
                console.warn('var EdgeEvent: Collinear not supported!');
                return;
            }

            var p2 = triangle.PointCW(point);
            var o2 = Orient2d(eq, p2, ep);
            if (o2 == Orientation.COLLINEAR) {
                console.warn('var EdgeEvent: Collinear not supported!');
                return;
            }
            //////console.log("1-",o1 , o2, o1 == o2)
            if (o1 == o2) {
                // Need to decide if we are rotating CW or CCW to get to a triangle
                // that will cross edge
                if (o1 == Orientation.CW) {
                    triangle = triangle.NeighborCCW(point);
                } else {
                    triangle = triangle.NeighborCW(point);
                }
                EdgeEvent(tcx, ep, eq, triangle, point);
            } else {
                // This triangle crosses constraint so lets flippin start!
                FlipEdgeEvent(tcx, ep, eq, triangle, point);
            }
        } else {
            console.warn('Invalid EdgeEvent call!');
        }
    }

    var IsEdgeSideOfTriangle = function(triangle, ep, eq) {

        var index = triangle.EdgeIndex(ep, eq);
        //////console.log("1IsEdgeSideOfTriangle",index)
        if (index != -1) {
            triangle.MarkConstrainedEdge(index);
            var t = triangle.GetNeighbor(index);
            if (t != null) {
                t.MarkConstrainedEdge(ep, eq);
            }
            return true;
        }
        return false;    
    }

    var NewFrontTriangle = function(tcx, point, node) {
        var triangle = createTriangle(point, node.point, node.next.point);

        triangle.MarkNeighbor(node.triangle);
        tcx.AddToMap(triangle);

        var new_node = createNode(point);
        new_node.next = node.next;
        new_node.prev = node;
        node.next.prev = new_node;
        node.next = new_node;

        if (!Legalize(tcx, triangle)) {
            tcx.MapTriangleToNodes(triangle);
        }

        return new_node;
    }

    /**
     * Adds a triangle to the advancing front to fill a hole.
     * @param tcx
     * @param node - middle node, that is the bottom of the hole
     */
    var Fill = function(tcx, node) {
        var triangle = createTriangle(node.prev.point, node.point, node.next.point);

        // TODO: should copy the constrained_edge value from neighbor triangles
        //       for now constrained_edge values are copied during the legalize
        triangle.MarkNeighbor(node.prev.triangle);
        triangle.MarkNeighbor(node.triangle);

        tcx.AddToMap(triangle);

        // Update the advancing front
        node.prev.next = node.next;
        node.next.prev = node.prev;


        // If it was legalized the triangle has already been mapped
        if (!Legalize(tcx, triangle)) {
            tcx.MapTriangleToNodes(triangle);
        }

        //tcx.RemoveNode(node);
    }

    /**
     * Fills holes in the Advancing Front
     */
    var FillAdvancingFront = function(tcx, n) {
        // Fill right holes
        var node = n.next;
        var angle;

        while (node.next != null) {
            angle = HoleAngle(node);
            if (angle > PI_2 || angle < -(PI_2)) break;
            Fill(tcx, node);
            node = node.next;
        }

        // Fill left holes
        node = n.prev;

        while (node.prev != null) {
            angle = HoleAngle(node);
            if (angle > PI_2 || angle < -(PI_2)) break;
            Fill(tcx, node);
            node = node.prev;
        }

        // Fill right basins
        if (n.next != null && n.next.next != null) {
            angle = BasinAngle(n);
            if (angle < PI_3div4) {
                FillBasin(tcx, n);
            }
        }
    }

    var BasinAngle = function(node) {
        var ax = node.point.x - node.next.next.point.x;
        var ay = node.point.y - node.next.next.point.y;
        return Math.atan2(ay, ax);
    }

    /**
     *
     * @param node - middle node
     * @return the angle between 3 front nodes
     */
    var HoleAngle = function(node) {
      /* Complex plane
       * ab = cosA +i*sinA
       * ab = (ax + ay*i)(bx + by*i) = (ax*bx + ay*by) + i(ax*by-ay*bx)
       * atan2(y,x) computes the principal value of the argument function
       * applied to the complex number x+iy
       * Where x = ax*bx + ay*by
       *       y = ax*by - ay*bx
       */
      var ax = node.next.point.x - node.point.x;
      var ay = node.next.point.y - node.point.y;
      var bx = node.prev.point.x - node.point.x;
      var by = node.prev.point.y - node.point.y;
      return Math.atan2(ax * by - ay * bx, ax * bx + ay * by);
    }

    /**
     * Returns true if triangle was legalized
     */
    var Legalize = function(tcx, t) {
        // To legalize a triangle we start by finding if any of the three edges
        // violate the Delaunay condition
        for (var i=0; i < 3; ++i) {
            if (t.delaunay_edge[i]) continue;

            var ot = t.GetNeighbor(i);
            if (ot != null) {
                var p = t.GetPoint(i);
                var op = ot.OppositePoint(t, p);
                var oi = ot.Index(op);

                // If this is a Constrained Edge or a Delaunay Edge(only during recursive legalization)
                // then we should not try to legalize
                if (ot.constrained_edge[oi] || ot.delaunay_edge[oi]) {
                    t.constrained_edge[i] = ot.constrained_edge[oi];
                    continue;
                }

                var inside = Incircle(p, t.PointCCW(p), t.PointCW(p), op);
                if (inside) {
                    // Lets mark this shared edge as Delaunay
                    t.delaunay_edge[i] = true;
                    ot.delaunay_edge[oi] = true;

                    // Lets rotate shared edge one vertex CW to legalize it
                    RotateTrianglePair(t, p, ot, op);

                    // We now got one valid Delaunay Edge shared by two triangles
                    // This gives us 4 new edges to check for Delaunay

                    // Make sure that triangle to node mapping is done only one time for a specific triangle
                    var not_legalized = !Legalize(tcx, t);
                    if (not_legalized) {
                        tcx.MapTriangleToNodes(t);
                    }

                    not_legalized = !Legalize(tcx, ot);
                    if (not_legalized) tcx.MapTriangleToNodes(ot);

                    // Reset the Delaunay edges, since they only are valid Delaunay edges
                    // until we add a new triangle or point.
                    // XXX: need to think about this. Can these edges be tried after we
                    //      return to previous recursive level?
                    t.delaunay_edge[i] = false;
                    ot.delaunay_edge[oi] = false;

                    // If triangle have been legalized no need to check the other edges since
                    // the recursive legalization will handles those so we can end here.
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * <b>Requirement</b>:<br>
     * 1. a,b and c form a triangle.<br>
     * 2. a and d is know to be on opposite side of bc<br>
     * <pre>
     *                a
     *                +
     *               / \
     *              /   \
     *            b/     \c
     *            +-------+
     *           /    d    \
     *          /           \
     * </pre>
     * <b>Fact</b>: d has to be in area B to have a chance to be inside the circle formed by
     *  a,b and c<br>
     *  d is outside B if orient2d(a,b,d) or orient2d(c,a,d) is CW<br>
     *  This preknowledge gives us a way to optimize the incircle test
     * @param pa - triangle point, opposite d
     * @param pb - triangle point
     * @param pc - triangle point
     * @param pd - point opposite a
     * @return true if d is inside circle, false if on circle edge
     */
    var Incircle = function(pa, pb, pc, pd) {
        var adx = pa.x - pd.x;
        var ady = pa.y - pd.y;
        var bdx = pb.x - pd.x;
        var bdy = pb.y - pd.y;

        var adxbdy = adx * bdy;
        var bdxady = bdx * ady;
        var oabd = adxbdy - bdxady;

        if (oabd <= 0) return false;

        var cdx = pc.x - pd.x;
        var cdy = pc.y - pd.y;

        var cdxady = cdx * ady;
        var adxcdy = adx * cdy;
        var ocad = cdxady - adxcdy;

        if (ocad <= 0) return false;

        var bdxcdy = bdx * cdy;
        var cdxbdy = cdx * bdy;

        var alift = adx * adx + ady * ady;
        var blift = bdx * bdx + bdy * bdy;
        var clift = cdx * cdx + cdy * cdy;

        var det = alift * (bdxcdy - cdxbdy) + blift * ocad + clift * oabd;
        return det > 0;
    }

    /**
     * Rotates a triangle pair one vertex CW
     *<pre>
     *       n2                    n2
     *  P +-----+             P +-----+
     *    | t  /|               |\  t |
     *    |   / |               | \   |
     *  n1|  /  |n3           n1|  \  |n3
     *    | /   |    after CW   |   \ |
     *    |/ oT |               | oT \|
     *    +-----+ oP            +-----+
     *       n4                    n4
     * </pre>
     */
    var RotateTrianglePair = function(t, p, ot, op) {
        var n1; var n2; var n3; var n4;
        n1 = t.NeighborCCW(p);
        n2 = t.NeighborCW(p);
        n3 = ot.NeighborCCW(op);
        n4 = ot.NeighborCW(op);

        var ce1; var ce2; var ce3; var ce4;
        ce1 = t.GetConstrainedEdgeCCW(p);
        ce2 = t.GetConstrainedEdgeCW(p);
        ce3 = ot.GetConstrainedEdgeCCW(op);
        ce4 = ot.GetConstrainedEdgeCW(op);

        var de1; var de2; var de3; var de4;
        de1 = t.GetDelaunayEdgeCCW(p);
        de2 = t.GetDelaunayEdgeCW(p);
        de3 = ot.GetDelaunayEdgeCCW(op);
        de4 = ot.GetDelaunayEdgeCW(op);

        t.Legalize(p, op);
        ot.Legalize(op, p);

        // Remap delaunay_edge
        ot.SetDelaunayEdgeCCW(p, de1);
        t.SetDelaunayEdgeCW(p, de2);
        t.SetDelaunayEdgeCCW(op, de3);
        ot.SetDelaunayEdgeCW(op, de4);

        // Remap constrained_edge
        ot.SetConstrainedEdgeCCW(p, ce1);
        t.SetConstrainedEdgeCW(p, ce2);
        t.SetConstrainedEdgeCCW(op, ce3);
        ot.SetConstrainedEdgeCW(op, ce4);

        // Remap neighbors
        // XXX: might optimize the markNeighbor by keeping track of
        //      what side should be assigned to what neighbor after the
        //      rotation. Now mark neighbor does lots of testing to find
        //      the right side.
        t.ClearNeigbors();
        ot.ClearNeigbors();
        if (n1) ot.MarkNeighbor(n1);
        if (n2) t.MarkNeighbor(n2);
        if (n3) t.MarkNeighbor(n3);
        if (n4) ot.MarkNeighbor(n4);
        t.MarkNeighbor(ot);
    }

    /**
     * Fills a basin that has formed on the Advancing Front to the right
     * of given node.<br>
     * First we decide a left,bottom and right node that forms the
     * boundaries of the basin. Then we do a reqursive fill.
     *
     * @param tcx
     * @param node - starting node, this or next node will be left node
     */
    var FillBasin = function(tcx, node) {
        if (Orient2d(node.point, node.next.point, node.next.next.point) == Orientation.CCW) {
            tcx.basin.left_node = node.next.next;
        } else {
            tcx.basin.left_node = node.next;
        }

        // Find the bottom and right node
        tcx.basin.bottom_node = tcx.basin.left_node;
        while (tcx.basin.bottom_node.next != null && tcx.basin.bottom_node.point.y >= tcx.basin.bottom_node.next.point.y) {
            tcx.basin.bottom_node = tcx.basin.bottom_node.next;
        }
        if (tcx.basin.bottom_node == tcx.basin.left_node) {
            // No valid basin
            return;
        }

        tcx.basin.right_node = tcx.basin.bottom_node;
        while (tcx.basin.right_node.next != null && tcx.basin.right_node.point.y < tcx.basin.right_node.next.point.y) {
            tcx.basin.right_node = tcx.basin.right_node.next;
        }
        if (tcx.basin.right_node == tcx.basin.bottom_node) {
            // No valid basins
            return;
        }

        tcx.basin.width = tcx.basin.right_node.point.x - tcx.basin.left_node.point.x;
        tcx.basin.left_highest = tcx.basin.left_node.point.y > tcx.basin.right_node.point.y;

        FillBasinReq(tcx, tcx.basin.bottom_node);
    }

    /**
     * Recursive algorithm to fill a Basin with triangles
     *
     * @param tcx
     * @param node - bottom_node
     */
    var FillBasinReq = function(tcx, node) {
        // if shallow stop filling
        if (IsShallow(tcx, node)) {
            return;
        }

        Fill(tcx, node);

        var o;
        if (node.prev == tcx.basin.left_node && node.next == tcx.basin.right_node) {
            return;
        } else if (node.prev == tcx.basin.left_node) {
            o = Orient2d(node.point, node.next.point, node.next.next.point);
            if (o == Orientation.CW) {
                return;
            }
            node = node.next;
        } else if (node.next == tcx.basin.right_node) {
            o = Orient2d(node.point, node.prev.point, node.prev.prev.point);
            if (o == Orientation.CCW) {
                return;
            }
            node = node.prev;
        } else {
            // Continue with the neighbor node with lowest Y value
            if (node.prev.point.y < node.next.point.y) {
                node = node.prev;
            } else {
                node = node.next;
            }
        }

        FillBasinReq(tcx, node);
    }

    var IsShallow = function(tcx, node) {
        var height;
        if (tcx.basin.left_highest) {
            height = tcx.basin.left_node.point.y - node.point.y;
        } else {
            height = tcx.basin.right_node.point.y - node.point.y;
        }

        // if shallow stop filling
        if (tcx.basin.width > height) {
            return true;
        }
        return false;
    }

    var FillEdgeEvent = function(tcx, edge, node) {
        if (tcx.edge_event.right) {
            FillRightAboveEdgeEvent(tcx, edge, node);
        } else {
            FillLeftAboveEdgeEvent(tcx, edge, node);
        }
    }

    var FillRightAboveEdgeEvent = function(tcx, edge, node) {
        while (node.next.point.x < edge.p.x) {
            // Check if next node is below the edge
            if (Orient2d(edge.q, node.next.point, edge.p) == Orientation.CCW) {
                FillRightBelowEdgeEvent(tcx, edge, node);
            } else {
                node = node.next;
            }
        }
    }

    var FillRightBelowEdgeEvent = function(tcx, edge, node) {
        if (node.point.x < edge.p.x) {
            if (Orient2d(node.point, node.next.point, node.next.next.point) == Orientation.CCW) {
                // Concave
                FillRightConcaveEdgeEvent(tcx, edge, node);
            } else{
                // Convex
                FillRightConvexEdgeEvent(tcx, edge, node);
                // Retry this one
                FillRightBelowEdgeEvent(tcx, edge, node);
            }
        }
    }

    var FillRightConcaveEdgeEvent = function(tcx, edge, node) {
        Fill(tcx, node.next);
        if (node.next.point != edge.p) {
            // Next above or below edge?
            if (Orient2d(edge.q, node.next.point, edge.p) == Orientation.CCW) {
                // Below
                if (Orient2d(node.point, node.next.point, node.next.next.point) == Orientation.CCW) {
                    // Next is concave
                    FillRightConcaveEdgeEvent(tcx, edge, node);
                } else {
                // Next is convex
                }
            }
        }
    }

    var FillRightConvexEdgeEvent = function(tcx, edge, node) {
        // Next concave or convex?
        if (Orient2d(node.next.point, node.next.next.point, node.next.next.next.point) == Orientation.CCW) {
            // Concave
            FillRightConcaveEdgeEvent(tcx, edge, node.next);
        } else {
            // Convex
            // Next above or below edge?
            if (Orient2d(edge.q, node.next.next.point, edge.p) == Orientation.CCW) {
                // Below
                FillRightConvexEdgeEvent(tcx, edge, node.next);
            } else {
                // Above
            }
        }
    }

    var FillLeftAboveEdgeEvent = function(tcx, edge, node) {
        while (node.prev.point.x > edge.p.x) {
            // Check if next node is below the edge
            if (Orient2d(edge.q, node.prev.point, edge.p) == Orientation.CW) {
                FillLeftBelowEdgeEvent(tcx, edge, node);
            } else {
                node = node.prev;
            }
        }
    }

    var FillLeftBelowEdgeEvent = function(tcx, edge, node) {
        if (node.point.x > edge.p.x) {
            if (Orient2d(node.point, node.prev.point, node.prev.prev.point) == Orientation.CW) {
                // Concave
                FillLeftConcaveEdgeEvent(tcx, edge, node);
            } else {
                // Convex
                FillLeftConvexEdgeEvent(tcx, edge, node);
                // Retry this one
                FillLeftBelowEdgeEvent(tcx, edge, node);
            }
        }
    }

    var FillLeftConvexEdgeEvent = function(tcx, edge, node) {
        // Next concave or convex?
        if (Orient2d(node.prev.point, node.prev.prev.point, node.prev.prev.prev.point) == Orientation.CW) {
            // Concave
            FillLeftConcaveEdgeEvent(tcx, edge, node.prev);
        } else {
            // Convex
            // Next above or below edge?
            if (Orient2d(edge.q, node.prev.prev.point, edge.p) == Orientation.CW) {
                // Below
                FillLeftConvexEdgeEvent(tcx, edge, node.prev);
            } else {
                // Above
            }
        }
    }

    var FillLeftConcaveEdgeEvent = function(tcx, edge, node) {
        Fill(tcx, node.prev);
        if (node.prev.point != edge.p) {
            // Next above or below edge?
            if (Orient2d(edge.q, node.prev.point, edge.p) == Orientation.CW) {
                // Below
                if (Orient2d(node.point, node.prev.point, node.prev.prev.point) == Orientation.CW) {
                    // Next is concave
                    FillLeftConcaveEdgeEvent(tcx, edge, node);
                } else {
                    // Next is convex
                }
            }
        }
    }

    var FlipEdgeEvent = function(tcx, ep, eq, t, p) {
        var ot = t.NeighborAcross(p);
        if (ot == null) {
            // If we want to integrate the fillEdgeEvent do it here
            // With current implementation we should never get here
            console.warn('[BUG:FIXME] FLIP failed due to missing triangle!');
            return;
        }
        var op = ot.OppositePoint(t, p);

        if (InScanArea(p, t.PointCCW(p), t.PointCW(p), op)) {
            // Lets rotate shared edge one vertex CW
            RotateTrianglePair(t, p, ot, op);
            tcx.MapTriangleToNodes(t);
            tcx.MapTriangleToNodes(ot);

            if (p == eq && op == ep) {
                if (eq == tcx.edge_event.constrained_edge.q && ep == tcx.edge_event.constrained_edge.p) {
                    t.MarkConstrainedEdge(ep, eq);
                    ot.MarkConstrainedEdge(ep, eq);
                    Legalize(tcx, t);
                    Legalize(tcx, ot);
                } else {
                    // XXX: I think one of the triangles should be legalized here?
                }
            } else {
                var o = Orient2d(eq, op, ep);
                t = NextFlipTriangle(tcx, o, t, ot, p, op);
                FlipEdgeEvent(tcx, ep, eq, t, p);
            }
        } else {
            var newP = NextFlipPoint(ep, eq, ot, op);
            FlipScanEdgeEvent(tcx, ep, eq, t, ot, newP);
            EdgeEvent(tcx, ep, eq, t, p);
        }
    }

    var NextFlipTriangle = function(tcx, o, t, ot, p, op) {
        var edge_index;
        if (o == Orientation.CCW) {
            // ot is not crossing edge after flip
            edge_index = ot.EdgeIndex(p, op);
            ot.delaunay_edge[edge_index] = true;
            Legalize(tcx, ot);
            ot.ClearDelunayEdges();
            return t;
        }

        // t is not crossing edge after flip
        edge_index = t.EdgeIndex(p, op);

        t.delaunay_edge[edge_index] = true;
        Legalize(tcx, t);
        t.ClearDelunayEdges();
        return ot;
    }

    var NextFlipPoint = function(ep, eq, ot, op) {
        var o2d = Orient2d(eq, op, ep);
        if (o2d == Orientation.CW) {
            // Right
            return ot.PointCCW(op);
        } else if (o2d == Orientation.CCW) {
            // Left
            return ot.PointCW(op);
        } else {
            console.warn("[Unsupported] NextFlipPoint: opposing point on constrained edge!");
            return undefined;
        }
    }

    var FlipScanEdgeEvent = function(tcx, ep, eq, flip_triangle, t, p) {
        var ot = t.NeighborAcross(p);

        if (ot == null) {
            // If we want to integrate the fillEdgeEvent do it here
            // With current implementation we should never get here
            console.warn('[BUG:FIXME] FLIP failed due to missing triangle');
            return;
        }
        var op = ot.OppositePoint(t, p);

        if (InScanArea(eq, flip_triangle.PointCCW(eq), flip_triangle.PointCW(eq), op)) {
            // flip with new edge op.eq
            FlipEdgeEvent(tcx, eq, op, ot, op);
            // TODO: Actually I just figured out that it should be possible to
            //       improve this by getting the next ot and op before the the above
            //       flip and continue the flipScanEdgeEvent here
            // set new ot and op here and loop back to inScanArea test
            // also need to set a new flip_triangle first
            // Turns out at first glance that this is somewhat complicated
            // so it will have to wait.
        } else {
            var newP = NextFlipPoint(ep, eq, ot, op);
            FlipScanEdgeEvent(tcx, ep, eq, flip_triangle, ot, newP);
        }
    };
    
    var getGeom = function(context) {
        var comboData = [],indices=[];
        var len = context.point_count();
        
        var i = 0,p,idx;
        for (i=0;i<len;i++){
            
            
            
            p = context.GetPoint(i);
            idx = p.id*5;
            // vert
			comboData[idx+0] = p.x;
			comboData[idx+1] = p.y;
			comboData[idx+2] = 0;
		    // txt
			comboData[idx+3] = p.x;
			comboData[idx+4] = p.y;
            
        }
        
        
        var triangles = context.GetTriangles();
        var len = triangles.length;
        
        for (i=0;i<len;i++) {
            var t = triangles[i];
            idx=i*3;
            indices[idx+0] = t.GetPoint(0).id;
            indices[idx+1] = t.GetPoint(1).id;
            indices[idx+2] = t.GetPoint(2).id;

        }
        
        
        
        var data = {
		    vertices: comboData,
		    indices:  indices
		}
        return data;
    };
    
    

    (typeof j5 !== "undefined")&&j5.registerComponent("polygon", function(j5helper, outline, holes) {

        holes = holes || [];

        var gl = j5helper("gl");
        var createBuffer  = j5helper("createBuffer");
        var defaultCamera = j5helper("defaultCamera");
        

        var pointId = 0;
        
        outline = outline.map(function(p) {
            return createPoint(p[0],p[1],pointId++);
        });
        

        var context = createSweepContext(outline.concat());

        holes = holes.map(function(hole) {
            hole = hole.map(function(p) {
                return createPoint(p[0],p[1],pointId++);
            });
            context.AddHole(hole);
            return hole;
        });
        
        Triangulate(context);
        
        var geom = getGeom(context);
        
        var geomData = {
            vertices: createBuffer(gl, gl.ARRAY_BUFFER,         new Float32Array(geom.vertices),5),
	        indices:  createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(geom.indices), 1),
	        size: geom.indices.length
        }

        return {
            
            getData: function() {
              return geom;  
            },
            
            getPolygons: function() {
              return  holes.concat([outline]);
            },
            
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
        }

        
    });
    
    
    
    
    
    
    
})();



