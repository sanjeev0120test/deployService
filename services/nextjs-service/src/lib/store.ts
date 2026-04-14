export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  createdAt: string;
}

const globalForStore = globalThis as unknown as {
  _products?: Product[];
  _nextId?: number;
};

if (!globalForStore._products) {
  globalForStore._products = [
    {
      id: "1",
      name: "Laptop Pro",
      price: 1299.99,
      category: "electronics",
      createdAt: "2025-01-01T00:00:00Z",
    },
    {
      id: "2",
      name: "Wireless Mouse",
      price: 29.99,
      category: "electronics",
      createdAt: "2025-01-02T00:00:00Z",
    },
  ];
  globalForStore._nextId = 3;
}

export function getProducts(): Product[] {
  return globalForStore._products!;
}

export function getProductById(id: string): Product | undefined {
  return globalForStore._products!.find((p) => p.id === id);
}

export function addProduct(
  data: Omit<Product, "id" | "createdAt">
): Product {
  const product: Product = {
    ...data,
    id: String(globalForStore._nextId!++),
    createdAt: new Date().toISOString(),
  };
  globalForStore._products!.push(product);
  return product;
}
