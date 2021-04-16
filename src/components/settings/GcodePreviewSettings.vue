<template>
  <div>
    <v-subheader id="toolhead">{{ $t('app.setting.title.gcode_preview') }}</v-subheader>
    <v-card
      :elevation="5"
      dense
      class="mb-4">

      <app-setting :title="$t('app.setting.label.extrusion_line_width')">
        <v-text-field
          :value="extrusionLineWidth"
          @change="setExtrusionLineWidth"
          :rules="[rules.numRequired, rules.numMin]"
          filled
          dense
          single-line
          hide-details
          suffix="mm"
        ></v-text-field>
      </app-setting>

      <v-divider />

      <app-setting :title="$t('app.setting.label.move_line_width')">
        <v-text-field
          :value="moveLineWidth"
          @change="setMoveLineWidth"
          :rules="[rules.numRequired, rules.numMin]"
          filled
          dense
          single-line
          hide-details
          suffix="mm"
        ></v-text-field>
      </app-setting>

      <v-divider />

      <app-setting :title="$t('app.setting.label.retraction_icon_size')">
        <v-text-field
          :value="retractionIconSize"
          @change="setRetractionIconSize"
          :rules="[rules.numRequired, rules.numMin]"
          filled
          dense
          single-line
          hide-details
          suffix="mm"
        ></v-text-field>
      </app-setting>

      <v-divider></v-divider>

      <app-setting :title="$t('app.setting.label.reset')">
        <app-btn
          outlined
          small
          color="primary"
          @click="handleReset"
        >
          {{ $t('app.setting.btn.reset') }}
        </app-btn>
      </app-setting>

    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { defaultState } from '@/store/config/index'

@Component({
  components: {}
})
export default class GcodePreviewSettings extends Vue {
  rules = {
    numRequired: (v: number | string) => v !== '' || 'Required',
    numMin: (v: number) => v >= 0 || 'Min 0'
  }

  get extrusionLineWidth () {
    // return this.$store.state.config.uiSettings.general.defaultToolheadXYSpeed
  }

  setExtrusionLineWidth (value: number) {
    // this.$store.dispatch('config/saveByPath', {
    //   path: 'uiSettings.general.defaultToolheadXYSpeed',
    //   value: +value,
    //   server: true
    // })
  }

  handleReset () {
    // let value = defaultState().uiSettings.general
    // const current = this.$store.state.config.uiSettings.general
    // value = {
    //   ...value,
    //   instanceName: current.instanceName,
    //   chartVisible: current.chartVisible,
    //   hideTempWaits: current.hideTempWaits,
    //   printTimeEstimationsType: current.printTimeEstimationsType
    // }
    // this.$store.dispatch('config/saveByPath', {
    //   path: 'uiSettings.general',
    //   value,
    //   server: true
    // })
  }
}
</script>
