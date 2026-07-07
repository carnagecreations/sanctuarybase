// Shared display constants & pure helpers for the People/CRM page components.
// Plain module (not a store) — no state lives here.

export const personTypes = ['volunteer', 'foster', 'donor', 'adopter']
export const statusOptions = ['active', 'inactive', 'pending']
export const availableTags = ['Has Waiver', 'Trained', 'Has Animals', 'Available Weekends', 'Large Space', 'Spanish Speaking', 'Medical Background', 'Driver']
export const typeIcons = { volunteer: '🤝', foster: '🏠', donor: '💝', adopter: '🐾' }

export const avatarStyle = (type) => {
  const colors = {
    volunteer: 'background: linear-gradient(135deg, #4EFFC5, #2DD4BF)',
    foster: 'background: linear-gradient(135deg, #F97316, #EA580C)',
    donor: 'background: linear-gradient(135deg, #A78BFA, #7C3AED)',
    adopter: 'background: linear-gradient(135deg, #60A5FA, #2563EB)',
  }
  return colors[type] || 'background: var(--surface-2)'
}

export const badgeType = (status) => {
  return { active: 'success', inactive: 'info', pending: 'warn' }[status] || 'info'
}

export const formatDate = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Person records store roles two ways in the wild: a `types` array (current
// PersonForm schema) or a legacy single `type` string. Normalize both here
// so every consumer checks membership the same way.
export const personTypeList = (person) =>
  Array.isArray(person?.types) ? person.types : (person?.type ? [person.type] : [])
