// src/services/tagService.ts

import addLog from "../config/addLog";
import { Tag } from "../entity/Tag";
import { Pagination } from "../types";

export type ICreateTagPayload = {
  name: string;
};

export type IUpdateTagPayload = Partial<{
  name: string;
}>;

export const createTag = async (
  tagPayload: ICreateTagPayload
): Promise<Tag | null> => {
  try {
    const tag = Tag.create();
    tag.name = tagPayload.name;
    return await tag.save();
  } catch (error: any) {
    addLog(error, "error");
    return null;
  }
};

export const getTagById = async (id: number): Promise<Tag | null> => {
  try {
    const tag = await Tag.findOne({ where: { id } });
    return tag;
  } catch (error: any) {
    addLog(error, "error");
    return null;
  }
};

export const getAllTags = async (
  page = 1,
  limit = 2
): Promise<Pagination<Tag> | null> => {
  try {
    const [tags, total] = await Tag.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { name: "ASC" },
    });
    const totalPages = Math.ceil(total / limit);
    return {
      total: total,
      per_page: limit,
      current_page: page,
      last_page: totalPages,
      items: tags,
    };
  } catch (error: any) {
    addLog(error, "error");
    return null;
  }
};

export const updateTag = async (
  id: number,
  tagPayload: IUpdateTagPayload
): Promise<Tag | null> => {
  try {
    const tag = await Tag.findOne({ where: { id } });
    if (!tag) {
      return null;
    }
    await Tag.update(id, tagPayload);
    return await Tag.findOne({
      where: {
        id,
      },
    });
  } catch (error: any) {
    addLog(error, "error");
    return null;
  }
};

export const deleteTag = async (id: number): Promise<boolean> => {
  try {
    const result = await Tag.delete(id);
    return result.affected !== undefined;
  } catch (error: any) {
    addLog(error, "error");
    return false;
  }
};
