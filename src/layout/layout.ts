import invariant from 'tiny-invariant'
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
export function layout(root: Node) {
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
		const isHorizontal = e.parent?._style.flexDirection === 'row'

		// If element has defined width or height, set it.
		if (typeof e._style.width === 'number') {
			e._state.clientWidth = e._style.width
		}
		if (typeof e._style.height === 'number') {
			e._state.clientHeight = e._style.height
		}
		if (typeof e._style.flexBasis === 'number') {
			if (isHorizontal) {
				e._state.clientWidth = e._style.flexBasis
			} else {
				e._state.clientHeight = e._style.flexBasis
			}
		}

		if (typeof e._style.width === 'string') {
			let definedWidth = undefined
			let accumulatedMultiplier = 1
			let p = e.parent
			while (definedWidth === undefined && p) {
				if (typeof p._style.width === 'string') {
					accumulatedMultiplier *= toPercentage(p._style.width)
				} else if (typeof p._style.width === 'number') {
					definedWidth = p._style.width
				}
				p = p.parent
			}

			e._state.clientWidth =
				toPercentage(e._style.width) *
				accumulatedMultiplier *
				(definedWidth ?? 0)
		}
		if (typeof e._style.height === 'string') {
			let definedHeight = undefined
			let accumulatedMultiplier = 1
			let p = e.parent
			while (definedHeight === undefined && p) {
				if (typeof p._style.height === 'string') {
					accumulatedMultiplier *= toPercentage(p._style.height)
				} else if (typeof p._style.height === 'number') {
					definedHeight = p._style.height
				}
				p = p.parent
			}

			e._state.clientHeight =
				toPercentage(e._style.height) *
				accumulatedMultiplier *
				(definedHeight ?? 0)
		}
		if (typeof e._style.flexBasis === 'string') {
			if (isHorizontal) {
				e._state.clientWidth =
					toPercentage(e._style.flexBasis) * (e.parent?._state.clientWidth ?? 0)
			} else {
				e._state.clientHeight =
					toPercentage(e._style.flexBasis) *
					(e.parent?._state.clientHeight ?? 0)
			}
		}

		const p = e.parent
		if (p && e instanceof Text) {
			let maxWidth = Number.POSITIVE_INFINITY

			if ((p._state.clientWidth ?? 0) > 0) {
				maxWidth =
					p._state.clientWidth - p._style.paddingLeft - p._style.paddingRight
				e._state.textWidthLimit = maxWidth
			}

			const textSize = measureText(
				e.text,
				e._style.fontSize,
				e._state.textWidthLimit,
				e.props.font,
			)

			e._state.clientWidth = textSize.x
			e._state.clientHeight = textSize.y
		}
	}

	/*
	 * Second tree pass: resolve wrapping children.
	 * Going bottom-up, level order.
	 */
	for (let i = nodesInLevelOrder.length - 1; i >= 0; i--) {
		const e = nodesInLevelOrder[i]

		const isWrap = e._style.flexWrap === 'wrap'
		const isHorizontal = e._style.flexDirection === 'row'
		const isVertical = e._style.flexDirection === 'column'
		const isJustifySpace =
			e._style.justifyContent === 'space-between' ||
			e._style.justifyContent === 'space-around' ||
			e._style.justifyContent === 'space-evenly'

		// Width is at least the sum of children with defined widths.
		if (e._style.width === undefined) {
			let childrenCount = 0
			let c = e.firstChild
			while (c) {
				if (c._state.clientWidth) {
					if (isHorizontal && c._style.position === 'relative') {
						// Padding is inside the width.
						e._state.clientWidth += c._state.clientWidth
					}
				}
				if (c._style.position === 'relative') {
					childrenCount += 1
				}
				c = c.next
			}

			e._state.clientWidth += e._style.paddingLeft + e._style.paddingRight

			if (isHorizontal) {
				e._state.clientWidth += (childrenCount - 1) * e._style.rowGap
			}
		}
		// Height is at least the sum of children with defined heights.
		if (e._style.height === undefined) {
			let childrenCount = 0
			let c = e.firstChild
			while (c) {
				if (c._state.clientHeight) {
					if (isVertical && c._style.position === 'relative') {
						e._state.clientHeight += c._state.clientHeight
					}
				}
				if (c._style.position === 'relative') {
					childrenCount += 1
				}
				c = c.next
			}

			// Include padding and gaps.
			e._state.clientHeight += e._style.paddingTop + e._style.paddingBottom

			if (isVertical) {
				e._state.clientHeight += (childrenCount - 1) * e._style.columnGap
			}
		}

		// The size that was first calculated is size of the tallest child of all plus paddings. So
		// here we reset the size and build it again, for all rows.
		if (isWrap) {
			if (isHorizontal && e._style.height === undefined) {
				e._state.clientHeight = e._style.paddingTop + e._style.paddingBottom
			}
			if (isVertical && e._style.width === undefined) {
				e._state.clientWidth = e._style.paddingLeft + e._style.paddingRight
			}
		}

		// Prepare rows.
		const rows: Array<Array<Node>> = [[]]
		let main = 0
		let cross = 0
		let longestChildSize = 0
		let c = e.firstChild
		while (c) {
			if (c._style.position !== 'relative') {
				c = c.next
				continue
			}

			const deltaMain = isHorizontal
				? c._state.clientWidth + (isJustifySpace ? 0 : e._style.rowGap)
				: c._state.clientHeight + (isJustifySpace ? 0 : e._style.columnGap)
			const parentMain = isHorizontal
				? e._state.clientWidth - e._style.paddingLeft - e._style.paddingRight
				: e._state.clientHeight - e._style.paddingTop - e._style.paddingBottom

			if (isWrap && main + deltaMain > parentMain) {
				let length = longestChildSize
				length += isHorizontal ? e._style.columnGap : e._style.rowGap
				longestChildSize = 0
				rows.push([])
				if (isWrap) {
					if (isHorizontal && e._style.height === undefined) {
						e._state.clientHeight += length
					}
					if (isVertical && e._style.width === undefined) {
						e._state.clientWidth += length
					}
				}
				main = 0
				cross += length
			}
			main += deltaMain

			// Keep track of the longest child in the flex container for the purpose of wrapping.
			longestChildSize = Math.max(
				longestChildSize,
				isHorizontal ? c._state.clientHeight : c._state.clientWidth,
			)

			rows.at(-1)?.push(c)
			c = c.next
		}

		e._state.children = rows

		// The last row.
		if (isWrap) {
			if (isHorizontal && e._style.height === undefined) {
				e._state.clientHeight += longestChildSize
			}
			if (isVertical && e._style.width === undefined) {
				e._state.clientWidth += longestChildSize
			}
		}
	}

	/*
	 * Third tree pass: resolve flex.
	 * Going top-down, level order.
	 */
	for (const e of nodesInLevelOrder) {
		const p = e.parent

		if (e._style.flex < 0) {
			console.warn(
				`Found flex value ${e._style.flex} lower than 0. Resetting to 0.`,
			)
			e._style.flex = 0
		}

		const parentWidth = p?._state.clientWidth ?? 0
		const parentHeight = p?._state.clientHeight ?? 0

		const direction = e._style.flexDirection
		const isHorizontal = direction === 'row'
		const isVertical = direction === 'column'

		const isJustifySpace =
			e._style.justifyContent === 'space-between' ||
			e._style.justifyContent === 'space-around' ||
			e._style.justifyContent === 'space-evenly'

		// If parent had undefined width or height and its size was only calculated once children sizes
		// were added, then percentage sizing should happen now.
		if (p?._style.width === undefined && typeof e._style.width === 'string') {
			e._state.clientWidth = toPercentage(e._style.width) * parentWidth
		}
		if (p?._style.height === undefined && typeof e._style.height === 'string') {
			e._state.clientHeight = toPercentage(e._style.height) * parentHeight
		}

		// If element has both left, right offsets and no width, calculate width (analogues for height).
		if (
			e._style.top !== undefined &&
			e._style.bottom !== undefined &&
			e._style.height === undefined
		) {
			e._state.y = (p?._state.y ?? 0) + e._style.top
			e._state.clientHeight = parentHeight - e._style.top - e._style.bottom
		}
		if (
			e._style.left !== undefined &&
			e._style.right !== undefined &&
			e._style.width === undefined
		) {
			e._state.x = (p?._state.x ?? 0) + e._style.left
			e._state.clientWidth = parentWidth - e._style.left - e._style.right
		}

		// Handle absolute positioning.
		if (e._style.position === 'absolute') {
			e._state.x = p?._state.x ?? 0
			e._state.y = p?._state.y ?? 0

			if (e._style.left !== undefined) {
				e._state.x = e._state.x + e._style.left
			} else if (e._style.right !== undefined) {
				e._state.x =
					(p?._state.x ?? 0) +
					(p?._state.clientWidth ?? 0) -
					e._state.clientWidth -
					e._style.right
			}
			if (e._style.top !== undefined) {
				e._state.y = e._state.y + e._style.top
			} else if (e._style.bottom !== undefined) {
				e._state.y =
					(p?._state.y ?? 0) +
					(p?._state.clientHeight ?? 0) -
					e._state.clientHeight -
					e._style.bottom
			}
		}

		const resetMain = isHorizontal
			? e._state.x + e._style.paddingLeft
			: e._state.y + e._style.paddingTop
		const resetCross = isHorizontal
			? e._state.y + e._style.paddingTop
			: e._state.x + e._style.paddingLeft
		let main = resetMain
		let cross = resetCross
		const mainGap = (isHorizontal ? e._style.rowGap : e._style.columnGap) ?? 0
		const crossGap = (isHorizontal ? e._style.columnGap : e._style.rowGap) ?? 0

		const maxCrossChildren: Array<number> = []
		const childrenInLine: Array<number> = []
		for (const line of e._state.children) {
			let maxCrossChild = 0
			let childrenCount = 0

			for (const c of line) {
				if (c._style.position !== 'relative') {
					continue
				}

				childrenCount += 1
				maxCrossChild = Math.max(
					maxCrossChild,
					isHorizontal ? c._state.clientHeight : c._state.clientWidth,
				)
			}
			maxCrossChildren.push(maxCrossChild)
			childrenInLine.push(childrenCount)
		}

		// Iterate over lines.
		for (let i = 0; i < e._state.children.length; i++) {
			const line = e._state.children[i]!
			const maxCrossChild = maxCrossChildren[i]!
			const childrenCount = childrenInLine[i]!
			let totalFlexGrow = 0
			let totalFlexShrink = 0

			// Calculate available space for justify content along the main axis.
			let availableMain = isHorizontal
				? e._state.clientWidth - e._style.paddingLeft - e._style.paddingRight
				: e._state.clientHeight - e._style.paddingTop - e._style.paddingBottom

			if (!isJustifySpace) {
				availableMain -= mainGap * (line.length - 1)
			}

			for (const c of line) {
				if (c._style.position !== 'relative') {
					continue
				}

				availableMain -= isHorizontal
					? c._state.clientWidth
					: c._state.clientHeight

				if (c._style.flex > 0 || c._style.flexGrow > 0) {
					if (c._style.flex > 0) {
						totalFlexGrow += c._style.flex
					} else if (c._style.flexGrow > 0) {
						totalFlexGrow += c._style.flexGrow
					}
				}
				if (c._style.flexShrink > 0) {
					totalFlexShrink += c._style.flexShrink
				}
			}

			// Adjust positions for justify content.
			if (e._style.justifyContent === 'center') {
				// TODO release: availableMain/cross is useful here for skipping own size, but we should
				// ignore border or padding here (and we don't).
				main += availableMain / 2
			}
			if (e._style.justifyContent === 'end') {
				main += availableMain
			}
			if (e._style.justifyContent === 'space-around') {
				main += availableMain / childrenCount / 2
			}
			if (e._style.justifyContent === 'space-evenly') {
				main += availableMain / (childrenCount + 1)
			}

			// Iterate over children and apply positions and flex sizes.
			let usedMain = 0
			for (let j = 0; j < line.length; j++) {
				const c = line[j]!
				if (c._style.position !== 'relative') {
					continue
				}

				if (!isJustifySpace) {
					if (
						availableMain > 0 &&
						(c._style.flex > 0 || c._style.flexGrow > 0)
					) {
						const flexValue = c._style.flex || c._style.flexGrow

						// When splitting the available space, the last child gets the remainder.
						let size = Math.round((flexValue / totalFlexGrow) * availableMain)
						usedMain += size
						if (j === line.length - 1 && usedMain < availableMain) {
							size += availableMain - usedMain
						}

						if (isHorizontal) {
							c._state.clientWidth += size
						} else {
							c._state.clientHeight += size
						}
					}
					if (availableMain < 0 && c._style.flexShrink > 0) {
						// TODO release: figure out similar logic as above with splitting remainder.
						if (isHorizontal) {
							c._state.clientWidth +=
								(c._style.flexShrink / totalFlexShrink) * availableMain
						} else {
							c._state.clientHeight +=
								(c._style.flexShrink / totalFlexShrink) * availableMain
						}
					}
				}

				applyMinMaxAndAspectRatio(c)

				if (isJustifySpace) {
					c._state.x += isHorizontal ? main : cross
					c._state.y += isHorizontal ? cross : main
					main += isHorizontal ? c._state.clientWidth : c._state.clientHeight

					if (e._style.justifyContent === 'space-between') {
						main += availableMain / (childrenCount - 1)
					}
					if (e._style.justifyContent === 'space-around') {
						main += availableMain / childrenCount
					}
					if (e._style.justifyContent === 'space-evenly') {
						main += availableMain / (childrenCount + 1)
					}
				} else {
					c._state.x += isHorizontal ? main : cross
					c._state.y += isHorizontal ? cross : main

					main += isHorizontal ? c._state.clientWidth : c._state.clientHeight
					main += mainGap
				}

				let lineCrossSize = maxCrossChild
				// If there's only one line, if the flex container has defined height, use it as the
				// cross size. For multi lines it's not relevant.
				if (e._state.children.length === 1) {
					lineCrossSize = isHorizontal
						? e._state.clientHeight -
							e._style.paddingTop -
							e._style.paddingBottom
						: e._state.clientWidth -
							e._style.paddingLeft -
							e._style.paddingRight
				}

				// Apply align items.
				if (e._style.alignItems === 'center') {
					if (isHorizontal) {
						c._state.y += (lineCrossSize - c._state.clientHeight) / 2
					} else {
						c._state.x += (lineCrossSize - c._state.clientWidth) / 2
					}
				}
				if (e._style.alignItems === 'end') {
					if (isHorizontal) {
						c._state.y += lineCrossSize - c._state.clientHeight
					} else {
						c._state.x += lineCrossSize - c._state.clientWidth
					}
				}
				if (
					e._style.alignItems === 'stretch' &&
					((isHorizontal && c._style.height === undefined) ||
						(isVertical && c._style.width === undefined))
				) {
					if (isHorizontal) {
						c._state.clientHeight = lineCrossSize
					} else {
						c._state.clientWidth = lineCrossSize
					}
				}

				// Add left, top, right, bottom offsets.
				if (c._style.left) {
					c._state.x += c._style.left
				} else if (c._style.right) {
					c._state.x -= c._style.right
				}
				if (c._style.top) {
					c._state.y += c._style.top
				} else if (c._style.bottom) {
					c._state.y -= c._style.bottom
				}
			}

			main = resetMain
			cross += maxCrossChild + crossGap
		}

		e._state.children = []

		e._state.x = Math.round(e._state.x)
		e._state.y = Math.round(e._state.y)
		e._state.clientWidth = Math.round(e._state.clientWidth)
		e._state.clientHeight = Math.round(e._state.clientHeight)
	}
}

function toPercentage(value: `${string}%`): number {
	const result = Number(value.replace('%', '')) / 100
	invariant(Number.isFinite(result), 'Value must be a real fraction.')
	return result
}

function applyMinMaxAndAspectRatio(e: Node): void {
	let minHeight = 0
	let minWidth = 0
	let maxHeight = Number.POSITIVE_INFINITY
	let maxWidth = Number.POSITIVE_INFINITY

	if (e._style.minHeight !== undefined) {
		const value =
			typeof e._style.minHeight === 'string'
				? toPercentage(e._style.minHeight) *
					(e.parent?._state.clientHeight ?? 0)
				: e._style.minHeight
		minHeight = value
	}
	if (e._style.minWidth !== undefined) {
		const value =
			typeof e._style.minWidth === 'string'
				? toPercentage(e._style.minWidth) * (e.parent?._state.clientWidth ?? 0)
				: e._style.minWidth
		minWidth = value
	}
	if (e._style.maxHeight !== undefined) {
		const value =
			typeof e._style.maxHeight === 'string'
				? toPercentage(e._style.maxHeight) *
					(e.parent?._state.clientHeight ?? 0)
				: e._style.maxHeight
		maxHeight = value
	}
	if (e._style.maxWidth !== undefined) {
		const value =
			typeof e._style.maxWidth === 'string'
				? toPercentage(e._style.maxWidth) * (e.parent?._state.clientWidth ?? 0)
				: e._style.maxWidth
		maxWidth = value
	}

	let effectiveWidth = Math.min(
		Math.max(e._state.clientWidth, minWidth),
		maxWidth,
	)
	let effectiveHeight = Math.min(
		Math.max(e._state.clientHeight, minHeight),
		maxHeight,
	)

	const isHorizontal = e.parent?._style.flexDirection === 'row'

	if (e._style.aspectRatio !== undefined) {
		const aspectRatio = e._style.aspectRatio
		if (
			(e._style.width !== undefined || minWidth > 0) &&
			e._style.height === undefined
		) {
			const calculatedHeight = effectiveWidth / aspectRatio
			effectiveHeight = Math.min(
				Math.max(calculatedHeight, minHeight),
				maxHeight,
			)
		} else if (
			(e._style.height !== undefined || minHeight > 0) &&
			e._style.width === undefined
		) {
			const calculatedWidth = effectiveHeight * aspectRatio
			effectiveWidth = Math.min(Math.max(calculatedWidth, minWidth), maxWidth)
		} else if (e._style.width === undefined && e._style.height === undefined) {
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

	e._state.clientWidth = effectiveWidth
	e._state.clientHeight = effectiveHeight
}
