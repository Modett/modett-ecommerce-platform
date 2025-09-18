// Authentication validation schemas for Fastify
export const authSchemas = {
  register: {
    body: {
      type: 'object',
      required: ['email', 'password', 'confirmPassword', 'acceptTerms'],
      properties: {
        email: {
          type: 'string',
          format: 'email',
          minLength: 5,
          maxLength: 255
        },
        password: {
          type: 'string',
          minLength: 8,
          maxLength: 128
        },
        confirmPassword: {
          type: 'string',
          minLength: 8,
          maxLength: 128
        },
        phone: {
          type: 'string',
          pattern: '^[\\+]?[1-9][\\d]{0,15}$'
        },
        firstName: {
          type: 'string',
          minLength: 1,
          maxLength: 50
        },
        lastName: {
          type: 'string',
          minLength: 1,
          maxLength: 50
        },
        acceptTerms: {
          type: 'boolean',
          const: true
        },
        deviceInfo: {
          type: 'object',
          properties: {
            userAgent: { type: 'string' },
            ip: { type: 'string' },
            fingerprint: { type: 'string' }
          }
        }
      },
      additionalProperties: false
    }
  },

  login: {
    body: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: {
          type: 'string',
          format: 'email',
          minLength: 5,
          maxLength: 255
        },
        password: {
          type: 'string',
          minLength: 1,
          maxLength: 128
        },
        rememberMe: {
          type: 'boolean'
        },
        deviceInfo: {
          type: 'object',
          properties: {
            userAgent: { type: 'string' },
            ip: { type: 'string' },
            fingerprint: { type: 'string' }
          }
        }
      },
      additionalProperties: false
    }
  },

  refreshToken: {
    body: {
      type: 'object',
      required: ['refreshToken'],
      properties: {
        refreshToken: {
          type: 'string',
          minLength: 10
        }
      },
      additionalProperties: false
    }
  },

  forgotPassword: {
    body: {
      type: 'object',
      required: ['email'],
      properties: {
        email: {
          type: 'string',
          format: 'email',
          minLength: 5,
          maxLength: 255
        }
      },
      additionalProperties: false
    }
  },

  resetPassword: {
    body: {
      type: 'object',
      required: ['token', 'newPassword', 'confirmPassword'],
      properties: {
        token: {
          type: 'string',
          minLength: 10
        },
        newPassword: {
          type: 'string',
          minLength: 8,
          maxLength: 128
        },
        confirmPassword: {
          type: 'string',
          minLength: 8,
          maxLength: 128
        }
      },
      additionalProperties: false
    }
  },

  verifyEmail: {
    body: {
      type: 'object',
      required: ['token'],
      properties: {
        token: {
          type: 'string',
          minLength: 10
        }
      },
      additionalProperties: false
    }
  },

  resendVerification: {
    body: {
      type: 'object',
      required: ['email'],
      properties: {
        email: {
          type: 'string',
          format: 'email',
          minLength: 5,
          maxLength: 255
        }
      },
      additionalProperties: false
    }
  },

  changePassword: {
    body: {
      type: 'object',
      required: ['currentPassword', 'newPassword', 'confirmPassword'],
      properties: {
        currentPassword: {
          type: 'string',
          minLength: 1,
          maxLength: 128
        },
        newPassword: {
          type: 'string',
          minLength: 8,
          maxLength: 128
        },
        confirmPassword: {
          type: 'string',
          minLength: 8,
          maxLength: 128
        }
      },
      additionalProperties: false
    }
  }
};

// Response schemas
export const authResponseSchemas = {
  authSuccess: {
    type: 'object',
    properties: {
      success: { type: 'boolean', const: true },
      data: {
        type: 'object',
        properties: {
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              email: { type: 'string', format: 'email' },
              isGuest: { type: 'boolean' },
              emailVerified: { type: 'boolean' },
              phoneVerified: { type: 'boolean' },
              status: { type: 'string', enum: ['active', 'inactive', 'blocked'] }
            },
            required: ['id', 'email', 'isGuest', 'emailVerified', 'phoneVerified', 'status']
          },
          expiresIn: { type: 'number' },
          tokenType: { type: 'string', const: 'Bearer' }
        },
        required: ['accessToken', 'user', 'expiresIn', 'tokenType']
      }
    },
    required: ['success', 'data']
  },

  authError: {
    type: 'object',
    properties: {
      success: { type: 'boolean', const: false },
      error: { type: 'string' },
      errors: {
        type: 'array',
        items: { type: 'string' }
      }
    },
    required: ['success', 'error']
  },

  actionSuccess: {
    type: 'object',
    properties: {
      success: { type: 'boolean', const: true },
      data: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          action: { type: 'string' },
          requiresAction: { type: 'boolean' },
          nextStep: { type: 'string' }
        },
        required: ['message', 'action']
      }
    },
    required: ['success', 'data']
  }
};