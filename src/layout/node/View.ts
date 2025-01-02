import Node from './Node'
import resolveLayoutProps, { type ViewStyleProps } from './resolveLayoutProps '

interface ViewProps {
	style?: ViewStyleProps
	children?: Node[]
}

/**
 * Basic building block of the UI. A node in a tree which is mutated by the layout algorithm.
 */
class View extends Node<ViewStyleProps> {
	constructor(readonly props: ViewProps) {
		super({
			style: resolveLayoutProps(props.style ?? {}),
			children: props.children,
		})
	}
}

export default View
