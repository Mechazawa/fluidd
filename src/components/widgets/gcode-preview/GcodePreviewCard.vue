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
      :disabled="layerCount === 0"
      @input="currentLayer = $event">
    </app-slider>
    <svg viewBox="0 0 200 200" width="50%" height="50%">
      <g ref="svgGroup">
        <path stroke="white" stroke-linecap="round" stroke-linejoin="round" stroke-width="0.4" :d="svgPath"/>
      </g>
    </svg>
    <app-btn color="secondary" text @click="reset">Reset</app-btn>

  </collapsable-card>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import StateMixin from '@/mixins/state'
import FilesMixin from '@/mixins/files'
import panzoom from 'panzoom'

@Component({})
export default class GcodePreviewCard extends Mixins(StateMixin, FilesMixin) {
  @Prop({
    type: Boolean,
    default: true
  })
  enabled!: boolean

  panzoom: PanZoom

  currentLayer = 1

  get currentFile () {
    return this.$store.state.printer.printer.print_stats.filename
  }

  get layerCount () {
    return this.$store.getters['gcodePreview/getLayerCount']
  }

  get svgPath () {
    if (this.layerCount === 0) {
      return 'M 0,0 L 200,200 M 200,0 L 0,200'
    }

    const layerNr = Math.max(this.currentLayer - 1, 0)
    const layer = this.$store.getters['gcodePreview/getLayers'][layerNr]

    return this.$store.getters['gcodePreview/getExtrusionPath'](layer)
  }

  async loadFile () {
    const file = await this.getFile(this.currentFile, 'gcodes', 0)

    this.reset()

    this.$store.dispatch('gcodePreview/loadGcode', file.data)

    this.currentLayer = 1
  }

  mounted () {
    this.panzoom = panzoom(this.$refs.svgGroup, {
      maxZoom: 20,
      minZoom: 0.1,
      bounds: true,
      boundsPadding: 0.2
    })
  }

  reset () {
    this.$store.dispatch('gcodePreview/reset')
    this.panzoom.zoomTo(0, 0, 1)
  }
}
</script>
