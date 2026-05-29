import {pickTheme} from '@controleonline/ui-shop/src/react/utils/shop';

describe('pickTheme', () => {
  it('keeps shop text readable on light panels when the company theme is dark', () => {
    const theme = pickTheme({
      theme: {
        colors: {
          background: '#F3F7FB',
          surface: '#FFFFFF',
          'text-primary': '#FFFFFF',
          'text-secondary': '#F8FAFC',
        },
      },
    });

    expect(theme.text).toBe('#111827');
    expect(theme.muted).toBe('#475569');
  });

  it('keeps shop text readable on dark panels when the company theme is light', () => {
    const theme = pickTheme({
      theme: {
        colors: {
          background: '#0F172A',
          surface: '#111827',
          'text-primary': '#111827',
          'text-secondary': '#334155',
        },
      },
    });

    expect(theme.text).toBe('#F8FAFC');
    expect(theme.muted).toBe('#CBD5E1');
  });

  it('keeps readable configured colors unchanged', () => {
    const theme = pickTheme({
      theme: {
        colors: {
          background: '#F8FAFC',
          surface: '#FFFFFF',
          'text-primary': '#243447',
          'text-secondary': '#52677A',
        },
      },
    });

    expect(theme.text).toBe('#243447');
    expect(theme.muted).toBe('#52677A');
  });
});
