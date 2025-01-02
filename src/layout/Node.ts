import { type ExactLayoutProps } from './styling'

interface NodeLayout {
	/**
	 * Temporary array used by layout.
	 */
	children: Array<Array<Node>>
	/**
	 * Height of the element.
	 */
	clientHeight: number
	/**
	 * Width of the element.
	 */
	clientWidth: number
	/**
	 * Screen-space position of element after layout.
	 */
	x: number
	/**
	 * Screen-space position of element after layout.
	 */
	y: number
}

export interface Node {
	/**
	 * State of the node updated by the layout engine.
	 */
	layout: NodeLayout
	style: ExactLayoutProps
	firstChild: Node | null
	next: Node | null
	parent: Node | null
}
