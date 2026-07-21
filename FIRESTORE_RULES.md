# Regras de Segurança do Firestore — Empório Coisas de Minas

## Como aplicar

1. Acesse [console.firebase.google.com](https://console.firebase.google.com/)
2. Selecione o projeto **emporio-coisas-de-minas**
3. Menu lateral: **Firestore Database → Regras**
4. Apague todo o conteúdo atual
5. Cole o bloco abaixo **exatamente como está**
6. Clique em **Publicar**

---

## ⚠️ Alerta de inconsistência de nomenclatura

O **painel admin** usa nomes de coleção em **português** (`produtos`, `pedidos`, `clientes`).
O **app mobile** planeja usar nomes em **inglês** (`products`, `orders`, `users`).

**Problema:** se o admin escreve em `produtos` e o app lê de `products`, são duas coleções separadas no Firestore — os dados não são compartilhados.

**Decisão necessária antes de lançar:**
- Opção A (recomendada): padronizar em português — o painel já está implementado com esses nomes. Basta o app mobile usar os mesmos nomes quando implementar Firestore.
- Opção B: padronizar em inglês — requer renomear as coleções do painel admin e atualizar todos os arquivos JSX.

As regras abaixo cobrem **ambos os conjuntos de nomes** para garantir que nenhum acesso fique bloqueado durante a transição.

---

## Regras consolidadas — copie e cole no Console

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ── Funções auxiliares ─────────────────────────────────────────────────

    // Admin identificado pelo e-mail.
    // NÃO usa email_verified — contas com senha não são verificadas automaticamente.
    function isAdmin() {
      return request.auth != null
          && request.auth.token.email == 'emporiominas00@gmail.com';
    }

    // Qualquer usuário autenticado
    function isUser() {
      return request.auth != null;
    }

    // O próprio usuário (pelo uid)
    function isOwner(uid) {
      return isUser() && request.auth.uid == uid;
    }

    // ══════════════════════════════════════════════════════════════════════
    // ADMIN — acesso total a TODAS as coleções e subcoleções
    // Esta regra cobre os dois idiomas sem precisar listar cada coleção.
    // ══════════════════════════════════════════════════════════════════════
    match /{document=**} {
      allow read, write: if isAdmin();
    }

    // ══════════════════════════════════════════════════════════════════════
    // PAINEL ADMIN — coleções em português
    // ══════════════════════════════════════════════════════════════════════

    // Catálogo de produtos — leitura pública (sem login)
    match /produtos/{id} {
      allow read: if true;
    }

    // Categorias — leitura pública
    match /categorias/{id} {
      allow read: if true;
    }

    // Configurações da loja (horários, endereço, redes) — leitura pública
    match /configuracoes/{id} {
      allow read: if true;
    }

    // Cupons — autenticado pode ler para validar no checkout
    match /cupons/{id} {
      allow read: if isUser();
    }

    // Pedidos — autenticado cria o próprio; lê apenas o próprio
    match /pedidos/{pedidoId} {
      allow create: if isUser() && request.resource.data.userId == request.auth.uid;
      allow read:   if isUser() && resource.data.userId == request.auth.uid;
    }

    // Clientes — cada usuário acessa só o próprio perfil (doc ID == uid)
    match /clientes/{userId} {
      allow read, write: if isOwner(userId);
    }

    // ══════════════════════════════════════════════════════════════════════
    // APP MOBILE — coleções em inglês (quando implementar Firestore)
    // ══════════════════════════════════════════════════════════════════════

    // Catálogo — leitura pública
    match /products/{id} {
      allow read: if true;
    }

    // Categorias — leitura pública
    match /categories/{id} {
      allow read: if true;
    }

    // Configurações — leitura pública
    match /settings/{id} {
      allow read: if true;
    }

    // Cupons — autenticado pode ler
    match /coupons/{id} {
      allow read: if isUser();
    }

    // Perfil do usuário + subcoleções (carrinho, favoritos, histórico)
    match /users/{uid} {
      allow read, write: if isOwner(uid);

      match /cart/{itemId} {
        allow read, write: if isOwner(uid);
      }

      match /favorites/{itemId} {
        allow read, write: if isOwner(uid);
      }

      match /orders/{orderId} {
        allow read:   if isOwner(uid);
        allow create: if isOwner(uid);
      }
    }

    // Pedidos como coleção global (alternativa ao subcampo de users)
    match /orders/{orderId} {
      allow create: if isUser() && request.resource.data.userId == request.auth.uid;
      allow read:   if isUser() && resource.data.userId == request.auth.uid;
    }
  }
}
```

---

## Mapa completo de permissões

### Coleções do painel admin (português)

| Coleção | Admin | Usuário autenticado | Público |
|---------|-------|---------------------|---------|
| `produtos` | ✅ tudo | leitura | ✅ leitura |
| `categorias` | ✅ tudo | leitura | ✅ leitura |
| `configuracoes` | ✅ tudo | leitura | ✅ leitura |
| `cupons` | ✅ tudo | ✅ leitura | ❌ |
| `pedidos` | ✅ tudo | criar e ler o próprio | ❌ |
| `clientes/{uid}` | ✅ tudo | ler/escrever o próprio | ❌ |

### Coleções do app mobile (inglês)

| Coleção | Admin | Usuário autenticado | Público |
|---------|-------|---------------------|---------|
| `products` | ✅ tudo | leitura | ✅ leitura |
| `categories` | ✅ tudo | leitura | ✅ leitura |
| `settings` | ✅ tudo | leitura | ✅ leitura |
| `coupons` | ✅ tudo | ✅ leitura | ❌ |
| `orders` (global) | ✅ tudo | criar e ler o próprio | ❌ |
| `users/{uid}` | ✅ tudo | ler/escrever o próprio | ❌ |
| `users/{uid}/cart` | ✅ tudo | ler/escrever o próprio | ❌ |
| `users/{uid}/favorites` | ✅ tudo | ler/escrever o próprio | ❌ |
| `users/{uid}/orders` | ✅ tudo | criar e ler o próprio | ❌ |

---

## Por que o admin recebia permission-denied?

A versão anterior exigia `email_verified == true`:

```js
// ❌ Causa permission-denied — contas com senha não são verificadas automaticamente
function isAdmin() {
  return request.auth != null
      && request.auth.token.email == 'emporiominas00@gmail.com'
      && request.auth.token.email_verified == true;  // ← PROBLEMA
}
```

A versão corrigida remove essa exigência — o e-mail é suficiente para identificar o admin.

---

## Verificação após publicar

Cole no console do browser com o admin logado:

```js
// Deve retornar array (mesmo que vazio)
DB.getProdutos().then(d => console.log('✅ produtos:', d.length)).catch(e => console.error('❌', e.code))

// Deve retornar array de categorias
DB.getCategorias().then(d => console.log('✅ categorias:', d.length)).catch(e => console.error('❌', e.code))

// Deve retornar objeto com vendas/pedidos/ticket
DB.getMetricasHoje().then(d => console.log('✅ métricas:', d)).catch(e => console.error('❌', e.code))
```

Se retornar sem erros de `permission-denied`, as regras estão corretas.

---

## Primeiro uso — popular o banco

```js
// Execute UMA VEZ no console do browser (admin logado)
DB.seedDadosIniciais()
// → Cria 8 produtos, 8 categorias e 3 cupons de exemplo nas coleções em português
```
