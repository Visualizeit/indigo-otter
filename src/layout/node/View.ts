import Node from './Node'
import resolveLayoutProps, { type ViewStyleProps } from './resolveLayoutProps '

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
			style: resolveLayoutProps(props.style ?? {}),
			children: props.children,
		})
	}
}

export default View
