import { describe, it, expect } from 'vitest'
import {
  calcularDataDesembarque,
  diffEmDias,
  calcularStatus,
  formatarData,
} from '../utils/embarque.js'

describe('calcularDataDesembarque', () => {
  it('soma diasEmbarcado à data de embarque', () => {
    const resultado = calcularDataDesembarque('2026-01-01', 14)
    expect(resultado.toISOString().startsWith('2026-01-15')).toBe(true)
  })

  it('funciona ao cruzar mudança de mês', () => {
    const resultado = calcularDataDesembarque('2026-01-20', 14)
    expect(resultado.toISOString().startsWith('2026-02-03')).toBe(true)
  })

  it('funciona ao cruzar mudança de ano', () => {
    const resultado = calcularDataDesembarque('2025-12-25', 14)
    expect(resultado.toISOString().startsWith('2026-01-08')).toBe(true)
  })
})

describe('diffEmDias', () => {
  it('retorna positivo quando data1 é futura', () => {
    expect(diffEmDias('2026-01-15', '2026-01-01')).toBe(14)
  })

  it('retorna zero quando datas são iguais', () => {
    expect(diffEmDias('2026-01-15', '2026-01-15')).toBe(0)
  })

  it('retorna negativo quando data1 é passada', () => {
    expect(diffEmDias('2026-01-01', '2026-01-15')).toBe(-14)
  })
})

describe('calcularStatus', () => {
  const pessoa = { ultimoEmbarque: '2026-01-01', diasEmbarcado: 14 }
  // dataDesembarque prevista: 2026-01-15

  it('retorna embarcado quando hoje é anterior ao desembarque', () => {
    const { status, diasRestantes } = calcularStatus(pessoa, new Date('2026-01-10'))
    expect(status).toBe('embarcado')
    expect(diasRestantes).toBe(5)
  })

  it('retorna desembarque-hoje quando hoje é o dia do desembarque', () => {
    const { status, diasRestantes } = calcularStatus(pessoa, new Date('2026-01-15'))
    expect(status).toBe('desembarque-hoje')
    expect(diasRestantes).toBe(0)
  })

  it('retorna em-terra quando hoje é posterior ao desembarque', () => {
    const { status, diasRestantes } = calcularStatus(pessoa, new Date('2026-01-20'))
    expect(status).toBe('em-terra')
    expect(diasRestantes).toBe(-5)
  })

  it('retorna a dataDesembarque correta', () => {
    const { dataDesembarque } = calcularStatus(pessoa, new Date('2026-01-10'))
    expect(dataDesembarque.toISOString().startsWith('2026-01-15')).toBe(true)
  })
})

describe('formatarData', () => {
  it('formata para dd/mm/aaaa', () => {
    expect(formatarData('2026-01-15')).toBe('15/01/2026')
  })

  it('formata corretamente para início do ano', () => {
    expect(formatarData('2026-01-01')).toBe('01/01/2026')
  })
})
