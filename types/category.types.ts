export interface ICategory {
  id: string;
  name: string;
  description?: string;
  image?: string;
  restaurantId: string;
  createdAt: string;
  _count?: { menuItems: number };
}

export interface ICategoryForm {
  name: string;
  description: string;
  image: string;
}
