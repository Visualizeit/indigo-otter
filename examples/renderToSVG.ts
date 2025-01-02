import { type Node, View, Text, Image } from '../src'
import textToSVGPath from './textToSVGPath'

const h = (
	tag: string,
	props: Record<string, string | undefined>,
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
		let child = node.firstChild
		while (child) {
			traverse(child)
			child = child.next
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
							node._style.fontSize,
							node._state.x,
							node._state.y + index * node.lineHeight,
							node.props.font,
						),
					)
					.join(' '),
				fill: node._style.color,
			})
		}

		if (node instanceof View) {
			return h('rect', {
				x: String(node._state.x),
				y: String(node._state.y),
				width: String(node._state.clientWidth),
				height: String(node._state.clientHeight),
				fill: node._style.backgroundColor,
			})
		}

		if (node instanceof Image) {
			return h('image', {
				x: String(node._state.x),
				y: String(node._state.y),
				width: String(node._state.clientWidth),
				height: String(node._state.clientHeight),
				href: node.href,
			})
		}

		throw new Error('Unknown node type.')
	})

	return h(
		'svg',
		{
			width: `${node._state.clientWidth}px`,
			height: `${node._state.clientHeight}px`,
			viewBox: `0 0 ${node._state.clientWidth} ${node._state.clientHeight}`,
			xmlns: 'http://www.w3.org/2000/svg',
		},
		children,
	)
}

export default renderToSVG
