const React = require('react');
const ReactDOMServer = require('react-dom/server');
const {jest} = require('@jest/globals');

const {afterEach, beforeEach, describe, expect, it} = global;

let mockIsLogged = true;
let mockSessionChecked = true;
let capturedShellProps = null;
let consoleErrorSpy;

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    reset: jest.fn(),
  }),
}));

jest.mock('@store', () => ({
  useStore: jest.fn(name => {
    if (name === 'auth') {
      return {
        actions: {
          logOut: jest.fn(),
        },
        getters: {
          isLogged: mockIsLogged,
          sessionChecked: mockSessionChecked,
          user: {
            email: 'cliente@teste.com',
            id: 15,
            name: 'Cliente Teste',
          },
        },
      };
    }

    return {
      actions: {},
      getters: {},
    };
  }),
}));

jest.mock('@controleonline/ui-shop/src/react/hooks/useShopCart', () => () => ({
  defaultCompany: {
    id: 1,
    theme: {
      colors: {},
    },
  },
}));

jest.mock('@controleonline/ui-shop/src/react/components/storefront/ShopShell', () => props => {
  capturedShellProps = props;

  return React.createElement(
    'ShopShell',
    props,
    typeof props.children === 'function' ? props.children({}) : props.children,
  );
});

jest.mock(
  '@controleonline/ui-shop/src/react/components/storefront/ShopAuthRequiredState',
  () => props => {
    global.__shopAuthRequiredRendered = true;
    return React.createElement('ShopAuthRequiredState', props);
  },
);

jest.mock('@controleonline/ui-shop/src/react/utils/shop', () => ({
  pickTheme: jest.fn(() => ({
    background: '#fff',
    surface: '#fff',
    text: '#111',
    muted: '#666',
  })),
}));

jest.mock('@controleonline/ui-people/src/react/pages/Profile', () => props => {
  global.__profileEditorRendered = true;
  return React.createElement('ProfileScreen', props);
});

const ShopProfilePage = require('../../../react/pages/ProfilePage').default;

const renderPage = () => {
  global.__profileEditorRendered = false;
  global.__shopAuthRequiredRendered = false;
  capturedShellProps = null;
  ReactDOMServer.renderToStaticMarkup(React.createElement(ShopProfilePage));
};

describe('ShopProfilePage', () => {
  beforeEach(() => {
    mockIsLogged = true;
    mockSessionChecked = true;
    global.__profileEditorRendered = false;
    global.__shopAuthRequiredRendered = false;
    capturedShellProps = null;
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('abre o editor completo de perfil direto no ShopShell', () => {
    renderPage();

    expect(global.__profileEditorRendered).toBe(true);
    expect(global.__shopAuthRequiredRendered).toBe(false);
    expect(capturedShellProps).toMatchObject({
      showBottomCart: false,
      showSearch: false,
      subtitle: 'Perfil',
    });
  });

  it('mostra autenticacao quando o usuario nao esta logado', () => {
    mockIsLogged = false;

    renderPage();

    expect(global.__profileEditorRendered).toBe(false);
    expect(global.__shopAuthRequiredRendered).toBe(true);
    expect(capturedShellProps).toMatchObject({
      showBottomCart: false,
      showSearch: false,
      subtitle: 'Perfil',
    });
  });
});
