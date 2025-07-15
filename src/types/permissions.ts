export const RESOURCES = [
    "bookmark",
    "bookmark_tag",
    "bot",
    "callback_query",
    "categories",
    "device",
    "file",
    "message",
    "permissions",
    "products",
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
    | "message.list"
    | "message.create"
    | "message.detail"
    | "message.update"
    | "message.delete"
    | "bot.list"
    | "bot.create"
    | "bot.detail"
    | "bot.update"
    | "bot.delete"
    | "user.list"
    | "user.create"
    | "user.detail"
    | "user.update"
    | "user.delete"
    | "bookmark.list"
    | "bookmark.create"
    | "bookmark.detail"
    | "bookmark.update"
    | "bookmark.delete"
    | "callback_query.list"
    | "callback_query.create"
    | "callback_query.detail"
    | "callback_query.update"
    | "callback_query.delete"
    | "categories.list"
    | "categories.create"
    | "categories.detail"
    | "categories.update"
    | "categories.delete"
    | "products.list"
    | "products.create"
    | "products.detail"
    | "products.update"
    | "products.delete";

