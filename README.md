# Animated Arrow for After Effects

Animated Arrow is a dockable ScriptUI panel for Adobe After Effects 2025. It
turns selected Mask Paths or Bezier shape Paths into native animated arrows on
new shape layers.

## Install

1. Quit After Effects.
2. Copy `AnimatedArrow.jsx` into the After Effects `Scripts/ScriptUI Panels`
   folder.
3. Restart After Effects.
4. Open **Window > Animated Arrow**.

Typical macOS location:

```text
/Applications/Adobe After Effects 2025/Scripts/ScriptUI Panels/
```

Typical Windows location:

```text
C:\Program Files\Adobe\Adobe After Effects 2025\Support Files\Scripts\ScriptUI Panels\
```

## Use

1. Draw or select one or more Mask Paths or Bezier Paths.
2. Select the actual **Mask Path** or **Path** properties in the Timeline.
3. Set stroke width, arrowhead size, color, duration, easing, style, and
   arrowhead placement.
4. Place the playhead where the animation should begin.
5. Click **Create Arrow**.

Alt/Option-click **Create Arrow** to create the arrow in its finished state. It
is still built with Trim Paths (held at 100% with no keyframes), so the
animation can be added later by giving the arrow a duration in the panel. Easing
and duration are ignored when creating a static arrow this way.

By default, the source layer is hidden after successful arrow creation. Clear
**Hide source layer after creation** when the original layer should remain
visible. The source is preserved either way.

To edit generated arrows later, select one or more arrow layers and change a
panel control. Each control updates only its matching property, so changing the
color does not reset size or timing. Press Enter or leave a numeric field to
apply its value.

When the panel receives focus, it loads settings from the selected generated
arrows. Shared values display normally. Mixed numeric values display as `--`,
mixed dropdowns are blank, and mixed colors use a checkered swatch. Changing a
mixed control applies the new value to every selected arrow.

The compact refresh button on the Color row loads the current selection
explicitly when focus-based refresh is inconvenient.

Use **Reverse Direction** to reverse every selected generated arrow. Open paths
swap ends; closed paths retain their first vertex and travel in the opposite
direction.

The color control shows a clickable live swatch and its hex value. Clicking the
swatch opens the system color picker.

The script preserves the source path and creates a new shape layer containing:

- A copied editable path
- A flat-capped stroke
- Triangle, circle, chevron, or diamond arrowheads
- Arrowheads at either the start or end
- Trim Paths animated from 0% to 100%
- Expressions that keep the arrowhead on the leading edge
- Linear, Easy Ease, Ease In, or Ease Out animation

The line uses a flat terminal cap, and each arrowhead is offset by one stroke
width so the line stays hidden beneath it.

Open and closed paths are supported. Path direction determines the direction
of the arrow.

## MVP Notes

- One or more paths can be processed at once.
- The path and nested shape-group transforms are sampled at the current time.
- The generated layer is parented to the source layer so it follows later
  layer transforms.
- Later edits to the original path do not update the copied arrow path.
- Parametric Rectangle, Ellipse, and Polystar properties must first be
  converted to a Bezier Path.

The generated arrow uses only native After Effects shape properties and
expressions. The panel is not needed after creation; it acts as an optional
editor for selected generated arrows.

## Reference

Built against the community-maintained
[After Effects Scripting Guide](https://ae-scripting.docsforadobe.dev/) and
[After Effects Expression Reference](https://ae-expressions.docsforadobe.dev/).
