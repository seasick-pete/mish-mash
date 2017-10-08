import * as d3 from 'd3';
// https://bl.ocks.org/frogcat/a06132f64b7164c1b1993c49dcd9178f looks to be a different solution
/**
 * @param {object} opts 
 */
export default function Network(opts) {
    let that = this;
    // load in arguments from config object
    this.data = opts.data;
    this.element = opts.element;

    this.data.links.forEach(function(d) {
        d.source = d.source_id;
        d.target = d.target_id;
    });
    console.log(this);


    // create the chart
    this.draw();
};

// Network.prototype.simulation = function() {

// };

Network.prototype.draw = function() {
    // define width, height and margin
    this.width = this.element.offsetWidth;
    this.height = this.width / 2;
    this.margin = {
        top: 20,
        right: 75,
        bottom: 45,
        left: 50,
    };

    // set up parent element and SVG
    this.element.innerHTML = '';
    let svg = d3.select(this.element).append('svg');
    svg.attr('width', this.width);
    svg.attr('height', this.height);

    // we'll actually be appending to a <g> element
    this.plot = svg.append('g')
        .attr(
            'transform',
            'translate('+this.margin.left+','+this.margin.top+')'
        );

    this.simulation = d3.forceSimulation()
        .force('link', d3.forceLink().id(function(d) {
            return d.id;
        } ))
        .force('charge', d3.forceManyBody().strength(-400))
        .force('center', d3.forceCenter(this.width / 2, this.height / 2));

    this.addLinks();
    this.addNodes();
    this.addLabels();


    this.simulation
        .nodes(that.data.nodes)
        .on('tick', that.ticked);
    this.simulation
        .force('link')
        .links(that.data.links);
};

Network.prototype.addLinks = function() {
    this.link = this.plot.append('g')
        .style('stroke', '#aaa')
        .selectAll('line')
        .data(this.data.links)
        .enter().append('line');
};

Network.prototype.addNodes = function() {
    this.node = this.plot.append('g')
        .attr('class', 'nodes')
        .selectAll('circle')
        .data(this.data.nodes)
        .enter().append('circle')
            .attr('r', 6)
        .call(d3.drag()
            .on('start', this.dragstarted)
            .on('drag', this.dragged)
            .on('end', this.dragended));
};

Network.prototype.addLabels = function() {
    this.label = this.plot.append('g')
    .attr('class', 'labels')
    .selectAll('text')
    .data(this.data.nodes)
    .enter().append('text')
        .attr('class', 'label')
        .text(function(d) {
        return d.name;
        });
};

Network.prototype.ticked = function() {
    console.log(this);
    this.link
        .attr('x1', function(d) {return d.source.x;} )
        .attr('y1', function(d) { return d.source.y; })
        .attr('x2', function(d) { return d.target.x; })
        .attr('y2', function(d) { return d.target.y; });

    this.node
        .attr('r', 20)
        .style('fill', '#d9d9d9')
        .style('stroke', '#969696')
        .style('stroke-width', '1px')
        .attr('cx', function(d) { return d.x+6; })
        .attr('cy', function(d) { return d.y-6; });

    this.label
        .attr('x', function(d) {return d.x;})
        .attr('y', function(d) { return d.y; })
        .style('font-size', '20px').style('fill', '#4393c3');
};

Network.prototype.dragstarted = function() {
    if (!d3.event.active) this.simulation.alphaTarget(0.3).restart();
    d3.event.subject.fx = d3.event.subject.x;
    d3.event.subject.fy = d3.event.subject.y;
};

Network.prototype.dragged = function() {
    d3.event.subject.fx = d3.event.x;
    d3.event.subject.fy = d3.event.y;
};

Network.prototype.dragended = function() {
    if (!d3.event.active) this.simulation.alphaTarget(0);
    d3.event.subject.fx = null;
    d3.event.subject.fy = null;
};
