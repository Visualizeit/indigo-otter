import * as fontkit from 'fontkit'
import invariant from 'tiny-invariant'
import { Vec2 } from '../math/Vec2'

const measureText = (text: string, fontSize: number, fontBuffer: Buffer) => {
	invariant(text.length > 0, 'Text must not be empty')

	const font = fontkit.create(fontBuffer) as fontkit.Font
	const glyphRun = font.layout(text)

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

export default measureText
