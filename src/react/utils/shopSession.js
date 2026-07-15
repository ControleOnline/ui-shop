const normalizeNumericId = value => {
  const clean = String(value || '').replace(/\D/g, '')
  return clean ? Number(clean) : null
}

export const readShopSession = () => {
  if (typeof localStorage === 'undefined' || !localStorage?.getItem) {
    return {}
  }

  try {
    const rawSession = localStorage.getItem('session')
    return rawSession ? JSON.parse(rawSession) || {} : {}
  } catch {
    return {}
  }
}

export const resolveShopSessionClientId = session =>
  normalizeNumericId(session?.mycompany || session?.people)

export const readShopSessionClientId = () =>
  resolveShopSessionClientId(readShopSession())

export {normalizeNumericId}
