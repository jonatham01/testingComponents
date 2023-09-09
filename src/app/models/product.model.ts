interface Category {
    id: number;
    name: string;
}

export interface Product {
    id: string;
    title:string;
    price: number;
    images: string[];
    description: string;
    category: Category;
    taxes?: number;
}

export interface createProductDTO extends Omit<Product, 'id'>{
    categoryId: number;
}

export interface UpdateProductDTO extends Partial<createProductDTO>{}
  