import { type Node, layout, View, Text, Image } from '../../src'
import h from './h'
import RoundedClip from './RoundedClip'
import textToSVGPath from './textToSVGPath'

const renderToSVG = (root: Node) => {
	layout(root)

	const list: Array<Node> = []

	const traverse = (node: Node) => {
		list.push(node)
		for (const child of node.children) {
			traverse(child)
		}
	}

	traverse(root)

	const defs: string[] = []

	const children = list.map((node) => {
		if (node instanceof Text) {
			return h('path', {
				d: node.lines
					.map((line, index) =>
						textToSVGPath(
							line,
							node.style.fontSize,
							node.layout.x,
							node.layout.y + index * node.lineHeight,
							node.props.font,
						),
					)
					.join(' '),
				fill: node.style.color,
			})
		}

		if (node instanceof View) {
			const clipPath = defs.length

			if (node.style.borderRadius) {
				defs.push(RoundedClip(clipPath, node, node.style.borderRadius))
			}

			return h('rect', {
				x: node.layout.x,
				y: node.layout.y,
				width: node.layout.clientWidth,
				height: node.layout.clientHeight,
				fill: node.style.backgroundColor,
				'clip-path': node.style.borderRadius ? `url(#${clipPath})` : undefined,
			})
		}

		if (node instanceof Image) {
			const clipPath = defs.length

			if (node.style.borderRadius) {
				defs.push(RoundedClip(clipPath, node, node.style.borderRadius))
			}

			return h('image', {
				href: node.props.href,
				x: node.layout.x,
				y: node.layout.y,
				width: node.layout.clientWidth,
				height: node.layout.clientHeight,
				'clip-path': node.style.borderRadius ? `url(#${clipPath})` : undefined,
			})
		}

		throw new Error('Unknown node type.')
	})

	return h(
		'svg',
		{
			xmlns: 'http://www.w3.org/2000/svg',
			width: `${root.layout.clientWidth}px`,
			height: `${root.layout.clientHeight}px`,
			viewBox: `0 0 ${root.layout.clientWidth} ${root.layout.clientHeight}`,
			fill: 'transparent',
		},
		[h('defs', {}, defs), ...children],
	)
}

export default renderToSVG
