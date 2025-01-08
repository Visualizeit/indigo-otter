const breakWordsIntoLines = (
	words: string[],
	lineWidth: number,
	measureWord: (word: string) => number,
) => {
	// The badness (penalty) grows exponentially as lines exceed the desired width,
	// so we'll use a large penalty (e.g., Infinity) when a range of words won't fit.
	const INF = Number.POSITIVE_INFINITY

	// Precompute the width of each word for efficiency.
	const wordWidths = words.map((word) => measureWord(word))

	// dp[i] will store the minimum "badness" achievable from word i to the end.
	// breaks[i] will store the index of the next line break after word i.
	const dp = new Array(words.length + 1).fill(INF)
	const breaks = new Array(words.length + 1).fill(-1)

	// Base case: no badness after the last word.
	dp[words.length] = 0

	// Calculate DP from the end (words.length - 1) back to the start (0).
	for (let i = words.length - 1; i >= 0; i--) {
		let currentWidth = 0
		for (let j = i; j < words.length; j++) {
			// Add the width of this word.
			currentWidth += wordWidths[j]

			// If we place more than one word on a line, add a space width.
			// For simplicity, we'll assume each space costs measureWord(" ")
			// or approximate it (this example uses 1 character for space).
			if (j > i) {
				currentWidth += 1
			}

			// If the current range [i..j] exceeds lineWidth, break out.
			if (currentWidth > lineWidth) {
				break
			}

			// Compute a "badness" for the leftover space on this line if we break after j.
			// For a simple approach, let's square the leftover space (Knuth–Plass uses more advanced heuristics).
			const leftover = lineWidth - currentWidth
			const cost = leftover * leftover // leftover^2

			// If we're at the last line (j == words.length - 1), we can treat cost as 0 to avoid penalizing the final line.
			const totalCost = (j === words.length - 1 ? 0 : cost) + dp[j + 1]

			// If this approach yields a better (lower) cost, update dp[i] and breaks[i].
			if (totalCost < dp[i]) {
				dp[i] = totalCost
				breaks[i] = j + 1 // store the index where we break
			}
		}
	}

	// Reconstruct the lines using the breaks array.
	const lines: string[] = []
	let index = 0
	while (index < words.length) {
		const next = breaks[index]
		// Join the words from index to next - 1
		const line = words.slice(index, next).join('')
		lines.push(line)
		index = next
	}

	return lines
}

export default breakWordsIntoLines
