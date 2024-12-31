import { type Node } from './Node'
import {
	type ExactLayoutProps,
	type LayoutNodeState,
	type LayoutProps,
	defaultLayoutNodeState,
	normalizeLayoutProps,
} from './styling'

/**
 * Basic image node. The only way to create an image. It cannot have children.
 */
export class Image implements Node {
	next: Node | null = null
	firstChild: Node | null = null
	parent: Node | null = null
	_style: ExactLayoutProps
	_state: LayoutNodeState = { ...defaultLayoutNodeState }

	constructor(
		public href: string,
		readonly props: {
			style: LayoutProps
		},
	) {
		this._style = normalizeLayoutProps(props.style as LayoutProps)
	}
}
