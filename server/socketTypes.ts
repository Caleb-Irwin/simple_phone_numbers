export type color = string;
export type uuid = string;
export type publicId = string;

export interface msgCreate {
  msg: string;
  uuid: uuid;
  senderType?: string;
  data?: string;
}

export interface message {
  color: color;
  publicId: string;
  senderType: string;
  message: string;
  data?: string;
}

export type messages = message[];

export interface authCreate {
  uuid: uuid;
  color: color;
  publicId: publicId;
}
