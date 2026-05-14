const MAPS = {
  order: {
    pending_review:      { label: 'Pendiente revisión', c: '--amber', bg: '--amber-bg' },
    searching_supplier:  { label: 'Buscando proveedor', c: '--blue',  bg: '--blue-bg'  },
    offer_sent:          { label: 'Oferta enviada',     c: '--blue',  bg: '--blue-bg'  },
    offer_accepted:      { label: 'Oferta aceptada',    c: '--green', bg: '--green-bg' },
    offer_rejected:      { label: 'Oferta rechazada',   c: '--red',   bg: '--red-bg'   },
    processing:          { label: 'En proceso',         c: '--navy',  bg: '--navy-bg'  },
    shipped:             { label: 'Enviado',            c: '--navy',  bg: '--navy-bg'  },
    in_customs:          { label: 'En aduana',          c: '--amber', bg: '--amber-bg' },
    delivered:           { label: 'Entregado',          c: '--green', bg: '--green-bg' },
    cancelled:           { label: 'Cancelado',          c: '--red',   bg: '--red-bg'   },
  },
  payment: {
    pending:   { label: 'Pendiente',   c: '--amber', bg: '--amber-bg' },
    completed: { label: 'Completado',  c: '--green', bg: '--green-bg' },
    failed:    { label: 'Fallido',     c: '--red',   bg: '--red-bg'   },
    refunded:  { label: 'Reembolsado', c: '--blue',  bg: '--blue-bg'  },
  },
  shipment: {
    preparing:        { label: 'Preparando',   c: '--muted', bg: '--bg3'     },
    picked_up:        { label: 'Recogido',     c: '--blue',  bg: '--blue-bg' },
    in_transit:       { label: 'En tránsito',  c: '--navy',  bg: '--navy-bg' },
    in_customs:       { label: 'En aduana',    c: '--amber', bg: '--amber-bg'},
    out_for_delivery: { label: 'En reparto',   c: '--green', bg: '--green-bg'},
    delivered:        { label: 'Entregado',    c: '--green', bg: '--green-bg'},
    returned:         { label: 'Devuelto',     c: '--red',   bg: '--red-bg'  },
  },
  offer: {
    pending:  { label: 'Pendiente', c: '--amber', bg: '--amber-bg' },
    accepted: { label: 'Aceptada',  c: '--green', bg: '--green-bg' },
    rejected: { label: 'Rechazada', c: '--red',   bg: '--red-bg'   },
    expired:  { label: 'Expirada',  c: '--muted', bg: '--bg3'      },
  },
}

export default function StatusBadge({ status, type = 'order' }) {
  const info = MAPS[type]?.[status] || { label: status, c: '--muted', bg: '--bg3' }
  return (
    <span className="badge" style={{ color: `var(${info.c})`, background: `var(${info.bg})` }}>
      {info.label}
    </span>
  )
}
