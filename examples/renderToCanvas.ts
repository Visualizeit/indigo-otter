import invariant from 'tiny-invariant'
import { type Node, Queue, View, Text } from '../src'

export function renderToCanvas(parent: HTMLElement, node: Node) {
	const WIDTH = parent.clientWidth
	const HEIGHT = parent.clientHeight

	const canvas = document.createElement('canvas')

	const context = canvas.getContext('2d')

	canvas.width = WIDTH * window.devicePixelRatio
	canvas.height = HEIGHT * window.devicePixelRatio

	parent.appendChild(canvas)

	invariant(context, 'Canvas context not found.')

	context.fillStyle = '#000000'
	context.fillRect(0, 0, canvas.width, canvas.height)

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
			context.font = `${node._style.fontSize}px ${node._style.fontName}`
			context.fillStyle = node._style.color

			context.fillText(
				node.text,
				node._state.x,
				node._state.y + node._state.clientHeight,
			)
		}

		if (node instanceof View) {
			context.fillStyle = node._style.backgroundColor

			context.fillRect(
				node._state.x,
				node._state.y,
				node._state.clientWidth,
				node._state.clientHeight,
			)
		}
	}
}
