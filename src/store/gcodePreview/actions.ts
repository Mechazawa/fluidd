import { ActionTree } from 'vuex'
import { ExtrusionMode, GcodePreviewState, Move, Rotation } from './types'
import { RootState } from '../types'
import { filterObject, parseGcode } from '@/store/helpers'
import { AppFile } from '@/store/files/types'

export const actions: ActionTree<GcodePreviewState, RootState> = {
  /**
   * Reset our store
   */
  async reset ({ commit }) {
    commit('setReset')
  },

  async loadGcode ({ commit }, payload: { file: AppFile; gcode: string }) {
    const moves: Move[] = []

    let extrusionMode = ExtrusionMode.Relative
    let lastExtrusion = 0

    for (const line of payload.gcode.split('\n')) {
      const {
        command,
        args
      } = parseGcode(line) ?? {}

      if (!command) {
        continue
      }

      let move: Move | null = null

      if (/^G[0-1]$/i.test(command)) {
        move = filterObject(args, [
          'x', 'y', 'z', 'e'
        ])
      } else if (/^G[2-3]$/i.test(command)) {
        move = {
          ...filterObject(args, [
            'x', 'y', 'z', 'e',
            'i', 'j', 'r'
          ]),
          direction: command === 'G2'
            ? Rotation.Clockwise : Rotation.CounterClockwise
        }
      } else if (command === 'M82' || command === 'G90') {
        extrusionMode = ExtrusionMode.Absolute
        lastExtrusion = 0
      } else if (command === 'M83' || command === 'G91') {
        extrusionMode = ExtrusionMode.Relative
      } else if (command === 'G90') {
        // todo absolute positioning
      } else if (command === 'G91') {
        // todo relative positioning
      }

      if (move) {
        if (extrusionMode === ExtrusionMode.Absolute && move.e !== undefined) {
          const extrusionLength = move.e - lastExtrusion

          lastExtrusion = move.e
          move.e = extrusionLength
        }

        moves.push(Object.freeze(move))
      }
    }

    commit('setFile', payload.file)
    commit('setMoves', moves)
  }
}
