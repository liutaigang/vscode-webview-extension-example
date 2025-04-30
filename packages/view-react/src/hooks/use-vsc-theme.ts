import { useState, useEffect } from 'react';
import { useHandlers } from './use-handlers';

export const vscColorThemeOptions = [
  {
    label: 'Light High Contrast',
    value: 'Default High Contrast Light',
  },
  {
    label: 'Light (Visual Studio)',
    value: 'Visual Studio Light',
  },
  {
    label: 'Light Modern',
    value: 'Default Light Modern',
  },
  {
    label: 'Light+',
    value: 'Default Light+',
  },
  {
    label: 'Dark High Contrast',
    value: 'Default High Contrast',
  },
  {
    label: 'Dark (Visual Studio)',
    value: 'Visual Studio Dark',
  },
  {
    label: 'Dark Modern',
    value: 'Default Dark Modern',
  },
  {
    label: 'Dark+',
    value: 'Default Dark+',
  },
  {
    label: 'Red',
    value: 'Red',
  },
];

export function useVscTheme() {
  const handlers = useHandlers();
  const [theme, setTheme] = useState<string>();

  useEffect(() => {
    const dispose = handlers.onThemeChange({
      next: (newTheme: string) => setTheme(newTheme),
    });
    return () => {
      dispose.then((d) => d());
    };
  }, []);

  const updateTheme = (theme: string) => handlers.setTheme(theme);

  return [theme, updateTheme] as [string, typeof updateTheme];
}
