import Node from './Node'
import resolveLayoutProps, { type ViewStyleProps } from './resolveLayoutProps '

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
		super({ style: resolveLayoutProps(props.style ?? {}) })
	}
}

export default Image
