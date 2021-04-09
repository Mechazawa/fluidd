import { GetterTree } from 'vuex'
import { GcodePreviewState } from './types'
import { RootState } from '../types'

export const getters: GetterTree<GcodePreviewState, RootState> = {
  /**
   * Returns the current layer number
   */
  getLayer: (state) => {
    return state.layer
  }
}
