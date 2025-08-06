/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger, OnApplicationShutdown } from "@nestjs/common";
import * as http from "http";

import { Server, Room } from "colyseus";
import { InjectModel } from "@nestjs/mongoose";
import { PlayerModel } from "src/shared/schemas/player.schema";
import { Model } from "mongoose";

type Type<T> = new (...args: any[]) => T;

@Injectable()
export class GameService implements OnApplicationShutdown {
  server: Server;
  private readonly logger = new Logger(GameService.name);

  constructor(
    @InjectModel(PlayerModel.name)
    private readonly playerModel: Model<PlayerModel>,
  ) {}

  createServer(httpServer: http.Server) {
    if (this.server) return;
    this.server = new Server({ server: httpServer });
    this.logger.log("Server is Started!");
  }

  defineRoom(name: string, room: Type<Room<any, any>>) {
    this.server.define(name, room);
    this.logger.log(`Room ${name} has created`);
  }

  listen(port: number): Promise<void> {
    if (!this.server) {
      throw new Error("Colyseus server is not initialized");
    }
    this.logger.log(`Server listen on ${port}`);
    return this.server.listen(port);
  }

  onApplicationShutdown(sig: any) {
    if (!this.server) return;
    this.logger.log(
      `Caught signal ${sig}. Game service shutting down on ${new Date().toLocaleDateString()}.`,
    );
    void this.server.gracefullyShutdown();
  }

  async saveMessage(roomId: any, name: string, msg: string) {
    await this.playerModel.create({ roomId: roomId, name: name, message: msg });
  }

  async getHistoryMessage(roomId: any) {
    const history = await this.playerModel
      .find({ roomId: roomId })
      .sort({ timestamp: 1 })
      .limit(20);
    return history;
  }
}
