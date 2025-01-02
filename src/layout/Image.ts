import { type Node } from './Node'
import {
	type ExactLayoutProps,
	type LayoutProps,
	normalizeLayoutProps,
} from './styling'

/**
 * Basic image node. The only way to create an image. It cannot have children.
 */
export class Image implements Node {
	next: Node | null = null
	firstChild: Node | null = null
	parent: Node | null = null

	layout = { children: [], clientHeight: 0, clientWidth: 0, x: 0, y: 0 }
	style: ExactLayoutProps

	constructor(
		public href: string,
		readonly props: {
			style: LayoutProps
		},
	) {
		this.style = normalizeLayoutProps(props.style as LayoutProps)
	}
}
