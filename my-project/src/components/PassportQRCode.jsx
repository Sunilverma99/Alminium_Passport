

import React, { useEffect, useRef } from 'react'
import QRCodeStyling from 'qr-code-styling'

const PassportQRCode = ({ url, size = 160 }) => {
  const qrCodeRef = useRef(null)
  const qrCode = useRef(null)

  useEffect(() => {
    if (!qrCode.current) {
      qrCode.current = new QRCodeStyling({
        width: size,
        height: size,
        type: "svg",
        data: url,
        image :"/Logo.png",
        qrOptions: {
          typeNumber: 0,
          mode: "Byte",
          errorCorrectionLevel: "H",
        },
        imageOptions: {
          hideBackgroundDots: true,
          imageSize: 0.2,
          margin: 0,
          crossOrigin: "anonymous",
        },
        dotsOptions:  {
          "type": "dots",
          "color": "#004AB2",
          "roundSize": true,
          "gradient": null
      },
        backgroundOptions: {
          color: "#FFFFFF",
        },
        cornersSquareOptions: {
          type: "extra-rounded",
          color: "#000000",
        },
        cornersDotOptions: {
          type: "dot",
          color: "#000000",
        },
      })
    }

    if (qrCode.current) {
      qrCode.current.update({
        data: url,
      })
    }

    if (qrCodeRef.current && qrCode.current) {
      qrCodeRef.current.innerHTML = ""
      qrCode.current.append(qrCodeRef.current)
    }
  }, [url, size])

  return (
    <div className="flex justify-center items-center bg-white">
      <div ref={qrCodeRef} className="relative"  />
    </div>
  )
}

export default PassportQRCode

