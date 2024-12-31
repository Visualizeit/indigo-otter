import type * as fontkit from 'fontkit'
import { Vec2 } from '../../'
import getFontLineHeight from './getTextLineHeight'

const measureWord = (word: string, fontSize: number, font: fontkit.Font) => {
	const glyphRun = font.layout(word)

	const scale = fontSize / font.unitsPerEm

	const width =
		glyphRun.glyphs.reduce((total, glyph) => total + glyph.advanceWidth, 0) *
		scale

	const height = getFontLineHeight(font, fontSize)

	return new Vec2(width, height)
}

export default measureWord
