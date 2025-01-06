import type Node from './node/Node'
import Text from './node/Text'
import measureText from './text/measureText'

/**
 * This function traverses the tree and calculates layout information - `width`, `height`, `x`, `y`
 * of each element - and stores it in `__state` of each node. Coordinates are in pixels and start
 * point for each element is top left corner of the root element, which is created around the tree
 * passed to this function. What this means in practice is that all coordinates are global and not
 * relative to the parent.
 *
 * @param root tree of views to layout.
 * @param rootSize size of the root element.
 */
const layout = (root: Node) => {
	const nodesInLevelOrder: Node[] = []

	{
		const queue: Node[] = [root]

		while (queue.length) {
			const e = queue.shift() as Node
			nodesInLevelOrder.push(e)
			queue.push(...e.children)
		}
	}

	/*
	 * NOTE:
	 * Code style detail: `e` is an element, `c` is a child, `p` is a parent.
	 */

	// Traverse tree in level order and generate the reverse queue.
	for (const e of nodesInLevelOrder) {
		const isHorizontal = e.parent?.style.flexDirection === 'row'

		// If element has defined width or height, set it.
		if (typeof e.style.width === 'number') {
			e.layout.width = e.style.width
		}
		if (typeof e.style.height === 'number') {
			e.layout.height = e.style.height
		}
		if (typeof e.style.flexBasis === 'number') {
			if (isHorizontal) {
				e.layout.width = e.style.flexBasis
			} else {
				e.layout.height = e.style.flexBasis
			}
		}

		if (typeof e.style.width === 'string') {
			let definedWidth = undefined
			let accumulatedMultiplier = 1
			let p = e.parent
			while (definedWidth === undefined && p) {
				if (typeof p.style.width === 'string') {
					accumulatedMultiplier *= toPercentage(p.style.width)
				} else if (typeof p.style.width === 'number') {
					definedWidth =
						p.style.width - p.style.paddingLeft - p.style.paddingRight
				}
				p = p.parent
			}

			e.layout.width =
				toPercentage(e.style.width) *
				accumulatedMultiplier *
				(definedWidth ?? 0)
		}
		if (typeof e.style.height === 'string') {
			let definedHeight = undefined
			let accumulatedMultiplier = 1
			let p = e.parent
			while (definedHeight === undefined && p) {
				if (typeof p.style.height === 'string') {
					accumulatedMultiplier *= toPercentage(p.style.height)
				} else if (typeof p.style.height === 'number') {
					definedHeight =
						p.style.height - p.style.paddingTop - p.style.paddingBottom
				}
				p = p.parent
			}

			e.layout.height =
				toPercentage(e.style.height) *
				accumulatedMultiplier *
				(definedHeight ?? 0)
		}
		if (typeof e.style.flexBasis === 'string') {
			if (isHorizontal) {
				e.layout.width =
					toPercentage(e.style.flexBasis) * (e.parent?.layout.width ?? 0)
			} else {
				e.layout.height =
					toPercentage(e.style.flexBasis) * (e.parent?.layout.height ?? 0)
			}
		}

		const p = e.parent
		if (p && e instanceof Text) {
			const maxWidth = p.layout.width
				? p.layout.width - p.style.paddingLeft - p.style.paddingRight
				: Number.POSITIVE_INFINITY

			const measuredText = measureText(
				e.props.text,
				e.style.fontSize,
				maxWidth,
				e.props.font,
			)

			e.lines = measuredText.lines
			e.lineHeight = measuredText.lineHeight

			e.layout.width = measuredText.width
			e.layout.height = measuredText.height
		}
	}

	/*
	 * Second tree pass: resolve wrapping children.
	 * Going bottom-up, level order.
	 */
	for (let i = nodesInLevelOrder.length - 1; i >= 0; i--) {
		const e = nodesInLevelOrder[i]

		applyMinMaxAndAspectRatio(e)

		const isWrap = e.style.flexWrap === 'wrap'
		const isHorizontal = e.style.flexDirection === 'row'
		const isVertical = e.style.flexDirection === 'column'
		const isJustifySpace =
			e.style.justifyContent === 'space-between' ||
			e.style.justifyContent === 'space-around' ||
			e.style.justifyContent === 'space-evenly'

		// Width is at least the sum of children with defined widths.
		if (e.style.width === undefined) {
			let childrenCount = 0
			for (const c of e.children) {
				if (c.style.position !== 'relative') {
					continue
				}

				childrenCount++

				if (isHorizontal) {
					e.layout.width += c.layout.width
				}

				if (isVertical) {
					e.layout.width = Math.max(e.layout.width, c.layout.width)
				}
			}

			e.layout.width += e.style.paddingLeft + e.style.paddingRight

			if (isHorizontal) {
				e.layout.width += (childrenCount - 1) * e.style.rowGap
			}
		}

		// Height is at least the sum of children with defined heights.
		if (e.style.height === undefined) {
			let childrenCount = 0
			for (const c of e.children) {
				if (c.style.position !== 'relative') {
					continue
				}

				childrenCount++

				if (isVertical) {
					e.layout.height += c.layout.height
				}

				if (isHorizontal) {
					e.layout.height = Math.max(e.layout.height, c.layout.height)
				}
			}

			// Include padding and gaps.
			e.layout.height += e.style.paddingTop + e.style.paddingBottom

			if (isVertical) {
				e.layout.height += (childrenCount - 1) * e.style.columnGap
			}
		}

		// The size that was first calculated is size of the tallest child of all plus paddings. So
		// here we reset the size and build it again, for all rows.
		if (isWrap) {
			if (isHorizontal && e.style.height === undefined) {
				e.layout.height = e.style.paddingTop + e.style.paddingBottom
			}
			if (isVertical && e.style.width === undefined) {
				e.layout.width = e.style.paddingLeft + e.style.paddingRight
			}
		}

		// Prepare rows.
		const rows: Node[][] = [[]]
		let main = 0
		let cross = 0
		let longestChildSize = 0
		for (const c of e.children) {
			if (c.style.position !== 'relative') {
				continue
			}

			const deltaMain = isHorizontal
				? c.layout.width + (isJustifySpace ? 0 : e.style.rowGap)
				: c.layout.height + (isJustifySpace ? 0 : e.style.columnGap)
			const parentMain = isHorizontal
				? e.layout.width - e.style.paddingLeft - e.style.paddingRight
				: e.layout.height - e.style.paddingTop - e.style.paddingBottom

			if (isWrap && main + deltaMain > parentMain) {
				let length = longestChildSize
				length += isHorizontal ? e.style.columnGap : e.style.rowGap
				longestChildSize = 0
				rows.push([])
				if (isWrap) {
					if (isHorizontal && e.style.height === undefined) {
						e.layout.height += length
					}
					if (isVertical && e.style.width === undefined) {
						e.layout.width += length
					}
				}
				main = 0
				cross += length
			}
			main += deltaMain

			// Keep track of the longest child in the flex container for the purpose of wrapping.
			longestChildSize = Math.max(
				longestChildSize,
				isHorizontal ? c.layout.height : c.layout.width,
			)

			rows.at(-1)?.push(c)
		}

		e.layout.rows = rows

		// The last row.
		if (isWrap) {
			if (isHorizontal && e.style.height === undefined) {
				e.layout.height += longestChildSize
			}
			if (isVertical && e.style.width === undefined) {
				e.layout.width += longestChildSize
			}
		}
	}

	/*
	 * Third tree pass: resolve flex.
	 * Going top-down, level order.
	 */
	for (const e of nodesInLevelOrder) {
		const p = e.parent

		if (e.style.flex < 0) {
			console.warn(
				`Found flex value ${e.style.flex} lower than 0. Resetting to 0.`,
			)
			e.style.flex = 0
		}

		const parentWidth = p?.layout.width ?? 0
		const parentHeight = p?.layout.height ?? 0

		const direction = e.style.flexDirection
		const isHorizontal = direction === 'row'
		const isVertical = direction === 'column'

		const isJustifySpace =
			e.style.justifyContent === 'space-between' ||
			e.style.justifyContent === 'space-around' ||
			e.style.justifyContent === 'space-evenly'

		// If parent had undefined width or height and its size was only calculated once children sizes
		// were added, then percentage sizing should happen now.
		if (p?.style.width === undefined && typeof e.style.width === 'string') {
			e.layout.width = toPercentage(e.style.width) * parentWidth
		}
		if (p?.style.height === undefined && typeof e.style.height === 'string') {
			e.layout.height = toPercentage(e.style.height) * parentHeight
		}

		// If element has both left, right offsets and no width, calculate width (analogues for height).
		if (
			e.style.top !== undefined &&
			e.style.bottom !== undefined &&
			e.style.height === undefined
		) {
			e.layout.y = (p?.layout.y ?? 0) + e.style.top
			e.layout.height = parentHeight - e.style.top - e.style.bottom
		}
		if (
			e.style.left !== undefined &&
			e.style.right !== undefined &&
			e.style.width === undefined
		) {
			e.layout.x = (p?.layout.x ?? 0) + e.style.left
			e.layout.width = parentWidth - e.style.left - e.style.right
		}

		// Handle absolute positioning.
		if (e.style.position === 'absolute') {
			e.layout.x = p?.layout.x ?? 0
			e.layout.y = p?.layout.y ?? 0

			if (e.style.left !== undefined) {
				e.layout.x = e.layout.x + e.style.left
			} else if (e.style.right !== undefined) {
				e.layout.x =
					(p?.layout.x ?? 0) +
					(p?.layout.width ?? 0) -
					e.layout.width -
					e.style.right
			}
			if (e.style.top !== undefined) {
				e.layout.y = e.layout.y + e.style.top
			} else if (e.style.bottom !== undefined) {
				e.layout.y =
					(p?.layout.y ?? 0) +
					(p?.layout.height ?? 0) -
					e.layout.height -
					e.style.bottom
			}
		}

		const resetMain = isHorizontal
			? e.layout.x + e.style.paddingLeft
			: e.layout.y + e.style.paddingTop
		const resetCross = isHorizontal
			? e.layout.y + e.style.paddingTop
			: e.layout.x + e.style.paddingLeft
		let main = resetMain
		let cross = resetCross
		const mainGap = (isHorizontal ? e.style.rowGap : e.style.columnGap) ?? 0
		const crossGap = (isHorizontal ? e.style.columnGap : e.style.rowGap) ?? 0

		const maxCrossChildren: number[] = []
		const childrenInLine: number[] = []
		for (const line of e.layout.rows) {
			let maxCrossChild = 0
			let childrenCount = 0

			for (const c of line) {
				if (c.style.position !== 'relative') {
					continue
				}

				childrenCount += 1
				maxCrossChild = Math.max(
					maxCrossChild,
					isHorizontal ? c.layout.height : c.layout.width,
				)
			}
			maxCrossChildren.push(maxCrossChild)
			childrenInLine.push(childrenCount)
		}

		// Iterate over lines.
		for (let i = 0; i < e.layout.rows.length; i++) {
			const line = e.layout.rows[i]
			const maxCrossChild = maxCrossChildren[i]
			const childrenCount = childrenInLine[i]
			let totalFlexGrow = 0
			let totalFlexShrink = 0

			// Calculate available space for justify content along the main axis.
			let availableMain = isHorizontal
				? e.layout.width - e.style.paddingLeft - e.style.paddingRight
				: e.layout.height - e.style.paddingTop - e.style.paddingBottom

			if (!isJustifySpace) {
				availableMain -= mainGap * (line.length - 1)
			}

			for (const c of line) {
				if (c.style.position !== 'relative') {
					continue
				}

				availableMain -= isHorizontal ? c.layout.width : c.layout.height

				if (c.style.flex > 0 || c.style.flexGrow > 0) {
					if (c.style.flex > 0) {
						totalFlexGrow += c.style.flex
					} else if (c.style.flexGrow > 0) {
						totalFlexGrow += c.style.flexGrow
					}
				}
				if (c.style.flexShrink > 0) {
					totalFlexShrink += c.style.flexShrink
				}
			}

			// Adjust positions for justify content.
			if (e.style.justifyContent === 'center') {
				// TODO release: availableMain/cross is useful here for skipping own size, but we should
				// ignore border or padding here (and we don't).
				main += availableMain / 2
			}
			if (e.style.justifyContent === 'end') {
				main += availableMain
			}
			if (e.style.justifyContent === 'space-around') {
				main += availableMain / childrenCount / 2
			}
			if (e.style.justifyContent === 'space-evenly') {
				main += availableMain / (childrenCount + 1)
			}

			// Iterate over children and apply positions and flex sizes.
			let usedMain = 0
			for (let j = 0; j < line.length; j++) {
				const c = line[j]
				if (c.style.position !== 'relative') {
					continue
				}

				if (!isJustifySpace) {
					if (availableMain > 0 && (c.style.flex > 0 || c.style.flexGrow > 0)) {
						const flexValue = c.style.flex || c.style.flexGrow

						// When splitting the available space, the last child gets the remainder.
						let size = Math.round((flexValue / totalFlexGrow) * availableMain)
						usedMain += size
						if (j === line.length - 1 && usedMain < availableMain) {
							size += availableMain - usedMain
						}

						if (isHorizontal) {
							c.layout.width += size
						} else {
							c.layout.height += size
						}
					}
					if (availableMain < 0 && c.style.flexShrink > 0) {
						// TODO release: figure out similar logic as above with splitting remainder.
						if (isHorizontal) {
							c.layout.width +=
								(c.style.flexShrink / totalFlexShrink) * availableMain
						} else {
							c.layout.height +=
								(c.style.flexShrink / totalFlexShrink) * availableMain
						}
					}
				}

				if (isJustifySpace) {
					c.layout.x += isHorizontal ? main : cross
					c.layout.y += isHorizontal ? cross : main
					main += isHorizontal ? c.layout.width : c.layout.height

					if (e.style.justifyContent === 'space-between') {
						main += availableMain / (childrenCount - 1)
					}
					if (e.style.justifyContent === 'space-around') {
						main += availableMain / childrenCount
					}
					if (e.style.justifyContent === 'space-evenly') {
						main += availableMain / (childrenCount + 1)
					}
				} else {
					c.layout.x += isHorizontal ? main : cross
					c.layout.y += isHorizontal ? cross : main

					main += isHorizontal ? c.layout.width : c.layout.height
					main += mainGap
				}

				let lineCrossSize = maxCrossChild
				// If there's only one line, if the flex container has defined height, use it as the
				// cross size. For multi lines it's not relevant.
				if (e.layout.rows.length === 1) {
					lineCrossSize = isHorizontal
						? e.layout.height - e.style.paddingTop - e.style.paddingBottom
						: e.layout.width - e.style.paddingLeft - e.style.paddingRight
				}

				// Apply align items.
				if (e.style.alignItems === 'center') {
					if (isHorizontal) {
						c.layout.y += (lineCrossSize - c.layout.height) / 2
					} else {
						c.layout.x += (lineCrossSize - c.layout.width) / 2
					}
				}
				if (e.style.alignItems === 'end') {
					if (isHorizontal) {
						c.layout.y += lineCrossSize - c.layout.height
					} else {
						c.layout.x += lineCrossSize - c.layout.width
					}
				}
				if (
					e.style.alignItems === 'stretch' &&
					((isHorizontal && c.style.height === undefined) ||
						(isVertical && c.style.width === undefined))
				) {
					if (isHorizontal) {
						c.layout.height = lineCrossSize
					} else {
						c.layout.width = lineCrossSize
					}
				}

				// Add left, top, right, bottom offsets.
				if (c.style.left) {
					c.layout.x += c.style.left
				} else if (c.style.right) {
					c.layout.x -= c.style.right
				}
				if (c.style.top) {
					c.layout.y += c.style.top
				} else if (c.style.bottom) {
					c.layout.y -= c.style.bottom
				}
			}

			main = resetMain
			cross += maxCrossChild + crossGap
		}

		e.layout.rows = []

		e.layout.x = Math.round(e.layout.x)
		e.layout.y = Math.round(e.layout.y)
		e.layout.width = Math.round(e.layout.width)
		e.layout.height = Math.round(e.layout.height)
	}
}

const toPercentage = (value: `${string}%`) => {
	const percentage = parseInt(value, 10) / 100

	if (!Number.isFinite(percentage)) {
		throw new Error(`Invalid percentage value: ${value}`)
	}

	return percentage
}

const applyMinMaxAndAspectRatio = (e: Node) => {
	let minHeight = 0
	let minWidth = 0
	let maxHeight = Number.POSITIVE_INFINITY
	let maxWidth = Number.POSITIVE_INFINITY

	if (e.style.minHeight !== undefined) {
		const value =
			typeof e.style.minHeight === 'string'
				? toPercentage(e.style.minHeight) * (e.parent?.layout.height ?? 0)
				: e.style.minHeight
		minHeight = value
	}
	if (e.style.minWidth !== undefined) {
		const value =
			typeof e.style.minWidth === 'string'
				? toPercentage(e.style.minWidth) * (e.parent?.layout.width ?? 0)
				: e.style.minWidth
		minWidth = value
	}
	if (e.style.maxHeight !== undefined) {
		const value =
			typeof e.style.maxHeight === 'string'
				? toPercentage(e.style.maxHeight) * (e.parent?.layout.height ?? 0)
				: e.style.maxHeight
		maxHeight = value
	}
	if (e.style.maxWidth !== undefined) {
		const value =
			typeof e.style.maxWidth === 'string'
				? toPercentage(e.style.maxWidth) * (e.parent?.layout.width ?? 0)
				: e.style.maxWidth
		maxWidth = value
	}

	let effectiveWidth = Math.min(Math.max(e.layout.width, minWidth), maxWidth)
	let effectiveHeight = Math.min(
		Math.max(e.layout.height, minHeight),
		maxHeight,
	)

	const isHorizontal = e.parent?.style.flexDirection === 'row'

	if (e.style.aspectRatio !== undefined) {
		const aspectRatio = e.style.aspectRatio
		if (
			(e.style.width !== undefined || minWidth > 0) &&
			e.style.height === undefined
		) {
			const calculatedHeight = effectiveWidth / aspectRatio
			effectiveHeight = Math.min(
				Math.max(calculatedHeight, minHeight),
				maxHeight,
			)
		} else if (
			(e.style.height !== undefined || minHeight > 0) &&
			e.style.width === undefined
		) {
			const calculatedWidth = effectiveHeight * aspectRatio
			effectiveWidth = Math.min(Math.max(calculatedWidth, minWidth), maxWidth)
		} else if (e.style.width === undefined && e.style.height === undefined) {
			// If both width and height are undefined.
			if (isHorizontal) {
				effectiveHeight = Math.min(
					Math.max(effectiveWidth / aspectRatio, minHeight),
					maxHeight,
				)
			} else {
				effectiveWidth = Math.min(
					Math.max(effectiveHeight * aspectRatio, minWidth),
					maxWidth,
				)
			}
		} else {
			// Both width and height are defined.
			if (isHorizontal) {
				effectiveHeight = effectiveWidth / aspectRatio
			} else {
				effectiveWidth = effectiveHeight * aspectRatio
			}
			effectiveWidth = Math.min(Math.max(effectiveWidth, minWidth), maxWidth)
			effectiveHeight = Math.min(
				Math.max(effectiveHeight, minHeight),
				maxHeight,
			)
		}
	}

	e.layout.width = effectiveWidth
	e.layout.height = effectiveHeight
}

export default layout
