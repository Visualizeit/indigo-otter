import { type Node } from './Node'
import { Text } from './Text'
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
export const layout = (root: Node) => {
	const nodesInLevelOrder: Node[] = []

	{
		const queue: Node[] = [root]

		while (queue.length > 0) {
			const e = queue.shift() as Node
			nodesInLevelOrder.push(e)

			let c = e.firstChild
			while (c) {
				queue.push(c)
				c = c.next
			}
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
			e.layout.clientWidth = e.style.width
		}
		if (typeof e.style.height === 'number') {
			e.layout.clientHeight = e.style.height
		}
		if (typeof e.style.flexBasis === 'number') {
			if (isHorizontal) {
				e.layout.clientWidth = e.style.flexBasis
			} else {
				e.layout.clientHeight = e.style.flexBasis
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
					definedWidth = p.style.width
				}
				p = p.parent
			}

			e.layout.clientWidth =
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
					definedHeight = p.style.height
				}
				p = p.parent
			}

			e.layout.clientHeight =
				toPercentage(e.style.height) *
				accumulatedMultiplier *
				(definedHeight ?? 0)
		}
		if (typeof e.style.flexBasis === 'string') {
			if (isHorizontal) {
				e.layout.clientWidth =
					toPercentage(e.style.flexBasis) * (e.parent?.layout.clientWidth ?? 0)
			} else {
				e.layout.clientHeight =
					toPercentage(e.style.flexBasis) * (e.parent?.layout.clientHeight ?? 0)
			}
		}

		const p = e.parent
		if (p && e instanceof Text) {
			const maxWidth = p.layout.clientWidth
				? p.layout.clientWidth - p.style.paddingLeft - p.style.paddingRight
				: Number.POSITIVE_INFINITY

			const measuredText = measureText(
				e.text,
				e.style.fontSize,
				maxWidth,
				e.props.font,
			)

			e.lines = measuredText.lines
			e.lineHeight = measuredText.lineHeight

			e.layout.clientWidth = measuredText.width
			e.layout.clientHeight = measuredText.height
		}
	}

	/*
	 * Second tree pass: resolve wrapping children.
	 * Going bottom-up, level order.
	 */
	for (let i = nodesInLevelOrder.length - 1; i >= 0; i--) {
		const e = nodesInLevelOrder[i]

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
			let c = e.firstChild
			while (c) {
				if (c.layout.clientWidth) {
					if (isHorizontal && c.style.position === 'relative') {
						// Padding is inside the width.
						e.layout.clientWidth += c.layout.clientWidth
					}
					if (isVertical && c.style.position === 'relative') {
						// For column layout only wraps the widest child.
						e.layout.clientWidth = Math.max(
							e.layout.clientWidth,
							c.layout.clientWidth,
						)
					}
				}
				if (c.style.position === 'relative') {
					childrenCount += 1
				}
				c = c.next
			}

			e.layout.clientWidth += e.style.paddingLeft + e.style.paddingRight

			if (isHorizontal) {
				e.layout.clientWidth += (childrenCount - 1) * e.style.rowGap
			}
		}
		// Height is at least the sum of children with defined heights.
		if (e.style.height === undefined) {
			let childrenCount = 0
			let c = e.firstChild
			while (c) {
				if (c.layout.clientHeight) {
					if (isVertical && c.style.position === 'relative') {
						e.layout.clientHeight += c.layout.clientHeight
					}
					if (isHorizontal && c.style.position === 'relative') {
						e.layout.clientHeight = Math.max(
							e.layout.clientHeight,
							c.layout.clientHeight,
						)
					}
				}
				if (c.style.position === 'relative') {
					childrenCount += 1
				}
				c = c.next
			}

			// Include padding and gaps.
			e.layout.clientHeight += e.style.paddingTop + e.style.paddingBottom

			if (isVertical) {
				e.layout.clientHeight += (childrenCount - 1) * e.style.columnGap
			}
		}

		// The size that was first calculated is size of the tallest child of all plus paddings. So
		// here we reset the size and build it again, for all rows.
		if (isWrap) {
			if (isHorizontal && e.style.height === undefined) {
				e.layout.clientHeight = e.style.paddingTop + e.style.paddingBottom
			}
			if (isVertical && e.style.width === undefined) {
				e.layout.clientWidth = e.style.paddingLeft + e.style.paddingRight
			}
		}

		// Prepare rows.
		const rows: Array<Array<Node>> = [[]]
		let main = 0
		let cross = 0
		let longestChildSize = 0
		let c = e.firstChild
		while (c) {
			if (c.style.position !== 'relative') {
				c = c.next
				continue
			}

			const deltaMain = isHorizontal
				? c.layout.clientWidth + (isJustifySpace ? 0 : e.style.rowGap)
				: c.layout.clientHeight + (isJustifySpace ? 0 : e.style.columnGap)
			const parentMain = isHorizontal
				? e.layout.clientWidth - e.style.paddingLeft - e.style.paddingRight
				: e.layout.clientHeight - e.style.paddingTop - e.style.paddingBottom

			if (isWrap && main + deltaMain > parentMain) {
				let length = longestChildSize
				length += isHorizontal ? e.style.columnGap : e.style.rowGap
				longestChildSize = 0
				rows.push([])
				if (isWrap) {
					if (isHorizontal && e.style.height === undefined) {
						e.layout.clientHeight += length
					}
					if (isVertical && e.style.width === undefined) {
						e.layout.clientWidth += length
					}
				}
				main = 0
				cross += length
			}
			main += deltaMain

			// Keep track of the longest child in the flex container for the purpose of wrapping.
			longestChildSize = Math.max(
				longestChildSize,
				isHorizontal ? c.layout.clientHeight : c.layout.clientWidth,
			)

			rows.at(-1)?.push(c)
			c = c.next
		}

		e.layout.children = rows

		// The last row.
		if (isWrap) {
			if (isHorizontal && e.style.height === undefined) {
				e.layout.clientHeight += longestChildSize
			}
			if (isVertical && e.style.width === undefined) {
				e.layout.clientWidth += longestChildSize
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

		const parentWidth = p?.layout.clientWidth ?? 0
		const parentHeight = p?.layout.clientHeight ?? 0

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
			e.layout.clientWidth = toPercentage(e.style.width) * parentWidth
		}
		if (p?.style.height === undefined && typeof e.style.height === 'string') {
			e.layout.clientHeight = toPercentage(e.style.height) * parentHeight
		}

		// If element has both left, right offsets and no width, calculate width (analogues for height).
		if (
			e.style.top !== undefined &&
			e.style.bottom !== undefined &&
			e.style.height === undefined
		) {
			e.layout.y = (p?.layout.y ?? 0) + e.style.top
			e.layout.clientHeight = parentHeight - e.style.top - e.style.bottom
		}
		if (
			e.style.left !== undefined &&
			e.style.right !== undefined &&
			e.style.width === undefined
		) {
			e.layout.x = (p?.layout.x ?? 0) + e.style.left
			e.layout.clientWidth = parentWidth - e.style.left - e.style.right
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
					(p?.layout.clientWidth ?? 0) -
					e.layout.clientWidth -
					e.style.right
			}
			if (e.style.top !== undefined) {
				e.layout.y = e.layout.y + e.style.top
			} else if (e.style.bottom !== undefined) {
				e.layout.y =
					(p?.layout.y ?? 0) +
					(p?.layout.clientHeight ?? 0) -
					e.layout.clientHeight -
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

		const maxCrossChildren: Array<number> = []
		const childrenInLine: Array<number> = []
		for (const line of e.layout.children) {
			let maxCrossChild = 0
			let childrenCount = 0

			for (const c of line) {
				if (c.style.position !== 'relative') {
					continue
				}

				childrenCount += 1
				maxCrossChild = Math.max(
					maxCrossChild,
					isHorizontal ? c.layout.clientHeight : c.layout.clientWidth,
				)
			}
			maxCrossChildren.push(maxCrossChild)
			childrenInLine.push(childrenCount)
		}

		// Iterate over lines.
		for (let i = 0; i < e.layout.children.length; i++) {
			const line = e.layout.children[i]!
			const maxCrossChild = maxCrossChildren[i]!
			const childrenCount = childrenInLine[i]!
			let totalFlexGrow = 0
			let totalFlexShrink = 0

			// Calculate available space for justify content along the main axis.
			let availableMain = isHorizontal
				? e.layout.clientWidth - e.style.paddingLeft - e.style.paddingRight
				: e.layout.clientHeight - e.style.paddingTop - e.style.paddingBottom

			if (!isJustifySpace) {
				availableMain -= mainGap * (line.length - 1)
			}

			for (const c of line) {
				if (c.style.position !== 'relative') {
					continue
				}

				availableMain -= isHorizontal
					? c.layout.clientWidth
					: c.layout.clientHeight

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
				const c = line[j]!
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
							c.layout.clientWidth += size
						} else {
							c.layout.clientHeight += size
						}
					}
					if (availableMain < 0 && c.style.flexShrink > 0) {
						// TODO release: figure out similar logic as above with splitting remainder.
						if (isHorizontal) {
							c.layout.clientWidth +=
								(c.style.flexShrink / totalFlexShrink) * availableMain
						} else {
							c.layout.clientHeight +=
								(c.style.flexShrink / totalFlexShrink) * availableMain
						}
					}
				}

				applyMinMaxAndAspectRatio(c)

				if (isJustifySpace) {
					c.layout.x += isHorizontal ? main : cross
					c.layout.y += isHorizontal ? cross : main
					main += isHorizontal ? c.layout.clientWidth : c.layout.clientHeight

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

					main += isHorizontal ? c.layout.clientWidth : c.layout.clientHeight
					main += mainGap
				}

				let lineCrossSize = maxCrossChild
				// If there's only one line, if the flex container has defined height, use it as the
				// cross size. For multi lines it's not relevant.
				if (e.layout.children.length === 1) {
					lineCrossSize = isHorizontal
						? e.layout.clientHeight - e.style.paddingTop - e.style.paddingBottom
						: e.layout.clientWidth - e.style.paddingLeft - e.style.paddingRight
				}

				// Apply align items.
				if (e.style.alignItems === 'center') {
					if (isHorizontal) {
						c.layout.y += (lineCrossSize - c.layout.clientHeight) / 2
					} else {
						c.layout.x += (lineCrossSize - c.layout.clientWidth) / 2
					}
				}
				if (e.style.alignItems === 'end') {
					if (isHorizontal) {
						c.layout.y += lineCrossSize - c.layout.clientHeight
					} else {
						c.layout.x += lineCrossSize - c.layout.clientWidth
					}
				}
				if (
					e.style.alignItems === 'stretch' &&
					((isHorizontal && c.style.height === undefined) ||
						(isVertical && c.style.width === undefined))
				) {
					if (isHorizontal) {
						c.layout.clientHeight = lineCrossSize
					} else {
						c.layout.clientWidth = lineCrossSize
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

		e.layout.children = []

		e.layout.x = Math.round(e.layout.x)
		e.layout.y = Math.round(e.layout.y)
		e.layout.clientWidth = Math.round(e.layout.clientWidth)
		e.layout.clientHeight = Math.round(e.layout.clientHeight)
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
				? toPercentage(e.style.minHeight) * (e.parent?.layout.clientHeight ?? 0)
				: e.style.minHeight
		minHeight = value
	}
	if (e.style.minWidth !== undefined) {
		const value =
			typeof e.style.minWidth === 'string'
				? toPercentage(e.style.minWidth) * (e.parent?.layout.clientWidth ?? 0)
				: e.style.minWidth
		minWidth = value
	}
	if (e.style.maxHeight !== undefined) {
		const value =
			typeof e.style.maxHeight === 'string'
				? toPercentage(e.style.maxHeight) * (e.parent?.layout.clientHeight ?? 0)
				: e.style.maxHeight
		maxHeight = value
	}
	if (e.style.maxWidth !== undefined) {
		const value =
			typeof e.style.maxWidth === 'string'
				? toPercentage(e.style.maxWidth) * (e.parent?.layout.clientWidth ?? 0)
				: e.style.maxWidth
		maxWidth = value
	}

	let effectiveWidth = Math.min(
		Math.max(e.layout.clientWidth, minWidth),
		maxWidth,
	)
	let effectiveHeight = Math.min(
		Math.max(e.layout.clientHeight, minHeight),
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

	e.layout.clientWidth = effectiveWidth
	e.layout.clientHeight = effectiveHeight
}
