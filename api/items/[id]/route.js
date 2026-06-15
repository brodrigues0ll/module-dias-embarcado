import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { hasPermission } from '@/core/permissions/check'
import { emitEvent } from '@/core/events/bus'
import { ok, notFound, unauthorized, forbidden, validationError } from '@/lib/api-helpers'
import { z } from 'zod'

const updateSchema = z.object({
  nome:           z.string().min(1).max(200).trim().optional(),
  diasEmbarcado:  z.number().int().min(1).optional(),
  ultimoEmbarque: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato esperado: AAAA-MM-DD').optional(),
}).refine(data => Object.keys(data).length > 0, { message: 'Nenhum campo para atualizar' })

async function getModel() {
  const { default: Model } = await import('../../../models/DiasEmbarcado.js')
  return Model
}

export async function PUT(request, { params }) {
  const session = await auth()
  if (!session) return unauthorized()
  if (!hasPermission(session, 'dias-embarcado:items:write')) return forbidden()

  const body = await request.json().catch(() => null)
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return validationError(parsed.error)

  await connectDB()
  const Model = await getModel()
  const item = await Model.findByIdAndUpdate(params.id, parsed.data, { new: true, runValidators: true })
  if (!item) return notFound()

  emitEvent('dias-embarcado:item:updated', { itemId: item._id, by: session.user.id })

  return ok(item.toJSON())
}

export async function DELETE(request, { params }) {
  const session = await auth()
  if (!session) return unauthorized()
  if (!hasPermission(session, 'dias-embarcado:items:delete')) return forbidden()

  await connectDB()
  const Model = await getModel()
  const item = await Model.findByIdAndDelete(params.id)
  if (!item) return notFound()

  emitEvent('dias-embarcado:item:deleted', { itemId: params.id, by: session.user.id })

  return ok({ deleted: true })
}
