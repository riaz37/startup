// Export the universal Socket.IO server
export { socketServer } from './socket-server';

// Export helper functions
export {
  emitOrderUpdate,
  emitPaymentSuccess,
  emitGroupOrderThresholdMet,
  emitNewNotification,
  emitDeliveryUpdate,
} from './socket-server';

// Export types
export type { WebSocketEvents, WebSocketData } from './socket-server'; 