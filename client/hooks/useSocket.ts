import { useEffect, useState } from 'react';
import { Observable, Observer } from 'rxjs';
import { fromSocketClient } from '../libs/rxjs-socket.io';

const useSocket = () => {
    const [status, setStatus] = useState<
        | {
              message$$: Observable<[eventName: string, ...args: unknown[]]>;
              pushMessage: Observer<[eventName: string, ...args: unknown[]]>;
              pushEvent: (eventName: string) => Observer<unknown>;
          }
        | undefined
    >(undefined);

    useEffect(() => {
        if (!status) {
            const { message$$, pushMessage, pushEvent } = fromSocketClient('http://localhost:4000');
            setStatus({ message$$, pushMessage, pushEvent });
        }
    }, [status]);

    return status;
};

export { useSocket };
