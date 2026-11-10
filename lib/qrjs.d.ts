// Types for qr.js (the QR encoder that react-qr-code is built on; it ships no types).
declare module 'qr.js/lib/QRCode' {
  export default class QRCode {
    constructor(typeNumber: number, errorCorrectLevel: number)
    addData(data: string, mode?: string): void
    make(): void
    modules: boolean[][]
    getModuleCount(): number
  }
}
declare module 'qr.js/lib/ErrorCorrectLevel' {
  const levels: { L: number; M: number; Q: number; H: number }
  export default levels
}
