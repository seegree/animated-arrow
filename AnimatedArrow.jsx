#target aftereffects
#targetengine "animatedArrowMVP"

(function animatedArrowPanel(thisObj) {
    var SCRIPT_NAME = "Animated Arrow";
    var DEFAULT_STROKE_WIDTH = 3;
    var DEFAULT_HEAD_SIZE = 27;
    var DEFAULT_DURATION = 0.5;
    var LABEL_WIDTH = 82;
    var selectedColor = [1, 1, 1];
    var selectedColorIsMixed = false;
    var isSyncingControls = false;

    function buildUI(host) {
        var panel = (host instanceof Panel)
            ? host
            : new Window("palette", SCRIPT_NAME, undefined, { resizeable: true });

        panel.orientation = "column";
        panel.alignChildren = ["fill", "top"];
        panel.spacing = 5;
        panel.margins = 10;

        var strokeRow = addNumberRow(panel, "Stroke width", DEFAULT_STROKE_WIDTH);
        var headRow = addNumberRow(panel, "Head size", DEFAULT_HEAD_SIZE);
        var durationRow = addNumberRow(panel, "Duration", DEFAULT_DURATION);
        durationRow.input.helpTip = "Animation length in seconds";
        var easingRow = addDropdownRow(
            panel,
            "Easing",
            ["Linear", "Easy Ease", "Ease In", "Ease Out"],
            1
        );
        var styleRow = addDropdownRow(
            panel,
            "Head style",
            ["Triangle", "Circle", "Chevron", "Diamond"],
            0
        );
        var headsRow = addDropdownRow(
            panel,
            "Head at",
            ["End", "Start"],
            0
        );

        var colorRow = panel.add("group");
        colorRow.orientation = "row";
        colorRow.alignChildren = ["left", "center"];
        colorRow.spacing = 6;
        var colorLabel = colorRow.add("statictext", undefined, "Color");
        colorLabel.preferredSize.width = LABEL_WIDTH;
        var colorButton = colorRow.add("button", undefined, "");
        colorButton.preferredSize = [44, 20];
        colorButton.helpTip = "Choose arrow color";
        var colorValue = colorRow.add("statictext", undefined, "#FFFFFF");
        colorValue.characters = 8;
        var refreshButton = colorRow.add("button", undefined, "\u21BB");
        refreshButton.preferredSize = [22, 20];
        refreshButton.minimumSize = [22, 20];
        refreshButton.maximumSize = [22, 20];
        refreshButton.alignment = ["left", "center"];
        refreshButton.helpTip = "Load settings from selected arrows";
        var hideSourceCheckbox = panel.add(
            "checkbox",
            undefined,
            "Hide source layer after creation"
        );
        hideSourceCheckbox.value = true;

        colorButton.onDraw = function () {
            var graphics = this.graphics;
            graphics.drawOSControl();
            if (selectedColorIsMixed) {
                drawMixedSwatch(graphics, this.size[0], this.size[1]);
            } else {
                graphics.rectPath(4, 4, this.size[0] - 8, this.size[1] - 8);
                graphics.fillPath(
                    graphics.newBrush(graphics.BrushType.SOLID_COLOR, selectedColor)
                );
            }
            graphics.rectPath(4, 4, this.size[0] - 8, this.size[1] - 8);
            graphics.strokePath(
                graphics.newPen(
                    graphics.PenType.SOLID_COLOR,
                    [0.25, 0.25, 0.25],
                    1
                )
            );
        };

        var createButton = panel.add("button", undefined, "Create Arrow");
        createButton.alignment = ["fill", "top"];
        createButton.preferredSize.height = 32;
        createButton.helpTip =
            "Create an animated arrow from the selected paths.\n" +
            "Alt/Option-click to create a finished, static arrow (no keyframes).";
        var reverseButton = panel.add("button", undefined, "Reverse Direction");
        reverseButton.alignment = ["fill", "top"];
        reverseButton.helpTip = "Reverse the direction of selected generated arrows.";

        colorButton.onClick = function () {
            var picked = $.colorPicker();
            if (picked >= 0) {
                selectedColor = integerToRgb(picked);
                selectedColorIsMixed = false;
                colorValue.text = rgbToHex(selectedColor);
                colorButton.notify("onDraw");
                updateSelectedArrows({ color: selectedColor });
            }
        };

        strokeRow.input.onChange = function () {
            if (isSyncingControls) {
                return;
            }
            var value = parsePositiveNumber(strokeRow.input.text, "Stroke width", true);
            if (value !== null) {
                updateSelectedArrows({ strokeWidth: value });
            }
        };

        headRow.input.onChange = function () {
            if (isSyncingControls) {
                return;
            }
            var value = parsePositiveNumber(headRow.input.text, "Arrowhead size", true);
            if (value !== null) {
                updateSelectedArrows({ headSize: value });
            }
        };

        durationRow.input.onChange = function () {
            if (isSyncingControls) {
                return;
            }
            var value = parsePositiveNumber(durationRow.input.text, "Duration", true);
            if (value !== null) {
                updateSelectedArrows({ duration: value });
            }
        };

        easingRow.input.onChange = function () {
            if (!isSyncingControls && easingRow.input.selection !== null) {
                updateSelectedArrows({ easing: easingRow.input.selection.text });
            }
        };

        styleRow.input.onChange = function () {
            if (!isSyncingControls && styleRow.input.selection !== null) {
                updateSelectedArrows({ style: styleRow.input.selection.text });
            }
        };

        headsRow.input.onChange = function () {
            if (!isSyncingControls && headsRow.input.selection !== null) {
                updateSelectedArrows({ heads: headsRow.input.selection.text });
            }
        };

        createButton.onClick = function () {
            var strokeWidth = parsePositiveNumber(strokeRow.input.text, "Stroke width");
            if (strokeWidth === null) {
                return;
            }

            var headSize = parsePositiveNumber(headRow.input.text, "Arrowhead size");
            if (headSize === null) {
                return;
            }

            var duration = parsePositiveNumber(durationRow.input.text, "Duration");
            if (duration === null) {
                return;
            }
            if (
                easingRow.input.selection === null ||
                styleRow.input.selection === null ||
                headsRow.input.selection === null ||
                selectedColorIsMixed
            ) {
                alert(
                    "Choose concrete values for all mixed arrow settings before creating.",
                    SCRIPT_NAME
                );
                return;
            }

            var animate = !ScriptUI.environment.keyboardState.altKey;

            createArrows(
                strokeWidth,
                headSize,
                duration,
                selectedColor,
                easingRow.input.selection.text,
                styleRow.input.selection.text,
                headsRow.input.selection.text,
                hideSourceCheckbox.value,
                animate
            );
        };

        reverseButton.onClick = reverseSelectedArrows;

        function syncControlsFromSelection() {
            var values = readSelectedArrowSettings();
            if (values === null) {
                return;
            }

            isSyncingControls = true;
            try {
                strokeRow.input.text = displayNumber(values.strokeWidth);
                headRow.input.text = displayNumber(values.headSize);
                durationRow.input.text = displayNumber(values.duration);
                setDropdownValue(easingRow.input, values.easing);
                setDropdownValue(styleRow.input, values.style);
                setDropdownValue(headsRow.input, values.heads);

                if (values.color === null) {
                    selectedColorIsMixed = true;
                    colorValue.text = "<Mixed>";
                } else {
                    selectedColor = values.color;
                    selectedColorIsMixed = false;
                    colorValue.text = rgbToHex(selectedColor);
                }
                colorButton.notify("onDraw");
            } finally {
                isSyncingControls = false;
            }
        }

        panel.onActivate = syncControlsFromSelection;
        panel.addEventListener("focus", syncControlsFromSelection, true);
        refreshButton.onClick = syncControlsFromSelection;

        panel.onResizing = panel.onResize = function () {
            this.layout.resize();
        };

        panel.layout.layout(true);
        return panel;
    }

    function addNumberRow(parent, label, defaultValue) {
        var row = parent.add("group");
        row.orientation = "row";
        row.alignChildren = ["left", "center"];
        row.spacing = 6;

        var labelControl = row.add("statictext", undefined, label);
        labelControl.preferredSize.width = LABEL_WIDTH;

        var input = row.add("edittext", undefined, String(defaultValue));
        input.characters = 6;

        return {
            row: row,
            input: input
        };
    }

    function addDropdownRow(parent, label, items, selectedIndex) {
        var row = parent.add("group");
        row.orientation = "row";
        row.alignChildren = ["left", "center"];
        row.spacing = 6;

        var labelControl = row.add("statictext", undefined, label);
        labelControl.preferredSize.width = LABEL_WIDTH;

        var input = row.add("dropdownlist", undefined, items);
        input.selection = selectedIndex;
        input.preferredSize.width = 96;

        return {
            row: row,
            input: input
        };
    }

    function drawMixedSwatch(graphics, width, height) {
        var x = 4;
        var y = 4;
        var innerWidth = width - 8;
        var innerHeight = height - 8;
        var halfWidth = innerWidth / 2;
        var halfHeight = innerHeight / 2;
        var light = graphics.newBrush(
            graphics.BrushType.SOLID_COLOR,
            [0.72, 0.72, 0.72]
        );
        var dark = graphics.newBrush(
            graphics.BrushType.SOLID_COLOR,
            [0.42, 0.42, 0.42]
        );

        fillRectangle(graphics, x, y, halfWidth, halfHeight, light);
        fillRectangle(graphics, x + halfWidth, y, halfWidth, halfHeight, dark);
        fillRectangle(graphics, x, y + halfHeight, halfWidth, halfHeight, dark);
        fillRectangle(
            graphics,
            x + halfWidth,
            y + halfHeight,
            halfWidth,
            halfHeight,
            light
        );
    }

    function fillRectangle(graphics, x, y, width, height, brush) {
        graphics.rectPath(x, y, width, height);
        graphics.fillPath(brush);
    }

    function displayNumber(value) {
        if (value === null) {
            return "--";
        }
        return String(Math.round(value * 1000) / 1000);
    }

    function setDropdownValue(dropdown, value) {
        var i;
        dropdown.selection = null;
        if (value === null) {
            return;
        }

        for (i = 0; i < dropdown.items.length; i += 1) {
            if (dropdown.items[i].text === value) {
                dropdown.selection = i;
                return;
            }
        }
    }

    function parsePositiveNumber(text, label, quiet) {
        var value = parseFloat(text);
        if (isNaN(value) || value <= 0) {
            if (!quiet) {
                alert(label + " must be a number greater than zero.", SCRIPT_NAME);
            }
            return null;
        }
        return value;
    }

    function integerToRgb(value) {
        return [
            ((value >> 16) & 255) / 255,
            ((value >> 8) & 255) / 255,
            (value & 255) / 255
        ];
    }

    function rgbToHex(rgb) {
        function channelToHex(channel) {
            var value = Math.round(channel * 255).toString(16).toUpperCase();
            return value.length === 1 ? "0" + value : value;
        }

        return "#" +
            channelToHex(rgb[0]) +
            channelToHex(rgb[1]) +
            channelToHex(rgb[2]);
    }

    function createArrows(
        strokeWidth,
        headSize,
        duration,
        color,
        easing,
        style,
        heads,
        hideSourceLayers,
        animate
    ) {
        var comp = app.project ? app.project.activeItem : null;
        if (!(comp instanceof CompItem)) {
            alert("Open a composition and select one or more paths.", SCRIPT_NAME);
            return;
        }

        var pathProperties = findSelectedPathProperties(comp);
        if (pathProperties.length === 0) {
            alert(
                "Select one or more Mask Path or Bezier shape Path properties.",
                SCRIPT_NAME
            );
            return;
        }

        app.beginUndoGroup(
            pathProperties.length === 1 ? "Create Animated Arrow" : "Create Animated Arrows"
        );
        var createdLayers = [];
        var sourceLayers = uniqueSourceLayers(pathProperties);
        var i;

        try {
            for (i = 0; i < pathProperties.length; i += 1) {
                var layerCountBefore = comp.numLayers;
                try {
                    createdLayers.push(
                        createArrowFromPath(
                            comp,
                            pathProperties[i],
                            strokeWidth,
                            headSize,
                            duration,
                            color,
                            easing,
                            style,
                            heads,
                            animate
                        )
                    );
                } catch (pathError) {
                    if (comp.numLayers > layerCountBefore) {
                        try {
                            comp.layer(1).remove();
                        } catch (partialCleanupError) {
                            // The partial layer may already have been removed.
                        }
                    }
                    throw pathError;
                }
            }

            for (i = 1; i <= comp.numLayers; i += 1) {
                comp.layer(i).selected = false;
            }
            for (i = 0; i < createdLayers.length; i += 1) {
                createdLayers[i].selected = true;
            }
            if (hideSourceLayers) {
                for (i = 0; i < sourceLayers.length; i += 1) {
                    sourceLayers[i].enabled = false;
                }
            }
        } catch (error) {
            for (i = 0; i < createdLayers.length; i += 1) {
                try {
                    createdLayers[i].remove();
                } catch (cleanupError) {
                    // The layer reference may already be invalid after an AE error.
                }
            }
            alert("The arrows could not be created.\n\n" + error.toString(), SCRIPT_NAME);
        } finally {
            app.endUndoGroup();
        }
    }

    function uniqueSourceLayers(pathProperties) {
        var layers = [];
        var i;
        var j;

        for (i = 0; i < pathProperties.length; i += 1) {
            var layer = pathProperties[i].propertyGroup(pathProperties[i].propertyDepth);
            var alreadyIncluded = false;

            for (j = 0; j < layers.length; j += 1) {
                if (layers[j] === layer) {
                    alreadyIncluded = true;
                    break;
                }
            }

            if (!alreadyIncluded) {
                layers.push(layer);
            }
        }

        return layers;
    }

    function createArrowFromPath(
        comp,
        sourcePath,
        strokeWidth,
        headSize,
        duration,
        color,
        easing,
        style,
        heads,
        animate
    ) {
        var sourceLayer = sourcePath.propertyGroup(sourcePath.propertyDepth);
        var sourceShape = sourcePath.valueAtTime(comp.time, false);

        if (!sourceShape || !sourceShape.vertices || sourceShape.vertices.length < 2) {
            throw new Error("Each selected path needs at least two vertices.");
        }

        var arrowLayer = comp.layers.addShape();
        arrowLayer.name = uniqueLayerName(comp, sourceLayer.name + " - Animated Arrow");
        arrowLayer.label = sourceLayer.label;
        arrowLayer.comment = "Animated Arrow";

        configureLayerSpace(arrowLayer, sourceLayer);

        var rootContents = arrowLayer.property("ADBE Root Vectors Group");
        var targetContents = copyShapeGroupHierarchy(
            sourcePath,
            rootContents,
            comp.time
        );

        var arrowGroup = targetContents.addProperty("ADBE Vector Group");
        arrowGroup.name = "Arrow Geometry";
        var arrowContents = arrowGroup.property("ADBE Vectors Group");

        var pathGroup = arrowContents.addProperty("ADBE Vector Shape - Group");
        pathGroup.name = "Arrow Path";
        var pathIndex = pathGroup.propertyIndex;

        var stroke = arrowContents.addProperty("ADBE Vector Graphic - Stroke");
        stroke.name = "Arrow Stroke";
        var strokeIndex = stroke.propertyIndex;

        var trim = arrowContents.addProperty("ADBE Vector Filter - Trim");
        trim.name = "Draw On";
        var trimIndex = trim.propertyIndex;

        pathGroup = arrowContents.property(pathIndex);
        pathGroup.property("ADBE Vector Shape").setValue(sourceShape);

        stroke = arrowContents.property(strokeIndex);
        stroke.property("ADBE Vector Stroke Color").setValue(color);
        stroke.property("ADBE Vector Stroke Width").setValue(strokeWidth);
        stroke.property("ADBE Vector Stroke Line Cap").setValue(1);
        stroke.property("ADBE Vector Stroke Line Join").setValue(2);

        trim = arrowContents.property(trimIndex);
        var trimEnd = trim.property("ADBE Vector Trim End");
        trim.property("ADBE Vector Trim Start").setValue(0);
        trim.property("ADBE Vector Trim Offset").setValue(0);
        if (animate) {
            trimEnd.setValueAtTime(comp.time, 0);
            trimEnd.setValueAtTime(comp.time + duration, 100);
            applyEasing(trimEnd, easing);
        } else {
            trimEnd.setValue(100);
        }

        var pathReference = makeExpressionReference(arrowGroup);
        if (heads === "End") {
            var endHead = addArrowhead(
                arrowContents,
                "End Arrowhead",
                headSize,
                color,
                style
            );
            applyArrowheadExpressions(endHead, pathReference, false);
        }
        if (heads === "Start") {
            var startHead = addArrowhead(
                arrowContents,
                "Start Arrowhead",
                headSize,
                color,
                style
            );
            applyArrowheadExpressions(startHead, pathReference, true);
        }

        return arrowLayer;
    }

    function findSelectedPathProperties(comp) {
        var selected = comp.selectedProperties;
        var paths = [];
        var i;

        for (i = 0; i < selected.length; i += 1) {
            if (
                selected[i].matchName === "ADBE Vector Shape" ||
                selected[i].matchName === "ADBE Mask Shape"
            ) {
                paths.push(selected[i]);
            }
        }

        return paths;
    }

    function configureLayerSpace(arrowLayer, sourceLayer) {
        arrowLayer.threeDLayer = sourceLayer.threeDLayer;
        arrowLayer.parent = sourceLayer;

        var transform = arrowLayer.property("ADBE Transform Group");
        transform.property("ADBE Anchor Point").setValue(
            sourceLayer.threeDLayer ? [0, 0, 0] : [0, 0]
        );
        transform.property("ADBE Position").setValue(
            sourceLayer.threeDLayer ? [0, 0, 0] : [0, 0]
        );
        transform.property("ADBE Scale").setValue(
            sourceLayer.threeDLayer ? [100, 100, 100] : [100, 100]
        );
        transform.property("ADBE Rotate Z").setValue(0);

        if (sourceLayer.threeDLayer) {
            transform.property("ADBE Orientation").setValue([0, 0, 0]);
            transform.property("ADBE Rotate X").setValue(0);
            transform.property("ADBE Rotate Y").setValue(0);
        }
    }

    function copyShapeGroupHierarchy(sourcePath, rootContents, sampleTime) {
        var sourceGroups = [];
        var current = sourcePath.parentProperty;
        var i;

        while (current !== null) {
            if (current.matchName === "ADBE Vector Group") {
                sourceGroups.push(current);
            }
            current = current.parentProperty;
        }

        sourceGroups.reverse();

        var targetContents = rootContents;
        for (i = 0; i < sourceGroups.length; i += 1) {
            var copiedGroup = targetContents.addProperty("ADBE Vector Group");
            copiedGroup.name = "Source Transform " + (i + 1);
            copyVectorTransform(
                sourceGroups[i].property("ADBE Vector Transform Group"),
                copiedGroup.property("ADBE Vector Transform Group"),
                sampleTime
            );
            targetContents = copiedGroup.property("ADBE Vectors Group");
        }

        return targetContents;
    }

    function copyVectorTransform(sourceTransform, targetTransform, sampleTime) {
        var matchNames = [
            "ADBE Vector Anchor",
            "ADBE Vector Position",
            "ADBE Vector Scale",
            "ADBE Vector Skew",
            "ADBE Vector Skew Axis",
            "ADBE Vector Rotation",
            "ADBE Vector Group Opacity"
        ];
        var i;

        for (i = 0; i < matchNames.length; i += 1) {
            var sourceProperty = sourceTransform.property(matchNames[i]);
            var targetProperty = targetTransform.property(matchNames[i]);
            if (sourceProperty !== null && targetProperty !== null) {
                targetProperty.setValue(sourceProperty.valueAtTime(sampleTime, false));
            }
        }
    }

    function addArrowhead(parentContents, name, size, color, style) {
        var headGroup = parentContents.addProperty("ADBE Vector Group");
        headGroup.name = name;
        var contents = headGroup.property("ADBE Vectors Group");

        var headPathGroup = contents.addProperty("ADBE Vector Shape - Group");
        headPathGroup.name = "Arrowhead Path";
        var pathIndex = headPathGroup.propertyIndex;

        var fill = contents.addProperty("ADBE Vector Graphic - Fill");
        fill.name = "Arrowhead Fill";
        var fillIndex = fill.propertyIndex;

        headPathGroup = contents.property(pathIndex);
        headPathGroup.property("ADBE Vector Shape").setValue(
            makeArrowheadShape(size, style)
        );

        fill = contents.property(fillIndex);
        fill.property("ADBE Vector Fill Color").setValue(color);
        fill.property("ADBE Vector Fill Opacity").setValue(100);
        return headGroup;
    }

    function makeArrowheadShape(size, style) {
        var headShape = new Shape();
        var vertices;

        if (style === "Circle") {
            var radius = size / 2;
            var tangent = radius * 0.5522847498;
            vertices = [
                [0, 0],
                [-radius, radius],
                [-size, 0],
                [-radius, -radius]
            ];
            headShape.inTangents = [
                [0, -tangent],
                [tangent, 0],
                [0, tangent],
                [-tangent, 0]
            ];
            headShape.outTangents = [
                [0, tangent],
                [-tangent, 0],
                [0, -tangent],
                [tangent, 0]
            ];
        } else if (style === "Chevron") {
            vertices = [
                [0, 0],
                [-size, size * 0.55],
                [-size * 0.7, 0],
                [-size, -size * 0.55]
            ];
        } else if (style === "Diamond") {
            vertices = [
                [0, 0],
                [-size * 0.55, size * 0.45],
                [-size * 1.1, 0],
                [-size * 0.55, -size * 0.45]
            ];
        } else {
            vertices = [
                [0, 0],
                [-size, size * 0.55],
                [-size, -size * 0.55]
            ];
        }

        headShape.vertices = vertices;
        if (style !== "Circle") {
            headShape.inTangents = zeroTangents(vertices.length);
            headShape.outTangents = zeroTangents(vertices.length);
        }
        headShape.closed = true;
        return headShape;
    }

    function zeroTangents(length) {
        var tangents = [];
        var i;
        for (i = 0; i < length; i += 1) {
            tangents.push([0, 0]);
        }
        return tangents;
    }

    function makeExpressionReference(arrowGroup) {
        var names = [];
        var current = arrowGroup;

        while (current !== null && current.matchName !== "ADBE Root Vectors Group") {
            if (current.matchName === "ADBE Vector Group") {
                names.push(current.name);
            }
            current = current.parentProperty;
        }

        names.reverse();

        var reference = "thisLayer";
        var i;
        for (i = 0; i < names.length; i += 1) {
            reference += ".content(\"" + escapeExpressionString(names[i]) + "\")";
        }

        return reference;
    }

    function escapeExpressionString(value) {
        return value.replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
    }

    function applyArrowheadExpressions(headGroup, arrowGroupReference, isStart) {
        var headTransform = headGroup.property("ADBE Vector Transform Group");
        var pathReference = arrowGroupReference + ".content(\"Arrow Path\").path";
        var trimReference = arrowGroupReference + ".content(\"Draw On\").end";
        var strokeWidthReference =
            arrowGroupReference + ".content(\"Arrow Stroke\").strokeWidth";
        var progressExpression = isStart
            ? "0"
            : "Math.max(0, Math.min(1, " + trimReference + " / 100))";
        var offsetSign = isStart ? "-" : "+";
        var rotationOffset = isStart ? " + 180" : "";

        headTransform.property("ADBE Vector Position").expression =
            "var arrowPath = " + pathReference + ";\n" +
            "var progress = " + progressExpression + ";\n" +
            "var direction = arrowPath.tangentOnPath(progress);\n" +
            "arrowPath.pointOnPath(progress) " + offsetSign + " normalize(direction) * " +
            strokeWidthReference + ";";

        headTransform.property("ADBE Vector Rotation").expression =
            "var arrowPath = " + pathReference + ";\n" +
            "var progress = " + progressExpression + ";\n" +
            "var direction = arrowPath.tangentOnPath(progress);\n" +
            "radiansToDegrees(Math.atan2(direction[1], direction[0]))" +
            rotationOffset + ";";
    }

    function readSelectedArrowSettings() {
        var comp = app.project ? app.project.activeItem : null;
        if (!(comp instanceof CompItem)) {
            return null;
        }

        var layers = comp.selectedLayers;
        var values = [];
        var i;

        for (i = 0; i < layers.length; i += 1) {
            var arrowGroup = findArrowGroup(layers[i]);
            if (arrowGroup !== null) {
                try {
                    values.push(readArrowSettings(arrowGroup));
                } catch (error) {
                    // Ignore incomplete or manually altered generated arrows.
                }
            }
        }

        if (values.length === 0) {
            return null;
        }

        return {
            strokeWidth: commonNumber(values, "strokeWidth"),
            headSize: commonNumber(values, "headSize"),
            duration: commonNumber(values, "duration"),
            easing: commonText(values, "easing"),
            style: commonText(values, "style"),
            heads: commonText(values, "heads"),
            color: commonColor(values, "color")
        };
    }

    function readArrowSettings(arrowGroup) {
        var contents = arrowGroup.property("ADBE Vectors Group");
        var stroke = findDirectChild(contents, "Arrow Stroke", "ADBE Vector Graphic - Stroke");
        var trim = findDirectChild(contents, "Draw On", "ADBE Vector Filter - Trim");
        var endHead = findDirectChild(contents, "End Arrowhead", "ADBE Vector Group");
        var startHead = findDirectChild(contents, "Start Arrowhead", "ADBE Vector Group");
        var oldHead = findDirectChild(contents, "Arrowhead", "ADBE Vector Group");

        if (stroke === null || trim === null) {
            throw new Error("Missing arrow properties.");
        }
        if (endHead === null && oldHead !== null) {
            endHead = oldHead;
        }

        var head = endHead !== null ? endHead : startHead;
        if (head === null) {
            throw new Error("Missing arrowhead.");
        }

        var headInfo = readArrowheadInfo(head);
        var trimEnd = trim.property("ADBE Vector Trim End");
        var duration = trimEnd.numKeys >= 2
            ? trimEnd.keyTime(trimEnd.numKeys) - trimEnd.keyTime(1)
            : 0;
        var heads = null;

        if (endHead !== null && startHead === null) {
            heads = "End";
        } else if (startHead !== null && endHead === null) {
            heads = "Start";
        }

        return {
            strokeWidth: stroke.property("ADBE Vector Stroke Width").value,
            headSize: headInfo.size,
            duration: duration,
            easing: inferEasing(trimEnd),
            style: headInfo.style,
            heads: heads,
            color: stroke.property("ADBE Vector Stroke Color").value
        };
    }

    function commonNumber(values, propertyName) {
        var first = values[0][propertyName];
        var i;
        for (i = 1; i < values.length; i += 1) {
            if (Math.abs(values[i][propertyName] - first) > 0.001) {
                return null;
            }
        }
        return first;
    }

    function commonText(values, propertyName) {
        var first = values[0][propertyName];
        var i;
        for (i = 1; i < values.length; i += 1) {
            if (values[i][propertyName] !== first) {
                return null;
            }
        }
        return first;
    }

    function commonColor(values, propertyName) {
        var first = values[0][propertyName];
        var i;
        var channel;
        for (i = 1; i < values.length; i += 1) {
            for (channel = 0; channel < 3; channel += 1) {
                if (Math.abs(values[i][propertyName][channel] - first[channel]) > 0.001) {
                    return null;
                }
            }
        }
        return first;
    }

    function updateSelectedArrows(settings) {
        var comp = app.project ? app.project.activeItem : null;
        if (!(comp instanceof CompItem)) {
            return;
        }

        var layers = comp.selectedLayers;
        var arrows = [];
        var i;

        for (i = 0; i < layers.length; i += 1) {
            var arrowGroup = findArrowGroup(layers[i]);
            if (arrowGroup !== null) {
                arrows.push({
                    layer: layers[i],
                    group: arrowGroup
                });
            }
        }

        if (arrows.length === 0) {
            return;
        }

        app.beginUndoGroup("Update Animated Arrow");

        try {
            for (i = 0; i < arrows.length; i += 1) {
                updateArrow(
                    arrows[i].layer,
                    arrows[i].group,
                    settings
                );
            }
        } catch (error) {
            alert("The selected arrow could not be updated.\n\n" + error.toString(), SCRIPT_NAME);
        } finally {
            app.endUndoGroup();
        }
    }

    function updateArrow(layer, arrowGroup, settings) {
        var contents = arrowGroup.property("ADBE Vectors Group");
        var stroke = findDirectChild(contents, "Arrow Stroke", "ADBE Vector Graphic - Stroke");
        var trim = findDirectChild(contents, "Draw On", "ADBE Vector Filter - Trim");

        if (stroke === null || trim === null) {
            throw new Error("A selected arrow is missing required native properties.");
        }

        if (settings.color !== undefined) {
            stroke.property("ADBE Vector Stroke Color").setValue(settings.color);
        }
        if (settings.strokeWidth !== undefined) {
            stroke.property("ADBE Vector Stroke Width").setValue(settings.strokeWidth);
        }
        stroke.property("ADBE Vector Stroke Line Cap").setValue(1);

        var oldHead = findDirectChild(contents, "Arrowhead", "ADBE Vector Group");
        var endHead = findDirectChild(contents, "End Arrowhead", "ADBE Vector Group");
        var startHead = findDirectChild(contents, "Start Arrowhead", "ADBE Vector Group");

        if (endHead === null && oldHead !== null) {
            oldHead.name = "End Arrowhead";
            endHead = oldHead;
        }

        if (settings.heads !== undefined) {
            var templateHead = endHead !== null ? endHead : startHead;
            var templateInfo = templateHead !== null
                ? readArrowheadInfo(templateHead)
                : {
                    size: 28,
                    style: "Triangle",
                    color: stroke.property("ADBE Vector Stroke Color").value
                };

            if (settings.heads === "Start" && endHead !== null) {
                endHead.remove();
                endHead = null;
            }
            if (settings.heads === "End" && startHead !== null) {
                startHead.remove();
                startHead = null;
            }

            endHead = findDirectChild(contents, "End Arrowhead", "ADBE Vector Group");
            startHead = findDirectChild(contents, "Start Arrowhead", "ADBE Vector Group");

            if (settings.heads === "End" && endHead === null) {
                endHead = addArrowhead(
                    contents,
                    "End Arrowhead",
                    templateInfo.size,
                    templateInfo.color,
                    templateInfo.style
                );
            }
            if (
                settings.heads === "Start" &&
                startHead === null
            ) {
                startHead = addArrowhead(
                    contents,
                    "Start Arrowhead",
                    templateInfo.size,
                    templateInfo.color,
                    templateInfo.style
                );
            }

            endHead = findDirectChild(contents, "End Arrowhead", "ADBE Vector Group");
            startHead = findDirectChild(contents, "Start Arrowhead", "ADBE Vector Group");
        }

        updateArrowheadAppearance(endHead, settings);
        updateArrowheadAppearance(startHead, settings);

        trim = findDirectChild(contents, "Draw On", "ADBE Vector Filter - Trim");
        if (settings.duration !== undefined) {
            var trimEnd = trim.property("ADBE Vector Trim End");
            var currentEasing = inferEasing(trimEnd);
            var startTime = trimEnd.numKeys > 0 ? trimEnd.keyTime(1) : compTime();

            while (trimEnd.numKeys > 1) {
                trimEnd.removeKey(trimEnd.numKeys);
            }
            if (trimEnd.numKeys === 0) {
                trimEnd.setValueAtTime(startTime, 0);
            }
            trimEnd.setValueAtTime(startTime + settings.duration, 100);
            applyEasing(trimEnd, currentEasing);
        }
        if (settings.easing !== undefined) {
            applyEasing(
                trim.property("ADBE Vector Trim End"),
                settings.easing
            );
        }

        var expressionReference = makeExpressionReference(arrowGroup);
        if (endHead !== null) {
            applyArrowheadExpressions(endHead, expressionReference, false);
        }
        if (startHead !== null) {
            applyArrowheadExpressions(startHead, expressionReference, true);
        }
        layer.comment = "Animated Arrow";
    }

    function updateArrowheadAppearance(headGroup, settings) {
        if (headGroup === null) {
            return;
        }

        var info = readArrowheadInfo(headGroup);
        var headContents = headGroup.property("ADBE Vectors Group");
        var headPathGroup = findDirectChild(
            headContents,
            "Arrowhead Path",
            "ADBE Vector Shape - Group"
        );
        var fill = findDirectChild(
            headContents,
            "Arrowhead Fill",
            "ADBE Vector Graphic - Fill"
        );

        if (headPathGroup === null || fill === null) {
            throw new Error("A selected arrow is missing its arrowhead properties.");
        }

        if (settings.headSize !== undefined || settings.style !== undefined) {
            headPathGroup.property("ADBE Vector Shape").setValue(
                makeArrowheadShape(
                    settings.headSize !== undefined ? settings.headSize : info.size,
                    settings.style !== undefined ? settings.style : info.style
                )
            );
        }
        if (settings.color !== undefined) {
            fill.property("ADBE Vector Fill Color").setValue(settings.color);
        }
    }

    function readArrowheadInfo(headGroup) {
        var headContents = headGroup.property("ADBE Vectors Group");
        var headPathGroup = findDirectChild(
            headContents,
            "Arrowhead Path",
            "ADBE Vector Shape - Group"
        );
        var fill = findDirectChild(
            headContents,
            "Arrowhead Fill",
            "ADBE Vector Graphic - Fill"
        );
        var shape = headPathGroup.property("ADBE Vector Shape").value;
        var style = inferArrowheadStyle(shape);
        var minimumX = 0;
        var i;

        for (i = 0; i < shape.vertices.length; i += 1) {
            minimumX = Math.min(minimumX, shape.vertices[i][0]);
        }

        return {
            size: style === "Diamond" ? Math.abs(minimumX) / 1.1 : Math.abs(minimumX),
            style: style,
            color: fill.property("ADBE Vector Fill Color").value
        };
    }

    function inferArrowheadStyle(shape) {
        if (shape.vertices.length === 3) {
            return "Triangle";
        }
        if (shape.vertices.length === 4) {
            if (
                shape.inTangents.length === 4 &&
                (
                    shape.inTangents[0][0] !== 0 ||
                    shape.inTangents[0][1] !== 0
                )
            ) {
                return "Circle";
            }
            return Math.abs(shape.vertices[1][0]) < Math.abs(shape.vertices[2][0])
                ? "Diamond"
                : "Chevron";
        }
        return "Triangle";
    }

    function applyEasing(property, preset) {
        if (property.numKeys < 2) {
            return;
        }

        var firstKey = 1;
        var lastKey = property.numKeys;
        var linear = KeyframeInterpolationType.LINEAR;
        var bezier = KeyframeInterpolationType.BEZIER;
        var ease = new KeyframeEase(0, 33.333);

        if (preset === "Linear") {
            property.setInterpolationTypeAtKey(firstKey, linear, linear);
            property.setInterpolationTypeAtKey(lastKey, linear, linear);
        } else if (preset === "Ease In") {
            property.setInterpolationTypeAtKey(firstKey, linear, linear);
            property.setInterpolationTypeAtKey(lastKey, bezier, bezier);
            property.setTemporalEaseAtKey(lastKey, [ease], [ease]);
        } else if (preset === "Ease Out") {
            property.setInterpolationTypeAtKey(firstKey, bezier, bezier);
            property.setTemporalEaseAtKey(firstKey, [ease], [ease]);
            property.setInterpolationTypeAtKey(lastKey, linear, linear);
        } else {
            property.setInterpolationTypeAtKey(firstKey, bezier, bezier);
            property.setTemporalEaseAtKey(firstKey, [ease], [ease]);
            property.setInterpolationTypeAtKey(lastKey, bezier, bezier);
            property.setTemporalEaseAtKey(lastKey, [ease], [ease]);
        }
    }

    function inferEasing(property) {
        if (property.numKeys < 2) {
            return "Linear";
        }

        var firstIsBezier =
            property.keyOutInterpolationType(1) === KeyframeInterpolationType.BEZIER;
        var lastIsBezier =
            property.keyInInterpolationType(property.numKeys) ===
            KeyframeInterpolationType.BEZIER;

        if (firstIsBezier && lastIsBezier) {
            return "Easy Ease";
        }
        if (firstIsBezier) {
            return "Ease Out";
        }
        if (lastIsBezier) {
            return "Ease In";
        }
        return "Linear";
    }

    function reverseSelectedArrows() {
        var comp = app.project ? app.project.activeItem : null;
        if (!(comp instanceof CompItem)) {
            alert("Open a composition and select one or more generated arrows.", SCRIPT_NAME);
            return;
        }

        var layers = comp.selectedLayers;
        var arrowGroups = [];
        var i;

        for (i = 0; i < layers.length; i += 1) {
            var arrowGroup = findArrowGroup(layers[i]);
            if (arrowGroup !== null) {
                arrowGroups.push(arrowGroup);
            }
        }

        if (arrowGroups.length === 0) {
            alert("Select one or more generated arrow layers.", SCRIPT_NAME);
            return;
        }

        app.beginUndoGroup("Reverse Animated Arrow Direction");
        try {
            for (i = 0; i < arrowGroups.length; i += 1) {
                reverseArrowPath(arrowGroups[i]);
            }
        } catch (error) {
            alert("The selected arrow could not be reversed.\n\n" + error.toString(), SCRIPT_NAME);
        } finally {
            app.endUndoGroup();
        }
    }

    function reverseArrowPath(arrowGroup) {
        var contents = arrowGroup.property("ADBE Vectors Group");
        var pathGroup = findDirectChild(
            contents,
            "Arrow Path",
            "ADBE Vector Shape - Group"
        );
        if (pathGroup === null) {
            throw new Error("A selected arrow is missing its path.");
        }

        var pathProperty = pathGroup.property("ADBE Vector Shape");
        pathProperty.setValue(reverseShape(pathProperty.value));
    }

    function reverseShape(shape) {
        var reversed = new Shape();
        var indices = [];
        var vertices = [];
        var inTangents = [];
        var outTangents = [];
        var count = shape.vertices.length;
        var i;
        var sourceIndex;

        if (shape.closed) {
            indices.push(0);
            for (i = count - 1; i >= 1; i -= 1) {
                indices.push(i);
            }
        } else {
            for (i = count - 1; i >= 0; i -= 1) {
                indices.push(i);
            }
        }

        for (i = 0; i < indices.length; i += 1) {
            sourceIndex = indices[i];
            vertices.push(shape.vertices[sourceIndex]);
            inTangents.push(shape.outTangents[sourceIndex]);
            outTangents.push(shape.inTangents[sourceIndex]);
        }

        reversed.vertices = vertices;
        reversed.inTangents = inTangents;
        reversed.outTangents = outTangents;
        reversed.closed = shape.closed;
        return reversed;
    }

    function compTime() {
        var comp = app.project ? app.project.activeItem : null;
        return comp instanceof CompItem ? comp.time : 0;
    }

    function findArrowGroup(layer) {
        var rootContents = layer.property("ADBE Root Vectors Group");
        if (rootContents === null) {
            return null;
        }
        return findDescendant(rootContents, "Arrow Geometry", "ADBE Vector Group");
    }

    function findDescendant(group, name, matchName) {
        var i;
        for (i = 1; i <= group.numProperties; i += 1) {
            var child = group.property(i);
            if (child.name === name && child.matchName === matchName) {
                return child;
            }

            if (child.matchName === "ADBE Vector Group") {
                var nested = findDescendant(
                    child.property("ADBE Vectors Group"),
                    name,
                    matchName
                );
                if (nested !== null) {
                    return nested;
                }
            }
        }
        return null;
    }

    function findDirectChild(group, name, matchName) {
        var i;
        for (i = 1; i <= group.numProperties; i += 1) {
            var child = group.property(i);
            if (child.name === name && child.matchName === matchName) {
                return child;
            }
        }
        return null;
    }

    function uniqueLayerName(comp, baseName) {
        var name = baseName;
        var suffix = 2;

        while (comp.layer(name) !== null) {
            name = baseName + " " + suffix;
            suffix += 1;
        }

        return name;
    }

    var panel = buildUI(thisObj);
    if (panel instanceof Window) {
        panel.center();
        panel.show();
    }
}(this));
