import stringWidth from 'string-width'
import { type Node, View, Text } from '../src'
import breakTextIntoWords from '../src/layout/text/breakTextIntoWords'
import breakWordsIntoLines from '../src/layout/text/breakWordsIntoLines'
import measureWord from '../src/layout/text/measureWord'
import textToSVGPath from './textToSVGPath'

const h = (tag: string, props: Record<string, string>, children?: string[]) =>
	`<${tag} ${Object.entries(props)
		.map(([key, value]) => `${key}="${value}"`)
		.join(' ')}${children ? `>${children.join('')}</${tag}>` : '/>'}`

const renderToSVG = (node: Node) => {
	const list: Array<Node> = []

	const traverse = (node: Node) => {
		list.push(node)
		let child = node.lastChild
		while (child) {
			traverse(child)
			child = child.prev
		}
	}

	traverse(node)

	const children = list.map((node) => {
		if (node instanceof Text) {
			const words = breakTextIntoWords(node.text)

			const lines = breakWordsIntoLines(
				words,
				node._state.textWidthLimit,
				(word) => (stringWidth(word) * node._style.fontSize) / 2,
			)

			const lineHeight = measureWord(
				'X',
				node._style.fontSize,
				node.props.font,
			).y

			return h('path', {
				d: lines
					.map((line, index) =>
						textToSVGPath(
							line,
							node._style.fontSize,
							node._state.x,
							node._state.y + index * lineHeight,
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
