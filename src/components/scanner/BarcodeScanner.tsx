import React, { useEffect, useRef, useState, useCallback } from 'react';
import Quagga from 'quagga';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Camera, Zap, Target, Loader2, AlertTriangle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface BarcodeScannerProps {
  onScanSuccess: (barcode: string) => void;
  onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScanSuccess, onClose }) => {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanMode, setScanMode] = useState<'fast' | 'precise'>('fast');
  const [domReady, setDomReady] = useState(false);
  const isMobile = useIsMobile();

  // État pour forcer le re-render si nécessaire
  const [renderKey, setRenderKey] = useState(0);

  const stopScanner = useCallback(() => {
    try {
      if (typeof Quagga !== 'undefined') {
        Quagga.stop();
        console.log('Scanner arrêté');
      }
    } catch (error) {
      console.log('Erreur lors de l\'arrêt du scanner:', error);
    }
  }, []);

  // Vérification DOM avec observer
  useEffect(() => {
    const checkDomReady = () => {
      if (scannerRef.current) {
        console.log('Element DOM trouvé:', scannerRef.current);
        setDomReady(true);
        return true;
      }
      return false;
    };

    // Vérification immédiate
    if (checkDomReady()) return;

    // Observer pour détecter quand l'élément est ajouté
    const observer = new MutationObserver(() => {
      if (checkDomReady()) {
        observer.disconnect();
      }
    });

    // Observer le document pour les changements
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Timeout de sécurité
    const timeout = setTimeout(() => {
      observer.disconnect();
      if (!domReady) {
        console.error('DOM non prêt après timeout');
        setError('Interface non initialisée correctement');
        setIsLoading(false);
      }
    }, 3000);

    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, [domReady, renderKey]);

  const initScanner = useCallback(async () => {
    if (!domReady || !scannerRef.current) {
      console.log('DOM pas prêt, attente...');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Vérifier le support des médias
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Votre navigateur ne supporte pas l\'accès à la caméra');
      }

      console.log('Element DOM confirmé:', scannerRef.current);

      // Test des permissions caméra
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: { ideal: "environment" },
            width: { ideal: isMobile ? 640 : 800 },
            height: { ideal: isMobile ? 480 : 600 }
          } 
        });
        
        const videoTracks = stream.getVideoTracks();
        if (videoTracks.length === 0) {
          throw new Error('Aucune caméra disponible');
        }

        // Fermer le stream temporaire
        stream.getTracks().forEach(track => track.stop());
        console.log('Permissions caméra accordées');
        
      } catch (permissionError: any) {
        console.error('Erreur permissions caméra:', permissionError);
        
        let errorMessage = 'Impossible d\'accéder à la caméra';
        if (permissionError.name === 'NotAllowedError') {
          errorMessage = 'Permission caméra refusée. Veuillez autoriser l\'accès dans votre navigateur.';
        } else if (permissionError.name === 'NotFoundError') {
          errorMessage = 'Aucune caméra trouvée sur cet appareil.';
        } else if (permissionError.name === 'NotReadableError') {
          errorMessage = 'Caméra occupée par une autre application.';
        }
        
        throw new Error(errorMessage);
      }

      // Arrêter tout scanner existant
      stopScanner();

      // Configuration QuaggaJS
      const config = {
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: scannerRef.current,
          constraints: {
            width: { min: 320, ideal: isMobile ? 640 : 800, max: 1920 },
            height: { min: 240, ideal: isMobile ? 480 : 600, max: 1080 },
            facingMode: "environment"
          }
        },
        decoder: {
          readers: scanMode === 'fast' ? [
            "code_128_reader",
            "ean_reader",
            "code_39_reader"
          ] : [
            "code_128_reader",
            "ean_reader", 
            "ean_8_reader",
            "code_39_reader",
            "code_39_vin_reader",
            "codabar_reader",
            "upc_reader",
            "upc_e_reader"
          ]
        },
        locate: true,
        frequency: 10
      };

      console.log('Initialisation QuaggaJS...');

      // Promisifier l'initialisation
      await new Promise<void>((resolve, reject) => {
        Quagga.init(config, (err: any) => {
          if (err) {
            console.error('Erreur QuaggaJS init:', err);
            reject(new Error(`Erreur d'initialisation: ${err.message || err}`));
            return;
          }
          
          console.log('QuaggaJS initialisé avec succès');
          resolve();
        });
      });
      
      // Handler de détection
      let lastScan = 0;
      const scanCooldown = 1000;
      
      Quagga.onDetected((result: any) => {
        const now = Date.now();
        if (now - lastScan < scanCooldown) return;
        lastScan = now;
        
        const code = result.codeResult.code;
        console.log('Code détecté:', code);
        
        if (code && code.length >= 8) {
          if ('vibrate' in navigator) {
            navigator.vibrate(100);
          }
          
          stopScanner();
          onScanSuccess(code);
        }
      });

      Quagga.start();
      setIsScanning(true);
      setIsLoading(false);

    } catch (error: any) {
      console.error('Erreur initialisation scanner:', error);
      setError(error.message || 'Erreur inconnue lors de l\'initialisation');
      setIsLoading(false);
      setIsScanning(false);
    }
  }, [domReady, scanMode, isMobile, onScanSuccess, stopScanner]);

  // Initialisation quand DOM est prêt
  useEffect(() => {
    if (domReady) {
      initScanner();
    }
  }, [domReady, initScanner]);

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  const toggleScanMode = () => {
    setScanMode(prev => prev === 'fast' ? 'precise' : 'fast');
  };

  const retry = () => {
    setError(null);
    setIsLoading(true);
    setDomReady(false);
    // Forcer un re-render complet
    setRenderKey(prev => prev + 1);
  };

  const forceRefresh = () => {
    window.location.reload();
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
            {error ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
                <AlertTriangle className="h-12 w-12 text-destructive" />
                <div className="space-y-2">
                  <p className="font-medium text-destructive">Erreur d'initialisation</p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={retry} variant="outline" size="sm">
                    Réessayer
                  </Button>
                  <Button onClick={forceRefresh} variant="destructive" size="sm">
                    Actualiser
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  💡 En cas de problème persistant, actualisez la page complète
                </p>
              </div>
            ) : isLoading || !domReady ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  {!domReady ? 'Préparation de l\'interface...' : 'Initialisation du scanner...'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {!domReady ? 'Chargement des composants' : 'Autorisation caméra requise'}
                </p>
              </div>
            ) : (
              <>
                <div className="relative">
                  <div 
                    key={renderKey} // Force re-render si nécessaire
                    ref={scannerRef}
                    className={`${isMobile ? 'w-full h-48' : 'w-96 h-64'} mx-auto rounded-lg overflow-hidden bg-black relative`}
                    style={{ minHeight: isMobile ? '192px' : '256px' }} // Assurer la taille
                  />
                  
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
                    disabled={isLoading || !isScanning}
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