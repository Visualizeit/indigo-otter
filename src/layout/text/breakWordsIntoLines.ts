const breakWordsIntoLines = (
	words: string[],
	maxWidth: number,
	measureWord: (word: string) => number,
) => {
	const lines: string[] = []
	let currentLine: string = ''
	let currentWidth = 0

	for (const word of words) {
		const wordWidth = measureWord(word)
		const newWidth = currentWidth + wordWidth

		if (newWidth > maxWidth) {
			lines.push(currentLine)
			currentLine = word
			currentWidth = wordWidth
		} else {
			currentLine += word
			currentWidth = newWidth
		}
	}

	if (currentLine.length > 0) {
		lines.push(currentLine)
	}

	return lines
}

export default breakWordsIntoLines
