import { ref, onUnmounted} from 'vue'
import { useCall, useSubscrible } from './use-cec-client'

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
]

export function useVscColorTheme() {
  const colorTheme = ref<string>()
  useCall<string>('VscTheme.getTheme').then((theme) => {
    colorTheme.value = theme
  })

  const dispose = useSubscrible('VscTheme.getTheme', (theme: string) => {
    colorTheme.value = theme
  })
  onUnmounted(dispose)

  const setColorTheme = (colorTheme: string) => {
    useCall('VscTheme.updateTheme', colorTheme)
  }

  return { colorTheme, setColorTheme }
}
