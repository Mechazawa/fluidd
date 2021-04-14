import { MutationTree } from 'vuex'
import { defaultState } from './'
import { GcodePreviewState } from './types'
import Vue from 'vue'

export const mutations: MutationTree<GcodePreviewState> = {
  /**
   * Reset state
   */
  setReset (state) {
    Object.assign(state, defaultState())
  },

  setMoves (state, payload) {
    console.log('setMoves start')
    Vue.set(state, 'moves', Object.freeze(payload))
    console.log('setMoves done')
  }
}
