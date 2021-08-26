import { 
  config, 
  generateSolidPaint,
  generateRGBA,
  generateDefaultRelaunchDataOptions, 
  setPluginData
} from '@/utils/utils'
import { generateAnnotWrapperTitleNode } from '@/utils/nodeGenerators'
import detectNodeCollisions from '@/utils/detectNodeCollisions'


/**
 * Find an already existing annotation wrapper-frame on the current page, or create one.
 */
export default ({ createOneIfItDoesNotExist = true, id = null } = {}) => {
  let annotWrapperNode = <FrameNode>null
  if (id)
    annotWrapperNode = <FrameNode>figma.currentPage.findChild(node => {
      return node.type  === 'FRAME'
          && node.name  === config.annotWrapperNodeName
          && node.id    === id
    })

  // Create annot wrapper node
  if (!annotWrapperNode && createOneIfItDoesNotExist) {
    const width = 343, 
          height = 100,
          { x, y } = _calculateAnnotWrapperNodePos({ width, height })

    annotWrapperNode = figma.createFrame()
    annotWrapperNode.setRelaunchData(generateDefaultRelaunchDataOptions())
    annotWrapperNode.resize(width, height)
    annotWrapperNode.x = x
    annotWrapperNode.y = y
    annotWrapperNode.name = config.annotWrapperNodeName
    annotWrapperNode.fills = [ generateSolidPaint({ r: 255, g: 255, b: 255 }) ]
    annotWrapperNode.verticalPadding = 16
    annotWrapperNode.itemSpacing = 16
    annotWrapperNode.layoutMode = 'VERTICAL'
    annotWrapperNode.cornerRadius = 16
    annotWrapperNode.cornerSmoothing = .6 // Like Apple
    annotWrapperNode.effects = [
      <ShadowEffect>{ 
        type: 'DROP_SHADOW',
        color: generateRGBA({ a: .03 }),
        blendMode: 'NORMAL',
        offset: <Vector>{ x: 0, y: -4 },
        radius: 16,
        visible: true
      },

      <ShadowEffect>{ 
        type: 'DROP_SHADOW',
        color: generateRGBA({ a: .07 }),
        blendMode: 'NORMAL',
        offset: <Vector>{ x: 0, y: 10 },
        radius: 15,
        visible: true
      },

      <ShadowEffect>{ 
        type: 'DROP_SHADOW',
        color: generateRGBA({ r: 50, g: 50, b: 93, a: .12 }),
        blendMode: 'NORMAL',
        offset: <Vector>{ x: 0, y: 32 },
        radius: 72,
        visible: true
      }
    ]

    const currSel = figma.currentPage.selection?.[0]
    const frameToBeConnectedWith = currSel ? _getNodeParentOnCanvas(figma.currentPage.selection?.[0]) : null
    const title = frameToBeConnectedWith?.name || config.placeholders.annotWrapperTitle

    // Add title node.
    annotWrapperNode.appendChild(generateAnnotWrapperTitleNode(title))

    // Add the pluginData.
    setPluginData(annotWrapperNode, config.annotWrapperNodePluginDataKey, <AnnotWrapperPluginData>{
      connectedFrameId: frameToBeConnectedWith?.id || null,
      connectedFrameAliasName: title
    })

    figma.viewport.scrollAndZoomIntoView([
      ...figma.currentPage.selection,
      annotWrapperNode
    ])

    figma.notify('🎉 You successfully created your first annotation!')
  }

  return annotWrapperNode
}


/**
 * Helper, Is used when the annotation wrapper is initially created.
 */
const _calculateAnnotWrapperNodePos = ( wrapperData: { width: number, height: number }, startAtY?: number ) : { x: number, y: number } => {
  // If there is no current sel, return x = y = 0
  let currSel = figma.currentPage.selection?.[0]
  if (!currSel)
    return { x: 0, y: 0 }
  currSel = _getNodeParentOnCanvas(currSel)

  if (!startAtY)
    startAtY = currSel.y + currSel.height

  const nodes = figma.currentPage.children.filter(node => {
    return node.y + node.height >= startAtY
  })

  // Loop through every direct page child node, returning only the child with an y higher than the current selection. 
  let pageNodesPosArr = []
  for (const node of nodes) {
    pageNodesPosArr.push({ 
      width:  node.width,
      height: node.height,
      x:      node.x,
      y:      node.y,
      id:     node.id
    })
  }

  // Sort nodes by y position
  pageNodesPosArr.sort((a, b) => a.yEnd - b.yEnd)

  let wantedWrapperPos = { 
    width:  wrapperData.width,
    height: wrapperData.height,
    x:      currSel.x,
    y:      startAtY + 80,
  }

  const detectedCollision = detectNodeCollisions(pageNodesPosArr, wantedWrapperPos).find(nodeObj => {
    return nodeObj.id !== currSel.id
  })

  return detectedCollision
    ? _calculateAnnotWrapperNodePos(wrapperData, detectedCollision.y + detectedCollision.height)
    : { x: wantedWrapperPos.x, y: wantedWrapperPos.y }
}


/**
 * Helper, Climbs up all parents of a node until it finds the node that sits directly on the page.
 */
const _getNodeParentOnCanvas = ( node: BaseNode | SceneNode ) => { // BaseNode | Exclude<SceneNode, SliceNode>
  if (node.parent.type === 'PAGE' || node.parent.type === 'DOCUMENT')
    return node 
  else
    return _getNodeParentOnCanvas(node.parent)
}