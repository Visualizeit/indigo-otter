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
		super({
			style: normalizeLayoutProps(props.style ?? {}),
			children: props.children,
		})
	}
}

export default View
