import { type Node } from './Node'

/**
 * Internal state of the node. Might be useful for debugging or hacking around but it is subject
 * to change at any point without notice.
 */
export interface LayoutNodeState {
	/**
	 * Temporary array used by layout.
	 */
	children: Array<Array<Node>>
	/**
	 * Height of the element.
	 */
	clientHeight: number
	/**
	 * Width of the element.
	 */
	clientWidth: number
	/**
	 * Maximum width of the text before wrapping.
	 */
	textWidthLimit: number
	/**
	 * Screen-space position of element after layout.
	 */
	x: number
	/**
	 * Screen-space position of element after layout.
	 */
	y: number
}

export const defaultLayoutNodeState: LayoutNodeState = {
	children: [],
	clientHeight: 0,
	clientWidth: 0,
	textWidthLimit: Number.POSITIVE_INFINITY,
	x: 0,
	y: 0,
}

/**
 * All layout properties.
 */
export interface LayoutProps {
	/**
	 * Controls positioning of children on the cross axis.
	 */
	alignItems?: 'start' | 'end' | 'center' | 'stretch'
	/**
	 * Enforces a specific aspect ratio on the size of the element. Uses the specified size
	 * (either `width` or `height`) for calculating the other dimension. Respects `minWidth` and
	 * `minHeight`.
	 */
	aspectRatio?: number
	borderBottomWidth?: number
	borderLeftWidth?: number
	borderRightWidth?: number
	borderTopWidth?: number
	borderWidth?: number
	bottom?: number
	/**
	 * Overrides `gap` for columns.
	 */
	columnGap?: number
	flex?: number
	/**
	 * In row does the same as `width` and in column does the same as `height`.
	 */
	flexBasis?: number | `${number}%`
	flexDirection?: 'row' | 'column'
	flexGrow?: number
	flexShrink?: number
	flexWrap?: 'nowrap' | 'wrap'
	gap?: number
	height?: number | `${number}%`
	/**
	 * Controls positioning of children on the main axis.
	 */
	justifyContent?:
		| 'start'
		| 'end'
		| 'center'
		| 'space-between'
		| 'space-around'
		| 'space-evenly'
	left?: number
	maxHeight?: number | `${number}%`
	maxWidth?: number | `${number}%`
	minHeight?: number | `${number}%`
	minWidth?: number | `${number}%`
	padding?: number
	paddingBottom?: number
	paddingHorizontal?: number
	paddingLeft?: number
	paddingRight?: number
	paddingTop?: number
	paddingVertical?: number
	position?: 'relative' | 'absolute'
	right?: number
	/**
	 * Overrides `gap` for rows.
	 */
	rowGap?: number
	top?: number
	width?: number | `${number}%`
	zIndex?: number
}

/**
 * All shorthand properties are expanded. All properties with defaults are required. Some properties
 * might rename undefined if that is recognized as a valid value by the layout.
 */
export type ExactLayoutProps = Required<
	Omit<
		LayoutProps,
		| 'aspectRatio'
		| 'bottom'
		| 'flexBasis'
		| 'height'
		| 'left'
		| 'maxHeight'
		| 'maxWidth'
		| 'minHeight'
		| 'minWidth'
		| 'padding'
		| 'paddingHorizontal'
		| 'paddingVertical'
		| 'right'
		| 'top'
		| 'width'
		| 'zIndex'
	>
> & {
	aspectRatio: LayoutProps['aspectRatio']
	bottom: LayoutProps['bottom']
	flexBasis: LayoutProps['flexBasis']
	height: LayoutProps['height']
	left: LayoutProps['left']
	maxHeight: LayoutProps['maxHeight']
	maxWidth: LayoutProps['maxWidth']
	minHeight: LayoutProps['minHeight']
	minWidth: LayoutProps['minWidth']
	right: LayoutProps['right']
	top: LayoutProps['top']
	width: LayoutProps['width']
	zIndex: LayoutProps['zIndex']
}

export interface DecorativeProps {
	backgroundColor?: string
	borderBottomLeftRadius?: number
	borderBottomRightRadius?: number
	borderColor?: string
	borderRadius?: number
	borderTopLeftRadius?: number
	borderTopRightRadius?: number
}

export type ExactDecorativeProps = Required<
	Omit<DecorativeProps, 'borderRadius'>
>

/**
 * Controls how text is rendered. Note that due to a custom text renderer, there might be some
 * differences in how text is rendered compared to a browser.
 */
export type TextStyleProps = {
	color: string
	fontSize: number
}

export type ViewStyleProps = LayoutProps & DecorativeProps

const defaultLayoutProps: ExactLayoutProps = {
	alignItems: 'start',
	aspectRatio: undefined,
	borderBottomWidth: 0,
	borderLeftWidth: 0,
	borderRightWidth: 0,
	borderTopWidth: 0,
	borderWidth: 0,
	bottom: undefined,
	columnGap: 0,
	flex: 0,
	flexBasis: undefined,
	flexDirection: 'column',
	flexGrow: 0,
	flexShrink: 0,
	flexWrap: 'nowrap',
	gap: 0,
	height: undefined,
	justifyContent: 'start',
	left: undefined,
	maxHeight: undefined,
	maxWidth: undefined,
	minHeight: undefined,
	minWidth: undefined,
	paddingBottom: 0,
	paddingLeft: 0,
	paddingRight: 0,
	paddingTop: 0,
	position: 'relative',
	right: undefined,
	rowGap: 0,
	top: undefined,
	width: undefined,
	zIndex: undefined,
}

const defaultDecorativeProps: ExactDecorativeProps = {
	backgroundColor: 'transparent',
	borderBottomLeftRadius: 0,
	borderBottomRightRadius: 0,
	borderColor: 'transparent',
	borderTopLeftRadius: 0,
	borderTopRightRadius: 0,
}

export function normalizeLayoutProps<
	T extends LayoutProps,
	S extends ExactLayoutProps,
>(input: T): S {
	const result = { ...defaultLayoutProps, ...input }

	result.paddingTop =
		input.paddingTop ?? input.paddingVertical ?? input.padding ?? 0
	result.paddingBottom =
		input.paddingBottom ?? input.paddingVertical ?? input.padding ?? 0
	result.paddingLeft =
		input.paddingLeft ?? input.paddingHorizontal ?? input.padding ?? 0
	result.paddingRight =
		input.paddingRight ?? input.paddingHorizontal ?? input.padding ?? 0

	result.borderBottomWidth = input.borderBottomWidth ?? input.borderWidth ?? 0
	result.borderTopWidth = input.borderTopWidth ?? input.borderWidth ?? 0
	result.borderLeftWidth = input.borderLeftWidth ?? input.borderWidth ?? 0
	result.borderRightWidth = input.borderRightWidth ?? input.borderWidth ?? 0

	result.columnGap = input.columnGap ?? input.gap ?? 0
	result.rowGap = input.rowGap ?? input.gap ?? 0

	return result as S
}

export function normalizeDecorativeProps<
	T extends DecorativeProps,
	S extends ExactDecorativeProps,
>(input: T): S {
	const result = { ...defaultDecorativeProps, ...input }

	result.borderTopLeftRadius =
		input.borderTopLeftRadius ?? input.borderRadius ?? 0
	result.borderTopRightRadius =
		input.borderTopRightRadius ?? input.borderRadius ?? 0
	result.borderBottomLeftRadius =
		input.borderBottomLeftRadius ?? input.borderRadius ?? 0
	result.borderBottomRightRadius =
		input.borderBottomRightRadius ?? input.borderRadius ?? 0

	return result as S
}
