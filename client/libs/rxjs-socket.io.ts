import { Observable, Observer, share } from 'rxjs';
import { io as ioClient, ManagerOptions, SocketOptions } from 'socket.io-client';

type JSONObject = { [key: string]: JSON };
type JSONArray = Array<JSON>;
type JSON = null | string | number | boolean | JSONArray | JSONObject;

type FromSocketClient = (
    uri: string | Partial<ManagerOptions & SocketOptions>,
    opts?: Partial<ManagerOptions & SocketOptions>
) => {
    message$$: (eventName: string) => Observable<unknown>;
    pushEvent: (eventName: string) => Observer<unknown>;
};

function fromSocketClient(opts?: Partial<ManagerOptions & SocketOptions>): ReturnType<FromSocketClient>;
function fromSocketClient(uri: string, opts?: Partial<ManagerOptions & SocketOptions>): ReturnType<FromSocketClient>;
function fromSocketClient(
    uri?: string | Partial<ManagerOptions & SocketOptions>,
    opts?: Partial<ManagerOptions & SocketOptions>
) {
    const client = uri ? (opts ? ioClient(uri, opts) : ioClient(uri)) : ioClient(opts);

    client.connect();

    const message$$ = (eventName: string): Observable<unknown> =>
        new Observable<unknown>((subscriber) => {
            client.on(eventName, (msg: unknown) => {
                subscriber.next(msg);
            });

            client.on('connect_error', (error) => subscriber.error(error));
            client.on('disconnect', () => {
                subscriber.complete();
            });
        }).pipe(share());

    const pushEvent = (eventName: string): Observer<unknown> => {
        return {
            next: (args) => {
                client.emit(eventName, args);
            },
            error: () => {
                client.disconnect();
                console.error();
            },
            complete: () => {
                client.disconnect();
            },
        };
    };

    return { message$$, pushEvent };
}

export { fromSocketClient };
