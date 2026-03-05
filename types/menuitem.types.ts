export interface IVariation {
  id?: string;
  name: string;
  price: number;
}

export interface IAddon {
  id?: string;
  name: string;
  price: number;
}

export interface IMenuItem {
  id: string;
  name: string;
  description: string;
  price: number | string;
  image?: string;
  categoryId: string;
  isAvailable: boolean;
  category: { id: string; name: string };
  variations: IVariation[];
  addons: IAddon[];
}

export interface IMenuItemForm {
  name: string;
  description: string;
  price: string;
  image: string;
  categoryId: string;
  isAvailable: boolean;
  variations: IVariation[];
  addons: IAddon[];
}

export interface GroupedItems {
  [categoryId: string]: {
    info: { id: string; name: string };
    items: IMenuItem[];
  };
}
