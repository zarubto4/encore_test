import { server } from './server';

describe('steno', () => {
  it('should log zero spaces into name', () => {
    const log = server.log;
    log('no.spaces').steno.steno.name.should.be('no.spaces');
  });

  it('should log space objects into data.message', () => {
    const log = server.log;
    log('space objects').steno.steno.data.message.should.be('space objects');
    log('space objects').steno.steno.name.should.be(undefined);
  });

  it('should accept data objects', () => {
    const log = server.log;
    log('data objects', { foo: 'bar' }).steno.steno.data.foo.should.be('bar');
  });
});
