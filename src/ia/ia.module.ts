import { Module } from "@nestjs/common";
import { iaController } from "./application/http/ia.controller";
import { ChatAsistenteUseCase } from "./application/use-case/chat-asistente.use-case";
import { OllamaAdapter } from "./infrastructure/ollama/ollama.adapter";


@Module({
    controllers: [iaController],
    providers: [
        ChatAsistenteUseCase,
        {
            provide: 'IaProviderPort',
            useClass: OllamaAdapter,
        },
    ],
    exports: [ChatAsistenteUseCase],
})

export class iaModule{}