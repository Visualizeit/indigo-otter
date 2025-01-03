import * as fontkit from 'fontkit'
import { layout, View, Image, Text } from '../src'
import renderToSVG from './renderToSVG'

const initialize = async () => {
	const font = await fetch(
		'https://cdn.jsdelivr.net/fontsource/fonts/poppins@latest/latin-400-normal.ttf',
	)
		.then((response) => response.arrayBuffer())
		.then(
			(buffer) =>
				fontkit.create(new Uint8Array(buffer) as Buffer) as fontkit.Font,
		)

	const aspetRatio = 4000 / 5277
	const imageWidth = 280

	const root = new View({
		style: {
			backgroundColor: '#f8fafc',
			padding: 20,
			gap: 24,
			flexDirection: 'row',
		},
		children: [
			new View({
				style: { gap: 20 },
				children: [
					new Image({
						href: '/Sunflowers.jpg',
						style: {
							width: imageWidth,
							height: imageWidth / aspetRatio,
						},
					}),
					new View({
						children: [
							new Text({
								text: 'Sunflowers',
								font,
								style: { color: '#1a1a1a', fontSize: 16 },
							}),
							new Text({
								text: 'Vincent van GoghJanuary 1889 - 1889',
								font,
								style: { color: '#4a4a4a', fontSize: 14 },
							}),
						],
					}),
				],
			}),
			new View({
				style: { width: 500 },
				children: [
					new Text({
						text: `Van Gogh's paintings of Sunflowers are among his most famous. He did them in Arles, in the south of France, in 1888 and 1889. Vincent painted a total of five large canvases with sunflowers in a vase, with three shades of yellow 'and nothing else'. In this way, he demonstrated that it was possible to create an image with numerous variations of a single colour, without any loss of eloquence. The sunflower paintings had a special significance for Van Gogh: they communicated 'gratitude', he wrote. He hung the first two in the room of his friend, the painter Paul Gauguin, who came to live with him for a while in the Yellow House. Gauguin was impressed by the sunflowers, which he thought were 'completely Vincent'. Van Gogh had already painted a new version during his friend's stay and Gauguin later asked for one as a gift, which Vincent was reluctant to give him. He later produced two loose copies, however, one of which is now in the Van Gogh Museum.`,
						font,
						style: { color: '#2a2a2a', fontSize: 17 },
					}),
				],
			}),
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
