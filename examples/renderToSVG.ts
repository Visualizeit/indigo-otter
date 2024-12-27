import { type Node, Queue, View, Text } from '../src'
import textToSVGPath from './textToSVGPath'

export function renderToSVG(parent: HTMLElement, node: Node) {
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
	svg.setAttribute('width', node._state.clientWidth + 'px')
	svg.setAttribute('height', node._state.clientHeight + 'px')
	svg.setAttribute(
		'viewBox',
		`0 0 ${node._state.clientWidth} ${node._state.clientHeight}`,
	)
	svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

	parent.appendChild(svg)

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

	for (const node of list) {
		if (node instanceof Text) {
			const path = document.createElementNS(
				'http://www.w3.org/2000/svg',
				'path',
			)

			path.setAttribute(
				'd',
				textToSVGPath(
					node.text,
					node._style.fontSize,
					node._state.x,
					node._state.y + node._state.clientHeight,
					node.props.font as Buffer,
				),
			)
			path.setAttribute('fill', node._style.color)

			svg.appendChild(path)
		}

		if (node instanceof View) {
			const rect = document.createElementNS(
				'http://www.w3.org/2000/svg',
				'rect',
			)
			rect.setAttribute('x', node._state.x.toString())
			rect.setAttribute('y', node._state.y.toString())
			rect.setAttribute('width', node._state.clientWidth.toString())
			rect.setAttribute('height', node._state.clientHeight.toString())
			rect.setAttribute('fill', node._style.backgroundColor)

			svg.appendChild(rect)
		}
	}
}
