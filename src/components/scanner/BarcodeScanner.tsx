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
  const isMobile = useIsMobile();

  const stopScanner = useCallback(() => {
    try {
      if (typeof Quagga !== 'undefined' && Quagga.initialized) {
        Quagga.stop();
        console.log('Scanner arrêté');
      }
    } catch (error) {
      console.log('Erreur lors de l\'arrêt du scanner:', error);
    }
  }, []);

  const initScanner = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Vérifier le support des médias
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Votre navigateur ne supporte pas l\'accès à la caméra');
      }

      // Vérifier que l'élément DOM existe
      if (!scannerRef.current) {
        throw new Error('Element DOM scanner non disponible');
      }

      // Vérifier les permissions caméra de façon plus robuste
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: { ideal: "environment" },
            width: { ideal: isMobile ? 640 : 800 },
            height: { ideal: isMobile ? 480 : 600 }
          } 
        });
        
        // Vérifier que le stream a des tracks vidéo
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

      // Configuration QuaggaJS améliorée
      const config = {
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: scannerRef.current,
          constraints: {
            width: { min: 320, ideal: isMobile ? 640 : 800, max: 1920 },
            height: { min: 240, ideal: isMobile ? 480 : 600, max: 1080 },
            facingMode: "environment",
            aspectRatio: { ideal: 4/3 }
          },
          area: { // Zone de scan définie
            top: "20%",
            right: "20%", 
            left: "20%",
            bottom: "20%"
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
          ],
          debug: {
            showCanvas: false,
            showPatches: false,
            showFoundPatches: false,
            showSkeleton: false,
            showLabels: false,
            showPatchLabels: false,
            showRemainingPatchLabels: false,
            boxFromPatches: {
              showTransformed: false,
              showTransformedBox: false,
              showBB: false
            }
          }
        },
        locator: {
          patchSize: "medium",
          halfSample: true
        },
        numOfWorkers: navigator.hardwareConcurrency || 2,
        frequency: 10,
        locate: true
      };

      console.log('Initialisation QuaggaJS avec config:', config);

      // Arrêter tout scanner existant avant d'en créer un nouveau
      stopScanner();

      // Initialiser QuaggaJS avec une promesse pour meilleur contrôle d'erreur
      await new Promise<void>((resolve, reject) => {
        Quagga.init(config, (err: any) => {
          if (err) {
            console.error('Erreur QuaggaJS init:', err);
            reject(new Error(`Erreur d'initialisation du scanner: ${err.message || err}`));
            return;
          }
          
          console.log('QuaggaJS initialisé avec succès');
          resolve();
        });
      });
      
      // Handler de détection avec debouncing
      let lastScan = 0;
      const scanCooldown = 1000; // 1 seconde entre les scans
      
      Quagga.onDetected((result: any) => {
        const now = Date.now();
        if (now - lastScan < scanCooldown) {
          return; // Ignorer si trop récent
        }
        lastScan = now;
        
        const code = result.codeResult.code;
        console.log('Code détecté:', code);
        
        // Validation du code (longueur minimale)
        if (code && code.length >= 8) {
          // Vibration tactile
          if ('vibrate' in navigator) {
            navigator.vibrate(100);
          }
          
          // Arrêter et nettoyer
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
  }, [scanMode, isMobile, onScanSuccess, stopScanner]);

  useEffect(() => {
    // Délai pour s'assurer que le DOM est prêt
    const timer = setTimeout(initScanner, 300);

    return () => {
      clearTimeout(timer);
      stopScanner();
    };
  }, [initScanner, stopScanner]);

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  const toggleScanMode = () => {
    setScanMode(prev => prev === 'fast' ? 'precise' : 'fast');
  };

  const retry = () => {
    setError(null);
    initScanner();
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
                  <p className="font-medium text-destructive">Erreur d'accès caméra</p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
                <div className="space-y-2">
                  <Button onClick={retry} variant="outline">
                    Réessayer
                  </Button>
                  {error.includes('Permission') && (
                    <p className="text-xs text-muted-foreground">
                      💡 Astuce: Actualisez la page et autorisez l'accès caméra
                    </p>
                  )}
                </div>
              </div>
            ) : isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Initialisation du scanner...</p>
                <p className="text-xs text-muted-foreground">
                  Autorisation caméra requise
                </p>
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