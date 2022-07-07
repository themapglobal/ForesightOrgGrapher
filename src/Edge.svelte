<script>
    import ControlPoint from "./ControlPoint.svelte";
    import { getGraphNode } from "./graphutil.js";
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    export let item;
    export let graph; // is useful when drawing edges
    export let isSelected;

    $: fromNode = item.fromOrphan || getGraphNode(item.fromId, graph);
    $: toNode = item.toOrphan || getGraphNode(item.toId, graph);
    $: fromPos = { x: fromNode.pos.x, y: fromNode.pos.y };
    $: toPos = { x: toNode.pos.x, y: toNode.pos.y };

    function getEdgePath(graph) {
        let shape = item.shape || graph.theme.edgeshape;
        if (shape === "straight") {
            return `M ${fromPos.x},${fromPos.y} L ${toPos.x},${toPos.y}`;
        } else if (shape === "curved") {
            let fromControlPoint = {
                x: fromNode.pos.x + 30,
                y: fromNode.pos.y + 30,
            };
            let toControlPoint = { x: toNode.pos.x - 30, y: toNode.pos.y - 30 };
            return [
                `M ${fromPos.x},${fromPos.y}`,
                `C`,
                `${fromControlPoint.x},${fromControlPoint.y}`,
                `${toControlPoint.x},${toControlPoint.y}`,
                `${toPos.x},${toPos.y}`,
            ].join(" ");
        } else if (shape === "ortho") {
            return `M ${fromPos.x},${fromPos.y} h ${
                (toPos.x - fromPos.x) / 2
            } v ${toPos.y - fromPos.y} L ${toPos.x},${toPos.y}`;
        }
    }

    function handleControlClicked(e) {
        let control = e.target.getAttribute("data-handle");
        // console.log("handleControlClicked", control)
        if (control === "from" && item.fromId) {
            // detach fromNode
            delete item.fromId;
            item.fromOrphan = { pos: { x: fromPos.x, y: fromPos.y } };
        } else if (control === "to" && item.toId) {
            // detach toNode
            delete item.toId;
            item.toOrphan = { pos: { x: toPos.x, y: toPos.y } };
        }
        dispatch("edgeChanged", { source: item });
    }
    function getDashArray(strokeType) {
        if (strokeType === "dashed") return "8,5";
        else if (strokeType === "dotted") return "5,5";
        else return false;
    }

    //    textpath angle
    function getTransformLabel(fromNode, toNode) {
        let midPointx = (fromNode.pos.x + toNode.pos.x) / 2;
        let midPointy = (fromNode.pos.y + toNode.pos.y) / 2;
        let angle =
            (Math.atan2(
                toNode.pos.y - fromNode.pos.y,
                toNode.pos.x - fromNode.pos.x
            ) *
                180) /
            Math.PI;
        if (angle < -90 || angle > 90)
            return `translate(0, -6) rotate(180, ${midPointx}, ${midPointy})`;
        else return "translate(0, -6) rotate(0)";
    }

    $: labelTransform =
        fromNode && toNode && getTransformLabel(fromNode, toNode);
</script>

<g>
    <path
        d={getEdgePath(graph)}
        fill="none"
        stroke={isSelected
            ? graph.theme.selectionColor
            : item.stroke || graph.theme.edgestroke}
        stroke-width="5"
        class="edgePath"
        id={`edgepathmain${item.id}`}
        stroke-dasharray={getDashArray(
            item.strokeType || graph.theme.edgestroketype
        )}
        on:mousedown|stopPropagation={(e) =>
            dispatch("itemMouseDown", { source: item, rawEvent: e })}
        on:mouseup|stopPropagation={(e) =>
            dispatch("itemMouseUp", { source: item, rawEvent: e })}
        on:click|stopPropagation
    />

    <!-- this path is created to add offset for label and arrow -->
    <path
        d={getEdgePath(graph)}
        fill="none"
        stroke="transparent"
        stroke-width="5"
        transform={labelTransform}
        id={`edgepath${item.id}`}
    />

    <text
        font-family={graph.theme.font}
        font-size="20"
        fill={item.stroke}
        on:mousedown|stopPropagation={(e) =>
            dispatch("itemMouseDown", { source: item, rawEvent: e })}
        on:mouseup|stopPropagation={(e) =>
            dispatch("itemMouseUp", { source: item, rawEvent: e })}
        on:click|stopPropagation
    >
        <textPath
            href={`#edgepath${item.id}`}
            startOffset="40%"
            lengthAdjust="spacingAndGlyphs"
            font-family="Verdana"
            font-size="20"
            fill={isSelected
                ? graph.theme.selectionColor
                : item.stroke || graph.theme.edgestroke}
            stroke={isSelected
                ? graph.theme.selectionColor
                : item.stroke || graph.theme.edgestroke}
            on:mousedown|stopPropagation={(e) =>
                dispatch("itemMouseDown", { source: item, rawEvent: e })}
            on:mouseup|stopPropagation={(e) =>
                dispatch("itemMouseUp", { source: item, rawEvent: e })}
            on:click|stopPropagation
        >
            {item.label}
        </textPath>
        {#if item.directed}
            <textPath
                href={`#edgepathmain${item.id}`}
                startOffset="20%"
                lengthAdjust="spacingAndGlyphs"
                font-family="Verdana"
                font-size="20"
                start
                fill={isSelected
                    ? graph.theme.selectionColor
                    : item.stroke || graph.theme.edgestroke}
                stroke={isSelected
                    ? graph.theme.selectionColor
                    : item.stroke || graph.theme.edgestroke}
                on:mousedown|stopPropagation={(e) =>
                    dispatch("itemMouseDown", { source: item, rawEvent: e })}
                on:mouseup|stopPropagation={(e) =>
                    dispatch("itemMouseUp", { source: item, rawEvent: e })}
                on:click|stopPropagation
            >
                ----&gt;
            </textPath>
        {/if}
    </text>

    {#if isSelected && fromPos}
        <ControlPoint
            kind="cross"
            data="from"
            on:click={handleControlClicked}
            x={fromPos.x}
            y={fromPos.y}
            title="Detach from Node"
            size={4}
        />
    {/if}

    {#if isSelected && toPos}
        <ControlPoint
            kind="cross"
            data="to"
            on:click={handleControlClicked}
            x={toPos.x}
            y={toPos.y}
            title="Detach from Node"
            size={4}
        />
    {/if}
</g>

<style>
    g:hover text,
    g:hover textPath {
        fill: blue;
        stroke: blue;
    }

    g:hover path.edgePath {
        stroke: blue;
    }

    text {
        cursor: pointer;
        user-select: none;
    }

    path {
        cursor: pointer;
    }
</style>
