import { type Node } from '../'
import h from './h'

const RoundedClip = (id: string | number, node: Node, radius: number) => {
	return h(
		'clipPath',
		{ id },
		h('rect', {
			x: node.layout.x,
			y: node.layout.y,
			width: node.layout.width,
			height: node.layout.height,
			rx: radius,
			ry: radius,
		}),
	)
}

export default RoundedClip
