import * as d3 from 'd3';
// https://bl.ocks.org/frogcat/a06132f64b7164c1b1993c49dcd9178f looks to be a different solution
/**
 * @param {object} opts 
 */
export default function Network(opts) {
    let that = this;
    this.data = opts.data;
    console.log(this.data);
    this.element = opts.element;

    // this.data.links.forEach(function(d) {
    //     d.source = d.source_id;
    //     d.target = d.target_id;
    // });

    this.radius = 20;
    this.distance = 80;

    this.simulation = d3.forceSimulation();
    this.simulation.force('link', d3.forceLink().distance(function(d) {
        return that.distance;
    }));

    this.simulation.force('charge', d3.forceManyBody());
    this.simulation.force('center', d3.forceCenter(
        this.element.width / 2, this.element.height / 2
    ));
    this.simulation.on('tick', function() {
        that.paint();
    });

    d3.select(this.element)
        .call(d3.drag()
        .container(this.element)
        .subject(function() {
            return that.simulation.find(d3.event.x, d3.event.y, that.radius);
        })
        .on('start', function() {
            if (!d3.event.active) that.simulation.alphaTarget(0.3).restart();
            d3.event.subject.fx = d3.event.subject.x;
            d3.event.subject.fy = d3.event.subject.y;
        })
        .on('drag', function() {
            d3.event.subject.fx = d3.event.x;
            d3.event.subject.fy = d3.event.y;
        })
        .on('end', function() {
            if (!d3.event.active) that.simulation.alphaTarget(0);
            d3.event.subject.fx = null;
            d3.event.subject.fy = null;
        }));
};
Network.prototype.setSize = function(width, height) {
    this.simulation.force('center', d3.forceCenter(width / 2, height / 2));
    this.simulation.alphaTarget(0).restart();
};

Network.prototype.getNodeById = function(id) {
    return this.data.nodes.find(function(a) {
        return a.id === id;
    });
};

Network.prototype.getLinkByIds = function(src, dst) {
    return this.data.links.find(function(a) {
        return (a.src === src && a.dst === dst) || (a.src === dst && a.dst === src);
    });
};

Network.prototype.add = function(src, dst) {
    if (!this.getNodeById(src)) {
        this.data.nodes.push({
            id: src,
            x: this.element.width * Math.random(),
            y: this.element.height * Math.random(),
        });
    };
    if (!this.getNodeById(dst)) {
        this.data.nodes.push({
            id: dst,
            x: this.element.width * Math.random(),
            y: this.element.height * Math.random(),
        });
    };
    if (src !== dst && !this.getLinkByIds(src, dst)) {
        this.data.links.push({
            source: this.getNodeById(src),
            target: this.getNodeById(dst),
        });
    };

    this.simulation.nodes(this.nodes);
    this.simulation.force('link').links(this.links);
    this.simulation.alphaTarget(0.3).restart();
    return this;
};

Network.prototype.paint = function() {
    let c = this.element.getContext('2d');
    let r = this.radius;
    c.clearRect(0, 0, this.element.width, this.element.height);
    c.save();

    this.data.links.forEach(function(d) {
        c.strokeStyle = '#000000';
        c.lineWidth = 3;
        c.beginPath();
        c.moveTo(d.source.x, d.source.y);
        c.lineTo(d.target.x, d.target.y);
        c.stroke();
    });

    this.data.nodes.forEach(function(d) {
        // circle
        c.fillStyle = '#ffffff';
        c.strokeStyle = '#000000';
        c.lineWidth = 3;
        c.beginPath();
        c.moveTo(d.x + r, d.y);
        c.arc(d.x, d.y, r, 0, 2 * Math.PI);
        c.fill();
        c.stroke();
        // text
        c.fillStyle = '#000';
        c.font = '24px sans-serif';
        c.fillText(d.id, d.x - r / 2, d.y + r / 2);
    });
    c.restore();
};


