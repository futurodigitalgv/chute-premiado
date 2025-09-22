# Painel Administrativo - Chute Certeiro

## Acesso ao Painel

Para acessar o painel administrativo, navegue para `/admin` no seu navegador.

### Credenciais de Login
- **Usuário:** `Davsam`
- **Senha:** `Davy1009+>`

## Funcionalidades

### 1. Login Administrativo
- Sistema de autenticação simples
- Redirecionamento automático após login
- Logout seguro

### 2. Dashboard Principal
- Visão geral de todos os jogos cadastrados
- Status dos jogos (Apostas Abertas, Apostas Encerradas, Finalizado)
- Ações rápidas para cada jogo

### 3. Gerenciamento de Jogos

#### Criar Novo Jogo
- Nome do time casa
- Nome do time visitante
- Upload de escudos dos times
- Data e horário da partida
- Horário de encerramento das apostas
- Valor da aposta

#### Editar Jogo
- Modificar informações do jogo
- Atualizar dados antes do início das apostas

#### Excluir Jogo
- Remover jogo do sistema
- Confirmação obrigatória

### 4. Estatísticas do Jogo
- Total de apostas realizadas
- Valor total arrecadado
- Valor da casa (10%)
- Valor do prêmio disponível

### 5. Finalização de Jogos

#### Inserir Placar Final
- Definir placar final da partida
- Sistema calcula automaticamente os ganhadores

#### Lista de Ganhadores
- Nome completo
- Telefone de contato
- Chave PIX para pagamento
- Palpite realizado
- Valor do prêmio por ganhador

#### Finalizar Jogo
- Confirmação final
- Jogo marcado como finalizado
- Não permite mais apostas

## Regras de Negócio

### Horário de Encerramento
- Apostas são automaticamente encerradas no horário definido
- Não é possível apostar após o encerramento
- Sistema verifica automaticamente o status

### Taxa da Casa
- Taxa fixa de 10% sobre o valor total arrecadado
- Valor restante é distribuído entre os ganhadores

### Ganhadores
- Apenas apostadores que acertaram o placar exato ganham
- Prêmio é dividido igualmente entre todos os ganhadores
- Se não houver ganhadores, o valor fica com a casa

## Estrutura de Arquivos

```
src/app/features/admin/
├── login/
│   ├── admin-login.ts
│   ├── admin-login.html
│   └── admin-login.scss
├── dashboard/
│   ├── admin-dashboard.ts
│   ├── admin-dashboard.html
│   └── admin-dashboard.scss
├── game-form/
│   ├── game-form.ts
│   ├── game-form.html
│   └── game-form.scss
├── stats-modal/
│   ├── stats-modal.ts
│   ├── stats-modal.html
│   └── stats-modal.scss
└── score-modal/
    ├── score-modal.ts
    ├── score-modal.html
    └── score-modal.scss
```

## Serviços

### GameService
- Gerencia todos os dados dos jogos
- Armazena informações no localStorage
- Calcula estatísticas e ganhadores
- Controla estados dos jogos

## Tecnologias Utilizadas

- Angular 20
- TypeScript
- SCSS
- Bootstrap Icons
- Reactive Forms
- RxJS

## Como Executar

1. Instale as dependências:
```bash
npm install
```

2. Execute o projeto:
```bash
npm start
```

3. Acesse o painel administrativo:
```
http://localhost:4200/admin
```

## Segurança

⚠️ **IMPORTANTE**: Este é um sistema de demonstração. Em produção, implemente:
- Autenticação robusta com JWT
- Validação de dados no backend
- Criptografia de senhas
- Logs de auditoria
- Controle de acesso baseado em roles
