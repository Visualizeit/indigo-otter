import invariant from 'tiny-invariant'
import { Vec2, layout, compose, View, Text } from '../src'
import { renderToSVG } from './renderToSVG'

const initialize = async () => {
	const parent = document.querySelector<HTMLElement>('#app')

	invariant(parent, 'No parent element found.')

	const WIDTH = parent.clientWidth
	const HEIGHT = parent.clientHeight

	const font = await fetch('./Inter.ttf')
		.then((response) => response.arrayBuffer())
		.then((buffer) => new Uint8Array(buffer))

	const root = new View({
		style: {
			backgroundColor: '#f8f9fa',
			padding: 20,
			gap: 20,
		},
		children: [
			new Text('Hello', {
				font,
				style: {
					fontSize: 64,
					color: '#000',
				},
			}),
			new Text('World', {
				font,
				style: {
					fontSize: 128,
					color: '#000',
				},
			}),
		],
	})

	layout(root, new Vec2(WIDTH, HEIGHT))
	compose(root)

	renderToSVG(parent, root)
}

await initialize()
