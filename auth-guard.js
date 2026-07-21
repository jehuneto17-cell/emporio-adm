(function () {
  var ADMIN_EMAIL = 'emporiominas00@gmail.com';

  // Oculta a página imediatamente para evitar flash de conteúdo
  document.documentElement.style.visibility = 'hidden';

  firebase.auth().onAuthStateChanged(function (user) {
    if (!user) {
      window.location.replace('login.html');
    } else if (user.email !== ADMIN_EMAIL) {
      window.location.replace('login.html?erro=acesso-negado');
    } else {
      // Admin autenticado — exibe a página
      document.documentElement.style.visibility = '';
    }
  });

  // checkAuth() → retorna o usuário atual (ou null)
  window.checkAuth = function () {
    return firebase.auth().currentUser;
  };

  // logout() → faz signOut e redireciona para login
  window.logout = function () {
    firebase.auth().signOut().then(function () {
      window.location.replace('login.html');
    });
  };
})();
