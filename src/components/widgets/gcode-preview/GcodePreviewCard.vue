<template>
  <collapsable-card
    :title="cardTitle"
    icon="$cubeScan"
    cardClasses="mb-2 mb-sm-4 d-flex flex-column"
    contentClasses="flex-grow-1 flow-shrink-0"
    layout-path="dashboard.gcode-preview-card"
    draggable
    :enabled="enabled"
    @enabled="$emit('enabled', $event)">

    <template v-slot:title>
      <v-icon left>$cubeScan</v-icon>
      <span class="font-weight-light">{{ cardTitle }}</span>
    </template>

    <v-card-text>
      <v-row>
        <v-col>
          <app-slider
            label="Layer nr"
            :value="currentLayer"
            :min="1"
            :max="layerCount"
            :disabled="layerCount === 0"
            instant
            input-md
            @input="currentLayer = $event">
          </app-slider>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="8">
          <gcode-preview width="100%" :layer="currentLayer" :enabled="layerCount > 0"></gcode-preview>
        </v-col>
        <v-col cols="4">
          <app-btn color="secondary" text @click="reset">Reset</app-btn>
          <p>{{ layerCount }} Layers</p>
          <p>Current Layer: {{ currentLayer }}({{ currentLayerHeight }})</p>
          <GcodePreviewControls/>
        </v-col>
      </v-row>
    </v-card-text>

  </collapsable-card>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import StateMixin from '@/mixins/state'
import FilesMixin from '@/mixins/files'
import GcodePreview from './GcodePreview.vue'
import GcodePreviewControls from '@/components/widgets/gcode-preview/GcodePreviewControls.vue'
import { AppFile } from '@/store/files/types'

@Component({
  components: {
    GcodePreview,
    GcodePreviewControls
  }
})
export default class GcodePreviewCard extends Mixins(StateMixin, FilesMixin) {
  @Prop({
    type: Boolean,
    default: true
  })
  enabled!: boolean

  currentLayer = 1

  @Watch('layerCount')
  onLayerCountChanged () {
    this.currentLayer = 1
  }

  @Watch('followProgress')
  onFollowProgressChanged () {
    if (this.followProgress) {
      this.currentLayer = this.$store.getters['gcodePreview/getCurrentLayer']
    }
  }

  @Watch('currentLayer')
  onCurrentLayerChanged () {
    if (this.followProgress && this.currentLayer !== this.$store.getters['gcodePreview/getCurrentLayer']) {
      this.followProgress = false
    }
  }

  get file (): AppFile | undefined {
    return this.$store.getters['gcodePreview/getFile']
  }

  get cardTitle () {
    const title = this.$t('app.general.title.gcode_preview')

    if (!this.file) {
      return title
    }

    return `${title} - ${this.file.name}`
  }

  get layerCount () {
    return this.$store.getters['gcodePreview/getLayerCount']
  }

  get currentLayerHeight () {
    return this.$store.getters['gcodePreview/getLayers'][this.currentLayer - 1] ?? 0
  }

  get followProgress () {
    return this.$store.getters['gcodePreview/getViewerOption']('followProgress')
  }

  set followProgress (value) {
    this.$store.commit('gcodePreview/setViewerState', { followProgress: value })
  }

  reset () {
    this.$store.dispatch('gcodePreview/reset')
  }
}
</script>
