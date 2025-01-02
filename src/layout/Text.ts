import type * as fontkit from 'fontkit'
import { type Node } from './Node'
import {
	type ExactLayoutProps,
	type LayoutProps,
	type TextStyleProps,
	normalizeLayoutProps,
} from './styling'

/**
 * Basic text node. The only way to create text. It cannot have children.
 */
export class Text implements Node {
	next: Node | null = null
	firstChild: Node | null = null
	parent: Node | null = null

	layout = { children: [], clientHeight: 0, clientWidth: 0, x: 0, y: 0 }
	style: TextStyleProps & ExactLayoutProps

	lines: string[] = []
	lineHeight: number = 0

	constructor(
		public text: string,
		readonly props: {
			font: fontkit.Font
			style: TextStyleProps
		},
	) {
		this.style = normalizeLayoutProps(props.style as LayoutProps)
	}
}
