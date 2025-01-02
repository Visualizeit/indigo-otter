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

class Node<TStyle = {}> {
	layout: NodeLayout = {
		children: [],
		clientHeight: 0,
		clientWidth: 0,
		x: 0,
		y: 0,
	}
	style: ExactLayoutProps & TStyle
	firstChild: Node | null = null
	next: Node | null = null
	parent: Node | null = null

	constructor(props: { style: ExactLayoutProps & TStyle }) {
		this.style = props.style
	}
}

export default Node
