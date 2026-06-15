/**
 * Retorna a data de desembarque prevista (sem componente de hora).
 * @param {string|Date} ultimoEmbarque
 * @param {number} diasEmbarcado
 * @returns {Date}
 */
export function calcularDataDesembarque(ultimoEmbarque, diasEmbarcado) {
  const data = new Date(ultimoEmbarque)
  data.setUTCHours(0, 0, 0, 0)
  data.setUTCDate(data.getUTCDate() + diasEmbarcado)
  return data
}

/**
 * Diferença em dias inteiros entre duas datas (ignorando hora).
 * Positivo = data1 é futura em relação a data2.
 */
export function diffEmDias(data1, data2) {
  const d1 = new Date(data1)
  const d2 = new Date(data2)
  d1.setUTCHours(0, 0, 0, 0)
  d2.setUTCHours(0, 0, 0, 0)
  return Math.round((d1 - d2) / 86_400_000)
}

/**
 * Calcula o status atual da pessoa.
 * @param {{ ultimoEmbarque: string|Date, diasEmbarcado: number }} pessoa
 * @param {Date} [hoje]
 * @returns {{ dataDesembarque: Date, diasRestantes: number, status: 'embarcado'|'desembarque-hoje'|'em-terra' }}
 */
export function calcularStatus(pessoa, hoje = new Date()) {
  const dataDesembarque = calcularDataDesembarque(pessoa.ultimoEmbarque, pessoa.diasEmbarcado)
  const diasRestantes = diffEmDias(dataDesembarque, hoje)

  let status
  if (diasRestantes > 0) status = 'embarcado'
  else if (diasRestantes === 0) status = 'desembarque-hoje'
  else status = 'em-terra'

  return { dataDesembarque, diasRestantes, status }
}

/**
 * Formata uma Date ou string ISO para dd/mm/aaaa.
 */
export function formatarData(data) {
  const d = new Date(data)
  return d.toLocaleDateString('pt-BR', { timeZone: 'UTC' })
}
