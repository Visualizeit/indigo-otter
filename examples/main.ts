import { layout } from '../src'
import renderToSVG from './renderToSVG'
import Sunflowers from './Sunflowers'
import TheStarryNight from './TheStarryNight'

const initialize = async () => {
	const root = true ? await TheStarryNight() : await Sunflowers()

	layout(root)

	const svg = renderToSVG(root)

	const parent = document.querySelector<HTMLElement>('#app')

	if (parent === null) {
		throw new Error('Parent element not found')
	}

	parent.innerHTML = svg
}

await initialize()
