# 🔍 Debug da API - Resposta HTML ao invés de JSON

## ✅ Progresso até agora

- [x] CORS resolvido com proxy do Vite
- [x] Requisição está chegando na API
- [ ] API está retornando HTML ao invés de JSON

---

## 🐛 Erro Atual

```
SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

**O que isso significa?**
A API está retornando uma página HTML (como uma página de erro 404 ou 500) ao invés de JSON.

---

## 🔍 Debug Melhorado Implementado

Agora o código mostra **EXATAMENTE** o que a API está retornando!

### Abra o Console (F12) e veja:

```javascript
ℹ️ Tentando registrar usuário em: /api/users/register
ℹ️ Dados enviados: {...}
ℹ️ Status da resposta: 404  // ou 500, ou outro código
ℹ️ Content-Type: text/html   // <- HTML ao invés de application/json!
ℹ️ Resposta (primeiros 500 chars): <!DOCTYPE html>...  // <- A resposta completa!
```

---

## 📊 Possíveis Cenários

### Cenário 1: Erro 404 (Rota não existe)

**Resposta:**
```
Status: 404
Content-Type: text/html
Resposta: <!DOCTYPE html>...404 Not Found...
```

**Causa:**
- A rota `/api/users/register` não existe no backend
- O endpoint está em outra URL
- O backend não está configurado corretamente

**Solução:**
1. Verifique se a rota existe no backend
2. Verifique se o endpoint correto é `/api/users/register`
3. Teste com curl:
```bash
curl -X POST https://api.chama365guinchos.com.br/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456","phone_number":"+5547999999999","display_name":"Teste","cpf_cnpj":"12345678909"}'
```

---

### Cenário 2: Erro 500 (Erro no servidor)

**Resposta:**
```
Status: 500
Content-Type: text/html
Resposta: <!DOCTYPE html>...Internal Server Error...
```

**Causa:**
- Erro no código do backend
- Banco de dados não conectado
- Falta alguma dependência

**Solução:**
1. Verifique os logs do servidor backend
2. Verifique se o banco de dados está rodando
3. Verifique se todas as variáveis de ambiente estão configuradas

---

### Cenário 3: Erro 403/401 (Não autorizado)

**Resposta:**
```
Status: 403
Content-Type: text/html
Resposta: <!DOCTYPE html>...Forbidden...
```

**Causa:**
- Endpoint requer autenticação
- Configuração de segurança bloqueando

**Solução:**
1. Verifique se o endpoint deve ser público
2. Verifique firewall/WAF

---

### Cenário 4: Redirecionamento

**Resposta:**
```
Status: 301/302
Content-Type: text/html
Resposta: <!DOCTYPE html>...Moved...
```

**Causa:**
- Redirecionamento de HTTP para HTTPS
- Redirecionamento de URL

**Solução:**
1. Use HTTPS na URL
2. Siga o redirecionamento

---

## 🛠️ Como Debugar

### 1. Verifique o Console (F12 → Console)

Procure pelos logs:
```
ℹ️ Status da resposta: ???
ℹ️ Content-Type: ???
ℹ️ Resposta (primeiros 500 chars): ???
```

### 2. Verifique a Aba Network (F12 → Network)

1. Procure pela requisição `/api/users/register`
2. Clique nela
3. Veja as abas:
   - **Headers**: Veja status, URL completa
   - **Preview**: Veja o HTML que foi retornado
   - **Response**: Veja a resposta completa

### 3. Teste Direto com Curl

```bash
# Teste a API diretamente
curl -X POST https://api.chama365guinchos.com.br/api/users/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "123456",
    "phone_number": "+5547999999999",
    "display_name": "Teste",
    "cpf_cnpj": "12345678909"
  }' \
  -v
```

O `-v` mostra todos os detalhes da requisição e resposta.

### 4. Teste no Postman/Insomnia

Se você usa Postman ou Insomnia, teste lá para ver a resposta real da API.

---

## 📝 Checklist de Verificação

Execute esta checklist no **BACKEND**:

- [ ] A API está rodando?
- [ ] A rota `/api/users/register` existe?
- [ ] A rota aceita método POST?
- [ ] A rota retorna JSON (não HTML)?
- [ ] O banco de dados está conectado?
- [ ] Todas as variáveis de ambiente estão configuradas?
- [ ] Não há erros nos logs do servidor?

---

## 🎯 Próximos Passos

1. **Olhe o console agora** (F12) e veja o que está sendo retornado
2. **Copie a resposta completa** que aparece nos logs
3. **Verifique o status HTTP** (404, 500, etc)
4. **Compartilhe essas informações** com quem está desenvolvendo o backend

---

## 💡 Exemplo de Resposta Esperada

Quando funcionar, você verá algo assim no console:

```javascript
ℹ️ Status da resposta: 200
ℹ️ Content-Type: application/json
ℹ️ Resposta (primeiros 500 chars): {"success":true,"message":"Login realizado com sucesso","user":{...}}
✅ Cadastro bem-sucedido!
```

---

## 🔧 Teste Rápido

### Frontend está funcionando?
✅ SIM - O proxy está redirecionando corretamente!

### O problema é no backend?
⚠️ PROVÁVEL - A API está retornando HTML ao invés de JSON

### O que fazer?
1. Olhe o console e veja o status HTTP
2. Veja a resposta HTML completa
3. Compartilhe essas informações com o time de backend
4. Peça para verificarem se a rota existe e está retornando JSON

---

## 📞 Informações para o Backend

Se você for pedir ajuda para o time de backend, envie estas informações:

```
URL: https://api.chama365guinchos.com.br/api/users/register
Método: POST
Headers:
  - Content-Type: application/json
  - Accept: application/json

Body:
{
  "email": "user@email.com",
  "password": "123456",
  "phone_number": "+5547999999999",
  "display_name": "Anderson",
  "cpf_cnpj": "12345678909"
}

Status Recebido: [COPIE DO CONSOLE]
Content-Type: [COPIE DO CONSOLE]
Resposta: [COPIE DO CONSOLE]
```

---

## ✅ Quando Estiver Funcionando

Você verá isso no console:
```
ℹ️ Tentando registrar usuário em: /api/users/register
ℹ️ Status da resposta: 200
ℹ️ Content-Type: application/json
✅ Cadastro bem-sucedido!
```

E o cadastro funcionará automaticamente! 🎉

---

## 🎊 Resumo

1. ✅ Frontend está OK
2. ✅ Proxy está OK
3. ✅ CORS está OK
4. ⚠️ Backend está retornando HTML (precisa investigar)

**Próximo passo:** Ver os logs detalhados no console e passar para o backend!
