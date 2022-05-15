<template>
    <div class="connectedNodeControl">
        <!-- <span class="connectedNodeControl-label">
          {{ value }}
        </span> -->
        <Button
            buttonType="icon"
            class="connectedNodeControl-editButton"
            v-tooltip.bottom-left="`Relink node target`"
            @click="editConnectedNode">

            <Icon iconName="hyperlink" />
        </Button>
        <!-- <Button
            buttonType="icon"
            class="connectedNodeControl-refreshButton"
            v-tooltip.bottom-left="`Reposition annotation`"
            @click="repositionAnnotation">

            <Icon iconName="swap" />
        </Button> -->
        <Button
            buttonType="icon"
            class="connectedNodeControl-locateButton"
            v-tooltip.bottom-left="`View this node`"
            @click="focusConnectedNode">

            <Icon iconName="locate" />
        </Button>
    </div>
</template>

<script>
  import Icon from '@/components/ui/Icon'
  import Button from '@/components/ui/Button'
  import { store } from '@/store'

  export default {
    components: {
      Icon,
      Button
    },

    props: {
      value: {
        type: String,
        default: '',
      },
      connectedNodeName: {
        type: String,
        default: 'Node',
      },
    },

    computed: {
      userSelection: () => store.userSelection,
      userSelectionIds: () => this.userSelection.map((selection) => selection.id),
    },

    methods: {
      editConnectedNode() {
        const selectedId = this.userSelectionIds[0]
        if (selectedId) {
          this.$emit('input', selectedId)
        }
      },
      repositionAnnotation() {
        this.$emit('repositionAnnotation', this.value)
      },
      focusConnectedNode() {
        parent.postMessage({
          pluginMessage: {
            type: 'focusNode',
            value: {
              figmaNodeId: this.value
            }
          }
        }, '*')
      }
    }
  }
</script>

<style lang="scss" scoped>
.connectedNodeControl {
  display: flex;
  gap: 8px;
  align-items: center;
  height: 32px;
  padding-left: 8px;
  border-radius: 3px;
}
</style>
