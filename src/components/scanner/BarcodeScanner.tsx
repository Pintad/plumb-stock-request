import React, { useEffect, useRef, useState } from 'react';
import Quagga from 'quagga';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Camera, Zap, Target, Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface BarcodeScannerProps {
  onScanSuccess: (barcode: string) => void;
  onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScanSuccess, onClose }) => {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMode, setScanMode] = useState<'fast' | 'precise'>('fast');
  const isMobile = useIsMobile();

  useEffect(() => {
    const initScanner = async () => {
      try {
        setIsLoading(true);

        // Configuration QuaggaJS optimisée
        const config = {
          inputStream: {
            name: "Live",
            type: "LiveStream",
            target: scannerRef.current,
            constraints: {
              width: isMobile ? 480 : 640,
              height: isMobile ? 320 : 480,
              facingMode: "environment",
              aspectRatio: isMobile ? 1.5 : 1.33
            },
            area: { // Zone de scan optimisée pour codes-barres
              top: "25%",
              right: "10%", 
              left: "10%",
              bottom: "25%"
            }
          },
          decoder: {
            readers: scanMode === 'fast' ? [
              "code_128_reader", // Le plus commun
              "ean_reader"       // Codes produits
            ] : [
              "code_128_reader",
              "ean_reader", 
              "ean_8_reader",
              "code_39_reader",
              "code_39_vin_reader",
              "codabar_reader",
              "upc_reader",
              "upc_e_reader",
              "i2of5_reader"
            ]
          },
          locator: {
            patchSize: scanMode === 'precise' ? "large" : "medium",
            halfSample: scanMode === 'fast'
          },
          frequency: scanMode === 'precise' ? 5 : 10,
          debug: false
        };

        // Initialiser QuaggaJS
        await new Promise((resolve, reject) => {
          Quagga.init(config, (err: any) => {
            if (err) {
              console.error('Erreur QuaggaJS:', err);
              reject(err);
              return;
            }
            resolve(null);
          });
        });

        // Handler de succès
        const onDetected = (result: any) => {
          const code = result.codeResult.code;
          console.log('Code détecté:', code);
          
          // Vibration tactile sur mobile
          if ('vibrate' in navigator) {
            navigator.vibrate(100);
          }
          
          Quagga.stop();
          onScanSuccess(code);
        };

        Quagga.onDetected(onDetected);
        Quagga.start();
        setIsScanning(true);
        setIsLoading(false);

      } catch (error) {
        console.error('Erreur initialisation scanner:', error);
        setIsLoading(false);
      }
    };

    initScanner();

    return () => {
      if (Quagga) {
        Quagga.stop();
        Quagga.offDetected();
      }
    };
  }, [onScanSuccess, scanMode, isMobile]);

  const handleClose = () => {
    if (Quagga) {
      Quagga.stop();
      Quagga.offDetected();
    }
    onClose();
  };

  const toggleScanMode = () => {
    setScanMode(prev => prev === 'fast' ? 'precise' : 'fast');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className={`w-full ${isMobile ? 'max-w-sm' : 'max-w-lg'} bg-background`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Scanner Code-barres
            {scanMode === 'precise' && <Zap className="h-4 w-4 text-amber-500" />}
            {scanMode === 'fast' && <Target className="h-4 w-4 text-green-500" />}
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
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Initialisation du scanner...</p>
              </div>
            ) : (
              <>
                <div className="relative">
                  <div 
                    ref={scannerRef}
                    className={`${isMobile ? 'w-full h-48' : 'w-96 h-64'} mx-auto rounded-lg overflow-hidden bg-black relative`}
                  />
                  
                  {/* Zone de scan overlay */}
                  {isScanning && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="border-2 border-primary border-dashed rounded-lg w-4/5 h-16 animate-pulse bg-primary/10" />
                    </div>
                  )}
                </div>
                
                {isScanning && (
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {scanMode === 'precise' 
                        ? "🎯 Mode précision - Détection améliorée tous formats"
                        : "⚡ Mode rapide - Formats courants uniquement"
                      }
                    </p>
                    <p className="text-xs text-muted-foreground">
                      📐 Distance: 15-25cm • 💡 Éclairage uniforme • 📱 Tenez stable
                    </p>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button 
                    variant={scanMode === 'precise' ? 'default' : 'outline'}
                    className="flex-1" 
                    onClick={toggleScanMode}
                    disabled={isLoading}
                  >
                    {scanMode === 'fast' ? <Target className="h-4 w-4 mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
                    {scanMode === 'precise' ? 'Précision ON' : 'Mode Rapide'}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    onClick={handleClose}
                  >
                    Fermer
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BarcodeScanner;