
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="text-center px-4 py-8">
        <div className="flex justify-center mb-8">
          <img 
            src="/lovable-uploads/c40b3b5e-ab31-4815-a5c0-845fdff4a728.png" 
            alt="Pintade Logo" 
            className="h-32 w-auto" 
          />
        </div>
        <h1 className="text-4xl font-bold mb-4 text-gray-800">Bienvenue sur Pintade</h1>
        <p className="text-xl text-gray-600 mb-8">Votre solution de gestion de stock et de commandes pour les chantiers</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/login">
            <Button className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-6 text-lg">
              Connexion
            </Button>
          </Link>
          <Link to="/catalog">
            <Button variant="outline" className="border-amber-500 text-amber-600 hover:bg-amber-50 px-8 py-6 text-lg">
              Parcourir le catalogue
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="w-full max-w-5xl mt-16 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="mb-4 bg-amber-100 inline-flex p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-2">Gestion simplifiée</h3>
            <p className="text-gray-600">Un inventaire à jour et des commandes faciles à gérer</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="mb-4 bg-amber-100 inline-flex p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-2">Gain de temps</h3>
            <p className="text-gray-600">Réduisez les délais de traitement des commandes</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="mb-4 bg-amber-100 inline-flex p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-2">Efficacité maximale</h3>
            <p className="text-gray-600">Optimisez vos approvisionnements de chantier</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
