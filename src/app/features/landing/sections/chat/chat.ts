import { Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe } from '@angular/common';

interface Message {
  text: string;
  isUser: boolean;
  time: Date;
  paymentUrl?: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule, DatePipe],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class ChatComponent {
  private http = inject(HttpClient);

  // n8n Webhook URL - User can modify this
  private n8nWebhookUrl = 'http://localhost:5678/webhook/chat-v2';

  // Generate a consistent session ID for the lifetime of this component
  private sessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);

  // Component states using signals
  isOpen = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  userInput = signal<string>('');

  messages = signal<Message[]>([
    {
      text: '¡Hola! Soy Bernardo, tu asistente virtual. ¿En qué puedo ayudarte hoy?',
      isUser: false,
      time: new Date()
    }
  ]);

  @ViewChild('chatScrollContainer') private chatScrollContainer!: ElementRef;

  toggleChat(): void {
    this.isOpen.update(val => !val);
    if (this.isOpen()) {
      this.scrollToBottom();
    }
  }

  sendMessage(): void {
    const text = this.userInput().trim();
    if (!text || this.isLoading()) return;

    // Add user message to UI
    this.messages.update(msgs => [...msgs, {
      text,
      isUser: true,
      time: new Date()
    }]);

    this.userInput.set('');
    this.isLoading.set(true);
    this.scrollToBottom();

    // Call n8n Webhook API
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Send payload. We send 'message' and 'chatInput' to be compatible with different n8n structures.
    const payload = {
      message: text,
      chatInput: text,
      sessionId: this.sessionId
    };

    this.http.post<any>(this.n8nWebhookUrl, payload, { headers }).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        let botResponse = 'Lo siento, no pude procesar tu solicitud.';

        // Parse response flexibly depending on n8n workflow output structure
        if (response) {
          if (typeof response === 'string') {
            botResponse = response;
          } else if (response.output) {
            botResponse = response.output;
          } else if (response.response) {
            botResponse = response.response;
          } else if (response.text) {
            botResponse = response.text;
          } else if (response.message) {
            botResponse = response.message;
          } else if (Array.isArray(response) && response.length > 0) {
            const first = response[0];
            botResponse = typeof first === 'string' ? first : (first.output || first.response || first.text || JSON.stringify(first));
          } else {
            botResponse = JSON.stringify(response);
          }
        }

        let paymentUrl: string | undefined;
        const paymentMatch = botResponse.match(/\[PAYMENT_URL:(.+?)\]/);
        if (paymentMatch) {
            paymentUrl = paymentMatch[1];
            botResponse = botResponse.replace(paymentMatch[0], '').trim();
        }

        this.messages.update(msgs => [...msgs, {
          text: botResponse,
          isUser: false,
          time: new Date(),
          paymentUrl
        }]);

        this.scrollToBottom();
      },
      error: (error) => {
        console.error('Error connecting to n8n webhook:', error);
        this.isLoading.set(false);

        // Premium fallback/mock responses in case n8n is offline or not yet configured
        let mockResponse = '¡Gracias por escribir! Como asistente en desarrollo, me conectaré con n8n muy pronto. ¿Deseas saber más sobre las matrículas o el calendario escolar?';

        // Simulating matching responses for high-quality mock experience if endpoint is default/local
        const lowerText = text.toLowerCase();
        if (lowerText.includes('hola') || lowerText.includes('buenos')) {
          mockResponse = '¡Hola! Qué gusto saludarte. ¿Cómo te puedo ayudar hoy con respecto al Colegio Bernardo O\'Higgins?';
        } else if (lowerText.includes('matricula') || lowerText.includes('matrícula') || lowerText.includes('postular')) {
          mockResponse = 'El proceso de Admisión 2026 está abierto para todos los niveles desde Kinder a 4° Medio. Puedes completar el formulario de postulación en la sección "Postula Ahora" de esta misma página.';
        } else if (lowerText.includes('utiles') || lowerText.includes('útiles')) {
          mockResponse = 'Las listas de útiles para el año escolar están disponibles en formato PDF en la sección "Preparación para el Año Escolar" de esta página. ¡Ahí podrás descargarlas directamente!';
        } else if (lowerText.includes('contacto') || lowerText.includes('teléfono') || lowerText.includes('correo')) {
          mockResponse = 'Puedes encontrarnos en el formulario de contacto al final de la página o escribir a admision@colegiobernardoohiggins.cl.';
        }

        this.messages.update(msgs => [...msgs, {
          text: mockResponse,
          isUser: false,
          time: new Date()
        }]);

        this.scrollToBottom();
      }
    });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      try {
        if (this.chatScrollContainer) {
          const element = this.chatScrollContainer.nativeElement;
          element.scrollTop = element.scrollHeight;
        }
      } catch (err) {
        console.warn('Scroll to bottom failed:', err);
      }
    }, 50);
  }
}
