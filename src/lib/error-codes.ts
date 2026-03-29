// 全局错误码和错误信息配置
// 统一管理系统中所有的错误码和错误信息

export const ErrorCodes = {
  // 通用错误 (1xx)
  UNKNOWN_ERROR: { code: 100, message: "未知错误" },
  INTERNAL_ERROR: { code: 101, message: "服务器内部错误" },
  INVALID_PARAMS: { code: 102, message: "缺少必要参数" },

  // 认证相关错误 (2xx)
  UNAUTHORIZED: { code: 200, message: "请先登录" },
  FORBIDDEN: { code: 201, message: "没有权限访问" },
  LOGIN_FAILED: { code: 202, message: "登录失败" },
  REGISTER_FAILED: { code: 203, message: "注册失败" },

  // 用户相关错误 (3xx)
  USER_NOT_FOUND: { code: 300, message: "用户不存在" },
  USER_UPDATE_FAILED: { code: 301, message: "更新用户信息失败" },
  USER_PROFILE_GET_FAILED: { code: 302, message: "获取用户信息失败" },

  // 手机号相关错误 (4xx)
  PHONE_ALREADY_REGISTERED: { code: 400, message: "该手机号已注册" },
  PHONE_NOT_REGISTERED: { code: 401, message: "该手机号未注册" },
  INVALID_VERIFICATION_CODE: { code: 402, message: "验证码无效或已过期" },
  SEND_CODE_FAILED: { code: 403, message: "发送验证码失败" },

  // 商家相关错误 (5xx)
  MERCHANT_LOGIN_FAILED: { code: 500, message: "邀请码或联系电话错误，或商家未通过审核" },
  MERCHANT_ROOM_ADD_FAILED: { code: 501, message: "添加房间失败" },
  MERCHANT_ROOM_GET_FAILED: { code: 502, message: "获取房间列表失败" },
  MERCHANT_ORDER_GET_FAILED: { code: 503, message: "获取订单列表失败" },

  // 房间相关错误 (6xx)
  ROOM_GET_FAILED: { code: 600, message: "获取麻将馆列表失败" },

  // 订单相关错误 (7xx)
  ORDER_CREATE_FAILED: { code: 700, message: "创建订单失败" },
  ORDER_GET_FAILED: { code: 701, message: "获取订单列表失败" },
  ORDER_NOT_FOUND: { code: 702, message: "订单不存在" },
  NOT_ORDER_PARTICIPANT: { code: 703, message: "您不是该订单的参与者" },

  // 支付相关错误 (8xx)
  PAYMENT_FAILED: { code: 800, message: "支付失败" },

  // 评价相关错误 (9xx)
  REVIEW_FAILED: { code: 900, message: "评价失败" },
  ALREADY_REVIEWED: { code: 901, message: "您已评价过该用户" },

  // 匹配相关错误 (10xx)
  MATCH_CREATE_FAILED: { code: 1000, message: "创建匹配失败" },
  MATCH_GET_FAILED: { code: 1001, message: "获取匹配列表失败" },
  MATCH_NOT_FOUND: { code: 1002, message: "匹配不存在" },
  MATCH_GET_DETAIL_FAILED: { code: 1003, message: "获取匹配详情失败" },
  MATCH_ALREADY_ENDED: { code: 1004, message: "该匹配已结束" },
  MATCH_FULL: { code: 1005, message: "该匹配已满员" },
  MATCH_ALREADY_JOINED: { code: 1006, message: "您已参与该匹配" },
  MATCH_JOIN_FAILED: { code: 1007, message: "加入匹配失败" },

  // 聊天相关错误 (11xx)
  CHAT_MESSAGE_EMPTY: { code: 1100, message: "消息内容不能为空" },
  NOT_MATCH_PARTICIPANT: { code: 1101, message: "您不是该匹配的参与者" },
  CHAT_SEND_FAILED: { code: 1102, message: "发送消息失败" },

  // 核销相关错误 (12xx)
  CHECKIN_CODE_EMPTY: { code: 1200, message: "请输入核销码" },
  CHECKIN_CODE_INVALID: { code: 1201, message: "核销码无效或已使用" },
  CHECKIN_FAILED: { code: 1202, message: "核销失败" },
} as const

// 错误码类型
export type ErrorCodeKey = keyof typeof ErrorCodes

// 获取错误信息
export function getErrorMessage(key: ErrorCodeKey): string {
  return ErrorCodes[key].message
}

// 获取错误码
export function getErrorCode(key: ErrorCodeKey): number {
  return ErrorCodes[key].code
}

// 创建错误响应对象
export function createErrorResponse(key: ErrorCodeKey) {
  return {
    error: ErrorCodes[key].message,
    code: ErrorCodes[key].code,
  }
}
