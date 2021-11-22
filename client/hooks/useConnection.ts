import { useEffect, useState } from 'react';
import { Observable, Observer } from 'rxjs';
import { fromSocketClient } from '../libs/rxjs-socket.io';

const useConnection = () => {
    const [status, setStatus] = useState<{
        message$$?: (eventName: string) => Observable<unknown>;
        pushEvent?: (eventName: string) => Observer<unknown>;
    }>({ message$$: undefined, pushEvent: undefined });

    useEffect(() => {
        if (!status.message$$ || !status.pushEvent) {
            const { message$$, pushEvent } = fromSocketClient('http://localhost:4000');
            setStatus({ message$$, pushEvent });
        }
    }, [status]);

    return status;
};

export { useConnection };
