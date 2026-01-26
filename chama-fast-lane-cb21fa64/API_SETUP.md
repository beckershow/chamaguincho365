# Guia de Configuração da API

## ⚠️ Erro "Failed to fetch" - Problema de CORS

Se você está vendo o erro `TypeError: Failed to fetch`, isso significa que o frontend não conseguiu conectar à API. Aqui estão as soluções:

---

## 🔧 Solução 1: Configurar CORS no Backend

O servidor da API precisa permitir requisições do frontend. Adicione os seguintes headers no seu backend:

### Para Node.js/Express:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:8080',
    'http://localhost:5173',
    'http://127.0.0.1:8080',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));
```

### Para Fastify:

```javascript
await fastify.register(require('@fastify/cors'), {
  origin: [
    'http://localhost:8080',
    'http://localhost:5173',
  ],
  credentials: true,
});
```

### Para outros frameworks:

Adicione os seguintes headers nas respostas:

```
Access-Control-Allow-Origin: http://localhost:8080
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, Accept
Access-Control-Allow-Credentials: true
```

---

## 🌐 Solução 2: Verificar se a API está Rodando

1. **Verifique se a API está online:**
   ```bash
   curl https://api.chama365guinchos.com.br/api/users/login
   ```

2. **Teste o endpoint de registro:**
   ```bash
   curl -X POST https://api.chama365guinchos.com.br/api/users/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@test.com",
       "password": "123456",
       "phone_number": "+5547999999999",
       "display_name": "Teste",
       "cpf_cnpj": "12345678909"
     }'
   ```

3. **Verifique se a URL está correta:**
   - URL configurada: `https://api.chama365guinchos.com.br`
   - Endpoint: `/api/users/register`
   - URL completa: `https://api.chama365guinchos.com.br/api/users/register`

---

## 🔍 Solução 3: Verificar Logs no Console

1. Abra o **DevTools** do navegador (F12)
2. Vá na aba **Console**
3. Procure por mensagens de erro detalhadas
4. Verifique a aba **Network** para ver se a requisição foi feita

---

## 🛠️ Solução 4: Usar Modo de Desenvolvimento (Mock)

Se a API ainda não está disponível, você pode usar o modo de desenvolvimento:

1. Abra o arquivo: `src/config/api.config.ts`
2. Altere a configuração:

```typescript
export const API_MODE: 'development' | 'production' = 'development';
```

3. Isso vai usar dados mock enquanto a API não estiver disponível

---

## 📝 Checklist de Troubleshooting

- [ ] A API está rodando?
- [ ] O CORS está configurado no backend?
- [ ] A URL da API está correta?
- [ ] O firewall/antivírus está bloqueando?
- [ ] O certificado SSL está válido (se HTTPS)?
- [ ] Os headers estão corretos?

---

## 🧪 Testar a Configuração

Após configurar, teste o cadastro:

1. Acesse: http://localhost:8080/cadastro
2. Preencha o formulário
3. Clique em "Criar conta"
4. Verifique o console do navegador (F12)
5. Procure por mensagens de sucesso ou erro

---

## 📞 Endpoints Disponíveis

### POST /api/users/register
Cadastro de novo usuário

**Body:**
```json
{
  "email": "user@email.com",
  "password": "123456",
  "phone_number": "+5547999999999",
  "display_name": "Anderson",
  "cpf_cnpj": "123.456.789-09"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "user": { ... },
  "accessToken": "...",
  "refreshToken": "...",
  "token": "..."
}
```

### POST /api/users/login
Login de usuário

**Body:**
```json
{
  "email": "user@email.com",
  "password": "123456"
}
```

**Resposta:** (mesma estrutura do register)

---

## 🔐 Autenticação com Bearer Token

Após login/cadastro, o frontend automaticamente:
- Armazena os tokens no localStorage
- Adiciona `Authorization: Bearer {token}` em requisições autenticadas
- Renova a sessão quando necessário

---

## 🚀 Próximos Passos

1. Configure o CORS no backend
2. Verifique se a API está acessível
3. Teste o cadastro no frontend
4. Verifique os logs no console
5. Se tudo funcionar, altere para modo production

---

## ❓ Dúvidas Comuns

**Q: Por que "Failed to fetch"?**
A: Geralmente é problema de CORS ou a API não está acessível.

**Q: Como sei se o CORS está configurado?**
A: Verifique os headers da resposta no DevTools → Network → Headers

**Q: A API funciona no Postman mas não no navegador?**
A: É CORS! O navegador bloqueia requisições cross-origin por segurança.

**Q: Como desabilitar CORS no desenvolvimento?**
A: NÃO é recomendado. Configure o CORS corretamente no backend.
