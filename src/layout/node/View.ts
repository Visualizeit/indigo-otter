import Node from './Node'
import { type ViewStyleProps, normalizeLayoutProps } from './styling'

/**
 * Basic building block of the UI. A node in a tree which is mutated by the layout algorithm.
 */
class View extends Node<ViewStyleProps> {
	constructor(
		readonly props: {
			style?: ViewStyleProps
			children?: Node[]
		},
	) {
		super({ style: normalizeLayoutProps(props.style ?? {}) })

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

export default View
