import { GetterTree } from 'vuex'
import { GcodePreviewState, LayerPaths, Move } from './types'
import { RootState } from '../types'
import { AppFile } from '@/store/files/types'
import { binarySearch } from '@/store/helpers'

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
    return Array.from(getters.getAllLayerStarts.keys())
  },

  getLayerCount: (state, getters): number => {
    return getters.getLayers.length
  },

  getLayerPaths: (state, getters) => (layer: number, filePosition = Infinity): LayerPaths => {
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
      retractions: [],
      toolhead: {
        x: 0,
        y: 0
      }
    }

    let moveBuffer = []
    let traveling = true

    // todo: arcs
    for (; index < moves.length && moves[index].filePosition <= filePosition; index++) {
      const move = moves[index]
      const z = (move.z ?? toolhead.z)

      if (move.e > 0) {
        if (z !== layer) {
          while (moveBuffer.length > 0 && !moveBuffer[moveBuffer.length - 1].z) {
            moveBuffer.shift()
          }

          if (moveBuffer[moveBuffer.length - 1].z === z) {
            moveBuffer.shift()
          }

          break
        }

        if (traveling) {
          path.moves += moveBuffer.map(move => move.path).join(' ') + ' '
          path.extrusions += `M ${toolhead.x},${toolhead.y} `
          traveling = false
          moveBuffer = []
        }

        Object.assign(toolhead, move)
        path.extrusions += `L ${toolhead.x},${toolhead.y} `
      } else {
        if (!traveling) {
          moveBuffer.push({
            z,
            path: `M ${toolhead.x},${toolhead.y}`
          })
          traveling = true
        }

        if (move.e < 0) {
          path.retractions.push({
            x: toolhead.x,
            y: toolhead.y
          })
        }

        Object.assign(toolhead, move)
        moveBuffer.push({
          z,
          path: `L ${toolhead.x},${toolhead.y}`
        })
      }
    }

    path.moves += moveBuffer.map(move => move.path).join(' ') + ' '

    path.toolhead = {
      x: toolhead.x,
      y: toolhead.y
    }

    return path
  },

  getAllLayerStarts: (state, getters): Map<number, number> => {
    let z = -Infinity
    let zStart = 0
    const output = new Map()
    const moves = getters.getMoves

    for (let index = 0; index < moves.length; index++) {
      if (moves[index].z !== undefined && z !== moves[index].z) {
        z = moves[index].z
        zStart = index
      }

      if (moves[index].e > 0 && !output.has(z)) {
        output.set(z, zStart)
      }
    }

    return output
  },

  getLayerStart: (state, getters) => (layer: number): number => {
    return getters.getAllLayerStarts.get(layer) ?? -1
  },

  getCurrentMoveIndex: (state, getters, rootState): number => {
    const filePosition = rootState.printer?.printer.virtual_sdcard.file_position

    return binarySearch(getters.getMoves, (val: Move) => filePosition - (val.filePosition ?? 0), true)
  },

  getCurrentLayer: (state, getters): number => {
    const currentIndex = getters.getCurrentMoveIndex
    const layerStarts: [number, number][] = Array.from(getters.getAllLayerStarts.entries())

    for (let index = 0; index < layerStarts.length - 1; index++) {
      if (currentIndex < layerStarts[index + 1]?.[1]) {
        return layerStarts[index][0]
      }
    }

    return layerStarts[layerStarts.length - 1]?.[0] ?? 0
  }
}
