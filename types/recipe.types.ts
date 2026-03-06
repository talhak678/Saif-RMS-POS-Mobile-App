export interface IRecipeItem {
  id: string;
  menuItemId: string;
  quantity: number;
  menuItem?: {
    name: string;
    image?: string;
    price: number;
  };
  ingredient: {
    id: string;
    name: string;
    unit: string;
  };
}

export interface IRecipeGroup {
  menuItemId: string;
  menuItemName: string;
  menuItemImage?: string;
  menuItemPrice: number;
  ingredients: IRecipeItem[];
}

export interface IRecipeForm {
  ingredientId: string;
  quantity: string;
}

import { IMenuItem } from "./menuitem.types";

// Build grouped structure from flat array of recipe items
export const groupRecipes = (items: IRecipeItem[]): IRecipeGroup[] => {
  const map: Record<string, IRecipeGroup> = {};
  items.forEach(item => {
    if (!map[item.menuItemId]) {
      map[item.menuItemId] = {
        menuItemId: item.menuItemId,
        menuItemName: item.menuItem?.name ?? 'Unknown',
        menuItemImage: item.menuItem?.image,
        menuItemPrice: typeof item.menuItem?.price === 'string' ? parseFloat(item.menuItem.price) : (item.menuItem?.price ?? 0),
        ingredients: [],
      };
    }
    map[item.menuItemId].ingredients.push(item);
  });
  return Object.values(map);
};

export const groupAllRecipes = (allDishes: IMenuItem[], recipeItems: IRecipeItem[]): IRecipeGroup[] => {
  const recipeGroups = groupRecipes(recipeItems);
  const groupsMap = new Map(recipeGroups.map(g => [g.menuItemId, g]));

  return allDishes.map(dish => {
    const existing = groupsMap.get(dish.id);
    if (existing) return existing;

    return {
      menuItemId: dish.id,
      menuItemName: dish.name,
      menuItemImage: dish.image,
      menuItemPrice: typeof dish.price === 'string' ? parseFloat(dish.price) : dish.price,
      ingredients: [],
    };
  });
};
