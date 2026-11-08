import type { Order, OrderItem, OrderStatus } from "@/lib/types"

const customers = [
  ["Valeria Mora", "8812-4471"],
  ["Andrés Solís", "8703-1129"],
  ["Daniela Rojas", "6045-2290"],
  ["Kevin Araya", "7120-8834"],
  ["María José Vargas", "8456-0012"],
  ["José Pablo Jiménez", "8890-7713"],
  ["Fabiola Castro", "6211-5408"],
  ["Esteban Quesada", "8333-9021"],
  ["Natalia Chaves", "7004-6612"],
  ["Luis Diego Brenes", "8567-3340"],
  ["Sofía Calderón", "6120-7781"],
  ["Mauricio Alfaro", "8722-1905"],
] as const

const catalog: [string, string, string, number][] = [
  ["p001", "Nike Air Force 1 '07", "Blanco · 42", 84900],
  ["p004", "Nike Dunk Low “Panda”", "Blanco/Negro · 41", 66900],
  ["p006", "Nike SB Triple Black", "Negro · 40", 29900],
  ["p008", "Puma Suede XL", "Rojo · 42", 55900],
  ["p009", "New Balance 550", "Blanco/Negro · 43", 54900],
  ["p013", "Camiseta DRYX Dry Cool", "Negro · M", 14900],
  ["p014", "Camiseta DRYX Signature", "Blanco · L", 14900],
  ["p017", "Sueta Chicago Bulls", "Negro · L", 32900],
  ["p023", "Gorra Chicago Bulls 9FORTY", "Negro · Ajustable", 22900],
  ["p026", "Botella térmica Alajuelense", "Negro · 20 oz", 12900],
]

const provinces = [
  ["San José", "Desamparados"],
  ["Cartago", "La Unión"],
  ["Heredia", "Santo Domingo"],
  ["Alajuela", "Alajuela"],
  ["San José", "Goicoechea"],
]

const statuses: OrderStatus[] = ["entregado", "entregado", "entregado", "enviado", "pagado", "nuevo", "cancelado"]

function build(): Order[] {
  const orders: Order[] = []
  let seed = 17
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280), seed / 233280)
  const now = Date.UTC(2026, 10, 8, 18)
  for (let i = 0; i < 34; i++) {
    const daysAgo = Math.floor((i / 34) * 30 + rnd() * 1.5)
    const createdAt = new Date(now - daysAgo * 86400000 - Math.floor(rnd() * 9) * 3600000).toISOString()
    const nItems = 1 + Math.floor(rnd() * 3)
    const items: OrderItem[] = []
    for (let k = 0; k < nItems; k++) {
      const [productId, name, variantLabel, unitPrice] = catalog[Math.floor(rnd() * catalog.length)]
      items.push({ productId, name, variantLabel, unitPrice, qty: rnd() > 0.85 ? 2 : 1 })
    }
    const [customer, phone] = customers[Math.floor(rnd() * customers.length)]
    const shipping = rnd() > 0.45
    const [province, canton] = provinces[Math.floor(rnd() * provinces.length)]
    const status: OrderStatus = daysAgo <= 1 ? (rnd() > 0.4 ? "nuevo" : "pagado") : statuses[Math.floor(rnd() * statuses.length)]
    const channelR = rnd()
    orders.push({
      id: `o${i}`,
      number: 1000 + 34 - i,
      customer,
      phone,
      channel: channelR > 0.35 ? "whatsapp" : channelR > 0.15 ? "tienda" : "instagram",
      delivery: shipping ? "shipping" : "pickup",
      province: shipping ? province : undefined,
      canton: shipping ? canton : undefined,
      items,
      total: items.reduce((s, it) => s + it.qty * it.unitPrice, 0),
      status: status === "nuevo" && daysAgo > 2 ? "entregado" : status,
      createdAt,
    })
  }
  return orders
}

export const seedOrders: Order[] = build()
