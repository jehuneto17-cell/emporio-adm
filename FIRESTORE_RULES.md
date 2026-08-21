# Regras de Segurança do Firestore — Empório Coisas de Minas

## Como aplicar

1. Acesse [console.firebase.google.com](https://console.firebase.google.com/)
2. Selecione o projeto **emporio-coisas-de-minas**
3. Menu lateral: **Firestore Database → Regras**
4. Cole o bloco abaixo (ou edite só a linha necessária)
5. Clique em **Publicar**

> Este arquivo reflete as regras **realmente publicadas** no Firebase Console (verificado em 2026-08-21). Não é um rascunho — é a fonte da verdade sincronizada manualmente sempre que as regras mudam no Console.

---

## Regras publicadas

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuth() {
      return request.auth != null;
    }
    function isOwner(uid) {
      return isAuth() && request.auth.uid == uid;
    }
    function isAdmin() {
      return isAuth() && request.auth.token.email == 'emporiominas00@gmail.com';
    }
    function hasFields(fields) {
      return request.resource.data.keys().hasAll(fields);
    }

    // Lista de status que um CLIENTE (não-admin) tem permissão de gravar.
    // 'Pago' e 'Confirmado' NÃO estão aqui de propósito: só o admin confirma.
    function statusPermitidoCliente() {
      return request.resource.data.status in [
        'Pendente',
        'Aguardando pagamento',
        'Aguardando confirmação',
        'Cancelado'
      ];
    }

    match /banners/{id} {
      allow read: if true;
      allow write: if isAdmin();
    }
    match /produtos/{productId} {
      allow read: if true;
      allow create: if isAdmin() && hasFields(['name', 'price', 'category']);
      allow update, delete: if isAdmin();
      match /reviews/{uid} {
        allow read: if true;
        allow create, update: if isOwner(uid);
        allow delete: if isOwner(uid) || isAdmin();
      }
    }
    match /categorias/{id} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Leitura liberada para qualquer autenticado — o app do cliente precisa
    // ler a chave PIX + QR de configuracoes/pagamento. Escrita só admin.
    match /configuracoes/{id} {
      allow read: if isAuth();
      allow write: if isAdmin();
    }

    match /cupons/{id} {
      allow read: if isAuth();
      allow write: if isAdmin();
    }

    // ESPELHO ADMIN (raiz):
    // - admin: pode tudo, incluindo excluir permanentemente (usado pela aba
    //   Arquivados do painel — DB.deletePedido)
    // - cliente dono: só pode atualizar se o novo status estiver na lista
    //   permitida (impede o cliente de marcar o próprio pedido como 'Pago')
    match /pedidos/{pedidoId} {
      allow create: if isAuth();
      allow read: if isAuth() && (resource.data.uid == request.auth.uid || isAdmin());
      allow update: if isAdmin()
        || (isAuth() && resource.data.uid == request.auth.uid && statusPermitidoCliente());
      allow delete: if isAdmin();
    }

    match /clientes/{uid} {
      allow read: if isOwner(uid) || isAdmin();
      allow create, update: if isOwner(uid);
      allow delete: if false;
    }
    match /users/{uid} {
      allow read: if isOwner(uid) || isAdmin();
      allow write: if isOwner(uid);
      match /cart/{itemId} {
        allow read, write: if isOwner(uid);
      }
      match /favorites/{itemId} {
        allow read, write: if isOwner(uid);
      }

      // PEDIDO DO CLIENTE (subcoleção lida pelo app mobile):
      // - admin: pode tudo (confirmar pagamento, mudar pra 'Pago', etc.)
      // - cliente dono: só pode atualizar se o novo status estiver na lista
      //   permitida (pode anexar comprovante e ir pra 'Aguardando
      //   confirmação', mas nunca 'Pago')
      match /orders/{orderId} {
        allow read: if isOwner(uid) || isAdmin();
        allow create: if isOwner(uid);
        allow update: if isAdmin()
          || (isOwner(uid) && statusPermitidoCliente());
        allow delete: if false;
      }

      match /addresses/{addressId} {
        allow read, write: if isOwner(uid);
      }
      match /settings/{settingId} {
        allow read, write: if isOwner(uid);
      }
      match /notifications/{notifId} {
        allow read, write: if isOwner(uid);
      }
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## Mapa de permissões — coleções principais

| Coleção | Admin | Dono/autenticado | Público |
|---------|-------|-------------------|---------|
| `produtos` | ✅ tudo | leitura | ✅ leitura |
| `categorias` | ✅ tudo | — | ✅ leitura |
| `banners` | ✅ tudo | — | ✅ leitura |
| `configuracoes` | ✅ tudo | leitura | ❌ |
| `cupons` | ✅ tudo | leitura | ❌ |
| `pedidos` (espelho admin) | ✅ tudo, inclusive excluir | criar; ler e atualizar (status limitado) o próprio | ❌ |
| `clientes/{uid}` | ✅ tudo | ler/criar/atualizar o próprio; nunca excluir | ❌ |
| `users/{uid}/orders` | ✅ tudo | criar; ler e atualizar (status limitado) o próprio; nunca excluir | ❌ |

**Importante:** `pedidos` (espelho, usado pelo painel admin) permite `delete` para o admin — usado pelo botão "Excluir" na aba Arquivados de `pedidos-app.jsx`. `users/{uid}/orders` (subcoleção do app mobile) **bloqueia delete para todos**, inclusive admin — essa assimetria é intencional: o painel exclui o registro-espelho, não o histórico do cliente no app.

---

## Por que o admin recebia permission-denied (histórico)

A versão antiga exigia `email_verified == true`, mas contas com senha não são verificadas automaticamente — isso causava `permission-denied` mesmo para o e-mail correto do admin. Removido: o e-mail sozinho já identifica o admin (`isAdmin()` acima).

---

## Verificação após publicar

Cole no console do browser com o admin logado:

```js
// Deve retornar array (mesmo que vazio)
DB.getProdutos().then(d => console.log('✅ produtos:', d.length)).catch(e => console.error('❌', e.code))

// Deve retornar array de categorias
DB.getCategorias().then(d => console.log('✅ categorias:', d.length)).catch(e => console.error('❌', e.code))

// Deve retornar array de pedidos
DB.getPedidos().then(d => console.log('✅ pedidos:', d.length)).catch(e => console.error('❌', e.code))
```

Se retornar sem erros de `permission-denied`, as regras estão corretas.

---

## Primeiro uso — popular o banco

```js
// Execute UMA VEZ no console do browser (admin logado)
DB.seedDadosIniciais()
// → Cria 8 produtos, 8 categorias e 3 cupons de exemplo nas coleções em português
```
