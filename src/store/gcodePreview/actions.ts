import { ActionTree } from 'vuex'
import { ArcMove, GcodePreviewState, Move, Rotation } from './types'
import { RootState } from '../types'
import { filterObject, parseGcode } from '@/store/helpers'

export const actions: ActionTree<GcodePreviewState, RootState> = {
  /**
   * Reset our store
   */
  async reset ({ commit }) {
    commit('setReset')
  },

  async loadGcode ({ commit, getters }, gcode: string) {
    const moves: Move[] = []

    for (const line of gcode.split('\n')) {
      const {
        command,
        args
      } = parseGcode(line) ?? {}

      if (!command) {
        continue
      }

      if (/G[0-1]$/i.test(command)) {
        const move: Move = filterObject(args, [
          'x', 'y', 'z', 'e'
        ])

        moves.push(Object.freeze(move))
      } else if (/G[2-3]$/i.test(command)) {
        const move: ArcMove = {
          ...filterObject(args, [
            'x', 'y', 'z', 'e',
            'i', 'j', 'r'
          ]),
          direction: command === 'G2'
            ? Rotation.Clockwise : Rotation.CounterClockwise
        }

        moves.push(Object.freeze(move))
      }
    }

    commit('setMoves', moves)
  }
}
