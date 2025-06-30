import { Controller, Get, Path, Route } from 'tsoa';

type HelloResponse = {
  message: string;
};

@Route('hello')
export class HelloController extends Controller {
  @Get('{name}')
  public async getHello(@Path() name: string): Promise<HelloResponse> {
    return {
      message: `Hello ${name}`,
    };
  }
}
