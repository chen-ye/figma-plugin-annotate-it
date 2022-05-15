import { 
	config, 
	getPluginData, 
	generateFontNameConfig,
	getAllAnnotWrapperNodes, 
	setPluginData,
	getAnnotItemNodesFromWrapper,
	getAnnotWrapperTitleTextNode
} from '@/utils/utils'

import {
	generateAnnotWrapperTitleNode
} from '@/utils/nodeGenerators'


export default async () => {
	// Load fonts to use on canvas.
	await Promise.all([
		figma.loadFontAsync(generateFontNameConfig()),
		figma.loadFontAsync(generateFontNameConfig({ isItalic: true })),
		figma.loadFontAsync(generateFontNameConfig({ isBold: true})),
		figma.loadFontAsync(generateFontNameConfig({ isBold: true, isItalic: true }))
	])

	const value: AnnotWrapperDefinition[] = [],
				annotWrappers = getAllAnnotWrapperNodes()

	if (annotWrappers.length) {
		for (const wrapperNode of annotWrappers) {
			// If the wrapper has no title, it's a v1 one.
			const isV1 = !getAnnotWrapperTitleTextNode(wrapperNode)
			if (isV1) {
				const titleNode = generateAnnotWrapperTitleNode('Annotations')
				wrapperNode.insertChild(0, titleNode)
			}

			let annotData = getAnnotItemNodesFromWrapper(wrapperNode).map(itemNode => getPluginData(itemNode, config.annotItemNodePluginDataKey)),
					pluginData = getPluginData(wrapperNode, config.annotWrapperNodePluginDataKey)

			if (!pluginData) {
				pluginData = <AnnotWrapperPluginData>{ connectedFrameId: null, connectedFrameAliasName: null }
				setPluginData(wrapperNode, config.annotWrapperNodePluginDataKey, pluginData)
			}

			value.push({ id: wrapperNode.id, pluginData, annotData })
		}
	}

	const collator = new Intl.Collator(undefined, {
		numeric: true,
	})

	value.sort(
		(wrapperA, wrapperB) =>
			collator.compare(wrapperA.pluginData.connectedFrameAliasName, wrapperB.pluginData.connectedFrameAliasName)
	)

	figma.ui.postMessage({ type: 'doInit', value })
}