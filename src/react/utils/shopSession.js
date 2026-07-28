const normalizeNumericId = value => {
  const source =
    value && typeof value === 'object'
      ? value.id || value['@id'] || ''
      : value
  const clean = String(source || '').replace(/\D/g, '')
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

/*
 * @agents Loyalty belongs to the authenticated person, never to the company
 * currently selected for operational navigation.
 */
export const resolveShopAuthenticatedPeopleId = session =>
  normalizeNumericId(session?.people)

export const readShopAuthenticatedPeopleId = () =>
  resolveShopAuthenticatedPeopleId(readShopSession())

export {normalizeNumericId}
