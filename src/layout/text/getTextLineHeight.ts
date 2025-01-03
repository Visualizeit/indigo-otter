import type * as fontkit from 'fontkit'

const getFontLineHeight = (font: fontkit.Font, fontSize: number) => {
	const scale = fontSize / font.unitsPerEm

	const fontHeight = font.ascent - font.descent

	const lineHeight =
		(fontHeight > font.unitsPerEm ? fontHeight : fontHeight + font.lineGap) *
		scale

	return lineHeight
}

export default getFontLineHeight
