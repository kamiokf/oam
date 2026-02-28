export const JamaicanRoutes = [
    { id: '1', from: 'Kingston', to: 'Spanish Town', distance: '22 km' },
    { id: '2', from: 'Kingston', to: 'Portmore', distance: '18 km' },
    { id: '3', from: 'Kingston', to: 'Mandeville', distance: '100 km' },
    { id: '4', from: 'Kingston', to: 'Ocho Rios', distance: '85 km' },
    { id: '5', from: 'Kingston', to: 'Montego Bay', distance: '155 km' },
    { id: '6', from: 'Spanish Town', to: 'Linstead', distance: '20 km' },
    { id: '7', from: 'Montego Bay', to: 'Negril', distance: '80 km' },
    { id: '8', from: 'Montego Bay', to: 'Falmouth', distance: '30 km' },
    { id: '9', from: 'Kingston', to: 'Port Antonio', distance: '100 km' },
    { id: '10', from: 'May Pen', to: 'Kingston', distance: '55 km' },
    { id: '11', from: 'Savanna-la-Mar', to: 'Montego Bay', distance: '65 km' },
    { id: '12', from: 'Kingston', to: 'Morant Bay', distance: '60 km' },
];

export const VehicleTypes = [
    'Toyota Hiace',
    'Toyota Coaster',
    'Nissan Caravan',
    'Honda Fit',
    'Toyota Axio',
    'Toyota Fielder',
    'Nissan AD Wagon',
    'Suzuki Swift',
    'Toyota Probox',
    'Honda Civic',
];

export const formatRoute = (from: string, to: string) => `${from} → ${to}`;

export const formatCurrency = (amount: number) =>
    `J$${amount.toLocaleString('en-JM', { minimumFractionDigits: 0 })}`;
