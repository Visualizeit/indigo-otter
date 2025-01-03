// Layout Properties Interface
interface LayoutProps {
	// Dimension Properties
	width?: number | `${number}%`
	height?: number | `${number}%`
	minWidth?: number | `${number}%`
	minHeight?: number | `${number}%`
	maxWidth?: number | `${number}%`
	maxHeight?: number | `${number}%`
	aspectRatio?: number

	// Flex Properties
	flex?: number
	flexBasis?: number | `${number}%`
	flexDirection?: 'row' | 'column'
	flexGrow?: number
	flexShrink?: number
	flexWrap?: 'nowrap' | 'wrap'

	// Alignment Properties
	alignItems?: 'start' | 'end' | 'center' | 'stretch'
	justifyContent?:
		| 'start'
		| 'end'
		| 'center'
		| 'space-between'
		| 'space-around'
		| 'space-evenly'

	// Spacing Properties
	gap?: number
	rowGap?: number // Overrides gap for rows
	columnGap?: number // Overrides gap for columns

	// Padding Properties
	padding?: number
	paddingHorizontal?: number
	paddingVertical?: number
	paddingTop?: number
	paddingRight?: number
	paddingBottom?: number
	paddingLeft?: number

	// Position Properties
	position?: 'relative' | 'absolute'
	top?: number
	right?: number
	bottom?: number
	left?: number
	zIndex?: number
}

// Decorative Properties Interface
interface DecorativeProps {
	backgroundColor?: string
	borderRadius?: number
}

// Combined View Style Properties
export type ViewStyleProps = LayoutProps & DecorativeProps

// Exact Layout Properties Type
// All shorthand properties are expanded and properties with defaults are required
export type ExactLayoutProps = Required<
	Omit<
		LayoutProps,
		| 'width'
		| 'height'
		| 'minWidth'
		| 'minHeight'
		| 'maxWidth'
		| 'maxHeight'
		| 'aspectRatio'
		| 'flexBasis'
		| 'padding'
		| 'paddingHorizontal'
		| 'paddingVertical'
		| 'top'
		| 'right'
		| 'bottom'
		| 'left'
		| 'zIndex'
	>
> & {
	width: LayoutProps['width']
	height: LayoutProps['height']
	minWidth: LayoutProps['minWidth']
	minHeight: LayoutProps['minHeight']
	maxWidth: LayoutProps['maxWidth']
	maxHeight: LayoutProps['maxHeight']
	aspectRatio: LayoutProps['aspectRatio']
	flexBasis: LayoutProps['flexBasis']
	top: LayoutProps['top']
	right: LayoutProps['right']
	bottom: LayoutProps['bottom']
	left: LayoutProps['left']
	zIndex: LayoutProps['zIndex']
}

// Default layout properties configuration
const defaultLayoutProps: ExactLayoutProps = {
	// Dimension defaults
	width: undefined,
	height: undefined,
	minWidth: undefined,
	minHeight: undefined,
	maxWidth: undefined,
	maxHeight: undefined,
	aspectRatio: undefined,

	// Flex defaults
	flex: 0,
	flexBasis: undefined,
	flexDirection: 'column',
	flexGrow: 0,
	flexShrink: 0,
	flexWrap: 'nowrap',

	// Alignment defaults
	alignItems: 'start',
	justifyContent: 'start',

	// Spacing defaults
	gap: 0,
	rowGap: 0,
	columnGap: 0,

	// Padding defaults
	paddingTop: 0,
	paddingRight: 0,
	paddingBottom: 0,
	paddingLeft: 0,

	// Position defaults
	position: 'relative',
	top: undefined,
	right: undefined,
	bottom: undefined,
	left: undefined,
	zIndex: undefined,
}

const resolveLayoutProps = <
	T extends ViewStyleProps,
	S extends ExactLayoutProps,
>(
	input: T,
) => {
	const result = { ...defaultLayoutProps, ...input }

	result.paddingTop =
		input.paddingTop ?? input.paddingVertical ?? input.padding ?? 0
	result.paddingBottom =
		input.paddingBottom ?? input.paddingVertical ?? input.padding ?? 0
	result.paddingLeft =
		input.paddingLeft ?? input.paddingHorizontal ?? input.padding ?? 0
	result.paddingRight =
		input.paddingRight ?? input.paddingHorizontal ?? input.padding ?? 0

	result.columnGap = input.columnGap ?? input.gap ?? 0
	result.rowGap = input.rowGap ?? input.gap ?? 0

	return result as S
}

export default resolveLayoutProps
