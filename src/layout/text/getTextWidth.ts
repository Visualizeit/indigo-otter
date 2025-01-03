import type * as fontkit from 'fontkit'

const getTextWidth = (font: fontkit.Font, text: string, fontSize: number) => {
	const scale = fontSize / font.unitsPerEm

	const width =
		font
			.layout(text)
			.glyphs.reduce((sum, glyph) => sum + glyph.advanceWidth, 0) * scale

	return width
}

export default getTextWidth
