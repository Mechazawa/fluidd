import { ActionTree } from 'vuex'
import { GcodePreviewState, Move, PositioningMode, Rotation } from './types'
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

    let extrusionMode = PositioningMode.Relative
    let positioningMode = PositioningMode.Absolute
    const toolhead: Move = {
      x: 0,
      y: 0,
      z: 0,
      e: 0
    }

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
      } else if (command === 'M82') {
        extrusionMode = PositioningMode.Absolute
        toolhead.e = 0
      } else if (command === 'M83') {
        extrusionMode = PositioningMode.Relative
      } else if (command === 'G90') {
        extrusionMode = PositioningMode.Absolute
        positioningMode = PositioningMode.Absolute
        toolhead.e = 0
      } else if (command === 'G91') {
        extrusionMode = PositioningMode.Relative
        positioningMode = PositioningMode.Relative
      }

      if (move) {
        if (extrusionMode === PositioningMode.Absolute && move.e !== undefined) {
          const extrusionLength = move.e - (toolhead.e ?? 0)

          toolhead.e = move.e
          move.e = extrusionLength
        }

        if (positioningMode === PositioningMode.Relative) {
          if (move.x !== undefined) {
            move.x += toolhead.x ?? 0
          }

          if (move.y !== undefined) {
            move.y += toolhead.y ?? 0
          }

          if (move.z !== undefined) {
            move.z += toolhead.z ?? 0
          }
        }

        toolhead.x = move.x ?? toolhead.x
        toolhead.y = move.y ?? toolhead.y
        toolhead.z = move.z ?? toolhead.z

        moves.push(Object.freeze(move))
      }
    }

    commit('setFile', payload.file)
    commit('setMoves', moves)
  }
}
