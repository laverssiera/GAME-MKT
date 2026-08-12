import { createMachine, createActor } from 'xstate';
import { Server } from 'socket.io';
import opentelemetry from '@opentelemetry/api';

console.log('🛸 Iniciando GAME MKT Runtime Environment...\n');

// 1. AI Sales Federation (Simulado via XState)
const salesFederationMachine = createMachine({
  id: 'aiSalesFederation',
  initial: 'idle',
  states: {
    idle: {
      on: { START_CAMPAIGN: 'prospecting' }
    },
    prospecting: {
      on: { LEAD_FOUND: 'engaging' }
    },
    engaging: {
      on: { SALE_CLOSED: 'closing' }
    },
    closing: {
      type: 'final'
    }
  }
});

// 2. Holographic Campaign Runtime (Simulado via Socket.io)
const io = new Server(3002, {
  cors: { origin: '*' }
});

io.on('connection', (socket) => {
  console.log(`[Holographic Campaign Runtime] Usuário conectado: ${socket.id}`);
  
  socket.on('start_holo_experience', () => {
    console.log(`[Holographic Campaign Runtime] Iniciando projeção holográfica para ${socket.id}...`);
    socket.emit('holo_event', { event: 'project_started', mesh: 'CampaignMesh_V1' });
  });
});

// 3. Autonomous Revenue Runtime
const salesService = createActor(salesFederationMachine);
salesService.subscribe((state) => {
  console.log(`[AI Sales Federation] Estado atual: ${state.value}`);
});

salesService.start();

console.log('✅ Autonomous Revenue Runtime ativado.');
console.log('✅ AI Sales Federation online.');
console.log('✅ Holographic Campaign Runtime escutando na porta 3002.\n');

// Simulação de eventos do Revenue Runtime
setTimeout(() => {
  console.log('-> Executando Automação de Receita...');
  salesService.send({ type: 'START_CAMPAIGN' });
}, 1000);

setTimeout(() => {
  salesService.send({ type: 'LEAD_FOUND' });
}, 2500);

setTimeout(() => {
  salesService.send({ type: 'SALE_CLOSED' });
  console.log('💰 Receita Autônoma Gerada. Operação concluída com sucesso!');
  process.exit(0);
}, 4000);
