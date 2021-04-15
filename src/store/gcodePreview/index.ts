import { Module } from 'vuex'
import { getters } from './getters'
import { actions } from './actions'
import { mutations } from './mutations'
import { GcodePreviewState } from './types'
import { RootState } from '../types'

/**
 * Maintains the state of the console
 */
export const defaultState = (): GcodePreviewState => {
  return {
    moves: [],
    file: undefined
  }
}

export const state = defaultState()

const namespaced = true

export const gcodePreview: Module<GcodePreviewState, RootState> = {
  namespaced,
  state,
  getters,
  actions,
  mutations
}
