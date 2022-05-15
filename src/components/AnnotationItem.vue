<template>
  <article class="annotationItem" :class="showSkeletonClass">
    <Button
      buttonType="iconDraggable"
      class="annotationItem-dragHandleButton"
      v-tooltip.bottom-right="`Hold to drag`">

      <Icon iconName="drag" />
    </Button>

    <SectionTitle class="annotationItem-number">
      #{{ itemKey + 1 }}
    </SectionTitle>

    <input
      class="annotationItem-inputTitle"
      type="text"
      placeholder="Title"
      v-model="value.title" />

    <div class="annotationItem-inputEditor" :class="showSkeletonClass">
      <RichTextEditor v-model="value.content" :isSkeleton="showSkeleton" />
    </div>

    <div class="annotationItem-misc">
      <ColorStyleControl
        v-model="value.colorThemeId" />

      <div v-for="(connectedNodeId, i) in value.connectedNodeIds" :key="connectedNodeId">
        <ConnectedNodeControl
          v-model="value.connectedNodeIds[i]" />
      </div>
    </div>

    <Button
      buttonType="icon"
      class="annotationItem-removeButton"
      v-tooltip.bottom-left="`Delete annotation`"
      @click="removeAnnotation">

      <Icon iconName="trash" />
    </Button>
  </article>
</template>

<script>
  import SectionTitle from '@/components/ui/SectionTitle'
  import Icon from '@/components/ui/Icon'
  import Button from '@/components/ui/Button'
  import ColorStyleControl from '@/components/ui/ColorStyleControl'
  import ConnectedNodeControl from '@/components/ui/ConnectedNodeControl'

  import RichTextEditor from '@/components/ui/RichTextEditor'

  import { generateAnnotItemObject, randomId } from '@/utils/utils'

  // const contentPlaceholder = 'Your annotation Description goes here.\nYou can format the text with Markdown like\n**bold** or _italic_, - unordered, 1. ordered, --- divider'

  export default {
    components: {
      SectionTitle,
      Icon,
      Button,
      ColorStyleControl,
      ConnectedNodeControl,
      RichTextEditor
    },

    props: {
      showSkeleton: {
        type: Boolean,
        default: false
      },
      value: {
        type: Object,
        default: () => generateAnnotItemObject()
      },
      itemKey: {
        type: Number,
        default: 0
      }
    },

    methods: {
      removeAnnotation() {
        this.$emit('removeAnnotation', this.value.id)
      }
    },

    computed: {
      showSkeletonClass() {
        return this.showSkeleton ? 'showSkeleton' : false
      }
    }
  }
</script>

<style lang="scss" scoped>
  .annotationItem {
    width: calc(100% - 8px);
    margin: 0 8px 24px 0;
    display: grid;
    grid-template:
      "drg num title del" 40px
      "... ... descr ..." 1fr
      "... ... misc  ..." min-content
      / 24px auto 1fr 32px;
    align-items: center;
    gap: 6px 8px;

    &:hover &-dragHandleButton {
      opacity: 1
    }

    &.showSkeleton {
      opacity: .25;
      pointer-events: none;
      margin-bottom: 0;
    }

    &-dragHandleButton {
      grid-area: drg;
      background: transparent;
      cursor: grab;
      opacity: 0;
      transition: opacity 150ms ease;
      margin-left: 8px;

      ::v-deep * {
        color: $color--black-3!important;
      }
    }

    &-number {
      grid-area: num;
      margin-left: 0;
      max-width: 24px;
      color: $color--black-8;
      padding-left: 0;
      padding-right: 0;
    }

    &-inputTitle {
      grid-area: title;
      padding: 8px;
      width: 100%;
      background: $color--background-white;
      color: $color--black;
      height: 40px;
      line-height: 40px;
      @include font(11, bold);
      border: none;

      &::placeholder {
        color: $color--black-3;
      }
    }

    &-inputEditor {
      grid-area: descr;
      position: relative;

      ::v-deep .editor {
        // padding: 12px 8px;

        *[contenteditable=true] {
          padding: 12px 8px;
          min-height: calc(calc(12px * 2) + calc(16px * 3)); // padding + 3 line-heights
          border-radius: 3px;
          box-shadow: inset 0 0 0 1px $color--special-black-1;;
        }
      }
    }

    &-inputTitle {
      box-shadow: inset 0 0 0 1px $color--special-black-1;
      border-radius: 3px;
    }

    &-misc {
      grid-area: misc;
      display: flex;
      justify-content: space-between;
      gap: 16px;
    }

    &-removeButton {
      grid-area: del;
      background: transparent;
    }
  }
</style>
