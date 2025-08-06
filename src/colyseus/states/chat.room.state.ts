import { MapSchema, Schema, type } from "@colyseus/schema";

export class Player extends Schema {
  @type("string") name: string = "";
  @type("number") x: number;
  @type("number") y: number;
  @type("string") roomName: string = "";
}

export class ChatRoomState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
}
