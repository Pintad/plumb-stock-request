import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats, Html5QrcodeScanType } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Camera, Zap } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface BarcodeScannerProps {
  onScanSuccess: (barcode: string) => void;
  onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScanSuccess, onClose }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMode, setScanMode] = useState<'normal' | 'precise'>('normal');
  const isMobile = useIsMobile();

  useEffect(() => {
    const baseConfig = {
      fps: scanMode === 'precise' ? 10 : 15, // Réduire FPS pour plus de précision
      aspectRatio: 1.0, // Ratio carré pour capturer plus de détails
      formatsToSupport: [
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.CODE_128, // Ajouter CODE_128 très commun
        Html5QrcodeSupportedFormats.EAN_13,   // Code-barres produits
        Html5QrcodeSupportedFormats.EAN_8,    // Code-barres produits courts
        Html5QrcodeSupportedFormats.UPC_A,    // Code-barres US
        Html5QrcodeSupportedFormats.UPC_E,    // Code-barres US courts
      ],
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
      disableFlip: false, // Permettre le flip pour plus d'angles
      rememberLastUsedCamera: true,
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true
      },
      showTorchButtonIfSupported: true,
    };

    // Configuration adaptée au mode de scan
    const config = scanMode === 'precise' ? {
      ...baseConfig,
      qrbox: isMobile ? { width: 280, height: 150 } : { width: 400, height: 200 },
      videoConstraints: {
        width: isMobile ? 640 : 1280, // Résolution plus élevée
        height: isMobile ? 480 : 720,
        facingMode: "environment",
        focusMode: "continuous", // Focus continu pour petits codes
        exposureMode: "continuous", // Exposition continue
        whiteBalanceMode: "continuous" // Balance des blancs continue
      },
    } : {
      ...baseConfig,
      qrbox: isMobile ? { width: 250, height: 120 } : { width: 320, height: 160 },
      videoConstraints: {
        width: isMobile ? 480 : 640,
        height: isMobile ? 320 : 480,
        facingMode: "environment"
      },
    };

    const onScanSuccessCallback = (decodedText: string) => {
      // Vibration tactile sur mobile si supportée
      if ('vibrate' in navigator) {
        navigator.vibrate(100);
      }
      onScanSuccess(decodedText);
      stopScanner();
    };

    const onScanFailureCallback = (error: string) => {
      // Ne pas afficher les erreurs de scan en continu
      console.debug('Scan error:', error);
    };

    const startScanner = () => {
      if (!scannerRef.current) {
        scannerRef.current = new Html5QrcodeScanner(
          "qr-reader",
          config,
          false // Pas de verbose
        );
        scannerRef.current.render(onScanSuccessCallback, onScanFailureCallback);
        setIsScanning(true);
      }
    };

    const stopScanner = () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Erreur lors de l'arrêt du scanner:", error);
        });
        scannerRef.current = null;
        setIsScanning(false);
      }
    };

    // Redémarrer le scanner quand le mode change
    stopScanner();
    startScanner();

    return () => {
      stopScanner();
    };
  }, [onScanSuccess, scanMode, isMobile]);

  const handleClose = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(error => {
        console.error("Erreur lors de la fermeture:", error);
      });
    }
    onClose();
  };

  const toggleScanMode = () => {
    setScanMode(prev => prev === 'normal' ? 'precise' : 'normal');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className={`w-full ${isMobile ? 'max-w-sm' : 'max-w-lg'} bg-background`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Scanner Code-barres
            {scanMode === 'precise' && <Zap className="h-4 w-4 text-orange-500" />}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div 
              id="qr-reader" 
              className={`${scanMode === 'precise' 
                ? (isMobile ? 'w-full' : 'w-96') 
                : (isMobile ? 'w-full' : 'w-80')
              } mx-auto rounded-lg overflow-hidden bg-black`}
            />
            
            {isScanning && (
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  {scanMode === 'precise' 
                    ? "Mode précision activé - Approchez-vous du code-barres"
                    : "Pointez la caméra vers le code-barres"
                  }
                </p>
                <p className="text-xs text-muted-foreground">
                  💡 Assurez-vous que le code-barres soit bien éclairé et net
                </p>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button 
                variant={scanMode === 'precise' ? 'default' : 'outline'}
                className="flex-1" 
                onClick={toggleScanMode}
                disabled={!isScanning}
              >
                <Zap className="h-4 w-4 mr-2" />
                {scanMode === 'precise' ? 'Mode Précision ON' : 'Mode Précision'}
              </Button>
              
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={handleClose}
              >
                Fermer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BarcodeScanner;