
import { Product, User, Order } from '../types';

export const demoProducts: Product[] = [
  { id: '1', name: 'Tube PER nu 12x1.1', reference: 'PER-12-NU', unit: 'Rouleau 240m' },
  { id: '2', name: 'Tube PER nu 16x1.5', reference: 'PER-16-NU', unit: 'Rouleau 240m' },
  { id: '3', name: 'Tube PER nu 20x1.9', reference: 'PER-20-NU', unit: 'Rouleau 120m' },
  { id: '4', name: 'Tube Multicouche 16x2', reference: 'MULTI-16', unit: 'Rouleau 100m' },
  { id: '5', name: 'Tube Multicouche 20x2', reference: 'MULTI-20', unit: 'Rouleau 50m' },
  { id: '6', name: 'Té égal PER 16', reference: 'TE-16-16-16', unit: 'Pièce' },
  { id: '7', name: 'Té réduit PER 20/16/20', reference: 'TE-20-16-20', unit: 'Pièce' },
  { id: '8', name: 'Raccord à compression PER 16', reference: 'RAC-PER-16', unit: 'Pièce' },
  { id: '9', name: 'Raccord à compression PER 20', reference: 'RAC-PER-20', unit: 'Pièce' },
  { id: '10', name: 'Vanne à sphère 1/2"', reference: 'VAS-1/2', unit: 'Pièce' },
  { id: '11', name: 'Vanne à sphère 3/4"', reference: 'VAS-3/4', unit: 'Pièce' },
  { id: '12', name: 'Collecteur 3 départs', reference: 'COL-3D', unit: 'Pièce' },
  { id: '13', name: 'Collecteur 4 départs', reference: 'COL-4D', unit: 'Pièce' },
  { id: '14', name: 'Robinet thermostatique', reference: 'ROB-THERM', unit: 'Pièce' },
  { id: '15', name: 'Tête thermostatique', reference: 'TETE-THERM', unit: 'Pièce' },
  { id: '16', name: 'Joint fibre 1/2"', reference: 'JOINT-1/2', unit: 'Sachet 10' },
  { id: '17', name: 'Joint fibre 3/4"', reference: 'JOINT-3/4', unit: 'Sachet 10' },
  { id: '18', name: 'Joint fibre 1"', reference: 'JOINT-1', unit: 'Sachet 10' },
  { id: '19', name: 'Filasse', reference: 'FILASSE', unit: 'Pelote 80g' },
  { id: '20', name: 'Pâte à joint', reference: 'PATE-JOINT', unit: 'Pot 400g' },
];

export const demoUsers: User[] = [
  { id: '1', username: 'dupont', password: 'test123', name: 'Jean Dupont', role: 'worker' },
  { id: '2', username: 'martin', password: 'test123', name: 'Sophie Martin', role: 'worker' },
  { id: '3', username: 'bernard', password: 'test123', name: 'Pierre Bernard', role: 'worker' },
  { id: '4', username: 'admin', password: 'admin123', name: 'Administrateur', role: 'admin' },
];

export const demoOrders: Order[] = [
  {
    id: '1',
    userId: '1',
    userName: 'Jean Dupont',
    date: '2025-04-14',
    items: [
      { ...demoProducts[0], quantity: 1 },
      { ...demoProducts[5], quantity: 10 },
      { ...demoProducts[7], quantity: 5 }
    ],
    status: 'completed'
  },
  {
    id: '2',
    userId: '2',
    userName: 'Sophie Martin',
    date: '2025-04-15',
    items: [
      { ...demoProducts[3], quantity: 2 },
      { ...demoProducts[10], quantity: 3 }
    ],
    status: 'pending'
  }
];
