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
  MessageSquare
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
  const { 
    smsButtonEnabled, 
    emailNotificationsEnabled, 
    senderEmail,
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
    senderEmail: 'magasinier@example.com'
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
      senderEmail: senderEmail
    });
  }, [smsButtonEnabled, emailNotificationsEnabled, senderEmail]);

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
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-destructive" />
        <h1 className="text-3xl font-bold">Administration Système</h1>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Utilisateurs
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Base de données
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Paramètres
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Sécurité
          </TabsTrigger>
        </TabsList>

        {/* Onglet 1: Gestion des utilisateurs */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <CardTitle>🔹 Gestion des utilisateurs</CardTitle>
                </div>
                <div className="flex items-center gap-4">
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-48">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filtrer par rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les rôles</SelectItem>
                      <SelectItem value="ouvrier">Ouvriers</SelectItem>
                      <SelectItem value="magasinier">Magasiniers</SelectItem>
                      <SelectItem value="administrateur">Administrateurs</SelectItem>
                    </SelectContent>
                  </Select>
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Nouvel Utilisateur
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
                        <DialogDescription>
                          Remplissez les informations pour créer un nouveau compte utilisateur.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="email@exemple.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="nom">Nom</Label>
                          <Input
                            id="nom"
                            value={formData.nom}
                            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                            placeholder="Nom complet"
                          />
                        </div>
                        <div>
                          <Label htmlFor="password">Mot de passe</Label>
                          <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="Mot de passe temporaire"
                          />
                        </div>
                        <div>
                          <Label htmlFor="role">Rôle</Label>
                          <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ouvrier">Ouvrier</SelectItem>
                              <SelectItem value="magasinier">Magasinier</SelectItem>
                              <SelectItem value="administrateur">Administrateur</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                          Annuler
                        </Button>
                        <Button onClick={handleCreateUser}>
                          Créer
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Chargement...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Dernière connexion</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.nom}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {getRoleLabel(user.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Jamais'}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setFormData({ ...formData, password: '' });
                                setIsResetPasswordDialogOpen(true);
                              }}
                              title="Réinitialiser le mot de passe"
                            >
                              <Key className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(user)}
                              title="Modifier l'utilisateur"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                              title="Supprimer l'utilisateur"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet 2: Connexion et données Supabase */}
        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                🔹 Connexion et données Supabase
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Paramètres de connexion</h3>
                <div className="space-y-4">
                  <div>
                    <Label>URL Supabase</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        type={showSupabaseCredentials ? "text" : "password"}
                        value="https://rmwojbenogfywrwanhpk.supabase.co"
                        disabled
                        className="bg-muted"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowSupabaseCredentials(!showSupabaseCredentials)}
                      >
                        {showSupabaseCredentials ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>Clé API</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        type={showSupabaseCredentials ? "text" : "password"}
                        value="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                        disabled
                        className="bg-muted"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowSupabaseCredentials(!showSupabaseCredentials)}
                      >
                        {showSupabaseCredentials ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button 
                      onClick={testConnection}
                      disabled={connectionStatus === 'testing'}
                      className="flex items-center gap-2"
                    >
                      {connectionStatus === 'testing' ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : connectionStatus === 'success' ? (
                        <Check className="w-4 h-4" />
                      ) : connectionStatus === 'error' ? (
                        <X className="w-4 h-4" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      Test de connexion
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Modifier les paramètres
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-4">Statut des tables</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tableStats.map((table) => (
                    <Card key={table.name}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium capitalize">{table.name}</h4>
                            <p className="text-sm text-muted-foreground">{table.count} entrées</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Dernière modification</p>
                            <p className="text-sm font-medium">{table.lastModified}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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
                    <div>
                      <Label htmlFor="sender-email">Email d'envoi automatique du magasinier</Label>
                      <Input
                        id="sender-email"
                        type="email"
                        value={localSettings.senderEmail}
                        onChange={(e) => setLocalSettings({ ...localSettings, senderEmail: e.target.value })}
                        placeholder="magasinier@exemple.com"
                        className="mt-2"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-enabled">Activer les notifications par email</Label>
                        <p className="text-sm text-muted-foreground">
                          Les emails seront envoyés automatiquement lors de certaines actions
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
                        {localSettings.emailEnabled ? 'Les notifications par email sont activées' : 'Les notifications par email sont désactivées'}
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

        {/* Onglet 4: Sécurité & activité */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  🔹 Journal d'activité
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <Activity className="w-4 h-4 mt-1 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{log.action}</span>
                          <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{log.details}</p>
                        <p className="text-xs text-muted-foreground">Par: {log.user}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  <Download className="w-4 h-4 mr-2" />
                  Exporter le journal
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  🔹 Paramètres de sécurité
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="session-duration">Durée de session (heures)</Label>
                  <Input
                    id="session-duration"
                    type="number"
                    value={securitySettings.sessionDuration}
                    onChange={(e) => setSecuritySettings({ 
                      ...securitySettings, 
                      sessionDuration: parseInt(e.target.value) || 24 
                    })}
                    min="1"
                    max="168"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="confirm-deletion">Confirmation de suppression</Label>
                    <p className="text-sm text-muted-foreground">
                      Demander une confirmation avant toute suppression
                    </p>
                  </div>
                  <Switch
                    id="confirm-deletion"
                    checked={securitySettings.confirmDeletion}
                    onCheckedChange={(checked) => setSecuritySettings({ 
                      ...securitySettings, 
                      confirmDeletion: checked 
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="advanced-security">Sécurité avancée</Label>
                    <p className="text-sm text-muted-foreground">
                      Activer les contrôles de sécurité renforcés
                    </p>
                  </div>
                  <Switch
                    id="advanced-security"
                    checked={securitySettings.advancedSecurity}
                    onCheckedChange={(checked) => setSecuritySettings({ 
                      ...securitySettings, 
                      advancedSecurity: checked 
                    })}
                  />
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Rôles et permissions</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">Ouvrier</span>
                      <Badge variant="secondary">Lecture catalogue, Créer commandes</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">Magasinier</span>
                      <Badge variant="default">Gestion commandes, Catalogue</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">Administrateur</span>
                      <Badge variant="destructive">Accès complet</Badge>
                    </div>
                  </div>
                </div>

                <Button className="w-full flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Sauvegarder les paramètres
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'utilisateur.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                disabled
                className="bg-muted"
              />
            </div>
            <div>
              <Label htmlFor="edit-nom">Nom</Label>
              <Input
                id="edit-nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Nom complet"
              />
            </div>
            <div>
              <Label htmlFor="edit-role">Rôle</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ouvrier">Ouvrier</SelectItem>
                  <SelectItem value="magasinier">Magasinier</SelectItem>
                  <SelectItem value="administrateur">Administrateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateUser}>
              Sauvegarder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
            <DialogDescription>
              Définissez un nouveau mot de passe pour {selectedUser?.nom}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-password">Nouveau mot de passe</Label>
              <Input
                id="new-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Nouveau mot de passe"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetPasswordDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleResetPassword}>
              Réinitialiser
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperAdmin;