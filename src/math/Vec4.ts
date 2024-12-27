import { Vec2 } from './Vec2'

/**
 * A 4-dimensional vector.
 */
export class Vec4 {
	constructor(
		public readonly x: number,
		public readonly y: number,
		public readonly z: number,
		public readonly w: number,
	) {}
	xy(): Vec2 {
		return new Vec2(this.x, this.y)
	}

	zw(): Vec2 {
		return new Vec2(this.z, this.w)
	}
}
