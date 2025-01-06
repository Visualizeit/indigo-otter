import { renderToSVG } from '../src'
import Sunflowers from './Sunflowers'
import TheStarryNight from './TheStarryNight'

const initialize = async () => {
	const root = true ? await TheStarryNight() : await Sunflowers()

	const { svg } = renderToSVG(root)

	const parent = document.querySelector<HTMLElement>('#app')

	if (parent === null) {
		throw new Error('Parent element not found')
	}

	parent.innerHTML = svg
}

await initialize()
