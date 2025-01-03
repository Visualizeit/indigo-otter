import type * as fontkit from 'fontkit'
import Node from './Node'

interface TextStyleProps {
	color: string
	fontSize: number
}

interface TextProps {
	text: string
	font: fontkit.Font
	style: TextStyleProps
}

/**
 * Basic text node. The only way to create text. It cannot have children.
 */
class Text extends Node<TextStyleProps> {
	lines: string[] = []
	lineHeight: number = 0

	constructor(readonly props: TextProps) {
		super({ style: props.style })
	}
}

export default Text
