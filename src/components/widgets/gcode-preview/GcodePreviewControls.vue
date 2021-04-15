<template>
  <div>
    <gcode-preview-control-checkbox name="followProgress" label="Follow progress"/>
    <gcode-preview-control-checkbox name="showNextLayer" label="Show next layer"/>
    <gcode-preview-control-checkbox name="showPreviousLayer" label="Show previous layer"/>
    <gcode-preview-control-checkbox name="showMoves" label="Show moves"/>
    <gcode-preview-control-checkbox name="showExtrusions" label="Show extrusions"/>
    <gcode-preview-control-checkbox name="showRetractions" label="Show retractions"/>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import StateMixin from '@/mixins/state'
import GcodePreviewControlCheckbox from '@/components/widgets/gcode-preview/GcodePreviewControlCheckbox.vue'

@Component({
  components: { GcodePreviewControlCheckbox }
})
export default class GcodePreviewControls extends Mixins(StateMixin) {

}
</script>
