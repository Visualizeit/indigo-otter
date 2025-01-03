import * as fontkit from 'fontkit'
import { View, Image, Text } from '../src'

const TheStarryNight = async () => {
	const noto = await fetch(
		'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-sc@latest/chinese-simplified-400-normal.ttf',
	)
		.then((response) => response.arrayBuffer())
		.then(
			(buffer) =>
				fontkit.create(new Uint8Array(buffer) as Buffer) as fontkit.Font,
		)

	const TheStarryNight = new View({
		style: {
			backgroundColor: '#f9fafb',
			padding: 40,
			gap: 24,
			width: 800,
			alignItems: 'center',
			borderRadius: 8,
		},
		children: [
			new Image({
				href: '/The Starry Night.jpg',
				style: { borderRadius: 8, width: 720, height: 720 / (11141 / 8822) },
			}),
			new Text({
				text: `（文森特·威廉·范梵高，1853.3.30－1890.7.29），荷兰后印象派画家。他是表现主义的先驱，并深刻影响了二十世纪艺术，尤其是野兽派与德国表现主义。早期作品受印象主义和新印象主义画派的影响，后在法国南部的阿尔勒，开始追求更多表现力的技巧；采用点彩画法。画面色彩浓郁，色调明亮。后来受到创新文艺思潮的推动和日本绘画的启发，创作的探索、自由抒发内心情感的风格，塑造线条和线条色彩本身的表现力，追求画面的平面感、装饰性和寓意性。`,
				font: noto,
				style: { color: '#2a2a2a', fontSize: 17 },
			}),
		],
	})

	return TheStarryNight
}

export default TheStarryNight
