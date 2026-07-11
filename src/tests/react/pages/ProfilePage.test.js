const React = require('react')
const ReactDOMServer = require('react-dom/server')
const {jest} = require('@jest/globals')

const {afterEach, beforeEach, describe, expect, it} = global

let mockSalesPageEnabled = true
let consoleErrorSpy

jest.mock('react-native', () => {
  const React = require('react')
  const createComponent = name => props => {
    if (name === 'Text') {
      global.__shopProfileTextChildren = global.__shopProfileTextChildren || []
      global.__shopProfileTextChildren.push(props.children)
    }

    return React.createElement(name, props, props.children)
  }

  return {
    Image: createComponent('Image'),
    ScrollView: createComponent('ScrollView'),
    Text: createComponent('Text'),
    TouchableOpacity: createComponent('TouchableOpacity'),
    View: createComponent('View'),
  }
})

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    reset: jest.fn(),
  }),
}))

jest.mock('@store', () => ({
  useStore: jest.fn(name => {
    if (name === 'auth') {
      return {
        actions: {
          logOut: jest.fn(),
        },
        getters: {
          isLogged: true,
          sessionChecked: true,
          user: {
            email: 'cliente@teste.com',
            id: 15,
            name: 'Cliente Teste',
          },
        },
      }
    }

    if (name === 'people') {
      return {
        getters: {
          currentCompany: {
            alias: 'Empresa Teste',
            email: [{email: 'empresa@teste.com'}],
            phone: [{ddd: '11', phone: '999999999'}],
          },
        },
      }
    }

    return {
      actions: {},
      getters: {},
    }
  }),
}))

jest.mock('@controleonline/ui-shop/src/react/hooks/useShopCart', () => () => ({
  defaultCompany: {
    id: 1,
    theme: {
      colors: {},
    },
  },
}))

jest.mock('@controleonline/ui-shop/src/react/hooks/useShopSettings', () => () => ({
  salesPageEnabled: mockSalesPageEnabled,
}))

jest.mock('@controleonline/ui-shop/src/react/components/storefront/ShopShell', () => props =>
  React.createElement(
    'ShopShell',
    props,
    typeof props.children === 'function' ? props.children({}) : props.children,
  ),
)

jest.mock(
  '@controleonline/ui-shop/src/react/components/storefront/ShopAuthRequiredState',
  () => () => React.createElement('ShopAuthRequiredState'),
)

jest.mock('@controleonline/ui-shop/src/react/utils/shop', () => ({
  buildFileUrl: jest.fn(() => 'https://example.com/avatar.png'),
  getInitials: jest.fn(() => 'CT'),
  pickTheme: jest.fn(() => ({
    muted: '#64748B',
    primary: '#0F172A',
  })),
}))

jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon')
jest.mock('md5', () => jest.fn(() => 'hash'))

const ShopProfilePage =
  require('../../../react/pages/ProfilePage').default

const flattenText = children =>
  React.Children.toArray(children).flatMap(child => {
    if (typeof child === 'string') {
      return [child]
    }

    return []
  })

const renderPage = () => {
  global.__shopProfileTextChildren = []
  ReactDOMServer.renderToStaticMarkup(React.createElement(ShopProfilePage))

  return global.__shopProfileTextChildren.flatMap(flattenText)
}

describe('ShopProfilePage', () => {
  beforeEach(() => {
    mockSalesPageEnabled = true
    global.__shopProfileTextChildren = []
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    global.__shopProfileTextChildren = []
    consoleErrorSpy.mockRestore()
  })

  it('oculta atalhos de vendas quando a pagina de vendas esta desativada', () => {
    mockSalesPageEnabled = false

    const textChildren = renderPage()

    expect(textChildren).toContain('Editar perfil completo')
    expect(textChildren).not.toContain('Meu carrinho')
    expect(textChildren).not.toContain('Pagamento e Pix')
    expect(textChildren).not.toContain('Meus cartões')
    expect(textChildren).not.toContain('Meus pedidos')
  })

  it('mantem atalhos de vendas quando a pagina de vendas esta ativa', () => {
    const textChildren = renderPage()

    expect(textChildren).toEqual(
      expect.arrayContaining([
        'Meu carrinho',
        'Pagamento e Pix',
        'Meus cartões',
        'Meus pedidos',
      ]),
    )
  })
})
