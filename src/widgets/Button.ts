import  { type Lookups } from '../font/types'
import  { type TextStyleProps, type ViewStyleProps } from '../layout/styling'
import { Text } from '../layout/Text'
import { View } from '../layout/View'

export class Button extends View {
	constructor(props: {
		label: string
		lookups: Lookups
		onClick?(): void
		style?: ViewStyleProps
		testID?: string
		textStyle?: Partial<TextStyleProps>
	}) {
		// Put default styles here.
		const mergedStyle: ViewStyleProps = {
			backgroundColor: '#ffd000',
			...props.style,
		}
		super({ ...props, style: mergedStyle })

		this.add(
			new Text(props.label, {
				lookups: props.lookups,
				style: {
					color: '#FFFFFF',
					fontName: 'InterBold',
					fontSize: 14,
					...props.textStyle,
				},
			}),
		)
	}
}
