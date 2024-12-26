import invariant from 'tiny-invariant'
import {
	renderFontAtlas,
	Vec2,
	layout,
	compose,
	paint,
	View,
	parseTTF,
	prepareLookups,
	WebGPURenderer,
	Text,
} from '../src'

const initialize = async () => {
	const canvas = document.createElement('canvas')

	document.querySelector('#app')?.appendChild(canvas)

	const parent = canvas.parentElement

	invariant(parent, 'No parent element found.')

	const WIDTH = parent.clientWidth
	const HEIGHT = parent.clientHeight

	const settings = {
		sampleCount: 4,
		windowHeight: HEIGHT,
		windowWidth: WIDTH,
		rectangleBufferSize: 16 * 4096,
		textBufferSize: 16 * 100_000,
	}

	canvas.width = WIDTH * window.devicePixelRatio
	canvas.height = HEIGHT * window.devicePixelRatio
	canvas.setAttribute('style', 'width: 100%; height: 100%;')

	const interTTF = await fetch('./Inter.ttf').then((response) =>
		response.arrayBuffer(),
	)

	const alphabet =
		'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890 ,.:•-–()[]{}!?@#$%^&*+=/\\|<>`~’\'";_▶'

	const entry = navigator.gpu
	invariant(entry, 'WebGPU is not supported in this browser.')

	const context = canvas.getContext('webgpu')
	invariant(context, 'WebGPU is not supported in this browser.')

	const adapter = await entry.requestAdapter()
	invariant(adapter, 'No GPU found on this system.')

	const device = await adapter.requestDevice()

	context.configure({
		alphaMode: 'opaque',
		device: device,
		format: navigator.gpu.getPreferredCanvasFormat(),
	})

	const lookups = prepareLookups(
		[{ buffer: interTTF, name: 'Inter', ttf: parseTTF(interTTF) }],
		{
			alphabet,
			fontSize: 150,
		},
	)

	const fontAtlas = await renderFontAtlas(lookups, { useSDF: true })

	const colorTexture = device.createTexture({
		format: 'bgra8unorm',
		label: 'color',
		sampleCount: settings.sampleCount,
		size: { height: canvas.height, width: canvas.width },
		usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
	})
	const colorTextureView = colorTexture.createView({ label: 'color' })

	const renderer = new WebGPURenderer(
		device,
		context,
		colorTextureView,
		settings,
		lookups,
		fontAtlas,
	)

	const root = new View({
		style: {
			backgroundColor: '#3b82f6',
			padding: 20,
		},
		children: [
			new View({
				style: {
					width: 200,
					height: 200,
					backgroundColor: '#ef4444',
				},
			}),
			new View({
				style: {
					width: 200,
					height: 200,
					backgroundColor: '#f59e0b',
				},
			}),
			new Text('Hello World', {
				lookups,
				style: { fontName: 'Inter', fontSize: 24, color: '#fff' },
			}),
		],
	})

	layout(root, lookups, new Vec2(canvas.width, canvas.height))
	compose(renderer, root)
	paint(renderer, root)

	const commandEncoder = device.createCommandEncoder()
	renderer.render(commandEncoder)
	device.queue.submit([commandEncoder.finish()])
}

await initialize()
