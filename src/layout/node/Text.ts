import type * as fontkit from 'fontkit'
import Node from './Node'
import {
	type LayoutProps,
	type TextStyleProps,
	normalizeLayoutProps,
} from './styling'

/**
 * Basic text node. The only way to create text. It cannot have children.
 */
class Text extends Node<TextStyleProps> {
	lines: string[] = []
	lineHeight: number = 0

	constructor(
		public text: string,
		readonly props: {
			font: fontkit.Font
			style: TextStyleProps
		},
	) {
		super({ style: normalizeLayoutProps(props.style as LayoutProps) })
	}
}

export default Text
