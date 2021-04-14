<template>
  <div style="border: 1px solid black; overflow: hidden;">
    <svg :viewBox="svgViewBox" :height="height" :width="width" ref="svg">
      <g>
        <path style="will-change: d" stroke="white" stroke-linecap="round" stroke-linejoin="round" stroke-width="0.3"
              :d="svgPath"/>
      </g>
    </svg>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import StateMixin from '@/mixins/state'
import panzoom, { PanZoom } from 'panzoom'

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

  get svgPath () {
    if (!this.enabled) {
      return 'M 0,0 L 100,100 M 100,0 L 0,100'
    }

    const layerNr = Math.max(this.layer, 1)
    const layer = this.$store.getters['gcodePreview/getLayers'][layerNr - 1]

    return this.$store.getters['gcodePreview/getExtrusionPath'](layer)
  }

  mounted () {
    this.panzoom = panzoom(this.$refs.svg as SVGElement, {
      maxZoom: 20,
      minZoom: 0.95,
      bounds: true,
      boundsPadding: 0.9
    })
  }

  reset () {
    // eslint-disable-next-line no-unused-expressions
    this.panzoom?.zoomTo(0, 0, 1)
  }
}
</script>
