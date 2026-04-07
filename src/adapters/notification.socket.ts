import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

class NotificationSocket {
  private client: Client | null = null;

  private getBaseUrl(): string {
    return import.meta.env.VITE_API_URL || "https://digitalbank-backend.onrender.com";
  }

  connect(userId: string, onMessage: (notification: any) => void) {
    const httpUrl = this.getBaseUrl();

    const socket = new SockJS(`${httpUrl}/ws-notifications`);
    this.client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
    });

    this.client.onConnect = () => {
      this.client!.subscribe(`/topic/notifications/${userId}`, (message) => {
        const data = JSON.parse(message.body);
        onMessage(data);
      });
    };

    this.client.onStompError = (frame) => {
      console.error("Erro WebSocket:", frame);
    };

    this.client.activate();
    return () => this.disconnect();
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
  }
}

export const notificationSocket = new NotificationSocket();