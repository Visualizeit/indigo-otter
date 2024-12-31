import type * as fontkit from 'fontkit'
import { type Node } from './Node'
import {
	type ExactLayoutProps,
	type LayoutNodeState,
	type LayoutProps,
	type TextStyleProps,
	defaultLayoutNodeState,
	normalizeLayoutProps,
} from './styling'

/**
 * Basic text node. The only way to create text. It cannot have children.
 */
export class Text implements Node {
	next: Node | null = null
	prev: Node | null = null
	firstChild: Node | null = null
	lastChild: Node | null = null
	parent: Node | null = null
	/**
	 * Should always be normalized.
	 */
	_style: TextStyleProps & ExactLayoutProps
	_state: LayoutNodeState = { ...defaultLayoutNodeState }

	constructor(
		public text: string,
		readonly props: {
			font: fontkit.Font
			style: TextStyleProps
		},
	) {
		this._style = normalizeLayoutProps(props.style as LayoutProps)
	}
}
