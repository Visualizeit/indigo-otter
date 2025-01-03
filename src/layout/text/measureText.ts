import type * as fontkit from 'fontkit'
import breakTextIntoWords from './breakTextIntoWords'
import breakWordsIntoLines from './breakWordsIntoLines'
import getFontLineHeight from './getTextLineHeight'
import getTextWidth from './getTextWidth'

const measureText = (
	text: string,
	fontSize: number,
	maxWidth: number,
	font: fontkit.Font,
) => {
	const words = breakTextIntoWords(text)

	const lines = breakWordsIntoLines(words, maxWidth, (word) =>
		getTextWidth(font, word, fontSize),
	)

	const lineHeight = getFontLineHeight(font, fontSize)

	const width = lines.reduce(
			(maxWidth, line) =>
				Math.max(maxWidth, getTextWidth(font, line, fontSize)),
			0,
		),
		height = lines.length * lineHeight

	return {
		lines,
		lineHeight,
		width,
		height,
	}
}

export default measureText
