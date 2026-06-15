import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const metadata = require('./module.json')

export default {
  metadata,

  register(coreAPI) {
    metadata.permissions.forEach(perm =>
      coreAPI.registerPermission(perm, metadata.id)
    )

    coreAPI.onEvent('core:user:deleted', async ({ userId }) => {
      // Anonimizar dados criados pelo usuário removido
    })
  },

  async onInstall() {
    // Criar índices, dados iniciais
  },

  async onUninstall() {
    // NÃO deletar dados sem confirmação
    console.log('[dias-embarcado] Módulo desinstalado. Dados mantidos.')
  },

  async onEnable()  {},
  async onDisable() {},
}
