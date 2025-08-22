import React, { useEffect, useRef, useState } from 'react';
import Quagga from 'quagga';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Camera, Loader2, AlertTriangle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface BarcodeScannerProps {
  onScanSuccess: (barcode: string) => void;
  onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScanSuccess, onClose }) => {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    let mounted = true;
    let isQuaggaStarted = false;

    const initCamera = async () => {
      if (!mounted) return;

      try {
        setIsLoading(true);
        setError(null);

        // Test permissions caméra d'abord
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        stream.getTracks().forEach(track => track.stop());

        // Attendre que le DOM soit prêt
        await new Promise(resolve => setTimeout(resolve, 100));

        if (!mounted || !scannerRef.current) return;

        const config = {
          inputStream: {
            name: "Live",
            type: "LiveStream",
            target: scannerRef.current,
            constraints: {
              width: isMobile ? 640 : 800,
              height: isMobile ? 480 : 600,
              facingMode: "environment"
            }
          },
          decoder: {
            readers: [
              "code_128_reader",
              "ean_reader",
              "code_39_reader",
              "upc_reader"
            ]
          },
          locate: true,
          frequency: 10
        };

        Quagga.init(config, (err: any) => {
          if (!mounted) return;

          if (err) {
            console.error('Erreur QuaggaJS:', err);
            setError('Impossible d\'initialiser le scanner');
            setIsLoading(false);
            return;
          }

          if (!mounted) return;

          // Handler de détection
          Quagga.onDetected((result: any) => {
            if (!mounted) return;
            
            const code = result.codeResult.code;
            if (code && code.length >= 8) {
              console.log('Code détecté:', code);
              
              // Vibration si supportée
              if ('vibrate' in navigator) {
                navigator.vibrate(100);
              }
              
              cleanup();
              onScanSuccess(code);
            }
          });

          Quagga.start();
          isQuaggaStarted = true;
          setIsScanning(true);
          setIsLoading(false);
        });

      } catch (error: any) {
        if (!mounted) return;
        
        console.error('Erreur caméra:', error);
        let errorMessage = 'Erreur d\'accès à la caméra';
        
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Autorisation caméra refusée';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'Aucune caméra trouvée';
        }
        
        setError(errorMessage);
        setIsLoading(false);
      }
    };

    const cleanup = () => {
      if (isQuaggaStarted) {
        try {
          Quagga.stop();
          isQuaggaStarted = false;
        } catch (e) {
          console.log('Erreur lors de l\'arrêt:', e);
        }
      }
    };

    initCamera();

    return () => {
      mounted = false;
      cleanup();
    };
  }, [onScanSuccess, isMobile]);

  const handleClose = () => {
    onClose();
  };

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <Card className={`w-full ${isMobile ? 'max-w-sm' : 'max-w-lg'} bg-card`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2 text-card-foreground">
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
          {error ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
              <AlertTriangle className="h-12 w-12 text-destructive" />
              <div className="space-y-2">
                <p className="font-medium text-destructive">Erreur</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <Button onClick={handleRetry} variant="outline">
                Réessayer
              </Button>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Initialisation du scanner...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <div 
                  ref={scannerRef}
                  className={`${isMobile ? 'w-full h-48' : 'w-96 h-64'} mx-auto rounded-lg overflow-hidden bg-black`}
                />
                
                {isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="border-2 border-primary border-dashed rounded-lg w-4/5 h-16 animate-pulse" />
                  </div>
                )}
              </div>
              
              {isScanning && (
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Pointez la caméra vers le code-barres
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Distance recommandée: 15-25cm
                  </p>
                </div>
              )}
              
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleClose}
              >
                Fermer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BarcodeScanner;