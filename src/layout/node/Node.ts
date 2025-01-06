import resolveLayoutProps, {
	type ViewStyleProps,
	type ExactLayoutProps,
} from './resolveLayoutProps'

interface NodeLayout {
	/**
	 * Temporary array used by layout.
	 */
	rows: Node[][]
	/**
	 * Width of the element.
	 */
	width: number
	/**
	 * Height of the element.
	 */
	height: number
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
		height: 0,
		width: 0,
		x: 0,
		y: 0,
	}
	style: ExactLayoutProps & TStyle
	parent: Node | null = null
	children: Node[] = []

	constructor(props: { style?: ViewStyleProps & TStyle; children?: Node[] }) {
		this.style = resolveLayoutProps(props.style ?? {})

		if (props.children) {
			for (const child of props.children) {
				child.parent = this
			}

			this.children = props.children
		}
	}
}

export default Node
