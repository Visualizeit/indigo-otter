import Node from './Node'
import { type ViewStyleProps, normalizeLayoutProps } from './styling'

/**
 * Basic image node. The only way to create an image. It cannot have children.
 */
class Image extends Node<ViewStyleProps> {
	constructor(
		public href: string,
		readonly props: {
			style?: ViewStyleProps
		},
	) {
		super({ style: normalizeLayoutProps(props.style ?? {}) })
	}
}

export default Image
