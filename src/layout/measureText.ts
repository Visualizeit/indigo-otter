import * as fontkit from 'fontkit'
import invariant from 'tiny-invariant'
import { Vec2 } from '../math/Vec2'

const measureText = (text: string, fontSize: number, fontBuffer: Buffer) => {
	invariant(text.length > 0, 'Text must not be empty')

	const font = fontkit.create(fontBuffer) as fontkit.Font
	const scale = fontSize / font.unitsPerEm
	const glyphRun = font.layout(text)

	const width = glyphRun.bbox.width * scale
	const height = glyphRun.bbox.height * scale

	return new Vec2(width, height)
}

export default measureText
