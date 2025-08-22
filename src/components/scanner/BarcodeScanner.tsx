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
    console.log('🔄 BarcodeScanner useEffect - Début');
    let mounted = true;
    let isQuaggaStarted = false;

    // Attendre un tick pour s'assurer que le DOM est prêt
    const initWithDelay = () => {
      setTimeout(async () => {
        console.log('📹 initCamera - Début (après timeout)');
        if (!mounted) {
          console.log('❌ initCamera - Component non monté');
          return;
        }

        if (!scannerRef.current) {
          console.log('❌ scannerRef.current null, nouvelle tentative dans 200ms');
          setTimeout(initWithDelay, 200);
          return;
        }

        try {
          console.log('⏳ Mise à jour états - isLoading: true, error: null');
          setIsLoading(true);
          setError(null);

          console.log('🔍 Vérification navigator.mediaDevices...');
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('navigator.mediaDevices non supporté');
          }
          console.log('✅ navigator.mediaDevices disponible');

          console.log('🎥 Test permissions caméra...');
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
          });
          console.log('✅ Permissions caméra accordées');
          
          stream.getTracks().forEach(track => track.stop());
          console.log('✅ Stream fermé');

          console.log('✅ scannerRef.current disponible:', scannerRef.current);

          console.log('⚙️ Configuration QuaggaJS...');
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
          console.log('✅ Config QuaggaJS créée');

          console.log('🚀 Quagga.init...');
          Quagga.init(config, (err: any) => {
            console.log('📥 Quagga.init callback appelé');
            if (!mounted) {
              console.log('❌ Component non monté dans callback');
              return;
            }

            if (err) {
              console.error('❌ Erreur QuaggaJS init:', err);
              setError('Impossible d\'initialiser le scanner: ' + (err.message || err));
              setIsLoading(false);
              return;
            }

            console.log('✅ QuaggaJS initialisé avec succès');

            console.log('🎯 Configuration onDetected...');
            Quagga.onDetected((result: any) => {
              if (!mounted) return;
              
              const code = result.codeResult.code;
              console.log('🔍 Code détecté:', code);
              
              if (code && code.length >= 8) {
                console.log('✅ Code valide, longueur:', code.length);
                
                if ('vibrate' in navigator) {
                  navigator.vibrate(100);
                }
                
                cleanup();
                onScanSuccess(code);
              }
            });

            console.log('🚀 Quagga.start...');
            Quagga.start();
            isQuaggaStarted = true;
            setIsScanning(true);
            setIsLoading(false);
            console.log('✅ Scanner démarré avec succès');
          });

        } catch (error: any) {
          if (!mounted) {
            console.log('❌ Erreur mais component non monté');
            return;
          }
          
          console.error('❌ Erreur caméra:', error);
          let errorMessage = 'Erreur d\'accès à la caméra';
          
          if (error.name === 'NotAllowedError') {
            errorMessage = 'Autorisation caméra refusée';
          } else if (error.name === 'NotFoundError') {
            errorMessage = 'Aucune caméra trouvée';
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          setError(errorMessage);
          setIsLoading(false);
        }
      }, 100);
    };

    const cleanup = () => {
      console.log('🧹 Cleanup appelé');
      if (isQuaggaStarted) {
        try {
          console.log('🛑 Arrêt Quagga...');
          Quagga.stop();
          isQuaggaStarted = false;
          console.log('✅ Quagga arrêté');
        } catch (e) {
          console.log('❌ Erreur lors de l\'arrêt:', e);
        }
      }
    };

    console.log('🚀 Lancement initWithDelay...');
    initWithDelay();

    return () => {
      console.log('🧹 Cleanup useEffect');
      mounted = false;
      cleanup();
    };
  }, []); // Supprimer les dépendances pour éviter les re-lancements

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
          {/* Toujours rendre le div du scanner, mais le cacher si nécessaire */}
          <div 
            ref={scannerRef}
            className={`${isMobile ? 'w-full h-48' : 'w-96 h-64'} mx-auto rounded-lg overflow-hidden bg-black ${(error || isLoading) ? 'hidden' : ''}`}
          />

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