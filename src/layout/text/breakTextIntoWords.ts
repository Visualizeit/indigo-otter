import { LineBreaker } from 'css-line-break'
import { type LineBreak } from 'css-line-break/dist/types/LineBreak'

const breakTextIntoWords = (text: string) => {
	const breaker = LineBreaker(text, {
		lineBreak: 'strict',
		wordBreak: 'normal',
	})

	const words: string[] = []

	let lineBreak: LineBreak

	while (!(lineBreak = breaker.next()).done) {
		words.push(lineBreak.value.slice())
	}

	return words
}

export default breakTextIntoWords
