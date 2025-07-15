// Format price from cents to IDR
export const formatPrice = (priceInCents: number): string => {
  const price = priceInCents / 100;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

// Format date
export const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateString));
};

// Get service type display name
export const getServiceTypeName = (serviceType: string): string => {
  const serviceTypeNames: Record<string, string> = {
    graphic_design: 'Desain Grafis',
    article_writing: 'Penulisan Artikel',
    translation: 'Penerjemahan',
    video_editing: 'Edit Video',
    website_development: 'Pembuatan Website',
  };
  return serviceTypeNames[serviceType] || serviceType;
};

// Get status badge color
export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

// Get status display name
export const getStatusName = (status: string): string => {
  const statusNames: Record<string, string> = {
    new: 'Baru',
    in_progress: 'Diproses',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
  };
  return statusNames[status] || status;
};