var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
import { id } from '../../utils';
import * as dagre from 'dagre';
import { Orientation } from './dagre';
var DagreClusterLayout = /** @class */ (function () {
    function DagreClusterLayout() {
        this.defaultSettings = {
            orientation: Orientation.LEFT_TO_RIGHT,
            marginX: 20,
            marginY: 20,
            edgePadding: 100,
            rankPadding: 100,
            nodePadding: 50,
        };
        this.settings = {};
    }
    DagreClusterLayout.prototype.run = function (graph) {
        var _this = this;
        this.createDagreGraph(graph);
        dagre.layout(this.dagreGraph);
        graph.edgeLabels = this.dagreGraph._edgeLabels;
        var dagreToOutput = function (node) {
            var dagreNode = _this.dagreGraph._nodes[node.id];
            return __assign({}, node, { position: {
                    x: dagreNode.x,
                    y: dagreNode.y
                }, dimension: {
                    width: dagreNode.width,
                    height: dagreNode.height
                } });
        };
        graph.clusters = (graph.clusters || []).map(dagreToOutput);
        graph.nodes = graph.nodes.map(dagreToOutput);
        return graph;
    };
    DagreClusterLayout.prototype.updateEdge = function (graph, edge) {
        var sourceNode = graph.nodes.find(function (n) { return n.id === edge.source; });
        var targetNode = graph.nodes.find(function (n) { return n.id === edge.target; });
        // determine new arrow position
        var dir = sourceNode.position.y <= targetNode.position.y ? -1 : 1;
        var startingPoint = {
            x: sourceNode.position.x,
            y: sourceNode.position.y - dir * (sourceNode.dimension.height / 2)
        };
        var endingPoint = {
            x: targetNode.position.x,
            y: targetNode.position.y + dir * (targetNode.dimension.height / 2)
        };
        // generate new points
        edge.points = [startingPoint, endingPoint];
        return graph;
    };
    DagreClusterLayout.prototype.createDagreGraph = function (graph) {
        var _this = this;
        this.dagreGraph = new dagre.graphlib.Graph({ compound: true });
        var settings = Object.assign({}, this.defaultSettings, this.settings);
        this.dagreGraph.setGraph({
            rankdir: settings.orientation,
            marginx: settings.marginX,
            marginy: settings.marginY,
            edgesep: settings.edgePadding,
            ranksep: settings.rankPadding,
            nodesep: settings.nodePadding,
            align: settings.align,
            acyclicer: settings.acyclicer,
            ranker: settings.ranker,
        });
        // Default to assigning a new object as a label for each new edge.
        this.dagreGraph.setDefaultEdgeLabel(function () {
            return {};
        });
        this.dagreNodes = graph.nodes.map(function (n) {
            var node = Object.assign({}, n);
            node.width = n.dimension.width;
            node.height = n.dimension.height;
            node.x = n.position.x;
            node.y = n.position.y;
            return node;
        });
        this.dagreClusters = graph.clusters || [];
        this.dagreEdges = graph.edges.map(function (l) {
            var newLink = Object.assign({}, l);
            if (!newLink.id)
                newLink.id = id();
            return newLink;
        });
        for (var _i = 0, _a = this.dagreNodes; _i < _a.length; _i++) {
            var node = _a[_i];
            this.dagreGraph.setNode(node.id, node);
        }
        var _loop_1 = function (cluster) {
            this_1.dagreGraph.setNode(cluster.id, cluster);
            cluster.childNodeIds.forEach(function (childNodeId) {
                _this.dagreGraph.setParent(childNodeId, cluster.id);
            });
        };
        var this_1 = this;
        for (var _b = 0, _c = this.dagreClusters; _b < _c.length; _b++) {
            var cluster = _c[_b];
            _loop_1(cluster);
        }
        // update dagre
        for (var _d = 0, _e = this.dagreEdges; _d < _e.length; _d++) {
            var edge = _e[_d];
            this.dagreGraph.setEdge(edge.source, edge.target);
        }
        return this.dagreGraph;
    };
    return DagreClusterLayout;
}());
export { DagreClusterLayout };
//# sourceMappingURL=dagreCluster.js.map