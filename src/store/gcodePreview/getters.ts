import { GetterTree } from 'vuex'
import { GcodePreviewState, LayerPaths, Move } from './types'
import { RootState } from '../types'
import { AppFile } from '@/store/files/types'
import consola from 'consola'

export const getters: GetterTree<GcodePreviewState, RootState> = {
  /**
   * Returns a collection of all the moves
   */
  getMoves: (state): Move[] => {
    return state.moves
  },

  getFile: (state): AppFile | undefined => {
    return state.file
  },

  getViewerOption: (state) => (key: string): any => {
    return (state.viewer as any)[key]
  },

  getLayers: (state, getters): number[] => {
    const layers: Set<number> = new Set()
    let z = -1
    let pushed = true

    for (const move of getters.getMoves) {
      if (move.z >= 0) {
        z = move.z
        pushed = false
      } else if (!pushed && move.e > 0) {
        layers.add(z)
        pushed = true
      }
    }

    // Convert to array and sort ascending
    return Array
      .from(layers)
      .sort((a, b) => a - b)
  },

  getLayerCount: (state, getters): number => {
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

  getLayerPaths: (state, getters) => (layer: number): LayerPaths => {
    let index = getters.getLayerStart(layer)
    const moves = getters.getMoves
    const toolhead = {
      x: NaN,
      y: NaN,
      z: layer
    }

    // Prime toolhead
    for (; index >= 0 && (Number.isNaN(toolhead.x) || Number.isNaN(toolhead.y)); index--) {
      const move = moves[index]

      if (Number.isNaN(toolhead.x) && move.x !== undefined) {
        toolhead.x = move.x
      }

      if (Number.isNaN(toolhead.y) && move.y !== undefined) {
        toolhead.y = move.y
      }
    }

    toolhead.x = Number.isNaN(toolhead.x) ? 0 : toolhead.x
    toolhead.y = Number.isNaN(toolhead.y) ? 0 : toolhead.y

    const path: LayerPaths = {
      extrusions: '',
      moves: `M ${toolhead.x},${toolhead.y}`,
      retractions: []
    }

    let traveling = true

    for (; index < moves.length; index++) {
      const move = moves[index]
      const z = (move.z ?? toolhead.z)

      if (move.e > 0) {
        if (z > layer) {
          break
        }

        if (traveling) {
          path.extrusions += `M ${toolhead.x},${toolhead.y} `
          traveling = false
        }

        Object.assign(toolhead, move)
        path.extrusions += `L ${toolhead.x},${toolhead.y} `
      } else {
        if (!traveling) {
          path.moves += `M ${toolhead.x},${toolhead.y} `
          traveling = true
        }

        if (move.e < 0) {
          path.retractions.push({
            x: toolhead.x,
            y: toolhead.y
          })
        }

        Object.assign(toolhead, move)
        path.moves += `L ${toolhead.x},${toolhead.y} `
      }
    }

    if (path.retractions.length > 0) {
      consola.debug('retractions', layer, path.retractions)
    } else {
      consola.debug('no retractions', layer)
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
