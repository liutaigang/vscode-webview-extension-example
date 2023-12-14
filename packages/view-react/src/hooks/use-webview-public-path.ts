import { useState } from 'react'

export function useWebviewPublicPath(relativePath: string) {
  const webviewPublicPath = ((window as any).__webview_public_path__ as string) ?? ''
  const path = join(webviewPublicPath, relativePath)
  return useState(path)
}

function join(...paths: string[]) {
  const joinPath = paths
    .map((path) => path.split('/'))
    .flat()
    .filter((item) => item != '' && item != '.')
    .join('/')
  const isRelative = paths[0].startsWith('.') || paths[0].startsWith('/')
  return isRelative ? './' + joinPath : joinPath
}