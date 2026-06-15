import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { hasPermission } from '@/core/permissions/check'
import { emitEvent } from '@/core/events/bus'
import { ok, created, unauthorized, forbidden, validationError } from '@/lib/api-helpers'
import { z } from 'zod'

const createSchema = z.object({
  nome:           z.string().min(1).max(200).trim(),
  diasEmbarcado:  z.number().int().min(1),
  ultimoEmbarque: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato esperado: AAAA-MM-DD'),
})

export async function GET() {
  const session = await auth()
  if (!session) return unauthorized()
  if (!hasPermission(session, 'dias-embarcado:items:read')) return forbidden()

  await connectDB()
  const { default: Model } = await import('../../models/DiasEmbarcado.js')
  const items = await Model.find().sort({ ultimoEmbarque: -1 })
  return ok(items)
}

export async function POST(request) {
  const session = await auth()
  if (!session) return unauthorized()
  if (!hasPermission(session, 'dias-embarcado:items:write')) return forbidden()

  const body = await request.json().catch(() => null)
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return validationError(parsed.error)

  await connectDB()
  const { default: Model } = await import('../../models/DiasEmbarcado.js')
  const item = await Model.create({ ...parsed.data, createdBy: session.user.id })

  emitEvent('dias-embarcado:item:created', { itemId: item._id, by: session.user.id })

  return created(item.toJSON())
}
