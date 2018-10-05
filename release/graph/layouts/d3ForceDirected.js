var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
import { id } from '../../utils';
import { forceCollide, forceLink, forceManyBody, forceSimulation } from 'd3-force';
import { Subject } from 'rxjs';
export function toD3Node(maybeNode) {
    if (typeof maybeNode === 'string') {
        return {
            id: maybeNode,
            x: 0,
            y: 0,
        };
    }
    return maybeNode;
}
var D3ForceDirectedLayout = /** @class */ (function () {
    function D3ForceDirectedLayout() {
        this.defaultSettings = {
            force: forceSimulation()
                .force('charge', forceManyBody().strength(-150))
                .force('collide', forceCollide(5)),
            forceLink: forceLink().id(function (node) { return node.id; }).distance(function () { return 100; }),
        };
        this.settings = {};
        this.outputGraph$ = new Subject();
    }
    D3ForceDirectedLayout.prototype.run = function (graph) {
        var _this = this;
        this.inputGraph = graph;
        this.d3Graph = {
            nodes: this.inputGraph.nodes.map(function (n) { return (__assign({}, n)); }).slice(),
            edges: this.inputGraph.edges.map(function (e) { return (__assign({}, e)); }).slice(),
        };
        this.outputGraph = {
            nodes: [],
            edges: [],
            edgeLabels: [],
        };
        this.outputGraph$.next(this.outputGraph);
        this.settings = Object.assign({}, this.defaultSettings, this.settings);
        if (this.settings.force) {
            this.settings.force.nodes(this.d3Graph.nodes)
                .force('link', this.settings.forceLink.links(this.d3Graph.edges))
                .alpha(0.5).restart()
                .on('tick', function () {
                _this.outputGraph$.next(_this.d3GraphToOutputGraph(_this.d3Graph));
            });
        }
        return this.outputGraph$.asObservable();
    };
    D3ForceDirectedLayout.prototype.updateEdge = function (graph, edge) {
        var _this = this;
        var settings = Object.assign({}, this.defaultSettings, this.settings);
        if (settings.force) {
            settings.force.nodes(this.d3Graph.nodes)
                .force('link', settings.forceLink.links(this.d3Graph.edges))
                .alpha(0.5).restart()
                .on('tick', function () {
                _this.outputGraph$.next(_this.d3GraphToOutputGraph(_this.d3Graph));
            });
        }
        return this.outputGraph$.asObservable();
    };
    D3ForceDirectedLayout.prototype.d3GraphToOutputGraph = function (d3Graph) {
        this.outputGraph.nodes = this.d3Graph.nodes.map(function (node) {
            return (__assign({}, node, { id: node.id || id(), position: {
                    x: node.x,
                    y: node.y,
                }, dimension: {
                    width: node.dimension && node.dimension.width || 20,
                    height: node.dimension && node.dimension.height || 20,
                }, transform: "translate(" + (node.x - (node.dimension && node.dimension.width || 20) / 2 || 0) + ", " + (node.y - (node.dimension && node.dimension.height || 20) / 2 || 0) + ")" }));
        });
        this.outputGraph.edges = this.d3Graph.edges.map(function (edge) {
            return (__assign({}, edge, { source: toD3Node(edge.source).id, target: toD3Node(edge.target).id, points: [
                    {
                        x: toD3Node(edge.source).x,
                        y: toD3Node(edge.source).y,
                    },
                    {
                        x: toD3Node(edge.target).x,
                        y: toD3Node(edge.target).y,
                    },
                ] }));
        });
        this.outputGraph.edgeLabels = this.outputGraph.edges;
        return this.outputGraph;
    };
    D3ForceDirectedLayout.prototype.onDragStart = function (draggingNode, $event) {
        this.settings.force.alphaTarget(0.3).restart();
        var node = this.d3Graph.nodes.find(function (d3Node) { return d3Node.id === draggingNode.id; });
        if (!node) {
            return;
        }
        this.draggingStart = { x: $event.x - node.x, y: $event.y - node.y };
        node.fx = $event.x - this.draggingStart.x;
        node.fy = $event.y - this.draggingStart.y;
    };
    D3ForceDirectedLayout.prototype.onDrag = function (draggingNode, $event) {
        if (!draggingNode)
            return;
        var node = this.d3Graph.nodes.find(function (d3Node) { return d3Node.id === draggingNode.id; });
        if (!node) {
            return;
        }
        node.fx = $event.x - this.draggingStart.x;
        node.fy = $event.y - this.draggingStart.y;
    };
    D3ForceDirectedLayout.prototype.onDragEnd = function (draggingNode, $event) {
        if (!draggingNode)
            return;
        var node = this.d3Graph.nodes.find(function (d3Node) { return d3Node.id === draggingNode.id; });
        if (!node) {
            return;
        }
        this.settings.force.alphaTarget(0);
        node.fx = undefined;
        node.fy = undefined;
    };
    return D3ForceDirectedLayout;
}());
export { D3ForceDirectedLayout };
//# sourceMappingURL=d3ForceDirected.js.map