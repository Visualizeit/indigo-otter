import { type Node, layout, View, Text, Image } from '../'
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
				width: node.layout.width,
				height: node.layout.height,
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
				width: node.layout.width,
				height: node.layout.height,
				'clip-path': node.style.borderRadius ? `url(#${clipPath})` : undefined,
			})
		}

		throw new Error('Unknown node type.')
	})

	const svg = h(
		'svg',
		{
			xmlns: 'http://www.w3.org/2000/svg',
			width: `${root.layout.width}px`,
			height: `${root.layout.height}px`,
			viewBox: `0 0 ${root.layout.width} ${root.layout.height}`,
			fill: 'transparent',
		},
		[h('defs', {}, defs), ...children],
	)

	return {
		svg,
		width: root.layout.width,
		height: root.layout.height,
	}
}

export default renderToSVG
