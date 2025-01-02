import { type Node } from './Node'
import {
	type DecorativeProps,
	type ExactLayoutProps,
	type ViewStyleProps,
	normalizeLayoutProps,
} from './styling'

/**
 * Basic building block of the UI. A node in a tree which is mutated by the layout algorithm.
 */
export class View implements Node {
	next: Node | null = null
	firstChild: Node | null = null
	parent: Node | null = null

	layout = { children: [], clientHeight: 0, clientWidth: 0, x: 0, y: 0 }
	style: DecorativeProps & ExactLayoutProps

	constructor(
		readonly props: {
			style?: ViewStyleProps
			children?: Node[]
		},
	) {
		this.style = normalizeLayoutProps(props.style ?? {})

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
