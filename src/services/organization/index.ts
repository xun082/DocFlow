import request, { ErrorHandler } from '../request';
import type {
  Organization,
  OrganizationListData,
  OrganizationMember,
  OrganizationSpace,
  JoinRequest,
  Invitation,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  InviteMemberRequest,
  JoinOrganizationRequest,
  ProcessJoinRequestRequest,
  UpdateMemberRoleRequest,
  GetOrganizationsQuery,
  GetRolesResponse,
} from './types';

/**
 * 组织管理服务类
 */
export class OrganizationService {
  private baseUrl = '/api/v1/organizations';

  /**
   * 获取组织角色列表
   */
  async getRoles(errorHandler?: ErrorHandler) {
    const result = await request.get<GetRolesResponse>(`${this.baseUrl}/roles`, {
      errorHandler:
        errorHandler ||
        ((error) => {
          console.error('获取组织角色列表时出错:', error);
        }),
    });

    return result.data?.data || { roles: [] };
  }

  /**
   * 创建新组织
   * @param data 组织信息（所有字段必传）
   * @param errorHandler 错误处理函数
   */
  async createOrganization(data: CreateOrganizationRequest, errorHandler?: ErrorHandler) {
    const result = await request.post<Organization>(`${this.baseUrl}`, {
      params: data,
      errorHandler:
        errorHandler ||
        ((error) => {
          console.error('创建组织时出错:', error);
        }),
    });

    if (result.error) {
      throw new Error(result.error);
    }

    return result.data?.data;
  }

  /**
   * 获取我的组织列表
   * @param params 查询参数（分页）
   * @param errorHandler 错误处理函数
   */
  async getMyOrganizations(params?: GetOrganizationsQuery, errorHandler?: ErrorHandler) {
    const result = await request.get<OrganizationListData>(`${this.baseUrl}`, {
      params,
      errorHandler:
        errorHandler ||
        ((error) => {
          console.error('获取组织列表时出错:', error);
        }),
    });

    if (result.error) {
      throw new Error(result.error);
    }

    return result.data?.data;
  }

  /**
   * 获取组织详情
   * @param id 组织ID
   * @param errorHandler 错误处理函数
   */
  async getOrganizationById(id: string | number, errorHandler?: ErrorHandler) {
    const result = await request.get<Organization>(`${this.baseUrl}/${id}`, {
      errorHandler:
        errorHandler ||
        ((error) => {
          console.error('获取组织详情时出错:', error);
        }),
    });

    if (result.error) {
      throw new Error(result.error);
    }

    return result.data?.data;
  }

  /**
   * 更新组织信息
   * @param id 组织ID
   * @param data 更新的组织信息
   * @param errorHandler 错误处理函数
   */
  async updateOrganization(
    id: string | number,
    data: UpdateOrganizationRequest,
    errorHandler?: ErrorHandler,
  ) {
    const result = await request.put<Organization>(`${this.baseUrl}/${id}`, {
      params: data,
      errorHandler:
        errorHandler ||
        ((error) => {
          console.error('更新组织信息时出错:', error);
        }),
    });

    if (result.error) {
      throw new Error(result.error);
    }

    return result.data?.data;
  }

  /**
   * 删除组织
   * @param id 组织ID
   * @param errorHandler 错误处理函数
   */
  async deleteOrganization(id: string | number, errorHandler?: ErrorHandler) {
    const result = await request.delete<void>(`${this.baseUrl}/${id}`, {
      errorHandler:
        errorHandler ||
        ((error) => {
          console.error('删除组织时出错:', error);
        }),
    });

    if (result.error) {
      throw new Error(result.error);
    }

    return result.data;
  }

  /**
   * 获取组织成员列表
   * @param id 组织ID
   * @param errorHandler 错误处理函数
   */
  async getOrganizationMembers(id: number, errorHandler?: ErrorHandler) {
    const result = await request.get<any>(`${this.baseUrl}/${id}/members`, {
      errorHandler:
        errorHandler ||
        ((error) => {
          console.error('获取组织成员列表时出错:', error);
        }),
    });

    if (result.error) {
      throw new Error(result.error);
    }

    return result.data?.data;
  }

  /**
   * 邀请成员加入组织
   * @param id 组织ID
   * @param data 邀请信息
   * @param errorHandler 错误处理函数
   */
  async inviteMember(id: number, data: InviteMemberRequest, errorHandler?: ErrorHandler) {
    const result = await request.post<Invitation>(`${this.baseUrl}/${id}/invites`, {
      params: data,
      errorHandler:
        errorHandler ||
        ((error) => {
          console.error('邀请成员时出错:', error);
        }),
    });

    if (result.error) {
      throw new Error(result.error);
    }

    return result.data?.data;
  }

  /**
   * 申请加入组织
   * @param id 组织ID
   * @param data 申请信息
   * @param errorHandler 错误处理函数
   */
  async requestJoinOrganization(
    id: string,
    data: JoinOrganizationRequest,
    errorHandler?: ErrorHandler,
  ) {
    const result = await request.post<JoinRequest>(`${this.baseUrl}/${id}/join`, {
      params: data,
      errorHandler:
        errorHandler ||
        ((error) => {
          console.error('申请加入组织时出错:', error);
        }),
    });

    if (result.error) {
      throw new Error(result.error);
    }

    return result.data?.data;
  }

  /**
   * 处理加入申请
   * @param id 组织ID
   * @param requestId 申请ID
   * @param data 处理结果
   * @param errorHandler 错误处理函数
   */
  async processJoinRequest(
    id: string,
    requestId: string,
    data: ProcessJoinRequestRequest,
    errorHandler?: ErrorHandler,
  ) {
    const result = await request.patch<JoinRequest>(`${this.baseUrl}/${id}/requests/${requestId}`, {
      params: data,
      errorHandler:
        errorHandler ||
        ((error) => {
          console.error('处理加入申请时出错:', error);
        }),
    });

    if (result.error) {
      throw new Error(result.error);
    }

    return result.data?.data;
  }

  /**
   * 更新成员角色
   * @param id 组织ID
   * @param memberId 成员ID
   * @param data 角色信息
   * @param errorHandler 错误处理函数
   */
  async updateMemberRole(
    id: string,
    memberId: string,
    data: UpdateMemberRoleRequest,
    errorHandler?: ErrorHandler,
  ) {
    const result = await request.patch<OrganizationMember>(
      `${this.baseUrl}/${id}/members/${memberId}`,
      {
        params: data,
        errorHandler:
          errorHandler ||
          ((error) => {
            console.error('更新成员角色时出错:', error);
          }),
      },
    );

    if (result.error) {
      throw new Error(result.error);
    }

    return result.data?.data;
  }

  /**
   * 移除成员
   * @param id 组织ID
   * @param memberId 成员ID
   * @param errorHandler 错误处理函数
   */
  async removeMember(id: string, memberId: string, errorHandler?: ErrorHandler) {
    const result = await request.delete<void>(`${this.baseUrl}/${id}/members/${memberId}`, {
      errorHandler:
        errorHandler ||
        ((error) => {
          console.error('移除成员时出错:', error);
        }),
    });

    if (result.error) {
      throw new Error(result.error);
    }

    return result.data;
  }

  /**
   * 获取组织的空间列表
   * @param id 组织ID
   * @param errorHandler 错误处理函数
   */
  async getOrganizationSpaces(id: string, errorHandler?: ErrorHandler) {
    const result = await request.get<OrganizationSpace[]>(`${this.baseUrl}/${id}/spaces`, {
      errorHandler:
        errorHandler ||
        ((error) => {
          console.error('获取组织空间列表时出错:', error);
        }),
    });

    if (result.error) {
      throw new Error(result.error);
    }

    return result.data?.data || [];
  }

  /**
   * 退出组织
   * @param id 组织ID
   * @param errorHandler 错误处理函数
   */
  async leaveOrganization(id: string | number, errorHandler?: ErrorHandler) {
    const result = await request.post<void>(`${this.baseUrl}/${id}/leave`, {
      errorHandler:
        errorHandler ||
        ((error) => {
          console.error('退出组织时出错:', error);
        }),
    });

    if (result.error) {
      throw new Error(result.error);
    }

    return result.data;
  }
}

// 创建单例实例
export const organizationService = new OrganizationService();

// 导出默认实例
export default organizationService;

// 导出所有类型
export * from './types';
