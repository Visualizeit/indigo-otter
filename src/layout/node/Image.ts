import Node from './Node'
import resolveLayoutProps, { type ViewStyleProps } from './resolveLayoutProps '

interface ImageProps {
	href: string
	style?: ViewStyleProps
}

/**
 * Basic image node. The only way to create an image. It cannot have children.
 */
class Image extends Node<ViewStyleProps> {
	constructor(readonly props: ImageProps) {
		super({ style: resolveLayoutProps(props.style ?? {}) })
	}
}

export default Image
