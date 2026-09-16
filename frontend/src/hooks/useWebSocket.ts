import { useEffect, useRef } from "react";

export const useWebSocket = <TMessage>(
    url: string | null,
    onMessage: (message: TMessage) => void,
) => {
    const onMessageRef = useRef(onMessage);
    useEffect(() => {
        onMessageRef.current = onMessage;
    });

    useEffect(() => {
        if (!url) return;

        const ws = new WebSocket(url);

        ws.onmessage = (event) => {
            onMessageRef.current(JSON.parse(event.data) as TMessage);
        };

        return () => ws.close();
    }, [url]);
};
