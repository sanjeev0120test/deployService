import { FastifyInstance, FastifyPluginCallback } from "fastify";

interface Item {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

const items: Item[] = [
  {
    id: "1",
    name: "Widget A",
    description: "A basic widget",
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Widget B",
    description: "An advanced widget",
    createdAt: "2025-01-02T00:00:00Z",
  },
];

let nextId = 3;

interface CreateItemBody {
  name: string;
  description?: string;
}

const itemRoutes: FastifyPluginCallback = (
  fastify: FastifyInstance,
  _opts,
  done
) => {
  fastify.get("/api/items", async () => {
    return { data: items, total: items.length };
  });

  fastify.get<{ Params: { id: string } }>(
    "/api/items/:id",
    async (request, reply) => {
      const { id } = request.params;
      const item = items.find((i) => i.id === id);
      if (!item) {
        reply.status(404);
        return { error: "Item not found", id };
      }
      return { data: item };
    }
  );

  fastify.post<{ Body: CreateItemBody }>("/api/items", async (request, reply) => {
    const { name, description } = request.body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      reply.status(400);
      return { error: "name is required and must be a non-empty string" };
    }

    const newItem: Item = {
      id: String(nextId++),
      name: name.trim(),
      description: description?.trim() || "",
      createdAt: new Date().toISOString(),
    };

    items.push(newItem);
    reply.status(201);
    return { data: newItem };
  });

  done();
};

export default itemRoutes;
