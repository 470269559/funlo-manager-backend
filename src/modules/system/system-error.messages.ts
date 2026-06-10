export const SYSTEM_ERROR_MESSAGES = {
  users: {
    USERNAME_REQUIRED: '用户名不能为空',
    PASSWORD_REQUIRED: '密码不能为空',
    NOT_FOUND: '用户不存在',
    USERNAME_EXISTS: '用户名已存在',
  },
  roles: {
    ROLE_NAME_REQUIRED: '角色名称不能为空',
    ROLE_CODE_REQUIRED: '角色编码不能为空',
    NOT_FOUND: '角色不存在',
    ROLE_CODE_EXISTS: '角色编码已存在',
    INVALID_MENU_ID: '存在无效菜单 ID',
    DELETE_WITH_USERS: '该角色已绑定用户，不能删除',
  },
  menus: {
    MENU_NAME_REQUIRED: '菜单名称不能为空',
    NOT_FOUND: '菜单不存在',
    PARENT_CANNOT_BE_SELF: '父级菜单不能是自己',
  },
  dictionaries: {
    DICT_NAME_REQUIRED: '字典名称不能为空',
    DICT_CODE_REQUIRED: '字典编码不能为空',
    DICT_CODE_EXISTS: '字典编码已存在',
    TYPE_NOT_FOUND: '字典类型不存在',
    ITEM_LABEL_REQUIRED: '字典项名称不能为空',
    ITEM_VALUE_REQUIRED: '字典项值不能为空',
    ITEM_VALUE_EXISTS: '同一字典类型下字典值不能重复',
    ITEM_NOT_FOUND: '字典项不存在',
  },
} as const;
