import { type Node, Queue, View, Text } from '../src'

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
			const text = document.createElementNS(
				'http://www.w3.org/2000/svg',
				'text',
			)
			text.setAttribute('x', node._state.x.toString())
			text.setAttribute(
				'y',
				(node._state.y + node._state.clientHeight).toString(),
			)
			text.setAttribute('fill', node._style.color)
			text.setAttribute('font-size', `${node._style.fontSize}px`)
			text.setAttribute('font-family', node._style.fontName)
			text.textContent = node.text

			svg.appendChild(text)
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
