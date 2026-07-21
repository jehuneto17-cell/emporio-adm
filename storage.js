// Cloudinary — upload de fotos de produto direto do browser (sem servidor)
// Plano gratuito: 25 GB de armazenamento, transformações ilimitadas.
//
// ── CONFIGURAÇÃO ──────────────────────────────────────────────────────────────
// CLOUD_NAME:    Dashboard em cloudinary.com → Cloud Name
// UPLOAD_PRESET: Settings → Upload → Upload Presets (modo Unsigned)

var CLOUD_NAME    = 'dv62fwdtv';
var UPLOAD_PRESET = 'emporio-produtos';

// ─────────────────────────────────────────────────────────────────────────────

(function () {
  var UPLOAD_URL = 'https://api.cloudinary.com/v1_1/' + CLOUD_NAME + '/image/upload';

  // Faz upload de um File para o Cloudinary.
  //   productId  — ID do produto (usado como subpasta)
  //   slot       — número da foto (1, 2, 3…) → public_id = foto-{slot}
  //   onProgress — callback(0-100) chamado durante o envio (opcional)
  // Retorna Promise<secure_url>.
  function uploadProductImage(file, productId, slot, onProgress) {
    return new Promise(function (resolve, reject) {
      var formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('folder', 'emporio-minas/produtos/' + productId);
      formData.append('public_id', 'foto-' + slot);

      var xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', function (e) {
        if (e.lengthComputable && typeof onProgress === 'function') {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      xhr.addEventListener('load', function () {
        if (xhr.status === 200) {
          try {
            var data = JSON.parse(xhr.responseText);
            resolve(data.secure_url);
          } catch (_) {
            reject(new Error('Resposta inválida do Cloudinary'));
          }
        } else {
          reject(new Error('Upload falhou — HTTP ' + xhr.status));
        }
      });

      xhr.addEventListener('error', function () {
        reject(new Error('Erro de rede ao enviar foto'));
      });

      xhr.open('POST', UPLOAD_URL);
      xhr.send(formData);
    });
  }

  // Cloudinary não permite deletar pelo browser sem expor a API Secret.
  // A remoção lógica é feita zerando o array images[] no Firestore.
  // Arquivos órfãos podem ser removidos manualmente via Media Library.
  function deleteProductImage() {
    return Promise.resolve();
  }

  window.STORAGE = {
    uploadProductImage: uploadProductImage,
    deleteProductImage: deleteProductImage,
  };
})();
