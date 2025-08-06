import { Room, Client } from "colyseus";
import { ChatRoomState, Player } from "../states/chat.room.state";

export class ChatRoom extends Room<ChatRoomState> {
  onCreate(options: any) {
    this.state = new ChatRoomState();

    this.onMessage("move", (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.x += data.x;
        player.y += data.y;
      }
    });
  }

  onJoin(client: Client, options: any) {
    const player = new Player();
    player.name = options.name || "Unknown";
    this.state.players.set(client.sessionId, player);
  }

  onLeave(client: Client) {
    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log("Room disposed");
  }
}
