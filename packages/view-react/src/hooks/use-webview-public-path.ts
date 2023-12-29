import { useState } from 'react'
import { join } from 'path-browserify'

export function useWebviewPublicPath(relativePath: string) {
  const webviewPublicPath = ((window as any).__webview_public_path__ as string) ?? ''
  const path = join(webviewPublicPath, relativePath)
  return useState(path)
}
