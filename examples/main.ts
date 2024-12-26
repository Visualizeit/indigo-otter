import invariant from 'tiny-invariant'
import {
	Vec2,
	layout,
	compose,
	View,
	parseTTF,
	prepareLookups,
	Text,
} from '../src'
import { renderToSVG } from './renderToSVG'

const initialize = async () => {
	const parent = document.querySelector<HTMLElement>('#app')

	invariant(parent, 'No parent element found.')

	const WIDTH = parent.clientWidth
	const HEIGHT = parent.clientHeight

	const interTTF = await fetch('./Inter.ttf').then((response) =>
		response.arrayBuffer(),
	)

	const alphabet =
		'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890 ,.:•-–()[]{}!?@#$%^&*+=/\\|<>`~’\'";_▶'

	const lookups = prepareLookups(
		[{ buffer: interTTF, name: 'Inter', ttf: parseTTF(interTTF) }],
		{
			alphabet,
			fontSize: 150,
		},
	)

	const root = new View({
		style: {
			backgroundColor: '#3b82f6',
			padding: 20,
			gap: 20,
		},
		children: [
			new View({
				style: {
					width: 200,
					height: 200,
					backgroundColor: '#ef4444',
				},
			}),
			new View({
				style: {
					width: 200,
					height: 200,
					backgroundColor: '#f59e0b',
				},
			}),
			new Text('Hello World', {
				lookups,
				style: { fontName: 'Inter', fontSize: 24, color: '#fff' },
			}),
		],
	})

	layout(root, lookups, new Vec2(WIDTH, HEIGHT))
	compose(root)

	renderToSVG(parent, root)
}

await initialize()
