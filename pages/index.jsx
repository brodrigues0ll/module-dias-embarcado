'use client'

import { useState, useEffect, useMemo } from 'react'
import { calcularStatus, formatarData } from '../utils/embarque.js'

// ─── helpers ────────────────────────────────────────────────────────────────

const BASE = '/api/dias-embarcado/items'

function toISO(dateStr) {
  // input: yyyy-mm-dd (vindo do <input type="date">)
  return dateStr
}

function statusLabel(status) {
  if (status === 'embarcado')       return 'Embarcado'
  if (status === 'desembarque-hoje') return 'Desembarque Hoje'
  return 'Em Terra'
}

function statusClasses(status) {
  if (status === 'embarcado')        return 'bg-blue-100  text-blue-700  border-blue-200'
  if (status === 'desembarque-hoje') return 'bg-red-100   text-red-700   border-red-200'
  return                                    'bg-green-100 text-green-700 border-green-200'
}

function badgeDot(status) {
  if (status === 'embarcado')        return 'bg-blue-500'
  if (status === 'desembarque-hoje') return 'bg-red-500'
  return                                    'bg-green-500'
}

function diasLabel(diasRestantes, status) {
  if (status === 'desembarque-hoje') return 'Hoje'
  if (status === 'em-terra')         return `${Math.abs(diasRestantes)}d atrás`
  return `${diasRestantes}d`
}

// ─── componentes menores ─────────────────────────────────────────────────────

function StatCard({ label, value, color }) {
  return (
    <div className={`rounded-2xl border p-4 flex flex-col gap-1 ${color}`}>
      <span className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</span>
      <span className="text-3xl font-bold">{value}</span>
    </div>
  )
}

function Modal({ pessoa, onClose, onSave }) {
  const [form, setForm] = useState({
    nome:           pessoa?.nome           ?? '',
    diasEmbarcado:  pessoa?.diasEmbarcado  ?? '',
    ultimoEmbarque: pessoa?.ultimoEmbarque
      ? new Date(pessoa.ultimoEmbarque).toISOString().slice(0, 10)
      : '',
  })
  const [saving, setSaving] = useState(false)
  const [erro, setErro]     = useState('')

  function set(key, value) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    if (!form.nome.trim())       return setErro('Informe o nome.')
    if (!form.diasEmbarcado)     return setErro('Informe os dias embarcado.')
    if (!form.ultimoEmbarque)    return setErro('Informe o último embarque.')

    setSaving(true)
    try {
      await onSave({
        nome:           form.nome.trim(),
        diasEmbarcado:  Number(form.diasEmbarcado),
        ultimoEmbarque: toISO(form.ultimoEmbarque),
      })
    } catch (err) {
      setErro(err.message || 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-semibold text-slate-800">
            {pessoa ? 'Editar Pessoa' : 'Nova Pessoa'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {erro && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{erro}</p>
          )}

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Nome</span>
            <input
              type="text"
              value={form.nome}
              onChange={e => set('nome', e.target.value)}
              placeholder="Ex: João Silva"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Dias embarcado</span>
            <input
              type="number"
              min={1}
              value={form.diasEmbarcado}
              onChange={e => set('diasEmbarcado', e.target.value)}
              placeholder="Ex: 14"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Data do último embarque</span>
            <input
              type="date"
              value={form.ultimoEmbarque}
              onChange={e => set('ultimoEmbarque', e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-300 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? 'Salvando…' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ConfirmDialog({ nome, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Excluir pessoa</h2>
        <p className="text-sm text-slate-600">Tem certeza que deseja excluir <strong>{nome}</strong>? Esta ação não pode ser desfeita.</p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 rounded-lg border border-slate-300 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Cancelar
          </button>
          <button onClick={onConfirm} className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700">
            Excluir
          </button>
        </div>
      </div>
    </div>
  )
}

function PessoaCard({ pessoa, onEdit, onDelete }) {
  const { dataDesembarque, diasRestantes, status } = calcularStatus(pessoa)

  return (
    <div className={`rounded-2xl border-2 p-4 flex flex-col gap-3 transition-shadow hover:shadow-md ${statusClasses(status)}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`mt-1 h-2.5 w-2.5 rounded-full flex-shrink-0 ${badgeDot(status)}`} />
          <h3 className="font-semibold text-slate-800 text-base leading-tight">{pessoa.nome}</h3>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusClasses(status)}`}>
          {statusLabel(status)}
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        <div>
          <dt className="text-slate-500 mb-0.5">Último embarque</dt>
          <dd className="font-medium text-slate-700">{formatarData(pessoa.ultimoEmbarque)}</dd>
        </div>
        <div>
          <dt className="text-slate-500 mb-0.5">Dias embarcado</dt>
          <dd className="font-medium text-slate-700">{pessoa.diasEmbarcado}d</dd>
        </div>
        <div>
          <dt className="text-slate-500 mb-0.5">Desembarque previsto</dt>
          <dd className="font-medium text-slate-700">{formatarData(dataDesembarque)}</dd>
        </div>
        <div>
          <dt className="text-slate-500 mb-0.5">
            {status === 'em-terra' ? 'Em terra há' : 'Desembarca em'}
          </dt>
          <dd className={`font-bold text-sm ${status === 'desembarque-hoje' ? 'text-red-700' : ''}`}>
            {diasLabel(diasRestantes, status)}
          </dd>
        </div>
      </dl>

      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onEdit(pessoa)}
          className="flex-1 text-xs font-medium py-1.5 rounded-lg bg-white/60 hover:bg-white/90 border border-current/20 transition-colors"
        >
          Editar
        </button>
        <button
          onClick={() => onDelete(pessoa)}
          className="flex-1 text-xs font-medium py-1.5 rounded-lg bg-white/60 hover:bg-white/90 border border-current/20 transition-colors text-red-600"
        >
          Excluir
        </button>
      </div>
    </div>
  )
}

// ─── página principal ────────────────────────────────────────────────────────

export default function DiasEmbarcadoPage() {
  const [pessoas,          setPessoas]          = useState([])
  const [loading,          setLoading]          = useState(true)
  const [erro,             setErro]             = useState('')
  const [busca,            setBusca]            = useState('')
  const [ordenacao,        setOrdenacao]        = useState('desembarque') // 'nome' | 'desembarque'
  const [modalAberto,      setModalAberto]      = useState(false)
  const [pessoaEditando,   setPessoaEditando]   = useState(null)
  const [pessoaExcluindo,  setPessoaExcluindo]  = useState(null)

  async function carregar() {
    setLoading(true)
    setErro('')
    try {
      const res = await fetch(BASE)
      if (!res.ok) throw new Error('Falha ao carregar dados.')
      const json = await res.json()
      setPessoas(json.data ?? [])
    } catch (e) {
      setErro(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregar() }, [])

  async function handleSalvar(dados) {
    if (pessoaEditando) {
      const res = await fetch(`${BASE}/${pessoaEditando._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error ?? 'Erro ao atualizar.')
      }
    } else {
      const res = await fetch(BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error ?? 'Erro ao criar.')
      }
    }
    setModalAberto(false)
    setPessoaEditando(null)
    await carregar()
  }

  async function handleExcluir() {
    if (!pessoaExcluindo) return
    await fetch(`${BASE}/${pessoaExcluindo._id}`, { method: 'DELETE' })
    setPessoaExcluindo(null)
    await carregar()
  }

  function abrirNova() {
    setPessoaEditando(null)
    setModalAberto(true)
  }

  function abrirEdicao(pessoa) {
    setPessoaEditando(pessoa)
    setModalAberto(true)
  }

  // ─ dashboard stats ─
  const stats = useMemo(() => {
    const total      = pessoas.length
    const embarcados = pessoas.filter(p => calcularStatus(p).status === 'embarcado').length
    const hoje       = pessoas.filter(p => calcularStatus(p).status === 'desembarque-hoje').length
    const emTerra    = total - embarcados - hoje

    const proximo = [...pessoas]
      .filter(p => ['embarcado', 'desembarque-hoje'].includes(calcularStatus(p).status))
      .sort((a, b) => calcularStatus(a).diasRestantes - calcularStatus(b).diasRestantes)[0]

    return { total, embarcados: embarcados + hoje, emTerra, proximo }
  }, [pessoas])

  // ─ lista filtrada e ordenada ─
  const lista = useMemo(() => {
    const filtro = busca.toLowerCase().trim()
    let resultado = filtro
      ? pessoas.filter(p => p.nome.toLowerCase().includes(filtro))
      : [...pessoas]

    resultado.sort((a, b) => {
      if (ordenacao === 'nome') return a.nome.localeCompare(b.nome)
      return calcularStatus(a).diasRestantes - calcularStatus(b).diasRestantes
    })

    return resultado
  }, [pessoas, busca, ordenacao])

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        {/* cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Controle de Embarque</h1>
            <p className="text-sm text-slate-500 mt-0.5">Acompanhe os ciclos de embarque e desembarque</p>
          </div>
          <button
            onClick={abrirNova}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-sm transition-colors"
          >
            <span className="text-lg leading-none">＋</span> Nova Pessoa
          </button>
        </div>

        {/* dashboard */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Total"      value={stats.total}      color="bg-slate-100 border-slate-200 text-slate-700" />
          <StatCard label="Embarcados" value={stats.embarcados} color="bg-blue-50  border-blue-200  text-blue-700"  />
          <StatCard label="Em Terra"   value={stats.emTerra}    color="bg-green-50 border-green-200 text-green-700" />
          <div className="rounded-2xl border bg-amber-50 border-amber-200 text-amber-700 p-4 flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wide opacity-70">Próx. desembarque</span>
            {stats.proximo ? (
              <>
                <span className="text-sm font-bold leading-tight">{stats.proximo.nome}</span>
                <span className="text-xs opacity-80">
                  {formatarData(calcularStatus(stats.proximo).dataDesembarque)}
                </span>
              </>
            ) : (
              <span className="text-sm font-bold">—</span>
            )}
          </div>
        </div>

        {/* controles */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome…"
            className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setOrdenacao('desembarque')}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                ordenacao === 'desembarque'
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              Por desembarque
            </button>
            <button
              onClick={() => setOrdenacao('nome')}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                ordenacao === 'nome'
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              Por nome
            </button>
          </div>
        </div>

        {/* conteúdo */}
        {loading ? (
          <div className="flex justify-center py-16 text-slate-400 text-sm">Carregando…</div>
        ) : erro ? (
          <div className="text-center py-16 space-y-3">
            <p className="text-red-600 text-sm">{erro}</p>
            <button onClick={carregar} className="text-sm text-blue-600 underline">Tentar novamente</button>
          </div>
        ) : lista.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            {busca ? 'Nenhuma pessoa encontrada para a busca.' : 'Nenhuma pessoa cadastrada ainda.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lista.map(p => (
              <PessoaCard
                key={p._id}
                pessoa={p}
                onEdit={abrirEdicao}
                onDelete={setPessoaExcluindo}
              />
            ))}
          </div>
        )}
      </div>

      {/* modais */}
      {modalAberto && (
        <Modal
          pessoa={pessoaEditando}
          onClose={() => { setModalAberto(false); setPessoaEditando(null) }}
          onSave={handleSalvar}
        />
      )}
      {pessoaExcluindo && (
        <ConfirmDialog
          nome={pessoaExcluindo.nome}
          onConfirm={handleExcluir}
          onCancel={() => setPessoaExcluindo(null)}
        />
      )}
    </div>
  )
}
