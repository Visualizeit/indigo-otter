import { intersection } from '../math/utils'
import { Vec2 } from '../math/Vec2'
import { Vec4 } from '../math/Vec4'
import { type Node } from './Node'

/**
 * Takes tree of nodes processed by `layout()` and calculates their positions
 * while handling clipping rectangles for each node.
 */
export function compose(
	node: Node,
	clipStart = new Vec2(0, 0),
	clipSize = new Vec2(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY),
): void {
	node._state.clipStart = clipStart
	node._state.clipSize = clipSize

	const clipped = intersection(
		new Vec4(
			node._state.x,
			node._state.y,
			node._state.clientWidth,
			node._state.clientHeight,
		),
		new Vec4(clipStart.x, clipStart.y, clipSize.x, clipSize.y),
	)

	let c = node.firstChild
	while (c) {
		compose(c, clipped.xy(), clipped.zw())
		c = c.next
	}
}
