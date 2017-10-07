import * as d3 from 'd3';

/**
 * creates a sankey object that appends to the d3 library
 * @return {object}
 */
export default function() {
    const sankey = {};
    let nodeWidth = 24;
    let nodePadding = 8;
    let size = [1, 1];
    let nodes = [];
    let links = [];

    sankey.nodeWidth = function(_) {
      if (!arguments.length) return nodeWidth;
      nodeWidth = +_;
      return sankey;
    };

    sankey.nodePadding = function(_) {
      if (!arguments.length) return nodePadding;
      nodePadding = +_;
      return sankey;
    };

    sankey.nodes = function(_) {
      if (!arguments.length) return nodes;
      nodes = _;
      return sankey;
    };

    sankey.links = function(_) {
      if (!arguments.length) return links;
      links = _;
      return sankey;
    };

    sankey.size = function(_) {
      if (!arguments.length) return size;
      size = _;
      return sankey;
    };

    sankey.layout = function(iterations) {
      computeNodeLinks();
      computeNodeValues();
      computeNodeBreadths();
      computeNodeDepths(iterations);
      computeLinkDepths();
      return sankey;
    };

    sankey.relayout = function() {
      computeLinkDepths();
      return sankey;
    };

    /**
     * A link creator
     * @return {string} Returns a link object.
     */  
    sankey.link = function() {
        let curvature = .5;

        /**
         * Not sure what this does
         * @param {number} d A data member.
         * @return {string} M and Cs.
         */
        function link(d) {
            const x0 = d.source.x + d.source.dx;
            const x1 = d.target.x;
            const xi = d3.interpolateNumber(x0, x1);
            const x2 = xi(curvature);
            const x3 = xi(1 - curvature);
            const y0 = d.source.y + d.sy + d.dy / 2;
            const y1 = d.target.y + d.ty + d.dy / 2;
            return 'M' + x0 + ',' + y0
                + 'C' + x2 + ',' + y0
                + ' ' + x3 + ',' + y1
                + ' ' + x1 + ',' + y1;
        }

        /**
         * Not sure what this does
         * @param {number} _ Google this _.
         * @return {object} link.
         */  
        link.curvature = function(_) {
            if (!arguments.length) return curvature;
            curvature = +_;
            return link;
        };
        return link;
    };


    /**
     * Not sure what this does -yet
     */
    function computeNodeLinks() {
      nodes.forEach(function(node) {
        node.sourceLinks = [];
        node.targetLinks = [];
      });

      links.forEach(function(link) {
        let source = link.source;
        let target = link.target;

        if (typeof source === 'number') {
          source = link.source = nodes[link.source];
        };

        if (typeof target === 'number') {
          target = link.target = nodes[link.target];
        };

        source.sourceLinks.push(link);
        target.targetLinks.push(link);
      });
    }

    /**
     * Not sure what this does -yet
     */
    function computeNodeValues() {
      nodes.forEach(function(node) {
        node.value = Math.max(
          d3.sum(node.sourceLinks, value),
          d3.sum(node.targetLinks, value)
        );
      });
    }

    /**
     * Iteratively assign the breadth (x-position) for each node.
     * Nodes are assigned the maximum breadth of incoming neighbors plus one;
     * nodes with no incoming links are assigned breadth zero, while
     * nodes with no outgoing links are assigned the maximum breadth.
     */
    function computeNodeBreadths() {
      let remainingNodes = nodes;
      let nextNodes = [];
      let x = 0;

      while (remainingNodes.length) {
        nextNodes = [];
        remainingNodes.forEach(function(node) {
          node.x = x;
          node.dx = nodeWidth;
          node.sourceLinks.forEach(function(link) {
            if (nextNodes.indexOf(link.target) < 0) {
              nextNodes.push(link.target);
            }
          });
        });
        remainingNodes = nextNodes;
        ++x;
      }

      //
      moveSinksRight(x);
      scaleNodeBreadths((size[0] - nodeWidth) / (x - 1));
    }

    /**
     * Not sure what this does - yet .
     */
    // function moveSourcesRight() {
    //   nodes.forEach(function(node) {
    //     if (!node.targetLinks.length) {
    //       node.x = d3.min(node.sourceLinks, function(d) {
    //         return d.target.x;
    //       }) - 1;
    //     }
    //   });
    // }

    /**
     * @param {number} x I guess an x coordinate?
     */ 
    function moveSinksRight(x) {
      nodes.forEach(function(node) {
        if (!node.sourceLinks.length) {
          node.x = x - 1;
        }
      });
    }

    /**
     * @param {number} kx I guess an x coordinate?
     */ 
    function scaleNodeBreadths(kx) {
      nodes.forEach(function(node) {
        node.x *= kx;
      });
    }

    /**
     * @param {number} iterations Is this right?
     */ 
    function computeNodeDepths(iterations) {
      const nodesByBreadth = d3.nest()
          .key(function(d) {
            return d.x;
          })
          .sortKeys(d3.ascending)
          .entries(nodes)
          .map(function(d) {
            return d.values;
          });

      initializeNodeDepth();
      resolveCollisions();

      for (let alpha = 1; iterations > 0; --iterations) {
        relaxRightToLeft(alpha *= .99);
        resolveCollisions();
        relaxLeftToRight(alpha);
        resolveCollisions();
      }

    /**
     * What does this do?
     */ 
      function initializeNodeDepth() {
        const ky = d3.min(nodesByBreadth, function(nodes) {
          return (size[1] - (nodes.length - 1) * nodePadding)
          / d3.sum(nodes, value);
        });

        nodesByBreadth.forEach(function(nodes) {
          nodes.forEach(function(node, i) {
            node.y = i;
            node.dy = node.value * ky;
          });
        });

        links.forEach(function(link) {
          link.dy = link.value * ky;
        });
      }

    /**
     * @param {number} alpha - need to define
     */ 
      function relaxLeftToRight(alpha) {
        nodesByBreadth.forEach(function(nodes, breadth) {
          nodes.forEach(function(node) {
            if (node.targetLinks.length) {
              const y = d3.sum(node.targetLinks, weightedSource)
                / d3.sum(node.targetLinks, value);
              node.y += (y - center(node)) * alpha;
            }
          });
        });

      /**
       * not sure what this does yet
       * @param {number} link - need to define
       * @return {number} center coordinate
       */ 
        function weightedSource(link) {
          return center(link.source) * link.value;
        }
      }

      /**
       * not sure what this does yet
       * @param {number} alpha - need to define
       */ 
      function relaxRightToLeft(alpha) {
        nodesByBreadth.slice().reverse().forEach(function(nodes) {
          nodes.forEach(function(node) {
            if (node.sourceLinks.length) {
              const y = d3.sum(node.sourceLinks, weightedTarget)
                / d3.sum(node.sourceLinks, value);
              node.y += (y - center(node)) * alpha;
            }
          });
        });


      /**
       * not sure what this does yet
       * @param {number} link - need to define
       * @return {number} 
       */ 
        function weightedTarget(link) {
          return center(link.target) * link.value;
        }
      }

      /**
       * not sure what this does yet
       * @param {number} alpha - need to define
       */ 
      function resolveCollisions() {
        nodesByBreadth.forEach(function(nodes) {
          let node;
          let dy;
          let y0 = 0;
          let n = nodes.length;
          let i;

          // Push any overlapping nodes down.
          nodes.sort(ascendingDepth);
          for (i = 0; i < n; ++i) {
            node = nodes[i];
            dy = y0 - node.y;
            if (dy > 0) node.y += dy;
            y0 = node.y + node.dy + nodePadding;
          }

          // If the bottommost node goes outside the bounds, push it back up.
          dy = y0 - nodePadding - size[1];
          if (dy > 0) {
            y0 = node.y -= dy;

            // Push any overlapping nodes back up.
            for (i = n - 2; i >= 0; --i) {
              node = nodes[i];
              dy = node.y + node.dy + nodePadding - y0;
              if (dy > 0) node.y -= dy;
              y0 = node.y;
            }
          }
        });
      }

      /**
       * not sure what this does yet
       * @param {number} a - need to define
       * @param {number} b - need to 
       * @return {number}
       */
      function ascendingDepth(a, b) {
        return a.y - b.y;
      }
    }

    /**
     * not sure what this does yet
     */
    function computeLinkDepths() {
      nodes.forEach(function(node) {
        node.sourceLinks.sort(ascendingTargetDepth);
        node.targetLinks.sort(ascendingSourceDepth);
      });
      nodes.forEach(function(node) {
        let sy = 0;
        let ty = 0;
        node.sourceLinks.forEach(function(link) {
          link.sy = sy;
          sy += link.dy;
        });
        node.targetLinks.forEach(function(link) {
          link.ty = ty;
          ty += link.dy;
        });
      });

      /**
       * not sure what this does yet
       * @param {number} a TODO
       * @param {number} b TODO
       * @return {number} TODO
       */
      function ascendingSourceDepth(a, b) {
        return a.source.y - b.source.y;
      }

      /**
       * not sure what this does yet
       * @param {number} a TODO
       * @param {number} b TODO
       * @return {number} TODO
       */
      function ascendingTargetDepth(a, b) {
        return a.target.y - b.target.y;
      }
    }

    /**
     * not sure what this does yet
     * @param {number} node TODO
     * @return {number} TODO
     */
    function center(node) {
      return node.y + node.dy / 2;
    }

    /**
     * not sure what this does yet
     * @param {number} link TODO
     * @return {number} TODO
     */
    function value(link) {
      return link.value;
    }

  return sankey;
};

