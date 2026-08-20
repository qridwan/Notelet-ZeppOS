import {
  mstStartScan,
  mstStopScan,
  mstConnect,
  mstDisconnect,
  mstBuildProfile,
  mstPrepare,
  mstOnPrepare,
  mstReadCharacteristic,
  mstWriteCharacteristic,
  mstOnCharaValueArrived,
  mstOnCharaWriteComplete,
  mstDestroyProfileInstance
} from '@zos/ble'

import {
  NOTELET_SERVICE_UUID,
  CONTROL_CHARACTERISTIC_UUID,
  DATA_CHARACTERISTIC_UUID,
  BleCommand,
  encodeMessageToBase64,
  decodeBase64ToMessage,
  joinChunks
} from './protocol'

const PROFILE_NAME = 'notelet-sync'
const SCAN_TIMEOUT_SECONDS = 10
const END_OF_STREAM_MARKER = '__END__'

/**
 * Watch-side BLE Central transport (Phase 0 POC): scans for the Notelet
 * mobile app's advertised peripheral, connects, and pulls chunked sync
 * payloads over a custom GATT profile.
 *
 * UNTESTED against real hardware — see utils/ble/protocol.js for caveats.
 * Deliberately NOT wired into the working mock-data flow (home page still
 * uses utils/syncClient.js's PULL_SYNC-over-app-side path); this is meant
 * to be exercised standalone once a real mobile-side BLE peripheral exists.
 */
export class BleCentralTransport {
  constructor() {
    this.connectId = null
    this.profile = null
    this.messageHandlers = []
    this.pendingChunks = []
  }

  connect() {
    return new Promise((resolve, reject) => {
      const started = mstStartScan(
        (result) => {
          if (!result.service_uuid_array || !result.service_uuid_array.includes(NOTELET_SERVICE_UUID)) {
            return
          }
          mstStopScan()
          this._connectToDevice(result.dev_addr).then(resolve).catch(reject)
        },
        { service_uuid: NOTELET_SERVICE_UUID },
        {
          duration: SCAN_TIMEOUT_SECONDS,
          on_timeout: () => reject(new Error('No Notelet phone found nearby (scan timed out)'))
        }
      )
      if (!started) {
        reject(new Error('Unable to start BLE scan'))
      }
    })
  }

  _connectToDevice(deviceAddress) {
    return new Promise((resolve, reject) => {
      mstConnect(deviceAddress, (result) => {
        if (result.connected !== 0) {
          reject(new Error(`BLE connect failed (status ${result.connected})`))
          return
        }

        this.connectId = result.connect_id

        const built = mstBuildProfile({
          pair: false,
          id: this.connectId,
          profile: PROFILE_NAME,
          dev: deviceAddress,
          len: 1,
          list: [
            {
              len: 1,
              list: [
                {
                  uuid: NOTELET_SERVICE_UUID,
                  len1: 2,
                  list: [
                    { uuid: CONTROL_CHARACTERISTIC_UUID, len: 0, list: [] },
                    { uuid: DATA_CHARACTERISTIC_UUID, len: 0, list: [] }
                  ]
                }
              ]
            }
          ]
        })

        if (!built) {
          reject(new Error('Unable to build BLE GATT profile'))
          return
        }

        mstOnPrepare((profile, status) => {
          if (status !== 0) {
            reject(new Error(`BLE profile prepare failed (status ${status})`))
            return
          }
          this.profile = profile
          this._registerListeners()
          resolve()
        })

        mstPrepare(this.connectId)
      })
    })
  }

  _registerListeners() {
    mstOnCharaValueArrived((profile, uuid, data, status) => {
      if (profile !== this.profile || uuid !== DATA_CHARACTERISTIC_UUID) return
      if (status !== 0) return

      const chunkText = String.fromCharCode(...new Uint8Array(data))
      if (chunkText === END_OF_STREAM_MARKER) {
        const fullMessage = decodeBase64ToMessage(joinChunks(this.pendingChunks))
        this.pendingChunks = []
        this.messageHandlers.forEach((handler) => handler(fullMessage))
        return
      }

      this.pendingChunks.push(chunkText)
      // Pull-based chunk transfer: request the next chunk immediately after
      // each arrives, since GATT reads here are one value per call, not a
      // stream (see utils/ble/protocol.js for why chunking is needed at all).
      mstReadCharacteristic(this.profile, DATA_CHARACTERISTIC_UUID)
    })
  }

  onMessage(handler) {
    this.messageHandlers.push(handler)
    return () => {
      this.messageHandlers = this.messageHandlers.filter((h) => h !== handler)
    }
  }

  send(message) {
    return new Promise((resolve, reject) => {
      if (!this.profile) {
        reject(new Error('BLE transport is not connected'))
        return
      }

      const command = { type: BleCommand.REQUEST_CHUNK, payload: message }
      const bytes = Uint8Array.from(
        [...encodeMessageToBase64(command)].map((char) => char.charCodeAt(0))
      )

      mstOnCharaWriteComplete((profile, uuid, status) => {
        if (profile !== this.profile || uuid !== CONTROL_CHARACTERISTIC_UUID) return
        if (status !== 0) {
          reject(new Error(`BLE write failed (status ${status})`))
          return
        }
        this.pendingChunks = []
        mstReadCharacteristic(this.profile, DATA_CHARACTERISTIC_UUID)
        resolve()
      })

      mstWriteCharacteristic(this.profile, CONTROL_CHARACTERISTIC_UUID, bytes.buffer, bytes.length)
    })
  }

  disconnect() {
    if (this.profile) {
      mstDestroyProfileInstance(this.profile)
      this.profile = null
    }
    if (this.connectId !== null) {
      mstDisconnect(this.connectId)
      this.connectId = null
    }
    return Promise.resolve()
  }
}
