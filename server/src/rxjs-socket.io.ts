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
    message$$: Observable<unknown[]>;
    pushMessage: Observer<[eventName: string, ...args: unknown[]]>;
    pushEvent: (eventName: string) => Observer<unknown[]>;
};

function fromSocketServer(opts?: Partial<ServerOptions>): ReturnType<FromSocket>;
function fromSocketServer(srv?: http.Server | number, opts?: Partial<ServerOptions>): ReturnType<FromSocket>;
function fromSocketServer(
    srv: undefined | Partial<ServerOptions> | http.Server | number,
    opts?: Partial<ServerOptions>
) {
    const server = srv ? new Server(srv, opts) : new Server(opts);

    const message$ = new Observable<[string, unknown[]]>((subscriber) => {
        try {
            server.on('connection', (socket) =>
                socket.onAny((eventName: string, ...args) => subscriber.next([eventName, args]))
            );
            server.on('disconnect', () => subscriber.complete());
        } catch (error) {
            subscriber.error(error);
        }

        server.engine.on('connection_error', (error: Error) => {
            subscriber.error(error.message);
        });
    });

    const message$$ = message$.pipe(share());

    const pushMessage: Observer<[eventName: string, ...args: unknown[]]> = {
        next: ([eventName, ...args]) => {
            server.emit(eventName, ...args);
        },
        complete: () => server.close(),
        error: (error) => console.error(error)
    };

    const pushEvent = (eventName: string): Observer<unknown[]> => {
        return {
            next: ([...args]) => {
                server.emit(eventName, ...args);
            },
            complete: () => server.close(),
            error: (error) => console.error(error)
        };
    };

    return { message$$, pushMessage, pushEvent };
}

export { fromSocketServer };
