export const dynamic = "force-dynamic";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

async function getProducts(): Promise<Product[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3002";
  const res = await fetch(`${baseUrl}/api/products`, { cache: "no-store" });
  const json = await res.json();
  return json.data;
}

export default async function HomePage() {
  let products: Product[] = [];
  let error = "";

  try {
    products = await getProducts();
  } catch {
    error = "Failed to load products";
  }

  return (
    <main>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Product Service Dashboard</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #ddd", textAlign: "left" }}>
            <th style={{ padding: "0.75rem" }}>ID</th>
            <th style={{ padding: "0.75rem" }}>Name</th>
            <th style={{ padding: "0.75rem" }}>Price</th>
            <th style={{ padding: "0.75rem" }}>Category</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "0.75rem" }}>{p.id}</td>
              <td style={{ padding: "0.75rem" }}>{p.name}</td>
              <td style={{ padding: "0.75rem" }}>${p.price.toFixed(2)}</td>
              <td style={{ padding: "0.75rem" }}>{p.category}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ marginTop: "1rem", color: "#666", fontSize: "0.875rem" }}>
        Endpoints: /api/health | /api/ready | /api/metrics | /api/products
      </p>
    </main>
  );
}
