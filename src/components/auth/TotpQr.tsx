import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { m } from '#/paraglide/messages'

export function TotpQr({ value }: { value: string }) {
  const [src, setSrc] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    QRCode.toDataURL(value, {
      margin: 0,
      width: 360,
      color: { dark: '#16343c', light: '#f7fcff' },
    }).then((url) => {
      if (active) {
        setSrc(url)
      }
    })
    return () => {
      active = false
    }
  }, [value])

  if (!src) {
    return null
  }

  return (
    <div className="qr-frame">
      <img src={src} alt={m.twofa_scan()} />
    </div>
  )
}
