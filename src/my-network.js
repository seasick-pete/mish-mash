import * as d3 from 'd3';

/**
 *
 */
export default function() {
    const graph = require('json-loader!./data.json');

    const svg = d3.select('svg');
    const width = +svg.attr('width');
    const height = +svg.attr('height');

    const simulation = d3.forceSimulation()
        .force('link', d3.forceLink().id(function(d) {
        return d.id;
        } ))
        .force('charge', d3.forceManyBody().strength(-400))
        .force('center', d3.forceCenter(width / 2, height / 2));

    graph.links.forEach(function(d) {
        d.source = d.source_id;
        d.target = d.target_id;
    });

    const link = svg.append('g')
    .style('stroke', '#aaa')
    .selectAll('line')
    .data(graph.links)
    .enter().append('line');

    const node = svg.append('g')
    .attr('class', 'nodes')
    .selectAll('circle')
    .data(graph.nodes)
    .enter().append('circle')
        .attr('r', 6)
        .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    const label = svg.append('g')
    .attr('class', 'labels')
    .selectAll('text')
    .data(graph.nodes)
    .enter().append('text')
        .attr('class', 'label')
        .text(function(d) {
        return d.name;
        });

    simulation
    .nodes(graph.nodes)
    .on('tick', ticked);

    simulation.force('link')
    .links(graph.links);


    /**
     *
     */
    function ticked() {
    link
        .attr('x1', function(d) {return d.source.x;} )
        .attr('y1', function(d) { return d.source.y; })
        .attr('x2', function(d) { return d.target.x; })
        .attr('y2', function(d) { return d.target.y; });

    node
        .attr('r', 20)
        .style('fill', '#d9d9d9')
        .style('stroke', '#969696')
        .style('stroke-width', '1px')
        .attr('cx', function(d) { return d.x+6; })
        .attr('cy', function(d) { return d.y-6; });

    label
        .attr('x', function(d) { return d.x; })
        .attr('y', function(d) { return d.y; })
        .style('font-size', '20px').style('fill', '#4393c3');
    }


    /**
     *
     */
    function dragstarted() {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d3.event.subject.fx = d3.event.subject.x;
    d3.event.subject.fy = d3.event.subject.y;
    }

    /**
     *
     */
    function dragged() {
    d3.event.subject.fx = d3.event.x;
    d3.event.subject.fy = d3.event.y;
    }

    /**
     *
     */
    function dragended() {
    if (!d3.event.active) simulation.alphaTarget(0);
    d3.event.subject.fx = null;
    d3.event.subject.fy = null;
    }
}
