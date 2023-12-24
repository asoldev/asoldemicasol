import { ExecutionContext } from '@nestjs/common';
import { Dictionary } from 'code-config';

interface Client {
  headers: Dictionary<string>;
  user: {
    _id: string;
    username: string;
  };
}

export const getClient = <T = Client>(ctx: ExecutionContext): T => {
  switch (ctx.getType()) {
    case 'ws':
      return ctx.switchToWs().getClient().handshake;
    case 'http':
      return ctx.switchToHttp().getRequest();
    default:
      return undefined;
  }
};
