import { CONTROL_CHARACTERISTIC_UUID, DATA_CHARACTERISTIC_UUID, NOTELET_SERVICE_UUID } from './protocol';

/**
 * NOT IMPLEMENTED. This is a design stub for the mobile half of the Phase 0
 * BLE POC (SRS §9, §62) — see utils/ble/transport.js on the watch side for
 * the Central half, which IS written (against the documented @zos/ble API),
 * though also untested against real hardware.
 *
 * Why this can't just implement `SyncTransport` (services/sync/transport.ts):
 * that interface assumes the mobile app actively calls `send()` and awaits a
 * response — modeled on the mock watch, which the mobile app "dials".
 * Real BLE roles are the opposite here: the watch is the BLE Central (it
 * scans, connects, and issues GATT reads/writes) and the phone can only be a
 * BLE Peripheral — a passive GATT *server* that responds to requests, never
 * initiates them. So the mobile side needs an event-driven server, not
 * another SyncTransport implementation.
 *
 * What building this for real requires:
 *
 * 1. A native module exposing BLE peripheral/GATT-server APIs — advertise
 *    NOTELET_SERVICE_UUID with CONTROL_CHARACTERISTIC_UUID (writable) and
 *    DATA_CHARACTERISTIC_UUID (readable), and receive OS callbacks for
 *    "central wrote to characteristic X" / "central is reading characteristic Y".
 *    No verified, currently-maintained Expo-compatible library does this
 *    (checked react-native-ble-peripheral — its own README describes it as
 *    a peripheral *simulator* for testing, not a real implementation — and
 *    react-native-ble-advertiser, which only broadcasts advertisements, no
 *    GATT server). This most likely means writing a small custom native
 *    module: CoreBluetooth's CBPeripheralManager on iOS, BluetoothGattServer
 *    on Android. `expo-dev-client` is already installed so a custom native
 *    module can be added without fully ejecting.
 *
 * 2. Once that module exists, the server logic itself is straightforward
 *    given protocol.ts:
 *      - on CONTROL characteristic write: decodeBase64ToMessage the command,
 *        compute the current SyncChangeSet from the local SQLite database
 *        (mobile/src/services/sync/changeSet.ts's rows-based helpers, once
 *        adapted to run outside SyncEngine), encodeMessageToBase64 it,
 *        splitIntoChunks, and stage the chunks for sequential reads.
 *      - on DATA characteristic read: return the next staged chunk, or
 *        END_OF_STREAM_MARKER once exhausted.
 *      - on receiving BleCommand.ACK_SYNC_COMPLETE: mark the synced
 *        entities SYNCED via markSynced() (database/repositories/syncMetadataRepository.ts),
 *        mirroring what SyncEngine.sync() already does for the mock path.
 */
export interface BlePeripheralServer {
  readonly serviceUuid: typeof NOTELET_SERVICE_UUID;
  readonly controlCharacteristicUuid: typeof CONTROL_CHARACTERISTIC_UUID;
  readonly dataCharacteristicUuid: typeof DATA_CHARACTERISTIC_UUID;
  startAdvertising(): Promise<void>;
  stopAdvertising(): Promise<void>;
}

export function createBlePeripheralServer(): BlePeripheralServer {
  throw new Error(
    'BLE peripheral server is not implemented — requires a native CoreBluetooth/BluetoothGattServer module. See the comment at the top of this file.',
  );
}
