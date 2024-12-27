import { Vec4 } from './Vec4'

/**
 * Returns intersection of two rectangles. If there is no intersection, returns a Vec4(0, 0, 0, 0).
 */
export function intersection(a: Vec4, b: Vec4): Vec4 {
	const x = Math.max(a.x, b.x)
	const y = Math.max(a.y, b.y)
	const width = Math.min(a.x + a.z, b.x + b.z) - x
	const height = Math.min(a.y + a.w, b.y + b.w) - y

	if (width <= 0 || height <= 0) {
		return new Vec4(0, 0, 0, 0)
	}

	return new Vec4(x, y, width, height)
}
