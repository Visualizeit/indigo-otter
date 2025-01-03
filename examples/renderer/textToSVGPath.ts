import type * as fontkit from 'fontkit'

/**
 * Converts text to SVG path data using specified font and positioning
 * @param options Text rendering options
 * @returns SVG path data string
 */
const textToSVGPath = (
	text: string,
	fontSize: number,
	x: number,
	y: number,
	font: fontkit.Font,
): string => {
	const scale = fontSize / font.unitsPerEm

	const glyphRun = font.layout(text)

	y += font.ascent * scale

	let pathData = ''

	glyphRun.glyphs.forEach((glyph, index) => {
		const position = glyphRun.positions[index] as fontkit.GlyphPosition

		if (glyph.path) {
			pathData += glyph.path
				.scale(scale, -scale)
				.translate(x + position.xOffset * scale, y + position.yOffset * scale)
				.toSVG()
			x += position.xAdvance * scale
			y += position.yAdvance * scale
		}
	})

	return pathData
}

export default textToSVGPath
