type PrismaMethod = (...args: unknown[]) => Promise<unknown>;

const methodHandlers: Record<string, PrismaMethod> = {
  findMany: async () => [],
  findFirst: async () => null,
  findUnique: async () => null,
  create: async () => null,
  update: async () => null,
  updateMany: async () => ({ count: 0 }),
  upsert: async () => null,
  delete: async () => null,
  count: async () => 0,
};

function createModelProxy() {
  return new Proxy(
    {},
    {
      get: (_target, prop) => {
        if (typeof prop === 'string' && methodHandlers[prop]) {
          return methodHandlers[prop];
        }
        return async () => null;
      },
    }
  );
}

export const prisma = new Proxy(
  {},
  {
    get: () => createModelProxy(),
  }
);
