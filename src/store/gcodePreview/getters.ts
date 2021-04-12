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

  getLayers: (state, getters): number[] => {
    const layers: Set<number> = new Set()
    let z = -1
    let pushed = true

    console.log('getLayers start for', getters.getMoves.length, 'moves')

    for (const move of getters.getMoves) {
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

  getDimensions: (state, getters): { x: { min: number; max: number }; y: { min: number; max: number }; z: { min: number; max: number } } => {
    const output = {
      x: {
        min: Infinity,
        max: -Infinity
      },
      y: {
        min: Infinity,
        max: -Infinity
      },
      z: {
        min: Infinity,
        max: -Infinity
      }
    }

    for (const move of getters.getMoves) {
      for (const [axis, obj] of Object.entries(output)) {
        const position: number = move[axis]

        if (position === undefined) {
          continue
        }

        if (position > obj.max) {
          obj.max = position
        } else if (position < obj.min) {
          obj.min = position
        }
      }
    }

    return output
  },

  getExtrusionPath: (state, getters) => (layer: number): string => {
    let index = getters.getLayerStart(layer)
    let path = ''
    const moves = getters.getMoves
    const toolhead = {
      x: NaN,
      y: NaN,
      z: layer
    }

    // Prime toolhead
    for (; index >= 0 && !Number.isNaN(toolhead.x) && Number.isNaN(toolhead.y); index--) {
      const move = moves[index]

      if (Number.isNaN(toolhead.x) && move.x !== undefined) {
        toolhead.x = move.x
      }

      if (Number.isNaN(toolhead.y) && move.y !== undefined) {
        toolhead.y = move.y
      }
    }

    for (; index < moves.length; index++) {
      const move = moves[index]
      const z = (move.z ?? toolhead.z)
      let traveling = true

      if (move.e > 0) {
        if (z > layer) {
          break
        }

        if (traveling) {
          path += `M ${toolhead.x},${toolhead.y} `
          traveling = false
        }

        Object.assign(toolhead, move)
        path += `L ${toolhead.x},${toolhead.y} `
      } else {
        traveling = true
        Object.assign(toolhead, move)
      }
    }

    return path
  },

  getLayerStart: (state, getters) => (layer: number): number => {
    let z = 0
    let index = 0
    const moves = getters.getMoves

    for (; index < moves.length; index++) {
      if (moves[index].z !== undefined) {
        z = moves[index].z
      }

      if (z === layer && moves[index].e !== undefined) {
        break
      }
    }

    for (; index >= 0; index--) {
      if (moves[index].z !== undefined) {
        return index
      }
    }

    return -1
  }
}
