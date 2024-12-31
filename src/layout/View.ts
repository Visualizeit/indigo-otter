import { type Node } from './Node'
import {
	type DecorativeProps,
	type ExactLayoutProps,
	type ViewStyleProps,
	type LayoutNodeState,
	normalizeLayoutProps,
	defaultLayoutNodeState,
} from './styling'

/**
 * Basic building block of the UI. A node in a tree which is mutated by the layout algorithm.
 */
export class View implements Node {
	next: Node | null = null
	firstChild: Node | null = null
	parent: Node | null = null

	/**
	 * Internal state of the node. It's public so that you can use it if you need to, but it's ugly
	 * so that you don't forget it might break at any time.
	 */
	_state: LayoutNodeState = { ...defaultLayoutNodeState }
	/**
	 * Should always be normalized.
	 */
	_style: DecorativeProps & ExactLayoutProps

	constructor(
		readonly props: {
			style?: ViewStyleProps
			children?: Node[]
		},
	) {
		this._style = normalizeLayoutProps(props.style ?? {})

		if (Array.isArray(props.children) && props.children.length > 0) {
			this.firstChild = props.children[0]
			props.children[0].parent = this

			for (let i = 1; i < props.children.length; i++) {
				props.children[i - 1].next = props.children[i]
				props.children[i].parent = this
			}
		}
	}
}
