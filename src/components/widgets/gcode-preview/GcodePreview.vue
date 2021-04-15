<template>
  <div style="border: 1px solid black; overflow: hidden;">
    <svg :viewBox="svgViewBox" :height="height" :width="width" ref="svg"
         xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <svg id="retraction" width="2" height="2" viewBox="0 0 10 10">
          <path d="M 10,10 L 5,0 L 0,10 Z" fill="red" fill-opacity="0.9"/>
        </svg>
      </defs>
      <g id="previousLayer" class="layer" v-if="getOption('showPreviousLayer')">
        <path stroke="lightgrey" stroke-width="0.3" stroke-opacity="0.6" :d="svgPathPrevious.extrusions"/>
      </g>
      <g id="currentLayer" class="layer">
        <path :d="svgPathCurrent.extrusions" stroke="white" stroke-width="0.3" v-if="getOption('showExtrusions')"/>
        <path :d="svgPathCurrent.moves" stroke="gray" stroke-width="0.1" v-if="getOption('showMoves')"/>

        <g id="retractions" v-if="getOption('showRetractions') && svgPathCurrent.retractions.length > 0">
          <use v-for="({x, y}, index) of svgPathCurrent.retractions" :key="`retraction-${index + 1}`"
               xlink:href="#retraction" :x="x - 1" :y="y - 2"/>
        </g>
      </g>
      <g id="nextLayer" class="layer" v-if="getOption('showNextLayer')">
        <path stroke="lightgrey" stroke-width="0.3" stroke-opacity="0.6" :d="svgPathNext.extrusions"/>
      </g>
    </svg>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import StateMixin from '@/mixins/state'
import panzoom, { PanZoom } from 'panzoom'
import { LayerPaths } from '@/store/gcodePreview/types'

@Component({})
export default class GcodePreview extends Mixins(StateMixin) {
  @Prop({
    type: Boolean,
    default: true
  })
  enabled!: boolean

  @Prop({
    type: String,
    default: 'auto'
  })
  width!: string

  @Prop({
    type: String,
    default: 'auto'
  })
  height!: string

  @Prop({
    type: Number,
    default: 0
  })
  layer!: number

  panzoom?: PanZoom

  get svgViewBox () {
    const {
      stepper_x: stepperX,
      stepper_y: stepperY
    } = this.$store.getters['printer/getPrinterSettings']()

    if (!this.enabled || stepperX === undefined || stepperY === undefined) {
      return '0 0 100 100'
    }

    return `${stepperX.position_min} ${stepperY.position_min} ${stepperX.position_max} ${stepperY.position_max}`
  }

  get defaultLayerPaths (): LayerPaths {
    return {
      extrusions: '',
      moves: '',
      retractions: []
    }
  }

  get svgPathCurrent (): LayerPaths {
    if (!this.enabled) {
      return this.defaultLayerPaths
    }

    const layerNr = Math.max(this.layer, 1)
    const layer = this.$store.getters['gcodePreview/getLayers'][layerNr - 1]

    return this.$store.getters['gcodePreview/getLayerPaths'](layer)
  }

  get svgPathPrevious (): LayerPaths {
    if (!this.enabled || this.layer <= 1) {
      return this.defaultLayerPaths
    }

    const layer = this.$store.getters['gcodePreview/getLayers'][this.layer - 2]

    return this.$store.getters['gcodePreview/getLayerPaths'](layer)
  }

  get svgPathNext (): LayerPaths {
    const layers = this.$store.getters['gcodePreview/getLayers']

    if (!this.enabled || this.layer >= layers.length) {
      return this.defaultLayerPaths
    }

    return this.$store.getters['gcodePreview/getLayerPaths'](layers[this.layer])
  }

  mounted () {
    this.panzoom = panzoom(this.$refs.svg as SVGElement, {
      maxZoom: 20,
      minZoom: 0.98,
      bounds: true,
      boundsPadding: 0.9
    })
  }

  reset () {
    // eslint-disable-next-line no-unused-expressions
    this.panzoom?.zoomTo(0, 0, 1)
  }

  getOption (name: string) {
    return this.$store.getters['gcodePreview/getViewerOption'](name)
  }
}
</script>

<style lang="scss" scoped>
.layer > path {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>
