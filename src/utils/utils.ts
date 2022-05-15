import getAnnotWrapperNode from './getAnnotWrapperNode'
import detectNodeCollisions from '@/utils/detectNodeCollisions'

export const config = {
  annotWrapperNodeName: 'Annotate it! – Frame',
  annotWrapperNodeTitleName: 'Title',
  annotBadgeNodeName: 'Annotate it! – Badge',
  annotWrapperNodePluginDataKey: 'annotWrapperConnectedFrameId',
  annotItemNodePluginDataKey: 'annotStore',

  /**
   * Helper to fill an empty contentBlock paragraph with an empty space to avoid figma errors
   */
  defaultParagraphBlockContent: [ { type: 'text', text: ' ' } ],

  /**
   * @returns A few default options for the styling of annotation paragraphs.
   */
  defaultParagraphTextOptions: {
    fontSize: 16,
    lineHeight: <LineHeight>{ value: 20, unit: 'PIXELS' },
    letterSpacing: <LetterSpacing>{ value: -0.5, unit: 'PERCENT' }
  },

  placeholders: {
    annotItemTitle: 'Title',
    annotWrapperTitle: 'Annotations'
  }
}



// ---
// Figma API Extensions
// ---

export const generateSolidPaint = ( { r = 0, g = 0, b = 0, a = 1 } ) => <SolidPaint>({ 
  type: 'SOLID', 
  color: generateRGBA({ r, g, b }),
  opacity: a 
})


export const generateRGBA = ({ r = 0, g = 0, b = 0, a = <number>null }) : RGB | RGBA => {
  const color = { r: r / 255, g: g / 255, b: b / 255 }
  return a ? <RGBA>{ ...color, a } : <RGB>color
}


/**
 * Converts figmas RGBA { r: .5, g: .75, b: .2 } to regular RGBA { r: 120, g: 215, b: 40  }
 */
export const figmaRGBAToRealRGBA = ({ r = 0, g = 0, b = 0, a = <number>null }) => {
  const color = { r: r * 255, g: g * 255, b: b * 255 }
  return a ? <RGBA>{ ...color, a } : <RGB>color
}


export const getPluginData = ( node: SceneNode, key: string, isJSON = true ) => {
  const data = node.getPluginData(key)
  if (!data) return null
  if (isJSON) return JSON.parse(data) || null
}


export const setPluginData = ( node: SceneNode, key: string, value: any ) => {
  node.setPluginData(key, (typeof value === 'string') ? value : JSON.stringify(value))
}


export const generateFontNameConfig = ({ isBold = false, isItalic = false } = {}) => {
  let style: string

  if (isItalic && !isBold)
    style = 'Italic'
  else {
    style = isBold ? 'Bold' : 'Regular'
    if (isItalic)
      style += ' Italic'
  }

  return <FontName>{ family: 'Inter', style }
}


/**
 * Depending on the length of the given title, it styles the given textnode.
 */
export const toggleTextNodePlaceholderStyles = ( textNode: TextNode, title: string, placeholderType: string ) => {
  const placeholder = config.placeholders?.[placeholderType]
  if (!placeholder)
    throw new Error(`The given placeholder type "${placeholderType}" does not exist in the config.placeholders list!`)

  // Override the font that may be in there. Since figma on about 23 march 2022 updated their default font from roboto to inter
  // causing the plugin to crash. And some users will have old title nodes with roboto, so we need to override it.
  textNode.fontName = generateFontNameConfig({ isBold: true })
  textNode.opacity = title?.length ? 1 : 0
  textNode.characters = title || placeholder
}


export const generateDefaultRelaunchDataOptions = ({ singleItem = false } = {}) => {
  const str = `${singleItem ? 'Edit this Annotation' : 'Edit the Annotation items inside'} with "Annotate it!"`
  return singleItem
    ? { editAnnotation: str }
    : { editAnnotations: str }
}



// ---
// General Utils
// ---

/**
 * Generates a random string and returns it.
 * @param idLength The length of the id. Defaults to 16.
 */
export const randomId = ( idLength: number = 16 ) => {
  return [...Array(idLength)].map(() => Math.random().toString(32)[2]).join('')
}


export const getAllAnnotWrapperNodes = () => {
  return <[FrameNode]>figma.currentPage.findAll(node =>
    node.type === 'FRAME' && node.name === config.annotWrapperNodeName
  )
}


export const generateAnnotItemObject = (
  connectedNodeIds: string[] = []
) : Annotation => ({
  id: randomId(),
  title: '',
  content: [{ type: 'paragraph' }],
  isDeleted: false,
  colorThemeId: getUserColorThemes()[0].id,
  connectedNodeIds,
})


export const getUserColorThemes = () => {
  return [
    { name: 'Blue',   color: generateRGBA({ r: 24, g: 160, b: 251 }), id: 'blvbk3k2fj551h0p', requiresBlackTextColor: false },
    { name: 'Red',    color: generateRGBA({ r: 242, g: 72, b: 34 }),  id: '25s8afhofkgi7185', requiresBlackTextColor: false },
    { name: 'Green',  color: generateRGBA({ r: 27, g: 196, b: 125 }), id: 'dd70jmjl2dp78sii', requiresBlackTextColor: false },
    { name: 'Purple', color: generateRGBA({ r: 123, g: 97, b: 255 }), id: '7zx1s1x0rERif4fj', requiresBlackTextColor: false },
    { name: 'Black',  color: generateRGBA({ r: 0, g: 0, b: 0 }),      id: 'F4uwFNR4KsMCxZQS', requiresBlackTextColor: false },
    { name: 'Yellow', color: generateRGBA({ r: 255, g: 235, b: 0 }),  id: 'gco61x7yDsffYFfy', requiresBlackTextColor: true },
    { name: 'Orange', color: generateRGBA({ r: 242, g: 153, b: 74 }), id: '9V076lexJ1CI4s1f', requiresBlackTextColor: true },
  ].map(theme => ({ ...theme, color: figmaRGBAToRealRGBA(theme.color) }))
}


export const checkIfNodeIsBadge = ( node: SceneNode, id?: string ) => {
  return node.type === 'INSTANCE' && node.name.includes(config.annotBadgeNodeName + (id ? ` ${id}` : ''))
}


/**
 * @returns a list of Marker Badge Nodes for a specific id on the current page.
 */
export const getAnnotMarkerBadgeNodes = ( id: string ) => {
  return <InstanceNode[]>figma.currentPage.findAll(node => {
    return !node.parent.parent.name.includes(id) && checkIfNodeIsBadge(node, id)
  })
}


export const getAnnotItemNodesFromWrapper = ( wrapperNode: FrameNode ) => {
  return wrapperNode.findChildren(child => child.name !== config.annotWrapperNodeTitleName)
}


export const getAnnotWrapperTitleTextNode = ( wrapperNode: FrameNode ) => {
  const textWrapperFrame = <FrameNode>wrapperNode.findChild(child => child.name === config.annotWrapperNodeTitleName)
  if (!textWrapperFrame)
    return null

  return <TextNode>textWrapperFrame.findChild(child => child.type === 'TEXT')
}


/**
 * Loops through annot item nodes and updates the number inside the badge.
 */
export const updateAnnotItemsBadgeIndex = ( annotWrapperNode: FrameNode ) => {
  // console.log('calling updateAnnotItemsBadgeIndex with node', annotWrapperNode)

  // figma.currentPage.findAll(node => {
  //   return node.name.includes()
  // })

  

  /**
   * OLD:
   */

  const annotItemNodes = getAnnotItemNodesFromWrapper(annotWrapperNode)

  for (let i = 0; i < annotItemNodes.length; i++) {
    const newChars = (i + 1).toString(),
          annotItemNode = <FrameNode>annotItemNodes[i],
          id = annotItemNode.name.replace('Annotation ', '')

    // Get the Badge node inside the annotation item
    const annotItemBadgeNode = _getAnnotItemBadgeNode(annotItemNode, id),
          annotItemBadgeTextNode = <TextNode>annotItemBadgeNode.findChild(node => node.type === 'TEXT')
    annotItemBadgeTextNode.characters = newChars

    // Get the Marker Badge node on the page.
    const annotMarkerBadgeNodes = getAnnotMarkerBadgeNodes(id)

    if (!annotMarkerBadgeNodes.length)
      console.log('Failed to find the annot marker for annot ${id} on the page.')
    else {
      for (const badgeNode of annotMarkerBadgeNodes) {
        const annotMarkerBadgeTextNode = <TextNode>badgeNode.findChild(node => node.type === 'TEXT')
        annotMarkerBadgeTextNode.characters = newChars
      }
    }
  }
}


export const updateAnnotItemBadgeColor = ( annotWrapperId: string, annotId: string, newColorId: string ) => {
  const colorThemeData = getUserColorThemes().find(theme => theme.id === newColorId),
        newFills = [ generateSolidPaint({ 
          r: colorThemeData.color.r,
          g: colorThemeData.color.g,
          b: colorThemeData.color.b
        }) ]

  const annotWrapperNode = getAnnotWrapperNode({ createOneIfItDoesNotExist: false, id: annotWrapperId })
  if (!annotWrapperNode)
    return

  const annotItemNode = <FrameNode>annotWrapperNode.findChild(node => node.name.includes(annotId))
  if (!annotItemNode)
    return

  // Get the Badge node inside the annotation item
  const annotItemBadgeNode = _getAnnotItemBadgeNode(annotWrapperNode, annotId)
  annotItemBadgeNode.fills = newFills
  _updateAnnotItemBadgeColor_updateTextColor(annotItemBadgeNode, colorThemeData)

  // Get all marker badges on the page.
  const annotMarkerBadgeNodes = getAnnotMarkerBadgeNodes(annotId)
  for (const badgeNode of annotMarkerBadgeNodes) {
    badgeNode.fills = newFills
    _updateAnnotItemBadgeColor_updateTextColor(badgeNode, colorThemeData)
  }
}

/**
 * Update the badge text color on some of the markers.
 */
const _updateAnnotItemBadgeColor_updateTextColor = ( badgeNode: InstanceNode, colorThemeData: any ) => {
  const badgeTextNode = <TextNode>badgeNode.findChild(node => node.type === 'TEXT'),
        newBadgeTextFills = JSON.parse(JSON.stringify(badgeTextNode.fills))
        newBadgeTextFills[0].color = generateRGBA(colorThemeData.requiresBlackTextColor 
          ? { r: 0, g: 0, b: 0 }
          : { r: 255, g: 255, b: 255 })

  badgeTextNode.fills = newBadgeTextFills
}


const _getAnnotItemBadgeNode = ( annotItemNode: FrameNode, annotId: string ) => {
  return <InstanceNode>annotItemNode.findOne(node => checkIfNodeIsBadge(node, annotId))
}


export const calculateAnnotMarkerBadgePosition = (
  connectedNodeId: string,
  annotWrapperNode: SceneNode,
  badgeMarkerNode: SceneNode,
  startAtY?: number
) => {
  const spaceBetweenSelAndBadge = badgeMarkerNode.width - 8; // 8px overlap
  const wrapperNodePluginData: AnnotWrapperPluginData = getPluginData(
    annotWrapperNode,
    config.annotItemNodePluginDataKey
  );

  if (!connectedNodeId) return { x: 0, y: 0 }

  const targetNode = (figma.getNodeById(connectedNodeId) ??
    figma.getNodeById(wrapperNodePluginData.connectedFrameId)) as SceneNode;

  if (!targetNode) return { x: 0, y: 0 }

  if (!startAtY)
    startAtY =
      targetNode.absoluteTransform[1][2] +
      (targetNode.height / 2 - badgeMarkerNode.width / 2)

  let wantedPos = {
    x: targetNode.absoluteTransform[0][2] - spaceBetweenSelAndBadge,
    y: startAtY,
    width: badgeMarkerNode.width,
    height: badgeMarkerNode.height,
  }

  const collidableNodes = figma.currentPage.findChildren((node) =>
      checkIfNodeIsBadge(node)
    ),
    detectedCollision = detectNodeCollisions(collidableNodes, wantedPos).find(
      (nodeObj) => {
        return nodeObj.id !== badgeMarkerNode.id;
      }
    )

  return detectedCollision
    ? calculateAnnotMarkerBadgePosition(
        connectedNodeId,
        annotWrapperNode,
        badgeMarkerNode,
        startAtY + badgeMarkerNode.height + 8
      )
    : { x: wantedPos.x, y: wantedPos.y }
}
