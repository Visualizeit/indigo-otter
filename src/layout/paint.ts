import { Vec2 } from '../math/Vec2'
import { Vec4 } from '../math/Vec4'
import { type Renderer } from '../renderer/Renderer'
import { parseColor } from '../utils/parseColor'
import { type Node } from './Node'
import {
	Display,
	TextAlign,
	Whitespace,
	defaultTextStyleProps,
} from './styling'
import { Text } from './Text'
import { View } from './View'

/**
 * Takes a renderer and a root of a tree and commands the renderer to paint it. Used every frame.
 *
 * @param ui renderer instance that will get commands issued to it.
 * @param node root of the tree to paint.
 * @returns
 */
export function paint(ui: Renderer, node: Node) {
	if (node._style.display === Display.None) {
		return
	}

	paintNode(ui, node, node._state.clipStart, node._state.clipSize)

	let c = node.firstChild
	while (c) {
		paint(ui, c)
		c = c.next
	}
}

/**
 * `clipStart` and `clipSize` determine part of the screen (in screen space coordinates) that can
 * be renderered to for this node.
 */
function paintNode(
	ui: Renderer,
	node: Node,
	clipStart: Vec2,
	clipSize: Vec2,
): void {
	const position = new Vec2(node._state.x, node._state.y)

	if (node instanceof Text) {
		ui.text(
			node.text,
			position,
			node._style.fontName,
			node._style.fontSize ?? defaultTextStyleProps.fontSize,
			parseColor(node._style.color),
			node._style.textAlign ?? TextAlign.Left,
			clipStart,
			clipSize,
			{
				lineHeight: node._style.lineHeight ?? defaultTextStyleProps.lineHeight,
				maxWidth: node._state.textWidthLimit,
				noWrap: node._style.whitespace === Whitespace.NoWrap,
			},
		)
	} else if (node instanceof View) {
		const size = new Vec2(node._state.clientWidth, node._state.clientHeight)

		// Actual rendering.
		ui.rectangle(
			parseColor(node._style.backgroundColor),
			position,
			size,
			new Vec4(
				node._style.borderBottomRightRadius,
				node._style.borderBottomLeftRadius,
				node._style.borderTopLeftRadius,
				node._style.borderTopRightRadius,
			),
			new Vec4(
				node._style.borderBottomWidth,
				node._style.borderRightWidth,
				node._style.borderTopWidth,
				node._style.borderLeftWidth,
			),
			parseColor(node._style.borderColor),
			clipStart,
			clipSize,
			new Vec4(0, 0, 0, 0),
		)
	}
}
