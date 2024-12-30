import { Vec2 } from '../../'
import breakTextIntoWords from './breakTextIntoWords'
import breakWordsIntoLines from './breakWordsIntoLines'
import measureWord from './measureWord'

const measureText = (
	text: string,
	fontSize: number,
	maxWidth: number,
	fontBuffer: Uint8Array,
) => {
	if (maxWidth === Number.POSITIVE_INFINITY) {
		return measureWord(text, fontSize, fontBuffer)
	}

	const words = breakTextIntoWords(text)

	const lines = breakWordsIntoLines(
		words,
		maxWidth,
		(word) => measureWord(word, fontSize, fontBuffer).x,
	)

	const lineHeight = measureWord('X', fontSize, fontBuffer).y

	const width = maxWidth,
		height = lines.length * lineHeight

	return new Vec2(width, height)
}

export default measureText
