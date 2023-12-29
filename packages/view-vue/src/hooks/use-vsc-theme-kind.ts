import { ref } from 'vue'
import { useCall, useSubscrible } from './cec-client'

export enum VscThemeKind {
  Light = 'light',
  Dark = 'dark',
  HighContrast = 'highContrast',
  HighContrastLight = 'highContrastLight'
}

const themeKindMap = new Map([
  [1, VscThemeKind.Light],
  [2, VscThemeKind.Dark],
  [3, VscThemeKind.HighContrast],
  [4, VscThemeKind.HighContrastLight]
])

export function useVscThemeKind() {
  const themeKind = ref<VscThemeKind>()
  useCall<number>('getTheme').then((theme) => {
    themeKind.value = themeKindMap.get(theme)!
  })
  useSubscrible('getTheme', (theme: number) => {
    themeKind.value = themeKindMap.get(theme)!
  })
  return themeKind
}
