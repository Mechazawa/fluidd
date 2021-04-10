import { MutationTree } from 'vuex'
import { defaultState } from './'
import { GcodePreviewState } from './types'
import Vue from 'vue'
import { blockObserver } from '@/store/helpers'

export const mutations: MutationTree<GcodePreviewState> = {
  /**
   * Reset state
   */
  setReset (state) {
    Object.assign(state, defaultState())
  },

  setMoves (state, payload) {
    console.log('setMoves start')
    Vue.set(state, 'moves', blockObserver(payload))
    console.log('setMoves done')
  }
}
