import DataLoader from 'dataloader';
import { In } from 'typeorm';
import { AppDataSource } from '../data-source';

export function createRelationLoader(entity: string, relation: string) {
  type Key = number | string;
  return new DataLoader<Key, any>(async (ids: readonly Key[]) => {
    const repo = AppDataSource.getRepository(entity);
    const rows = await repo.find({
      where: { id: In(ids as any) },
      relations: [relation],
    });
    const map = new Map<Key, any>();
    rows.forEach((r: any) => map.set(r.id, r[relation]));
    return ids.map((id) => map.get(id) || null);
  });
}
