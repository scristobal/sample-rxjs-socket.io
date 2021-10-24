import { useEffect, useState } from 'react';
import { Observable, Observer } from 'rxjs';
import { fromSocketClient } from '../libs/rxjs-socket.io';

const useSocket = () => {
    const [status, setStatus] = useState<
        | {
              message$$: Observable<[eventName: string, ...args: unknown[]]>;
              pushMessage: Observer<[eventName: string, ...args: unknown[]]>;
          }
        | undefined
    >(undefined);

    useEffect(() => {
        if (!status) {
            const { message$$, pushMessage } = fromSocketClient('http://localhost:4000');
            setStatus({ message$$, pushMessage });
        }
    }, [status]);

    return status;
};

export { useSocket };
