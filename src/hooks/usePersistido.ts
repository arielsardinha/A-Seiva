import { useCallback, useState } from 'react'

const PREFIXO = 'radio-dra-lis:'

/** localStorage pode estar bloqueado (modo privado, política do navegador): nunca deixa quebrar o app. */
export function lerSalvo<T>(chave: string, padrao: T): T {
  try {
    const bruto = window.localStorage.getItem(PREFIXO + chave)
    return bruto === null ? padrao : (JSON.parse(bruto) as T)
  } catch {
    return padrao
  }
}

export function gravarSalvo(chave: string, valor: unknown) {
  try {
    window.localStorage.setItem(PREFIXO + chave, JSON.stringify(valor))
  } catch {
    // sem armazenamento: o app segue funcionando, só não lembra
  }
}

export function apagarSalvo(chave: string) {
  try {
    window.localStorage.removeItem(PREFIXO + chave)
  } catch {
    // idem
  }
}

/** useState que lembra o valor no localStorage. */
export function usePersistido<T>(chave: string, padrao: T) {
  const [valor, setValor] = useState<T>(() => lerSalvo(chave, padrao))
  const definir = useCallback(
    (novo: T | ((anterior: T) => T)) => {
      setValor((anterior) => {
        const proximo = typeof novo === 'function' ? (novo as (a: T) => T)(anterior) : novo
        gravarSalvo(chave, proximo)
        return proximo
      })
    },
    [chave],
  )
  return [valor, definir] as const
}
