import * as fontkit from 'fontkit'
import { layout, View, Text, Image } from '../src'
import renderToSVG from './renderToSVG'

const initialize = async () => {
	const font = await fetch('./LXGWWenKaiMonoLite-Light.ttf')
		.then((response) => response.arrayBuffer())
		.then(
			(buffer) =>
				fontkit.create(new Uint8Array(buffer) as Buffer) as fontkit.Font,
		)

	const root = new View({
		style: {
			backgroundColor: '#f8f9fa',
			padding: 20,
			gap: 20,
			width: 600,
		},
		children: [
			new Text({
				text: '”',
				font,
				style: {
					fontSize: 72,
					color: '#000',
				},
			}),
			new Image({
				href: '/image.png',
				style: {
					width: 200,
					height: 200,
				},
			}),
			new Text({
				text: '阅读一本书有两个动机：一是你喜欢这本书；二是你可以夸耀这本书。',
				font,
				style: {
					fontSize: 24,
					color: '#000',
				},
			}),
			new Text({
				text: '- 伯特兰·罗素',
				font,
				style: {
					fontSize: 18,
					color: '#6c757d',
				},
			}),
			new View({ style: { height: 80 } }),
		],
	})

	layout(root)

	const svg = renderToSVG(root)

	const parent = document.querySelector<HTMLElement>('#app')

	if (parent === null) {
		throw new Error('Parent element not found')
	}

	parent.innerHTML = svg
}

await initialize()
