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
    <p>{{ $store.getters['gcodePreview/getLayerCount'] }} Layers</p>
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

  get currentFile () {
    return this.$store.state.printer.printer.print_stats.filename
  }

  async loadFile () {
    const file = await this.getFile(this.currentFile, 'gcodes')

    this.$store.dispatch('gcodePreview/loadGcode', file.data)
  }

  reset () {
    this.$store.dispatch('gcodePreview/reset')
  }
}
</script>
