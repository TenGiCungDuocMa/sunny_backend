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
    // client là người gửi, data thì gồm to và message
    this.onMessage("private_message", (client, data) => {
      const { to, message } = data;
      const recipient = this.clients.find((c) => c.sessionId === to);
      if(to == client.sessionId){
        client.send("error", {
          message: "không thể gửi tin nhắn cho chính mình",
        })
        return;
      } 
       if (recipient){
        // hàm send: gửi tin nhắn cho recipient 
        recipient.send("private_message", {
          from: client.sessionId,
          message,
        });
      }else{
        client.send("error", {
          message: `không tìm thấy người nhận với sessionId = ${to}`,
        });
      }
    });
  }


  onJoin(client: Client, options: any) {
    const player = new Player();
    player.name = options.name || "Unknown";
    this.state.players.set(client.sessionId, player);
     // this broadcast: gửi tin nhắn cho những người trong cùng room thôi 
    this.onMessage("broadcast_message", (client, data) => {
      const { message } = data;

      this.broadcast("broadcast_message", {
        from: client.sessionId,
        message,
      });
    });
  }

  onLeave(client: Client) {
    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log("Room disposed");
  }
}
