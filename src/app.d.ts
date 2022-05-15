declare global {
  // Text Editor
  type Mark = { type: 'bold' | 'italic' | 'strike' | 'underline' | 'link', attrs: any }
  type Attrs = { order: number, href: HyperlinkTarget, target: string }
  type ContentBlock = {
    type: 'paragraph' | 'text' | 'hard_break' | 'bullet_list' | 'ordered_list' | 'horizontal_rule',
    content?: ContentBlock[],
    attrs?: Attrs,
    text?: string,
    marks?: Mark[]
  }

  // Annotations
  type Annotation = {
    colorThemeId: string,
    content: ContentBlock[],
    id: string,
    isDeleted: boolean,
    title: string,
    connectedNodeIds: string[]
  }

  type AnnotWrapperDefinition = {
    id: string,
    pluginData: AnnotWrapperPluginData,
    annotData: Annotation[]
  }

  type AnnotWrapperPluginData = {
    connectedFrameId: string,
    connectedFrameAliasName: string
  }

  type UISceneNode = {
    id: string
  }
}


export {
  Mark,
  Attrs,
  ContentBlock,
  Annotation,
  AnnotWrapperPluginData
}
