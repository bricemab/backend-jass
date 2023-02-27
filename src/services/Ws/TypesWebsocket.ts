import WebSocket from "ws";
import WebSocketOpCodeClient from "./WebSocketOpCodeClient";
import WebSocketOpCodeServer from "./WebSocketOpCodeServer";

export enum WebSocketState {
  DISCONNECTED = "DISCONNECTED",
  CONNECTED = "CONNECTED",
  OTHER = "OTHER"
}

export enum TsConnectionState {
  DISCONNECTED = "DISCONNECTED",
  CONNECTED = "CONNECTED"
}

export enum WebSocketRole {
  UNKNOWN = "UNKNOWN",
  ANONYMOUS = "ANONYMOUS",
  CLIENT = "CLIENT",
  REST_SERVICE = "REST_SERVICE"
}

export interface WebsocketPacket<DataType> {
  serviceCommunicationToken?: string;
  success: boolean;
  data: DataType;
}

export interface WebSocketClientSecuredMessage<DataType> {
  opCode: WebSocketOpCodeServer;
  requestId: string | null;
  token: string;
  packet: {
    success: boolean;
    data: DataType;
  };
  hasFinalResponse: boolean;
}

export interface WebSocketServerSecuredMessage<DataType> {
  opCode: WebSocketOpCodeClient;
  requestId: string | null;
  token?: string;
  packet: WebsocketPacket<DataType>;
  hasFinalResponse: boolean;
}

export interface Service {
  key: string;
  token: string;
  name: string;
  description: string;
  hasBeenModified: boolean;
}

export interface WebsocketClient extends WebSocket {
  id: string;
  token: string;
  role: WebSocketRole;
  wsKey: string;
  state: WebSocketState;
  timeOut: any;
  hasFinalResponse: boolean;
}

export interface WsPacketConnectionRequest {
  state: WebSocketState;
  initialToken: string;
  wsKey: string;
  role: WebSocketRole;
}

// Packets
export interface WsPacketServiceResponse {
  requestId: string;
}
