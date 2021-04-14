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
          <gcode-preview width="100%"  :layer="currentLayer" :enabled="layerCount > 0"></gcode-preview>
        </v-col>
        <v-col cols="4">
          <app-btn color="secondary" text @click="reset">Reset</app-btn>
          <p>{{ layerCount }} Layers</p>
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

@Component({
  components: { GcodePreview }
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

  get layerCount () {
    return this.$store.getters['gcodePreview/getLayerCount']
  }

  reset () {
    this.$store.dispatch('gcodePreview/reset')
  }
}
</script>
