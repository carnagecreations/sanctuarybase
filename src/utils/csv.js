export const exportCSV = (rows, filename) => {
  if (!rows.length) return

  const headers = Object.keys(rows[0])
  const lines = [
    headers.join(','),
    ...rows.map(row =>
      headers.map(h => {
        const val = row[h]
        if (val === null || val === undefined) return ''
        const str = Array.isArray(val) ? val.join('; ') : String(val)
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str
      }).join(',')
    ),
  ]

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}-${new Date().toISOString().slice(0,10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export const exportPeopleCSV = (people) => {
  const rows = people.map(p => ({
    Name: p.name || '',
    Type: (Array.isArray(p.types) ? p.types.join(', ') : p.type) || '',
    Status: p.status || '',
    Email: p.email || '',
    Phone: p.phone || '',
    Location: p.location || '',
    Tags: (p.tags || []).join('; '),
    Notes: p.notes || '',
    'Created At': p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '',
  }))
  exportCSV(rows, 'people')
}

export const exportAnimalsCSV = (animals) => {
  const rows = animals.map(a => ({
    Name: a.name || '',
    Species: a.species || '',
    Breed: a.breed || '',
    Status: a.status || '',
    Location: a.location || '',
    'Linked Person': a.linkedPersonName || '',
    'Intake Date': a.intakeDate || '',
    Notes: a.notes || '',
  }))
  exportCSV(rows, 'animals')
}

export const exportSafeHousesCSV = (houses) => {
  const rows = houses.map(h => ({
    Name: h.name || '',
    Contact: h.contactName || '',
    Phone: h.phone || '',
    Email: h.email || '',
    Location: h.location || '',
    Capacity: h.capacity || '',
    'Animals Placed': (h.animalsPlaced || []).length,
    'Animal Types': h.animalTypes || '',
    Status: h.status || '',
    Notes: h.notes || '',
  }))
  exportCSV(rows, 'safe-houses')
}
