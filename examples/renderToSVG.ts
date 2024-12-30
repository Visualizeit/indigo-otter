import { type Node, Queue, View, Text } from '../src'
import textToSVGPath from './textToSVGPath'

export const renderToSVG = (node: Node) => {
	const list: Array<Node> = []

	const queue = new Queue<Node>()
	queue.enqueue(node)

	while (!queue.isEmpty()) {
		const node = queue.dequeueFront()
		if (node === null) {
			throw new Error('Node should not be null.')
		}

		list.push(node)

		let p = node.lastChild
		while (p) {
			queue.enqueue(p)
			p = p.prev
		}
	}

	return `<svg 
	width="${node._state.clientWidth}px" 
	height="${node._state.clientHeight}px" 
	viewBox="0 0 ${node._state.clientWidth} ${node._state.clientHeight}" 
	xmlns="http://www.w3.org/2000/svg">${list.reduce((content, node) => {
		if (node instanceof Text) {
			return `${content}<path
			d="${textToSVGPath(
				node.text,
				node._style.fontSize,
				node._state.x,
				node._state.y,
				node.props.font as Buffer,
			)}"
			fill="${node._style.color}"/>`
		}

		if (node instanceof View) {
			return `${content}<rect
			x="${node._state.x}"
			y="${node._state.y}"
			width="${node._state.clientWidth}"
			height="${node._state.clientHeight}"
			fill="${node._style.backgroundColor}"/>`
		}

		throw new Error('Unknown node type.')
	}, '')}</svg>`
}
