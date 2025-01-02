import { type Node, View, Text, Image } from '../src'
import textToSVGPath from './textToSVGPath'

const h = (
	tag: string,
	props: Record<string, string | number | undefined>,
	children?: string[],
) =>
	`<${tag} ${Object.entries(props)
		.filter(([, value]) => value !== undefined)
		.map(([key, value]) => `${key}="${value}"`)
		.join(' ')}${children ? `>${children.join('')}</${tag}>` : '/>'}`

const renderToSVG = (node: Node) => {
	const list: Array<Node> = []

	const traverse = (node: Node) => {
		list.push(node)
		for (const child of node.children) {
			traverse(child)
		}
	}

	traverse(node)

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
			return h('rect', {
				x: node.layout.x,
				y: node.layout.y,
				width: node.layout.clientWidth,
				height: node.layout.clientHeight,
				rx: node.style.borderRadius,
				ry: node.style.borderRadius,
				fill: node.style.backgroundColor,
			})
		}

		if (node instanceof Image) {
			return h('image', {
				x: node.layout.x,
				y: node.layout.y,
				width: node.layout.clientWidth,
				height: node.layout.clientHeight,
				href: node.props.href,
			})
		}

		throw new Error('Unknown node type.')
	})

	return h(
		'svg',
		{
			xmlns: 'http://www.w3.org/2000/svg',
			width: `${node.layout.clientWidth}px`,
			height: `${node.layout.clientHeight}px`,
			viewBox: `0 0 ${node.layout.clientWidth} ${node.layout.clientHeight}`,
			fill: 'transparent',
		},
		children,
	)
}

export default renderToSVG
