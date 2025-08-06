import { Room } from "colyseus";

export class RoomManager {
  private static rooms: Room[] = [];

  static register(room: Room) {
    RoomManager.rooms.push(room);
  }

  static unregister(room: Room) {
    RoomManager.rooms = RoomManager.rooms.filter((r) => r !== room);
  }

  static broadcastToAll(event: string, data: any) {
    for (const room of RoomManager.rooms) {
      room.broadcast(event, data);
    }
  }
}
