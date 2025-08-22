import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats, Html5QrcodeScanType } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Camera } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface BarcodeScannerProps {
  onScanSuccess: (barcode: string) => void;
  onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScanSuccess, onClose }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const config = {
      fps: 15,
      qrbox: { width: 300, height: 150 },
      aspectRatio: 2.0,
      formatsToSupport: [
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
      ],
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
      disableFlip: false,
      rememberLastUsedCamera: true,
    };

    const onScanSuccessCallback = (decodedText: string) => {
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
          false
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

    // Démarrer le scanner automatiquement
    startScanner();

    return () => {
      stopScanner();
    };
  }, [onScanSuccess]);

  const handleClose = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(error => {
        console.error("Erreur lors de la fermeture:", error);
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className={`w-full ${isMobile ? 'max-w-sm' : 'max-w-md'} bg-background`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Scanner Code-barres
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
              className={`${isMobile ? 'w-full' : 'w-80'} mx-auto rounded-lg overflow-hidden`}
            />
            
            {isScanning && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Pointez la caméra vers le code-barres de l'article
                </p>
              </div>
            )}
            
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleClose}
            >
              Fermer le scanner
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BarcodeScanner;