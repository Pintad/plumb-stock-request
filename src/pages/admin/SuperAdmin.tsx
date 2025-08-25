import React, { useState, useEffect } from 'react';
import { useAppSettings } from '@/hooks/useAppSettings';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Database, 
  Shield, 
  Mail, 
  Activity, 
  Key, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Check, 
  X, 
  Clock,
  AlertTriangle,
  Filter,
  Download,
  Upload,
  Lock,
  MessageSquare,
  Bell,
  ArrowLeft,
  Scan
} from 'lucide-react';

interface DatabaseUser {
  id: string;
  email: string;
  nom: string;
  role: string;
  last_sign_in_at?: string;
}

interface TableStats {
  name: string;
  count: number;
  lastModified: string;
}

interface ActivityLog {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  details: string;
}

const SuperAdmin: React.FC = () => {
  const navigate = useNavigate();
  const { 
    smsButtonEnabled, 
    emailNotificationsEnabled, 
    senderEmail,
    warehouseNotificationEmailEnabled,
    warehouseNotificationSmsEnabled,
    warehouseEmail,
    warehousePhone,
    catalogScannerEnabled,
    saveAllSettings 
  } = useAppSettings();
  const [users, setUsers] = useState<DatabaseUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<DatabaseUser | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showSupabaseCredentials, setShowSupabaseCredentials] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [tableStats, setTableStats] = useState<TableStats[]>([]);
  const [localSettings, setLocalSettings] = useState({
    smsEnabled: true,
    emailEnabled: true,
    senderEmail: 'magasinier@example.com',
    warehouseNotificationEmailEnabled: false,
    warehouseNotificationSmsEnabled: false,
    warehouseEmail: '',
    warehousePhone: '',
    catalogScannerEnabled: true
  });
  const [securitySettings, setSecuritySettings] = useState({
    sessionDuration: 24,
    confirmDeletion: true,
    advancedSecurity: false
  });
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [formData, setFormData] = useState({
    email: '',
    nom: '',
    role: 'ouvrier',
    password: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
    loadTableStats();
    loadActivityLogs();
  }, []);

  useEffect(() => {
    setLocalSettings({
      smsEnabled: smsButtonEnabled,
      emailEnabled: emailNotificationsEnabled,
      senderEmail: senderEmail,
      warehouseNotificationEmailEnabled: warehouseNotificationEmailEnabled,
      warehouseNotificationSmsEnabled: warehouseNotificationSmsEnabled,
      warehouseEmail: warehouseEmail,
      warehousePhone: warehousePhone,
      catalogScannerEnabled: catalogScannerEnabled
    });
  }, [smsButtonEnabled, emailNotificationsEnabled, senderEmail, warehouseNotificationEmailEnabled, warehouseNotificationSmsEnabled, warehouseEmail, warehousePhone, catalogScannerEnabled]);

  const loadTableStats = async () => {
    try {
      const tables = ['utilisateurs', 'commandes', 'catalogue', 'affaires'] as const;
      const stats: TableStats[] = [];
      
      for (const table of tables) {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (!error) {
          stats.push({
            name: table,
            count: count || 0,
            lastModified: new Date().toLocaleDateString()
          });
        }
      }
      
      setTableStats(stats);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const loadActivityLogs = async () => {
    // Simulation des logs d'activité - à remplacer par une vraie table de logs
    const mockLogs: ActivityLog[] = [
      {
        id: '1',
        user: 'Admin',
        action: 'Création utilisateur',
        timestamp: new Date().toLocaleString(),
        details: 'Nouvel utilisateur ouvrier créé'
      },
      {
        id: '2',
        user: 'Admin',
        action: 'Modification commande',
        timestamp: new Date(Date.now() - 3600000).toLocaleString(),
        details: 'Statut commande mis à jour'
      }
    ];
    setActivityLogs(mockLogs);
  };

  const testConnection = async () => {
    setConnectionStatus('testing');
    try {
      const { data, error } = await supabase.from('utilisateurs').select('count').limit(1);
      if (error) throw error;
      setConnectionStatus('success');
      toast({
        title: "Connexion réussie",
        description: "La connexion à Supabase fonctionne correctement"
      });
    } catch (error) {
      setConnectionStatus('error');
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: "Impossible de se connecter à Supabase"
      });
    }
    setTimeout(() => setConnectionStatus('idle'), 3000);
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;
    
    try {
      const { error } = await supabase.auth.admin.updateUserById(
        selectedUser.id,
        { password: formData.password }
      );

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Mot de passe réinitialisé avec succès"
      });

      setIsResetPasswordDialogOpen(false);
      setFormData({ email: '', nom: '', role: 'ouvrier', password: '' });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de réinitialiser le mot de passe"
      });
    }
  };

  const filteredUsers = users.filter(user => 
    roleFilter === 'all' || user.role === roleFilter
  );

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('utilisateurs')
        .select('*')
        .order('nom');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les utilisateurs"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!formData.email || !formData.nom || !formData.password) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Tous les champs sont requis"
      });
      return;
    }

    try {
      // Créer l'utilisateur dans Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true
      });

      if (authError) throw authError;

      // Créer l'entrée dans la table utilisateurs
      const { error: dbError } = await supabase
        .from('utilisateurs')
        .insert({
          id: authData.user.id,
          email: formData.email,
          nom: formData.nom,
          role: formData.role
        });

      if (dbError) throw dbError;

      toast({
        title: "Succès",
        description: "Utilisateur créé avec succès"
      });

      setIsCreateDialogOpen(false);
      setFormData({ email: '', nom: '', role: 'ouvrier', password: '' });
      loadUsers();
    } catch (error: any) {
      console.error('Erreur lors de la création:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de créer l'utilisateur"
      });
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser || !formData.nom) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Nom requis"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('utilisateurs')
        .update({
          nom: formData.nom,
          role: formData.role
        })
        .eq('id', selectedUser.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Utilisateur mis à jour avec succès"
      });

      setIsEditDialogOpen(false);
      setSelectedUser(null);
      setFormData({ email: '', nom: '', role: 'ouvrier', password: '' });
      loadUsers();
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour l'utilisateur"
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }

    try {
      // Supprimer de la table utilisateurs
      const { error: dbError } = await supabase
        .from('utilisateurs')
        .delete()
        .eq('id', userId);

      if (dbError) throw dbError;

      // Supprimer de Supabase Auth
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      if (authError) {
        console.warn('Avertissement: Impossible de supprimer de Auth:', authError);
      }

      toast({
        title: "Succès",
        description: "Utilisateur supprimé avec succès"
      });

      loadUsers();
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de supprimer l'utilisateur"
      });
    }
  };

  const openEditDialog = (user: DatabaseUser) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      nom: user.nom,
      role: user.role,
      password: ''
    });
    setIsEditDialogOpen(true);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'administrateur': return 'destructive';
      case 'magasinier': return 'default';
      default: return 'secondary';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'administrateur': return 'Administrateur';
      case 'magasinier': return 'Magasinier';
      case 'ouvrier': return 'Ouvrier';
      default: return role;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-destructive" />
          <h1 className="text-3xl font-bold">Administration Système</h1>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l'application
        </Button>
      </div>

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Paramètres
          </TabsTrigger>
        </TabsList>



        {/* Onglet 3: Paramètres de l'application */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                🔹 Paramètres de l'application
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Configuration des notifications
                </h3>
                <div className="space-y-6">
                  {/* Configuration email */}
                  <div className="space-y-4 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-enabled">Activer les notifications par email</Label>
                        <p className="text-sm text-muted-foreground">
                          Afficher le bouton d'envoi d'email dans les détails des commandes
                        </p>
                      </div>
                      <Switch
                        id="email-enabled"
                        checked={localSettings.emailEnabled}
                        onCheckedChange={(checked) => setLocalSettings({ ...localSettings, emailEnabled: checked })}
                      />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span>
                        {localSettings.emailEnabled ? 'Les utilisateurs peuvent envoyer des emails' : 'Les notifications email sont désactivées'}
                      </span>
                    </div>
                  </div>

                  {/* Configuration SMS */}
                  <div className="space-y-4 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="sms-enabled">Activer les notifications par SMS</Label>
                        <p className="text-sm text-muted-foreground">
                          Afficher le bouton d'envoi de SMS dans les détails des commandes
                        </p>
                      </div>
                      <Switch
                        id="sms-enabled"
                        checked={localSettings.smsEnabled}
                        onCheckedChange={(checked) => setLocalSettings({ ...localSettings, smsEnabled: checked })}
                      />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MessageSquare className="w-4 h-4" />
                      <span>
                        {localSettings.smsEnabled ? 'Les utilisateurs peuvent envoyer des SMS' : 'Les notifications SMS sont désactivées'}
                      </span>
                    </div>
                  </div>

                  {/* Configuration des notifications pour nouvelles commandes */}
                  <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
                    <h4 className="font-medium flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      Notifications de nouvelles commandes au magasinier
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="warehouse-email">Email du magasinier</Label>
                        <Input
                          id="warehouse-email"
                          type="email"
                          value={localSettings.warehouseEmail}
                          onChange={(e) => setLocalSettings({ ...localSettings, warehouseEmail: e.target.value })}
                          placeholder="magasinier@exemple.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="warehouse-phone">Téléphone du magasinier</Label>
                        <Input
                          id="warehouse-phone"
                          type="tel"
                          value={localSettings.warehousePhone}
                          onChange={(e) => setLocalSettings({ ...localSettings, warehousePhone: e.target.value })}
                          placeholder="+33123456789"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <Label htmlFor="warehouse-email-enabled">Notification par email</Label>
                          <p className="text-sm text-muted-foreground">
                            Envoyer un email lors de nouvelles commandes
                          </p>
                        </div>
                        <Switch
                          id="warehouse-email-enabled"
                          checked={localSettings.warehouseNotificationEmailEnabled}
                          onCheckedChange={(checked) => setLocalSettings({ ...localSettings, warehouseNotificationEmailEnabled: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <Label htmlFor="warehouse-sms-enabled">Notification par SMS</Label>
                          <p className="text-sm text-muted-foreground">
                            Envoyer un SMS lors de nouvelles commandes
                          </p>
                        </div>
                        <Switch
                          id="warehouse-sms-enabled"
                          checked={localSettings.warehouseNotificationSmsEnabled}
                          onCheckedChange={(checked) => setLocalSettings({ ...localSettings, warehouseNotificationSmsEnabled: checked })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Configuration du scanner du catalogue */}
                  <div className="space-y-4 p-4 border rounded-lg bg-green-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="catalog-scanner-enabled" className="flex items-center gap-2">
                          <Scan className="w-4 h-4" />
                          Activer le scanner du catalogue
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Permettre aux magasiniers d'utiliser le scanner de codes-barres
                        </p>
                      </div>
                      <Switch
                        id="catalog-scanner-enabled"
                        checked={localSettings.catalogScannerEnabled}
                        onCheckedChange={(checked) => setLocalSettings({ ...localSettings, catalogScannerEnabled: checked })}
                      />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Scan className="w-4 h-4" />
                      <span>
                        {localSettings.catalogScannerEnabled ? 'Le scanner est activé pour les magasiniers' : 'Le scanner est désactivé'}
                      </span>
                    </div>
                  </div>

                  {/* Bouton de sauvegarde centralisé */}
                  <div className="pt-4 border-t">
                    <Button 
                      onClick={() => saveAllSettings(localSettings)}
                      className="w-full flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Sauvegarder la configuration
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

    </div>
  );
};

export default SuperAdmin;