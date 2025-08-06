/* eslint-disable @typescript-eslint/no-unsafe-argument */

/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-base-to-string */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Room, Client } from "colyseus";
import { ChatRoomState, Player } from "../states/chat.room.state";
import { Logger } from "@nestjs/common";
import { Model } from "mongoose";
import { GameService } from "../colyseus.service";
import { Globals } from "src/utils/globals";
import { RoomManager } from "../colyseus.manager.room";

export class ChatRoom extends Room<ChatRoomState> {
  maxClients: number;
  private readonly logger = new Logger(ChatRoom.name);
  private colyseusService: GameService;
  onCreate(options: any) {
    RoomManager.register(this);
    this.state = new ChatRoomState();
    this.maxClients = 10;
    const gameSvc = Globals.nestApp.get(GameService);

    this.onMessage("chat-all", async (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        await gameSvc.saveMessage(this.roomId, player.name, data);
        this.broadcast(
          "chatAll",
          { name: player.name, message: data },
          { except: client },
        );
      }
    });

    this.onMessage("rename", (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.name = data;
      }
    });

    this.onMessage("broadcast-all", async (client, data) => {
      RoomManager.broadcastToAll("server_announcement", {
        // message: "🚨🚨 Server sắp bảo trì trong 5 năm!🚨🚨",
        message: data,
      });
      const player = this.state.players.get(client.sessionId);
      if (player) {
        await gameSvc.saveMessage(this.roomId, player.name, data);
      }
    });
    // client là người gửi, data thì gồm to và message
    this.onMessage("private_message", (client, data) => {
        const { to, message } = data;

        // Duyệt tất cả phòng đang hoạt động
        RoomManager.getRoom().forEach((room) => {
          // Tìm client có sessionId === to
          const recipient = room.clients.find(c => c.sessionId === to);
            if(to == client.sessionId){
              client.send("error", {
                message: "không thể gửi tin nhắn cho chính mình",
              })
              return;
            }
            if (recipient) {
              recipient.send("private_message", {
                from: client.sessionId,
                message,
              });
            }
        });
      });
        // this broadcast: gửi tin nhắn cho những người trong cùng room thôi 
    this.onMessage("broadcast_message", (client, data) => {
      const { message } = data;

      this.broadcast("broadcast_message", {
        from: client.sessionId,
        message,
      });
    });
    }
  // sao chỗ này có async?
  async onJoin(client: Client, options: any) {
    const player = new Player();
    player.name = options.name || "Unknown";
    this.logger.log(`${player.name} joined room ${this.roomId}`);
    this.state.players.set(client.sessionId, player);
   
    const gameSvc = Globals.nestApp.get(GameService);

    // Lấy 20 tin nhắn gần nhất, sắp theo thời gian tăng dần
    const history = await gameSvc.getHistoryMessage(this.roomId);

    // Gửi lịch sử chat riêng cho client này
    client.send(
      "chat_history",
      history.map((chat) => ({
        name: chat.name,
        message: chat.message,
      })),
    );
  }

  onLeave(client: Client) {
    this.logger.log(`${this.state.players.get(client.sessionId)} has leave!`);
    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    RoomManager.unregister(this);
    this.logger.log("Room disposed");
  }
}
