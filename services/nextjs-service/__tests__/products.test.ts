import { describe, it, expect } from "@jest/globals";
import { getProducts, getProductById, addProduct } from "../src/lib/store";

describe("Product store", () => {
  it("returns seeded products", () => {
    const products = getProducts();
    expect(products.length).toBeGreaterThanOrEqual(2);
  });

  it("finds product by id", () => {
    const product = getProductById("1");
    expect(product).toBeDefined();
    expect(product!.name).toBe("Laptop Pro");
  });

  it("returns undefined for unknown id", () => {
    const product = getProductById("999");
    expect(product).toBeUndefined();
  });

  it("adds a new product", () => {
    const before = getProducts().length;
    const product = addProduct({
      name: "Test Product",
      price: 9.99,
      category: "test",
    });
    expect(product.id).toBeDefined();
    expect(product.name).toBe("Test Product");
    expect(getProducts().length).toBe(before + 1);
  });
});
