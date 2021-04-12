<template>
  <collapsable-card
    :title="$t('app.general.title.gcode_preview')"
    icon="$console"
    cardClasses="mb-2 mb-sm-4 d-flex flex-column"
    contentClasses="flex-grow-1 flow-shrink-0"
    :draggable="true"
    :enabled="enabled"
    @enabled="$emit('enabled', $event)">

    <template v-slot:title>
      <v-icon left>$console</v-icon>
      <span class="font-weight-light">{{ $t('app.general.title.gcode_preview') }}</span>
    </template>

    <app-btn color="primary" text @click="loadFile">Load {{ currentFile }}</app-btn>
    <p>{{ layerCount }} Layers</p>
    <app-slider
      label="Layer nr"
      :value="currentLayer"
      :min="1"
      :max="layerCount"
      :disabled="!layerCount"
      @input="currentLayer = $event">
    </app-slider>
    <svg v-if="layerCount > 0" viewBox="0 0 200 200">
      <path stroke="white" stroke-linecap="round" stroke-linejoin="round" stroke-width="0.4" :d="svgPath"/>
    </svg>
    <app-btn color="secondary" text @click="reset">Reset</app-btn>

  </collapsable-card>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import StateMixin from '@/mixins/state'
import FilesMixin from '@/mixins/files'

@Component({})
export default class GcodePreviewCard extends Mixins(StateMixin, FilesMixin) {
  @Prop({
    type: Boolean,
    default: true
  })
  enabled!: boolean

  currentLayer = 0

  get currentFile () {
    return this.$store.state.printer.printer.print_stats.filename
  }

  get layerCount () {
    return this.$store.getters['gcodePreview/getLayerCount']
  }

  get svgPath () {
    const layerNr = Math.max(this.currentLayer - 1, 0)
    const layer = this.$store.getters['gcodePreview/getLayers'][layerNr]

    return this.$store.getters['gcodePreview/getExtrusionPath'](layer)
  }

  async loadFile () {
    const file = await this.getFile(this.currentFile, 'gcodes', 0)

    this.$store.dispatch('gcodePreview/loadGcode', file.data)

    this.currentLayer = 0
  }

  reset () {
    this.$store.dispatch('gcodePreview/reset')
  }
}
</script>
