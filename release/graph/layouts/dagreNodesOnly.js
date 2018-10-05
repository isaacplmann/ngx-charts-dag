import { id } from '../../utils';
import * as dagre from 'dagre';
export var Orientation;
(function (Orientation) {
    Orientation["LEFT_TO_RIGHT"] = "LR";
    Orientation["RIGHT_TO_LEFT"] = "RL";
    Orientation["TOP_TO_BOTTOM"] = "TB";
    Orientation["BOTTOM_TO_TOM"] = "BT";
})(Orientation || (Orientation = {}));
export var Alignment;
(function (Alignment) {
    Alignment["CENTER"] = "C";
    Alignment["UP_LEFT"] = "UL";
    Alignment["UP_RIGHT"] = "UR";
    Alignment["DOWN_LEFT"] = "DL";
    Alignment["DOWN_RIGHT"] = "DR";
})(Alignment || (Alignment = {}));
var DEFAULT_EDGE_NAME = '\x00';
var GRAPH_NODE = '\x00';
var EDGE_KEY_DELIM = '\x01';
var DagreNodesOnlyLayout = /** @class */ (function () {
    function DagreNodesOnlyLayout() {
        this.defaultSettings = {
            orientation: Orientation.LEFT_TO_RIGHT,
            marginX: 20,
            marginY: 20,
            edgePadding: 100,
            rankPadding: 100,
            nodePadding: 50,
            curveDistance: 20,
        };
        this.settings = {};
    }
    DagreNodesOnlyLayout.prototype.run = function (graph) {
        this.createDagreGraph(graph);
        dagre.layout(this.dagreGraph);
        graph.edgeLabels = this.dagreGraph._edgeLabels;
        var _loop_1 = function (dagreNodeId) {
            var dagreNode = this_1.dagreGraph._nodes[dagreNodeId];
            var node = graph.nodes.find(function (n) { return n.id === dagreNode.id; });
            node.position = {
                x: dagreNode.x,
                y: dagreNode.y
            };
            node.dimension = {
                width: dagreNode.width,
                height: dagreNode.height
            };
        };
        var this_1 = this;
        for (var dagreNodeId in this.dagreGraph._nodes) {
            _loop_1(dagreNodeId);
        }
        for (var _i = 0, _a = graph.edges; _i < _a.length; _i++) {
            var edge = _a[_i];
            this.updateEdge(graph, edge);
        }
        return graph;
    };
    DagreNodesOnlyLayout.prototype.updateEdge = function (graph, edge) {
        var sourceNode = graph.nodes.find(function (n) { return n.id === edge.source; });
        var targetNode = graph.nodes.find(function (n) { return n.id === edge.target; });
        var rankAxis = (this.settings.orientation === 'BT' || this.settings.orientation === 'TB') ? 'y' : 'x';
        var orderAxis = rankAxis === 'y' ? 'x' : 'y';
        var rankDimension = rankAxis === 'y' ? 'height' : 'width';
        // determine new arrow position
        var dir = sourceNode.position[rankAxis] <= targetNode.position[rankAxis] ? -1 : 1;
        var startingPoint = (_a = {},
            _a[orderAxis] = sourceNode.position[orderAxis],
            _a[rankAxis] = sourceNode.position[rankAxis] - dir * (sourceNode.dimension[rankDimension] / 2),
            _a);
        var endingPoint = (_b = {},
            _b[orderAxis] = targetNode.position[orderAxis],
            _b[rankAxis] = targetNode.position[rankAxis] + dir * (targetNode.dimension[rankDimension] / 2),
            _b);
        var curveDistance = this.settings.curveDistance || this.defaultSettings.curveDistance;
        // generate new points
        edge.points = [
            startingPoint,
            (_c = {},
                _c[orderAxis] = startingPoint[orderAxis],
                _c[rankAxis] = startingPoint[rankAxis] - dir * curveDistance,
                _c),
            (_d = {},
                _d[orderAxis] = endingPoint[orderAxis],
                _d[rankAxis] = endingPoint[rankAxis] + dir * curveDistance,
                _d),
            endingPoint,
        ];
        var edgeLabelId = "" + edge.source + EDGE_KEY_DELIM + edge.target + EDGE_KEY_DELIM + DEFAULT_EDGE_NAME;
        var matchingEdgeLabel = graph.edgeLabels[edgeLabelId];
        if (matchingEdgeLabel) {
            matchingEdgeLabel.points = edge.points;
        }
        return graph;
        var _a, _b, _c, _d;
    };
    DagreNodesOnlyLayout.prototype.createDagreGraph = function (graph) {
        this.dagreGraph = new dagre.graphlib.Graph();
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
        this.dagreEdges = graph.edges.map(function (l) {
            var newLink = Object.assign({}, l);
            if (!newLink.id)
                newLink.id = id();
            return newLink;
        });
        for (var _i = 0, _a = this.dagreNodes; _i < _a.length; _i++) {
            var node = _a[_i];
            if (!node.width) {
                node.width = 20;
            }
            if (!node.height) {
                node.height = 30;
            }
            // update dagre
            this.dagreGraph.setNode(node.id, node);
        }
        // update dagre
        for (var _b = 0, _c = this.dagreEdges; _b < _c.length; _b++) {
            var edge = _c[_b];
            this.dagreGraph.setEdge(edge.source, edge.target);
        }
        return this.dagreGraph;
    };
    return DagreNodesOnlyLayout;
}());
export { DagreNodesOnlyLayout };
//# sourceMappingURL=dagreNodesOnly.js.map