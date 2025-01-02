import type * as fontkit from 'fontkit'
import Node from './Node'
import resolveLayoutProps, { type ViewStyleProps } from './resolveLayoutProps '

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
		super({ style: resolveLayoutProps(props.style as ViewStyleProps) })
	}
}

export default Text
