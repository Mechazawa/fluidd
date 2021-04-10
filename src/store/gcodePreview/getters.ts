import { GetterTree } from 'vuex'
import { GcodePreviewState, Move } from './types'
import { RootState } from '../types'

export const getters: GetterTree<GcodePreviewState, RootState> = {
  /**
   * Returns a collection of all the moves
   */
  getMoves: (state): Move[] => {
    return state.moves
  },

  getLayers: (state): number[] => {
    const layers: Set<number> = new Set()
    let z = -1
    let pushed = true

    console.log('getLayers start for', state.moves.length, 'moves')

    for (const move of state.moves) {
      if (move.z >= 0) {
        z = move.z
        pushed = false
      } else if (!pushed && move.e > 0) {
        layers.add(z)
        pushed = true
      }
    }

    console.log('getLayers done', layers)

    // Convert to array and sort ascending
    return Array
      .from(layers)
      .sort((a, b) => a - b)
  },

  getLayerCount: (state, getters): number => {
    console.log('getLayerCount', getters.getLayers.length)

    return getters.getLayers.length
  },

  getLayerPaths: (store, getters) => (layer: number) => {
    throw new Error('Todo')
  }
}
