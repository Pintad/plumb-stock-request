-- Ajouter le paramètre pour activer/désactiver le scanner du catalogue des magasiniers
INSERT INTO public.app_settings (setting_key, setting_value)
VALUES ('catalog_scanner_enabled', 'true')
ON CONFLICT (setting_key) DO NOTHING;