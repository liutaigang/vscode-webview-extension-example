import { ref, onUnmounted } from 'vue';
import { useHandlers } from './use-handlers';

export const vscColorThemeOptions = [
  {
    label: 'Light High Contrast',
    value: 'Default High Contrast Light'
  },
  {
    label: 'Light (Visual Studio)',
    value: 'Visual Studio Light'
  },
  {
    label: 'Light Modern',
    value: 'Default Light Modern'
  },
  {
    label: 'Light+',
    value: 'Default Light+'
  },
  {
    label: 'Dark High Contrast',
    value: 'Default High Contrast'
  },
  {
    label: 'Dark (Visual Studio)',
    value: 'Visual Studio Dark'
  },
  {
    label: 'Dark Modern',
    value: 'Default Dark Modern'
  },
  {
    label: 'Dark+',
    value: 'Default Dark+'
  },
  {
    label: 'Red',
    value: 'Red'
  }
];

const handlers = useHandlers();
export function useVscTheme() {
  const theme = ref<string>();

  (async () => {
    const dispose = await handlers.onThemeChange({
      next: (newTheme: string) => (theme.value = newTheme)
    });
    onUnmounted(dispose);
  })();

  const setTheme = (theme: string) => handlers.setTheme(theme);

  return { theme, setTheme };
}
