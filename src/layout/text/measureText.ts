import stringWidth from 'string-width'
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
	const words = breakTextIntoWords(text)

	const lines = breakWordsIntoLines(
		words,
		maxWidth,
		(word) => (stringWidth(word) * fontSize) / 2,
	)

	const lineHeight = measureWord('X', fontSize, fontBuffer).y

	const width = lines.reduce(
			(maxWidth, line) => Math.max(maxWidth, (stringWidth(line) * fontSize) / 2),
			0,
		),
		height = lines.length * lineHeight

	return new Vec2(width, height)
}

export default measureText
