import invariant from 'tiny-invariant'
import { type Node, Queue, View, Text } from '../src'

export function renderToCanvas(canvas: HTMLCanvasElement, node: Node) {
	const ctx = canvas.getContext('2d')

	invariant(ctx, 'Canvas context not found.')

	ctx.fillStyle = '#000000'
	ctx.fillRect(0, 0, canvas.width, canvas.height)

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
			ctx.font = `${node._style.fontSize}px ${node._style.fontName}`
			ctx.fillStyle = node._style.color

			ctx.fillText(
				node.text,
				node._state.x,
				node._state.y + node._state.clientHeight,
			)
		}

		if (node instanceof View) {
			ctx.fillStyle = node._style.backgroundColor

			ctx.fillRect(
				node._state.x,
				node._state.y,
				node._state.clientWidth,
				node._state.clientHeight,
			)
		}
	}
}
