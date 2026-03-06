export interface IIngredient {
  id: string;
  name: string;
  unit: string;
  stocks?: { quantity: number }[];
}

export interface IIngredientForm {
  name: string;
  unit: string;
}

// Compute total stock
export const getTotalStock = (ingredient: IIngredient): number => {
  return (ingredient.stocks ?? []).reduce((sum, s) => sum + (s.quantity ?? 0), 0);
};

export const getStockColor = (qty: number) => {
  if (qty <= 0)  return '#ef4444'; // red — out of stock
  if (qty < 10)  return '#f59e0b'; // amber — low stock
  return '#10b981';                // green — healthy
};
