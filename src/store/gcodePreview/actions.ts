import { ActionTree } from 'vuex'
import { GcodePreviewState } from './types'
import { RootState } from '../types'

export const actions: ActionTree<GcodePreviewState, RootState> = {
  /**
   * Reset our store
   */
  async reset ({ commit }) {
    commit('setReset')
  }
}
