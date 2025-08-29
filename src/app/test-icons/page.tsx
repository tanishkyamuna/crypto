'use client';

import {
  HomeIconCustom,
  HomeIconOutlineCustom,
  CoinsIconCustom,
  CoinsIconOutlineCustom,
  SignalsIconCustom,
  SignalsIconOutlineCustom,
  CPAIconCustom,
  CPAIconOutlineCustom,
  AccountIconCustom,
  AccountIconOutlineCustom
} from '@/components/icons/CustomIcons';

export default function TestIconsPage() {
  const icons = [
    { name: 'Home', filled: HomeIconCustom, outline: HomeIconOutlineCustom },
    { name: 'Coins', filled: CoinsIconCustom, outline: CoinsIconOutlineCustom },
    { name: 'Signals', filled: SignalsIconCustom, outline: SignalsIconOutlineCustom },
    { name: 'CPA', filled: CPAIconCustom, outline: CPAIconOutlineCustom },
    { name: 'Account', filled: AccountIconCustom, outline: AccountIconOutlineCustom },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Icon Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {icons.map((icon) => (
            <div key={icon.name} className="bg-white rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">{icon.name}</h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600 w-16">Filled:</span>
                  <icon.filled className="h-6 w-6 text-blue-600" />
                  <icon.filled className="h-8 w-8 text-green-600" />
                  <icon.filled className="h-10 w-10 text-purple-600" />
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600 w-16">Outline:</span>
                  <icon.outline className="h-6 w-6 text-blue-600" />
                  <icon.outline className="h-8 w-8 text-green-600" />
                  <icon.outline className="h-10 w-10 text-purple-600" />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 bg-white rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Navigation Preview</h2>
          <div className="flex justify-around bg-gray-900 rounded-lg p-4">
            {icons.map((icon, index) => (
              <div key={icon.name} className="flex flex-col items-center">
                <icon.outline className="h-6 w-6 text-gray-400 mb-1" />
                <span className="text-xs text-gray-400">{icon.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
