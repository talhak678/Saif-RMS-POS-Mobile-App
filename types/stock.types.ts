export interface IBranch {
  id: string;
  name: string;
}

export interface IStock {
  id: string;
  quantity: number;
  updatedAt: string;
  ingredientId: string;
  ingredient: {
    name: string;
    unit: string;
  };
  branch?: { name: string };
}

export interface IStockForm {
  ingredientId: string;
  quantity: string;
}

export const getStockStatus = (quantity: number) => {
  if (quantity <= 0)  return { color: '#ef4444', bg: '#fee2e2', label: 'Out of Stock' };
  if (quantity < 10)  return { color: '#f59e0b', bg: '#fef3c7', label: 'Low Stock'    };
  if (quantity < 25)  return { color: '#d97706', bg: '#fef9c3', label: 'Moderate'     };
  return               { color: '#10b981', bg: '#d1fae5', label: 'Healthy'     };
};
