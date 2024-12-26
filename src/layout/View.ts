import { type Node } from './Node'
import {
	type ExactDecorativeProps,
	type ExactLayoutProps,
	type ViewStyleProps,
	type LayoutNodeState,
	normalizeLayoutProps,
	normalizeDecorativeProps,
	defaultLayoutNodeState,
} from './styling'

/**
 * Basic building block of the UI. A node in a tree which is mutated by the layout algorithm.
 */
export class View implements Node {
	next: Node | null = null
	prev: Node | null = null
	firstChild: Node | null = null
	lastChild: Node | null = null
	parent: Node | null = null

	/**
	 * Internal state of the node. It's public so that you can use it if you need to, but it's ugly
	 * so that you don't forget it might break at any time.
	 */
	_state: LayoutNodeState = { ...defaultLayoutNodeState }
	/**
	 * Should always be normalized.
	 */
	_style: ExactDecorativeProps & ExactLayoutProps

	constructor(
		readonly props: {
			style?: ViewStyleProps
			children?: Node[]
		},
	) {
		this._style = normalizeDecorativeProps(
			normalizeLayoutProps(props.style ?? {}) as ViewStyleProps,
		)

		if (Array.isArray(props.children)) {
			for (const child of props.children) {
				this.add(child)
			}
		}
	}

	add(node: Node): Node {
		node.parent = this

		if (this.firstChild === null) {
			this.firstChild = node
			this.lastChild = node
		} else {
			if (this.lastChild === null) {
				throw new Error('Last child must be set.')
			}

			node.prev = this.lastChild
			this.lastChild.next = node
			this.lastChild = node
		}

		return node
	}
}
