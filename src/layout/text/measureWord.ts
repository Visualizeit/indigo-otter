import * as fontkit from 'fontkit'
import { Vec2 } from '../../'

const measureWord = (
	word: string,
	fontSize: number,
	fontBuffer: Uint8Array,
) => {
	const font = fontkit.create(fontBuffer as Buffer) as fontkit.Font
	const glyphRun = font.layout(word)

	const scale = fontSize / font.unitsPerEm,
		fontHeight = font.ascent - font.descent,
		lineHeight =
			fontHeight > font.unitsPerEm ? fontHeight : fontHeight + font.lineGap

	const width =
		glyphRun.glyphs.reduce((total, glyph) => total + glyph.advanceWidth, 0) *
		scale

	const height = lineHeight * scale

	return new Vec2(width, height)
}

export default measureWord
