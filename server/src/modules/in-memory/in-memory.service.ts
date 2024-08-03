import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis, RedisOptions } from 'ioredis';
import { threadId } from 'node:worker_threads';
import { EnvironmentVariables } from '../../common/env/environment-variables';

@Injectable()
export class InMemoryService implements OnModuleInit {
  private subClient: Redis;
  private pubClient: Redis;
  private logger = new Logger('In-memory');

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  private createClient(name?: string): Redis {
    return new Redis({ ...this.getConfig(), lazyConnect: true })
      .on('connect', () => {
        this.logger.verbose(`Redis ${name} connect`);
      })
      .on('ready', () => {
        this.logger.verbose(`Redis ${name} ready`);
      })
      .on('error', (e) => {
        this.logger.error(`Redis ${name} err`, e);
      })
      .on('close', () => {
        this.logger.verbose(`Redis ${name} close`);
      })
      .on('reconnecting', () => {
        this.logger.verbose(`Redis ${name} reconnecting`);
      })
      .on('end', () => {
        this.logger.verbose(`Redis ${name} end`);
      });
  }

  getConfig(): RedisOptions {
    return {
      host: this.configService.get('REDIS_HOST'),
      port: this.configService.get('REDIS_PORT'),
    };
  }

  async onModuleInit() {
    this.subClient = this.createClient('subscriber');
    this.pubClient = this.createClient('publisher');

    try {
      await Promise.all([this.subClient.connect(), this.pubClient.connect()]);
      this.logger.verbose(`Redis connected on thread ${threadId}`);
    } catch (error) {
      this.logger.error('Redis error', error);
      process.exit(1);
    }
  }
  publish(channelName: string, message: object): void {
    this.pubClient.publish(channelName, JSON.stringify(message));
  }

  subscribe(channelName: string, onEvent: (message: object) => void): void {
    // TODO: Convert this method to a promise
    this.subClient.subscribe(channelName, (err: Error) => {
      if (err) {
        console.error('Failed to subscribe: %s', err.message);
      }
    });

    this.subClient.on('message', (channel, message) => {
      onEvent(JSON.parse(message));
    });
  }

  // TODO: Close redis connections on module destroy
}
