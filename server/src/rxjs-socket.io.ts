import { Observable, Observer, share } from 'rxjs';
import { Server, ServerOptions } from 'socket.io';

import http from 'http';

type JSONObject = { [key: string]: JSON };
type JSONArray = Array<JSON>;
type JSON = null | string | number | boolean | JSONArray | JSONObject;

type FromSocket = (
    srv: undefined | Partial<ServerOptions> | http.Server | number,
    opts?: Partial<ServerOptions>
) => {
    message$$: (eventName: string) => Observable<unknown>;
    pushEvent: (eventName: string) => Observer<unknown>;
};

function fromSocketServer(opts?: Partial<ServerOptions>): ReturnType<FromSocket>;
function fromSocketServer(srv?: http.Server | number, opts?: Partial<ServerOptions>): ReturnType<FromSocket>;
function fromSocketServer(
    srv: undefined | Partial<ServerOptions> | http.Server | number,
    opts?: Partial<ServerOptions>
) {
    const server = srv ? new Server(srv, opts) : new Server(opts);

    const message$$ = (eventName: string) =>
        new Observable<unknown>((subscriber) => {
            try {
                server.on('connection', (socket) => socket.on(eventName, (msg) => subscriber.next(msg)));
                server.on('disconnect', () => subscriber.complete());
            } catch (error) {
                subscriber.error(error);
            }

            server.engine.on('connection_error', (error: Error) => {
                subscriber.error(error.message);
            });
        }).pipe(share());

    const pushEvent = (eventName: string): Observer<unknown> => {
        return {
            next: (args) => {
                server.emit(eventName, args);
            },
            complete: () => server.close(),
            error: (error) => console.error(error)
        };
    };

    return { message$$, pushEvent };
}

export { fromSocketServer };
