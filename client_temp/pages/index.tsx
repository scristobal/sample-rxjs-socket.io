import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { ChangeEventHandler, MouseEventHandler, useEffect, useState } from 'react';
import { useSocket } from '../hooks/useSocket';
import styles from '../styles/Home.module.css';

const Home: NextPage = () => {
    const [messages, setMessages] = useState<string[]>([]);
    const [message, setMessage] = useState('');
    const [onClick, setOnClick] = useState<MouseEventHandler<HTMLButtonElement> | undefined>(undefined);

    const onChangeInput: ChangeEventHandler<HTMLInputElement> = (e) => setMessage(e.target.value);

    const connection = useSocket();

    useEffect(() => {
        if (connection) {
            const { message$$, pushMessage } = connection;

            const func: MouseEventHandler<HTMLButtonElement> = (e) => {
                e.preventDefault();
                pushMessage.next(['from client', message]);
                setMessage('');
            };
            setOnClick(() => func);

            message$$.subscribe((msg) => setMessages(messages.concat(JSON.stringify(msg))));
        }
    }, [connection, message, messages]);

    return (
        <div className={styles.container}>
            <Head>
                <title>Sample rxjs-socket.io app</title>
                <meta name='description' content='Generated by create next app' />
                <link rel='icon' href='/favicon.ico' />
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>Sample rxjs-socket.io app</h1>

                <p className={styles.description}>
                    A simple chat running on socket.io without socket.io (and using rxjs instead)
                </p>

                <form id='form' action=''>
                    <input id='input' type='text' autoComplete='off' onChange={onChangeInput} />
                    <button onClick={onClick} disabled={onClick === undefined}>
                        Send
                    </button>
                </form>

                <ul>
                    {messages.map((msg, index) => (
                        <li key={index}>{msg}</li>
                    ))}
                </ul>

                <div></div>
            </main>

            <footer className={styles.footer}>
                <a
                    href='https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app'
                    target='_blank'
                    rel='noopener noreferrer'>
                    Powered by{' '}
                    <span className={styles.logo}>
                        <Image src='/vercel.svg' alt='Vercel Logo' width={72} height={16} />
                    </span>
                </a>
            </footer>
        </div>
    );
};

export default Home;
