import { Observable, Observer, share } from 'rxjs';
import { io as ioClient, ManagerOptions, SocketOptions } from 'socket.io-client';

type JSONObject = { [key: string]: JSON };
type JSONArray = Array<JSON>;
type JSON = null | string | number | boolean | JSONArray | JSONObject;

type FromSocketClient = (
    uri: string | Partial<ManagerOptions & SocketOptions>,
    opts?: Partial<ManagerOptions & SocketOptions>
) => {
    message$$: Observable<[eventName: string, ...args: unknown[]]>;
    pushMessage: Observer<[eventName: string, ...args: unknown[]]>;
};

function fromSocketClient(opts?: Partial<ManagerOptions & SocketOptions>): ReturnType<FromSocketClient>;
function fromSocketClient(uri: string, opts?: Partial<ManagerOptions & SocketOptions>): ReturnType<FromSocketClient>;
function fromSocketClient(
    uri?: string | Partial<ManagerOptions & SocketOptions>,
    opts?: Partial<ManagerOptions & SocketOptions>
) {
    const client = uri ? (opts ? ioClient(uri, opts) : ioClient(uri)) : ioClient(opts);

    client.connect();

    const message$ = new Observable<[eventName: string, ...args: unknown[]]>((subscriber) => {
        client.onAny((eventName: string, ...args: unknown[]) => {
            subscriber.next([eventName, ...args]);
        });

        client.on('connect_error', (error) => subscriber.error(error));
        client.on('disconnect', () => {
            subscriber.complete();
        });
    });

    const pushMessage: Observer<[string, unknown[]]> = {
        next: ([eventName, ...args]) => {
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

    const message$$ = message$.pipe(share());

    return { message$$, pushMessage };
}

export { fromSocketClient };
