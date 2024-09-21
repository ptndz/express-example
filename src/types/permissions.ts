export const RESOURCES = [
    "bookmark",
    "bookmark_tag",
    "device",
    "file",
    "permissions",
    "role",
    "tag",
    "user"
] as const;
export type Resource = typeof RESOURCES[number];

export const ACTIONS = [
    "create",
    "delete",
    "detail",
    "list",
    "update"
] as const;
export type Action = typeof ACTIONS[number];

export type Permission = 
    | "device.list"
    | "device.create"
    | "device.detail"
    | "device.update"
    | "device.delete"
    | "file.list"
    | "file.create"
    | "file.detail"
    | "file.update"
    | "file.delete"
    | "permissions.list"
    | "permissions.create"
    | "permissions.detail"
    | "permissions.update"
    | "permissions.delete"
    | "role.list"
    | "role.create"
    | "role.detail"
    | "role.update"
    | "role.delete"
    | "user.list"
    | "user.create"
    | "user.detail"
    | "user.update"
    | "user.delete"
    | "tag.list"
    | "tag.create"
    | "tag.detail"
    | "tag.update"
    | "tag.delete"
    | "bookmark_tag.list"
    | "bookmark_tag.create"
    | "bookmark_tag.detail"
    | "bookmark_tag.update"
    | "bookmark_tag.delete"
    | "bookmark.list"
    | "bookmark.create"
    | "bookmark.detail"
    | "bookmark.update"
    | "bookmark.delete";

