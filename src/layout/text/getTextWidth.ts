import stringWidth from 'string-width'

const getTextWidth = (text: string, fontSize: number) => {
	return (stringWidth(text) * fontSize) / 2
}

export default getTextWidth
