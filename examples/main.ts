import invariant from 'tiny-invariant'
import { Vec2, layout, compose, View, Text } from '../src'
import renderToSVG from './renderToSVG'

const initialize = async () => {
	const parent = document.querySelector<HTMLElement>('#app')

	invariant(parent, 'No parent element found.')

	const WIDTH = parent.clientWidth
	const HEIGHT = parent.clientHeight

	const font = await fetch('./LXGWWenKaiMonoLite-Light.ttf')
		.then((response) => response.arrayBuffer())
		.then((buffer) => new Uint8Array(buffer))

	const root = new View({
		style: {
			backgroundColor: '#f8f9fa',
			padding: 20,
			gap: 20,
			width: 600,
		},
		children: [
			new Text('”', {
				font,
				style: {
					fontSize: 72,
					color: '#000',
				},
			}),
			new Text(
				'阅读一本书有两个动机：一是你喜欢这本书；二是你可以夸耀这本书。',
				{
					font,
					style: {
						fontSize: 24,
						color: '#000',
					},
				},
			),
			new Text('- 伯特兰·罗素', {
				font,
				style: {
					fontSize: 18,
					color: '#6c757d',
				},
			}),
			new View({ style: { height: 80 } }),
		],
	})

	layout(root, new Vec2(WIDTH, HEIGHT))
	compose(root)

	const svg = renderToSVG(root)

	parent.innerHTML = svg
}

await initialize()
