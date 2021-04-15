import { MutationTree } from 'vuex'
import { defaultState } from './'
import { GcodePreviewState } from './types'
import Vue from 'vue'
import { AppFile } from '@/store/files/types'

export const mutations: MutationTree<GcodePreviewState> = {
  /**
   * Reset state
   */
  setReset (state) {
    Object.assign(state, defaultState())
  },

  setMoves (state, payload) {
    Vue.set(state, 'moves', Object.freeze(payload))
  },

  setFile (state, file: AppFile) {
    state.file = file
  },

  setViewerState (state, payload: any) {
    for (const key of Object.keys(state.viewer)) {
      if (Object.prototype.hasOwnProperty.call(payload, key)) {
        Vue.set(state.viewer, key, payload[key])
      }
    }
  }
}
