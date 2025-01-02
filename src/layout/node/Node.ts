import { type ExactLayoutProps } from './resolveLayoutProps '

interface NodeLayout {
	/**
	 * Temporary array used by layout.
	 */
	rows: Node[][]
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
		rows: [],
		clientHeight: 0,
		clientWidth: 0,
		x: 0,
		y: 0,
	}
	style: ExactLayoutProps & TStyle
	parent: Node | null = null
	children: Node[] = []

	constructor(props: { style: ExactLayoutProps & TStyle; children?: Node[] }) {
		this.style = props.style

		if (props.children) {
			for (const child of props.children) {
				child.parent = this
			}

			this.children = props.children
		}
	}
}

export default Node
