import {pickTheme} from '../../../react/utils/shop';

const {describe, expect, it} = global;

const laveGoColors = {
  headerBackground: '#FFFFFF',
  'headerBackground-light': '#020202',
  'headerBackground-dark': '#181818',
  headerBorder: '#FEBC1D',
  'headerBorder-light': '#FEBC1D',
  headerIcon: '#252525',
  'headerIcon-light': '#ffce00',
  'headerIcon-dark': '#FEBC1D',
  buttonBackground: '#FFF1C7',
};

describe('pickTheme header tokens', () => {
  it('uses the Manager light variant for the header, like the Manager', () => {
    const theme = pickTheme({theme: {colors: laveGoColors}});

    expect(theme.header).toBe('#020202');
    expect(theme.headerIcon).toBe('#ffce00');
    expect(theme.headerBottomBorder).toBe('#FEBC1D');
  });

  it('uses the dark variant when the mode is dark', () => {
    const theme = pickTheme({theme: {colors: laveGoColors}}, 'dark');

    expect(theme.header).toBe('#181818');
    expect(theme.headerIcon).toBe('#FEBC1D');
  });

  it('keeps themes without mode variants unchanged', () => {
    const theme = pickTheme({
      theme: {colors: {headerBackground: '#0B3A53', buttonBackground: '#FFFFFF'}},
    });

    expect(theme.header).toBe('#0B3A53');
    expect(theme.headerIcon).toBe('#FFFFFF');
  });

  it('falls back to a readable icon color when the header icon token has no contrast', () => {
    const theme = pickTheme({
      theme: {
        colors: {
          'headerBackground-light': '#020202',
          'headerIcon-light': '#030303',
          buttonBackground: '#FFF1C7',
        },
      },
    });

    expect(theme.headerIcon).toBe('#FFF1C7');
  });
});
