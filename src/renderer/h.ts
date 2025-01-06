const h = (
	tag: string,
	props: Record<string, string | number | undefined>,
	children?: string | string[],
) =>
	`<${tag} ${Object.entries(props)
		.filter(([, value]) => value !== undefined)
		.map(([key, value]) => `${key}="${value}"`)
		.join(
			' ',
		)}${children ? `>${Array.isArray(children) ? children.join('') : children}</${tag}>` : '/>'}`

export default h
